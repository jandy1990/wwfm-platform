# Search Architecture

## Overview

WWFM has three distinct search implementations, each optimized for its specific context. This document explains the architecture, rationale, and shared utilities.

**Last Updated**: November 9, 2025

---

## Search Implementations

### 1. Home Page Search (Server-Side)

**Component**: `components/home/HeroSection.tsx`
**Data Source**: Server action (`app/actions/home.ts` → `searchGoals()`)
**Strategy**: Database query on each search

**Why Server-Side?**
- **First Load Performance**: Home page is entry point - can't have client-side data yet
- **SEO Benefits**: Server-rendered search suggestions
- **Efficient Results**: Database LIMIT clause returns only 8 results (vs downloading 228 goals)
- **Fresh Data**: Always queries latest approved goals

**Features**:
- ✅ Debounced search (150ms)
- ✅ Result caching (5min)
- ✅ Goal request button for no-results
- ✅ Auth-gated request form
- ✅ Uses shared utilities (useSearchDebounce, useSearchCache)

---

### 2. Browse Page Search (Client-Side, Props)

**Component**: `components/templates/HybridBrowse.tsx`
**Data Source**: Props (pre-fetched arenas from page)
**Strategy**: Client-side filtering via `useGoalSearch` hook

**Why Client-Side with Props?**
- **Data Already Loaded**: Browse page needs full arena/category/goal tree for display
- **Zero Network Delay**: Instant filtering with no API calls
- **Code Reuse**: Uses proven `useGoalSearch` hook
- **Consistent UX**: Same search behavior as navigation

**Features**:
- ✅ Fuzzy matching with smart scoring
- ✅ Debounced search (150ms)
- ✅ Result caching (5min)
- ✅ Goal request button for no-results
- ✅ Auth-gated request form
- ✅ Click-outside dropdown handling

---

### 3. Navigation Search (Client-Side, Fetch)

**Component**: `components/organisms/UnifiedSearchBar.tsx`
**Data Source**: Client fetch (`getSearchableGoals()`)
**Strategy**: Client-side filtering via `useGoalSearch` hook

**Why Client-Side with Fetch?**
- **Persistent Component**: Navigation persists across pages
- **Own Data Lifecycle**: Independent from page data
- **Unified Experience**: Desktop + Mobile use same component with variants

**Variants**:
- **Desktop** (`variant="desktop"`): Compact dropdown in header
- **Mobile** (`variant="mobile"`): Full-screen modal

**Features**:
- ✅ Unified codebase for desktop + mobile
- ✅ Fuzzy matching with smart scoring
- ✅ Debounced search (150ms)
- ✅ Result caching (5min)
- ✅ Goal request button for no-results
- ✅ Auth-gated request form
- ✅ Different max results (5 desktop, 10 mobile)

---

## Shared Utilities

To reduce duplication, common search patterns are extracted to shared utilities:

### 1. `useSearchDebounce` Hook

**File**: `lib/hooks/useSearchDebounce.ts`
**Purpose**: Delays value updates until input stops changing
**Used By**: All search implementations

```typescript
const debouncedQuery = useSearchDebounce(searchQuery, 150)
```

### 2. `useSearchCache` Hook

**File**: `lib/hooks/useSearchCache.ts`
**Purpose**: In-memory caching with automatic expiry
**Used By**: All search implementations

```typescript
const cache = useSearchCache<SearchResult[]>(300000) // 5 min
cache.set('anxiety', results)
const cached = cache.get('anxiety')
```

### 3. `calculateSearchScore` Utility

**File**: `lib/utils/searchScoring.ts`
**Purpose**: Fuzzy matching score calculation
**Used By**: Client-side searches (Browse, Navigation)

**Scoring Algorithm**:
- Exact match: 100
- Starts with query: 90
- Word starts with query: 80
- Contains query after space: 70
- Contains query anywhere: 60
- Action verb match: +20 bonus

```typescript
const score = calculateSearchScore('Reduce anxiety', 'anxiety') // Returns 60
```

---

## Component Map

| Page/Context | Component | Data Strategy | Hook Used |
|-------------|-----------|---------------|-----------|
| Home Page | HeroSection | Server action | useSearchDebounce, useSearchCache |
| Browse Page | HybridBrowse | Props | useGoalSearch |
| Desktop Nav | UnifiedSearchBar (desktop) | Client fetch | useGoalSearch |
| Mobile Nav | UnifiedSearchBar (mobile) | Client fetch | useGoalSearch |

---

## Goal Request Feature

All search implementations include a "Request this goal" button shown when no results are found.

**Flow**:
1. User searches for non-existent goal
2. No-results message appears with request button
3. **If authenticated**: Shows `GoalRequestForm` modal with pre-filled query
4. **If anonymous**: Shows `LoginPromptModal` prompting sign-in

**Components**:
- `components/molecules/GoalRequestForm.tsx` - Request submission form
- `components/ui/LoginPromptModal.tsx` - Auth gate for anonymous users

**Backend**:
- `app/actions/request-goal.ts` - Server action for request submission
- Rate limiting: 5 requests per 24 hours
- Duplicate detection via fuzzy matching
- Stores in `goal_requests` table

---

## Performance Characteristics

### Home Page (Server Action)
- **First Search**: ~100-200ms (database query)
- **Cached Search**: <10ms (in-memory)
- **Network Transfer**: ~2-5KB per search
- **Client Bundle**: Minimal (server action)

### Browse Page (Client Filter)
- **First Search**: <50ms (in-memory filter)
- **Cached Search**: <5ms (cached results)
- **Network Transfer**: 0 (data already loaded)
- **Client Bundle**: +8KB (useGoalSearch hook)

### Navigation (Client Fetch + Filter)
- **Initial Mount**: ~150-300ms (fetch 228 goals)
- **Cached Search**: <5ms (in-memory)
- **Network Transfer**: ~15-20KB (one-time)
- **Client Bundle**: +12KB (UnifiedSearchBar + useGoalSearch)

---

## Decision Rationale

### Why Not One Universal Implementation?

**Option A**: Server-side search everywhere
- ❌ Network delay on every keystroke
- ❌ Redundant for pages with pre-loaded data
- ❌ Higher server load

**Option B**: Client-side fetch everywhere
- ❌ Slow first load on home page
- ❌ SEO concerns for hero search
- ❌ Redundant data fetch on browse page

**Option C**: Three targeted implementations ✅
- ✅ Each optimized for context
- ✅ Share common utilities to reduce duplication
- ✅ Best performance for each use case
- ✅ Maintainable with ~40% less duplication than before

---

## Migration History

### November 9, 2025 - Search Standardization

**Changes**:
- Created shared utilities (useSearchDebounce, useSearchCache, calculateSearchScore)
- Refactored useGoalSearch to use shared utilities
- Created UnifiedSearchBar combining HeaderSearch + MobileSearchModal
- Added goal request feature to all search implementations
- Archived deprecated components

**Before**:
- 5 separate implementations
- 3 copies of debounce logic
- 3 copies of cache management
- 2 copies of scoring algorithm
- No goal request in home/nav

**After**:
- 3 justified implementations
- Shared utilities (1 copy each)
- Goal request everywhere
- 40% less duplication

**Archived**:
- `components/organisms/HeaderSearch.tsx` → `archive/2025-11-search-unification/`
- `components/organisms/MobileSearchModal.tsx` → `archive/2025-11-search-unification/`

---

## Future Optimizations

### Considered but Not Implemented

1. **Server-Side Caching for Navigation**
   - Redis or React Server Components cache for `getSearchableGoals()`
   - Would reduce ~15-20KB data transfer per mount
   - Trade-off: Infrastructure complexity vs marginal benefit

2. **Shared Component for Home + Browse**
   - Could unify HeroSection and HybridBrowse search UI
   - Trade-off: More props/complexity vs small code reduction

3. **Search Result Prefetching**
   - Prefetch common searches ("anxiety", "sleep", etc.)
   - Trade-off: Network overhead vs perceived speed gain

---

## Maintenance Guidelines

### When to Add a New Search Implementation

**DO create new implementation if**:
- Fundamentally different data source (e.g., user-specific search)
- Different performance requirements (e.g., real-time collaborative search)
- Different search algorithm (e.g., semantic search with embeddings)

**DON'T create new implementation if**:
- Just UI differences → Use `variant` prop or render prop pattern
- Just different result count → Use `maxResults` option
- Just different dropdown styles → Use className overrides

### When to Update Shared Utilities

**Update shared utilities when**:
- Bug affects multiple implementations
- Performance improvement benefits all searches
- New feature needed across all contexts (e.g., recent searches)

**Don't update if**:
- Change is specific to one context
- Breaking change without migration path
- Optimization only benefits one implementation

---

## Related Documentation

- [Form System Reference](/docs/forms/FORM_SYSTEM_REFERENCE.md) - Goal request form integration
- [ARCHITECTURE.md](/ARCHITECTURE.md) - Overall system architecture
- [Component Map](/docs/COMPONENT_MAP.md) - All component locations
