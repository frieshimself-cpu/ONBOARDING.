/** Numbered section label: "01 / PATHS ————" */
export function SectionTag({ n, label }: { n: string; label: string }) {
  return (
    <div className="mb-5 flex items-center gap-4">
      <span className="font-mono text-xs font-bold tracking-widest text-brand">
        {n}
      </span>
      <span className="mono-label text-text/80">{label}</span>
      <span className="h-px flex-1 bg-border" aria-hidden />
    </div>
  )
}
