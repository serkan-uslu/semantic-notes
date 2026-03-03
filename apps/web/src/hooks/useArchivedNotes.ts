import { useState, useCallback } from 'react'
import { noteService } from '@/services/noteService.js'
import { tryCatch } from '@/lib/utils.js'
import { useNoteStore } from '@/stores/noteStore.js'
import type { Note } from '@semantic-notes/shared'

// ─── useArchivedNotes ─────────────────────────────────────────────────────────

export function useArchivedNotes() {
  const [archived, setArchived] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    const result = await tryCatch(() => noteService.getArchived())
    if (result.ok) setArchived(result.data)
    setIsLoading(false)
  }, [])

  const restore = useCallback(async (id: string) => {
    await noteService.restore(id)
    setArchived((prev) => prev.filter((n) => n.id !== id))
    // Refresh note list in store
    const notes = await noteService.getAll()
    useNoteStore.getState().setNotes(notes)
  }, [])

  const deletePermanent = useCallback(async (id: string) => {
    await noteService.deletePermanent(id)
    setArchived((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return { archived, isLoading, load, restore, deletePermanent }
}
