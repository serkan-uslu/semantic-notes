#!/usr/bin/env node
/**
 * Starts ChromaDB for development.
 * Strategy:
 *   1. Already running on :8000 → nothing to do
 *   2. Docker available      → docker compose up -d chromadb
 *   3. chroma CLI available  → chroma run (foreground, concurrently manages it)
 *   4. Neither               → print install instructions and exit 1
 */

import { execSync, spawn } from 'child_process'

const CHROMA_URL = 'http://localhost:8000'

// ── 1. Already running? ───────────────────────────────────────────────────────
async function isRunning() {
  try {
    const res = await fetch(`${CHROMA_URL}/api/v2/heartbeat`)
    return res.ok
  } catch {
    return false
  }
}

// ── 2. Docker available and daemon running? ───────────────────────────────────
function tryDocker() {
  try {
    execSync('docker info', { stdio: 'ignore' })
    execSync('docker compose up -d chromadb', { stdio: 'inherit' })
    return true
  } catch {
    return false
  }
}

// ── 3. chroma CLI in PATH or common locations ─────────────────────────────────
function findChromaCLI() {
  const candidates = [
    'chroma',
    '/opt/anaconda3/bin/chroma',
    '/usr/local/bin/chroma',
    `${process.env.HOME}/.local/bin/chroma`,
  ]
  for (const bin of candidates) {
    try {
      execSync(`${bin} --version`, { stdio: 'ignore' })
      return bin
    } catch {
      // not found, try next
    }
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────

const running = await isRunning()
if (running) {
  console.log('[chroma] Already running on :8000 ✅')
  process.exit(0)
}

console.log('[chroma] Starting ChromaDB…')

if (tryDocker()) {
  console.log('[chroma] Started via Docker ✅')
  process.exit(0)
}

const chromaBin = findChromaCLI()
if (chromaBin) {
  // Run foreground — concurrently will manage the process
  console.log(`[chroma] Starting via CLI: ${chromaBin}`)
  const child = spawn(chromaBin, ['run', '--path', './data/chroma', '--port', '8000'], {
    stdio: 'inherit',
    detached: false,
  })
  child.on('error', (err) => {
    console.error('[chroma] Failed to start:', err.message)
    process.exit(1)
  })
  process.on('SIGINT', () => child.kill('SIGINT'))
  process.on('SIGTERM', () => child.kill('SIGTERM'))
} else {
  console.error(`
[chroma] ❌ ChromaDB could not be started automatically.

Install one of the following:
  • Docker Desktop  → https://www.docker.com/products/docker-desktop
  • Python package  → pip install chromadb
`)
  process.exit(1)
}
