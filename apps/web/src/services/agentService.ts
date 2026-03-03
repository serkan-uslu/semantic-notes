import type {
  Agent,
  AgentRun,
  AgentToolCall,
  CreateAgentInput,
  UpdateAgentInput,
  RunAgentInput,
} from '@semantic-notes/shared'
import { apiFetch } from '../lib/apiClient'

// ─── Agent Service ────────────────────────────────────────────────────────────

export const agentService = {
  getAll(): Promise<Agent[]> {
    return apiFetch('/agents')
  },

  getById(id: string): Promise<Agent> {
    return apiFetch(`/agents/${id}`)
  },

  create(data: CreateAgentInput): Promise<Agent> {
    return apiFetch('/agents', { method: 'POST', body: JSON.stringify(data) })
  },

  update(id: string, data: UpdateAgentInput): Promise<Agent> {
    return apiFetch(`/agents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  delete(id: string): Promise<void> {
    return apiFetch(`/agents/${id}`, { method: 'DELETE' })
  },

  run(id: string, input: RunAgentInput): Promise<{ runId: string }> {
    return apiFetch(`/agents/${id}/run`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  getRuns(agentId: string, limit = 20): Promise<AgentRun[]> {
    return apiFetch(`/agents/${agentId}/runs?limit=${limit}`)
  },

  getRun(runId: string): Promise<AgentRun & { tool_calls: AgentToolCall[] }> {
    return apiFetch(`/agents/runs/${runId}`)
  },
}


