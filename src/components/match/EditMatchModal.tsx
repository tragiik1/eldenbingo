/**
 * Edit Match Modal
 * 
 * Admin-only modal for editing match details.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { PLAYER_COLORS, type MatchOutcome, type MatchWithComments } from '@/types'

interface EditMatchModalProps {
  match: MatchWithComments
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

interface PlayerEdit {
  id: string
  name: string
  color: string
  is_winner: boolean
  player_id: string
  match_player_id: string
}

export function EditMatchModal({ match, isOpen, onClose, onSave }: EditMatchModalProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [title, setTitle] = useState(match.title)
  const [playedAt, setPlayedAt] = useState(match.played_at.split('T')[0])
  const [outcome, setOutcome] = useState<MatchOutcome>(match.outcome)
  const [timeTaken, setTimeTaken] = useState(match.metadata.time_taken || '')
  const [notes, setNotes] = useState(match.metadata.notes || '')
  const [players, setPlayers] = useState<PlayerEdit[]>(
    match.match_players.map(mp => ({
      id: mp.id,
      name: mp.player.name,
      color: mp.color,
      is_winner: mp.is_winner || false,
      player_id: mp.player_id,
      match_player_id: mp.id,
    }))
  )

  const updatePlayer = (id: string, updates: Partial<PlayerEdit>) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const setWinner = (id: string) => {
    setPlayers(prev => prev.map(p => ({ ...p, is_winner: p.id === id })))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      // Update match record
      const { error: matchError } = await supabase
        .from('matches')
        .update({
          title,
          played_at: playedAt,
          outcome,
          metadata: {
            time_taken: timeTaken || undefined,
            notes: notes || undefined,
          },
        })
        .eq('id', match.id)

      if (matchError) throw matchError

      // Update each player
      for (const player of players) {
        // Update player name if changed
        const originalPlayer = match.match_players.find(mp => mp.id === player.id)
        if (originalPlayer && originalPlayer.player.name !== player.name) {
          await supabase
            .from('players')
            .update({ name: player.name })
            .eq('id', player.player_id)
        }

        // Update match_player record (color, is_winner)
        await supabase
          .from('match_players')
          .update({
            color: player.color,
            is_winner: player.is_winner,
          })
          .eq('id', player.match_player_id)
      }

      onSave()
      onClose()
    } catch (err) {
      console.error('Save error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const showWinner = outcome === 'bingo' || outcome === 'blackout'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-shadow-950/90 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-lg bg-shadow-900 border border-shadow-700 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-shadow-900 border-b border-shadow-800 px-6 py-4 flex items-center justify-between">
              <h2 className="font-heading text-xl text-parchment-100">Edit Match</h2>
              <button
                onClick={onClose}
                className="p-1 text-shadow-400 hover:text-parchment-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="input"
                />
              </div>

              {/* Date and Outcome */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date</label>
                  <input
                    type="date"
                    value={playedAt}
                    onChange={e => setPlayedAt(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Outcome</label>
                  <select
                    value={outcome}
                    onChange={e => setOutcome(e.target.value as MatchOutcome)}
                    className="input"
                  >
                    <option value="bingo">Bingo</option>
                    <option value="blackout">Blackout</option>
                    <option value="draw">Draw</option>
                    <option value="abandoned">Abandoned</option>
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="label">Duration</label>
                <input
                  type="text"
                  value={timeTaken}
                  onChange={e => setTimeTaken(e.target.value)}
                  placeholder="e.g. 2h 30m"
                  className="input"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="label">Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="input min-h-[80px] resize-y"
                  rows={2}
                />
              </div>

              {/* Players */}
              <div>
                <label className="label">Players</label>
                <div className="space-y-3">
                  {players.map(player => (
                    <div key={player.id} className="bg-shadow-800/50 rounded-lg p-3 space-y-2">
                      {/* Name */}
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={player.name}
                          onChange={e => updatePlayer(player.id, { name: e.target.value })}
                          className="input flex-1"
                          placeholder="Player name"
                        />
                        {showWinner && (
                          <button
                            type="button"
                            onClick={() => setWinner(player.id)}
                            className={cn(
                              'px-3 py-2 rounded-md text-sm font-ui transition-all',
                              player.is_winner
                                ? 'bg-gold-600/20 text-gold-400 border border-gold-600/40'
                                : 'bg-shadow-700 text-shadow-400 border border-shadow-600 hover:border-shadow-500'
                            )}
                          >
                            {player.is_winner ? 'Winner' : 'Set Winner'}
                          </button>
                        )}
                      </div>

                      {/* Color */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-shadow-500 font-ui">Color</span>
                        <div className="flex gap-2">
                          {PLAYER_COLORS.map(c => (
                            <button
                              key={c.value}
                              type="button"
                              onClick={() => updatePlayer(player.id, { color: c.value })}
                              className={cn(
                                'w-5 h-5 rounded-full transition-all duration-200',
                                player.color === c.value
                                  ? 'ring-1 ring-offset-1 ring-offset-shadow-800 ring-parchment-400 scale-110'
                                  : 'opacity-50 hover:opacity-100 hover:scale-105'
                              )}
                              style={{ backgroundColor: c.value }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-blood-700/20 border border-blood-600/30 rounded-lg">
                  <p className="text-sm text-blood-500">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-shadow-900 border-t border-shadow-800 px-6 py-4 flex gap-3">
              <button
                onClick={onClose}
                disabled={saving}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex-1"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
