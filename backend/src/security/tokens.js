import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

function base64urlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function sign(data, secret) {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

function safeCompare(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function createAccessToken(payload, secret, ttlSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64urlJson({ alg: 'HS256', typ: 'JWT' });
  const body = base64urlJson({ ...payload, iat: now, exp: now + ttlSeconds });
  const signature = sign(`${header}.${body}`, secret);
  return `${header}.${body}.${signature}`;
}

export function verifyAccessToken(token, secret) {
  const [header, body, signature] = String(token).split('.');

  if (!header || !body || !signature) {
    throw Object.assign(new Error('Invalid access token'), { statusCode: 401 });
  }

  const expectedSignature = sign(`${header}.${body}`, secret);
  if (!safeCompare(signature, expectedSignature)) {
    throw Object.assign(new Error('Invalid access token'), { statusCode: 401 });
  }

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw Object.assign(new Error('Access token has expired'), { statusCode: 401 });
  }

  return payload;
}

export function createRefreshToken() {
  return randomBytes(48).toString('base64url');
}

export function hashToken(token, secret) {
  return createHmac('sha256', secret).update(token).digest('base64url');
}
