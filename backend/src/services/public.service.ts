// Read-only content for the public website. Only published content is returned.
// Shapes match the original site's data files so the pages render identically.
import { and, asc, count, desc, eq, gte, inArray, isNull, lte, ne, or, sql } from 'drizzle-orm';
import { db } from '../config/db.ts';
import * as s from '../models/schema.ts';
import { notFound } from '../utils/http-error.ts';
import { cached } from './cache.service.ts';

const published = 'published' as const;

export async function getContentBlocks() {
  const rows = await db().select().from(s.siteContent);
  return Object.fromEntries(rows.map((r) => [r.key, r.data])) as Record<string, any>;
}

/** Everything the layout and About pages need, in one request. */
export function getSite() {
  return cached('site', async () => {
    const blocks = await getContentBlocks();
    const [offices, team, clients, associates, practices, sectorRows] = await Promise.all([
      db().select().from(s.offices).orderBy(asc(s.offices.sortOrder), asc(s.offices.id)),
      db().select().from(s.teamMembers).where(eq(s.teamMembers.status, published)).orderBy(asc(s.teamMembers.sortOrder), asc(s.teamMembers.id)),
      db().select().from(s.clients).where(eq(s.clients.status, published)).orderBy(asc(s.clients.sortOrder), asc(s.clients.id)),
      db().select().from(s.associates).where(eq(s.associates.status, published)).orderBy(asc(s.associates.sortOrder), asc(s.associates.id)),
      db()
        .select({ slug: s.practices.slug, title: s.practices.title, icon: s.practices.icon, itemCount: count(s.practiceItems.id) })
        .from(s.practices)
        .leftJoin(s.practiceItems, eq(s.practiceItems.practiceId, s.practices.id))
        .where(eq(s.practices.status, published))
        .groupBy(s.practices.id)
        .orderBy(asc(s.practices.sortOrder), asc(s.practices.id)),
      db()
        .select({ kind: s.sectors.kind, slug: s.sectors.slug, title: s.sectors.title, shortTitle: s.sectors.shortTitle, icon: s.sectors.icon, tag: s.sectors.tag })
        .from(s.sectors)
        .where(eq(s.sectors.status, published))
        .orderBy(asc(s.sectors.sortOrder), asc(s.sectors.id)),
    ]);
    const company = blocks.company ?? {};
    const serviceCount = practices.reduce((n, p) => n + Number(p.itemCount), 0);
    const counts: Record<string, string> = {
      founded: String(company.founded ?? ''),
      practiceCount: String(practices.length),
      serviceCount: String(serviceCount),
      sectorCount: String(sectorRows.filter((x) => x.kind !== 'pillar').length),
    };
    const stats = (blocks.stats ?? []).map((st: any) => ({ ...st, value: String(st.value).replace(/\{\{(\w+)\}\}/g, (_: string, k: string) => counts[k] ?? '') }));
    const icons = new Set<string>();
    for (const x of [...practices, ...sectorRows, ...(blocks.values ?? []), ...(blocks.whyChoose ?? [])]) if (x.icon) icons.add(x.icon);

    return {
      company,
      home: blocks.home ?? {},
      footer: blocks.footer ?? {},
      pages: blocks.pages ?? {},
      offices: offices.map((o) => ({ city: o.city, region: o.region, lines: o.lines, postalCode: o.postalCode, headOffice: o.headOffice })),
      overview: blocks.overview ?? [],
      mission: blocks.mission ?? null,
      vision: blocks.vision ?? null,
      values: blocks.values ?? [],
      approach: blocks.approach ?? [],
      whyChoose: blocks.whyChoose ?? [],
      stats,
      leaders: team.map(toLeader),
      clients: clients.map((c) => ({ short: c.shortName, name: c.name, logoUrl: c.logoUrl })),
      associates: associates.map((a) => a.name),
      navigation: {
        practices: practices.map((p) => ({ slug: p.slug, title: p.title, icon: p.icon, itemCount: Number(p.itemCount) })),
        industries: sectorRows.filter((x) => x.kind === 'industry'),
        sectors: sectorRows.filter((x) => x.kind === 'sector'),
        pillars: sectorRows.filter((x) => x.kind === 'pillar'),
      },
      icons: [...icons].sort(),
    };
  });
}

const toLeader = (m: typeof s.teamMembers.$inferSelect) => ({
  slug: m.slug, name: m.name, role: m.role, photo: m.photoUrl ?? undefined, credentials: m.credentials ?? undefined, focus: m.focus, bio: m.bio,
});

async function faqsFor(column: 'practiceId' | 'sectorId' | 'articleId', ids: number[]) {
  if (!ids.length) return new Map<number, { q: string; a: string }[]>();
  const rows = await db().select().from(s.faqs).where(inArray(s.faqs[column], ids)).orderBy(asc(s.faqs.sortOrder), asc(s.faqs.id));
  const map = new Map<number, { q: string; a: string }[]>();
  for (const r of rows) {
    const id = r[column]!;
    map.set(id, [...(map.get(id) ?? []), { q: r.question, a: r.answer }]);
  }
  return map;
}

export function getPractices() {
  return cached('practices', async () => {
    const rows = await db().select().from(s.practices).where(eq(s.practices.status, published)).orderBy(asc(s.practices.sortOrder), asc(s.practices.id));
    const ids = rows.map((r) => r.id);
    const items = ids.length
      ? await db().select().from(s.practiceItems).where(inArray(s.practiceItems.practiceId, ids)).orderBy(asc(s.practiceItems.sortOrder), asc(s.practiceItems.id))
      : [];
    const faqs = await faqsFor('practiceId', ids);
    return rows.map((p) => ({
      slug: p.slug, title: p.title, icon: p.icon, banner: p.banner ?? undefined, metaDescription: p.metaDescription,
      summary: p.summary, answer: p.answer, tags: p.tags,
      items: items.filter((i) => i.practiceId === p.id).map((i) => ({ id: i.anchorId, title: i.title, description: i.description, deliverables: i.deliverables })),
      faqs: faqs.get(p.id) ?? [],
    }));
  });
}

export async function getPractice(slug: string) {
  const p = (await getPractices()).find((x) => x.slug === slug);
  if (!p) throw notFound('Service');
  return p;
}

export function getSectors(kind: 'sector' | 'industry' | 'pillar') {
  return cached(`sectors:${kind}`, async () => {
    const rows = await db().select().from(s.sectors).where(and(eq(s.sectors.kind, kind), eq(s.sectors.status, published))).orderBy(asc(s.sectors.sortOrder), asc(s.sectors.id));
    const ids = rows.map((r) => r.id);
    if (!ids.length) return [];
    const [sections, faqs, related] = await Promise.all([
      db().select().from(s.sectorSections).where(inArray(s.sectorSections.sectorId, ids)).orderBy(asc(s.sectorSections.sortOrder), asc(s.sectorSections.id)),
      faqsFor('sectorId', ids),
      db()
        .select({ sectorId: s.sectorPractices.sectorId, slug: s.practices.slug })
        .from(s.sectorPractices)
        .innerJoin(s.practices, eq(s.sectorPractices.practiceId, s.practices.id))
        .where(and(inArray(s.sectorPractices.sectorId, ids), eq(s.practices.status, published)))
        .orderBy(asc(s.sectorPractices.sortOrder)),
    ]);
    return rows.map((x) => ({
      kind: x.kind, slug: x.slug, title: x.title, shortTitle: x.shortTitle, icon: x.icon, tag: x.tag, banner: x.banner ?? undefined,
      metaDescription: x.metaDescription, summary: x.summary, answer: x.answer, highlights: x.highlights,
      sections: sections.filter((y) => y.sectorId === x.id).map((y) => ({ heading: y.heading, body: y.body, bullets: y.bullets.length ? y.bullets : undefined })),
      relatedPractices: related.filter((r) => r.sectorId === x.id).map((r) => r.slug),
      faqs: faqs.get(x.id) ?? [],
    }));
  });
}

export async function getSector(kind: 'sector' | 'industry' | 'pillar', slug: string) {
  const x = (await getSectors(kind)).find((y) => y.slug === slug);
  if (!x) throw notFound('Page');
  return x;
}

export async function getTeamMember(slug: string) {
  const m = (await getSite()).leaders.find((l) => l.slug === slug);
  if (!m) throw notFound('Team member');
  return m;
}

export function getArticles(opts: { page: number; pageSize: number; category?: string }) {
  return cached(`articles:${opts.page}:${opts.pageSize}:${opts.category ?? ''}`, async () => {
    const cond = and(eq(s.articles.status, published), opts.category ? eq(s.articles.category, opts.category) : undefined);
    const [{ total }] = await db().select({ total: count() }).from(s.articles).where(cond);
    const rows = await db().select().from(s.articles).where(cond).orderBy(desc(s.articles.publishedOn), desc(s.articles.id))
      .limit(opts.pageSize).offset((opts.page - 1) * opts.pageSize);
    const categories = await db().selectDistinct({ c: s.articles.category }).from(s.articles).where(eq(s.articles.status, published)).orderBy(asc(s.articles.category));
    return {
      data: rows.map((a) => toArticle(a, [], [])),
      meta: { page: opts.page, pageSize: opts.pageSize, total, pages: Math.max(1, Math.ceil(total / opts.pageSize)), categories: categories.map((c) => c.c) },
    };
  });
}

export function getArticle(slug: string) {
  return cached(`article:${slug}`, async () => {
    const [a] = await db().select().from(s.articles).where(and(eq(s.articles.slug, slug), eq(s.articles.status, published)));
    if (!a) throw notFound('Article');
    const sections = await db().select().from(s.articleSections).where(eq(s.articleSections.articleId, a.id)).orderBy(asc(s.articleSections.sortOrder));
    const faqs = (await faqsFor('articleId', [a.id])).get(a.id) ?? [];
    return toArticle(a, sections, faqs);
  });
}

function toArticle(a: typeof s.articles.$inferSelect, sections: (typeof s.articleSections.$inferSelect)[], faqs: { q: string; a: string }[]) {
  return {
    slug: a.slug, title: a.title, category: a.category, banner: a.banner ?? undefined, published: a.publishedOn,
    readingMinutes: a.readingMinutes, metaDescription: a.metaDescription, summary: a.summary, takeaways: a.takeaways,
    sections: sections.map((x) => ({ heading: x.heading, body: x.body, bullets: x.bullets.length ? x.bullets : undefined })),
    faqs,
  };
}

/** All published articles with sections (for the FAQ hub and llms.txt). */
export async function getAllArticleFaqs() {
  const rows = await db().select().from(s.articles).where(eq(s.articles.status, published)).orderBy(desc(s.articles.publishedOn));
  const faqs = await faqsFor('articleId', rows.map((r) => r.id));
  return rows.map((a) => ({ slug: a.slug, title: a.title, category: a.category, published: a.publishedOn, summary: a.summary, faqs: faqs.get(a.id) ?? [] }));
}

/** Open positions: status open and not past their closing date. */
export function getOpenJobs() {
  return cached('jobs', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const rows = await db().select().from(s.jobOpenings)
      .where(and(eq(s.jobOpenings.status, 'open'), or(isNull(s.jobOpenings.closesOn), gte(s.jobOpenings.closesOn, today))))
      .orderBy(desc(s.jobOpenings.postedOn), desc(s.jobOpenings.id));
    return rows.map((j) => ({
      id: j.slug, title: j.title, department: j.department, location: j.location, experience: j.experience, employmentType: j.employmentType,
      summary: j.summary ?? undefined, qualifications: j.qualifications, responsibilities: j.responsibilities, posted: j.postedOn, closes: j.closesOn ?? undefined,
    }));
  });
}

/** Testimonials shown on the site: published and backed by written client consent. */
export function getTestimonials() {
  return cached('testimonials', async () => {
    const rows = await db().select().from(s.testimonials)
      .where(and(eq(s.testimonials.status, published), eq(s.testimonials.consentOnFile, true)))
      .orderBy(asc(s.testimonials.sortOrder), asc(s.testimonials.id));
    return rows.map((t) => ({ quote: t.quote, name: t.name, designation: t.designation, organisation: t.organisation }));
  });
}

export function getRedirects() {
  return cached('redirects', () => db().select({ from: s.redirects.fromPath, to: s.redirects.toPath, status: s.redirects.statusCode }).from(s.redirects));
}

export async function healthCheck() {
  await db().execute(sql`select 1`);
}

// ---------- Projects ----------
const projectStatuses = ['upcoming', 'ongoing', 'completed', 'on_hold'] as const;
type ProjectStatus = (typeof projectStatuses)[number];

/** Published projects with their category, sector and images. */
export function getProjects() {
  return cached('projects', async () => {
    const rows = await db()
      .select({ p: s.projects, category: { name: s.projectCategories.name, slug: s.projectCategories.slug }, sector: { title: s.sectors.title, slug: s.sectors.slug, kind: s.sectors.kind } })
      .from(s.projects)
      .leftJoin(s.projectCategories, eq(s.projects.categoryId, s.projectCategories.id))
      .leftJoin(s.sectors, and(eq(s.projects.sectorId, s.sectors.id), eq(s.sectors.status, published)))
      .where(eq(s.projects.publishStatus, published))
      .orderBy(desc(s.projects.featured), asc(s.projects.sortOrder), desc(s.projects.startedOn), desc(s.projects.id));
    const ids = rows.map((r) => r.p.id);
    const images = ids.length
      ? await db().select().from(s.projectImages).where(inArray(s.projectImages.projectId, ids)).orderBy(asc(s.projectImages.sortOrder), asc(s.projectImages.id))
      : [];
    const categories = await db().select({ name: s.projectCategories.name, slug: s.projectCategories.slug }).from(s.projectCategories)
      .orderBy(asc(s.projectCategories.sortOrder), asc(s.projectCategories.name));
    const used = new Set(rows.map((r) => r.category?.slug).filter(Boolean));
    return {
      data: rows.map(({ p, category, sector }) => ({
        slug: p.slug, title: p.title, client: p.client ?? undefined, location: p.location ?? undefined, value: p.projectValue ?? undefined,
        startedOn: p.startedOn ?? undefined, completedOn: p.completedOn ?? undefined, summary: p.summary, description: p.description,
        highlights: p.highlights, coverImageUrl: p.coverImageUrl ?? undefined, status: p.status as ProjectStatus, featured: p.featured,
        category: category?.slug ? category : undefined,
        sector: sector?.slug ? { ...sector, href: `/${({ sector: 'sectors', industry: 'industries', pillar: 'strategic-pillars' } as const)[sector.kind]}/${sector.slug}/` } : undefined,
        images: images.filter((i) => i.projectId === p.id).map((i) => ({ url: i.url, caption: i.caption ?? undefined })),
      })),
      categories: categories.filter((c) => used.has(c.slug)),
    };
  });
}

export async function getProject(slug: string) {
  const all = await getProjects();
  const p = all.data.find((x) => x.slug === slug);
  if (!p) throw notFound('Project');
  return { project: p, related: all.data.filter((x) => x.slug !== slug && x.category?.slug && x.category.slug === p.category?.slug).slice(0, 3) };
}

// ---------- Announcements & news ----------
/** Published and due (a future publication time means the item is scheduled and not yet visible). */
const visibleAnnouncement = () => and(eq(s.announcements.status, published), lte(s.announcements.publishAt, new Date()));

const toAnnouncement = (a: typeof s.announcements.$inferSelect, withBody = false) => ({
  slug: a.slug, kind: a.kind, title: a.title, summary: a.summary, imageUrl: a.imageUrl ?? undefined, publishedAt: a.publishAt.toISOString(),
  ...(withBody ? { body: a.body } : {}),
});

// Not cached: visibility depends on the current time (scheduled items appear exactly when due).
export async function getAnnouncements(opts: { page: number; pageSize: number; kind?: 'announcement' | 'news'; homepage?: boolean }) {
  const cond = and(
    visibleAnnouncement(),
    opts.kind ? eq(s.announcements.kind, opts.kind) : undefined,
    opts.homepage ? eq(s.announcements.showOnHomepage, true) : undefined,
  );
  const [{ total }] = await db().select({ total: count() }).from(s.announcements).where(cond);
  const rows = await db().select().from(s.announcements).where(cond)
    .orderBy(desc(s.announcements.publishAt), desc(s.announcements.id)).limit(opts.pageSize).offset((opts.page - 1) * opts.pageSize);
  return { data: rows.map((a) => toAnnouncement(a)), meta: { page: opts.page, pageSize: opts.pageSize, total, pages: Math.max(1, Math.ceil(total / opts.pageSize)) } };
}

export async function getAnnouncement(slug: string) {
  const [a] = await db().select().from(s.announcements).where(and(eq(s.announcements.slug, slug), visibleAnnouncement()));
  if (!a) throw notFound('Announcement');
  const more = await db().select().from(s.announcements).where(and(visibleAnnouncement(), ne(s.announcements.id, a.id)))
    .orderBy(desc(s.announcements.publishAt)).limit(3);
  return { item: toAnnouncement(a, true), more: more.map((m) => toAnnouncement(m)) };
}
