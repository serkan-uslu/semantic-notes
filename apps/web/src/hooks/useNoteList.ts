import { useState, useEffect, useCallback } from 'react'
import { useNoteStore } from '@/stores/noteStore.js'
import { noteService } from '@/services/noteService.js'
import { tryCatch } from '@/lib/utils.js'
import toast from 'react-hot-toast'

// ─── useNoteList ──────────────────────────────────────────────────────────────

export function useNoteList() {
  const { notes, setNotes, addNote } = useNoteStore()
  const [isLoading, setIsLoading] = useState(notes.length === 0)

  useEffect(() => {
    async function load() {
      const result = await tryCatch(() => noteService.getAll())
      if (result.ok) {
        setNotes(result.data)
      }
      setIsLoading(false)
    }
    load()
  }, [setNotes])

  const createNote = useCallback(
    async (parentId?: string) => {
      const result = await tryCatch(() =>
        noteService.create({ title: '', parent_id: parentId })
      )
      if (result.ok) {
        addNote(result.data)
        return result.data
      }
      toast.error('Failed to create note')
      return null
    },
    [addNote]
  )

  return { notes, isLoading, createNote }
}
