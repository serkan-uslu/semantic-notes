import { eq, and, isNull, desc, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '~/db/index.js'
import { notes, blocks } from '~/db/schema.js'
import type {
  Note,
  CreateNoteInput,
  UpdateNoteInput,
  Block,
} from '@semantic-notes/shared'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function now() {
  return new Date().toISOString()
}

function parseBlocks(raw: typeof blocks.$inferSelect[]): Block[] {
  return raw
    .sort((a, b) => a.order_index - b.order_index)
    .map((b) => {
      try {
        return JSON.parse(b.content) as Block
      } catch {
        return { type: 'paragraph', content: [] } as Block
      }
    })
}

// ─── Note Repository ──────────────────────────────────────────────────────────

export const noteRepository = {
  /**
   * Get all non-archived notes (metadata only, no blocks)
   */
  findAll(): Note[] {
    return db
      .select()
      .from(notes)
      .where(eq(notes.is_archived, false))
      .orderBy(notes.order_index)
      .all() as Note[]
  },

  /**
   * Get all archived notes
   */
  findArchived(): Note[] {
    return db
      .select()
      .from(notes)
      .where(eq(notes.is_archived, true))
      .orderBy(desc(notes.updated_at))
      .all() as Note[]
  },

  /**
   * Get a single note by ID (metadata only)
   */
  findById(id: string): Note | null {
    const row = db.select().from(notes).where(eq(notes.id, id)).get()
    return (row as Note) ?? null
  },

  /**
   * Get note with all its blocks
   */
  findWithBlocks(id: string): (Note & { blocks: Block[] }) | null {
    const note = noteRepository.findById(id)
    if (!note) return null

    const rawBlocks = db
      .select()
      .from(blocks)
      .where(eq(blocks.note_id, id))
      .orderBy(blocks.order_index)
      .all()

    return { ...note, blocks: parseBlocks(rawBlocks) }
  },

  /**
   * Create a new note
   */
  create(input: CreateNoteInput): Note {
    const id = nanoid()
    const ts = now()

    // Determine order_index: put at end of siblings
    const siblings = db
      .select({ order_index: notes.order_index })
      .from(notes)
      .where(
        input.parent_id
          ? eq(notes.parent_id, input.parent_id)
          : isNull(notes.parent_id)
      )
      .all()

    const maxOrder = siblings.reduce(
      (max, s) => Math.max(max, s.order_index),
      0
    )

    db.insert(notes)
      .values({
        id,
        title: input.title ?? '',
        icon: input.icon ?? null,
        parent_id: input.parent_id ?? null,
        order_index: maxOrder + 1,
        is_archived: false,
        created_at: ts,
        updated_at: ts,
      })
      .run()

    return noteRepository.findById(id)!
  },

  /**
   * Update note metadata (and optionally its blocks)
   */
  update(id: string, input: UpdateNoteInput): Note | null {
    const ts = now()
    const existing = noteRepository.findById(id)
    if (!existing) return null

    // Update metadata
    const metaUpdate: Partial<typeof notes.$inferInsert> = {
      updated_at: ts,
    }
    if (input.title !== undefined) metaUpdate.title = input.title
    if (input.icon !== undefined) metaUpdate.icon = input.icon
    if (input.cover_url !== undefined) metaUpdate.cover_url = input.cover_url
    if (input.parent_id !== undefined) metaUpdate.parent_id = input.parent_id
    if (input.order_index !== undefined) metaUpdate.order_index = input.order_index

    db.update(notes).set(metaUpdate).where(eq(notes.id, id)).run()

    // Replace blocks if provided
    if (input.blocks !== undefined) {
      noteRepository.replaceBlocks(id, input.blocks)
    }

    return noteRepository.findById(id)!
  },

  /**
   * Replace all blocks of a note
   */
  replaceBlocks(noteId: string, newBlocks: Block[]): void {
    const ts = now()

    db.transaction(() => {
      // Delete existing
      db.delete(blocks).where(eq(blocks.note_id, noteId)).run()

      // Insert new
      for (let i = 0; i < newBlocks.length; i++) {
        db.insert(blocks)
          .values({
            id: nanoid(),
            note_id: noteId,
            type: newBlocks[i].type,
            content: JSON.stringify(newBlocks[i]),
            order_index: i,
            parent_id: null,
            created_at: ts,
            updated_at: ts,
          })
          .run()
      }
    })
  },

  /**
   * Append blocks to end of a note
   */
  appendBlocks(noteId: string, newBlocks: Block[]): void {
    const ts = now()
    const existing = db
      .select({ order_index: blocks.order_index })
      .from(blocks)
      .where(eq(blocks.note_id, noteId))
      .all()

    let maxOrder = existing.reduce((m, b) => Math.max(m, b.order_index), -1)

    db.transaction(() => {
      for (const block of newBlocks) {
        maxOrder += 1
        db.insert(blocks)
          .values({
            id: nanoid(),
            note_id: noteId,
            type: block.type,
            content: JSON.stringify(block),
            order_index: maxOrder,
            parent_id: null,
            created_at: ts,
            updated_at: ts,
          })
          .run()
      }
    })
  },

  /**
   * Soft delete (archive)
   */
  archive(id: string): void {
    db.update(notes)
      .set({ is_archived: true, updated_at: now() })
      .where(eq(notes.id, id))
      .run()
  },

  /**
   * Restore from archive
   */
  restore(id: string): void {
    db.update(notes)
      .set({ is_archived: false, updated_at: now() })
      .where(eq(notes.id, id))
      .run()
  },

  /**
   * Permanently delete (only archived notes)
   */
  deleteForever(id: string): void {
    db.delete(notes).where(and(eq(notes.id, id), eq(notes.is_archived, true))).run()
  },

  /**
   * Reorder: update parent and order_index
   */
  reorder(id: string, parentId: string | null, orderIndex: number): void {
    db.update(notes)
      .set({ parent_id: parentId, order_index: orderIndex, updated_at: now() })
      .where(eq(notes.id, id))
      .run()
  },

  /**
   * Full-text search (SQLite FTS5)
   */
  searchFullText(query: string, limit = 10): (Note & { snippet: string })[] {
    const rows = db.all<Note & { snippet: string }>(
      sql`
        SELECT n.*, snippet(notes_fts, 1, '<mark>', '</mark>', '...', 20) AS snippet
        FROM notes_fts
        JOIN notes n ON notes_fts.id = n.id
        WHERE notes_fts MATCH ${query + '*'}
          AND n.is_archived = 0
        ORDER BY rank
        LIMIT ${limit}
      `
    )
    return rows
  },
}
