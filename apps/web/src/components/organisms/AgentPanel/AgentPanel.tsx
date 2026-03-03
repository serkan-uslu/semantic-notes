import { useState } from 'react'
import { Bot, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../atoms/Button/Button.js'
import { Spinner } from '../../atoms/Spinner/Spinner.js'
import { AgentCard } from '../../molecules/AgentCard/AgentCard.js'
import { AgentFormDialog } from '../AgentFormDialog/AgentFormDialog.js'
import { useAgentList } from '../../../hooks/useAgentList.js'
import type { Agent } from '@semantic-notes/shared'

export function AgentPanel() {
  const { t } = useTranslation('agent')
  const { agents, isLoading } = useAgentList()
  const [dialogAgent, setDialogAgent] = useState<Agent | null | undefined>(undefined)

  const openCreate = () => setDialogAgent(null)
  const openEdit = (agent: Agent) => setDialogAgent(agent)
  const closeDialog = () => setDialogAgent(undefined)

  return (
    <aside className="flex flex-col h-full bg-bg-secondary border-l border-border w-agent-panel shrink-0">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot size={15} className="text-ai-accent" />
          <span className="text-sm font-semibold text-text-primary">{t('panel.title')}</span>
        </div>
        <Button variant="ghost" size="sm" className="px-1 text-text-tertiary" onClick={openCreate}>
          <Plus size={14} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        ) : agents.length === 0 ? (
          <p className="text-xs text-text-tertiary text-center py-4">{t('panel.empty')}</p>
        ) : (
          agents.map((agent: Agent) => (
            <AgentCard key={agent.id} agent={agent} onEdit={openEdit} />
          ))
        )}
      </div>

      {dialogAgent !== undefined && (
        <AgentFormDialog
          agent={dialogAgent ?? undefined}
          onClose={closeDialog}
        />
      )}
    </aside>
  )
}
