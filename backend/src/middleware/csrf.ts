import type { RequestHandler } from 'express';
import { forbidden } from '../utils/http-error.ts';

/**
 * CSRF defence for cookie-authenticated requests: state-changing calls must carry a custom header.
 * Browsers cannot add custom headers to cross-site requests without a CORS pre-flight, which the
 * API only grants to its own origins. The session cookie is also SameSite=Strict.
 */
export const requireCsrfHeader: RequestHandler = (req, _res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('x-requested-with') !== 'XMLHttpRequest') return next(forbidden('Missing request header.'));
  next();
};
