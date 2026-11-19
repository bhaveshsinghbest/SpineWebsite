// Starts the API and the website together in one container (used on Render, see docs/DEPLOY-RENDER.md).
// - The website listens on $PORT (the port Render sends traffic to) and proxies /api and /uploads to the API.
// - The API listens privately on 127.0.0.1:$API_PORT (default 4000) and is never exposed directly.
// If either process stops, the other is stopped too and this script exits, so Render restarts the service.
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const apiPort = process.env.API_PORT || '4000';
const children = [];
let stopping = false;

function start(name, cwd, script, env) {
  const child = spawn(process.execPath, [script], { cwd, env: { ...process.env, ...env }, stdio: 'inherit' });
  child.on('exit', (code, signal) => {
    if (stopping) return;
    console.error(`[render-start] ${name} stopped (${signal ?? `exit code ${code}`}); stopping the service.`);
    stop(1);
  });
  children.push(child);
}

function stop(code) {
  stopping = true;
  for (const c of children) if (c.exitCode === null) c.kill('SIGTERM');
  setTimeout(() => process.exit(code), 5000).unref();
  Promise.all(children.map((c) => (c.exitCode !== null ? null : new Promise((r) => c.once('exit', r))))).then(() => process.exit(code));
}

process.on('SIGTERM', () => stop(0));
process.on('SIGINT', () => stop(0));

start('API', join(root, 'backend'), 'dist/server.js', {
  PORT: apiPort,
  HOST: '127.0.0.1',
  // Requests reach the API through Render's proxy and then the website's proxy.
  TRUST_PROXY: process.env.API_TRUST_PROXY || '2',
});
start('website', join(root, 'frontend'), 'dist/frontend/server/server.mjs', {
  PORT: process.env.PORT || '4200',
  API_INTERNAL_URL: `http://127.0.0.1:${apiPort}`,
  TRUST_PROXY: '1',
});
