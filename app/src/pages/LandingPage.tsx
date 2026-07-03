import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code2,
  Flame,
  Heart,
  ShieldCheck,
  Sparkles,
  Sprout,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { SectionTag } from '@/components/ui/SectionTag'
import { Ticker } from '@/components/ui/Ticker'
import { Barcode } from '@/components/ui/Barcode'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { BuybackBurnExplainer } from '@/features/transactions/BuybackBurnExplainer'
import { guides } from '@/features/guides/loader'
import { computeFee } from '@/lib/solana/fee'
import { FEE_PERCENT, INCINERATOR, USER_TYPE_META } from '@/lib/constants'
import { gradientFromSeed, lamportsToSol, solToLamports } from '@/lib/utils'

const fadeUp = {
  initial: { opacity: 0, y: 24, filter: 'blur(8px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98] },
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
          'you approve everything',
          'builders ⇄ newcomers',
          'free guides included',
        ]}
      />
      <PathsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <GuidesTeaser />
      <FinalCta />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
} as const

const word = {
  hidden: { opacity: 0, y: '0.55em', filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.75, ease: [0.21, 0.47, 0.32, 0.98] },
  },
} as const

function Hero() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 700], [0, 110])
  const y2 = useTransform(scrollY, [0, 700], [0, -80])
  const y3 = useTransform(scrollY, [0, 700], [0, 60])

  return (
    <section className="relative">
      {/* soft pastel wash, parallax on scroll */}
      <motion.div style={{ y: y1 }} className="blob -top-40 left-[8%] h-96 w-96 bg-emerald-200/60 dark:bg-emerald-500/10" />
      <motion.div style={{ y: y2 }} className="blob -top-24 right-[6%] h-80 w-80 bg-lime-200/50 dark:bg-lime-500/10" />
      <motion.div style={{ y: y3 }} className="blob top-40 left-[42%] h-72 w-72 bg-sky-100/60 dark:bg-sky-500/5" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow mb-7"
          >
            <Sparkles size={13} className="text-brand" />
            The friendly way into Solana
          </motion.div>

          <motion.h1
            variants={stagger}
            initial="hidden"
            animate="show"
            className="font-display text-[clamp(2.5rem,6vw,4.2rem)] font-extrabold leading-[1.06] tracking-tight"
          >
            <span className="block">
              <motion.span variants={word} className="inline-block">
                Get&nbsp;
              </motion.span>
              <motion.span variants={word} className="gradient-text gradient-animate inline-block">
                onboarded
              </motion.span>
              <motion.span variants={word} className="inline-block">
                ,
              </motion.span>
            </span>
            <span className="block">
              <motion.span variants={word} className="inline-block">
                onchain.
              </motion.span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-6 max-w-lg text-lg leading-8 text-muted"
          >
            $ONBOARDING pairs experienced builders with people just getting
            started. Make a profile, find your match, and tip the ones who
            help — every tip burns a little $ONBOARDING.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link to="/create/onboardee">
              <Button size="lg" className="w-full sm:w-auto">
                <Sprout size={17} /> {USER_TYPE_META.onboardee.cta}
              </Button>
            </Link>
            <Link to="/create/developer">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <Code2 size={17} /> {USER_TYPE_META.developer.cta}
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-medium text-muted"
          >
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-brand-2" /> Non-custodial
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Flame size={14} className="text-flare" /> {FEE_PERCENT}% of tips burned
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Heart size={14} className="text-rose-400" /> Free to join
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <ActivityFeed />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute -bottom-5 -left-3 -rotate-2 rounded-2xl border border-border bg-surface px-4 py-2.5 shadow-lift sm:-left-5"
          >
            <div className="flex items-center gap-2 text-sm font-bold">
              <Flame size={15} className="text-flare" />
              {FEE_PERCENT}% burned
            </div>
            <div className="text-[11px] text-muted">on every tip, automatically</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* Friendly live-activity card: what happens on the platform, in plain english. */
const FEED_EVENTS: { emoji: string; seed: string; text: string; sub: string; tone?: 'burn' }[] = [
  { emoji: '🧑‍💻', seed: 'ava', text: 'Ava joined as a Developer', sub: 'Anchor · React · mentoring' },
  { emoji: '🌱', seed: 'sam', text: 'Sam wants to be onboarded', sub: 'marketing · community' },
  { emoji: '🤝', seed: 'match', text: 'Sam matched with Ava', sub: 'first session booked' },
  { emoji: '💸', seed: 'tip', text: 'Sam tipped Ava 0.5 SOL', sub: 'Ava receives 0.49 SOL' },
  { emoji: '🔥', seed: 'burn', text: '0.01 SOL bought $ONB — and burned it', sub: 'supply just got smaller', tone: 'burn' },
  { emoji: '🎨', seed: 'mira', text: 'Mira posted new showcase art', sub: 'looking for her first project' },
  { emoji: '📚', seed: 'guide', text: 'Leo finished “Phantom Wallet 101”', sub: 'guide 1 of 3 complete' },
]

function ActivityFeed() {
  const [tick, setTick] = useState(3)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2200)
    return () => clearInterval(id)
  }, [])

  const visible = useMemo(() => {
    const out: (typeof FEED_EVENTS[number] & { key: number })[] = []
    for (let i = Math.max(0, tick - 4); i < tick; i++) {
      out.push({ ...FEED_EVENTS[i % FEED_EVENTS.length], key: i })
    }
    return out.reverse()
  }, [tick])

  return (
    <div className="card relative overflow-hidden p-5 shadow-pass sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-display text-sm font-bold">Happening now</div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          live demo
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {visible.map((e) => (
            <motion.div
              key={e.key}
              layout
              initial={{ opacity: 0, y: -14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.35 }}
              className={`flex items-center gap-3 rounded-2xl border p-3.5 ${
                e.tone === 'burn'
                  ? 'border-orange-200 bg-orange-50/70 dark:border-orange-400/20 dark:bg-orange-500/10'
                  : 'border-border bg-surface-2/60'
              }`}
            >
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-base"
                style={{ background: gradientFromSeed(e.seed) }}
              >
                <span className="drop-shadow-sm">{e.emoji}</span>
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{e.text}</div>
                <div className="truncate text-xs text-muted">{e.sub}</div>
              </div>
              <div className="ml-auto shrink-0 text-[10px] font-medium text-muted/70">now</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 pl-24 text-right text-[11px] font-medium text-muted/70">
        Simulated preview — this is what the platform does
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Two-path chooser — friendly tickets                                 */
/* ------------------------------------------------------------------ */

function PathsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionTag n="01" label="Pick your path" />
      <Reveal>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="display max-w-xl text-3xl leading-tight sm:text-[2.6rem]">
          Two sides, one community.
        </h2>
        <p className="max-w-sm text-[15px] leading-6 text-muted">
          Whether you ship code or you&apos;re just curious, there&apos;s a
          seat for you.
        </p>
      </div>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <BoardingPass
          type="onboardee"
          gate="01"
          accent="emerald"
          icon={Sprout}
          perks={['Learn with hands-on guides', 'Find a builder to pair with', 'Grow at your own pace']}
        />
        <BoardingPass
          type="developer"
          gate="02"
          accent="teal"
          icon={Code2}
          perks={['Show your work & skills', 'Get discovered by projects', 'Receive tips in SOL or $ONB']}
        />
      </div>
    </section>
  )
}

const ACCENTS = {
  teal: {
    spine: 'bg-teal-500',
    text: 'text-teal-600 dark:text-teal-300',
    chip: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300',
    dot: 'bg-teal-400',
    glow: 'brand-2' as const,
  },
  emerald: {
    spine: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-300',
    chip: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
    dot: 'bg-emerald-400',
    glow: 'brand' as const,
  },
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
  accent: keyof typeof ACCENTS
  icon: typeof Code2
  perks: string[]
}) {
  const meta = USER_TYPE_META[type]
  const a = ACCENTS[accent]

  return (
    <motion.div {...fadeUp}>
      <SpotlightCard glow={a.glow} className="shadow-pass">
        <div className={`absolute inset-y-0 left-0 w-1.5 ${a.spine}`} aria-hidden />

        <div className="p-7 pl-9 sm:p-8 sm:pl-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mono-label mb-2">boarding pass</div>
              <h3 className="font-display text-2xl font-bold leading-tight sm:text-[1.7rem]">
                {meta.cta}
              </h3>
            </div>
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${a.chip}`}>
              <Icon size={22} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">from</div>
              <div className="mt-1 font-bold">Curious</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">to</div>
              <div className={`mt-1 font-bold ${a.text}`}>Onchain</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">gate</div>
              <div className="mt-1 font-bold">{gate}</div>
            </div>
          </div>

          <ul className="mt-6 space-y-2.5 text-[15px] text-text/90">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-2.5">
                <span className={`h-1.5 w-1.5 rounded-full ${a.dot}`} />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="pass-perf mx-5" />
          <div className="pass-notch-l" />
          <div className="pass-notch-r" />
        </div>

        <div className="flex items-center justify-between gap-6 p-6 pl-9 sm:pl-10">
          <Barcode seed={type} className="h-8 w-36 text-muted/35" />
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
/* How it works / burn                                                 */
/* ------------------------------------------------------------------ */

function HowItWorksSection() {
  return (
    <section id="burn" className="relative scroll-mt-24">
      <div className="blob left-1/2 top-32 h-80 w-[38rem] -translate-x-1/2 bg-orange-100/60 dark:bg-orange-500/5" />
      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <SectionTag n="02" label="Tokenomics, kept honest" />
        <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="display max-w-2xl text-3xl leading-tight sm:text-[2.6rem]">
            Every tip makes $ONBOARDING
            <span className="text-flare"> a little scarcer.</span>
          </h2>
          <p className="max-w-sm text-[15px] leading-6 text-muted">
            A {FEE_PERCENT}% fee on every tip buys $ONBOARDING and burns it.
            Open, onchain, verifiable — and no, it doesn&apos;t guarantee price.
          </p>
        </div>
        </Reveal>

        <div className="mt-12">
          <BuybackBurnExplainer />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <FeeCalculator />
          <motion.div {...fadeUp} className="card flex flex-col justify-between p-7">
            <div>
              <div className="mono-label mb-4">burn destination</div>
              <p className="text-[15px] leading-7 text-muted">
                Bought-back tokens are sent to Solana&apos;s incinerator — an
                address nobody controls. Tokens that land there are gone from
                supply, permanently and publicly.
              </p>
            </div>
            <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50/70 p-4 dark:border-orange-400/20 dark:bg-orange-500/10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-flare">
                <Flame size={13} /> incinerator
              </div>
              <div className="mt-2 break-all font-mono text-xs text-text/70">
                {INCINERATOR}
              </div>
            </div>
            <div className="mt-4 text-xs font-medium text-muted">
              Live burn stats appear here once the fee program is deployed.
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
        <div className="w-28 rounded-xl border border-border bg-surface-2 px-3 py-2 text-right font-semibold">
          {sol.toFixed(1)} <span className="text-xs text-muted">SOL</span>
        </div>
      </div>

      <div className="mt-6 flex h-10 w-full overflow-hidden rounded-xl text-[11px] font-bold">
        <motion.div
          className="flex items-center justify-center bg-emerald-500 text-white"
          animate={{ width: `${netPct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        >
          {netPct}% to them
        </motion.div>
        <motion.div
          className="flex items-center justify-center bg-flare text-white"
          animate={{ width: `${FEE_PERCENT}%` }}
        >
          <Flame size={12} />
        </motion.div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-400/20 dark:bg-emerald-500/10">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-300">
            they receive
          </div>
          <div className="mt-1.5 font-display text-xl font-bold text-emerald-600 dark:text-emerald-300">
            <AnimatedNumber value={lamportsToSol(fee.netLamports)} decimals={2} />{' '}
            <span className="text-sm">SOL</span>
          </div>
        </div>
        <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4 dark:border-orange-400/20 dark:bg-orange-500/10">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-flare">
            bought &amp; burned
          </div>
          <div className="mt-1.5 font-display text-xl font-bold text-flare">
            <AnimatedNumber value={lamportsToSol(fee.feeLamports)} decimals={3} />{' '}
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
      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
      title: 'Wallet-native',
      body: 'Phantom & Solflare, with a clear preview before you ever approve anything.',
    },
    {
      icon: ShieldCheck,
      color: 'bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300',
      title: 'Non-custodial',
      body: 'We never hold your keys or funds. Every transaction is yours to approve — or reject.',
    },
    {
      icon: BookOpen,
      color: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
      title: 'Guides that respect you',
      body: 'From your first wallet to your first launch, written for humans — no jargon walls.',
    },
    {
      icon: Flame,
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300',
      title: 'A burn you can audit',
      body: 'The fee, the swap, the burn — all onchain, all public, all documented.',
    },
  ]
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionTag n="03" label="Why people stay" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((f, i) => (
          <motion.div
            key={f.title}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: i * 0.06 }}
          >
            <SpotlightCard className="h-full p-6">
              <div className={`grid h-11 w-11 place-items-center rounded-2xl ${f.color}`}>
                <f.icon size={20} />
              </div>
              <div className="mt-4 font-display text-[15px] font-bold">{f.title}</div>
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
      <Reveal>
      <div className="flex items-end justify-between gap-4">
        <h2 className="display text-3xl leading-tight sm:text-[2.6rem]">
          Start with the guides.
        </h2>
        <Link
          to="/guides"
          className="hidden items-center gap-1 text-sm font-semibold text-brand hover:underline sm:inline-flex"
        >
          All guides <ArrowUpRight size={15} />
        </Link>
      </div>
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {guides.map((g, i) => (
          <motion.div key={g.slug} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.07 }}>
            <Link to={`/guides/${g.slug}`} className="group block h-full">
              <SpotlightCard className="flex h-full flex-col p-6">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-surface-2 font-display text-sm font-bold text-muted">
                  {i + 1}
                </div>
                <div className="mt-4 font-display text-lg font-bold leading-snug transition-colors group-hover:text-brand">
                  {g.title}
                </div>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted">{g.description}</p>
                <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                  Read guide
                  <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
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
      <motion.div
        {...fadeUp}
        className="animate-gradient-pan relative overflow-hidden rounded-[2rem] p-10 text-center text-white shadow-lift sm:p-16"
        style={{
          background:
            'linear-gradient(120deg, #065f46 0%, #059669 30%, #10b981 55%, #2dd4bf 80%, #059669 100%)',
          backgroundSize: '220% 220%',
        }}
      >
        <div className="blob -left-20 -top-24 h-72 w-72 bg-white/15" />
        <div className="blob -bottom-28 right-0 h-80 w-80 bg-emerald-300/25" />
        <div className="relative">
          <div className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-white/70">
            final boarding call
          </div>
          <h2 className="display mx-auto max-w-2xl text-3xl leading-tight sm:text-5xl">
            Your seat is waiting.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/80">
            A profile takes a minute. Free, non-custodial, open to everyone.
          </p>
          <div className="mt-9 flex justify-center">
            <Link to="/create">
              <Button
                size="lg"
                className="border-0 !bg-white !text-emerald-700 hover:!bg-white hover:shadow-[0_12px_40px_-8px_rgb(255_255_255/0.5)]"
              >
                Create your profile <ArrowRight size={17} />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
