/**
 * Hook for fetching a single match with all details
 * 
 * Includes board, players, and comments.
 * Provides demo data fallback when Supabase is not configured.
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { MatchWithComments, Comment } from '@/types'

// Demo match data with comments
const DEMO_MATCH: MatchWithComments = {
  id: '1',
  title: 'Friday Night Session',
  played_at: '2025-01-05',
  board_id: '1',
  outcome: 'bingo',
  metadata: {
    time_taken: '3h 42m',
    notes: 'Close finish between all players. Build diversity made for interesting races to different objectives.'
  },
  accolades: ['close'],
  created_at: '2025-01-05T20:30:00Z',
  updated_at: '2025-01-05T20:30:00Z',
  board: {
    id: '1',
    image_path: 'demo/board-1.png',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=800&fit=crop',
    source: 'bingo-brawlers',
    width: 800,
    height: 800,
    created_at: '2025-01-05T20:00:00Z',
  },
  match_players: [
    {
      id: '1',
      match_id: '1',
      player_id: '1',
      color: '#d4a84a',
      position: 0,
      is_winner: true,
      created_at: '2025-01-05T20:30:00Z',
        player: {
          id: '1',
          name: 'Player One',
          color: '#d4a84a',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        }
      },
      {
        id: '2',
        match_id: '1',
        player_id: '2',
        color: '#8b3a3a',
        position: 1,
        is_winner: false,
        created_at: '2025-01-05T20:30:00Z',
        player: {
          id: '2',
          name: 'Player Two',
          color: '#8b3a3a',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        }
      },
    ],
  comments: [
    {
      id: '1',
      match_id: '1',
      author_name: 'Player Two',
      content: 'Good game. The final stretch was really close.',
      created_at: '2025-01-05T21:00:00Z',
      updated_at: '2025-01-05T21:00:00Z',
    },
    {
      id: '2',
      match_id: '1',
      author_name: 'Player One',
      content: 'GG all.',
      created_at: '2025-01-05T21:15:00Z',
      updated_at: '2025-01-05T21:15:00Z',
    },
    {
      id: '3',
      match_id: '1',
      author_name: 'Spectator',
      content: 'This was a fun one to watch. The ending was tense.',
      created_at: '2025-01-06T10:30:00Z',
      updated_at: '2025-01-06T10:30:00Z',
    },
  ],
}

interface UseMatchReturn {
  match: MatchWithComments | null
  loading: boolean
  error: string | null
  refresh: () => void
  refetch: () => void
  addComment: (authorName: string, content: string) => Promise<boolean>
}

export function useMatch(matchId: string | undefined): UseMatchReturn {
  const [match, setMatch] = useState<MatchWithComments | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMatch = useCallback(async () => {
    if (!matchId) {
      setError('No match ID provided')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      
      if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
        // Check localStorage first, then demo data
        const localMatches = JSON.parse(localStorage.getItem('eldenbingo_matches') || '[]')
        const localMatch = localMatches.find((m: MatchWithComments) => m.id === matchId)
        
        if (localMatch) {
          setMatch(localMatch)
        } else if (matchId === '1' || matchId === 'demo') {
          setMatch(DEMO_MATCH)
        } else {
          setError('Match not found')
        }
        return
      }

      // Fetch match with all relations
      const { data, error: fetchError } = await supabase
        .from('matches')
        .select(`
          *,
          board:boards(*),
          match_players(
            *,
            player:players(*)
          ),
          comments(*)
        `)
        .eq('id', matchId)
        .single()

      if (fetchError) throw fetchError
      if (!data) throw new Error('Match not found')

      // Sort comments by creation date
      const typedData = data as MatchWithComments
      typedData.comments = typedData.comments.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )

      setMatch(typedData)
    } catch (err) {
      console.error('Error fetching match:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch match')
      // Fallback to demo for development
      if (matchId === '1' || matchId === 'demo') {
        setMatch(DEMO_MATCH)
        setError(null)
      }
    } finally {
      setLoading(false)
    }
  }, [matchId])

  useEffect(() => {
    fetchMatch()
  }, [fetchMatch])

  const addComment = useCallback(async (authorName: string, content: string): Promise<boolean> => {
    if (!matchId || !match) return false

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      
      if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
        // Demo mode - add comment locally and save to localStorage
        const newComment: Comment = {
          id: Date.now().toString(),
          match_id: matchId,
          author_name: authorName,
          content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        // Update local state
        setMatch(prev => {
          if (!prev) return null
          const updated = {
            ...prev,
            comments: [...prev.comments, newComment],
          }
          
          // Also update in localStorage if it's a local match
          const localMatches = JSON.parse(localStorage.getItem('eldenbingo_matches') || '[]')
          const matchIndex = localMatches.findIndex((m: MatchWithComments) => m.id === matchId)
          if (matchIndex !== -1) {
            localMatches[matchIndex] = updated
            localStorage.setItem('eldenbingo_matches', JSON.stringify(localMatches))
          }
          
          return updated
        })
        return true
      }

      // Insert into Supabase
      const { data, error: insertError } = await supabase
        .from('comments')
        .insert({
          match_id: matchId,
          author_name: authorName,
          content,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Add to local state
      setMatch(prev => prev ? {
        ...prev,
        comments: [...prev.comments, data as Comment],
      } : null)

      return true
    } catch (err) {
      console.error('Error adding comment:', err)
      return false
    }
  }, [matchId, match])

  return {
    match,
    loading,
    error,
    refresh: fetchMatch,
    refetch: fetchMatch,
    addComment,
  }
}
