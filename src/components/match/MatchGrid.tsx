/**
 * Match grid component
 * 
 * Displays a responsive grid of match cards.
 * Handles loading states and empty states gracefully.
 */

import { MatchCard } from './MatchCard'
import { MatchCardSkeleton } from '@/components/ui/LoadingSpinner'
import type { MatchWithDetails } from '@/types'

interface MatchGridProps {
  matches: MatchWithDetails[]
  loading?: boolean
  error?: string | null
}

export function MatchGrid({ matches, loading, error }: MatchGridProps) {
  // Loading state - show skeletons
  if (loading && matches.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Error state
  if (error && matches.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="font-heading text-xl text-parchment-300 mb-2">
          Connection Error
        </h3>
        <p className="text-shadow-500 max-w-md mx-auto">
          {error}
        </p>
      </div>
    )
  }

  // Empty state
  if (matches.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="font-heading text-xl text-parchment-300 mb-2">
          No matches yet
        </h3>
        <p className="text-shadow-500 max-w-md mx-auto">
          Submit a match to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.map((match, index) => (
        <MatchCard key={match.id} match={match} index={index} />
      ))}
    </div>
  )
}

/**
 * Load more button for pagination
 */
interface LoadMoreButtonProps {
  onClick: () => void
  loading?: boolean
  hasMore?: boolean
}

export function LoadMoreButton({ onClick, loading, hasMore }: LoadMoreButtonProps) {
  if (!hasMore) return null

  return (
    <div className="flex justify-center mt-12">
      <button
        onClick={onClick}
        disabled={loading}
        className="btn-secondary min-w-[200px]"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-shadow-500 border-t-gold-500 rounded-full animate-spin" />
            Loading...
          </span>
        ) : (
          'Load More Matches'
        )}
      </button>
    </div>
  )
}
