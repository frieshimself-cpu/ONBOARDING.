import { useState, type FormEvent } from 'react'
import { Mail, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/lib/auth/AuthProvider'

/**
 * Inline email sign-in / sign-up. Rendered wherever an action needs an
 * account (e.g. creating a profile) and on the /signin page.
 */
export function AuthGate({
  title = 'Create your account',
  subtitle = 'Your profile belongs to you — an account is how you edit it later.',
}: {
  title?: string
  subtitle?: string
}) {
  const { signInWithEmail, mode } = useAuth()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const res = await signInWithEmail(email)
    setBusy(false)
    if (res.error) return setError(res.error)
    if (res.sent) setSent(true)
    // demo mode: user state updates instantly; parent re-renders past the gate
  }

  if (sent) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-brand dark:bg-emerald-500/10">
          <CheckCircle2 size={26} />
        </div>
        <h2 className="display mt-4 text-xl">Check your email</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          We sent a magic link to <strong className="text-text">{email}</strong>.
          Click it and you&apos;ll land right back here, signed in.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-5 text-sm font-semibold text-brand hover:underline"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <div className="card mx-auto max-w-md p-8">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-brand dark:bg-emerald-500/10">
        <Mail size={20} />
      </div>
      <h2 className="display mt-4 text-xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy || !email}>
          {busy ? <Spinner /> : <Mail size={15} />}
          {mode === 'supabase' ? 'Email me a magic link' : 'Continue'}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs leading-5 text-muted">
        {mode === 'supabase' ? (
          <>No password needed — new emails create an account automatically.</>
        ) : (
          <span className="inline-flex items-center gap-1">
            <Sparkles size={12} className="text-brand" />
            Demo mode: your account lives in this browser. No email is sent.
          </span>
        )}
      </p>
    </div>
  )
}
