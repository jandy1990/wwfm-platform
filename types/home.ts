// types/home.ts - Home page data types

export interface TrendingGoal {
  id: string;
  title: string;
  emoji: string;
  solutionCount: number;
  avgEffectiveness: number;
  recentRatings: number;
  recentDiscussions: number;
  ratingsToday: number;
  trendStatus: 'hot' | 'rising' | 'stable';
  activityScore: number;
}

export interface ActivityEvent {
  activityType: 'rating' | 'discussion' | 'new_solution';
  createdAt: Date;
  goalTitle: string;
  goalEmoji: string;
  solutionTitle?: string;
  rating?: number;
  contentExcerpt?: string;
  upvotes?: number;
}

export interface FeaturedVerbatim {
  goalTitle: string;
  goalEmoji: string;
  content: string;
  upvotes: number;
  createdAt: Date;
  timeBucket: 'today' | 'this week' | 'this month' | 'earlier';
}

export interface PlatformStats {
  totalSolutions: number;
  totalGoals: number;
  avgEffectiveness: number;
  activeUsersToday: number;
  ratingsLastHour: number;
  discussionsToday: number;
}

export interface TopValueArena {
  id: string;
  slug: string;
  name: string;
  avgLastingValue: number;
  goalCount: number;
  description: string;
}

export interface HomePageData {
  trendingGoals: TrendingGoal[];
  activityFeed: ActivityEvent[];
  featuredVerbatims: FeaturedVerbatim[];
  platformStats: PlatformStats;
  topValueArenas: TopValueArena[];
}

// Database response types (snake_case from Supabase)
export interface TrendingGoalRow {
  id: string;
  title: string;
  emoji: string;
  solution_count: number;
  avg_effectiveness: number;
  recent_ratings: number;
  recent_discussions: number;
  ratings_today: number;
  trend_status: 'hot' | 'rising' | 'stable';
  activity_score: number;
}

export interface ActivityEventRow {
  activity_type: 'rating' | 'discussion' | 'new_solution';
  created_at: string;
  goal_title: string;
  goal_emoji: string;
  solution_title?: string;
  rating?: number;
  content_excerpt?: string;
  upvotes?: number;
}

export interface PlatformStatsRow {
  total_solutions: number;
  total_goals: number;
  avg_effectiveness: number;
  active_users_today: number;
  ratings_last_hour: number;
  discussions_today: number;
}

export interface GoalCategoryRaw {
  name: string | null
  arenas?: {
    name: string | null
  } | {
    name: string | null
  }[] | null
}

export interface GoalSuggestion {
  id: string;
  title: string;
  arenaName: string;
  categoryName: string;
  score: number;
}

export interface GoalSearchRow {
  id: string
  title: string
  categories?: GoalCategoryRaw | GoalCategoryRaw[] | null
}

export interface FeaturedVerbatimRow {
  content: string
  upvotes: number
  created_at: string
  goals: {
    title: string | null
    emoji: string | null
    is_approved: boolean | null
  } | {
    title: string | null
    emoji: string | null
    is_approved: boolean | null
  }[]
}
