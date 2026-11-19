// Anonymous visitor statistics for the dashboard. No IP address or cookie is stored: a visitor is a
// SHA-256 hash of (secret, day, IP, browser), so the same person counts once per day and cannot be
// followed from one day to the next.
import { createHash } from 'node:crypto';
import { db } from '../config/db.ts';
import { env } from '../config/env.ts';
import { pageViews } from '../models/schema.ts';
import { logger } from '../utils/logger.ts';

const BOT = /bot|crawl|spider|slurp|preview|monitor|headless|lighthouse|pingdom|curl|wget|python|httpclient|java\/|go-http/i;

export function recordPageView(input: { path: string; referrer?: string }, meta: { ip?: string; userAgent?: string }) {
  const ua = meta.userAgent ?? '';
  if (!ua || BOT.test(ua)) return;
  if (input.path.startsWith('/admin') || input.path.startsWith('/api')) return;
  const day = new Date().toISOString().slice(0, 10);
  const visitorHash = createHash('sha256').update(`${env.VISITOR_HASH_SECRET}|${day}|${meta.ip ?? ''}|${ua}`).digest('hex');
  let referrer: string | null = null;
  try {
    // Only the referring site is kept (not the full URL), and only for other sites.
    if (input.referrer) {
      const host = new URL(input.referrer).host;
      if (host && host !== new URL(env.siteUrl).host) referrer = host.slice(0, 300);
    }
  } catch { /* not a URL */ }
  db().insert(pageViews).values({ day, path: input.path.slice(0, 300), visitorHash, referrer })
    .catch((err) => logger.warn({ err }, 'page view write failed'));
}
