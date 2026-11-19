// Express application: security middleware, API routes, uploads and SEO files.
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.ts';
import { errorHandler, notFoundHandler } from './middleware/error-handler.ts';
import { apiLimiter } from './middleware/rate-limit.ts';
import { adminRouter } from './routes/admin.routes.ts';
import { authRouter } from './routes/auth.routes.ts';
import { publicRouter } from './routes/public.routes.ts';
import * as seo from './controllers/seo.controller.ts';
import { logger } from './utils/logger.ts';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY);
  app.set('etag', 'weak');

  app.use(pinoHttp({
    logger,
    autoLogging: { ignore: (req) => req.url === '/api/health' },
    customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'),
  }));
  // The API returns JSON only, so its own CSP is fully locked down. The website's CSP is set by the Angular server.
  app.use(helmet({
    contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"], baseUri: ["'none'"], formAction: ["'none'"] } },
    crossOriginResourcePolicy: { policy: 'same-site' },
    strictTransportSecurity: env.isProd ? { maxAge: 31_536_000, includeSubDomains: true } : false,
  }));
  const allowed = new Set([env.siteUrl, ...env.CORS_ORIGINS]);
  app.use(cors({
    origin: (origin, cb) => cb(null, !origin || allowed.has(origin)),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-Requested-With'],
    maxAge: 600,
  }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.use(cookieParser());

  // Public uploads (images, documents). Private files (CVs) are never served from here.
  app.use('/uploads', express.static(env.publicUploadDir, {
    index: false, dotfiles: 'deny', maxAge: '30d', immutable: true,
    setHeaders: (res) => res.set({ 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox" }),
  }));

  app.get('/sitemap.xml', seo.sitemap);
  app.get('/sitemap-index.xml', seo.sitemap);
  app.get('/robots.txt', seo.robots);
  app.get('/llms.txt', seo.llms);

  app.use('/api', apiLimiter);
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api', publicRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
