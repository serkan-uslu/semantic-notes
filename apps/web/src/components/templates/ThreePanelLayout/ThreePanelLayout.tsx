import { Suspense, lazy } from 'react'
import { useUIStore } from '@/stores/uiStore.js'
import { Sidebar } from '@/components/organisms/Sidebar/Sidebar.js'
import { Spinner } from '@/components/atoms/Spinner/Spinner.js'

const AgentPanel = lazy(() =>
  import('@/components/organisms/AgentPanel/AgentPanel.js').then((m) => ({
    default: m.AgentPanel,
  }))
)

interface ThreePanelLayoutProps {
  children: React.ReactNode
}

export function ThreePanelLayout({ children }: ThreePanelLayoutProps) {
  const { sidebarOpen, agentPanelOpen } = useUIStore()

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      {/* Left panel: Sidebar */}
      {sidebarOpen && <Sidebar />}

      {/* Center: Editor / Page content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {children}
      </main>

      {/* Right panel: Agent panel (lazy loaded) */}
      {agentPanelOpen && (
        <Suspense
          fallback={
            <aside className="w-agent-panel border-l border-border flex items-center justify-center">
              <Spinner size="sm" />
            </aside>
          }
        >
          <AgentPanel />
        </Suspense>
      )}
    </div>
  )
}
