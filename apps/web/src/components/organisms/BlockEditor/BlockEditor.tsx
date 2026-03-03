import { useEffect, useRef, useState } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/utils.js'
import { useNote } from '../../../hooks/useNote.js'
import { useNoteStore } from '../../../stores/noteStore.js'
import { useUIStore } from '../../../stores/uiStore.js'
import { Spinner } from '../../atoms/Spinner/Spinner.js'
import type { Block } from '@semantic-notes/shared'
// ─── Block conversion helpers ─────────────────────────────────────────────────

/**
 * Convert BlockNote's internal block format to our own format for storage.
 * We store the full BlockNote JSON so we can restore it perfectly.
 */
function blocknoteToStoredBlocks(blocks: unknown[]): Block[] {
  return blocks.map((b) => {
    const block = b as Record<string, unknown>
    return {
      type: 'paragraph', // placeholder type for discriminated union
      content: block, // store full BlockNote block as content
    } as unknown as Block
  })
}

/**
 * Convert our stored blocks back to BlockNote format.
 */
function storedToBlocknoteBlocks(blocks: Block[]): unknown[] {
  if (!blocks || blocks.length === 0) return []
  return blocks.map((b) => {
    // If the block was stored as BlockNote format
    if (b.content && typeof b.content === 'object' && 'id' in (b.content as object)) {
      return b.content
    }
    // Otherwise create a simple paragraph block
    return {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text:
            typeof b.content === 'string'
              ? b.content
              : '',
          styles: {},
        },
      ],
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
      const bnBlocks = storedToBlocknoteBlocks(note.blocks)
      if (bnBlocks.length > 0) {
        // Replace editor content
        editor.replaceBlocks(editor.document, bnBlocks as Parameters<typeof editor.replaceBlocks>[1])
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
    const blocks = blocknoteToStoredBlocks(editor.document as unknown[])
    debouncedSave({ title: titleRef.current, blocks })
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
