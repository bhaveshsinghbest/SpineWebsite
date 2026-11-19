// Content migration: loads the original website's content (TypeScript data files and YAML collections,
// copied unchanged into database/seeds/) into PostgreSQL. Safe to re-run: it refuses to overwrite
// existing content unless --force is given, and never touches enquiries, applications or projects. It also adds
// the Admin Panel defaults (career options, project categories, the admin username) when they are missing.
//   npm run db:seed            first-time content load
//   npm run db:seed -- --force replace all website content with the seed content
import { randomBytes } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { and, asc, count, eq, isNull, sql } from 'drizzle-orm';
import YAML from 'yaml';
import { connect, db, disconnect, migrateDb } from '../config/db.ts';
import { env } from '../config/env.ts';
import * as s from '../models/schema.ts';
import { hashPassword } from '../utils/password.ts';

const SEEDS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../database/seeds');
const load = async (file: string): Promise<any> => import(pathToFileURL(path.join(SEEDS, 'content', file)).href);
const force = process.argv.includes('--force');

await connect();
await migrateDb();

/**
 * Admin Panel defaults that may be missing on a database seeded before the Admin Panel existed.
 * Safe to run any number of times: only inserts what is absent and never changes existing data.
 */
async function ensureAdminPanelDefaults() {
  const added: string[] = [];
  const [career] = await db().select({ key: s.siteContent.key }).from(s.siteContent).where(eq(s.siteContent.key, 'careerOptions'));
  if (!career) {
    const jobLocations = await db().selectDistinct({ v: s.jobOpenings.location }).from(s.jobOpenings);
    const cities = await db().select({ v: s.offices.city }).from(s.offices).orderBy(asc(s.offices.sortOrder));
    const locations = [...new Set([...cities.map((c) => c.v), ...jobLocations.map((j) => j.v)])];
    await db().insert(s.siteContent).values({
      key: 'careerOptions',
      data: {
        departments: ['Consulting', 'Operation and Risk Advisory', 'Investment Banking', 'Engineering Services', 'Information Technology', 'Corporate'],
        locations,
        employmentTypes: ['Full-time', 'Part-time', 'Contract', 'Internship'],
        experienceLevels: ['0–1 years', '1–3 years', '2–4 years', '3–5 years', '5–8 years', '8+ years'],
      },
    }).onConflictDoNothing();
    added.push('career options');
  }
  const [{ cats }] = await db().select({ cats: count() }).from(s.projectCategories);
  if (cats === 0) {
    const names = ['Transaction Advisory', 'Project Management Consultancy', 'Independent Engineering', 'Investment Banking', 'Risk & Assurance', 'Information Technology'];
    await db().insert(s.projectCategories).values(names.map((name, i) => ({ name, slug: name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), sortOrder: i })))
      .onConflictDoNothing();
    added.push('project categories');
  }
  // Single administrator: make sure the admin account has a username.
  await db().update(s.adminUsers).set({ username: 'admin' })
    .where(and(isNull(s.adminUsers.username), eq(s.adminUsers.role, 'admin'), sql`${s.adminUsers.id} = (select min(id) from admin_users where role = 'admin')`));
  return added;
}

const [{ n }] = await db().select({ n: count() }).from(s.siteContent);
if (n > 0 && !force) {
  const added = await ensureAdminPanelDefaults();
  console.log(added.length ? `Added Admin Panel defaults: ${added.join(', ')}.` : 'Admin Panel defaults already present.');
  console.log('Website content already present — nothing else to do. Use `npm run db:seed -- --force` to replace it with the seed content.');
  await disconnect();
  process.exit(0);
}

const site = await load('site.ts');
const { practices } = await load('practices.ts');
const { sectors } = await load('sectors.ts');
const { industries } = await load('industries.ts');
const { pillars } = await load('pillars.ts');
const { articles } = await load('articles.ts');
const { legacyRedirects } = await load('redirects.ts');

await db().transaction(async (tx) => {
  if (force) {
    // Children cascade from their parents.
    for (const t of [s.faqs, s.sectorPractices, s.practices, s.sectors, s.teamMembers, s.clients, s.associates, s.offices, s.articles, s.jobOpenings, s.testimonials, s.redirects, s.siteContent]) {
      await tx.delete(t);
    }
  }

  // ---- Site content blocks ----
  const { formEndpoint: _f, careersEndpoint: _c, ...company } = site.company;
  const statTokens: Record<string, string> = { Established: '{{founded}}', 'Practice Areas': '{{practiceCount}}', 'Advisory Services': '{{serviceCount}}', 'Sectors & Industries': '{{sectorCount}}' };
  const blocks: Record<string, unknown> = {
    company,
    overview: site.overview,
    mission: site.mission,
    vision: site.vision,
    values: site.values,
    approach: site.approach,
    whyChoose: site.whyChoose,
    stats: site.stats.map((x: any) => ({ label: x.label, value: statTokens[x.label] ?? x.value, unit: x.unit ?? '', note: x.note })),
  };
  await tx.insert(s.siteContent).values(Object.entries(blocks).map(([key, data]) => ({ key, data })));

  await tx.insert(s.offices).values(site.offices.map((o: any, i: number) => ({
    city: o.city, region: o.region, lines: o.lines ?? [], postalCode: o.postalCode ?? null, headOffice: Boolean(o.headOffice), sortOrder: i,
  })));

  // ---- Services ----
  const practiceIds = new Map<string, number>();
  for (const [i, p] of practices.entries()) {
    const [row] = await tx.insert(s.practices).values({
      slug: p.slug, title: p.title, icon: p.icon, banner: p.banner ?? null, metaDescription: p.metaDescription,
      summary: p.summary, answer: p.answer, tags: p.tags, sortOrder: i, status: 'published',
    }).returning({ id: s.practices.id });
    practiceIds.set(p.slug, row.id);
    await tx.insert(s.practiceItems).values(p.items.map((it: any, j: number) => ({
      practiceId: row.id, anchorId: it.id, title: it.title, description: it.description, deliverables: it.deliverables, sortOrder: j,
    })));
    if (p.faqs.length) await tx.insert(s.faqs).values(p.faqs.map((f: any, j: number) => ({ practiceId: row.id, question: f.q, answer: f.a, sortOrder: j })));
  }

  // ---- Sectors, industries, strategic pillars ----
  const groups: ['sector' | 'industry' | 'pillar', any[]][] = [['sector', sectors], ['industry', industries], ['pillar', pillars]];
  for (const [kind, list] of groups) {
    for (const [i, x] of list.entries()) {
      const [row] = await tx.insert(s.sectors).values({
        kind, slug: x.slug, title: x.title, shortTitle: x.shortTitle, icon: x.icon, tag: x.tag, banner: x.banner ?? null,
        metaDescription: x.metaDescription, summary: x.summary, answer: x.answer, highlights: x.highlights, sortOrder: i, status: 'published',
      }).returning({ id: s.sectors.id });
      if (x.sections.length) {
        await tx.insert(s.sectorSections).values(x.sections.map((sec: any, j: number) => ({
          sectorId: row.id, heading: sec.heading, body: sec.body, bullets: sec.bullets ?? [], sortOrder: j,
        })));
      }
      if (x.faqs.length) await tx.insert(s.faqs).values(x.faqs.map((f: any, j: number) => ({ sectorId: row.id, question: f.q, answer: f.a, sortOrder: j })));
      const related = (x.relatedPractices as string[]).filter((slug) => practiceIds.has(slug));
      if (related.length) await tx.insert(s.sectorPractices).values(related.map((slug, j) => ({ sectorId: row.id, practiceId: practiceIds.get(slug)!, sortOrder: j })));
    }
  }

  // ---- Team (photos move into managed uploads) ----
  await fs.mkdir(env.publicUploadDir, { recursive: true });
  for (const [i, l] of site.leaders.entries()) {
    let photoUrl: string | null = null;
    if (l.photo) {
      const src = path.join(SEEDS, 'media', 'team', path.basename(l.photo));
      const storedName = `team-${l.slug}.jpg`;
      const buf = await fs.readFile(src);
      await fs.writeFile(path.join(env.publicUploadDir, storedName), buf);
      await tx.insert(s.media).values({ kind: 'image', originalName: path.basename(l.photo), storedName, mimeType: 'image/jpeg', sizeBytes: buf.length, isPublic: true, alt: `${l.name}, ${l.role}` })
        .onConflictDoNothing();
      photoUrl = `/uploads/${storedName}`;
    }
    await tx.insert(s.teamMembers).values({
      slug: l.slug, name: l.name, role: l.role, photoUrl, credentials: l.credentials ?? null, focus: l.focus, bio: l.bio, sortOrder: i, status: 'published',
    });
  }

  await tx.insert(s.clients).values(site.clients.map((c: any, i: number) => ({ shortName: c.short, name: c.name, sortOrder: i, status: 'published' as const })));
  await tx.insert(s.associates).values(site.associates.map((name: string, i: number) => ({ name, sortOrder: i, status: 'published' as const })));

  // ---- Insights ----
  for (const a of articles) {
    const [row] = await tx.insert(s.articles).values({
      slug: a.slug, title: a.title, category: a.category, banner: a.banner ?? null, publishedOn: a.published, readingMinutes: a.readingMinutes,
      metaDescription: a.metaDescription, summary: a.summary, takeaways: a.takeaways, status: 'published',
    }).returning({ id: s.articles.id });
    if (a.sections.length) {
      await tx.insert(s.articleSections).values(a.sections.map((sec: any, j: number) => ({ articleId: row.id, heading: sec.heading, body: sec.body, bullets: sec.bullets ?? [], sortOrder: j })));
    }
    if (a.faqs.length) await tx.insert(s.faqs).values(a.faqs.map((f: any, j: number) => ({ articleId: row.id, question: f.q, answer: f.a, sortOrder: j })));
  }

  // ---- Careers and testimonials (YAML collections) ----
  const yamlDir = async (dir: string) => {
    const full = path.join(SEEDS, 'yaml', dir);
    const files = (await fs.readdir(full)).filter((f) => /\.ya?ml$/.test(f)).sort();
    return Promise.all(files.map(async (f) => ({ slug: f.replace(/\.ya?ml$/, ''), data: YAML.parse(await fs.readFile(path.join(full, f), 'utf8')) })));
  };
  const isoDay = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : v ? String(v).slice(0, 10) : null);
  for (const { slug, data: j } of await yamlDir('careers')) {
    await tx.insert(s.jobOpenings).values({
      slug, title: j.title, department: j.department, location: j.location, experience: j.experience, employmentType: j.employmentType ?? 'Full-time',
      summary: j.summary ?? null, qualifications: j.qualifications, responsibilities: j.responsibilities,
      postedOn: isoDay(j.posted)!, closesOn: isoDay(j.closes), status: j.draft ? 'draft' : j.status === 'closed' ? 'closed' : 'open',
    });
  }
  for (const { data: t } of await yamlDir('testimonials')) {
    await tx.insert(s.testimonials).values({
      quote: t.quote, name: t.name, designation: t.designation, organisation: t.organisation, consentOnFile: Boolean(t.consentOnFile),
      sortOrder: t.order ?? 100, status: t.draft || !t.consentOnFile ? 'draft' : 'published',
    });
  }

  // ---- Redirects: every legacy URL of the old site ----
  const extra: Record<string, string> = {
    // The old site's own redirect pages that pointed at legacy anchors keep working too.
    '/sitemap-0.xml': '/sitemap.xml',
  };
  const all = { ...legacyRedirects, ...extra } as Record<string, string>;
  await tx.insert(s.redirects).values(Object.entries(all).map(([fromPath, toPath]) => ({ fromPath, toPath, statusCode: 301 })));
});

const counts = await Promise.all(
  ([['practices', s.practices], ['service items', s.practiceItems], ['sectors/industries/pillars', s.sectors], ['sections', s.sectorSections], ['FAQs', s.faqs],
    ['team members', s.teamMembers], ['clients', s.clients], ['associates', s.associates], ['offices', s.offices], ['articles', s.articles],
    ['job openings', s.jobOpenings], ['testimonials', s.testimonials], ['redirects', s.redirects], ['content blocks', s.siteContent]] as const)
    .map(async ([label, t]) => `${label}: ${(await db().select({ n: count() }).from(t as any))[0].n}`),
);
console.log('Seeded website content →', counts.join(', '));

// The single administrator account, only when none exists.
const [{ admins }] = await db().select({ admins: count() }).from(s.adminUsers);
if (admins === 0) {
  const username = process.env.SEED_ADMIN_USERNAME || 'admin';
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@spineadvisory.com';
  const password = process.env.SEED_ADMIN_PASSWORD || `Spine-${randomBytes(9).toString('base64url')}1a`;
  await db().insert(s.adminUsers).values({ username, email, name: 'Administrator', role: 'admin', passwordHash: await hashPassword(password) });
  console.log(`\nCreated the administrator account:\n  username: ${username}\n  email:    ${email}\n  password: ${process.env.SEED_ADMIN_PASSWORD ? '(from SEED_ADMIN_PASSWORD)' : password}\nSign in at /admin/login and change this password straight away.`);
}
const added = await ensureAdminPanelDefaults();
if (added.length) console.log(`Added Admin Panel defaults: ${added.join(', ')}.`);

await disconnect();
