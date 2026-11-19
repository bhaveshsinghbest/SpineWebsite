// drizzle-kit: `npm run db:generate` writes SQL migrations to ../database/migrations.
// Generating migrations does not need a live database.
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/models/schema.ts',
  out: '../database/migrations',
  dialect: 'postgresql',
  strict: true,
  verbose: true,
});
