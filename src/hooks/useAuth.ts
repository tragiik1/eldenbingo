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
  const setupPlayer = useCallback(async (displayName: string) => {
    if (!state.user) {
      throw new Error('Must be logged in to setup player')
    }

    const trimmedName = displayName.trim()
    if (!trimmedName) {
      throw new Error('Display name is required')
    }

    // Create player record
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
      // Check for duplicate name
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

// Generate a random player color
function getRandomColor(): string {
  const colors = [
    '#d4a84a', // Gold
    '#7c9885', // Sage
    '#c4785a', // Rust
    '#8b7355', // Bronze
    '#6b8e9f', // Steel blue
    '#9b6b8e', // Mauve
    '#5f8a8b', // Teal
    '#a08060', // Tan
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
