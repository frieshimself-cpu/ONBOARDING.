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
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors'
  if (!onClick) {
    return (
      <span
        className={cn(
          base,
          'border border-border bg-surface-2 text-muted',
          className,
        )}
      >
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
          ? 'bg-brand text-[#06120c] border border-brand'
          : 'border border-border bg-surface-2 text-muted hover:text-text hover:border-brand/50',
        className,
      )}
    >
      {children}
    </button>
  )
}
