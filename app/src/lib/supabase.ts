import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured =
  !!url && !!anon && !url.startsWith('REPLACE_') && !anon.startsWith('REPLACE_')

/**
 * When Supabase env vars are present we get a real client; otherwise `null`,
 * and the app falls back to local demo data so it still runs end-to-end.
 * Every caller must branch on `isSupabaseConfigured` (or null-check).
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anon as string)
  : null
