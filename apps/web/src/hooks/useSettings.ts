import { useState, useEffect, useCallback } from 'react'
import { settingsService } from '../services/settingsService.js'
import { useUIStore } from '../stores/uiStore.js'
import { tryCatch } from '../lib/utils.js'
import type { AppSettings, UpdateSettingsInput } from '@semantic-notes/shared'
import toast from 'react-hot-toast'

// ─── useSettings ──────────────────────────────────────────────────────────────

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { setTheme, setLanguage } = useUIStore()

  useEffect(() => {
    async function load() {
      const result = await tryCatch(() => settingsService.get())
      if (result.ok) {
        setSettings(result.data)
        setTheme(result.data.theme)
        setLanguage(result.data.language)
      }
      setIsLoading(false)
    }
    load()
  }, [setTheme, setLanguage])

  const update = useCallback(
    async (data: UpdateSettingsInput): Promise<void> => {
      const result = await tryCatch(() => settingsService.update(data))
      if (result.ok) {
        setSettings(result.data)
        if (data.theme) setTheme(result.data.theme)
        if (data.language) setLanguage(result.data.language)
        toast.success('Settings saved')
      } else {
        toast.error('Failed to save settings')
      }
    },
    [setTheme, setLanguage]
  )

  return { settings, isLoading, update }
}
