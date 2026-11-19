# Frontend (Angular 22 + Bootstrap 5)

See the [project README](../README.md) and [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).

- `npm start`: dev server on http://localhost:4200 (proxies `/api` and `/uploads` to the API on :4000, see `proxy.conf.json`)
- `npm run build`: production build; `npm run serve` runs it (`API_INTERNAL_URL` = API address, `PORT` = 4200)
- `src/app/pages`: public pages · `src/app/admin`: admin panel · `src/app/shared`: UI components · `src/styles`: Bootstrap configuration and brand styles
