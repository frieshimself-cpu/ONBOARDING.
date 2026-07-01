import type { UserType } from './constants'

export interface LinkItem {
  label: string
  url: string
}

export interface Socials {
  x?: string
  github?: string
  website?: string
  telegram?: string
  discord?: string
}

export interface ShowcaseItem {
  id: string
  title: string
  description?: string
  url?: string
  image_url?: string
}

export interface Profile {
  id: string
  user_id: string | null
  user_type: UserType
  handle: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  wallet_address: string | null
  skills: string[]
  portfolio_links: LinkItem[]
  socials: Socials
  showcase: ShowcaseItem[]
  created_at: string
  updated_at: string
}

/** Shape used by the create/edit form (server-managed fields omitted). */
export type ProfileInput = Omit<
  Profile,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>

export type TipToken = 'SOL' | 'ONBOARDING'
export type TipStatus = 'preview' | 'submitted' | 'confirmed' | 'failed'

export interface Tip {
  id: string
  from_wallet: string
  to_profile_id: string | null
  to_wallet: string
  token: TipToken
  gross_lamports: number
  fee_lamports: number
  net_lamports: number
  fee_bps: number
  message: string | null
  signature: string | null
  status: TipStatus
  created_at: string
}
