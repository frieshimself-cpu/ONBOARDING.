export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  center?: boolean
}) {
  return (
    <div className={center ? 'text-center max-w-2xl mx-auto' : 'max-w-2xl'}>
      {eyebrow && (
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-muted">{subtitle}</p>}
    </div>
  )
}
