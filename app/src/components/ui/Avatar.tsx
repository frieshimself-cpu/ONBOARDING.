import { gradientFromSeed } from '@/lib/utils'

export function Avatar({
  src,
  name,
  size = 44,
  className = '',
}: {
  src?: string | null
  name: string
  size?: number
  className?: string
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('')
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover border border-border ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className={`flex items-center justify-center rounded-full text-[#0a0a0f] font-bold border border-white/10 ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: gradientFromSeed(name || 'onboarding'),
      }}
    >
      {initials || '◎'}
    </div>
  )
}
