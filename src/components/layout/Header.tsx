/**
 * Site header with navigation
 * 
 * Minimal, atmospheric navigation that doesn't compete with content.
 * Logo uses a rune-inspired mark, nav items fade in on hover.
 */

import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', label: 'Matches' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/stats', label: 'Stats' },
  { path: '/submit', label: 'Submit' },
  { path: '/about', label: 'About' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-shadow-950/80 backdrop-blur-md border-b border-shadow-800/50">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
          >
            {/* Rune-inspired logo mark */}
            <div className="relative w-8 h-8">
              <svg 
                viewBox="0 0 32 32" 
                className="w-full h-full text-gold-500 transition-all duration-500 group-hover:text-gold-400"
                fill="currentColor"
              >
                <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
                <g opacity="0.9">
                  <rect x="9" y="9" width="5" height="5" rx="0.5"/>
                  <rect x="14" y="9" width="5" height="5" rx="0.5"/>
                  <rect x="19" y="9" width="5" height="5" rx="0.5"/>
                  <rect x="9" y="14" width="5" height="5" rx="0.5"/>
                  <rect x="14" y="14" width="5" height="5" rx="0.5"/>
                  <rect x="19" y="14" width="5" height="5" rx="0.5"/>
                  <rect x="9" y="19" width="5" height="5" rx="0.5"/>
                  <rect x="14" y="19" width="5" height="5" rx="0.5"/>
                  <rect x="19" y="19" width="5" height="5" rx="0.5"/>
                </g>
              </svg>
              {/* Subtle glow on hover */}
              <div className="absolute inset-0 rounded-full bg-gold-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            
            <span className="font-heading text-lg tracking-widest text-parchment-200 group-hover:text-gold-400 transition-colors duration-300">
              ELDEN BINGO
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  'px-4 py-2 rounded-md font-ui text-sm tracking-wide transition-all duration-300',
                  isActive 
                    ? 'text-gold-400 bg-gold-500/10' 
                    : 'text-parchment-400 hover:text-parchment-200 hover:bg-shadow-800/50'
                )}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-parchment-400 hover:text-gold-400 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-shadow-800/50 bg-shadow-950/95 backdrop-blur-md overflow-hidden"
          >
            <div className="container-wide py-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => cn(
                    'block px-4 py-3 rounded-md font-ui tracking-wide transition-all duration-300',
                    isActive 
                      ? 'text-gold-400 bg-gold-500/10' 
                      : 'text-parchment-400 hover:text-parchment-200 hover:bg-shadow-800/50'
                  )}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
