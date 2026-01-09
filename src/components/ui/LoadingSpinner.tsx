/**
 * Loading spinner component
 * 
 * A subtle, atmospheric loading indicator.
 * Uses the gold accent color with a soft glow.
 */

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Outer ring */}
      <div 
        className="absolute inset-0 rounded-full border-2 border-shadow-700"
      />
      {/* Spinning arc */}
      <div 
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold-500 animate-spin"
        style={{ animationDuration: '1s' }}
      />
      {/* Inner glow */}
      <div 
        className="absolute inset-1 rounded-full bg-gold-500/10 animate-pulse"
        style={{ animationDuration: '2s' }}
      />
    </div>
  )
}

/**
 * Full-page loading state
 */
export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-shadow-500 font-body text-sm">
        Loading...
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
        'bg-shadow-800/50 rounded-md animate-pulse',
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
    <div className="card p-4 space-y-4">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  )
}
