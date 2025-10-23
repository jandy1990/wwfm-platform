'use client'

import { useEffect, useState } from 'react'
import { getUserContributions } from '@/app/actions/dashboard-data'
import { supabase } from '@/lib/database/client'

interface Rating {
  id: string
  effectiveness_score: number
  created_at: string
  goal: { title: string; emoji: string } | null
  solution: { title: string; solution_category: string } | null
}

interface Discussion {
  id: string
  content: string
  upvotes: number
  created_at: string
  goal: { title: string; emoji: string } | null
}

export function ContributionsFeed() {
  const [userId, setUserId] = useState<string | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const data = await getUserContributions(user.id)
        setRatings(data.ratings as Rating[])
        setDiscussions(data.discussions as Discussion[])
      }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-3/4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  const totalContributions = (ratings?.length || 0) + (discussions?.length || 0)

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        🎯 Your Contributions
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Helping others find what works
      </p>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-blue-100 dark:from-purple-900/20 dark:to-blue-800/20 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {ratings?.length || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Solutions Rated</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {discussions?.length || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Discussions</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {totalContributions}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Actions</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
          Recent Activity
          {totalContributions > 5 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">(showing latest 5)</span>
          )}
        </h3>

        {ratings && ratings.length > 0 && ratings.slice(0, 5).map((rating) => (
          <div key={rating.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="text-2xl">{rating.goal?.emoji || '🎯'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                Rated "{rating.solution?.title}"
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                for "{rating.goal?.title}"
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {new Date(rating.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: new Date(rating.created_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                })}
              </div>
            </div>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-sm ${i < rating.effectiveness_score ? 'text-purple-600' : 'text-gray-300 dark:text-gray-600'}`}>
                  ⭐
                </span>
              ))}
            </div>
          </div>
        ))}

        {discussions && discussions.length > 0 && discussions.slice(0, Math.max(0, 5 - (ratings?.length || 0))).map((discussion) => (
          <div key={discussion.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="text-2xl">{discussion.goal?.emoji || '💬'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Posted discussion
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                "{discussion.content.substring(0, 60)}{discussion.content.length > 60 ? '...' : ''}"
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {new Date(discussion.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: new Date(discussion.created_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                  })}
                </div>
                {discussion.upvotes > 0 && (
                  <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-0.5">
                    <span>👍</span>
                    <span>{discussion.upvotes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {totalContributions === 0 && (
          <div className="text-center py-12 px-4">
            <div className="text-5xl mb-4">🌱</div>
            <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">
              You haven't shared anything yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Help others by rating solutions you've tried or sharing your experiences
            </p>
            <a
              href="/browse"
              className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Browse Goals
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
