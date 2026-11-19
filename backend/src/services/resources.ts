// Admin-managed resources and how they map to tables. Each becomes /api/admin/<name> with full CRUD.
import { asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../config/db.ts';
import * as s from '../models/schema.ts';
import * as v from '../validators/content.ts';
import type { ChildDef, ResourceDef } from './crud.service.ts';

const faqChild = (fk: 'practiceId' | 'sectorId' | 'articleId'): ChildDef => ({
  key: 'faqs', table: s.faqs, fk, orderColumn: s.faqs.sortOrder,
  toRow: (f, i) => ({ question: f.question, answer: f.answer, sortOrder: i }),
  fromRow: (r) => ({ question: r.question, answer: r.answer }),
});

const sectionChild = (table: typeof s.sectorSections | typeof s.articleSections, fk: string): ChildDef => ({
  key: 'sections', table, fk, orderColumn: table.sortOrder,
  toRow: (x, i) => ({ heading: x.heading, body: x.body, bullets: x.bullets, sortOrder: i }),
  fromRow: (r) => ({ heading: r.heading, body: r.body, bullets: r.bullets }),
});

export const practicesResource: ResourceDef = {
  name: 'practices', permission: 'content', table: s.practices, input: v.practiceInput,
  searchColumns: [s.practices.title, s.practices.slug], filters: { status: s.practices.status },
  orderBy: [asc(s.practices.sortOrder), asc(s.practices.id)], label: (r) => r.title, publication: { field: 'status', actions: { published: 'publish', draft: 'unpublish' } },
  sortable: { title: s.practices.title, slug: s.practices.slug, sortOrder: s.practices.sortOrder, status: s.practices.status, updatedAt: s.practices.updatedAt },
  children: [
    {
      key: 'items', table: s.practiceItems, fk: 'practiceId', orderColumn: s.practiceItems.sortOrder,
      toRow: (x, i) => ({ anchorId: x.anchorId, title: x.title, description: x.description, deliverables: x.deliverables, sortOrder: i }),
      fromRow: (r) => ({ anchorId: r.anchorId, title: r.title, description: r.description, deliverables: r.deliverables }),
    },
    faqChild('practiceId'),
  ],
};

export const sectorsResource: ResourceDef = {
  name: 'sectors', permission: 'content', table: s.sectors, input: v.sectorInput,
  searchColumns: [s.sectors.title, s.sectors.slug, s.sectors.tag], filters: { status: s.sectors.status, kind: s.sectors.kind },
  orderBy: [asc(s.sectors.kind), asc(s.sectors.sortOrder), asc(s.sectors.id)], label: (r) => `${r.kind}: ${r.title}`, publication: { field: 'status', actions: { published: 'publish', draft: 'unpublish' } },
  sortable: { title: s.sectors.title, kind: s.sectors.kind, slug: s.sectors.slug, sortOrder: s.sectors.sortOrder, status: s.sectors.status },
  children: [sectionChild(s.sectorSections, 'sectorId'), faqChild('sectorId')],
  extraKeys: ['relatedPractices'],
  afterSave: async (tx, id, input) => {
    if (!('relatedPractices' in input)) return;
    await tx.delete(s.sectorPractices).where(eq(s.sectorPractices.sectorId, id));
    const slugs: string[] = input.relatedPractices ?? [];
    if (!slugs.length) return;
    const rows = await tx.select({ id: s.practices.id, slug: s.practices.slug }).from(s.practices).where(inArray(s.practices.slug, slugs));
    const bySlug = new Map(rows.map((r) => [r.slug, r.id]));
    const values = slugs.filter((x) => bySlug.has(x)).map((x, i) => ({ sectorId: id, practiceId: bySlug.get(x)!, sortOrder: i }));
    if (values.length) await tx.insert(s.sectorPractices).values(values);
  },
  afterLoad: async (id) => {
    const rows = await db()
      .select({ slug: s.practices.slug })
      .from(s.sectorPractices)
      .innerJoin(s.practices, eq(s.sectorPractices.practiceId, s.practices.id))
      .where(eq(s.sectorPractices.sectorId, id))
      .orderBy(asc(s.sectorPractices.sortOrder));
    return { relatedPractices: rows.map((r) => r.slug) };
  },
};

export const teamResource: ResourceDef = {
  name: 'team', permission: 'content', table: s.teamMembers, input: v.teamInput,
  searchColumns: [s.teamMembers.name, s.teamMembers.role], filters: { status: s.teamMembers.status },
  orderBy: [asc(s.teamMembers.sortOrder), asc(s.teamMembers.id)], label: (r) => r.name, publication: { field: 'status', actions: { published: 'publish', draft: 'unpublish' } },
  sortable: { name: s.teamMembers.name, role: s.teamMembers.role, sortOrder: s.teamMembers.sortOrder, status: s.teamMembers.status },
};

export const clientsResource: ResourceDef = {
  name: 'clients', permission: 'content', table: s.clients, input: v.clientInput,
  searchColumns: [s.clients.name, s.clients.shortName], filters: { status: s.clients.status },
  orderBy: [asc(s.clients.sortOrder), asc(s.clients.id)], label: (r) => r.name, publication: { field: 'status', actions: { published: 'publish', draft: 'unpublish' } },
  sortable: { name: s.clients.name, shortName: s.clients.shortName, sortOrder: s.clients.sortOrder, status: s.clients.status },
};

export const associatesResource: ResourceDef = {
  name: 'associates', permission: 'content', table: s.associates, input: v.associateInput,
  searchColumns: [s.associates.name], filters: { status: s.associates.status },
  orderBy: [asc(s.associates.sortOrder), asc(s.associates.id)], label: (r) => r.name, publication: { field: 'status', actions: { published: 'publish', draft: 'unpublish' } },
  sortable: { name: s.associates.name, sortOrder: s.associates.sortOrder, status: s.associates.status },
};

export const officesResource: ResourceDef = {
  name: 'offices', permission: 'content', table: s.offices, input: v.officeInput,
  searchColumns: [s.offices.city, s.offices.region], orderBy: [asc(s.offices.sortOrder), asc(s.offices.id)], label: (r) => r.city,
  sortable: { city: s.offices.city, region: s.offices.region, headOffice: s.offices.headOffice, sortOrder: s.offices.sortOrder },
};

export const articlesResource: ResourceDef = {
  name: 'articles', permission: 'content', table: s.articles, input: v.articleInput,
  searchColumns: [s.articles.title, s.articles.category, s.articles.slug], filters: { status: s.articles.status },
  orderBy: [desc(s.articles.publishedOn), desc(s.articles.id)], label: (r) => r.title, publication: { field: 'status', actions: { published: 'publish', draft: 'unpublish' } },
  sortable: { title: s.articles.title, category: s.articles.category, publishedOn: s.articles.publishedOn, status: s.articles.status },
  dateColumn: s.articles.publishedOn,
  children: [sectionChild(s.articleSections, 'articleId'), faqChild('articleId')],
};

export const jobsResource: ResourceDef = {
  name: 'jobs', permission: 'jobs', table: s.jobOpenings, input: v.jobInput,
  searchColumns: [s.jobOpenings.title, s.jobOpenings.department, s.jobOpenings.location, s.jobOpenings.experience],
  filters: { status: s.jobOpenings.status, department: s.jobOpenings.department, location: s.jobOpenings.location, employmentType: s.jobOpenings.employmentType },
  orderBy: [desc(s.jobOpenings.postedOn), desc(s.jobOpenings.id)], label: (r) => r.title,
  publication: { field: 'status', actions: { open: 'publish', draft: 'unpublish', closed: 'close' } },
  sortable: { title: s.jobOpenings.title, department: s.jobOpenings.department, location: s.jobOpenings.location, postedOn: s.jobOpenings.postedOn, closesOn: s.jobOpenings.closesOn, status: s.jobOpenings.status },
  dateColumn: s.jobOpenings.postedOn,
  listSelect: () => ({
    fields: { applications: sql<number>`(select count(*)::int from ${s.jobApplications} where ${s.jobApplications.jobOpeningId} = ${s.jobOpenings.id})` },
    join: (q) => q,
  }),
};

export const testimonialsResource: ResourceDef = {
  name: 'testimonials', permission: 'content', table: s.testimonials, input: v.testimonialInput,
  searchColumns: [s.testimonials.name, s.testimonials.organisation, s.testimonials.quote], filters: { status: s.testimonials.status },
  orderBy: [asc(s.testimonials.sortOrder), asc(s.testimonials.id)], label: (r) => `${r.name}, ${r.organisation}`, publication: { field: 'status', actions: { published: 'publish', draft: 'unpublish' } },
  sortable: { name: s.testimonials.name, organisation: s.testimonials.organisation, status: s.testimonials.status, sortOrder: s.testimonials.sortOrder },
};

export const redirectsResource: ResourceDef = {
  name: 'redirects', permission: 'redirects', table: s.redirects, input: v.redirectInput,
  searchColumns: [s.redirects.fromPath, s.redirects.toPath], orderBy: [asc(s.redirects.fromPath)], label: (r) => `${r.fromPath} → ${r.toPath}`,
  sortable: { fromPath: s.redirects.fromPath, toPath: s.redirects.toPath, statusCode: s.redirects.statusCode },
};

export const projectCategoriesResource: ResourceDef = {
  name: 'project-categories', permission: 'projects', table: s.projectCategories, input: v.projectCategoryInput,
  searchColumns: [s.projectCategories.name, s.projectCategories.slug],
  orderBy: [asc(s.projectCategories.sortOrder), asc(s.projectCategories.name)], label: (r) => r.name,
  sortable: { name: s.projectCategories.name, slug: s.projectCategories.slug, sortOrder: s.projectCategories.sortOrder },
  listSelect: () => ({
    fields: { projects: sql<number>`(select count(*)::int from ${s.projects} where ${s.projects.categoryId} = ${s.projectCategories.id})` },
    join: (q) => q,
  }),
};

export const projectsResource: ResourceDef = {
  name: 'projects', permission: 'projects', table: s.projects, input: v.projectInput,
  searchColumns: [s.projects.title, s.projects.client, s.projects.location, s.projects.slug],
  filters: { status: s.projects.status, publishStatus: s.projects.publishStatus, categoryId: s.projects.categoryId, sectorId: s.projects.sectorId },
  orderBy: [asc(s.projects.sortOrder), desc(s.projects.updatedAt), desc(s.projects.id)], label: (r) => r.title,
  publication: { field: 'publishStatus', actions: { published: 'publish', draft: 'unpublish' } },
  sortable: { title: s.projects.title, client: s.projects.client, status: s.projects.status, publishStatus: s.projects.publishStatus, startedOn: s.projects.startedOn, sortOrder: s.projects.sortOrder, updatedAt: s.projects.updatedAt },
  dateColumn: s.projects.updatedAt,
  listSelect: () => ({
    fields: { categoryName: s.projectCategories.name, sectorTitle: s.sectors.title },
    join: (q) => q.leftJoin(s.projectCategories, eq(s.projects.categoryId, s.projectCategories.id)).leftJoin(s.sectors, eq(s.projects.sectorId, s.sectors.id)),
  }),
  children: [{
    key: 'images', table: s.projectImages, fk: 'projectId', orderColumn: s.projectImages.sortOrder,
    toRow: (x, i) => ({ url: x.url, caption: x.caption ?? null, sortOrder: i }),
    fromRow: (r) => ({ url: r.url, caption: r.caption }),
  }],
};

export const announcementsResource: ResourceDef = {
  name: 'announcements', permission: 'announcements', table: s.announcements, input: v.announcementInput,
  searchColumns: [s.announcements.title, s.announcements.summary, s.announcements.slug],
  filters: { status: s.announcements.status, kind: s.announcements.kind },
  orderBy: [desc(s.announcements.publishAt), desc(s.announcements.id)], label: (r) => r.title,
  publication: { field: 'status', actions: { published: 'publish', draft: 'unpublish', archived: 'archive' } },
  sortable: { title: s.announcements.title, kind: s.announcements.kind, publishAt: s.announcements.publishAt, status: s.announcements.status },
  dateColumn: s.announcements.publishAt,
};


export const resources = [
  practicesResource, sectorsResource, teamResource, clientsResource, associatesResource, officesResource,
  articlesResource, jobsResource, testimonialsResource, redirectsResource,
  projectCategoriesResource, projectsResource, announcementsResource,
];
