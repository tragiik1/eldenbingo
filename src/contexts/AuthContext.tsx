/**
 * Auth Context Provider
 * 
 * Provides auth state to the entire app.
 * Wraps the useAuth hook in a context for easy access.
 */

import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '@supabase/supabase-js'
import type { Player } from '@/types'

interface AuthContextType {
  user: User | null
  player: Player | null
  loading: boolean
  needsSetup: boolean
  isAdmin: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  setupPlayer: (displayName: string) => Promise<void>
  discordUsername: string | null
  discordAvatar: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
