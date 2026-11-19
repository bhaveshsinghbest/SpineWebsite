// Shapes returned by the public REST API (backend/src/services/public.service.ts).

export interface Faq { q: string; a: string }
export interface Section { heading: string; body: string[]; bullets?: string[] }
export type SectorKind = 'sector' | 'industry' | 'pillar';

export interface Sector {
  kind: SectorKind;
  slug: string;
  title: string;
  shortTitle: string;
  icon: string;
  tag: string;
  banner?: string;
  metaDescription: string;
  summary: string;
  answer: string;
  highlights: string[];
  sections: Section[];
  relatedPractices: string[];
  faqs: Faq[];
}

export interface ServiceItem { id: string; title: string; description: string; deliverables: string[] }

export interface Practice {
  slug: string;
  title: string;
  icon: string;
  banner?: string;
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
  banner?: string;
  published: string;
  readingMinutes: number;
  metaDescription: string;
  summary: string;
  takeaways: string[];
  sections: Section[];
  faqs: Faq[];
}

export interface Leader { slug: string; name: string; role: string; photo?: string; credentials?: string; focus: string[]; bio: string[] }
export interface Office { city: string; region: string; lines: string[]; postalCode: string | null; headOffice: boolean }
export interface Stat { label: string; value: string; unit: string; note: string }
export interface IconCard { icon: string; title: string; text: string }

export interface Company {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  founded: number;
  url: string;
  email: string;
  careersEmail: string;
  phoneMobile: string;
  phoneMobileHref: string;
  phoneLandline: string;
  phoneLandlineHref: string;
  social: { linkedin: string; x: string; facebook?: string; instagram?: string; youtube?: string };
  /** Uploaded logos (Website Settings); empty means the built-in logo files. */
  logoUrl?: string;
  logoWhiteUrl?: string;
}

/** Editable heading (eyebrow, title, lead); empty values fall back to the built-in wording. */
export interface Heading { eyebrow?: string; title?: string; lead?: string }

export interface HomeContent {
  heroEyebrow?: string;
  heroTitle?: string;
  heroLead?: string;
  heroImage?: string;
  heroPrimaryLabel?: string;
  heroSecondaryLabel?: string;
  promo?: { enabled: boolean; eyebrow?: string; title?: string; text?: string; buttonLabel?: string; buttonHref?: string };
  sections?: Partial<Record<string, Heading>>;
}

export interface FooterContent { about?: string; copyright?: string; note?: string }

export interface NavPractice { slug: string; title: string; icon: string; itemCount: number }
export interface NavSector { kind: SectorKind; slug: string; title: string; shortTitle: string; icon: string; tag: string }

export interface Site {
  company: Company;
  home: HomeContent;
  footer: FooterContent;
  pages: Partial<Record<string, Heading>>;
  offices: Office[];
  overview: string[];
  mission: { statement: string; description: string; objectives: string[] };
  vision: { statement: string; points: string[] };
  values: IconCard[];
  approach: { title: string; text: string }[];
  whyChoose: IconCard[];
  stats: Stat[];
  leaders: Leader[];
  clients: { short: string; name: string; logoUrl: string | null }[];
  associates: string[];
  navigation: { practices: NavPractice[]; industries: NavSector[]; sectors: NavSector[]; pillars: NavSector[] };
  icons: string[];
}

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  experience: string;
  employmentType: string;
  summary?: string;
  qualifications: string[];
  responsibilities: string[];
  posted: string;
  closes?: string;
}

export interface Testimonial { quote: string; name: string; designation: string; organisation: string }
export interface FaqGroup { title: string; href: string; faqs: Faq[] }
export interface Paged<T> { data: T[]; meta: { page: number; pageSize: number; total: number; pages: number; categories?: string[] } }
export interface Crumb { name: string; href: string }

export type ProjectStatus = 'upcoming' | 'ongoing' | 'completed' | 'on_hold';
export interface Project {
  slug: string;
  title: string;
  client?: string;
  location?: string;
  value?: string;
  startedOn?: string;
  completedOn?: string;
  summary: string;
  description: string[];
  highlights: string[];
  coverImageUrl?: string;
  status: ProjectStatus;
  featured: boolean;
  category?: { name: string; slug: string };
  sector?: { title: string; slug: string; href: string };
  images: { url: string; caption?: string }[];
}
export interface ProjectList { data: Project[]; categories: { name: string; slug: string }[] }

export interface Announcement {
  slug: string;
  kind: 'announcement' | 'news';
  title: string;
  summary: string;
  imageUrl?: string;
  publishedAt: string;
  body?: string[];
}
