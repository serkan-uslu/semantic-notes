import { useCallback } from 'react'
import { Plus, Settings, Bot } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/utils.js'
import { useNoteStore } from '../../../stores/noteStore.js'
import { useUIStore } from '../../../stores/uiStore.js'
import { useNoteList } from '../../../hooks/useNoteList.js'
import { useNoteHierarchy } from '../../../hooks/useNoteHierarchy.js'
import { noteService } from '../../../services/noteService.js'
import { NoteItem } from '../../molecules/NoteItem/NoteItem.js'
import type { Note } from '@semantic-notes/shared'

export function Sidebar() {
  const { t } = useTranslation('common')
  const { activeNoteId, setActiveNote, removeNote } = useNoteStore()
  const { createNote } = useNoteList()
  const { rootNotes } = useNoteHierarchy()
  const { setAgentPanelOpen, agentPanelOpen } = useUIStore()

  const handleCreateNote = useCallback(async () => {
    const note = await createNote()
    if (note) setActiveNote(note.id)
  }, [createNote, setActiveNote])

  const handleArchive = useCallback(
    async (id: string) => {
      await noteService.archive(id)
      removeNote(id)
    },
    [removeNote]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      await noteService.deletePermanent(id)
      removeNote(id)
    },
    [removeNote]
  )

  return (
    <aside className="flex flex-col h-full bg-bg-secondary border-r border-border w-sidebar shrink-0">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-sm font-semibold text-text-primary">{t('app.name')}</span>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        <div className="px-2 py-1">
          <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider px-2">Notes</span>
        </div>
        {rootNotes.map((note: Note) => (
          <NoteItem
            key={note.id}
            note={note}
            depth={0}
            isActive={note.id === activeNoteId}
            activeNoteId={activeNoteId}
            onSelect={setActiveNote}
            onArchive={handleArchive}
            onDelete={handleDelete}
          />
        ))}
      </div>
      <div className="border-t border-border p-2 space-y-0.5">
        <button
          onClick={handleCreateNote}
          className={cn(
            'flex items-center gap-2 w-full h-7 px-2 rounded-sm text-sm',
            'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
            'transition-colors duration-fast'
          )}
        >
          <Plus size={14} />
          {t('nav.newPage')}
        </button>
        <button
          onClick={() => setAgentPanelOpen(!agentPanelOpen)}
          className={cn(
            'flex items-center gap-2 w-full h-7 px-2 rounded-sm text-sm',
            'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
            'transition-colors duration-fast',
            agentPanelOpen && 'text-ai-accent bg-ai-subtle'
          )}
        >
          <Bot size={14} />
          {t('nav.agents')}
        </button>
        <button
          onClick={() => setActiveNote('__settings__')}
          className={cn(
            'flex items-center gap-2 w-full h-7 px-2 rounded-sm text-sm',
            'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
            'transition-colors duration-fast'
          )}
        >
          <Settings size={14} />
          {t('nav.settings')}
        </button>
      </div>
    </aside>
  )
}
