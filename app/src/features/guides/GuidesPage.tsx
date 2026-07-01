import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { guides, getGuide } from './loader'
import { MarkdownRenderer } from './MarkdownRenderer'

export function GuidesPage() {
  const { slug } = useParams()

  if (guides.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-32 text-center text-muted">
        No guides yet. Drop a <code>.md</code> file into{' '}
        <code>app/content/guides/</code>.
      </div>
    )
  }

  // /guides with no slug -> redirect to the first guide.
  if (!slug) return <Navigate to={`/guides/${guides[0].slug}`} replace />

  const guide = getGuide(slug)
  if (!guide) return <Navigate to={`/guides/${guides[0].slug}`} replace />

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted">
            <BookOpen size={14} /> Guides
          </div>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {guides.map((g) => (
              <Link
                key={g.slug}
                to={`/guides/${g.slug}`}
                className={cn(
                  'whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors',
                  g.slug === slug
                    ? 'bg-surface-2 font-medium text-brand'
                    : 'text-muted hover:bg-surface-2 hover:text-text',
                )}
              >
                {g.title}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <motion.article
          key={guide.slug}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-w-0"
        >
          <MarkdownRenderer>{guide.body}</MarkdownRenderer>
        </motion.article>
      </div>
    </div>
  )
}
