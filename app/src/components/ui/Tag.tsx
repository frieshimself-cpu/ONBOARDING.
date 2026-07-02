import { cn } from '@/lib/utils'

export function Tag({
  children,
  active,
  onClick,
  className,
}: {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  className?: string
}) {
  const base =
    'inline-flex items-center rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-all'
  if (!onClick) {
    return (
      <span className={cn(base, 'border border-border bg-surface-2 text-muted', className)}>
        {children}
      </span>
    )
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        base,
        active
          ? 'border border-brand bg-brand font-bold text-ink'
          : 'border border-border bg-surface-2 text-muted hover:border-brand/60 hover:text-text',
        className,
      )}
    >
      {children}
    </button>
  )
}
