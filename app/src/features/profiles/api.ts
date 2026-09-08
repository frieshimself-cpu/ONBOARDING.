import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Profile, ProfileInput } from '@/lib/types'
import type { UserType } from '@/lib/constants'
import { DEMO_PROFILES } from './demoData'

const LS_KEY = 'onb-demo-profiles'
const DEMO_USER_KEY = 'onb-demo-user'

function demoUserId(): string | null {
  try {
    const raw = localStorage.getItem(DEMO_USER_KEY)
    return raw ? (JSON.parse(raw) as { id: string }).id : null
  } catch {
    return null
  }
}

// ---- demo-mode persistence (localStorage) so the full CRUD flow works w/o backend ----
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

  // demo mode — persist to localStorage, owned by the demo account
  if (demoPool().some((p) => p.handle === input.handle)) {
    throw new Error(`Handle @${input.handle} is already taken.`)
  }
  const now = new Date().toISOString()
  const profile: Profile = {
    ...input,
    id: `local-${input.handle}-${Math.floor(Math.random() * 1e6)}`,
    user_id: demoUserId(),
    created_at: now,
    updated_at: now,
  }
  writeLocal([profile, ...readLocal()])
  return profile
}

/** The signed-in user's own profile (or null if they haven't made one). */
export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return (data as Profile) ?? null
  }
  return readLocal().find((p) => p.user_id === userId) ?? null
}

export async function updateProfile(id: string, input: ProfileInput): Promise<Profile> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...input })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    return data as Profile
  }

  const list = readLocal()
  const idx = list.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('Only profiles created in this browser can be edited in demo mode.')
  const updated: Profile = {
    ...list[idx],
    ...input,
    id,
    updated_at: new Date().toISOString(),
  }
  list[idx] = updated
  writeLocal(list)
  return updated
}

export async function deleteProfile(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeLocal(readLocal().filter((p) => p.id !== id))
}

/**
 * Can the current visitor edit this profile?
 * - Supabase mode: profile.user_id must match the signed-in user.
 * - Demo mode: same rule against the local demo account (with a fallback for
 *   profiles created in this browser before accounts existed).
 */
export function canEditProfile(profile: Profile, userId?: string | null): boolean {
  if (isSupabaseConfigured) return !!userId && profile.user_id === userId
  if (userId && profile.user_id === userId) return true
  return profile.user_id == null && readLocal().some((p) => p.id === profile.id)
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
