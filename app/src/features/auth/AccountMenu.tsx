import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, UserRound, UserRoundPlus } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { getProfileByUserId } from '@/features/profiles/api'
import { gradientFromSeed } from '@/lib/utils'
import type { Profile } from '@/lib/types'

/** Navbar account control: "Sign in" when logged out, avatar menu when in. */
export function AccountMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Re-fetch whenever the menu opens too — the user may have just created
  // their profile this session, and a stale "no profile" state would show
  // the wrong menu item.
  useEffect(() => {
    let alive = true
    if (user) {
      getProfileByUserId(user.id)
        .then((p) => alive && setProfile(p))
        .catch(() => alive && setProfile(null))
    } else {
      setProfile(null)
    }
    return () => {
      alive = false
    }
  }, [user, open])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  if (!user) {
    return (
      <Link
        to="/signin"
        className="hidden h-10 items-center rounded-full border border-border px-4 text-sm font-semibold text-text transition-colors hover:border-brand/60 hover:text-brand sm:inline-flex"
      >
        Sign in
      </Link>
    )
  }

  const initial = (profile?.display_name ?? user.email)[0]?.toUpperCase() ?? '•'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white ring-2 ring-border transition-shadow hover:ring-brand/50"
        style={{ background: gradientFromSeed(user.email) }}
      >
        {initial}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="card absolute right-0 top-12 z-50 w-60 overflow-hidden p-1.5 shadow-lift"
          >
            <div className="border-b border-border/70 px-3 py-2.5">
              <div className="truncate text-sm font-semibold">
                {profile ? profile.display_name : 'Welcome!'}
              </div>
              <div className="truncate text-xs text-muted">{user.email}</div>
            </div>
            <div className="p-1">
              {profile ? (
                <MenuItem
                  icon={UserRound}
                  label="My profile"
                  onClick={() => {
                    setOpen(false)
                    navigate(`/p/${profile.handle}`)
                  }}
                />
              ) : (
                <MenuItem
                  icon={UserRoundPlus}
                  label="Create my profile"
                  onClick={() => {
                    setOpen(false)
                    navigate('/create')
                  }}
                />
              )}
              <MenuItem
                icon={LogOut}
                label="Sign out"
                onClick={async () => {
                  setOpen(false)
                  await signOut()
                  navigate('/')
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof UserRound
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-text/90 transition-colors hover:bg-surface-2"
    >
      <Icon size={15} className="text-muted" />
      {label}
    </button>
  )
}
