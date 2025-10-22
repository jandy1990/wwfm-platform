'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/database/client'
import { User } from '@supabase/supabase-js'
import DashboardNav from '@/components/organisms/DashboardNav'
import EmptyState from '@/components/molecules/EmptyState'

export default function RetrospectivesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [retrospectiveCount, setRetrospectiveCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (!user) {
        router.push('/auth/signin?redirect=/dashboard/retrospectives')
      }
    }

    getUser()
  }, [router])

  useEffect(() => {
    if (user) {
      loadRetrospectiveCount()
    }
  }, [user])

  const loadRetrospectiveCount = async () => {
    try {
      const { getUnreadRetrospectiveCount } = await import('@/app/actions/retrospectives')
      const count = await getUnreadRetrospectiveCount()
      setRetrospectiveCount(count)
    } catch (error) {
      console.error('Error loading retrospective count:', error)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Retrospectives
            </h1>
            {retrospectiveCount > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                {retrospectiveCount} new
              </span>
            )}
          </div>

          <EmptyState
            icon="💭"
            heading="No retrospectives yet"
            subtext="We'll check in with you periodically to see how your solutions are working. Your feedback helps improve recommendations for everyone."
          />
        </div>
      </div>
    </div>
  )
}
