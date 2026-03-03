import { apiFetch } from '@/lib/apiClient'

// ─── Status Service ───────────────────────────────────────────────────────────

export const statusService = {
  check(): Promise<{
    ollama: { online: boolean; models: string[] }
    chroma: { online: boolean }
  }> {
    return apiFetch('/status')
  },
}
