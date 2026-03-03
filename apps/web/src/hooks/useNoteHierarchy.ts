import { useCallback, useMemo } from 'react'
import { useNoteStore } from '@/stores/noteStore.js'
import type { Note } from '@semantic-notes/shared'

// ─── useNoteHierarchy ─────────────────────────────────────────────────────────

export function useNoteHierarchy() {
  const { notes } = useNoteStore()

  const rootNotes = useMemo(
    () =>
      notes
        .filter((n) => !n.parent_id && !n.is_archived)
        .sort((a, b) => a.order_index - b.order_index),
    [notes]
  )

  const getChildren = useCallback(
    (parentId: string): Note[] =>
      notes
        .filter((n) => n.parent_id === parentId && !n.is_archived)
        .sort((a, b) => a.order_index - b.order_index),
    [notes]
  )

  return { rootNotes, getChildren }
}
