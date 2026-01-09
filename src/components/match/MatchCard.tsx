/**
 * Match card component
 * 
 * Displays a match preview in the archive grid.
 * Large imagery, minimal text, hover reveals more details.
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatDateShort, generatePlayerGradient } from '@/lib/utils'
import { OutcomeBadge } from '@/components/ui/OutcomeBadge'
import { PlayerList } from '@/components/ui/PlayerBadge'
import { AccoladeList } from '@/components/ui/AccoladeBadge'
import type { MatchWithDetails } from '@/types'

interface MatchCardProps {
  match: MatchWithDetails
  index?: number
}

export function MatchCard({ match, index = 0 }: MatchCardProps) {
  const playerColors = match.match_players.map(mp => mp.color)
  const playerGradient = generatePlayerGradient(playerColors)

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link 
        to={`/match/${match.id}`}
        className="block card overflow-hidden hover-lift"
      >
        {/* Board image with overlay */}
        <div className="relative aspect-square overflow-hidden">
          {/* Player color gradient background */}
          <div 
            className="absolute inset-0 z-0"
            style={{ background: playerGradient }}
          />
          
          {/* Board image */}
          <img
            src={match.board.image_url}
            alt={`Board for ${match.title}`}
            className="relative z-10 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Hover overlay with gradient */}
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-shadow-950/90 via-shadow-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          
          {/* Outcome badge - top right */}
          <div className="absolute top-3 right-3 z-30">
            <OutcomeBadge outcome={match.outcome} size="sm" />
          </div>

          {/* Bottom info - appears on hover */}
          <div className="absolute bottom-0 left-0 right-0 z-30 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            {match.metadata.time_taken && (
              <p className="text-xs text-parchment-400 font-ui mb-1">
                {match.metadata.time_taken}
              </p>
            )}
          </div>
        </div>

        {/* Card content */}
        <div className="p-4 space-y-3">
          {/* Title and date */}
          <div>
            <h3 className="font-heading text-lg text-parchment-100 group-hover:text-gold-400 transition-colors duration-300 line-clamp-1">
              {match.title}
            </h3>
            <p className="text-sm text-shadow-500 font-ui mt-0.5">
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
