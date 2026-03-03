import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// ─── Notes ────────────────────────────────────────────────────────────────────

export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  title: text('title').notNull().default(''),
  icon: text('icon'),
  cover_url: text('cover_url'),
  is_archived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  parent_id: text('parent_id'),
  order_index: real('order_index').notNull().default(0),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
})

// ─── Blocks ───────────────────────────────────────────────────────────────────

export const blocks = sqliteTable('blocks', {
  id: text('id').primaryKey(),
  note_id: text('note_id')
    .notNull()
    .references(() => notes.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  content: text('content').notNull(), // JSON stringified block content
  order_index: real('order_index').notNull().default(0),
  parent_id: text('parent_id'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
})

// ─── Embeddings ───────────────────────────────────────────────────────────────

export const embeddings = sqliteTable('embeddings', {
  id: text('id').primaryKey(),
  source_id: text('source_id').notNull(),
  source_type: text('source_type').notNull().$type<'note' | 'block'>(),
  model: text('model').notNull(),
  chunk_index: integer('chunk_index').notNull().default(0),
  created_at: text('created_at').notNull(),
})

// ─── Agents ───────────────────────────────────────────────────────────────────

export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  system_prompt: text('system_prompt').notNull().default(''),
  model: text('model').notNull().default('llama3'),
  tools: text('tools').notNull().default('[]'), // JSON array of tool names
  trigger: text('trigger').notNull().default('manual'),
  schedule: text('schedule'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
})

// ─── Agent Runs ───────────────────────────────────────────────────────────────

export const agent_runs = sqliteTable('agent_runs', {
  id: text('id').primaryKey(),
  agent_id: text('agent_id')
    .notNull()
    .references(() => agents.id, { onDelete: 'cascade' }),
  input: text('input').notNull(),
  output: text('output'),
  steps: text('steps').notNull().default('[]'), // JSON array of AgentRunStep
  status: text('status').notNull().default('running'),
  duration_ms: integer('duration_ms'),
  created_at: text('created_at').notNull(),
})

// ─── Agent Tool Calls ─────────────────────────────────────────────────────────

export const agent_tool_calls = sqliteTable('agent_tool_calls', {
  id: text('id').primaryKey(),
  run_id: text('run_id')
    .notNull()
    .references(() => agent_runs.id, { onDelete: 'cascade' }),
  tool_name: text('tool_name').notNull(),
  input: text('input').notNull().default('{}'),   // JSON
  output: text('output').notNull().default('{}'),  // JSON
  created_at: text('created_at').notNull(),
})

// ─── Settings ─────────────────────────────────────────────────────────────────

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(), // JSON
  updated_at: text('updated_at').notNull(),
})
