/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SOLANA_RPC_URL: string
  readonly VITE_SOLANA_NETWORK: 'mainnet-beta' | 'devnet' | 'testnet' | 'localnet'
  readonly VITE_ONBOARDING_MINT: string
  readonly VITE_FEE_PROGRAM_ID: string
  readonly VITE_FEE_WALLET: string
  readonly VITE_PLATFORM_FEE_BPS: string
  readonly VITE_JUPITER_API: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.md?raw' {
  const content: string
  export default content
}
