'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Target, TrendingUp, Clock, Award, Loader2, ChevronRight } from 'lucide-react'
import { getUserFollowedGoals, type FollowedGoal } from '@/app/actions/goal-following'
import { logger } from '@/lib/utils/logger'
import { Button } from '@/components/atoms/button'

type FilterStatus = 'all' | 'following' | 'achieved'

export default function YourGoals() {
  const [goals, setGoals] = useState<FollowedGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('all')

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    setIsLoading(true)
    try {
      const followedGoals = await getUserFollowedGoals()
      setGoals(followedGoals)
    } catch (error) {
      logger.error(
        'YourGoals: error loading goals',
        error instanceof Error ? error : { error }
      )
    } finally {
      setIsLoading(false)
    }
  }

  const filteredGoals = goals.filter((goal) => {
    if (filter === 'all') return true
    return goal.status === filter
  })

  const activeCount = goals.filter((g) => g.status === 'following').length
  const achievedCount = goals.filter((g) => g.status === 'achieved').length

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
        </div>
      </div>
    )
  }

  if (goals.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100">
            Your Goals
          </h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You're not following any goals yet.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Follow goals you're working on to track your progress and get personalized insights.
          </p>
          <Button asChild>
            <Link href="/browse">Browse Goals</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border-2 border-gray-300 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100">
            Your Goals
          </h2>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            ({goals.length})
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          All ({goals.length})
        </button>
        <button
          onClick={() => setFilter('following')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            filter === 'following'
              ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setFilter('achieved')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            filter === 'achieved'
              ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Achieved ({achievedCount})
        </button>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No {filter === 'all' ? '' : filter} goals to show
          </div>
        ) : (
          filteredGoals.map((goal) => (
            <Link
              key={goal.id}
              href={`/goal/${goal.goalId}`}
              className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Goal Title */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{goal.goalEmoji}</span>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                      {goal.goalTitle}
                    </h3>
                    {goal.status === 'achieved' && (
                      <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {goal.arenaName}
                    </span>
                    <span>{goal.categoryName}</span>
                    {goal.lastActiveAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Active {getTimeAgo(goal.lastActiveAt)}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {goal.solutionCount} solutions
                      </span>
                    </div>
                    {goal.ratedSolutionCount > 0 && (
                      <div>
                        <span className="text-purple-600 dark:text-purple-400 font-medium">
                          {goal.ratedSolutionCount} rated
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chevron */}
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-shrink-0 transition-colors" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

/**
 * Helper function to format time ago
 */
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return diffMins <= 1 ? 'just now' : `${diffMins}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else {
    return date.toLocaleDateString()
  }
}
