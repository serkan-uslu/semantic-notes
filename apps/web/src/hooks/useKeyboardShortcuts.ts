import { useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore.js'
import { useNoteStore } from '@/stores/noteStore.js'
import { useNoteList } from '@/hooks/useNote.js'

// ─── useKeyboardShortcuts ─────────────────────────────────────────────────────

export function useKeyboardShortcuts() {
  const { setCommandPaletteOpen, setSearchOpen } = useUIStore()
  const { setActiveNote } = useNoteStore()
  const { createNote } = useNoteList()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.startsWith('Mac')
      const modKey = isMac ? e.metaKey : e.ctrlKey

      // Cmd+K — command palette
      if (modKey && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
        return
      }

      // Cmd+Shift+F — semantic search
      if (modKey && e.shiftKey && e.key === 'f') {
        e.preventDefault()
        setSearchOpen(true)
        return
      }

      // Cmd+N — new note
      if (modKey && e.key === 'n') {
        e.preventDefault()
        createNote().then((note) => {
          if (note) setActiveNote(note.id)
        })
        return
      }

      // Escape — close overlays
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false)
        setSearchOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setCommandPaletteOpen, setSearchOpen, createNote, setActiveNote])
}
