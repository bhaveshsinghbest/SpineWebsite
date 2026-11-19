// Generic create/read/update/delete for admin-managed resources.
// A resource is a parent table plus optional child collections (e.g. a practice and its service items and FAQs).
// Children are replaced as a whole inside a transaction on every save, which keeps ordering and integrity simple.
import { and, asc, count, desc, eq, gte, ilike, lt, or, sql, type SQL } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';
import type { ZodType } from 'zod';
import { db, type Db } from '../config/db.ts';
import type { Permission } from '../middleware/auth.ts';
import { badRequest, notFound } from '../utils/http-error.ts';
import { changes, logActivity } from './activity.service.ts';
import { invalidatePublicCache } from './cache.service.ts';

type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
type Row = Record<string, any>;

export interface ChildDef {
  /** Key in the request/response body, e.g. 'items'. */
  key: string;
  table: any;
  /** Foreign-key property on the child table, e.g. 'practiceId'. */
  fk: string;
  orderColumn: PgColumn;
  toRow: (item: any, index: number) => Row;
  fromRow: (row: any) => any;
}

export interface ResourceDef {
  /** URL segment and audit-log module, e.g. 'practices'. */
  name: string;
  permission: Permission;
  table: any;
  input: ZodType;
  searchColumns: PgColumn[];
  /** Query-string filters mapped to columns (exact match). */
  filters?: Record<string, PgColumn>;
  /** Columns a list may be sorted by (?sort=<key>&dir=asc|desc). */
  sortable?: Record<string, PgColumn>;
  /** Column used by the ?from=&to= date-range filter. */
  dateColumn?: PgColumn;
  orderBy: (PgColumn | SQL)[];
  children?: ChildDef[];
  /** Input keys stored outside the parent row (handled by afterSave/afterLoad). */
  extraKeys?: string[];
  label: (row: Row) => string;
  /**
   * The publication field and how its values are logged, e.g. { field: 'status', actions: { published: 'publish', draft: 'unpublish' } }.
   * Enables PATCH /:id/status for quick publish / unpublish / archive / close actions.
   */
  publication?: { field: string; actions: Record<string, string> };
  afterSave?: (tx: Tx, id: number, input: Row) => Promise<void>;
  afterLoad?: (id: number) => Promise<Row>;
  /** Extra columns joined into list rows (e.g. a category name). */
  listSelect?: () => { fields: Record<string, PgColumn | SQL>; join: (q: any) => any };
}

const parentValues = (def: ResourceDef, input: Row) => {
  const skip = new Set([...(def.children ?? []).map((c) => c.key), ...(def.extraKeys ?? [])]);
  return Object.fromEntries(Object.entries(input).filter(([k]) => !skip.has(k)));
};

export const escapeLike = (q: string) => `%${q.replace(/[\\%_]/g, (m) => '\\' + m)}%`;

/** Inclusive date range on a timestamp or date column (YYYY-MM-DD). */
export function dateRange(col: PgColumn, from?: string, to?: string): SQL[] {
  const out: SQL[] = [];
  if (from) out.push(gte(col, sql`${from}::date`));
  if (to) out.push(lt(col, sql`(${to}::date + 1)`));
  return out;
}

/** ORDER BY from ?sort=&dir= when the key is allowed, else the default order. */
export function sortOrder(sortable: Record<string, PgColumn | SQL> | undefined, sort: string | undefined, dir: string | undefined, fallback: (PgColumn | SQL)[]) {
  const col = sort ? sortable?.[sort] : undefined;
  if (!col) return fallback;
  return [dir === 'asc' ? asc(col as PgColumn) : desc(col as PgColumn), ...fallback];
}

export async function list(def: ResourceDef, q: { page: number; pageSize: number; q?: string; sort?: string; dir?: string; from?: string; to?: string; [k: string]: unknown }) {
  const where: SQL[] = [];
  if (q.q && def.searchColumns.length) where.push(or(...def.searchColumns.map((c) => ilike(c, escapeLike(q.q!))))!);
  for (const [key, col] of Object.entries(def.filters ?? {})) {
    const v = q[key];
    if (typeof v === 'string' && v) where.push(eq(col, v));
  }
  if (def.dateColumn) where.push(...dateRange(def.dateColumn, q.from, q.to));
  const cond = where.length ? and(...where) : undefined;
  const [{ total }] = await db().select({ total: count() }).from(def.table).where(cond);
  const extra = def.listSelect?.();
  let query: any = extra ? db().select({ row: def.table, ...extra.fields }).from(def.table) : db().select().from(def.table);
  if (extra) query = extra.join(query);
  const rows = await query
    .where(cond)
    .orderBy(...(sortOrder(def.sortable, q.sort, q.dir, def.orderBy) as any))
    .limit(q.pageSize)
    .offset((q.page - 1) * q.pageSize);
  const data = extra ? rows.map(({ row, ...rest }: Row) => ({ ...row, ...rest })) : rows;
  return { data, meta: { page: q.page, pageSize: q.pageSize, total, pages: Math.max(1, Math.ceil(total / q.pageSize)) } };
}

export async function get(def: ResourceDef, id: number) {
  const [row] = await db().select().from(def.table).where(eq(def.table.id, id));
  if (!row) throw notFound();
  const out: Row = { ...row };
  for (const c of def.children ?? []) {
    const kids = await db().select().from(c.table).where(eq(c.table[c.fk], id)).orderBy(asc(c.orderColumn));
    out[c.key] = kids.map(c.fromRow);
  }
  if (def.afterLoad) Object.assign(out, await def.afterLoad(id));
  return out;
}

async function writeChildren(tx: Tx, def: ResourceDef, id: number, input: Row, replace: boolean) {
  for (const c of def.children ?? []) {
    if (!(c.key in input)) continue;
    if (replace) await tx.delete(c.table).where(eq(c.table[c.fk], id));
    const items: any[] = input[c.key] ?? [];
    if (items.length) await tx.insert(c.table).values(items.map((it, i) => ({ ...c.toRow(it, i), [c.fk]: id })));
  }
  if (def.afterSave) await def.afterSave(tx, id, input);
}

/** The audit action for a save: publishing or unpublishing when the publication field changed. */
function saveAction(def: ResourceDef, before: Row | null, input: Row, fallback: string) {
  const p = def.publication;
  if (!p || !(p.field in input)) return fallback;
  const to = input[p.field];
  if (before && before[p.field] === to) return fallback;
  if (!before && fallback === 'create') return fallback;
  return p.actions[to] ?? fallback;
}

export async function create(def: ResourceDef, input: Row, userId?: number) {
  const id = await db().transaction(async (tx) => {
    const [row] = await tx.insert(def.table).values(parentValues(def, input)).returning({ id: def.table.id });
    await writeChildren(tx, def, row.id, input, false);
    return row.id as number;
  });
  invalidatePublicCache();
  const pub = def.publication ? ` (${input[def.publication.field]})` : '';
  logActivity(userId, 'create', def.name, id, def.label(input) + pub);
  return get(def, id);
}

export async function update(def: ResourceDef, id: number, input: Row, userId?: number) {
  const before = await get(def, id);
  await db().transaction(async (tx) => {
    const res = await tx.update(def.table).set(parentValues(def, input)).where(eq(def.table.id, id)).returning({ id: def.table.id });
    if (!res.length) throw notFound();
    await writeChildren(tx, def, id, input, true);
  });
  invalidatePublicCache();
  const diff = changes(before, input);
  logActivity(userId, saveAction(def, before, input, 'update'), def.name, id, def.label(input), { details: Object.keys(diff).length ? diff : undefined });
  return get(def, id);
}

/** Quick publication change from a list (publish, unpublish, archive, close …). */
export async function setPublication(def: ResourceDef, id: number, value: string, userId?: number) {
  const p = def.publication;
  if (!p || !(value in p.actions)) throw badRequest('That status is not available here.');
  const before = await get(def, id);
  if (before[p.field] === value) return before;
  const res = (await db().update(def.table).set({ [p.field]: value }).where(eq(def.table.id, id)).returning()) as Row[];
  if (!res.length) throw notFound();
  invalidatePublicCache();
  logActivity(userId, p.actions[value], def.name, id, def.label(before), { details: { [p.field]: { from: before[p.field], to: value } } });
  return get(def, id);
}

export async function remove(def: ResourceDef, id: number, userId?: number) {
  const res = (await db().delete(def.table).where(eq(def.table.id, id)).returning()) as Row[];
  if (!res.length) throw notFound();
  invalidatePublicCache();
  logActivity(userId, 'delete', def.name, id, def.label(res[0]));
}

export { asc, desc };
