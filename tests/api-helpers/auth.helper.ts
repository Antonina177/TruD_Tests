import { API_ENDPOINTS } from '../../helpers/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthPayload {
  username: string;
  password: string;
  rememberMe: boolean;
  antiSpamToken: string;
}

interface AuthResponse {
  accessToken: {
    token: string;
    expiresAt?: string;
  };
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Authenticates against the portal API using native fetch.
 * Returns the Bearer access token string.
 * Throws with a descriptive message if auth fails or the token is absent.
 *
 * Does NOT require a Playwright request fixture — safe to call from any context.
 */
export async function loginAPI(username: string, password: string): Promise<string> {
  console.log(`[AUTH] Logging in as ${username} …`);

  const payload: AuthPayload = {
    username,
    password,
    rememberMe: true,
    antiSpamToken: 'string',
  };

  const response = await fetch(API_ENDPOINTS.auth, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`[AUTH] Failed (${response.status}): ${body}`);
  }

  const body = (await response.json()) as AuthResponse;
  const token = body?.accessToken?.token;

  if (!token) {
    throw new Error(`[AUTH] Access token missing in response: ${JSON.stringify(body)}`);
  }

  console.log('[AUTH] Token obtained successfully.');
  return token;
}
