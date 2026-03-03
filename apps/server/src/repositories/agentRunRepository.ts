import { eq, desc } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '../db/index.js'
import { agent_runs, agent_tool_calls } from '../db/schema.js'
import type {
  AgentRun,
  AgentRunStep,
  AgentToolCall,
  AgentRunStatus,
} from '@semantic-notes/shared'

function now() {
  return new Date().toISOString()
}

function parseRun(row: typeof agent_runs.$inferSelect): AgentRun {
  return {
    ...row,
    steps: JSON.parse(row.steps) as AgentRunStep[],
    output: row.output ?? null,
    duration_ms: row.duration_ms ?? null,
  } as AgentRun
}

// ─── Agent Run Repository ─────────────────────────────────────────────────────

export const agentRunRepository = {
  findByAgentId(agentId: string, limit = 20): AgentRun[] {
    return db
      .select()
      .from(agent_runs)
      .where(eq(agent_runs.agent_id, agentId))
      .orderBy(desc(agent_runs.created_at))
      .limit(limit)
      .all()
      .map(parseRun)
  },

  findById(id: string): AgentRun | null {
    const row = db.select().from(agent_runs).where(eq(agent_runs.id, id)).get()
    return row ? parseRun(row) : null
  },

  create(agentId: string, input: string): AgentRun {
    const id = nanoid()
    const ts = now()
    db.insert(agent_runs)
      .values({
        id,
        agent_id: agentId,
        input,
        output: null,
        steps: '[]',
        status: 'running',
        duration_ms: null,
        created_at: ts,
      })
      .run()
    return agentRunRepository.findById(id)!
  },

  updateStatus(
    id: string,
    status: AgentRunStatus,
    output?: string,
    durationMs?: number
  ): void {
    db.update(agent_runs)
      .set({ status, output: output ?? null, duration_ms: durationMs ?? null })
      .where(eq(agent_runs.id, id))
      .run()
  },

  appendStep(id: string, step: AgentRunStep): void {
    const run = agentRunRepository.findById(id)
    if (!run) return
    const steps = [...run.steps, step]
    db.update(agent_runs)
      .set({ steps: JSON.stringify(steps) })
      .where(eq(agent_runs.id, id))
      .run()
  },

  logToolCall(
    runId: string,
    toolName: string,
    input: unknown,
    output: unknown
  ): void {
    db.insert(agent_tool_calls)
      .values({
        id: nanoid(),
        run_id: runId,
        tool_name: toolName,
        input: JSON.stringify(input),
        output: JSON.stringify(output),
        created_at: now(),
      })
      .run()
  },

  getToolCalls(runId: string): AgentToolCall[] {
    return db
      .select()
      .from(agent_tool_calls)
      .where(eq(agent_tool_calls.run_id, runId))
      .all()
      .map((row) => ({
        ...row,
        input: JSON.parse(row.input),
        output: JSON.parse(row.output),
      })) as AgentToolCall[]
  },
}
