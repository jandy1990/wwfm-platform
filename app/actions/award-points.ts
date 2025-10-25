'use server'

import { getServiceSupabaseClient } from '@/lib/database'
import { logger } from '@/lib/utils/logger'
import { MILESTONES, type Milestone } from '@/lib/milestones'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface AwardPointsResult {
  success: boolean
  newTotal: number
  pointsAwarded: number
  milestoneAchieved?: Milestone
  error?: string
}

export async function awardPoints(
  userId: string,
  points: number,
  reason: string
): Promise<AwardPointsResult> {
  const supabase = getServiceSupabaseClient()
  // Supabase's generated types for user_milestones are extremely deep, which can
  // trigger "type instantiation is excessively deep" in CI. Treat the milestone
  // operations as generic to keep the type checker happy while we reshape the data.
  const milestoneClient = supabase as unknown as SupabaseClient<any>
  try {
    // 1. Get current user points
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('contribution_points')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      logger.error('awardPoints error fetching user', { error: userError, userId })
      return {
        success: false,
        error: 'User not found',
        newTotal: 0,
        pointsAwarded: 0
      }
    }

    const oldPoints = userData.contribution_points || 0
    const newPoints = oldPoints + points

    // 2. Update user's points
    const { error: updateError } = await supabase
      .from('users')
      .update({ contribution_points: newPoints })
      .eq('id', userId)

    if (updateError) {
      logger.error('awardPoints error updating points', { error: updateError, userId })
      return {
        success: false,
        error: 'Failed to update points',
        newTotal: oldPoints,
        pointsAwarded: 0
      }
    }

    // 3. Check if user crossed any milestone threshold
    let milestoneAchieved: Milestone | undefined = undefined

    for (const milestone of MILESTONES) {
      if (oldPoints < milestone.threshold && newPoints >= milestone.threshold) {
        const { error: milestoneError } = await milestoneClient
          .from('user_milestones')
          .upsert({
            user_id: userId,
            milestone_type: 'points',
            milestone_key: milestone.key,
            threshold: milestone.threshold,
            points_at_achievement: newPoints
          }, {
            onConflict: 'user_id,milestone_key',
            ignoreDuplicates: true
          })

        if (!milestoneError) {
          milestoneAchieved = milestone
        } else {
          logger.error('awardPoints error recording milestone', { error: milestoneError, userId, milestone: milestone.key })
        }
        break
      }
    }

    return {
      success: true,
      newTotal: newPoints,
      pointsAwarded: points,
      milestoneAchieved
    }
  } catch (error) {
    logger.error('awardPoints unexpected error', error instanceof Error ? error : { error })
    return {
      success: false,
      error: 'Unexpected error',
      newTotal: 0,
      pointsAwarded: 0
    }
  }
}

// Helper to get user's current milestone tier
export async function getUserMilestone(userId: string): Promise<Milestone | null> {
  const supabase = getServiceSupabaseClient()
  try {
    const { data: userData } = await supabase
      .from('users')
      .select('contribution_points')
      .eq('id', userId)
      .single()

    if (!userData) return null

    const points = userData.contribution_points || 0

    // Find the highest milestone they've achieved
    const achieved = [...MILESTONES]
      .reverse()
      .find(m => points >= m.threshold)

    return achieved || null
  } catch (error) {
    logger.error('awardPoints error getting user milestone', error instanceof Error ? error : { error, userId })
    return null
  }
}

// Helper to get all user's achieved milestones with dates
export async function getUserMilestoneHistory(userId: string) {
  const supabase = getServiceSupabaseClient()
  const milestoneClient = supabase as unknown as SupabaseClient<any>
  try {
    const { data, error } = await milestoneClient
      .from('user_milestones')
      .select('*')
      .eq('user_id', userId)
      .eq('milestone_type', 'points')
      .order('achieved_at', { ascending: false })

    if (error) throw error

    // Map to include full milestone data
    return (data as Array<{ milestone_key: string }> | null)?.map(record => {
      const milestone = MILESTONES.find(m => m.key === record.milestone_key)
      return {
        ...record,
        milestone: milestone || null
      }
    }) || []
  } catch (error) {
    logger.error('awardPoints error getting milestone history', error instanceof Error ? error : { error, userId })
    return []
  }
}
