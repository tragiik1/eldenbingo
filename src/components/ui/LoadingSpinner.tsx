/**
 * Loading spinner component
 * 
 * Clean, minimal loading indicators.
 */

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-2',
  }

  return (
    <div 
      className={cn(
        'rounded-full border-shadow-700 border-t-gold-500 animate-spin',
        sizeClasses[size],
        className
      )}
      style={{ animationDuration: '0.8s' }}
    />
  )
}

/**
 * Full-page loading state
 */
export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-shadow-500 font-ui text-sm">
        Loading
      </p>
    </div>
  )
}

/**
 * Skeleton loader for cards
 */
interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={cn(
        'bg-shadow-800/40 rounded-md shimmer',
        className
      )}
    />
  )
}

/**
 * Match card skeleton
 */
export function MatchCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}
