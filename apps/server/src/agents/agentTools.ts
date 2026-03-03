import { z } from 'zod'
import { nanoid } from 'nanoid'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { noteRepository } from '../repositories/noteRepository.js'
import { embeddingService } from '../ai/embeddingService.js'
import { settingsRepository } from '../repositories/settingsRepository.js'
import type {
  AgentToolName,
  Block,
  CreateNoteInput,
  UpdateNoteInput,
} from '@semantic-notes/shared'

// ─── BlockNote native block factory ──────────────────────────────────────────

function makeParagraph(text: string): Block {
  return {
    id: nanoid(),
    type: 'paragraph',
    props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
    content: [{ type: 'text', text, styles: {} }],
    children: [],
  } as unknown as Block
}

// ─── Block text extraction ────────────────────────────────────────────────────
// Blocks may be stored as BlockNote native JSON or legacy wrapped format.
// This helper extracts plain text so the LLM can read them.

function blockToText(block: unknown): string {
  if (!block || typeof block !== 'object') return ''
  const b = block as Record<string, unknown>
  const content = b.content

  // Plain string content (e.g. code blocks)
  if (typeof content === 'string') return content

  // BlockNote native / InlineContent array: [{ type: 'text', text: '...' }]
  if (Array.isArray(content)) {
    return content
      .map((c: unknown) => (typeof c === 'object' && c !== null && 'text' in c ? (c as { text: string }).text : ''))
      .join('')
  }

  // Legacy hack format: content field holds a BlockNote block { id, type, content: [...] }
  if (typeof content === 'object' && content !== null) {
    const inner = (content as Record<string, unknown>).content
    if (Array.isArray(inner)) {
      return inner
        .map((c: unknown) => (typeof c === 'object' && c !== null && 'text' in c ? (c as { text: string }).text : ''))
        .join('')
    }
  }

  return ''
}

function noteToReadable(note: { title: string; blocks: unknown[] }): { title: string; paragraphs: string[] } {
  return {
    title: note.title,
    paragraphs: note.blocks.map(blockToText).filter(Boolean),
  }
}

// ─── Tool Interface ───────────────────────────────────────────────────────────

export interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
}

export interface AgentTool {
  name: AgentToolName
  description: string
  parameters: z.ZodTypeAny
  execute(input: unknown): Promise<ToolResult>
}

// ─── Tool Definitions ─────────────────────────────────────────────────────────

export const agentTools: Record<AgentToolName, AgentTool> = {
  read_note: {
    name: 'read_note',
    description: 'Read a note by ID. Returns title and text content as readable paragraphs.',
    parameters: z.object({
      id: z.string().describe('The note ID'),
    }),
    async execute(input) {
      const parsed = z.object({ id: z.string() }).safeParse(input)
      if (!parsed.success) return { success: false, error: 'Invalid input' }
      const note = noteRepository.findWithBlocks(parsed.data.id)
      if (!note) return { success: false, error: 'Note not found' }
      return { success: true, data: noteToReadable(note) }
    },
  },

  search_notes: {
    name: 'search_notes',
    description: 'Search notes by keyword using full-text search.',
    parameters: z.object({
      query: z.string().describe('Search query'),
      limit: z.number().optional().default(10),
    }),
    async execute(input) {
      const parsed = z
        .object({ query: z.string(), limit: z.number().optional() })
        .safeParse(input)
      if (!parsed.success) return { success: false, error: 'Invalid input' }
      const results = noteRepository.searchFullText(
        parsed.data.query,
        parsed.data.limit
      )
      return { success: true, data: results }
    },
  },

  list_notes: {
    name: 'list_notes',
    description: 'List all notes (metadata only, no blocks).',
    parameters: z.object({}),
    async execute() {
      const notes = noteRepository.findAll()
      return { success: true, data: notes }
    },
  },

  create_note: {
    name: 'create_note',
    description: 'Create a new note with optional content blocks.',
    parameters: z.object({
      title: z.string().optional(),
      icon: z.string().optional(),
      parent_id: z.string().optional(),
      blocks: z.array(z.unknown()).optional(),
    }),
    async execute(input) {
      const parsed = z
        .object({
          title: z.string().optional(),
          icon: z.string().optional(),
          parent_id: z.string().optional(),
          blocks: z.array(z.unknown()).optional(),
        })
        .safeParse(input)
      if (!parsed.success) return { success: false, error: 'Invalid input' }

      const note = noteRepository.create(parsed.data as CreateNoteInput)

      if (parsed.data.blocks && parsed.data.blocks.length > 0) {
        noteRepository.appendBlocks(note.id, parsed.data.blocks as Block[])
        // Trigger embed async
        embeddingService.embedNote(note.id).catch(console.error)
      }

      return { success: true, data: note }
    },
  },

  update_note: {
    name: 'update_note',
    description: 'Update a note title or content.',
    parameters: z.object({
      id: z.string(),
      title: z.string().optional(),
      blocks: z.array(z.unknown()).optional(),
    }),
    async execute(input) {
      const parsed = z
        .object({
          id: z.string(),
          title: z.string().optional(),
          blocks: z.array(z.unknown()).optional(),
        })
        .safeParse(input)
      if (!parsed.success) return { success: false, error: 'Invalid input' }

      const updated = noteRepository.update(
        parsed.data.id,
        parsed.data as UpdateNoteInput
      )
      if (!updated) return { success: false, error: 'Note not found' }

      embeddingService.embedNote(parsed.data.id).catch(console.error)

      return { success: true, data: updated }
    },
  },

  append_blocks: {
    name: 'append_blocks',
    description: 'Append blocks to the end of an existing note.',
    parameters: z.object({
      note_id: z.string(),
      blocks: z.array(z.unknown()),
    }),
    async execute(input) {
      const parsed = z
        .object({ note_id: z.string(), blocks: z.array(z.unknown()) })
        .safeParse(input)
      if (!parsed.success) return { success: false, error: 'Invalid input' }

      const note = noteRepository.findById(parsed.data.note_id)
      if (!note) return { success: false, error: 'Note not found' }

      noteRepository.appendBlocks(parsed.data.note_id, parsed.data.blocks as Block[])
      embeddingService.embedNote(parsed.data.note_id).catch(console.error)

      return { success: true, data: { appended: parsed.data.blocks.length } }
    },
  },

  delete_blocks: {
    name: 'delete_blocks',
    description: 'Replace blocks of a note (effectively deletes specified content).',
    parameters: z.object({
      note_id: z.string(),
      blocks: z.array(z.unknown()).describe('New block array to replace all blocks'),
    }),
    async execute(input) {
      const parsed = z
        .object({ note_id: z.string(), blocks: z.array(z.unknown()) })
        .safeParse(input)
      if (!parsed.success) return { success: false, error: 'Invalid input' }

      noteRepository.replaceBlocks(parsed.data.note_id, parsed.data.blocks as Block[])
      return { success: true, data: null }
    },
  },

  search_semantic: {
    name: 'search_semantic',
    description: 'Search notes using semantic (vector) similarity.',
    parameters: z.object({
      query: z.string(),
      limit: z.number().optional().default(5),
    }),
    async execute(input) {
      const parsed = z
        .object({ query: z.string(), limit: z.number().optional() })
        .safeParse(input)
      if (!parsed.success) return { success: false, error: 'Invalid input' }

      const results = await embeddingService.searchSemantic(
        parsed.data.query,
        parsed.data.limit
      )
      return { success: true, data: results }
    },
  },

  get_settings: {
    name: 'get_settings',
    description: 'Get current application settings.',
    parameters: z.object({}),
    async execute() {
      const s = settingsRepository.get()
      return { success: true, data: s }
    },
  },

  summarize_note: {
    name: 'summarize_note',
    description:
      'Summarize a note and append a summary callout block to it. Note: Requires the agent to call read_note first.',
    parameters: z.object({
      note_id: z.string(),
      summary_text: z.string().describe('The summary to append as a callout block'),
    }),
    async execute(input) {
      const parsed = z
        .object({ note_id: z.string(), summary_text: z.string() })
        .safeParse(input)
      if (!parsed.success) return { success: false, error: 'Invalid input' }

      const summaryBlock = makeParagraph(`📝 Summary: ${parsed.data.summary_text}`)
      noteRepository.appendBlocks(parsed.data.note_id, [summaryBlock])
      embeddingService.embedNote(parsed.data.note_id).catch(console.error)

      return { success: true, data: { appended: true } }
    },
  },

  tag_note: {
    name: 'tag_note',
    description: 'Add tags to a note by updating its title.',
    parameters: z.object({
      note_id: z.string(),
      tags: z.array(z.string()),
    }),
    async execute(input) {
      const parsed = z
        .object({ note_id: z.string(), tags: z.array(z.string()) })
        .safeParse(input)
      if (!parsed.success) return { success: false, error: 'Invalid input' }

      const note = noteRepository.findById(parsed.data.note_id)
      if (!note) return { success: false, error: 'Note not found' }

      const tagStr = parsed.data.tags.map((t) => `#${t}`).join(' ')
      const newTitle = note.title.includes('#')
        ? note.title
        : `${note.title} ${tagStr}`.trim()

      noteRepository.update(parsed.data.note_id, { title: newTitle })
      return { success: true, data: { title: newTitle } }
    },
  },

  link_related: {
    name: 'link_related',
    description: 'Find semantically related notes and append a "Related Notes" block.',
    parameters: z.object({
      note_id: z.string(),
      query: z.string().describe('Search query to find related notes'),
      limit: z.number().optional().default(3),
    }),
    async execute(input) {
      const parsed = z
        .object({
          note_id: z.string(),
          query: z.string(),
          limit: z.number().optional(),
        })
        .safeParse(input)
      if (!parsed.success) return { success: false, error: 'Invalid input' }

      const similar = await embeddingService.searchSemantic(
        parsed.data.query,
        parsed.data.limit
      )
      const filtered = similar.filter((r) => r.noteId !== parsed.data.note_id)

      if (filtered.length === 0) {
        return { success: true, data: { linked: 0 } }
      }

      const relatedBlock = makeParagraph(`🔗 Related: ${filtered.map((r) => r.title).join(', ')}`)
      noteRepository.appendBlocks(parsed.data.note_id, [relatedBlock])
      return { success: true, data: { linked: filtered.length } }
    },
  },
}

// ─── Helper: build OpenAI-compatible tools schema ─────────────────────────────

export function buildToolsSchema(
  toolNames: AgentToolName[]
): {
  type: 'function'
  function: { name: string; description: string; parameters: Record<string, unknown> }
}[] {
  return toolNames
    .filter((name) => agentTools[name])
    .map((name) => {
      const tool = agentTools[name]
      return {
        type: 'function' as const,
        function: {
          name: tool.name,
          description: tool.description,
          parameters: zodToJsonSchema(tool.parameters) as Record<string, unknown>,
        },
      }
    })
}
