/**
 * Hook for calculating statistics from all matches
 * 
 * Fetches all matches and calculates:
 * - Total hours played
 * - Player leaderboards
 * - Match duration stats
 * - Win streaks
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { parseTimeToMinutes } from '@/lib/utils'
import type { MatchWithDetails } from '@/types'

export interface PlayerStats {
  playerId: string
  playerName: string
  playerColor: string
  wins: number
  matches: number
  winRate: number
  totalMinutes: number
  avgMinutes: number
  currentStreak: number
  longestStreak: number
}

export interface MatchDurationStats {
  longest: MatchWithDetails | null
  shortest: MatchWithDetails | null
  averageMinutes: number
  totalMinutes: number
}

export interface Stats {
  totalHours: number
  totalMatches: number
  playerStats: PlayerStats[]
  matchDurationStats: MatchDurationStats
  loading: boolean
  error: string | null
}

export function useStats(): Stats {
  const [stats, setStats] = useState<Stats>({
    totalHours: 0,
    totalMatches: 0,
    playerStats: [],
    matchDurationStats: {
      longest: null,
      shortest: null,
      averageMinutes: 0,
      totalMinutes: 0,
    },
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function fetchAndCalculateStats() {
      try {
        // Check if Supabase is configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        
        let allMatches: MatchWithDetails[] = []
        
        if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
          // Use localStorage matches
          const localMatches = JSON.parse(localStorage.getItem('eldenbingo_matches') || '[]')
          allMatches = localMatches
        } else {
          // Fetch all matches from Supabase
          const { data, error } = await supabase
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

          if (error) throw error
          allMatches = (data || []) as MatchWithDetails[]
        }

        // Calculate stats
        const calculated = calculateStats(allMatches)
        setStats({
          ...calculated,
          loading: false,
          error: null,
        })
      } catch (err) {
        console.error('Error calculating stats:', err)
        setStats(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to calculate stats',
        }))
      }
    }

    fetchAndCalculateStats()
  }, [])

  return stats
}

function calculateStats(matches: MatchWithDetails[]): Omit<Stats, 'loading' | 'error'> {
  // Player stats map
  const playerMap = new Map<string, PlayerStats>()
  
  // Match duration tracking
  let totalMinutes = 0
  let matchesWithTime = 0
  let longestMatch: MatchWithDetails | null = null
  let shortestMatch: MatchWithDetails | null = null
  let longestMinutes = 0
  let shortestMinutes = Infinity

  // Track win streaks (player -> array of match outcomes in chronological order)
  const playerMatchHistory = new Map<string, Array<{ date: string; isWin: boolean }>>()

  // Process each match
  matches.forEach(match => {
    // Process match duration
    if (match.metadata.time_taken) {
      const minutes = parseTimeToMinutes(match.metadata.time_taken)
      if (minutes > 0) {
        totalMinutes += minutes
        matchesWithTime++
        
        if (minutes > longestMinutes) {
          longestMinutes = minutes
          longestMatch = match
        }
        if (minutes < shortestMinutes) {
          shortestMinutes = minutes
          shortestMatch = match
        }
      }
    }

    // Process players
    match.match_players.forEach(mp => {
      const playerId = mp.player.id
      const playerName = mp.player.name
      const playerColor = mp.player.color
      const isWin = mp.is_winner === true
      const matchMinutes = match.metadata.time_taken 
        ? parseTimeToMinutes(match.metadata.time_taken) 
        : 0

      // Initialize player stats if needed
      if (!playerMap.has(playerId)) {
        playerMap.set(playerId, {
          playerId,
          playerName,
          playerColor,
          wins: 0,
          matches: 0,
          winRate: 0,
          totalMinutes: 0,
          avgMinutes: 0,
          currentStreak: 0,
          longestStreak: 0,
        })
      }

      const playerStat = playerMap.get(playerId)!
      playerStat.matches++
      if (isWin) {
        playerStat.wins++
      }
      if (matchMinutes > 0) {
        playerStat.totalMinutes += matchMinutes
      }

      // Track match history for streaks
      if (!playerMatchHistory.has(playerId)) {
        playerMatchHistory.set(playerId, [])
      }
      playerMatchHistory.get(playerId)!.push({
        date: match.played_at,
        isWin,
      })
    })
  })

  // Calculate win rates and averages
  playerMap.forEach(stat => {
    stat.winRate = stat.matches > 0 ? (stat.wins / stat.matches) * 100 : 0
    stat.avgMinutes = stat.matches > 0 ? stat.totalMinutes / stat.matches : 0
  })

  // Calculate streaks
  playerMatchHistory.forEach((history, playerId) => {
    // Sort by date (oldest first)
    history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    // Go through history and calculate streaks
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].isWin) {
        tempStreak++
        if (i === history.length - 1) {
          currentStreak = tempStreak
        }
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    const playerStat = playerMap.get(playerId)
    if (playerStat) {
      playerStat.currentStreak = currentStreak
      playerStat.longestStreak = longestStreak
    }
  })

  // Convert to array and sort by wins (then matches, then name)
  const playerStats = Array.from(playerMap.values()).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins
    if (b.matches !== a.matches) return b.matches - a.matches
    return a.playerName.localeCompare(b.playerName)
  })

  return {
    totalHours: totalMinutes / 60,
    totalMatches: matches.length,
    playerStats,
    matchDurationStats: {
      longest: longestMatch,
      shortest: shortestMatch,
      averageMinutes: matchesWithTime > 0 ? totalMinutes / matchesWithTime : 0,
      totalMinutes,
    },
  }
}
