import { Link } from 'react-router-dom'
import { FEE_PERCENT } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="relative mt-28 overflow-hidden border-t border-border">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <div className="mono-label mb-4 text-text/80">Explore</div>
            <ul className="space-y-2.5 text-sm text-muted">
              <li><Link className="transition-colors hover:text-brand" to="/developers">Developers</Link></li>
              <li><Link className="transition-colors hover:text-brand" to="/onboardees">Onboardees</Link></li>
              <li><Link className="transition-colors hover:text-brand" to="/guides">Guides</Link></li>
              <li><Link className="transition-colors hover:text-brand" to="/create">Create profile</Link></li>
            </ul>
          </div>
          <div>
            <div className="mono-label mb-4 text-text/80">Transparency</div>
            <ul className="space-y-2.5 text-sm text-muted">
              <li>{FEE_PERCENT}% fee → buyback → burn</li>
              <li>Non-custodial — you sign every tx</li>
              <li>Onchain &amp; auditable</li>
            </ul>
          </div>
          <div>
            <div className="mono-label mb-4 text-text/80">Disclaimer</div>
            <p className="text-xs leading-5 text-muted">
              $ONBOARDING is a community project. Nothing here is financial
              advice. Tokens carry risk; buyback-and-burn does not guarantee
              price or returns.
            </p>
          </div>
        </div>

        <div className="mt-14 flex items-center justify-between border-t border-border pt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          <span>© {new Date().getFullYear()} $ONBOARDING</span>
          <span className="hidden sm:inline">Built on Solana ◎</span>
        </div>
      </div>

      {/* giant outlined wordmark */}
      <div
        aria-hidden
        className="pointer-events-none select-none overflow-hidden pb-2 text-center font-display text-[13vw] font-black leading-[0.8] tracking-tight"
        style={{
          color: 'transparent',
          WebkitTextStroke: '1px rgb(var(--border))',
        }}
      >
        $ONBOARDING
      </div>
    </footer>
  )
}
