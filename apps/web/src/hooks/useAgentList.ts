import { useState, useEffect, useCallback } from 'react'
import { useAgentStore } from '@/stores/agentStore.js'
import { agentService } from '@/services/agentService.js'
import { tryCatch } from '@/lib/utils.js'
import toast from 'react-hot-toast'
import type { Agent, CreateAgentInput, UpdateAgentInput } from '@semantic-notes/shared'

// ─── useAgentList ─────────────────────────────────────────────────────────────

export function useAgentList() {
  const { agents, setAgents, addAgent, removeAgent, updateAgent } = useAgentStore()
  const [isLoading, setIsLoading] = useState(agents.length === 0)

  useEffect(() => {
    async function load() {
      const result = await tryCatch(() => agentService.getAll())
      if (result.ok) setAgents(result.data)
      setIsLoading(false)
    }
    load()
  }, [setAgents])

  const create = useCallback(
    async (data: CreateAgentInput): Promise<Agent | null> => {
      const result = await tryCatch(() => agentService.create(data))
      if (result.ok) {
        addAgent(result.data)
        return result.data
      }
      toast.error('Failed to create agent')
      return null
    },
    [addAgent]
  )

  const update = useCallback(
    async (id: string, data: UpdateAgentInput): Promise<void> => {
      const result = await tryCatch(() => agentService.update(id, data))
      if (result.ok) {
        updateAgent(id, result.data)
      } else {
        toast.error('Failed to update agent')
      }
    },
    [updateAgent]
  )

  const remove = useCallback(
    async (id: string): Promise<void> => {
      const result = await tryCatch(() => agentService.delete(id))
      if (result.ok) {
        removeAgent(id)
      } else {
        toast.error('Failed to delete agent')
      }
    },
    [removeAgent]
  )

  return { agents, isLoading, create, update, remove }
}
