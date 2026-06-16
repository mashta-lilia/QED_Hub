const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function validateRegistration(body) {
  const email = normalizeEmail(body.email);
  const password = String(body.password || '');
  const name = String(body.name || '').trim();

  if (!EMAIL_PATTERN.test(email)) {
    return { error: 'A valid email is required' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return { error: 'Password must include at least one letter and one number' };
  }

  if (name.length < 2 || name.length > 80) {
    return { error: 'Name must be between 2 and 80 characters long' };
  }

  return { value: { email, password, name } };
}

export function validateLogin(body) {
  const email = normalizeEmail(body.email);
  const password = String(body.password || '');

  if (!EMAIL_PATTERN.test(email) || !password) {
    return { error: 'Email and password are required' };
  }

  return { value: { email, password } };
}
