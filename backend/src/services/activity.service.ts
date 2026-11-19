import { activityLog } from '../models/schema.ts';
import { db } from '../config/db.ts';
import { logger } from '../utils/logger.ts';

export interface ActivityExtra { details?: unknown; ip?: string }

/**
 * Records an entry in the audit log: who did what, to which record, and what changed.
 * Never blocks or fails the request. The log is append-only: nothing in the API edits or deletes it.
 */
export function logActivity(userId: number | null | undefined, action: string, entity: string, entityId?: string | number, summary?: string, extra: ActivityExtra = {}) {
  db()
    .insert(activityLog)
    .values({
      userId: userId ?? null, action, entity, entityId: entityId === undefined ? null : String(entityId), summary: summary?.slice(0, 300),
      details: extra.details ?? null, ip: extra.ip?.slice(0, 64) ?? null,
    })
    .catch((err) => logger.warn({ err }, 'activity log write failed'));
}

const IGNORED = new Set(['id', 'createdAt', 'updatedAt', 'passwordHash']);
const show = (v: unknown): unknown => {
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'string') return v.length > 200 ? v.slice(0, 200) + '…' : v;
  if (Array.isArray(v)) return v.length > 10 ? `${v.length} items` : v.map(show);
  if (v && typeof v === 'object') return '(details)';
  return v ?? null;
};
const same = (a: unknown, b: unknown) => JSON.stringify(show(a)) === JSON.stringify(show(b));

/** The fields that differ between a stored record and the submitted values: { field: { from, to } }. */
export function changes(before: Record<string, unknown> | null | undefined, after: Record<string, unknown>) {
  const out: Record<string, { from: unknown; to: unknown }> = {};
  for (const [k, to] of Object.entries(after)) {
    if (IGNORED.has(k)) continue;
    const from = before?.[k];
    if (Array.isArray(to) && to.length && typeof to[0] === 'object') {
      // Nested collections (e.g. FAQs, images): record only that they changed.
      if (JSON.stringify(from ?? []) !== JSON.stringify(to)) out[k] = { from: `${(from as unknown[] | undefined)?.length ?? 0} items`, to: `${to.length} items` };
      continue;
    }
    if (!same(from, to)) out[k] = { from: show(from), to: show(to) };
  }
  return out;
}
