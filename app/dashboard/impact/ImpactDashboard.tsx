'use client'

import { useEffect, useState } from 'react'
import { getUserImpactStats } from '@/app/actions/dashboard-data'
import { getUserPoints, type UserPointsData } from '@/app/actions/get-user-points'
import { supabase } from '@/lib/database/client'

interface ImpactStats {
  contributionPoints: number
  ratingsCount: number
  solutionsCount: number
  commentsCount: number
  helpfulVotes: number
}

export function ImpactDashboard() {
  const [stats, setStats] = useState<ImpactStats | null>(null)
  const [pointsData, setPointsData] = useState<UserPointsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const [impactData, points] = await Promise.all([
          getUserImpactStats(user.id),
          getUserPoints(user.id)
        ])
        setStats(impactData as ImpactStats)
        setPointsData(points)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const hasAnyActivity = stats && (stats.ratingsCount > 0 || stats.commentsCount > 0 || stats.solutionsCount > 0)

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border-2 border-gray-300 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        💡 Your Community Impact
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        How you're helping others
      </p>

      <div className="space-y-4">
        {/* Contribution Points - Highlighted */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">Contribution Points</span>
          </div>
          <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats?.contributionPoints?.toLocaleString() || 0}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Solutions Rated</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats?.ratingsCount || 0}
            </div>
          </div>

          <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Discussions</div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {stats?.commentsCount || 0}
            </div>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Helpful Votes</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <span>👍</span>
              <span>{stats?.helpfulVotes || 0}</span>
            </div>
          </div>

          <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Solutions Shared</div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {stats?.solutionsCount || 0}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!hasAnyActivity && (
          <div className="text-center py-8 px-4 border-t border-gray-200 dark:border-gray-700 mt-4">
            <div className="text-4xl mb-3">💭</div>
            <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">
              Start making an impact!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Share your experiences to help others learn from your journey
            </p>
            <a
              href="/browse"
              className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Browse Goals to Share
            </a>
          </div>
        )}

        {/* Encouragement for active users */}
        {hasAnyActivity && stats && pointsData?.nextMilestone && (
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800/30">
            <p className="text-sm text-purple-800 dark:text-purple-300">
              <span className="font-semibold">Keep going!</span> You're {pointsData.nextMilestone.threshold - stats.contributionPoints} points away from {pointsData.nextMilestone.emoji} {pointsData.nextMilestone.name}! 🎯
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
