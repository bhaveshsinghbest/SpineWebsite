// Built-in website wording. The Admin Panel (Website Content Management) can override any of it; an empty
// field means "use the built-in wording". The admin forms show these texts as placeholders.
import type { Heading } from './models';

export const HOME_DEFAULTS = {
  heroEyebrow: 'Infrastructure & transaction advisory since {founded}',
  heroTitle: 'Shaping India’s infrastructure — from first feasibility to financial close',
  heroLead: 'Spine Advisory brings Chartered Accountants, MBAs and engineers together to advise government authorities, developers and enterprises on transaction advisory, investment banking, engineering and risk — as one accountable team.',
  heroPrimaryLabel: 'Explore our services',
  heroSecondaryLabel: 'Schedule a Briefing',
};

export const HOME_SECTION_DEFAULTS: Record<string, Required<Heading> & { label: string }> = {
  about: { label: 'Who we are', eyebrow: 'Who we are', title: 'A synergistic bench of finance, engineering and strategy', lead: '' },
  services: { label: 'Services', eyebrow: 'Our services', title: 'Five practices, the full project lifecycle', lead: 'Bridging financial engineering, concession architecture, technical feasibility and statutory governance.' },
  industries: { label: 'Industries', eyebrow: 'Industries', title: 'Industry experience', lead: 'Feasibility, finance, controls and systems for promoters, investors and agencies in three capital-intensive industries.' },
  sectors: { label: 'Infrastructure sectors', eyebrow: 'Domain foundation since {founded}', title: 'Major infrastructure sectors', lead: 'From project conceptualisation to commercial operation date: integrated financial, commercial and engineering advisory across India’s foundational sectors.' },
  why: { label: 'Why choose Spine', eyebrow: 'Why Spine Advisory', title: 'Why government organisations and enterprises choose us', lead: 'Since {founded}, clients have relied on one team that understands the business, the engineering and the money.' },
  approach: { label: 'Our approach', eyebrow: 'Our approach', title: 'From understanding to lasting results', lead: 'A seven-step method applied to every mandate — so recommendations are grounded in fact and carried through to delivery.' },
  clients: { label: 'Clients', eyebrow: 'Trusted institutional relationships', title: 'Concessionaires, developers & conglomerates', lead: '' },
  projects: { label: 'Featured projects', eyebrow: 'Our projects', title: 'Selected mandates', lead: 'Projects where Spine Advisory structured, financed or helped deliver infrastructure and industry investments.' },
  news: { label: 'Announcements & news', eyebrow: 'Announcements & news', title: 'Latest from Spine Advisory', lead: '' },
  testimonials: { label: 'Testimonials', eyebrow: 'Testimonials', title: 'What our clients say', lead: '' },
  team: { label: 'Team', eyebrow: 'Our team', title: 'Partner-led on every mandate', lead: 'Clients work directly with the firm’s leadership from the first briefing to the final milestone.' },
  insights: { label: 'Insights', eyebrow: 'Insights & updates', title: 'Thought leadership & strategic briefs', lead: 'Practitioner perspectives on public policy, concession de-risking and capital-efficient delivery.' },
  careers: { label: 'Careers', eyebrow: 'Careers', title: 'Join a firm that gives shape to its clients’ dreams', lead: '' },
  consultation: { label: 'Briefing form', eyebrow: 'Confidentiality assured', title: 'Schedule a Partner-Level Strategic Briefing', lead: 'We consult directly with Principal Secretaries, board members, concessionaire managing directors and investment committees. Enquiries are handled under strict non-disclosure.' },
};

/** Page banners. Placeholders in the admin; the pages themselves hold the same wording. */
export const PAGE_DEFAULTS: Record<string, Required<Heading> & { label: string; path: string }> = {
  about: { label: 'About Us — Overview', path: '/about', eyebrow: 'Est. {founded} · {offices} offices across India', title: 'Company Overview', lead: 'A synergistic bench of Chartered Accountants, MBAs and engineers advising public authorities and enterprises across the full project lifecycle.' },
  mission: { label: 'About Us — Mission', path: '/about/mission', eyebrow: 'About Us · Mission', title: 'Our Mission', lead: '(the mission statement)' },
  vision: { label: 'About Us — Vision', path: '/about/vision', eyebrow: 'About Us · Vision', title: 'Our Vision', lead: '(the vision statement)' },
  team: { label: 'About Us — Team', path: '/about/team', eyebrow: 'About Us · Team', title: 'Our Team', lead: 'Every Spine Advisory mandate is led personally by a member of the leadership team, with direct access for clients throughout the engagement.' },
  services: { label: 'Services', path: '/services', eyebrow: 'Institutional scope', title: 'Our Services', lead: 'Bridging financial engineering, concession architecture, technical feasibility and statutory governance — under one accountable team.' },
  industries: { label: 'Industries', path: '/industries', eyebrow: 'Industries we serve', title: 'Industry Expertise', lead: 'Integrated financial, operational and engineering advisory for promoters, investors and public agencies in three industries where capital and execution decide outcomes.' },
  sectors: { label: 'Infrastructure sectors', path: '/sectors', eyebrow: 'Domain foundation since 2010', title: 'Core Infrastructure Sector Practices', lead: 'From project conceptualisation to commercial operation date, Spine Advisory delivers integrated financial, commercial and engineering advisory across India’s foundational sectors.' },
  pillars: { label: 'Strategic pillars', path: '/strategic-pillars', eyebrow: 'Frontier advisory', title: 'Strategic Practice Pillars for Viksit Bharat', lead: 'Aligning national industrial policy with private capital deployment across four transformative economic frontiers.' },
  projects: { label: 'Projects', path: '/projects', eyebrow: 'Our work', title: 'Projects', lead: 'Infrastructure and industry mandates Spine Advisory has structured, financed and helped deliver — from feasibility to commercial operation.' },
  news: { label: 'Announcements & News', path: '/news', eyebrow: 'Newsroom', title: 'Announcements & News', lead: 'Company announcements, appointments and news from Spine Advisory.' },
  insights: { label: 'Insights', path: '/insights', eyebrow: 'Spine policy research', title: 'Thought Leadership & Strategic Briefs', lead: 'Practitioner perspectives on public policy, concession de-risking and capital-efficient infrastructure delivery.' },
  clientele: { label: 'Clientele', path: '/clientele', eyebrow: 'Trusted institutional relationships', title: 'Clientele', lead: 'Infrastructure developers, EPC contractors and consulting firms who rely on Spine Advisory for transaction, financial and engineering advice.' },
  association: { label: 'Association', path: '/association', eyebrow: 'Partner with us', title: 'Association', lead: 'Great things in business are never done by one person. Spine Advisory works with a network of associate firms to bring specialist depth to every mandate.' },
  testimonials: { label: 'Testimonials', path: '/testimonials', eyebrow: 'In our clients’ words', title: 'Testimonials', lead: 'Feedback from the authorities, developers and enterprises we advise. Every testimonial is published with the client’s written approval.' },
  careers: { label: 'Career', path: '/careers', eyebrow: 'Careers at Spine Advisory', title: 'Build a career shaping India’s infrastructure', lead: 'We strive to attract the best talent and to create an exciting and caring environment full of growth opportunities.' },
  contact: { label: 'Contact Us', path: '/contact', eyebrow: 'Confidentiality assured', title: 'Schedule a Partner-Level Briefing', lead: 'We consult directly with Principal Secretaries, board members, concessionaire managing directors and investment committees. Enquiries are handled under strict non-disclosure.' },
  faq: { label: 'FAQs', path: '/faq', eyebrow: 'Knowledge base', title: 'Frequently Asked Questions', lead: 'Direct answers on infrastructure advisory, PPP structuring, project finance and engineering — and on how Spine Advisory works.' },
};

/** Replaces {founded} and {offices} tokens in editable text. */
export const fillTokens = (text: string, vars: { founded?: number | string; offices?: number }) =>
  text.replace(/\{founded\}/g, String(vars.founded ?? '')).replace(/\{offices\}/g, String(vars.offices ?? ''));

/** The non-empty override value, or the default. */
export const pick = (override: string | undefined | null, fallback: string) => (override && override.trim() ? override : fallback);
