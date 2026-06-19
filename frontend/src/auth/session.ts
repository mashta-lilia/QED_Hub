import { ensureCsrfToken } from './csrf';
import type { AuthenticatedUser } from './types';

interface RefreshResponse {
  user?: { email?: string };
}

// Attempt to restore a session from the HttpOnly refresh cookie.
// Returns the authenticated user, or null when there is no valid session.
export async function restoreSession(): Promise<AuthenticatedUser | null> {
  // DEV uses a mocked auth flow with no backend, so there is nothing to restore.
  if (import.meta.env.DEV) return null;
  try {
    const csrfToken = await ensureCsrfToken();
    const response = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRF-Token': csrfToken },
    });
    if (!response.ok) return null;
    const body = (await response.json().catch(() => ({}))) as RefreshResponse;
    const email = body.user?.email;
    return email ? { email, provider: 'password' } : null;
  } catch {
    return null;
  }
}

// Revoke the session server-side and clear the refresh cookie.
export async function logout(): Promise<void> {
  if (import.meta.env.DEV) return;
  try {
    const csrfToken = await ensureCsrfToken();
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRF-Token': csrfToken },
    });
  } catch {
    // Clearing client state is enough for the UX even if this call fails.
  }
}
