/**
 * Match card component
 * 
 * Displays a match preview in the archive grid.
 * Clean design with smooth hover interactions.
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatDateShort } from '@/lib/utils'
import { OutcomeBadge } from '@/components/ui/OutcomeBadge'
import { PlayerList } from '@/components/ui/PlayerBadge'
import { AccoladeList } from '@/components/ui/AccoladeBadge'
import type { MatchWithDetails } from '@/types'

interface MatchCardProps {
  match: MatchWithDetails
  index?: number
}

export function MatchCard({ match, index = 0 }: MatchCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className="group"
    >
      <Link 
        to={`/match/${match.id}`}
        className="block card overflow-hidden"
      >
        {/* Board image with overlay */}
        <div className="relative aspect-square overflow-hidden bg-shadow-900">
          {/* Board image */}
          <img
            src={match.board.image_url}
            alt={`Board for ${match.title}`}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-shadow-950/80 via-shadow-950/10 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300" />
          
          {/* Outcome badge - top right */}
          <div className="absolute top-3 right-3 z-10">
            <OutcomeBadge outcome={match.outcome} size="sm" />
          </div>

          {/* Duration overlay - bottom left */}
          {match.metadata.time_taken && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="text-xs font-ui text-parchment-300/90 bg-shadow-950/60 backdrop-blur-sm px-2 py-1 rounded">
                {match.metadata.time_taken}
              </span>
            </div>
          )}
        </div>

        {/* Card content */}
        <div className="p-4 space-y-3">
          {/* Title and date */}
          <div>
            <h3 className="font-heading text-base text-parchment-100 group-hover:text-gold-400 transition-colors duration-200 line-clamp-1">
              {match.title}
            </h3>
            <p className="text-xs text-shadow-500 font-ui mt-1">
              {formatDateShort(match.played_at)}
            </p>
          </div>

          {/* Players */}
          <PlayerList players={match.match_players} />

          {/* Accolades */}
          {match.accolades.length > 0 && (
            <AccoladeList accolades={match.accolades} />
          )}
        </div>
      </Link>
    </motion.article>
  )
}
