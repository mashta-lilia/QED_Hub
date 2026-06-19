import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  AuthenticatedUser,
  AuthResult,
  AuthViewState,
  RegistrationPayload,
  TokenValidationResponse,
  VerificationPayload,
} from './types';
import {
  allPasswordChecksPass,
  clearSensitiveFields,
  constantTimeEqual,
  createClientVerificationHash,
  formatClock,
  getPasswordChecks,
  maskEmail,
  passwordsMatch,
  sha256Base64Url,
  validateGmailAddress,
} from './security';
import { ensureCsrfToken } from './csrf';

const AUTH_ENDPOINTS = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  verifyEmail: '/api/auth/verify-email',
  resendVerification: '/api/auth/resend-verification',
  googleAuth: '/api/auth/google',
  resetPassword: '/api/auth/resetpassword',
} as const;

const ERROR_MESSAGES: Record<string, string> = {
  AUTH_001: 'Не вдалося обробити запит. Спробуйте ще раз.',
  RATE_LIMIT: 'Забагато спроб. Трохи зачекайте.',
  INVALID_TOKEN: 'Сесія завершилась. Увійдіть ще раз.',
  VERIFY_EXPIRED: 'Код підтвердження протермінований. Запросіть новий.',
  VERIFY_INVALID: 'Невірний код. Перевірте і спробуйте ще раз.',
  VERIFY_LOCKED: 'Забагато невдалих спроб. Спробуйте пізніше.',
  EMAIL_EXISTS: 'Якщо ця адреса доступна, код підтвердження вже надіслано.',
  BOT_DETECTED: 'Виявлено підозрілу активність. Спробуйте пізніше.',
};

interface AuthGatewayProps {
  onAuthenticated: (user: AuthenticatedUser) => void;
}

interface LoginFormState {
  email: string;
  password: string;
}

interface SignupFormState {
  email: string;
  password: string;
  confirmPassword: string;
}

interface VerificationSession {
  sessionId: string;
  expiryTime: number;
  resendCooldownUntil: number;
  resendCount: number;
  attempts: number;
  cooldownUntil: number;
  issuedAt: number;
}

interface RateRecord {
  count: number;
  resetAt: number;
}

const VERIFICATION_CODE_LENGTH = 6;
const MAX_VERIFICATION_ATTEMPTS = 5;
const MAX_RESENDS = 3;
const RESEND_COOLDOWN_MS = 60_000;
const TOKEN_TTL_MS = 10 * 60_000;
const FORM_DEBOUNCE_MS = 500;

function blankLogin(): LoginFormState {
  return { email: '', password: '' };
}

function blankSignup(): SignupFormState {
  return { email: '', password: '', confirmPassword: '' };
}

function mapError(code: string): string {
  return ERROR_MESSAGES[code] || 'Сталася помилка. Спробуйте пізніше.';
}

function readRate(key: string): RateRecord {
  try {
    return JSON.parse(sessionStorage.getItem(key) || '') as RateRecord;
  } catch {
    return { count: 0, resetAt: 0 };
  }
}

function canAttempt(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = readRate(key);
  if (record.resetAt < now) {
    sessionStorage.setItem(key, JSON.stringify({ count: 0, resetAt: now + windowMs }));
    return true;
  }
  return record.count < limit;
}

function recordAttempt(key: string, windowMs: number): void {
  const now = Date.now();
  const record = readRate(key);
  const next: RateRecord =
    record.resetAt < now ? { count: 1, resetAt: now + windowMs } : { count: record.count + 1, resetAt: record.resetAt };
  sessionStorage.setItem(key, JSON.stringify(next));
}

async function postJson<TPayload extends object, TResponse extends AuthResult | TokenValidationResponse>(
  endpoint: string,
  payload: TPayload,
): Promise<TResponse> {
  const csrfToken = await ensureCsrfToken();
  const response = await fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => ({}))) as Partial<TResponse> & { code?: string };
  if (!response.ok) {
    return {
      ok: false,
      valid: false,
      message: mapError(body.code || 'AUTH_001'),
      remainingAttempts: 0,
    } as unknown as TResponse;
  }

  return body as TResponse;
}

function demoResult(email: string, provider: 'password' | 'google' = 'password'): AuthResult {
  return { ok: true, message: 'Готово.', user: { email, provider } };
}

interface BackendAuthResponse {
  access_token?: string;
  user?: { email?: string };
}

// The login/Google endpoints return AuthResponse ({ access_token, user }), not the
// { ok, message, user } shape the UI uses. postJson already normalizes HTTP errors
// to { ok: false }, so only the success body needs mapping here.
function toAuthResult(response: AuthResult, fallbackEmail: string, provider: 'password' | 'google'): AuthResult {
  const raw = response as AuthResult & BackendAuthResponse;
  if (raw.ok === false) return response;
  if (raw.access_token) {
    return { ok: true, message: 'Готово.', user: { email: raw.user?.email || fallbackEmail, provider } };
  }
  if (raw.ok === true && raw.user) return response;
  return { ok: false, message: mapError('AUTH_001') };
}

async function login(email: string, password: string): Promise<AuthResult> {
  if (import.meta.env.DEV) {
    await new Promise((resolve) => window.setTimeout(resolve, 550));
    return password ? demoResult(email) : { ok: false, message: 'Invalid credentials' };
  }

  const response = await postJson<{ email: string; password: string }, AuthResult>(AUTH_ENDPOINTS.login, { email, password });
  return toAuthResult(response, email, 'password');
}

async function register(payload: RegistrationPayload): Promise<AuthResult> {
  if (import.meta.env.DEV) {
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    return {
      ok: true,
      message: 'Якщо ця адреса доступна, код підтвердження вже надіслано.',
      verification: {
        sessionId: window.crypto.randomUUID(),
        expiryTime: Date.now() + TOKEN_TTL_MS,
      },
    };
  }

  return postJson(AUTH_ENDPOINTS.register, payload);
}

async function verifyEmail(payload: VerificationPayload, attemptsLeft: number): Promise<TokenValidationResponse> {
  if (import.meta.env.DEV) {
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    const valid = constantTimeEqual(payload.token, '123456');
    return {
      valid,
      message: valid ? 'Email підтверджено.' : 'Невірний код. Спробуйте ще раз.',
      remainingAttempts: Math.max(0, attemptsLeft - (valid ? 0 : 1)),
    };
  }

  return postJson(AUTH_ENDPOINTS.verifyEmail, payload);
}

async function resendVerification(email: string): Promise<AuthResult> {
  if (import.meta.env.DEV) {
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    return {
      ok: true,
      message: 'Новий код надіслано.',
      verification: {
        sessionId: window.crypto.randomUUID(),
        expiryTime: Date.now() + TOKEN_TTL_MS,
      },
    };
  }

  return postJson(AUTH_ENDPOINTS.resendVerification, { email });
}

async function requestPasswordReset(email: string): Promise<AuthResult> {
  const startedAt = Date.now();
  const result = import.meta.env.DEV
    ? { ok: true, message: 'Якщо акаунт існує, лист для відновлення вже надіслано.' }
    : await postJson<{ email: string }, AuthResult>(AUTH_ENDPOINTS.resetPassword, { email });
  const minimumDelay = 700 + Math.floor(Math.random() * 300);
  const rest = Math.max(0, minimumDelay - (Date.now() - startedAt));
  await new Promise((resolve) => window.setTimeout(resolve, rest));
  return result;
}

async function finishGoogleOAuth(code: string, codeVerifier: string): Promise<AuthResult> {
  if (import.meta.env.DEV) {
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    return demoResult('google.user@gmail.com', 'google');
  }

  const response = await postJson<{ code: string; codeVerifier: string; redirectUri: string }, AuthResult>(AUTH_ENDPOINTS.googleAuth, {
    code,
    codeVerifier,
    redirectUri: window.location.origin,
  });
  return toAuthResult(response, '', 'google');
}

async function createPkceChallenge(): Promise<{ verifier: string; challenge: string }> {
  const values = new Uint8Array(32);
  window.crypto.getRandomValues(values);
  const verifier = btoa(String.fromCharCode(...values)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const challenge = await sha256Base64Url(verifier);
  return { verifier, challenge };
}

function useDebouncedSubmit(): () => boolean {
  const lastSubmit = useRef(0);
  return () => {
    const now = Date.now();
    if (now - lastSubmit.current < FORM_DEBOUNCE_MS) return false;
    lastSubmit.current = now;
    return true;
  };
}

function EyeIcon({ hidden }: { hidden: boolean }): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="3" />
      {hidden && <path d="M4 4l16 16" />}
    </svg>
  );
}

function FieldError({ children }: { children?: string }): JSX.Element | null {
  if (!children) return null;
  return (
    <p className="auth-error" role="alert">
      {children}
    </p>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  disabled: boolean;
}): JSX.Element {
  const [visible, setVisible] = useState(false);
  return (
    <label className="auth-field">
      <span>{label}</span>
      <div className="auth-password">
        <input
          value={value}
          disabled={disabled}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          maxLength={128}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="auth-eye"
          disabled={disabled}
          aria-label={visible ? 'Сховати пароль' : 'Показати пароль'}
          onClick={() => setVisible((v) => !v)}
        >
          <EyeIcon hidden={!visible} />
        </button>
      </div>
    </label>
  );
}

function VerificationTokenInput({
  disabled,
  hasError,
  onComplete,
}: {
  disabled: boolean;
  hasError: boolean;
  onComplete: (token: string) => void;
}): JSX.Element {
  const [digits, setDigits] = useState<string[]>(Array.from({ length: VERIFICATION_CODE_LENGTH }, () => ''));
  const [masked, setMasked] = useState<boolean[]>(Array.from({ length: VERIFICATION_CODE_LENGTH }, () => false));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const updateDigit = useCallback(
    (index: number, nextDigit: string): void => {
      const clean = nextDigit.replace(/\D/g, '').slice(-1);
      setDigits((current) => {
        const next = [...current];
        next[index] = clean;
        const token = next.join('');
        if (clean && index < VERIFICATION_CODE_LENGTH - 1) refs.current[index + 1]?.focus();
        if (token.length === VERIFICATION_CODE_LENGTH) window.setTimeout(() => onComplete(token), 0);
        return next;
      });

      if (clean) {
        setMasked((current) => {
          const next = [...current];
          next[index] = false;
          return next;
        });
        window.setTimeout(() => {
          setMasked((current) => {
            const next = [...current];
            next[index] = true;
            return next;
          });
        }, 1000);
      }
    },
    [onComplete],
  );

  return (
    <div className={'token-row' + (hasError ? ' shake' : '')}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          value={digit && masked[index] ? '•' : digit}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of 6`}
          maxLength={1}
          onChange={(event) => updateDigit(index, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !digits[index] && index > 0) refs.current[index - 1]?.focus();
          }}
          onPaste={(event) => {
            event.preventDefault();
            const paste = event.clipboardData.getData('text').trim();
            if (!/^\d{6}$/.test(paste)) {
              setDigits(Array.from({ length: VERIFICATION_CODE_LENGTH }, () => ''));
              refs.current[0]?.focus();
              return;
            }
            const next = paste.split('');
            setDigits(next);
            window.setTimeout(() => onComplete(next.join('')), 0);
          }}
        />
      ))}
    </div>
  );
}

export function AuthGateway({ onAuthenticated }: AuthGatewayProps): JSX.Element {
  const [viewState, setViewState] = useState<AuthViewState>({ view: 'login' });
  const [loginForm, setLoginForm] = useState<LoginFormState>(blankLogin);
  const [signupForm, setSignupForm] = useState<SignupFormState>(blankSignup);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [tokenError, setTokenError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [verifySession, setVerifySession] = useState<VerificationSession | null>(null);
  const [now, setNow] = useState(Date.now());
  const [recoveryRedirect, setRecoveryRedirect] = useState<number | null>(null);
  const allowSubmit = useDebouncedSubmit();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    if (!code || !state) return;

    const storedState = sessionStorage.getItem('auth:google:state');
    const verifier = sessionStorage.getItem('auth:google:pkce');
    window.history.replaceState({}, document.title, window.location.pathname);

    if (!storedState || !verifier || storedState !== state) {
      setFieldError('Google OAuth сесію не вдалося підтвердити.');
      return;
    }

    sessionStorage.removeItem('auth:google:state');
    sessionStorage.removeItem('auth:google:pkce');
    setBusy(true);
    void finishGoogleOAuth(code, verifier).then((result) => {
      setBusy(false);
      if (result.ok && result.user) {
        onAuthenticated(result.user);
        return;
      }
      setFieldError(result.message);
    });
  }, [onAuthenticated]);

  const emailValidation = useMemo(() => validateGmailAddress(signupForm.email), [signupForm.email]);
  const passwordChecks = useMemo(
    () => getPasswordChecks(signupForm.password, emailValidation.email),
    [signupForm.password, emailValidation.email],
  );
  const passwordReady = allPasswordChecksPass(passwordChecks);
  const confirmationReady = passwordsMatch(signupForm.password, signupForm.confirmPassword);

  const passwordError =
  signupForm.password.length === 0
    ? ''
    : !passwordChecks.minLength
    ? 'Пароль має містити щонайменше 8 символів'
    : !passwordChecks.uppercase
    ? 'Додай хоча б одну велику літеру'
    : !passwordChecks.lowercase
    ? 'Додай хоча б одну малу літеру'
    : !passwordChecks.numeric
    ? 'Додай хоча б одну цифру'
    : !passwordChecks.special
    ? 'Додай хоча б один спецсимвол'
    : !passwordChecks.maxLength
    ? 'Пароль має бути коротший за 128 символів'
    : !passwordChecks.notCommon
    ? 'Цей пароль занадто типовий'
    : !passwordChecks.noSequential
    ? 'Уникай очевидних послідовностей'
    : !passwordChecks.noRepeated
    ? 'Не використовуй 4 однакові символи підряд'
    : !passwordChecks.notEmailDerived
    ? 'Пароль не повинен містити імʼя з email'
    : '';

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      clearSensitiveFields([
        () => setLoginForm(blankLogin()),
        () => setSignupForm(blankSignup()),
        () => setRecoveryEmail(''),
      ]);
    };
  }, []);

  useEffect(() => {
    if (recoveryRedirect === null) return undefined;
    if (recoveryRedirect <= 0) {
      setViewState({ view: 'login' });
      setRecoveryRedirect(null);
      return undefined;
    }
    const timer = window.setTimeout(() => setRecoveryRedirect((value) => (value === null ? null : value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [recoveryRedirect]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!allowSubmit() || busy) return;

    const email = validateGmailAddress(loginForm.email);
    if (!email.ok) {
      setFieldError(email.message);
      return;
    }

    const rateKey = `auth:login:${email.email}`;
    if (!canAttempt(rateKey, 5, 15 * 60_000)) {
      setFieldError(mapError('RATE_LIMIT'));
      return;
    }

    setBusy(true);
    setFieldError('');
    recordAttempt(rateKey, 15 * 60_000);
    const result = await login(email.email, loginForm.password);
    setBusy(false);

    if (result.ok && result.user) {
      setLoginForm(blankLogin());
      onAuthenticated(result.user);
      return;
    }

    setFieldError(result.message || mapError('AUTH_001'));
  }

  async function handleSignup(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!allowSubmit() || busy) return;

    if (!emailValidation.ok) {
      setFieldError(emailValidation.message);
      return;
    }
    if (!passwordReady) {
      setFieldError('Пароль ще не відповідає всім вимогам.');
      return;
    }
    if (!confirmationReady) {
      setFieldError('Паролі не збігаються.');
      return;
    }

    const rateKey = 'auth:register:browser';
    if (!canAttempt(rateKey, 3, 60 * 60_000)) {
      setFieldError(mapError('RATE_LIMIT'));
      return;
    }

    setBusy(true);
    setFieldError('');
    recordAttempt(rateKey, 60 * 60_000);
    const payload: RegistrationPayload = {
      email: emailValidation.email,
      password: signupForm.password,
      clientVerificationHash: await createClientVerificationHash(emailValidation.email),
    };
    const result = await register(payload);
    setBusy(false);
    setSignupForm((current) => ({ ...current, password: '', confirmPassword: '' }));
    setNotice(result.message);

    setVerifySession({
      sessionId: result.verification?.sessionId || window.crypto.randomUUID(),
      expiryTime: result.verification?.expiryTime || Date.now() + TOKEN_TTL_MS,
      resendCooldownUntil: Date.now() + RESEND_COOLDOWN_MS,
      resendCount: 0,
      attempts: 0,
      cooldownUntil: 0,
      issuedAt: Date.now(),
    });
    setViewState({ view: 'verify_email', email: emailValidation.email });
  }

  async function handleVerify(token: string): Promise<void> {
    if (busy || viewState.view !== 'verify_email' || !verifySession) return;
    if (Date.now() < verifySession.cooldownUntil || Date.now() >= verifySession.expiryTime) return;

    setBusy(true);
    setTokenError(false);
    const response = await verifyEmail({ email: viewState.email, token }, MAX_VERIFICATION_ATTEMPTS - verifySession.attempts);
    setBusy(false);

    if (response.valid) {
      setNotice('Email підтверджено. Можна продовжувати.');
      setVerifySession(null);
      onAuthenticated({ email: viewState.email, provider: 'password' });
      return;
    }

    const nextAttempts = verifySession.attempts + 1;
    const cooldownSeconds = [30, 60, 120, 120, 120][Math.min(nextAttempts - 1, 4)];
    setTokenError(true);
    setFieldError(response.message);
    setVerifySession({
      ...verifySession,
      attempts: nextAttempts,
      cooldownUntil: nextAttempts >= MAX_VERIFICATION_ATTEMPTS ? Date.now() + 30 * 60_000 : Date.now() + cooldownSeconds * 1000,
    });
  }

  async function handleResend(): Promise<void> {
    if (busy || viewState.view !== 'verify_email' || !verifySession) return;
    if (Date.now() < verifySession.resendCooldownUntil || verifySession.resendCount >= MAX_RESENDS) return;

    setBusy(true);
    const result = await resendVerification(viewState.email);
    setBusy(false);
    setNotice(result.message);
    setVerifySession({
      sessionId: result.verification?.sessionId || window.crypto.randomUUID(),
      expiryTime: result.verification?.expiryTime || Date.now() + TOKEN_TTL_MS,
      resendCooldownUntil: Date.now() + RESEND_COOLDOWN_MS,
      resendCount: verifySession.resendCount + 1,
      attempts: 0,
      cooldownUntil: 0,
      issuedAt: Date.now(),
    });
  }

  async function handleRecovery(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!allowSubmit() || busy) return;

    const email = validateGmailAddress(recoveryEmail);
    if (!email.ok) {
      setFieldError(email.message);
      return;
    }

    const rateKey = 'auth:recovery:browser';
    if (!canAttempt(rateKey, 3, 24 * 60 * 60_000)) {
      setFieldError(mapError('RATE_LIMIT'));
      return;
    }

    setBusy(true);
    setFieldError('');
    recordAttempt(rateKey, 24 * 60 * 60_000);
    const result = await requestPasswordReset(email.email);
    setBusy(false);
    setRecoveryEmail('');
    setNotice(result.message);
    setRecoveryRedirect(5);
  }

  async function startGoogleOAuth(): Promise<void> {
    if (busy) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) {
      setFieldError('Додайте VITE_GOOGLE_CLIENT_ID, щоб увімкнути Google OAuth.');
      return;
    }

    const { verifier, challenge } = await createPkceChallenge();
    const state = window.crypto.randomUUID();
    sessionStorage.setItem('auth:google:pkce', verifier);
    sessionStorage.setItem('auth:google:state', state);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: window.location.origin,
      response_type: 'code',
      scope: 'email profile',
      code_challenge: challenge,
      code_challenge_method: 'S256',
      state,
      prompt: 'select_account',
    });
    window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  }

  const verifySeconds = verifySession ? Math.max(0, Math.ceil((verifySession.expiryTime - now) / 1000)) : 0;
  const resendSeconds = verifySession ? Math.max(0, Math.ceil((verifySession.resendCooldownUntil - now) / 1000)) : 0;
  const verifyCooldown = verifySession ? Math.max(0, Math.ceil((verifySession.cooldownUntil - now) / 1000)) : 0;
  const verificationLocked = Boolean(verifySession && verifySession.attempts >= MAX_VERIFICATION_ATTEMPTS);
  const tokenExpired = Boolean(verifySession && verifySeconds <= 0);

  return (
    <div className="auth-shell">
      <section className="auth-card" aria-busy={busy}>
        <div className="auth-brand">
          <span className="auth-mark" />
          <div>
            <b>Q.E.D</b>
            <p>Безпечний вхід до навчальної платформи</p>
          </div>
        </div>

        <div className="auth-tabs" role="tablist">
          <button type="button" className={viewState.view === 'login' ? 'active' : ''} disabled={busy} onClick={() => setViewState({ view: 'login' })}>
            Вхід
          </button>
          <button type="button" className={viewState.view === 'signup' ? 'active' : ''} disabled={busy} onClick={() => setViewState({ view: 'signup' })}>
            Реєстрація
          </button>
        </div>

        {notice && <p className="auth-notice">{notice}</p>}
        <FieldError>{fieldError}</FieldError>

        {viewState.view === 'login' && (
          <form className="auth-form" onSubmit={handleLogin}>
            <h1>Увійти</h1>
            <label className="auth-field">
              <span>Gmail</span>
              <input
                value={loginForm.email}
                disabled={busy}
                type="email"
                autoComplete="email"
                maxLength={254}
                onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <PasswordField
              label="Пароль"
              value={loginForm.password}
              disabled={busy}
              autoComplete="current-password"
              onChange={(password) => setLoginForm((current) => ({ ...current, password }))}
            />
            
            <button className="auth-link" type="button" disabled={busy} onClick={() => setViewState({ view: 'forgot_password' })}>
              Забули пароль?
            </button>
            <button className="auth-submit" disabled={busy || !loginForm.email || !loginForm.password}>
              {busy ? 'Перевіряємо...' : 'Увійти'}
            </button>
            <button className="auth-google" type="button" disabled={busy} onClick={startGoogleOAuth}>
              Продовжити з Google
            </button>
          </form>
        )}

        {viewState.view === 'signup' && (
          <form className="auth-form" onSubmit={handleSignup}>
            <h1>Створити акаунт</h1>
            <label className="auth-field">
              <span>Gmail</span>
              <input
                value={signupForm.email}
                disabled={busy}
                type="email"
                autoComplete="email"
                maxLength={254}
                onChange={(event) => setSignupForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <PasswordField
  label="Пароль"
  value={signupForm.password}
  disabled={busy}
  autoComplete="new-password"
  onChange={(password) => setSignupForm((current) => ({ ...current, password }))}
 />
{passwordError && <FieldError>{passwordError}</FieldError>}

<PasswordField
  label="Повторіть пароль"
  value={signupForm.confirmPassword}
  disabled={busy}
  autoComplete="new-password"
  onChange={(confirmPassword) => setSignupForm((current) => ({ ...current, confirmPassword }))}
 />

{signupForm.confirmPassword && !confirmationReady && <FieldError>Паролі не збігаються.</FieldError>}

<button
  className="auth-submit"
  disabled={busy || !signupForm.email || !signupForm.password || !signupForm.confirmPassword}
>
  {busy ? 'Створюємо...' : 'Створити акаунт'}
</button>
          </form>
        )}

        {viewState.view === 'verify_email' && verifySession && (
          <div className="auth-form">
            <h1>Підтвердіть email</h1>
            <p className="verify-banner">Ми надіслали код на {maskEmail(viewState.email)}</p>
            <p className={'verify-timer ' + (verifySeconds < 60 ? 'critical' : verifySeconds < 300 ? 'warning' : 'normal')}>
              {tokenExpired ? 'Код протермінований' : `Код діє ще ${formatClock(verifySeconds)}`}
            </p>
            <VerificationTokenInput
              disabled={busy || tokenExpired || verificationLocked || verifyCooldown > 0}
              hasError={tokenError}
              onComplete={handleVerify}
            />
            <p className="verify-meta">
              {verificationLocked
                ? 'Ліміт спроб вичерпано. Спробуйте пізніше.'
                : verifyCooldown > 0
                  ? `Наступна спроба через ${verifyCooldown} с`
                  : `${MAX_VERIFICATION_ATTEMPTS - verifySession.attempts} спроб залишилось`}
            </p>
            <button className="auth-submit" type="button" disabled={busy || resendSeconds > 0 || verifySession.resendCount >= MAX_RESENDS} onClick={handleResend}>
              {resendSeconds > 0 ? `Надіслати ще раз через ${resendSeconds} с` : 'Надіслати код ще раз'}
            </button>
            <button className="auth-link" type="button" disabled={busy} onClick={() => setViewState({ view: 'signup' })}>
              Змінити email
            </button>
          </div>
        )}

        {viewState.view === 'forgot_password' && (
          <form className="auth-form" onSubmit={handleRecovery}>
            <h1>Відновити пароль</h1>
            <label className="auth-field">
              <span>Gmail</span>
              <input
                value={recoveryEmail}
                disabled={busy}
                type="email"
                autoComplete="off"
                maxLength={254}
                onChange={(event) => setRecoveryEmail(event.target.value)}
              />
            </label>
            {recoveryRedirect !== null && <p className="verify-meta">Повернення до входу через {recoveryRedirect} с</p>}
            <button className="auth-submit" disabled={busy || !recoveryEmail}>
              {busy ? 'Надсилаємо...' : 'Надіслати лист'}
            </button>
            <button className="auth-link" type="button" disabled={busy} onClick={() => setViewState({ view: 'login' })}>
              Назад до входу
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
