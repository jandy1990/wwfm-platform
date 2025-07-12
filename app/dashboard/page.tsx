// app/dashboard/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/database/client'
import { User } from '@supabase/supabase-js'
// import ProtectedRoute from '@/components/auth/ProtectedRoute' // Temporarily disabled
// import Link from 'next/link' // Unused for now
import EmptyState from '@/components/ui/EmptyState'

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Dashboard
              </h1>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Sign Out
              </button>
            </div>

            {/* Welcome Empty State */}
            <EmptyState
              icon="👋"
              heading="Welcome to What Worked For Me!"
              subtext="Start by browsing goals or sharing what worked for you. Join thousands discovering effective solutions."
              actionButton={{
                text: "Browse Goals",
                href: "/browse"
              }}
            />

            {/* User Info Card - Moved to bottom */}
            <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Your Account
              </h2>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p><span className="font-medium">Email:</span> {user?.email}</p>
                <p><span className="font-medium">Account created:</span> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                <p><span className="font-medium">Email verified:</span> {user?.email_confirmed_at ? '✅ Yes' : '❌ Not yet'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}