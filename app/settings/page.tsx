'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/database/client'
import { User } from '@supabase/supabase-js'

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)

      if (!user) {
        router.push('/auth/signin?redirect=/settings')
      }
    }

    getUser()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
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
          Settings
        </h1>

        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Account Settings
              </h2>
            </div>
            <div className="px-6 py-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Email</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <button className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                  Change
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Password</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">••••••••</p>
                </div>
                <button className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                  Change
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Notifications
              </h2>
            </div>
            <div className="px-6 py-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive updates about your contributions and retrospectives
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Privacy
              </h2>
            </div>
            <div className="px-6 py-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Public Profile
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Show your contributions publicly
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-red-200 dark:border-red-900">
            <div className="px-6 py-4 border-b border-red-200 dark:border-red-900">
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                Danger Zone
              </h2>
            </div>
            <div className="px-6 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Delete Account
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Permanently delete your account and all data
                  </p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
