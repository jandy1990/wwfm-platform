// app/dashboard/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/database/client'
import { User } from '@supabase/supabase-js'
// import ProtectedRoute from '@/components/auth/ProtectedRoute' // Temporarily disabled
// import Link from 'next/link' // Unused for now
import EmptyState from '@/components/molecules/EmptyState'
import { TimeTrackingDisplay } from './time/TimeTrackingDisplay'
import DashboardNav from '@/components/organisms/DashboardNav'
import { getMemberBadge, formatMemberNumber } from '@/lib/utils/member-badges'
import { ActivityTimeline } from './activity/ActivityTimeline'
import { ImpactDashboard } from './impact/ImpactDashboard'
import { CategoryMastery } from './mastery/CategoryMastery'
import { CelebrationModal } from './celebrations/CelebrationModal'
import { MilestonesCard } from '@/components/dashboard/MilestonesCard'
import { useCelebrations } from '@/lib/hooks/useCelebrations'
import { getUserImpactStats } from '@/app/actions/dashboard-data'
import ArenaValueInsights from '@/components/dashboard/ArenaValueInsights'
import { getArenaValueInsights, ArenaValueInsight } from '@/app/actions/get-arena-value-insights'
import YourGoals from '@/components/dashboard/YourGoals'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [retrospectiveCount, setRetrospectiveCount] = useState(0)
  const [memberNumber, setMemberNumber] = useState<number | null>(null)
  const [impactStats, setImpactStats] = useState<any>(null)
  const [arenaInsights, setArenaInsights] = useState<ArenaValueInsight[]>([])
  const router = useRouter()

  // Celebrations hook
  const { showCelebration, dismissCelebration } = useCelebrations(impactStats)

  useEffect(() => {
    // Get the current user and member number
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Fetch member number from public.users table
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('member_number')
          .eq('id', user.id)
          .single()

        if (userData?.member_number) {
          setMemberNumber(userData.member_number)
        }
      }
    }

    getUser()
  }, [])

  useEffect(() => {
    // Load retrospective count and impact stats if user is logged in
    if (user) {
      loadRetrospectiveCount()
      loadImpactStats()
      loadArenaInsights()
    } else {
      setRetrospectiveCount(0)
      setImpactStats(null)
      setArenaInsights([])
    }
  }, [user])

  const loadImpactStats = async () => {
    if (!user) return
    try {
      const stats = await getUserImpactStats(user.id)
      setImpactStats(stats)
    } catch (error) {
      console.error('Error loading impact stats:', error)
    }
  }

  const loadArenaInsights = async () => {
    if (!user) return
    try {
      const insights = await getArenaValueInsights(user.id)
      setArenaInsights(insights)
    } catch (error) {
      console.error('Error loading arena insights:', error)
    }
  }

  const loadRetrospectiveCount = async () => {
    try {
      const { getUnreadRetrospectiveCount } = await import('@/app/actions/retrospectives')
      const count = await getUnreadRetrospectiveCount()
      setRetrospectiveCount(count)
    } catch (error) {
      console.error('Error loading retrospective count:', error)
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                Dashboard
              </h1>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Sign Out
              </button>
            </div>

            {/* Milestones Card - Featured */}
            {user && (
              <div className="mb-8">
                <MilestonesCard userId={user.id} />
              </div>
            )}

            {/* Your Goals Section */}
            {user && (
              <div className="mb-8">
                <YourGoals />
              </div>
            )}

            {/* Dashboard Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <ImpactDashboard />
              <CategoryMastery />
            </div>

            <div className="mb-8">
              <ActivityTimeline />
            </div>

            {/* Time Tracking Section */}
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  Your Time Investment
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Shows where you've spent time exploring solutions across different life areas
                </p>
              </div>
              <TimeTrackingDisplay />
            </div>

            {/* Arena Value Insights */}
            {user && arenaInsights.length > 0 && (
              <div className="mb-8">
                <ArenaValueInsights insights={arenaInsights} />
              </div>
            )}

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
              <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
                Your Account
              </h2>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                {/* Member Number with Easter Egg */}
                {memberNumber && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Member:</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-semibold ${getMemberBadge(memberNumber).color || 'text-blue-600 dark:text-blue-400'}`}>
                        {formatMemberNumber(memberNumber)}
                      </span>
                      {getMemberBadge(memberNumber).emoji && (
                        <span className="text-lg" title={getMemberBadge(memberNumber).label}>
                          {getMemberBadge(memberNumber).emoji}
                        </span>
                      )}
                      {getMemberBadge(memberNumber).label && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          getMemberBadge(memberNumber).special
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {getMemberBadge(memberNumber).label}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <p><span className="font-medium">Email:</span> {user?.email}</p>
                <p><span className="font-medium">Joined:</span> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                <p><span className="font-medium">Email verified:</span> {user?.email_confirmed_at ? '✅ Yes' : '❌ Not yet'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Celebration Modal */}
        <CelebrationModal milestone={showCelebration} onDismiss={dismissCelebration} />
      </div>
  )
}