import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.ts';

const base = { standardHeaders: 'draft-8' as const, legacyHeaders: false, skip: () => env.isTest };
const message = (text: string) => ({ error: { message: text } });

/** Whole API: generous ceiling against scraping and floods. */
export const apiLimiter = rateLimit({ ...base, windowMs: 60_000, limit: 300, message: message('Too many requests. Please slow down.') });
/** Sign-in attempts per IP (accounts are also locked after repeated failures). */
export const loginLimiter = rateLimit({ ...base, windowMs: 15 * 60_000, limit: 10, message: message('Too many sign-in attempts. Please wait 15 minutes and try again.') });
/** Forgot-password requests and reset attempts per IP. */
export const resetLimiter = rateLimit({ ...base, windowMs: 15 * 60_000, limit: 10, message: message('Too many password reset attempts. Please wait 15 minutes and try again.') });
/** Visitor tracking beacons per IP (one per page view). */
export const trackLimiter = rateLimit({ ...base, windowMs: 60_000, limit: 60, message: message('Too many requests.') });
/** Public form submissions per IP. */
export const formLimiter = rateLimit({ ...base, windowMs: 10 * 60_000, limit: 5, message: message('Too many submissions from your network. Please try again in a few minutes.') });
