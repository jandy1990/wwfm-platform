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

    // Get actual discussions count and total upvotes
    const { data: discussions } = await supabase
      .from('goal_discussions')
      .select('upvotes')
      .eq('user_id', userId)

    const commentsCount = discussions?.length || 0
    const totalUpvotes = discussions?.reduce((sum, d) => sum + (d.upvotes || 0), 0) || 0

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

// Action 3: Get category mastery (explored vs unexplored categories + time spent)
export async function getCategoryMastery(userId: string) {
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
    const categoryCounts = ratings?.reduce((acc, r: any) => {
      const category = r.solution?.solution_category
      if (category) {
        acc[category] = (acc[category] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>) || {}

    // Get time spent by arena
    const { data: arenaTime } = await supabase
      .from('user_arena_time')
      .select('arena_name, seconds_spent')
      .eq('user_id', userId)

    // Sum time by arena
    const arenaTimeMap = arenaTime?.reduce((acc, a) => {
      acc[a.arena_name] = (acc[a.arena_name] || 0) + a.seconds_spent
      return acc
    }, {} as Record<string, number>) || {}

    // Combine category data with time spent
    const explored = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([category, count]) => ({
        category,
        count,
        timeSpent: arenaTimeMap[category] || 0
      }))

    // All categories
    const allCategories = [
      'supplements_vitamins', 'medications', 'natural_remedies', 'beauty_skincare',
      'therapists_counselors', 'doctors_specialists', 'coaches_mentors',
      'alternative_practitioners', 'professional_services', 'medical_procedures',
      'crisis_resources', 'exercise_movement', 'meditation_mindfulness',
      'habits_routines', 'hobbies_activities', 'groups_communities',
      'apps_software', 'products_devices', 'books_courses',
      'diet_nutrition', 'sleep', 'financial_products'
    ]

    const unexplored = allCategories.filter(cat => !categoryCounts[cat])

    return { explored, unexplored, arenaTime: arenaTimeMap }
  } catch (error) {
    logger.error('dashboard: error in getCategoryMastery', error instanceof Error ? error : { error, userId })
    return { explored: [], unexplored: [], arenaTime: {} }
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
