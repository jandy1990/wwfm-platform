WWFM Technical Reference
Document Type: Technical implementation details
Related Documents: Project Guide | Collaboration Guide | Product Roadmap
Last Updated: June 26, 2025
Status: DosageForm Complete, Fuzzy Search Implemented, Auto-categorization Enhanced

This document contains the technical implementation details for the WWFM platform.

🚨 CURRENT STATUS: DosageForm v2.2 complete with structured data capture. Failed solutions search backend working. Fuzzy search with pg_trgm implemented across all search functions. Ready for remaining 8 form templates.

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
8. Failed Solutions System
9. Fuzzy Search System
10. Environment Setup
11. Development Tools & Debugging
12. Implementation Priorities
13. Decision Log
14. Known Technical Debt
15. Key User Flows
16. UI Component Library
17. API Patterns
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
Extensions: pg_trgm (enabled for fuzzy search)
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

Failed Solutions Tracking: Negative ratings (1-3 stars) properly affect solution scores

Fuzzy Search Enabled: pg_trgm extension for typo-tolerant searching

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

-- Fuzzy search index
CREATE INDEX idx_solutions_title_trgm ON solutions USING gin (LOWER(title) gin_trgm_ops);
solution_implementations
sql
CREATE TABLE solution_implementations(
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID REFERENCES solutions(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL, -- e.g., "500mg twice daily"
  effectiveness INTEGER CHECK (effectiveness >= 1 AND effectiveness <= 5),
  time_to_results TEXT,
  cost_type TEXT,
  cost_range TEXT,
  cost_startup TEXT,
  cost_ongoing TEXT,
  side_effects TEXT[],
  challenges TEXT[],
  other_important_information TEXT,
  failed_solutions JSONB DEFAULT '[]', -- Stores text-only failed attempts
  category_fields JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  source_type VARCHAR(50) DEFAULT 'community_contributed',
  daily_total_mg NUMERIC, -- For aggregation, NULL for as-needed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
user_ratings
sql
CREATE TABLE user_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  solution_id UUID REFERENCES solutions(id),
  implementation_id UUID REFERENCES solution_implementations(id),
  goal_id UUID REFERENCES goals(id),
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  is_primary BOOLEAN DEFAULT true, -- false for "didn't work" ratings
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
category_keywords
sql
CREATE TABLE category_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  keywords TEXT[] NOT NULL,
  patterns TEXT[],
  solution_names TEXT[] DEFAULT '{}',
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
doctors_specialists → session_form
coaches_mentors → session_form
alternative_practitioners → session_form
professional_services → session_form
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
DosageForm (Implemented ✅ - v2.2)
Categories: supplements_vitamins, medications, natural_remedies, beauty_skincare
Required Fields: effectiveness, time_to_results, cost (toggle type), side_effects
Optional Fields: dosage_amount, frequency, form, brand/manufacturer, other_info, failed_solutions
Special Logic:
Category-specific side effect lists
Beauty/skincare uses frequency only (no dosage)
Custom side effects with "Add other" option
Failed solutions search with ratings
Key Improvements (June 2025):
Removed confusing count field
Separated measurement units from form factors
Expanded cost ranges for expensive medications
Added failed solutions with proper negative ratings
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
Fuzzy Search Functions (NEW - June 2025)
sql
-- Enable fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Search keywords with fuzzy matching
CREATE OR REPLACE FUNCTION search_keywords_for_autocomplete(search_term TEXT)
RETURNS TABLE(
  keyword TEXT,
  category TEXT,
  match_score NUMERIC
) AS $$
BEGIN
  IF LENGTH(search_term) < 2 THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH keyword_matches AS (
    SELECT DISTINCT
      unnest(ck.keywords) as kw_text,
      ck.category as cat_name
    FROM category_keywords ck
  ),
  scored_matches AS (
    SELECT 
      km.kw_text,
      km.cat_name,
      CASE 
        WHEN LOWER(km.kw_text) = LOWER(search_term) THEN 1.0
        WHEN LOWER(km.kw_text) LIKE LOWER(search_term || '%') THEN 0.9
        WHEN LOWER(km.kw_text) LIKE LOWER('%' || search_term || '%') THEN 0.8
        ELSE similarity(LOWER(km.kw_text), LOWER(search_term))
      END as match_score_val
    FROM keyword_matches km
    WHERE 
      LOWER(km.kw_text) LIKE LOWER('%' || search_term || '%')
      OR similarity(LOWER(km.kw_text), LOWER(search_term)) > 0.4
  )
  SELECT 
    kw_text::TEXT as keyword,
    cat_name::TEXT as category,
    ROUND(match_score_val::NUMERIC, 2) as match_score
  FROM scored_matches
  WHERE match_score_val > 0
  ORDER BY 
    match_score_val DESC,
    LENGTH(kw_text),
    kw_text
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Search solutions with fuzzy matching
CREATE OR REPLACE FUNCTION search_solutions_fuzzy(search_term TEXT)
RETURNS TABLE(
  id UUID,
  title TEXT,
  solution_category TEXT,
  description TEXT,
  match_score NUMERIC
) AS $$
BEGIN
  IF LENGTH(search_term) < 3 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    s.id,
    s.title::TEXT,
    s.solution_category::TEXT,
    s.description::TEXT,
    CASE 
      WHEN LOWER(s.title) = LOWER(search_term) THEN 1.0
      WHEN LOWER(s.title) LIKE LOWER(search_term || '%') THEN 0.9
      WHEN LOWER(s.title) LIKE LOWER('%' || search_term || '%') THEN 0.8
      ELSE similarity(LOWER(s.title), LOWER(search_term))
    END::NUMERIC as match_score
  FROM solutions s
  WHERE 
    s.is_approved = true
    AND (
      LOWER(s.title) LIKE LOWER('%' || search_term || '%')
      OR similarity(LOWER(s.title), LOWER(search_term)) > 0.4
    )
  ORDER BY 
    match_score DESC,
    s.title
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Check category match with fuzzy tolerance
CREATE OR REPLACE FUNCTION check_keyword_match_fuzzy(search_term TEXT)
RETURNS TABLE(category TEXT) AS $$
BEGIN
  RETURN QUERY
  WITH keyword_matches AS (
    SELECT DISTINCT
      ck.category,
      unnest(ck.keywords) as keyword
    FROM category_keywords ck
  )
  SELECT DISTINCT km.category::TEXT
  FROM keyword_matches km
  WHERE 
    LOWER(km.keyword) = LOWER(search_term)
    OR similarity(LOWER(km.keyword), LOWER(search_term)) > 0.6
  ORDER BY 
    CASE 
      WHEN LOWER(km.keyword) = LOWER(search_term) THEN 0
      ELSE 1
    END
  LIMIT 3;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION search_keywords_for_autocomplete TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_solutions_fuzzy TO anon, authenticated;
GRANT EXECUTE ON FUNCTION check_keyword_match_fuzzy TO anon, authenticated;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_solutions_title_trgm 
ON solutions USING gin (LOWER(title) gin_trgm_ops);
Failed Solutions Functions (June 2025)
sql
-- Search all approved solutions
CREATE OR REPLACE FUNCTION search_all_solutions(search_term TEXT)
RETURNS TABLE(
  id UUID,
  title VARCHAR(200),
  solution_category VARCHAR(50),
  description TEXT
) 
LANGUAGE plpgsql
AS $function$
BEGIN
  IF LENGTH(search_term) < 3 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    s.id,
    s.title,
    s.solution_category,
    s.description
  FROM solutions s
  WHERE 
    s.is_approved = true AND
    LOWER(s.title) ILIKE LOWER('%' || search_term || '%')
  ORDER BY 
    CASE 
      WHEN LOWER(s.title) = LOWER(search_term) THEN 0
      WHEN LOWER(s.title) ILIKE LOWER(search_term || '%') THEN 1
      ELSE 2 
    END,
    s.title
  LIMIT 10;
END;
$function$;

-- Create rating for failed solution
CREATE OR REPLACE FUNCTION create_failed_solution_rating(
  p_solution_id UUID,
  p_goal_id UUID,
  p_user_id UUID,
  p_rating INTEGER,
  p_solution_name TEXT
)
RETURNS UUID AS $$
DECLARE
  v_implementation_id UUID;
  v_rating_id UUID;
BEGIN
  -- Find or create generic implementation
  SELECT id INTO v_implementation_id
  FROM solution_implementations
  WHERE solution_id = p_solution_id
    AND name = 'Standard dose'
  LIMIT 1;

  IF v_implementation_id IS NULL THEN
    INSERT INTO solution_implementations (
      solution_id, name, effectiveness, created_by, source_type
    ) VALUES (
      p_solution_id, 'Standard dose', p_rating, p_user_id, 'community_contributed'
    )
    RETURNING id INTO v_implementation_id;
  END IF;

  -- Create rating with is_primary = false
  INSERT INTO user_ratings (
    user_id, solution_id, implementation_id, goal_id, 
    effectiveness_rating, is_primary, notes
  ) VALUES (
    p_user_id, p_solution_id, v_implementation_id, p_goal_id,
    p_rating, false, 'Tried but did not work as well as primary solution'
  )
  RETURNING id INTO v_rating_id;

  -- Link implementation to goal
  INSERT INTO goal_solution_implementations (
    goal_id, solution_id, implementation_id
  ) VALUES (
    p_goal_id, p_solution_id, v_implementation_id
  )
  ON CONFLICT (goal_id, solution_id, implementation_id) DO NOTHING;

  RETURN v_rating_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION search_all_solutions TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_failed_solution_rating TO authenticated;
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
cost_type (8 values):

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
Measurement Units (by category):

supplements_vitamins: mg, mcg, IU, g, ml, billion CFU, other
medications: mg, mcg, g, ml, units, meq, other
natural_remedies: mg, g, ml, tsp, tbsp, cups, other
beauty_skincare: frequency only (no units)
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
5. File Structure (Updated June 2025)
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
│   │           └── page.tsx                  ✅
│   ├── test-categorization/page.tsx          ✅
│   └── admin/
│       └── review-queue/page.tsx             ⬜
├── components/
│   ├── solutions/
│   │   ├── AutoCategoryTest.tsx              ✅
│   │   ├── CategoryConfirmation.tsx          ✅
│   │   ├── CategoryPicker.tsx                ✅
│   │   ├── SolutionFormWithAutoCategory.tsx  ✅ (Fuzzy search added)
│   │   └── forms/
│   │       ├── DosageForm.tsx                ✅ v2.2
│   │       ├── SessionForm.tsx               ⬜
│   │       ├── PracticeForm.tsx              ⬜
│   │       └── ... (6 more forms)            ⬜
│   └── admin/
│       └── ReviewQueue.tsx                   ⬜
├── lib/
│   ├── services/
│   │   ├── auto-categorization.ts            ✅ (Fuzzy search added)
│   │   └── failed-solutions.ts               ✅
│   ├── hooks/
│   │   └── useAutoCategorization.ts          ✅
│   ├── supabase.ts                           ✅
│   ├── supabase-server.ts                    ✅
│   └── utils.ts                              ✅
└── types/
    └── solution.ts                           ⬜
6. Auto-Categorization System
6.1 Architecture
typescript
// Detection flow with fuzzy matching
1. Check existing solutions (fuzzy match enabled)
2. Check exact keyword match
3. Check fuzzy keyword match (if no exact)
4. Check pattern match (if still no matches)
5. Return matches with confidence levels
6.2 Service Implementation (Updated June 2025)
typescript
// lib/services/auto-categorization.ts
export async function detectCategory(userInput: string): Promise<CategoryMatch[]> {
  // 1. Normalize input
  // 2. Check existing solutions with fuzzy search
  // 3. Check keywords via RPC functions (now with fuzzy)
  // 4. Return keyword suggestions for autocomplete
  // 5. Return matches with confidence
}

// NEW: Fuzzy keyword search
export async function searchKeywordSuggestions(searchTerm: string) {
  const { data } = await supabase.rpc('search_keywords_for_autocomplete', {
    search_term: searchTerm
  });
  return data || [];
}
6.3 React Hook
typescript
// lib/hooks/useAutoCategorization.ts
export function useAutoCategorization() {
  // Debounced detection
  // Loading states
  // Error handling
  // Returns: { matches, isLoading, error, detectFromInput, keywordMatches }
}
6.4 UI Components
CategoryConfirmation: Shows "Is this a [Category]?" with context
CategoryPicker: Manual selection with grouped categories
SolutionFormWithAutoCategory: Orchestrates the full flow with fuzzy autocomplete
7. Form System Architecture
7.1 Form Template Pattern
typescript
interface FormProps {
  goalId: string;
  userId: string;
  solutionName: string;
  category: string;
  onBack: () => void;
  goalTitle?: string; // Added for better context
  existingSolutionId?: string; // For existing solutions
}

// Each form handles:
// 1. Required field validation
// 2. Category-specific options
// 3. Database submission
// 4. Error handling
// 5. Failed solutions (what didn't work)
7.2 Submission Flow
typescript
// 1. Create/find solution
// 2. Create implementation with variant details
// 3. Link implementation to goal
// 4. Create rating record (is_primary = true)
// 5. Process failed solutions:
//    - Existing solutions → Create ratings (is_primary = false)
//    - Non-existing → Store as JSON text
// 6. Redirect to goal page
7.3 Category-Specific Logic
Side effect lists vary by category
Cost structures differ (monthly vs one-time)
Optional fields change based on category
Pre-seeded options for consistency
Custom "Other" options for flexibility
7.4 DosageForm Specific Features (v2.2)
Structured dosage input: Amount + Unit (no count field)
Daily dose calculation: For scheduled meds (null for as-needed)
Beauty/skincare mode: Frequency only, no dosage
Failed solutions search: Autocomplete from existing solutions
Custom side effects: Dynamic "Add other" functionality
Smart preview: "You're taking: 500mg twice daily"
8. Failed Solutions System (June 2025)
8.1 Purpose
Capture what users tried that didn't work well, creating negative ratings (1-3 stars) that properly affect solution effectiveness scores.

8.2 Architecture
typescript
// User flow
1. User types solution name (min 3 chars)
2. Search shows existing solutions
3. User selects or adds custom text
4. User rates 1-5 stars
5. On submit:
   - Existing solutions → Create real rating records
   - Custom text → Store in JSON field only
8.3 Data Model
typescript
// In solution_implementations.failed_solutions
[
  { name: "Prozac", rating: 2 }, // Text only if not found
  { name: "Meditation app", rating: 3 }
]

// In user_ratings (for existing solutions)
{
  effectiveness_rating: 2,
  is_primary: false, // Indicates "didn't work" rating
  notes: "Tried but did not work as well as primary solution"
}
8.4 Service Layer
typescript
// lib/services/failed-solutions.ts
- searchAllSolutions(searchTerm: string)
- createFailedSolutionRating(params)
- processFailedSolutions(failedList, goalId, userId)
8.5 UI Implementation
Debounced search (300ms)
Loading spinner during search
"Verified solution" badge for existing
Dropdown with category info
Star rating for each failed item
9. Fuzzy Search System (NEW - June 2025)
9.1 Purpose
Handle typos and misspellings in user input to prevent duplicate entries and improve user experience.

9.2 Technology
PostgreSQL pg_trgm extension: Trigram-based text similarity matching
40% similarity threshold: Conservative setting that catches obvious typos
Indexed for performance: GIN indexes on solution titles
9.3 Implementation
sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create indexes
CREATE INDEX idx_solutions_title_trgm 
ON solutions USING gin (LOWER(title) gin_trgm_ops);
9.4 Match Scoring
typescript
// Scoring hierarchy
1.0 = Exact match (case insensitive)
0.9 = Starts with search term
0.8 = Contains exact substring
0.4+ = Fuzzy match threshold
9.5 User Experience
User types: "cereve" 
System finds: "CeraVe" (0.40 match score)
Shows: Suggestion with "(similar)" indicator
User clicks: Input filled with correct spelling
9.6 Applied To
Keyword autocomplete: search_keywords_for_autocomplete
Solution search: search_solutions_fuzzy
Category detection: check_keyword_match_fuzzy
9.7 Performance Considerations
Indexes on LOWER(title) for fast trigram matching
10,000 keywords is minimal load for pg_trgm
Results limited to 10 for quick response
Conservative threshold prevents false positives
10. Environment Setup
10.1 Local Development
bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://wqxkhxdbxdtpuvuvgirx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
10.2 Development Commands
bash
npm install        # Install dependencies
npm run dev        # Start dev server (port 3002)
npm run build      # Build for production
npm run lint       # Run ESLint
11. Development Tools & Debugging
11.1 Common Issues & Fixes
Import errors: Use relative imports when @ alias fails
RLS recursion: Fixed by removing recursive admin policies
TypeScript strict mode: Sometimes requires type assertions
Dropdown positioning: Parent needs position: relative
Server component errors: Can't pass functions to client components
11.2 Testing Auto-Categorization
bash
# Visit test page
http://localhost:3002/test-categorization

# Test keywords (now with fuzzy matching)
- "vitamn" → Supplements & Vitamins
- "headpsace" → Apps & Software
- "theripist" → Therapists & Counselors
11.3 Testing Failed Solutions
javascript
// Console debugging
console.log('Searching for:', searchTerm);
console.log('Search results:', data);
console.log('showSuggestions:', showSuggestions);
11.4 Testing Fuzzy Search
sql
-- Test in Supabase SQL editor
SELECT * FROM search_keywords_for_autocomplete('cereve');
SELECT * FROM search_solutions_fuzzy('niacinimide');
12. Implementation Priorities
12.1 Completed (June 2025)
✅ Auto-categorization system
✅ Category UI components
✅ Solution form integration
✅ DosageForm v2.2 (complete)
✅ RLS policy fixes
✅ Failed solutions backend
✅ Search functionality
✅ Fuzzy search implementation
✅ Keyword autocomplete
12.2 Next Sprint (July 2025)
SessionForm - Next form template (7 categories)
Remaining 7 forms - Complete all form templates
Category pages - Browse by category
Solution detail pages - Full solution info
Admin review queue - For new solution moderation
13. Decision Log
Date	Decision	Why	Result
Dec 20, 2024	Build auto-categorization	Natural input UX	✅ Working well
Dec 20, 2024	9 form templates	Manage complexity	✅ Pattern validated
Dec 20, 2024	Fix RLS recursion	Unblock queries	✅ Resolved
Dec 20, 2024	Solution-first search	Users think in solutions	✅ Implemented
Dec 20, 2024	Smart keywords	Avoid duplication	✅ Complete
June 22, 2025	Remove count field	Confusing for users	✅ Cleaner data
June 22, 2025	Failed solutions ratings	Complete picture	✅ Negative ratings count
June 22, 2025	Separate units/forms	Data quality	✅ No more "2 tablets"
June 26, 2025	Implement fuzzy search	Handle typos	✅ pg_trgm working
June 26, 2025	40% similarity threshold	Conservative matching	✅ Good balance
14. Known Technical Debt
Item	Priority	Status	Notes
8 remaining forms	🔴 Critical	⬜ Next	Need all 9 for launch
Category pages	🔴 Critical	⬜ Planned	Browse by category
Solution detail pages	🟡 Medium	⬜ Planned	Full solution info
TypeScript types	🟡 Medium	⬜ Ongoing	Some any types remain
Error boundaries	🟡 Medium	⬜ Planned	Better error handling
Performance optimization	🟢 Low	⬜ Future	Queries are fast enough
15. Key User Flows
15.1 Solution Contribution Flow (Current)
User clicks "Share What Worked" on goal page
Types solution name (e.g., "vitamn d")
Fuzzy search suggests "Vitamin D"
User clicks suggestion → correct spelling filled
Auto-categorization detects category
User confirms or manually selects
Fills appropriate form (1 of 9 templates)
Adds failed solutions (optional)
Submits → Creates:
Solution (if new)
Implementation variant
Goal link
Positive rating (4-5 stars typically)
Negative ratings for failed solutions
Redirects to goal page with success message
15.2 Failed Solutions Flow
User reaches Step 4 of any form
Types solution name (3+ chars)
Sees dropdown with existing solutions
Selects existing or adds custom text
Rates 1-5 stars
On submit:
Existing → Real rating affecting scores
Custom → JSON storage only
15.3 Fuzzy Search Experience
User types with typo: "cereve"
System finds "CeraVe" via fuzzy matching
Shows suggestion with category badge
User clicks → Input corrected
Continues with accurate data entry
16. UI Component Library
16.1 Core Components
SearchBar: Goal search with highlighting
Breadcrumbs: Hierarchical navigation
RatingDisplay: 5-star visual ratings
LoadingStates: Skeleton loaders
16.2 Auto-Categorization Components
CategoryConfirmation: Smart confirmation UI
CategoryPicker: Grouped manual selection
SolutionFormWithAutoCategory: Full flow orchestrator with fuzzy search
16.3 Form Components
DosageForm: Complete and tested (v2.2)
FailedSolutionsSearch: Autocomplete with ratings
CustomSideEffects: Dynamic "Add other" UI
8 more forms: To be implemented
16.4 Key UI Patterns
Debounced search: 300ms delay
Loading spinners: During async operations
"Skip" for optional steps: Clear CTA
Progressive disclosure: Required fields first
Smart defaults: Pre-selected logical options
Fuzzy match indicators: "(similar)" for non-exact matches
17. API Patterns
17.1 Supabase Client Usage
typescript
// Always check for errors
const { data, error } = await supabase
  .from('table')
  .select('*');

if (error) throw error;
17.2 RPC Function Calls
typescript
// For complex queries
const { data } = await supabase
  .rpc('function_name', { param: value });

// Fuzzy search example
const { data, error } = await supabase.rpc('search_solutions_fuzzy', {
  search_term: 'vitamn'
});
17.3 Transaction Pattern
typescript
// Multiple related inserts
try {
  // 1. Create solution
  // 2. Create implementation
  // 3. Create link
  // 4. Create rating
  // 5. Process failed solutions
  // All or nothing
} catch (error) {
  // Handle rollback
}
Status: DosageForm v2.2 complete with sophisticated data capture. Failed solutions search backend working perfectly. Fuzzy search implemented across all search functions with pg_trgm. Keyword autocomplete prevents typos and ensures data quality. Ready to implement remaining 8 form templates.

