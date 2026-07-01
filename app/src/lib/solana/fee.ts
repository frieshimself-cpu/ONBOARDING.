import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { PLATFORM_FEE_BPS } from '@/lib/constants'

export interface FeeBreakdown {
  grossLamports: number
  feeLamports: number
  netLamports: number
  feeBps: number
}

/** Pure, auditable fee math. 200 bps == 2%. */
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

/**
 * DEMO / FRONT-END path (no on-chain program required).
 * Splits a SOL tip into two transfers so the flow is fully auditable in a
 * block explorer: `net` -> recipient, `fee` -> the fee vault wallet.
 *
 * PRODUCTION path: replace the fee leg with a CPI to the `onboarding_fee`
 * Anchor program's `collect_fee` instruction (see programs/onboarding_fee),
 * which records the fee and lets anyone run the permissionless
 * buyback (Jupiter swap SOL -> $ONBOARDING) + burn crank. See buildProgramTipTx.
 */
export function buildSolTipTx(params: {
  from: PublicKey
  to: PublicKey
  feeVault: PublicKey
  grossLamports: number
}): { tx: Transaction; fee: FeeBreakdown } {
  const fee = computeFee(params.grossLamports)
  const tx = new Transaction()
  if (fee.netLamports > 0) {
    tx.add(
      SystemProgram.transfer({
        fromPubkey: params.from,
        toPubkey: params.to,
        lamports: fee.netLamports,
      }),
    )
  }
  if (fee.feeLamports > 0) {
    tx.add(
      SystemProgram.transfer({
        fromPubkey: params.from,
        toPubkey: params.feeVault,
        lamports: fee.feeLamports,
      }),
    )
  }
  return { tx, fee }
}

/**
 * PLACEHOLDER for the production, program-routed tip.
 * Once the Anchor program is deployed and you generate its IDL, build the
 * instruction here (net transfer to recipient + `collect_fee` CPI). Wiring this
 * requires the deployed FEE_PROGRAM_ID and the generated IDL/types.
 */
export function buildProgramTipTx(): never {
  throw new Error(
    'buildProgramTipTx: wire this to the deployed onboarding_fee program IDL. ' +
      'See programs/onboarding_fee and README "Values you must paste".',
  )
}
