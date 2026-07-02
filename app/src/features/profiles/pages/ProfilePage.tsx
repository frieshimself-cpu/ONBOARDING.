import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Github,
  Globe,
  Send,
  MessageCircle,
  ExternalLink,
  Coins,
  Pencil,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Barcode } from '@/components/ui/Barcode'
import { getProfileByHandle, canEditProfile } from '../api'
import { USER_TYPE_META } from '@/lib/constants'
import { gradientFromSeed, shortAddress } from '@/lib/utils'
import { useAuth } from '@/lib/auth/AuthProvider'
import { TipModal } from '@/features/transactions/TipModal'
import type { Profile } from '@/lib/types'

const socialMeta: {
  key: keyof Profile['socials']
  icon: typeof Github
  href: (v: string) => string
}[] = [
  { key: 'x', icon: ExternalLink, href: (v) => `https://x.com/${v.replace(/^@/, '')}` },
  { key: 'github', icon: Github, href: (v) => `https://github.com/${v}` },
  { key: 'website', icon: Globe, href: (v) => (v.startsWith('http') ? v : `https://${v}`) },
  { key: 'telegram', icon: Send, href: (v) => `https://t.me/${v.replace(/^@/, '')}` },
  { key: 'discord', icon: MessageCircle, href: (v) => `https://discord.com/users/${v}` },
]

export function ProfilePage() {
  const { handle } = useParams()
  const { user } = useAuth()
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
      <div className="grid place-items-center py-40 text-muted">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-36 text-center">
        <div className="mono-label text-flare">passenger not found</div>
        <h1 className="display mt-3 text-3xl">No one goes by @{handle}</h1>
        <Link
          to="/developers"
          className="mt-6 inline-block font-mono text-xs uppercase tracking-wider text-brand hover:underline"
        >
          browse the directory →
        </Link>
      </div>
    )
  }

  const isDev = profile.user_type === 'developer'
  const editable = canEditProfile(profile, user?.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl px-4 py-12 sm:px-6"
    >
      {/* identity card */}
      <div className="card relative overflow-hidden shadow-pass">
        {/* seeded banner */}
        <div
          className="h-28 w-full opacity-70 saturate-[0.85] sm:h-36"
          style={{ background: gradientFromSeed(profile.handle) }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/10 to-surface/60 sm:h-36"
        />

        <div className="relative px-6 pb-7 sm:px-8">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-4 sm:-mt-12">
            <Avatar
              src={profile.avatar_url}
              name={profile.display_name}
              size={96}
              className="ring-4 ring-surface"
            />
            <div className="flex gap-2.5 pb-1">
              {editable && (
                <Link to={`/p/${profile.handle}/edit`}>
                  <Button variant="secondary" size="sm">
                    <Pencil size={13} /> Edit
                  </Button>
                </Link>
              )}
              <Button onClick={() => setTipOpen(true)} size="sm">
                <Coins size={14} /> Tip
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {profile.display_name}
            </h1>
            <span
              className={`rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] ${
                isDev ? 'bg-brand/10 text-brand' : 'bg-brand-2/10 text-brand-2'
              }`}
            >
              {USER_TYPE_META[profile.user_type].label}
            </span>
          </div>
          <div className="mt-1 font-mono text-sm text-muted">@{profile.handle}</div>

          {profile.bio && (
            <p className="mt-5 max-w-2xl leading-7 text-text/90">{profile.bio}</p>
          )}

          <div className="mt-5 flex flex-wrap gap-1.5">
            {profile.skills.map((s) => (
              <span
                key={s}
                className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
                  isDev ? 'bg-brand/10 text-brand' : 'bg-brand-2/10 text-brand-2'
                }`}
              >
                {s}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            {socialMeta.map(({ key, icon: Icon, href }) => {
              const v = profile.socials[key]
              if (!v) return null
              return (
                <a
                  key={key}
                  href={href(v)}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted transition-colors hover:border-brand/60 hover:text-brand"
                  aria-label={key}
                >
                  <Icon size={15} />
                </a>
              )
            })}
          </div>
        </div>

        {/* boarding-pass footer strip */}
        <div className="relative">
          <div className="pass-perf mx-5" />
          <div className="pass-notch-l" />
          <div className="pass-notch-r" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            {profile.wallet_address ? (
              <>
                wallet <span className="ml-2 normal-case tracking-normal text-text/80">{shortAddress(profile.wallet_address, 6)}</span>
              </>
            ) : (
              'no wallet linked'
            )}
          </div>
          <Barcode seed={profile.handle} className="h-6 w-28 text-muted/35" />
        </div>
      </div>

      {/* Portfolio links */}
      {profile.portfolio_links.length > 0 && (
        <section className="mt-12">
          <div className="mono-label mb-4">portfolio</div>
          <div className="flex flex-wrap gap-2">
            {profile.portfolio_links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-4 py-2 text-sm transition-colors hover:border-brand/60 hover:text-brand"
              >
                {l.label || l.url} <ExternalLink size={13} />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Showcase gallery */}
      {profile.showcase.length > 0 && (
        <section className="mt-12">
          <div className="mono-label mb-4">showcase</div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.showcase.map((item) => {
              const inner = (
                <>
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="aspect-video w-full rounded-xl border border-border object-cover"
                    />
                  ) : (
                    <div
                      className="aspect-video w-full rounded-xl border border-border opacity-70"
                      style={{ background: gradientFromSeed(item.title || item.id) }}
                    />
                  )}
                  <div className="mt-3 font-display text-sm font-bold">{item.title}</div>
                  {item.description && (
                    <p className="mt-1 text-sm text-muted">{item.description}</p>
                  )}
                </>
              )
              return item.url ? (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="card block p-3 transition-colors hover:border-brand/50"
                >
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
