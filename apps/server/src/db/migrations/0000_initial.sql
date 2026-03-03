CREATE TABLE IF NOT EXISTS `notes` (
  `id`          TEXT PRIMARY KEY NOT NULL,
  `title`       TEXT NOT NULL DEFAULT '',
  `icon`        TEXT,
  `cover_url`   TEXT,
  `is_archived` INTEGER NOT NULL DEFAULT 0,
  `parent_id`   TEXT,
  `order_index` REAL NOT NULL DEFAULT 0,
  `created_at`  TEXT NOT NULL,
  `updated_at`  TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `blocks` (
  `id`          TEXT PRIMARY KEY NOT NULL,
  `note_id`     TEXT NOT NULL REFERENCES `notes`(`id`) ON DELETE CASCADE,
  `type`        TEXT NOT NULL,
  `content`     TEXT NOT NULL,
  `order_index` REAL NOT NULL DEFAULT 0,
  `parent_id`   TEXT,
  `created_at`  TEXT NOT NULL,
  `updated_at`  TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `embeddings` (
  `id`          TEXT PRIMARY KEY NOT NULL,
  `source_id`   TEXT NOT NULL,
  `source_type` TEXT NOT NULL,
  `model`       TEXT NOT NULL,
  `chunk_index` INTEGER NOT NULL DEFAULT 0,
  `created_at`  TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `agents` (
  `id`            TEXT PRIMARY KEY NOT NULL,
  `name`          TEXT NOT NULL,
  `description`   TEXT NOT NULL DEFAULT '',
  `system_prompt` TEXT NOT NULL DEFAULT '',
  `model`         TEXT NOT NULL DEFAULT 'llama3',
  `tools`         TEXT NOT NULL DEFAULT '[]',
  `trigger`       TEXT NOT NULL DEFAULT 'manual',
  `schedule`      TEXT,
  `is_active`     INTEGER NOT NULL DEFAULT 1,
  `created_at`    TEXT NOT NULL,
  `updated_at`    TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `agent_runs` (
  `id`          TEXT PRIMARY KEY NOT NULL,
  `agent_id`    TEXT NOT NULL REFERENCES `agents`(`id`) ON DELETE CASCADE,
  `input`       TEXT NOT NULL,
  `output`      TEXT,
  `steps`       TEXT NOT NULL DEFAULT '[]',
  `status`      TEXT NOT NULL DEFAULT 'running',
  `duration_ms` INTEGER,
  `created_at`  TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `agent_tool_calls` (
  `id`        TEXT PRIMARY KEY NOT NULL,
  `run_id`    TEXT NOT NULL REFERENCES `agent_runs`(`id`) ON DELETE CASCADE,
  `tool_name` TEXT NOT NULL,
  `input`     TEXT NOT NULL DEFAULT '{}',
  `output`    TEXT NOT NULL DEFAULT '{}',
  `created_at` TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `settings` (
  `key`        TEXT PRIMARY KEY NOT NULL,
  `value`      TEXT NOT NULL,
  `updated_at` TEXT NOT NULL
);
--> statement-breakpoint
CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
  id UNINDEXED,
  title,
  content,
  content='',
  tokenize='porter unicode61'
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_notes_parent`      ON `notes`(`parent_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_notes_archived`    ON `notes`(`is_archived`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_blocks_note`       ON `blocks`(`note_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_blocks_order`      ON `blocks`(`note_id`, `order_index`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_embeddings_source` ON `embeddings`(`source_id`, `source_type`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_agent_runs_agent`  ON `agent_runs`(`agent_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_agent_runs_status` ON `agent_runs`(`status`);
