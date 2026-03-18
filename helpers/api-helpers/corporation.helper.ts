import { API_ENDPOINTS } from '../constants';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Corporation {
  id: string | number;
  name: string;
  [key: string]: unknown;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Creates a new corporation via the admin API.
 * Requires a valid Bearer token obtained from loginAPI().
 * Returns the full corporation object (id, name, …).
 */
export async function createCorporationAPI(token: string, name: string): Promise<Corporation> {
  console.log(`[API] Creating corporation: "${name}" …`);

  const response = await fetch(API_ENDPOINTS.corporations, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`[API] Create corporation failed (${response.status}): ${body}`);
  }

  const body = (await response.json()) as Corporation;
  console.log(`[API] Corporation created — id: ${body.id}, name: ${body.name}`);
  return body;
}

/**
 * Deletes a corporation by ID via the admin API.
 * Requires a valid Bearer token obtained from loginAPI().
 */
export async function deleteCorporationAPI(token: string, id: string | number): Promise<void> {
  console.log(`[API] Deleting corporation id: ${id} …`);

  const response = await fetch(`${API_ENDPOINTS.corporations}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`[API] Delete corporation failed (${response.status}): ${body}`);
  }

  console.log(`[API] Corporation ${id} deleted successfully.`);
}
