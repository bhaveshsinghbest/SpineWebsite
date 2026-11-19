# Deployment

The site runs as three services: **PostgreSQL**, the **API** (`backend`, port 4000) and the **website** (`frontend` SSR server, port 4200), behind **Nginx** for HTTPS. Only the website needs to be reachable through Nginx; the API stays private.

For hosting on **Render** (one web service, managed PostgreSQL, persistent disk), follow [DEPLOY-RENDER.md](DEPLOY-RENDER.md) instead.

## Environments

| | Development | Testing / staging | Production |
|---|---|---|---|
| Database | PGlite (automatic) or local PostgreSQL | PostgreSQL (`spine_advisory_test` or a copy) | PostgreSQL (managed, or the compose `db` service) |
| Config | `backend/.env` from `.env.example` | own `.env` | environment variables / `.env` (never committed) |
| Run | `npm run dev` + `npm start` | `docker compose` | `docker compose` or Node processes (PM2/systemd) |

Required production settings (backend): `NODE_ENV=production`, `DATABASE_URL`, `PUBLIC_SITE_URL=https://spineadvisory.com`, `SMTP_*` and the `NOTIFY_*` addresses. Website: `API_INTERNAL_URL=http://<api-host>:4000`, `PORT`.

## Option A: Docker (recommended)

```bash
cp deploy/.env.example .env            # set POSTGRES_PASSWORD, SMTP settings
docker compose up -d --build
docker compose run --rm api npm run db:setup     # first deployment only: migrations + content + first admin
```

The compose file publishes the website on `127.0.0.1:4200` only. Install `deploy/nginx.conf` on the host and issue certificates (`certbot --nginx -d spineadvisory.com -d www.spineadvisory.com`).

For later releases, run `git pull && docker compose up -d --build && docker compose run --rm api npm run db:migrate`.

## Option B: Node processes

```bash
cd backend && npm ci && npm run build && npm run db:migrate && node dist/server.js      # API
cd frontend && npm ci && npm run build && API_INTERNAL_URL=http://127.0.0.1:4000 node dist/frontend/server/server.mjs
```

Keep both running with PM2 or systemd, behind the same Nginx config. Uploaded files are in `backend/uploads/`: back them up, and keep that folder on persistent storage.

## Domain, DNS and HTTPS

1. Point the `A` (and `AAAA`) records for `spineadvisory.com` and `www` to the server.
2. Use Nginx with Let's Encrypt (`deploy/nginx.conf`). HSTS is enabled; `www` and `http` redirect to `https://spineadvisory.com`.
3. Update the site's allowed hosts in `frontend/angular.json` (`security.allowedHosts`) if the domain changes.

## Backups and monitoring

- **Database**: `npm run db:backup` (in `backend/`) writes a `pg_dump` file to `database/backups/` and keeps the latest 14. Schedule it daily (cron or Task Scheduler) and copy the files off the server. Restore with `pg_restore -d spine_advisory <file>`.
- **Uploads**: back up `backend/uploads/` (the Docker `uploads` volume) with the database.
- **Health checks**: `GET /api/health` (API + database) and `GET /healthz` (website), used by the Docker healthchecks. Point an uptime monitor at `https://spineadvisory.com/healthz`.
- **Logs**: the API writes structured JSON logs (pino) to stdout; collect them with Docker or your host's log service.

## CI

`.github/workflows/ci.yml` type-checks, runs the API tests against PostgreSQL and builds both apps on every push and pull request. Deployment can be added as a further job once the hosting is chosen.

## Go-live checklist

- [ ] Production database created, `npm run db:setup` run, first admin password changed
- [ ] Draft sample jobs and testimonial reviewed, published or deleted
- [ ] SMTP configured; send a test enquiry and a test application and confirm the emails arrive
- [ ] HTTPS certificate issued; `http://` and `www` redirect to `https://spineadvisory.com`
- [ ] `https://spineadvisory.com/sitemap.xml` submitted in Google Search Console
- [ ] Spot-check a few legacy URLs (e.g. `/overview`, `/transaction-advisory`) redirect correctly
- [ ] Daily backup scheduled and a restore tested
- [ ] Keep the old site available until the new one is verified in production; then switch DNS
