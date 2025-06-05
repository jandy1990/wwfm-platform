WWFM Technical Reference
Document Type: Technical implementation details
Related Documents: Project Guide | Collaboration Guide | Product Roadmap
Last Updated: May 31, 2025
Status: Active - Authentication Fixed, Ready for Form Testing

This document contains the technical implementation details for the WWFM platform.

Table of Contents
1. Technical Stack Configuration
2. Database Schema
3. Row Level Security (RLS) Architecture
4. Authentication Implementation
5. File Structure
6. Environment Setup
7. Development Tools & Debugging
8. Implementation Priorities
9. Decision Log
10. Known Technical Debt
1. Technical Stack Configuration
1.1 GitHub Configuration
Repository: github.com/jandy1990/wwfm-platform (Private)
License: None initially, "All rights reserved"
Personal Access Token: [Regenerated May 31, 2025]
1.2 Supabase Configuration
Project URL: https://wqxkhxdbxdtpuvuvgirx.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeGtoeGRieGR0cHV2dXZnaXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MjgzMTUsImV4cCI6MjA2MzEwNDMxNX0.eBP6_TUB4Qa9KwPvEnUxrp7e7AGtOA3_Zs3CxaObPTo
Region: US East (North Virginia)
Auth: Email confirmations enabled
1.3 Next.js Configuration
Version: 15.3.2 with TypeScript
Architecture: App Router
Styling: Tailwind CSS
Development: http://localhost:3001 (port 3000 often in use)
TypeScript Config: @ alias configured for imports
1.4 Authentication Libraries (Updated May 31, 2025)
Removed: @supabase/auth-helpers-nextjs (incompatible with Next.js 15)
Added: @supabase/ssr for modern auth handling
Pattern: Async cookie handling for Next.js 15 compatibility
1.5 Deployment
Platform: Vercel
URL: wwfm-platform-6t2xbo4qg-jack-andrews-projects.vercel.app
2. Database Schema
2.1 Critical Design Decisions
User ID Architecture: public.users.id MUST equal auth.users.id for RLS security

Navigation Structure (Updated May 31, 2025):

Simplified from Arena → Category → Goal to Arena → Goal
Categories table remains but is not used in navigation
Goals now have direct arena_id foreign key
User Creation Trigger:

sql
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
2.2 Core Tables
arenas
sql
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
categories (Deprecated - Not used in navigation)
sql
-- Still exists in database but not used in application navigation
-- Kept for data integrity, may be removed in future migration
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  arena_id UUID REFERENCES arenas(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
goals (Updated May 31, 2025)
sql
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  arena_id UUID REFERENCES arenas(id) ON DELETE CASCADE, -- Direct relationship
  category_id UUID REFERENCES categories(id), -- Legacy, being phased out
  title VARCHAR(200) NOT NULL,
  description TEXT,
  -- Note: slug column does not exist (discovered May 31)
  view_count INTEGER DEFAULT 0,
  -- Note: solution_count column does not exist (discovered May 31)
  created_by UUID REFERENCES auth.users(id),
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Constraints added May 31, 2025
ALTER TABLE goals 
ADD CONSTRAINT fk_goals_arena 
FOREIGN KEY (arena_id) REFERENCES arenas(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_goals_arena_id ON goals(arena_id);
solutions (Updated May 29)
sql
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
  mechanism_tags TEXT[],
  minimum_dose VARCHAR(100),
  primary_benefit VARCHAR(50),
  is_compound BOOLEAN DEFAULT false,
  benefit_categories TEXT[] DEFAULT '{}',
  completion_score INTEGER DEFAULT 20,
  time_to_results VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
ratings
sql
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
  secondary_impacts JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(solution_id, user_id)
);
2.3 Additional Tables (from May 29)
solution_enrichments - Progressive disclosure system
solution_completion_tracking - Tracks entry completeness
notification_queue - Smart prompts for users
goal_suggestions - User-submitted goal ideas
3. Row Level Security (RLS) Architecture
3.1 Core Principles
Public Read, Private Write - Aggregated data must be publicly accessible
Anonymous First - Most browsing happens without authentication
Business Logic Alignment - RLS must match platform goals
Explicit Over Implicit - Clear policies prevent confusion
3.2 RLS Policies (All tables have RLS enabled)
See previous documentation for detailed policies. All policies remain unchanged and functioning correctly.

4. Authentication Implementation (Completely Revised May 31, 2025)
4.1 Authentication Architecture
Key Change: Migrated from @supabase/auth-helpers-nextjs to @supabase/ssr due to Next.js 15 compatibility issues.

Server-Side Client (/lib/supabase-server.ts)
typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies() // Next.js 15 requires await
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component cookie setting - can be ignored
          }
        },
      },
    }
  )
}
Client-Side (/lib/supabase.ts)
typescript
import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// For backward compatibility
export const supabase = createSupabaseBrowserClient()
Middleware (/middleware.ts)
typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update both request and response cookies
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // CRITICAL: Use getUser() not getSession() for proper refresh
  await supabase.auth.getUser()

  return supabaseResponse
}
4.2 Components ✅ COMPLETE
AuthContext.tsx: Uses new browser client
SignUpForm.tsx: User registration with email verification
SignInForm.tsx: User login with error handling
ResetPasswordForm.tsx: Password reset request
UpdatePasswordForm.tsx: Password update after reset
ProtectedRoute.tsx: Updated to use createSupabaseBrowserClient()
SolutionForm.tsx: Updated to use new auth pattern
4.3 Auth Flow
Registration → Email verification → Dashboard
Login → Session creation → Dashboard
Password Reset → Email link → Update → Dashboard
Protected Routes → Check auth → Redirect if needed
Key Fix: Middleware now properly refreshes expired sessions
4.4 Server Component Usage Pattern
typescript
// All server components must await the client
const supabase = await createSupabaseServerClient()
const { data: { session } } = await supabase.auth.getSession()
5. File Structure
wwfm-platform/
├── app/
│   ├── auth/
│   │   ├── auth-debug/
│   │   │   └── page.tsx               ✅ (Fixed extension May 31)
│   │   ├── callback/route.ts          ✅
│   │   ├── reset-password/page.tsx    ✅
│   │   ├── signin/page.tsx            ✅
│   │   ├── signup/page.tsx            ✅
│   │   └── update-password/page.tsx   ✅
│   ├── browse/page.tsx                ✅
│   ├── arena/[slug]/page.tsx          ✅ (Updated May 31)
│   ├── category/                      ❌ (Removed May 31)
│   ├── goal/
│   │   └── [id]/
│   │       ├── page.tsx               ✅ (Updated May 31)
│   │       └── add-solution/
│   │           └── page.tsx           ✅ (Updated May 31)
│   ├── solution/
│   │   └── [id]/
│   │       └── page.tsx               ⬜
│   ├── profile/
│   │   └── page.tsx                   ⬜
│   └── dashboard/page.tsx             ✅
├── components/
│   ├── auth/
│   │   ├── AuthForm.tsx               ✅
│   │   ├── AuthContext.tsx            ✅
│   │   ├── ProtectedRoute.tsx         ✅ (Updated May 31)
│   │   ├── solutions/
│   │   │   └── SolutionForm.tsx       ✅ (Updated May 31)
│   │   └── [other auth components]    ✅
│   └── ui/ (planned)
│       ├── KeystoneBadge.tsx          ⬜
│       ├── ImpactSpiderChart.tsx      ⬜
│       └── SolutionImpactTracker.tsx  ⬜
├── lib/
│   ├── supabase.ts                    ✅ (Updated May 31)
│   ├── supabase-server.ts             ✅ (Updated May 31)
│   ├── supabase-debug.ts              ✅
│   ├── keystone-calculator.ts         ⬜ (planned)
│   └── impact-visualizer.ts           ⬜ (planned)
├── middleware.ts                      ✅ (Updated May 31)
├── tsconfig.json                      ✅
└── .env.local                         ✅
6. Environment Setup
6.1 Local Development
bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://wqxkhxdbxdtpuvuvgirx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
6.2 Development Commands
bash
npm install        # Install dependencies
npm run dev        # Start development server (port 3001)
npm run build      # Build for production
npm run lint       # Run ESLint
npx tsc --noEmit   # Check TypeScript types
6.3 Known Configuration Issues
Port: Often runs on 3001 as 3000 is commonly in use
Browser Extensions: Can cause hydration errors (use incognito for testing)
TypeScript @ alias: Working correctly after tsconfig updates
Cookie Warnings: Fixed by migrating to @supabase/ssr
7. Development Tools & Debugging
7.1 Authentication Debug Page
Access /auth-debug to verify authentication status and cookie presence.

7.2 Claude Code Integration (Added May 31)
bash
# Install globally (requires sudo on Mac)
sudo npm install -g @anthropic-ai/claude-code

# Run in project directory
claude

# Commands in Claude:
# - Check auth issues
# - Update imports
# - Fix TypeScript errors
7.3 Common Debug Commands
bash
# Check for old auth-helpers imports
grep -r "@supabase/auth-helpers-nextjs" app components lib

# Find all server client usage
grep -r "createSupabaseServerClient" app

# Check TypeScript
npx tsc --noEmit

# Clear Next.js cache
rm -rf .next
8. Implementation Priorities
8.1 Completed (as of May 31, 2025)
✅ Authentication system completely fixed
✅ Navigation working (Arena → Goal)
✅ All components updated to new auth pattern
✅ TypeScript compiling without errors
✅ Can reach solution form when authenticated
8.2 Next Session (June 1, 2025)
🔴 Priority 1: Test Solution Submission
Test complete form submission flow
Verify database records created correctly
Check all relationships properly set
Debug any submission errors
🟡 Priority 2: Display Solutions
Update goal page to show solutions
Implement rating aggregation
Add solution count display
Handle empty states
🟢 Priority 3: Polish Form UX
Add success confirmations
Implement loading states
Add validation messages
Handle errors gracefully
8.3 Quick Decisions Needed
Moderation approach for is_approved = false solutions
Solution display format on goal pages
Empty state messaging when no solutions exist
9. Decision Log
Date	Decision	Rationale	Status
May 24, 2025	Public read for ratings	Aggregation requires public access	✅ Implemented
May 24, 2025	Separate queries over joins	Better debugging, clearer RLS	✅ Implemented
May 24, 2025	Use slugs for URLs	Better UX and SEO	⚠️ Goals don't have slugs
May 28, 2025	Flat goal taxonomy	Simpler navigation, emotion-first	✅ Implemented
May 29, 2025	Two-section form design	Capture successes and failures	✅ Built
May 31, 2025	Remove categories from nav	Simplify to Arena → Goal	✅ Implemented
May 31, 2025	Migrate to @supabase/ssr	Next.js 15 compatibility	✅ Implemented
May 31, 2025	Make server client async	Handle Next.js 15 cookies	✅ Implemented
10. Known Technical Debt
Item	Priority	Status	Notes
Auth redirect loop	🔴 Critical	✅ FIXED	Migrated to @supabase/ssr
Cookie warnings	🔴 Critical	✅ FIXED	Async server client
No loading states	🟡 Medium	⬜ Planned	Add in next session
No error boundaries	🟡 Medium	⬜ Planned	Future improvement
Missing pagination	🟡 Medium	⬜ Future	Not critical for MVP
No caching strategy	🟡 Medium	⬜ Future	Performance optimization
Limited form validation	🟡 Medium	⬜ Next session	Test and improve
ESLint warnings	🟢 Low	⬜ Future	Non-functional issues
Key Learnings from May 31 Session
Next.js 15 Breaking Changes - The cookies() function becoming async broke many auth libraries
Modern Auth Pattern - @supabase/ssr is the correct approach for Next.js App Router
Session Refresh Critical - Must use getUser() in middleware, not just getSession()
Async All The Way - Server components must await the Supabase client creation
Simplify When Stuck - Removing categories simplified both code and UX
Critical Implementation Notes
Server Components Must Await
typescript
// ❌ OLD - Causes cookie errors
const supabase = createSupabaseServerClient()

// ✅ NEW - Properly handles async cookies
const supabase = await createSupabaseServerClient()
Middleware Must Refresh Sessions
typescript
// ❌ OLD - Sessions expire
await supabase.auth.getSession()

// ✅ NEW - Refreshes expired sessions
await supabase.auth.getUser()
All Components Updated
Every component using the old @supabase/auth-helpers-nextjs has been updated to use the new pattern. No imports from the old library should remain.

11. Key User Flows
11.1 Browse & Discovery Flow ✅ COMPLETE
Implementation: /app/browse → /app/arena/[slug] → /app/goal/[id]

User lands on /browse seeing all arenas with icons
Clicks arena (e.g., "Feel better emotionally") → /arena/feel-better-emotionally
Views goals in natural language → "Stop feeling overwhelmed all the time"
Clicks specific goal → /goal/[id]
Sees solutions with effectiveness ratings (⭐ 4.5 with count)
Technical Notes:

Uses createSupabaseServerClient() for all data fetching
Public read access via RLS policies
Goals fetched with arena_id foreign key (categories deprecated)
11.2 User Registration & Onboarding ✅ COMPLETE
Implementation: /app/auth/signup → email verification → /dashboard

User signs up with email at /auth/signup
Supabase sends verification email
User clicks link → /auth/callback handles token
handle_new_user() trigger creates public.users record
Redirect to dashboard
Technical Notes:

Email verification required (Supabase setting)
User ID sync between auth.users and public.users critical
Session management via @supabase/ssr
11.3 Solution Contribution ✅ BUILT (Testing Next)
Implementation: /app/goal/[id]/add-solution with SolutionForm component

Authenticated user on goal page
Clicks "Share What Worked" (requires auth)
Fills two-section form:
Section 1: Detailed success (1-5 stars)
Section 2: Quick-add failures
Submission creates:
Solution record with effectiveness
Rating record linked to user
Updates to aggregated scores
Technical Notes:

Form at /components/auth/solutions/SolutionForm.tsx
Protected route with auth check
Effectiveness-based conditional fields
Pre-populated autocomplete planned
11.4 Rating Solutions 📋 PLANNED
Implementation: TBD

User finds solution on goal page
Clicks "I tried this"
Rates effectiveness (1-5 stars)
Optional: detailed review
Updates avg_rating and rating_count
Technical Considerations:

One rating per user per solution (unique constraint)
Aggregation via database triggers or application logic
Consider real-time updates via Supabase subscriptions
11.5 Future Flows (Not Implemented)
Keystone Discovery: Solutions addressing multiple goals
Pattern Recognition: "Often leads to" connections
Progress Tracking: Personal dashboards
12. Success Metrics
12.1 Phase 1 MVP Metrics (Current)
Target Timeline: Launch by April 2025

Metric	Target	Measurement Method
Registered Users	1,000	Count of public.users
Solution Contributions	500	Count where created_by NOT NULL
Ratings Submitted	2,000	Count of ratings table
Rating Completion	80%	Ratings with review_text / total
Spam/Low Quality	<2%	Flagged content / total
12.2 Phase 2 Growth Metrics
Target Timeline: August 2025

Metric	Target	Measurement Method
Registered Users	10,000	Count of public.users
Total Ratings	25,000	Count of ratings table
Goals per User	3+	Avg distinct goals with activity
Monthly Active	40%	Users with activity in 30 days
Keystone Solutions	100	Solutions effective for 5+ goals
12.3 Technical Performance Metrics
Monitoring via Vercel Analytics

Metric	Target	Current Status
Page Load Time	<2s	Not measured
API Response Time	<200ms	Not measured
Error Rate	<1%	Not measured
Uptime	99.9%	Vercel managed
12.4 Implementation Tracking
sql
-- User engagement query
SELECT 
  COUNT(DISTINCT user_id) as active_users,
  COUNT(*) as total_ratings,
  AVG(effectiveness_score) as avg_effectiveness
FROM ratings
WHERE created_at > NOW() - INTERVAL '30 days';

-- Solution quality query  
SELECT 
  s.title,
  s.avg_rating,
  s.rating_count,
  COUNT(DISTINCT r.user_id) as unique_raters
FROM solutions s
LEFT JOIN ratings r ON s.id = r.solution_id
GROUP BY s.id
HAVING s.rating_count > 5
ORDER BY s.avg_rating DESC;
13. Development Timeline & Milestones
13.1 Project Timeline
Project Start: May 18, 2025
MVP Target: April 2025 (Phase 1)
Growth Target: August 2025 (Phase 2)
13.2 Completed Milestones
Date	Milestone	Key Decisions
May 18, 2025	Project initialized	Next.js 15, Supabase, TypeScript
May 23, 2025	Authentication complete	Email verification required
May 24, 2025	Browse/Discovery complete	Public read RLS pattern
May 24, 2025	Ratings bug fixed	Separate queries over joins
May 28, 2025	Goal taxonomy complete	459 goals, 9 arenas
May 29, 2025	Solution form built	Two-section design
May 31, 2025	Auth fixed for Next.js 15	Migrated to @supabase/ssr
May 31, 2025	Navigation simplified	Removed categories layer
13.3 Upcoming Milestones
 Solution submission tested
 Solutions display on goals
 Basic user profiles
 Search implementation
 Keystone algorithm v1
Status: The authentication system is now fully functional. Users can navigate the platform and access protected routes without being incorrectly redirected. The next phase is testing the core functionality - solution submission and display.