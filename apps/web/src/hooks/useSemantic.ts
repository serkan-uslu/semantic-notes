import { useState, useCallback, useRef } from 'react'
import { searchService } from '@/services/searchService.js'
import type { SearchResult } from '@semantic-notes/shared'

// ─── useSemantic ──────────────────────────────────────────────────────────────

export function useSemantic() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [query, setQuery] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    setQuery(q)
    if (!q.trim()) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      const data = await searchService.search({ query: q, mode: 'hybrid', limit: 15 })
      setResults(data)
    } catch (err) {
      console.error('[Search] failed:', err)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  /* plain function – no useMemo; timer ref prevents stale closures */
  const debouncedSearch = (q: string) => {
    console.log('[useSemantic] debouncedSearch called with:', q)
    if (timerRef.current) clearTimeout(timerRef.current)
    setQuery(q)

    if (!q.trim()) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    timerRef.current = setTimeout(() => {
      console.log('[useSemantic] firing API call for:', q)
      searchService
        .search({ query: q, mode: 'hybrid', limit: 15 })
        .then((data) => {
          console.log('[useSemantic] got results:', data.length)
          setResults(data)
        })
        .catch((err) => {
          console.error('[useSemantic] search failed:', err)
          setResults([])
        })
        .finally(() => {
          setIsSearching(false)
        })
    }, 300)
  }

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setResults([])
    setQuery('')
    setIsSearching(false)
  }, [])

  return { results, isSearching, query, search, debouncedSearch, clear }
}
