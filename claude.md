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
Solutions (529 total) - Generic approaches like "Meditation" or "Vitamin D"
Solution Variants (190 total) - Specific versions like "200mg capsule"
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
9 form templates map to 23 solution categories
Each form has required fields (effectiveness, time to results, cost)
Optional fields vary by category (dosage, frequency, side effects)
All forms support "What else did you try?" for failed solutions
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
🚀 Current State & Priorities
What's Working
Core browse experience
Goal/solution display
Basic search with fuzzy matching
User authentication
One form type (DosageForm)
What Needs Work
8 remaining form templates
Solution detail pages
Admin moderation tools
Email notifications
Performance optimization
More comprehensive error handling
Platform Metrics
652 goals across 13 life arenas
35% of goals have solutions
Target: 80% coverage with 2,000+ solutions
Average effectiveness: 4.2/5 (AI seeded)
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
Debugging Issues
Check browser console for errors
Verify Supabase RLS policies
Ensure proper authentication state
Check TypeScript types match database
Look for similar working examples in codebase
Working with Forms
Identify which of 9 form types applies
Check solution category mapping
Ensure variant handling is correct
Test auto-categorization
Verify data saves to correct tables
📝 Documentation
README.md: Basic setup and overview
ARCHITECTURE.md: Technical design decisions
DEBUGGING.md: Common issues and solutions
WORKFLOW.md: Development process with AI tools
Remember: WWFM helps real people find solutions to life challenges. Every feature should make it easier to discover what works or share what worked for you.

