/**
 * Root layout component
 * 
 * Provides consistent structure across all pages:
 * - Atmospheric header with navigation
 * - Main content area with subtle fog effects
 * - Minimal footer
 */

import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { useAuthContext } from '@/contexts/AuthContext'

export function Layout() {
  const { user, needsSetup, loading } = useAuthContext()
  const location = useLocation()

  // Redirect to setup if logged in but no player record
  // (except when already on setup or auth callback pages)
  const isAuthPage = location.pathname === '/setup' || location.pathname === '/auth/callback'
  
  if (!loading && user && needsSetup && !isAuthPage) {
    return <Navigate to="/setup" replace />
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Ambient glow at the top */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(212, 168, 74, 0.04) 0%, transparent 70%)',
        }}
      />
      
      <Header />
      
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      
      <Footer />
      
      {/* Bottom fog effect */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-0"
        style={{
          background: 'linear-gradient(to top, rgba(10, 10, 12, 0.8) 0%, transparent 100%)',
        }}
      />
    </div>
  )
}
