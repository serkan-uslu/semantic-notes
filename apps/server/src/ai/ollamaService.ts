import { settingsRepository } from '../repositories/settingsRepository.js'
import type { AppSettings } from '@semantic-notes/shared'

// ─── Settings Cache ────────────────────────────────────────────────────────────────
// Cache settings for 10s to avoid a SQLite read on every embed/chat call.
let _settings: AppSettings | null = null
let _settingsCacheAt = 0
const SETTINGS_TTL_MS = 10_000

function loadSettings(): AppSettings {
  if (!_settings || Date.now() - _settingsCacheAt > SETTINGS_TTL_MS) {
    _settings = settingsRepository.get()
    _settingsCacheAt = Date.now()
  }
  return _settings
}

/** Call this after settings are updated so the next request picks up changes. */
export function invalidateSettingsCache(): void {
  _settings = null
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  tool_call_id?: string
}

export interface OllamaToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export interface OllamaToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string // JSON string
  }
}

export interface OllamaChatResponse {
  message: {
    role: string
    content: string
    tool_calls?: OllamaToolCall[]
  }
  done: boolean
}

// ─── Ollama Service ───────────────────────────────────────────────────────────

export const ollamaService = {
  getBaseUrl(): string {
    return loadSettings().ollama_host
  },

  /**
   * Check if Ollama is reachable
   */
  async isOnline(): Promise<boolean> {
    try {
      const res = await fetch(`${ollamaService.getBaseUrl()}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      })
      return res.ok
    } catch {
      return false
    }
  },

  /**
   * List available models from Ollama
   */
  async listModels(): Promise<string[]> {
    try {
      const res = await fetch(`${ollamaService.getBaseUrl()}/api/tags`)
      if (!res.ok) return []
      const data = (await res.json()) as { models: { name: string }[] }
      return data.models.map((m) => m.name)
    } catch {
      return []
    }
  },

  /**
   * Generate embeddings for a text
   */
  async embed(text: string, model?: string): Promise<number[] | null> {
    const settings = loadSettings()
    const embedModel = model ?? settings.embedding_model

    try {
      const res = await fetch(`${ollamaService.getBaseUrl()}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: embedModel, prompt: text }),
      })

      if (!res.ok) return null
      const data = (await res.json()) as { embedding: number[] }
      return data.embedding
    } catch {
      return null
    }
  },

  /**
   * Chat completion (with optional tool calling)
   */
  async chat(
    messages: OllamaChatMessage[],
    tools?: OllamaToolDefinition[],
    model?: string
  ): Promise<OllamaChatResponse | null> {
    const settings = loadSettings()
    const chatModel = model ?? settings.chat_model

    try {
      const body: Record<string, unknown> = {
        model: chatModel,
        messages,
        stream: false,
      }
      if (tools && tools.length > 0) {
        body.tools = tools
      }

      const res = await fetch(`${ollamaService.getBaseUrl()}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120_000), // 2min timeout
      })

      if (!res.ok) {
        console.error('[Ollama] Chat error:', await res.text())
        return null
      }

      return (await res.json()) as OllamaChatResponse
    } catch (err) {
      console.error('[Ollama] Chat exception:', err)
      return null
    }
  },
}
