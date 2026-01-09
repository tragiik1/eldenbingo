/**
 * Auth Callback page
 * 
 * Handles the OAuth redirect from Discord.
 * Shows a loading state while processing the auth callback.
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { PageLoader } from '@/components/ui/LoadingSpinner'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase handles the callback automatically
    // We just need to wait for the session to be established
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth callback error:', error)
        navigate('/?error=auth_failed')
        return
      }

      if (session) {
        // Check if user has a player record
        const { data: player } = await supabase
          .from('players')
          .select('id')
          .eq('user_id', session.user.id)
          .single()

        if (player) {
          // Existing user, go home
          navigate('/')
        } else {
          // New user, needs profile setup
          navigate('/setup')
        }
      } else {
        // No session, go home
        navigate('/')
      }
    }

    // Small delay to ensure Supabase has processed the callback
    const timer = setTimeout(handleCallback, 500)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <PageLoader />
        <p className="mt-4 text-parchment-400 font-body">
          Completing login...
        </p>
      </div>
    </div>
  )
}
