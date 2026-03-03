import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import '@/i18n/index.js'
import { useUIStore } from '@/stores/uiStore.js'
import { useNoteStore } from '@/stores/noteStore.js'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts.js'
import { ThreePanelLayout } from '@/components/templates/ThreePanelLayout/ThreePanelLayout.js'
import { CommandPalette } from '@/components/organisms/CommandPalette/CommandPalette.js'
import { SearchOverlay } from '@/components/organisms/SearchOverlay/SearchOverlay.js'
import { NotePage } from '@/components/pages/NotePage/NotePage.js'
import { EmptyState } from '@/components/pages/EmptyState/EmptyState.js'
import { SettingsPage } from '@/components/pages/SettingsPage/SettingsPage.js'

const SETTINGS_NOTE_ID = '__settings__'

export default function App() {
  const { theme } = useUIStore()
  const { activeNoteId } = useNoteStore()

  // Apply theme to DOM; re-run when user preference or system preference changes
  useEffect(() => {
    const applyTheme = () => {
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      document.documentElement.classList.toggle('dark', isDark)
    }
    applyTheme()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', applyTheme)
    return () => mq.removeEventListener('change', applyTheme)
  }, [theme])

  // Global keyboard shortcuts
  useKeyboardShortcuts()

  // Decide which main content to render
  function renderContent() {
    if (activeNoteId === SETTINGS_NOTE_ID) return <SettingsPage />
    if (activeNoteId) return <NotePage />
    return <EmptyState />
  }

  return (
    <>
      <ThreePanelLayout>{renderContent()}</ThreePanelLayout>
      <CommandPalette />
      <SearchOverlay />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: '!bg-bg-elevated !text-text-primary !border !border-border !shadow-lg !text-sm',
          duration: 3000,
        }}
      />
    </>
  )
}
