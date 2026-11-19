// Admin-managed content types: how each is listed and edited. Mirrors backend/src/services/resources.ts.
import { BANNER_KEYS } from '../core/banners';
import { HOME_DEFAULTS, HOME_SECTION_DEFAULTS, PAGE_DEFAULTS } from '../core/content-defaults';
import type { Permission } from './auth.service';
import type { Field, Option } from './form-engine';
import type { LookupKey } from './lookups.service';

export interface Column {
  key: string;
  label: string;
  kind?: 'status' | 'date' | 'datetime' | 'bool' | 'count';
  /** Sort key accepted by the API (?sort=). */
  sort?: string;
  /** Computed cell value (defaults to row[key]). */
  value?: (row: Record<string, any>) => unknown;
}
export interface QuickAction { label: string; icon: string; status: string; when: (row: Record<string, any>) => boolean; confirm?: string; danger?: boolean }
export interface ListFilter { key: string; label: string; options?: Option[]; optionsFrom?: LookupKey }
export interface ResourceConfig {
  name: string;
  label: string;
  singular: string;
  permission: Permission;
  icon: string;
  description: string;
  columns: Column[];
  fields: Field[];
  /** Status values offered as a list filter (query key `status`). */
  statuses?: Option[];
  /** Further select filters. */
  filters?: ListFilter[];
  /** Label of the date-range filter (the API filters the resource's date column). */
  dateFilter?: string;
  /** Fixed filter tabs (e.g. sector kind). */
  tabs?: { key: string; options: Option[] };
  /** Field the slug is generated from when creating. */
  slugFrom?: string;
  /** Public URL of an item, for "View on site". */
  publicUrl?: (row: Record<string, any>) => string | null;
  defaults?: Record<string, unknown> | (() => Record<string, unknown>);
  /** One-click status changes in the list (PATCH /:id/status). */
  quickActions?: QuickAction[];
  /** Lookup lists to refresh after a save or delete. */
  invalidates?: LookupKey[];
  /** Extra links per row. */
  rowLinks?: { label: string; icon: string; link: (row: Record<string, any>) => { path: string; query?: Record<string, unknown> } }[];
}

const published: Option[] = [{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }];
const banners: Option[] = BANNER_KEYS.map((k) => ({ value: k, label: k }));
const status: Field = { key: 'status', label: 'Status', type: 'select', options: published, required: true, hint: 'Drafts are hidden from the website.' };
const sortOrder: Field = { key: 'sortOrder', label: 'Display order', type: 'number', min: 0, hint: 'Lower numbers appear first.' };
const publishActions = (field = 'status'): QuickAction[] => [
  { label: 'Publish', icon: 'publish', status: 'published', when: (r) => r[field] !== 'published' },
  { label: 'Unpublish', icon: 'unpublished', status: 'draft', when: (r) => r[field] === 'published', confirm: 'It will be hidden from the website until it is published again.' },
];
const faqs: Field = {
  key: 'faqs', label: 'FAQs', type: 'objects', itemLabel: 'FAQ',
  hint: 'Shown at the bottom of the page and marked up for search engines. Answer the question in the first sentence.',
  fields: [{ key: 'question', label: 'Question', type: 'text', required: true, max: 300, wide: true }, { key: 'answer', label: 'Answer', type: 'textarea', rows: 4, required: true, max: 2000 }],
};
const sections: Field = {
  key: 'sections', label: 'Page sections', type: 'objects', itemLabel: 'section',
  fields: [
    { key: 'heading', label: 'Heading', type: 'text', required: true, max: 200, wide: true },
    { key: 'body', label: 'Paragraphs', type: 'list', itemLabel: 'paragraph', multiline: true },
    { key: 'bullets', label: 'Bullet points', type: 'list', itemLabel: 'bullet' },
  ],
};
const seo = (max = 200): Field => ({ key: 'metaDescription', label: 'Meta description', type: 'textarea', rows: 2, required: true, max, hint: 'Shown in search results; aim for 140–155 characters.' });
const now = () => new Date().toISOString();
const isScheduled = (r: Record<string, any>) => r['status'] === 'published' && new Date(r['publishAt']).getTime() > Date.now();

export const PROJECT_STATUSES: Option[] = [
  { value: 'upcoming', label: 'Upcoming' }, { value: 'ongoing', label: 'Ongoing' }, { value: 'completed', label: 'Completed' }, { value: 'on_hold', label: 'On hold' },
];

export const RESOURCES: ResourceConfig[] = [
  {
    name: 'practices', label: 'Services', singular: 'service practice', permission: 'content', icon: 'handshake',
    description: 'The service practices and the services listed under each.',
    columns: [{ key: 'title', label: 'Practice', sort: 'title' }, { key: 'slug', label: 'URL slug', sort: 'slug' }, { key: 'sortOrder', label: 'Order', sort: 'sortOrder' }, { key: 'status', label: 'Status', kind: 'status', sort: 'status' }],
    statuses: published, slugFrom: 'title', defaults: { status: 'published', sortOrder: 0 }, quickActions: publishActions(), invalidates: ['practices'],
    publicUrl: (r) => (r['status'] === 'published' ? `/services/${r['slug']}/` : null),
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, max: 120 },
      { key: 'slug', label: 'URL slug', type: 'slug', required: true, max: 100, hint: '/services/<slug>/' },
      { key: 'icon', label: 'Icon', type: 'icon', required: true, hint: 'Material Symbols name, e.g. account_balance' },
      { key: 'banner', label: 'Banner image', type: 'select', options: banners },
      status, sortOrder,
      seo(),
      { key: 'summary', label: 'Card summary', type: 'textarea', rows: 2, required: true, max: 600 },
      { key: 'answer', label: '“In brief” answer', type: 'textarea', rows: 4, required: true, max: 2000 },
      { key: 'tags', label: 'Tags', type: 'list', itemLabel: 'tag' },
      {
        key: 'items', label: 'Services', type: 'objects', itemLabel: 'service', summaryKey: 'title',
        fields: [
          { key: 'title', label: 'Title', type: 'text', required: true, max: 160 },
          { key: 'anchorId', label: 'Anchor id', type: 'slug', required: true, hint: 'Used in links: /services/<practice>/#<anchor>' },
          { key: 'description', label: 'Description', type: 'textarea', rows: 4, required: true, max: 4000 },
          { key: 'deliverables', label: 'Key deliverables', type: 'list', itemLabel: 'deliverable' },
        ],
      },
      faqs,
    ],
  },
  {
    name: 'sectors', label: 'Industries & Sectors', singular: 'page', permission: 'content', icon: 'factory',
    description: 'Industries, infrastructure sectors and strategic pillars.',
    columns: [{ key: 'title', label: 'Title', sort: 'title' }, { key: 'kind', label: 'Type' }, { key: 'slug', label: 'URL slug', sort: 'slug' }, { key: 'sortOrder', label: 'Order', sort: 'sortOrder' }, { key: 'status', label: 'Status', kind: 'status', sort: 'status' }],
    statuses: published, slugFrom: 'title', quickActions: publishActions(), invalidates: ['sectors'],
    tabs: { key: 'kind', options: [{ value: 'industry', label: 'Industries' }, { value: 'sector', label: 'Infrastructure sectors' }, { value: 'pillar', label: 'Strategic pillars' }] },
    defaults: { status: 'published', sortOrder: 0, kind: 'industry' },
    publicUrl: (r) => (r['status'] === 'published' ? `/${({ sector: 'sectors', industry: 'industries', pillar: 'strategic-pillars' } as Record<string, string>)[r['kind']]}/${r['slug']}/` : null),
    fields: [
      { key: 'kind', label: 'Type', type: 'select', required: true, options: [{ value: 'industry', label: 'Industry' }, { value: 'sector', label: 'Infrastructure sector' }, { value: 'pillar', label: 'Strategic pillar' }] },
      { key: 'title', label: 'Title', type: 'text', required: true, max: 160 },
      { key: 'shortTitle', label: 'Short title (menus, cards)', type: 'text', required: true, max: 80 },
      { key: 'slug', label: 'URL slug', type: 'slug', required: true, max: 100 },
      { key: 'tag', label: 'Tag', type: 'text', required: true, max: 80, hint: 'Small label on cards, e.g. "Supply Chain Hubs"' },
      { key: 'icon', label: 'Icon', type: 'icon', required: true },
      { key: 'banner', label: 'Banner image', type: 'select', options: banners },
      status, sortOrder,
      seo(),
      { key: 'summary', label: 'Card summary', type: 'textarea', rows: 2, required: true, max: 600 },
      { key: 'answer', label: '“In brief” answer', type: 'textarea', rows: 4, required: true, max: 2000 },
      { key: 'highlights', label: 'Advisory highlights', type: 'list', itemLabel: 'highlight' },
      sections,
      { key: 'relatedPractices', label: 'Services applied', type: 'multiselect', optionsFrom: 'practices' },
      faqs,
    ],
  },
  {
    name: 'team', label: 'Team', singular: 'team member', permission: 'content', icon: 'groups',
    description: 'Leadership profiles shown on About Us → Team.',
    columns: [{ key: 'name', label: 'Name', sort: 'name' }, { key: 'role', label: 'Designation', sort: 'role' }, { key: 'sortOrder', label: 'Order', sort: 'sortOrder' }, { key: 'status', label: 'Status', kind: 'status', sort: 'status' }],
    statuses: published, slugFrom: 'name', defaults: { status: 'published', sortOrder: 0 }, quickActions: publishActions(),
    publicUrl: (r) => (r['status'] === 'published' ? `/about/team/${r['slug']}/` : null),
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, max: 120 },
      { key: 'slug', label: 'URL slug', type: 'slug', required: true, max: 100 },
      { key: 'role', label: 'Designation', type: 'text', required: true, max: 160 },
      { key: 'credentials', label: 'Credentials line', type: 'text', max: 200 },
      { key: 'photoUrl', label: 'Photo (4:5 portrait)', type: 'image' },
      status, sortOrder,
      { key: 'focus', label: 'Areas of focus', type: 'list', itemLabel: 'area' },
      { key: 'bio', label: 'Biography', type: 'list', itemLabel: 'paragraph', multiline: true },
    ],
  },
  {
    name: 'clients', label: 'Clients', singular: 'client', permission: 'content', icon: 'workspace_premium',
    description: 'Organisations shown on Clientele and the homepage.',
    columns: [{ key: 'name', label: 'Name', sort: 'name' }, { key: 'shortName', label: 'Wordmark', sort: 'shortName' }, { key: 'sortOrder', label: 'Order', sort: 'sortOrder' }, { key: 'status', label: 'Status', kind: 'status', sort: 'status' }],
    statuses: published, defaults: { status: 'published', sortOrder: 0 }, quickActions: publishActions(),
    fields: [
      { key: 'name', label: 'Full name', type: 'text', required: true, max: 200 },
      { key: 'shortName', label: 'Wordmark (short name)', type: 'text', required: true, max: 40 },
      { key: 'logoUrl', label: 'Logo (only with permission to use it)', type: 'image' },
      status, sortOrder,
    ],
  },
  {
    name: 'associates', label: 'Associates', singular: 'associate firm', permission: 'content', icon: 'hub',
    description: 'Associate firms shown on the Association page.',
    columns: [{ key: 'name', label: 'Name', sort: 'name' }, { key: 'sortOrder', label: 'Order', sort: 'sortOrder' }, { key: 'status', label: 'Status', kind: 'status', sort: 'status' }],
    statuses: published, defaults: { status: 'published', sortOrder: 0 }, quickActions: publishActions(),
    fields: [{ key: 'name', label: 'Firm name', type: 'text', required: true, max: 200, wide: true }, status, sortOrder],
  },
  {
    name: 'offices', label: 'Offices', singular: 'office', permission: 'settings', icon: 'location_on',
    description: 'Company addresses shown in the footer and on Contact Us.',
    columns: [{ key: 'city', label: 'City', sort: 'city' }, { key: 'region', label: 'State', sort: 'region' }, { key: 'headOffice', label: 'Head office', kind: 'bool', sort: 'headOffice' }, { key: 'sortOrder', label: 'Order', sort: 'sortOrder' }],
    defaults: { sortOrder: 0, headOffice: false },
    fields: [
      { key: 'city', label: 'City', type: 'text', required: true, max: 80 },
      { key: 'region', label: 'State', type: 'text', required: true, max: 80 },
      { key: 'postalCode', label: 'PIN code', type: 'text', max: 12 },
      { key: 'headOffice', label: 'Head office', type: 'boolean', hint: 'Only one office can be the head office.' },
      sortOrder,
      { key: 'lines', label: 'Address lines', type: 'list', itemLabel: 'line', hint: 'Leave empty to show only the city and state.' },
    ],
  },
  {
    name: 'articles', label: 'Insights', singular: 'article', permission: 'content', icon: 'description',
    description: 'Policy briefs and thought leadership.',
    columns: [{ key: 'title', label: 'Title', sort: 'title' }, { key: 'category', label: 'Category', sort: 'category' }, { key: 'publishedOn', label: 'Date', kind: 'date', sort: 'publishedOn' }, { key: 'status', label: 'Status', kind: 'status', sort: 'status' }],
    statuses: published, slugFrom: 'title', defaults: { status: 'draft', readingMinutes: 5 }, quickActions: publishActions(), dateFilter: 'Publication date',
    publicUrl: (r) => (r['status'] === 'published' ? `/insights/${r['slug']}/` : null),
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, max: 200, wide: true },
      { key: 'slug', label: 'URL slug', type: 'slug', required: true, max: 100 },
      { key: 'category', label: 'Category', type: 'text', required: true, max: 80 },
      { key: 'publishedOn', label: 'Publication date', type: 'date', required: true },
      { key: 'readingMinutes', label: 'Reading time (minutes)', type: 'number', min: 1, maxValue: 120, required: true },
      { key: 'banner', label: 'Banner image', type: 'select', options: banners },
      status,
      seo(),
      { key: 'summary', label: 'Summary', type: 'textarea', rows: 3, required: true, max: 1000 },
      { key: 'takeaways', label: 'Key takeaways', type: 'list', itemLabel: 'takeaway', multiline: true },
      sections,
      faqs,
    ],
  },
  {
    name: 'jobs', label: 'Job openings', singular: 'job opening', permission: 'jobs', icon: 'work',
    description: 'Open positions appear automatically in the Careers section; drafts, closed and expired openings are hidden.',
    columns: [
      { key: 'title', label: 'Designation', sort: 'title' }, { key: 'department', label: 'Category', sort: 'department' }, { key: 'location', label: 'Location', sort: 'location' },
      { key: 'postedOn', label: 'Posted', kind: 'date', sort: 'postedOn' }, { key: 'closesOn', label: 'Closes', kind: 'date', sort: 'closesOn' },
      { key: 'applications', label: 'Applications', kind: 'count' }, { key: 'status', label: 'Status', kind: 'status', sort: 'status' },
    ],
    statuses: [{ value: 'open', label: 'Open (published)' }, { value: 'draft', label: 'Draft' }, { value: 'closed', label: 'Closed' }],
    filters: [{ key: 'department', label: 'All categories', optionsFrom: 'departments' }, { key: 'employmentType', label: 'All employment types', optionsFrom: 'employmentTypes' }],
    dateFilter: 'Posted',
    slugFrom: 'title', defaults: () => ({ status: 'draft', employmentType: 'Full-time', postedOn: new Date().toISOString().slice(0, 10) }),
    quickActions: [
      { label: 'Publish', icon: 'publish', status: 'open', when: (r) => r['status'] !== 'open' },
      { label: 'Unpublish', icon: 'unpublished', status: 'draft', when: (r) => r['status'] === 'open', confirm: 'The opening will be hidden from the Careers page.' },
      { label: 'Close', icon: 'block', status: 'closed', when: (r) => r['status'] !== 'closed', confirm: 'Close this vacancy? It will be hidden from the Careers page; existing applications are kept.' },
    ],
    rowLinks: [{ label: 'View applications', icon: 'badge', link: (r) => ({ path: '/admin/careers/applications', query: { job: r['id'] } }) }],
    publicUrl: (r) => (r['status'] === 'open' ? `/careers/#${r['slug']}` : null),
    fields: [
      { key: 'title', label: 'Designation', type: 'text', required: true, max: 160, wide: true },
      { key: 'slug', label: 'Reference (slug)', type: 'slug', required: true, max: 100 },
      { key: 'department', label: 'Job category', type: 'select', required: true, optionsFrom: 'departments', hint: 'Manage the list in Career Management → Settings.' },
      { key: 'location', label: 'Location', type: 'text', required: true, max: 120, suggestFrom: 'locations' },
      { key: 'experience', label: 'Experience required', type: 'text', required: true, max: 60, suggestFrom: 'experienceLevels', hint: 'e.g. 2–4 years' },
      { key: 'employmentType', label: 'Employment type', type: 'select', required: true, optionsFrom: 'employmentTypes' },
      { key: 'status', label: 'Status', type: 'select', required: true, options: [{ value: 'draft', label: 'Draft (hidden)' }, { value: 'open', label: 'Open (published)' }, { value: 'closed', label: 'Closed (hidden)' }] },
      { key: 'postedOn', label: 'Posted on', type: 'date', required: true },
      { key: 'closesOn', label: 'Applications close on', type: 'date', hint: 'After this date the opening is hidden automatically.' },
      { key: 'summary', label: 'One-line summary', type: 'textarea', rows: 2, max: 600 },
      { key: 'qualifications', label: 'Requirements / qualifications', type: 'list', itemLabel: 'qualification' },
      { key: 'responsibilities', label: 'Job description / responsibilities', type: 'list', itemLabel: 'responsibility' },
    ],
  },
  {
    name: 'testimonials', label: 'Testimonials', singular: 'testimonial', permission: 'content', icon: 'format_quote',
    description: 'Published only with the client’s written approval of the wording and attribution.',
    columns: [{ key: 'name', label: 'Client', sort: 'name' }, { key: 'organisation', label: 'Organisation', sort: 'organisation' }, { key: 'consentOnFile', label: 'Consent', kind: 'bool' }, { key: 'status', label: 'Status', kind: 'status', sort: 'status' }],
    statuses: published, defaults: { status: 'draft', sortOrder: 100, consentOnFile: false }, quickActions: publishActions(),
    fields: [
      { key: 'quote', label: 'Quote (approved wording)', type: 'textarea', rows: 4, required: true, max: 1500 },
      { key: 'name', label: 'Client name', type: 'text', required: true, max: 120 },
      { key: 'designation', label: 'Designation', type: 'text', required: true, max: 160 },
      { key: 'organisation', label: 'Organisation', type: 'text', required: true, max: 200 },
      { key: 'consentOnFile', label: 'Written client consent on file', type: 'boolean', hint: 'Required before the testimonial can be published.' },
      status, sortOrder,
    ],
  },
  {
    name: 'redirects', label: 'Redirects', singular: 'redirect', permission: 'redirects', icon: 'link',
    description: 'Old URLs that forward to current pages (301 = permanent).',
    columns: [{ key: 'fromPath', label: 'From', sort: 'fromPath' }, { key: 'toPath', label: 'To', sort: 'toPath' }, { key: 'statusCode', label: 'Type', sort: 'statusCode' }],
    defaults: { statusCode: 301 },
    fields: [
      { key: 'fromPath', label: 'Old path', type: 'path', required: true, max: 300, hint: 'e.g. /old-page' },
      { key: 'toPath', label: 'New path', type: 'path', required: true, max: 300, hint: 'e.g. /services/consulting/#pmc' },
      { key: 'statusCode', label: 'Type', type: 'select', required: true, options: [{ value: 301, label: '301 Permanent' }, { value: 302, label: '302 Temporary' }] },
    ],
  },
  {
    name: 'projects', label: 'Projects', singular: 'project', permission: 'projects', icon: 'apartment',
    description: 'Projects and project details shown in the public Projects section once published.',
    columns: [
      { key: 'title', label: 'Project', sort: 'title' }, { key: 'categoryName', label: 'Category' }, { key: 'client', label: 'Client', sort: 'client' },
      { key: 'status', label: 'Project status', kind: 'status', sort: 'status' }, { key: 'publishStatus', label: 'Website', kind: 'status', sort: 'publishStatus' },
      { key: 'updatedAt', label: 'Updated', kind: 'date', sort: 'updatedAt' },
    ],
    filters: [
      { key: 'status', label: 'All project statuses', options: PROJECT_STATUSES },
      { key: 'publishStatus', label: 'Published & drafts', options: published },
      { key: 'categoryId', label: 'All categories', optionsFrom: 'projectCategories' },
      { key: 'sectorId', label: 'All sectors', optionsFrom: 'sectors' },
    ],
    slugFrom: 'title', defaults: { status: 'ongoing', publishStatus: 'draft', featured: false, sortOrder: 0 },
    quickActions: publishActions('publishStatus'),
    publicUrl: (r) => (r['publishStatus'] === 'published' ? `/projects/${r['slug']}/` : null),
    fields: [
      { key: 'title', label: 'Project title', type: 'text', required: true, max: 200, wide: true },
      { key: 'slug', label: 'URL slug', type: 'slug', required: true, max: 100, hint: '/projects/<slug>/' },
      { key: 'client', label: 'Client', type: 'text', max: 200 },
      { key: 'categoryId', label: 'Category', type: 'select', optionsFrom: 'projectCategories', hint: 'Manage categories under Project Management → Categories.' },
      { key: 'sectorId', label: 'Sector / industry', type: 'select', optionsFrom: 'sectors' },
      { key: 'location', label: 'Location', type: 'text', max: 160 },
      { key: 'projectValue', label: 'Project value / size', type: 'text', max: 80, hint: 'e.g. ₹1,250 crore · 120 km' },
      { key: 'startedOn', label: 'Start date', type: 'date' },
      { key: 'completedOn', label: 'Completion date', type: 'date' },
      { key: 'status', label: 'Project status', type: 'select', required: true, options: PROJECT_STATUSES },
      { key: 'publishStatus', label: 'Website', type: 'select', required: true, options: published, hint: 'Drafts are hidden from the website.' },
      { key: 'featured', label: 'Feature on the homepage', type: 'boolean' },
      sortOrder,
      { key: 'summary', label: 'Short description', type: 'textarea', rows: 3, required: true, max: 600 },
      { key: 'description', label: 'Description', type: 'list', itemLabel: 'paragraph', multiline: true },
      { key: 'highlights', label: 'Key details', type: 'list', itemLabel: 'detail', hint: 'Short facts shown as a checklist, e.g. "120 km four-lane highway".' },
      { key: 'coverImageUrl', label: 'Cover image', type: 'image' },
      {
        key: 'images', label: 'Project images', type: 'objects', itemLabel: 'image', summaryKey: 'caption',
        hint: 'Gallery on the project page. Upload, replace, reorder or delete images; changes apply when you save.',
        fields: [{ key: 'url', label: 'Image', type: 'image', required: true }, { key: 'caption', label: 'Caption', type: 'text', max: 200, wide: true }],
      },
    ],
  },
  {
    name: 'project-categories', label: 'Project categories', singular: 'category', permission: 'projects', icon: 'category',
    description: 'Categories used to group and filter projects.',
    columns: [{ key: 'name', label: 'Category', sort: 'name' }, { key: 'slug', label: 'Slug', sort: 'slug' }, { key: 'projects', label: 'Projects', kind: 'count' }, { key: 'sortOrder', label: 'Order', sort: 'sortOrder' }],
    slugFrom: 'name', defaults: { sortOrder: 0 }, invalidates: ['projectCategories'],
    fields: [{ key: 'name', label: 'Name', type: 'text', required: true, max: 100 }, { key: 'slug', label: 'Slug', type: 'slug', required: true, max: 100 }, sortOrder],
  },
  {
    name: 'announcements', label: 'Announcements & News', singular: 'announcement', permission: 'announcements', icon: 'campaign',
    description: 'Published items appear on the News page (and the homepage when chosen). A future publication time schedules the item.',
    columns: [
      { key: 'title', label: 'Title', sort: 'title' }, { key: 'kind', label: 'Type', sort: 'kind' }, { key: 'publishAt', label: 'Publication', kind: 'datetime', sort: 'publishAt' },
      { key: 'status', label: 'Status', kind: 'status', sort: 'status', value: (r) => (isScheduled(r) ? 'scheduled' : r['status']) },
    ],
    statuses: [{ value: 'published', label: 'Published / scheduled' }, { value: 'draft', label: 'Draft' }, { value: 'archived', label: 'Archived' }],
    filters: [{ key: 'kind', label: 'All types', options: [{ value: 'news', label: 'News' }, { value: 'announcement', label: 'Announcement' }] }],
    dateFilter: 'Publication date',
    slugFrom: 'title', defaults: () => ({ kind: 'news', status: 'draft', showOnHomepage: true, publishAt: now() }),
    quickActions: [
      { label: 'Publish', icon: 'publish', status: 'published', when: (r) => r['status'] !== 'published' },
      { label: 'Unpublish', icon: 'unpublished', status: 'draft', when: (r) => r['status'] === 'published', confirm: 'It will be hidden from the website.' },
      { label: 'Archive', icon: 'archive', status: 'archived', when: (r) => r['status'] !== 'archived', confirm: 'Archived items are hidden from the website but kept here.' },
    ],
    publicUrl: (r) => (r['status'] === 'published' && !isScheduled(r) ? `/news/${r['slug']}/` : null),
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, max: 200, wide: true },
      { key: 'slug', label: 'URL slug', type: 'slug', required: true, max: 100, hint: '/news/<slug>/' },
      { key: 'kind', label: 'Type', type: 'select', required: true, options: [{ value: 'news', label: 'News' }, { value: 'announcement', label: 'Announcement' }] },
      { key: 'publishAt', label: 'Publication date and time', type: 'datetime', required: true, hint: 'A future time schedules the item: it appears automatically when due.' },
      { key: 'status', label: 'Status', type: 'select', required: true, options: [{ value: 'draft', label: 'Draft (hidden)' }, { value: 'published', label: 'Published' }, { value: 'archived', label: 'Archived (hidden)' }] },
      { key: 'showOnHomepage', label: 'Show on the homepage', type: 'boolean', hint: 'The latest three appear in the homepage’s news section.' },
      { key: 'summary', label: 'Short description', type: 'textarea', rows: 3, required: true, max: 600 },
      { key: 'body', label: 'Full text', type: 'list', itemLabel: 'paragraph', multiline: true },
      { key: 'imageUrl', label: 'Image', type: 'image' },
    ],
  },
];

export const resourceByName = (name: string) => RESOURCES.find((r) => r.name === name);

// ---------- Site content blocks ----------
export interface ContentBlockConfig { key: string; label: string; description: string; field: Field; invalidates?: LookupKey[] }
const iconCard = (label: string): Field => ({
  key: 'value', label, type: 'objects', itemLabel: 'item', summaryKey: 'title',
  fields: [{ key: 'title', label: 'Title', type: 'text', required: true, max: 80 }, { key: 'icon', label: 'Icon', type: 'icon', required: true }, { key: 'text', label: 'Text', type: 'textarea', rows: 2, required: true, max: 400 }],
});
const headingGroup = (key: string, label: string, d: { eyebrow: string; title: string; lead: string }): Field => ({
  key, label, type: 'group', fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text', max: 160, placeholder: d.eyebrow },
    { key: 'title', label: 'Heading', type: 'text', max: 200, placeholder: d.title },
    { key: 'lead', label: 'Introduction', type: 'textarea', rows: 2, max: 600, placeholder: d.lead || '(none)' },
  ],
});
const emptyHint = 'Leave a field empty to keep the built-in wording shown in grey. {founded} inserts the founding year.';

export const CONTENT_BLOCKS: ContentBlockConfig[] = [
  {
    key: 'company', label: 'Company information', description: 'Company name, contact numbers, email addresses, logo and social media links — used across the whole website.',
    field: {
      key: 'value', label: 'Company', type: 'group', fields: [
        { key: 'name', label: 'Company name (short)', type: 'text', required: true, max: 80 },
        { key: 'legalName', label: 'Legal name', type: 'text', required: true, max: 120 },
        { key: 'tagline', label: 'Tagline', type: 'text', required: true, max: 120 },
        { key: 'founded', label: 'Year founded', type: 'number', required: true, min: 1900, maxValue: 2100 },
        { key: 'description', label: 'Description (search engines; footer unless set in Footer)', type: 'textarea', rows: 3, required: true, max: 600 },
        { key: 'url', label: 'Website URL', type: 'url', required: true },
        { key: 'email', label: 'General email', type: 'email', required: true },
        { key: 'careersEmail', label: 'Careers email', type: 'email', required: true },
        { key: 'phoneLandline', label: 'Office phone (display)', type: 'text', required: true, max: 30 },
        { key: 'phoneLandlineHref', label: 'Office phone (dialling, +91…)', type: 'text', required: true, max: 20 },
        { key: 'phoneMobile', label: 'Mobile (display)', type: 'text', required: true, max: 30 },
        { key: 'phoneMobileHref', label: 'Mobile (dialling, +91…)', type: 'text', required: true, max: 20 },
        { key: 'logoUrl', label: 'Logo (header)', type: 'image', hint: 'Leave empty to use the standard logo. A wide PNG or WebP with a transparent background works best.' },
        { key: 'logoWhiteUrl', label: 'Logo for dark backgrounds (footer)', type: 'image', hint: 'Leave empty to use a white version of the standard logo.' },
        { key: 'social', label: 'Social media links', type: 'group', fields: [
          { key: 'linkedin', label: 'LinkedIn', type: 'url', placeholder: 'https://www.linkedin.com/company/…' },
          { key: 'x', label: 'X (Twitter)', type: 'url', placeholder: 'https://x.com/…' },
          { key: 'facebook', label: 'Facebook', type: 'url', placeholder: 'https://www.facebook.com/…' },
          { key: 'instagram', label: 'Instagram', type: 'url', placeholder: 'https://www.instagram.com/…' },
          { key: 'youtube', label: 'YouTube', type: 'url', placeholder: 'https://www.youtube.com/@…' },
        ] },
      ],
    },
  },
  {
    key: 'footer', label: 'Footer', description: 'Text shown in the website footer. Leave a field empty to use the default.',
    field: {
      key: 'value', label: 'Footer', type: 'group', fields: [
        { key: 'about', label: 'About text', type: 'textarea', rows: 3, max: 600, placeholder: '(the company description)' },
        { key: 'copyright', label: 'Copyright line', type: 'text', max: 200, placeholder: '© {year} <legal name>. All rights reserved.', hint: '{year} is replaced with the current year.' },
        { key: 'note', label: 'Additional note', type: 'text', max: 300, placeholder: '(none)', hint: 'e.g. registration details. Shown under the copyright line.' },
      ],
    },
  },
  {
    key: 'careerOptions', label: 'Career settings', description: 'Job categories, locations, employment types and experience levels offered when editing job openings.',
    invalidates: ['departments', 'locations', 'employmentTypes', 'experienceLevels'],
    field: {
      key: 'value', label: 'Options', type: 'group', fields: [
        { key: 'departments', label: 'Job categories (departments)', type: 'list', itemLabel: 'category' },
        { key: 'locations', label: 'Locations', type: 'list', itemLabel: 'location' },
        { key: 'employmentTypes', label: 'Employment types', type: 'list', itemLabel: 'type' },
        { key: 'experienceLevels', label: 'Experience requirements', type: 'list', itemLabel: 'level' },
      ],
    },
  },
  {
    key: 'home', label: 'Homepage', description: `Homepage hero, banner image, promotional section and section headings. ${emptyHint}`,
    field: {
      key: 'value', label: 'Homepage', type: 'group', fields: [
        { key: 'heroEyebrow', label: 'Hero — small heading', type: 'text', max: 160, placeholder: HOME_DEFAULTS.heroEyebrow, wide: true },
        { key: 'heroTitle', label: 'Hero — main heading', type: 'textarea', rows: 2, max: 200, placeholder: HOME_DEFAULTS.heroTitle },
        { key: 'heroLead', label: 'Hero — introduction', type: 'textarea', rows: 3, max: 600, placeholder: HOME_DEFAULTS.heroLead },
        { key: 'heroPrimaryLabel', label: 'First button label', type: 'text', max: 60, placeholder: HOME_DEFAULTS.heroPrimaryLabel },
        { key: 'heroSecondaryLabel', label: 'Second button label', type: 'text', max: 60, placeholder: HOME_DEFAULTS.heroSecondaryLabel },
        { key: 'heroImage', label: 'Hero banner image', type: 'image', hint: 'Leave empty to use the standard highway photograph. Use a wide landscape photo (at least 1400 px).' },
        { key: 'promo', label: 'Promotional section (shown below the hero when switched on)', type: 'group', fields: [
          { key: 'enabled', label: 'Show the promotional section', type: 'boolean' },
          { key: 'eyebrow', label: 'Small heading', type: 'text', max: 80 },
          { key: 'title', label: 'Heading', type: 'text', max: 200 },
          { key: 'text', label: 'Text', type: 'textarea', rows: 2, max: 600 },
          { key: 'buttonLabel', label: 'Button label', type: 'text', max: 60 },
          { key: 'buttonHref', label: 'Button link', type: 'text', max: 300, placeholder: '/careers or https://…' },
        ] },
        { key: 'sections', label: 'Section headings', type: 'group', fields: Object.entries(HOME_SECTION_DEFAULTS).map(([k, d]) => headingGroup(k, d.label, d)) },
      ],
    },
  },
  {
    key: 'pages', label: 'Page headings', description: `The banner heading and introduction of each main page. ${emptyHint}`,
    field: { key: 'value', label: 'Pages', type: 'group', fields: Object.entries(PAGE_DEFAULTS).map(([k, d]) => headingGroup(k, `${d.label} (${d.path})`, d)) },
  },
  { key: 'overview', label: 'About Us — Overview', description: 'The numbered company overview paragraphs.', field: { key: 'value', label: 'Paragraphs', type: 'list', itemLabel: 'paragraph', multiline: true } },
  {
    key: 'mission', label: 'About Us — Mission', description: 'Mission statement, description and objectives.',
    field: { key: 'value', label: 'Mission', type: 'group', fields: [
      { key: 'statement', label: 'Mission statement', type: 'text', required: true, max: 200, wide: true },
      { key: 'description', label: 'Description', type: 'textarea', rows: 4, required: true, max: 2000 },
      { key: 'objectives', label: 'Mission objectives', type: 'list', itemLabel: 'objective' },
    ] },
  },
  {
    key: 'vision', label: 'About Us — Vision', description: 'Vision statement and points.',
    field: { key: 'value', label: 'Vision', type: 'group', fields: [
      { key: 'statement', label: 'Vision statement', type: 'text', required: true, max: 200, wide: true },
      { key: 'points', label: 'Vision points', type: 'list', itemLabel: 'point' },
    ] },
  },
  {
    key: 'approach', label: 'Our approach', description: 'The seven-step approach (Mission page and homepage).',
    field: { key: 'value', label: 'Steps', type: 'objects', itemLabel: 'step', summaryKey: 'title', fields: [{ key: 'title', label: 'Step', type: 'text', required: true, max: 120, wide: true }, { key: 'text', label: 'Explanation', type: 'textarea', rows: 2, required: true, max: 400 }] },
  },
  { key: 'values', label: 'Values', description: 'Value cards on the Mission page.', field: iconCard('Values') },
  { key: 'whyChoose', label: 'Why choose Spine', description: 'Reasons shown on the homepage.', field: iconCard('Reasons') },
  {
    key: 'stats', label: 'Headline figures', description: 'Figures in the homepage hero and Overview page.',
    field: {
      key: 'value', label: 'Figures', type: 'objects', itemLabel: 'figure', summaryKey: 'label',
      hint: 'Values can use live counts: {{founded}}, {{practiceCount}}, {{serviceCount}}, {{sectorCount}}.',
      fields: [
        { key: 'label', label: 'Label', type: 'text', required: true, max: 60 },
        { key: 'value', label: 'Value', type: 'text', required: true, max: 40 },
        { key: 'unit', label: 'Suffix (e.g. +)', type: 'text', max: 10 },
        { key: 'note', label: 'Note', type: 'textarea', rows: 2, required: true, max: 200 },
      ],
    },
  },
];

export const contentBlockByKey = (key: string) => CONTENT_BLOCKS.find((b) => b.key === key);
