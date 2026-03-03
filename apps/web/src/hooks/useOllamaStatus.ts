import { useState, useEffect } from 'react'
import { statusService } from '../services/statusService.js'

type StatusState = {
  ollama: { online: boolean; models: string[] }
  chroma: { online: boolean }
  loaded: boolean
}

// ─── useOllamaStatus ──────────────────────────────────────────────────────────

export function useOllamaStatus() {
  const [status, setStatus] = useState<StatusState>({
    ollama: { online: false, models: [] },
    chroma: { online: false },
    loaded: false,
  })

  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const data = await statusService.check()
        if (!cancelled) {
          setStatus({ ...data, loaded: true })
        }
      } catch {
        if (!cancelled) {
          setStatus({
            ollama: { online: false, models: [] },
            chroma: { online: false },
            loaded: true,
          })
        }
      }
    }

    check()
    const interval = setInterval(check, 30_000) // Re-check every 30s
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return status
}
