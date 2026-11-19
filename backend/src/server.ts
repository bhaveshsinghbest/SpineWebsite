import { connect, disconnect, migrateDb } from './config/db.ts';
import { env } from './config/env.ts';
import { createApp } from './app.ts';
import { logger } from './utils/logger.ts';

const conn = await connect();
// The embedded development database is migrated automatically; PostgreSQL is migrated explicitly (npm run db:migrate).
if (conn.driver === 'pglite') await migrateDb();

// HOST is optional (all interfaces by default); 127.0.0.1 keeps the API private behind the website.
const onListening = () => {
  logger.info(`Spine Advisory API listening on http://${env.HOST ?? 'localhost'}:${env.PORT} (${env.NODE_ENV}, database: ${conn.driver === 'pg' ? 'PostgreSQL' : 'PGlite (embedded)'})`);
};
const app = createApp();
const server = env.HOST ? app.listen(env.PORT, env.HOST, onListening) : app.listen(env.PORT, onListening);

const shutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down`);
  server.close(async () => {
    await disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
