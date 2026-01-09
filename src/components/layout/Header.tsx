/**
 * Site header with navigation
 * 
 * Minimal, atmospheric navigation that doesn't compete with content.
 * Logo uses a rune-inspired mark, nav items fade in on hover.
 * Includes Discord login/logout UI.
 */

import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/contexts/AuthContext'

const navItems = [
  { path: '/', label: 'Matches' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/stats', label: 'Stats' },
  { path: '/submit', label: 'Submit' },
  { path: '/about', label: 'About' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, player, loading, login, logout, discordAvatar } = useAuthContext()

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

          {/* Desktop Navigation + Auth */}
          <div className="hidden md:flex items-center gap-4">
            <nav className="flex items-center gap-1">
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

            {/* Auth UI */}
            <div className="pl-4 border-l border-shadow-800">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-shadow-800 animate-pulse" />
              ) : user && player ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-shadow-800/50 transition-colors"
                  >
                    {discordAvatar ? (
                      <img
                        src={discordAvatar}
                        alt={player.name}
                        className="w-7 h-7 rounded-full border border-shadow-700"
                      />
                    ) : (
                      <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-ui"
                        style={{ backgroundColor: player.color }}
                      >
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-parchment-300 font-ui">
                      {player.name}
                    </span>
                    <svg className={cn("w-4 h-4 text-shadow-500 transition-transform", userMenuOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User dropdown */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 py-2 bg-shadow-900 border border-shadow-800 rounded-lg shadow-xl"
                      >
                        <div className="px-4 py-2 border-b border-shadow-800">
                          <p className="text-xs text-shadow-500">Signed in as</p>
                          <p className="text-sm text-parchment-200 font-ui truncate">
                            {player.name}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false)
                            logout()
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-parchment-400 hover:bg-shadow-800 hover:text-parchment-200 transition-colors"
                        >
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-ui transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  Login
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            {/* Mobile auth indicator */}
            {!loading && user && player && discordAvatar && (
              <img
                src={discordAvatar}
                alt={player.name}
                className="w-7 h-7 rounded-full border border-shadow-700"
              />
            )}
            
            <button
              className="p-2 text-parchment-400 hover:text-gold-400 transition-colors"
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

              {/* Mobile auth */}
              <div className="pt-4 mt-4 border-t border-shadow-800">
                {loading ? (
                  <div className="px-4 py-3 text-shadow-500">Loading...</div>
                ) : user && player ? (
                  <>
                    <div className="px-4 py-2 text-sm text-shadow-500">
                      Signed in as <span className="text-parchment-300">{player.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        logout()
                      }}
                      className="block w-full px-4 py-3 text-left rounded-md font-ui text-parchment-400 hover:text-parchment-200 hover:bg-shadow-800/50 transition-all duration-300"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      login()
                    }}
                    className="flex items-center gap-2 mx-4 px-4 py-3 rounded-md bg-[#5865F2] hover:bg-[#4752C4] text-white font-ui transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    Login with Discord
                  </button>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
