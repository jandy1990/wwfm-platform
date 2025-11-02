# /app Directory - Navigation Guide

**Last Updated:** November 2, 2025
**Purpose:** High-level overview and navigation to detailed documentation

---

## 📁 What's In /app

The `/app` directory contains all Next.js 15 App Router pages and routes for the WWFM platform.

## 🗺️ Quick Navigation to Documentation

**Core Systems** (detailed docs in their folders):
- **[Authentication](/app/auth/README.md)** → `/app/auth/` - User login, signup, session management
- **[Dashboard](/app/dashboard/README.md)** → `/app/dashboard/` - User analytics and contribution tracking
- **[Mailbox](/app/mailbox/README.md)** → `/app/mailbox/` - Notifications and retrospective follow-ups
- **[Retrospectives](/app/retrospective/README.md)** → `/app/retrospective/` - Long-term value assessment
- **[Server Actions](/app/actions/README.md)** → `/app/actions/` - Form submissions and data mutations

**Additional Docs:**
- **[Forms System](/components/organisms/solutions/forms/README.md)** → 9 templates handling 23 categories
- **[Database Schema](/docs/database/schema.md)** → Complete data model and RLS policies

---

## 🔄 Content Hierarchy

WWFM organizes content in a 3-level hierarchy:

```
Arena (13) → Category (75) → Goals (228 active)
```

**Example Flow:**
- Mental Health (arena) → Anxiety (category) → "Calm my anxiety" (goal)

**Routes:**
- `/arena/[slug]` - Arena landing pages
- `/category/[slug]` - Category pages
- `/goal/[id]` - Individual goal pages with solutions

---

## 🌐 Homepage

**File:** `app/page.tsx`
**Route:** `/`
**Status:** Production Ready ✅

### 5 Major Sections

1. **Hero Section**
   - Large search bar with auto-suggest (2+ chars, 150ms debounce)
   - Platform stats ticker
   - Quick actions: Browse All Goals, Share What Worked

2. **Trending Goals** (Last 7 Days)
   - 8 trending goals with activity indicators
   - Trend statuses: 🔥 Hot, 📈 Rising, 💡 Stable

3. **Top Value Arenas** (Top 5 by Lasting Impact)
   - Ranked arenas with 6-month retrospective data
   - Star rating visualization with goal counts

4. **Activity Feed** (Last 24 Hours)
   - Real-time platform activity
   - Limit: 20 events

5. **Featured Verbatims** (High-Quality Discussions)
   - Discussion posts with 10+ upvotes from last 30 days
   - Time-bucketed display (today/week/month)

**Data Fetching:** All sections loaded in parallel via `app/actions/home.ts`

---

## 🔐 Route Protection

### Protected Routes (Require Authentication)
- `/dashboard/*` - User dashboard and time tracking
- `/goal/[id]/add-solution` - Solution contribution form
- `/retrospective/*` - Retrospective survey forms
- `/mailbox/*` - Notifications and messages

### Public Routes
- `/` - Homepage
- `/browse` - Main browsing experience
- `/arena/[slug]` - Arena pages
- `/category/[slug]` - Category pages
- `/goal/[id]` - Goal pages (viewing only)
- `/about`, `/how-it-works`, `/privacy`, `/terms` - Static pages

**Implementation:** Next.js middleware + Supabase RLS policies

See [Authentication README](/app/auth/README.md) for details.

---

## 📂 Directory Structure

```
app/
├── README.md (this file)
├── page.tsx (homepage)
├── layout.tsx (global layout)
│
├── actions/ (Server actions)
│   ├── README.md
│   ├── submit-solution.ts
│   ├── home.ts
│   └── dashboard-data.ts
│
├── auth/ (Authentication)
│   ├── README.md
│   ├── signin/
│   ├── signup/
│   ├── callback/
│   └── reset-password/
│
├── dashboard/ (User analytics)
│   ├── README.md
│   ├── page.tsx
│   ├── time/
│   ├── activity/
│   ├── impact/
│   └── celebrations/
│
├── mailbox/ (Notifications)
│   ├── README.md
│   └── page.tsx
│
├── retrospective/ (Long-term value)
│   ├── README.md
│   └── [id]/
│
├── browse/ (Goal browsing)
│   └── page.tsx
│
├── arena/ (Arena pages)
│   └── [slug]/
│
├── category/ (Category pages)
│   └── [slug]/
│
├── goal/ (Goal pages)
│   └── [id]/
│
├── solution/ (Solution pages)
│   └── [slug]/
│
├── feedback/ (Feedback widget)
│   └── page.tsx
│
├── api/ (API routes if needed)
│   └── health/ (Health check endpoint)
│
└── ... (other pages)
```

---

## 💬 Global Components

### FeedbackWidget
**Component:** `components/feedback/FeedbackWidget.tsx`
**Position:** Fixed bottom-right on most pages

**Visible on:** All pages except:
- `/auth/*` - Auth flows
- `/retrospective/[id]` - Distraction-free survey

**Purpose:** Collect user feedback with context

**Data Storage:** `user_feedback` table

---

## 🚀 Performance & SEO

### Rendering Strategy
**Current:** Most pages dynamically rendered (SSR)

**Future Optimization Opportunities:**
- **Goal pages (228):** Could use ISR (Incremental Static Regeneration)
- **Arena/Category pages:** Static with hourly revalidation
- **Dashboard:** Must remain dynamic (user-specific)

### SEO Strategy
- **Goal pages:** Should rank for problem-solving queries
- **Example:** "Calm my anxiety" ranking for "how to reduce anxiety"
- **Required:** Meta descriptions, structured data (TODO)

---

## 📊 Data Fetching Patterns

### Server Components (Default)
```typescript
// In page.tsx or layout.tsx
async function Page() {
  const data = await fetchData() // Direct database access
  return <Component data={data} />
}
```

### Server Actions
```typescript
// In app/actions/*.ts
'use server'
export async function submitData(formData) {
  // Database operations
}
```

See [Server Actions README](/app/actions/README.md) for patterns.

---

## 🎯 Key Design Decisions

| Date | Decision | Reasoning | Status |
|------|----------|-----------|---------|
| Jan 2025 | App Router over Pages Router | Better DX, server components, faster | ✅ |
| Jan 2025 | Server Actions over API routes | Simpler forms, type safety | ✅ |
| Jan 2025 | All pages public by default | Low barrier to discovery | ✅ |
| Jan 2025 | Protected routes for contribution | Data quality and accountability | ✅ |
| Jan 2025 | Simple binary auth (logged in/out) | No complex roles needed yet | ✅ |
| Jan 2025 | Homepage = Activity hub | Show value immediately | ✅ |

---

## 🐛 Known Issues

- [ ] Wisdom scores (💎) showing inconsistently on goal pages
- [ ] Mobile test routes removed but may need cleanup verification
- [ ] ISR optimization for goal pages not yet implemented

---

## 🔮 Future Improvements

1. Implement scroll depth authentication gate (anti-scraping)
2. Add structured data for SEO
3. Optimize goal pages with ISR
4. Expand dashboard analytics
5. Build proper homepage newsfeed (vs current activity feed)

---

## 📚 Related Documentation

- **[Architecture Guide](/ARCHITECTURE.md)** - System design and patterns
- **[Database Schema](/docs/database/schema.md)** - Complete data model
- **[Form System](/components/organisms/solutions/forms/README.md)** - 9 templates, 23 categories
- **[Testing Guide](/tests/README.md)** - E2E test documentation

---

*This is a navigation guide. Detailed documentation lives in each feature's folder.*
