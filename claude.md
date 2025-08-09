CLAUDE.md - WWFM Project Overview for AI Assistants
🎯 What is WWFM?
WWFM (What Works For Me) is a platform that crowdsources solutions to life challenges. Users share what actually worked for them - from reducing anxiety to getting promoted - creating a searchable database of real-world solutions with effectiveness ratings.

Core Innovation: We organize by problems (goals) not products. Instead of "here's what Vitamin D does," we show "here's what worked for people trying to sleep better" (which might include Vitamin D among 50+ other solutions).

🏗️ Technical Stack
Frontend: Next.js 15.3.2 (App Router), TypeScript, Tailwind CSS
Backend: Supabase (PostgreSQL with RLS, Auth, Real-time)
Hosting: Vercel
Search: PostgreSQL with pg_trgm for fuzzy matching
📊 Data Architecture
Core Entities
Goals (652 total) - Life challenges like "Reduce anxiety" or "Sleep better"
Solutions (309 total) - Generic approaches like "Meditation" or "Vitamin D"
Solution Variants (376 total) - Specific versions like "200mg capsule"
Ratings - User effectiveness scores (1-5 stars) with optional details
Key Relationships
Arena (13) → Category (75) → Goals (652)
                                ↓
                    goal_implementation_links
                                ↓
                        solution_variants → solutions
Important Rules
Every solution MUST have at least one variant
Only 4 categories use real variants: medications, supplements_vitamins, natural_remedies, beauty_skincare
All other categories use a single "Standard" variant
Effectiveness is stored in goal_implementation_links, NOT on variants
📁 Project Structure
wwfm-platform/
├── app/                    # Next.js App Router pages
├── components/            
│   ├── ui/                # Reusable UI components
│   ├── solutions/         # Solution-specific components
│   │   └── forms/         # 9 form types (23 categories)
│   └── layout/            # Layout components
├── lib/
│   ├── supabase/          # Database client setup
│   ├── services/          # Business logic
│   └── utils/             # Helper functions
└── types/                 # TypeScript definitions
🎨 Key User Flows
1. Browse & Discover
Users browse Arenas → Categories → Goals
Each goal shows solutions sorted by effectiveness
Solutions display aggregated user data (ratings, side effects, costs)
2. Contribute Solutions
Users click "Share What Worked" on any goal
Auto-categorization suggests the right form (1 of 9 types)
Forms capture effectiveness, details, and what didn't work
Submissions require authentication
3. Rate Solutions
Quick rating: Hover (desktop) or swipe (mobile) to rate 1-5 stars
Detailed rating: Full form with duration, side effects, completion %
🔧 Development Guidelines
Form System
9 form templates map to 23 solution categories (ALL IMPLEMENTED)
Each form has required fields (effectiveness, time to results, cost)
Optional fields vary by category (dosage, frequency, side effects)
All forms support "What else did you try?" for failed solutions
✅ Forms use 3-step wizard pattern for better UX

Search & Filtering
⚠️ AGGRESSIVE FILTERING: The search actively filters out generic terms
Solutions must have "specific indicators" (hyphens, numbers, CamelCase, ®, ™, or "(Test)")
Test fixtures MUST have "(Test)" suffix to appear in search
Generic terms like "therapy", "medication" are blocked unless specific
See /docs/architecture/SOLUTION_SEARCH_DATA_FLOW.md for complete pipeline

Component Patterns
Server Components by default, Client Components only for interactivity
Use TypeScript strictly - no any types
Implement loading states for all async operations
Handle errors gracefully with user-friendly messages
Database Access
Always use Supabase client (server or client version as appropriate)
Respect Row Level Security (RLS) policies
Use proper TypeScript types matching database schema
Implement optimistic updates for better UX
EFFECTIVENESS IS STORED IN goal_implementation_links, NOT ON SOLUTIONS
🚀 Current State & Priorities
What's Working
Core browse experience
Goal/solution display with effectiveness ratings
Fuzzy search with auto-categorization
User authentication with email verification
✅ ALL 9 FORM TEMPLATES IMPLEMENTED
✅ E2E testing infrastructure complete
✅ Test fixtures with "(Test)" suffix
✅ Aggressive search filtering for data quality

What Needs Work
Content expansion (currently 529 solutions, need 2,000+)
Admin moderation tools
Email notifications
Performance optimization at scale
More comprehensive error handling

Recent Achievements (January 2025)
✅ Completed all 9 form templates (DosageForm, SessionForm, PracticeForm, etc.)
✅ Fixed critical search functionality (was querying non-existent solutions_v2 table)
✅ Added RLS policies for user submissions
✅ Implemented test fixtures with special "(Test)" suffix handling
✅ Created comprehensive E2E testing with Playwright
✅ Documented complete search & submission data flow

Platform Metrics
652 goals across 13 life arenas
529 solutions (need 2,000+ for launch)
37% of goals have solutions (target: 80%)
Average effectiveness: 4.23/5 (AI seeded + user ratings)
9/9 form templates operational
23 test fixtures for automated testing
💡 Key Concepts to Understand
Solution vs Implementation
Solution: Generic approach (e.g., "Therapy")
Implementation: Specific application to a goal
Variant: Specific version of a solution (e.g., "CBT Therapy")
Effectiveness Tracking
Stored per goal-solution combination
Same solution can have different effectiveness for different goals
Aggregated from user ratings
AI seed data provides initial ratings
Progressive Disclosure
Simple view: Essential info only
Detailed view: Full distributions and user data
Mobile: Gesture-based interactions
Desktop: Hover states for quick actions
🛠️ Common Tasks
Adding a New Feature
Check if similar functionality exists
Follow established patterns in codebase
Add proper TypeScript types
Include loading and error states
Test with both authenticated and anonymous users
Consider impact on search filtering

Debugging Issues
Check browser console for errors
Verify Supabase RLS policies
Ensure proper authentication state
Check TypeScript types match database
Look for similar working examples in codebase
For search issues: Check if solution is approved AND has proper naming

Working with Forms
All 9 forms are implemented - see /components/organisms/solutions/forms/
Identify which of 9 form types applies
Check solution category mapping in SolutionFormWithAutoCategory.tsx
Ensure variant handling is correct (only 4 categories use real variants)
Test auto-categorization
Verify data saves to correct tables (solution_fields in goal_implementation_links)

Testing
Run E2E tests: npm run test:forms
Test fixtures must have "(Test)" suffix
Verify fixtures are approved: npm run test:fixtures:verify
See /tests/e2e/TEST_SOLUTIONS_SETUP.md for test infrastructure
📝 Documentation
README.md: Basic setup and overview
ARCHITECTURE.md: Technical design decisions
DEBUGGING.md: Common issues and solutions
WORKFLOW.md: Development process with AI tools

🔌 Supabase Connection for AI Assistants
Project Details:
- Project Name: wwfm
- Project ID: wqxkhxdbxdtpuvuvgirx
- URL: https://wqxkhxdbxdtpuvuvgirx.supabase.co
- Anon Key: (public, safe for client-side) - See `/docs/technical/supabase-connection-guide.md`
- Service Role Key: ⚠️ NEVER commit this - See `/docs/technical/supabase-connection-guide.md`

For full connection details including keys and example queries, refer to:
`/docs/technical/supabase-connection-guide.md` (gitignored for security)

Note: The connection guide contains sensitive credentials and is excluded from version control.

Remember: WWFM helps real people find solutions to life challenges. Every feature should make it easier to discover what works or share what worked for you.

