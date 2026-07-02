/** Decorative fake barcode, deterministic per seed. Pure SVG, no deps. */
export function Barcode({ seed, className }: { seed: string; className?: string }) {
  let h = 7
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const bars: { x: number; w: number }[] = []
  let x = 0
  let s = h
  while (x < 120) {
    s = (s * 1103515245 + 12345) >>> 0
    const w = 1 + (s % 4)
    bars.push({ x, w })
    x += w + 1 + ((s >> 8) % 3)
  }
  return (
    <svg viewBox="0 0 120 24" className={className} aria-hidden preserveAspectRatio="none">
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={24} fill="currentColor" />
      ))}
    </svg>
  )
}
