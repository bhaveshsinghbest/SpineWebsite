// JSON-LD (schema.org) builders. Every page emits Organization + WebSite; pages add their own nodes.
import type { Crumb, Faq, Site } from './models';

export const SITE_URL = 'https://spineadvisory.com';
const ORG_ID = `${SITE_URL}/#organization`;
export const abs = (path: string) => new URL(path, SITE_URL).href;

function postal(o: Site['offices'][number]) {
  return {
    '@type': 'PostalAddress',
    ...(o.lines.length ? { streetAddress: o.lines.join(', ') } : {}),
    addressLocality: o.city,
    addressRegion: o.region,
    ...(o.postalCode ? { postalCode: o.postalCode } : {}),
    addressCountry: 'IN',
  };
}

export function organization(site: Site) {
  const c = site.company;
  const head = site.offices.find((o) => o.headOffice) ?? site.offices[0];
  const sameAs = Object.values(c.social ?? {}).filter(Boolean);
  return {
    '@type': ['Organization', 'ProfessionalService'],
    '@id': ORG_ID,
    name: c.name,
    legalName: c.legalName,
    url: c.url,
    logo: abs('/assets/brand/logo-square.png'),
    image: abs('/assets/brand/og-default.jpg'),
    description: c.description,
    foundingDate: String(c.founded),
    email: c.email,
    telephone: c.phoneLandlineHref,
    ...(head ? { address: postal(head) } : {}),
    location: site.offices.map((o) => ({ '@type': 'Place', name: `${c.name} — ${o.city}`, address: postal(o) })),
    areaServed: { '@type': 'Country', name: 'India' },
    knowsAbout: [
      'Infrastructure transaction advisory',
      'Public-private partnership structuring',
      'Hybrid Annuity Model',
      'Bid process management',
      'Financial modelling',
      'Project finance and debt syndication',
      'Detailed project reports',
      'Independent engineer services',
    ],
    founder: site.leaders
      .filter((l) => l.role.toLowerCase().includes('co-founder'))
      .map((l) => ({ '@type': 'Person', name: l.name, jobTitle: l.role })),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function website(site: Site) {
  return { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: site.company.url, name: site.company.name, publisher: { '@id': ORG_ID }, inLanguage: 'en-IN' };
}

export function breadcrumbs(items: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.href) })),
  };
}

export function faqPage(faqs: Faq[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

export function service(opts: { name: string; description: string; path: string; serviceType?: string[] }) {
  return {
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    url: abs(opts.path),
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'India' },
    ...(opts.serviceType ? { serviceType: opts.serviceType } : {}),
  };
}

export function article(opts: { title: string; description: string; path: string; image: string; published: string }) {
  return {
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: abs(opts.path),
    mainEntityOfPage: abs(opts.path),
    image: abs(opts.image),
    datePublished: opts.published,
    dateModified: opts.published,
    inLanguage: 'en-IN',
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
  };
}

export function person(opts: { name: string; role: string; path: string; description: string; image?: string }) {
  return {
    '@type': 'Person',
    name: opts.name,
    jobTitle: opts.role,
    description: opts.description,
    url: abs(opts.path),
    worksFor: { '@id': ORG_ID },
    ...(opts.image ? { image: abs(opts.image) } : {}),
  };
}

export function itemList(items: { name: string; path: string }[]) {
  return { '@type': 'ItemList', itemListElement: items.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.name, url: abs(x.path) })) };
}
