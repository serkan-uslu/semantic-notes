import { cn } from '../../../lib/utils.js'

type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'ai'

const variants: Record<BadgeVariant, string> = {
  default: 'bg-bg-active text-text-secondary',
  success: 'bg-success/10 text-success',
  error: 'bg-destructive/10 text-destructive',
  warning: 'bg-warning/10 text-warning',
  ai: 'bg-ai-subtle text-ai-accent',
}

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
