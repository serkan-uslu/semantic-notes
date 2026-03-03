import { useState, useCallback } from 'react'
import {
  FileText,
  ChevronRight,
  ChevronDown,
  Archive,
  Trash2,
  MoreHorizontal,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils.js'
import { useNoteHierarchy } from '@/hooks/useNoteHierarchy.js'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog/ConfirmDialog.js'
import type { Note } from '@semantic-notes/shared'

// ─── NoteItem ─────────────────────────────────────────────────────────────────

interface NoteItemProps {
  note: Note
  depth: number
  isActive: boolean
  activeNoteId: string | null
  onSelect: (id: string) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
}

export function NoteItem({
  note,
  depth,
  isActive,
  activeNoteId,
  onSelect,
  onArchive,
  onDelete,
}: NoteItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { t } = useTranslation('common')
  const { getChildren } = useNoteHierarchy()
  const children = getChildren(note.id)
  const hasChildren = children.length > 0

  const handleArchive = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setShowMenu(false)
      onArchive(note.id)
    },
    [note.id, onArchive]
  )

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setShowMenu(false)
      setConfirmDelete(true)
    },
    []
  )

  return (
    <div className="relative">
      <div
        className={cn(
          'group flex items-center gap-1 h-7 rounded-sm cursor-pointer select-none',
          'hover:bg-bg-hover transition-colors duration-fast',
          isActive && 'bg-bg-active',
          'pr-1'
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => onSelect(note.id)}
      >
        {/* Expand/collapse chevron */}
        <button
          className="p-0.5 text-text-tertiary hover:text-text-secondary shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded((v) => !v)
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronRight size={12} />
            )
          ) : (
            <span className="w-3 inline-block" />
          )}
        </button>

        {/* Icon */}
        {note.icon ? (
          <span className="text-sm shrink-0">{note.icon}</span>
        ) : (
          <FileText size={14} className="text-text-tertiary shrink-0 opacity-70" />
        )}

        {/* Title */}
        <span
          className={cn(
            'flex-1 text-sm truncate',
            isActive ? 'text-text-primary font-medium' : 'text-text-secondary'
          )}
        >
          {note.title || 'Untitled'}
        </span>

        {/* Context menu trigger */}
        <button
          className="p-0.5 text-text-tertiary opacity-0 group-hover:opacity-100 hover:text-text-primary"
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu((v) => !v)
          }}
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Dropdown menu — anchored to the wrapper, not the flex row */}
      {showMenu && (
        <>
          {/* Click-outside overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div
            className="absolute right-1 top-7 z-50 bg-bg-primary border border-border rounded-md shadow-md py-1 text-sm min-w-[120px]"
          >
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-bg-hover text-text-secondary hover:text-text-primary"
              onClick={handleArchive}
            >
              <Archive size={13} />
              {t('actions.archive')}
            </button>
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-bg-hover text-text-secondary hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 size={13} />
              {t('actions.delete')}
            </button>
          </div>
        </>
      )}

      {isExpanded && hasChildren && (
        <div>
          {children.map((child: Note) => (
            <NoteItem
              key={child.id}
              note={child}
              depth={depth + 1}
              isActive={child.id === activeNoteId}
              activeNoteId={activeNoteId}
              onSelect={onSelect}
              onArchive={onArchive}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title={t('note.deleteTitle', { title: note.title || t('note.untitled') })}
        description={t('note.deleteDescription')}
        confirmLabel={t('actions.delete')}
        cancelLabel={t('actions.cancel')}
        variant="danger"
        onConfirm={() => { setConfirmDelete(false); onDelete(note.id) }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
