'use server'

import { createServerSupabaseClient } from '@/lib/database/server'
import { logger } from '@/lib/utils/logger'
import { revalidatePath } from 'next/cache'

export interface FollowActionResult {
  success: boolean
  isFollowing: boolean
  followerCount: number
  error?: string
}

export interface FollowStatus {
  isFollowing: boolean
  status?: 'following' | 'achieved'
  achievedAt?: string
  followedAt?: string
}

export interface FollowedGoal {
  id: string
  goalId: string
  goalTitle: string
  goalEmoji: string
  arenaName: string
  categoryName: string
  status: 'following' | 'achieved'
  followedAt: string
  achievedAt?: string
  lastActiveAt?: string
  solutionCount: number
  ratedSolutionCount: number
}

/**
 * Toggle following status for a goal
 * If already following, unfollows; if not following, creates follow
 */
export async function toggleGoalFollow(
  goalId: string
): Promise<FollowActionResult> {
  const supabase = await createServerSupabaseClient()

  try {
    // Get current user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('toggleGoalFollow: auth error', { error: authError, goalId })
      return {
        success: false,
        isFollowing: false,
        followerCount: 0,
        error: 'Authentication required'
      }
    }

    // Check if already following
    const { data: existingFollow, error: checkError } = await supabase
      .from('goal_followers')
      .select('id')
      .eq('user_id', user.id)
      .eq('goal_id', goalId)
      .maybeSingle()

    if (checkError) {
      logger.error('toggleGoalFollow: error checking follow status', {
        error: checkError,
        userId: user.id,
        goalId
      })
      return {
        success: false,
        isFollowing: false,
        followerCount: 0,
        error: 'Failed to check follow status'
      }
    }

    let isFollowing = false

    if (existingFollow) {
      // Unfollow
      const { error: deleteError } = await supabase
        .from('goal_followers')
        .delete()
        .eq('id', existingFollow.id)

      if (deleteError) {
        logger.error('toggleGoalFollow: error unfollowing goal', {
          error: deleteError,
          userId: user.id,
          goalId
        })
        return {
          success: false,
          isFollowing: true,
          followerCount: 0,
          error: 'Failed to unfollow goal'
        }
      }

      isFollowing = false
    } else {
      // Follow
      const { error: insertError } = await supabase
        .from('goal_followers')
        .insert({
          user_id: user.id,
          goal_id: goalId,
          status: 'following',
          last_active_at: new Date().toISOString()
        })

      if (insertError) {
        logger.error('toggleGoalFollow: error following goal', {
          error: insertError,
          userId: user.id,
          goalId
        })
        return {
          success: false,
          isFollowing: false,
          followerCount: 0,
          error: 'Failed to follow goal'
        }
      }

      isFollowing = true
    }

    // Get updated follower count
    const { count, error: countError } = await supabase
      .from('goal_followers')
      .select('*', { count: 'exact', head: true })
      .eq('goal_id', goalId)

    if (countError) {
      logger.error('toggleGoalFollow: error getting follower count', {
        error: countError,
        goalId
      })
    }

    // Revalidate the goal page and dashboard
    revalidatePath(`/goal/${goalId}`)
    revalidatePath('/dashboard')

    return {
      success: true,
      isFollowing,
      followerCount: count || 0
    }
  } catch (error) {
    logger.error(
      'toggleGoalFollow: unexpected error',
      error instanceof Error ? error : { error, goalId }
    )
    return {
      success: false,
      isFollowing: false,
      followerCount: 0,
      error: 'Unexpected error'
    }
  }
}

/**
 * Get follow status for a goal (for current user)
 */
export async function getFollowStatus(goalId: string): Promise<FollowStatus> {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { isFollowing: false }
    }

    const { data, error } = await supabase
      .from('goal_followers')
      .select('status, achieved_at, created_at')
      .eq('user_id', user.id)
      .eq('goal_id', goalId)
      .maybeSingle()

    if (error) {
      logger.error('getFollowStatus: error', {
        error,
        userId: user.id,
        goalId
      })
      return { isFollowing: false }
    }

    if (!data) {
      return { isFollowing: false }
    }

    return {
      isFollowing: true,
      status: data.status as 'following' | 'achieved',
      achievedAt: data.achieved_at || undefined,
      followedAt: data.created_at
    }
  } catch (error) {
    logger.error(
      'getFollowStatus: unexpected error',
      error instanceof Error ? error : { error, goalId }
    )
    return { isFollowing: false }
  }
}

/**
 * Get follower count for a goal (public)
 */
export async function getFollowerCount(goalId: string): Promise<number> {
  const supabase = await createServerSupabaseClient()

  try {
    const { count, error } = await supabase
      .from('goal_followers')
      .select('*', { count: 'exact', head: true })
      .eq('goal_id', goalId)

    if (error) {
      logger.error('getFollowerCount: error', { error, goalId })
      return 0
    }

    return count || 0
  } catch (error) {
    logger.error(
      'getFollowerCount: unexpected error',
      error instanceof Error ? error : { error, goalId }
    )
    return 0
  }
}

/**
 * Get all goals followed by the current user
 * Used for dashboard display
 */
export async function getUserFollowedGoals(): Promise<FollowedGoal[]> {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('getUserFollowedGoals: auth error', { error: authError })
      return []
    }

    const { data, error } = await supabase
      .from('goal_followers')
      .select(
        `
        id,
        goal_id,
        status,
        created_at,
        achieved_at,
        last_active_at,
        goals!inner (
          id,
          title,
          emoji,
          categories!inner (
            name,
            arenas!inner (
              name
            )
          )
        )
      `
      )
      .eq('user_id', user.id)
      .order('last_active_at', { ascending: false })

    if (error) {
      logger.error('getUserFollowedGoals: error fetching goals', {
        error,
        userId: user.id
      })
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // For each followed goal, get solution count and rated solution count
    const followedGoals: FollowedGoal[] = await Promise.all(
      data.map(async (follow) => {
        const goal = Array.isArray(follow.goals) ? follow.goals[0] : follow.goals
        const category = Array.isArray(goal?.categories)
          ? goal.categories[0]
          : goal?.categories
        const arena = Array.isArray(category?.arenas)
          ? category.arenas[0]
          : category?.arenas

        // Get solution count for this goal
        const { count: solutionCount } = await supabase
          .from('goal_implementation_links')
          .select('*', { count: 'exact', head: true })
          .eq('goal_id', follow.goal_id)
          .eq('is_approved', true)

        // Get rated solution count for this goal by this user
        const { count: ratedCount } = await supabase
          .from('ratings')
          .select('*', { count: 'exact', head: true })
          .eq('goal_id', follow.goal_id)
          .eq('user_id', user.id)

        return {
          id: follow.id,
          goalId: follow.goal_id,
          goalTitle: goal?.title || 'Unknown Goal',
          goalEmoji: goal?.emoji || '❓',
          arenaName: arena?.name || 'Unknown Arena',
          categoryName: category?.name || 'Unknown Category',
          status: follow.status as 'following' | 'achieved',
          followedAt: follow.created_at,
          achievedAt: follow.achieved_at || undefined,
          lastActiveAt: follow.last_active_at || undefined,
          solutionCount: solutionCount || 0,
          ratedSolutionCount: ratedCount || 0
        }
      })
    )

    return followedGoals
  } catch (error) {
    logger.error(
      'getUserFollowedGoals: unexpected error',
      error instanceof Error ? error : { error }
    )
    return []
  }
}

/**
 * Mark a followed goal as achieved
 * This will update the status and open the contribution form
 */
export async function markGoalAsAchieved(
  goalId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('markGoalAsAchieved: auth error', {
        error: authError,
        goalId
      })
      return {
        success: false,
        error: 'Authentication required'
      }
    }

    // Update the follow status
    const { error: updateError } = await supabase
      .from('goal_followers')
      .update({
        status: 'achieved',
        achieved_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('goal_id', goalId)

    if (updateError) {
      logger.error('markGoalAsAchieved: error updating status', {
        error: updateError,
        userId: user.id,
        goalId
      })
      return {
        success: false,
        error: 'Failed to mark goal as achieved'
      }
    }

    // Revalidate dashboard
    revalidatePath('/dashboard')
    revalidatePath(`/goal/${goalId}`)

    return { success: true }
  } catch (error) {
    logger.error(
      'markGoalAsAchieved: unexpected error',
      error instanceof Error ? error : { error, goalId }
    )
    return {
      success: false,
      error: 'Unexpected error'
    }
  }
}
