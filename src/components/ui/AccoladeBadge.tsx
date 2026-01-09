/**
 * Accolade badge component
 * 
 * Displays vibe-based accolades on matches.
 * These are not competitive - just for flavor and memory.
 */

import { ACCOLADES } from '@/types'
import { cn } from '@/lib/utils'

interface AccoladeBadgeProps {
  accoladeId: string
  size?: 'sm' | 'md'
  className?: string
}

export function AccoladeBadge({ accoladeId, size = 'sm', className }: AccoladeBadgeProps) {
  const accolade = ACCOLADES.find(a => a.id === accoladeId)
  if (!accolade) return null

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  }

  return (
    <span 
      className={cn(
        'inline-flex items-center rounded-md font-ui',
        'bg-shadow-800/50 text-parchment-400 border border-shadow-700/50',
        'hover:border-shadow-600 hover:bg-shadow-800 transition-colors duration-300',
        sizeClasses[size],
        className
      )}
    >
      {accolade.label}
    </span>
  )
}

/**
 * List of accolades
 */
interface AccoladeListProps {
  accolades: string[]
  size?: 'sm' | 'md'
  className?: string
}

export function AccoladeList({ accolades, size = 'sm', className }: AccoladeListProps) {
  if (accolades.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {accolades.map((id) => (
        <AccoladeBadge key={id} accoladeId={id} size={size} />
      ))}
    </div>
  )
}
