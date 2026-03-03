import {
  FileText,
  Search,
  Zap,
  Bot,
  Globe,
  Database,
  Layers,
  Cpu,
  Terminal,
  GitBranch,
  Package,
  Server,
  Monitor,
  Workflow,
  Brain,
} from 'lucide-react'
import { cn } from '@/lib/utils.js'

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-4">
        {title}
      </h2>
      <div>{children}</div>
    </div>
  )
}

// ─── FeatureCard ──────────────────────────────────────────────────────────────

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-md hover:bg-bg-hover transition-colors">
      <div className="mt-0.5 shrink-0 w-7 h-7 rounded-md bg-bg-elevated flex items-center justify-center border border-border">
        <Icon size={14} className="text-text-secondary" />
      </div>
      <div>
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ─── StackRow ─────────────────────────────────────────────────────────────────

function StackRow({ layer, tech, detail }: { layer: string; tech: string; detail?: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border last:border-b-0">
      <span className="text-xs text-text-tertiary w-24 shrink-0 pt-0.5">{layer}</span>
      <span className="text-sm text-text-primary font-medium">{tech}</span>
      {detail && <span className="text-xs text-text-secondary ml-auto">{detail}</span>}
    </div>
  )
}

// ─── ShortcutRow ──────────────────────────────────────────────────────────────

function ShortcutRow({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
      <span className="text-sm text-text-secondary">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((k, i) => (
          <span
            key={i}
            className={cn(
              'inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs',
              'bg-bg-elevated border border-border font-mono text-text-primary'
            )}
          >
            {k}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── FlowStep ─────────────────────────────────────────────────────────────────

function FlowStep({
  step,
  label,
  description,
}: {
  step: number
  label: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-6 h-6 rounded-full bg-ai-subtle border border-ai-accent/30 flex items-center justify-center">
        <span className="text-xs font-bold text-ai-accent">{step}</span>
      </div>
      <div className="pb-5 relative flex-1">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ─── AboutPage ────────────────────────────────────────────────────────────────

export function AboutPage() {
  return (
    <div className="max-w-content mx-auto px-16 py-12">
      {/* ── Hero ── */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-ai-subtle border border-ai-accent/30 flex items-center justify-center">
            <Brain size={20} className="text-ai-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">SemanticNotes</h1>
            <p className="text-sm text-text-secondary">Your local AI-powered knowledge base</p>
          </div>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed max-w-xl">
          Local-first, AI-powered note-taking with semantic search and autonomous agents — all running
          on your machine with no cloud dependencies. Your data never leaves your device.
        </p>
      </div>

      {/* ── Features ── */}
      <Section title="Features">
        <div className="grid grid-cols-2 gap-1">
          <FeatureCard
            icon={FileText}
            title="Rich Block Editor"
            description="BlockNote-powered editor with slash commands, nested blocks, and markdown shortcuts. Auto-saves as you type."
          />
          <FeatureCard
            icon={Search}
            title="Semantic Search"
            description="Vector similarity search via Ollama embeddings + ChromaDB. Find notes by meaning, not just keywords."
          />
          <FeatureCard
            icon={Zap}
            title="Full-Text Search"
            description="SQLite FTS5 provides instant keyword search across all your notes — no indexing delay."
          />
          <FeatureCard
            icon={Bot}
            title="AI Agents"
            description="Create autonomous ReAct-loop agents that can read, write, and search your notes using local Ollama LLMs."
          />
          <FeatureCard
            icon={Globe}
            title="Multilingual UI"
            description="Interface available in English and Turkish. Easily extendable to new languages with a single JSON file."
          />
          <FeatureCard
            icon={Database}
            title="Local-First"
            description="All data stored in SQLite on your machine. Ollama runs LLMs locally. Zero cloud dependencies."
          />
        </div>
      </Section>

      {/* ── How It Works ── */}
      <Section title="How It Works">
        <div className="bg-bg-elevated border border-border rounded-lg p-5">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-4">Note Lifecycle</p>
          <FlowStep
            step={1}
            label="Write"
            description="Type in the block editor. Changes are debounced and auto-saved to SQLite via the REST API."
          />
          <FlowStep
            step={2}
            label="Embed (optional)"
            description="If Auto-embed is enabled, saving triggers Ollama to generate a vector embedding for the note content."
          />
          <FlowStep
            step={3}
            label="Index"
            description="The embedding is stored in ChromaDB. SQLite FTS5 index is updated simultaneously for keyword search."
          />
          <FlowStep
            step={4}
            label="Search"
            description="Semantic search queries ChromaDB for nearest-neighbor vectors. Full-text search uses SQLite FTS5 MATCH."
          />
        </div>

        <div className="bg-bg-elevated border border-border rounded-lg p-5 mt-3">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-4">
            Agent ReAct Loop
          </p>
          <FlowStep
            step={1}
            label="Reason"
            description="The agent receives a goal and reasons about which tool to use next using the configured Ollama chat model."
          />
          <FlowStep
            step={2}
            label="Act"
            description="Calls one of the available tools: read_note, create_note, update_note, search_notes, or list_notes."
          />
          <FlowStep
            step={3}
            label="Observe"
            description="The tool result is fed back as context. The loop repeats until the agent decides the goal is complete."
          />
        </div>
      </Section>

      {/* ── Architecture ── */}
      <Section title="Architecture">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-bg-elevated border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Monitor size={14} className="text-text-secondary" />
              <span className="text-xs font-semibold text-text-primary">Frontend</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              React 18 · Vite · Zustand · TailwindCSS · BlockNote
            </p>
          </div>
          <div className="bg-bg-elevated border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Server size={14} className="text-text-secondary" />
              <span className="text-xs font-semibold text-text-primary">Backend</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Node.js · Express · SQLite · Drizzle ORM
            </p>
          </div>
          <div className="bg-bg-elevated border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu size={14} className="text-text-secondary" />
              <span className="text-xs font-semibold text-text-primary">AI Layer</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Ollama (LLM + embeddings) · ChromaDB (vector store)
            </p>
          </div>
        </div>

        <div className="bg-bg-elevated border border-border rounded-lg p-4">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
            Tech Stack
          </p>
          <StackRow layer="Frontend" tech="React 18 + Vite" detail="TypeScript 5.4" />
          <StackRow layer="State" tech="Zustand" detail="per-store slices" />
          <StackRow layer="Styling" tech="TailwindCSS + CSS vars" detail="light / dark" />
          <StackRow layer="Editor" tech="BlockNote" detail="slash commands + blocks" />
          <StackRow layer="Backend" tech="Express + SQLite" detail="port 3001" />
          <StackRow layer="ORM" tech="Drizzle ORM" detail="migrations via drizzle-kit" />
          <StackRow layer="AI" tech="Ollama" detail="local LLM + nomic-embed-text" />
          <StackRow layer="Vector DB" tech="ChromaDB" detail="port 8000" />
          <StackRow layer="Monorepo" tech="pnpm workspaces" detail="apps/ + packages/" />
          <StackRow layer="Validation" tech="Zod" detail="shared schemas" />
        </div>
      </Section>

      {/* ── Project Structure ── */}
      <Section title="Project Structure">
        <div className="bg-bg-elevated border border-border rounded-lg p-4 font-mono">
          {[
            { indent: 0, icon: <Package size={13} />, name: 'semantic-notes/', dimmed: false },
            { indent: 1, icon: <Layers size={13} />, name: 'apps/', dimmed: true },
            { indent: 2, icon: <Server size={13} />, name: 'server/', dimmed: false },
            { indent: 3, icon: null, name: 'Express API · SQLite · Drizzle · Agents', dimmed: true },
            { indent: 2, icon: <Monitor size={13} />, name: 'web/', dimmed: false },
            { indent: 3, icon: null, name: 'React · Vite · Zustand · BlockNote', dimmed: true },
            { indent: 1, icon: <GitBranch size={13} />, name: 'packages/', dimmed: true },
            { indent: 2, icon: <Package size={13} />, name: 'shared/', dimmed: false },
            { indent: 3, icon: null, name: 'Zod schemas · TypeScript types', dimmed: true },
          ].map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 py-0.5"
              style={{ paddingLeft: `${row.indent * 16}px` }}
            >
              {row.icon && (
                <span className={cn('shrink-0', row.dimmed ? 'text-text-tertiary' : 'text-text-secondary')}>
                  {row.icon}
                </span>
              )}
              <span
                className={cn(
                  'text-xs',
                  row.dimmed ? 'text-text-tertiary' : 'text-text-primary'
                )}
              >
                {row.name}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Keyboard Shortcuts ── */}
      <Section title="Keyboard Shortcuts">
        <div className="bg-bg-elevated border border-border rounded-lg p-4">
          <ShortcutRow keys={['⌘', 'K']} description="Open command palette" />
          <ShortcutRow keys={['⌘', 'P']} description="Quick note switcher" />
          <ShortcutRow keys={['⌘', 'Shift', 'F']} description="Semantic / full-text search" />
          <ShortcutRow keys={['⌘', 'N']} description="New note" />
          <ShortcutRow keys={['/']} description="Slash command menu (in editor)" />
          <ShortcutRow keys={['⌘', 'Enter']} description="Save note manually" />
        </div>
      </Section>

      {/* ── Requirements & Setup ── */}
      <Section title="Requirements & Setup">
        <div className="bg-bg-elevated border border-border rounded-lg divide-y divide-border">
          {[
            { icon: <Terminal size={13} />, name: 'Node.js 20+', hint: 'Runtime for both server and build tools' },
            { icon: <Package size={13} />, name: 'pnpm 9+', hint: 'Package manager for the monorepo' },
            { icon: <Cpu size={13} />, name: 'Ollama', hint: 'Pull qwen2.5:7b (chat) and nomic-embed-text (embeddings)' },
            { icon: <Database size={13} />, name: 'ChromaDB', hint: 'pip install chromadb && chroma run --port 8000' },
          ].map((req, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <span className="mt-0.5 text-text-secondary shrink-0">{req.icon}</span>
              <div>
                <p className="text-sm font-medium text-text-primary">{req.name}</p>
                <p className="text-xs text-text-secondary mt-0.5">{req.hint}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-bg-elevated border border-border rounded-lg p-4">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
            Quick Start
          </p>
          {[
            'pnpm install',
            'pnpm --filter shared build',
            'pnpm dev',
          ].map((cmd, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border last:border-b-0">
              <span className="text-xs text-text-tertiary font-mono shrink-0">{i + 1}.</span>
              <code className="text-xs font-mono text-ai-accent bg-ai-subtle px-2 py-0.5 rounded">
                {cmd}
              </code>
            </div>
          ))}
          <p className="text-xs text-text-tertiary mt-3">
            Web → <code className="font-mono">localhost:5173</code> · API → <code className="font-mono">localhost:3001</code>
          </p>
        </div>
      </Section>

      {/* ── API Routes ── */}
      <Section title="API Routes">
        <div className="bg-bg-elevated border border-border rounded-lg divide-y divide-border">
          {[
            { method: 'GET/POST', path: '/api/notes', desc: 'List and create notes' },
            { method: 'GET/PATCH/DELETE', path: '/api/notes/:id', desc: 'Read, update, or delete a note' },
            { method: 'POST', path: '/api/notes/:id/archive', desc: 'Archive a note' },
            { method: 'GET/POST', path: '/api/agents', desc: 'List and create agents' },
            { method: 'POST', path: '/api/agents/:id/run', desc: 'Run an agent (streaming SSE)' },
            { method: 'GET/POST', path: '/api/search', desc: 'Full-text and semantic search' },
            { method: 'GET/PATCH', path: '/api/settings', desc: 'Read and update app settings' },
            { method: 'GET', path: '/api/status', desc: 'Ollama + ChromaDB connection status' },
          ].map((r, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-2.5">
              <span className="text-xs font-mono text-text-tertiary w-36 shrink-0 pt-0.5">{r.method}</span>
              <code className="text-xs font-mono text-ai-accent">{r.path}</code>
              <span className="text-xs text-text-secondary ml-auto text-right">{r.desc}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── About / Version ── */}
      <Section title="About">
        <div className="flex items-center justify-between text-xs text-text-tertiary">
          <div className="space-y-1">
            <p>SemanticNotes · v1.0.0</p>
            <p>React 18 · Express · SQLite · Ollama · ChromaDB</p>
            <p className="mt-2 text-text-tertiary/60">
              Local-first. No telemetry. No cloud. Your data stays on your machine.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Workflow size={32} className="text-text-tertiary/30" />
          </div>
        </div>
      </Section>
    </div>
  )
}
