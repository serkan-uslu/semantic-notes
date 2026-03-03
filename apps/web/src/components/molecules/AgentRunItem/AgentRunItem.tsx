import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { StatusBadge } from '@/components/molecules/StatusBadge/StatusBadge.js'
import type { AgentRun } from '@semantic-notes/shared'

// ─── AgentRunItem ─────────────────────────────────────────────────────────────

interface AgentRunItemProps {
  run: AgentRun
}

export function AgentRunItem({ run }: AgentRunItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { t } = useTranslation('agent')

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <button
        className="flex items-center justify-between w-full px-3 py-2 hover:bg-bg-hover text-sm"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <StatusBadge status={run.status} />
          <span className="text-text-secondary text-xs truncate max-w-32">
            {run.input.slice(0, 40) || 'Run'}
          </span>
        </div>
        {run.duration_ms && (
          <span className="text-text-tertiary text-xs">{run.duration_ms}ms</span>
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-border px-3 py-2 bg-bg-secondary text-xs space-y-2">
          {run.steps.length > 0 && (
            <div>
              <p className="font-medium text-text-secondary mb-1">{t('run.steps')}</p>
              {run.steps.map((step, i) => (
                <div key={i} className="pl-2 border-l border-border mb-1">
                  {step.action && (
                    <span className="text-ai-accent font-medium">{step.action}</span>
                  )}
                  {step.thought && (
                    <p className="text-text-secondary">{step.thought}</p>
                  )}
                  {step.observation && (
                    <p className="text-text-tertiary truncate">
                      {step.observation.slice(0, 100)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          {run.output && (
            <div>
              <p className="font-medium text-text-secondary mb-1">{t('run.output')}</p>
              <p className="text-text-primary whitespace-pre-wrap">{run.output}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
