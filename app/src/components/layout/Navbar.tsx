import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Moon, Sun, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from './ThemeProvider'
import { ConnectWalletButton } from '@/features/transactions/ConnectWalletButton'

const links = [
  { to: '/developers', label: 'Developers' },
  { to: '/onboardees', label: 'Onboardees' },
  { to: '/guides', label: 'Guides' },
]

export function Navbar() {
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-4">
      <div
        className={cn(
          'mx-auto flex h-14 max-w-5xl items-center justify-between rounded-2xl border px-3 pl-4 transition-all duration-300',
          scrolled || open
            ? 'glass border-border shadow-card'
            : 'border-transparent bg-transparent',
        )}
      >
        <Link
          to="/"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <svg viewBox="0 0 64 64" className="h-7 w-7" aria-hidden>
            <rect width="64" height="64" rx="14" className="fill-surface-2" />
            <path
              d="M14 44 L34 24 L34 33 L50 17"
              fill="none"
              stroke="rgb(var(--brand))"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="17" r="5" fill="rgb(var(--brand))" />
          </svg>
          <span className="font-display text-sm font-bold tracking-tight">
            $ONBOARDING
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em] transition-colors',
                  isActive
                    ? 'bg-brand/10 text-brand'
                    : 'text-muted hover:text-text',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/#burn"
            className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-flare/30 bg-flare/10 px-3.5 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-flare transition-colors hover:bg-flare/20"
          >
            <Flame size={12} /> 2% burn
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <div className="hidden sm:block">
            <ConnectWalletButton />
          </div>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text md:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="glass mx-auto mt-2 max-w-5xl rounded-2xl border border-border p-3 shadow-card md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-xl px-4 py-3 font-mono text-xs uppercase tracking-[0.14em]',
                    isActive ? 'bg-brand/10 text-brand' : 'text-muted hover:bg-surface-2 hover:text-text',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/#burn"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-3 font-mono text-xs uppercase tracking-[0.14em] text-flare hover:bg-surface-2"
            >
              <Flame size={12} /> 2% burn
            </Link>
            <div className="mt-1 px-2 pb-1 sm:hidden">
              <ConnectWalletButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
