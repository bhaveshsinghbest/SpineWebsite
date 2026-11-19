# Admin Panel — analysis, changes and test report

Covers the 15 tasks in `bhavesh.md`. For day-to-day use, see [ADMIN-GUIDE.md](ADMIN-GUIDE.md).

## 1. Analysis (Task 1)

**Before.** Angular 20 (SSR) website + Express/Drizzle API + PostgreSQL (PGlite in development). An admin area already existed: email sign-in with HttpOnly session cookies, roles (admin / editor / recruiter), a generic CRUD engine for content types, enquiries and applications, a media library and an activity log.

**Approach.** The existing architecture was kept and extended, so public pages, their data shapes, SSR/hydration and SEO are unchanged. Every change below is additive or a configuration of an existing mechanism.

**Public sections and where their data comes from**

| Section | Database-driven via | Managed in |
|---|---|---|
| Home | `site_content.home` (+ practices, sectors, testimonials, articles, featured projects, announcements) | Website Content → Homepage |
| About Us | `site_content` overview / mission / vision / values / approach, `team_members` | Website Content → About Us, Team |
| Services | `practices`, `practice_items` | Website Content → Services |
| Careers | `job_openings` (+ `site_content.careerOptions`) | Career Management |
| Projects (new) | `projects`, `project_images`, `project_categories` | Project Management |
| News (new) | `announcements` | Announcements & News |
| Page headings | `site_content.pages` | Website Content → Page headings |
| Footer, contact | `site_content.company`, `site_content.footer`, `offices` | Website Settings |

## 2. What changed, by task

| Task | Implementation |
|---|---|
| 2 Top bar | Removed. Header 7.25rem → 5rem; `--header-h`, scroll offsets and anchor offsets reduced by the same 2.25rem. |
| 3 Admin button + login | Lock button at the header's top right on every screen size (icon-only from 1280 px, where the menu needs the room; between 1280 and 1365 px the duplicate text beside the logo is hidden). `/admin/login` with Username + Password, show/hide password, field-level errors. Guards on every admin route; the API checks the session again. |
| 4 Authentication | Single administrator (username `admin`, sign-in by username or email; other roles cannot sign in; user management removed). scrypt hashing (existing). Forgot Password: single-use SHA-256-hashed token, 30-minute expiry, earlier links invalidated, sessions revoked on reset, same response whether or not the account exists. Sessions: 8 h absolute + 30 min inactivity (server-side `last_seen_at`; client warning and automatic sign-out). Lockout after 5 failures; rate limits on login and reset. |
| 5 Layout | Fixed sidebar with the 8 modules and subtitles in the specified order, branding header, Logout; collapse (remembered), slide-out on mobile; top bar with profile and Logout. Shared UI: page header, tables with sortable headers, pager, date-range filter, status badges, confirmation dialog, toasts, loading states. |
| 6 Dashboard | Live figures: unique visitors, enquiries, active (ongoing) projects, published announcements; 12-month charts for visitors and enquiries; project status overview; recent activity; key statistics; most-viewed pages. |
| 7 Career | Job openings: publish / unpublish / close, categories, locations, employment types, experience levels (Career → Settings), filters, date range, application counts. Applications: statuses Pending / Shortlisted / Rejected / Selected, remarks, résumé download, filters by status / job / date, CSV export. |
| 8 Enquiries | Statuses New / In progress / Resolved / Closed, remarks, follow-up date, search, filters (status, category, date), sorting, CSV export. |
| 9 Projects | Projects with cover image and gallery (upload, replace, reorder, delete), categories, sector link, status Upcoming / Ongoing / Completed / On hold, publish / unpublish, featured; public `/projects` (filters) and `/projects/<slug>`. |
| 10 News | Title, description, full text, image, publication date-time (future = scheduled), publish / unpublish / archive, homepage visibility; public `/news` and `/news/<slug>`, homepage section. |
| 11 CMS | Homepage hero, banner image, promotional section, all section headings; page headings for 17 pages; About Us blocks; services; media library. Empty fields fall back to the built-in wording. |
| 12 Audit Log | Sign-ins, failed sign-ins (with the attempted username and IP), sign-outs, session expiry, password resets, and every create / edit / publish / unpublish / archive / close / delete / upload / export, with before → after values. Read-only (no edit or delete endpoint). Filters: date, action, module, search. |
| 13 Settings | Company name, logos (header and footer), contact numbers and emails, social links (LinkedIn, X, Facebook, Instagram, YouTube), footer text and copyright, office addresses — reflected in the header, footer and contact page. |
| 14 Backend | Migrations `0001_admin_panel` (new tables `projects`, `project_images`, `project_categories`, `announcements`, `password_resets`, `page_views`; new columns; status conversions) and `0002`. CRUD APIs per module, `PATCH /:id/status` quick actions, CSV exports with formula-injection protection, uploads checked by content and re-encoded, server-side validation (Zod), anonymous visitor tracking (`POST /api/track`: salted daily hash, no IP or cookie stored, bots and admin pages ignored). |
| 15 Testing | See below. |

**Data conversions in migration 0001:** application statuses new → pending, interview → shortlisted, hired → selected; enquiry status spam → closed; job employment type enum → text; the first admin gets username `admin`, other accounts are deactivated.

## 3. Test report

| Suite | Result |
|---|---|
| Backend API tests (`npm test`, real embedded PostgreSQL) | 37/37 pass — 18 existing (updated for username sign-in), 18 Admin Panel, 1 migration data-conversion |
| Type check and production builds (backend `tsc`, frontend `ng build`) | Pass |
| Browser end-to-end (`tests/e2e.cjs`, updated for the new panel) | 22/22 pass on a clean run (the application-form check fails if run repeatedly within 10 minutes — the form's anti-spam rate limit) |
| Browser checks of the Admin Panel (create project with image → publish → visible → unpublish → 404 → delete; scheduled announcement hidden until due, then visible, archived; homepage edit visible then reverted; audit entries with changes; CSV export; logout; direct-URL protection; forgot / invalid reset link) | 29/29 |
| Layout at 1280, 1366, 1440, 834 (tablet), 390 (mobile) px — public header and all admin pages | No horizontal overflow; admin button visible everywhere |
| Accessibility (`tests/a11y.cjs`, axe WCAG 2.1 AA) | Only `color-contrast`, all on existing brand styles (amber button, grey client names, muted text); none on new elements |

Run the tests:

```powershell
cd backend; npm test                         # API tests (use an upper-case C:\ path in the terminal on Windows)
$env:E2E_ADMIN_PASSWORD='...'; node tests/e2e.cjs   # with the site running on http://localhost:4200
```

## 4. Production checklist

1. `npm run db:migrate` then `npm run db:seed` (adds career options, project categories and the admin username to an existing database; never overwrites content).
2. Set `SMTP_*` so Forgot Password emails are delivered, and a long random `VISITOR_HASH_SECRET`.
3. Sign in as `admin` and change the password.
