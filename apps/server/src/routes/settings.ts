import { Router } from 'express'
import { settingsRepository } from '~/repositories/settingsRepository.js'
import { UpdateSettingsSchema } from '@semantic-notes/shared'

export const settingsRouter = Router()

// GET /api/settings
settingsRouter.get('/', (_req, res) => {
  const settings = settingsRepository.get()
  res.json({ ok: true, data: settings })
})

// PATCH /api/settings
settingsRouter.patch('/', (req, res) => {
  const parsed = UpdateSettingsSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.message })
  }
  const updated = settingsRepository.update(parsed.data)
  return res.json({ ok: true, data: updated })
})
