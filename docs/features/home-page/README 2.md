# WWFM Home Page - Feature Specification & Implementation Guide

**Document Type**: Feature Specification  
**Feature**: Home Page / Activity Feed  
**Status**: Ready for Implementation  
**Created**: December 2024  
**Priority**: MVP Launch Requirement

---

## 📋 Executive Summary

WWFM currently lacks a home page - users land directly on the browse page. This specification outlines a **"Problem-First" home page** that immediately communicates value, shows platform vitality through real activity, and drives user engagement through search or contribution.

**Core Value Proposition**: "Find what actually works for life's challenges" - instantly searchable, backed by real data, proven by real people.

---

## 🎯 Product Goals

1. **Instant Value Communication**: Visitors understand what WWFM does in 5 seconds
2. **Build Trust**: Show real activity and success stories (anonymized)
3. **Drive Engagement**: Get users to search for solutions OR contribute their own
4. **Show Vitality**: Platform feels alive with recent activity, not static

---

## 🏗️ System Analysis & Available Data

### Current Architecture Assessment

#### **Existing Tables We Can Leverage**

1. **`ratings` table**
   - Tracks all solution ratings with timestamps
   - Can show recent rating activity (anonymized)
   - Fields: `user_id`, `solution_id`, `goal_id`, `effectiveness_score`, `created_at`

2. **`goal_discussions` table**
   - Contains rich verbatim content from users
   - Has upvotes to identify quality content
   - Fields: `goal_id`, `user_id`, `content`, `upvotes`, `reply_count`, `created_at`

3. **`goal_implementation_links` table**
   - Tracks goal-solution relationships
   - Shows effectiveness and rating counts
   - Can identify trending combinations

4. **`solutions` & `goals` tables**
   - Core content for display
   - Has all metadata (icons, descriptions, categories)

#### **Missing Infrastructure**

- ❌ No dedicated events/activity table
- ❌ No caching layer for aggregated data  
- ❌ No view tracking on goals
- ✅ Can build these with existing data

---

## 📊 Data Requirements & Queries

### 1. Trending Goals Query

```sql
-- Get top 8 trending goals from last 7 days
WITH recent_activity AS (
  SELECT 
    g.id,
    g.title,
    g.icon,
    COUNT(DISTINCT r.id) FILTER (WHERE r.created_at > NOW() - INTERVAL '7 days') as recent_ratings,
    COUNT(DISTINCT d.id) FILTER (WHERE d.created_at > NOW() - INTERVAL '7 days') as recent_discussions,
    COUNT(DISTINCT r.id) FILTER (WHERE r.created_at > NOW() - INTERVAL '1 day') as ratings_today
  FROM goals g
  LEFT JOIN ratings r ON r.goal_id = g.id
  LEFT JOIN goal_discussions d ON d.goal_id = g.id
  WHERE g.is_approved = true
  GROUP BY g.id
),
goal_stats AS (
  SELECT 
    g.id,
    COUNT(DISTINCT gil.id) as solution_count,
    AVG(gil.avg_effectiveness) as avg_effectiveness,
    SUM(gil.rating_count) as total_ratings
  FROM goals g
  LEFT JOIN goal_implementation_links gil ON gil.goal_id = g.id
  GROUP BY g.id
)
SELECT 
  ra.id,
  ra.title,
  ra.icon,
  ra.recent_ratings,
  ra.recent_discussions,
  ra.ratings_today,
  gs.solution_count,
  ROUND(gs.avg_effectiveness::numeric, 1) as avg_effectiveness,
  gs.total_ratings,
  CASE 
    WHEN ra.recent_ratings > 20 THEN 'hot'
    WHEN ra.recent_ratings > 10 THEN 'rising'
    ELSE 'stable'
  END as trend_status,
  (ra.recent_ratings * 2 + ra.recent_discussions * 3 + ra.ratings_today * 5) as activity_score
FROM recent_activity ra
JOIN goal_stats gs ON ra.id = gs.id
WHERE gs.solution_count > 0  -- Only show goals with solutions
ORDER BY activity_score DESC
LIMIT 8;
```

### 2. Activity Feed Query

```sql
-- Mixed activity feed (ratings + discussions)
-- Returns last 24 hours of activity, anonymized
WITH recent_ratings AS (
  SELECT 
    'rating' as activity_type,
    r.created_at,
    g.title as goal_title,
    g.icon as goal_icon,
    s.title as solution_title,
    r.effectiveness_score as rating,
    NULL::text as content_excerpt,
    NULL::integer as upvotes
  FROM ratings r
  JOIN goals g ON r.goal_id = g.id
  JOIN solutions s ON r.solution_id = s.id
  WHERE r.created_at > NOW() - INTERVAL '24 hours'
    AND g.is_approved = true
  ORDER BY r.created_at DESC
  LIMIT 30
),
recent_discussions AS (
  SELECT 
    'discussion' as activity_type,
    d.created_at,
    g.title as goal_title,
    g.icon as goal_icon,
    NULL as solution_title,
    NULL as rating,
    LEFT(d.content, 150) || CASE WHEN LENGTH(d.content) > 150 THEN '...' ELSE '' END as content_excerpt,
    d.upvotes
  FROM goal_discussions d
  JOIN goals g ON d.goal_id = g.id
  WHERE d.created_at > NOW() - INTERVAL '24 hours'
    AND d.upvotes > 0  -- Quality filter
    AND g.is_approved = true
  ORDER BY d.created_at DESC
  LIMIT 20
),
new_solutions AS (
  SELECT 
    'new_solution' as activity_type,
    gil.created_at,
    g.title as goal_title,
    g.icon as goal_icon,
    s.title as solution_title,
    gil.avg_effectiveness as rating,
    NULL as content_excerpt,
    NULL as upvotes
  FROM goal_implementation_links gil
  JOIN goals g ON gil.goal_id = g.id
  JOIN solution_variants sv ON gil.implementation_id = sv.id
  JOIN solutions s ON sv.solution_id = s.id
  WHERE gil.created_at > NOW() - INTERVAL '24 hours'
    AND g.is_approved = true
    AND gil.rating_count >= 1
  ORDER BY gil.created_at DESC
  LIMIT 10
)
SELECT * FROM (
  SELECT * FROM recent_ratings
  UNION ALL
  SELECT * FROM recent_discussions
  UNION ALL
  SELECT * FROM new_solutions
) combined
ORDER BY created_at DESC
LIMIT 20;
```

### 3. Featured Verbatims Query

```sql
-- High-quality discussion excerpts for testimonials
SELECT 
  g.title as goal_title,
  g.icon as goal_icon,
  d.content,
  d.upvotes,
  d.created_at,
  CASE 
    WHEN d.created_at > NOW() - INTERVAL '1 day' THEN 'today'
    WHEN d.created_at > NOW() - INTERVAL '7 days' THEN 'this week'
    WHEN d.created_at > NOW() - INTERVAL '30 days' THEN 'this month'
    ELSE 'earlier'
  END as time_bucket
FROM goal_discussions d
JOIN goals g ON d.goal_id = g.id
WHERE 
  d.upvotes >= 10  -- Minimum quality threshold
  AND LENGTH(d.content) >= 100  -- Substantial content
  AND d.created_at > NOW() - INTERVAL '30 days'
  AND g.is_approved = true
  AND d.content NOT LIKE '%spam%'  -- Basic content filtering
  AND d.content NOT LIKE '%click here%'
ORDER BY d.upvotes DESC, d.created_at DESC
LIMIT 5;
```

### 4. Platform Stats Query

```sql
-- Real-time platform statistics
SELECT 
  (SELECT COUNT(*) FROM solutions WHERE is_approved = true) as total_solutions,
  (SELECT COUNT(*) FROM goals WHERE is_approved = true) as total_goals,
  (SELECT ROUND(AVG(avg_effectiveness)::numeric, 1) FROM goal_implementation_links WHERE rating_count > 0) as avg_effectiveness,
  (SELECT COUNT(DISTINCT user_id) FROM ratings WHERE created_at > NOW() - INTERVAL '24 hours') as active_users_today,
  (SELECT COUNT(*) FROM ratings WHERE created_at > NOW() - INTERVAL '1 hour') as ratings_last_hour,
  (SELECT COUNT(*) FROM goal_discussions WHERE created_at > NOW() - INTERVAL '24 hours') as discussions_today;
```

---

## 🎨 Component Architecture

### File Structure
```
app/
├── page.tsx                    # Home page (Server Component)
├── actions/
│   └── home.ts                 # Server actions for data fetching
└── components/
    └── home/
        ├── HeroSection.tsx     # Hero with search
        ├── TrendingGoals.tsx   # Trending goals grid
        ├── ActivityFeed.tsx    # Real-time activity
        ├── Verbatims.tsx       # Featured testimonials
        └── BrowseArenas.tsx    # Arena navigation
```

### TypeScript Interfaces

```typescript
// types/home.ts

export interface TrendingGoal {
  id: string;
  title: string;
  icon: string;
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
  goalIcon: string;
  solutionTitle?: string;
  rating?: number;
  contentExcerpt?: string;
  upvotes?: number;
}

export interface FeaturedVerbatim {
  goalTitle: string;
  goalIcon: string;
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

export interface HomePageData {
  trendingGoals: TrendingGoal[];
  activityFeed: ActivityEvent[];
  featuredVerbatims: FeaturedVerbatim[];
  platformStats: PlatformStats;
  arenas: Arena[];  // Already exists in your types
}
```

### Server Actions Implementation

```typescript
// app/actions/home.ts
'use server'

import { createServerSupabaseClient } from '@/lib/database/server';
import type { HomePageData, TrendingGoal, ActivityEvent } from '@/types/home';

export async function getHomePageData(): Promise<HomePageData> {
  const supabase = await createServerSupabaseClient();
  
  // Fetch all data in parallel for performance
  const [
    trendingGoals,
    activityFeed,
    featuredVerbatims,
    platformStats,
    arenas
  ] = await Promise.all([
    getTrendingGoals(supabase),
    getActivityFeed(supabase),
    getFeaturedVerbatims(supabase),
    getPlatformStats(supabase),
    getArenas(supabase)
  ]);

  return {
    trendingGoals,
    activityFeed,
    featuredVerbatims,
    platformStats,
    arenas
  };
}

async function getTrendingGoals(supabase: any): Promise<TrendingGoal[]> {
  // Implementation using the SQL query above
  const { data, error } = await supabase.rpc('get_trending_goals', {
    timeframe_days: 7,
    limit_count: 8
  });
  
  if (error) {
    console.error('Error fetching trending goals:', error);
    return [];
  }
  
  return data || [];
}

// Additional function implementations...
```

---

## 🖼️ UI Layout Specification

### Hero Section
```jsx
<section className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-16">
  <div className="max-w-7xl mx-auto px-4">
    <h1 className="text-5xl font-bold text-center mb-4">
      Find what actually works for life's challenges
    </h1>
    <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-8">
      3,873 proven solutions from real people, rated by effectiveness
    </p>
    
    {/* Large Search Bar */}
    <div className="max-w-2xl mx-auto">
      <SearchBar placeholder="Try 'reduce anxiety' or 'sleep better'" />
    </div>
    
    {/* Live Stats Ticker */}
    <div className="flex justify-center gap-8 mt-8">
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">{stats.totalSolutions}</div>
        <div className="text-sm text-gray-600">Solutions</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">{stats.avgEffectiveness}★</div>
        <div className="text-sm text-gray-600">Avg Rating</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">{stats.activeUsersToday}</div>
        <div className="text-sm text-gray-600">Active Today</div>
      </div>
    </div>
  </div>
</section>
```

### Trending Goals Grid
```jsx
<section className="py-12">
  <div className="max-w-7xl mx-auto px-4">
    <h2 className="text-2xl font-bold mb-6">Trending This Week</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {trendingGoals.map(goal => (
        <TrendingGoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  </div>
</section>
```

### Activity Feed with Verbatims
```jsx
<section className="py-12 bg-gray-50 dark:bg-gray-900">
  <div className="max-w-7xl mx-auto px-4">
    <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
    <div className="space-y-4">
      {activityFeed.map((event, idx) => (
        <ActivityCard key={idx} event={event} />
      ))}
    </div>
  </div>
</section>
```

---

## 🚀 Implementation Plan

### Phase 1: Database Setup (2 hours)
1. Create database functions for trending goals query
2. Create indexes on `created_at` columns for performance
3. Create RPC functions for complex queries
4. Test queries in Supabase SQL editor

### Phase 2: Server Components (4 hours)
1. Create home page route (`app/page.tsx`)
2. Implement server actions (`app/actions/home.ts`)
3. Create type definitions (`types/home.ts`)
4. Build data fetching with error handling

### Phase 3: UI Components (6 hours)
1. Build HeroSection with search integration
2. Create TrendingGoals grid component
3. Implement ActivityFeed with mixed content types
4. Add FeaturedVerbatims carousel
5. Reuse existing BrowseArenas component

### Phase 4: Optimization (2 hours)
1. Add caching layer for trending goals (5-minute TTL)
2. Implement pagination for activity feed
3. Add loading states and error boundaries
4. Optimize for Core Web Vitals

### Phase 5: Testing & Polish (2 hours)
1. Test with various data states (empty, partial, full)
2. Ensure mobile responsiveness
3. Add analytics tracking
4. Performance testing with Lighthouse

---

## ⚠️ Important Considerations

### Privacy & Data Protection
- **Never expose user IDs or usernames** in activity feed
- Use relative timestamps ("2 hours ago" not "3:47 PM")
- Aggregate all metrics (no individual user stats)
- Verbatims shown only when upvoted (implicit permission)

### Performance Requirements
- Initial page load < 2 seconds
- Time to Interactive < 3 seconds
- Lighthouse score > 90
- Support for 1000+ concurrent users

### SEO Requirements
- Server-side rendered for all content
- Structured data markup for search engines
- Meta tags with dynamic content
- Sitemap integration

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation for all interactive elements
- Screen reader friendly activity feed
- High contrast mode support

---

## 📐 Database Migrations Required

```sql
-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goal_discussions_created_at ON goal_discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goal_discussions_upvotes ON goal_discussions(upvotes DESC);

-- Create function for trending goals
CREATE OR REPLACE FUNCTION get_trending_goals(
  timeframe_days INTEGER DEFAULT 7,
  limit_count INTEGER DEFAULT 8
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  icon TEXT,
  solution_count BIGINT,
  avg_effectiveness NUMERIC,
  recent_ratings BIGINT,
  recent_discussions BIGINT,
  trend_status TEXT,
  activity_score BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Implementation of the trending goals query
  -- See SQL query in section above
END;
$$;

-- Create materialized view for platform stats (refresh every 5 minutes)
CREATE MATERIALIZED VIEW IF NOT EXISTS platform_stats_cache AS
SELECT 
  (SELECT COUNT(*) FROM solutions WHERE is_approved = true) as total_solutions,
  (SELECT COUNT(*) FROM goals WHERE is_approved = true) as total_goals,
  -- etc...
WITH DATA;

-- Create refresh job
CREATE OR REPLACE FUNCTION refresh_platform_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY platform_stats_cache;
END;
$$ LANGUAGE plpgsql;
```

---

## 🧪 Test Cases

### Critical User Flows
1. **First-time visitor**: Can understand value prop in 5 seconds
2. **Search flow**: Can search and get results without auth
3. **Browse flow**: Can navigate to arenas and goals
4. **Engagement flow**: Can see activity and feel platform is alive

### Edge Cases to Handle
- No trending goals (new platform state)
- No recent activity (quiet period)
- Single solution/goal (early stage)
- Massive activity spike (viral moment)

### Performance Tests
- Load test with 1000 concurrent users
- Test with slow 3G connection
- Test with JavaScript disabled (SSR fallback)
- Test with ad blockers enabled

---

## 📝 Success Metrics

### Launch Metrics (Day 1)
- Page load time < 2 seconds
- Bounce rate < 40%
- Search engagement > 30%
- Click-through to goals > 20%

### Growth Metrics (Month 1)
- Return visitor rate > 25%
- Time on page > 45 seconds
- Goals explored per session > 2
- Contribution conversion > 5%

---

## 🔗 Related Documentation

- [ARCHITECTURE.md](/ARCHITECTURE.md) - System architecture
- [Database Schema](/docs/database/schema.md) - Complete database structure
- [Search Implementation](/docs/architecture/SOLUTION_SEARCH_DATA_FLOW.md) - Search pipeline
- [UI Components](/components/README.md) - Existing component library

---

## 🎯 Definition of Done

- [ ] All queries execute in < 100ms
- [ ] Page loads in < 2 seconds
- [ ] Mobile responsive (tested on 5 devices)
- [ ] Accessibility audit passed
- [ ] Error boundaries implemented
- [ ] Loading states for all async operations
- [ ] Analytics tracking implemented
- [ ] SEO meta tags configured
- [ ] Documented in main README
- [ ] Deployed to staging for testing

---

## 👤 Implementation Owner

**Claude Code** should implement this feature following the specifications above. All necessary context, queries, and requirements are documented. The implementation should prioritize:

1. **Correctness**: Queries return accurate data
2. **Performance**: Fast page loads and interactions
3. **Maintainability**: Clean, documented code
4. **User Experience**: Smooth, intuitive interface

---

**End of Specification**

*Last Updated: December 2024*
*Status: Ready for Implementation*
*Next Step: Begin Phase 1 (Database Setup)*
