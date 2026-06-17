import { getBearerToken, parseCookies, parseJsonBody, sendJson, serializeCookie } from '../http.js';
import { validateLogin, validateRegistration } from './validation.js';

function refreshCookie(config, refreshToken) {
  return serializeCookie(config.refreshCookieName, refreshToken, {
    httpOnly: true,
    secure: config.secureCookies,
    sameSite: 'Lax',
    path: '/api/auth',
    maxAge: config.refreshTokenTtlSeconds
  });
}

function clearRefreshCookie(config) {
  return serializeCookie(config.refreshCookieName, '', {
    httpOnly: true,
    secure: config.secureCookies,
    sameSite: 'Lax',
    path: '/api/auth',
    maxAge: 0
  });
}

export function createAuthRouter(authService, config, loginRateLimit) {
  return async function handleAuthRoute(req, res, pathname) {
    if (req.method === 'POST' && pathname === '/api/auth/register') {
      loginRateLimit(`register:${req.socket.remoteAddress || 'unknown'}`);
      const validation = validateRegistration(await parseJsonBody(req));

      if (validation.error) {
        sendJson(res, 400, { error: validation.error });
        return true;
      }

      const session = await authService.register(validation.value);
      sendJson(res, 201, { user: session.user, accessToken: session.accessToken }, {
        'Set-Cookie': refreshCookie(config, session.refreshToken)
      });
      return true;
    }

    if (req.method === 'POST' && pathname === '/api/auth/login') {
      loginRateLimit(`login:${req.socket.remoteAddress || 'unknown'}`);
      const validation = validateLogin(await parseJsonBody(req));

      if (validation.error) {
        sendJson(res, 400, { error: validation.error });
        return true;
      }

      const session = await authService.login(validation.value);
      sendJson(res, 200, { user: session.user, accessToken: session.accessToken }, {
        'Set-Cookie': refreshCookie(config, session.refreshToken)
      });
      return true;
    }

    if (req.method === 'POST' && pathname === '/api/auth/refresh') {
      const cookies = parseCookies(req.headers.cookie);
      const session = await authService.refresh(cookies[config.refreshCookieName]);

      sendJson(res, 200, { user: session.user, accessToken: session.accessToken }, {
        'Set-Cookie': refreshCookie(config, session.refreshToken)
      });
      return true;
    }

    if (req.method === 'POST' && pathname === '/api/auth/logout') {
      const cookies = parseCookies(req.headers.cookie);
      await authService.logout(cookies[config.refreshCookieName]);

      sendJson(res, 200, { ok: true }, {
        'Set-Cookie': clearRefreshCookie(config)
      });
      return true;
    }

    if (req.method === 'GET' && pathname === '/api/auth/me') {
      const accessToken = getBearerToken(req);

      if (!accessToken) {
        sendJson(res, 401, { error: 'Authorization bearer token is required' });
        return true;
      }

      const user = await authService.getUserFromAccessToken(accessToken);
      sendJson(res, 200, { user });
      return true;
    }

    return false;
  };
}
