import { z } from 'zod'

// ─── Block Content Schemas ──────────────────────────────────────────────────

export const InlineContentSchema = z.object({
  type: z.enum(['text', 'link']),
  text: z.string(),
  styles: z
    .object({
      bold: z.boolean().optional(),
      italic: z.boolean().optional(),
      underline: z.boolean().optional(),
      strikethrough: z.boolean().optional(),
      code: z.boolean().optional(),
    })
    .optional(),
  href: z.string().optional(),
})

export type InlineContent = z.infer<typeof InlineContentSchema>

export const BlockSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('paragraph'),
    content: z.array(InlineContentSchema),
  }),
  z.object({
    type: z.literal('heading'),
    content: z.array(InlineContentSchema),
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  }),
  z.object({
    type: z.literal('bulleted_list'),
    content: z.array(InlineContentSchema),
  }),
  z.object({
    type: z.literal('numbered_list'),
    content: z.array(InlineContentSchema),
  }),
  z.object({
    type: z.literal('check_list'),
    content: z.array(InlineContentSchema),
    checked: z.boolean(),
  }),
  z.object({
    type: z.literal('code'),
    content: z.string(),
    language: z.string().default('plaintext'),
  }),
  z.object({
    type: z.literal('callout'),
    content: z.array(InlineContentSchema),
    icon: z.string().optional(),
    color: z.string().optional(),
  }),
  z.object({
    type: z.literal('divider'),
    content: z.null(),
  }),
  z.object({
    type: z.literal('image'),
    content: z.null(),
    url: z.string(),
    alt: z.string().optional(),
    caption: z.string().optional(),
  }),
  z.object({
    type: z.literal('table'),
    content: z.array(z.array(z.array(InlineContentSchema))),
    headers: z.array(z.string()).optional(),
  }),
  z.object({
    type: z.literal('toggle'),
    content: z.array(InlineContentSchema),
    children: z.array(z.lazy((): z.ZodTypeAny => BlockSchema)).optional(),
    isOpen: z.boolean().default(false),
  }),
  z.object({
    type: z.literal('quote'),
    content: z.array(InlineContentSchema),
  }),
])

export type Block = z.infer<typeof BlockSchema>
export type BlockType = Block['type']

// ─── DB Block Row ────────────────────────────────────────────────────────────

export const BlockRowSchema = z.object({
  id: z.string(),
  note_id: z.string(),
  type: z.string(),
  content: z.string(), // JSON stringified
  order_index: z.number(),
  parent_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type BlockRow = z.infer<typeof BlockRowSchema>

// ─── Note Schemas ─────────────────────────────────────────────────────────────

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string().default(''),
  icon: z.string().nullable().optional(),
  cover_url: z.string().nullable().optional(),
  is_archived: z.boolean().default(false),
  parent_id: z.string().nullable().optional(),
  order_index: z.number().default(0),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Note = z.infer<typeof NoteSchema>

export const NoteWithBlocksSchema = NoteSchema.extend({
  blocks: z.array(BlockSchema),
})

export type NoteWithBlocks = z.infer<typeof NoteWithBlocksSchema>

export const CreateNoteSchema = z.object({
  title: z.string().optional().default(''),
  icon: z.string().optional(),
  parent_id: z.string().optional(),
})

export type CreateNoteInput = z.infer<typeof CreateNoteSchema>

export const UpdateNoteSchema = z.object({
  title: z.string().optional(),
  icon: z.string().nullable().optional(),
  cover_url: z.string().nullable().optional(),
  blocks: z.array(BlockSchema).optional(),
  parent_id: z.string().nullable().optional(),
  order_index: z.number().optional(),
})

export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>

export const ReorderNoteSchema = z.object({
  id: z.string(),
  parent_id: z.string().nullable(),
  order_index: z.number(),
})

export type ReorderNoteInput = z.infer<typeof ReorderNoteSchema>
