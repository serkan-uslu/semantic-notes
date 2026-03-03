import { cn } from '@/lib/utils.js'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-8 w-8' }

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full border-2 border-current border-t-transparent animate-spin',
        'text-text-tertiary',
        sizeMap[size],
        className
      )}
    />
  )
}
