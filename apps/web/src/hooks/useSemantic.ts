import { useState, useCallback } from 'react'
import { searchService } from '../services/searchService.js'
import { tryCatch, debounce } from '../lib/utils.js'
import type { SearchResult } from '@semantic-notes/shared'

// ─── useSemantic ──────────────────────────────────────────────────────────────

export function useSemantic() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [query, setQuery] = useState('')

  const search = useCallback(async (q: string) => {
    setQuery(q)
    if (!q.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    const result = await tryCatch(() =>
      searchService.search({ query: q, mode: 'hybrid', limit: 15 })
    )
    if (result.ok) {
      setResults(result.data)
    }
    setIsSearching(false)
  }, [])

  const debouncedSearch = useCallback(
    debounce((q: unknown) => search(q as string), 300),
    [search]
  )

  const clear = useCallback(() => {
    setResults([])
    setQuery('')
  }, [])

  return { results, isSearching, query, search, debouncedSearch, clear }
}
