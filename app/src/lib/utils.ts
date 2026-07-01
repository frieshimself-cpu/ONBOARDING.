import { clsx, type ClassValue } from 'clsx'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

export function shortAddress(addr?: string | null, chars = 4): string {
  if (!addr) return ''
  if (addr.length <= chars * 2 + 1) return addr
  return `${addr.slice(0, chars)}…${addr.slice(-chars)}`
}

export function solToLamports(sol: number): number {
  return Math.round(sol * LAMPORTS_PER_SOL)
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL
}

export function formatSol(lamports: number, maxFrac = 4): string {
  return `${lamportsToSol(lamports).toLocaleString(undefined, {
    maximumFractionDigits: maxFrac,
  })} SOL`
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Deterministic gradient avatar fallback from a seed string. */
export function gradientFromSeed(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360
  const h2 = (h + 60) % 360
  return `linear-gradient(135deg, hsl(${h} 70% 45%), hsl(${h2} 75% 55%))`
}
