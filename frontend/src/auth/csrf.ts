// Shared CSRF helpers. The backend issues the token as a non-HttpOnly cookie
// (and JSON body) via GET /api/auth/csrf-token; mutating requests must echo it
// back in the X-CSRF-Token header.

export function getCsrfToken(): string {
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);
  const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
  return meta?.content || '';
}

// Fetch a CSRF token once if we don't already have one.
export async function ensureCsrfToken(): Promise<string> {
  const existing = getCsrfToken();
  if (existing) return existing;
  try {
    const response = await fetch('/api/auth/csrf-token', { credentials: 'include' });
    const body = (await response.json().catch(() => ({}))) as { csrf_token?: string };
    return body.csrf_token || getCsrfToken();
  } catch {
    return getCsrfToken();
  }
}
