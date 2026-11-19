// Database connection. Production and staging use PostgreSQL through node-postgres (a pooled connection).
// When DATABASE_URL is empty (local development and tests) the same schema runs on PGlite,
// an embedded build of PostgreSQL, so the project works before a database server is provisioned.
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { env } from './env.ts';
import * as schema from '../models/schema.ts';

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

export const MIGRATIONS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../database/migrations');

let instance: { db: Db; close: () => Promise<void>; driver: 'pg' | 'pglite' } | undefined;

export async function connect(): Promise<typeof instance & object> {
  if (instance) return instance;
  if (env.DATABASE_URL) {
    const { default: pg } = await import('pg');
    const { drizzle } = await import('drizzle-orm/node-postgres');
    const pool = new pg.Pool({
      connectionString: env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      ssl: env.DATABASE_SSL ? { rejectUnauthorized: true } : undefined,
    });
    pool.on('error', (err) => console.error('PostgreSQL pool error', err));
    instance = { db: drizzle(pool, { schema }) as unknown as Db, close: () => pool.end(), driver: 'pg' };
  } else {
    const { PGlite } = await import('@electric-sql/pglite');
    const { drizzle } = await import('drizzle-orm/pglite');
    const dir = env.PGLITE_DIR.startsWith('memory://') ? env.PGLITE_DIR : path.resolve(env.PGLITE_DIR);
    if (!dir.startsWith('memory://')) {
      mkdirSync(path.dirname(dir), { recursive: true });
      // PGlite runs in this process only, so a lock file left by a killed process is always stale.
      rmSync(path.join(dir, 'postmaster.pid'), { force: true });
    }
    const client = new PGlite(dir);
    instance = { db: drizzle(client, { schema }) as unknown as Db, close: () => client.close(), driver: 'pglite' };
  }
  return instance;
}

/** The connected database. `connect()` must have completed (server.ts and scripts do this at startup). */
export function db(): Db {
  if (!instance) throw new Error('Database not connected');
  return instance.db;
}

export async function migrateDb(): Promise<void> {
  const conn = await connect();
  if (conn.driver === 'pg') {
    const { migrate } = await import('drizzle-orm/node-postgres/migrator');
    await migrate(conn.db as never, { migrationsFolder: MIGRATIONS_DIR });
  } else {
    const { migrate } = await import('drizzle-orm/pglite/migrator');
    await migrate(conn.db as never, { migrationsFolder: MIGRATIONS_DIR });
  }
}

export async function disconnect(): Promise<void> {
  if (instance) await instance.close();
  instance = undefined;
}
