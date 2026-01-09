/**
 * Profile Setup page
 * 
 * First-time setup for new users after Discord login.
 * Lets users choose their display name (defaults to Discord name).
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthContext } from '@/contexts/AuthContext'

export function ProfileSetup() {
  const navigate = useNavigate()
  const { needsSetup, setupPlayer, discordUsername, discordAvatar, loading } = useAuthContext()
  
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-fill with Discord username
  useEffect(() => {
    if (discordUsername && !displayName) {
      setDisplayName(discordUsername)
    }
  }, [discordUsername, displayName])

  // Redirect if not in setup mode
  useEffect(() => {
    if (!loading && !needsSetup) {
      navigate('/')
    }
  }, [loading, needsSetup, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmed = displayName.trim()
    if (!trimmed) {
      setError('Please enter a display name')
      return
    }

    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters')
      return
    }

    if (trimmed.length > 30) {
      setError('Name must be 30 characters or less')
      return
    }

    setIsSubmitting(true)

    try {
      await setupPlayer(trimmed)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-parchment-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-6"
      >
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {discordAvatar && (
              <img
                src={discordAvatar}
                alt="Profile"
                className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-gold-600/30"
              />
            )}
            <h1 className="font-heading text-2xl text-parchment-100 mb-2">
              Welcome, Tarnished
            </h1>
            <p className="text-parchment-400 font-body">
              What would you like to be called?
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="displayName" 
                className="block font-ui text-sm text-parchment-300 mb-2"
              >
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="input w-full"
                maxLength={30}
                autoFocus
              />
              <p className="mt-2 text-xs text-shadow-500">
                This name will appear on the leaderboard and your matches.
                <br />
                <span className="text-parchment-500">If you've played before, use your existing name to claim your stats.</span>
              </p>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !displayName.trim()}
              className="btn-primary w-full"
            >
              {isSubmitting ? 'Setting up...' : 'Continue'}
            </button>
          </form>

          {/* Discord info */}
          {discordUsername && (
            <p className="mt-6 text-center text-xs text-shadow-500">
              Logged in as {discordUsername} via Discord
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
