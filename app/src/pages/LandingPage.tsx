import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code2,
  Flame,
  ShieldCheck,
  Sprout,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SectionTag } from '@/components/ui/SectionTag'
import { Ticker } from '@/components/ui/Ticker'
import { Barcode } from '@/components/ui/Barcode'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { BuybackBurnExplainer } from '@/features/transactions/BuybackBurnExplainer'
import { guides } from '@/features/guides/loader'
import { computeFee } from '@/lib/solana/fee'
import { FEE_PERCENT, INCINERATOR, USER_TYPE_META } from '@/lib/constants'
import { lamportsToSol, shortAddress, solToLamports } from '@/lib/utils'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: 'easeOut' },
} as const

export function LandingPage() {
  return (
    <div className="overflow-x-clip">
      <Hero />
      <Ticker
        items={[
          '$ONBOARDING',
          `${FEE_PERCENT}% of every tip → buyback → burn`,
          'non-custodial',
          'phantom + solflare',
          'you sign everything',
          'builders ⇄ newcomers',
          'guides included',
        ]}
      />
      <PathsSection />
      <BurnSection />
      <FeaturesSection />
      <GuidesTeaser />
      <FinalCta />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      {/* volt beam */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rotate-[-8deg] opacity-[0.16] blur-3xl"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgb(var(--brand)) 35%, rgb(var(--brand-2)) 70%, transparent)',
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-border bg-surface/70 py-1.5 pl-2 pr-4 backdrop-blur"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-flare/15 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-flare">
              <Flame size={11} /> {FEE_PERCENT}%
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              of every tip is burned
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.05 }}
            className="font-display text-[clamp(2.6rem,7vw,4.6rem)] font-black leading-[1.02] tracking-tight"
          >
            GET
            <br />
            <span className="text-outline-volt">ONBOARDED</span>
            <br />
            ONCHAIN<span className="text-brand">.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-6 max-w-lg text-lg leading-8 text-muted"
          >
            $ONBOARDING pairs Solana builders with the people trying to break
            in. Make a profile, find your other half, tip the ones who help —
            and every tip torches supply.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link to="/create/developer">
              <Button size="lg" className="w-full sm:w-auto">
                <Code2 size={17} /> {USER_TYPE_META.developer.cta}
              </Button>
            </Link>
            <Link to="/create/onboardee">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <Sprout size={17} /> {USER_TYPE_META.onboardee.cta}
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted"
          >
            <ShieldCheck size={13} className="text-brand" />
            non-custodial — your keys never leave your wallet
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28, rotate: 1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 1.5 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="hidden lg:block"
        >
          <Console />
        </motion.div>
      </div>
    </section>
  )
}

/* Fake onboarding console — loops through a session log. */
const CONSOLE_LINES: { text: string; tone: 'muted' | 'volt' | 'flare' | 'violet' }[] = [
  { text: '$ onboarding init --wallet phantom', tone: 'muted' },
  { text: '✓ wallet connected  7xKX…aZ1d', tone: 'volt' },
  { text: '✓ profile created   @newcoiner (onboardee)', tone: 'volt' },
  { text: '→ matched with      @solslinger (developer)', tone: 'violet' },
  { text: '$ tip @solslinger 0.5 SOL', tone: 'muted' },
  { text: '  ├─ 0.49 SOL → @solslinger', tone: 'volt' },
  { text: '  └─ 0.01 SOL → fee vault', tone: 'muted' },
  { text: '⟲ jupiter swap: SOL → $ONBOARDING', tone: 'violet' },
  { text: '🔥 burn 41,337 $ONB → incinerator', tone: 'flare' },
  { text: '✓ supply reduced. forever.', tone: 'flare' },
]

const toneClass = {
  muted: 'text-muted',
  volt: 'text-brand',
  flare: 'text-flare',
  violet: 'text-brand-2',
} as const

function Console() {
  const [count, setCount] = useState(3)

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => (c >= CONSOLE_LINES.length ? 3 : c + 1))
    }, 1100)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="card relative overflow-hidden shadow-pass">
      <div
        aria-hidden
        className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand/10 blur-3xl"
      />
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-flare/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand-2/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand/80" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          onboarding — live flow
        </span>
      </div>
      <div className="min-h-[330px] space-y-2.5 p-5 font-mono text-[12.5px] leading-5">
        <AnimatePresence initial={false}>
          {CONSOLE_LINES.slice(0, count).map((line, i) => (
            <motion.div
              key={`${line.text}-${i}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className={toneClass[line.tone]}
            >
              {line.text}
            </motion.div>
          ))}
        </AnimatePresence>
        <span className="inline-block h-4 w-2 animate-blink bg-brand align-middle" />
      </div>
      <div className="flex items-center justify-between border-t border-border px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        <span>simulated session</span>
        <span className="text-brand">◎ solana</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Two-path chooser — boarding passes                                  */
/* ------------------------------------------------------------------ */

function PathsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionTag n="01" label="Pick your path" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="display max-w-xl text-3xl leading-tight sm:text-5xl">
          Two sides.
          <br />
          <span className="text-muted">One boarding gate.</span>
        </h2>
        <p className="max-w-sm text-sm leading-6 text-muted">
          Whether you ship code or you&apos;re trying to get in, your pass to
          the ecosystem starts here.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <BoardingPass
          type="developer"
          gate="D3V"
          accent="brand"
          icon={Code2}
          perks={['Show your work & skills', 'Get discovered by projects', 'Receive tips in SOL / $ONB']}
        />
        <BoardingPass
          type="onboardee"
          gate="N00B"
          accent="brand-2"
          icon={Sprout}
          perks={['Learn with hands-on guides', 'Find a builder to pair with', 'Grow into the ecosystem']}
        />
      </div>
    </section>
  )
}

function BoardingPass({
  type,
  gate,
  accent,
  icon: Icon,
  perks,
}: {
  type: 'developer' | 'onboardee'
  gate: string
  accent: 'brand' | 'brand-2'
  icon: typeof Code2
  perks: string[]
}) {
  const meta = USER_TYPE_META[type]
  const accentText = accent === 'brand' ? 'text-brand' : 'text-brand-2'
  const accentBg = accent === 'brand' ? 'bg-brand' : 'bg-brand-2'

  return (
    <motion.div {...fadeUp}>
      <SpotlightCard glow={accent} className="shadow-pass">
        {/* colored spine */}
        <div className={`absolute inset-y-0 left-0 w-1.5 ${accentBg}`} aria-hidden />

        <div className="p-7 pl-9 sm:p-8 sm:pl-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mono-label mb-1.5">boarding pass</div>
              <h3 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
                {meta.cta}
              </h3>
            </div>
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-surface-2 ${accentText}`}>
              <Icon size={22} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 font-mono text-xs">
            <div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-muted">from</div>
              <div className="mt-1 font-bold uppercase">Offchain</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-muted">to</div>
              <div className={`mt-1 font-bold uppercase ${accentText}`}>Onchain</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-muted">gate</div>
              <div className="mt-1 font-bold uppercase">{gate}</div>
            </div>
          </div>

          <ul className="mt-6 space-y-2 text-sm text-text/90">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-2.5">
                <span className={`h-1 w-3 rounded-full ${accentBg}`} />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* perforation */}
        <div className="relative">
          <div className="pass-perf mx-5" />
          <div className="pass-notch-l" />
          <div className="pass-notch-r" />
        </div>

        <div className="flex items-center justify-between gap-6 p-6 pl-9 sm:pl-10">
          <Barcode seed={type} className="h-8 w-36 text-text/70" />
          <div className="flex gap-2.5">
            <Link to={`/${type}s`}>
              <Button variant="outline" size="sm">
                Browse
              </Button>
            </Link>
            <Link to={`/create/${type}`}>
              <Button size="sm">
                Board now <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Burn section                                                        */
/* ------------------------------------------------------------------ */

function BurnSection() {
  return (
    <section id="burn" className="relative scroll-mt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-72 max-w-3xl rounded-full bg-flare/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <SectionTag n="02" label="Tokenomics, but honest" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="display max-w-2xl text-3xl leading-tight sm:text-5xl">
            Every tip feeds
            <br />
            <span className="text-flare">the incinerator.</span>
          </h2>
          <p className="max-w-sm text-sm leading-6 text-muted">
            A {FEE_PERCENT}% platform fee on every on-platform tip market-buys
            $ONBOARDING and burns it. Onchain, permissionless, verifiable — and
            no, it doesn&apos;t guarantee price.
          </p>
        </div>

        <div className="mt-12">
          <BuybackBurnExplainer />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <FeeCalculator />
          <motion.div {...fadeUp} className="card flex flex-col justify-between p-7">
            <div>
              <div className="mono-label mb-4">burn destination</div>
              <p className="text-sm leading-7 text-muted">
                Bought-back tokens are sent to Solana&apos;s incinerator — an
                address nobody controls. Tokens that land there are gone from
                supply, permanently and publicly.
              </p>
            </div>
            <div className="mt-6 rounded-xl border border-flare/25 bg-flare/5 p-4">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-flare">
                <Flame size={12} /> incinerator
              </div>
              <div className="mt-2 break-all font-mono text-xs text-text/80">
                {INCINERATOR}
              </div>
            </div>
            <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              live burn stats appear once the fee program is deployed
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function FeeCalculator() {
  const [sol, setSol] = useState(1)
  const fee = useMemo(() => computeFee(solToLamports(sol || 0)), [sol])
  const netPct = 100 - FEE_PERCENT

  return (
    <motion.div {...fadeUp} className="card p-7">
      <div className="mono-label mb-1.5">try the math</div>
      <div className="font-display text-lg font-bold">What a tip actually does</div>

      <div className="mt-6 flex items-center gap-4">
        <input
          type="range"
          min={0.1}
          max={10}
          step={0.1}
          value={sol}
          onChange={(e) => setSol(Number(e.target.value))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-surface-2 accent-[rgb(var(--brand))]"
          aria-label="Tip amount in SOL"
        />
        <div className="w-28 rounded-xl border border-border bg-surface-2 px-3 py-2 text-right font-mono text-sm">
          {sol.toFixed(1)} SOL
        </div>
      </div>

      {/* split bar */}
      <div className="mt-6 flex h-9 w-full overflow-hidden rounded-lg font-mono text-[10px] font-bold uppercase">
        <motion.div
          className="flex items-center justify-center bg-brand text-ink"
          animate={{ width: `${netPct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        >
          {netPct}% recipient
        </motion.div>
        <motion.div
          className="flex items-center justify-center bg-flare text-white"
          animate={{ width: `${FEE_PERCENT}%` }}
        >
          <Flame size={11} />
        </motion.div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-surface-2 p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            recipient gets
          </div>
          <div className="mt-1.5 font-display text-xl font-bold text-brand">
            {lamportsToSol(fee.netLamports).toLocaleString(undefined, { maximumFractionDigits: 4 })}{' '}
            <span className="text-sm">SOL</span>
          </div>
        </div>
        <div className="rounded-xl border border-flare/25 bg-flare/5 p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-flare/90">
            bought &amp; burned
          </div>
          <div className="mt-1.5 font-display text-xl font-bold text-flare">
            {lamportsToSol(fee.feeLamports).toLocaleString(undefined, { maximumFractionDigits: 4 })}{' '}
            <span className="text-sm">SOL</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Features                                                            */
/* ------------------------------------------------------------------ */

function FeaturesSection() {
  const items = [
    {
      icon: Wallet,
      title: 'Wallet-native',
      body: 'Phantom & Solflare via wallet-adapter. Clear previews before you ever sign.',
    },
    {
      icon: ShieldCheck,
      title: 'Non-custodial',
      body: 'We never hold keys or funds. Every transaction is yours to approve — or reject.',
    },
    {
      icon: BookOpen,
      title: 'Guides that ship',
      body: 'From your first wallet to your first launch, written for humans, not degens-only.',
    },
    {
      icon: Flame,
      title: 'Deflation you can audit',
      body: 'The fee, the swap, the burn — all onchain, all public, all documented.',
    },
  ]
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionTag n="03" label="Why it works" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((f, i) => (
          <motion.div
            key={f.title}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: i * 0.06 }}
          >
            <SpotlightCard className="h-full p-6">
              <f.icon size={20} className="text-brand" />
              <div className="mt-4 font-display text-sm font-bold">{f.title}</div>
              <p className="mt-2 text-sm leading-6 text-muted">{f.body}</p>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Guides teaser                                                       */
/* ------------------------------------------------------------------ */

function GuidesTeaser() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionTag n="04" label="Learn the ropes" />
      <div className="flex items-end justify-between gap-4">
        <h2 className="display text-3xl leading-tight sm:text-5xl">
          Required reading<span className="text-brand">.</span>
        </h2>
        <Link
          to="/guides"
          className="hidden items-center gap-1 font-mono text-xs uppercase tracking-[0.16em] text-brand hover:underline sm:inline-flex"
        >
          all guides <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {guides.map((g, i) => (
          <motion.div key={g.slug} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.07 }}>
            <Link to={`/guides/${g.slug}`} className="group block h-full">
              <SpotlightCard className="flex h-full flex-col p-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                  guide 0{i + 1}
                </div>
                <div className="mt-3 font-display text-lg font-bold leading-snug group-hover:text-brand">
                  {g.title}
                </div>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted">{g.description}</p>
                <div className="mt-5 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.16em] text-brand">
                  read <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </SpotlightCard>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Final CTA                                                           */
/* ------------------------------------------------------------------ */

function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-10 pt-4 sm:px-6">
      <motion.div {...fadeUp} className="relative overflow-hidden rounded-3xl border border-brand/25 bg-surface p-10 text-center sm:p-16">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-70" />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
        />
        <div className="relative">
          <div className="mono-label mb-4 text-brand">final boarding call</div>
          <h2 className="display mx-auto max-w-2xl text-3xl leading-tight sm:text-5xl">
            Your gate is open.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">
            Profile takes a minute. Free, non-custodial, open to everyone.
          </p>
          <div className="mt-9 flex justify-center">
            <Link to="/create">
              <Button size="lg">
                Create your profile <ArrowRight size={17} />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
