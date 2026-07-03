import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'flare' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-ink font-bold hover:-translate-y-0.5 hover:shadow-volt active:translate-y-0',
  secondary:
    'bg-surface-2 text-text border border-border hover:border-muted/50 hover:-translate-y-0.5 active:translate-y-0',
  outline:
    'border border-border text-text hover:border-brand/70 hover:text-brand',
  ghost: 'text-muted hover:text-text hover:bg-surface-2',
  flare:
    'bg-flare text-white font-bold hover:-translate-y-0.5 hover:shadow-[0_8px_32px_-8px_rgb(var(--flare)/0.5)] active:translate-y-0',
  danger: 'bg-red-500/90 text-white hover:bg-red-500',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-4 text-xs rounded-full',
  md: 'h-10 px-5 text-sm rounded-full',
  lg: 'h-12 px-7 text-[15px] rounded-full',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 will-change-transform active:scale-[0.97]',
        'disabled:opacity-50 disabled:pointer-events-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
