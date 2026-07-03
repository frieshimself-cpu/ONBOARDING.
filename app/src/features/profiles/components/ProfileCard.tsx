import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import type { Profile } from '@/lib/types'

export function ProfileCard({ profile, index = 0 }: { profile: Profile; index?: number }) {
  const isDev = profile.user_type === 'developer'
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.05 }}
    >
      <Link to={`/p/${profile.handle}`} className="group block h-full">
        <SpotlightCard glow={isDev ? 'brand-2' : 'brand'} className="h-full p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar src={profile.avatar_url} name={profile.display_name} size={46} />
              <div className="min-w-0">
                <div className="truncate font-display text-[15px] font-bold leading-tight group-hover:text-brand">
                  {profile.display_name}
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-muted">@{profile.handle}</div>
              </div>
            </div>
            <ArrowUpRight
              size={16}
              className="mt-1 shrink-0 text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
            />
          </div>

          {profile.bio && (
            <p className="mt-3.5 line-clamp-2 text-sm leading-6 text-muted">{profile.bio}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {profile.skills.slice(0, 4).map((s) => (
              <span
                key={s}
                className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                  isDev ? 'bg-brand-2/10 text-brand-2' : 'bg-brand/10 text-brand'
                }`}
              >
                {s}
              </span>
            ))}
            {profile.skills.length > 4 && (
              <span className="font-mono text-[10px] text-muted">
                +{profile.skills.length - 4}
              </span>
            )}
          </div>
        </SpotlightCard>
      </Link>
    </motion.div>
  )
}
