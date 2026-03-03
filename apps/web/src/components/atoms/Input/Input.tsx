import { forwardRef } from 'react'
import { cn } from '../../../lib/utils.js'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            'w-full h-8 px-2 bg-transparent text-text-primary text-sm',
            'border border-border rounded-sm',
            'placeholder:text-text-tertiary',
            'focus:outline-none focus:border-border-focus',
            'transition-colors duration-fast',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-destructive',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-destructive">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
