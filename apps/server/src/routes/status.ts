import { Router } from 'express'
import { ollamaService } from '../ai/ollamaService.js'
import { vectorService } from '../vector/vectorService.js'

export const statusRouter = Router()

// GET /api/status — check connectivity of all services
statusRouter.get('/', async (_req, res) => {
  const [ollamaOnline, chromaOnline, ollamaModels] = await Promise.all([
    ollamaService.isOnline(),
    vectorService.isOnline(),
    ollamaService.isOnline().then((ok) => (ok ? ollamaService.listModels() : [])),
  ])

  res.json({
    ok: true,
    data: {
      ollama: { online: ollamaOnline, models: ollamaModels },
      chroma: { online: chromaOnline },
    },
  })
})
