import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, Sprout } from 'lucide-react'
import { ProfileForm } from '../components/ProfileForm'
import { createProfile } from '../api'
import { USER_TYPES, USER_TYPE_META, type UserType } from '@/lib/constants'
import { isSupabaseConfigured } from '@/lib/supabase'
import type { ProfileInput } from '@/lib/types'

function TypeChooser() {
  const meta = [
    { type: 'developer' as UserType, icon: Code2 },
    { type: 'onboardee' as UserType, icon: Sprout },
  ]
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
        Create your profile
      </h1>
      <p className="mt-3 text-center text-muted">Which side are you joining as?</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {meta.map(({ type, icon: Icon }) => (
          <Link
            key={type}
            to={`/create/${type}`}
            className="card group p-6 transition-colors hover:border-brand/50"
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand/15 text-brand">
              <Icon size={22} />
            </div>
            <div className="text-lg font-bold group-hover:text-brand">
              {USER_TYPE_META[type].cta}
            </div>
            <p className="mt-1 text-sm text-muted">{USER_TYPE_META[type].blurb}</p>
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-4 py-12 sm:px-6"
    >
      <div className="mb-8">
        <Link to="/create" className="text-sm text-muted hover:text-text">
          ← Change type
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          New {USER_TYPE_META[userType].label} profile
        </h1>
      </div>

      {!isSupabaseConfigured && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
          <strong>Demo mode.</strong> Supabase isn’t configured, so this profile is
          saved locally in your browser. Add your Supabase keys (see README) to
          persist profiles and images.
        </div>
      )}

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      <ProfileForm userType={userType} submitting={submitting} onSubmit={handleSubmit} />
    </motion.div>
  )
}
