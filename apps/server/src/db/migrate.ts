/**
 * CLI migration script — runs pending Drizzle migrations against the database.
 * Usage: pnpm db:migrate
 *
 * This is the same migration path used on server startup (runMigrations in db/index.ts).
 * Run this script when you want to apply migrations without starting the server,
 * or to verify the DB is up to date after pulling new changes.
 */
import { runMigrations } from '~/db/index.js'

runMigrations()
