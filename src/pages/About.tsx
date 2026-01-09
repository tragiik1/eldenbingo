/**
 * About page
 * 
 * Explanation of what this is and how it works.
 */

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export function About() {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container-narrow">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-heading text-3xl md:text-4xl text-parchment-100 mb-4">
            About
          </h1>
        </motion.div>

        {/* Content sections */}
        <div className="space-y-16">
          {/* What is this */}
          <Section title="What is Elden Bingo?">
            <p>
              Elden Bingo is a challenge format for Elden Ring where players race to complete 
              objectives on a randomized bingo board. The first to get a line (or full blackout) wins.
            </p>
            <p>
              Boards are generated using{' '}
              <a 
                href="https://bingobrawlers.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gold-400 hover:text-gold-300 underline underline-offset-2"
              >
                Bingo Brawlers
              </a>
              , a community tool that creates randomized challenge grids.
            </p>
          </Section>

          {/* What is this site */}
          <Section title="What is this site?">
            <p>
              This is not a bingo board generator. It does not validate rules or track rankings.
            </p>
            <p>
              This is an archive for storing and browsing completed matches. Upload your board 
              screenshots, tag players, and keep a record of past games.
            </p>
          </Section>

          {/* Features */}
          <Section title="Features">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-1">—</span>
                <span>
                  <strong className="text-parchment-200">No rankings.</strong>{' '}
                  This is not a competitive ladder. No ELO, no leaderboards.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-1">—</span>
                <span>
                  <strong className="text-parchment-200">No enforcement.</strong>{' '}
                  We don't validate whether objectives were completed.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-1">—</span>
                <span>
                  <strong className="text-parchment-200">Simple storage.</strong>{' '}
                  Upload board images, add player info and notes, browse history.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-1">—</span>
                <span>
                  <strong className="text-parchment-200">Comments.</strong>{' '}
                  Add notes to any match.
                </span>
              </li>
            </ul>
          </Section>

          {/* How to play */}
          <Section title="How to Play">
            <p className="text-shadow-500 text-sm mb-4">
              General guidelines — adapt them to your group.
            </p>
            <ol className="space-y-4 list-decimal list-inside">
              <li>
                <strong className="text-parchment-200">Generate a board</strong> on Bingo Brawlers. 
                All players use the same board.
              </li>
              <li>
                <strong className="text-parchment-200">Start fresh characters</strong> — typically 
                wretch class, no items carried over.
              </li>
              <li>
                <strong className="text-parchment-200">Race to complete objectives.</strong> First 
                to get 5 in a row wins (bingo). Or go for full blackout.
              </li>
              <li>
                <strong className="text-parchment-200">Screenshot your board</strong> when you claim 
                victory, showing completed squares.
              </li>
              <li>
                <strong className="text-parchment-200">Archive the match here</strong> to keep a record.
              </li>
            </ol>
          </Section>

          {/* Tags */}
          <Section title="Tags">
            <p>
              Matches can be tagged with optional labels for organization.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[
                'Short',
                'Long',
                'Close',
                'Comeback',
                'First Win',
                'Rematch',
                'Practice',
                'Tournament',
              ].map((label) => (
                <div 
                  key={label}
                  className="px-3 py-2 rounded-md bg-shadow-900/50 border border-shadow-800 text-sm text-parchment-400 font-ui"
                >
                  {label}
                </div>
              ))}
            </div>
          </Section>

          {/* Technical */}
          <Section title="Technical">
            <p>
              Built with React, TypeScript, and Supabase. 
              Images are stored via Supabase Storage.
            </p>
            <p>
              No account required. No tracking.
            </p>
          </Section>

          {/* Credits */}
          <Section title="Credits">
            <ul className="space-y-2 text-parchment-400">
              <li>
                Boards generated by{' '}
                <a 
                  href="https://bingobrawlers.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gold-400 hover:text-gold-300 underline underline-offset-2"
                >
                  Bingo Brawlers
                </a>
              </li>
              <li>
                Game by{' '}
                <a 
                  href="https://www.fromsoftware.jp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gold-400 hover:text-gold-300 underline underline-offset-2"
                >
                  FromSoftware
                </a>
              </li>
            </ul>
          </Section>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="w-16 h-px bg-shadow-700 mx-auto mb-8" />
          <Link to="/submit" className="btn-primary">
            Submit a Match
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

/**
 * Section component with consistent styling
 */
interface SectionProps {
  title: string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="font-heading text-xl md:text-2xl text-parchment-200 mb-4">
        {title}
      </h2>
      <div className="font-body text-parchment-400 leading-relaxed space-y-4">
        {children}
      </div>
    </motion.section>
  )
}
