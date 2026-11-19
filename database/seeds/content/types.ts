// Shared content shapes. Every page under src/pages renders from these,
// so adding a sector, practice or article is a data change, not a layout change.

/** Key of an image in src/assets/banners (filename without .jpg). Optional:
 *  pages without one fall back to the generated navy grid banner. */
export type BannerKey =
  | 'roads'
  | 'ports'
  | 'railways'
  | 'metro'
  | 'urban'
  | 'logistics'
  | 'semiconductor'
  | 'highway-mountains'
  | 'port-dusk';

export interface Faq {
  q: string;
  /** Plain text, 40–80 words, answers the question in the first sentence (AEO). */
  a: string;
}

export interface Section {
  heading: string;
  /** Paragraphs of plain text. */
  body: string[];
  bullets?: string[];
}

/** A core infrastructure sector or a frontier strategic pillar. */
export interface Sector {
  slug: string;
  title: string;
  shortTitle: string;
  /** Material Symbols icon name. */
  icon: string;
  /** Small caps tag shown on cards, e.g. "Sagarmala Initiative". */
  tag: string;
  banner?: BannerKey;
  /** <=155 chars, used for meta description. */
  metaDescription: string;
  /** One-sentence card summary. */
  summary: string;
  /** 2–3 sentence direct answer to "What does Spine Advisory do in <sector>?" (AEO lead). */
  answer: string;
  highlights: string[];
  sections: Section[];
  /** Practice slugs from src/data/practices.ts that apply to this sector. */
  relatedPractices: string[];
  faqs: Faq[];
}

export interface ServiceItem {
  /** Anchor id on the practice page; also the old WordPress slug, for redirects. */
  id: string;
  title: string;
  description: string;
  deliverables: string[];
}

/** One of the five practices: consulting, operation & risk, investment banking, engineering, IT. */
export interface Practice {
  slug: string;
  title: string;
  icon: string;
  banner?: BannerKey;
  metaDescription: string;
  summary: string;
  answer: string;
  tags: string[];
  items: ServiceItem[];
  faqs: Faq[];
}

export interface Article {
  slug: string;
  title: string;
  category: string;
  banner?: BannerKey;
  /** ISO date. */
  published: string;
  readingMinutes: number;
  metaDescription: string;
  summary: string;
  /** "Key takeaways" box at the top, 3–5 items (AEO). */
  takeaways: string[];
  sections: Section[];
  faqs: Faq[];
}

export interface Leader {
  slug: string;
  name: string;
  role: string;
  /** Path under /public, e.g. /images/team/sanjeet-kumar.jpg. Leave undefined until a real photo exists. */
  photo?: string;
  credentials?: string;
  focus: string[];
  bio: string[];
}
