import { Router } from 'express'
import { z } from 'zod'
import { noteRepository } from '../repositories/noteRepository.js'
import { embeddingService } from '../ai/embeddingService.js'
import { CreateNoteSchema, UpdateNoteSchema, ReorderNoteSchema } from '@semantic-notes/shared'
import type { UpdateNoteInput } from '@semantic-notes/shared'

// The strict BlockSchema rejects BlockNote's native JSON format (which stores full block
// objects in the content field). Accept raw unknown[] here so the editor can save freely;
// noteRepository.replaceBlocks stores blocks as JSON.stringify(block) regardless of schema.
const PatchNoteSchema = UpdateNoteSchema.omit({ blocks: true }).extend({
  blocks: z.array(z.unknown()).optional(),
})

export const notesRouter = Router()

// GET /api/notes — list all notes
notesRouter.get('/', (_req, res) => {
  const notes = noteRepository.findAll()
  res.json({ ok: true, data: notes })
})

// GET /api/notes/archived — archived notes
notesRouter.get('/archived', (_req, res) => {
  const notes = noteRepository.findArchived()
  res.json({ ok: true, data: notes })
})

// GET /api/notes/:id — get single note with blocks
notesRouter.get('/:id', (req, res) => {
  const note = noteRepository.findWithBlocks(req.params.id)
  if (!note) return res.status(404).json({ ok: false, error: 'Note not found' })
  return res.json({ ok: true, data: note })
})

// POST /api/notes — create note
notesRouter.post('/', (req, res) => {
  const parsed = CreateNoteSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.message })
  }
  const note = noteRepository.create(parsed.data)
  return res.status(201).json({ ok: true, data: note })
})

// PATCH /api/notes/:id — update note
notesRouter.patch('/:id', (req, res) => {
  const parsed = PatchNoteSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.message })
  }

  const updated = noteRepository.update(req.params.id, parsed.data as UpdateNoteInput)
  if (!updated) return res.status(404).json({ ok: false, error: 'Note not found' })

  // Trigger background embedding after save
  if (parsed.data.blocks !== undefined) {
    embeddingService.embedNote(req.params.id).catch(console.error)
  }

  return res.json({ ok: true, data: updated })
})

// PATCH /api/notes/:id/reorder — reorder note
notesRouter.patch('/:id/reorder', (req, res) => {
  const parsed = ReorderNoteSchema.safeParse({ id: req.params.id, ...req.body })
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.message })
  }
  noteRepository.reorder(parsed.data.id, parsed.data.parent_id, parsed.data.order_index)
  return res.json({ ok: true, data: null })
})

// DELETE /api/notes/:id — archive
notesRouter.delete('/:id', (req, res) => {
  const note = noteRepository.findById(req.params.id)
  if (!note) return res.status(404).json({ ok: false, error: 'Note not found' })
  noteRepository.archive(req.params.id)
  return res.json({ ok: true, data: null })
})

// POST /api/notes/:id/restore — restore from archive
notesRouter.post('/:id/restore', (req, res) => {
  noteRepository.restore(req.params.id)
  return res.json({ ok: true, data: null })
})

// DELETE /api/notes/:id/permanent — permanent delete (archives first if needed)
notesRouter.delete('/:id/permanent', (req, res) => {
  const note = noteRepository.findById(req.params.id)
  if (!note) return res.status(404).json({ ok: false, error: 'Note not found' })
  if (!note.is_archived) {
    noteRepository.archive(req.params.id)
  }
  noteRepository.deleteForever(req.params.id)
  return res.json({ ok: true, data: null })
})

// GET /api/notes/search/fulltext?q=... — full-text search
notesRouter.get('/search/fulltext', (req, res) => {
  const query = String(req.query.q ?? '')
  const limit = Number(req.query.limit ?? 10)
  if (!query) return res.status(400).json({ ok: false, error: 'Query required' })
  const results = noteRepository.searchFullText(query, limit)
  return res.json({ ok: true, data: results })
})
