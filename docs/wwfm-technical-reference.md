WWFM Technical Reference
Document Type: Technical implementation details
Related Documents: Project Guide | Collaboration Guide | Product Roadmap
Last Updated: June 8, 2025
Status: Active - UI Enhancements Complete, Ready for Testing & Content

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
11. Key User Flows
12. Success Metrics
13. Development Timeline & Milestones
14. UI Component Library
15. Session Transition Notes
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
Styling: Tailwind CSS with custom animations
Development: http://localhost:3002 (3001/3000 often in use)
TypeScript Config: @ alias configured but sometimes problematic
1.4 Authentication Libraries (Updated May 31, 2025)
Current: @supabase/ssr for modern auth handling
Pattern: Async cookie handling for Next.js 15 compatibility
Note: Requires explicit installation of @supabase/ssr
1.5 Deployment
Platform: Vercel
URL: wwfm-platform-6t2xbo4qg-jack-andrews-projects.vercel.app
2. Database Schema (MAJOR UPDATE June 2025)
2.1 Critical Design Decisions
Solutions are now GENERIC: One "Vitamin D" entry serves all goals, not duplicates per goal

Three-Layer Architecture:

Solutions: Generic approaches (Vitamin D, Exercise, etc.)
Solution Implementations: Variants (1000 IU daily, 5000 IU daily)
Goal-Implementation Links: Effectiveness per goal+variant combo
Source Type Support: Added constraints for AI-generated content tracking

User Creation Trigger: (Unchanged)

sql
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, contribution_points, ratings_count, solutions_count, comments_count)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 0, 0, 0, 0);
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
2.2 Core Tables
solutions (UPDATED - no goal_id)
sql
CREATE TABLE solutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- REMOVED: goal_id (solutions are now generic)
  title VARCHAR(200) NOT NULL,
  description TEXT, -- May be removed in future
  solution_type VARCHAR(50), -- 'dosage-based', 'time-based', 'protocol-based', 'resource-based'
  solution_fields JSONB DEFAULT '{}', -- Type-specific field definitions
  source_type VARCHAR(50) DEFAULT 'community_contributed', -- NOW WITH CONSTRAINTS
  created_by UUID REFERENCES auth.users(id),
  tags TEXT[],
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Source type constraints
ALTER TABLE solutions 
ADD CONSTRAINT solutions_source_type_check 
CHECK (source_type IN (
  'community_contributed',
  'ai_generated',
  'ai_enhanced',
  'expert_verified'
));
solution_implementations (NEW)
sql
CREATE TABLE solution_implementations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID REFERENCES solutions(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL, -- e.g., "Low dose daily", "High dose for deficiency"
  details JSONB DEFAULT '{}', -- Structured fields based on solution_type
  created_by UUID REFERENCES auth.users(id),
  source_type VARCHAR(50) DEFAULT 'community_contributed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Source type constraints
ALTER TABLE solution_implementations
ADD CONSTRAINT solution_implementations_source_type_check
CHECK (source_type IN (
  'community_contributed',
  'ai_generated',
  'ai_enhanced',
  'expert_verified'
));
goal_implementation_links (NEW)
sql
CREATE TABLE goal_implementation_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  implementation_id UUID REFERENCES solution_implementations(id) ON DELETE CASCADE,
  avg_effectiveness DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  typical_application TEXT,
  contraindications TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(goal_id, implementation_id)
);
solution_type_fields (NEW)
sql
CREATE TABLE solution_type_fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_type VARCHAR(50) UNIQUE NOT NULL,
  required_fields JSONB NOT NULL DEFAULT '{}',
  optional_fields JSONB DEFAULT '{}',
  field_order TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
ratings (UPDATED)
sql
CREATE TABLE ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- REMOVED: solution_id
  implementation_id UUID REFERENCES solution_implementations(id), -- NEW
  user_id UUID REFERENCES auth.users(id),
  effectiveness_score INTEGER NOT NULL CHECK (effectiveness_score >= 1 AND effectiveness_score <= 5),
  -- REMOVED: detailed_steps (moved to forums)
  time_to_see_results VARCHAR(50),
  would_recommend BOOLEAN DEFAULT true,
  review_text TEXT,
  -- REMOVED: pros, cons arrays (moved to forums)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(implementation_id, user_id)
);
2.3 Solution Categories (PRELIMINARY)
Current working categories (expect major changes after AI content generation):

dosage-based: Supplements, medications, topicals
time-based: Exercise, meditation, therapy sessions
protocol-based: Techniques, methods, routines
resource-based: Products, tools, courses
2.4 Triangle Architecture Enhanced
The enhanced triangle now captures:

Person: user_id (who tried it)
Implementation: implementation_id (specific variant)
Solution: via implementation.solution_id (generic approach)
Goal: via goal_implementation_links (what problem)
Effectiveness: Contextual per goal+implementation
2.5 Content Scale (Unchanged)
13 Arenas: Major life domains
75 Categories: Logical groupings within arenas
549 Goals: Specific outcomes users want to achieve
3. Row Level Security (RLS) Architecture
3.1 Core Principles (Unchanged)
Public Read, Private Write
Anonymous First
Business Logic Alignment
Explicit Over Implicit
3.2 New Table RLS Policies
solution_implementations
sql
-- Public read
CREATE POLICY "Anyone can view implementations" ON solution_implementations
  FOR SELECT USING (true);

-- Authenticated create
CREATE POLICY "Authenticated users can create implementations" ON solution_implementations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Own update
CREATE POLICY "Users can update own implementations" ON solution_implementations
  FOR UPDATE USING (auth.uid() = created_by);
goal_implementation_links
sql
-- Public read only (aggregation happens server-side)
CREATE POLICY "Anyone can view goal-implementation links" ON goal_implementation_links
  FOR SELECT USING (true);
4. Authentication Implementation
4.1 Current Implementation
Uses @supabase/ssr for Next.js 15 compatibility
Async cookie handling pattern
Email verification enabled
Protected routes via middleware
Auth context provides user state across app
4.2 Auth Flow
User signs up → Email verification sent
User clicks link → Redirected to /auth/callback
Callback verifies token → Sets session
Protected routes check session → Redirect if needed
5. File Structure (Updated June 8, 2025)
wwfm-platform/
├── app/
│   ├── auth/
│   │   ├── auth-debug/page.tsx               ✅
│   │   ├── callback/route.ts                 ✅
│   │   ├── reset-password/page.tsx           ✅
│   │   ├── signin/page.tsx                   ✅
│   │   ├── signup/page.tsx                   ✅
│   │   └── update-password/page.tsx          ✅
│   ├── browse/page.tsx                       ✅ (with search)
│   ├── arena/[slug]/page.tsx                 ✅
│   ├── category/[slug]/page.tsx              ⬜ (Next priority)
│   ├── goal/
│   │   └── [id]/
│   │       ├── page.tsx                      ✅ (Updated for new schema)
│   │       └── add-solution/
│   │           └── page.tsx                  ✅
│   ├── solution/
│   │   └── [id]/
│   │       └── page.tsx                      ⬜
│   ├── profile/
│   │   └── page.tsx                          ⬜
│   └── dashboard/page.tsx                    ✅
├── components/
│   ├── auth/
│   │   ├── AuthForm.tsx                      ✅
│   │   ├── AuthContext.tsx                   ✅
│   │   ├── ProtectedRoute.tsx                ✅
│   │   ├── FormField.tsx                     ✅
│   │   ├── Button.tsx                        ✅
│   │   └── ResetPasswordForm.tsx             ✅
│   ├── solutions/
│   │   └── SolutionForm.tsx                  ✅ (Updated for new schema)
│   ├── ui/
│   │   ├── Breadcrumbs.tsx                   ✅ (NEW)
│   │   ├── RatingDisplay.tsx                 ✅ (NEW)
│   │   ├── SkeletonLoader.tsx                ✅ (NEW)
│   │   ├── SearchBar.tsx                     ✅ (NEW)
│   │   ├── KeystoneBadge.tsx                 ⬜
│   │   ├── ImpactSpiderChart.tsx             ⬜
│   │   └── SolutionImpactTracker.tsx         ⬜
│   └── layout/
│       └── Header.tsx                         ✅ (with logo)
├── lib/
│   ├── supabase.ts                           ✅
│   ├── supabase-server.ts                    ✅
│   ├── supabase-debug.ts                     ✅
│   ├── goal-solutions.ts                     ✅ (NEW)
│   ├── keystone-calculator.ts                ⬜
│   └── impact-visualizer.ts                  ⬜
├── types/
│   └── solution.ts                           ✅ (NEW)
├── middleware.ts                             ✅
├── tsconfig.json                             ✅
└── .env.local                                ✅
6. Environment Setup
6.1 Local Development
bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://wqxkhxdbxdtpuvuvgirx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
6.2 Development Commands
bash
npm install        # Install dependencies
npm run dev        # Start development server (port 3002)
npm run build      # Build for production
npm run lint       # Run ESLint
npx tsc --noEmit   # Check TypeScript types
6.3 Known Configuration Issues
Port: Often runs on 3002 as 3000/3001 commonly in use
TypeScript @ alias: Sometimes requires relative imports
Platform dependencies: May need npm install --force on M1/M2 Macs
Required packages: Must explicitly install @supabase/ssr
7. Development Tools & Debugging
7.1 Common Issues & Fixes
Duplicate project directories: Check for nested wwfm-platform folders
Import errors: Use relative imports if @ alias fails
Missing dependencies: Run npm install @supabase/ssr
Platform issues: Use npm install --force for ARM64 dependencies
7.2 Claude Code Integration
bash
# Install globally (requires sudo on Mac)
sudo npm install -g @anthropic-ai/claude-code

# Run in project directory
claude
7.3 New Mac Setup (June 8, 2025)
Fixed npm permissions by changing prefix to ~/.npm-global
Added PATH export to .zshrc
Claude Code now runs without sudo
8. Implementation Priorities
8.1 Completed (as of June 8, 2025)
✅ Authentication system completely fixed
✅ Major schema restructure implemented
✅ New tables created (implementations, links)
✅ SolutionForm updated for new architecture
✅ Import issues resolved
✅ Dev server running
✅ Goal page updated for new schema
✅ Search functionality implemented
✅ Breadcrumb navigation added
✅ Loading skeletons throughout app
✅ Enhanced UI with animations
✅ AI source type support in database
✅ Logo with shimmer effect
8.2 Next Immediate Steps
Test complete solution flow - End-to-end verification
Generate AI content - Initial population
Implement category pages - Complete navigation
TypeForm-style solution form - Better UX
Solution discovery features - Filtering and sorting
8.3 Future Priorities
Keystone algorithm implementation
Forums for qualitative discussion
User profiles and reputation
Mobile app development
API for researchers
9. Decision Log
Date	Decision	Why	Result
May 18	Next.js 15	Latest features	Caused auth issues later
May 18	Supabase	Speed of development	Excellent choice
May 31	@supabase/ssr	Next.js 15 compatibility	Fixed auth completely
June 2025	AI Foundation strategy	Solve cold start transparently	Revolutionary approach
June 2025	Major schema restructure	Prevent solution duplication	Generic solutions with variants
June 2025	Remove detailed_steps	Qualitative data → forums	Cleaner data model
June 2025	4 solution categories	Starting point	Expect major revision
June 8	Source type constraints	Track AI content	Ready for AI generation
June 8	UI enhancement sprint	Improve UX before content	Much better experience
10. Known Technical Debt
Item	Priority	Status	Notes
Category pages	🔴 Critical	⬜ Next	Implement /category/[slug]
Test solution flow	🔴 Critical	⬜ Next	End-to-end verification
TypeScript cleanup	🟡 Medium	🔄 Ongoing	Remove @ts-ignore, fix any types
Error boundaries	🟡 Medium	⬜ Planned	Better error handling
Solution pages	🟡 Medium	⬜ Future	Individual solution details
Profile pages	🟡 Medium	⬜ Future	User profiles
Mobile app	🟢 Low	⬜ Future	React Native version
Performance audit	🟢 Low	⬜ Future	Bundle optimization
11. Key User Flows
11.1 Solution Contribution Flow (UPDATED)
User navigates to goal page
Clicks "Share What Worked"
Enters solution name (autocomplete from existing)
Selects solution category (determines fields)
Fills category-specific fields
Rates effectiveness (1-5 stars)
System creates:
Solution (if new)
Implementation (variant)
Goal-Implementation Link
Rating record
Failed solutions added quickly (name + low rating)
11.2 Solution Discovery Flow (UPDATED June 8)
User browses to goal
Sees solutions ordered by effectiveness FOR THAT GOAL
Each solution card shows:
Overall effectiveness for this goal
Number of people who tried it
Most effective implementation variant
Source indicator (AI/Human)
Click to expand all variants
Each variant shows effectiveness and typical application
11.3 Search Flow (NEW)
User types in search bar on browse page
Results filter in real-time
Matching text highlighted
Results grouped by arena
Click any goal to navigate directly
12. Success Metrics
12.1 MVP Metrics (Updated)
Metric	Target	Current	Measurement
Registered Users	1,000	0	auth.users count
Generic Solutions	100-200	0	solutions table count
Implementation Variants	500+	0	solution_implementations count
AI Foundation Solutions	65-130	0	5-10 per arena
Goal Coverage	50%	0	Goals with 1+ solution
Effectiveness Ratings	2,000	0	ratings table count
13. Development Timeline & Milestones
13.1 Completed Milestones (Updated June 8)
Date	Milestone	Key Decisions
May 18, 2025	Project initialized	Next.js 15, Supabase, TypeScript
May 31, 2025	Auth fixed for Next.js 15	Migrated to @supabase/ssr
June 2025	AI Foundation strategy defined	Transparent AI content approach
June 2025	Major schema restructure	Generic solutions with implementations
June 2025	Form components created	FormField, Button components
June 2025	SolutionForm updated	Works with new schema
June 8, 2025	Goal page updated	Displays solutions with new schema
June 8, 2025	UI enhancements complete	Search, breadcrumbs, loading states
June 8, 2025	AI support added	Source type constraints in DB
13.2 Upcoming Milestones
 Test complete solution submission flow
 Generate first AI content batch
 Implement category pages
 Launch MVP with foundation content
 Begin user acquisition
14. UI Component Library (NEW)
14.1 Completed Components
SearchBar: Client-side search with highlighting
Breadcrumbs: Hierarchical navigation
RatingDisplay: 5-star visual ratings
SkeletonLoader: Loading states with animation
Logo: WWFM 🏔️ with shimmer effect
14.2 Design System
Colors: Using Tailwind defaults + custom animations
Typography: Clear hierarchy with responsive sizing
Animations: Subtle transitions on interactions
Dark Mode: Classes prepared, toggle not implemented
14.3 Accessibility
Focus rings on all interactive elements
Proper ARIA labels
Keyboard navigation support
Screen reader optimized
15. Session Transition Notes
Today's Major Accomplishments (June 8, 2025)
Fixed goal page display - Now queries through new schema correctly
Major UI enhancements - Search, breadcrumbs, loading states all working
Database ready for AI - Source type constraints added
Beautiful solution cards - With expandable variants and ratings
Logo implemented - WWFM 🏔️ with shimmer animation
Key UI Improvements
Search across 549 goals with real-time filtering
Breadcrumb navigation showing full hierarchy
Loading skeletons instead of "Loading..." text
Enhanced rating displays with 5-star visuals
AI/Human badges ready (awaiting content)
Next Session Priority
Test the complete solution submission flow end-to-end. This is critical before generating any AI content. After verification, begin AI content generation for one arena.

Status: UI significantly enhanced, schema fully implemented, ready for content generation phase.

