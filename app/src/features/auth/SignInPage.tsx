import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthGate } from './AuthGate'
import { useAuth } from '@/lib/auth/AuthProvider'

export function SignInPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') ?? '/'

  // Already signed in (or just signed in via the gate / magic link) -> continue.
  useEffect(() => {
    if (!loading && user) navigate(next, { replace: true })
  }, [user, loading, navigate, next])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl px-4 py-20 sm:px-6"
    >
      <div className="mb-10 text-center">
        <div className="eyebrow mb-4">Welcome</div>
        <h1 className="display text-3xl sm:text-4xl">
          Join <span className="gradient-text">$ONBOARDING</span>
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-muted">
          One email. No password. Sign-up and sign-in are the same thing.
        </p>
      </div>
      <AuthGate title="Sign in or create an account" subtitle="We'll never share your email. It's only used to sign you in." />
    </motion.div>
  )
}
