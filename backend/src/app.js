import { createServer } from 'node:http';
import { AuthService } from './auth/authService.js';
import { createRateLimiter } from './auth/rateLimiter.js';
import { createAuthRouter } from './auth/routes.js';
import { getConfig } from './config.js';
import { sendJson } from './http.js';
import { JsonStore } from './storage/jsonStore.js';

export async function createApp(options = {}) {
  const config = options.config || getConfig();
  const store = options.store || new JsonStore(config.dataDir);
  await store.init();

  const authService = options.authService || new AuthService(store, config);
  const loginRateLimit = options.loginRateLimit || createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });
  const authRouter = createAuthRouter(authService, config, loginRateLimit);

  return createServer(async (req, res) => {
    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    applyCors(req, res, config);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      if (requestUrl.pathname === '/health') {
        sendJson(res, 200, { status: 'ok' });
        return;
      }

      if (await authRouter(req, res, requestUrl.pathname)) {
        return;
      }

      sendJson(res, 404, { error: 'Not found' });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const headers = error.retryAfter ? { 'Retry-After': String(error.retryAfter) } : {};
      sendJson(res, statusCode, { error: statusCode >= 500 ? 'Internal server error' : error.message }, headers);
    }
  });
}

function applyCors(req, res, config) {
  const origin = req.headers.origin;

  if (origin && origin === config.clientOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}
