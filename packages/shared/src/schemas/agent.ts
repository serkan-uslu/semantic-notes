import { z } from 'zod'

// ─── Agent Tool Names ─────────────────────────────────────────────────────────

export const AGENT_TOOL_NAMES = [
  'read_note',
  'search_notes',
  'list_notes',
  'create_note',
  'update_note',
  'append_blocks',
  'delete_blocks',
  'search_semantic',
  'get_settings',
  'summarize_note',
  'tag_note',
  'link_related',
] as const

export type AgentToolName = (typeof AGENT_TOOL_NAMES)[number]

// ─── Agent Schemas ────────────────────────────────────────────────────────────

export const AgentTriggerSchema = z.enum([
  'manual',
  'on_save',
  'on_select',
  'scheduled',
])

export type AgentTrigger = z.infer<typeof AgentTriggerSchema>

export const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(''),
  system_prompt: z.string().default(''),
  model: z.string().default('llama3'),
  tools: z.array(z.enum(AGENT_TOOL_NAMES)).default([]),
  trigger: AgentTriggerSchema.default('manual'),
  schedule: z.string().nullable().optional(), // cron string
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Agent = z.infer<typeof AgentSchema>

export const CreateAgentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
  system_prompt: z.string().optional().default(''),
  model: z.string().optional().default('llama3'),
  tools: z.array(z.enum(AGENT_TOOL_NAMES)).optional().default([]),
  trigger: AgentTriggerSchema.optional().default('manual'),
  schedule: z.string().optional(),
})

export type CreateAgentInput = z.infer<typeof CreateAgentSchema>

export const UpdateAgentSchema = CreateAgentSchema.partial().extend({
  is_active: z.boolean().optional(),
})

export type UpdateAgentInput = z.infer<typeof UpdateAgentSchema>

// ─── Agent Run Schemas ────────────────────────────────────────────────────────

export const AgentRunStatusSchema = z.enum([
  'running',
  'success',
  'error',
  'cancelled',
])

export type AgentRunStatus = z.infer<typeof AgentRunStatusSchema>

export const AgentRunStepSchema = z.object({
  index: z.number(),
  thought: z.string().optional(),
  action: z.string().optional(),
  tool_call: z
    .object({
      name: z.string(),
      input: z.unknown(),
    })
    .optional(),
  observation: z.string().optional(),
  timestamp: z.string(),
})

export type AgentRunStep = z.infer<typeof AgentRunStepSchema>

export const AgentRunSchema = z.object({
  id: z.string(),
  agent_id: z.string(),
  input: z.string(),
  output: z.string().nullable(),
  steps: z.array(AgentRunStepSchema),
  status: AgentRunStatusSchema,
  duration_ms: z.number().nullable(),
  created_at: z.string(),
})

export type AgentRun = z.infer<typeof AgentRunSchema>

export const AgentToolCallSchema = z.object({
  id: z.string(),
  run_id: z.string(),
  tool_name: z.string(),
  input: z.unknown(),
  output: z.unknown(),
  created_at: z.string(),
})

export type AgentToolCall = z.infer<typeof AgentToolCallSchema>

// ─── Run Agent Input ──────────────────────────────────────────────────────────

export const RunAgentSchema = z.object({
  input: z.string().optional().default(''),
  note_id: z.string().optional(),
  selected_text: z.string().optional(),
})

export type RunAgentInput = z.infer<typeof RunAgentSchema>
