import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createApp } from '../src/app.js';

async function startTestServer() {
  const dataDir = await mkdtemp(join(tmpdir(), 'qed-auth-'));
  const server = await createApp({
    config: {
      port: 0,
      nodeEnv: 'test',
      accessTokenSecret: 'test-access-secret',
      refreshTokenSecret: 'test-refresh-secret',
      refreshCookieName: 'qed_refresh_token',
      clientOrigin: 'http://localhost:5173',
      accessTokenTtlSeconds: 900,
      refreshTokenTtlSeconds: 604800,
      secureCookies: false,
      dataDir
    }
  });

  await new Promise((resolve) => server.listen(0, resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  return {
    baseUrl,
    async close() {
      await new Promise((resolve) => server.close(resolve));
      await rm(dataDir, { recursive: true, force: true });
    }
  };
}

test('registers, authenticates, refreshes, and logs out', async () => {
  const app = await startTestServer();

  try {
    const registerResponse = await fetch(`${app.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@example.com', password: 'StrongPass1', name: 'Student User' })
    });
    const registerBody = await registerResponse.json();
    const refreshCookie = registerResponse.headers.get('set-cookie');

    assert.equal(registerResponse.status, 201);
    assert.equal(registerBody.user.email, 'student@example.com');
    assert.ok(registerBody.accessToken);
    assert.match(refreshCookie, /HttpOnly/);

    const meResponse = await fetch(`${app.baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${registerBody.accessToken}` }
    });
    const meBody = await meResponse.json();

    assert.equal(meResponse.status, 200);
    assert.equal(meBody.user.email, 'student@example.com');

    const refreshResponse = await fetch(`${app.baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: refreshCookie }
    });
    const refreshBody = await refreshResponse.json();

    assert.equal(refreshResponse.status, 200);
    assert.ok(refreshBody.accessToken);

    const logoutResponse = await fetch(`${app.baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { Cookie: refreshResponse.headers.get('set-cookie') }
    });

    assert.equal(logoutResponse.status, 200);
    assert.match(logoutResponse.headers.get('set-cookie'), /Max-Age=0/);
  } finally {
    await app.close();
  }
});

test('rejects duplicate registration and invalid credentials', async () => {
  const app = await startTestServer();

  try {
    const payload = { email: 'student@example.com', password: 'StrongPass1', name: 'Student User' };

    await fetch(`${app.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const duplicateResponse = await fetch(`${app.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.equal(duplicateResponse.status, 409);

    const loginResponse = await fetch(`${app.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: payload.email, password: 'wrong-password' })
    });

    assert.equal(loginResponse.status, 401);
  } finally {
    await app.close();
  }
});
