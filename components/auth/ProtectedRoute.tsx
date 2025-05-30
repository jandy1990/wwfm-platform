// components/auth/ProtectedRoute.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setAuthenticated(true)
        } else {
          // No session, redirect to signin
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth/signin')
      } finally {
        setLoading(false)
      }
    }

    // Check initial auth state
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthenticated(true)
      } else {
        router.push('/auth/signin')
      }
    })

    // Cleanup subscription
    return () => subscription.unsubscribe()
  }, [router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  // Show protected content
  return authenticated ? <>{children}</> : null
}