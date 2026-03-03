import { Router } from 'express'
import { embeddingService } from '~/ai/embeddingService.js'
import { hybridSearch } from '~/services/searchService.js'

export const searchRouter = Router()

// GET /api/search?q=...&mode=hybrid|semantic|fulltext&limit=10
searchRouter.get('/', async (req, res) => {
  const query = String(req.query.q ?? '')
  const mode = String(req.query.mode ?? 'hybrid') as 'semantic' | 'fulltext' | 'hybrid'
  const limit = Number(req.query.limit ?? 10)

  if (!query) {
    return res.status(400).json({ ok: false, error: 'Query required' })
  }

  const results = await hybridSearch(query, mode, limit)
  return res.json({ ok: true, data: results })
})

// POST /api/search/embed/:noteId — manually trigger embedding
searchRouter.post('/embed/:noteId', async (req, res) => {
  const { noteId } = req.params
  embeddingService.embedNote(noteId).catch(console.error)
  return res.json({ ok: true, data: { queued: true } })
})
