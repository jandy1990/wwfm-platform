'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/database/client'
import { User } from '@supabase/supabase-js'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)

      if (!user) {
        router.push('/auth/signin?redirect=/profile')
      }
    }

    getUser()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Your Profile
        </h1>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          {/* Profile Header */}
          <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-semibold">
                {user.email?.[0].toUpperCase()}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {user.email}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Member since {new Date(user.created_at || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-6 py-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
              <p className="mt-1 text-base text-gray-900 dark:text-gray-100">{user.email}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Status</h3>
              <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
                {user.email_confirmed_at ? '✅ Verified' : '⚠️ Not verified'}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Account ID</h3>
              <p className="mt-1 text-sm font-mono text-gray-700 dark:text-gray-300">{user.id}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Edit Profile (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
