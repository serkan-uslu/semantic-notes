import { useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { useNoteStore } from '../../../stores/noteStore.js'
import { BlockEditor } from '../../organisms/BlockEditor/BlockEditor.js'

export function NotePage() {
  const { activeNoteId } = useNoteStore()
  const [isWide, setIsWide] = useState(false)

  if (!activeNoteId) return null

  return (
    <div className="h-full relative">
      {/* Width toggle */}
      <div className="absolute top-3 right-4 z-10">
        <button
          onClick={() => setIsWide((v) => !v)}
          className="p-1.5 rounded-sm text-text-tertiary hover:text-text-secondary hover:bg-bg-hover transition-colors"
          title={isWide ? 'Normal width' : 'Wide'}
        >
          {isWide ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      <BlockEditor noteId={activeNoteId} isWide={isWide} />
    </div>
  )
}
