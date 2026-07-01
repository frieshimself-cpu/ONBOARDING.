import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Profile, ProfileInput } from '@/lib/types'
import type { UserType } from '@/lib/constants'
import { DEMO_PROFILES } from './demoData'

const LS_KEY = 'onb-demo-profiles'

// ---- demo-mode persistence (localStorage) so the create flow works w/o backend ----
function readLocal(): Profile[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Profile[]) : []
  } catch {
    return []
  }
}
function writeLocal(list: Profile[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list))
  } catch {
    /* ignore quota / SSR */
  }
}
function demoPool(): Profile[] {
  return [...readLocal(), ...DEMO_PROFILES]
}

export interface ListParams {
  userType?: UserType
  search?: string
  tags?: string[]
}

export async function listProfiles(params: ListParams = {}): Promise<Profile[]> {
  const { userType, search, tags } = params

  if (isSupabaseConfigured && supabase) {
    let q = supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (userType) q = q.eq('user_type', userType)
    if (tags && tags.length) q = q.contains('skills', tags)
    if (search) q = q.or(`display_name.ilike.%${search}%,handle.ilike.%${search}%,bio.ilike.%${search}%`)
    const { data, error } = await q
    if (error) throw error
    return (data ?? []) as Profile[]
  }

  // demo mode
  let list = demoPool()
  if (userType) list = list.filter((p) => p.user_type === userType)
  if (tags && tags.length) list = list.filter((p) => tags.every((t) => p.skills.includes(t)))
  if (search) {
    const s = search.toLowerCase()
    list = list.filter(
      (p) =>
        p.display_name.toLowerCase().includes(s) ||
        p.handle.toLowerCase().includes(s) ||
        (p.bio ?? '').toLowerCase().includes(s),
    )
  }
  return list
}

export async function getProfileByHandle(handle: string): Promise<Profile | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('profiles').select('*').eq('handle', handle).maybeSingle()
    if (error) throw error
    return (data as Profile) ?? null
  }
  return demoPool().find((p) => p.handle === handle) ?? null
}

export async function createProfile(input: ProfileInput): Promise<Profile> {
  if (isSupabaseConfigured && supabase) {
    const { data: auth } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('profiles')
      .insert({ ...input, user_id: auth.user?.id ?? null })
      .select('*')
      .single()
    if (error) throw error
    return data as Profile
  }

  // demo mode — persist to localStorage
  const now = new Date().toISOString()
  const profile: Profile = {
    ...input,
    id: `local-${input.handle}-${Math.floor(Math.random() * 1e6)}`,
    user_id: null,
    created_at: now,
    updated_at: now,
  }
  writeLocal([profile, ...readLocal()])
  return profile
}

/**
 * Upload an image to Supabase Storage and return a public URL.
 * In demo mode we return a local object URL so previews work (not persisted).
 */
export async function uploadImage(file: File, bucket: 'avatars' | 'showcase'): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
    if (error) throw error
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }
  return URL.createObjectURL(file)
}
