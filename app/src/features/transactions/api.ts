import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Tip } from '@/lib/types'

/** Best-effort audit record of an on-platform tip. No-op in demo mode. */
export async function recordTip(row: Omit<Tip, 'id' | 'created_at'>): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return
  try {
    await supabase.from('tips').insert(row)
  } catch {
    /* recording is best-effort; the on-chain tx is the source of truth */
  }
}

export function explorerTxUrl(signature: string, network: string): string {
  const base = `https://explorer.solana.com/tx/${signature}`
  return network === 'mainnet-beta' ? base : `${base}?cluster=${network}`
}
