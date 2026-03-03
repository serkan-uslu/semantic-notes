# Semantic Notes

A local-first, AI-powered note-taking application with semantic search and autonomous agents — all running on your machine with no cloud dependencies.

![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Ollama](https://img.shields.io/badge/Ollama-local%20LLM-black)

## What it does

- **Rich text editing** — BlockNote-powered editor with slash commands, nested blocks, and markdown shortcuts
- **Auto-save** — debounced saves as you type, no manual save needed
- **Semantic search** — vector similarity search powered by Ollama embeddings + ChromaDB
- **Full-text search** — SQLite FTS5 for fast keyword search across all notes
- **AI agents** — ReAct-loop agents that can read, create, update, and search notes using Ollama LLMs
- **i18n** — English and Turkish UI

## Architecture

```
semantic-notes/
├── apps/
│   ├── server/          # Express + SQLite (Drizzle ORM)
│   └── web/             # React 18 + Vite + Zustand
└── packages/
    └── shared/          # Zod schemas, types, constants
```

**Monorepo** managed with pnpm workspaces.

### Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Zustand, TailwindCSS, BlockNote |
| Backend | Node.js, Express, SQLite, Drizzle ORM |
| AI | Ollama (local LLM + embeddings) |
| Vector DB | ChromaDB |
| Shared | Zod schemas, TypeScript |

## Requirements

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io) 9+
- [Ollama](https://ollama.ai) running locally
- [ChromaDB](https://www.trychroma.com) running locally (for semantic search)

### Ollama models

Pull the models you want to use:

```bash
# For chat (agents)
ollama pull qwen2.5:7b

# For embeddings (semantic search)
ollama pull nomic-embed-text
```

### ChromaDB

```bash
pip install chromadb
chroma run --host localhost --port 8000
```

## Getting started

```bash
# Install dependencies
pnpm install

# Build shared package
pnpm --filter shared build

# Start dev servers (server + web in parallel)
pnpm dev
```

The web app runs at `http://localhost:5173`, the API at `http://localhost:3000`.

## Settings

Open **Settings** in the app to configure:

- **Ollama host** — default `http://localhost:11434`
- **Embedding model** — default `nomic-embed-text`
- **Chat model** — default used when creating new agents
- **Auto-embed on save** — trigger semantic indexing after every save
- **Theme** — light / dark / system
- **Language** — English / Turkish
- **Editor width** — normal / wide

## AI Agents

Agents run a ReAct loop (Reason → Act → Observe) against your notes using a local Ollama model.

### Creating an agent

1. Open the **Agents** panel (right sidebar)
2. Click **Create agent**
3. Configure name, system prompt, model, trigger, and which tools to enable

### Available tools

| Tool | Description |
|---|---|
| `read_note` | Read a note's full content |
| `search_notes` | Keyword search across notes |
| `list_notes` | List all note titles |
| `create_note` | Create a new note |
| `update_note` | Update title or content |
| `append_blocks` | Append text to an existing note |
| `delete_blocks` | Replace a note's block content |
| `search_semantic` | Vector similarity search |
| `get_settings` | Read current app settings |
| `summarize_note` | Append a summary paragraph to a note |
| `tag_note` | Add hashtags to a note title |
| `link_related` | Find and append related note links |

### Trigger types

- **Manual** — run on demand from the UI
- **On save** — run automatically after a note is saved
- **On selection** — run when a note is selected
- **Scheduled** — run on a cron schedule

## Project structure

```
apps/server/src/
├── agents/
│   ├── agentEngine.ts   # ReAct loop orchestration
│   └── agentTools.ts    # Tool definitions (Zod schemas + executors)
├── ai/
│   ├── ollamaService.ts # Ollama chat + embedding client
│   └── embeddingService.ts # Embed notes, semantic search
├── db/
│   ├── schema.ts        # Drizzle table definitions
│   ├── index.ts         # DB connection + migration runner
│   └── migrations/      # SQL migration files
├── repositories/        # Data access layer (notes, agents, runs)
├── routes/              # Express route handlers
├── services/            # Search service
└── vector/
    └── vectorService.ts # ChromaDB client

apps/web/src/
├── components/
│   ├── atoms/           # Button, Input, Spinner, Badge
│   ├── molecules/       # NoteItem, AgentCard, AgentRunItem, ConfirmDialog
│   ├── organisms/       # BlockEditor, Sidebar, AgentPanel, CommandPalette, SearchOverlay
│   ├── pages/           # NotePage, SettingsPage, EmptyState
│   └── templates/       # ThreePanelLayout
├── hooks/               # useNote, useNoteList, useAgentRun, useSettings, ...
├── services/            # API client wrappers
├── stores/              # Zustand stores (notes, agents, UI)
└── i18n/                # EN / TR translations
```

## Development

```bash
# Type-check all packages
pnpm typecheck

# Type-check a specific package
pnpm --filter server typecheck
pnpm --filter web typecheck

# Build shared types
pnpm --filter shared build
```

## License

MIT
