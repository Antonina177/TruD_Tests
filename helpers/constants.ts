// ─────────────────────────────────────────────────────────────────────────────
// Shared test constants
// Used across all spec files in /tests
// ─────────────────────────────────────────────────────────────────────────────

// ── Credentials ───────────────────────────────────────────────────────────────

export const TEST_USERNAME = 'antonina.horbenko+myadmin@trudiagnostic.com';
export const TEST_PASSWORD = 'Passw0rd!';

// ── Base ──────────────────────────────────────────────────────────────────────

export const BASE_URL = 'https://newadmin.dev.trudiagnostic.com';

// ── API ───────────────────────────────────────────────────────────────────────

export const API_BASE_URL = 'https://ops.dev.trudiagnostic.com';

export const API_ENDPOINTS = {
  auth:         `${API_BASE_URL}/portalApi/Auth`,
  corporations: `${API_BASE_URL}/api/admin/corporations`,
} as const;

// ── Page URLs ─────────────────────────────────────────────────────────────────

export const URLS = {
  signIn:        `${BASE_URL}/sign-in`,
  admin:         `${BASE_URL}/admin`,
  corporations:  `${BASE_URL}/corporations`,
  orders:        `${BASE_URL}/orders`,
  ordersList:    `${BASE_URL}/orders/list`,
  kits:          `${BASE_URL}/kits`,
  patients:      `${BASE_URL}/patients`,
} as const;
