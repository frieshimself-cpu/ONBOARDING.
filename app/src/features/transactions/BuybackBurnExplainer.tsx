import { Coins, Landmark, Repeat, Flame } from 'lucide-react'
import { FEE_PERCENT } from '@/lib/constants'

const steps = [
  {
    icon: Coins,
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    title: 'You send a tip',
    body: 'Say thanks with SOL or $ONBOARDING. You approve it in your own wallet — we never touch your keys.',
  },
  {
    icon: Landmark,
    color: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
    title: `They get ${100 - FEE_PERCENT}%`,
    body: `The person you tip receives ${100 - FEE_PERCENT}%. The small ${FEE_PERCENT}% fee goes to a program-controlled vault.`,
  },
  {
    icon: Repeat,
    color: 'bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300',
    title: 'The fee buys $ONB',
    body: 'An open, onchain process market-buys $ONBOARDING with the collected fees via a Jupiter swap.',
  },
  {
    icon: Flame,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300',
    title: 'And burns it forever',
    body: 'The bought tokens go to the incinerator — gone from supply, permanently and publicly.',
  },
]

export function BuybackBurnExplainer() {
  return (
    <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <svg
        aria-hidden
        className="pointer-events-none absolute left-[12%] right-[12%] top-12 hidden h-px lg:block"
        style={{ width: '76%' }}
        preserveAspectRatio="none"
      >
        <line
          x1="0" y1="0" x2="100%" y2="0"
          stroke="rgb(var(--border))"
          strokeWidth="2"
          strokeDasharray="6 6"
          className="animate-dash-flow"
        />
      </svg>
      {steps.map((s, i) => (
        <div key={i} className="card relative p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className={`relative grid h-12 w-12 place-items-center rounded-2xl ${s.color}`}>
              <s.icon size={21} />
            </div>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-surface-2 text-[11px] font-bold text-muted">
              {i + 1}
            </span>
          </div>
          <div className="font-display text-[15px] font-bold">{s.title}</div>
          <p className="mt-2 text-sm leading-6 text-muted">{s.body}</p>
        </div>
      ))}
    </div>
  )
}
