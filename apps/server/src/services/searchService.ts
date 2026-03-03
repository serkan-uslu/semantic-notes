import { embeddingService } from '../ai/embeddingService.js'
import { noteRepository } from '../repositories/noteRepository.js'
import type { SearchResult } from '@semantic-notes/shared'

// ─── Hybrid Search Service ────────────────────────────────────────────────────
// Business logic for merging semantic + full-text results.
// Routes only handle HTTP parsing and response formatting.

export async function hybridSearch(
  query: string,
  mode: 'semantic' | 'fulltext' | 'hybrid',
  limit: number
): Promise<SearchResult[]> {
  const results: SearchResult[] = []
  const seen = new Set<string>()

  if (mode === 'semantic' || mode === 'hybrid') {
    const semanticResults = await embeddingService.searchSemantic(query, limit)
    for (const r of semanticResults) {
      if (!seen.has(r.noteId)) {
        seen.add(r.noteId)
        results.push({
          note_id: r.noteId,
          title: r.title,
          snippet: r.snippet,
          score: r.score,
          source: 'semantic',
        })
      }
    }
  }

  if (mode === 'fulltext' || mode === 'hybrid') {
    const ftResults = noteRepository.searchFullText(query, limit)
    for (const r of ftResults) {
      if (!seen.has(r.id)) {
        seen.add(r.id)
        results.push({
          note_id: r.id,
          title: r.title,
          snippet: (r as typeof r & { snippet: string }).snippet ?? '',
          score: 1,
          source: 'fulltext',
        })
      }
    }
  }

  results.sort((a, b) => b.score - a.score)
  return results.slice(0, limit)
}
