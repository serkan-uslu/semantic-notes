import { useState, useEffect, useCallback } from 'react'
import { useAgentStore } from '../stores/agentStore.js'
import { agentService } from '../services/agentService.js'
import { tryCatch } from '../lib/utils.js'
import { AGENT_POLL_INTERVAL_MS } from '../lib/constants.js'
import toast from 'react-hot-toast'
import type { RunAgentInput } from '@semantic-notes/shared'

// ─── useAgentRun ──────────────────────────────────────────────────────────────

export function useAgentRun(agentId: string) {
  const { setRuns, runsByAgent, addOrUpdateRun } = useAgentStore()
  const [isRunning, setIsRunning] = useState(false)
  const [currentRunId, setCurrentRunId] = useState<string | null>(null)

  const runs = runsByAgent[agentId] ?? []

  // Load run history on mount
  useEffect(() => {
    agentService
      .getRuns(agentId)
      .then((r) => setRuns(agentId, r))
      .catch(() => {})
  }, [agentId, setRuns])

  // Poll running run status
  useEffect(() => {
    if (!currentRunId || !isRunning) return

    const interval = setInterval(async () => {
      const result = await tryCatch(() => agentService.getRun(currentRunId))
      if (!result.ok) return

      const run = result.data
      addOrUpdateRun(agentId, run)

      if (run.status !== 'running') {
        setIsRunning(false)
        setCurrentRunId(null)
        clearInterval(interval)
        if (run.status === 'success') {
          toast.success('Agent completed')
        } else {
          toast.error('Agent failed')
        }
      }
    }, AGENT_POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [currentRunId, isRunning, agentId, addOrUpdateRun])

  const run = useCallback(
    async (input: RunAgentInput): Promise<void> => {
      setIsRunning(true)
      const result = await tryCatch(() => agentService.run(agentId, input))
      if (result.ok) {
        setCurrentRunId(result.data.runId)
      } else {
        setIsRunning(false)
        toast.error('Failed to start agent')
      }
    },
    [agentId]
  )

  return { runs, isRunning, currentRunId, run }
}
