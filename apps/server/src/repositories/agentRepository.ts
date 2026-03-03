import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '../db/index.js'
import { agents } from '../db/schema.js'
import type {
  Agent,
  CreateAgentInput,
  UpdateAgentInput,
  AgentToolName,
} from '@semantic-notes/shared'

function now() {
  return new Date().toISOString()
}

function parseAgent(row: typeof agents.$inferSelect): Agent {
  return {
    ...row,
    tools: JSON.parse(row.tools) as AgentToolName[],
    is_active: Boolean(row.is_active),
  } as Agent
}



// ─── Agent Repository ─────────────────────────────────────────────────────────

export const agentRepository = {
  findAll(): Agent[] {
    return db.select().from(agents).all().map(parseAgent)
  },

  findById(id: string): Agent | null {
    const row = db.select().from(agents).where(eq(agents.id, id)).get()
    return row ? parseAgent(row) : null
  },

  findActive(): Agent[] {
    return db
      .select()
      .from(agents)
      .where(eq(agents.is_active, true))
      .all()
      .map(parseAgent)
  },

  create(input: CreateAgentInput): Agent {
    const id = nanoid()
    const ts = now()

    db.insert(agents)
      .values({
        id,
        name: input.name,
        description: input.description ?? '',
        system_prompt: input.system_prompt ?? '',
        model: input.model ?? 'llama3',
        tools: JSON.stringify(input.tools ?? []),
        trigger: input.trigger ?? 'manual',
        schedule: input.schedule ?? null,
        is_active: true,
        created_at: ts,
        updated_at: ts,
      })
      .run()

    return agentRepository.findById(id)!
  },

  update(id: string, input: UpdateAgentInput): Agent | null {
    const existing = agentRepository.findById(id)
    if (!existing) return null

    const patch: Partial<typeof agents.$inferInsert> = { updated_at: now() }
    if (input.name !== undefined) patch.name = input.name
    if (input.description !== undefined) patch.description = input.description
    if (input.system_prompt !== undefined) patch.system_prompt = input.system_prompt
    if (input.model !== undefined) patch.model = input.model
    if (input.tools !== undefined) patch.tools = JSON.stringify(input.tools)
    if (input.trigger !== undefined) patch.trigger = input.trigger
    if (input.schedule !== undefined) patch.schedule = input.schedule
    if (input.is_active !== undefined) patch.is_active = input.is_active

    db.update(agents).set(patch).where(eq(agents.id, id)).run()
    return agentRepository.findById(id)!
  },

  delete(id: string): void {
    db.delete(agents).where(eq(agents.id, id)).run()
  },
}

// ─── Agent Run Repository ─────────────────────────────────────────────────────
// Moved to agentRunRepository.ts — re-exported for backward compatibility.
export { agentRunRepository } from './agentRunRepository.js'
