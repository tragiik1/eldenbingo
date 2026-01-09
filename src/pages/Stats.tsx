/**
 * Stats page
 * 
 * Displays comprehensive statistics about all matches:
 * - Total hours played
 * - Player leaderboards
 * - Match duration stats
 * - Win streaks
 */

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useStats } from '@/hooks/useStats'
import { formatTotalTime, formatMinutesToTime, formatDateShort } from '@/lib/utils'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { OutcomeBadge } from '@/components/ui/OutcomeBadge'

export function Stats() {
  const { totalMatches, playerStats, matchDurationStats, loading, error } = useStats()

  if (loading) {
    return <PageLoader />
  }

  if (error) {
    return (
      <div className="min-h-screen py-12 md:py-20">
        <div className="container-narrow text-center">
          <h1 className="font-heading text-2xl text-parchment-300 mb-2">
            Error Loading Stats
          </h1>
          <p className="text-shadow-500">{error}</p>
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
          className="text-center mb-12"
        >
          <h1 className="font-heading text-3xl md:text-4xl text-parchment-100 mb-4">
            Statistics
          </h1>
          <p className="text-parchment-400 font-body">
            Comprehensive stats from all archived matches
          </p>
        </motion.div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card p-6 bg-gradient-to-br from-gold-600/10 to-gold-600/5 border-gold-600/20"
          >
            <h2 className="font-heading text-sm text-shadow-500 uppercase tracking-wider mb-2">
              Total Time Played
            </h2>
            <p className="font-heading text-4xl text-gold-400">
              {formatTotalTime(matchDurationStats.totalMinutes)}
            </p>
            <p className="text-sm text-shadow-500 mt-1">
              {totalMatches} {totalMatches === 1 ? 'match' : 'matches'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card p-6"
          >
            <h2 className="font-heading text-sm text-shadow-500 uppercase tracking-wider mb-2">
              Average Match Duration
            </h2>
            <p className="font-heading text-4xl text-parchment-200">
              {formatMinutesToTime(matchDurationStats.averageMinutes)}
            </p>
            <p className="text-sm text-shadow-500 mt-1">
              Across all matches with recorded time
            </p>
          </motion.div>
        </div>

        {/* Match Duration Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="font-heading text-xl text-parchment-200 mb-4">
            Match Duration Records
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Longest Match */}
            {matchDurationStats.longest ? (
              <div className="card p-6">
                <h3 className="font-heading text-sm text-shadow-500 uppercase tracking-wider mb-3">
                  Longest Match
                </h3>
                <Link
                  to={`/match/${matchDurationStats.longest.id}`}
                  className="block group"
                >
                  <p className="font-heading text-2xl text-parchment-100 group-hover:text-gold-400 transition-colors mb-2">
                    {matchDurationStats.longest.title}
                  </p>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg text-gold-400">
                      {matchDurationStats.longest.metadata.time_taken}
                    </span>
                    <OutcomeBadge outcome={matchDurationStats.longest.outcome} size="sm" />
                  </div>
                  <p className="text-sm text-shadow-500">
                    {formatDateShort(matchDurationStats.longest.played_at)}
                  </p>
                </Link>
              </div>
            ) : (
              <div className="card p-6">
                <h3 className="font-heading text-sm text-shadow-500 uppercase tracking-wider mb-3">
                  Longest Match
                </h3>
                <p className="text-shadow-500">No matches with recorded time</p>
              </div>
            )}

            {/* Shortest Match */}
            {matchDurationStats.shortest ? (
              <div className="card p-6">
                <h3 className="font-heading text-sm text-shadow-500 uppercase tracking-wider mb-3">
                  Shortest Match
                </h3>
                <Link
                  to={`/match/${matchDurationStats.shortest.id}`}
                  className="block group"
                >
                  <p className="font-heading text-2xl text-parchment-100 group-hover:text-gold-400 transition-colors mb-2">
                    {matchDurationStats.shortest.title}
                  </p>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg text-gold-400">
                      {matchDurationStats.shortest.metadata.time_taken}
                    </span>
                    <OutcomeBadge outcome={matchDurationStats.shortest.outcome} size="sm" />
                  </div>
                  <p className="text-sm text-shadow-500">
                    {formatDateShort(matchDurationStats.shortest.played_at)}
                  </p>
                </Link>
              </div>
            ) : (
              <div className="card p-6">
                <h3 className="font-heading text-sm text-shadow-500 uppercase tracking-wider mb-3">
                  Shortest Match
                </h3>
                <p className="text-shadow-500">No matches with recorded time</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Player Leaderboard */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="font-heading text-xl text-parchment-200 mb-4">
            Player Leaderboard
          </h2>
          
          {playerStats.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-shadow-500">No player data available</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-shadow-900/50 border-b border-shadow-800">
                    <tr>
                      <th className="text-left px-6 py-3 font-ui text-xs text-shadow-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="text-left px-6 py-3 font-ui text-xs text-shadow-500 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="text-right px-6 py-3 font-ui text-xs text-shadow-500 uppercase tracking-wider">
                        Wins
                      </th>
                      <th className="text-right px-6 py-3 font-ui text-xs text-shadow-500 uppercase tracking-wider">
                        Matches
                      </th>
                      <th className="text-right px-6 py-3 font-ui text-xs text-shadow-500 uppercase tracking-wider">
                        Win Rate
                      </th>
                      <th className="text-right px-6 py-3 font-ui text-xs text-shadow-500 uppercase tracking-wider">
                        Total Time
                      </th>
                      <th className="text-right px-6 py-3 font-ui text-xs text-shadow-500 uppercase tracking-wider">
                        Avg Duration
                      </th>
                      <th className="text-right px-6 py-3 font-ui text-xs text-shadow-500 uppercase tracking-wider">
                        Win Streak
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-shadow-800">
                    {playerStats.map((player, index) => (
                      <motion.tr
                        key={player.playerId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                        className="hover:bg-shadow-900/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-heading text-lg text-parchment-300">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: player.playerColor }}
                            />
                            <span className="font-ui text-parchment-200">
                              {player.playerName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-heading text-gold-400">
                            {player.wins}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-parchment-400">
                          {player.matches}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-parchment-300 font-ui">
                            {player.winRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-parchment-400 text-sm">
                          {formatTotalTime(player.totalMinutes)}
                        </td>
                        <td className="px-6 py-4 text-right text-parchment-400 text-sm">
                          {formatMinutesToTime(player.avgMinutes)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-gold-400 font-ui font-medium">
                              {player.currentStreak > 0 ? `🔥 ${player.currentStreak}` : '—'}
                            </span>
                            {player.longestStreak > player.currentStreak && (
                              <span className="text-xs text-shadow-500">
                                Best: {player.longestStreak}
                              </span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  )
}
