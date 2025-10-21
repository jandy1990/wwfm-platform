# /app Directory Documentation

> **Generated through interview process**  
> **Last Updated:** January 2025  
> **Status:** Complete ✅

## 📁 Directory Overview

The `/app` directory contains all Next.js 15 App Router pages and routes for the WWFM platform.

## 🗺️ Navigation Architecture

### Hierarchy
```
Arena (13) → Category (75) → Goals (781)
```

**Example Flow:**
- Mental Health (arena) → Anxiety (category) → "Calm my anxiety" (goal)

### Homepage (`/`)
**Status:** Production Ready ✅
**File:** `app/page.tsx`

The homepage is a dynamic landing page with 5 major sections designed to demonstrate value and guide discovery:

#### 1. Hero Section
- **Large search bar** with auto-suggest dropdown (2+ characters, 150ms debounce)
- **Smart matching**: Scores by exact, starts-with, word-starts, contains
- **Platform stats ticker**: Total solutions, avg rating, goals, active users
- **Quick actions**: "Browse All Goals" and "Share What Worked" buttons
- **Search cache**: 5-minute client-side cache to reduce API calls

#### 2. Trending Goals (Last 7 Days)
- Shows 8 trending goals with activity indicators
- **Trend statuses**: 🔥 Hot, 📈 Rising, 💡 Stable
- Displays: Solution count, avg effectiveness, recent ratings
- Grid layout: 2 cols mobile, 3 tablet, 4 desktop

#### 3. Top Value Arenas (Top 5 by Lasting Impact)
- Ranked arenas with 6-month retrospective data
- **Display**: Star rating visualization, numeric score, goal count
- Gradient purple-to-blue background for emphasis
- Transparent about AI vs human data transition

#### 4. Activity Feed (Last 24 Hours)
- Real-time platform activity: ratings, discussions, new solutions
- **Limit**: 20 events, shows "just now" to "Xd ago" timestamps
- Empty state: 🌱 "Getting started" message
- Demonstrates active community engagement

#### 5. Featured Verbatims (High-Quality Discussions)
- Discussion posts with 10+ upvotes from last 30 days
- **Time buckets**: Today (green), this week (blue), this month (purple)
- Displays upvote counts and quoted excerpts
- "Join the Discussion" CTA button

#### Data Fetching Strategy
**File:** `app/actions/home.ts`

All data fetched in parallel via `getHomePageData()`:
- `getTrendingGoals()` - PostgreSQL function, 7 days, 8 goals
- `getActivityFeed()` - PostgreSQL function, 24 hours, 20 events
- `getFeaturedVerbatims()` - Direct query, 10+ upvotes, 30 days, 5 posts
- `getPlatformStats()` - Cached table query for instant stats
- `getTopValueArenas()` - Arena value scores, top 5 by lasting impact

**Performance**: Platform stats cached in `platform_stats_cache` table

#### Search Functionality
**Server Action:** `searchGoals(query: string)`
- ILIKE search on goal titles (case-insensitive)
- Returns top 8 matching goals with arena/category breadcrumbs
- Highlighting of matching text in results
- Minimum 2 characters required

### First User Experience
- **Goal:** Users find their specific problem within 10 seconds
- **Success Metric:** Search → Goal page → Rate solution flow
- **Time to Value:** Immediate via search auto-suggest or trending goals
- **Social Proof**: Activity feed and stats build trust instantly

## 🔐 Authentication Strategy

### User Roles
- **Simple binary system:** Logged out vs Logged in
- **No complex roles** (no moderators, admins, etc. at this stage)

### Current Implementation
- **Default:** All pages are public - users can browse goals/solutions without logging in
- **Contribution:** Unauthenticated users trying to contribute get redirected to login *(needs verification)*

### Future Authentication Plans
- **Scroll Depth Limit:** After certain scroll depth (e.g., 10 solutions), require login
- **Rationale:** Give taste of value, then require account for full access
- **Additional Benefit:** Protects content from AI scraping

### Protected Routes
These routes require authentication:
- `/dashboard/*` - User dashboard and time tracking
- `/goal/[id]/add-solution` - Solution contribution form
- `/retrospective/*` - Retrospective features
- `/mailbox/*` - Messaging/notification system

### Public Routes
All other routes are publicly accessible:
- `/browse` - Main browsing experience
- `/arena/[slug]` - Arena pages
- `/category/[slug]` - Category pages  
- `/goal/[id]` - Goal pages (viewing only)

## 📊 Dashboard Features

### Current Implementation
- **Single Feature:** Time tracking breakdown by arena
- **Purpose:** Shows users how much time they spend in different life areas
- **Example:** Time in "Relationships & Dating" vs "Community" vs "Mental Health"

### Future Dashboard Plans
- Additional features planned but not yet specified
- Will remain the central hub for personal analytics

## 📬 Mailbox System

### Purpose
Notification center for:
- **User Notifications:** "Someone commented on your solution"
- **System Messages:** Automated messages from the platform
- **6-Month Follow-ups:** Retrospective surveys sent 6 months after solution submission

### Key Feature: Retrospective Follow-ups
- **Trigger:** 6 months after user submits a solution
- **Purpose:** Ask if the solution made a significant difference in their life
- **Implementation:** Triggered via Supabase cron job
- **Location:** Delivered to user's mailbox

### Not Included
- No direct messaging between users (not planned)

## 🔄 Retrospective System

### Overview
The retrospective system measures the **long-term value** of achieved goals, distinguishing between immediate success and lasting impact.

### Flow
1. **User submits a solution** (rates it as working for their goal)
2. **6 months later:** Notification appears in mailbox
3. **User clicks link** → Goes to `/retrospective/[id]`
4. **User answers 1-2 questions:**
   - Counterfactual impact (1-5 scale): "If you hadn't achieved this, how different would life be?"
   - Optional: unexpected benefits, wisdom notes
5. **Data aggregates** into `goal_wisdom_scores` table
6. **Display on goal pages** as "Lasting Value: 💎 4.2/5"

### Schedule Types
- **6-month follow-up:** Primary assessment
- **12-month follow-up:** Scheduled after 6-month completion

### Display Logic
- **Shows on goal page** when `total_retrospectives >= 1`
- **Component:** `GoalWisdom` displays lasting value score
- **Inconsistent display:** Only shows when enough data exists
- **Visual:** Diamond emoji (💎) with score out of 5

### Data Storage
- Individual responses: `goal_retrospectives` table (private)
- Aggregated scores: `goal_wisdom_scores` table (public display)
- Mailbox items: `mailbox_items` table
- Schedule tracking: `retrospective_schedules` table

## 💬 Feedback System

### FeedbackWidget Component
A floating feedback button appears on most pages (bottom-right corner).

### Features
- **Rating:** 1-5 scale with emoji faces (required)
- **Text Feedback:** Optional comments
- **Email:** Optional for follow-up
- **Context Capture:** Automatically records which page/goal/solution user is viewing
- **Session Data:** User agent, screen size, referrer

### Data Storage
- **Table:** `user_feedback` in Supabase
- **Links to:** goal_id, solution_id when applicable
- **Tracks:** Both authenticated and anonymous feedback

### Display Rules
**Hidden on:**
- `/auth/*` pages
- `/login`, `/signup` pages
- `/admin/*` pages (if they exist)
- `/retrospective/[id]` forms (distraction-free)

**Visible on:**
- All other pages including goal, browse, dashboard, etc.

## 🎨 Global Layout Components

### Header
- **Appears on:** All pages
- **Contains:** Navigation, user menu, authentication status
- **Responsive:** Mobile hamburger menu

### FeedbackWidget
- **Appears on:** Most pages (see Display Rules above)
- **Position:** Fixed bottom-right
- **Purpose:** Collect user feedback on any page

## 📂 Route Structure

### Public Routes
- `/` - Homepage (redirects to /browse)
- `/browse` - Main browsing experience
- `/arena/[slug]` - Arena pages (e.g., /arena/mental-health)
- `/category/[slug]` - Category pages (e.g., /category/anxiety)
- `/goal/[id]` - Individual goal pages (shows wisdom scores if available)

### Protected Routes (Require Auth)
- `/dashboard` - User dashboard (currently only time tracking)
  - `/dashboard/time` - Time tracking breakdown by arena
- `/goal/[id]/add-solution` - Solution contribution form
- `/retrospective/[id]` - Retrospective survey form (6/12-month follow-ups)
- `/mailbox` - Notifications and system messages

### Test Routes (TO BE REMOVED)
⚠️ **These should not be in production:**
- `/test-dosage-form`
- `/test-failed-picker`
- `/test-retrospective`
- `/test-rpc`
- `/test-server-action`

## 🚀 Server Actions vs API Routes

### Current Architecture: Server Actions
WWFM uses Next.js Server Actions for all form submissions and data mutations.

### Why Server Actions (Current Choice)
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

### Future Migration Strategy
**When to Add API Routes:**
- Building a mobile app
- Third-party integrations needed
- Webhook endpoints required
- Public API for developers

**How to Migrate (When Needed):**
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

### Decision Rationale
- **Web-first MVP:** Server actions are the right choice
- **No immediate need** for mobile app or API
- **Can migrate later** without rewriting business logic
- **Faster time to market** with current approach

## 📊 Performance & SEO Considerations

### Rendering Strategy
**Current:** Most pages are dynamically rendered (SSR)

**Future Optimization Opportunities:**
- **Goal pages (781):** Could use ISR (Incremental Static Regeneration)
- **Arena/Category pages:** Static with hourly revalidation
- **Dashboard:** Must remain dynamic (user-specific)
- **Browse:** Dynamic for filtering/sorting

### SEO Strategy
- **Goal pages:** Should rank for problem-solving queries
- **Required:** Meta descriptions, structured data
- **Example:** "Calm my anxiety" page ranking for "how to reduce anxiety"

### AI Crawler Prevention
**Goal:** Allow Google indexing while preventing AI training on content

**Implementation:**
1. **robots.txt:** Block known AI crawlers (GPTBot, CCBot, anthropic-ai, etc.) ✅
2. **Authentication gate:** Require login after viewing 10 solutions (primary protection)
3. **Terms of Service:** Explicitly prohibit AI training use
4. **Reality check:** Good actors respect robots.txt, bad actors ignore it

**Decision:** Authentication is the primary defense against scraping

## 🎯 Key Design Decisions

### Decision Log

| Date | Decision | Reasoning | Status |
|------|----------|-----------|---------|
| Jan 2025 | Keep both arena and category routes | They're hierarchical, not alternatives | ✅ Confirmed |
| Jan 2025 | Homepage redirects to /browse | No homepage content yet | 🔄 Temporary |
| Jan 2025 | Future homepage will be newsfeed | Show activity and engagement | 📋 Planned |
| Jan 2025 | All pages public by default | Low barrier to entry for discovery | ✅ Confirmed |
| Jan 2025 | Future: Scroll depth limits | Give value taste, then require account | 📋 Planned |
| Jan 2025 | Protected routes for contribution | Maintain data quality and accountability | ✅ Confirmed |
| Jan 2025 | Simple auth: logged out vs logged in | No complex roles needed yet | ✅ Confirmed |
| Jan 2025 | Mailbox for notifications only | No user-to-user DMs | ✅ Confirmed |
| Jan 2025 | 6-month retrospectives via cron | Measure long-term solution effectiveness | ✅ Confirmed |
| Jan 2025 | Wisdom scores with diamond emoji | Visual indicator of lasting value | ✅ Confirmed |
| Jan 2025 | Keep server actions for MVP | Web-first approach, faster development | ✅ Confirmed |
| Jan 2025 | Remove test routes from production | Not needed in production environment | 🔴 TODO |
| Jan 2025 | Block AI crawlers via robots.txt | Prevent training while allowing Google | ✅ Implemented |
| Jan 2025 | Auth as primary anti-scraping | More effective than robots.txt | ✅ Confirmed |
| Jan 2025 | Hide feedback on auth/retrospective | Distraction-free experience | ✅ Confirmed |
| Jan 2025 | Feedback saves to user_feedback table | Central collection for all feedback types | ✅ Verified |

## 🐛 Known Issues & Tech Debt

### Immediate Actions Required
- [ ] **Remove test routes from production** (/test-*)

### To Verify
- [ ] Confirm unauthenticated users redirect to login when trying to contribute
- [ ] Test auth middleware on all protected routes
- [ ] Verify Supabase cron job for 6-month follow-ups is configured

### To Investigate
- [ ] Wisdom scores (💎) showing inconsistently on goal pages - check data availability
- [ ] Determine minimum retrospectives needed for display
- [ ] Review current performance bottlenecks

## 🔮 Future Improvements

1. Build proper homepage with newsfeed
2. Optimize navigation for faster goal discovery
3. Implement scroll depth authentication gate (anti-scraping)
4. Expand dashboard with additional analytics features
5. Ensure wisdom scores display consistently on all goals with data
6. Add API routes when mobile app or integrations needed
7. Move test routes to development-only environment
8. Implement ISR for goal pages to improve performance
9. Add structured data for SEO
10. Consider feedback analytics dashboard for admins

---

*Documentation complete - generated through developer interview process*