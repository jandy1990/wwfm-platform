WWFM Technical Reference
Document Type: Technical implementation details
Related Documents: Project Guide | Collaboration Guide | Latest Session
Last Updated: May 24, 2025
Status: Active - Goal Browsing Complete, Ratings Display Bug Pending

This document contains the technical implementation details for the WWFM platform, including configuration information, database schema, authentication setup, and decision log.

Table of Contents
1. Technical Stack Configuration
2. Database Schema
3. Authentication Implementation
4. File Structure
5. Environment Setup
6. Pre-Launch Checklist
7. Decision Log
8. Known Technical Debt
1. Technical Stack Configuration
GitHub Configuration
Repository Name: wwfm-platform
Repository Type: Private (for initial development)
Username: jandy1990
Repository URL: https://github.com/jandy1990/wwfm-platform
License: None initially, with "All rights reserved" copyright notice
Personal Access Token: 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 (expires June 17, 2025)
Status: Active and configured for development workflow
Supabase Configuration
Project Settings
Project Name: wwfm-platform
Organization Type: Personal
Region: US East (North Virginia)
Project URL: https://wqxkhxdbxdtpuvuvgirx.supabase.co
Anon Public Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeGtoeGRieGR0cHV2dXZnaXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MjgzMTUsImV4cCI6MjA2MzEwNDMxNX0.eBP6_TUB4Qa9KwPvEnUxrp7e7AGtOA3_Zs3CxaObPTo
Status: Fully configured and integrated with authentication working
Authentication Settings
Site URL: http://localhost:3000 (development environment)
Redirect URLs: http://localhost:3000/auth/callback
Email Confirmations: Enabled (using default templates)
User Signups: Enabled
Email Provider: Enabled (using built-in Supabase email service for development)
Manual Linking: Disabled
Anonymous Sign-ins: Disabled
Status: Email verification tested and working
Next.js Configuration
Framework: Next.js 15.3.2 with TypeScript
App Router: Using Next.js App Router architecture
Styling: Tailwind CSS with responsive design
Development Server: Running on http://localhost:3000
Status: Fully operational with hot reloading
Deployment Configuration
Hosting Platform: Vercel
Production URL: wwfm-platform-6t2xbo4qg-jack-andrews-projects.vercel.app
Build Command: next build
Output Directory: .next
Install Command: npm install
Status: Deployment pipeline configured (may need environment variable updates for production)
2. Database Schema
Critical Design Decisions
User ID Architecture
IMPORTANT: The public.users.id MUST equal auth.users.id. This is not a bug but a security requirement:

Row Level Security policies use (auth.uid() = id) for user profile updates
Changing this would break all RLS policies
This 1:1 relationship is intentional and must be maintained
User Creation Trigger
A trigger automatically creates a public.users profile when someone signs up:

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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
Complete Implementation Status: ✅ DEPLOYED AND TESTED
The complete database schema has been implemented in Supabase with all tables, relationships, functions, triggers, and Row Level Security policies working as designed.

Table Structures
1. Arenas Table
Primary categories for organizing life improvement goals.

Column	Type	Constraints	Description
id	uuid	PRIMARY KEY	Unique identifier
name	text	NOT NULL	Display name (e.g., "Health & Wellness")
slug	text	UNIQUE	URL-friendly identifier (e.g., "health-wellness")
description	text		Detailed description of the arena
icon	text		Emoji or icon representation
order_rank	integer		Display order (1 = first)
is_active	boolean	DEFAULT true	Whether arena is visible
created_at	timestamptz	DEFAULT NOW()	Creation timestamp
updated_at	timestamptz	DEFAULT NOW()	Last update timestamp
Indexes:

idx_arenas_slug on slug column for performance
2. Categories Table
Sub-categories within each arena.

Column	Type	Constraints	Description
id	uuid	PRIMARY KEY	Unique identifier
arena_id	uuid	FOREIGN KEY	Reference to parent arena
name	text	NOT NULL	Display name (e.g., "Weight Loss")
slug	text		URL-friendly identifier (e.g., "weight-loss")
description	text		Detailed description
created_at	timestamptz	DEFAULT NOW()	Creation timestamp
updated_at	timestamptz	DEFAULT NOW()	Last update timestamp
Note: Missing columns from original design: icon, order_rank, is_active

Indexes:

idx_categories_slug on slug column for performance
3. Goals Table
Specific goals users want to achieve.

Column	Type	Constraints	Description
id	uuid	PRIMARY KEY	Unique identifier
category_id	uuid	FOREIGN KEY	Reference to parent category
title	text	NOT NULL	Goal title (e.g., "Lose 20 pounds")
description	text		Detailed description
created_by	uuid	FOREIGN KEY	User who created the goal
is_approved	boolean	DEFAULT false	Moderation status
meta_tags	ARRAY		Tags for search/filtering
view_count	integer	DEFAULT 0	Number of views
created_at	timestamptz	DEFAULT NOW()	Creation timestamp
updated_at	timestamptz	DEFAULT NOW()	Last update timestamp
Note: Missing columns from original design: difficulty_level, time_horizon

4. Users Table
Column	Type	Constraints	Description
id	uuid	PRIMARY KEY, FOREIGN KEY REFERENCES auth.users(id)	MUST match auth.users.id
username	text		Display name
email	text		Email address
avatar_url	text		Profile picture URL
created_at	timestamptz	DEFAULT NOW()	Creation timestamp
updated_at	timestamptz	DEFAULT NOW()	Last update timestamp
contribution_points	integer	DEFAULT 0	Points earned
ratings_count	integer	DEFAULT 0	Number of ratings given
solutions_count	integer	DEFAULT 0	Solutions submitted
comments_count	integer	DEFAULT 0	Comments posted
age_range	text		Optional demographic
gender	text		Optional demographic
location	text		Optional location
share_demographics	boolean	DEFAULT false	Privacy setting
show_activity	boolean	DEFAULT true	Privacy setting
registration_ip	text		For fraud detection
registration_timestamp	timestamptz		Signup time
captcha_score	numeric		Bot detection score
trust_score	integer	DEFAULT 0	Platform trust level
Critical Constraint: id MUST equal the user's auth.users.id for RLS policies to work

5. Solutions Table
Column	Type	Constraints	Description
id	uuid	PRIMARY KEY	Unique identifier
goal_id	uuid	FOREIGN KEY	Reference to goals table
solution_type_id	uuid	FOREIGN KEY	Reference to solution_types
title	text	NOT NULL	Solution name
description	text		Detailed description
created_by	uuid	FOREIGN KEY	User who created it
is_approved	boolean	DEFAULT false	Moderation status
source_type	text		Type of solution source
external_url	text		Link to external resource
cost_category	text		free/cheap/moderate/expensive
time_investment	text		Time required
reference_links	ARRAY		Supporting links
completion_percentage	integer		How complete the solution is
created_at	timestamptz	DEFAULT NOW()	Creation timestamp
updated_at	timestamptz	DEFAULT NOW()	Last update timestamp
6. Ratings Table
Column	Type	Constraints	Description
id	uuid	PRIMARY KEY	Unique identifier
solution_id	uuid	FOREIGN KEY	Reference to solutions
user_id	uuid	FOREIGN KEY REFERENCES users(id)	Who rated
effectiveness_score	integer	NOT NULL, CHECK (1-5)	How well it worked
duration_used	text		How long they tried it
severity_before	integer		Baseline measurement
side_effects	text		Any negative effects
completion_percentage	integer		How much they completed
created_at	timestamptz	DEFAULT NOW()	Creation timestamp
updated_at	timestamptz	DEFAULT NOW()	Last update timestamp
Unique Constraint: (solution_id, user_id) - One rating per user per solution

7. Additional Tables Implemented
solution_types: Categories of solutions (Medication, Exercise, Meditation)
solution_attributes: Dynamic attributes for solutions
attribute_definitions: Defines attributes per solution type
comments: User comments on solutions
goal_followers: Users following specific goals
saved_solutions: User's saved solutions for later
user_solutions: Solutions users are actively trying
content_flags: Moderation flags for content
Row Level Security Policies
Users Table RLS
"Users can update their own profile": (auth.uid() = id)
"Users can view all profiles": true (public profiles)
Database Functions and Triggers
handle_new_user(): Creates public user profile on auth signup
increment_goal_views(): Updates view count for goals
update_contribution_points(): Manages user reputation
3. Authentication Implementation
3.1 Authentication Architecture
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client-Side   │    │   Server-Side   │    │    Supabase     │
│  Auth Components│◄──►│   App Layout    │◄──►│   Auth Service  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  - SignUpForm   │    │  - Metadata     │    │  - User Storage │
│  - SignInForm   │    │  - Global CSS   │    │  - Email Service│
│  - AuthForm     │    │  - Font Config  │    │  - Session Mgmt │
│  - AuthContext  │    │  - No Auth Logic│    │  - Security     │
│  - ResetPassword│    │                 │    │  - RLS Policies │
└─────────────────┘    └─────────────────┘    └─────────────────┘
3.2 Component Implementation Status
✅ Completed Components
AuthForm.tsx: Base reusable form wrapper
AuthContext.tsx: App-wide auth state management
SignUpForm.tsx: User registration with email verification
SignInForm.tsx: User login with error handling
ResetPasswordForm.tsx: Password reset request
ProtectedRoute.tsx: Route protection wrapper
3.3 Authentication Flow
✅ Complete Authentication Journey
Registration → Email verification → Dashboard
Login → Session creation → Dashboard
Password Reset → Email link → Update password → Dashboard
Protected Routes → Check auth → Redirect if needed
3.4 Integration Points
✅ Supabase Client Configuration
typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
4. File Structure
4.1 Current Implementation Status
wwfm-platform/
├── app/
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts              ✅ Email verification handler
│   │   ├── reset-password/
│   │   │   └── page.tsx              ✅ Password reset request
│   │   ├── signin/
│   │   │   └── page.tsx              ✅ Login page
│   │   ├── signup/
│   │   │   └── page.tsx              ✅ Registration page
│   │   └── update-password/
│   │       └── page.tsx              ✅ New password form
│   ├── browse/
│   │   └── page.tsx                  ✅ Arena browsing
│   ├── arena/
│   │   └── [slug]/
│   │       └── page.tsx              ✅ Dynamic arena pages
│   ├── category/
│   │   └── [slug]/
│   │       └── page.tsx              ✅ Category listing
│   ├── goal/
│   │   └── [id]/
│   │       └── page.tsx              ⚠️  Goal details (rating bug)
│   ├── dashboard/
│   │   └── page.tsx                  ✅ User dashboard
│   ├── globals.css                   ✅ Global styles
│   ├── layout.tsx                    ✅ Root layout
│   └── page.tsx                      ✅ Home page
├── components/
│   └── auth/
│       ├── AuthForm.tsx              ✅ Base form component
│       ├── AuthContext.tsx           ✅ Auth state management
│       ├── ProtectedRoute.tsx        ✅ Route protection
│       ├── ResetPasswordForm.tsx     ✅ Password reset form
│       ├── SignInForm.tsx            ✅ Login form
│       └── SignUpForm.tsx            ✅ Registration form
├── contexts/
│   └── AuthContext.tsx               ✅ Duplicate (use components/auth)
├── lib/
│   └── supabase.ts                   ✅ Supabase client
├── .env.local                        ✅ Environment variables
├── .gitignore                        ✅ Git ignore rules
├── next.config.ts                    ✅ Next.js config
├── package.json                      ✅ Dependencies
├── tailwind.config.ts                ✅ Tailwind config
└── tsconfig.json                     ✅ TypeScript config
4.2 Next Implementation Priority
app/
├── goal/
│   └── [id]/
│       ├── add-solution/
│       │   └── page.tsx              ⬜ Share what worked form
│       └── page.tsx                  🔧 FIX RATING DISPLAY
├── solution/
│   └── [id]/
│       └── page.tsx                  ⬜ Solution details
├── profile/
│   ├── page.tsx                      ⬜ User profile
│   └── edit/
│       └── page.tsx                  ⬜ Edit profile
└── search/
    └── page.tsx                      ⬜ Search results
5. Environment Setup
5.1 Development Environment
✅ Local Development Setup
Node.js: Compatible version running
Next.js: 15.3.2 development server operational
TypeScript: Compilation successful with no blocking errors
Tailwind CSS: Styling system working with hot reloading
VS Code: Configured with proper folder structure
✅ Project Structure
Project Root: /Users/jackandrews/Desktop/wwfm-platform/wwfm-platform/
Important: Nested folder structure - ensure VS Code opens inner folder
✅ Environment Variables (.env.local)
bash
NEXT_PUBLIC_SUPABASE_URL=https://wqxkhxdbxdtpuvuvgirx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeGtoeGRieGR0cHV2dXZnaXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MjgzMTUsImV4cCI6MjA2MzEwNDMxNX0.eBP6_TUB4Qa9KwPvEnUxrp7e7AGtOA3_Zs3CxaObPTo
5.2 Development Commands
bash
# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check

# Clear Next.js cache
rm -rf .next && npm run dev
5.3 Known Environment Issues
⚠️ Browser Extension Interference
Issue: Hydration errors in main browser
Cause: Extensions modifying DOM before React hydration
Impact: Cosmetic only, no functionality impact
Workaround: Use incognito mode for development
⚠️ Email Delivery
Issue: Development emails may be slow
Cause: Supabase built-in email service rate limits
Impact: 1-5 minute delivery delays
Solution: Check spam folder; implement custom SMTP for production
6. Pre-Launch Checklist
Authentication & Security ✅ 90% Complete
 User Registration with email verification
 User Authentication (email/password)
 Password Reset Flow
 Protected Routes implementation
 Session Management
 Environment Security (API keys)
 Form Validation (client-side)
 RLS Policies configured
 Rate limiting for auth endpoints
 Server-side validation enhancement
Core Features 🔄 60% Complete
 Arena browsing interface
 Category navigation
 Goal discovery pages
 Solution display ("What Worked")
 Rating display (BUG - TOP PRIORITY)
 Solution submission forms
 Rating submission interface
 Search functionality
 User profiles
Infrastructure & Performance ✅ 85% Complete
 Next.js App Router configuration
 TypeScript setup
 Tailwind CSS integration
 Supabase integration
 Vercel deployment pipeline
 Database schema complete
 Production environment variables
 Performance optimization
 Error monitoring setup
 Analytics implementation
User Experience 🔄 70% Complete
 Responsive design
 Form UX with loading states
 Navigation flow
 Error messages
 Basic accessibility
 Loading skeletons
 Empty states design
 Success confirmations
 Comprehensive accessibility audit
Content & Data ✅ 80% Complete
 Database schema implemented
 Seed data created
 Sample content loaded
 Content moderation tools
 Admin interface
 Backup strategy
 Privacy Policy
 Terms of Service
7. Decision Log
Date	Decision	Alternatives	Reasoning	Status
2025-05-24	Keep public.users.id = auth.users.id	Separate auth_id column	RLS policies require this for security	✅ Implemented
2025-05-24	Add exception handling to user creation trigger	Let trigger fail on duplicates	Prevents errors for existing users	✅ Implemented
2025-05-24	Use slugs for SEO-friendly URLs	Use UUIDs in URLs	Better UX and SEO	✅ Implemented
2025-05-24	"Solutions" → "What Worked" in UI only	Change database schema	Clean separation of concerns	✅ Implemented
2025-05-23	Fix nested folder structure	Restructure repository	Essential for import resolution	✅ Implemented
2025-05-23	Client components for auth forms	Server components	Needed for interactivity	✅ Implemented
2025-05-23	Reusable AuthForm base component	Duplicate form code	Consistency and maintainability	✅ Implemented
2025-05-18	Private GitHub repository	Public repository	Protect IP during development	✅ Implemented
2025-05-18	Next.js with TypeScript	React SPA, Vue.js	SSR, API routes, great DX	✅ Implemented
2025-05-18	Supabase for backend	Firebase, custom backend	PostgreSQL, built-in auth, RLS	✅ Implemented
2025-05-18	Post-moderation approach	Pre-moderation	Encourage contribution	✅ Implemented
8. Known Technical Debt
Item	Description	Impact	Plan to Address	Priority	Status
Ratings display bug	Ratings exist in DB but show "No ratings yet" on goal pages	Core value prop broken - can't see effectiveness	Debug query/data transformation in goal page component	🔴 Critical	🔄 Next Task
No loading states	Pages show blank while fetching data	Poor perceived performance	Add skeleton screens and loading spinners	🟡 Medium	⬜ Planned
No error boundaries	Errors crash entire page	Poor error handling UX	Implement React error boundaries	🟡 Medium	⬜ Planned
Missing pagination	All content loads at once	Performance issues as content grows	Add pagination to browse/category pages	🟡 Medium	⬜ Future
No caching strategy	Every page load fetches fresh data	Unnecessary API calls	Implement React Query or SWR	🟡 Medium	⬜ Future
Duplicate AuthContext	Two AuthContext files exist	Confusion and potential bugs	Remove contexts/AuthContext.tsx	🟢 Low	⬜ Cleanup
No admin interface	Content management via SQL	Difficult to manage content	Build admin dashboard	🟡 Medium	⬜ Future
Limited form validation	Only client-side validation	Security risk	Add server-side validation	🟡 Medium	⬜ Future
No rate limiting	APIs vulnerable to abuse	Security/cost risk	Implement rate limiting	🟡 Medium	⬜ Future
Debugging Plan for Ratings Issue
typescript
// Add to app/goal/[id]/page.tsx
console.log('Goal data:', goal)
console.log('Solutions:', goal.solutions)
goal.solutions?.forEach(s => {
  console.log(`${s.title} ratings:`, s.ratings)
  console.log('Rating count:', s.ratings?.length)
})
Implementation Priority for Next Session
🚨 Priority 1: Fix Ratings Display Bug
Add console logging to trace data flow
Verify Supabase query response structure
Check averageRating calculation
Test alternative query approaches if needed
🔴 Priority 2: Solution Submission
Create "Share What Worked" form
Add solution type selection
Implement cost/time fields
Add to database with moderation flag
🟡 Priority 3: User Profiles
Create profile display page
Show user's contributions
Display reputation points
Add edit functionality
Document Review Log
Date	Reviewer	Changes Made	Next Review
2025-05-18	jandy1990 & Claude	Initial creation	End of next session
2025-05-23	jackandrews & Claude	Added authentication implementation details	Next session
2025-05-24	jackandrews & Claude	Added database schema reality, user trigger improvements, slug implementation, ratings bug documentation	After bug fix
