import { useTranslation } from 'react-i18next'
import { FileText, Command } from 'lucide-react'
import { Button } from '../../atoms/Button/Button.js'
import { useNoteList } from '../../../hooks/useNote.js'
import { useUIStore } from '../../../stores/uiStore.js'

export function EmptyState() {
  const { t } = useTranslation('common')
  const { createNote } = useNoteList()
  const { setCommandPaletteOpen } = useUIStore()

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center">
        <FileText className="text-text-tertiary" size={28} />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          {t('emptyState.title')}
        </h2>
        <p className="text-sm text-text-tertiary max-w-xs">
          {t('emptyState.description')}
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button variant="primary" onClick={() => createNote()}>
          {t('actions.newPage')}
        </Button>

        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
        >
          <span className="flex items-center gap-1">
            <Command size={11} />
            <span>K</span>
          </span>
          <span>{t('emptyState.cmdKHint')}</span>
        </button>
      </div>
    </div>
  )
}
