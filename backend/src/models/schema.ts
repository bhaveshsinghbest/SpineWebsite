// PostgreSQL schema (Drizzle ORM). One source of truth for the database structure:
// `npm run db:generate` turns changes here into SQL migrations in database/migrations/.
import { sql } from 'drizzle-orm';
import {
  boolean, check, date, index, integer, jsonb, numeric, pgEnum, pgTable, primaryKey, serial, text, timestamp, uniqueIndex, varchar,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
};
const textArray = (name: string) => text(name).array().notNull().default(sql`'{}'::text[]`);

// ---------- Enums ----------
export const adminRole = pgEnum('admin_role', ['admin', 'editor', 'recruiter']);
export const publishStatus = pgEnum('publish_status', ['draft', 'published']);
export const sectorKind = pgEnum('sector_kind', ['sector', 'industry', 'pillar']);
export const jobStatus = pgEnum('job_status', ['draft', 'open', 'closed']);
export const enquiryStatus = pgEnum('enquiry_status', ['new', 'in_progress', 'resolved', 'closed']);
export const applicationStatus = pgEnum('application_status', ['pending', 'shortlisted', 'rejected', 'selected']);
export const mediaKind = pgEnum('media_kind', ['image', 'document', 'cv']);
export const projectStatus = pgEnum('project_status', ['upcoming', 'ongoing', 'completed', 'on_hold']);
export const announcementStatus = pgEnum('announcement_status', ['draft', 'published', 'archived']);
export const announcementKind = pgEnum('announcement_kind', ['announcement', 'news']);
// ---------- Administration ----------
/** The website has a single administrator account (signs in with username or email). */
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 60 }),
  email: varchar('email', { length: 160 }).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  role: adminRole('role').notNull().default('admin'),
  active: boolean('active').notNull().default(true),
  failedLogins: integer('failed_logins').notNull().default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  ...timestamps,
}, (t) => [
  uniqueIndex('admin_users_email_uq').on(sql`lower(${t.email})`),
  uniqueIndex('admin_users_username_uq').on(sql`lower(${t.username})`),
]);

/** Server-side sessions: only a SHA-256 hash of the session token is stored. */
export const adminSessions = pgTable('admin_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => adminUsers.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  /** Last request made with the session; sessions idle for too long expire (SESSION_IDLE_MINUTES). */
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
  ip: varchar('ip', { length: 64 }),
  userAgent: varchar('user_agent', { length: 300 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('admin_sessions_user_idx').on(t.userId)]);

/** Single-use, time-limited password reset tokens (only a SHA-256 hash is stored). */
export const passwordResets = pgTable('password_resets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => adminUsers.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  ip: varchar('ip', { length: 64 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('password_resets_user_idx').on(t.userId)]);

/** Audit log: append-only (the API has no endpoint that edits or deletes entries). */
export const activityLog = pgTable('activity_log', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => adminUsers.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 40 }).notNull(),
  entity: varchar('entity', { length: 60 }).notNull(),
  entityId: varchar('entity_id', { length: 60 }),
  summary: varchar('summary', { length: 300 }),
  /** What changed: { field: { from, to } }, or other structured context. */
  details: jsonb('details'),
  ip: varchar('ip', { length: 64 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('activity_log_created_idx').on(t.createdAt), index('activity_log_entity_idx').on(t.entity)]);

/** Page views for the dashboard. Visitors are identified only by a salted daily hash (no IP is stored). */
export const pageViews = pgTable('page_views', {
  id: serial('id').primaryKey(),
  day: date('day', { mode: 'string' }).notNull().default(sql`CURRENT_DATE`),
  path: varchar('path', { length: 300 }).notNull(),
  visitorHash: varchar('visitor_hash', { length: 64 }).notNull(),
  referrer: varchar('referrer', { length: 300 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('page_views_created_idx').on(t.createdAt), index('page_views_day_visitor_idx').on(t.day, t.visitorHash)]);

// ---------- Media (images, documents, CVs) ----------
export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  kind: mediaKind('kind').notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  storedName: varchar('stored_name', { length: 120 }).notNull().unique(),
  mimeType: varchar('mime_type', { length: 120 }).notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  /** Public files are served at /uploads/<storedName>; private files (CVs) only through authorised admin endpoints. */
  isPublic: boolean('is_public').notNull().default(true),
  alt: varchar('alt', { length: 255 }),
  uploadedBy: integer('uploaded_by').references(() => adminUsers.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Site-wide content ----------
/** Structured content blocks edited as a whole: company, overview, mission, vision, values, approach, whyChoose. */
export const siteContent = pgTable('site_content', {
  key: varchar('key', { length: 60 }).primaryKey(),
  data: jsonb('data').notNull(),
  updatedBy: integer('updated_by').references(() => adminUsers.id, { onDelete: 'set null' }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const offices = pgTable('offices', {
  id: serial('id').primaryKey(),
  city: varchar('city', { length: 80 }).notNull(),
  region: varchar('region', { length: 80 }).notNull(),
  lines: textArray('lines'),
  postalCode: varchar('postal_code', { length: 12 }),
  headOffice: boolean('head_office').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  ...timestamps,
}, (t) => [uniqueIndex('offices_one_head_office_uq').on(t.headOffice).where(sql`${t.headOffice}`)]);

// ---------- Services ----------
export const practices = pgTable('practices', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  title: varchar('title', { length: 120 }).notNull(),
  icon: varchar('icon', { length: 60 }).notNull(),
  banner: varchar('banner', { length: 60 }),
  metaDescription: varchar('meta_description', { length: 200 }).notNull(),
  summary: text('summary').notNull(),
  answer: text('answer').notNull(),
  tags: textArray('tags'),
  sortOrder: integer('sort_order').notNull().default(0),
  status: publishStatus('status').notNull().default('published'),
  ...timestamps,
});

export const practiceItems = pgTable('practice_items', {
  id: serial('id').primaryKey(),
  practiceId: integer('practice_id').notNull().references(() => practices.id, { onDelete: 'cascade' }),
  /** Anchor on the practice page; also the legacy WordPress slug used by redirects. */
  anchorId: varchar('anchor_id', { length: 80 }).notNull(),
  title: varchar('title', { length: 160 }).notNull(),
  description: text('description').notNull(),
  deliverables: textArray('deliverables'),
  sortOrder: integer('sort_order').notNull().default(0),
}, (t) => [uniqueIndex('practice_items_anchor_uq').on(t.practiceId, t.anchorId)]);

// ---------- Sectors, industries and strategic pillars (one shape) ----------
export const sectors = pgTable('sectors', {
  id: serial('id').primaryKey(),
  kind: sectorKind('kind').notNull(),
  slug: varchar('slug', { length: 80 }).notNull(),
  title: varchar('title', { length: 160 }).notNull(),
  shortTitle: varchar('short_title', { length: 80 }).notNull(),
  icon: varchar('icon', { length: 60 }).notNull(),
  tag: varchar('tag', { length: 80 }).notNull(),
  banner: varchar('banner', { length: 60 }),
  metaDescription: varchar('meta_description', { length: 200 }).notNull(),
  summary: text('summary').notNull(),
  answer: text('answer').notNull(),
  highlights: textArray('highlights'),
  sortOrder: integer('sort_order').notNull().default(0),
  status: publishStatus('status').notNull().default('published'),
  ...timestamps,
}, (t) => [uniqueIndex('sectors_kind_slug_uq').on(t.kind, t.slug)]);

export const sectorSections = pgTable('sector_sections', {
  id: serial('id').primaryKey(),
  sectorId: integer('sector_id').notNull().references(() => sectors.id, { onDelete: 'cascade' }),
  heading: varchar('heading', { length: 200 }).notNull(),
  body: textArray('body'),
  bullets: textArray('bullets'),
  sortOrder: integer('sort_order').notNull().default(0),
}, (t) => [index('sector_sections_sector_idx').on(t.sectorId)]);

export const sectorPractices = pgTable('sector_practices', {
  sectorId: integer('sector_id').notNull().references(() => sectors.id, { onDelete: 'cascade' }),
  practiceId: integer('practice_id').notNull().references(() => practices.id, { onDelete: 'cascade' }),
  sortOrder: integer('sort_order').notNull().default(0),
}, (t) => [primaryKey({ columns: [t.sectorId, t.practiceId] })]);

// ---------- People and relationships ----------
export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  name: varchar('name', { length: 120 }).notNull(),
  role: varchar('role', { length: 160 }).notNull(),
  photoUrl: varchar('photo_url', { length: 300 }),
  credentials: varchar('credentials', { length: 200 }),
  focus: textArray('focus'),
  bio: textArray('bio'),
  sortOrder: integer('sort_order').notNull().default(0),
  status: publishStatus('status').notNull().default('published'),
  ...timestamps,
});

export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  shortName: varchar('short_name', { length: 40 }).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  logoUrl: varchar('logo_url', { length: 300 }),
  sortOrder: integer('sort_order').notNull().default(0),
  status: publishStatus('status').notNull().default('published'),
  ...timestamps,
});

export const associates = pgTable('associates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  status: publishStatus('status').notNull().default('published'),
  ...timestamps,
});

// ---------- Insights ----------
export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  title: varchar('title', { length: 200 }).notNull(),
  category: varchar('category', { length: 80 }).notNull(),
  banner: varchar('banner', { length: 60 }),
  publishedOn: date('published_on', { mode: 'string' }).notNull(),
  readingMinutes: integer('reading_minutes').notNull().default(5),
  metaDescription: varchar('meta_description', { length: 200 }).notNull(),
  summary: text('summary').notNull(),
  takeaways: textArray('takeaways'),
  status: publishStatus('status').notNull().default('draft'),
  ...timestamps,
}, (t) => [index('articles_published_idx').on(t.status, t.publishedOn)]);

export const articleSections = pgTable('article_sections', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  heading: varchar('heading', { length: 200 }).notNull(),
  body: textArray('body'),
  bullets: textArray('bullets'),
  sortOrder: integer('sort_order').notNull().default(0),
}, (t) => [index('article_sections_article_idx').on(t.articleId)]);

/** FAQs belong to exactly one practice, sector or article (enforced by a check constraint). */
export const faqs = pgTable('faqs', {
  id: serial('id').primaryKey(),
  practiceId: integer('practice_id').references(() => practices.id, { onDelete: 'cascade' }),
  sectorId: integer('sector_id').references(() => sectors.id, { onDelete: 'cascade' }),
  articleId: integer('article_id').references(() => articles.id, { onDelete: 'cascade' }),
  question: varchar('question', { length: 300 }).notNull(),
  answer: text('answer').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
}, (t) => [
  check('faqs_one_owner', sql`num_nonnulls(${t.practiceId}, ${t.sectorId}, ${t.articleId}) = 1`),
  index('faqs_practice_idx').on(t.practiceId),
  index('faqs_sector_idx').on(t.sectorId),
  index('faqs_article_idx').on(t.articleId),
]);

// ---------- Careers ----------
export const jobOpenings = pgTable('job_openings', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  title: varchar('title', { length: 160 }).notNull(),
  department: varchar('department', { length: 80 }).notNull(),
  location: varchar('location', { length: 120 }).notNull(),
  experience: varchar('experience', { length: 60 }).notNull(),
  /** Free text so the options can be managed in the admin panel (Career Management → Settings). */
  employmentType: varchar('employment_type', { length: 40 }).notNull().default('Full-time'),
  summary: text('summary'),
  qualifications: textArray('qualifications'),
  responsibilities: textArray('responsibilities'),
  postedOn: date('posted_on', { mode: 'string' }).notNull(),
  closesOn: date('closes_on', { mode: 'string' }),
  status: jobStatus('status').notNull().default('draft'),
  ...timestamps,
}, (t) => [check('job_openings_dates', sql`${t.closesOn} IS NULL OR ${t.closesOn} >= ${t.postedOn}`)]);

export const testimonials = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  quote: text('quote').notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  designation: varchar('designation', { length: 160 }).notNull(),
  organisation: varchar('organisation', { length: 200 }).notNull(),
  consentOnFile: boolean('consent_on_file').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(100),
  status: publishStatus('status').notNull().default('draft'),
  ...timestamps,
}, (t) => [check('testimonials_publish_needs_consent', sql`${t.status} = 'draft' OR ${t.consentOnFile}`)]);

// ---------- Form submissions ----------
export const enquiries = pgTable('enquiries', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  organisation: varchar('organisation', { length: 160 }).notNull(),
  email: varchar('email', { length: 160 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  area: varchar('area', { length: 160 }).notNull(),
  message: text('message'),
  status: enquiryStatus('status').notNull().default('new'),
  notes: text('notes'),
  followUpOn: date('follow_up_on', { mode: 'string' }),
  ip: varchar('ip', { length: 64 }),
  userAgent: varchar('user_agent', { length: 300 }),
  ...timestamps,
}, (t) => [index('enquiries_created_idx').on(t.createdAt)]);

export const jobApplications = pgTable('job_applications', {
  id: serial('id').primaryKey(),
  jobOpeningId: integer('job_opening_id').references(() => jobOpenings.id, { onDelete: 'set null' }),
  position: varchar('position', { length: 200 }).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  email: varchar('email', { length: 160 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  location: varchar('location', { length: 120 }).notNull(),
  qualification: varchar('qualification', { length: 160 }).notNull(),
  experienceYears: numeric('experience_years', { precision: 4, scale: 1 }).notNull(),
  linkedin: varchar('linkedin', { length: 300 }),
  message: text('message'),
  cvMediaId: integer('cv_media_id').notNull().references(() => media.id, { onDelete: 'restrict' }),
  consent: boolean('consent').notNull(),
  status: applicationStatus('status').notNull().default('pending'),
  notes: text('notes'),
  ip: varchar('ip', { length: 64 }),
  ...timestamps,
}, (t) => [check('job_applications_consent', sql`${t.consent}`), index('job_applications_created_idx').on(t.createdAt)]);

// ---------- Projects ----------
export const projectCategories = pgTable('project_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  sortOrder: integer('sort_order').notNull().default(0),
  ...timestamps,
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  title: varchar('title', { length: 200 }).notNull(),
  categoryId: integer('category_id').references(() => projectCategories.id, { onDelete: 'set null' }),
  sectorId: integer('sector_id').references(() => sectors.id, { onDelete: 'set null' }),
  client: varchar('client', { length: 200 }),
  location: varchar('location', { length: 160 }),
  projectValue: varchar('project_value', { length: 80 }),
  startedOn: date('started_on', { mode: 'string' }),
  completedOn: date('completed_on', { mode: 'string' }),
  summary: text('summary').notNull(),
  description: textArray('description'),
  highlights: textArray('highlights'),
  coverImageUrl: varchar('cover_image_url', { length: 300 }),
  status: projectStatus('status').notNull().default('ongoing'),
  publishStatus: publishStatus('publish_status').notNull().default('draft'),
  featured: boolean('featured').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  ...timestamps,
}, (t) => [
  index('projects_public_idx').on(t.publishStatus, t.status),
  index('projects_category_idx').on(t.categoryId),
  index('projects_sector_idx').on(t.sectorId),
  check('projects_dates', sql`${t.completedOn} IS NULL OR ${t.startedOn} IS NULL OR ${t.completedOn} >= ${t.startedOn}`),
]);

export const projectImages = pgTable('project_images', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  url: varchar('url', { length: 300 }).notNull(),
  caption: varchar('caption', { length: 200 }),
  sortOrder: integer('sort_order').notNull().default(0),
}, (t) => [index('project_images_project_idx').on(t.projectId)]);

// ---------- Announcements & news ----------
/** Visible on the website when published and the publication time has passed (future times = scheduled). */
export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  kind: announcementKind('kind').notNull().default('news'),
  title: varchar('title', { length: 200 }).notNull(),
  summary: text('summary').notNull(),
  body: textArray('body'),
  imageUrl: varchar('image_url', { length: 300 }),
  publishAt: timestamp('publish_at', { withTimezone: true }).notNull().defaultNow(),
  status: announcementStatus('status').notNull().default('draft'),
  showOnHomepage: boolean('show_on_homepage').notNull().default(true),
  ...timestamps,
}, (t) => [index('announcements_public_idx').on(t.status, t.publishAt)]);

// ---------- URL redirects ----------
export const redirects = pgTable('redirects', {
  id: serial('id').primaryKey(),
  fromPath: varchar('from_path', { length: 300 }).notNull().unique(),
  toPath: varchar('to_path', { length: 300 }).notNull(),
  statusCode: integer('status_code').notNull().default(301),
  ...timestamps,
}, (t) => [check('redirects_status', sql`${t.statusCode} IN (301, 302, 307, 308)`)]);
