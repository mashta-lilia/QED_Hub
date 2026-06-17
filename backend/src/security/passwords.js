import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

const ITERATIONS = 310000;
const KEY_LENGTH = 32;
const DIGEST = 'sha256';

export function hashPassword(password) {
  const salt = randomBytes(16).toString('base64url');
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('base64url');
  return `pbkdf2:${DIGEST}:${ITERATIONS}:${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  const [scheme, digest, iterations, salt, expectedHash] = String(storedHash).split(':');

  if (scheme !== 'pbkdf2' || !digest || !iterations || !salt || !expectedHash) {
    return false;
  }

  const actual = pbkdf2Sync(password, salt, Number(iterations), KEY_LENGTH, digest);
  const expected = Buffer.from(expectedHash, 'base64url');

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
