import type {
  Note,
  NoteWithBlocks,
  CreateNoteInput,
  UpdateNoteInput,
} from '@semantic-notes/shared'
import { apiFetch } from '@/lib/apiClient'

// ─── Note Service ─────────────────────────────────────────────────────────────

export const noteService = {
  getAll(): Promise<Note[]> {
    return apiFetch('/notes')
  },

  getArchived(): Promise<Note[]> {
    return apiFetch('/notes/archived')
  },

  getById(id: string): Promise<NoteWithBlocks> {
    return apiFetch(`/notes/${id}`)
  },

  create(data: CreateNoteInput): Promise<Note> {
    return apiFetch('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update(id: string, data: UpdateNoteInput): Promise<Note> {
    return apiFetch(`/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  archive(id: string): Promise<void> {
    return apiFetch(`/notes/${id}`, { method: 'DELETE' })
  },

  restore(id: string): Promise<void> {
    return apiFetch(`/notes/${id}/restore`, { method: 'POST' })
  },

  deletePermanent(id: string): Promise<void> {
    return apiFetch(`/notes/${id}/permanent`, { method: 'DELETE' })
  },

  reorder(
    id: string,
    parentId: string | null,
    orderIndex: number
  ): Promise<void> {
    return apiFetch(`/notes/${id}/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ parent_id: parentId, order_index: orderIndex }),
    })
  },

  searchFullText(query: string, limit = 10): Promise<Note[]> {
    const params = new URLSearchParams({ q: query, limit: String(limit) })
    return apiFetch(`/notes/search/fulltext?${params}`)
  },
}


