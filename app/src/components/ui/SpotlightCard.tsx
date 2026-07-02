import { useRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * Card with a cursor-tracking radial glow. The glow lives on an overlay div
 * positioned by CSS vars, so children stay untouched.
 */
export function SpotlightCard({
  className,
  children,
  glow = 'brand',
  ...props
}: HTMLAttributes<HTMLDivElement> & { glow?: 'brand' | 'brand-2' | 'flare' }) {
  const ref = useRef<HTMLDivElement>(null)

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  const glowVar =
    glow === 'flare' ? '--flare' : glow === 'brand-2' ? '--brand-2' : '--brand'

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className={cn('card group/spot relative overflow-hidden', className)}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{
          background: `radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), rgb(var(${glowVar}) / 0.09), transparent 65%)`,
        }}
      />
      {children}
    </div>
  )
}
