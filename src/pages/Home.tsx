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
      <section className="relative py-16 md:py-28 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-parchment-texture opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-gold-600/[0.02] via-transparent to-transparent" />
        
        {/* Content */}
        <div className="container-narrow relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center"
          >
            {/* Decorative line */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-24 h-px mx-auto mb-8 bg-gradient-to-r from-transparent via-gold-600/40 to-transparent"
            />

            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-parchment-100 mb-4 tracking-wide">
              Elden Bingo Archive
            </h1>
            
            <p className="font-body text-lg text-parchment-400 max-w-md mx-auto mb-10">
              A shared record of Elden Ring bingo matches.
            </p>

            {/* CTA buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              <Link to="/submit" className="btn-primary">
                Submit Match
              </Link>
              <Link to="/stats" className="btn-secondary">
                View Stats
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-shadow-950 to-transparent" />
      </section>

      {/* Recent matches section */}
      <section className="py-12 md:py-20">
        <div className="container-wide">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="font-heading text-xl md:text-2xl text-parchment-200">
                Recent Matches
              </h2>
              <p className="text-sm text-shadow-500 font-ui mt-1">
                Latest entries
              </p>
            </div>
            <Link 
              to="/gallery" 
              className="text-sm font-ui text-parchment-400 hover:text-gold-400 transition-colors"
            >
              View all
            </Link>
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

      {/* Footer tagline */}
      <section className="py-12 border-t border-shadow-800/30">
        <div className="container-narrow">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center font-body text-parchment-500 text-sm"
          >
            Track your matches. Remember the suffering.
          </motion.p>
        </div>
      </section>
    </div>
  )
}
