// Environment configuration, validated once at startup. The process refuses to start with invalid settings.
import { accessSync, constants, mkdirSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

const bool = z.union([z.boolean(), z.string()]).transform((v) => v === true || v === 'true' || v === '1');
const csv = z.string().default('').transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean));

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    /** Interface to listen on. Empty = all interfaces; 127.0.0.1 = reachable only from the same machine. */
    HOST: z.string().optional().transform((v) => v || undefined),
    DATABASE_URL: z.string().default(''),
    DATABASE_SSL: bool.default(false),
    /** PGlite data directory used when DATABASE_URL is empty (development only). 'memory://' for tests. */
    PGLITE_DIR: z.string().default('./.data/pglite'),
    PUBLIC_SITE_URL: z.url().default('http://localhost:4200'),
    CORS_ORIGINS: csv,
    SESSION_TTL_HOURS: z.coerce.number().positive().max(72).default(8),
    /** A session with no requests for this long expires (automatic sign-out after inactivity). */
    SESSION_IDLE_MINUTES: z.coerce.number().int().min(5).max(24 * 60).default(30),
    /** Lifetime of a Forgot Password link. */
    PASSWORD_RESET_MINUTES: z.coerce.number().int().min(5).max(24 * 60).default(30),
    /** Secret mixed into the anonymous daily visitor hash (dashboard visitor statistics). */
    VISITOR_HASH_SECRET: z.string().default('spine-advisory-visitors'),
    COOKIE_SECURE: bool.default(false),
    TRUST_PROXY: z.coerce.number().int().min(0).default(1),
    SMTP_HOST: z.string().default(''),
    SMTP_PORT: z.coerce.number().int().default(587),
    SMTP_SECURE: bool.default(false),
    SMTP_USER: z.string().default(''),
    SMTP_PASS: z.string().default(''),
    MAIL_FROM: z.string().default('Spine Advisory Website <no-reply@spineadvisory.com>'),
    NOTIFY_ENQUIRIES_TO: z.string().default('info@spineadvisory.com'),
    NOTIFY_APPLICATIONS_TO: z.string().default('info@spineadvisory.com'),
    UPLOAD_DIR: z.string().default('./uploads'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  })
  .superRefine((e, ctx) => {
    if (e.NODE_ENV === 'production' && !e.DATABASE_URL) {
      ctx.addIssue({ code: 'custom', path: ['DATABASE_URL'], message: 'DATABASE_URL is required in production' });
    }
  });

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:\n' + z.prettifyError(parsed.error));
  process.exit(1);
}

const e = parsed.data;

/**
 * In production the upload folder must be writable. On a host without a persistent disk (e.g. Render's
 * Free plan with UPLOAD_DIR=/var/data/uploads) the folder cannot be created, which used to crash the
 * content seed and every upload. Fall back to the app's own ./uploads folder and say so in the log;
 * files there survive only until the next restart.
 */
function resolveUploadDir(dir: string): string {
  const resolved = path.resolve(dir);
  if (e.NODE_ENV !== 'production') return resolved;
  try {
    mkdirSync(resolved, { recursive: true });
    accessSync(resolved, constants.W_OK);
    return resolved;
  } catch (err) {
    const fallback = path.resolve('uploads');
    const reason = (err as NodeJS.ErrnoException).code ?? String(err);
    console.warn(
      `WARNING: UPLOAD_DIR "${dir}" is not writable (${reason}). Using ${fallback} instead; files saved there are lost when the service restarts. Attach a persistent disk at that path, or remove UPLOAD_DIR.`,
    );
    return fallback;
  }
}
const uploadDir = resolveUploadDir(e.UPLOAD_DIR);

export const env = {
  ...e,
  isProd: e.NODE_ENV === 'production',
  isTest: e.NODE_ENV === 'test',
  cookieSecure: e.NODE_ENV === 'production' || e.COOKIE_SECURE,
  siteUrl: e.PUBLIC_SITE_URL.replace(/\/$/, ''),
  uploadDir,
  publicUploadDir: path.join(uploadDir, 'public'),
  privateUploadDir: path.join(uploadDir, 'private'),
};
