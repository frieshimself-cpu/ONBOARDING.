import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

/**
 * Auth works in BOTH modes so the whole product is usable end-to-end:
 *  - Supabase mode: real accounts via email magic-link (sign-up == sign-in).
 *  - Demo mode (no keys yet): instant local accounts persisted in the
 *    browser, so create -> own -> edit -> sign out all behave identically.
 */
export interface AuthUser {
  id: string
  email: string
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  /** true when a real Supabase backend is wired up */
  configured: boolean
  mode: 'supabase' | 'demo'
  /**
   * Supabase mode: sends a magic link (returns sent=true — user must click it).
   * Demo mode: signs in instantly (returns sent=false).
   */
  signInWithEmail: (email: string) => Promise<{ error: string | null; sent: boolean }>
  signOut: () => Promise<void>
}

const DEMO_USER_KEY = 'onb-demo-user'

function readDemoUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(DEMO_USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setUser(readDemoUser())
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user
      setUser(u ? { id: u.id, email: u.email ?? '' } : null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user
      setUser(u ? { id: u.id, email: u.email ?? '' } : null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function signInWithEmail(email: string) {
    const clean = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return { error: 'Please enter a valid email address.', sent: false }
    }

    if (supabase) {
      const { error } = await supabase.auth.signInWithOtp({
        email: clean,
        options: { emailRedirectTo: window.location.origin },
      })
      return { error: error?.message ?? null, sent: !error }
    }

    // demo mode: instant local account (stable id per email so ownership
    // survives sign-out/sign-in)
    let h = 0
    for (let i = 0; i < clean.length; i++) h = (h * 31 + clean.charCodeAt(i)) >>> 0
    const demo: AuthUser = { id: `demo-user-${h.toString(36)}`, email: clean }
    try {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demo))
    } catch {
      /* private browsing */
    }
    setUser(demo)
    return { error: null, sent: false }
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut()
    try {
      localStorage.removeItem(DEMO_USER_KEY)
    } catch {
      /* ignore */
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        configured: isSupabaseConfigured,
        mode: isSupabaseConfigured ? 'supabase' : 'demo',
        signInWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
