import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AGENT_TOOL_NAMES } from '@semantic-notes/shared'
import type { AgentToolName } from '@semantic-notes/shared'
import { useAgentList } from '../../../hooks/useAgentList.js'
import { useOllamaStatus } from '../../../hooks/useOllamaStatus.js'
import { Button } from '../../atoms/Button/Button.js'
import { Input } from '../../atoms/Input/Input.js'
import { cn } from '../../../lib/utils.js'
import type { Agent } from '@semantic-notes/shared'

interface Props {
  agent?: Agent | null
  onClose: () => void
}

const TRIGGER_OPTIONS = ['manual', 'on_save', 'on_select', 'scheduled'] as const

export function AgentFormDialog({ agent, onClose }: Props) {
  const { t } = useTranslation('agent')
  const { create: createAgent, update: updateAgent } = useAgentList()
  const { ollama } = useOllamaStatus()

  const [name, setName] = useState(agent?.name ?? '')
  const [description, setDescription] = useState(agent?.description ?? '')
  const [systemPrompt, setSystemPrompt] = useState(agent?.system_prompt ?? '')
  const [model, setModel] = useState(agent?.model ?? '')
  const [trigger, setTrigger] = useState<typeof TRIGGER_OPTIONS[number]>(
    (agent?.trigger as typeof TRIGGER_OPTIONS[number]) ?? 'manual'
  )
  const [tools, setTools] = useState<AgentToolName[]>((agent?.tools ?? [...AGENT_TOOL_NAMES]) as AgentToolName[])
  const [isSaving, setIsSaving] = useState(false)

  // When Ollama models load, auto-select the first model if current selection is missing from the list
  useEffect(() => {
    if (ollama.models.length > 0 && !ollama.models.includes(model)) {
      setModel(ollama.models[0])
    }
  }, [ollama.models, model])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function toggleTool(tool: AgentToolName) {
    setTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setIsSaving(true)
    const payload = { name, description, system_prompt: systemPrompt, model, trigger, tools }
    if (agent) {
      await updateAgent(agent.id, payload)
    } else {
      await createAgent(payload)
    }
    setIsSaving(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-[#262626] border border-border rounded-xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text-primary">
            {agent ? t('form.editTitle') : t('form.createTitle')}
          </h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-secondary">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form id="agent-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs text-text-tertiary mb-1">{t('form.name')}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('form.namePlaceholder')}
              className="w-full"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-text-tertiary mb-1">{t('form.description')}</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('form.descriptionPlaceholder')}
              className="w-full"
            />
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-xs text-text-tertiary mb-1">{t('form.systemPrompt')}</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder={t('form.systemPromptPlaceholder')}
              rows={5}
              className={cn(
                'w-full px-3 py-2 text-sm bg-bg-primary text-text-primary',
                'border border-border rounded-sm resize-y',
                'focus:outline-none focus:border-border-focus placeholder:text-text-tertiary'
              )}
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs text-text-tertiary mb-1">{t('form.model')}</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={cn(
                'w-full h-8 px-2 text-sm bg-bg-primary text-text-primary',
                'border border-border rounded-sm',
                'focus:outline-none focus:border-border-focus'
              )}
            >
              {ollama.models.length > 0
                ? ollama.models.map((m) => <option key={m} value={m}>{m}</option>)
                : <option value={model}>{model}</option>
              }
            </select>
          </div>

          {/* Trigger */}
          <div>
            <label className="block text-xs text-text-tertiary mb-1">{t('form.trigger')}</label>
            <div className="flex gap-1">
              {TRIGGER_OPTIONS.map((tr) => (
                <Button
                  key={tr}
                  type="button"
                  variant={trigger === tr ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setTrigger(tr)}
                >
                  {t(`trigger.${tr}`)}
                </Button>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div>
            <label className="block text-xs text-text-tertiary mb-2">{t('form.tools')}</label>
            <div className="flex flex-wrap gap-2">
              {AGENT_TOOL_NAMES.map((tool: AgentToolName) => (
                <button
                  key={tool}
                  type="button"
                  onClick={() => toggleTool(tool)}
                  title={tool}
                  className={cn(
                    'px-2 py-1 text-xs rounded border transition-colors',
                    tools.includes(tool)
                      ? 'bg-ai-accent/10 border-ai-accent text-ai-accent'
                      : 'bg-transparent border-border text-text-tertiary hover:border-border-focus'
                  )}
                >
                  {t(`tools.${tool}`)}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <Button variant="ghost" type="button" onClick={onClose}>{t('form.cancel')}</Button>
          <Button variant="primary" type="submit" form="agent-form" isLoading={isSaving}>
            {agent ? t('form.save') : t('form.create')}
          </Button>
        </div>
      </div>
    </div>
  )
}
