// Smoke test for Dashboard token flow.
// Usage:
//   1) Start dev server: npm run dev
//   2) Run: node smoke_dashboard_token.mjs
//
// Optional env:
//   BASE_URL=http://localhost:3000
//   ADMIN_PASSWORD=...

import fs from 'node:fs';
import path from 'node:path';

function readEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  /** @type {Record<string, string>} */
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    env[key] = value;
  }
  return env;
}

async function main() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  const envLocal = readEnvLocal();
  const adminPassword = process.env.ADMIN_PASSWORD || envLocal.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('[smoke] Missing ADMIN_PASSWORD (env or .env.local).');
    process.exit(1);
  }

  const loginRes = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: adminPassword }),
  });
  const loginData = await loginRes.json().catch(() => ({}));
  if (!loginRes.ok || !loginData.token) {
    console.error('[smoke] Login failed:', loginRes.status, loginData);
    process.exit(1);
  }

  const token = loginData.token;

  const res = await fetch(`${baseUrl}/api/pan/admin`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const data = await res.json().catch(() => ({}));
    console.error('[smoke] FAIL: token rejected:', data);
    process.exit(1);
  }

  console.log('[smoke] PASS: token accepted by /api/pan/admin, status =', res.status);
}

main().catch((err) => {
  console.error('[smoke] Unhandled error:', err);
  process.exit(1);
});

