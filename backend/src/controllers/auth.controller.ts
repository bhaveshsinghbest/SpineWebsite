import type { Request, Response } from 'express';
import { z } from 'zod';
import { env } from '../config/env.ts';
import { SESSION_COOKIE, sessionCookieOptions, PERMISSIONS, can } from '../middleware/auth.ts';
import * as auth from '../services/auth.service.ts';
import { logActivity } from '../services/activity.service.ts';

// The administrator signs in with a username (or the account email). `email` is accepted as an alias.
const loginInput = z.object({
  username: z.string().trim().max(160).optional(),
  email: z.string().trim().max(160).optional(),
  password: z.string().max(200),
}).transform((v, ctx) => {
  const identifier = v.username || v.email || '';
  if (!identifier) ctx.addIssue({ code: 'custom', path: ['username'], message: 'Enter your username.' });
  if (!v.password) ctx.addIssue({ code: 'custom', path: ['password'], message: 'Enter your password.' });
  return { identifier, password: v.password };
});
const passwordInput = z.object({ currentPassword: z.string().min(1, 'Required').max(200), newPassword: z.string().min(1, 'Required').max(200) });
const forgotInput = z.object({ username: z.string().trim().min(1, 'Enter your username or email.').max(160) });
const resetInput = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{20,100}$/, 'Invalid link'), password: z.string().min(1, 'Required').max(200) });
const tokenQuery = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{20,100}$/, 'Invalid link') });

const permissionsFor = (role: auth.Role) => Object.keys(PERMISSIONS).filter((p) => can(role, p as keyof typeof PERMISSIONS));
const meta = (req: Request) => ({ ip: req.ip, userAgent: req.get('user-agent') });

export async function login(req: Request, res: Response) {
  const { identifier, password } = loginInput.parse(req.body ?? {});
  const { token, expiresAt, user, idleMinutes } = await auth.login(identifier, password, meta(req));
  res.cookie(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
  logActivity(user.id, 'login', 'auth', user.id, 'Signed in', { ip: req.ip });
  res.json({ user, permissions: permissionsFor(user.role), expiresAt, idleMinutes });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    const userId = await auth.logout(token);
    if (userId) logActivity(userId, 'logout', 'auth', userId, 'Signed out', { ip: req.ip });
  }
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions());
  res.status(204).end();
}

export function me(req: Request, res: Response) {
  res.json({ user: req.user, permissions: permissionsFor(req.user!.role), idleMinutes: env.SESSION_IDLE_MINUTES });
}

export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = passwordInput.parse(req.body ?? {});
  await auth.changePassword(req.user!.id, currentPassword, newPassword, req.sessionToken!);
  logActivity(req.user!.id, 'update', 'auth', req.user!.id, 'Password changed', { ip: req.ip });
  res.status(204).end();
}

/** Always answers the same way, whether or not the account exists. */
export async function forgotPassword(req: Request, res: Response) {
  const { username } = forgotInput.parse(req.body ?? {});
  await auth.requestPasswordReset(username, meta(req));
  res.json({ ok: true, message: 'If the account exists, a password reset link has been sent to its email address. The link expires in ' + env.PASSWORD_RESET_MINUTES + ' minutes.' });
}

export async function checkResetToken(req: Request, res: Response) {
  const { token } = tokenQuery.parse(req.query);
  await auth.checkResetToken(token);
  res.json({ ok: true });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = resetInput.parse(req.body ?? {});
  await auth.resetPassword(token, password, meta(req));
  res.json({ ok: true });
}
