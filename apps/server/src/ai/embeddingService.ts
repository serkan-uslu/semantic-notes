import { nanoid } from 'nanoid'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { embeddings } from '../db/schema.js'
import { noteRepository } from '../repositories/noteRepository.js'
import { settingsRepository } from '../repositories/settingsRepository.js'
import { ollamaService } from '../ai/ollamaService.js'
import { vectorService } from '../vector/vectorService.js'
import type { Block } from '@semantic-notes/shared'
import { CHUNK_SIZE_TOKENS } from '@semantic-notes/shared'

// ─── Text Extraction ──────────────────────────────────────────────────────────

function extractTextFromBlock(block: Block): string {
  if (!block.content) return ''

  if (typeof block.content === 'string') return block.content

  if (Array.isArray(block.content)) {
    // BlockNote native / InlineContent array: [{ type: 'text', text: '...' }]
    return (block.content as { text?: string }[]).map((c) => c.text ?? '').join('')
  }

  // Legacy hack: content field holds a BlockNote block { id, type, content: [...] }
  if (typeof block.content === 'object') {
    const inner = (block.content as Record<string, unknown>).content
    if (Array.isArray(inner)) {
      return (inner as { text?: string }[]).map((c) => c.text ?? '').join('')
    }
  }

  return ''
}

function extractTextFromNote(
  title: string,
  blocks: Block[]
): { text: string; blockId?: string }[] {
  const chunks: { text: string; blockId?: string }[] = []

  // Title as first chunk
  if (title.trim()) {
    chunks.push({ text: title })
  }

  // Each block as a chunk (simplified — real chunking would respect token limits)
  for (const block of blocks) {
    const text = extractTextFromBlock(block).trim()
    if (text.length > 0) {
      chunks.push({ text })
    }
  }

  return chunks
}

// ─── Embedding Service ────────────────────────────────────────────────────────

export const embeddingService = {
  /**
   * Embed all blocks of a note and store in ChromaDB
   */
  async embedNote(noteId: string): Promise<void> {
    const note = noteRepository.findWithBlocks(noteId)
    if (!note) return

    const settings = settingsRepository.get()
    if (!settings.auto_embed_on_save) return

    const chromaOnline = await vectorService.isOnline()
    if (!chromaOnline) {
      console.warn('[Embedding] ChromaDB not available, skipping embedding for note', noteId)
      return
    }

    const ollamaOnline = await ollamaService.isOnline()
    if (!ollamaOnline) {
      console.warn('[Embedding] Ollama not available, skipping embedding for note', noteId)
      return
    }

    // Remove old embeddings
    await vectorService.deleteByNoteId(noteId)
    db.delete(embeddings).where(eq(embeddings.source_id, noteId)).run()

    const chunks = extractTextFromNote(note.title, note.blocks)

    for (let i = 0; i < chunks.length; i++) {
      const { text } = chunks[i]
      const vector = await ollamaService.embed(text)
      if (!vector) continue

      const embeddingId = nanoid()
      await vectorService.upsert({
        id: embeddingId,
        embedding: vector,
        text,
        noteId,
        chunkIndex: i,
        title: note.title,
      })

      db.insert(embeddings)
        .values({
          id: embeddingId,
          source_id: noteId,
          source_type: 'note',
          model: settings.embedding_model,
          chunk_index: i,
          created_at: new Date().toISOString(),
        })
        .run()
    }

    console.log(`[Embedding] Embedded ${chunks.length} chunks for note ${noteId}`)
  },

  /**
   * Semantic search: embed query, find similar chunks in ChromaDB
   */
  async searchSemantic(
    query: string,
    limit = 10
  ): Promise<{ noteId: string; title: string; snippet: string; score: number }[]> {
    const chromaOnline = await vectorService.isOnline()
    if (!chromaOnline) return []

    const vector = await ollamaService.embed(query)
    if (!vector) return []

    const results = await vectorService.query({ embedding: vector, limit })

    return results.map((r) => ({
      noteId: r.noteId,
      title: r.title,
      snippet: r.text,
      score: r.score,
    }))
  },
}
