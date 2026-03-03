import { create } from 'zustand'
import type { Agent, AgentRun } from '@semantic-notes/shared'

interface AgentState {
  agents: Agent[]
  activeRunId: string | null
  runsByAgent: Record<string, AgentRun[]>

  // Actions
  setAgents: (agents: Agent[]) => void
  addAgent: (agent: Agent) => void
  updateAgent: (id: string, patch: Partial<Agent>) => void
  removeAgent: (id: string) => void
  setActiveRunId: (id: string | null) => void
  setRuns: (agentId: string, runs: AgentRun[]) => void
  addOrUpdateRun: (agentId: string, run: AgentRun) => void
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  activeRunId: null,
  runsByAgent: {},

  setAgents: (agents) => set({ agents }),

  addAgent: (agent) =>
    set((state) => ({ agents: [...state.agents, agent] })),

  updateAgent: (id, patch) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    })),

  removeAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
    })),

  setActiveRunId: (id) => set({ activeRunId: id }),

  setRuns: (agentId, runs) =>
    set((state) => ({
      runsByAgent: { ...state.runsByAgent, [agentId]: runs },
    })),

  addOrUpdateRun: (agentId, run) =>
    set((state) => {
      const existing = state.runsByAgent[agentId] ?? []
      const idx = existing.findIndex((r) => r.id === run.id)
      const updated =
        idx >= 0
          ? existing.map((r) => (r.id === run.id ? run : r))
          : [run, ...existing]
      return { runsByAgent: { ...state.runsByAgent, [agentId]: updated } }
    }),
}))
