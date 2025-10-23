'use client'

import { useEffect, useState } from 'react'
import { getUserPoints, type UserPointsData } from '@/app/actions/get-user-points'
import { getUserMilestone, getUserMilestoneHistory } from '@/app/actions/award-points'
import { backfillUserMilestones } from '@/app/actions/backfill-milestones'
import { MILESTONES } from '@/lib/milestones'
import { formatDistanceToNow } from 'date-fns'

interface MilestonesCardProps {
  userId: string
}

export function MilestonesCard({ userId }: MilestonesCardProps) {
  const [pointsData, setPointsData] = useState<UserPointsData | null>(null)
  const [currentMilestone, setCurrentMilestone] = useState<typeof MILESTONES[0] | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [showAllMilestones, setShowAllMilestones] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [userId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [points, milestone, milestoneHistory] = await Promise.all([
        getUserPoints(userId),
        getUserMilestone(userId),
        getUserMilestoneHistory(userId)
      ])

      setPointsData(points)
      setCurrentMilestone(milestone)
      setHistory(milestoneHistory)

      // Auto-backfill if user has points but no milestone records
      if (points.points > 0 && milestoneHistory.length === 0) {
        const backfillResult = await backfillUserMilestones(userId)
        if (backfillResult.success && backfillResult.milestonesAdded > 0) {
          // Reload milestone history after backfill
          const updatedHistory = await getUserMilestoneHistory(userId)
          setHistory(updatedHistory)
        }
      }
    } catch (error) {
      console.error('Error loading milestone data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border-2 border-gray-300 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100">
          Your Journey
        </h2>
        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          {pointsData?.points.toLocaleString()} points
        </div>
      </div>

      {/* Current Tier */}
      {currentMilestone && (
        <div className="mb-6 p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{currentMilestone.emoji}</span>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {currentMilestone.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {currentMilestone.description}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress to Next Milestone */}
      {pointsData?.nextMilestone && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Next: {pointsData.nextMilestone.emoji} {pointsData.nextMilestone.name}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {pointsData.nextMilestone.threshold - pointsData.points} points to go
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${pointsData.nextMilestone.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Achievement History Toggle */}
      <button
        onClick={() => setShowAllMilestones(!showAllMilestones)}
        className="w-full text-left text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-3 flex items-center justify-between"
      >
        <span>Achievement History ({history.length} unlocked)</span>
        <svg
          className={`w-4 h-4 transition-transform ${showAllMilestones ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* All Milestones */}
      {showAllMilestones && (
        <div className="space-y-2">
          {MILESTONES.map((milestone, index) => {
            const achieved = history.find(h => h.milestone_key === milestone.key)
            const isCurrent = currentMilestone?.key === milestone.key
            const isLocked = (pointsData?.points || 0) < milestone.threshold

            // Determine if this is the next milestone to unlock
            const nextMilestone = pointsData?.nextMilestone
            const isNextToUnlock = nextMilestone && milestone.threshold === nextMilestone.threshold

            // Mystery state: Hide details for milestones beyond the next one
            const isMystery = !achieved && !isCurrent && !isNextToUnlock && isLocked

            return (
              <div
                key={milestone.key}
                className={`p-3 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
                    : achieved
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : isNextToUnlock
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                    : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl ${isMystery ? 'blur-sm select-none' : isLocked && !isNextToUnlock ? 'grayscale opacity-40' : ''}`}>
                      {isMystery ? '❓' : milestone.emoji}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        {isMystery ? (
                          <span className="blur-sm select-none">??? Locked</span>
                        ) : (
                          <>
                            {milestone.name}
                            {isCurrent && (
                              <span className="text-xs px-2 py-0.5 bg-purple-500 text-white rounded-full">
                                Current
                              </span>
                            )}
                            {isNextToUnlock && (
                              <span className="text-xs px-2 py-0.5 bg-purple-500 text-white rounded-full">
                                Next
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {isMystery ? (
                          <span className="blur-sm select-none">??? points</span>
                        ) : (
                          `${milestone.threshold.toLocaleString()} points`
                        )}
                      </div>
                      {!isMystery && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {milestone.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {achieved ? (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(achieved.achieved_at), { addSuffix: true })}
                      </div>
                    ) : isLocked ? (
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
