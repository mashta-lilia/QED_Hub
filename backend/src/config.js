import { fileURLToPath } from 'node:url';

const DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const DEFAULT_REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export function getConfig(env = process.env) {
  const isProduction = env.NODE_ENV === 'production';

  return {
    port: Number(env.PORT || 4000),
    nodeEnv: env.NODE_ENV || 'development',
    accessTokenSecret: env.AUTH_ACCESS_TOKEN_SECRET || 'dev-access-secret-change-me',
    refreshTokenSecret: env.AUTH_REFRESH_TOKEN_SECRET || 'dev-refresh-secret-change-me',
    refreshCookieName: env.AUTH_REFRESH_COOKIE_NAME || 'qed_refresh_token',
    clientOrigin: env.CLIENT_ORIGIN || 'http://localhost:5173',
    accessTokenTtlSeconds: Number(env.AUTH_ACCESS_TOKEN_TTL_SECONDS || DEFAULT_ACCESS_TOKEN_TTL_SECONDS),
    refreshTokenTtlSeconds: Number(env.AUTH_REFRESH_TOKEN_TTL_SECONDS || DEFAULT_REFRESH_TOKEN_TTL_SECONDS),
    secureCookies: env.SECURE_COOKIES ? env.SECURE_COOKIES === 'true' : isProduction,
    dataDir: env.DATA_DIR || fileURLToPath(new URL('../data', import.meta.url))
  };
}
