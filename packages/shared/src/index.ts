// Re-export all schemas and types from shared package

export * from './schemas/note'
export * from './schemas/agent'
export * from './schemas/search'
export * from './schemas/settings'

// ─── Utility Types ────────────────────────────────────────────────────────────

export type Result<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E }

export function ok<T>(data: T): Result<T> {
  return { ok: true, data }
}

export function err<E = Error>(error: E): Result<never, E> {
  return { ok: false, error }
}

export async function tryCatch<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await fn() }
  } catch (e) {
    return { ok: false, error: e as Error }
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const MAX_BLOCK_DEPTH = 3
export const MAX_AGENT_STEPS = 15
export const DEBOUNCE_SAVE_MS = 800
export const CHUNK_SIZE_TOKENS = 512
export const EMBEDDING_DIMENSIONS = 768 // nomic-embed-text
export const DEFAULT_PAGE_SIZE = 20
