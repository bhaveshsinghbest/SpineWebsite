// Request validation for admin content. Text is cleaned (tags and control characters removed)
// because all content is rendered as plain text on the website.
import { z } from 'zod';
import { cleanText } from '../utils/text.ts';

export const text = (max: number, min = 1) => z.string().transform(cleanText).pipe(z.string().min(min, 'Required').max(max, `Up to ${max} characters`));
export const optText = (max: number) => z.string().transform(cleanText).pipe(z.string().max(max)).optional().nullable().transform((v) => v || null);
export const textList = (max = 2000) => z.array(text(max)).default([]);
export const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lower-case letters, numbers and hyphens').max(100);
export const icon = z.string().trim().regex(/^[a-z0-9_]+$/, 'Material Symbols icon name, e.g. account_balance').max(60);
export const banner = z.string().trim().regex(/^[a-z0-9-]+$/).max(60).optional().nullable().transform((v) => v || null);
export const urlPath = z.string().trim().max(300).regex(/^\/[^\s]*$/, 'Must start with /');
export const optImageUrl = z.string().trim().max(300).regex(/^(\/uploads\/|\/assets\/|https:\/\/)[^\s"'<>]*$/, 'Upload an image or use an https:// URL').optional().nullable().transform((v) => v || null);
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');
export const publish = z.enum(['draft', 'published']).default('published');
export const sortOrder = z.coerce.number().int().min(0).max(100_000).default(0);

export const faqInput = z.object({ question: text(300), answer: text(2000) });
export const sectionInput = z.object({ heading: text(200), body: textList(4000), bullets: textList(400) });

export const practiceInput = z.object({
  slug, title: text(120), icon, banner, metaDescription: text(200), summary: text(600), answer: text(2000),
  tags: textList(60), sortOrder, status: publish,
  items: z.array(z.object({ anchorId: slug, title: text(160), description: text(4000), deliverables: textList(200) })).default([]),
  faqs: z.array(faqInput).default([]),
});

export const sectorInput = z.object({
  kind: z.enum(['sector', 'industry', 'pillar']),
  slug, title: text(160), shortTitle: text(80), icon, tag: text(80), banner, metaDescription: text(200),
  summary: text(600), answer: text(2000), highlights: textList(300), sortOrder, status: publish,
  sections: z.array(sectionInput).default([]),
  faqs: z.array(faqInput).default([]),
  relatedPractices: z.array(slug).default([]),
});

export const teamInput = z.object({
  slug, name: text(120), role: text(160), photoUrl: optImageUrl, credentials: optText(200),
  focus: textList(200), bio: textList(3000), sortOrder, status: publish,
});

export const clientInput = z.object({ shortName: text(40), name: text(200), logoUrl: optImageUrl, sortOrder, status: publish });
export const associateInput = z.object({ name: text(200), sortOrder, status: publish });
export const officeInput = z.object({
  city: text(80), region: text(80), lines: textList(160), postalCode: optText(12), headOffice: z.boolean().default(false), sortOrder,
});

export const articleInput = z.object({
  slug, title: text(200), category: text(80), banner, publishedOn: isoDate, readingMinutes: z.coerce.number().int().min(1).max(120),
  metaDescription: text(200), summary: text(1000), takeaways: textList(500), status: publish.default('draft'),
  sections: z.array(sectionInput).default([]),
  faqs: z.array(faqInput).default([]),
});

export const jobInput = z.object({
  slug, title: text(160), department: text(80), location: text(120), experience: text(60),
  employmentType: text(40).default('Full-time'),
  summary: optText(600), qualifications: z.array(text(300)).min(1, 'Add at least one qualification'),
  responsibilities: z.array(text(300)).min(1, 'Add at least one responsibility'),
  postedOn: isoDate, closesOn: isoDate.optional().nullable().transform((v) => v || null),
  status: z.enum(['draft', 'open', 'closed']).default('draft'),
}).refine((j) => !j.closesOn || j.closesOn >= j.postedOn, { path: ['closesOn'], message: 'Closing date must be on or after the posting date' });

export const testimonialInput = z.object({
  quote: text(1500, 20), name: text(120), designation: text(160), organisation: text(200),
  consentOnFile: z.boolean().default(false), sortOrder: sortOrder.default(100), status: publish.default('draft'),
}).refine((t) => t.status === 'draft' || t.consentOnFile, { path: ['status'], message: 'A testimonial can be published only when client consent is on file' });

export const redirectInput = z.object({
  fromPath: urlPath, toPath: urlPath, statusCode: z.coerce.number().refine((n) => [301, 302, 307, 308].includes(n)).default(301),
}).refine((r) => r.fromPath.replace(/\/$/, '') !== r.toPath.split('#')[0].replace(/\/$/, ''), { path: ['toPath'], message: 'A redirect cannot point to itself' });

/** Optional numeric id from a select (empty means none). */
const optId = z.preprocess((v) => (v === '' || v === null || v === undefined ? null : Number(v)), z.number().int().positive().nullable());
const optDate = isoDate.optional().nullable().or(z.literal('')).transform((v) => v || null);
const IMAGE_URL = /^(\/uploads\/|\/assets\/|https:\/\/)[^\s"'<>]*$/;
const imageUrl = z.string().trim().max(300).regex(IMAGE_URL, 'Upload an image or use an https:// URL');

export const projectCategoryInput = z.object({ name: text(100), slug, sortOrder });

export const projectInput = z.object({
  slug, title: text(200), categoryId: optId, sectorId: optId,
  client: optText(200), location: optText(160), projectValue: optText(80),
  startedOn: optDate, completedOn: optDate,
  summary: text(600), description: textList(4000), highlights: textList(300),
  coverImageUrl: optImageUrl,
  status: z.enum(['upcoming', 'ongoing', 'completed', 'on_hold']).default('ongoing'),
  publishStatus: publish.default('draft'),
  featured: z.boolean().default(false), sortOrder,
  images: z.array(z.object({ url: imageUrl, caption: optText(200) })).max(40).default([]),
}).refine((p) => !p.startedOn || !p.completedOn || p.completedOn >= p.startedOn, { path: ['completedOn'], message: 'Completion date must be on or after the start date' });

export const announcementInput = z.object({
  slug, kind: z.enum(['announcement', 'news']).default('news'), title: text(200), summary: text(600), body: textList(6000),
  imageUrl: optImageUrl,
  publishAt: z.coerce.date({ error: 'Enter a valid date and time' }),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  showOnHomepage: z.boolean().default(true),
});

// ---------- Site content blocks (About Us, company details …) ----------
const stringBlock = z.array(text(4000));
const optStr = (max: number) => z.string().transform(cleanText).pipe(z.string().max(max)).default('');
const optImage = z.union([z.literal(''), imageUrl]).default('');
const socialUrl = z.union([z.url().max(300).regex(/^https:\/\//, 'Must start with https://'), z.literal('')]).default('');
const heading = z.object({ eyebrow: optStr(160), title: optStr(200), lead: optStr(600) });
export const HOME_SECTIONS = ['about', 'services', 'industries', 'sectors', 'why', 'approach', 'clients', 'projects', 'news', 'testimonials', 'team', 'insights', 'careers', 'consultation'] as const;
export const PAGE_KEYS = ['about', 'mission', 'vision', 'team', 'services', 'industries', 'sectors', 'pillars', 'projects', 'news', 'insights', 'clientele', 'association', 'testimonials', 'careers', 'contact', 'faq'] as const;
export const contentBlocks = {
  company: z.object({
    name: text(80), legalName: text(120), tagline: text(120), description: text(600), founded: z.coerce.number().int().min(1900).max(2100),
    url: z.url().max(120),
    email: z.email().max(160), careersEmail: z.email().max(160),
    phoneMobile: text(30), phoneMobileHref: z.string().trim().regex(/^\+[0-9]{8,15}$/, 'International format, e.g. +919015435450'),
    phoneLandline: text(30), phoneLandlineHref: z.string().trim().regex(/^\+[0-9]{8,15}$/, 'International format, e.g. +911145053697'),
    social: z.object({
      linkedin: socialUrl, x: socialUrl, facebook: socialUrl, instagram: socialUrl, youtube: socialUrl,
    }),
    /** Logos (uploaded images); empty uses the built-in logo files. */
    logoUrl: optImage, logoWhiteUrl: optImage,
  }),
  /** Homepage text, banner and promotional sections. Empty values fall back to the built-in wording. */
  home: z.object({
    heroEyebrow: optStr(160), heroTitle: optStr(200), heroLead: optStr(600), heroImage: optImage,
    heroPrimaryLabel: optStr(60), heroSecondaryLabel: optStr(60),
    promo: z.object({
      enabled: z.boolean().default(false), eyebrow: optStr(80), title: optStr(200), text: optStr(600),
      buttonLabel: optStr(60), buttonHref: z.string().trim().max(300).regex(/^(\/[^\s]*|https:\/\/[^\s"'<>]+)?$/, 'Use a path such as /contact or an https:// address').default(''),
    }).default({ enabled: false, eyebrow: '', title: '', text: '', buttonLabel: '', buttonHref: '' }),
    sections: z.partialRecord(z.enum(HOME_SECTIONS), heading).default({}),
  }),
  /** Footer text. */
  footer: z.object({ about: optStr(600), copyright: optStr(200), note: optStr(300) }),
  /** Options offered when editing job openings. */
  careerOptions: z.object({
    departments: z.array(text(80)).max(40), locations: z.array(text(120)).max(60),
    employmentTypes: z.array(text(40)).min(1, 'Add at least one employment type').max(20), experienceLevels: z.array(text(60)).max(40),
  }),
  /** Page banner headings (eyebrow, title, lead) for the main pages. Empty values use the built-in wording. */
  pages: z.partialRecord(z.enum(PAGE_KEYS), heading).default({}),
  overview: stringBlock,
  mission: z.object({ statement: text(200), description: text(2000), objectives: stringBlock }),
  vision: z.object({ statement: text(200), points: stringBlock }),
  values: z.array(z.object({ icon, title: text(80), text: text(400) })),
  approach: z.array(z.object({ title: text(120), text: text(400) })),
  whyChoose: z.array(z.object({ icon, title: text(80), text: text(400) })),
  stats: z.array(z.object({ label: text(60), value: text(40), unit: z.string().max(10).default(''), note: text(200) })),
} as const;
export type ContentKey = keyof typeof contentBlocks;
export const isContentKey = (k: string): k is ContentKey => k in contentBlocks;

// ---------- Lists ----------
const filterValue = z.string().trim().max(60).optional();
export const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).optional(),
  status: filterValue,
  kind: filterValue,
  publishStatus: filterValue,
  categoryId: filterValue,
  sectorId: filterValue,
  area: z.string().trim().max(160).optional(),
  job: z.coerce.number().int().positive().optional(),
  action: filterValue,
  entity: filterValue,
  /** Date range (inclusive), YYYY-MM-DD. */
  from: isoDate.optional(),
  to: isoDate.optional(),
  sort: z.string().trim().max(40).regex(/^[a-zA-Z]*$/).optional(),
  dir: z.enum(['asc', 'desc']).optional(),
});
export type ListQuery = z.infer<typeof listQuery>;
export const idParam = z.object({ id: z.coerce.number().int().positive() });
