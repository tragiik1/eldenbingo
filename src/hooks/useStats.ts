/**
 * Hook for calculating statistics from all matches
 * 
 * Fetches all matches and calculates:
 * - Total hours played
 * - Player leaderboards
 * - Match duration stats
 * - Win streaks
 */

import { useState, useEffect, useCallback } from 'react'
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

// Chart data types
export interface WinsOverTimeDataPoint {
  date: string
  [playerName: string]: string | number // date + player names with cumulative wins
}

export interface MonthlyActivityDataPoint {
  month: string
  matches: number
}

export interface ChartData {
  winsOverTime: WinsOverTimeDataPoint[]
  monthlyActivity: MonthlyActivityDataPoint[]
  playerColors: Record<string, string>
}

export interface Stats {
  totalHours: number
  totalMatches: number
  playerStats: PlayerStats[]
  matchDurationStats: MatchDurationStats
  chartData: ChartData
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useStats(): Stats {
  const [stats, setStats] = useState<Omit<Stats, 'refetch'>>({
    totalHours: 0,
    totalMatches: 0,
    playerStats: [],
    matchDurationStats: {
      longest: null,
      shortest: null,
      averageMinutes: 0,
      totalMinutes: 0,
    },
    chartData: {
      winsOverTime: [],
      monthlyActivity: [],
      playerColors: {},
    },
    loading: true,
    error: null,
  })

  const fetchAndCalculateStats = useCallback(async () => {
    setStats(prev => ({ ...prev, loading: true, error: null }))
    
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
  }, [])

  useEffect(() => {
    fetchAndCalculateStats()
  }, [fetchAndCalculateStats])

  return { ...stats, refetch: fetchAndCalculateStats }
}

function calculateStats(matches: MatchWithDetails[]): Omit<Stats, 'loading' | 'error' | 'refetch'> {
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

  // Calculate chart data
  const chartData = calculateChartData(matches, playerMap)

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
    chartData,
  }
}

function calculateChartData(
  matches: MatchWithDetails[],
  playerMap: Map<string, PlayerStats>
): ChartData {
  // Sort matches by date (oldest first)
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
  )

  // Get all player names and colors
  const playerColors: Record<string, string> = {}
  playerMap.forEach(player => {
    playerColors[player.playerName] = player.playerColor
  })

  // Calculate cumulative wins over time
  const cumulativeWins: Record<string, number> = {}
  const winsOverTime: WinsOverTimeDataPoint[] = []
  
  // Group matches by date to avoid duplicate dates
  const matchesByDate = new Map<string, MatchWithDetails[]>()
  sortedMatches.forEach(match => {
    const date = match.played_at.split('T')[0]
    if (!matchesByDate.has(date)) {
      matchesByDate.set(date, [])
    }
    matchesByDate.get(date)!.push(match)
  })

  // Process each date
  matchesByDate.forEach((dayMatches, date) => {
    dayMatches.forEach(match => {
      match.match_players.forEach(mp => {
        const playerName = mp.player.name
        if (!cumulativeWins[playerName]) {
          cumulativeWins[playerName] = 0
        }
        if (mp.is_winner) {
          cumulativeWins[playerName]++
        }
      })
    })

    // Create data point for this date
    const dataPoint: WinsOverTimeDataPoint = { date }
    Object.entries(cumulativeWins).forEach(([name, wins]) => {
      dataPoint[name] = wins
    })
    winsOverTime.push(dataPoint)
  })

  // Calculate monthly activity
  const monthlyMap = new Map<string, number>()
  sortedMatches.forEach(match => {
    const date = new Date(match.played_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1)
  })

  const monthlyActivity: MonthlyActivityDataPoint[] = Array.from(monthlyMap.entries())
    .map(([month, matches]) => ({
      month: formatMonth(month),
      matches,
    }))

  return {
    winsOverTime,
    monthlyActivity,
    playerColors,
  }
}

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}
