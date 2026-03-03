import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { notesRouter } from '~/routes/notes.js'
import { agentsRouter } from '~/routes/agents.js'
import { searchRouter } from '~/routes/search.js'
import { settingsRouter } from '~/routes/settings.js'
import { statusRouter } from '~/routes/status.js'
import { runMigrations } from '~/db/index.js'
import { noteRepository } from '~/repositories/noteRepository.js'

// ─── Bootstrap ──────────────────────────────────────────────────────────────────

runMigrations()
// Backfill FTS index (safe to run every startup — fast, idempotent)
noteRepository.rebuildAllFts()

const app = express()
const PORT = Number(process.env.PORT ?? 3001)

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }))
app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/notes', notesRouter)
app.use('/api/agents', agentsRouter)
app.use('/api/search', searchRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/status', statusRouter)

// Health check
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }))

// 404
app.use((_req, res) => res.status(404).json({ ok: false, error: 'Not found' }))

// Global error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('[Server Error]', err)
    res.status(500).json({ ok: false, error: err.message ?? 'Internal error' })
  }
)

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 SemanticNotes server running at http://localhost:${PORT}`)
  console.log(`   API: http://localhost:${PORT}/api`)
  console.log(`   Health: http://localhost:${PORT}/health\n`)
})

export default app
