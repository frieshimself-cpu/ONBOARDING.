import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, UserPlus } from 'lucide-react'
import { ProfileCard } from '@/features/profiles/components/ProfileCard'
import { listProfiles } from '@/features/profiles/api'
import { Input } from '@/components/ui/Field'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { SKILL_TAGS, USER_TYPE_META, type UserType } from '@/lib/constants'
import type { Profile } from '@/lib/types'

export function DirectoryPage({ userType }: { userType: UserType }) {
  const [all, setAll] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const meta = USER_TYPE_META[userType]
  const isDev = userType === 'developer'

  useEffect(() => {
    let alive = true
    setLoading(true)
    setSearch('')
    setTags([])
    listProfiles({ userType })
      .then((p) => alive && setAll(p))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [userType])

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    return all.filter((p) => {
      const matchesSearch =
        !s ||
        p.display_name.toLowerCase().includes(s) ||
        p.handle.toLowerCase().includes(s) ||
        (p.bio ?? '').toLowerCase().includes(s)
      const matchesTags = tags.every((t) => p.skills.includes(t))
      return matchesSearch && matchesTags
    })
  }, [all, search, tags])

  function toggleTag(t: string) {
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <motion.div
        key={userType}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="eyebrow mb-4">
          Directory
          <span className={isDev ? 'text-brand' : 'text-brand-2'}>{meta.label}s</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <h1 className="font-display text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-none tracking-tight">
            {meta.label}s<span className={isDev ? 'text-brand' : 'text-brand-2'}>.</span>
          </h1>
          <Link to={`/create/${userType}`}>
            <Button variant="outline">
              <UserPlus size={15} /> Add your profile
            </Button>
          </Link>
        </div>
        <p className="mt-3 max-w-lg text-muted">{meta.blurb}</p>
      </motion.div>

      {/* Controls */}
      <div className="sticky top-[72px] z-30 -mx-4 mt-10 px-4 py-3 sm:-mx-6 sm:px-6">
        <div className="glass flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center">
          <div className="relative sm:w-72">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${meta.label.toLowerCase()}s…`}
              className="rounded-xl pl-9"
            />
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-1.5">
            {SKILL_TAGS.map((t) => (
              <Tag key={t} active={tags.includes(t)} onClick={() => toggleTag(t)}>
                {t}
              </Tag>
            ))}
            {tags.length > 0 && (
              <button
                onClick={() => setTags([])}
                className="ml-1 font-mono text-[11px] uppercase text-muted hover:text-flare"
              >
                clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-8">
        {loading ? (
          <div className="grid place-items-center py-28 text-muted">
            <Spinner className="h-6 w-6" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border py-24 text-center">
            <div className="text-sm font-semibold text-muted">No matches</div>
            <p className="mt-3 text-muted">
              No {meta.label.toLowerCase()}s match your filters yet.
            </p>
            <Link
              to={`/create/${userType}`}
              className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
            >
              Be the first →
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-5 text-sm font-medium text-muted">
              {filtered.length} aboard
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p, i) => (
                <ProfileCard key={p.id} profile={p} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
