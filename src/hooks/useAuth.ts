/**
 * Authentication hook
 * 
 * Manages Discord OAuth login and player profile setup.
 * - Tracks auth state
 * - Links auth user to player record
 * - Caches player data locally for fast restore
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase, signInWithDiscord, signOut } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Player } from '@/types'

// Local storage keys for caching
const PLAYER_CACHE_KEY = 'eldenbingo-player'
const PLAYER_CACHE_EXPIRY = 30 * 24 * 60 * 60 * 1000 // 30 days

interface CachedPlayer {
  player: Player
  cachedAt: number
}

// Get cached player from localStorage
function getCachedPlayer(): Player | null {
  try {
    const cached = localStorage.getItem(PLAYER_CACHE_KEY)
    if (!cached) return null
    
    const { player, cachedAt } = JSON.parse(cached) as CachedPlayer
    
    // Check if cache is still valid (30 days)
    if (Date.now() - cachedAt > PLAYER_CACHE_EXPIRY) {
      localStorage.removeItem(PLAYER_CACHE_KEY)
      return null
    }
    
    return player
  } catch {
    return null
  }
}

// Cache player to localStorage
function cachePlayer(player: Player | null) {
  if (player) {
    localStorage.setItem(PLAYER_CACHE_KEY, JSON.stringify({
      player,
      cachedAt: Date.now(),
    }))
  } else {
    localStorage.removeItem(PLAYER_CACHE_KEY)
  }
}

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

  // Fetch player from database
  const fetchPlayer = useCallback(async (userId: string): Promise<Player | null> => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching player:', error)
      }
      
      return data as Player | null
    } catch (err) {
      console.error('Exception fetching player:', err)
      return null
    }
  }, [])

  // Handle session update
  const handleSession = useCallback(async (session: Session | null, isInitial: boolean = false) => {
    if (!session?.user) {
      // Not logged in
      cachePlayer(null)
      setState({
        user: null,
        player: null,
        loading: false,
        needsSetup: false,
      })
      return
    }

    // User is logged in
    const cachedPlayer = getCachedPlayer()
    
    // If we have cached player data, use it immediately (no loading state for returning users)
    if (cachedPlayer && isInitial) {
      setState({
        user: session.user,
        player: cachedPlayer,
        loading: false,
        needsSetup: false,
      })
      
      // Refresh player data in background (don't await)
      fetchPlayer(session.user.id).then(freshPlayer => {
        if (freshPlayer) {
          cachePlayer(freshPlayer)
          setState(prev => ({
            ...prev,
            player: freshPlayer,
          }))
        }
      })
      return
    }

    // No cache - need to fetch from DB
    setState(prev => ({
      ...prev,
      user: session.user,
      loading: true,
    }))

    const player = await fetchPlayer(session.user.id)
    
    if (player) {
      cachePlayer(player)
    }
    
    setState({
      user: session.user,
      player,
      loading: false,
      needsSetup: !player,
    })
  }, [fetchPlayer])

  // Initialize auth state
  useEffect(() => {
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

    let mounted = true

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth session error:', error)
          if (mounted) {
            setState({
              user: null,
              player: null,
              loading: false,
              needsSetup: false,
            })
          }
          return
        }
        
        if (mounted) {
          await handleSession(session, true) // true = initial load
        }
      } catch (err) {
        console.error('Auth init error:', err)
        if (mounted) {
          setState({
            user: null,
            player: null,
            loading: false,
            needsSetup: false,
          })
        }
      }
    }
    
    initAuth()

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        if (event === 'SIGNED_IN') {
          await handleSession(session, false)
        } else if (event === 'SIGNED_OUT') {
          cachePlayer(null)
          setState({
            user: null,
            player: null,
            loading: false,
            needsSetup: false,
          })
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Just update user, keep player
          setState(prev => ({
            ...prev,
            user: session.user,
          }))
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [handleSession])

  // Login handler
  const login = useCallback(async () => {
    await signInWithDiscord()
  }, [])

  // Logout handler
  const logout = useCallback(async () => {
    cachePlayer(null) // Clear cache on logout
    await signOut()
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

        const player = claimedPlayer as Player
        cachePlayer(player)
        setState(prev => ({
          ...prev,
          player,
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

    const newPlayer = player as Player
    cachePlayer(newPlayer)
    setState(prev => ({
      ...prev,
      player: newPlayer,
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
  const colors = ['#9b59b6', '#e74c3c', '#5dade2', '#2ecc71']
  return colors[Math.floor(Math.random() * colors.length)]
}
