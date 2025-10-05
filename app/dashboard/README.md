# WWFM Dashboard

The WWFM Dashboard is a comprehensive user engagement hub that tracks contributions, rewards participation, and helps users understand their impact on the community.

## 📊 Dashboard Sections

### 1. Your Community Impact
**Purpose**: Show users their total contribution value and encourage continued engagement.

**Displays**:
- **Contribution Points**: Total points earned (prominently displayed with gradient)
- **Solutions Rated**: Count of solutions the user has rated
- **Discussions**: Number of discussion posts
- **Helpful Votes**: Upvotes received on discussions
- **Solutions Shared**: Solutions submitted by the user

**Data Source**: `app/actions/dashboard-data.ts → getUserImpactStats()`

**Milestones**:
- 100 points: Contributor
- 500 points: Active Member
- 1,000 points: Community Builder
- 5,000 points: Expert Contributor
- 10,000 points: Legend

### 2. Category Mastery
**Purpose**: Encourage users to explore diverse solution types and track expertise areas.

**Displays**:
- **Explored Categories**: Top categories by rating count with medal icons (🥇🥈🥉)
- **Time Spent**: Shows arena browsing time per category (e.g., "⏱️ 15m")
- **Unexplored Categories**: Suggests new areas to explore

**Data Source**: `app/actions/dashboard-data.ts → getCategoryMastery()`

**Features**:
- Combines rating activity with time tracking data
- Shows "Top" badge for #1 category
- Displays all 23 solution categories

### 3. Your Activity Timeline
**Purpose**: Provide a chronological view of all user actions across the platform.

**Activity Types**:
- **Ratings**: "⭐ Rated [solution] for [goal]" with effectiveness stars
- **Arena Browsing**: "👁️ Explored [arena] for [duration]"
- **Discussions**: "💬 Commented on [goal]" with upvote count

**Data Source**: `app/actions/dashboard-data.ts → getUserActivityTimeline()`

**Features**:
- Groups activities by date
- Shows most recent 20 activities
- Mixed feed from ratings, user_arena_time, and goal_discussions tables

### 4. Your Time Investment
**Purpose**: Help users see where they're spending time exploring solutions.

**Displays**:
- **Summary Stats**: Total time, most visited arena, areas explored
- **Time Distribution**: Pie chart visualization
- **Detailed Breakdown**: List of all arenas with progress bars

**Data Source**: `lib/services/arena-time-service.ts → ArenaTimeService`

**Features**:
- Auto-syncs pending time from localStorage
- Show More/Less toggle (shows 5 arenas by default)
- Highlights most visited arena in blue

## 🎯 Contribution Points System

### Point Values

#### Core Actions
- **Submit a Solution**: 50 points
- **Rate a Solution**: 5 points (basic) or 8 points (detailed with 3+ optional fields)
- **Write a Discussion**: 10 points (minimum 50 characters)
- **Receive Upvote on Discussion**: 2 points per upvote

#### Bonuses
- **Early Solution Rater**: +5 points (if in first 3 raters of a solution)
- **Category Diversity**: +10 points (first rating in each new category)

### Time-Based Early Adopter Multiplier

**The Big Innovation**: Early contributors get massively higher rewards that decay over time.

#### The Formula
```
multiplier = 10.0 × e^(-0.003 × days_since_launch)
```

Where:
- **10.0** = Maximum multiplier at launch
- **0.003** = Decay constant (1% daily decay)
- **e** = Natural exponential base (2.71828...)
- **days_since_launch** = Days since October 4, 2025

#### Multiplier Timeline
| Time Period | Multiplier | Example: 5pt Rating Becomes |
|-------------|------------|----------------------------|
| Launch Day  | 10.0x      | 50 points                  |
| Week 1      | 9.8x       | 49 points                  |
| Month 1     | 9.1x       | 46 points                  |
| Month 3     | 7.6x       | 38 points                  |
| Month 6     | 5.8x       | 29 points                  |
| Year 1      | 3.4x       | 17 points                  |
| Year 2      | 1.1x       | 6 points                   |
| Year 3+     | 1.0x       | 5 points                   |

#### Why This Matters
- **Rewards Risk**: Early contributors help build when there's less content
- **Permanent**: Points are locked in at contribution time
- **Fair**: Never penalizes (minimum 1.0x)
- **Transparent**: Clear mathematical formula
- **Universal**: Applies to all contribution types

#### Real Example
A user who rates 10 solutions on launch day:
- Base points: 10 × 5 = 50 points
- With 10x multiplier: 50 × 10 = **500 points**

The same 10 ratings one year later:
- Base points: 10 × 5 = 50 points
- With 3.4x multiplier: 50 × 3.4 = **170 points**

### Calculation Implementation

Points are calculated via PostgreSQL function:
```sql
calculate_contribution_points(user_id) → INTEGER
```

**Auto-updates via triggers on**:
- `ratings` table (INSERT)
- `solutions` table (INSERT/UPDATE)
- `goal_discussions` table (INSERT/UPDATE)

**Manual recalculation**:
```sql
SELECT calculate_contribution_points('user-uuid');
```

## 🎉 Micro-Celebrations

**Purpose**: Reward milestone achievements with delightful animations.

### Celebration Triggers
- First rating
- 5th rating (Rating Streak!)
- 10th rating (Double Digits!)
- First discussion post
- 3rd discussion (Conversation Starter!)
- First solution submitted
- 500 contribution points
- 1,000 contribution points (1K Club!)
- 5,000 contribution points (Top Contributor!)
- 10,000 contribution points (Legend!)
- 5 categories explored
- 10 categories explored (Category Explorer!)
- 15 categories explored (Renaissance User!)
- All categories explored (Category Master!)

### Technical Implementation
- **Hook**: `lib/hooks/useCelebrations.ts`
- **Component**: `app/dashboard/celebrations/CelebrationModal.tsx`
- **Library**: `canvas-confetti` for animations
- **Storage**: `localStorage` to track which milestones have been celebrated
- **Auto-dismiss**: After 5 seconds

### Features
- Only shows once per milestone (won't repeat)
- Confetti animation on appearance
- Bounce-in animation
- Gradient "Awesome! 🎉" button

## 🏗️ Technical Architecture

### Server Actions (`app/actions/dashboard-data.ts`)

#### `getUserImpactStats(userId)`
Returns:
```typescript
{
  contributionPoints: number
  ratingsCount: number
  solutionsCount: number
  commentsCount: number
  helpfulVotes: number
}
```

#### `getUserActivityTimeline(userId)`
Returns:
```typescript
Array<{
  type: 'rating' | 'arena' | 'discussion'
  data: RatingData | ArenaTimeData | DiscussionData
  date: string
}>
```

#### `getCategoryMastery(userId)`
Returns:
```typescript
{
  explored: Array<{
    category: string
    count: number
    timeSpent: number
  }>
  unexplored: string[]
  arenaTime: Record<string, number>
}
```

### Client Components

**`app/dashboard/impact/ImpactDashboard.tsx`**
- Fetches impact stats on mount
- Displays contribution points prominently
- Shows 2×2 grid of stats
- Renders encouragement messages

**`app/dashboard/mastery/CategoryMastery.tsx`**
- Shows explored categories with medals
- Displays time spent per category
- Lists unexplored opportunities
- Maps category slugs to display names

**`app/dashboard/activity/ActivityTimeline.tsx`**
- Groups activities by date
- Renders different layouts per activity type
- Chronologically sorted (newest first)

**`app/dashboard/time/TimeTrackingDisplay.tsx`**
- Auto-syncs pending time on load
- Pie chart visualization
- Detailed list with show more/less
- Displays time formatted (e.g., "1h 23m")

### State Management
All components use:
```typescript
const [data, setData] = useState<DataType | null>(null)

useEffect(() => {
  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const result = await serverAction(user.id)
      setData(result)
    }
  }
  loadData()
}, [])
```

### Database Functions

**`get_early_adopter_multiplier(timestamp)`**
- Calculates time-based multiplier
- Immutable function (can be cached)
- Returns NUMERIC (2 decimal places)

**`calculate_contribution_points(user_id)`**
- Sums all contributions with multipliers
- Applies bonuses (early rater, diversity)
- Returns INTEGER (rounded total)

**`update_user_contribution_points(user_id)`**
- Updates `users.contribution_points`
- Called by triggers automatically

## 📱 Responsive Design

### Desktop (lg+)
- 2-column grid for Impact + Mastery
- Full-width Activity Timeline
- 2-column Time Tracking (pie chart + list)

### Mobile
- Stacked single column
- Compact stat cards
- Touch-friendly buttons
- Scrollable lists

## 🎨 Styling Patterns

### Color Coding
- **Blue**: Primary actions, top rankings
- **Yellow**: Top category badges
- **Gradient**: Contribution points card
- **Gray**: Default/neutral states

### Dark Mode
All components support dark mode via Tailwind's `dark:` variants:
```tsx
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
```

## 🚀 Future Enhancements

### Planned Features
- [ ] Weekly/monthly leaderboards
- [ ] Category-specific expertise levels
- [ ] Contribution streaks
- [ ] Social sharing of milestones
- [ ] Email notifications for celebrations
- [ ] Referral bonuses
- [ ] Seasonal challenges with bonus points

### Performance Optimizations
- [ ] Cache contribution points calculations
- [ ] Lazy load activity timeline
- [ ] Virtual scrolling for long lists
- [ ] Server-side pagination

## 📖 Related Documentation
- `/docs/contribution-points-system.md` - Detailed points formula
- `/lib/services/arena-time-service.ts` - Time tracking service
- `/docs/database/schema.md` - Database schema

## 🐛 Debugging

### Check User Points Calculation
```sql
SELECT
  email,
  contribution_points,
  calculate_contribution_points(id) as recalculated
FROM users
WHERE email = 'user@example.com';
```

### Check Activity Data
```sql
-- Ratings count
SELECT COUNT(*) FROM ratings WHERE user_id = 'uuid';

-- Discussions count
SELECT COUNT(*) FROM goal_discussions WHERE user_id = 'uuid';

-- Time tracking
SELECT * FROM user_arena_time WHERE user_id = 'uuid';
```

### Recalculate All Points
```sql
UPDATE users
SET contribution_points = calculate_contribution_points(id)
WHERE id IS NOT NULL;
```

## 📝 Contributing

When adding new dashboard features:

1. **Create server action** in `app/actions/dashboard-data.ts`
2. **Create component** in appropriate subfolder (`impact/`, `mastery/`, etc.)
3. **Add to main dashboard** in `app/dashboard/page.tsx`
4. **Update this README** with the new section
5. **Add celebration trigger** if it's a milestone-worthy feature

## 🔐 Security

- All server actions verify user authentication
- RLS policies enforce data access
- Client-side state only loads authenticated user's data
- No sensitive data exposed in client components
