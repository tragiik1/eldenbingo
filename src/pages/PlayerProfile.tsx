/**
 * Player Profile page
 * 
 * Shows player stats, achievements, match history, and head-to-head records.
 */

import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePlayerProfile } from '@/hooks/usePlayerProfile'
import { useAuthContext } from '@/contexts/AuthContext'
import { formatTotalTime, formatMinutesToTime, formatDateShort, cn } from '@/lib/utils'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { OutcomeBadge } from '@/components/ui/OutcomeBadge'
import type { PlayerAchievement } from '@/types'

export function PlayerProfile() {
  const { id } = useParams<{ id: string }>()
  const { player: currentPlayer } = useAuthContext()
  const { player, matches, stats, achievements, headToHead, loading, error } = usePlayerProfile(id)

  const isOwnProfile = currentPlayer?.id === id

  if (loading) {
    return <PageLoader />
  }

  if (error || !player) {
    return (
      <div className="min-h-screen py-12 md:py-20">
        <div className="container-narrow text-center">
          <h1 className="font-heading text-2xl text-parchment-300 mb-2">
            Player Not Found
          </h1>
          <p className="text-shadow-500 mb-6">{error || 'This player does not exist.'}</p>
          <Link to="/stats" className="btn-ghost">
            View Leaderboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container-wide">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center gap-6 mb-12"
        >
          {/* Avatar */}
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-heading border-4"
            style={{ 
              backgroundColor: player.color + '30',
              borderColor: player.color,
            }}
          >
            {player.avatar_url ? (
              <img 
                src={player.avatar_url} 
                alt={player.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              player.name.charAt(0).toUpperCase()
            )}
          </div>

          {/* Name & basic stats */}
          <div className="text-center md:text-left">
            <h1 className="font-heading text-3xl md:text-4xl text-parchment-100 mb-2">
              {player.name}
              {isOwnProfile && (
                <span className="ml-3 text-sm font-ui text-gold-400 bg-gold-600/20 px-2 py-1 rounded">
                  You
                </span>
              )}
            </h1>
            <p className="text-parchment-400">
              {stats.totalMatches} matches played · {stats.wins} wins
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} highlight />
          <StatCard label="Total Wins" value={stats.wins.toString()} />
          <StatCard label="Current Streak" value={stats.currentStreak > 0 ? stats.currentStreak.toString() : '—'} highlight={stats.currentStreak > 0} showFlame={stats.currentStreak > 0} />
          <StatCard label="Best Streak" value={stats.longestStreak.toString()} />
          <StatCard label="Total Time" value={formatTotalTime(stats.totalMinutes)} />
          <StatCard label="Avg Duration" value={formatMinutesToTime(stats.avgMinutes)} />
          <StatCard label="Bingo Wins" value={stats.bingoWins.toString()} />
          <StatCard label="Blackout Wins" value={stats.blackoutWins.toString()} />
        </motion.div>

        {/* Achievements */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="font-heading text-xl text-parchment-200 mb-4">
            Achievements ({achievements.length})
          </h2>
          
          {achievements.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-shadow-500">No achievements yet. Keep playing!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {achievements.map((achievement) => (
                <AchievementCard key={achievement.achievement.id} achievement={achievement} />
              ))}
            </div>
          )}
        </motion.section>

        {/* Head to Head */}
        {headToHead.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="font-heading text-xl text-parchment-200 mb-4">
              Head-to-Head Records
            </h2>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-shadow-900/50 border-b border-shadow-800">
                    <tr>
                      <th className="text-left px-6 py-3 font-ui text-xs text-shadow-500 uppercase tracking-wider">
                        Opponent
                      </th>
                      <th className="text-center px-6 py-3 font-ui text-xs text-shadow-500 uppercase tracking-wider">
                        Record
                      </th>
                      <th className="text-right px-6 py-3 font-ui text-xs text-shadow-500 uppercase tracking-wider">
                        Games
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-shadow-800">
                    {headToHead.map((record) => (
                      <tr key={record.opponent.id} className="hover:bg-shadow-900/30 transition-colors">
                        <td className="px-6 py-4">
                          <Link 
                            to={`/player/${record.opponent.id}`}
                            className="flex items-center gap-3 hover:text-gold-400 transition-colors"
                          >
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: record.opponent.color }}
                            />
                            <span className="font-ui text-parchment-200">
                              {record.opponent.name}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "font-heading text-lg",
                            record.wins > record.losses ? "text-green-400" :
                            record.wins < record.losses ? "text-red-400" :
                            "text-parchment-400"
                          )}>
                            {record.wins} - {record.losses}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-parchment-400">
                          {record.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        )}

        {/* Recent Matches */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="font-heading text-xl text-parchment-200 mb-4">
            Match History
          </h2>
          
          {matches.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-shadow-500">No matches yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.slice(0, 10).map((match) => {
                const myRecord = match.match_players.find(mp => mp.player_id === id)
                const isWin = myRecord?.is_winner

                return (
                  <Link
                    key={match.id}
                    to={`/match/${match.id}`}
                    className="card p-4 flex items-center gap-4 hover:border-shadow-600 transition-colors group"
                  >
                    {/* Win/Loss indicator */}
                    <div className={cn(
                      "w-2 h-12 rounded-full",
                      isWin ? "bg-green-500" : "bg-red-500/50"
                    )} />

                    {/* Match info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-parchment-200 group-hover:text-gold-400 transition-colors truncate">
                        {match.title}
                      </h3>
                      <p className="text-sm text-shadow-500">
                        {formatDateShort(match.played_at)}
                        {match.metadata?.time_taken && ` · ${match.metadata.time_taken}`}
                      </p>
                    </div>

                    {/* Outcome */}
                    <div className="flex items-center gap-3">
                      <OutcomeBadge outcome={match.outcome} size="sm" />
                      <span className={cn(
                        "font-ui text-sm",
                        isWin ? "text-green-400" : "text-shadow-500"
                      )}>
                        {isWin ? 'WIN' : 'LOSS'}
                      </span>
                    </div>
                  </Link>
                )
              })}

              {matches.length > 10 && (
                <p className="text-center text-sm text-shadow-500 py-4">
                  Showing 10 of {matches.length} matches
                </p>
              )}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  )
}

function StatCard({ label, value, highlight = false, showFlame = false }: { label: string; value: string; highlight?: boolean; showFlame?: boolean }) {
  return (
    <div className={cn(
      "card p-4 text-center",
      highlight && "border-gold-600/20 bg-gold-600/5"
    )}>
      <p className="text-xs text-shadow-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={cn(
        "font-heading text-xl inline-flex items-center justify-center gap-1.5",
        highlight ? "text-gold-400" : "text-parchment-200"
      )}>
        {showFlame && (
          <img src="/messmer-flame.png" alt="" className="w-5 h-5 object-contain" />
        )}
        {value}
      </p>
    </div>
  )
}

function AchievementCard({ achievement }: { achievement: PlayerAchievement }) {
  const { achievement: ach, unlockedAt } = achievement

  const rarityStyles = {
    common: {
      border: 'border-shadow-600',
      bg: 'bg-shadow-800/50',
      text: 'text-parchment-400',
      glow: '',
    },
    rare: {
      border: 'border-blue-500/40',
      bg: 'bg-blue-500/8',
      text: 'text-blue-400',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.1)]',
    },
    epic: {
      border: 'border-purple-500/40',
      bg: 'bg-purple-500/8',
      text: 'text-purple-400',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.1)]',
    },
    legendary: {
      border: 'border-gold-500/50',
      bg: 'bg-gold-500/10',
      text: 'text-gold-400',
      glow: 'shadow-[0_0_25px_rgba(212,168,74,0.15)]',
    },
  }

  const style = rarityStyles[ach.rarity]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "card p-4 border transition-all duration-300 hover:scale-[1.02]",
        style.border,
        style.bg,
        style.glow
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className={cn("font-heading text-sm", style.text)}>
          {ach.name}
        </h3>
        <span className={cn(
          "text-[10px] font-ui uppercase tracking-wider px-1.5 py-0.5 rounded",
          ach.rarity === 'legendary' && "bg-gold-500/20 text-gold-400",
          ach.rarity === 'epic' && "bg-purple-500/20 text-purple-400",
          ach.rarity === 'rare' && "bg-blue-500/20 text-blue-400",
          ach.rarity === 'common' && "bg-shadow-700 text-shadow-400"
        )}>
          {ach.rarity}
        </span>
      </div>
      <p className="text-xs text-shadow-500 mb-2 leading-relaxed">{ach.description}</p>
      {unlockedAt && (
        <p className="text-[10px] text-shadow-600 font-ui">
          Unlocked {formatDateShort(unlockedAt)}
        </p>
      )}
    </motion.div>
  )
}
