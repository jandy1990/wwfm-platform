'use client'

import { useEffect, useRef } from 'react'
import { trackGoalView } from '@/app/actions/track-goal-view'

interface GoalViewTrackerProps {
  goalId: string
}

export function GoalViewTracker({ goalId }: GoalViewTrackerProps) {
  const hasTracked = useRef(false)

  useEffect(() => {
    // Only track once per mount
    if (hasTracked.current || !goalId) return
    hasTracked.current = true

    // Track after a short delay to ensure real view
    const timer = setTimeout(() => {
      trackGoalView(goalId).catch(error => {
        console.error('Goal view tracking failed:', error)
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [goalId])

  return null
}