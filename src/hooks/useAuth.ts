/**
 * Authentication hook
 * 
 * Manages Discord OAuth login and player profile setup.
 * - Tracks auth state
 * - Links auth user to player record
 * - Handles first-time name setup flow
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase, signInWithDiscord, signOut } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Player } from '@/types'

interface AuthState {
  user: User | null
  player: Player | null
  loading: boolean
  needsSetup: boolean // True if logged in but hasn't set display name
}

interface UseAuthReturn extends AuthState {
  login: () => Promise<void>
  logout: () => Promise<void>
  setupPlayer: (displayName: string) => Promise<void>
  discordUsername: string | null
  discordAvatar: string | null
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    player: null,
    loading: true,
    needsSetup: false,
  })

  // Extract Discord info from user metadata
  const discordUsername = state.user?.user_metadata?.full_name || 
                          state.user?.user_metadata?.name || 
                          state.user?.user_metadata?.preferred_username || 
                          null
  const discordAvatar = state.user?.user_metadata?.avatar_url || null

  // Check if user has a player record
  const fetchPlayer = useCallback(async (userId: string) => {
    const { data: player, error } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found (expected for new users)
      console.error('Error fetching player:', error)
    }

    return player as Player | null
  }, [])

  // Initialize auth state
  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
      // No Supabase, skip auth
      setState({
        user: null,
        player: null,
        loading: false,
        needsSetup: false,
      })
      return
    }

    // Get initial session
    supabase.auth.getSession()
      .then(async ({ data: { session }, error }) => {
        if (error) {
          console.error('Error getting session:', error)
          setState({
            user: null,
            player: null,
            loading: false,
            needsSetup: false,
          })
          return
        }

        if (session?.user) {
          const player = await fetchPlayer(session.user.id)
          setState({
            user: session.user,
            player,
            loading: false,
            needsSetup: !player,
          })
        } else {
          setState({
            user: null,
            player: null,
            loading: false,
            needsSetup: false,
          })
        }
      })
      .catch((err) => {
        console.error('Auth error:', err)
        setState({
          user: null,
          player: null,
          loading: false,
          needsSetup: false,
        })
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const player = await fetchPlayer(session.user.id)
          setState({
            user: session.user,
            player,
            loading: false,
            needsSetup: !player,
          })
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            player: null,
            loading: false,
            needsSetup: false,
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchPlayer])

  // Login handler
  const login = useCallback(async () => {
    try {
      await signInWithDiscord()
    } catch (err) {
      console.error('Login failed:', err)
      throw err
    }
  }, [])

  // Logout handler
  const logout = useCallback(async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Logout failed:', err)
      throw err
    }
  }, [])

  // Setup player profile (first-time setup)
  // If a player with this name exists but isn't linked to a user, claim it
  const setupPlayer = useCallback(async (displayName: string) => {
    if (!state.user) {
      throw new Error('Must be logged in to setup player')
    }

    const trimmedName = displayName.trim()
    if (!trimmedName) {
      throw new Error('Display name is required')
    }

    // Check if a player with this name already exists
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('*')
      .ilike('name', trimmedName)
      .single()

    if (existingPlayer) {
      // Player exists - check if it's unclaimed (no user_id)
      if (!existingPlayer.user_id) {
        // Claim this player - link to current user
        const { data: claimedPlayer, error: claimError } = await supabase
          .from('players')
          .update({ 
            user_id: state.user.id,
            avatar_url: discordAvatar || existingPlayer.avatar_url,
          })
          .eq('id', existingPlayer.id)
          .select()
          .single()

        if (claimError) {
          throw claimError
        }

        setState(prev => ({
          ...prev,
          player: claimedPlayer as Player,
          needsSetup: false,
        }))
        return
      } else {
        // Player is already claimed by another user
        throw new Error('This name is already taken. Please choose another.')
      }
    }

    // No existing player, create new one
    const { data: player, error } = await supabase
      .from('players')
      .insert({
        name: trimmedName,
        user_id: state.user.id,
        avatar_url: discordAvatar,
        color: getRandomColor(),
      })
      .select()
      .single()

    if (error) {
      // Check for duplicate name (race condition)
      if (error.code === '23505') {
        throw new Error('This name is already taken. Please choose another.')
      }
      throw error
    }

    setState(prev => ({
      ...prev,
      player: player as Player,
      needsSetup: false,
    }))
  }, [state.user, discordAvatar])

  return {
    ...state,
    login,
    logout,
    setupPlayer,
    discordUsername,
    discordAvatar,
  }
}

// Generate a random player color (matches bingo board colors)
function getRandomColor(): string {
  const colors = [
    '#9b59b6', // Purple
    '#e74c3c', // Red
    '#5dade2', // Blue
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
