import { z } from 'zod'

// ─── Search Schemas ───────────────────────────────────────────────────────────

export const SearchResultSchema = z.object({
  note_id: z.string(),
  block_id: z.string().optional(),
  title: z.string(),
  snippet: z.string(),
  score: z.number(),
  source: z.enum(['semantic', 'fulltext', 'hybrid']),
})

export type SearchResult = z.infer<typeof SearchResultSchema>

export const SearchQuerySchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(50).default(10),
  mode: z.enum(['semantic', 'fulltext', 'hybrid']).default('hybrid'),
})

export type SearchQuery = z.infer<typeof SearchQuerySchema>

// ─── API Response Wrappers ────────────────────────────────────────────────────

export const ApiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    ok: z.literal(true),
  })

export const ApiErrorSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
  details: z.unknown().optional(),
})

export type ApiError = z.infer<typeof ApiErrorSchema>
