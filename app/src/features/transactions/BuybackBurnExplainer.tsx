import { Coins, Landmark, Repeat, Flame } from 'lucide-react'
import { FEE_PERCENT } from '@/lib/constants'

const steps = [
  {
    icon: Coins,
    title: 'You tip',
    body: 'Send SOL or $ONBOARDING to a builder or onboardee. You sign it yourself — we never hold your keys.',
  },
  {
    icon: Landmark,
    title: `${100 - FEE_PERCENT}% / ${FEE_PERCENT}% split`,
    body: 'The recipient gets the tip minus a 2% platform fee, routed to a program-controlled fee vault.',
  },
  {
    icon: Repeat,
    title: 'Auto buyback',
    body: 'A permissionless onchain crank market-buys $ONBOARDING with the collected SOL via a Jupiter swap.',
  },
  {
    icon: Flame,
    title: 'Burned forever',
    body: 'The bought $ONBOARDING goes to the incinerator — permanently removed from supply. All onchain.',
  },
]

export function BuybackBurnExplainer() {
  return (
    <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* animated connector (desktop) */}
      <svg
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px w-full lg:block"
        preserveAspectRatio="none"
      >
        <line
          x1="0"
          y1="0"
          x2="100%"
          y2="0"
          stroke="rgb(var(--border))"
          strokeWidth="2"
          strokeDasharray="6 6"
          className="animate-dash-flow"
        />
      </svg>
      {steps.map((s, i) => {
        const last = i === steps.length - 1
        return (
          <div
            key={i}
            className={`card relative p-5 ${last ? 'border-flare/40' : ''}`}
          >
            <div
              className={`relative mb-4 grid h-11 w-11 place-items-center rounded-xl ${
                last ? 'bg-flare/15 text-flare' : 'bg-brand/10 text-brand'
              }`}
            >
              <s.icon size={20} />
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              step 0{i + 1}
            </div>
            <div className="mt-1.5 font-display text-sm font-bold">{s.title}</div>
            <p className="mt-2 text-sm leading-6 text-muted">{s.body}</p>
          </div>
        )
      })}
    </div>
  )
}
