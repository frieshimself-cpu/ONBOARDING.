import { PLATFORM_FEE_BPS } from '@/lib/constants'

export interface FeeBreakdown {
  /** gross amount in base units (lamports for SOL, token base units for SPL) */
  grossLamports: number
  feeLamports: number
  netLamports: number
  feeBps: number
}

/**
 * Pure, auditable fee math. 200 bps == 2%.
 * The on-chain program (programs/onboarding_fee) enforces the SAME formula:
 * `fee = gross * fee_bps / 10_000` — keep the two in sync.
 *
 * Transaction builders live in features/transactions/buildTip.ts:
 *  - SOL tips:   net -> recipient, fee -> fee vault (drained by the
 *                permissionless Jupiter buyback + burn crank).
 *  - token tips: net -> recipient ATA, fee burned directly via SPL burn.
 */
export function computeFee(grossLamports: number): FeeBreakdown {
  const g = Math.max(0, Math.floor(grossLamports))
  const feeLamports = Math.floor((g * PLATFORM_FEE_BPS) / 10_000)
  return {
    grossLamports: g,
    feeLamports,
    netLamports: g - feeLamports,
    feeBps: PLATFORM_FEE_BPS,
  }
}
