// Admin Panel features: authentication and session rules, Forgot Password, the audit log, projects,
// announcements, career and enquiry management, exports, visitor tracking and the dashboard.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { eq, sql } from 'drizzle-orm';
import { connect, db, disconnect, migrateDb } from '../src/config/db.ts';
import { activityLog, adminSessions, adminUsers, enquiries, passwordResets } from '../src/models/schema.ts';
import { createResetToken } from '../src/services/auth.service.ts';
import { hashPassword } from '../src/utils/password.ts';
import { createApp } from '../src/app.ts';

let app: Express;
let adminId: number;
const XHR = { 'X-Requested-With': 'XMLHttpRequest' };
const BROWSER = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0 Safari/537.36' };
const ADMIN = { username: 'admin', password: 'Admin-Pass-2026' };

const signIn = async (who = ADMIN) => {
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/login').set(XHR).send(who);
  expect(res.status).toBe(200);
  return agent;
};
/** Audit entries are written without blocking the request; give them a moment. */
const settle = () => new Promise((r) => setTimeout(r, 150));
const audit = async () => db().select().from(activityLog).orderBy(sql`${activityLog.id} desc`);

beforeAll(async () => {
  const conn = await connect();
  if (conn.driver === 'pg') {
    await db().execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
    await db().execute(sql`DROP SCHEMA IF EXISTS public CASCADE`);
    await db().execute(sql`CREATE SCHEMA public`);
  }
  await migrateDb();
  const [row] = await db().insert(adminUsers).values({ username: 'admin', email: 'admin@test.local', name: 'Admin', role: 'admin', passwordHash: await hashPassword(ADMIN.password) }).returning();
  adminId = row.id;
  app = createApp();
});
afterAll(disconnect);

describe('sign-in, sessions and audit of authentication', () => {
  it('accepts the username or the account email, case-insensitively', async () => {
    expect((await request(app).post('/api/auth/login').set(XHR).send({ username: 'ADMIN', password: ADMIN.password })).status).toBe(200);
    expect((await request(app).post('/api/auth/login').set(XHR).send({ username: 'admin@test.local', password: ADMIN.password })).status).toBe(200);
  });

  it('returns field errors for an empty form', async () => {
    const res = await request(app).post('/api/auth/login').set(XHR).send({ username: '', password: '' });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.error.details)).toEqual(expect.arrayContaining(['username', 'password']));
  });

  it('records failed sign-ins, sign-ins and sign-outs in the audit log', async () => {
    await request(app).post('/api/auth/login').set(XHR).send({ username: 'admin', password: 'wrong-password' });
    await request(app).post('/api/auth/login').set(XHR).send({ username: 'nobody', password: 'x' });
    const agent = await signIn();
    await agent.post('/api/auth/logout').set(XHR);
    await settle();
    const actions = (await audit()).map((a) => a.action);
    expect(actions).toEqual(expect.arrayContaining(['login_failed', 'login', 'logout']));
    const failed = (await audit()).filter((a) => a.action === 'login_failed');
    expect(failed.some((f) => f.summary?.includes('nobody'))).toBe(true);
    // Failed attempts never lock out the next correct sign-in below the threshold.
    await db().update(adminUsers).set({ failedLogins: 0 }).where(eq(adminUsers.id, adminId));
  });

  it('expires a session after the idle timeout', async () => {
    const agent = await signIn();
    expect((await agent.get('/api/auth/me')).status).toBe(200);
    // Pretend the last request was 31 minutes ago (SESSION_IDLE_MINUTES defaults to 30).
    await db().update(adminSessions).set({ lastSeenAt: new Date(Date.now() - 31 * 60_000) }).where(eq(adminSessions.userId, adminId));
    const res = await agent.get('/api/admin/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.error.message).toMatch(/expired/);
  });

  it('blocks every admin API without a session, including direct requests', async () => {
    for (const path of ['/api/admin/dashboard', '/api/admin/projects', '/api/admin/announcements', '/api/admin/enquiries', '/api/admin/applications', '/api/admin/activity', '/api/admin/content/home', '/api/admin/enquiries/export']) {
      expect((await request(app).get(path)).status, path).toBe(401);
    }
    expect((await request(app).post('/api/admin/projects').set(XHR).send({})).status).toBe(401);
  });
});

describe('forgot password', () => {
  it('answers the same way whether or not the account exists', async () => {
    const a = await request(app).post('/api/auth/forgot-password').set(XHR).send({ username: 'admin' });
    const b = await request(app).post('/api/auth/forgot-password').set(XHR).send({ username: 'no-such-user' });
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(a.body.message).toBe(b.body.message);
    const tokens = await db().select().from(passwordResets).where(eq(passwordResets.userId, adminId));
    expect(tokens.length).toBeGreaterThan(0);
  });

  it('resets the password with a valid link, only once, and signs out every session', async () => {
    const agent = await signIn();
    const token = await createResetToken(adminId);
    expect((await request(app).get(`/api/auth/reset-password?token=${token}`).set(XHR)).status).toBe(200);
    const weak = await request(app).post('/api/auth/reset-password').set(XHR).send({ token, password: 'short' });
    expect(weak.status).toBe(400);
    const ok = await request(app).post('/api/auth/reset-password').set(XHR).send({ token, password: 'New-Admin-Pass-2027' });
    expect(ok.status).toBe(200);
    expect((await agent.get('/api/auth/me')).status).toBe(401);
    // Single use.
    expect((await request(app).post('/api/auth/reset-password').set(XHR).send({ token, password: 'Another-Pass-2028' })).status).toBe(400);
    expect((await request(app).post('/api/auth/login').set(XHR).send({ username: 'admin', password: 'New-Admin-Pass-2027' })).status).toBe(200);
    ADMIN.password = 'New-Admin-Pass-2027';
  });

  it('rejects expired and unknown links', async () => {
    const token = await createResetToken(adminId);
    await db().update(passwordResets).set({ expiresAt: new Date(Date.now() - 1000) }).where(eq(passwordResets.userId, adminId));
    expect((await request(app).post('/api/auth/reset-password').set(XHR).send({ token, password: 'Valid-Pass-20290' })).status).toBe(400);
    expect((await request(app).get('/api/auth/reset-password?token=' + 'x'.repeat(43)).set(XHR)).status).toBe(400);
  });

  it('a new link invalidates the previous one', async () => {
    const first = await createResetToken(adminId);
    await createResetToken(adminId);
    expect((await request(app).get(`/api/auth/reset-password?token=${first}`).set(XHR)).status).toBe(400);
  });
});

describe('projects', () => {
  it('manages categories, projects and images, and syncs published projects to the website', async () => {
    const admin = await signIn();
    const cat = await admin.post('/api/admin/project-categories').set(XHR).send({ name: 'Transaction Advisory', slug: 'transaction-advisory' });
    expect(cat.status).toBe(201);
    const body = {
      slug: 'nh-48-ham', title: 'NH-48 Hybrid Annuity Project', categoryId: String(cat.body.id), sectorId: '', client: 'NHAI', location: 'Gujarat',
      summary: 'Bid process management for a HAM highway.', description: ['Paragraph one.'], highlights: ['120 km'],
      coverImageUrl: '/uploads/cover.webp', status: 'ongoing', publishStatus: 'draft', images: [{ url: '/uploads/a.webp', caption: 'Site' }],
    };
    const created = await admin.post('/api/admin/projects').set(XHR).send(body);
    expect(created.status).toBe(201);
    expect(created.body.images).toHaveLength(1);
    expect(created.body.categoryId).toBe(cat.body.id);
    // Drafts are not public.
    expect((await request(app).get('/api/projects')).body.data).toHaveLength(0);

    const published = await admin.patch(`/api/admin/projects/${created.body.id}/status`).set(XHR).send({ status: 'published' });
    expect(published.body.publishStatus).toBe('published');
    const pub = await request(app).get('/api/projects');
    expect(pub.body.data[0].title).toBe('NH-48 Hybrid Annuity Project');
    expect(pub.body.data[0].category.name).toBe('Transaction Advisory');
    expect(pub.body.categories).toHaveLength(1);
    expect((await request(app).get('/api/projects/nh-48-ham')).body.project.images[0].caption).toBe('Site');

    // Replace the images and change the status.
    const updated = await admin.put(`/api/admin/projects/${created.body.id}`).set(XHR).send({ ...body, publishStatus: 'published', status: 'completed', images: [] });
    expect(updated.body.images).toHaveLength(0);
    expect((await request(app).get('/api/projects/nh-48-ham')).body.project.status).toBe('completed');

    // Filters and sorting on the admin list.
    const list = await admin.get('/api/admin/projects?status=completed&sort=title&dir=asc');
    expect(list.body.data[0].categoryName).toBe('Transaction Advisory');
    expect((await admin.get('/api/admin/projects?status=upcoming')).body.meta.total).toBe(0);

    // Unpublish removes it from the website.
    await admin.patch(`/api/admin/projects/${created.body.id}/status`).set(XHR).send({ status: 'draft' });
    expect((await request(app).get('/api/projects/nh-48-ham')).status).toBe(404);

    await settle();
    const log = (await audit()).filter((a) => a.entity === 'projects');
    expect(log.map((a) => a.action)).toEqual(expect.arrayContaining(['create', 'publish', 'update', 'unpublish']));
    const upd = log.find((a) => a.action === 'update')!;
    expect((upd.details as Record<string, { from: unknown; to: unknown }>).status).toEqual({ from: 'ongoing', to: 'completed' });
  });

  it('rejects a completion date before the start date and unsafe image URLs', async () => {
    const admin = await signIn();
    const res = await admin.post('/api/admin/projects').set(XHR).send({
      slug: 'bad-dates', title: 'Bad', summary: 'S', startedOn: '2026-05-01', completedOn: '2026-01-01', images: [{ url: 'javascript:alert(1)' }],
    });
    expect(res.status).toBe(400);
    expect(res.body.error.details.completedOn).toBeTruthy();
  });
});

describe('announcements and news', () => {
  it('shows published items, hides drafts and archived items, and publishes scheduled items when due', async () => {
    const admin = await signIn();
    const base = { kind: 'news', summary: 'Summary', body: ['Body'], showOnHomepage: true };
    const past = new Date(Date.now() - 3600_000).toISOString();
    const future = new Date(Date.now() + 2 * 86_400_000).toISOString();
    await admin.post('/api/admin/announcements').set(XHR).send({ ...base, slug: 'live', title: 'Live item', publishAt: past, status: 'published' });
    await admin.post('/api/admin/announcements').set(XHR).send({ ...base, slug: 'scheduled', title: 'Scheduled item', publishAt: future, status: 'published' });
    await admin.post('/api/admin/announcements').set(XHR).send({ ...base, slug: 'draft', title: 'Draft item', publishAt: past, status: 'draft' });
    const old = await admin.post('/api/admin/announcements').set(XHR).send({ ...base, slug: 'old', title: 'Old item', publishAt: past, status: 'published', showOnHomepage: false });
    await admin.patch(`/api/admin/announcements/${old.body.id}/status`).set(XHR).send({ status: 'archived' });

    const pub = await request(app).get('/api/announcements');
    expect(pub.body.data.map((a: { slug: string }) => a.slug)).toEqual(['live']);
    expect((await request(app).get('/api/announcements/scheduled')).status).toBe(404);
    expect((await request(app).get('/api/announcements/live')).body.item.body).toEqual(['Body']);

    // The scheduled time arrives.
    await db().execute(sql`update announcements set publish_at = now() - interval '1 minute' where slug = 'scheduled'`);
    expect((await request(app).get('/api/announcements')).body.meta.total).toBe(2);
    expect((await request(app).get('/api/announcements?homepage=1')).body.meta.total).toBe(2);

    // Admin filters by status and date.
    expect((await admin.get('/api/admin/announcements?status=archived')).body.meta.total).toBe(1);
    const today = new Date().toISOString().slice(0, 10);
    expect((await admin.get(`/api/admin/announcements?from=${today}&to=${today}`)).body.meta.total).toBeGreaterThanOrEqual(3);
  });
});

describe('career management', () => {
  it('publishes, unpublishes and closes openings, and manages application statuses and exports', async () => {
    const admin = await signIn();
    const job = { slug: 'analyst', title: 'Analyst', department: 'Consulting', location: 'New Delhi', experience: '1–3 years', employmentType: 'Contract', qualifications: ['CA'], responsibilities: ['Models'], postedOn: '2026-01-01', status: 'draft' };
    const created = await admin.post('/api/admin/jobs').set(XHR).send(job);
    expect(created.body.employmentType).toBe('Contract');
    await admin.patch(`/api/admin/jobs/${created.body.id}/status`).set(XHR).send({ status: 'open' });
    expect((await request(app).get('/api/jobs')).body).toHaveLength(1);
    await admin.patch(`/api/admin/jobs/${created.body.id}/status`).set(XHR).send({ status: 'closed' });
    expect((await request(app).get('/api/jobs')).body).toHaveLength(0);
    expect((await admin.patch(`/api/admin/jobs/${created.body.id}/status`).set(XHR).send({ status: 'bogus' })).status).toBe(400);
    expect((await admin.get('/api/admin/jobs?department=Consulting')).body.meta.total).toBe(1);

    await admin.patch(`/api/admin/jobs/${created.body.id}/status`).set(XHR).send({ status: 'open' });
    const applied = await request(app).post('/api/applications')
      .field('name', '=HYPERLINK("http://evil")').field('email', 'ravi@example.com').field('phone', '+91 99999 11111').field('location', 'Delhi')
      .field('position', 'Analyst').field('qualification', 'CA').field('experience', '3').field('consent', 'on')
      .attach('cv', Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\ntrailer\n%%EOF'), 'cv.pdf');
    expect(applied.status).toBe(201);
    const appId = applied.body.reference;
    expect((await admin.get(`/api/admin/applications/${appId}`)).body.status).toBe('pending');
    const upd = await admin.patch(`/api/admin/applications/${appId}`).set(XHR).send({ status: 'selected', notes: 'Strong models' });
    expect(upd.body.status).toBe('selected');
    expect((await admin.patch(`/api/admin/applications/${appId}`).set(XHR).send({ status: 'hired' })).status).toBe(400);
    expect((await admin.get(`/api/admin/applications?job=${created.body.id}&status=selected`)).body.meta.total).toBe(1);

    const csv = await admin.get('/api/admin/applications/export?status=selected');
    expect(csv.headers['content-type']).toMatch(/text\/csv/);
    expect(csv.headers['content-disposition']).toMatch(/attachment; filename="applications-/);
    expect(csv.text.charCodeAt(0)).toBe(0xfeff);
    // Formula injection is neutralised.
    expect(csv.text).toContain(`"'=HYPERLINK(""http://evil"")"`);
    expect(csv.text).toContain('Strong models');
  });
});

describe('enquiry management', () => {
  const enquiry = { name: 'Asha Rao', organisation: 'State PWD', email: 'asha@example.gov.in', phone: '+91 98765 43210', area: 'Roads & Highways', message: 'HAM project' };

  it('filters by status, category and date, records follow-ups, and exports', async () => {
    await request(app).post('/api/enquiries').send(enquiry);
    await request(app).post('/api/enquiries').send({ ...enquiry, name: 'Second', area: 'Ports' });
    const admin = await signIn();
    const all = await admin.get('/api/admin/enquiries');
    expect(all.body.meta.areas).toEqual(['Ports', 'Roads & Highways']);
    expect((await admin.get('/api/admin/enquiries?area=Ports')).body.meta.total).toBe(1);
    const id = all.body.data.find((e: { name: string }) => e.name === 'Asha Rao').id;
    const upd = await admin.patch(`/api/admin/enquiries/${id}`).set(XHR).send({ status: 'resolved', notes: 'Called back', followUpOn: '2026-12-01' });
    expect(upd.body.status).toBe('resolved');
    expect(upd.body.followUpOn).toBe('2026-12-01');
    expect((await admin.get('/api/admin/enquiries?status=resolved')).body.meta.total).toBe(1);
    expect((await admin.get('/api/admin/enquiries?from=2000-01-01&to=2000-01-31')).body.meta.total).toBe(0);
    expect((await admin.get('/api/admin/enquiries?sort=name&dir=asc')).body.data[0].name).toBe('Asha Rao');
    const csv = await admin.get('/api/admin/enquiries/export?area=Ports');
    expect(csv.text.split('\r\n').filter(Boolean)).toHaveLength(2);
    await settle();
    const entry = (await audit()).find((a) => a.entity === 'enquiries' && a.action === 'update')!;
    expect(entry.details).toMatchObject({ status: { from: 'new', to: 'resolved' } });
  });
});

describe('audit log', () => {
  it('is read-only and searchable by date and text', async () => {
    const admin = await signIn();
    const list = await admin.get('/api/admin/activity?pageSize=100');
    expect(list.status).toBe(200);
    expect(list.body.meta.actions).toEqual(expect.arrayContaining(['login', 'login_failed']));
    const first = list.body.data[0];
    // Newest first.
    expect(new Date(list.body.data[0].createdAt).getTime()).toBeGreaterThanOrEqual(new Date(list.body.data.at(-1).createdAt).getTime());
    expect((await admin.put(`/api/admin/activity/${first.id}`).set(XHR).send({})).status).toBe(404);
    expect((await admin.delete(`/api/admin/activity/${first.id}`).set(XHR)).status).toBe(404);
    expect((await admin.get('/api/admin/activity?q=NH-48')).body.meta.total).toBeGreaterThan(0);
    expect((await admin.get('/api/admin/activity?from=2000-01-01&to=2000-01-02')).body.meta.total).toBe(0);
    expect((await admin.get('/api/admin/activity?action=login_failed')).body.data.every((a: { action: string }) => a.action === 'login_failed')).toBe(true);
  });
});

describe('content management and settings', () => {
  it('saves homepage, page headings, footer, career options and company settings', async () => {
    const admin = await signIn();
    const home = { heroTitle: 'A new headline', heroImage: '/uploads/hero.webp', promo: { enabled: true, title: 'We are hiring', buttonLabel: 'Careers', buttonHref: '/careers' }, sections: { services: { title: 'What we do' } } };
    expect((await admin.put('/api/admin/content/home').set(XHR).send({ data: home })).status).toBe(200);
    expect((await admin.put('/api/admin/content/pages').set(XHR).send({ data: { careers: { title: 'Work with us' } } })).status).toBe(200);
    expect((await admin.put('/api/admin/content/footer').set(XHR).send({ data: { copyright: '© Spine' } })).status).toBe(200);
    expect((await admin.put('/api/admin/content/careerOptions').set(XHR).send({ data: { departments: ['Consulting'], locations: ['Delhi'], employmentTypes: ['Full-time'], experienceLevels: [] } })).status).toBe(200);
    expect((await admin.put('/api/admin/content/home').set(XHR).send({ data: { promo: { buttonHref: 'javascript:alert(1)' } } })).status).toBe(400);
    expect((await admin.put('/api/admin/content/pages').set(XHR).send({ data: { unknownPage: { title: 'x' } } })).status).toBe(400);

    const site = (await request(app).get('/api/site')).body;
    expect(site.home.heroTitle).toBe('A new headline');
    expect(site.home.sections.services.title).toBe('What we do');
    expect(site.pages.careers.title).toBe('Work with us');
    expect(site.footer.copyright).toBe('© Spine');
  });
});

describe('visitor tracking and dashboard', () => {
  it('counts unique daily visitors (ignoring bots and admin pages) and reports live statistics', async () => {
    await request(app).post('/api/track').set(BROWSER).send({ path: '/' });
    await request(app).post('/api/track').set(BROWSER).send({ path: '/services/' });
    await request(app).post('/api/track').set({ 'User-Agent': 'Googlebot/2.1' }).send({ path: '/' });
    await request(app).post('/api/track').set(BROWSER).send({ path: '/admin/' });
    expect((await request(app).post('/api/track').set(BROWSER).send({ path: 'not a path' })).status).toBe(204);
    await settle();

    const admin = await signIn();
    const d = (await admin.get('/api/admin/dashboard')).body;
    expect(d.stats.visitors).toBe(1);
    expect(d.stats.pageViews).toBe(2);
    expect(d.stats.enquiries).toBeGreaterThanOrEqual(2);
    expect(d.monthly).toHaveLength(12);
    expect(d.monthly.at(-1).visitors).toBe(1);
    expect(d.monthly.at(-1).enquiries).toBe(Number((await db().select({ n: sql<number>`count(*)::int` }).from(enquiries))[0].n));
    expect(Object.keys(d.projectStatus)).toEqual(['upcoming', 'ongoing', 'completed', 'on_hold']);
    expect(d.stats.publishedAnnouncements).toBe(2);
    expect(d.recentActivity.length).toBeGreaterThan(0);
  });
});
