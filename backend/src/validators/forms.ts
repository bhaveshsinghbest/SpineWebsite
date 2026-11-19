// Public form validation (server side). Mirrors the Angular Reactive Forms rules, which are only a convenience.
import { z } from 'zod';
import { cleanText } from '../utils/text.ts';

const t = (max: number) => z.string().transform(cleanText).pipe(z.string().min(1, 'Required').max(max, `Up to ${max} characters`));
const phone = z.string().trim().regex(/^[+0-9 ()-]{8,20}$/, 'Enter a valid phone number');
const email = z.email('Enter a valid email address').max(120).transform((v) => v.trim().toLowerCase());

/** Honeypot and minimum fill time: bots fill hidden fields and submit within seconds. */
const antiSpam = {
  company_website: z.string().max(200).optional().default(''),
  form_started: z.coerce.number().optional(),
};

export const enquiryInput = z.object({
  name: t(120), organisation: t(160), email, phone, area: t(160),
  message: z.string().transform(cleanText).pipe(z.string().max(3000)).optional().default(''),
  ...antiSpam,
});

export const applicationInput = z.object({
  name: t(100), email, phone, location: t(80), position: t(200), qualification: t(120),
  experience: z.coerce.number().min(0, 'Must be 0 or more').max(50, 'Must be 50 or less'),
  linkedin: z.union([z.literal(''), z.url().max(200).regex(/^https:\/\//, 'Must start with https://')]).optional().default(''),
  message: z.string().transform(cleanText).pipe(z.string().max(1500)).optional().default(''),
  consent: z.union([z.literal('on'), z.literal('true'), z.literal(true)], { error: 'Consent is required' }),
  ...antiSpam,
});

export const isLikelySpam = (v: { company_website?: string; form_started?: number }, minMs: number) =>
  Boolean(v.company_website) || (typeof v.form_started === 'number' && v.form_started > 0 && Date.now() - v.form_started < minMs);
