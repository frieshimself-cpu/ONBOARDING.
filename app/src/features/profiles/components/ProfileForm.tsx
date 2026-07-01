import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Plus, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Tag } from '@/components/ui/Tag'
import { Avatar } from '@/components/ui/Avatar'
import { Spinner } from '@/components/ui/Spinner'
import { SKILL_TAGS, type UserType } from '@/lib/constants'
import { slugify } from '@/lib/utils'
import type { ProfileInput, ShowcaseItem, LinkItem } from '@/lib/types'
import { uploadImage } from '../api'

const SOCIAL_FIELDS: { key: keyof ProfileInput['socials']; label: string; ph: string }[] = [
  { key: 'x', label: 'X (Twitter)', ph: 'handle (no @)' },
  { key: 'github', label: 'GitHub', ph: 'username' },
  { key: 'website', label: 'Website', ph: 'https://…' },
  { key: 'telegram', label: 'Telegram', ph: 'handle' },
  { key: 'discord', label: 'Discord', ph: 'user#0000' },
]

function emptyDraft(userType: UserType, wallet: string | null): ProfileInput {
  return {
    user_type: userType,
    handle: '',
    display_name: '',
    bio: '',
    avatar_url: null,
    wallet_address: wallet,
    skills: [],
    portfolio_links: [],
    socials: {},
    showcase: [],
  }
}

export function ProfileForm({
  userType,
  initial,
  submitting,
  onSubmit,
}: {
  userType: UserType
  initial?: ProfileInput
  submitting?: boolean
  onSubmit: (input: ProfileInput) => void
}) {
  const { publicKey } = useWallet()
  const [form, setForm] = useState<ProfileInput>(
    () => initial ?? emptyDraft(userType, publicKey?.toBase58() ?? null),
  )
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function patch(p: Partial<ProfileInput>) {
    setForm((f) => ({ ...f, ...p }))
  }

  function toggleSkill(s: string) {
    patch({
      skills: form.skills.includes(s)
        ? form.skills.filter((x) => x !== s)
        : [...form.skills, s],
    })
  }

  async function onAvatar(file?: File) {
    if (!file) return
    setAvatarBusy(true)
    try {
      const url = await uploadImage(file, 'avatars')
      patch({ avatar_url: url })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setAvatarBusy(false)
    }
  }

  // ---- portfolio links ----
  function addLink() {
    patch({ portfolio_links: [...form.portfolio_links, { label: '', url: '' }] })
  }
  function patchLink(i: number, p: Partial<LinkItem>) {
    const next = form.portfolio_links.slice()
    next[i] = { ...next[i], ...p }
    patch({ portfolio_links: next })
  }
  function removeLink(i: number) {
    patch({ portfolio_links: form.portfolio_links.filter((_, idx) => idx !== i) })
  }

  // ---- showcase ----
  function addShowcase() {
    patch({
      showcase: [
        ...form.showcase,
        { id: `sc-${Date.now()}`, title: '', description: '', url: '', image_url: '' },
      ],
    })
  }
  function patchShowcase(i: number, p: Partial<ShowcaseItem>) {
    const next = form.showcase.slice()
    next[i] = { ...next[i], ...p }
    patch({ showcase: next })
  }
  function removeShowcase(i: number) {
    patch({ showcase: form.showcase.filter((_, idx) => idx !== i) })
  }
  async function onShowcaseImage(i: number, file?: File) {
    if (!file) return
    const url = await uploadImage(file, 'showcase')
    patchShowcase(i, { image_url: url })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.display_name.trim()) return setError('Display name is required.')
    if (!form.handle.trim()) return setError('Handle is required.')
    onSubmit({ ...form, handle: slugify(form.handle) })
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      {/* Avatar + identity */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative">
          <Avatar src={form.avatar_url} name={form.display_name || 'you'} size={80} />
          <label className="absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-border bg-surface text-muted hover:text-brand">
            {avatarBusy ? <Spinner /> : <Upload size={14} />}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onAvatar(e.target.files?.[0])}
            />
          </label>
        </div>
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <Field label="Display name" required>
            <Input
              value={form.display_name}
              onChange={(e) => patch({ display_name: e.target.value })}
              placeholder="Ava Reyes"
            />
          </Field>
          <Field label="Handle" hint="Your public URL: /p/handle" required>
            <Input
              value={form.handle}
              onChange={(e) => patch({ handle: e.target.value })}
              placeholder="solslinger"
            />
          </Field>
        </div>
      </div>

      <Field label="Bio" hint="A couple of sentences on what you do and what you’re looking for.">
        <Textarea
          value={form.bio ?? ''}
          onChange={(e) => patch({ bio: e.target.value })}
          placeholder="I build Solana programs and help newcomers launch responsibly…"
        />
      </Field>

      <Field label="Skills / tags">
        <div className="flex flex-wrap gap-2 pt-1">
          {SKILL_TAGS.map((s) => (
            <Tag key={s} active={form.skills.includes(s)} onClick={() => toggleSkill(s)}>
              {s}
            </Tag>
          ))}
        </div>
      </Field>

      <Field label="Wallet address" hint="Where tips are received. Auto-filled from your connected wallet.">
        <Input
          value={form.wallet_address ?? ''}
          onChange={(e) => patch({ wallet_address: e.target.value })}
          placeholder="Connect a wallet, or paste an address"
          className="font-mono text-xs"
        />
      </Field>

      {/* Socials */}
      <div>
        <div className="mb-2 text-sm font-medium">Social links</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {SOCIAL_FIELDS.map((s) => (
            <Input
              key={s.key}
              value={(form.socials[s.key] as string) ?? ''}
              onChange={(e) => patch({ socials: { ...form.socials, [s.key]: e.target.value } })}
              placeholder={`${s.label} — ${s.ph}`}
            />
          ))}
        </div>
      </div>

      {/* Portfolio links */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium">Portfolio links</div>
          <Button type="button" variant="ghost" size="sm" onClick={addLink}>
            <Plus size={14} /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {form.portfolio_links.map((l, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={l.label}
                onChange={(e) => patchLink(i, { label: e.target.value })}
                placeholder="Label"
                className="w-1/3"
              />
              <Input
                value={l.url}
                onChange={(e) => patchLink(i, { url: e.target.value })}
                placeholder="https://…"
              />
              <button type="button" onClick={() => removeLink(i)} className="px-2 text-muted hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {form.portfolio_links.length === 0 && (
            <p className="text-xs text-muted">No links yet.</p>
          )}
        </div>
      </div>

      {/* Showcase gallery */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium">Showcase / past work</div>
          <Button type="button" variant="ghost" size="sm" onClick={addShowcase}>
            <Plus size={14} /> Add item
          </Button>
        </div>
        <div className="space-y-3">
          {form.showcase.map((item, i) => (
            <div key={item.id} className="card space-y-2 p-3">
              <div className="flex gap-2">
                <Input
                  value={item.title}
                  onChange={(e) => patchShowcase(i, { title: e.target.value })}
                  placeholder="Title"
                />
                <label className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-border text-muted hover:text-brand">
                  <Upload size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onShowcaseImage(i, e.target.files?.[0])}
                  />
                </label>
                <button type="button" onClick={() => removeShowcase(i)} className="px-2 text-muted hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
              <Input
                value={item.url ?? ''}
                onChange={(e) => patchShowcase(i, { url: e.target.value })}
                placeholder="Link (optional)"
              />
              {item.image_url && (
                <img src={item.image_url} alt="" className="h-28 rounded-lg border border-border object-cover" />
              )}
            </div>
          ))}
          {form.showcase.length === 0 && (
            <p className="text-xs text-muted">Add images or links to past work.</p>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? <Spinner /> : null}
          {initial ? 'Save changes' : 'Create profile'}
        </Button>
      </div>
    </form>
  )
}
