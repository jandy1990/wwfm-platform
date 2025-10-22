# WWFM Dashboard

The WWFM Dashboard is a comprehensive user engagement hub that tracks contributions, rewards participation, and helps users understand their impact on the community.

## 📊 Dashboard Sections

### 1. Your Journey (Milestones Card)
**Purpose**: Show contribution point milestones and achievement history.

**Displays**:
- **Current Milestone**: User's current achievement level with emoji
- **Progress to Next**: Visual progress bar and points needed
- **Achievement History**: Chronological list of unlocked milestones
- **Mystery System**: Future milestones shown as blurred previews

**Data Source**:
- `app/actions/get-user-points.ts → getUserPoints()`
- `lib/milestones.ts` (SINGLE SOURCE OF TRUTH for all milestone data)

**Component**: `components/dashboard/MilestonesCard.tsx`

**Features**:
- **26 Total Milestones** (expanded from original 5):
  - **Early Journey (100-1,000)**: 7 milestones
  - **Mid Journey (1,000-5,000)**: 8 milestones
  - **Advanced Journey (5,000-10,000)**: 3 milestones
  - **Legendary Journey (10,000+)**: 8 stretch goals up to 1M points
- **Auto-backfill**: Automatically creates missing milestone records on load
- **Progressive Revelation**: Only shows current + next milestone clearly, future milestones blurred

**CRITICAL**: Always use `lib/milestones.ts` MILESTONES constant - never hardcode milestone data

### 2. Your Goals
**Purpose**: Display user's tracked goals for quick access.

**Component**: `components/dashboard/YourGoals.tsx`

**Status**: Working

### 3. Your Community Impact
**Purpose**: Show users their total contribution value and encourage continued engagement.

**Displays**:
- **Contribution Points**: Total points earned (prominently displayed with gradient)
- **Solutions Rated**: Count of solutions the user has rated
- **Discussions**: Number of discussion posts
- **Helpful Votes**: Upvotes received on discussions
- **Solutions Shared**: Solutions submitted by the user

**Data Source**: `app/actions/dashboard-data.ts → getUserImpactStats()`

**Dynamic Milestone Message**: Shows "X points to [next milestone name]" calculated from MILESTONES constant

### 4. How You Solve Problems
**Purpose**: Show users which solution types they gravitate toward based on their activity.

**Displays**:
- **Top 5 Solution Types**: Ranked by combined ratings + contributions with medal icons (🥇🥈🥉)
- **Activity Breakdown**: Shows count split (e.g., "5 rated, 2 contributed")
- **Progress Bars**: Visual representation of relative preference
- **Locked State**: Blurred preview until user reaches 5 total activities

**Data Source**: `app/actions/dashboard-data.ts → getSolutionTypePreferences()`

**Features**:
- Combines both ratings AND contributed solutions
- Shows top 5 only for focus
- Minimum threshold of 5 activities before display
- Gamified unlock experience for new users

### 5. Your Activity Timeline
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

### 6. Your Time Investment
**Purpose**: Help users see where they're spending time exploring solutions.

**Displays**:
- **Summary Stats**: Total time, most visited arena, areas explored
- **Time Distribution**: Clickable pie chart visualization
- **Detailed Breakdown**: Expandable list of all arenas with progress bars (hidden by default)
- **Time Period Toggle**: Switch between "All Time" and "Last 30 Days"

**Data Source**: `lib/services/arena-time-service.ts → ArenaTimeService`

**Component**: `app/dashboard/time/TimeTrackingDisplay.tsx`

**Features**:
- **Progressive Disclosure**: Click pie chart to reveal/hide detailed breakdown
- **Time Period Filter**: Toggle affects all sections (summary, pie chart, breakdown)
- Auto-syncs pending time from localStorage on load
- Show More/Less toggle (shows 5 arenas by default in detailed view)
- Highlights most visited arena in blue
- Smooth slide-down animation for expanding details

**Design Pattern**: Simple view by default, details on demand (reduces visual clutter ~50%)

### 7. Time & Long-term Value by Arena
**Purpose**: Visual comparison of time investment vs long-term value scores per arena.

**Displays**:
- **Dual Progress Bars** for each arena:
  - **Time bar (blue)**: Hours, minutes, and percentage of total time
  - **Long-term Value bar (green)**: Score out of 5 with percentage visualization
- **Goal count**: Number of goals tracked in each arena
- **Subtle AI notice**: Footer note about data source (not a large warning box)

**Data Source**: `app/actions/get-arena-value-insights.ts → getArenaValueInsights()`

**Component**: `components/dashboard/ArenaValueInsights.tsx`

**Time Period**: All-time by default (matches "Your Time Investment" section)

**Features**:
- Only displays arenas that have value scores (goals with wisdom data)
- Ranked by time percentage (most time → least time)
- Visual bars show alignment/misalignment without explanatory text
- Completely neutral, non-paternalistic language (no judgments or prescriptions)

**Design Philosophy**:
- **Let design do the talking**: Different bar lengths communicate insights visually
- **Neutral presentation**: No emojis, warnings, or interpretive language
- **Respect user intelligence**: Users can interpret their own data
- **Terminology precision**: "Long-term value" (6-month retrospective rating) not just "value"

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

**Activity-Based Milestones**:
- First rating
- 5th rating (Rating Streak!)
- 10th rating (Double Digits!)
- 25th rating (Quarter Century!)
- 50th rating (Half Century!)
- First discussion post
- 5th discussion (Voice of Wisdom!)
- First helpful vote
- 5th helpful vote (Helping Hand!)
- 10th helpful vote (Community Hero!)

**Points-Based Milestones** (26 total, from MILESTONES constant):
- All milestones from 100 to 1,000,000 points
- See `lib/milestones.ts` for complete list

### Technical Implementation
- **Hook**: `lib/hooks/useCelebrations.ts`
- **Component**: `app/dashboard/celebrations/CelebrationModal.tsx`
- **Library**: `canvas-confetti` for animations
- **Storage**: `localStorage` to track which milestones have been celebrated
- **Auto-dismiss**: After 8 seconds (increased from 5s for readability)

### Features
- Only shows once per milestone (won't repeat)
- Confetti animation on appearance (extra bursts for major milestones)
- Smooth bounce-in animation (fixed opacity bug)
- Gradient "Awesome! 🎉" button
- Listens for custom `milestoneAchieved` events from point awards

### Recent Fixes (October 2025)
- **Animation bug**: Fixed CSS keyframes to keep modal visible (was ending at `opacity: 0`)
- **Timeout**: Increased from 5s to 8s so users can actually read the message
- **Confetti trigger**: Fixed detection to properly identify milestone achievements

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

#### `getSolutionTypePreferences(userId)`
Returns:
```typescript
{
  solutionTypes: Array<{
    category: string
    ratedCount: number
    contributedCount: number
    totalCount: number
  }>
  totalActivity: number
}
```

### Client Components

**`app/dashboard/impact/ImpactDashboard.tsx`**
- Fetches impact stats on mount
- Displays contribution points prominently
- Shows 2×2 grid of stats
- Renders encouragement messages

**`app/dashboard/mastery/CategoryMastery.tsx`** (renamed to "How You Solve Problems")
- Combines ratings and contributions per solution category
- Shows top 5 solution types with progress bars
- Displays activity breakdown (rated vs contributed)
- Locked state with blur effect until 5 total activities

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

## 🎨 Design Principles

### 1. No Paternalistic Language
**CRITICAL RULE**: Never use language that judges, prescribes, or interprets user data.

❌ **DON'T**:
- "You should spend more time on X"
- "Warning: low value detected"
- "Opportunity to improve"
- Emojis suggesting judgment (⚠️, 💎, etc.)

✅ **DO**:
- Simple labels: "Time", "Long-term Value"
- Neutral presentation of facts
- Let visual design communicate insights
- Respect user's ability to interpret their own data

### 2. Progressive Disclosure
- Hide complexity by default
- Reveal details on user request
- Reduce cognitive load on initial view
- Example: Clickable pie chart → detailed breakdown

### 3. Visual Communication
- Use design elements (bar colors, lengths) to show relationships
- Minimize explanatory text
- Let users draw their own conclusions
- Example: Blue (time) vs green (long-term value) bars

### 4. Single Source of Truth
- **NEVER** hardcode milestone data
- Always reference `lib/milestones.ts`
- Prevents inconsistencies across dashboard sections

### 5. Terminology Precision
- "Long-term value" not "value" (refers to 6-month retrospective rating)
- "Time Investment" not "Time Spent" (more neutral)
- Avoid value judgments in all UI text

### Color Coding
- **Blue**: Time data, primary actions, top rankings
- **Green**: Long-term value scores
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
- `/lib/milestones.ts` - **SINGLE SOURCE OF TRUTH** for milestone data
- `/docs/database/schema.md` - Database schema
- `CLAUDE.md` - General project overview and data architecture

## 🐛 Debugging

### Previously Solved Issues (for reference)

**Achievement History showing "0 unlocked"** - SOLVED
- Now has auto-backfill mechanism in `MilestonesCard.tsx` (lines 38-46)
- Script available: `scripts/backfill-user-milestones.ts`

**Time periods mismatched between sections** - SOLVED
- Both sections now use all-time by default

**Celebration modal disappearing instantly** - SOLVED
- Fixed animation keyframes (now ends at `opacity: 1`)
- Increased timeout from 5s to 8s

**Note**: TypeScript type recursion with user_milestones can occur with Supabase auto-generated types. Workaround: `supabase as unknown as SupabaseClient<any>`

### Check User Points Calculation
```sql
SELECT
  email,
  contribution_points,
  calculate_contribution_points(id) as recalculated
FROM users
WHERE email = 'user@example.com';
```

### Check Milestone Records
```sql
SELECT
  milestone_key,
  threshold,
  points_at_achievement,
  achieved_at
FROM user_milestones
WHERE user_id = 'uuid'
ORDER BY achieved_at DESC;
```

### Check Activity Data
```sql
-- Ratings count
SELECT COUNT(*) FROM ratings WHERE user_id = 'uuid';

-- Discussions count
SELECT COUNT(*) FROM goal_discussions WHERE user_id = 'uuid';

-- Time tracking (all-time)
SELECT arena_name, SUM(seconds_spent) as total_seconds
FROM user_arena_time
WHERE user_id = 'uuid'
GROUP BY arena_name
ORDER BY total_seconds DESC;

-- Time tracking (last 30 days)
SELECT arena_name, SUM(seconds_spent) as total_seconds
FROM user_arena_time
WHERE user_id = 'uuid'
  AND date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY arena_name
ORDER BY total_seconds DESC;
```

### Backfill Missing Milestones
```bash
# Single user
npx tsx scripts/backfill-user-milestones.ts user@example.com

# All users
npx tsx scripts/backfill-user-milestones.ts all
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
