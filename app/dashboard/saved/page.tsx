'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/database/client'
import { User } from '@supabase/supabase-js'
import DashboardNav from '@/components/organisms/DashboardNav'
import EmptyState from '@/components/molecules/EmptyState'

export default function SavedPage() {
  const [user, setUser] = useState<User | null>(null)
  const [retrospectiveCount, setRetrospectiveCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (!user) {
        router.push('/auth/signin?redirect=/dashboard/saved')
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Saved Solutions
          </h1>

          <EmptyState
            icon="🔖"
            heading="No saved solutions yet"
            subtext="Bookmark solutions you want to try or remember. They'll appear here for easy access."
            actionButton={{
              text: "Browse Goals",
              href: "/browse"
            }}
          />
        </div>
      </div>
    </div>
  )
}
