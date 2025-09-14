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
Goals (653 total) - Life challenges like "Reduce anxiety" or "Sleep better"
Solutions (58 AI + 23 test) - Generic approaches like "Meditation" or "Vitamin D"
Solution Variants - Specific versions (only for 4 dosage categories)
Effectiveness Links - Goal-specific ratings and metadata
Key Design: Two-Layer System
Solutions Layer: Generic entries prevent duplication
Variants Layer: Only for medications, supplements, natural remedies, beauty
Goal Links: Store effectiveness per goal (same solution, different results)
Database Rules
Effectiveness stored in goal_implementation_links (not on solutions)
Solutions are generic, variants are specific
Only 4 of 23 categories use real variants
All user ratings are private, only aggregates shown
📁 Project Structure
wwfm-platform/
├── app/                    # Next.js App Router pages
├── components/            
│   ├── ui/                # Reusable UI components
│   ├── solutions/         # Solution-specific components
│   │   └── forms/         # 9 form templates (23 categories)
│   └── layout/            # Layout components
├── lib/
│   ├── supabase/          # Database client setup
│   ├── services/          # Business logic
│   └── utils/             # Helper functions
└── types/                 # TypeScript definitions
🎨 Key User Flows
1. Browse & Discover
Home → Arena (13 life areas) → Goals → Solutions ranked by effectiveness
Each solution shows: effectiveness stars, time to results, cost, side effects
Progressive disclosure: simple view first, detailed on demand
2. Search & Find
Fuzzy search across all 652 goals
Auto-categorization detects solution type
Quality filters ensure specific entries (not generic "therapy")
3. Contribute Solutions
"Share What Worked" → Auto-categorization → Appropriate form (1 of 9)
Rate effectiveness + category-specific fields
Track failed solutions for complete picture
All contributions require email verification
🔧 Development Principles
Core Philosophy
User-centric: Real people finding real solutions
Privacy-first: Individual data private, only aggregates public
Quality over quantity: Specific solutions, not generic categories
Progressive enhancement: Server Components, client interactivity where needed
Technical Patterns
Database: PostgreSQL with RLS, JSONB for flexible fields
Forms: 9 templates handle 23 categories via smart routing
Search: Aggressive filtering for data quality
State: Server Components + React (no Redux needed yet)
Auth: Supabase with email verification
Key Implementation Notes
Search filters block generic terms (forces specificity)
Effectiveness varies by goal (stored in junction table)
Forms use 3-step wizard pattern for better UX
Test fixtures need "(Test)" suffix to bypass filters
Solutions must be specific implementations, not categories (e.g., "Headspace" not "meditation apps")
🚀 Current Platform Status (Updated: September 14, 2025)
Operational Metrics
228 goals across 13 life arenas (curated from original 653)
3,850 AI-seeded solutions (+ 23 test fixtures)
227/228 goals have solutions (99.6% coverage!)
5,583 goal-solution connections
Average effectiveness: 4.15/5 stars
What's Complete
✅ Full browse/search/contribute experience
✅ All 9 form templates for 23 categories
✅ User authentication with email verification
✅ Fuzzy search with auto-categorization
✅ Progressive disclosure UI
✅ Test coverage for reliability
Priority: Launch Preparation
✅ Content expansion COMPLETE (3,873 solutions exceed 2,000 target!)
✅ Goal coverage ACHIEVED (99.6% coverage exceeds 80% target!)
✅ Distribution data FIXED (dropdown mappings resolved)
🚀 Begin user testing (only 5 ratings so far)
Next Features
Admin moderation queue
Email notifications
User profiles
Performance optimization
💡 Common Development Tasks
Working with Goals & Solutions
Goals are user problems ("Stop overthinking")
Solutions are generic approaches ("Meditation")
Variants are specific only for dosage categories
Effectiveness is per goal-solution combination
Adding New Features
Check existing patterns first
Use Server Components by default
Add TypeScript types
Include loading/error states
Test with auth and anonymous users
Form Implementation
Identify which of 9 templates applies
Check category mapping in SolutionFormWithAutoCategory
Verify variant handling (only 4 categories)
Test auto-categorization
Ensure data saves to correct tables
Debugging Tips
Check browser console
Verify Supabase RLS policies
Ensure auth state
Validate TypeScript types
For search: verify solution is approved and specific
📝 Key Documentation
README.md: Setup and overview
ARCHITECTURE.md: Design decisions and patterns
/docs/database/schema.md: Complete database structure
/tests/README.md: Testing guide
/docs/forms/: Form specifications
🔌 Supabase Connection
Project: wwfm
URL: https://wqxkhxdbxdtpuvuvgirx.supabase.co
Auth: Email/password with verification
RLS: Enabled on all tables

For connection details and keys, see:
`/docs/technical/supabase-connection-guide.md` (gitignored)

## 🔧 Recent Technical Improvements (August 2025)

**Data Architecture Overhaul**: Fixed critical data overwriting bug and implemented proper aggregation system. Individual data now stored in `ratings.solution_fields`, aggregated data in `goal_implementation_links.aggregated_fields`.

**50% Data Loss Fix**: Added 36 missing field aggregations. All user-submitted data now properly aggregated and displayed.

**Two-Phase Submission**: Forms now submit required fields first, then optional fields via success screen using `updateSolutionFields` action.

**Field Standardization**: Fixed naming inconsistencies (e.g., dose_amount → dosage_amount) across entire data pipeline.

**UI Enhancements**: Solution cards now show "X of Y users" counts and data source indicators (AI vs User) for transparency.

Remember: WWFM helps real people find solutions to life challenges. Every feature should make it easier to discover what works or share what worked for you.