// Admin-only operations that are not plain CRUD: submissions, content blocks, the audit log and the dashboard.
import { and, asc, count, desc, eq, ilike, inArray, lte, or, sql, type SQL } from 'drizzle-orm';
import { db } from '../config/db.ts';
import * as s from '../models/schema.ts';
import { contentBlocks, type ContentKey, type ListQuery } from '../validators/content.ts';
import { notFound } from '../utils/http-error.ts';
import { changes, logActivity } from './activity.service.ts';
import { invalidatePublicCache } from './cache.service.ts';
import { dateRange, escapeLike, sortOrder } from './crud.service.ts';

const meta = (page: number, pageSize: number, total: number) => ({ page, pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)) });
/** Exports are capped so a single request cannot exhaust the server. */
const EXPORT_LIMIT = 10_000;

// ---------- Content blocks ----------
export async function getContentBlock(key: ContentKey) {
  const [row] = await db().select().from(s.siteContent).where(eq(s.siteContent.key, key));
  return { key, data: row?.data ?? null, updatedAt: row?.updatedAt ?? null };
}

export async function saveContentBlock(key: ContentKey, data: unknown, userId: number) {
  const parsed = contentBlocks[key].parse(data) as Record<string, unknown> | unknown[];
  const before = await getContentBlock(key);
  await db().insert(s.siteContent).values({ key, data: parsed, updatedBy: userId })
    .onConflictDoUpdate({ target: s.siteContent.key, set: { data: parsed, updatedBy: userId, updatedAt: new Date() } });
  invalidatePublicCache();
  const diff = Array.isArray(parsed) || !before.data || Array.isArray(before.data)
    ? { content: { from: Array.isArray(before.data) ? `${before.data.length} items` : before.data ? '(previous)' : '(empty)', to: Array.isArray(parsed) ? `${parsed.length} items` : '(updated)' } }
    : changes(before.data as Record<string, unknown>, parsed);
  logActivity(userId, 'update', 'content', key, `Updated ${key}`, { details: Object.keys(diff).length ? diff : undefined });
  return getContentBlock(key);
}

// ---------- Enquiries ----------
const enquirySort = { createdAt: s.enquiries.createdAt, name: s.enquiries.name, organisation: s.enquiries.organisation, area: s.enquiries.area, status: s.enquiries.status, followUpOn: s.enquiries.followUpOn };

function enquiryWhere(q: ListQuery) {
  const where: SQL[] = [];
  if (q.status) where.push(eq(s.enquiries.status, q.status as never));
  if (q.area) where.push(eq(s.enquiries.area, q.area));
  if (q.q) {
    const t = escapeLike(q.q);
    where.push(or(ilike(s.enquiries.name, t), ilike(s.enquiries.organisation, t), ilike(s.enquiries.email, t), ilike(s.enquiries.phone, t), ilike(s.enquiries.message, t))!);
  }
  where.push(...dateRange(s.enquiries.createdAt, q.from, q.to));
  return where.length ? and(...where) : undefined;
}

export async function listEnquiries(q: ListQuery) {
  const cond = enquiryWhere(q);
  const [{ total }] = await db().select({ total: count() }).from(s.enquiries).where(cond);
  const data = await db().select().from(s.enquiries).where(cond)
    .orderBy(...sortOrder(enquirySort, q.sort, q.dir, [desc(s.enquiries.createdAt), desc(s.enquiries.id)]) as [SQL])
    .limit(q.pageSize).offset((q.page - 1) * q.pageSize);
  const areas = await db().selectDistinct({ area: s.enquiries.area }).from(s.enquiries).orderBy(asc(s.enquiries.area));
  return { data, meta: { ...meta(q.page, q.pageSize, total), areas: areas.map((a) => a.area) } };
}

export async function exportEnquiries(q: ListQuery) {
  return db().select().from(s.enquiries).where(enquiryWhere(q))
    .orderBy(...sortOrder(enquirySort, q.sort, q.dir, [desc(s.enquiries.createdAt)]) as [SQL]).limit(EXPORT_LIMIT);
}

export async function getEnquiry(id: number) {
  const [row] = await db().select().from(s.enquiries).where(eq(s.enquiries.id, id));
  if (!row) throw notFound('Enquiry');
  return row;
}

export async function updateEnquiry(id: number, patch: { status: string; notes?: string | null; followUpOn?: string | null }, userId: number) {
  const before = await getEnquiry(id);
  const values = { status: patch.status as never, notes: patch.notes ?? null, followUpOn: patch.followUpOn ?? null };
  const [row] = await db().update(s.enquiries).set(values).where(eq(s.enquiries.id, id)).returning();
  if (!row) throw notFound('Enquiry');
  logActivity(userId, 'update', 'enquiries', id, `${before.name} (${before.organisation}) — ${patch.status.replace('_', ' ')}`, { details: changes(before, values) });
  return row;
}

export async function deleteEnquiry(id: number, userId: number) {
  const res = await db().delete(s.enquiries).where(eq(s.enquiries.id, id)).returning({ id: s.enquiries.id, name: s.enquiries.name, organisation: s.enquiries.organisation });
  if (!res.length) throw notFound('Enquiry');
  logActivity(userId, 'delete', 'enquiries', id, `${res[0].name} (${res[0].organisation})`);
}

// ---------- Job applications ----------
const applicationSort = { createdAt: s.jobApplications.createdAt, name: s.jobApplications.name, position: s.jobApplications.position, location: s.jobApplications.location, experienceYears: s.jobApplications.experienceYears, status: s.jobApplications.status };

function applicationWhere(q: ListQuery) {
  const where: SQL[] = [];
  if (q.status) where.push(eq(s.jobApplications.status, q.status as never));
  if (q.job) where.push(eq(s.jobApplications.jobOpeningId, q.job));
  if (q.q) {
    const t = escapeLike(q.q);
    where.push(or(ilike(s.jobApplications.name, t), ilike(s.jobApplications.email, t), ilike(s.jobApplications.position, t), ilike(s.jobApplications.location, t), ilike(s.jobApplications.qualification, t))!);
  }
  where.push(...dateRange(s.jobApplications.createdAt, q.from, q.to));
  return where.length ? and(...where) : undefined;
}

const applicationColumns = {
  id: s.jobApplications.id, jobOpeningId: s.jobApplications.jobOpeningId, position: s.jobApplications.position, name: s.jobApplications.name,
  email: s.jobApplications.email, phone: s.jobApplications.phone, location: s.jobApplications.location, qualification: s.jobApplications.qualification,
  experienceYears: s.jobApplications.experienceYears, linkedin: s.jobApplications.linkedin, status: s.jobApplications.status, notes: s.jobApplications.notes,
  createdAt: s.jobApplications.createdAt,
};

export async function listApplications(q: ListQuery) {
  const cond = applicationWhere(q);
  const [{ total }] = await db().select({ total: count() }).from(s.jobApplications).where(cond);
  const data = await db().select(applicationColumns).from(s.jobApplications).where(cond)
    .orderBy(...sortOrder(applicationSort, q.sort, q.dir, [desc(s.jobApplications.createdAt), desc(s.jobApplications.id)]) as [SQL])
    .limit(q.pageSize).offset((q.page - 1) * q.pageSize);
  const jobs = await db().select({ id: s.jobOpenings.id, title: s.jobOpenings.title }).from(s.jobOpenings).orderBy(desc(s.jobOpenings.postedOn));
  return { data, meta: { ...meta(q.page, q.pageSize, total), jobs } };
}

export async function exportApplications(q: ListQuery) {
  return db().select({ ...applicationColumns, message: s.jobApplications.message }).from(s.jobApplications).where(applicationWhere(q))
    .orderBy(...sortOrder(applicationSort, q.sort, q.dir, [desc(s.jobApplications.createdAt)]) as [SQL]).limit(EXPORT_LIMIT);
}

export async function getApplication(id: number) {
  const [row] = await db()
    .select({ app: s.jobApplications, cv: { id: s.media.id, originalName: s.media.originalName, sizeBytes: s.media.sizeBytes, mimeType: s.media.mimeType } })
    .from(s.jobApplications)
    .innerJoin(s.media, eq(s.jobApplications.cvMediaId, s.media.id))
    .where(eq(s.jobApplications.id, id));
  if (!row) throw notFound('Application');
  return { ...row.app, cv: row.cv };
}

export async function updateApplication(id: number, patch: { status: string; notes?: string | null }, userId: number) {
  const before = await getApplication(id);
  const values = { status: patch.status as never, notes: patch.notes ?? null };
  const [row] = await db().update(s.jobApplications).set(values).where(eq(s.jobApplications.id, id)).returning();
  if (!row) throw notFound('Application');
  logActivity(userId, 'update', 'applications', id, `${before.name} — ${before.position} — ${patch.status}`, { details: changes(before, values) });
  return row;
}

export async function deleteApplication(id: number, userId: number) {
  const app = await getApplication(id);
  await db().transaction(async (tx) => {
    await tx.delete(s.jobApplications).where(eq(s.jobApplications.id, id));
    await tx.delete(s.media).where(eq(s.media.id, app.cvMediaId));
  });
  logActivity(userId, 'delete', 'applications', id, `${app.name} — ${app.position} (CV deleted)`);
  return app;
}

// ---------- Audit log ----------
const activitySort = { createdAt: s.activityLog.createdAt, action: s.activityLog.action, entity: s.activityLog.entity };

export async function listActivity(q: ListQuery) {
  const where: SQL[] = [];
  if (q.action) where.push(eq(s.activityLog.action, q.action));
  if (q.entity) where.push(eq(s.activityLog.entity, q.entity));
  if (q.q) {
    const t = escapeLike(q.q);
    where.push(or(ilike(s.activityLog.summary, t), ilike(s.activityLog.entity, t), ilike(s.activityLog.action, t), ilike(s.activityLog.entityId, t), ilike(s.activityLog.ip, t))!);
  }
  where.push(...dateRange(s.activityLog.createdAt, q.from, q.to));
  const cond = where.length ? and(...where) : undefined;
  const [{ total }] = await db().select({ total: count() }).from(s.activityLog).where(cond);
  const data = await db()
    .select({
      id: s.activityLog.id, action: s.activityLog.action, entity: s.activityLog.entity, entityId: s.activityLog.entityId, summary: s.activityLog.summary,
      details: s.activityLog.details, ip: s.activityLog.ip, createdAt: s.activityLog.createdAt, user: s.adminUsers.name,
    })
    .from(s.activityLog).leftJoin(s.adminUsers, eq(s.activityLog.userId, s.adminUsers.id))
    .where(cond)
    .orderBy(...sortOrder(activitySort, q.sort, q.dir, [desc(s.activityLog.createdAt), desc(s.activityLog.id)]) as [SQL])
    .limit(q.pageSize).offset((q.page - 1) * q.pageSize);
  const [actions, entities] = await Promise.all([
    db().selectDistinct({ v: s.activityLog.action }).from(s.activityLog).orderBy(asc(s.activityLog.action)),
    db().selectDistinct({ v: s.activityLog.entity }).from(s.activityLog).orderBy(asc(s.activityLog.entity)),
  ]);
  return { data, meta: { ...meta(q.page, q.pageSize, total), actions: actions.map((a) => a.v), entities: entities.map((e) => e.v) } };
}

// ---------- Dashboard ----------
const n = async (table: any, where?: SQL) => Number((await db().select({ n: count() }).from(table).where(where))[0].n);
/** Unique visitors: one per anonymous visitor hash per day. */
const uniqueVisitors = (where?: SQL) =>
  db().select({ n: sql<number>`count(distinct (${s.pageViews.day}, ${s.pageViews.visitorHash}))::int` }).from(s.pageViews).where(where).then((r) => Number(r[0].n));

export async function dashboard() {
  const monthStart = sql`date_trunc('month', now())`;
  const visibleAnnouncement = and(eq(s.announcements.status, 'published'), lte(s.announcements.publishAt, new Date()));
  const [
    visitors, visitorsThisMonth, pageViews, enquiries, enquiriesNew, enquiriesThisMonth, activeProjects, projectsTotal, publishedProjects,
    publishedAnnouncements, scheduledAnnouncements, jobsOpen, applicationsPending, applicationsTotal,
  ] = await Promise.all([
    uniqueVisitors(),
    uniqueVisitors(sql`${s.pageViews.createdAt} >= ${monthStart}`),
    n(s.pageViews),
    n(s.enquiries),
    n(s.enquiries, eq(s.enquiries.status, 'new')),
    n(s.enquiries, sql`${s.enquiries.createdAt} >= ${monthStart}`),
    n(s.projects, eq(s.projects.status, 'ongoing')),
    n(s.projects),
    n(s.projects, eq(s.projects.publishStatus, 'published')),
    n(s.announcements, visibleAnnouncement),
    n(s.announcements, and(eq(s.announcements.status, 'published'), sql`${s.announcements.publishAt} > now()`)),
    n(s.jobOpenings, eq(s.jobOpenings.status, 'open')),
    n(s.jobApplications, eq(s.jobApplications.status, 'pending')),
    n(s.jobApplications),
  ]);

  // Last 12 months, including months with no activity.
  const monthly = (await db().execute(sql`
    WITH months AS (
      SELECT generate_series(date_trunc('month', now()) - interval '11 months', date_trunc('month', now()), interval '1 month') AS m
    )
    SELECT to_char(m, 'YYYY-MM') AS month,
      (SELECT count(DISTINCT (pv.day, pv.visitor_hash)) FROM page_views pv WHERE pv.created_at >= m AND pv.created_at < m + interval '1 month')::int AS visitors,
      (SELECT count(*) FROM enquiries e WHERE e.created_at >= m AND e.created_at < m + interval '1 month')::int AS enquiries
    FROM months ORDER BY m
  `)) as unknown as { rows?: { month: string; visitors: number; enquiries: number }[] } | { month: string; visitors: number; enquiries: number }[];
  const monthlyRows = Array.isArray(monthly) ? monthly : (monthly.rows ?? []);

  const statusRows = await db().select({ status: s.projects.status, n: count() }).from(s.projects).groupBy(s.projects.status);
  const projectStatus = { upcoming: 0, ongoing: 0, completed: 0, on_hold: 0 } as Record<string, number>;
  for (const r of statusRows) projectStatus[r.status] = Number(r.n);

  const [recentActivity, recentEnquiries, topPages] = await Promise.all([
    db().select({ id: s.activityLog.id, action: s.activityLog.action, entity: s.activityLog.entity, summary: s.activityLog.summary, createdAt: s.activityLog.createdAt, user: s.adminUsers.name })
      .from(s.activityLog).leftJoin(s.adminUsers, eq(s.activityLog.userId, s.adminUsers.id))
      .orderBy(desc(s.activityLog.createdAt), desc(s.activityLog.id)).limit(8),
    db().select({ id: s.enquiries.id, name: s.enquiries.name, organisation: s.enquiries.organisation, status: s.enquiries.status, createdAt: s.enquiries.createdAt })
      .from(s.enquiries).orderBy(desc(s.enquiries.createdAt)).limit(5),
    db().select({ path: s.pageViews.path, views: count() }).from(s.pageViews)
      .where(sql`${s.pageViews.createdAt} >= now() - interval '30 days'`).groupBy(s.pageViews.path).orderBy(desc(count())).limit(5),
  ]);

  return {
    stats: {
      visitors, visitorsThisMonth, pageViews, enquiries, enquiriesNew, enquiriesThisMonth, activeProjects, projectsTotal, publishedProjects,
      publishedAnnouncements, scheduledAnnouncements, jobsOpen, applicationsPending, applicationsTotal,
    },
    monthly: monthlyRows.map((r) => ({ month: r.month, visitors: Number(r.visitors), enquiries: Number(r.enquiries) })),
    projectStatus,
    recentActivity,
    recentEnquiries,
    topPages: topPages.map((p) => ({ path: p.path, views: Number(p.views) })),
  };
}

export { inArray };
