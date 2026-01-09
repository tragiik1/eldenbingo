/**
 * Match outcome badge
 * 
 * Displays the outcome with appropriate styling.
 * Each outcome has a distinct visual treatment.
 */

import { cn, outcomeLabels } from '@/lib/utils'
import type { MatchOutcome } from '@/types'

interface OutcomeBadgeProps {
  outcome: MatchOutcome
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function OutcomeBadge({ outcome, size = 'md', className }: OutcomeBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  const outcomeClasses: Record<MatchOutcome, string> = {
    bingo: 'bg-gold-600/20 text-gold-400 border-gold-600/30',
    blackout: 'bg-parchment-900/30 text-parchment-300 border-parchment-700/30',
    abandoned: 'bg-shadow-800/50 text-shadow-400 border-shadow-600/50',
    draw: 'bg-fog-500 text-parchment-400 border-shadow-600/50',
  }

  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-ui font-medium border',
        sizeClasses[size],
        outcomeClasses[outcome],
        className
      )}
    >
      <span>{outcomeLabels[outcome]}</span>
    </span>
  )
}
