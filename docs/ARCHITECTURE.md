# Architecture

```
Browser ──HTTPS──▶ Nginx ──▶ Angular SSR server (Node/Express, :4200)
                               │  • renders pages with data from the API
                               │  • 301 redirects (legacy URLs) + trailing-slash URLs
                               │  • security headers, compression, static files
                               └─/api, /uploads, /sitemap.xml, /robots.txt, /llms.txt─▶ Express API (:4000)
                                                                                      │  routes → controllers → services
                                                                                      │  auth, RBAC, validation, rate limits
                                                                                      └─ Drizzle ORM ─▶ PostgreSQL
```

There is one public origin. The website server proxies the API, so the browser never calls another domain. During server rendering, data requests go straight to the API (`API_INTERNAL_URL`), and the responses are embedded in the page, so the browser does not fetch them again.

## Frontend: `frontend/`

- **Angular 22**: standalone components, signals, zoneless change detection, server-side rendering and hydration (`@angular/ssr`).
- **Public pages** are rendered on the server per request (`RenderMode.Server`), so edits made in the admin panel are live immediately and search engines get complete HTML. Each page is a lazy-loaded chunk; route **resolvers** (`src/app/pages/resolvers.ts`) load data before rendering and return a real HTTP 404 for unknown pages.
- **Admin panel** (`/admin`): rendered in the browser only, lazy-loaded, with its own stylesheet (`admin.css`).
- **Styling**: Bootstrap 5.3 configured with the original design tokens (`src/styles/_variables.scss`: colours, Inter and Newsreader type, 4px radii, the original breakpoints and spacing scale). It uses Bootstrap's CSS grid, utilities, forms and buttons, plus brand components (`_components.scss`) and brand utilities (`_utilities.scss`).
- **Structure**: `core/` (API client, SEO, JSON-LD, models), `layouts/` (header, footer, shell), `shared/` (cards, sections, forms, motion directives), `pages/`, `admin/`.
- **Forms**: Angular Reactive Forms with the same fields and validation as before. They post to the API; the CV file is checked by signature before upload.
- **Motion**: scroll reveal and count-up directives (browser only, off for reduced-motion users), route progress bar, view transitions.
- **Images**: banners pre-generated as responsive WebP (`npm run images`) and served with `srcset`; the hero image is preloaded.

## Backend: `backend/`

- **Express 5** with TypeScript (run by `tsx` in development, compiled with `tsc` for production).
- `src/routes`: public, auth and admin routers. `src/controllers`: HTTP handling. `src/services`: business logic and queries. `src/validators`: Zod schemas. `src/middleware`: auth, RBAC, CSRF, rate limits, uploads, errors. `src/models/schema.ts`: Drizzle schema. `src/config`: environment and database.
- **Generic CRUD** (`services/crud.service.ts` + `services/resources.ts`): every admin-managed type, including nested children (service items, sections, FAQs), is saved in one transaction.
- **REST API**:
  - Public: `GET /api/site`, `/practices[/:slug]`, `/collections/{sectors|industries|strategic-pillars}[/:slug]`, `/team/:slug`, `/articles[/:slug]`, `/faqs`, `/jobs`, `/testimonials`, `/redirects`, `/health`; `POST /api/enquiries`, `/api/applications`.
  - Auth: `POST /api/auth/login`, `/logout`, `/change-password`; `GET /api/auth/me`.
  - Admin (`/api/admin/...`): CRUD for practices, sectors, team, clients, associates, offices, articles, jobs, testimonials and redirects; content blocks; enquiries; applications (with CV download); media; users; activity; dashboard. Lists support `page`, `pageSize`, `q` (search) and `status` filters.
- **SEO files** come from the database: `/sitemap.xml` (every published page with `lastmod`), `/robots.txt` and `/llms.txt`.
- **Email**: Nodemailer notifies the firm of new enquiries and applications. Without SMTP settings, emails are logged instead of sent.

## Database: PostgreSQL via Drizzle ORM

The schema is in `backend/src/models/schema.ts`, and its migrations are in `database/migrations/` (generated with `npm run db:generate`, applied with `npm run db:migrate`).

| Area | Tables |
|---|---|
| Content | `site_content` (company, overview, mission, vision, values, approach, why-choose, stats), `offices`, `practices` + `practice_items`, `sectors` (kind = sector, industry or pillar) + `sector_sections` + `sector_practices`, `team_members`, `clients`, `associates`, `articles` + `article_sections`, `faqs` (exactly one owner, enforced by a check constraint), `job_openings`, `testimonials` (publishing requires consent, enforced by a check), `redirects` |
| Submissions | `enquiries`, `job_applications` (→ `media` for the CV) |
| Administration | `admin_users`, `admin_sessions`, `activity_log`, `media` |

Integrity is enforced in the database itself: foreign keys with cascade or restrict, unique slugs, at most one head office, closing date on or after posting date, and valid redirect codes.

In development without `DATABASE_URL`, the same migrations run on **PGlite** (PostgreSQL compiled to WebAssembly), as do the automated tests.

## Security

- **Admin authentication**: passwords hashed with scrypt; 12+ character policy. Sessions are random 256-bit tokens stored only as SHA-256 hashes, sent as `HttpOnly; SameSite=Strict; Secure` (production) cookies and revocable on sign-out or password change. Accounts lock for 15 minutes after 5 failed sign-ins, and sign-in is rate-limited per IP.
- **Authorisation**: the `admin` role can do everything; `editor` manages content, enquiries and media; `recruiter` manages jobs and applications. Enforced by API middleware (`requirePermission`) and by Angular route guards.
- **CSRF**: state-changing admin calls require a custom header (blocked cross-site by CORS), on top of SameSite=Strict.
- **Input**: every request is validated with Zod and stripped of HTML and control characters. All queries are parameterised through Drizzle, and Angular escapes all output.
- **Uploads**: size-capped; type detected from file content, not the name; images re-encoded (which removes metadata and payloads); random file names. CVs are stored outside the public folder and downloadable only by authorised users.
- **Headers**: Helmet on both servers (CSP, HSTS in production, frame and content-type protection, referrer and permissions policies). CORS is limited to the site's origin.
- **Rate limits**: whole API 300 per minute; forms 5 per 10 minutes; sign-in 10 per 15 minutes, per IP.
- **Secrets**: only in environment variables (`.env`, never committed).

## SEO

- Page titles, meta descriptions, canonical URLs, Open Graph and Twitter tags are set on the server per page, with the same formats as before.
- The JSON-LD graph per page is the same as before: Organization, WebSite, BreadcrumbList, FAQPage, Service with OfferCatalog, Article, Person and ItemList, plus JobPosting for open roles.
- URLs are unchanged (trailing slash). Requests without the slash get a 301, and all 63 legacy URLs (plus the old sitemap URL) 301-redirect. Redirects are editable in the admin panel.
- Unknown pages return a real HTTP 404 with `noindex`.

## Performance

- Server rendering with hydration and transfer cache; lazy-loaded routes. The initial JavaScript is about 97 kB compressed, and each page chunk is 3–7 kB.
- Responsive WebP images, a preloaded hero image, lazy-loaded images below the fold, and a subset icon font (only the icons in use).
- gzip compression; hashed assets cached for a year; API responses revalidated with ETags; an in-memory cache on the API for public reads, cleared on every admin change.
