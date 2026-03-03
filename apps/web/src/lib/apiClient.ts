// ─── API Client ───────────────────────────────────────────────────────────────
// Single source of truth for all HTTP calls.
// Change base URL, auth headers or error handling here once.

const API_BASE = '/api'

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  const json = (await res.json()) as { ok: boolean; data?: T; error?: string }

  if (!json.ok) {
    throw new Error(json.error ?? `API error: ${res.status}`)
  }

  return json.data as T
}
