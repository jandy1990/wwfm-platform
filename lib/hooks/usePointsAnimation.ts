'use client'

import { useCallback } from 'react'
import { awardPoints, type Milestone } from '@/app/actions/award-points'

export interface TriggerPointsParams {
  userId: string
  points: number
  reason: string
  multiplier?: number
}

export function usePointsAnimation() {
  const triggerPoints = useCallback(async (params: TriggerPointsParams) => {
    // Award points on the server
    const result = await awardPoints(params.userId, params.points, params.reason)

    if (!result.success) {
      console.error('Failed to award points:', result.error)
      return
    }

    // Dispatch custom event for badge animation
    const pointsGainedEvent = new CustomEvent('pointsGained', {
      detail: { points: result.pointsAwarded }
    })
    window.dispatchEvent(pointsGainedEvent)

    // Dispatch custom event for toast
    const showToastEvent = new CustomEvent('showPointsToast', {
      detail: {
        points: result.pointsAwarded,
        reason: params.reason,
        multiplier: params.multiplier,
        totalEarned: result.newTotal
      }
    })
    window.dispatchEvent(showToastEvent)

    // If milestone achieved, trigger celebration modal
    if (result.milestoneAchieved) {
      const celebrationEvent = new CustomEvent('milestoneAchieved', {
        detail: result.milestoneAchieved
      })
      window.dispatchEvent(celebrationEvent)
    }
  }, [])

  return { triggerPoints }
}
