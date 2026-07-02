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

  // fresh state each time the modal opens (a second tip shouldn't show the old receipt)
  useEffect(() => {
    if (open) {
      setStatus('idle')
      setSignature(null)
      setError(null)
    }
  }, [open])

  const mintConfigured = isConfigured(ONBOARDING_MINT)
  const feeWalletConfigured = isConfigured(FEE_WALLET)
  const recipient = profile.wallet_address

  useEffect(() => {
    let alive = true
    if (token === 'ONBOARDING' && mintConfigured && decimals === null) {
      getMint(connection, new PublicKey(ONBOARDING_MINT))
        .then((m) => alive && setDecimals(m.decimals))
        .catch(() => alive && setError('Could not read the $ONBOARDING mint. Check VITE_ONBOARDING_MINT.'))
    }
    return () => {
      alive = false
    }
  }, [token, mintConfigured, decimals, connection])

  const amt = Number(amount) || 0
  const baseUnits =
    token === 'SOL' ? solToLamports(amt) : Math.round(amt * Math.pow(10, decimals ?? 0))
  const fee = useMemo(() => computeFee(baseUnits), [baseUnits])
  const netPct = 100 - FEE_PERCENT

  function fmt(units: number): string {
    if (token === 'SOL')
      return `${lamportsToSol(units).toLocaleString(undefined, { maximumFractionDigits: 6 })} SOL`
    const d = decimals ?? 0
    return `${(units / Math.pow(10, d)).toLocaleString(undefined, { maximumFractionDigits: d })} $ONB`
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
        className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="card w-full max-w-md overflow-hidden shadow-pass"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between border-b border-border px-6 py-4">
            <div>
              <div className="mono-label text-brand">send a tip</div>
              <div className="mt-1 font-display text-lg font-bold">@{profile.handle}</div>
            </div>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {status === 'confirmed' && signature ? (
            <div className="space-y-4 p-6 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand/15 text-brand">
                <ShieldCheck size={26} />
              </div>
              <div className="font-display text-lg font-bold">Tip confirmed</div>
              <p className="text-sm leading-6 text-muted">
                Sent {fmt(fee.netLamports)} to @{profile.handle}. The {FEE_PERCENT}% fee
                {token === 'SOL'
                  ? ' is queued in the fee vault for buyback & burn.'
                  : ' was burned onchain immediately. 🔥'}
              </p>
              <a
                href={explorerTxUrl(signature, SOLANA_NETWORK)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-brand hover:underline"
              >
                view on explorer <ExternalLink size={13} />
              </a>
              <Button className="w-full" onClick={onClose}>
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-5 p-6">
              {/* token toggle */}
              <div className="grid grid-cols-2 gap-2">
                {(['SOL', 'ONBOARDING'] as TipToken[]).map((t) => {
                  const disabled = t === 'ONBOARDING' && !mintConfigured
                  return (
                    <button
                      key={t}
                      disabled={disabled}
                      onClick={() => setToken(t)}
                      className={`rounded-xl border px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40 ${
                        token === t
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-border text-muted hover:text-text'
                      }`}
                    >
                      {t === 'SOL' ? '◎ SOL' : '$ONB'}
                      {disabled && <span className="ml-1 text-[9px] normal-case">(set mint)</span>}
                    </button>
                  )
                })}
              </div>

              <div>
                <div className="mono-label mb-2">amount</div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* auditable preview */}
              <div className="rounded-xl border border-border bg-surface-2 p-4">
                <div className="flex h-7 w-full overflow-hidden rounded-md font-mono text-[9px] font-bold uppercase">
                  <div className="flex items-center justify-center bg-brand text-ink" style={{ width: `${netPct}%` }}>
                    {netPct}%
                  </div>
                  <div className="flex items-center justify-center bg-flare text-white" style={{ width: `${FEE_PERCENT}%` }}>
                    <Flame size={10} />
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 text-sm">
                  <Row label="tip" value={fmt(fee.grossLamports)} />
                  <Row label={`recipient gets`} value={fmt(fee.netLamports)} strong />
                  <Row label={`fee (${FEE_PERCENT}%)`} value={fmt(fee.feeLamports)} flare />
                </div>
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-flare/10 p-2.5 text-xs leading-5 text-flare">
                  <Flame size={13} className="mt-0.5 shrink-0" />
                  <span>
                    {token === 'SOL'
                      ? 'The fee goes to a program-controlled vault that market-buys $ONBOARDING and burns it.'
                      : 'The fee is burned directly onchain — removed from supply forever.'}
                  </span>
                </div>
              </div>

              {recipient ? (
                <p className="font-mono text-[11px] text-muted">
                  to → <span className="text-text/80">{shortAddress(recipient, 6)}</span>
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

              {error && <p className="text-xs leading-5 text-red-400">{error}</p>}

              {!connected ? (
                <ConnectWalletButton />
              ) : (
                <Button className="w-full" size="lg" disabled={!canSubmit} onClick={confirm}>
                  {(status === 'building' || status === 'signing') && <Spinner />}
                  {status === 'signing'
                    ? 'Confirm in wallet…'
                    : status === 'building'
                      ? 'Preparing…'
                      : 'Preview & sign'}
                </Button>
              )}

              <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                non-custodial — you sign, we never touch keys
              </p>
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
  strong,
  flare,
}: {
  label: string
  value: string
  strong?: boolean
  flare?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`font-mono text-[11px] uppercase tracking-wider ${flare ? 'text-flare' : 'text-muted'}`}>
        {label}
      </span>
      <span className={strong ? 'font-bold' : flare ? 'text-flare' : 'text-text/90'}>{value}</span>
    </div>
  )
}
