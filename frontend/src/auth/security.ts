import type { PasswordChecks } from './types';

const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'temp-mail.org',
  'yopmail.com',
  'throwawaymail.com',
  'trashmail.com',
]);

const COMMON_PASSWORDS = new Set([
  'password',
  'password1',
  'qwerty123',
  'qwertyuiop',
  'admin1234',
  'letmein123',
  'welcome1',
  'abc123456',
  '12345678',
  '123456789',
  '11111111',
]);

export interface EmailValidationResult {
  ok: boolean;
  email: string;
  message: string;
}

export function stripUnsafeInput(value: string): string {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\b(select|insert|update|delete|drop|union|--|;)\b/gi, '')
    .trim();
}

export function validateGmailAddress(rawEmail: string): EmailValidationResult {
  const cleaned = stripUnsafeInput(rawEmail).toLowerCase();

  if (!cleaned) {
    return { ok: false, email: '', message: 'Введіть email.' };
  }

  if (cleaned.length > 254) {
    return { ok: false, email: cleaned, message: 'Email занадто довгий.' };
  }

  if (!EMAIL_PATTERN.test(cleaned)) {
    return { ok: false, email: cleaned, message: 'Перевірте формат email.' };
  }

  const [username = '', domain = ''] = cleaned.split('@');
  if (domain !== 'gmail.com') {
    return { ok: false, email: cleaned, message: 'Дозволені лише Gmail адреси.' };
  }

  if (username.includes('+')) {
    return { ok: false, email: cleaned, message: 'Gmail alias через + не дозволений.' };
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { ok: false, email: cleaned, message: 'Тимчасові пошти не дозволені.' };
  }

  const normalized = `${username.replace(/\./g, '')}@gmail.com`;
  return { ok: true, email: normalized, message: '' };
}

export function maskEmail(email: string): string {
  const [username = '', domain = ''] = email.split('@');
  if (username.length <= 3) return `${username.slice(0, 1)}***@${domain}`;
  return `${username.slice(0, 2)}***${username.slice(-1)}@${domain}`;
}

function hasSequentialRun(value: string): boolean {
  const normalized = value.toLowerCase();
  const alph = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';

  for (let i = 0; i <= alph.length - 5; i += 1) {
    if (normalized.includes(alph.slice(i, i + 5))) return true;
  }

  for (let i = 0; i <= nums.length - 5; i += 1) {
    if (normalized.includes(nums.slice(i, i + 5))) return true;
  }

  return false;
}

export function getPasswordChecks(password: string, email: string): PasswordChecks {
  const username = email.split('@')[0]?.replace(/\./g, '').toLowerCase() || '';
  const lowerPassword = password.toLowerCase();

  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numeric: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
    maxLength: password.length <= 128,
    notCommon: !COMMON_PASSWORDS.has(lowerPassword),
    noSequential: !hasSequentialRun(password),
    noRepeated: !/(.)\1{3,}/.test(password),
    notEmailDerived: username.length < 3 || !lowerPassword.includes(username),
  };
}

export function allPasswordChecksPass(checks: PasswordChecks): boolean {
  return Object.values(checks).every(Boolean);
}

export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password.trim() === confirmPassword.trim();
}

export async function sha256(value: string): Promise<string> {
  if (!window.crypto?.subtle) {
    throw new Error('Web Crypto API is unavailable');
  }

  const bytes = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function base64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sha256Base64Url(value: string): Promise<string> {
  if (!window.crypto?.subtle) {
    throw new Error('Web Crypto API is unavailable');
  }

  const bytes = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest('SHA-256', bytes);
  return base64Url(new Uint8Array(digest));
}

export async function createClientVerificationHash(email: string): Promise<string> {
  return sha256(`${email}:${Date.now()}`);
}

export function constantTimeEqual(a: string, b: string): boolean {
  const maxLength = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;

  for (let i = 0; i < maxLength; i += 1) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }

  return diff === 0;
}

export function secondsUntil(timestamp: number): number {
  return Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));
}

export function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export function clearSensitiveFields(fields: Array<() => void>): void {
  fields.forEach((clear) => clear());
}
