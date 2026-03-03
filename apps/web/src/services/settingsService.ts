import type { AppSettings, UpdateSettingsInput } from '@semantic-notes/shared'
import { apiFetch } from '@/lib/apiClient'

export const settingsService = {
  get(): Promise<AppSettings> {
    return apiFetch('/settings')
  },

  update(data: UpdateSettingsInput): Promise<AppSettings> {
    return apiFetch('/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
}
