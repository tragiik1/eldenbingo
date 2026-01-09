/**
 * Gallery page
 * 
 * Visual archive of completed boards.
 * Masonry-style layout with lazy loading.
 * Focus is purely on the imagery.
 */

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMatches } from '@/hooks/useMatches'
import { Skeleton } from '@/components/ui/LoadingSpinner'
import { OutcomeBadge } from '@/components/ui/OutcomeBadge'
import { formatDateShort } from '@/lib/utils'
import type { MatchWithDetails } from '@/types'

export function Gallery() {
  const { matches, loading, hasMore, loadMore, refresh } = useMatches({ limit: 12 })
  const [selectedMatch, setSelectedMatch] = useState<MatchWithDetails | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loading, loadMore])

  // Close lightbox on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMatch(null)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container-wide">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="font-heading text-2xl md:text-3xl text-parchment-100">
              Gallery
            </h1>
            <button
              onClick={refresh}
              className="p-2 text-shadow-500 hover:text-parchment-300 hover:bg-shadow-800 rounded-md transition-colors"
              title="Refresh gallery"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-parchment-400 font-ui">
            Browse all archived boards
          </p>
        </motion.div>

        {/* Gallery grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {matches.map((match, index) => (
            <GalleryItem
              key={match.id}
              match={match}
              index={index}
              onClick={() => setSelectedMatch(match)}
            />
          ))}

          {/* Loading skeletons */}
          {loading && Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`skeleton-${i}`} className="aspect-square rounded-lg" />
          ))}
        </div>

        {/* Load more trigger */}
        <div ref={loadMoreRef} className="h-20" />

        {/* Empty state */}
        {!loading && matches.length === 0 && (
          <div className="text-center py-20">
            <h2 className="font-heading text-xl text-parchment-300 mb-2">
              No matches yet
            </h2>
            <p className="text-shadow-500">
              No boards have been archived yet.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedMatch && (
          <Lightbox 
            match={selectedMatch} 
            onClose={() => setSelectedMatch(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Individual gallery item
 */
interface GalleryItemProps {
  match: MatchWithDetails
  index: number
  onClick: () => void
}

function GalleryItem({ match, index, onClick }: GalleryItemProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onClick={onClick}
      className="group relative aspect-square overflow-hidden rounded-lg bg-shadow-900 p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40"
    >
      {/* Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-2 bg-shadow-800 animate-pulse rounded-sm" />
      )}

      {/* Image */}
      <img
        src={match.board.image_url}
        alt={match.title}
        className={`w-full h-full object-contain rounded-sm transition-all duration-400 ease-out group-hover:scale-[1.02] ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-shadow-950/90 via-shadow-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Info on hover */}
      <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="font-heading text-sm text-parchment-100 line-clamp-1 mb-1">
          {match.title}
        </p>
        <p className="text-xs text-shadow-400 font-ui">
          {formatDateShort(match.played_at)}
        </p>
      </div>

      {/* Corner accent */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <OutcomeBadge outcome={match.outcome} size="sm" />
      </div>
    </motion.button>
  )
}

/**
 * Lightbox for viewing boards
 */
interface LightboxProps {
  match: MatchWithDetails
  onClose: () => void
}

function Lightbox({ match, onClose }: LightboxProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-shadow-950/95 backdrop-blur-sm" />

      {/* Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-shadow-400 hover:text-parchment-200 transition-colors"
          aria-label="Close lightbox"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        <div className="relative overflow-hidden bg-shadow-900 border border-shadow-800/60 shadow-glow-strong p-3 rounded-sm">
          <img
            src={match.board.image_url}
            alt={match.title}
            className="w-full rounded-sm"
          />
        </div>

        {/* Info bar */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl text-parchment-100">
              {match.title}
            </h2>
            <p className="text-sm text-shadow-500 font-ui">
              {formatDateShort(match.played_at)}
            </p>
          </div>
          
          <Link
            to={`/match/${match.id}`}
            className="btn-primary"
          >
            View Details
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
