import { z } from 'zod'

// ─── Settings Schemas ─────────────────────────────────────────────────────────

export const AppSettingsSchema = z.object({
  ollama_host: z.string().url().default('http://localhost:11434'),
  embedding_model: z.string().default('nomic-embed-text'),
  chat_model: z.string().default('llama3'),
  auto_embed_on_save: z.boolean().default(true),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.enum(['en', 'tr']).default('en'),
  editor_width: z.enum(['normal', 'wide']).default('normal'),
  data_dir: z.string().optional(),
})

export type AppSettings = z.infer<typeof AppSettingsSchema>

export const UpdateSettingsSchema = AppSettingsSchema.partial()

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>
