import os from 'node:os';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 120_000,
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? '',
      PGLITE_DIR: 'memory://',
      UPLOAD_DIR: path.join(os.tmpdir(), 'spine-advisory-test-uploads'),
      PUBLIC_SITE_URL: 'http://localhost:4200',
      LOG_LEVEL: 'silent',
    },
  },
});
