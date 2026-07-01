import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Github, Globe, Send, MessageCircle, ExternalLink, Coins } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { Spinner } from '@/components/ui/Spinner'
import { getProfileByHandle } from '../api'
import { USER_TYPE_META } from '@/lib/constants'
import { shortAddress } from '@/lib/utils'
import { TipModal } from '@/features/transactions/TipModal'
import type { Profile } from '@/lib/types'

const socialMeta: { key: keyof Profile['socials']; icon: typeof Github; href: (v: string) => string }[] = [
  { key: 'x', icon: ExternalLink, href: (v) => `https://x.com/${v.replace(/^@/, '')}` },
  { key: 'github', icon: Github, href: (v) => `https://github.com/${v}` },
  { key: 'website', icon: Globe, href: (v) => (v.startsWith('http') ? v : `https://${v}`) },
  { key: 'telegram', icon: Send, href: (v) => `https://t.me/${v.replace(/^@/, '')}` },
  { key: 'discord', icon: MessageCircle, href: (v) => `https://discord.com/users/${v}` },
]

export function ProfilePage() {
  const { handle } = useParams()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [tipOpen, setTipOpen] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    getProfileByHandle(handle ?? '')
      .then((p) => alive && setProfile(p))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [handle])

  if (loading) {
    return (
      <div className="grid place-items-center py-32 text-muted">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <h1 className="text-2xl font-bold">Profile not found</h1>
        <p className="mt-2 text-muted">No one goes by @{handle} yet.</p>
        <Link to="/developers" className="mt-6 inline-block text-brand hover:underline">
          Browse the directory →
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl px-4 py-12 sm:px-6"
    >
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Avatar src={profile.avatar_url} name={profile.display_name} size={96} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight">{profile.display_name}</h1>
              <span className="rounded-full border border-brand/40 bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
                {USER_TYPE_META[profile.user_type].label}
              </span>
            </div>
            <div className="text-sm text-muted">@{profile.handle}</div>
            {profile.bio && <p className="mt-4 max-w-2xl text-text/90">{profile.bio}</p>}

            <div className="mt-4 flex flex-wrap gap-1.5">
              {profile.skills.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button onClick={() => setTipOpen(true)}>
                <Coins size={16} /> Tip
              </Button>
              {socialMeta.map(({ key, icon: Icon, href }) => {
                const v = profile.socials[key]
                if (!v) return null
                return (
                  <a
                    key={key}
                    href={href(v)}
                    target="_blank"
                    rel="noreferrer"
                    className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted hover:text-brand"
                    aria-label={key}
                  >
                    <Icon size={16} />
                  </a>
                )
              })}
            </div>

            {profile.wallet_address && (
              <div className="mt-4 text-xs text-muted">
                Wallet: <span className="font-mono">{shortAddress(profile.wallet_address, 6)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio links */}
      {profile.portfolio_links.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Portfolio</h2>
          <div className="flex flex-wrap gap-2">
            {profile.portfolio_links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm hover:border-brand/50 hover:text-brand"
              >
                {l.label || l.url} <ExternalLink size={13} />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Showcase gallery */}
      {profile.showcase.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Showcase</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.showcase.map((item) => {
              const inner = (
                <>
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="aspect-video w-full rounded-lg border border-border object-cover"
                    />
                  ) : (
                    <div className="aspect-video w-full rounded-lg border border-border bg-surface-2" />
                  )}
                  <div className="mt-2 font-medium">{item.title}</div>
                  {item.description && (
                    <p className="text-sm text-muted">{item.description}</p>
                  )}
                </>
              )
              return item.url ? (
                <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="card block p-3 hover:border-brand/40">
                  {inner}
                </a>
              ) : (
                <div key={item.id} className="card p-3">
                  {inner}
                </div>
              )
            })}
          </div>
        </section>
      )}

      <TipModal profile={profile} open={tipOpen} onClose={() => setTipOpen(false)} />
    </motion.div>
  )
}
