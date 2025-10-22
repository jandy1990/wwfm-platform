'use server'

import { getServiceSupabaseClient } from '@/lib/database'
import { logger } from '@/lib/utils/logger'
import { MILESTONES } from '@/lib/milestones'

/**
 * Backfill milestone records for users who already have points
 * but missing milestone records in user_milestones table
 */
export async function backfillUserMilestones(userId: string): Promise<{ success: boolean; milestonesAdded: number; error?: string }> {
  const supabase = getServiceSupabaseClient()

  try {
    // 1. Get user's current points
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('contribution_points')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      return {
        success: false,
        milestonesAdded: 0,
        error: 'User not found'
      }
    }

    const currentPoints = userData.contribution_points || 0

    // 2. Get existing milestone records
    const { data: existingMilestones, error: milestonesError } = await supabase
      .from('user_milestones')
      .select('milestone_key')
      .eq('user_id', userId)
      .eq('milestone_type', 'points')

    if (milestonesError) {
      return {
        success: false,
        milestonesAdded: 0,
        error: 'Failed to fetch existing milestones'
      }
    }

    const existingKeys = new Set(existingMilestones?.map(m => m.milestone_key) || [])

    // 3. Find all milestones that should be awarded based on current points
    const missingMilestones = MILESTONES.filter(
      milestone => currentPoints >= milestone.threshold && !existingKeys.has(milestone.key)
    )

    if (missingMilestones.length === 0) {
      return {
        success: true,
        milestonesAdded: 0
      }
    }

    // 4. Insert missing milestone records
    const milestoneRecords = missingMilestones.map(milestone => ({
      user_id: userId,
      milestone_type: 'points' as const,
      milestone_key: milestone.key,
      threshold: milestone.threshold,
      points_at_achievement: currentPoints, // Use current points since we don't know exact time they crossed
      achieved_at: new Date().toISOString() // Backfilled timestamp
    }))

    const { error: insertError } = await supabase
      .from('user_milestones')
      .insert(milestoneRecords)

    if (insertError) {
      logger.error('backfillUserMilestones insert error', { error: insertError, userId })
      return {
        success: false,
        milestonesAdded: 0,
        error: 'Failed to insert milestones'
      }
    }

    logger.info('backfillUserMilestones success', {
      userId,
      currentPoints,
      milestonesAdded: missingMilestones.length,
      milestones: missingMilestones.map(m => m.key)
    })

    return {
      success: true,
      milestonesAdded: missingMilestones.length
    }
  } catch (error) {
    logger.error('backfillUserMilestones unexpected error', error instanceof Error ? error : { error })
    return {
      success: false,
      milestonesAdded: 0,
      error: 'Unexpected error'
    }
  }
}

/**
 * Backfill milestones for ALL users
 * Use with caution - runs on entire user base
 */
export async function backfillAllUsersMilestones(): Promise<{ success: boolean; usersProcessed: number; totalMilestonesAdded: number; errors: number }> {
  const supabase = getServiceSupabaseClient()

  try {
    // Get all users with contribution points > 0
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, contribution_points')
      .gt('contribution_points', 0)

    if (usersError || !users) {
      return {
        success: false,
        usersProcessed: 0,
        totalMilestonesAdded: 0,
        errors: 1
      }
    }

    let totalMilestonesAdded = 0
    let errors = 0

    // Process each user
    for (const user of users) {
      const result = await backfillUserMilestones(user.id)

      if (result.success) {
        totalMilestonesAdded += result.milestonesAdded
      } else {
        errors++
      }
    }

    logger.info('backfillAllUsersMilestones complete', {
      usersProcessed: users.length,
      totalMilestonesAdded,
      errors
    })

    return {
      success: true,
      usersProcessed: users.length,
      totalMilestonesAdded,
      errors
    }
  } catch (error) {
    logger.error('backfillAllUsersMilestones unexpected error', error instanceof Error ? error : { error })
    return {
      success: false,
      usersProcessed: 0,
      totalMilestonesAdded: 0,
      errors: 1
    }
  }
}
