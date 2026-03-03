import { useState, useEffect, useRef } from 'react'
import { Search, FileText, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/utils.js'
import { useUIStore } from '../../../stores/uiStore.js'
import { useNoteStore } from '../../../stores/noteStore.js'
import { useNoteList } from '../../../hooks/useNote.js'
import type { Note } from '@semantic-notes/shared'

// ─── CommandPalette ───────────────────────────────────────────────────────────

export function CommandPalette() {
  const { t } = useTranslation('common')
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore()
  const { notes, setActiveNote } = useNoteStore()
  useNoteList() // preload notes
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [commandPaletteOpen])

  const filteredNotes: Note[] = query
    ? notes
        .filter(
          (n) =>
            !n.is_archived &&
            (n.title.toLowerCase().includes(query.toLowerCase()) ||
              !n.title)
        )
        .slice(0, 8)
    : notes.filter((n) => !n.is_archived).slice(0, 8)

  const handleSelect = (noteId: string) => {
    setActiveNote(noteId)
    setCommandPaletteOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, filteredNotes.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const note = filteredNotes[selected]
      if (note) handleSelect(note.id)
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false)
    }
  }

  if (!commandPaletteOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24"
      onClick={() => setCommandPaletteOpen(false)}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl bg-bg-primary border border-border rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={16} className="text-text-tertiary shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('nav.search') + '...'}
            className="flex-1 bg-transparent text-text-primary text-base outline-none placeholder:text-text-tertiary"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="text-text-tertiary hover:text-text-secondary"
          >
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-1">
          {filteredNotes.length === 0 ? (
            <p className="text-center text-text-tertiary text-sm py-6">
              No results
            </p>
          ) : (
            filteredNotes.map((note, i) => (
              <button
                key={note.id}
                className={cn(
                  'flex items-center gap-3 w-full h-9 px-4 text-sm text-left',
                  'transition-colors duration-fast',
                  i === selected
                    ? 'bg-bg-active text-text-primary'
                    : 'text-text-secondary hover:bg-bg-hover'
                )}
                onClick={() => handleSelect(note.id)}
                onMouseEnter={() => setSelected(i)}
              >
                {note.icon ? (
                  <span className="text-base shrink-0">{note.icon}</span>
                ) : (
                  <FileText size={14} className="text-text-tertiary shrink-0" />
                )}
                <span className="flex-1 truncate">{note.title || 'Untitled'}</span>
                <span className="text-xs text-text-tertiary">↵</span>
              </button>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border">
          <span className="text-xs text-text-tertiary">
            <kbd className="font-mono">↑↓</kbd> navigate
          </span>
          <span className="text-xs text-text-tertiary">
            <kbd className="font-mono">↵</kbd> open
          </span>
          <span className="text-xs text-text-tertiary">
            <kbd className="font-mono">Esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  )
}
