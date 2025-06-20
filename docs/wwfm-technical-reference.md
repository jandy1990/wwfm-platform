WWFM Technical Reference
Document Type: Technical implementation details
Related Documents: Project Guide | Collaboration Guide | Product Roadmap
Last Updated: December 20, 2024
Status: Auto-Categorization Implemented, Forms In Progress

This document contains the technical implementation details for the WWFM platform.

🚨 CURRENT STATUS: Auto-categorization system complete with 10,000+ keywords. First form template (DosageForm) implemented. Solution-first search identified as next priority.

Table of Contents
1. Technical Stack Configuration
2. Database Schema
2.1 Critical Design Decisions
2.2 Core Tables
2.3 Solution Categories
2.4 Form Template Specifications
2.5 Database Functions
2.6 Source of Truth Quick Reference
3. Row Level Security (RLS) Architecture
4. Authentication Implementation
5. File Structure
6. Auto-Categorization System
7. Form System Architecture
8. Environment Setup
9. Development Tools & Debugging
10. Implementation Priorities
11. Decision Log
12. Known Technical Debt
13. Key User Flows
14. UI Component Library
15. API Patterns
1. Technical Stack Configuration
1.1 GitHub Configuration
Repository: github.com/jandy1990/wwfm-platform (Private)
License: None initially, "All rights reserved"
Personal Access Token: Active
1.2 Supabase Configuration
Project URL: https://wqxkhxdbxdtpuvuvgirx.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeGtoeGRieGR0cHV2dXZnaXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MjgzMTUsImV4cCI6MjA2MzEwNDMxNX0.eBP6_TUB4Qa9KwPvEnUxrp7e7AGtOA3_Zs3CxaObPTo
Region: US East (North Virginia)
Auth: Email confirmations enabled
1.3 Next.js Configuration
Version: 15.3.2 with TypeScript
Architecture: App Router
Styling: Tailwind CSS with custom animations
Development: http://localhost:3002
TypeScript Config: @ alias configured (with occasional issues - use relative imports as fallback)
1.4 Authentication Libraries
Current: @supabase/ssr for modern auth handling
Pattern: Async cookie handling for Next.js 15 compatibility
Client: Both server and client Supabase instances configured
1.5 Deployment
Platform: Vercel
URL: wwfm-platform-6t2xbo4qg-jack-andrews-projects.vercel.app
2. Database Schema
2.1 Critical Design Decisions
Solutions are GENERIC: One "Vitamin D" entry serves all goals, not duplicates per goal

Three-Layer Architecture:

Solutions: Generic approaches (Vitamin D, Exercise, etc.)
Solution Implementations: Variants (1000 IU daily, 5000 IU weekly)
Goal-Implementation Links: Effectiveness per goal+variant combo
Form-Based Data Entry: 9 form templates handle all 23 solution categories

Category-Specific Fields: JSONB storage in category_fields for flexibility

2.2 Core Tables
solutions
sql
CREATE TABLE solutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  solution_category VARCHAR(50), -- One of 23 categories
  solution_fields JSONB DEFAULT '{}',
  source_type VARCHAR(50) DEFAULT 'community_contributed',
  created_by UUID REFERENCES auth.users(id),
  tags TEXT[],
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  CONSTRAINT solutions_solution_category_check 
  CHECK (solution_category IN (
    'supplements_vitamins', 'medications', 'natural_remedies', 'beauty_skincare',
    'therapists_counselors', 'doctors_specialists', 'coaches_mentors', 
    'alternative_practitioners', 'professional_services', 'medical_procedures',
    'crisis_resources', 'exercise_movement', 'meditation_mindfulness',
    'habits_routines', 'hobbies_activities', 'groups_communities',
    'support_groups', 'apps_software', 'products_devices', 'books_courses',
    'diet_nutrition', 'sleep', 'financial_products'
  ))
);
solution_implementations
sql
CREATE TABLE solution_implementations(
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID REFERENCES solutions(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  effectiveness INTEGER CHECK (effectiveness >= 1 AND effectiveness <= 5),
  time_to_results TEXT,
  cost_type TEXT,
  cost_range TEXT,
  cost_startup TEXT,
  cost_ongoing TEXT,
  side_effects TEXT[],
  challenges TEXT[],
  other_important_information TEXT,
  category_fields JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  source_type VARCHAR(50) DEFAULT 'community_contributed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
category_keywords
sql
CREATE TABLE category_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  keywords TEXT[] NOT NULL,
  patterns TEXT[],
  solution_names TEXT[] DEFAULT '{}', -- Proposed addition
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_category_keywords_keywords ON category_keywords USING GIN (keywords);
CREATE INDEX idx_category_keywords_patterns ON category_keywords USING GIN (patterns);
2.3 Solution Categories (23 Total)
Things you take (4):

supplements_vitamins → dosage_form
medications → dosage_form
natural_remedies → dosage_form
beauty_skincare → dosage_form
People you see (7):

therapists_counselors → session_form
doctors_specialists → session_form (includes chiropractors)
coaches_mentors → session_form
alternative_practitioners → session_form
professional_services → session_form (includes physical therapy)
medical_procedures → session_form
crisis_resources → session_form
Things you do (6):

exercise_movement → practice_form
meditation_mindfulness → practice_form
habits_routines → practice_form
hobbies_activities → hobby_form
groups_communities → community_form
support_groups → community_form
Things you use (3):

apps_software → app_form
products_devices → purchase_form
books_courses → purchase_form
Changes you make (2):

diet_nutrition → lifestyle_form
sleep → lifestyle_form
Financial solutions (1):

financial_products → financial_form
2.4 Form Template Specifications
DosageForm (Implemented ✅)
Categories: supplements_vitamins, medications, natural_remedies, beauty_skincare
Required Fields: effectiveness, time_to_results, cost (toggle type), side_effects
Optional Fields: dosage_amount, frequency, form, time_of_day, brand/manufacturer, other_info
Special Logic: Category-specific side effect lists
Remaining Forms (To Be Implemented)
SessionForm (7 categories)
PracticeForm (3 categories)
PurchaseForm (2 categories)
AppForm (1 category)
CommunityForm (2 categories)
LifestyleForm (2 categories)
HobbyForm (1 category)
FinancialForm (1 category)
2.5 Database Functions
Auto-Categorization Functions
sql
-- Check exact keyword match
CREATE OR REPLACE FUNCTION check_keyword_match(search_term TEXT)
RETURNS TABLE(category TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ck.category::TEXT
  FROM category_keywords ck
  WHERE search_term = ANY(ck.keywords);
END;
$$ LANGUAGE plpgsql;

-- Pattern matching
CREATE OR REPLACE FUNCTION match_category_patterns(input_text TEXT)
RETURNS TABLE(category TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ck.category::TEXT
  FROM category_keywords ck
  WHERE EXISTS (
    SELECT 1 
    FROM unnest(ck.patterns) AS pattern
    WHERE input_text ILIKE pattern
  );
END;
$$ LANGUAGE plpgsql;

-- Partial keyword matching
CREATE OR REPLACE FUNCTION match_category_partial(input_text TEXT)
RETURNS TABLE(category TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ck.category::TEXT
  FROM category_keywords ck
  WHERE EXISTS (
    SELECT 1 
    FROM unnest(ck.keywords) AS keyword
    WHERE keyword ILIKE '%' || input_text || '%'
  );
END;
$$ LANGUAGE plpgsql;

-- Proposed: Search solution names
CREATE OR REPLACE FUNCTION search_solution_names(search_term TEXT)
RETURNS TABLE(
  solution_name TEXT,
  category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT 
    unnest(ck.solution_names) as solution_name,
    ck.category
  FROM category_keywords ck
  WHERE EXISTS (
    SELECT 1 
    FROM unnest(ck.solution_names) AS sn
    WHERE LOWER(sn) LIKE LOWER('%' || search_term || '%')
  );
END;
$$ LANGUAGE plpgsql;
2.6 Source of Truth Quick Reference
Valid Enum Values
time_to_results (8 values - EXACT strings):

'Immediately'
'Within days'
'1-2 weeks'
'3-4 weeks'
'1-2 months'
'3-6 months'
'6+ months'
'Still evaluating'
cost_type (7 values):

'free'
'one_time'
'monthly'
'per_session'
'per_week'
'subscription'
'dual_cost'
'donation'
source_type (2 values):

'ai_foundation'
'community_contributed'
3. Row Level Security (RLS) Architecture
3.1 Fixed Admin Users Policies
sql
-- Removed recursive policies that caused infinite loops
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
3.2 Category Keywords Policies
sql
-- Public read access
CREATE POLICY "Anyone can view category keywords" ON category_keywords
  FOR SELECT USING (true);
3.3 Solutions & Implementations
Public read for approved solutions
Authenticated users can create
Users can update their own
Admins can moderate
4. Authentication Implementation
4.1 Current Implementation
Uses @supabase/ssr for Next.js 15 compatibility
Server-side auth checks in page components
Client-side auth context for UI state
4.2 Auth Flow
User signs up → Email verification sent
User clicks link → Redirected to /auth/callback
Callback verifies token → Sets session
Protected routes check session → Redirect if needed
5. File Structure (Updated December 2024)
wwfm-platform/
├── app/
│   ├── auth/                                  ✅
│   ├── browse/page.tsx                       ✅
│   ├── arena/[slug]/page.tsx                 ✅
│   ├── category/[slug]/page.tsx              ⬜
│   ├── goal/
│   │   └── [id]/
│   │       ├── page.tsx                      ✅
│   │       └── add-solution/
│   │           └── page.tsx                  ✅ (Updated)
│   ├── test-categorization/page.tsx          ✅ (NEW)
│   └── admin/
│       └── review-queue/page.tsx             ⬜
├── components/
│   ├── solutions/
│   │   ├── AutoCategoryTest.tsx              ✅ (NEW)
│   │   ├── CategoryConfirmation.tsx          ✅ (NEW)
│   │   ├── CategoryPicker.tsx                ✅ (NEW)
│   │   ├── SolutionFormWithAutoCategory.tsx  ✅ (NEW)
│   │   └── forms/
│   │       ├── DosageForm.tsx                ✅ (NEW)
│   │       ├── SessionForm.tsx               ⬜
│   │       ├── PracticeForm.tsx              ⬜
│   │       └── ... (6 more forms)            ⬜
│   └── admin/
│       └── ReviewQueue.tsx                   ⬜
├── lib/
│   ├── services/
│   │   └── auto-categorization.ts            ✅ (NEW)
│   ├── hooks/
│   │   └── useAutoCategorization.ts          ✅ (NEW)
│   ├── supabase.ts                           ✅
│   ├── supabase-server.ts                    ✅
│   └── utils.ts                              ✅ (Updated)
└── types/
    └── solution.ts                           ⬜
6. Auto-Categorization System
6.1 Architecture
typescript
// Detection flow
1. Check existing solutions (exact match)
2. Check exact keyword match
3. Check pattern match (if no exact)
4. Check partial match (if still no matches)
5. Return matches with confidence levels
6.2 Service Implementation
typescript
// lib/services/auto-categorization.ts
export async function detectCategory(userInput: string): Promise<CategoryMatch[]> {
  // 1. Normalize input
  // 2. Check existing solutions
  // 3. Check keywords via RPC functions
  // 4. Return matches with confidence
}
6.3 React Hook
typescript
// lib/hooks/useAutoCategorization.ts
export function useAutoCategorization() {
  // Debounced detection
  // Loading states
  // Error handling
  // Returns: { matches, isLoading, error, detectFromInput }
}
6.4 UI Components
CategoryConfirmation: Shows "Is this a [Category]?" with context
CategoryPicker: Manual selection with grouped categories
SolutionFormWithAutoCategory: Orchestrates the full flow
7. Form System Architecture
7.1 Form Template Pattern
typescript
interface FormProps {
  goalId: string;
  userId: string;
  solutionName: string;
  category: string;
  onBack: () => void;
}

// Each form handles:
// 1. Required field validation
// 2. Category-specific options
// 3. Database submission
// 4. Error handling
7.2 Submission Flow
typescript
// 1. Create/find solution
// 2. Create implementation with variant details
// 3. Link implementation to goal
// 4. Create rating record
// 5. Redirect to goal page
7.3 Category-Specific Logic
Side effect lists vary by category
Cost structures differ (monthly vs one-time)
Optional fields change based on category
Pre-seeded options for consistency
8. Environment Setup
8.1 Local Development
bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://wqxkhxdbxdtpuvuvgirx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
8.2 Development Commands
bash
npm install        # Install dependencies
npm run dev        # Start dev server (port 3002)
npm run build      # Build for production
npm run lint       # Run ESLint
9. Development Tools & Debugging
9.1 Common Issues & Fixes
Import errors: Use relative imports when @ alias fails
RLS recursion: Fixed by removing recursive admin policies
TypeScript strict mode: Sometimes requires type assertions
9.2 Testing Auto-Categorization
bash
# Visit test page
http://localhost:3002/test-categorization

# Test keywords
- "vitamin" → Supplements & Vitamins
- "headspace" → Apps & Software
- "therapist" → Therapists & Counselors
10. Implementation Priorities
10.1 Completed (December 2024)
✅ Auto-categorization system
✅ Category UI components
✅ Solution form integration
✅ First form template (DosageForm)
✅ RLS policy fixes
10.2 Next Sprint (Late December 2024)
Solution-first search - Check existing solutions before categories
Smart keyword recognition - Identify solution names in keywords
Remaining 8 forms - Complete all form templates
Admin review queue - For new solution moderation
11. Decision Log
Date	Decision	Why	Result
Dec 20, 2024	Build auto-categorization	Natural input UX	✅ Working well
Dec 20, 2024	9 form templates	Manage complexity	✅ Pattern validated
Dec 20, 2024	Fix RLS recursion	Unblock queries	✅ Resolved
Dec 20, 2024	Solution-first search	Users think in solutions	🔄 Next priority
Dec 20, 2024	Smart keywords	Avoid duplication	Planning
12. Known Technical Debt
Item	Priority	Status	Notes
Solution-first search	🔴 Critical	⬜ Next	Users expect this
8 remaining forms	🔴 Critical	⬜ Next	Need all 9 for launch
TypeScript types	🟡 Medium	⬜ Ongoing	Some any types remain
Error boundaries	🟡 Medium	⬜ Planned	Better error handling
Performance optimization	🟢 Low	⬜ Future	Queries are fast enough
13. Key User Flows
13.1 Solution Contribution Flow (Current)
User clicks "Share What Worked" on goal page
Types solution name (e.g., "vitamin d")
Auto-categorization detects category
User confirms or manually selects
Fills appropriate form (1 of 9 templates)
Submits → Creates solution + implementation + link + rating
Redirects to goal page with success message
13.2 Proposed Solution-First Flow
User types solution name
System shows:
Existing solutions (if any)
Recognized solution names from keywords
Category detection only as fallback
User selects → Goes directly to form
Smoother, more intuitive experience
14. UI Component Library
14.1 Core Components
SearchBar: Goal search with highlighting
Breadcrumbs: Hierarchical navigation
RatingDisplay: 5-star visual ratings
LoadingStates: Skeleton loaders
14.2 Auto-Categorization Components
CategoryConfirmation: Smart confirmation UI
CategoryPicker: Grouped manual selection
SolutionFormWithAutoCategory: Full flow orchestrator
14.3 Form Components
DosageForm: Complete and tested
8 more forms: To be implemented
15. API Patterns
15.1 Supabase Client Usage
typescript
// Always check for errors
const { data, error } = await supabase
  .from('table')
  .select('*');

if (error) throw error;
15.2 RPC Function Calls
typescript
// For complex queries
const { data } = await supabase
  .rpc('function_name', { param: value });
15.3 Transaction Pattern
typescript
// Multiple related inserts
try {
  // 1. Create solution
  // 2. Create implementation
  // 3. Create link
  // 4. Create rating
  // All or nothing
} catch (error) {
  // Handle rollback
}
Status: Auto-categorization is live and functional. First form template proves the pattern. Solution-first search will complete the natural UX flow. The technical foundation is solid and ready for rapid feature development.

