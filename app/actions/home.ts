'use server'

import { createServerSupabaseClient } from '@/lib/database/server';
import type {
  HomePageData,
  TrendingGoal,
  ActivityEvent,
  FeaturedVerbatim,
  PlatformStats,
  TrendingGoalRow,
  ActivityEventRow,
  PlatformStatsRow
} from '@/types/home';

export async function getHomePageData(): Promise<HomePageData> {
  const supabase = await createServerSupabaseClient();

  // Fetch all data in parallel for performance
  const [
    trendingGoals,
    activityFeed,
    featuredVerbatims,
    platformStats
  ] = await Promise.all([
    getTrendingGoals(supabase),
    getActivityFeed(supabase),
    getFeaturedVerbatims(supabase),
    getPlatformStats(supabase)
  ]);

  return {
    trendingGoals,
    activityFeed,
    featuredVerbatims,
    platformStats
  };
}

// Types for search functionality
export type GoalSuggestion = {
  id: string;
  title: string;
  arenaName: string;
  categoryName: string;
  score: number;
};

export async function searchGoals(query: string): Promise<GoalSuggestion[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const supabase = await createServerSupabaseClient();

  try {
    // Fetch goals with arena and category information for suggestions
    const { data: goals, error } = await supabase
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
      .ilike('title', `%${query.trim()}%`)
      .limit(10);

    if (error) {
      console.error('Error searching goals:', error);
      return [];
    }

    if (!goals) {
      return [];
    }

    // Transform and score the results
    const suggestions: GoalSuggestion[] = goals.map((goal: any) => {
      const titleLower = goal.title.toLowerCase();
      const queryLower = query.toLowerCase().trim();
      let score = 0;

      // Scoring system for smart ranking
      if (titleLower === queryLower) {
        score = 100; // Exact match
      } else if (titleLower.startsWith(queryLower)) {
        score = 90; // Starts with query
      } else if (titleLower.split(' ').some((word: string) => word.startsWith(queryLower))) {
        score = 80; // Word starts with query
      } else if (titleLower.includes(' ' + queryLower)) {
        score = 70; // Word boundary match
      } else if (titleLower.includes(queryLower)) {
        score = 60; // Contains query
      }

      // Bonus for action verbs
      const actionVerb = goal.title.split(' ')[0].toLowerCase();
      if (actionVerb === queryLower) {
        score += 20;
      }

      return {
        id: goal.id,
        title: goal.title,
        arenaName: goal.categories?.arenas?.name || 'Unknown Arena',
        categoryName: goal.categories?.name || 'Unknown Category',
        score
      };
    });

    // Sort by score and return top results
    return suggestions
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

  } catch (error) {
    console.error('Error in searchGoals:', error);
    return [];
  }
}

async function getTrendingGoals(supabase: any): Promise<TrendingGoal[]> {
  try {
    const { data, error } = await supabase.rpc('get_trending_goals', {
      timeframe_days: 7,
      limit_count: 8
    });

    if (error) {
      console.error('Error fetching trending goals:', error);
      return [];
    }

    // Transform snake_case to camelCase
    return (data || []).map((row: TrendingGoalRow): TrendingGoal => ({
      id: row.id,
      title: row.title,
      emoji: row.emoji,
      solutionCount: Number(row.solution_count),
      avgEffectiveness: Number(row.avg_effectiveness),
      recentRatings: Number(row.recent_ratings),
      recentDiscussions: Number(row.recent_discussions),
      ratingsToday: Number(row.ratings_today),
      trendStatus: row.trend_status,
      activityScore: Number(row.activity_score)
    }));
  } catch (error) {
    console.error('Error in getTrendingGoals:', error);
    return [];
  }
}

async function getActivityFeed(supabase: any): Promise<ActivityEvent[]> {
  try {
    const { data, error } = await supabase.rpc('get_activity_feed', {
      hours_back: 24,
      limit_count: 20
    });

    if (error) {
      console.error('Error fetching activity feed:', error);
      return [];
    }

    // Transform snake_case to camelCase
    return (data || []).map((row: ActivityEventRow): ActivityEvent => ({
      activityType: row.activity_type,
      createdAt: new Date(row.created_at),
      goalTitle: row.goal_title,
      goalEmoji: row.goal_emoji,
      solutionTitle: row.solution_title || undefined,
      rating: row.rating || undefined,
      contentExcerpt: row.content_excerpt || undefined,
      upvotes: row.upvotes || undefined
    }));
  } catch (error) {
    console.error('Error in getActivityFeed:', error);
    return [];
  }
}

async function getFeaturedVerbatims(supabase: any): Promise<FeaturedVerbatim[]> {
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
      .limit(5);

    if (error) {
      console.error('Error fetching featured verbatims:', error);
      return [];
    }

    return (data || []).map((row: any): FeaturedVerbatim => {
      const createdAt = new Date(row.created_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      let timeBucket: FeaturedVerbatim['timeBucket'];
      if (hoursDiff < 24) timeBucket = 'today';
      else if (hoursDiff < 168) timeBucket = 'this week'; // 7 days
      else if (hoursDiff < 720) timeBucket = 'this month'; // 30 days
      else timeBucket = 'earlier';

      return {
        goalTitle: row.goals.title,
        goalEmoji: row.goals.emoji,
        content: row.content,
        upvotes: row.upvotes,
        createdAt,
        timeBucket
      };
    });
  } catch (error) {
    console.error('Error in getFeaturedVerbatims:', error);
    return [];
  }
}

async function getPlatformStats(supabase: any): Promise<PlatformStats> {
  try {
    const { data, error } = await supabase
      .from('platform_stats_cache')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching platform stats:', error);
      // Return fallback stats
      return {
        totalSolutions: 0,
        totalGoals: 0,
        avgEffectiveness: 0,
        activeUsersToday: 0,
        ratingsLastHour: 0,
        discussionsToday: 0
      };
    }

    const row: PlatformStatsRow = data;
    return {
      totalSolutions: Number(row.total_solutions),
      totalGoals: Number(row.total_goals),
      avgEffectiveness: Number(row.avg_effectiveness),
      activeUsersToday: Number(row.active_users_today),
      ratingsLastHour: Number(row.ratings_last_hour),
      discussionsToday: Number(row.discussions_today)
    };
  } catch (error) {
    console.error('Error in getPlatformStats:', error);
    // Return fallback stats
    return {
      totalSolutions: 0,
      totalGoals: 0,
      avgEffectiveness: 0,
      activeUsersToday: 0,
      ratingsLastHour: 0,
      discussionsToday: 0
    };
  }
}