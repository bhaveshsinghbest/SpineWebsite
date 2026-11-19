// sitemap.xml, robots.txt and llms.txt, generated from the database so new content is indexed automatically.
import { and, eq, lte, max } from 'drizzle-orm';
import { db } from '../config/db.ts';
import { env } from '../config/env.ts';
import * as s from '../models/schema.ts';
import { cached } from './cache.service.ts';
import { getAllArticleFaqs, getPractices, getSectors, getSite } from './public.service.ts';

const u = (p: string) => `${env.siteUrl}${p}`;
const xmlEscape = (v: string) => v.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);

const STATIC_PAGES = [
  '/', '/about/', '/about/mission/', '/about/vision/', '/about/team/', '/services/', '/industries/', '/sectors/',
  '/strategic-pillars/', '/projects/', '/news/', '/insights/', '/clientele/', '/association/', '/testimonials/', '/careers/', '/contact/',
  '/faq/', '/privacy/', '/disclaimer/',
];

export function sitemapXml() {
  return cached('sitemap', async () => {
    const day = (d: Date | string | null | undefined) => (d ? new Date(d).toISOString().slice(0, 10) : undefined);
    const [content] = await db().select({ at: max(s.siteContent.updatedAt) }).from(s.siteContent);
    const entries: { loc: string; lastmod?: string }[] = STATIC_PAGES.map((p) => ({ loc: p, lastmod: day(content?.at) }));

    const practices = await db().select({ slug: s.practices.slug, at: s.practices.updatedAt }).from(s.practices).where(eq(s.practices.status, 'published'));
    entries.push(...practices.map((p) => ({ loc: `/services/${p.slug}/`, lastmod: day(p.at) })));
    const base = { sector: 'sectors', industry: 'industries', pillar: 'strategic-pillars' } as const;
    const sectors = await db().select({ kind: s.sectors.kind, slug: s.sectors.slug, at: s.sectors.updatedAt }).from(s.sectors).where(eq(s.sectors.status, 'published'));
    entries.push(...sectors.map((x) => ({ loc: `/${base[x.kind]}/${x.slug}/`, lastmod: day(x.at) })));
    const team = await db().select({ slug: s.teamMembers.slug, at: s.teamMembers.updatedAt }).from(s.teamMembers).where(eq(s.teamMembers.status, 'published'));
    entries.push(...team.map((t) => ({ loc: `/about/team/${t.slug}/`, lastmod: day(t.at) })));
    const articles = await db().select({ slug: s.articles.slug, at: s.articles.updatedAt }).from(s.articles).where(and(eq(s.articles.status, 'published')));
    entries.push(...articles.map((a) => ({ loc: `/insights/${a.slug}/`, lastmod: day(a.at) })));

    const projects = await db().select({ slug: s.projects.slug, at: s.projects.updatedAt }).from(s.projects).where(eq(s.projects.publishStatus, 'published'));
    entries.push(...projects.map((p) => ({ loc: '/projects/' + p.slug + '/', lastmod: day(p.at) })));
    const news = await db().select({ slug: s.announcements.slug, at: s.announcements.updatedAt }).from(s.announcements)
      .where(and(eq(s.announcements.status, 'published'), lte(s.announcements.publishAt, new Date())));
    entries.push(...news.map((n) => ({ loc: '/news/' + n.slug + '/', lastmod: day(n.at) })));

    entries.sort((a, b) => a.loc.localeCompare(b.loc));
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...entries.map((e) => `<url><loc>${xmlEscape(u(e.loc))}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`),
      '</urlset>',
      '',
    ].join('\n');
  });
}

// AI answer engines are explicitly welcome: being cited by them is a goal of this site.
export function robotsTxt() {
  return [
    'User-agent: *', 'Allow: /', 'Disallow: /admin/', 'Disallow: /api/', '',
    'User-agent: GPTBot', 'User-agent: OAI-SearchBot', 'User-agent: ChatGPT-User', 'User-agent: ClaudeBot',
    'User-agent: Claude-SearchBot', 'User-agent: PerplexityBot', 'User-agent: Google-Extended', 'Allow: /', 'Disallow: /admin/', 'Disallow: /api/', '',
    `Sitemap: ${u('/sitemap.xml')}`, '',
  ].join('\n');
}

const address = (o: { lines: string[]; postalCode: string | null; city: string }) =>
  [...o.lines, o.postalCode ? `${o.city} – ${o.postalCode}` : o.city, 'India'].join(', ');

// llms.txt (https://llmstxt.org): a plain-markdown map of the site for LLMs and answer engines.
export function llmsTxt() {
  return cached('llms', async () => {
    const site = await getSite();
    const [practices, sectors, industries, pillars, articles] = await Promise.all([
      getPractices(), getSectors('sector'), getSectors('industry'), getSectors('pillar'), getAllArticleFaqs(),
    ]);
    const c = site.company;
    return [
      `# ${c.name}`, '', `> ${c.description}`, '',
      `- Founded: ${c.founded}, New Delhi, India`,
      `- Offices: ${site.offices.map((o: any) => (o.headOffice ? `${o.city} (head office: ${address(o)})` : o.city)).join('; ')}`,
      `- Contact: ${c.email} · ${c.phoneLandline}`,
      `- Leadership: ${site.leaders.map((l) => `${l.name} (${l.role})`).join('; ')}`,
      `- Clients include: ${site.clients.map((x) => x.name).join('; ')}`,
      '', '## Services',
      ...practices.map((p) => `- [${p.title}](${u(`/services/${p.slug}/`)}): ${p.answer} Services: ${p.items.map((i) => i.title).join(', ')}.`),
      '', '## Industries',
      ...industries.map((x) => `- [${x.title}](${u(`/industries/${x.slug}/`)}): ${x.answer}`),
      '', '## Infrastructure sectors',
      ...sectors.map((x) => `- [${x.title}](${u(`/sectors/${x.slug}/`)}): ${x.answer}`),
      '', '## Strategic pillars',
      ...pillars.map((x) => `- [${x.title}](${u(`/strategic-pillars/${x.slug}/`)}): ${x.answer}`),
      '', '## Insights',
      ...articles.map((a) => `- [${a.title}](${u(`/insights/${a.slug}/`)}) (${a.published}): ${a.summary}`),
      '', '## Firm',
      `- [About Us — Overview](${u('/about/')})`, `- [Mission](${u('/about/mission/')})`, `- [Vision](${u('/about/vision/')})`,
      `- [Team](${u('/about/team/')})`, `- [Clientele](${u('/clientele/')})`, `- [Association](${u('/association/')})`,
      `- [Testimonials](${u('/testimonials/')})`, `- [Careers](${u('/careers/')})`, `- [FAQs](${u('/faq/')})`, `- [Contact](${u('/contact/')})`,
      '',
    ].join('\n');
  });
}
