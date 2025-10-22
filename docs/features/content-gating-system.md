# Content Gating System - Feature Specification

> **Status**: Ready for Implementation
> **Priority**: High - Growth & Monetization Foundation
> **Timeline**: ~8-12 hours implementation + 4 hours testing
> **Future**: Subscription paywall foundation

---

## 🎯 Executive Summary

Implement a two-tier content gating system that requires user login to access full platform features, creating value differentiation and preparing for future subscription monetization.

### Key Requirements
1. **Solutions Tab**: Limit anonymous users to first 5 solutions (by effectiveness), hide filtering/sorting
2. **Community Tab**: Show all top-level comments to anonymous users, hide reply content (show count only)
3. **Enforcement**: Server-side RLS + client-side blur/preview patterns
4. **UX Pattern**: Glassdoor/Medium-style progressive reveal with login CTA

---

## 📊 User Stories

### Story 1: Anonymous User Views Solutions
```
AS AN anonymous user
WHEN I visit a goal page
THEN I see the top 5 most effective solutions
AND I see a blur overlay on positions 6+
AND I see a "Sign in to view 47 more solutions" CTA
AND I cannot change sorting (locked to effectiveness)
AND I cannot use any filters
```

### Story 2: Logged-In User Views Solutions
```
AS A logged-in user
WHEN I visit a goal page
THEN I see ALL solutions
AND I can sort by any criteria
AND I can filter by any attribute
AND I see no blur overlays or CTAs
```

### Story 3: Anonymous User Views Discussions
```
AS AN anonymous user
WHEN I view the Community tab
THEN I see all top-level discussion posts (full content)
AND for posts with replies:
  - I see "View 3 replies" button with icon
  - Clicking shows blur overlay with "Sign in to read replies" CTA
  - Reply content is hidden from DOM (not just CSS)
AND I can upvote top-level posts (requires login prompt)
```

### Story 4: Logged-In User Views Discussions
```
AS A logged-in user
WHEN I view the Community tab
THEN I see all discussions AND all replies
AND I can upvote any post/reply
AND I can create new posts/replies
AND I see no gating or blur overlays
```

---

## 🏗️ Technical Architecture

### Solution Gating Approach

#### Server-Side (Primary Enforcement)
```typescript
// /app/goal/[id]/page.tsx - Server Component
async function GoalPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch solutions with conditional limiting
  const solutionQuery = supabase
    .from('goal_implementation_links')
    .select(...)
    .eq('goal_id', params.id)
    .order('avg_effectiveness', { ascending: false });

  // Apply limit for anonymous users
  if (!user) {
    solutionQuery.limit(5);
  }

  const { data: solutions } = await solutionQuery;

  return (
    <GoalPageClient
      solutions={solutions}
      isAuthenticated={!!user}
      totalSolutionCount={totalCount} // For "X more solutions" message
    />
  );
}
```

#### Client-Side (UX Layer)
```typescript
// /components/goal/GoalPageClient.tsx
interface GoalPageClientProps {
  solutions: GoalSolutionWithVariants[];
  isAuthenticated: boolean;
  totalSolutionCount: number;
}

function GoalPageClient({ solutions, isAuthenticated, totalSolutionCount }: Props) {
  const remainingSolutions = totalSolutionCount - solutions.length;
  const showGate = !isAuthenticated && remainingSolutions > 0;

  return (
    <>
      {solutions.map(solution => <SolutionCard {...solution} />)}

      {showGate && (
        <ContentGate
          type="solutions"
          hiddenCount={remainingSolutions}
          ctaText={`Sign in to view ${remainingSolutions} more solutions`}
        />
      )}

      {/* Disable sorting/filtering for anonymous */}
      <SortingControls disabled={!isAuthenticated} />
      <FilterControls disabled={!isAuthenticated} />
    </>
  );
}
```

### Discussion Gating Approach

#### Server-Side (Conditional Reply Fetching)
```typescript
// /components/goal/CommunityDiscussions.tsx
async function fetchDiscussions(goalId: string, userId: string | null) {
  const supabase = createClient();

  // Fetch top-level discussions (always visible)
  const { data: discussions } = await supabase
    .from('goal_discussions')
    .select(`
      *,
      users (username, avatar_url)
    `)
    .eq('goal_id', goalId)
    .is('parent_id', null)
    .order('upvotes', { ascending: false });

  // Fetch replies ONLY for authenticated users
  if (userId) {
    const discussionsWithReplies = await Promise.all(
      discussions.map(async (discussion) => {
        const { data: replies } = await supabase
          .from('goal_discussions')
          .select(...)
          .eq('parent_id', discussion.id);

        return { ...discussion, replies };
      })
    );
    return discussionsWithReplies;
  }

  // For anonymous users, return discussions with empty replies
  // but preserve reply_count for the "X replies" indicator
  return discussions.map(d => ({ ...d, replies: [] }));
}
```

#### Client-Side (Reply Gate Component)
```typescript
// /components/goal/ReplyGate.tsx
interface ReplyGateProps {
  replyCount: number;
  discussionId: string;
  isAuthenticated: boolean;
}

function ReplyGate({ replyCount, discussionId, isAuthenticated }: Props) {
  const [showGate, setShowGate] = useState(false);

  if (isAuthenticated) {
    return null; // No gate for authenticated users
  }

  return (
    <div className="mt-4 relative">
      <button
        onClick={() => setShowGate(true)}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
      >
        <MessageSquare className="w-4 h-4" />
        <span>View {replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
      </button>

      {showGate && (
        <div className="absolute inset-0 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-lg p-6 flex flex-col items-center justify-center z-10">
          <Lock className="w-8 h-8 text-gray-400 mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Sign in to read replies
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
            Join the conversation with {replyCount} other members
          </p>
          <Link
            href="/auth/signin"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
```

---

## 🗄️ Database Changes

### New RLS Policies

#### 1. Goal Discussions - Public Read for Top-Level Only
```sql
-- Allow public to read top-level discussions (parent_id IS NULL)
CREATE POLICY "public_read_top_level_discussions"
ON goal_discussions FOR SELECT
USING (
  parent_id IS NULL AND
  is_flagged = FALSE
);

-- Allow authenticated users to read all discussions including replies
CREATE POLICY "authenticated_read_all_discussions"
ON goal_discussions FOR SELECT
TO authenticated
USING (
  is_flagged = FALSE
);
```

#### 2. Discussion Votes - Public Read, Authenticated Write
```sql
-- Keep existing vote policies, just verify they allow:
-- - Public SELECT (to show vote counts)
-- - Authenticated INSERT (to vote)
```

### Schema Changes
**None required** - Current schema supports the feature.

---

## 🎨 Component Changes

### 1. New Components

#### `/components/auth/ContentGate.tsx`
**Purpose**: Reusable blur overlay gate for any gated content
```typescript
interface ContentGateProps {
  type: 'solutions' | 'replies' | 'custom';
  hiddenCount: number;
  ctaText: string;
  ctaAction?: string; // Default: '/auth/signin'
  className?: string;
}

// Features:
// - Glassdoor-style blur gradient
// - Prominent "Sign In" CTA button
// - Count indicator ("47 more solutions")
// - Responsive design
// - Dark mode support
```

#### `/components/auth/LoginPrompt.tsx`
**Purpose**: Consistent login CTA across features
```typescript
interface LoginPromptProps {
  trigger: 'filter' | 'sort' | 'vote' | 'reply' | 'custom';
  message: string;
  size?: 'sm' | 'md' | 'lg';
}

// Features:
// - Multiple size variants
// - Contextual messaging
// - Modal or inline variants
// - Analytics tracking for conversion
```

### 2. Modified Components

#### `/components/goal/GoalPageClient.tsx`
**Changes**:
- Add `isAuthenticated` and `totalSolutionCount` props
- Conditionally render `ContentGate` after 5th solution
- Disable sort/filter controls when `!isAuthenticated`
- Show tooltip on disabled controls: "Sign in to use filters"

#### `/components/goal/CommunityDiscussions.tsx`
**Changes**:
- Pass `isAuthenticated` to `DiscussionPost` component
- Modify reply fetching logic (server-side conditional)
- Show `ReplyGate` instead of actual replies for anonymous users

#### `/components/goal/DiscussionPost.tsx` (within CommunityDiscussions.tsx)
**Changes**:
- Accept `isAuthenticated` prop
- Render reply section conditionally:
  - **Authenticated**: Show full replies (current behavior)
  - **Anonymous**: Show `ReplyGate` component with count

---

## 🔐 Server Action Changes

### `/app/actions/solutions.ts`

#### Modify `getGoalSolutions()`
```typescript
export async function getGoalSolutions(
  goalId: string,
  sortBy: 'effectiveness' | 'cost' | 'time' = 'effectiveness',
  filters: SolutionFilters = {}
) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Anonymous users:
  // - Can only sort by effectiveness
  // - Cannot apply filters
  // - Limited to 5 results
  if (!user) {
    // Ignore sortBy and filters parameters
    const { data, count } = await supabase
      .from('goal_implementation_links')
      .select('*, solution_variants(*), solutions(*)', { count: 'exact' })
      .eq('goal_id', goalId)
      .order('avg_effectiveness', { ascending: false })
      .limit(5);

    return {
      solutions: data || [],
      totalCount: count || 0,
      isLimited: true
    };
  }

  // Authenticated users: full access
  let query = supabase
    .from('goal_implementation_links')
    .select('*, solution_variants(*), solutions(*)', { count: 'exact' })
    .eq('goal_id', goalId);

  // Apply sorting
  query = applySorting(query, sortBy);

  // Apply filters
  query = applyFilters(query, filters);

  const { data, count } = await query;

  return {
    solutions: data || [],
    totalCount: count || 0,
    isLimited: false
  };
}
```

### `/app/actions/discussions.ts` (new file)

```typescript
'use server'

export async function getGoalDiscussions(goalId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch top-level discussions
  const { data: discussions } = await supabase
    .from('goal_discussions')
    .select(`
      *,
      users (username, avatar_url)
    `)
    .eq('goal_id', goalId)
    .is('parent_id', null)
    .order('upvotes', { ascending: false });

  if (!discussions) return [];

  // For authenticated users, fetch replies
  if (user) {
    const withReplies = await Promise.all(
      discussions.map(async (d) => {
        const { data: replies } = await supabase
          .from('goal_discussions')
          .select(`*, users (username, avatar_url)`)
          .eq('parent_id', d.id)
          .order('created_at', { ascending: true });

        return { ...d, replies: replies || [] };
      })
    );
    return withReplies;
  }

  // For anonymous users, return with empty replies
  // (reply_count still visible for gate display)
  return discussions.map(d => ({ ...d, replies: [] }));
}

export async function voteOnDiscussion(discussionId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Authentication required to vote' };
  }

  // Existing vote logic...
}
```

---

## 🎨 UX/Design Specifications

### Content Gate Overlay (Solutions)

#### Visual Design
```
┌─────────────────────────────────────┐
│  Solution Card 5 (Last Visible)     │
│  ⭐⭐⭐⭐⭐ 4.5 average              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│                                     │ ← Blur gradient starts
│  [Blurred Solution Card Preview]   │ ← backdrop-filter: blur(8px)
│                                     │
│  ┌─────────────────────────────┐  │
│  │  🔒  Sign in to view more   │  │
│  │                              │  │
│  │  47 more solutions ranked   │  │
│  │  by effectiveness, cost,    │  │
│  │  and time to results        │  │
│  │                              │  │
│  │  ┌───────────────────┐     │  │
│  │  │   Sign In Free    │     │  │
│  │  └───────────────────┘     │  │
│  │                              │  │
│  │  or create a free account   │  │
│  └─────────────────────────────┘  │
│                                     │
│  [More Blurred Cards...]           │ ← Continue blur
│                                     │
└─────────────────────────────────────┘
```

#### Tailwind Classes
```tsx
<div className="relative">
  {/* Blurred preview cards */}
  <div className="pointer-events-none select-none filter blur-sm opacity-50">
    {hiddenSolutions.slice(0, 2).map(solution => (
      <SolutionCard key={solution.id} {...solution} />
    ))}
  </div>

  {/* Overlay gate */}
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/90 to-white dark:via-gray-900/90 dark:to-gray-900 flex items-center justify-center">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-purple-200 dark:border-purple-800 p-8 max-w-md mx-4">
      {/* Gate content */}
    </div>
  </div>
</div>
```

### Reply Gate (Discussions)

#### Visual Design
```
┌─────────────────────────────────────┐
│  👤 JohnDoe                         │
│  This solution changed my life...   │
│                                     │
│  ↑ 23 helpful  💬 Reply            │
│                                     │
│  📝 View 5 replies  ←─────────────── Shows count
└─────────────────────────────────────┘

[When clicked by anonymous user]

┌─────────────────────────────────────┐
│  [Blur overlay with lock icon]      │
│                                     │
│  🔒  Sign in to read replies       │
│                                     │
│  Join the conversation with         │
│  5 other members                    │
│                                     │
│  ┌─────────────┐                   │
│  │  Sign In    │                   │
│  └─────────────┘                   │
└─────────────────────────────────────┘
```

### Disabled Controls (Sorting/Filtering)

#### Visual Treatment
```tsx
// Sort dropdown - disabled for anonymous
<select
  disabled={!isAuthenticated}
  className={cn(
    "px-4 py-2 border rounded-lg",
    !isAuthenticated && "opacity-50 cursor-not-allowed"
  )}
  title={!isAuthenticated ? "Sign in to use sorting" : ""}
>
  <option>Sort by Effectiveness</option>
  {/* Other options disabled */}
</select>

// Filter button - disabled for anonymous
<button
  disabled={!isAuthenticated}
  onClick={!isAuthenticated ? showLoginPrompt : openFilters}
  className={cn(
    "px-4 py-2 bg-blue-600 text-white rounded-lg",
    !isAuthenticated && "opacity-50 cursor-not-allowed hover:bg-blue-600"
  )}
>
  <Filter className="w-4 h-4 mr-2" />
  Filters
  {!isAuthenticated && <Lock className="w-3 h-3 ml-2" />}
</button>
```

---

## 🧪 Testing Requirements

### Unit Tests

#### Solution Gating
```typescript
describe('Solution Gating', () => {
  it('limits anonymous users to 5 solutions', async () => {
    const result = await getGoalSolutions('goal-123', null);
    expect(result.solutions).toHaveLength(5);
    expect(result.isLimited).toBe(true);
  });

  it('returns all solutions for authenticated users', async () => {
    const result = await getGoalSolutions('goal-123', mockUser);
    expect(result.solutions.length).toBeGreaterThan(5);
    expect(result.isLimited).toBe(false);
  });

  it('ignores filters for anonymous users', async () => {
    const result = await getGoalSolutions(
      'goal-123',
      null,
      { cost: 'free', category: 'medications' }
    );
    // Should return top 5 by effectiveness, ignoring filters
    expect(result.solutions).toHaveLength(5);
  });
});
```

#### Discussion Gating
```typescript
describe('Discussion Reply Gating', () => {
  it('returns empty replies for anonymous users', async () => {
    const discussions = await getGoalDiscussions('goal-123', null);
    discussions.forEach(d => {
      expect(d.replies).toEqual([]);
      expect(d.reply_count).toBeGreaterThanOrEqual(0);
    });
  });

  it('returns full replies for authenticated users', async () => {
    const discussions = await getGoalDiscussions('goal-123', mockUser);
    const withReplies = discussions.filter(d => d.reply_count > 0);
    expect(withReplies[0].replies.length).toBeGreaterThan(0);
  });
});
```

### E2E Tests

#### `/tests/e2e/content-gating/solutions.spec.ts`
```typescript
test('anonymous users see only 5 solutions', async ({ page }) => {
  await page.goto('/goal/reduce-anxiety');

  const solutionCards = await page.locator('[data-testid="solution-card"]').count();
  expect(solutionCards).toBe(5);

  // Verify gate is shown
  await expect(page.locator('[data-testid="content-gate"]')).toBeVisible();
  const gateText = await page.locator('[data-testid="content-gate"]').textContent();
  expect(gateText).toContain('more solutions');
});

test('authenticated users see all solutions', async ({ page }) => {
  await page.goto('/auth/signin');
  await login(page, 'test@example.com', 'password');
  await page.goto('/goal/reduce-anxiety');

  const solutionCards = await page.locator('[data-testid="solution-card"]').count();
  expect(solutionCards).toBeGreaterThan(5);

  // Verify gate is NOT shown
  await expect(page.locator('[data-testid="content-gate"]')).not.toBeVisible();
});

test('anonymous users cannot use filters', async ({ page }) => {
  await page.goto('/goal/reduce-anxiety');

  const filterButton = page.locator('[data-testid="filter-button"]');
  await expect(filterButton).toBeDisabled();

  // Hover should show tooltip
  await filterButton.hover();
  await expect(page.locator('text="Sign in to use filters"')).toBeVisible();
});
```

#### `/tests/e2e/content-gating/discussions.spec.ts`
```typescript
test('anonymous users see reply count but not content', async ({ page }) => {
  await page.goto('/goal/reduce-anxiety');
  await page.click('text="Community"');

  // Find discussion with replies
  const replyButton = page.locator('text=/View \\d+ repl/').first();
  await expect(replyButton).toBeVisible();

  // Click to trigger gate
  await replyButton.click();

  // Verify gate appears
  await expect(page.locator('text="Sign in to read replies"')).toBeVisible();

  // Verify replies are NOT in DOM
  const replies = await page.locator('[data-testid="reply-content"]').count();
  expect(replies).toBe(0);
});

test('authenticated users see all replies', async ({ page }) => {
  await login(page, 'test@example.com', 'password');
  await page.goto('/goal/reduce-anxiety');
  await page.click('text="Community"');

  // Expand replies
  await page.click('text=/Show \\d+ repl/').first();

  // Verify replies are visible
  const replies = await page.locator('[data-testid="reply-content"]');
  await expect(replies.first()).toBeVisible();

  // Verify NO gate
  await expect(page.locator('text="Sign in to read replies"')).not.toBeVisible();
});
```

---

## 🚨 Edge Cases & Considerations

### 1. Solution Count Edge Cases
- **< 5 solutions**: No gate shown
- **Exactly 5 solutions**: Gate shown with "0 more solutions" → Don't show gate
- **RLS filtering**: Server must return accurate `totalCount` for gate display

### 2. Discussion Edge Cases
- **No replies**: Don't show reply button/gate
- **1 reply**: Use singular "View 1 reply"
- **Deleted replies**: Update `reply_count` trigger to decrement

### 3. Authentication State Changes
- **User logs in mid-session**: Refresh solutions/discussions
- **User logs out**: Immediately apply gating
- **Session expiration**: Gracefully degrade to anonymous state

### 4. Performance Considerations
- **Don't fetch hidden solutions**: Server must limit query, not just hide in UI
- **Don't fetch replies for anonymous**: Server optimization
- **Cache gating state**: Reduce auth checks

### 5. SEO Implications
- **Top-level discussions**: Fully visible to crawlers (good for SEO)
- **First 5 solutions**: Indexed by search engines
- **Schema.org markup**: Ensure gated content not in JSON-LD
- **Meta tags**: Reflect visible content only

---

## 📈 Analytics & Tracking

### Events to Track

```typescript
// Analytics events for conversion funnel
trackEvent('content_gate_viewed', {
  type: 'solutions' | 'replies',
  hiddenCount: number,
  goalId: string
});

trackEvent('content_gate_clicked', {
  type: 'solutions' | 'replies',
  source: 'gate_cta' | 'filter_disabled' | 'reply_button',
  goalId: string
});

trackEvent('signup_from_gate', {
  gateType: 'solutions' | 'replies',
  goalId: string,
  timeToConversion: number // seconds from gate view to signup
});
```

### Metrics to Monitor
- **Gate view rate**: % of anonymous users seeing gates
- **Click-through rate**: % clicking "Sign In" CTA
- **Conversion rate**: % who complete signup from gate
- **Drop-off rate**: % who bounce after seeing gate
- **Time to decision**: Avg time from gate view to action

---

## 🔮 Future: Subscription Migration Path

### Phase 2: Freemium → Paid Tiers

#### Tier Structure
```
FREE (Current "Logged In"):
- 10 solutions per goal
- All top-level discussions
- 5 reply views per day

PREMIUM ($9.99/month):
- Unlimited solutions
- Unlimited discussions/replies
- Advanced filtering
- Solution comparison tool
- Export to PDF
- Early access to new features
```

#### Technical Preparation

##### Database Schema
```sql
-- User subscription tracking
CREATE TABLE user_subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  tier TEXT NOT NULL DEFAULT 'free', -- free, premium, pro
  status TEXT NOT NULL DEFAULT 'active', -- active, canceled, expired
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking for free tier limits
CREATE TABLE user_usage_tracking (
  user_id UUID REFERENCES auth.users(id),
  resource_type TEXT NOT NULL, -- reply_views, solution_views
  count INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ DEFAULT NOW(),
  period_end TIMESTAMPTZ,
  PRIMARY KEY (user_id, resource_type, period_start)
);
```

##### Content Gate Enhancement
```typescript
// Support for tiered gates
interface ContentGateProps {
  type: 'solutions' | 'replies';
  userTier: 'anonymous' | 'free' | 'premium';
  limits: {
    anonymous: { count: number; message: string };
    free: { count: number; message: string };
    premium: { count: number; message: string };
  };
}

// Example usage
<ContentGate
  type="solutions"
  userTier={user?.subscription_tier || 'anonymous'}
  limits={{
    anonymous: { count: 5, message: 'Sign in to view more' },
    free: { count: 10, message: 'Upgrade to Premium for unlimited access' },
    premium: { count: Infinity, message: '' }
  }}
/>
```

##### Migration Checklist
- [ ] Add Stripe integration
- [ ] Create subscription management UI
- [ ] Implement usage tracking middleware
- [ ] Add tier badges to user profiles
- [ ] Update RLS policies for tier-based access
- [ ] Create upgrade prompts in gates
- [ ] Add billing/invoicing system
- [ ] Implement grace periods for expired subs

---

## ✅ Implementation Checklist

### Phase 1: Database & Server
- [ ] Create RLS policies for public/authenticated discussion access
- [ ] Test RLS policies in isolation
- [ ] Create `getGoalDiscussions()` server action with conditional reply fetching
- [ ] Modify `getGoalSolutions()` to limit anonymous users
- [ ] Add auth checks to all relevant server actions

### Phase 2: Core Components
- [ ] Create `ContentGate.tsx` component
- [ ] Create `LoginPrompt.tsx` component
- [ ] Create `ReplyGate.tsx` component
- [ ] Add visual blur/overlay effects
- [ ] Test components in isolation (Storybook)

### Phase 3: Integration
- [ ] Modify `GoalPageClient.tsx` for solution gating
- [ ] Modify `CommunityDiscussions.tsx` for reply gating
- [ ] Add disabled states to sort/filter controls
- [ ] Wire up authentication state checks
- [ ] Test on actual goal pages

### Phase 4: Testing
- [ ] Write unit tests for server actions
- [ ] Write E2E tests for solution gating
- [ ] Write E2E tests for discussion gating
- [ ] Test authentication state transitions
- [ ] Test edge cases (0 solutions, 5 exactly, etc.)

### Phase 5: Polish & Launch
- [ ] Add analytics tracking
- [ ] Test on mobile devices
- [ ] Verify SEO implications
- [ ] Add loading states
- [ ] Test dark mode
- [ ] Performance testing
- [ ] Security audit
- [ ] Launch!

---

## 🎯 Success Metrics

### Week 1 Post-Launch
- **Signup rate**: Target 15-20% of anonymous visitors
- **Bounce rate**: < 10% increase from pre-gating baseline
- **Engagement**: Logged-in users view 3x more solutions than before

### Month 1 Post-Launch
- **User growth**: 50% increase in account creation
- **Retention**: 60% of new signups return within 7 days
- **Prepare for subscription launch**: Metrics validate paid tier demand

---

## 📚 References

### Design Inspiration
- **Glassdoor**: Salary/review gating with blur overlay
- **Medium**: Article paywall with count-based limiting
- **LinkedIn**: Connection/profile view limits for free users
- **Quora**: Answer collapse with "Sign up to read more"

### Technical References
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Server Components Auth](https://nextjs.org/docs/app/building-your-application/authentication)
- [Tailwind Backdrop Filter](https://tailwindcss.com/docs/backdrop-filter)

---

**This specification provides a complete roadmap for implementing the content gating system, from initial implementation through future subscription monetization.**
