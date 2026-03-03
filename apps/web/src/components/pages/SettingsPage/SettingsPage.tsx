import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettings } from '@/hooks/useSettings.js'
import { useOllamaStatus } from '@/hooks/useOllamaStatus.js'
import { Badge } from '@/components/atoms/Badge/Badge.js'
import { Input } from '@/components/atoms/Input/Input.js'
import { Button } from '@/components/atoms/Button/Button.js'
import { Spinner } from '@/components/atoms/Spinner/Spinner.js'
import { cn } from '@/lib/utils.js'
import type { AppSettings } from '@semantic-notes/shared'

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

// ─── SettingRow ───────────────────────────────────────────────────────────────

function SettingRow({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm text-text-primary">{label}</p>
        {hint && <p className="text-xs text-text-tertiary mt-0.5">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

// ─── SettingsPage ─────────────────────────────────────────────────────────────

export function SettingsPage() {
  const { t } = useTranslation('settings')
  const { settings, isLoading, update } = useSettings()
  const status = useOllamaStatus()

  // Local draft — never write to server until Save is clicked
  const [draft, setDraft] = useState<AppSettings | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Initialise / reset draft whenever server settings load (or reload)
  useEffect(() => {
    if (settings) setDraft(settings)
  }, [settings])

  if (isLoading || !settings || !draft) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  }

  const isDirty = JSON.stringify(draft) !== JSON.stringify(settings)

  function patch<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  async function handleSave() {
    if (!draft) return
    setIsSaving(true)
    await update({
      ollama_host: draft.ollama_host,
      chat_model: draft.chat_model,
      embedding_model: draft.embedding_model,
      auto_embed_on_save: draft.auto_embed_on_save,
      theme: draft.theme,
      language: draft.language,
    })
    setIsSaving(false)
  }

  function handleDiscard() {
    setDraft(settings)
  }

  return (
    <div className="max-w-content mx-auto px-16 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-text-primary">{t('title')}</h1>

        {isDirty && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleDiscard}>
              {t('actions.discard', { ns: 'common' })}
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Spinner size="sm" /> : t('actions.saveChanges', { ns: 'common' })}
            </Button>
          </div>
        )}
      </div>

      {/* AI & Models */}
      <Section title={t('sections.ai')}>
        <SettingRow label={t('ai.ollamaHost')} hint={t('ai.ollamaHostHint')}>
          <div className="flex items-center gap-2">
            <Input
              value={draft.ollama_host}
              className="w-56"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                patch('ollama_host', e.target.value)
              }
            />
            <Badge variant={status.ollama.online ? 'success' : 'error'}>
              {status.ollama.online ? t('ai.ollamaOnline') : t('ai.ollamaOffline')}
            </Badge>
          </div>
        </SettingRow>

        <SettingRow label={t('ai.chatModel')}>
          <select
            value={draft.chat_model}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              patch('chat_model', e.target.value)
            }
            className={cn(
              'h-8 px-2 bg-bg-primary text-text-primary text-sm',
              'border border-border rounded-sm',
              'focus:outline-none focus:border-border-focus'
            )}
          >
            {status.ollama.models.length === 0 ? (
              <option value={draft.chat_model}>{draft.chat_model}</option>
            ) : (
              status.ollama.models.map((m: string) => (
                <option key={m} value={m}>{m}</option>
              ))
            )}
          </select>
        </SettingRow>

        <SettingRow label={t('ai.embeddingModel')}>
          <select
            value={draft.embedding_model}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              patch('embedding_model', e.target.value)
            }
            className={cn(
              'h-8 px-2 bg-bg-primary text-text-primary text-sm',
              'border border-border rounded-sm',
              'focus:outline-none focus:border-border-focus'
            )}
          >
            {status.ollama.models.map((m: string) => (
              <option key={m} value={m}>{m}</option>
            ))}
            <option value="nomic-embed-text">nomic-embed-text</option>
          </select>
        </SettingRow>

        <SettingRow label={t('ai.autoEmbed')}>
          <input
            type="checkbox"
            checked={draft.auto_embed_on_save}
            onChange={(e) => patch('auto_embed_on_save', e.target.checked)}
            className="h-4 w-4 accent-ai-accent"
          />
        </SettingRow>

      </Section>

      {/* Appearance */}
      <Section title={t('sections.appearance')}>
        <SettingRow label={t('appearance.theme')}>
          <div className="flex items-center gap-1">
            {(['light', 'dark', 'system'] as const).map((th) => (
              <Button
                key={th}
                variant={draft.theme === th ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => patch('theme', th)}
              >
                {t(`appearance.theme${th.charAt(0).toUpperCase() + th.slice(1)}`)}
              </Button>
            ))}
          </div>
        </SettingRow>

        <SettingRow label={t('appearance.language')}>
          <div className="flex items-center gap-1">
            {(['en', 'tr'] as const).map((lang) => (
              <Button
                key={lang}
                variant={draft.language === lang ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => patch('language', lang)}
              >
                {lang === 'en' ? 'English' : 'Türkçe'}
              </Button>
            ))}
          </div>
        </SettingRow>
      </Section>
    </div>
  )
}
