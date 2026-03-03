import { useState } from 'react'
import { Bot, Play, Clock, Pencil } from 'lucide-react'
import { Button } from '../../atoms/Button/Button.js'
import { Spinner } from '../../atoms/Spinner/Spinner.js'
import { AgentRunItem } from '../AgentRunItem/AgentRunItem.js'
import { useAgentRun } from '../../../hooks/useAgentRun.js'
import { useNoteStore } from '../../../stores/noteStore.js'
import type { Agent, AgentRun } from '@semantic-notes/shared'

// ─── AgentCard ────────────────────────────────────────────────────────────────

interface AgentCardProps {
  agent: Agent
  onEdit: (agent: Agent) => void
}

export function AgentCard({ agent, onEdit }: AgentCardProps) {
  const { activeNoteId } = useNoteStore()
  const { runs, isRunning, run } = useAgentRun(agent.id)
  const [showHistory, setShowHistory] = useState(false)

  const handleRun = () => {
    run({ input: '', note_id: activeNoteId ?? undefined })
  }

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <Bot size={14} className="text-ai-accent shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{agent.name}</p>
            {agent.description && (
              <p className="text-xs text-text-tertiary truncate">{agent.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isRunning && <Spinner size="sm" className="text-ai-accent" />}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRun}
            disabled={isRunning}
            className="px-2 text-text-secondary hover:text-ai-accent"
          >
            <Play size={13} />
          </Button>
          <button
            className="p-1 text-text-tertiary hover:text-text-secondary"
            onClick={() => onEdit(agent)}
          >
            <Pencil size={13} />
          </button>
          <button
            className="p-1 text-text-tertiary hover:text-text-secondary"
            onClick={() => setShowHistory((v) => !v)}
          >
            <Clock size={13} />
          </button>
        </div>
      </div>

      {showHistory && runs.length > 0 && (
        <div className="border-t border-border px-2 py-2 space-y-1.5 bg-bg-secondary">
          {runs.slice(0, 5).map((r: AgentRun) => (
            <AgentRunItem key={r.id} run={r} />
          ))}
        </div>
      )}
    </div>
  )
}
