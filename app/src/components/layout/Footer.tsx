import { Link } from 'react-router-dom'
import { SITE, FEE_PERCENT } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t border-border/70 mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="font-extrabold text-lg">{SITE.name}</div>
          <p className="mt-2 text-sm text-muted">{SITE.tagline}</p>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">Explore</div>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link className="hover:text-text" to="/developers">Developers</Link></li>
            <li><Link className="hover:text-text" to="/onboardees">Onboardees</Link></li>
            <li><Link className="hover:text-text" to="/guides">Guides</Link></li>
            <li><Link className="hover:text-text" to="/create">Create profile</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">Transparency</div>
          <ul className="space-y-2 text-sm text-muted">
            <li>{FEE_PERCENT}% fee &rarr; buyback &rarr; burn</li>
            <li>Non-custodial &mdash; you sign every tx</li>
            <li>On-chain &amp; auditable</li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">Disclaimer</div>
          <p className="text-xs text-muted leading-5">
            $ONBOARDING is a community project. Nothing here is financial advice.
            Tokens carry risk; buyback-and-burn does not guarantee price or returns.
          </p>
        </div>
      </div>
      <div className="border-t border-border/70 py-6 text-center text-xs text-muted">
        &copy; {new Date().getFullYear()} {SITE.name}. Built on Solana.
      </div>
    </footer>
  )
}
