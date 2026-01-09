/**
 * Hook for fetching player profile data and calculating achievements
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { parseTimeToMinutes } from '@/lib/utils'
import { ACHIEVEMENTS, type Player, type MatchWithDetails, type PlayerAchievement } from '@/types'

export interface PlayerProfile {
  player: Player | null
  matches: MatchWithDetails[]
  stats: {
    totalMatches: number
    wins: number
    losses: number
    winRate: number
    totalMinutes: number
    avgMinutes: number
    currentStreak: number
    longestStreak: number
    blackoutWins: number
    bingoWins: number
  }
  achievements: PlayerAchievement[]
  headToHead: Array<{
    opponent: Player
    wins: number
    losses: number
    total: number
  }>
  loading: boolean
  error: string | null
  refetch: () => void
}

export function usePlayerProfile(playerId: string | undefined): PlayerProfile {
  const [profile, setProfile] = useState<Omit<PlayerProfile, 'refetch'>>({
    player: null,
    matches: [],
    stats: {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalMinutes: 0,
      avgMinutes: 0,
      currentStreak: 0,
      longestStreak: 0,
      blackoutWins: 0,
      bingoWins: 0,
    },
    achievements: [],
    headToHead: [],
    loading: true,
    error: null,
  })

  const fetchProfile = useCallback(async () => {
    if (!playerId) {
      setProfile(prev => ({ ...prev, loading: false, error: 'No player ID' }))
      return
    }

    setProfile(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Check Supabase config
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
        // Demo mode - show empty profile
        setProfile(prev => ({
          ...prev,
          loading: false,
          error: 'Demo mode - no profile data',
        }))
        return
      }

      // Fetch player
      const { data: player, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single()

      if (playerError) throw playerError

      // Fetch all matches this player participated in
      const { data: matchPlayers, error: matchPlayersError } = await supabase
        .from('match_players')
        .select(`
          *,
          match:matches(
            *,
            board:boards(*),
            match_players(
              *,
              player:players(*)
            )
          )
        `)
        .eq('player_id', playerId)
        .order('created_at', { ascending: false })

      if (matchPlayersError) throw matchPlayersError

      // Extract matches and calculate stats
      const matches = matchPlayers
        .map(mp => mp.match as MatchWithDetails)
        .filter(Boolean)

      const stats = calculateStats(matches, matchPlayers)
      const achievements = calculateAchievements(matchPlayers, stats)
      const headToHead = calculateHeadToHead(playerId!, matches)

      setProfile({
        player: player as Player,
        matches,
        stats,
        achievements,
        headToHead,
        loading: false,
        error: null,
      })
    } catch (err) {
      console.error('Error fetching player profile:', err)
      setProfile(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load profile',
      }))
    }
  }, [playerId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { ...profile, refetch: fetchProfile }
}

function calculateStats(
  matches: MatchWithDetails[],
  matchPlayers: Array<{ is_winner?: boolean; match: MatchWithDetails }>
) {
  let wins = 0
  let blackoutWins = 0
  let bingoWins = 0
  let totalMinutes = 0
  let matchesWithTime = 0
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  // Sort by date for streak calculation
  const sortedMatchPlayers = [...matchPlayers].sort(
    (a, b) => new Date(a.match.played_at).getTime() - new Date(b.match.played_at).getTime()
  )

  sortedMatchPlayers.forEach(mp => {
    const isWin = mp.is_winner === true

    if (isWin) {
      wins++
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)

      if (mp.match.outcome === 'blackout') blackoutWins++
      if (mp.match.outcome === 'bingo') bingoWins++
    } else {
      tempStreak = 0
    }

    if (mp.match.metadata?.time_taken) {
      const minutes = parseTimeToMinutes(mp.match.metadata.time_taken)
      if (minutes > 0) {
        totalMinutes += minutes
        matchesWithTime++
      }
    }
  })

  // Calculate current streak (from most recent)
  for (let i = sortedMatchPlayers.length - 1; i >= 0; i--) {
    if (sortedMatchPlayers[i].is_winner) {
      currentStreak++
    } else {
      break
    }
  }

  const totalMatches = matches.length
  const losses = totalMatches - wins

  return {
    totalMatches,
    wins,
    losses,
    winRate: totalMatches > 0 ? (wins / totalMatches) * 100 : 0,
    totalMinutes,
    avgMinutes: matchesWithTime > 0 ? totalMinutes / matchesWithTime : 0,
    currentStreak,
    longestStreak,
    blackoutWins,
    bingoWins,
  }
}

function calculateAchievements(
  matchPlayers: Array<{ is_winner?: boolean; match: MatchWithDetails; created_at: string }>,
  stats: ReturnType<typeof calculateStats>
): PlayerAchievement[] {
  const unlocked: PlayerAchievement[] = []

  // Sort by date for achievement date tracking
  const sortedMatchPlayers = [...matchPlayers].sort(
    (a, b) => new Date(a.match.played_at).getTime() - new Date(b.match.played_at).getTime()
  )

  // Win-based achievements
  if (stats.wins >= 1) {
    const firstWin = sortedMatchPlayers.find(mp => mp.is_winner)
    unlocked.push({
      achievement: ACHIEVEMENTS.find(a => a.id === 'first-blood')!,
      unlockedAt: firstWin?.match.played_at || '',
    })
  }
  if (stats.wins >= 10) {
    unlocked.push({
      achievement: ACHIEVEMENTS.find(a => a.id === 'veteran')!,
      unlockedAt: getNthWinDate(sortedMatchPlayers, 10),
    })
  }
  if (stats.wins >= 25) {
    unlocked.push({
      achievement: ACHIEVEMENTS.find(a => a.id === 'champion')!,
      unlockedAt: getNthWinDate(sortedMatchPlayers, 25),
    })
  }
  if (stats.wins >= 50) {
    unlocked.push({
      achievement: ACHIEVEMENTS.find(a => a.id === 'legend')!,
      unlockedAt: getNthWinDate(sortedMatchPlayers, 50),
    })
  }

  // Streak-based achievements
  if (stats.longestStreak >= 3) {
    unlocked.push({
      achievement: ACHIEVEMENTS.find(a => a.id === 'hot-streak')!,
      unlockedAt: getStreakDate(sortedMatchPlayers, 3),
    })
  }
  if (stats.longestStreak >= 5) {
    unlocked.push({
      achievement: ACHIEVEMENTS.find(a => a.id === 'unstoppable')!,
      unlockedAt: getStreakDate(sortedMatchPlayers, 5),
    })
  }
  if (stats.longestStreak >= 10) {
    unlocked.push({
      achievement: ACHIEVEMENTS.find(a => a.id === 'elden-lord')!,
      unlockedAt: getStreakDate(sortedMatchPlayers, 10),
    })
  }

  // Speed-based achievements (win in under X time)
  const speedWins = sortedMatchPlayers.filter(mp => {
    if (!mp.is_winner || !mp.match.metadata?.time_taken) return false
    const minutes = parseTimeToMinutes(mp.match.metadata.time_taken)
    return minutes > 0 && minutes < 60
  })
  if (speedWins.length > 0) {
    unlocked.push({
      achievement: ACHIEVEMENTS.find(a => a.id === 'speed-demon')!,
      unlockedAt: speedWins[0].match.played_at,
    })
  }

  const lightningWins = sortedMatchPlayers.filter(mp => {
    if (!mp.is_winner || !mp.match.metadata?.time_taken) return false
    const minutes = parseTimeToMinutes(mp.match.metadata.time_taken)
    return minutes > 0 && minutes < 45
  })
  if (lightningWins.length > 0) {
    unlocked.push({
      achievement: ACHIEVEMENTS.find(a => a.id === 'lightning')!,
      unlockedAt: lightningWins[0].match.played_at,
    })
  }

  // Participation achievements
  if (stats.totalMatches >= 10) {
    unlocked.push({
      achievement: ACHIEVEMENTS.find(a => a.id === 'dedicated')!,
      unlockedAt: sortedMatchPlayers[9]?.match.played_at || '',
    })
  }
  if (stats.totalMatches >= 25) {
    unlocked.push({
      achievement: ACHIEVEMENTS.find(a => a.id === 'regular')!,
      unlockedAt: sortedMatchPlayers[24]?.match.played_at || '',
    })
  }
  if (stats.totalMatches >= 50) {
    unlocked.push({
      achievement: ACHIEVEMENTS.find(a => a.id === 'addicted')!,
      unlockedAt: sortedMatchPlayers[49]?.match.played_at || '',
    })
  }

  // Blackout achievements
  if (stats.blackoutWins >= 1) {
    const firstBlackout = sortedMatchPlayers.find(
      mp => mp.is_winner && mp.match.outcome === 'blackout'
    )
    unlocked.push({
      achievement: ACHIEVEMENTS.find(a => a.id === 'blackout-king')!,
      unlockedAt: firstBlackout?.match.played_at || '',
    })
  }
  if (stats.blackoutWins >= 5) {
    unlocked.push({
      achievement: ACHIEVEMENTS.find(a => a.id === 'perfectionist')!,
      unlockedAt: getNthBlackoutDate(sortedMatchPlayers, 5),
    })
  }

  // Survivor (3+ hour match)
  const longMatches = sortedMatchPlayers.filter(mp => {
    if (!mp.match.metadata?.time_taken) return false
    const minutes = parseTimeToMinutes(mp.match.metadata.time_taken)
    return minutes >= 180
  })
  if (longMatches.length > 0) {
    unlocked.push({
      achievement: ACHIEVEMENTS.find(a => a.id === 'survivor')!,
      unlockedAt: longMatches[0].match.played_at,
    })
  }

  return unlocked.filter(a => a.achievement) // Filter out any undefined achievements
}

function getNthWinDate(matchPlayers: Array<{ is_winner?: boolean; match: MatchWithDetails }>, n: number): string {
  let count = 0
  for (const mp of matchPlayers) {
    if (mp.is_winner) {
      count++
      if (count === n) return mp.match.played_at
    }
  }
  return ''
}

function getStreakDate(matchPlayers: Array<{ is_winner?: boolean; match: MatchWithDetails }>, streak: number): string {
  let count = 0
  for (const mp of matchPlayers) {
    if (mp.is_winner) {
      count++
      if (count === streak) return mp.match.played_at
    } else {
      count = 0
    }
  }
  return ''
}

function getNthBlackoutDate(matchPlayers: Array<{ is_winner?: boolean; match: MatchWithDetails }>, n: number): string {
  let count = 0
  for (const mp of matchPlayers) {
    if (mp.is_winner && mp.match.outcome === 'blackout') {
      count++
      if (count === n) return mp.match.played_at
    }
  }
  return ''
}

function calculateHeadToHead(
  playerId: string,
  matches: MatchWithDetails[]
): Array<{ opponent: Player; wins: number; losses: number; total: number }> {
  const opponents = new Map<string, { player: Player; wins: number; losses: number }>()

  matches.forEach(match => {
    // Find this player's match_player record
    const myRecord = match.match_players.find(mp => mp.player_id === playerId)
    if (!myRecord) return

    // Find opponents
    match.match_players
      .filter(mp => mp.player_id !== playerId)
      .forEach(opponentRecord => {
        const opponentId = opponentRecord.player_id
        const opponent = opponentRecord.player

        if (!opponents.has(opponentId)) {
          opponents.set(opponentId, { player: opponent, wins: 0, losses: 0 })
        }

        const record = opponents.get(opponentId)!
        if (myRecord.is_winner) {
          record.wins++
        } else if (opponentRecord.is_winner) {
          record.losses++
        }
      })
  })

  return Array.from(opponents.values())
    .map(({ player, wins, losses }) => ({
      opponent: player,
      wins,
      losses,
      total: wins + losses,
    }))
    .sort((a, b) => b.total - a.total)
}
