import { Router } from 'express';
import * as c from '../controllers/public.controller.ts';
import { submitApplication, submitEnquiry } from '../controllers/forms.controller.ts';
import { formLimiter, trackLimiter } from '../middleware/rate-limit.ts';
import { uploadSingle } from '../middleware/upload.ts';

export const publicRouter = Router();

// Content is always revalidated (ETag), so admin changes appear immediately. (Equivalent to no-cache,
// but cacheable, so Angular can reuse server-rendered data in the browser.)
publicRouter.use((_req, res, next) => { res.set('Cache-Control', 'public, max-age=0, must-revalidate'); next(); });

publicRouter.get('/health', c.health);
publicRouter.get('/site', c.site);
publicRouter.get('/practices', c.practices);
publicRouter.get('/practices/:slug', c.practice);
publicRouter.get('/collections/:kind', c.sectors);
publicRouter.get('/collections/:kind/:slug', c.sector);
publicRouter.get('/team/:slug', c.teamMember);
publicRouter.get('/articles', c.articles);
publicRouter.get('/articles/:slug', c.article);
publicRouter.get('/faqs', c.faqHub);
publicRouter.get('/jobs', c.jobs);
publicRouter.get('/testimonials', c.testimonials);
publicRouter.get('/redirects', c.redirects);
publicRouter.get('/projects', c.projects);
publicRouter.get('/projects/:slug', c.project);
publicRouter.get('/announcements', c.announcements);
publicRouter.get('/announcements/:slug', c.announcement);

publicRouter.post('/enquiries', formLimiter, submitEnquiry);
publicRouter.post('/track', trackLimiter, c.track);
publicRouter.post('/applications', formLimiter, uploadSingle('cv', 5), submitApplication);
