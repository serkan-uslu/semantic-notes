import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { settings } from '../db/schema.js'
import type { AppSettings, UpdateSettingsInput } from '@semantic-notes/shared'
import { AppSettingsSchema } from '@semantic-notes/shared'

function now() {
  return new Date().toISOString()
}

const SETTINGS_KEY = 'app'

// ─── Settings Repository ──────────────────────────────────────────────────────

export const settingsRepository = {
  get(): AppSettings {
    const row = db.select().from(settings).where(eq(settings.key, SETTINGS_KEY)).get()
    if (!row) return AppSettingsSchema.parse({})
    try {
      return AppSettingsSchema.parse(JSON.parse(row.value))
    } catch {
      return AppSettingsSchema.parse({})
    }
  },

  update(input: UpdateSettingsInput): AppSettings {
    const current = settingsRepository.get()
    const merged = AppSettingsSchema.parse({ ...current, ...input })

    db
      .insert(settings)
      .values({
        key: SETTINGS_KEY,
        value: JSON.stringify(merged),
        updated_at: now(),
      })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: JSON.stringify(merged), updated_at: now() },
      })
      .run()

    return merged
  },
}
