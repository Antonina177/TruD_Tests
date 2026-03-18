import { APIRequestContext } from '@playwright/test';
import { API_ENDPOINTS } from './constants';

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

interface CorporationPayload {
  name: string;
}

interface CorporationResponse {
  id: string | number;
  name: string;
  [key: string]: unknown;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Authenticates against the portal API and returns the Bearer access token.
 * Throws if the request fails or the token is missing in the response.
 */
export async function loginAndGetToken(
  request: APIRequestContext,
  username: string,
  password: string,
): Promise<string> {
  console.log(`[AUTH] Logging in as ${username} …`);

  const payload: AuthPayload = {
    username,
    password,
    rememberMe: true,
    antiSpamToken: 'string',
  };

  const response = await request.post(API_ENDPOINTS.auth, {
    data: payload,
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`[AUTH] Failed (${response.status()}): ${body}`);
  }

  const body = (await response.json()) as AuthResponse;
  const token = body?.accessToken?.token;

  if (!token) {
    throw new Error(`[AUTH] Access token missing in response: ${JSON.stringify(body)}`);
  }

  console.log('[AUTH] Token obtained successfully.');
  return token;
}

/**
 * Creates a new corporation via the admin API.
 * Returns the full parsed response body.
 */
export async function createCorporation(
  request: APIRequestContext,
  token: string,
  name: string,
): Promise<CorporationResponse> {
  console.log(`[API] Creating corporation: "${name}" …`);

  const payload: CorporationPayload = { name };

  const response = await request.post(API_ENDPOINTS.corporations, {
    data: payload,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`[API] Create corporation failed (${response.status()}): ${body}`);
  }

  const body = (await response.json()) as CorporationResponse;
  console.log(`[API] Corporation created. Response: ${JSON.stringify(body)}`);
  return body;
}
