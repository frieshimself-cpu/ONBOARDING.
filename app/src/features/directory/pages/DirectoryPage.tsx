import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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

  useEffect(() => {
    let alive = true
    setLoading(true)
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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {meta.label}s
          </h1>
          <p className="mt-2 text-muted">{meta.blurb}</p>
        </div>
        <Link to={`/create/${userType}`}>
          <Button variant="outline">
            <UserPlus size={16} /> Add your profile
          </Button>
        </Link>
      </div>

      {/* Controls */}
      <div className="mt-8 space-y-4">
        <div className="relative max-w-md">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${meta.label.toLowerCase()}s…`}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {SKILL_TAGS.map((t) => (
            <Tag key={t} active={tags.includes(t)} onClick={() => toggleTag(t)}>
              {t}
            </Tag>
          ))}
          {tags.length > 0 && (
            <button onClick={() => setTags([])} className="text-xs text-muted hover:text-text">
              clear
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="mt-8">
        {loading ? (
          <div className="grid place-items-center py-24 text-muted">
            <Spinner className="h-6 w-6" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-20 text-center">
            <p className="text-muted">No {meta.label.toLowerCase()}s match your filters yet.</p>
            <Link to={`/create/${userType}`} className="mt-3 inline-block text-brand hover:underline">
              Be the first →
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted">{filtered.length} result{filtered.length === 1 ? '' : 's'}</div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <ProfileCard key={p.id} profile={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
