import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNoteStore } from '@/stores/noteStore.js'
import { noteService } from '@/services/noteService.js'
import { tryCatch, debounce } from '@/lib/utils.js'
import { DEBOUNCE_SAVE_MS } from '@/lib/constants.js'
import toast from 'react-hot-toast'
import type { NoteWithBlocks, UpdateNoteInput } from '@semantic-notes/shared'

// Re-export co-located note hooks for backward compatibility
export { useNoteList } from '@/hooks/useNoteList.js'
export { useNoteHierarchy } from '@/hooks/useNoteHierarchy.js'
export { useArchivedNotes } from '@/hooks/useArchivedNotes.js'

// ─── useNote ─────────────────────────────────────────────────────────────────────────

export function useNote(noteId: string | null) {
  const { updateNote } = useNoteStore()
  const [note, setNote] = useState<NoteWithBlocks | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!noteId) {
      setNote(null)
      return
    }

    setIsLoading(true)
    noteService
      .getById(noteId)
      .then(setNote)
      .catch(() => toast.error('Failed to load note'))
      .finally(() => setIsLoading(false))
  }, [noteId])

  const save = useCallback(
    async (data: UpdateNoteInput) => {
      if (!noteId) return
      const result = await tryCatch(() => noteService.update(noteId, data))
      if (result.ok) {
        updateNote(noteId, result.data)
        setNote((prev) =>
          prev ? { ...prev, ...result.data, blocks: data.blocks ?? prev.blocks } : null
        )
      }
    },
    [noteId, updateNote]
  )

  const debouncedSave = useMemo(
    () => debounce((data: UpdateNoteInput) => save(data), DEBOUNCE_SAVE_MS),
    [save]
  )

  const archive = useCallback(async () => {
    if (!noteId) return
    await noteService.archive(noteId)
    useNoteStore.getState().removeNote(noteId)
  }, [noteId])

  return { note, isLoading, save, debouncedSave, archive }
}
