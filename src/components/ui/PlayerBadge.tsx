/**
 * Player badge component
 * 
 * Displays a player's name with their assigned color.
 * Colors create visual continuity across the archive.
 */

import { motion } from 'framer-motion'
import { cn, getContrastColor } from '@/lib/utils'
import type { MatchPlayerWithDetails } from '@/types'

interface PlayerBadgeProps {
  player: MatchPlayerWithDetails
  size?: 'sm' | 'md' | 'lg'
  showWinner?: boolean
  className?: string
}

export function PlayerBadge({ 
  player, 
  size = 'md', 
  showWinner = true,
  className 
}: PlayerBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-2 rounded-full font-ui font-medium',
        'border transition-all duration-300',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${player.color}20`,
        borderColor: `${player.color}40`,
        color: player.color,
      }}
    >
      {/* Color dot */}
      <span 
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: player.color }}
      />
      
      {/* Player name */}
      <span>{player.player.name}</span>
      
      {/* Winner indicator */}
      {showWinner && player.is_winner && (
        <span 
          className="text-xs px-1.5 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: player.color,
            color: getContrastColor(player.color),
          }}
        >
          W
        </span>
      )}
    </motion.div>
  )
}

/**
 * Compact player list for cards
 */
interface PlayerListProps {
  players: MatchPlayerWithDetails[]
  maxDisplay?: number
  size?: 'sm' | 'md'
}

export function PlayerList({ players, maxDisplay = 4, size = 'sm' }: PlayerListProps) {
  const displayPlayers = players.slice(0, maxDisplay)
  const remaining = players.length - maxDisplay

  return (
    <div className="flex flex-wrap items-center gap-2">
      {displayPlayers.map((player) => (
        <PlayerBadge 
          key={player.id} 
          player={player} 
          size={size}
          showWinner={false}
        />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-shadow-500 font-ui">
          +{remaining} more
        </span>
      )}
    </div>
  )
}
