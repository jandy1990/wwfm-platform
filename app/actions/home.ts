'use server'

import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/database/server'
import type {
  HomePageData,
  TrendingGoal,
  ActivityEvent,
  FeaturedVerbatim,
  PlatformStats,
  TopValueArena,
  GoalSuggestion,
  GoalSearchRow,
  FeaturedVerbatimRow
} from '@/types/home'
import type { Database, Tables } from '@/types/supabase'

type TrendingGoalRow = Database['public']['Functions']['get_trending_goals']['Returns'][number]
type ActivityEventRow = Database['public']['Functions']['get_activity_feed']['Returns'][number]
const TREND_STATUSES = ['hot', 'rising', 'stable'] as const satisfies readonly TrendingGoal['trendStatus'][]
const ACTIVITY_TYPES = ['rating', 'discussion', 'new_solution'] as const satisfies readonly ActivityEvent['activityType'][]

const pickFirst = <T>(value: T | T[] | null | undefined): T | undefined => {
  if (!value) return undefined
  return Array.isArray(value) ? value[0] : value
}

export async function getHomePageData(): Promise<HomePageData> {
  const supabase = await createServerSupabaseClient();

  // Fetch all data in parallel for performance
  const [
    trendingGoals,
    activityFeed,
    featuredVerbatims,
    platformStats,
    topValueArenas
  ] = await Promise.all([
    getTrendingGoals(supabase),
    getActivityFeed(supabase),
    getFeaturedVerbatims(supabase),
    getPlatformStats(supabase),
    getTopValueArenas(supabase)
  ]);

  return {
    trendingGoals,
    activityFeed,
    featuredVerbatims,
    platformStats,
    topValueArenas
  };
}

export async function searchGoals(query: string): Promise<GoalSuggestion[]> {
  const trimmed = query?.trim()
  if (!trimmed || trimmed.length < 2) {
    return []
  }

  const supabase = await createServerSupabaseClient()

  try {
    const { data: goalRows, error } = await supabase
      .from('goals')
      .select(`
        id,
        title,
        categories!inner (
          name,
          arenas!inner (
            name
          )
        )
      `)
      .eq('is_approved', true)
      .ilike('title', `%${trimmed}%`)
      .limit(10)
      .returns<GoalSearchRow[] | null>()

    if (error) {
      logger.error('home: error searching goals', { error, query: trimmed })
      return []
    }

    const suggestions: GoalSuggestion[] = (goalRows ?? []).map((goal) => {
      const titleLower = goal.title.toLowerCase()
      const queryLower = trimmed.toLowerCase()
      let score = 0

      if (titleLower === queryLower) {
        score = 100
      } else if (titleLower.startsWith(queryLower)) {
        score = 90
      } else if (titleLower.split(' ').some((word) => word.startsWith(queryLower))) {
        score = 80
      } else if (titleLower.includes(` ${queryLower}`)) {
        score = 70
      } else if (titleLower.includes(queryLower)) {
        score = 60
      }

      const actionVerb = goal.title.split(' ')[0]?.toLowerCase()
      if (actionVerb === queryLower) {
        score += 20
      }

      const category = pickFirst(goal.categories)
      const arena = category ? pickFirst(category.arenas) : undefined

      return {
        id: goal.id,
        title: goal.title,
        arenaName: arena?.name ?? 'Unknown Arena',
        categoryName: category?.name ?? 'Unknown Category',
        score
      }
    })

    return suggestions
      .filter((suggestion) => suggestion.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
  } catch (err) {
    logger.error('home: searchGoals unexpected error', err instanceof Error ? err : { err, query })
    return []
  }
}

async function getTrendingGoals(supabase: SupabaseClient<Database>): Promise<TrendingGoal[]> {
  try {
    const args: Database['public']['Functions']['get_trending_goals']['Args'] = {
      timeframe_days: 7,
      limit_count: 8
    }

    const { data, error } = await supabase.rpc('get_trending_goals', args)

    if (error) {
      logger.error('home: error fetching trending goals', { error, args })
      return []
    }

    const rows = data ?? []

    return rows.map((row): TrendingGoal => ({
      id: row.id,
      title: row.title,
      emoji: row.emoji,
      solutionCount: Number(row.solution_count),
      avgEffectiveness: Number(row.avg_effectiveness),
      recentRatings: Number(row.recent_ratings),
      recentDiscussions: Number(row.recent_discussions),
      ratingsToday: Number(row.ratings_today),
      trendStatus: TREND_STATUSES.includes(row.trend_status as TrendingGoal['trendStatus'])
        ? (row.trend_status as TrendingGoal['trendStatus'])
        : 'stable',
      activityScore: Number(row.activity_score)
    }))
  } catch (err) {
    logger.error('home: getTrendingGoals unexpected error', err instanceof Error ? err : { err })
    return []
  }
}

async function getActivityFeed(supabase: SupabaseClient<Database>): Promise<ActivityEvent[]> {
  try {
    const args: Database['public']['Functions']['get_activity_feed']['Args'] = {
      hours_back: 24,
      limit_count: 20
    }

    const { data, error } = await supabase.rpc('get_activity_feed', args)

    if (error) {
      logger.error('home: error fetching activity feed', { error })
      return []
    }

    const rows = data ?? []

    return rows.map((row): ActivityEvent => ({
      activityType: ACTIVITY_TYPES.includes(row.activity_type as ActivityEvent['activityType'])
        ? (row.activity_type as ActivityEvent['activityType'])
        : 'rating',
      createdAt: new Date(row.created_at),
      goalTitle: row.goal_title,
      goalEmoji: row.goal_emoji,
      solutionTitle: row.solution_title || undefined,
      rating: row.rating ?? undefined,
      contentExcerpt: row.content_excerpt ?? undefined,
      upvotes: row.upvotes ?? undefined
    }))
  } catch (err) {
    logger.error('home: getActivityFeed unexpected error', err instanceof Error ? err : { err })
    return []
  }
}

async function getFeaturedVerbatims(supabase: SupabaseClient<Database>): Promise<FeaturedVerbatim[]> {
  try {
    // Query for high-quality discussion excerpts
    const { data, error } = await supabase
      .from('goal_discussions')
      .select(`
        content,
        upvotes,
        created_at,
        goals!inner (
          title,
          emoji,
          is_approved
        )
      `)
      .eq('goals.is_approved', true)
      .gte('upvotes', 10)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order('upvotes', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5)
      .returns<FeaturedVerbatimRow[] | null>()

    if (error) {
      logger.error('home: error fetching featured verbatims', { error })
      return []
    }

    return (data ?? []).map((row): FeaturedVerbatim => {
      const createdAt = new Date(row.created_at)
      const now = new Date()
      const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

      let timeBucket: FeaturedVerbatim['timeBucket']
      if (hoursDiff < 24) timeBucket = 'today'
      else if (hoursDiff < 168) timeBucket = 'this week' // 7 days
      else if (hoursDiff < 720) timeBucket = 'this month' // 30 days
      else timeBucket = 'earlier'

      const goalInfo = pickFirst(row.goals)

      return {
        goalTitle: goalInfo?.title ?? 'Unknown Goal',
        goalEmoji: goalInfo?.emoji ?? '❓',
        content: row.content,
        upvotes: row.upvotes,
        createdAt,
        timeBucket
      }
    })
  } catch (err) {
    logger.error('home: getFeaturedVerbatims unexpected error', err instanceof Error ? err : { err })
    return []
  }
}

async function getPlatformStats(supabase: SupabaseClient<Database>): Promise<PlatformStats> {
  try {
    const { data, error } = await supabase
      .from('platform_stats_cache')
      .select('*')
      .single()
      .returns<Tables<'platform_stats_cache'> | null>()

    if (error) {
      logger.error('home: error fetching platform stats', { error })
      // Return fallback stats
      return {
        totalSolutions: 0,
        totalGoals: 0,
        avgEffectiveness: 0,
        activeUsersToday: 0,
        ratingsLastHour: 0,
        discussionsToday: 0
      }
    }

    const row = data ?? {
      active_users_today: 0,
      avg_effectiveness: 0,
      discussions_today: 0,
      ratings_last_hour: 0,
      total_goals: 0,
      total_solutions: 0,
      last_updated: null
    }
    return {
      totalSolutions: Number(row.total_solutions ?? 0),
      totalGoals: Number(row.total_goals ?? 0),
      avgEffectiveness: Number(row.avg_effectiveness ?? 0),
      activeUsersToday: Number(row.active_users_today ?? 0),
      ratingsLastHour: Number(row.ratings_last_hour ?? 0),
      discussionsToday: Number(row.discussions_today ?? 0)
    }
  } catch (err) {
    logger.error('home: getPlatformStats unexpected error', err instanceof Error ? err : { err })
    // Return fallback stats
    return {
      totalSolutions: 0,
      totalGoals: 0,
      avgEffectiveness: 0,
      activeUsersToday: 0,
      ratingsLastHour: 0,
      discussionsToday: 0
    }
  }
}

async function getTopValueArenas(supabase: SupabaseClient<Database>): Promise<TopValueArena[]> {
  try {
    // Use the get_arena_value_scores function we created earlier
    const { data, error } = await supabase.rpc('get_arena_value_scores')

    if (error) {
      logger.error('home: error fetching top value arenas', { error })
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // Get top 5 arenas by lasting value, then fetch full arena details
    const topArenaIds = data
      .sort((a, b) => (b.avg_lasting_value || 0) - (a.avg_lasting_value || 0))
      .slice(0, 5)
      .map(a => a.arena_id)

    const { data: arenaDetails, error: arenaError } = await supabase
      .from('arenas')
      .select('id, name, description, slug')
      .in('id', topArenaIds)

    if (arenaError) {
      logger.error('home: error fetching arena details', { error: arenaError })
      return []
    }

    // Combine the data
    return topArenaIds.map(id => {
      const valueData = data.find(d => d.arena_id === id)
      const arenaDetail = arenaDetails?.find(a => a.id === id)

      return {
        id,
        slug: arenaDetail?.slug || '',
        name: arenaDetail?.name || valueData?.arena_name || 'Unknown',
        avgLastingValue: Number(valueData?.avg_lasting_value || 0),
        goalCount: Number(valueData?.goal_count || 0),
        description: arenaDetail?.description || ''
      }
    }).filter(arena => arena.goalCount > 0 && arena.slug)

  } catch (err) {
    logger.error('home: getTopValueArenas unexpected error', err instanceof Error ? err : { err })
    return []
  }
}
