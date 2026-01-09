/**
 * Home page - Archive of Trials
 * 
 * The main landing page showcasing recent matches.
 * Editorial layout with large imagery and atmospheric design.
 */

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useMatches } from '@/hooks/useMatches'
import { MatchGrid, LoadMoreButton } from '@/components/match/MatchGrid'

export function Home() {
  const { matches, loading, error, hasMore, loadMore } = useMatches({ limit: 9 })

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 bg-parchment-texture opacity-30" />
        
        {/* Content */}
        <div className="container-narrow relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Decorative element */}
            <div className="flex items-center justify-center gap-4 mb-6 text-gold-600/40">
              <span className="w-16 h-px bg-gradient-to-r from-transparent to-gold-600/40" />
              <span className="w-16 h-px bg-gradient-to-l from-transparent to-gold-600/40" />
            </div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-parchment-100 mb-4 tracking-wide text-glow">
              Elden Bingo Archive
            </h1>
            
            <p className="font-body text-xl text-parchment-400 max-w-xl mx-auto mb-8 leading-relaxed">
              A shared record of Elden Ring bingo matches.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/submit" className="btn-primary">
                Submit a Match
              </Link>
              <Link to="/gallery" className="btn-ghost">
                View Gallery
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-shadow-950 to-transparent" />
      </section>

      {/* Recent matches section */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-2">
              <h2 className="font-heading text-2xl md:text-3xl text-parchment-200">
                Recent Matches
              </h2>
              <span className="flex-1 h-px bg-gradient-to-r from-shadow-700 to-transparent" />
            </div>
            <p className="text-shadow-500 font-body">
              Recently added
            </p>
          </motion.div>

          {/* Match grid */}
          <MatchGrid 
            matches={matches} 
            loading={loading} 
            error={error} 
          />

          {/* Load more */}
          <LoadMoreButton 
            onClick={loadMore}
            loading={loading}
            hasMore={hasMore}
          />
        </div>
      </section>

      {/* Philosophy section */}
      <section className="py-16 md:py-24 border-t border-shadow-800/50">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <p className="font-body text-lg text-parchment-400 leading-relaxed max-w-2xl mx-auto">
              This is not a leaderboard. No rankings, no ELO, no competitive pressure.
              <span className="block mt-4 text-shadow-500">
                Just a place to keep track of matches played with friends.
              </span>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
