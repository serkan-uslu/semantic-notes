import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─── Tailwind class merger ────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Time formatting ──────────────────────────────────────────────────────────

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHr = Math.floor(diffMs / 3_600_000)
  const diffDay = Math.floor(diffMs / 86_400_000)

  if (diffMin < 1) return 'justNow'
  if (diffHr < 1) return `${diffMin}m`
  if (diffDay < 1) return `${diffHr}h`
  return `${diffDay}d`
}

// ─── Debounce ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

// ─── Fractional indexing ──────────────────────────────────────────────────────

export function getBetween(a: number, b: number): number {
  return (a + b) / 2
}

// ─── Truncate text ────────────────────────────────────────────────────────────

export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen - 3) + '...'
}

// ─── Shallow equal ────────────────────────────────────────────────────────────

export function shallowEqual<T extends Record<string, unknown>>(a: T, b: T): boolean {
  const keysA = Object.keys(a)
  if (keysA.length !== Object.keys(b).length) return false
  return keysA.every((key) => a[key] === b[key])
}

// ─── Result helpers (re-exported from shared) ─────────────────────────────────
// Import Result, ok, err, tryCatch from @semantic-notes/shared
export type { Result } from '@semantic-notes/shared'
export { ok, err, tryCatch } from '@semantic-notes/shared'
