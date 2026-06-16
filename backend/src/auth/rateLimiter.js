export function createRateLimiter({ windowMs, max }) {
  const attempts = new Map();

  return function rateLimit(key) {
    const now = Date.now();
    const current = attempts.get(key) || { count: 0, resetAt: now + windowMs };

    if (current.resetAt <= now) {
      current.count = 0;
      current.resetAt = now + windowMs;
    }

    current.count += 1;
    attempts.set(key, current);

    if (current.count > max) {
      const retryAfter = Math.ceil((current.resetAt - now) / 1000);
      throw Object.assign(new Error('Too many requests'), { statusCode: 429, retryAfter });
    }
  };
}
