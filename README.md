# Spine Advisory website

The Spine Advisory website on a PEAN stack: **Angular 22 + Bootstrap 5** (server-side rendered), a **Node.js + Express 5** REST API, and **PostgreSQL** through **Drizzle ORM**, with a custom admin panel for managing content.

It replaces the earlier static Astro site (`../Spine_website-main/`) page for page: same URLs, same design, same content. That content now lives in the database and can be edited without changing code.

```
spine-advisory-website/
├── frontend/      Angular app: public website (SSR) + admin panel (/admin)
├── backend/       Express API: content, forms, auth, uploads, sitemap/robots/llms
├── database/      SQL migrations, seed content (from the old site), setup and backup scripts
├── deploy/        Nginx (HTTPS) config and environment template
├── tests/         End-to-end, visual regression and accessibility tests
├── docs/          Architecture, migration record, admin guide, deployment
└── docker-compose.yml
```

## Quick start (development)

Requirements: Node.js 22+ (24 recommended). PostgreSQL 16+ for real use. Until you configure PostgreSQL, the API runs on an embedded PostgreSQL (PGlite) automatically.

```powershell
npm run install:all                     # root tools + backend + frontend
cd backend; copy .env.example .env      # then edit .env (see below)
npm run db:setup                        # migrations + website content + first admin user
npm run dev                             # API on http://localhost:4000
# second terminal
cd frontend; npm start                  # website on http://localhost:4200, admin on /admin
```

### Use your local PostgreSQL

Run once (asks for the `postgres` password, creates the `spine_app` role and the databases, writes `DATABASE_URL` to `backend/.env`, migrates and seeds):

```powershell
powershell -ExecutionPolicy Bypass -File database\scripts\setup-database.ps1
```

Other platforms: `database/scripts/setup-database.sql`, then `npm run db:setup` in `backend/`.

### First admin user

`npm run db:seed` creates `admin@spineadvisory.com` when no admin exists and prints a random password (or uses `SEED_ADMIN_PASSWORD`). Change it after signing in (top-right menu, then **My account**). To add more users, use **Settings, then Users** in the admin panel, or run `npm run admin:create -- --email … --name "…" --role editor`.

## Commands

| Where | Command | What it does |
|---|---|---|
| backend | `npm run dev` | API with reload |
| backend | `npm test` | API tests (embedded PostgreSQL, or `TEST_DATABASE_URL`) |
| backend | `npm run db:generate` | New SQL migration after editing `src/models/schema.ts` |
| backend | `npm run db:migrate` / `db:seed` | Apply migrations / load content |
| backend | `npm run db:backup` | Backup to `database/backups/` (pg_dump) |
| frontend | `npm start` | Website + admin, proxied to the API |
| frontend | `npm run build` | Production build (`dist/frontend`) |
| frontend | `npm run images` | Regenerate responsive banner images |
| root | `npm run test:e2e` | Browser end-to-end tests (needs `E2E_ADMIN_PASSWORD`) |
| root | `npm run test:visual -- 1440 / /about/` | Pixel comparison with the original site |
| root | `npm run test:a11y` | WCAG accessibility scan |

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how the parts fit together, security, SEO, performance
- [docs/MIGRATION.md](docs/MIGRATION.md): what was migrated from where, verification results, open items
- [docs/ADMIN-GUIDE.md](docs/ADMIN-GUIDE.md): for the people editing the website
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md): servers, Docker, HTTPS, backups, go-live checklist
