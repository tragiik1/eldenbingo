/**
 * Authentication hook
 * 
 * Manages Discord OAuth login and player profile setup.
 * - Tracks auth state
 * - Links auth user to player record
 * - Handles first-time name setup flow
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, signInWithDiscord, signOut } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
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
  
  const initialized = useRef(false)

  // Extract Discord info from user metadata
  const discordUsername = state.user?.user_metadata?.full_name || 
                          state.user?.user_metadata?.name || 
                          state.user?.user_metadata?.preferred_username || 
                          null
  const discordAvatar = state.user?.user_metadata?.avatar_url || null

  // Handle session update (used by both initial load and auth changes)
  const handleSession = useCallback(async (session: Session | null) => {
    if (session?.user) {
      // Fetch player record
      const { data: player, error } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching player:', error)
      }

      setState({
        user: session.user,
        player: player as Player | null,
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
  }, [])

  // Initialize auth state
  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initialized.current) return
    initialized.current = true

    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
      setState({
        user: null,
        player: null,
        loading: false,
        needsSetup: false,
      })
      return
    }

    let sessionHandled = false

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event)
        sessionHandled = true
        
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await handleSession(session)
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

    // Manually get session as backup (in case INITIAL_SESSION doesn't fire)
    const checkSession = async () => {
      // Wait a bit to see if onAuthStateChange fires first
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (!sessionHandled) {
        console.log('Auth: Manual session check (event did not fire)')
        const { data: { session }, error } = await supabase.auth.getSession()
        
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
        
        await handleSession(session)
      }
    }
    
    checkSession()

    // Failsafe timeout - if nothing happens in 5 seconds, stop loading
    const timeout = setTimeout(() => {
      setState(prev => {
        if (prev.loading) {
          console.warn('Auth failsafe timeout triggered')
          return { ...prev, loading: false }
        }
        return prev
      })
    }, 5000)

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [handleSession])

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

    // Check if a player with this name already exists
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('*')
      .ilike('name', trimmedName)
      .single()

    if (existingPlayer) {
      // Player exists - check if it's unclaimed (no user_id)
      if (!existingPlayer.user_id) {
        // Claim this player
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
        throw new Error('This name is already taken. Please choose another.')
      }
    }

    // Create new player
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

function getRandomColor(): string {
  const colors = ['#9b59b6', '#e74c3c', '#5dade2']
  return colors[Math.floor(Math.random() * colors.length)]
}
