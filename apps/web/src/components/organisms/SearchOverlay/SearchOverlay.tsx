import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/stores/uiStore.js'
import { useNoteStore } from '@/stores/noteStore.js'
import { useSemantic } from '@/hooks/useSemantic.js'
import { Badge } from '@/components/atoms/Badge/Badge.js'
import { Spinner } from '@/components/atoms/Spinner/Spinner.js'
import { cn } from '@/lib/utils.js'

export function SearchOverlay() {
  const { t } = useTranslation('common')
  const { searchOpen, setSearchOpen } = useUIStore()
  const { setActiveNote } = useNoteStore()
  const { results, isSearching, debouncedSearch, clear } = useSemantic()
  const [inputValue, setInputValue] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setSelected(0)
    } else {
      setInputValue('')
      clear()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen])

  useEffect(() => {
    setSelected(0)
  }, [results])

  function close() {
    setSearchOpen(false)
  }

  function pick(noteId: string) {
    setActiveNote(noteId)
    close()
  }

  function handleChange(value: string) {
    setInputValue(value)
    debouncedSearch(value)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter' && results[selected]) {
      pick(results[selected].note_id)
    } else if (e.key === 'Escape') {
      close()
    }
  }

  if (!searchOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-xl bg-bg-elevated border border-border rounded-lg shadow-xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 border-b border-border">
          {isSearching ? <Spinner size="sm" /> : <Search className="text-text-tertiary" size={16} />}
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder={t('search.placeholder')}
            className="flex-1 h-12 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
          />
          {inputValue && (
            <button onClick={() => handleChange('')} className="text-text-tertiary hover:text-text-secondary">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto py-1">
            {results.map((r, i) => (
              <li
                key={r.note_id + i}
                onMouseDown={() => pick(r.note_id)}
                className={cn(
                  'flex items-start gap-3 px-4 py-2 cursor-pointer',
                  i === selected ? 'bg-bg-secondary' : 'hover:bg-bg-secondary'
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{r.title}</p>
                  {r.snippet && (
                    <p className="text-xs text-text-tertiary mt-0.5 line-clamp-2">{r.snippet}</p>
                  )}
                </div>
                {r.score != null && (
                  <Badge variant="ai" className="shrink-0 mt-0.5">
                    {Math.round(r.score * 100)}%
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}

        {inputValue && !isSearching && results.length === 0 && (
          <div className="px-4 py-6 text-sm text-text-tertiary text-center">
            {t('search.noResults')}
          </div>
        )}

        {!inputValue && (
          <div className="px-4 py-3 text-xs text-text-tertiary">
            {t('search.semanticHint')}
          </div>
        )}
      </div>
    </div>
  )
}
