import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Code2,
  Sprout,
  BookOpen,
  Wallet,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SITE, USER_TYPE_META, FEE_PERCENT } from '@/lib/constants'
import { BuybackBurnExplainer } from '@/features/transactions/BuybackBurnExplainer'
import { guides } from '@/features/guides/loader'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5 },
}

export function LandingPage() {
  return (
    <div>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
        <div
          className="pointer-events-none absolute left-1/2 top-[-10%] h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(closest-side, rgb(var(--brand)), transparent)' }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Transparent {FEE_PERCENT}% buyback &amp; burn on every tip
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-balance text-5xl font-extrabold tracking-tight sm:text-7xl"
          >
            Onboard the next wave <br className="hidden sm:block" />
            onto <span className="gradient-text">Solana</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted"
          >
            {SITE.name} connects builders with newcomers. Create a profile, get
            discovered, tip the people who help you — and every tip fuels an
            on-chain buyback &amp; burn of ${SITE.ticker}.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link to="/developers">
              <Button size="lg">
                {USER_TYPE_META.developer.cta} <Code2 size={18} />
              </Button>
            </Link>
            <Link to="/onboardees">
              <Button size="lg" variant="secondary">
                {USER_TYPE_META.onboardee.cta} <Sprout size={18} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ---------------- Two-path chooser ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          center
          eyebrow="Choose your path"
          title="Two sides, one community"
          subtitle="Whether you ship code or you’re just getting started, there’s a place for you."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <PathCard
            icon={Code2}
            type="developer"
            points={['Show your work & skills', 'Get discovered by projects', 'Receive tips in SOL or $ONBOARDING']}
          />
          <PathCard
            icon={Sprout}
            type="onboardee"
            points={['Learn with hands-on guides', 'Find a builder to pair with', 'Grow into the ecosystem']}
          />
        </div>
      </section>

      {/* ---------------- Features ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="What you get" title="Everything to plug in" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Search, title: 'Directory', body: 'Browsable, filterable, searchable profiles for both devs and onboardees.' },
            { icon: BookOpen, title: 'Guides', body: 'Step-by-step, Markdown-based guides — from wallets to launching a coin.' },
            { icon: Wallet, title: 'Wallet tips', body: 'Phantom & Solflare support with clear previews before you ever sign.' },
            { icon: ShieldCheck, title: 'Non-custodial', body: 'We never hold your keys or funds. Every transaction is yours to approve.' },
          ].map((f) => (
            <motion.div key={f.title} {...fadeUp} className="card p-5">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-brand/15 text-brand">
                <f.icon size={20} />
              </div>
              <div className="font-semibold">{f.title}</div>
              <p className="mt-1.5 text-sm text-muted">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------- Buyback & burn ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Transparent by design"
          title={`The ${FEE_PERCENT}% buyback & burn`}
          subtitle="A small platform fee on every on-platform tip is used to buy $ONBOARDING and burn it — documented on-chain and in the UI. It does not guarantee price or returns."
        />
        <div className="mt-10">
          <BuybackBurnExplainer />
        </div>
      </section>

      {/* ---------------- Guides teaser ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <SectionHeading eyebrow="Learn" title="Start with the basics" />
          <Link to="/guides" className="hidden text-sm text-brand hover:underline sm:block">
            All guides →
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {guides.map((g) => (
            <Link key={g.slug} to={`/guides/${g.slug}`} className="card group p-5 hover:border-brand/40">
              <BookOpen size={18} className="text-brand" />
              <div className="mt-3 font-semibold group-hover:text-brand">{g.title}</div>
              <p className="mt-1.5 line-clamp-2 text-sm text-muted">{g.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- Final CTA ---------------- */}
      <section className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6">
        <div className="card relative overflow-hidden p-10 text-center">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to get onboarded?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Create your profile in a minute. It’s free, non-custodial, and open.
            </p>
            <div className="mt-8 flex justify-center">
              <Link to="/create">
                <Button size="lg">
                  Create your profile <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function PathCard({
  icon: Icon,
  type,
  points,
}: {
  icon: typeof Code2
  type: 'developer' | 'onboardee'
  points: string[]
}) {
  const meta = USER_TYPE_META[type]
  return (
    <motion.div {...fadeUp} className="card group flex flex-col p-8">
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand/20 to-brand-2/20 text-brand">
        <Icon size={26} />
      </div>
      <h3 className="text-2xl font-bold">{meta.cta}</h3>
      <p className="mt-1 text-muted">{meta.blurb}</p>
      <ul className="mt-5 space-y-2 text-sm">
        {points.map((p) => (
          <li key={p} className="flex items-center gap-2 text-text/90">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" /> {p}
          </li>
        ))}
      </ul>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link to={`/${type}s`}>
          <Button>
            Browse {meta.label.toLowerCase()}s <ArrowRight size={16} />
          </Button>
        </Link>
        <Link to={`/create/${type}`}>
          <Button variant="outline">Create profile</Button>
        </Link>
      </div>
    </motion.div>
  )
}
