# Server Actions

**Location:** `/app/actions`
**Last Updated:** November 2, 2025

## Overview

WWFM uses Next.js Server Actions for all form submissions and data mutations instead of traditional API routes.

## Why Server Actions?

**Advantages for WWFM:**
- ✅ **Type Safety:** Full TypeScript from form to database
- ✅ **Simpler Code:** No fetch(), automatic error handling
- ✅ **Progressive Enhancement:** Forms work without JavaScript
- ✅ **Built-in Security:** CSRF protection automatic
- ✅ **Perfect for Forms:** Main interactions are form submissions
- ✅ **Faster Development:** Less boilerplate for MVP

**Trade-offs Accepted:**
- ❌ **Web-Only:** Can't build mobile app or external integrations yet
- ❌ **Testing:** Harder to test in isolation
- ❌ **Debugging:** Can't use Postman/curl

## Decision Rationale

- **Web-first MVP:** Server actions are the right choice
- **No immediate need** for mobile app or API
- **Can migrate later** without rewriting business logic
- **Faster time to market** with current approach

## Key Server Actions

### `submit-solution.ts`
**Purpose:** Create new solution submissions

**Flow:**
1. Validate user authentication
2. Auto-categorize solution if needed
3. Create/find solution in database
4. Create solution variant
5. Link to goal via `goal_implementation_links`
6. Store individual data in `ratings.solution_fields`
7. Trigger aggregation to `aggregated_fields`

**Business Logic:** See JSDoc comments in file

### `update-solution-fields.ts`
**Purpose:** Add optional fields after initial submission

**Used by:** Success screen to collect additional details
**Pattern:** Two-phase submission (required first, optional after)

### `home.ts`
**Purpose:** Fetch homepage data in parallel

**Functions:**
- `getTrendingGoals()` - Last 7 days activity
- `getActivityFeed()` - Last 24 hours events
- `getFeaturedVerbatims()` - High-quality discussions
- `getPlatformStats()` - Cached statistics
- `getTopValueArenas()` - Arena rankings by lasting value

### `dashboard-data.ts`
**Purpose:** Dashboard analytics and user stats

**Functions:**
- `getUserImpactStats()` - Contribution points, ratings, etc.
- `getSolutionTypePreferences()` - User's solution preferences
- `getUserActivityTimeline()` - Recent activity feed

### `track-goal-view.ts`
**Purpose:** Track user goal page views

**Used for:** Trending goals calculation, user analytics

## Future Migration Strategy

### When to Add API Routes
- Building a mobile app
- Third-party integrations needed
- Webhook endpoints required
- Public API for developers

### How to Migrate (When Needed)
```typescript
// Keep server action for web
export async function submitSolution(data) { ... }

// Add API route that reuses logic
// app/api/solutions/route.ts
export async function POST(req) {
  const data = await req.json()
  return submitSolution(data) // Reuse existing logic
}
```

## Error Handling Pattern

All server actions should follow this pattern:

```typescript
'use server'

export async function actionName(data: ActionData) {
  try {
    // 1. Validate authentication
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 2. Validate input
    // ... validation logic

    // 3. Perform database operations
    const result = await supabase.from('table').insert(data)

    // 4. Return success
    return { success: true, data: result }

  } catch (error) {
    // 5. Log error
    console.error('[actionName] Error:', error)

    // 6. Return user-friendly error
    return {
      success: false,
      error: 'User-friendly message'
    }
  }
}
```

## Authentication in Server Actions

**Server-side auth:**
```typescript
import { createServerSupabaseClient } from '@/lib/database/server'

const supabase = await createServerSupabaseClient()
const { data: { user } } = await supabase.auth.getUser()
```

**Client-side calls:**
```typescript
import { submitSolution } from '@/app/actions/submit-solution'

// In client component
const result = await submitSolution(formData)
if (result.success) {
  // Handle success
}
```

## Data Access Patterns

### With RLS (Row Level Security)
```typescript
// Uses authenticated user context
const { data } = await supabase
  .from('ratings')
  .select('*')
// Returns only user's own ratings (RLS enforces)
```

### With Service Key (Admin Operations)
```typescript
// Bypasses RLS - use sparingly!
const { data } = await supabase
  .from('solutions')
  .select('*')
// Returns all solutions (bypasses RLS)
```

## Key Design Decisions

| Date | Decision | Reasoning | Status |
|------|----------|-----------|---------|
| Jan 2025 | Keep server actions for MVP | Web-first approach, faster development | ✅ Confirmed |
| Jan 2025 | Can add API routes later | Migration path exists without rewrites | ✅ Confirmed |
| Jan 2025 | Progressive enhancement | Forms work without JavaScript | ✅ Confirmed |

## Related Documentation

- **Forms:** `/components/organisms/solutions/forms/README.md` (see how forms use actions)
- **Database:** `/docs/database/schema.md` (understand data model)
- **Auth:** `/app/auth/README.md` (authentication patterns)
