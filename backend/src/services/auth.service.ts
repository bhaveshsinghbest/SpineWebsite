import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt, isNull, lt, or, sql } from 'drizzle-orm';
import { db } from '../config/db.ts';
import { env } from '../config/env.ts';
import { adminSessions, adminUsers, passwordResets } from '../models/schema.ts';
import { hashPassword, verifyPassword, passwordProblems } from '../utils/password.ts';
import { badRequest, HttpError, unauthorized } from '../utils/http-error.ts';
import { sendMail } from '../utils/mailer.ts';
import { logger } from '../utils/logger.ts';
import { logActivity } from './activity.service.ts';

export type Role = 'admin' | 'editor' | 'recruiter';
export interface SessionUser { id: number; username: string | null; email: string; name: string; role: Role }
interface Meta { ip?: string; userAgent?: string }

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;
/** lastSeenAt is written at most this often, so ordinary requests do not each cause a database write. */
const TOUCH_EVERY_MS = 60_000;
const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');
// Verified against when the account is unknown, so response time does not reveal which accounts exist.
const DUMMY_HASH = 'scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA$' + 'A'.repeat(86);

/** The administrator account for a username or email (case-insensitive). Only the admin role may sign in. */
async function findAdmin(identifier: string) {
  const id = identifier.trim().toLowerCase();
  const [user] = await db().select().from(adminUsers)
    .where(and(or(sql`lower(${adminUsers.username}) = ${id}`, sql`lower(${adminUsers.email}) = ${id}`), eq(adminUsers.role, 'admin')))
    .limit(1);
  return user;
}

export async function login(identifier: string, password: string, meta: Meta) {
  const user = await findAdmin(identifier);
  const invalid = new HttpError(401, 'Incorrect username or password.');
  const attempted = identifier.trim().slice(0, 80);
  if (!user || !user.active) {
    await verifyPassword(password, DUMMY_HASH).catch(() => false);
    logActivity(null, 'login_failed', 'auth', undefined, `Unknown or inactive account: ${attempted}`, { ip: meta.ip });
    throw invalid;
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    logActivity(user.id, 'login_failed', 'auth', user.id, `Account locked: ${attempted}`, { ip: meta.ip });
    throw new HttpError(423, 'This account is temporarily locked after repeated failed sign-ins. Try again later or reset your password.');
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    const failed = user.failedLogins + 1;
    const lock = failed >= MAX_FAILED;
    await db().update(adminUsers).set({
      failedLogins: lock ? 0 : failed,
      lockedUntil: lock ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
    }).where(eq(adminUsers.id, user.id));
    logActivity(user.id, 'login_failed', 'auth', user.id, lock ? `Wrong password — account locked for ${LOCK_MINUTES} minutes` : `Wrong password (attempt ${failed} of ${MAX_FAILED})`, { ip: meta.ip });
    throw invalid;
  }
  await db().update(adminUsers).set({ failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() }).where(eq(adminUsers.id, user.id));
  // Housekeeping: drop expired sessions and reset tokens.
  await db().delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
  await db().delete(passwordResets).where(lt(passwordResets.expiresAt, new Date(Date.now() - 7 * 86_400_000)));

  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_HOURS * 3_600_000);
  await db().insert(adminSessions).values({
    userId: user.id, tokenHash: sha256(token), expiresAt, ip: meta.ip?.slice(0, 64), userAgent: meta.userAgent?.slice(0, 300),
  });
  return { token, expiresAt, user: toSessionUser(user), idleMinutes: env.SESSION_IDLE_MINUTES };
}

/**
 * The signed-in user for a session token, or null when the session is unknown, past its absolute
 * lifetime (SESSION_TTL_HOURS) or idle for longer than SESSION_IDLE_MINUTES. Each use extends the idle window.
 */
export async function userForToken(token: string): Promise<SessionUser | null> {
  const now = Date.now();
  const [row] = await db()
    .select({ user: adminUsers, sessionId: adminSessions.id, lastSeenAt: adminSessions.lastSeenAt })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.userId, adminUsers.id))
    .where(and(eq(adminSessions.tokenHash, sha256(token)), gt(adminSessions.expiresAt, new Date(now)), eq(adminUsers.active, true), eq(adminUsers.role, 'admin')));
  if (!row) return null;
  const idleMs = now - row.lastSeenAt.getTime();
  if (idleMs > env.SESSION_IDLE_MINUTES * 60_000) {
    await db().delete(adminSessions).where(eq(adminSessions.id, row.sessionId));
    logActivity(row.user.id, 'session_expired', 'auth', row.user.id, `Signed out after ${env.SESSION_IDLE_MINUTES} minutes of inactivity`);
    return null;
  }
  if (idleMs > TOUCH_EVERY_MS) await db().update(adminSessions).set({ lastSeenAt: new Date(now) }).where(eq(adminSessions.id, row.sessionId));
  return toSessionUser(row.user);
}

export async function logout(token: string) {
  const [row] = await db().delete(adminSessions).where(eq(adminSessions.tokenHash, sha256(token))).returning({ userId: adminSessions.userId });
  return row?.userId ?? null;
}

export async function changePassword(userId: number, current: string, next: string, keepToken: string) {
  const [user] = await db().select().from(adminUsers).where(eq(adminUsers.id, userId));
  if (!user || !(await verifyPassword(current, user.passwordHash))) throw badRequest('Your current password is incorrect.', { currentPassword: ['Your current password is incorrect.'] });
  const problem = passwordProblems(next);
  if (problem) throw badRequest(problem, { newPassword: [problem] });
  await db().update(adminUsers).set({ passwordHash: await hashPassword(next) }).where(eq(adminUsers.id, userId));
  // Sign out every other session for this user.
  await db().delete(adminSessions).where(and(eq(adminSessions.userId, userId), sql`${adminSessions.tokenHash} <> ${sha256(keepToken)}`));
}

export async function revokeSessions(userId: number) {
  await db().delete(adminSessions).where(eq(adminSessions.userId, userId));
}

// ---------- Forgot password ----------

/** Creates a single-use reset token for the user (earlier unused tokens stop working). Returns the raw token. */
export async function createResetToken(userId: number, ip?: string) {
  await db().update(passwordResets).set({ usedAt: new Date() }).where(and(eq(passwordResets.userId, userId), isNull(passwordResets.usedAt)));
  const token = randomBytes(32).toString('base64url');
  await db().insert(passwordResets).values({
    userId, tokenHash: sha256(token), expiresAt: new Date(Date.now() + env.PASSWORD_RESET_MINUTES * 60_000), ip: ip?.slice(0, 64),
  });
  return token;
}

/**
 * Emails a reset link when the username or email belongs to the administrator. The response is the same
 * either way, so the form cannot be used to discover accounts.
 */
export async function requestPasswordReset(identifier: string, meta: Meta) {
  const user = await findAdmin(identifier);
  if (!user || !user.active) {
    logActivity(null, 'password_reset_requested', 'auth', undefined, `No matching account: ${identifier.trim().slice(0, 80)}`, { ip: meta.ip });
    return;
  }
  const token = await createResetToken(user.id, meta.ip);
  const link = `${env.siteUrl}/admin/reset-password?token=${token}`;
  sendMail({
    to: user.email,
    subject: 'Reset your Spine Advisory admin password',
    text: [
      `Hello ${user.name},`, '',
      'A password reset was requested for the Spine Advisory website admin panel.',
      `Open this link within ${env.PASSWORD_RESET_MINUTES} minutes to choose a new password (it works once):`, '', link, '',
      'If you did not ask for this, ignore this email — your password stays the same.',
    ].join('\n'),
  });
  // Without SMTP (local development) the link is written to the server log so the flow can still be used.
  if (!env.SMTP_HOST && !env.isProd) logger.warn({ link }, 'Password reset link (SMTP not configured)');
  logActivity(user.id, 'password_reset_requested', 'auth', user.id, 'Reset link emailed', { ip: meta.ip });
}

async function validReset(token: string) {
  const [row] = await db().select().from(passwordResets)
    .where(and(eq(passwordResets.tokenHash, sha256(token)), isNull(passwordResets.usedAt), gt(passwordResets.expiresAt, new Date())));
  return row;
}

export async function checkResetToken(token: string) {
  if (!(await validReset(token))) throw badRequest('This reset link is invalid or has expired. Request a new one.');
}

export async function resetPassword(token: string, password: string, meta: Meta) {
  const row = await validReset(token);
  if (!row) throw badRequest('This reset link is invalid or has expired. Request a new one.');
  const problem = passwordProblems(password);
  if (problem) throw badRequest(problem, { password: [problem] });
  // Mark the token used first, so the same link cannot be replayed concurrently.
  const used = await db().update(passwordResets).set({ usedAt: new Date() })
    .where(and(eq(passwordResets.id, row.id), isNull(passwordResets.usedAt))).returning({ id: passwordResets.id });
  if (!used.length) throw badRequest('This reset link has already been used.');
  await db().update(adminUsers).set({ passwordHash: await hashPassword(password), failedLogins: 0, lockedUntil: null }).where(eq(adminUsers.id, row.userId));
  await revokeSessions(row.userId);
  logActivity(row.userId, 'password_reset', 'auth', row.userId, 'Password changed with a reset link; all sessions signed out', { ip: meta.ip });
}

function toSessionUser(u: typeof adminUsers.$inferSelect): SessionUser {
  return { id: u.id, username: u.username, email: u.email, name: u.name, role: u.role };
}

export { unauthorized };
