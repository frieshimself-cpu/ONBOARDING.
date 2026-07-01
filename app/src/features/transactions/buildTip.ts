import {
  PublicKey,
  Transaction,
  SystemProgram,
  type Connection,
} from '@solana/web3.js'
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  createBurnInstruction,
  getAccount,
} from '@solana/spl-token'
import { computeFee, type FeeBreakdown } from '@/lib/solana/fee'

/**
 * SOL tip: net -> recipient, fee -> fee vault.
 * The fee vault is later drained by the on-chain buyback+burn crank
 * (Jupiter swap SOL -> $ONBOARDING -> burn). See programs/onboarding_fee.
 */
export function buildSolTip(params: {
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
 * $ONBOARDING (SPL) tip: net -> recipient's ATA, fee is burned DIRECTLY
 * (SPL burn instruction) — no swap needed since the fee is already in the token.
 * This is the auditable, program-free burn path for token-denominated tips.
 */
export async function buildTokenTip(params: {
  connection: Connection
  from: PublicKey
  to: PublicKey
  mint: PublicKey
  grossBaseUnits: number
}): Promise<{ tx: Transaction; fee: FeeBreakdown }> {
  const { connection, from, to, mint } = params
  const fee = computeFee(params.grossBaseUnits)
  const fromAta = await getAssociatedTokenAddress(mint, from)
  const toAta = await getAssociatedTokenAddress(mint, to)

  const tx = new Transaction()
  // Create the recipient's token account if it doesn't exist (payer = sender).
  try {
    await getAccount(connection, toAta)
  } catch {
    tx.add(createAssociatedTokenAccountInstruction(from, toAta, to, mint))
  }
  if (fee.netLamports > 0) {
    tx.add(createTransferInstruction(fromAta, toAta, from, fee.netLamports))
  }
  if (fee.feeLamports > 0) {
    // Burn the 2% directly from the sender's account -> reduces supply on-chain.
    tx.add(createBurnInstruction(fromAta, mint, from, fee.feeLamports))
  }
  return { tx, fee }
}
