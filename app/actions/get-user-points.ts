'use server'

import { getServiceSupabaseClient } from '@/lib/database'
import { MILESTONES } from '@/lib/milestones'
import { logger } from '@/lib/utils/logger'

export interface UserPointsData {
  points: number
  nextMilestone: {
    name: string
    emoji: string
    threshold: number
    progress: number
  } | null
}

export async function getUserPoints(userId: string): Promise<UserPointsData> {
  try {
    const supabase = getServiceSupabaseClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('contribution_points')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return { points: 0, nextMilestone: null }
    }

    const points = user.contribution_points || 0

    // Find next milestone
    const nextMilestone = MILESTONES.find(m => points < m.threshold)

    if (nextMilestone) {
      // Find the milestone immediately BEFORE the next one (not just any milestone below it)
      const nextMilestoneIndex = MILESTONES.findIndex(m => m.threshold === nextMilestone.threshold)
      const previousThreshold = nextMilestoneIndex > 0
        ? MILESTONES[nextMilestoneIndex - 1].threshold
        : 0

      const progress = ((points - previousThreshold) / (nextMilestone.threshold - previousThreshold)) * 100

      return {
        points,
        nextMilestone: {
          name: nextMilestone.name,
          emoji: nextMilestone.emoji,
          threshold: nextMilestone.threshold,
          progress: Math.min(Math.max(progress, 0), 100)
        }
      }
    }

    return { points, nextMilestone: null }
  } catch (error) {
    logger.error('getUserPoints unexpected error', error instanceof Error ? error : { error, userId })
    return { points: 0, nextMilestone: null }
  }
}
