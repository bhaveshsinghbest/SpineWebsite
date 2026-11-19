import type { Leader } from './types';
import { practices } from './practices';
import { sectors } from './sectors';
import { industries } from './industries';

// Facts below are taken from the legacy spineadvisory.com. Anything marked
// VERIFY must be confirmed by the firm before launch (see CONTENT-REVIEW.md).

export const company = {
  name: 'Spine Advisory',
  legalName: 'Spine Advisory Private Limited',
  tagline: 'Infrastructure, Transaction & Enterprise Advisory',
  description:
    'Spine Advisory is an Indian advisory firm, founded in 2010, with offices in Mumbai, New Delhi, Chennai and Bengaluru, providing transaction advisory, PPP structuring, investment banking, engineering and risk advisory to government authorities and infrastructure developers across India.',
  founded: 2010,
  url: 'https://spineadvisory.com',
  email: 'info@spineadvisory.com',
  phoneMobile: '+91 90154 35450',
  phoneMobileHref: '+919015435450',
  phoneLandline: '011-4505 3697',
  phoneLandlineHref: '+911145053697',
  // VERIFY and fill in before launch; empty entries are not rendered.
  social: {
    linkedin: '',
    x: '',
  },
  /** POST endpoint for the briefing form (Formspree, Web3Forms, a serverless function…).
   *  Leave empty to fall back to opening the visitor's mail client. */
  formEndpoint: '',
  /** Address that receives job applications. VERIFY: set a dedicated careers mailbox if one exists. */
  careersEmail: 'info@spineadvisory.com',
  /** POST endpoint that accepts multipart/form-data with a `cv` file (Formspree, Web3Forms paid plan,
   *  or a serverless function). It must re-validate every field and the file server-side.
   *  Leave empty to fall back to an email application with the CV attached manually. */
  careersEndpoint: '',
};

export interface Office {
  city: string;
  region: string;
  /** Street-level lines; omit until the firm confirms the full address. */
  lines?: string[];
  postalCode?: string;
  headOffice?: boolean;
}

// VERIFY: only the Delhi office has street-level detail (Hanuman Road, Connaught Place).
// Add building/floor for Delhi and full addresses for the other three once confirmed.
export const offices: Office[] = [
  { city: 'Mumbai', region: 'Maharashtra' },
  { city: 'New Delhi', region: 'Delhi', lines: ['Hanuman Road', 'Connaught Place'], postalCode: '110001', headOffice: true },
  { city: 'Chennai', region: 'Tamil Nadu' },
  { city: 'Bengaluru', region: 'Karnataka' },
];

export const headOffice = offices.find((o) => o.headOffice)!;

export function officeAddress(o: Office, sep = ', '): string {
  return [...(o.lines ?? []), o.postalCode ? `${o.city} – ${o.postalCode}` : o.city, 'India'].join(sep);
}

export function officeMapsUrl(o: Office): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([...(o.lines ?? []), o.city, o.postalCode].filter(Boolean).join(' '))}`;
}

/** "Mumbai · New Delhi · Chennai · Bengaluru" */
export const officeCities = offices.map((o) => o.city);

/** Headline figures. Only verifiable facts are live; the Stitch mock-up figures
 *  are kept commented out until the firm confirms them. */
export const stats = [
  { label: 'Established', value: '2010', unit: '', note: 'Founded in New Delhi by Chartered Accountants, MBAs and engineers' },
  { label: 'Practice Areas', value: String(practices.length), unit: '', note: 'Consulting, risk, investment banking, engineering and technology' },
  { label: 'Advisory Services', value: String(practices.reduce((n, p) => n + p.items.length, 0)), unit: '', note: 'From bid process management to construction supervision' },
  { label: 'Sectors & Industries', value: String(sectors.length + industries.length), unit: '+', note: 'Highways, rail, metro, ports, urban, manufacturing, real estate, logistics' },
  // VERIFY before enabling:
  // { label: 'Highways & Corridors', value: '50,000', unit: '+ KM', note: 'National & state highway concessions structured under HAM & BOT' },
  // { label: 'PPP Project Value', value: '1.8', prefix: '₹', unit: '+ L Cr', note: 'Facilitated via techno-economic valuation & capital syndication' },
  // { label: 'Geographic Footprint', value: '14', unit: '+ States', note: 'Active mandates across state PWDs, ULBs & PSUs' },
];

export const clients = [
  { short: 'AKASVA', name: 'Akasva Infrastructure (P) Ltd.' },
  { short: 'COASTAL', name: 'Coastal Projects Ltd.' },
  { short: 'GALFAR', name: 'Galfar Engineering & Contracting (India) Pvt. Ltd.' },
  { short: 'GRIL', name: 'G R Infraprojects Ltd.' },
  { short: 'RDS', name: 'RDS Project Ltd.' },
  { short: 'TRANSYS', name: 'Transys Consulting Pvt. Ltd.' },
  { short: 'UB INFRA', name: 'UB Infrastructure Ltd.' },
  { short: 'WELSPUN', name: 'Welspun Projects Ltd.' },
];

export const associates = [
  'M/s Arun Singh & Co.',
  'M/s Explico Consulting Pvt. Ltd.',
  'M/s S M Jain & Associates',
  'M/s Transys Consulting Pvt. Ltd.',
  'M/s Arora Jain & Associates',
  'M/s Meticulous Advisory Solutions Pvt. Ltd.',
];

/** Company Overview (About Us → Overview), as supplied by the firm. Only "Karney" was corrected to "Kearney". */
export const overview = [
  'Spine Advisory is a unique combination of synergistic skills set built into an organisational structure with highly experienced Professionals from different industries.',
  'Journey of the Spine Advisory started in the year 2010 as a Partnership Firm by a group of Experts consists of CAs, MBAs and Engineers who are dedicated to Advisory profession, leading professor, members having extensive exposure in Transaction Advisory, Infrastructure Advisory, Operational Consulting, Investment Banking, Risk management and experience of working in leading consultancy organizations like BIG4s, McKinsey, Kearney, BCG etc.',
  'Since inception Spine Advisory has maintained a steady track record with clients and successfully caters to their requirements in the best possible manner. We have developed strong Market Intelligence through our extensive professional network and multi sectorial working experience.',
  'Our core strength is the in-depth understanding, of the dynamics of business, operations, processes, accounting, transactions and necessary skills to blend practical business & commercial insights to identify effective solutions to all business problems.',
  'We provide specialized services in Project Advisory, Investment Banking, Infrastructure Business Advisory, Risk due diligence & management, buy & sell side Transaction and Tax Advisory in multi sectors such as Hospitals/ Health Care, Real Estate, Hotel/Hospitality, Staple Food Processing/Exporters, Manufacturing Units and Education Sector.',
];

export const mission = {
  statement: 'To give a Shape to our clients’ Dream',
  description:
    'We will serve leading-edge companies delivering superior value with the highest quality and confidentiality standards. We will strive to attract the best talent and to create an exciting and caring environment full of growth opportunities. We will govern ourselves through a set of strong values emphasizing integrity and teamwork. We will contribute actively to the local communities in which we operate.',
  objectives: [
    'Consistently Delivering Superior Value while Maintaining the Highest Quality and Confidentiality Standards.',
    'Be fully committed to our Clients and build enduring, trust-based relationships.',
    'Guarantee the highest standards of confidentiality to our Clients.',
    'Provide the highest quality in services and people all the time to all Clients.',
    'Help our Clients achieve significant value impact in terms of cost, time and quality.',
    'Attract, Develop and Retain Great Talent by Creating an Exciting Work culture.',
    'Demonstrate care and concern for every individual.',
    'Have all employees participate in the success of the company.',
    'Adhere to the highest ethical and professional standards.',
    'Contribute to the social development of the local communities.',
  ],
};

export const vision = {
  statement: 'We will be successful if our clients will be successful',
  points: [
    'We build our firm around that conviction.',
    'We believe you can’t do one without the other.',
    'We believe these two parts support each other and make our firm best service provider in industry.',
    'We maintain consistently high standards for service.',
    'We aspire to become the most trusted solutions provider to our customers by delivering consistently high quality, secure, and reliable services.',
    'We first focus on exploring and understanding our customers’ business objectives before proposing a solution.',
  ],
};

export const values = [
  { icon: 'verified_user', title: 'Integrity', text: 'Independent, conflict-free advice and strict confidentiality on every mandate, public or private.' },
  { icon: 'groups', title: 'Teamwork', text: 'Finance, engineering and legal-commercial specialists working as one bench on each engagement.' },
  { icon: 'insights', title: 'Rigour', text: 'Every recommendation is grounded in verified facts, transparent models and documented assumptions.' },
  { icon: 'handshake', title: 'Partnership', text: 'We stay through implementation, not just the report — until the outcome is delivered.' },
];

/** "Our Approaches" (About Us → Mission). `title` is the approved wording; `text` expands on it. */
export const approach = [
  { title: 'Obtaining in-depth understanding of the business', text: 'Study the client’s business, mandate and constraints in depth.' },
  { title: 'Collating all facts and getting them right', text: 'Establish the facts — data, contracts, site conditions and stakeholder positions.' },
  { title: 'Planning and partnering', text: 'Agree scope, governance and milestones with the client team.' },
  { title: 'Analyzing and diagnosing the problem', text: 'Identify the root causes behind cost, time, risk or revenue gaps.' },
  { title: 'Identifying practical solutions', text: 'Develop practical, bankable and compliant solutions.' },
  { title: 'Supporting and Leading', text: 'Support and, where needed, lead implementation on the ground.' },
  { title: 'Establishing a self-sustaining organization', text: 'Leave behind systems and capability so results endure.' },
];

/** Why clients and government organisations engage the firm (homepage). Grounded in the Overview and Mission. */
export const whyChoose = [
  { icon: 'groups', title: 'One multidisciplinary bench', text: 'Chartered Accountants, MBAs and engineers work on the same mandate, so finance, engineering and risk questions are answered together.' },
  { icon: 'account_tree', title: 'The full project lifecycle', text: 'From feasibility and structuring through bid process, financing and construction supervision — one accountable team.' },
  { icon: 'lock', title: 'Confidentiality first', text: 'The highest standards of confidentiality for public authorities, developers and investors alike.' },
  { icon: 'travel_explore', title: 'Market intelligence', text: 'A strong professional network and multi-sector experience built since 2010 inform every recommendation.' },
  { icon: 'gavel', title: 'Independent and ethical', text: 'Advice that adheres to the highest ethical and professional standards — defensible for authorities, bankable for lenders.' },
  { icon: 'handshake', title: 'Partner-led delivery', text: 'Clients work directly with the firm’s leadership from the first briefing to the final milestone.' },
];

// Team (About Us → Team). Names and titles are from spineadvisory.com/team. The legacy site has
// no bios or photos: these bios describe each role's remit and are DRAFTS for the
// individuals to review. Add headshots at public/images/team/<slug>.jpg and set `photo`.
export const leaders: Leader[] = [
  {
    slug: 'sanjeet-kumar',
    name: 'Sanjeet Kumar',
    role: 'Co-founder & Managing Director',
    photo: '/images/team/sanjeet-kumar.jpg',
    focus: ['Firm strategy & governance', 'Client leadership', 'Infrastructure transaction advisory'],
    bio: [
      'Sanjeet Kumar co-founded Spine Advisory in 2010 and, as Managing Director, leads the firm’s strategy, governance and senior client relationships.',
      'He oversees the firm’s infrastructure and transaction advisory mandates, bringing together its finance, engineering and risk practices so that clients — from public authorities to infrastructure developers — receive one integrated team from feasibility through financial close and implementation.',
    ],
  },
  {
    slug: 'sujeet-kumar',
    name: 'Sujeet Kumar',
    role: 'Co-founder & Chief Executive Officer',
    photo: '/images/team/sujeet-kumar.jpg',
    credentials: 'Formerly with Deloitte and Feedback Infra',
    focus: ['Transaction advisory & PPP structuring', 'Practice development', 'Delivery excellence'],
    bio: [
      'Sujeet Kumar is a co-founder of Spine Advisory and its Chief Executive Officer. Before founding the firm he worked with Deloitte and with Feedback Infra, one of India’s established infrastructure services companies.',
      'As CEO he is responsible for the firm’s advisory practices and engagement delivery, with a particular focus on infrastructure transaction advisory, project structuring and bid process management for public and private sector clients.',
    ],
  },
  {
    slug: 'sumit-chaturvedi',
    photo: '/images/team/sumit-chaturvedi.jpg',
    name: 'Sumit Chaturvedi',
    role: 'Chief Financial Officer',
    focus: ['Financial strategy & control', 'Financial modelling oversight', 'Regulatory compliance'],
    bio: [
      'Sumit Chaturvedi is Chief Financial Officer of Spine Advisory, responsible for the firm’s finance function, financial controls and statutory compliance.',
      'He also supports the investment banking and financial advisory practices, bringing financial discipline to project financing, valuation and debt syndication work for clients.',
    ],
  },
  {
    slug: 'lovely-singh',
    name: 'Lovely Singh',
    role: 'Director – Operations',
    photo: '/images/team/lovely-singh.jpg',
    focus: ['Engagement operations', 'Quality & process management', 'Client service'],
    bio: [
      'Lovely Singh is Director – Operations at Spine Advisory, leading the firm’s operational backbone across engagements.',
      'The role covers engagement planning, resourcing, quality and process management, ensuring the firm’s multidisciplinary teams deliver on time and to standard for every client.',
    ],
  },
];
