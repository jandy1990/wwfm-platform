'use client'

import { useEffect, useState } from 'react'
import { getUserActivityTimeline } from '@/app/actions/dashboard-data'
import { supabase } from '@/lib/database/client'

interface Activity {
  type: 'rating' | 'arena' | 'discussion'
  data: any
  date: string
}

export function ActivityTimeline() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const timeline = await getUserActivityTimeline(user.id)
        setActivities(timeline as Activity[])
      }
      setLoading(false)
    }
    loadData()
  }, [])

  // Group by date
  const groupedByDate = activities.reduce((acc, activity) => {
    const date = new Date(activity.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: new Date(activity.date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(activity)
    return acc
  }, {} as Record<string, Activity[]>)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        📅 Your Activity Timeline
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Your journey with WWFM
      </p>

      {Object.keys(groupedByDate).length > 0 ? (
        <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
          {Object.entries(groupedByDate).slice(0, 10).map(([date, items]) => (
            <div key={date}>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sticky top-0 bg-white dark:bg-gray-800">
                {date}
              </div>
              <div className="space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                {items.map((activity, idx) => (
                  <div key={idx} className="text-sm text-gray-600 dark:text-gray-400 pb-2">
                    {activity.type === 'rating' && (
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0">{activity.data.goal?.emoji || '🎯'}</span>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            Rated {activity.data.solution?.title}
                          </span>
                          <span className="ml-1">
                            ({activity.data.effectiveness_score}⭐)
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                            for {activity.data.goal?.title}
                          </div>
                        </div>
                      </div>
                    )}
                    {activity.type === 'arena' && (
                      <div className="flex items-center gap-2">
                        <span className="flex-shrink-0">⏱️</span>
                        <span>
                          Explored <span className="font-medium text-gray-900 dark:text-gray-100">{activity.data.arena_name}</span>
                          {' '}({formatTime(activity.data.seconds_spent)})
                        </span>
                      </div>
                    )}
                    {activity.type === 'discussion' && (
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0">{activity.data.goal?.emoji || '💬'}</span>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            Posted discussion
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 truncate">
                            "{activity.data.content.substring(0, 50)}{activity.data.content.length > 50 ? '...' : ''}"
                          </div>
                          {activity.data.upvotes > 0 && (
                            <div className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                              👍 {activity.data.upvotes} helpful
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4">
          <div className="text-5xl mb-4">🚀</div>
          <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">
            Start your journey!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Explore goals and rate solutions to build your timeline
          </p>
        </div>
      )}
    </div>
  )
}
