# Home Page Implementation Quick Reference

## Primary Documentation
📁 **`/docs/features/home-page/README.md`** - Complete specification with all requirements, queries, and implementation details

## Key Sections in Main Spec

### Data Requirements (Lines 77-195)
- Trending Goals Query (SQL)
- Activity Feed Query (SQL) 
- Featured Verbatims Query (SQL)
- Platform Stats Query (SQL)

### Component Architecture (Lines 197-284)
- TypeScript interfaces for all data types
- Component file structure
- Server action patterns

### UI Specifications (Lines 286-346)
- Hero section layout
- Trending goals grid design
- Activity feed structure
- Responsive considerations

### Database Setup (Lines 348-386)
- Required indexes
- Database functions to create
- Materialized view for stats cache

## Related System Files to Reference

### For Understanding Current Data Model:
- `/types/supabase.ts` - Database type definitions
- `/docs/database/schema.md` - Complete database structure
- `/components/goal/CommunityDiscussions.tsx` - Existing discussion component
- `/components/goal/AddDiscussionForm.tsx` - Discussion creation flow

### For Implementing Search:
- `/components/organisms/SearchBar.tsx` - Existing search component (if exists)
- `/docs/architecture/SOLUTION_SEARCH_DATA_FLOW.md` - Search implementation details

### For Ratings System:
- `/components/organisms/solutions/InteractiveRating.tsx` - Rating component
- `/components/molecules/RatingDisplay.tsx` - Rating display

### For Navigation:
- `/app/browse/page.tsx` - Current browse page structure
- `/components/layout/` - Layout components

## Implementation Checklist

### Phase 1: Database Setup ⏱️ 2 hours
- [ ] Create indexes on created_at columns
- [ ] Create get_trending_goals() function
- [ ] Create get_activity_feed() function
- [ ] Create platform_stats_cache materialized view
- [ ] Test all queries in Supabase SQL editor

### Phase 2: Server Components ⏱️ 4 hours
- [ ] Create `/app/page.tsx` (home page route)
- [ ] Create `/app/actions/home.ts` (data fetching)
- [ ] Create `/types/home.ts` (TypeScript interfaces)
- [ ] Implement error handling and loading states

### Phase 3: UI Components ⏱️ 6 hours
- [ ] Build HeroSection with search
- [ ] Create TrendingGoals grid
- [ ] Implement ActivityFeed component
- [ ] Add FeaturedVerbatims section
- [ ] Integrate existing BrowseArenas component

### Phase 4: Optimization ⏱️ 2 hours
- [ ] Add caching for trending goals
- [ ] Implement pagination for activity feed
- [ ] Optimize bundle size
- [ ] Performance testing with Lighthouse

### Phase 5: Testing & Polish ⏱️ 2 hours
- [ ] Test empty states
- [ ] Mobile responsiveness check
- [ ] Accessibility audit
- [ ] Final UI polish

## SQL Query Templates

### Get Trending Goals (Use in Supabase Function)
```sql
-- See lines 83-117 in /docs/features/home-page/README.md
```

### Get Activity Feed (Use in Server Action)
```sql
-- See lines 121-176 in /docs/features/home-page/README.md
```

### Get Featured Verbatims (Use in Server Action)
```sql
-- See lines 180-195 in /docs/features/home-page/README.md
```

## Component Structure Template

```typescript
// app/page.tsx
import { getHomePageData } from '@/app/actions/home';
import HeroSection from '@/components/home/HeroSection';
import TrendingGoals from '@/components/home/TrendingGoals';
import ActivityFeed from '@/components/home/ActivityFeed';
import FeaturedVerbatims from '@/components/home/FeaturedVerbatims';
import BrowseArenas from '@/components/home/BrowseArenas';

export default async function HomePage() {
  const data = await getHomePageData();
  
  return (
    <main>
      <HeroSection stats={data.platformStats} />
      <TrendingGoals goals={data.trendingGoals} />
      <ActivityFeed events={data.activityFeed} />
      <FeaturedVerbatims verbatims={data.featuredVerbatims} />
      <BrowseArenas arenas={data.arenas} />
    </main>
  );
}
```

## Notes for Claude Code

1. **Start with database setup** - The queries are complex and need to be tested
2. **Keep everything server-side** for SEO and initial performance
3. **Use existing components** where possible (search, ratings, etc.)
4. **Follow privacy requirements** - Never show usernames, use relative timestamps
5. **Test with empty states** - Platform might have quiet periods

## Success Criteria

✅ Page loads in < 2 seconds
✅ Shows real activity (anonymized)
✅ Search works without authentication
✅ Mobile responsive
✅ Accessible (WCAG 2.1 AA)
✅ No console errors
✅ Graceful empty states

---

**Remember**: The complete specification with all details is in `/docs/features/home-page/README.md`
