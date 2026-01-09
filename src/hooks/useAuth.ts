/**
 * Authentication hook
 * 
 * Manages Discord OAuth login and player profile setup.
 * Uses local caching to prevent constant re-fetching.
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase, signInWithDiscord, signOut } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Player } from '@/types'

// Local storage keys
const PLAYER_CACHE_KEY = 'eldenbingo-player'

interface AuthState {
  user: User | null
  player: Player | null
  loading: boolean
  needsSetup: boolean
}

interface UseAuthReturn extends AuthState {
  login: () => Promise<void>
  logout: () => Promise<void>
  setupPlayer: (displayName: string) => Promise<void>
  discordUsername: string | null
  discordAvatar: string | null
}

// Get cached player
function getCachedPlayer(): Player | null {
  try {
    const cached = localStorage.getItem(PLAYER_CACHE_KEY)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

// Save player to cache
function setCachedPlayer(player: Player | null) {
  if (player) {
    localStorage.setItem(PLAYER_CACHE_KEY, JSON.stringify(player))
  } else {
    localStorage.removeItem(PLAYER_CACHE_KEY)
  }
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    player: null,
    loading: true,
    needsSetup: false,
  })

  const discordUsername = state.user?.user_metadata?.full_name || 
                          state.user?.user_metadata?.name || 
                          state.user?.user_metadata?.preferred_username || 
                          null
  const discordAvatar = state.user?.user_metadata?.avatar_url || null

  // Initialize auth
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
      setState({ user: null, player: null, loading: false, needsSetup: false })
      return
    }

    let isMounted = true

    async function init() {
      console.log('[Auth] Initializing...')
      
      // Get cached player first
      const cachedPlayer = getCachedPlayer()
      console.log('[Auth] Cached player:', cachedPlayer?.name || 'none')

      try {
        // Get session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('[Auth] Session error:', error)
          if (isMounted) {
            setState({ user: null, player: null, loading: false, needsSetup: false })
          }
          return
        }

        if (!session) {
          console.log('[Auth] No session')
          setCachedPlayer(null) // Clear cache if not logged in
          if (isMounted) {
            setState({ user: null, player: null, loading: false, needsSetup: false })
          }
          return
        }

        console.log('[Auth] Session found for:', session.user.email)

        // If we have cached player, use it immediately
        if (cachedPlayer) {
          console.log('[Auth] Using cached player:', cachedPlayer.name)
          if (isMounted) {
            setState({
              user: session.user,
              player: cachedPlayer,
              loading: false,
              needsSetup: false,
            })
          }
          
          // Refresh in background
          supabase
            .from('players')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
            .then(({ data }) => {
              if (data && isMounted) {
                setCachedPlayer(data as Player)
                setState(prev => ({ ...prev, player: data as Player }))
              }
            })
          
          return
        }

        // No cache - fetch from DB
        console.log('[Auth] No cache, fetching player...')
        const { data: player, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (playerError && playerError.code !== 'PGRST116') {
          console.error('[Auth] Player fetch error:', playerError)
        }

        console.log('[Auth] Player result:', player?.name || 'not found')
        
        if (player) {
          setCachedPlayer(player as Player)
        }

        if (isMounted) {
          setState({
            user: session.user,
            player: player as Player | null,
            loading: false,
            needsSetup: !player,
          })
        }
      } catch (err) {
        console.error('[Auth] Init error:', err)
        if (isMounted) {
          setState({ user: null, player: null, loading: false, needsSetup: false })
        }
      }
    }

    init()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Event:', event)
        
        if (event === 'SIGNED_OUT') {
          setCachedPlayer(null)
          if (isMounted) {
            setState({ user: null, player: null, loading: false, needsSetup: false })
          }
        } else if (event === 'SIGNED_IN' && session) {
          // Re-run init on sign in
          init()
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(async () => {
    await signInWithDiscord()
  }, [])

  const logout = useCallback(async () => {
    setCachedPlayer(null)
    await signOut()
  }, [])

  const setupPlayer = useCallback(async (displayName: string) => {
    if (!state.user) throw new Error('Must be logged in')

    const trimmedName = displayName.trim()
    if (!trimmedName) throw new Error('Name required')

    // Check for existing player with this name
    const { data: existing } = await supabase
      .from('players')
      .select('*')
      .ilike('name', trimmedName)
      .single()

    if (existing) {
      if (!existing.user_id) {
        // Claim unclaimed player
        const { data: claimed, error } = await supabase
          .from('players')
          .update({ user_id: state.user.id, avatar_url: discordAvatar })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        
        setCachedPlayer(claimed as Player)
        setState(prev => ({ ...prev, player: claimed as Player, needsSetup: false }))
        return
      }
      throw new Error('Name taken')
    }

    // Create new player
    const { data: newPlayer, error } = await supabase
      .from('players')
      .insert({
        name: trimmedName,
        user_id: state.user.id,
        avatar_url: discordAvatar,
        color: ['#9b59b6', '#e74c3c', '#5dade2', '#2ecc71'][Math.floor(Math.random() * 4)],
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') throw new Error('Name taken')
      throw error
    }

    setCachedPlayer(newPlayer as Player)
    setState(prev => ({ ...prev, player: newPlayer as Player, needsSetup: false }))
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
