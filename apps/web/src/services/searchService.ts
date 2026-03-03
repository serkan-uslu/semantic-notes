import { apiFetch } from '@/lib/apiClient'
import type { SearchResult, SearchQuery } from '@semantic-notes/shared'

// ─── Search Service ───────────────────────────────────────────────────────────

export const searchService = {
  search(query: SearchQuery): Promise<SearchResult[]> {
    const params = new URLSearchParams({
      q: query.query,
      limit: String(query.limit ?? 10),
      mode: query.mode ?? 'hybrid',
    })
    return apiFetch(`/search?${params}`)
  },

  embedNote(noteId: string): Promise<void> {
    return apiFetch(`/search/embed/${noteId}`, { method: 'POST' })
  },
}
