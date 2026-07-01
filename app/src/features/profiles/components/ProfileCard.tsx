import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Avatar } from '@/components/ui/Avatar'
import { Tag } from '@/components/ui/Tag'
import type { Profile } from '@/lib/types'

export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35 }}
    >
      <Link
        to={`/p/${profile.handle}`}
        className="card group block p-5 transition-colors hover:border-brand/40"
      >
        <div className="flex items-center gap-3">
          <Avatar src={profile.avatar_url} name={profile.display_name} />
          <div className="min-w-0">
            <div className="truncate font-semibold group-hover:text-brand">
              {profile.display_name}
            </div>
            <div className="text-xs text-muted">@{profile.handle}</div>
          </div>
        </div>
        {profile.bio && (
          <p className="mt-3 line-clamp-3 text-sm text-muted">{profile.bio}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {profile.skills.slice(0, 4).map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
          {profile.skills.length > 4 && (
            <Tag>+{profile.skills.length - 4}</Tag>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
