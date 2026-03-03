import { Router } from 'express'
import { agentRepository } from '../repositories/agentRepository.js'
import { agentRunRepository } from '../repositories/agentRunRepository.js'
import { agentEngine } from '../agents/agentEngine.js'
import {
  CreateAgentSchema,
  UpdateAgentSchema,
  RunAgentSchema,
} from '@semantic-notes/shared'

export const agentsRouter = Router()

// GET /api/agents — list all agents
agentsRouter.get('/', (_req, res) => {
  const agents = agentRepository.findAll()
  res.json({ ok: true, data: agents })
})

// GET /api/agents/:id — get single agent
agentsRouter.get('/:id', (req, res) => {
  const agent = agentRepository.findById(req.params.id)
  if (!agent) return res.status(404).json({ ok: false, error: 'Agent not found' })
  return res.json({ ok: true, data: agent })
})

// POST /api/agents — create agent
agentsRouter.post('/', (req, res) => {
  const parsed = CreateAgentSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.message })
  }
  const agent = agentRepository.create(parsed.data)
  return res.status(201).json({ ok: true, data: agent })
})

// PATCH /api/agents/:id — update agent
agentsRouter.patch('/:id', (req, res) => {
  const parsed = UpdateAgentSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.message })
  }
  const updated = agentRepository.update(req.params.id, parsed.data)
  if (!updated) return res.status(404).json({ ok: false, error: 'Agent not found' })
  return res.json({ ok: true, data: updated })
})

// DELETE /api/agents/:id — delete agent
agentsRouter.delete('/:id', (req, res) => {
  const agent = agentRepository.findById(req.params.id)
  if (!agent) return res.status(404).json({ ok: false, error: 'Agent not found' })
  agentRepository.delete(req.params.id)
  return res.json({ ok: true, data: null })
})

// POST /api/agents/:id/run — run agent
agentsRouter.post('/:id/run', async (req, res) => {
  const parsed = RunAgentSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.message })
  }

  try {
    const { runId } = await agentEngine.run(req.params.id, parsed.data)
    return res.status(202).json({ ok: true, data: { runId } })
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) })
  }
})

// GET /api/agents/:id/runs — get run history for agent
agentsRouter.get('/:id/runs', (req, res) => {
  const limit = Number(req.query.limit ?? 20)
  const runs = agentRunRepository.findByAgentId(req.params.id, limit)
  return res.json({ ok: true, data: runs })
})

// GET /api/agents/runs/:runId — get a specific run
agentsRouter.get('/runs/:runId', (req, res) => {
  const run = agentRunRepository.findById(req.params.runId)
  if (!run) return res.status(404).json({ ok: false, error: 'Run not found' })
  const toolCalls = agentRunRepository.getToolCalls(req.params.runId)
  return res.json({ ok: true, data: { ...run, tool_calls: toolCalls } })
})
