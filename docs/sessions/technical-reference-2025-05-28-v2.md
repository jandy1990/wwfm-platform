# WWFM Technical Reference

> **Document Type**: Technical implementation details  
> **Related Documents**: [Project Guide](/docs/project-guide.md) | [Collaboration Guide](/docs/collaboration-guide.md) | [Product Roadmap](/docs/product-roadmap.md)  
> **Last Updated**: May 28, 2025 (Evening Update)  
> **Status**: Active - Solution Taxonomy Complete, Implementation Ready

This document contains the technical implementation details for the WWFM platform.

## Table of Contents
- [1. Technical Stack Configuration](#1-technical-stack-configuration)
- [2. Database Schema](#2-database-schema)
- [3. Row Level Security (RLS) Architecture](#3-row-level-security-rls-architecture)
- [4. Authentication Implementation](#4-authentication-implementation)
- [5. File Structure](#5-file-structure)
- [6. Environment Setup](#6-environment-setup)
- [7. Development Tools & Debugging](#7-development-tools--debugging)
- [8. Implementation Priorities](#8-implementation-priorities)
- [9. Decision Log](#9-decision-log)
- [10. Known Technical Debt](#10-known-technical-debt)

---

## 1. Technical Stack Configuration

### 1.1 GitHub Configuration
- **Repository**: github.com/jandy1990/wwfm-platform (Private)
- **License**: None initially, "All rights reserved"
- **Personal Access Token**: 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 (expires June 17, 2025)

### 1.2 Supabase Configuration
- **Project URL**: https://wqxkhxdbxdtpuvuvgirx.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeGtoeGRieGR0cHV2dXZnaXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MjgzMTUsImV4cCI6MjA2MzEwNDMxNX0.eBP6_TUB4Qa9KwPvEnUxrp7e7AGtOA3_Zs3CxaObPTo
- **Region**: US East (North Virginia)
- **Auth**: Email confirmations enabled

### 1.3 Next.js Configuration
- **Version**: 15.3.2 with TypeScript
- **Architecture**: App Router
- **Styling**: Tailwind CSS
- **Development**: http://localhost:3000

### 1.4 Deployment
- **Platform**: Vercel
- **URL**: wwfm-platform-6t2xbo4qg-jack-andrews-projects.vercel.app

## 2. Database Schema

### 2.1 Critical Design Decisions

**User ID Architecture**: `public.users.id` MUST equal `auth.users.id` for RLS security

**User Creation Trigger**:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, contribution_points, ratings_count, solutions_count, comments_count)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 0, 0, 0, 0);
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    RETURN new; -- User already exists, that's fine
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.2 Core Tables

#### arenas
```sql
CREATE TABLE arenas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

#### categories (Removed - using flat structure)
*Note: Based on May 28 taxonomy work, we're using a flat arena → goals structure*

#### goals
```sql
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  arena_id UUID REFERENCES arenas(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  slug VARCHAR(200),
  view_count INTEGER DEFAULT 0,
  solution_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  is_approved BOOLEAN DEFAULT true, -- Goals pre-approved from taxonomy
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(arena_id, slug)
);
```

#### solutions (Updated May 28 Evening)
```sql
CREATE TABLE solutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  detailed_steps TEXT,
  time_investment VARCHAR(100),
  cost_estimate VARCHAR(100),
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  avg_rating DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[],
  -- New fields from solution mapping insights
  mechanism_tags TEXT[], -- ["BDNF increase", "stress reduction", "social connection"]
  minimum_dose VARCHAR(100), -- "5 minutes daily"
  primary_benefit VARCHAR(50), -- "energy", "calm", "connection", "focus", "health"
  is_compound BOOLEAN DEFAULT false, -- true for multi-mechanism solutions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

#### ratings
```sql
CREATE TABLE ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID REFERENCES solutions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  effectiveness_score INTEGER NOT NULL CHECK (effectiveness_score >= 1 AND effectiveness_score <= 5),
  difficulty_score INTEGER CHECK (difficulty_score >= 1 AND difficulty_score <= 5),
  time_to_see_results VARCHAR(50),
  would_recommend BOOLEAN DEFAULT true,
  review_text TEXT,
  pros TEXT[],
  cons TEXT[],
  secondary_impacts JSONB DEFAULT '{}', -- For keystone tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(solution_id, user_id)
);
```

### 2.3 Planned Schema Additions (Next Session)

```sql
-- Keystone solution impact tracking
CREATE TABLE solution_goal_impacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID REFERENCES solutions(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  impact_score DECIMAL(3,2) DEFAULT 0.00,
  impact_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(solution_id, goal_id)
);

-- Virtuous cycles tracking (Phase 2)
CREATE TABLE solution_sequences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  from_solution_id UUID REFERENCES solutions(id),
  to_solution_id UUID REFERENCES solutions(id),
  days_between INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Solution relationships (from mapping insights)
CREATE TABLE solution_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_a_id UUID REFERENCES solutions(id),
  solution_b_id UUID REFERENCES solutions(id),
  relationship_type VARCHAR(50), -- "progresses_to", "combines_with", "similar_to"
  strength INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(solution_a_id, solution_b_id, relationship_type)
);
```

## 3. Row Level Security (RLS) Architecture

### 3.1 Core Principles
1. **Public Read, Private Write** - Aggregated data must be publicly accessible
2. **Anonymous First** - Most browsing happens without authentication
3. **Business Logic Alignment** - RLS must match platform goals
4. **Explicit Over Implicit** - Clear policies prevent confusion

### 3.2 Current RLS Policies

#### Ratings Table ✅
```sql
CREATE POLICY "Public read access to ratings" ON ratings 
  FOR SELECT USING (true);

CREATE POLICY "Users create own ratings" ON ratings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own ratings" ON ratings 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own ratings" ON ratings 
  FOR DELETE USING (auth.uid() = user_id);
```

#### Solutions Table ✅
```sql
CREATE POLICY "Public read approved solutions" ON solutions 
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users read own solutions" ON solutions 
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users create solutions" ON solutions 
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users update own solutions" ON solutions 
  FOR UPDATE USING (auth.uid() = created_by);
```

### 3.3 RLS Debugging Best Practices
- Test with anonymous users first
- Use separate queries when debugging
- Add explicit warnings for empty results
- Check Supabase SQL Editor to verify data exists

## 4. Authentication Implementation

### 4.1 Components ✅ COMPLETE
- **AuthContext.tsx**: App-wide auth state management
- **SignUpForm.tsx**: User registration with email verification
- **SignInForm.tsx**: User login with error handling
- **ResetPasswordForm.tsx**: Password reset request
- **UpdatePasswordForm.tsx**: Password update after reset
- **ProtectedRoute.tsx**: Route protection wrapper

### 4.2 Auth Flow
1. Registration → Email verification → Dashboard
2. Login → Session creation → Dashboard
3. Password Reset → Email link → Update → Dashboard
4. Protected Routes → Check auth → Redirect if needed

## 5. File Structure

```
wwfm-platform/
├── app/
│   ├── auth/
│   │   ├── callback/route.ts              ✅
│   │   ├── reset-password/page.tsx        ✅
│   │   ├── signin/page.tsx                ✅
│   │   ├── signup/page.tsx                ✅
│   │   └── update-password/page.tsx       ✅
│   ├── browse/page.tsx                    ✅
│   ├── arena/[slug]/page.tsx              ✅
│   ├── goal/
│   │   └── [id]/
│   │       ├── page.tsx                   ✅
│   │       └── add-solution/
│   │           └── page.tsx               ⬜ (next priority)
│   ├── solution/
│   │   └── [id]/
│   │       └── page.tsx                   ⬜
│   ├── profile/
│   │   └── page.tsx                       ⬜
│   └── dashboard/page.tsx                 ✅
├── components/
│   ├── auth/
│   │   ├── AuthForm.tsx                   ✅
│   │   ├── AuthContext.tsx                ✅
│   │   ├── ProtectedRoute.tsx             ✅
│   │   └── [other auth components]        ✅
│   └── ui/ (planned)
│       ├── KeystoneBadge.tsx              ⬜
│       ├── ImpactSpiderChart.tsx          ⬜
│       └── SolutionImpactTracker.tsx      ⬜
├── lib/
│   ├── supabase.ts                        ✅
│   ├── supabase-debug.ts                  ✅
│   ├── keystone-calculator.ts             ⬜ (planned)
│   └── impact-visualizer.ts               ⬜ (planned)
└── .env.local                             ✅
```

## 6. Environment Setup

### 6.1 Local Development
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://wqxkhxdbxdtpuvuvgirx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6.2 Development Commands
```bash
npm install        # Install dependencies
npm run dev        # Start development server
npm run build      # Build for production
npm run test       # Run tests (when added)
```

### 6.3 Known Issues
- **Browser Extensions**: Can cause hydration errors (use incognito for testing)

## 7. Development Tools & Debugging

### 7.1 RLS Testing Utility
```typescript
// lib/supabase-debug.ts
export async function testRLSPolicies() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  console.log('=== TESTING RLS POLICIES ===')
  
  // Test ratings access
  const { data: anonRatings } = await supabase
    .from('ratings')
    .select('*')
    .limit(1)
  
  console.log('Anonymous can see ratings:', 
    anonRatings && anonRatings.length > 0 ? '✅' : '❌')
  
  // Additional tests...
}
```

### 7.2 Query Patterns
```typescript
// ✅ Use separate queries for complex data
const { data: goal } = await supabase.from('goals').select('*')
const { data: solutions } = await supabase.from('solutions')
  .select('*')
  .eq('goal_id', goal.id)

// ❌ Avoid complex nested queries
// .select('*, solutions(*, ratings(*))')
```

## 8. Implementation Priorities

### 8.1 Next Session (May 29, 2025)

#### 🚨 Priority 1: Solution Submission Form (Enhanced)
1. Create `/goal/[id]/add-solution` route
2. Build form with all solution fields including:
   - Basic fields (title, description, steps)
   - New mechanism fields:
     - Mechanism tags (multi-select)
     - Minimum dose (text input)
     - Primary benefit (dropdown)
     - Is compound solution (checkbox)
3. Implement auth check and redirect
4. Test submission with `is_approved = false`

#### 🔴 Priority 2: Solution Detail Pages
1. Create `/solution/[id]` route
2. Display full solution details including mechanisms
3. Show all ratings with user attribution
4. Add "Rate This" CTA
5. Display compound solution badge if applicable

#### 🟡 Priority 3: Rating Submission
1. Create rating form component
2. Add to solution detail page
3. Update average ratings in real-time
4. Test RLS policies for creation

#### 🟢 Priority 4: Keystone Infrastructure (Refined)

**Database Setup**:
```sql
-- Run these migrations first
ALTER TABLE solutions ADD COLUMN IF NOT EXISTS mechanism_tags TEXT[];
ALTER TABLE solutions ADD COLUMN IF NOT EXISTS minimum_dose VARCHAR(100);
ALTER TABLE solutions ADD COLUMN IF NOT EXISTS primary_benefit VARCHAR(50);
ALTER TABLE solutions ADD COLUMN IF NOT EXISTS is_compound BOOLEAN DEFAULT false;

CREATE TABLE solution_goal_impacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID REFERENCES solutions(id),
  goal_id UUID REFERENCES goals(id),
  impact_score DECIMAL(3,2),
  impact_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE solution_goal_impacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to impacts" ON solution_goal_impacts 
  FOR SELECT USING (true);
```

**Components to Build**:
- `KeystoneBadge.tsx` - Visual indicator for compound/multi-goal solutions
- `ImpactSpiderChart.tsx` - Radar chart visualization
- `keystone-calculator.ts` - Algorithm for identifying compound solutions

### 8.2 Quick Decisions Needed
1. **Moderation approach** for `is_approved = false` solutions
2. **Rating UI** - Stars vs numeric vs thumbs
3. **Compound solution threshold** - Mechanisms count or goal count?

## 9. Decision Log

| Date | Decision | Rationale | Status |
|------|----------|-----------|---------|
| May 24, 2025 | Public read for ratings | Aggregation requires public access | ✅ Implemented |
| May 24, 2025 | Separate queries over joins | Better debugging, clearer RLS | ✅ Implemented |
| May 24, 2025 | Use slugs for URLs | Better UX and SEO | ✅ Implemented |
| May 28, 2025 AM | Flat goal taxonomy | Simpler navigation, emotion-first | ✅ Implemented |
| May 28, 2025 AM | Add keystone solutions | Address root causes, not symptoms | 📋 Planned |
| May 28, 2025 AM | Include life impact scores | Show holistic benefits | 📋 Planned |
| May 28, 2025 PM | Track solution mechanisms | Understand why solutions work | 📋 Planned |
| May 28, 2025 PM | Organic solution growth | Let users add vs. exhaustive mapping | ✅ Decided |

## 10. Known Technical Debt

| Item | Priority | Status |
|------|----------|---------|
| ~~Ratings display bug~~ | ~~🔴 Critical~~ | ✅ FIXED |
| No loading states | 🟡 Medium | ⬜ Planned |
| No error boundaries | 🟡 Medium | ⬜ Planned |
| Missing pagination | 🟡 Medium | ⬜ Future |
| No caching strategy | 🟡 Medium | ⬜ Future |
| Limited form validation | 🟡 Medium | ⬜ Future |

---

## Key Learnings
1. **RLS returns empty data, not errors** - Add warnings
2. **Test anonymous first** - Most users browse without auth
3. **Separate complex queries** - Easier debugging
4. **Document security model** - Make policies explicit
5. **Solutions work through mechanisms** - Track the "why" not just "what"