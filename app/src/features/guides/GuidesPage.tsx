import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { motion, useScroll, useSpring } from 'framer-motion'
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { guides, getGuide } from './loader'
import { MarkdownRenderer } from './MarkdownRenderer'

export function GuidesPage() {
  const { slug } = useParams()

  if (guides.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-36 text-center text-muted">
        No guides yet. Drop a <code className="text-brand">.md</code> file into{' '}
        <code className="text-brand">app/content/guides/</code>.
      </div>
    )
  }

  if (!slug) return <Navigate to={`/guides/${guides[0].slug}`} replace />
  const guide = getGuide(slug)
  if (!guide) return <Navigate to={`/guides/${guides[0].slug}`} replace />

  const idx = guides.findIndex((g) => g.slug === guide.slug)
  const prev = idx > 0 ? guides[idx - 1] : null
  const next = idx < guides.length - 1 ? guides[idx + 1] : null

  return (
    <>
      <ReadingProgress key={`bar-${guide.slug}`} />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[250px_1fr]">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="mono-label mb-4 flex items-center gap-2 text-text/80">
              <BookOpen size={13} className="text-brand" /> guides
            </div>
            <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:pb-0">
              {guides.map((g, i) => {
                const active = g.slug === guide.slug
                return (
                  <Link
                    key={g.slug}
                    to={`/guides/${g.slug}`}
                    className={cn(
                      'group flex shrink-0 items-baseline gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm transition-colors lg:whitespace-normal',
                      active
                        ? 'bg-surface-2 font-semibold text-text'
                        : 'text-muted hover:bg-surface-2/60 hover:text-text',
                    )}
                  >
                    <span
                      className={cn(
                        'font-mono text-[10px]',
                        active ? 'text-brand' : 'text-muted/60 group-hover:text-brand',
                      )}
                    >
                      0{i + 1}
                    </span>
                    {g.title}
                  </Link>
                )
              })}
            </nav>
            <div className="mt-6 hidden rounded-xl border border-dashed border-border p-4 text-xs leading-5 text-muted lg:block">
              Drop a <code className="text-brand">.md</code> file into{' '}
              <code className="text-brand">content/guides/</code> and it shows
              up here automatically.
            </div>
          </aside>

          {/* Content */}
          <motion.article
            key={guide.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="min-w-0"
          >
            <div className="mono-label mb-6">
              guide 0{idx + 1} / 0{guides.length}
            </div>
            <MarkdownRenderer>{guide.body}</MarkdownRenderer>

            {/* prev / next */}
            <div className="mt-16 grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
              {prev ? (
                <Link
                  to={`/guides/${prev.slug}`}
                  className="card group flex items-center gap-3 p-4 transition-colors hover:border-brand/50"
                >
                  <ArrowLeft size={15} className="shrink-0 text-muted group-hover:text-brand" />
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                      previous
                    </div>
                    <div className="truncate text-sm font-semibold group-hover:text-brand">
                      {prev.title}
                    </div>
                  </div>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  to={`/guides/${next.slug}`}
                  className="card group flex items-center justify-end gap-3 p-4 text-right transition-colors hover:border-brand/50 sm:col-start-2"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                      next
                    </div>
                    <div className="truncate text-sm font-semibold group-hover:text-brand">
                      {next.title}
                    </div>
                  </div>
                  <ArrowRight size={15} className="shrink-0 text-muted group-hover:text-brand" />
                </Link>
              )}
            </div>
          </motion.article>
        </div>
      </div>
    </>
  )
}

function ReadingProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-brand"
      style={{ scaleX, opacity: visible ? 1 : 0 }}
    />
  )
}
