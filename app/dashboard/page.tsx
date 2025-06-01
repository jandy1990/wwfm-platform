// app/dashboard/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get the current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()
  }, [])

  // Handle sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/signin')
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome to WWFM! 🎉
              </h1>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Sign Out
              </button>
            </div>

            {/* User Info Card */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Your Account
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Email:</span> {user?.email}</p>
                <p><span className="font-medium">Account created:</span> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                <p><span className="font-medium">Email verified:</span> {user?.email_confirmed_at ? '✅ Yes' : '❌ Not yet'}</p>
              </div>
            </div>

            {/* Updated Browse Goals Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Start Exploring! 🚀
              </h3>
              <p className="text-blue-700 mb-4">
                Discover goals and browse solutions that have worked for others.
              </p>
              <Link 
                href="/browse" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Browse Goals →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}