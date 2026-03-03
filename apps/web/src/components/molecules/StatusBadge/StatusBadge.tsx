import { Badge } from '../../atoms/Badge/Badge.js'
import { useTranslation } from 'react-i18next'
import type { AgentRunStatus } from '@semantic-notes/shared'

// ─── StatusBadge ──────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: AgentRunStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation('agent')
  const variantMap: Record<AgentRunStatus, 'default' | 'success' | 'error' | 'warning' | 'ai'> = {
    running: 'ai',
    success: 'success',
    error: 'error',
    cancelled: 'warning',
  }
  return (
    <Badge variant={variantMap[status]}>
      {t(`run.status.${status}`)}
    </Badge>
  )
}
