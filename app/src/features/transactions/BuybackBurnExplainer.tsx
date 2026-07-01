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
    title: `${100 - FEE_PERCENT}% delivered, ${FEE_PERCENT}% skimmed`,
    body: 'The recipient gets the tip minus a 2% platform fee, routed to a program-controlled fee vault.',
  },
  {
    icon: Repeat,
    title: 'Auto buyback',
    body: 'A permissionless on-chain crank market-buys $ONBOARDING with the collected SOL via a Jupiter swap.',
  },
  {
    icon: Flame,
    title: 'Burned forever',
    body: 'The bought $ONBOARDING is sent to the incinerator — permanently removed from supply. All on-chain.',
  },
]

export function BuybackBurnExplainer() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <div key={i} className="card relative p-5">
          <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-brand/15 text-brand">
            <s.icon size={20} />
          </div>
          <div className="text-xs font-mono text-muted">step {i + 1}</div>
          <div className="mt-1 font-semibold">{s.title}</div>
          <p className="mt-1.5 text-sm text-muted">{s.body}</p>
        </div>
      ))}
    </div>
  )
}
