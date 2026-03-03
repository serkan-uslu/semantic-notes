import { useEffect, useRef, useState } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils.js'
import { useNote } from '@/hooks/useNote.js'
import { useNoteStore } from '@/stores/noteStore.js'
import { useUIStore } from '@/stores/uiStore.js'
import { Spinner } from '@/components/atoms/Spinner/Spinner.js'
import type { Block } from '@semantic-notes/shared'
// ─── Block conversion helpers ─────────────────────────────────────────────────

/**
 * Restore blocks from DB to BlockNote's native format.
 * Handles two storage formats:
 *  - Legacy hack: { type: 'paragraph', content: <BlockNote block> }
 *  - Current:     native BlockNote block stored directly
 */
function toBlocknoteBlocks(blocks: Block[]): unknown[] {
  if (!blocks || blocks.length === 0) return []
  return blocks.map((b: unknown) => {
    const block = b as Record<string, unknown>

    // Legacy format: content field holds the actual BlockNote block (has an 'id')
    if (block.content && typeof block.content === 'object' && 'id' in (block.content as object)) {
      return block.content
    }

    // Current format: block itself is a native BlockNote block
    if ('id' in block) {
      return block
    }

    // Agent-created block (custom format, no id): render as plain text paragraph
    const text = Array.isArray(block.content)
      ? (block.content as { text?: string }[]).map((c) => c.text ?? '').join('')
      : typeof block.content === 'string'
        ? block.content
        : ''
    return {
      type: 'paragraph',
      props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
      content: text ? [{ type: 'text', text, styles: {} }] : [],
      children: [],
    }
  })
}

// ─── NoteTitle ────────────────────────────────────────────────────────────────

interface NoteTitleProps {
  title: string
  onChange: (title: string) => void
}

function NoteTitle({ title, onChange }: NoteTitleProps) {
  const { t } = useTranslation('editor')

  return (
    <div className="mb-4">
      <input
        type="text"
        value={title}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('placeholder.title')}
        className={cn(
          'w-full text-4xl font-bold bg-transparent border-none outline-none',
          'text-text-primary placeholder:text-text-tertiary',
          'resize-none leading-tight'
        )}
      />
    </div>
  )
}

// ─── BlockEditor ──────────────────────────────────────────────────────────────

interface BlockEditorProps {
  noteId: string
  isWide?: boolean
}

export function BlockEditor({ noteId, isWide = false }: BlockEditorProps) {
  const { note, isLoading, debouncedSave } = useNote(noteId)
  const { updateNote } = useNoteStore()
  const { theme } = useUIStore()
  const resolvedTheme: 'light' | 'dark' =
    theme === 'dark' ? 'dark' :
    theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light'
  const titleRef = useRef<string>('')
  const isInitialized = useRef(false)
  const [titleValue, setTitleValue] = useState('')

  const editor = useCreateBlockNote({
    initialContent: undefined,
  })

  // Load note content into editor
  useEffect(() => {
    if (!note || isInitialized.current) return
    isInitialized.current = true
    titleRef.current = note.title
    setTitleValue(note.title)

    if (note.blocks && note.blocks.length > 0) {
      const bnBlocks = toBlocknoteBlocks(note.blocks)
      if (bnBlocks.length > 0) {
        try {
          editor.replaceBlocks(editor.document, bnBlocks as Parameters<typeof editor.replaceBlocks>[1])
        } catch {
          // Editor not yet ready (TipTap dispatch undefined); retry after mount
          setTimeout(() => {
            try {
              editor.replaceBlocks(editor.document, bnBlocks as Parameters<typeof editor.replaceBlocks>[1])
            } catch {/* ignore */}
          }, 0)
        }
      }
    }
  }, [note, editor])

  // Reset when note changes
  useEffect(() => {
    isInitialized.current = false
    setTitleValue('')
  }, [noteId])

  const handleTitleChange = (newTitle: string) => {
    setTitleValue(newTitle)
    titleRef.current = newTitle
    updateNote(noteId, { title: newTitle })
    debouncedSave({ title: newTitle })
  }

  const handleEditorChange = () => {
    // Store BlockNote native blocks directly — no wrapping needed
    debouncedSave({ title: titleRef.current, blocks: editor.document as unknown as Block[] })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!note) return null

  return (
    <div
      className={cn(
        'mx-auto px-16 py-12 w-full',
        isWide ? 'max-w-wide' : 'max-w-content'
      )}
    >
      <NoteTitle
        title={titleValue}
        onChange={handleTitleChange}
      />

      <BlockNoteView
        editor={editor}
        onChange={handleEditorChange}
        theme={resolvedTheme}
        className="min-h-[400px] outline-none"
      />
    </div>
  )
}
