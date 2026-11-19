import type { CookieOptions, RequestHandler } from 'express';
import { env } from '../config/env.ts';
import { userForToken, type SessionUser } from '../services/auth.service.ts';
import { forbidden, unauthorized } from '../utils/http-error.ts';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request { user?: SessionUser; sessionToken?: string }
  }
}

export const SESSION_COOKIE = 'spine_session';

export const sessionCookieOptions = (expires?: Date): CookieOptions => ({
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: 'strict',
  path: '/',
  ...(expires ? { expires } : {}),
});

/** Requires a valid, unexpired administrator session (HttpOnly cookie). Used on every admin API. */
export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const token: string | undefined = req.cookies?.[SESSION_COOKIE];
    if (!token) return next(unauthorized());
    const user = await userForToken(token);
    if (!user) return next(unauthorized('Your session has expired. Please sign in again.'));
    req.user = user;
    req.sessionToken = token;
    next();
  } catch (err) {
    next(err);
  }
};

/** Admin Panel modules. The site has one administrator account, which may use all of them. */
export const PERMISSIONS = {
  content: ['admin'],
  jobs: ['admin'],
  applications: ['admin'],
  enquiries: ['admin'],
  projects: ['admin'],
  announcements: ['admin'],
  media: ['admin'],
  redirects: ['admin'],
  settings: ['admin'],
  activity: ['admin'],
} as const;
export type Permission = keyof typeof PERMISSIONS;

export const can = (role: string, permission: Permission) => (PERMISSIONS[permission] as readonly string[]).includes(role);

export const requirePermission = (permission: Permission): RequestHandler => (req, _res, next) => {
  if (!req.user) return next(unauthorized());
  if (!can(req.user.role, permission)) return next(forbidden());
  next();
};
