import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '@/i18n/index.js'

type Theme = 'light' | 'dark' | 'system'
type Language = 'en' | 'tr'

interface UIState {
  sidebarOpen: boolean
  agentPanelOpen: boolean
  commandPaletteOpen: boolean
  searchOpen: boolean
  theme: Theme
  language: Language

  // Actions
  setSidebarOpen: (open: boolean) => void
  setAgentPanelOpen: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
  setTheme: (theme: Theme) => void
  setLanguage: (lang: Language) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      agentPanelOpen: false,
      commandPaletteOpen: false,
      searchOpen: false,
      theme: 'system',
      language: 'en',

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setAgentPanelOpen: (open) => set({ agentPanelOpen: open }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setSearchOpen: (open) => set({ searchOpen: open }),

      setTheme: (theme) => {
        set({ theme })
      },

      setLanguage: (lang) => {
        set({ language: lang })
        i18n.changeLanguage(lang)
      },
    }),
    {
      name: 'semantic-notes-ui',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        agentPanelOpen: state.agentPanelOpen,
        theme: state.theme,
        language: state.language,
      }),
    }
  )
)
