// ---------------------------------------------------------------------------
// Central config. Values with a `REPLACE_` prefix in .env are treated as
// "not yet configured" so the app can run in demo mode until you paste reals.
// See README "Values you must paste" and .env.example.
// ---------------------------------------------------------------------------

const env = import.meta.env

export const SITE = {
  name: '$ONBOARDING',
  ticker: 'ONBOARDING',
  tagline: 'Onboard builders and newcomers into Solana — together.',
  description:
    'A directory of developers and onboardees, hands-on guides, and a transparent, on-chain buyback-and-burn on every on-platform tip.',
} as const

export type SolanaNetwork = 'mainnet-beta' | 'devnet' | 'testnet' | 'localnet'

export const SOLANA_NETWORK = (env.VITE_SOLANA_NETWORK ?? 'devnet') as SolanaNetwork
export const RPC_URL = env.VITE_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'

export const ONBOARDING_MINT = env.VITE_ONBOARDING_MINT ?? ''
export const FEE_PROGRAM_ID = env.VITE_FEE_PROGRAM_ID ?? ''
export const FEE_WALLET = env.VITE_FEE_WALLET ?? ''
export const JUPITER_API = env.VITE_JUPITER_API ?? 'https://quote-api.jup.ag/v6'

// 200 bps = 2%. The single source of truth for the platform fee on the FRONT END.
// The on-chain program has its OWN constant — keep them in sync (see programs/onboarding_fee).
export const PLATFORM_FEE_BPS = Number(env.VITE_PLATFORM_FEE_BPS ?? '200')
export const FEE_PERCENT = PLATFORM_FEE_BPS / 100

// Well-known Solana incinerator. Tokens sent here are unrecoverable == burned.
export const INCINERATOR = '1nc1nerator11111111111111111111111111111111'

export const USER_TYPES = ['developer', 'onboardee'] as const
export type UserType = (typeof USER_TYPES)[number]

export const USER_TYPE_META: Record<UserType, { label: string; blurb: string; cta: string }> = {
  developer: {
    label: 'Developer',
    blurb: 'Builders, designers, and creators shipping on Solana.',
    cta: "I'm a Developer",
  },
  onboardee: {
    label: 'Onboardee',
    blurb: 'Newcomers learning the ropes and looking to get plugged in.',
    cta: 'I want to be onboarded',
  },
}

export const SKILL_TAGS = [
  'art',
  'dev',
  'design',
  'marketing',
  'writing',
  'community',
  'trading',
  'music',
  'video',
  'product',
  'research',
  'ops',
] as const
export type SkillTag = (typeof SKILL_TAGS)[number]

/** A value is "configured" when it exists and isn't a REPLACE_ placeholder. */
export function isConfigured(v: string | undefined | null): boolean {
  return !!v && v.length > 0 && !v.startsWith('REPLACE_')
}

export const CONFIG_STATUS = {
  onboardingMint: isConfigured(ONBOARDING_MINT),
  feeProgram: isConfigured(FEE_PROGRAM_ID),
  feeWallet: isConfigured(FEE_WALLET),
}
