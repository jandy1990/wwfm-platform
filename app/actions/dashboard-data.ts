'use server'

import { getServiceSupabaseClient } from '@/lib/database'
import { logger } from '@/lib/utils/logger'

/**
 * Dashboard Data Actions
 * Server actions for fetching personalized dashboard data
 */

// Action 1: Get activity timeline (mixed feed of all activities)
export async function getUserActivityTimeline(userId: string) {
  try {
    const supabase = getServiceSupabaseClient()
    // Get ratings
    const { data: ratings } = await supabase
      .from('ratings')
      .select(`
        id,
        effectiveness_score,
        created_at,
        goal:goals(title, emoji),
        solution:solutions(title, solution_category)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    // Get arena browsing
    const { data: arenaTime } = await supabase
      .from('user_arena_time')
      .select('arena_name, date, seconds_spent, visit_count')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(20)

    // Get discussions
    const { data: discussions } = await supabase
      .from('goal_discussions')
      .select(`
        id,
        content,
        created_at,
        upvotes,
        goal:goals(title, emoji)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    // Merge and sort by date
    const activities = [
      ...(ratings || []).map(r => ({ type: 'rating', data: r, date: r.created_at })),
      ...(arenaTime || []).map(a => ({ type: 'arena', data: a, date: a.date })),
      ...(discussions || []).map(d => ({ type: 'discussion', data: d, date: d.created_at }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return activities
  } catch (error) {
    logger.error('dashboard: error in getUserActivityTimeline', error instanceof Error ? error : { error, userId })
    return []
  }
}

// Action 2: Get impact stats (contribution points, counts, upvotes)
export async function getUserImpactStats(userId: string) {
  try {
    const supabase = getServiceSupabaseClient()
    // Get user stats from users table
    const { data: user } = await supabase
      .from('users')
      .select('contribution_points, solutions_count')
      .eq('id', userId)
      .single()

    // Get actual ratings count
    const { count: ratingsCount } = await supabase
      .from('ratings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get discussions stats efficiently from database
    const { data: discussionStats } = await supabase
      .rpc('get_user_discussion_stats', { p_user_id: userId })
      .single()

    const commentsCount = Number(discussionStats?.comments_count || 0)
    const totalUpvotes = Number(discussionStats?.total_upvotes || 0)

    return {
      contributionPoints: user?.contribution_points || 0,
      ratingsCount: ratingsCount || 0,
      solutionsCount: user?.solutions_count || 0,
      commentsCount: commentsCount,
      helpfulVotes: totalUpvotes
    }
  } catch (error) {
    logger.error('dashboard: error in getUserImpactStats', error instanceof Error ? error : { error, userId })
    return {
      contributionPoints: 0,
      ratingsCount: 0,
      solutionsCount: 0,
      commentsCount: 0,
      helpfulVotes: 0
    }
  }
}

// Action 3: Get solution type preferences (ratings + contributions combined)
export async function getSolutionTypePreferences(userId: string) {
  try {
    const supabase = getServiceSupabaseClient()

    // Get ratings grouped by category
    const { data: ratings } = await supabase
      .from('ratings')
      .select(`
        solution:solutions(solution_category)
      `)
      .eq('user_id', userId)

    // Count ratings by category
    const ratingCounts = ratings?.reduce((acc, r: any) => {
      const category = r.solution?.solution_category
      if (category) {
        acc[category] = (acc[category] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>) || {}

    // Get contributed solutions grouped by category
    const { data: contributions } = await supabase
      .from('solutions')
      .select('solution_category')
      .eq('created_by', userId)

    // Count contributions by category
    const contributionCounts = contributions?.reduce((acc, s) => {
      const category = s.solution_category
      if (category) {
        acc[category] = (acc[category] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>) || {}

    // Combine all categories
    const allCategories = new Set([
      ...Object.keys(ratingCounts),
      ...Object.keys(contributionCounts)
    ])

    // Build combined data
    const solutionTypes = Array.from(allCategories).map(category => {
      const ratedCount = ratingCounts[category] || 0
      const contributedCount = contributionCounts[category] || 0
      const totalCount = ratedCount + contributedCount

      return {
        category,
        ratedCount,
        contributedCount,
        totalCount
      }
    })
    .sort((a, b) => b.totalCount - a.totalCount) // Sort by total activity

    // Calculate total activity across all types
    const totalActivity = solutionTypes.reduce((sum, st) => sum + st.totalCount, 0)

    return { solutionTypes, totalActivity }
  } catch (error) {
    logger.error('dashboard: error in getSolutionTypePreferences', error instanceof Error ? error : { error, userId })
    return { solutionTypes: [], totalActivity: 0 }
  }
}

// Action 4: Get user contributions (ratings + discussions)
export async function getUserContributions(userId: string) {
  try {
    const supabase = getServiceSupabaseClient()

    const [{ data: ratings, error: ratingsError }, { data: discussions, error: discussionsError }] = await Promise.all([
      supabase
        .from('ratings')
        .select(`
          id,
          effectiveness_score,
          created_at,
          goal:goals(title, emoji),
          solution:solutions(title, solution_category)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('goal_discussions')
        .select(`
          id,
          content,
          upvotes,
          created_at,
          goal:goals(title, emoji)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    ])

    if (ratingsError) {
      logger.error('dashboard: error fetching user ratings', { error: ratingsError, userId })
    }

    if (discussionsError) {
      logger.error('dashboard: error fetching user discussions', { error: discussionsError, userId })
    }

    return {
      ratings: ratings || [],
      discussions: discussions || []
    }
  } catch (error) {
    logger.error('dashboard: error in getUserContributions', error instanceof Error ? error : { error, userId })
    return {
      ratings: [],
      discussions: []
    }
  }
}
