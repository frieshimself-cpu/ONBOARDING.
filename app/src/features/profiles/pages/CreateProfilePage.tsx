import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Code2, Sprout } from 'lucide-react'
import { ProfileForm } from '../components/ProfileForm'
import { createProfile } from '../api'
import { USER_TYPES, USER_TYPE_META, type UserType } from '@/lib/constants'
import { isSupabaseConfigured } from '@/lib/supabase'
import { Barcode } from '@/components/ui/Barcode'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import type { ProfileInput } from '@/lib/types'

function TypeChooser() {
  const meta = [
    { type: 'developer' as UserType, icon: Code2, accent: 'brand-2' as const, gate: '02' },
    { type: 'onboardee' as UserType, icon: Sprout, accent: 'brand' as const, gate: '01' },
  ]
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <div className="text-center">
        <div className="mono-label mb-4 text-brand">check-in</div>
        <h1 className="display text-3xl sm:text-5xl">Who&apos;s boarding?</h1>
        <p className="mt-4 text-muted">Pick a side — you can always make another profile later.</p>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {meta.map(({ type, icon: Icon, accent, gate }) => (
          <Link key={type} to={`/create/${type}`} className="group block">
            <SpotlightCard glow={accent} className="h-full">
              <div className={`absolute inset-y-0 left-0 w-1.5 ${accent === 'brand' ? 'bg-brand' : 'bg-brand-2'}`} />
              <div className="p-7 pl-9">
                <div className="flex items-start justify-between">
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl bg-surface-2 ${
                      accent === 'brand' ? 'text-brand' : 'text-brand-2'
                    }`}
                  >
                    <Icon size={22} />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                    gate {gate}
                  </span>
                </div>
                <div className="mt-5 font-display text-xl font-bold leading-snug group-hover:text-brand">
                  {USER_TYPE_META[type].cta}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{USER_TYPE_META[type].blurb}</p>
                <div className="mt-6 flex items-center justify-between">
                  <Barcode seed={type} className="h-5 w-20 text-muted/35" />
                  <ArrowRight
                    size={16}
                    className="text-muted transition-all group-hover:translate-x-1 group-hover:text-brand"
                  />
                </div>
              </div>
            </SpotlightCard>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function CreateProfilePage() {
  const { type } = useParams()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!type || !USER_TYPES.includes(type as UserType)) {
    return <TypeChooser />
  }
  const userType = type as UserType

  async function handleSubmit(input: ProfileInput) {
    setSubmitting(true)
    setError(null)
    try {
      const profile = await createProfile(input)
      navigate(`/p/${profile.handle}`)
    } catch (e) {
      setError((e as Error).message)
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-4 py-14 sm:px-6"
    >
      <div className="mb-10">
        <Link
          to="/create"
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted hover:text-text"
        >
          ← change type
        </Link>
        <h1 className="display mt-3 text-3xl sm:text-4xl">
          New {USER_TYPE_META[userType].label.toLowerCase()} profile
        </h1>
      </div>

      {!isSupabaseConfigured && (
        <div className="mb-8 rounded-2xl border border-brand-2/30 bg-brand-2/10 p-4 text-sm leading-6 text-text/90">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-2">
            demo mode
          </span>
          <p className="mt-1.5 text-muted">
            Supabase isn&apos;t configured, so this profile is saved locally in
            your browser. Add your Supabase keys (see README) to persist
            profiles and images for everyone.
          </p>
        </div>
      )}

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      <ProfileForm userType={userType} submitting={submitting} onSubmit={handleSubmit} />
    </motion.div>
  )
}
