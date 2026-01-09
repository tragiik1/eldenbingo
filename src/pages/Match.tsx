/**
 * Match detail page
 * 
 * The sacred record of a single trial.
 * Board image is the focus, with supporting details around it.
 */

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMatch } from '@/hooks/useMatch'
import { useAuthContext } from '@/contexts/AuthContext'
import { formatDate, generatePlayerGradient } from '@/lib/utils'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { PlayerBadge } from '@/components/ui/PlayerBadge'
import { OutcomeBadge } from '@/components/ui/OutcomeBadge'
import { AccoladeList } from '@/components/ui/AccoladeBadge'
import { CommentList } from '@/components/comments/CommentList'
import { CommentForm } from '@/components/comments/CommentForm'
import { EditMatchModal } from '@/components/match/EditMatchModal'

export function Match() {
  const { id } = useParams<{ id: string }>()
  const { match, loading, error, addComment, refetch } = useMatch(id)
  const { isAdmin } = useAuthContext()
  const [editModalOpen, setEditModalOpen] = useState(false)

  if (loading) {
    return <PageLoader />
  }

  if (error || !match) {
    return (
      <div className="container-narrow py-20 text-center">
        <h1 className="font-heading text-2xl text-parchment-300 mb-2">
          Match Not Found
        </h1>
        <p className="text-shadow-500 mb-8">
          {error || 'This match could not be found.'}
        </p>
        <Link to="/" className="btn-secondary">
          Back to Archive
        </Link>
      </div>
    )
  }

  const playerColors = match.match_players.map(mp => mp.color)
  const playerGradient = generatePlayerGradient(playerColors)
  const winner = match.match_players.find(mp => mp.is_winner)

  return (
    <div className="min-h-screen">
      {/* Hero section with board image */}
      <section className="relative">
        {/* Background gradient from player colors */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{ background: playerGradient }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-shadow-950/50 via-shadow-950/80 to-shadow-950" />

        <div className="relative container-wide py-10 md:py-16">
          {/* Top bar with back link and edit button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between mb-6"
          >
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-shadow-500 hover:text-parchment-300 transition-colors font-ui text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>

            {/* Admin Edit Button */}
            {isAdmin && (
              <button
                onClick={() => setEditModalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-ui text-parchment-400 hover:text-parchment-200 bg-shadow-800/60 hover:bg-shadow-800 border border-shadow-700 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}
          </motion.div>

          {/* Main content grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Board image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative overflow-hidden bg-shadow-900 border border-shadow-800/60 shadow-glow">
                <img
                  src={match.board.image_url}
                  alt={`Bingo board for ${match.title}`}
                  className="w-full aspect-square object-contain"
                />
              </div>
              
              {/* Source attribution */}
              <p className="mt-3 text-xs text-shadow-600 text-center font-ui">
                Board from {match.board.source}
              </p>
            </motion.div>

            {/* Match details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Title and outcome */}
              <div>
                <div className="flex items-start gap-4 mb-2">
                  <h1 className="font-heading text-3xl md:text-4xl text-parchment-100 flex-1">
                    {match.title}
                  </h1>
                  <OutcomeBadge outcome={match.outcome} size="lg" />
                </div>
                <p className="text-shadow-500 font-ui">
                  {formatDate(match.played_at)}
                </p>
              </div>

              {/* Players */}
              <div>
                <h2 className="font-heading text-sm text-shadow-500 uppercase tracking-widest mb-3">
                  Participants
                </h2>
                <div className="flex flex-wrap gap-2">
                  {match.match_players
                    .sort((a, b) => a.position - b.position)
                    .map((mp) => (
                      <PlayerBadge key={mp.id} player={mp} size="md" />
                    ))}
                </div>
              </div>

              {/* Winner */}
              {winner && (
                <div className="bg-gold-600/10 border border-gold-600/20 rounded-lg p-4">
                  <p className="text-sm text-gold-400 font-ui">
                    Winner: <span className="font-medium">{winner.player.name}</span>
                  </p>
                </div>
              )}

              {/* Metadata */}
              {match.metadata.time_taken && (
                <div className="bg-shadow-900/50 rounded-lg p-4 inline-block">
                  <p className="text-xs text-shadow-500 font-ui uppercase tracking-wider mb-1">
                    Duration
                  </p>
                  <p className="font-heading text-xl text-parchment-200">
                    {match.metadata.time_taken}
                  </p>
                </div>
              )}

              {/* Notes */}
              {match.metadata.notes && (
                <div>
                  <h2 className="font-heading text-sm text-shadow-500 uppercase tracking-widest mb-3">
                    Notes
                  </h2>
                  <p className="font-body text-parchment-400 leading-relaxed whitespace-pre-wrap">
                    {match.metadata.notes}
                  </p>
                </div>
              )}

              {/* Tags */}
              {match.accolades.length > 0 && (
                <div>
                  <h2 className="font-heading text-sm text-shadow-500 uppercase tracking-widest mb-3">
                    Tags
                  </h2>
                  <AccoladeList accolades={match.accolades} size="md" />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comments section */}
      <section className="py-10 md:py-16 border-t border-shadow-800/30">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <h2 className="font-heading text-xl text-parchment-200">
                Comments
              </h2>
              <span className="text-xs text-shadow-600 font-ui">
                {match.comments.length}
              </span>
              <span className="flex-1 h-px bg-gradient-to-r from-shadow-700 to-transparent" />
            </div>

            <CommentList comments={match.comments} />
            <CommentForm onSubmit={addComment} />
          </motion.div>
        </div>
      </section>

      {/* Edit Modal (Admin only) */}
      {isAdmin && (
        <EditMatchModal
          match={match}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={refetch}
        />
      )}
    </div>
  )
}
