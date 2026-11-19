import type { Request, Response } from 'express';
import { llmsTxt, robotsTxt, sitemapXml } from '../services/seo.service.ts';

export async function sitemap(_req: Request, res: Response) {
  res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(await sitemapXml());
}
export function robots(_req: Request, res: Response) {
  res.type('text/plain').set('Cache-Control', 'public, max-age=3600').send(robotsTxt());
}
export async function llms(_req: Request, res: Response) {
  res.type('text/plain').set('Cache-Control', 'public, max-age=3600').send(await llmsTxt());
}
