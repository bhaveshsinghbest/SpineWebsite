import type { Request, Response } from 'express';
import { z } from 'zod';
import * as pub from '../services/public.service.ts';
import { recordPageView } from '../services/tracking.service.ts';

const kinds = { sectors: 'sector', industries: 'industry', 'strategic-pillars': 'pillar' } as const;
const kindParam = z.enum(['sectors', 'industries', 'strategic-pillars']).transform((k) => kinds[k]);
const slugParam = z.string().regex(/^[a-z0-9-]{1,120}$/);

export const site = async (_req: Request, res: Response) => { res.json(await pub.getSite()); };
export const practices = async (_req: Request, res: Response) => { res.json(await pub.getPractices()); };
export const practice = async (req: Request, res: Response) => { res.json(await pub.getPractice(slugParam.parse(req.params.slug))); };
export const sectors = async (req: Request, res: Response) => { res.json(await pub.getSectors(kindParam.parse(req.params.kind))); };
export const sector = async (req: Request, res: Response) => {
  res.json(await pub.getSector(kindParam.parse(req.params.kind), slugParam.parse(req.params.slug)));
};
export const teamMember = async (req: Request, res: Response) => { res.json(await pub.getTeamMember(slugParam.parse(req.params.slug))); };
export const articles = async (req: Request, res: Response) => {
  const q = z.object({
    page: z.coerce.number().int().min(1).max(1000).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(12),
    category: z.string().trim().max(80).optional(),
  }).parse(req.query);
  res.json(await pub.getArticles(q));
};
export const article = async (req: Request, res: Response) => { res.json(await pub.getArticle(slugParam.parse(req.params.slug))); };
export const faqHub = async (_req: Request, res: Response) => {
  const [practices, industries, sectors, pillars, articles] = await Promise.all([
    pub.getPractices(), pub.getSectors('industry'), pub.getSectors('sector'), pub.getSectors('pillar'), pub.getAllArticleFaqs(),
  ]);
  res.json([
    ...practices.map((p) => ({ title: p.title, href: `/services/${p.slug}/`, faqs: p.faqs })),
    ...industries.map((x) => ({ title: x.title, href: `/industries/${x.slug}/`, faqs: x.faqs })),
    ...sectors.map((x) => ({ title: x.title, href: `/sectors/${x.slug}/`, faqs: x.faqs })),
    ...pillars.map((x) => ({ title: x.title, href: `/strategic-pillars/${x.slug}/`, faqs: x.faqs })),
    ...articles.map((a) => ({ title: a.category, href: `/insights/${a.slug}/`, faqs: a.faqs })),
  ].filter((g) => g.faqs.length));
};
export const jobs = async (_req: Request, res: Response) => { res.json(await pub.getOpenJobs()); };
export const testimonials = async (_req: Request, res: Response) => { res.json(await pub.getTestimonials()); };
export const projects = async (_req: Request, res: Response) => { res.json(await pub.getProjects()); };
export const project = async (req: Request, res: Response) => { res.json(await pub.getProject(slugParam.parse(req.params.slug))); };
export const announcements = async (req: Request, res: Response) => {
  const q = z.object({
    page: z.coerce.number().int().min(1).max(1000).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(12),
    kind: z.enum(['announcement', 'news']).optional(),
    homepage: z.enum(['1', 'true']).optional().transform(Boolean),
  }).parse(req.query);
  res.json(await pub.getAnnouncements(q));
};
export const announcement = async (req: Request, res: Response) => { res.json(await pub.getAnnouncement(slugParam.parse(req.params.slug))); };
export const track = (req: Request, res: Response) => {
  const body = z.object({ path: z.string().trim().max(300).regex(/^\/[^\s]*$/), referrer: z.string().max(500).optional() }).safeParse(req.body ?? {});
  if (body.success) recordPageView(body.data, { ip: req.ip, userAgent: req.get('user-agent') });
  res.status(204).end();
};
export const redirects = async (_req: Request, res: Response) => { res.json(await pub.getRedirects()); };
export const health = async (_req: Request, res: Response) => {
  await pub.healthCheck();
  res.json({ status: 'ok', time: new Date().toISOString() });
};
