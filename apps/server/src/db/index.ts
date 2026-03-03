import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import path from 'path'
import fs from 'fs'
import * as schema from './schema.js'

// ─── Data directory setup ─────────────────────────────────────────────────────

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), '../../data')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

const DB_PATH = path.join(DATA_DIR, 'notes.db')

// ─── SQLite connection ────────────────────────────────────────────────────────

const sqlite = new Database(DB_PATH)

// Performance pragmas
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('synchronous = NORMAL')
sqlite.pragma('foreign_keys = ON')

// ─── Drizzle ORM instance ─────────────────────────────────────────────────────

export const db = drizzle(sqlite, { schema })

export type DB = typeof db

// ─── Run migrations ───────────────────────────────────────────────────────────

export function runMigrations() {
  const migrationsFolder = path.join(path.resolve(), 'src/db/migrations')
  if (fs.existsSync(migrationsFolder)) {
    migrate(db, { migrationsFolder })
    console.log('✅ DB migrations applied')
  }
}

export { sqlite }
