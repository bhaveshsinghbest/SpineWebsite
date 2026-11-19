// End-to-end API tests: a real (embedded) PostgreSQL database, migrations, and the full Express stack.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { eq, sql } from 'drizzle-orm';
import { connect, db, disconnect, migrateDb } from '../src/config/db.ts';
import { env } from '../src/config/env.ts';
import { adminUsers, media } from '../src/models/schema.ts';
import { hashPassword } from '../src/utils/password.ts';
import { createApp } from '../src/app.ts';

let app: Express;
const XHR = { 'X-Requested-With': 'XMLHttpRequest' };
const ADMIN = { username: 'admin', password: 'Admin-Pass-2026' };
const ADMIN_EMAIL = 'admin@test.local';
const EDITOR = { username: 'editor', password: 'Editor-Pass-2026' };

async function signIn(who: { username: string; password: string }) {
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/login').set(XHR).send(who);
  expect(res.status).toBe(200);
  return agent;
}

const practice = {
  slug: 'consulting', title: 'Consulting', icon: 'handshake', metaDescription: 'Consulting services', summary: 'Summary', answer: 'Answer',
  tags: ['PPP'], items: [{ anchorId: 'transaction-advisory', title: 'Transaction Advisory', description: 'Desc', deliverables: ['Report'] }],
  faqs: [{ question: 'What is it?', answer: 'An answer.' }],
};

beforeAll(async () => {
  const conn = await connect();
  if (conn.driver === 'pg') {
    // Real PostgreSQL test database (TEST_DATABASE_URL): start from an empty schema every run.
    await db().execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
    await db().execute(sql`DROP SCHEMA IF EXISTS public CASCADE`);
    await db().execute(sql`CREATE SCHEMA public`);
  }
  await migrateDb();
  await db().insert(adminUsers).values([
    { username: ADMIN.username, email: ADMIN_EMAIL, name: 'Admin', role: 'admin', passwordHash: await hashPassword(ADMIN.password) },
    { username: EDITOR.username, email: 'editor@test.local', name: 'Editor', role: 'editor', passwordHash: await hashPassword(EDITOR.password) },
  ]);
  app = createApp();
});
afterAll(disconnect);

describe('authentication', () => {
  it('rejects a wrong password without revealing which part was wrong', async () => {
    const res = await request(app).post('/api/auth/login').set(XHR).send({ username: ADMIN.username, password: 'nope' });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Incorrect username or password.');
  });

  it('requires the CSRF header on state-changing requests', async () => {
    const res = await request(app).post('/api/auth/login').send(ADMIN);
    expect(res.status).toBe(403);
  });

  it('signs in with an HttpOnly, SameSite=Strict session cookie and signs out', async () => {
    const agent = request.agent(app);
    const login = await agent.post('/api/auth/login').set(XHR).send(ADMIN);
    expect(login.status).toBe(200);
    const cookie = String(login.headers['set-cookie']);
    expect(cookie).toMatch(/spine_session=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Strict/i);
    expect(login.body.permissions).toEqual(expect.arrayContaining(['projects', 'announcements', 'activity', 'settings']));
    expect(login.body.permissions).not.toContain('users');
    expect((await agent.get('/api/auth/me')).body.user.username).toBe('admin');
    expect((await agent.post('/api/auth/logout').set(XHR)).status).toBe(204);
    expect((await agent.get('/api/auth/me')).status).toBe(401);
  });

  it('locks an account after repeated failures', async () => {
    const victim = { username: 'locked', password: 'Locked-Pass-2026' };
    await db().insert(adminUsers).values({ username: victim.username, email: 'locked@test.local', name: 'L', role: 'admin', passwordHash: await hashPassword(victim.password) });
    for (let i = 0; i < 5; i++) await request(app).post('/api/auth/login').set(XHR).send({ username: victim.username, password: 'wrong' });
    const res = await request(app).post('/api/auth/login').set(XHR).send(victim);
    expect(res.status).toBe(423);
  });

  it('blocks admin APIs without a session', async () => {
    expect((await request(app).get('/api/admin/practices')).status).toBe(401);
  });
});

describe('single administrator', () => {
  it('does not let accounts other than the administrator sign in', async () => {
    const res = await request(app).post('/api/auth/login').set(XHR).send(EDITOR);
    expect(res.status).toBe(401);
  });

  it('has no user-management API', async () => {
    const admin = await signIn(ADMIN);
    expect((await admin.get('/api/admin/users')).status).toBe(404);
  });
});

describe('content CRUD and publishing', () => {
  it('creates, reads, updates and deletes a practice with nested items and FAQs', async () => {
    const admin = await signIn(ADMIN);
    const created = await admin.post('/api/admin/practices').set(XHR).send(practice);
    expect(created.status).toBe(201);
    expect(created.body.items).toHaveLength(1);
    expect(created.body.faqs).toHaveLength(1);

    const pub = await request(app).get('/api/practices/consulting');
    expect(pub.status).toBe(200);
    expect(pub.body.items[0].id).toBe('transaction-advisory');

    const updated = await admin.put(`/api/admin/practices/${created.body.id}`).set(XHR).send({ ...practice, title: 'Consulting Services', items: [], status: 'draft' });
    expect(updated.body.title).toBe('Consulting Services');
    expect(updated.body.items).toHaveLength(0);
    // Drafts disappear from the public site immediately.
    expect((await request(app).get('/api/practices/consulting')).status).toBe(404);

    const list = await admin.get('/api/admin/practices?q=consult&page=1&pageSize=10');
    expect(list.body.meta.total).toBe(1);

    expect((await admin.delete(`/api/admin/practices/${created.body.id}`).set(XHR)).status).toBe(204);
    expect((await admin.get(`/api/admin/practices/${created.body.id}`)).status).toBe(404);
  });

  it('rejects invalid input with field-level errors', async () => {
    const admin = await signIn(ADMIN);
    const res = await admin.post('/api/admin/practices').set(XHR).send({ ...practice, slug: 'Not A Slug!' });
    expect(res.status).toBe(400);
    expect(res.body.error.details.slug).toBeTruthy();
  });

  it('strips HTML from text input', async () => {
    const admin = await signIn(ADMIN);
    const res = await admin.post('/api/admin/associates').set(XHR).send({ name: '<script>alert(1)</script>Acme & Co' });
    expect(res.body.name).toBe('alert(1)Acme & Co');
  });

  it('refuses to publish a testimonial without client consent', async () => {
    const admin = await signIn(ADMIN);
    const t = { quote: 'An excellent partner on our concession.', name: 'A Person', designation: 'Director', organisation: 'Org', status: 'published', consentOnFile: false };
    expect((await admin.post('/api/admin/testimonials').set(XHR).send(t)).status).toBe(400);
    expect((await admin.post('/api/admin/testimonials').set(XHR).send({ ...t, consentOnFile: true })).status).toBe(201);
    expect((await request(app).get('/api/testimonials')).body).toHaveLength(1);
  });

  it('lists only open, unexpired jobs publicly', async () => {
    const admin = await signIn(ADMIN);
    const job = { slug: 'analyst', title: 'Analyst', department: 'Consulting', location: 'New Delhi', experience: '1–3 years', qualifications: ['CA'], responsibilities: ['Models'], postedOn: '2026-01-01' };
    await admin.post('/api/admin/jobs').set(XHR).send({ ...job, status: 'open' });
    await admin.post('/api/admin/jobs').set(XHR).send({ ...job, slug: 'expired', closesOn: '2026-01-02', status: 'open' });
    await admin.post('/api/admin/jobs').set(XHR).send({ ...job, slug: 'draft-job', status: 'draft' });
    const res = await request(app).get('/api/jobs');
    expect(res.body.map((j: { id: string }) => j.id)).toEqual(['analyst']);
  });

  it('saves site content blocks', async () => {
    const admin = await signIn(ADMIN);
    const res = await admin.put('/api/admin/content/vision').set(XHR).send({ data: { statement: 'We succeed when clients succeed', points: ['One'] } });
    expect(res.status).toBe(200);
    expect((await request(app).get('/api/site')).body.vision.statement).toBe('We succeed when clients succeed');
  });
});

describe('public forms', () => {
  const enquiry = { name: 'Asha Rao', organisation: 'State PWD', email: 'asha@example.gov.in', phone: '+91 98765 43210', area: 'Roads & Highways', message: 'HAM project' };

  it('stores a valid enquiry and shows it to admins', async () => {
    const res = await request(app).post('/api/enquiries').send(enquiry);
    expect(res.status).toBe(201);
    const admin = await signIn(ADMIN);
    const list = await admin.get('/api/admin/enquiries');
    expect(list.body.data[0].organisation).toBe('State PWD');
  });

  it('validates enquiries server-side', async () => {
    const res = await request(app).post('/api/enquiries').send({ ...enquiry, email: 'not-an-email', phone: 'x' });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.error.details)).toEqual(expect.arrayContaining(['email', 'phone']));
  });

  it('silently drops honeypot submissions', async () => {
    const admin = await signIn(ADMIN);
    const before = (await admin.get('/api/admin/enquiries')).body.meta.total;
    expect((await request(app).post('/api/enquiries').send({ ...enquiry, company_website: 'spam.example' })).status).toBe(201);
    expect((await admin.get('/api/admin/enquiries')).body.meta.total).toBe(before);
  });

  const application = (cv: Buffer, name: string) =>
    request(app).post('/api/applications')
      .field('name', 'Ravi Kumar').field('email', 'ravi@example.com').field('phone', '+91 99999 11111').field('location', 'Delhi')
      .field('position', 'Analyst').field('qualification', 'CA').field('experience', '3').field('consent', 'on')
      .attach('cv', cv, name);

  it('rejects a file disguised as a PDF', async () => {
    const res = await application(Buffer.from('MZ\x90\x00 this is an executable'), 'cv.pdf');
    expect(res.status).toBe(400);
  });

  it('accepts a real PDF, stores it privately and lets recruiters download it', async () => {
    const res = await application(Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\ntrailer\n%%EOF'), 'cv.pdf');
    expect(res.status).toBe(201);
    const admin = await signIn(ADMIN);
    const app2 = await admin.get(`/api/admin/applications/${res.body.reference}`);
    expect(app2.body.position).toBe('Analyst');
    expect(app2.body.jobOpeningId).not.toBeNull();
    const cv = await admin.get(`/api/admin/applications/${res.body.reference}/cv`);
    expect(cv.status).toBe(200);
    expect(cv.headers['content-disposition']).toMatch(/attachment/);
    // CVs are never reachable through the public uploads path.
    expect((await request(app).get('/uploads/' + app2.body.cv.id)).status).toBe(404);

    // Deleting the application removes the stored CV file as well.
    const [cvRow] = await db().select().from(media).where(eq(media.id, app2.body.cv.id));
    const cvPath = path.join(env.privateUploadDir, cvRow.storedName);
    expect(fs.existsSync(cvPath)).toBe(true);
    expect((await admin.delete(`/api/admin/applications/${res.body.reference}`).set(XHR)).status).toBe(204);
    expect(fs.existsSync(cvPath)).toBe(false);
  });
});

describe('SEO endpoints', () => {
  it('serves robots.txt, sitemap.xml and llms.txt', async () => {
    expect((await request(app).get('/robots.txt')).text).toMatch(/Disallow: \/admin\//);
    const sitemap = await request(app).get('/sitemap.xml');
    expect(sitemap.headers['content-type']).toMatch(/xml/);
    expect(sitemap.text).toMatch(/<loc>http:\/\/localhost:4200\/careers\/<\/loc>/);
    expect((await request(app).get('/llms.txt')).status).toBe(200);
  });
});
