/**
 * Hook for fetching matches list
 * 
 * Provides paginated access to matches with their related data.
 * Includes demo data fallback when Supabase is not configured.
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { MatchWithDetails } from '@/types'

// Demo data for development/preview
const DEMO_MATCHES: MatchWithDetails[] = [
  {
    id: '1',
    title: 'Friday Night Session',
    played_at: '2025-01-05',
    board_id: '1',
    outcome: 'bingo',
    metadata: {
      time_taken: '3h 42m',
      notes: 'Close finish between all players.'
    },
    accolades: ['close'],
    created_at: '2025-01-05T20:30:00Z',
    updated_at: '2025-01-05T20:30:00Z',
    board: {
      id: '1',
      image_path: 'demo/board-1.png',
      image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=600&fit=crop',
      source: 'bingo-brawlers',
      width: 600,
      height: 600,
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
  },
  {
    id: '2',
    title: 'Weekend Speedrun Attempt',
    played_at: '2025-01-02',
    board_id: '2',
    outcome: 'abandoned',
    metadata: {
      time_taken: '5h 12m',
      notes: 'Ran out of time before finishing.'
    },
    accolades: ['short'],
    created_at: '2025-01-02T18:00:00Z',
    updated_at: '2025-01-02T18:00:00Z',
    board: {
      id: '2',
      image_path: 'demo/board-2.png',
      image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=600&fit=crop',
      source: 'bingo-brawlers',
      width: 600,
      height: 600,
      created_at: '2025-01-02T17:00:00Z',
    },
    match_players: [
      {
        id: '3',
        match_id: '2',
        player_id: '1',
        color: '#4a7c59',
        position: 0,
        is_winner: false,
        created_at: '2025-01-02T18:00:00Z',
        player: {
          id: '1',
          name: 'Player One',
          color: '#d4a84a',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        }
      },
      {
        id: '4',
        match_id: '2',
        player_id: '3',
        color: '#6b7db3',
        position: 1,
        is_winner: false,
        created_at: '2025-01-02T18:00:00Z',
        player: {
          id: '3',
          name: 'Player Three',
          color: '#6b7db3',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        }
      },
    ],
  },
  {
    id: '3',
    title: 'Full Board Challenge',
    played_at: '2024-12-28',
    board_id: '3',
    outcome: 'blackout',
    metadata: {
      time_taken: '8h 03m',
      notes: 'Long session but completed the full blackout.'
    },
    accolades: ['long'],
    created_at: '2024-12-28T22:00:00Z',
    updated_at: '2024-12-28T22:00:00Z',
    board: {
      id: '3',
      image_path: 'demo/board-3.png',
      image_url: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=600&h=600&fit=crop',
      source: 'bingo-brawlers',
      width: 600,
      height: 600,
      created_at: '2024-12-28T14:00:00Z',
    },
    match_players: [
      {
        id: '5',
        match_id: '3',
        player_id: '2',
        color: '#c45c26',
        position: 0,
        is_winner: true,
        created_at: '2024-12-28T22:00:00Z',
        player: {
          id: '2',
          name: 'Player Two',
          color: '#8b3a3a',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        }
      },
      {
        id: '6',
        match_id: '3',
        player_id: '1',
        color: '#5a8fa8',
        position: 1,
        is_winner: false,
        created_at: '2024-12-28T22:00:00Z',
        player: {
          id: '1',
          name: 'Player One',
          color: '#d4a84a',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        }
      },
    ],
  },
]

interface UseMatchesOptions {
  limit?: number
  offset?: number
}

interface UseMatchesReturn {
  matches: MatchWithDetails[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
  refresh: () => void
}

export function useMatches(options: UseMatchesOptions = {}): UseMatchesReturn {
  const { limit = 10, offset = 0 } = options
  
  const [matches, setMatches] = useState<MatchWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentOffset, setCurrentOffset] = useState(offset)

  const fetchMatches = useCallback(async (fetchOffset: number, append = false) => {
    setLoading(true)
    setError(null)

    try {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      
      if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
        // Use localStorage + demo data
        const localMatches = JSON.parse(localStorage.getItem('eldenbingo_matches') || '[]')
        const allMatches = [...localMatches, ...DEMO_MATCHES]
        const slice = allMatches.slice(fetchOffset, fetchOffset + limit)
        setMatches(prev => append ? [...prev, ...slice] : slice)
        setHasMore(fetchOffset + limit < allMatches.length)
        return
      }

      // Fetch from Supabase with relations
      const { data, error: fetchError } = await supabase
        .from('matches')
        .select(`
          *,
          board:boards(*),
          match_players(
            *,
            player:players(*)
          )
        `)
        .order('played_at', { ascending: false })
        .range(fetchOffset, fetchOffset + limit - 1)

      if (fetchError) throw fetchError

      const typedData = data as MatchWithDetails[]
      setMatches(prev => append ? [...prev, ...typedData] : typedData)
      setHasMore(typedData.length === limit)
    } catch (err) {
      console.error('Error fetching matches:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch matches')
      // Fallback to demo data on error
      setMatches(DEMO_MATCHES.slice(0, limit))
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchMatches(offset)
  }, [fetchMatches, offset])

  const loadMore = useCallback(() => {
    const newOffset = currentOffset + limit
    setCurrentOffset(newOffset)
    fetchMatches(newOffset, true)
  }, [currentOffset, limit, fetchMatches])

  const refresh = useCallback(() => {
    setCurrentOffset(0)
    fetchMatches(0)
  }, [fetchMatches])

  return {
    matches,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  }
}
