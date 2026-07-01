import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { getMint } from '@solana/spl-token'
import { Flame, ExternalLink, X, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Spinner'
import { ConnectWalletButton } from './ConnectWalletButton'
import { buildSolTip, buildTokenTip } from './buildTip'
import { recordTip, explorerTxUrl } from './api'
import { computeFee } from '@/lib/solana/fee'
import {
  FEE_WALLET,
  ONBOARDING_MINT,
  SOLANA_NETWORK,
  FEE_PERCENT,
  isConfigured,
} from '@/lib/constants'
import { solToLamports, lamportsToSol, shortAddress } from '@/lib/utils'
import type { Profile, TipToken } from '@/lib/types'

type Status = 'idle' | 'building' | 'signing' | 'confirmed' | 'failed'

export function TipModal({
  profile,
  open,
  onClose,
}: {
  profile: Profile
  open: boolean
  onClose: () => void
}) {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, connected } = useWallet()

  const [amount, setAmount] = useState('0.1')
  const [token, setToken] = useState<TipToken>('SOL')
  const [decimals, setDecimals] = useState<number | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [signature, setSignature] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mintConfigured = isConfigured(ONBOARDING_MINT)
  const feeWalletConfigured = isConfigured(FEE_WALLET)
  const recipient = profile.wallet_address

  // Fetch $ONBOARDING decimals when needed.
  useEffect(() => {
    let alive = true
    if (token === 'ONBOARDING' && mintConfigured && decimals === null) {
      getMint(connection, new PublicKey(ONBOARDING_MINT))
        .then((m) => alive && setDecimals(m.decimals))
        .catch(() => alive && setError('Could not read $ONBOARDING mint. Check VITE_ONBOARDING_MINT.'))
    }
    return () => {
      alive = false
    }
  }, [token, mintConfigured, decimals, connection])

  const amt = Number(amount) || 0
  const baseUnits =
    token === 'SOL'
      ? solToLamports(amt)
      : Math.round(amt * Math.pow(10, decimals ?? 0))
  const fee = useMemo(() => computeFee(baseUnits), [baseUnits])

  function fmt(units: number): string {
    if (token === 'SOL') return `${lamportsToSol(units).toLocaleString(undefined, { maximumFractionDigits: 6 })} SOL`
    const d = decimals ?? 0
    return `${(units / Math.pow(10, d)).toLocaleString(undefined, { maximumFractionDigits: d })} $ONBOARDING`
  }

  const canSubmit =
    connected &&
    !!recipient &&
    amt > 0 &&
    (token === 'SOL' ? feeWalletConfigured : mintConfigured && decimals !== null) &&
    status !== 'building' &&
    status !== 'signing'

  async function confirm() {
    if (!publicKey || !recipient) return
    setError(null)
    setStatus('building')
    try {
      const from = publicKey
      const to = new PublicKey(recipient)
      const built =
        token === 'SOL'
          ? buildSolTip({ from, to, feeVault: new PublicKey(FEE_WALLET), grossLamports: baseUnits })
          : await buildTokenTip({ connection, from, to, mint: new PublicKey(ONBOARDING_MINT), grossBaseUnits: baseUnits })

      setStatus('signing')
      const sig = await sendTransaction(built.tx, connection)
      await connection.confirmTransaction(sig, 'confirmed')

      setSignature(sig)
      setStatus('confirmed')
      void recordTip({
        from_wallet: from.toBase58(),
        to_profile_id: profile.id,
        to_wallet: recipient,
        token,
        gross_lamports: fee.grossLamports,
        fee_lamports: fee.feeLamports,
        net_lamports: fee.netLamports,
        fee_bps: fee.feeBps,
        message: null,
        signature: sig,
        status: 'confirmed',
      })
    } catch (e) {
      setError((e as Error).message)
      setStatus('failed')
    }
  }

  if (!open) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="card w-full max-w-md p-6"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="text-lg font-bold">Tip @{profile.handle}</div>
              <div className="text-xs text-muted">
                Non-custodial — you approve and sign every transaction.
              </div>
            </div>
            <button onClick={onClose} className="text-muted hover:text-text">
              <X size={18} />
            </button>
          </div>

          {status === 'confirmed' && signature ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand/15 text-brand">
                <ShieldCheck size={26} />
              </div>
              <div className="font-semibold">Tip confirmed</div>
              <p className="text-sm text-muted">
                Sent {fmt(fee.netLamports)} to @{profile.handle}. The {FEE_PERCENT}% fee
                {token === 'SOL'
                  ? ' is queued in the fee vault for buyback & burn.'
                  : ' was burned on-chain immediately. 🔥'}
              </p>
              <a
                href={explorerTxUrl(signature, SOLANA_NETWORK)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
              >
                View on Solana Explorer <ExternalLink size={14} />
              </a>
              <Button className="w-full" onClick={onClose}>
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Token toggle */}
              <div className="grid grid-cols-2 gap-2">
                {(['SOL', 'ONBOARDING'] as TipToken[]).map((t) => {
                  const disabled = t === 'ONBOARDING' && !mintConfigured
                  return (
                    <button
                      key={t}
                      disabled={disabled}
                      onClick={() => setToken(t)}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${
                        token === t ? 'border-brand text-brand' : 'border-border text-muted hover:text-text'
                      }`}
                    >
                      {t === 'SOL' ? 'SOL' : '$ONBOARDING'}
                      {disabled && <span className="ml-1 text-[10px]">(set mint)</span>}
                    </button>
                  )
                })}
              </div>

              <div>
                <div className="mb-1.5 text-sm font-medium">Amount</div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Auditable fee preview */}
              <div className="rounded-xl border border-border bg-surface-2 p-3 text-sm">
                <Row label="Tip amount" value={fmt(fee.grossLamports)} />
                <Row
                  label={`Platform fee (${FEE_PERCENT}%)`}
                  value={fmt(fee.feeLamports)}
                  accent
                />
                <div className="my-2 border-t border-border" />
                <Row label={`Recipient receives`} value={fmt(fee.netLamports)} strong />
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-brand/10 p-2 text-xs text-brand">
                  <Flame size={14} className="mt-0.5 shrink-0" />
                  <span>
                    {token === 'SOL'
                      ? 'The 2% fee goes to a program-controlled vault that market-buys $ONBOARDING and burns it.'
                      : 'The 2% fee is burned directly on-chain — removed from supply forever.'}
                  </span>
                </div>
              </div>

              {recipient ? (
                <p className="text-xs text-muted">
                  To: <span className="font-mono">{shortAddress(recipient, 6)}</span>
                </p>
              ) : (
                <p className="text-xs text-red-400">
                  This profile has no wallet address set — tips are disabled.
                </p>
              )}

              {token === 'SOL' && !feeWalletConfigured && (
                <p className="text-xs text-amber-400">
                  Fee wallet not configured. Set VITE_FEE_WALLET in .env (see README).
                </p>
              )}

              {error && <p className="text-xs text-red-400">{error}</p>}

              {!connected ? (
                <div className="pt-1">
                  <ConnectWalletButton />
                </div>
              ) : (
                <Button className="w-full" size="lg" disabled={!canSubmit} onClick={confirm}>
                  {(status === 'building' || status === 'signing') && <Spinner />}
                  {status === 'signing'
                    ? 'Confirm in wallet…'
                    : status === 'building'
                      ? 'Preparing…'
                      : `Preview & sign`}
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}

function Row({
  label,
  value,
  accent,
  strong,
}: {
  label: string
  value: string
  accent?: boolean
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className={accent ? 'text-brand' : 'text-muted'}>{label}</span>
      <span className={strong ? 'font-semibold' : accent ? 'text-brand' : ''}>{value}</span>
    </div>
  )
}
