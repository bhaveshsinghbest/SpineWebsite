// Production web server for the Angular website (server-side rendering).
// - Security headers (Helmet: CSP, HSTS, frame and content-type protections) and compression
// - 301 redirects for every legacy URL (managed in the admin panel) and the trailing-slash URL convention
// - Proxies /api, /uploads and the SEO files (sitemap, robots, llms) to the Express API
// - Serves the static build with long-lived caching, then renders pages with Angular SSR
import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
import compression from 'compression';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');
const API = (process.env['API_INTERNAL_URL'] || 'http://localhost:4000').replace(/\/$/, '');
const isProd = process.env['NODE_ENV'] === 'production';

const app = express();
const angularApp = new AngularNodeAppEngine();
app.disable('x-powered-by');
app.set('trust proxy', Number(process.env['TRUST_PROXY'] ?? 1));

app.get('/healthz', (_req, res) => { res.json({ status: 'ok' }); });

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'"],
      formAction: ["'self'", 'mailto:'],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
      ...(isProd ? { upgradeInsecureRequests: [] } : {}),
    },
  },
  strictTransportSecurity: isProd ? { maxAge: 31_536_000, includeSubDomains: true } : false,
  crossOriginEmbedderPolicy: false,
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
app.use((_req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  next();
});
app.use(compression());

// ---- API and SEO files are served by the backend ----
const SEO_FILES = new Set(['/sitemap.xml', '/sitemap-index.xml', '/robots.txt', '/llms.txt']);
app.use(createProxyMiddleware({
  target: API,
  changeOrigin: false,
  xfwd: true,
  pathFilter: (path: string) => /^\/(api|uploads)\//.test(path) || SEO_FILES.has(path),
  on: {
    error: (_err, _req, res) => {
      const r = res as Response;
      if (!r.headersSent) r.status(502).json({ error: { message: 'The service is temporarily unavailable. Please try again shortly.' } });
    },
  },
}));

// ---- Redirects: legacy URLs (from the database) and the trailing-slash convention ----
let redirectMap = new Map<string, { to: string; status: number }>();
let redirectsLoadedAt = 0;
const normalise = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p).toLowerCase();

async function loadRedirects() {
  if (Date.now() - redirectsLoadedAt < 5 * 60_000) return;
  redirectsLoadedAt = Date.now();
  try {
    const res = await fetch(`${API}/api/redirects`);
    if (!res.ok) return;
    const rows = (await res.json()) as { from: string; to: string; status: number }[];
    redirectMap = new Map(rows.map((r) => [normalise(r.from), { to: r.to, status: r.status }]));
  } catch {
    redirectsLoadedAt = 0; // retry on the next request
  }
}

app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const [path, query = ''] = req.originalUrl.split('?');
  await loadRedirects();
  const hit = redirectMap.get(normalise(decodeURIComponent(path)));
  if (hit) return res.redirect(hit.status, hit.to);
  // Page URLs end with "/" (as on the original site); files and the admin panel are left alone.
  if (path !== '/' && !path.endsWith('/') && !/\.[a-z0-9]{1,8}$/i.test(path) && !path.startsWith('/admin')) {
    return res.redirect(301, `${path}/${query ? `?${query}` : ''}`);
  }
  next();
});

// ---- Static files: hashed bundles cached for a year, other assets for a week ----
app.use(express.static(browserDistFolder, {
  index: false,
  redirect: false,
  setHeaders: (res, filePath) => {
    const hashed = /[.-][A-Z0-9]{8,}\.(js|css|woff2?)$/i.test(filePath);
    res.setHeader('Cache-Control', hashed ? 'public, max-age=31536000, immutable' : 'public, max-age=604800');
  },
}));

// ---- Everything else: Angular server-side rendering ----
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => {
      if (!response) return next();
      // Rendered HTML must always reflect the latest published content.
      response.headers.set('Cache-Control', req.path.startsWith('/admin') ? 'no-store' : 'no-cache');
      return writeResponseToNodeResponse(response, res);
    })
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = Number(process.env['PORT'] || 4200);
  app.listen(port, (error) => {
    if (error) throw error;
    console.log(`Spine Advisory website listening on http://localhost:${port} (API: ${API})`);
  });
}

/** Request handler used by the Angular CLI (dev server and build). */
export const reqHandler = createNodeRequestHandler(app);
