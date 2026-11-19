# Migration record: Astro static site → PEAN stack

The source was `../Spine_website-main/Spine_website-main` (Astro 7.4, Tailwind CSS 4, TypeScript data files, YAML collections, Decap CMS). It is kept untouched as the live reference and rollback until the new site is verified in production (Task 20).

## Element mapping

| Existing site | New implementation |
|---|---|
| 43 Astro pages | 43 routes in Angular (`frontend/src/app/app.routes.ts`), same URLs, server-rendered |
| Astro components (`src/components/*.astro`) | Angular standalone components (`shared/`, `layouts/`) |
| `BaseLayout.astro` (meta, canonical, OG, JSON-LD) | `core/seo.service.ts` + `core/schema.ts` |
| Tailwind CSS + `global.css` tokens | Bootstrap 5.3 configured with the same tokens (`src/styles/`) + brand components |
| Inline scripts (menu, sticky header, reveal, count-up, forms) | `HeaderComponent`, `motion.directives.ts`, Reactive Forms components |
| `src/data/*.ts` | PostgreSQL tables, loaded by `npm run db:seed` from `database/seeds/content/` (unchanged copies) |
| `src/content/careers`, `testimonials` (YAML) | `job_openings`, `testimonials` tables |
| `redirects.ts` (63 legacy URLs) → meta-refresh pages | `redirects` table → real HTTP 301s, editable in the admin panel |
| `sitemap-index.xml` (build-time), `robots.txt.ts`, `llms.txt.ts` | `/sitemap.xml`, `/robots.txt`, `/llms.txt` generated from the database (`/sitemap-index.xml` still served) |
| Decap CMS (`/admin`, Git-based, not connected) | Custom Angular admin panel with sign-in, roles, drafts and an activity log |
| Forms: `mailto:` fallback (no endpoint configured) | REST endpoints that validate, store in PostgreSQL and email the firm; CVs stored privately |
| `_headers` (Netlify/Cloudflare format) | Helmet security headers on both Node servers + `deploy/nginx.conf` |
| `public/images/*`, `src/assets/*` | `frontend/public/assets/` (brand, WebP banners); team photos in managed uploads |

Removed in the new project: Astro, Tailwind, `@astrojs/*`, Decap CMS, the `check-icons` build step (icons are now subset at runtime from the icons actually used).

## Task status

| # | Task | Status |
|---|---|---|
| 1 | Analysis & migration plan | Done. All 43 pages, components, data files, scripts and configuration inventoried (this document, `ARCHITECTURE.md`) |
| 2 | Preserve design & UX | Done. Visual regression against the old site, see below |
| 3 | Astro → Angular | Done. Standalone components, lazy routes, same URLs |
| 4 | Tailwind → Bootstrap 5 | Done. Bootstrap grid, utilities, forms and buttons on the original tokens; Tailwind removed |
| 5 | Frontend functionality | Done. Mobile menu, sticky header, reveal and count-up, Reactive Forms with loading, success, error and empty states |
| 6 | Express backend | Done. Routes, controllers, services, middleware, validators, central errors, logging, environment validation |
| 7 | Content APIs | Done. Public read APIs + admin CRUD for every content type, enquiries and applications |
| 8 | PostgreSQL schema & data migration | Done. 22 normalised tables, FKs and checks, migrations, seed of all existing content, backup script |
| 9 | Database integration | Done. Drizzle ORM; pagination, search and filters; admin changes live immediately |
| 10 | Custom admin panel | Done. Replaces Decap: all content types, uploads, drafts and publishing |
| 11 | Authentication & authorisation | Done. Hashed passwords, revocable sessions, lockout, roles; API middleware + route guards |
| 12 | Contact & career forms | Done. Stored, validated on both sides, email notifications (SMTP to be configured) |
| 13 | Integrations | Done. Maps, `mailto:` and `tel:` links kept; image and document storage; Decap removed |
| 14 | SEO | Done. Titles, meta, canonical, OG/Twitter, JSON-LD, dynamic sitemap, robots, llms.txt, 64 × 301 redirects, real 404s |
| 15 | Security | Done. Helmet/CSP/HSTS, CORS, CSRF defence, rate limits, input cleaning, upload checks, secrets in environment variables |
| 16 | Performance | Done. SSR + hydration cache, lazy routes, WebP images, compression, caching |
| 17 | Testing | Done locally, see below |
| 18 | Regression testing | Done. Pixel comparison of every page at three widths |
| 19 | Git & deployment environment | Repository initialised; Docker, compose, Nginx and CI provided. **Hosting, DNS and SSL need your hosting account** |
| 20 | Deploy & launch | **Pending.** Follow `DEPLOYMENT.md` → go-live checklist |

## Verification (local, production builds)

- **Visual regression**: all 43 pages screenshotted on the old and new site and compared pixel by pixel (`tests/visual-regression.cjs`).

  | Width | Largest pixel difference | Pages whose height differs by more than 2px |
  |---|---|---|
  | 1440px (desktop) | 0.31% | 0 |
  | 768px (tablet) | 1.45% | 0 |
  | 390px (phone) | 0.56% | 0 |

  The remaining differences are font anti-aliasing and lazy-loaded photos.
- **API tests**: 18/18 pass (`backend/tests/api.test.ts`). They cover sign-in, CSRF, lockout, roles, CRUD with nested items, publishing rules, HTML stripping, form validation, honeypot, CV signature checks and private storage, and the SEO files.
- **End-to-end**: 22/22 pass (`tests/e2e.cjs`). They cover hydration without refetching, navigation, both forms through to the database, CV download, admin sign-in and sign-out, an admin edit appearing live, publishing a job (with JobPosting data), and no JavaScript errors.
- **Accessibility**: axe-core WCAG 2.1 AA scan of all 43 pages, old vs new (`tests/a11y.cjs`). The migration introduced no new issues. One issue inherited from the original (the logo link's accessible name) was fixed. The remaining finding is **colour contrast** of some secondary text (e.g. light grey notes, tags on photos), identical on the old and new site: 160 elements. Fixing it means adjusting the brand palette, which is a design decision for the firm.
- **SEO checks**: every page has the expected `<title>`, description, canonical and JSON-LD in the server HTML. The 64 redirects return 301 to the correct targets, and unknown URLs return 404.

## Open items (need a decision or access from the firm)

1. **PostgreSQL credentials**: run `database/scripts/setup-database.ps1` once, which needs the `postgres` password. Until then development uses the embedded PGlite database.
2. **SMTP account** for form notifications (`backend/.env`, `SMTP_*`). Without it, notifications are only logged.
3. **Hosting, domain, DNS, SSL**: choose a host and follow `DEPLOYMENT.md`.
4. **Content carried over unchanged**, including the open items in the old site's `CONTENT-REVIEW.md`:
   - the three sample job openings and the sample testimonial are still drafts;
   - Sumit Chaturvedi has no photo;
   - some banner images contain AI-generated text;
   - the privacy policy and disclaimer are still marked as drafts.
