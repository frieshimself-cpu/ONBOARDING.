import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { ProfileForm } from '../components/ProfileForm'
import { getProfileByHandle, updateProfile, deleteProfile, canEditProfile } from '../api'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth/AuthProvider'
import type { Profile, ProfileInput } from '@/lib/types'

export function EditProfilePage() {
  const { handle } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    let alive = true
    getProfileByHandle(handle ?? '')
      .then((p) => alive && setProfile(p))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [handle])

  if (loading) {
    return (
      <div className="grid place-items-center py-40 text-muted">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (!profile || !canEditProfile(profile, user?.id)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-36 text-center">
        <div className="mono-label text-flare">not your pass</div>
        <h1 className="display mt-3 text-3xl">You can&apos;t edit this profile</h1>
        <p className="mt-3 text-sm text-muted">
          {profile
            ? 'Only the profile owner can edit it.'
            : `No profile found for @${handle}.`}
        </p>
        <Link
          to={profile ? `/p/${profile.handle}` : '/developers'}
          className="mt-6 inline-block font-mono text-xs uppercase tracking-wider text-brand hover:underline"
        >
          {profile ? 'back to profile →' : 'browse the directory →'}
        </Link>
      </div>
    )
  }

  const initial: ProfileInput = {
    user_type: profile.user_type,
    handle: profile.handle,
    display_name: profile.display_name,
    bio: profile.bio,
    avatar_url: profile.avatar_url,
    wallet_address: profile.wallet_address,
    skills: profile.skills,
    portfolio_links: profile.portfolio_links,
    socials: profile.socials,
    showcase: profile.showcase,
  }

  async function handleSubmit(input: ProfileInput) {
    if (!profile) return
    setSubmitting(true)
    setError(null)
    try {
      const updated = await updateProfile(profile.id, input)
      navigate(`/p/${updated.handle}`)
    } catch (e) {
      setError((e as Error).message)
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!profile) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    try {
      await deleteProfile(profile.id)
      navigate(`/${profile.user_type}s`)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-4 py-14 sm:px-6"
    >
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            to={`/p/${profile.handle}`}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted hover:text-text"
          >
            ← back to profile
          </Link>
          <h1 className="display mt-3 text-3xl sm:text-4xl">Edit @{profile.handle}</h1>
        </div>
        <Button variant={confirmDelete ? 'danger' : 'ghost'} size="sm" onClick={handleDelete}>
          <Trash2 size={13} />
          {confirmDelete ? 'Really delete?' : 'Delete'}
        </Button>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      <ProfileForm
        userType={profile.user_type}
        initial={initial}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </motion.div>
  )
}
