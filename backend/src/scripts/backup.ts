// Database backup to database/backups/ (keep this folder out of version control; copy backups off the server).
// PostgreSQL: uses pg_dump (custom format, restore with pg_restore). Set PG_DUMP to its full path if it is not on PATH.
// PGlite (development): archives the embedded data directory.
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connect, disconnect } from '../config/db.ts';
import { env } from '../config/env.ts';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../database/backups');
await fs.mkdir(dir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16);
const KEEP = Number(process.env.BACKUP_KEEP ?? 14);

if (env.DATABASE_URL) {
  const out = path.join(dir, `spine-advisory-${stamp}.dump`);
  const url = new URL(env.DATABASE_URL);
  const child = spawn(process.env.PG_DUMP || 'pg_dump', ['--format=custom', '--no-owner', '--file', out, '--dbname', `${url.protocol}//${url.host}${url.pathname}`, '--username', decodeURIComponent(url.username)], {
    env: { ...process.env, PGPASSWORD: decodeURIComponent(url.password) },
    stdio: 'inherit',
  });
  const code: number = await new Promise((resolve) => child.on('close', resolve));
  if (code !== 0) {
    console.error('pg_dump failed. Is it installed and on PATH (or PG_DUMP set)?');
    process.exit(code || 1);
  }
  console.log(`Backup written: ${out}`);
} else {
  const { PGlite } = await import('@electric-sql/pglite');
  await connect();
  await disconnect();
  const client = new PGlite(path.resolve(env.PGLITE_DIR));
  const archive = await client.dumpDataDir('gzip');
  const out = path.join(dir, `spine-advisory-pglite-${stamp}.tar.gz`);
  await fs.writeFile(out, Buffer.from(await archive.arrayBuffer()));
  await client.close();
  console.log(`Backup written: ${out}`);
}

// Rotation: keep the newest KEEP backups.
const files = (await fs.readdir(dir)).filter((f) => f.startsWith('spine-advisory-')).sort().reverse();
for (const f of files.slice(KEEP)) await fs.rm(path.join(dir, f));
