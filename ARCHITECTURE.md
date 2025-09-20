# ARCHITECTURE.md - WWFM Technical Architecture

> **Last Updated**: December 2024  
> **Purpose**: Technical implementation guide for developers and Claude Code  
> **Related**: [Database Schema](/docs/database/schema.md) | [Form Templates](/docs/forms/README.md) | [Goals Taxonomy](/data/taxonomy.md)

## 🏛️ System Overview

WWFM (What Works For Me) is a platform for crowdsourcing effective solutions to life challenges. It follows a modern JAMstack architecture with server-side rendering, edge functions, and a PostgreSQL backend.

### Core Concepts

1. **Goals**: Specific life challenges users want to solve (228 active, curated from 652 original)
2. **Solutions**: Specific implementable approaches (e.g., "Headspace app", "Vitamin D3")
   - "Generic" means cross-applicable to multiple goals, NOT vague/non-specific
   - Must be actionable: something you can actually do/buy/join
3. **Variants**: Different versions of solutions (e.g., "200mg capsule", "10mg tablet")
4. **Effectiveness**: Goal-specific ratings showing what worked for whom

### Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  Next.js 15 (App Router) + TypeScript + Tailwind CSS   │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────┐
│                    Edge Network                          │
│              Vercel (CDN + Edge Functions)              │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────┐
│                    Data Layer                            │
│     Supabase (PostgreSQL + Auth + Realtime + RLS)      │
└─────────────────────────────────────────────────────────┘
```

**Key Technologies**:
- **Frontend**: Next.js 15.3.2, React 18, TypeScript 5
- **Styling**: Tailwind CSS 3.4, CSS Modules for special cases
- **Database**: Supabase (PostgreSQL 15), Row Level Security
- **Auth**: Supabase Auth with email verification
- **Deployment**: Vercel with Edge Functions
- **Search**: PostgreSQL pg_trgm for fuzzy matching

## 🗄️ Database Architecture

### Two-Layer Design Philosophy

The database separates generic solutions from specific implementations to avoid duplication:

```
solutions (generic)          solution_variants (specific)
"Vitamin D" ───────────────> "1000 IU softgel"
                      └────> "5000 IU tablet"
                      └────> "2000 IU liquid"

"Headspace" ───────────────> "Standard" (single variant)
```

### Critical Relationships

```
goals ←──── goal_implementation_links ───→ solution_variants ───→ solutions
                        ↓
                avg_effectiveness
                rating_count
                solution_fields (JSONB)
```

**Key Insight**: Effectiveness is stored at the goal level, not the solution level. This allows "Meditation" to be highly effective for anxiety but moderately effective for focus.

### Why Variants Exist

Only 4 categories have multiple variants:
- `medications` (dosages matter: 25mg vs 50mg)
- `supplements_vitamins` (forms matter: capsule vs liquid)
- `natural_remedies` (preparations vary: tea vs tincture)
- `beauty_skincare` (concentrations matter: 0.1% vs 0.5% retinol)

All other 19 categories use a single "Standard" variant to maintain consistency.

### JSONB for Flexibility

The system uses JSONB columns for flexible data storage:

**Individual Data** (`ratings.solution_fields`):
```json
{
  "cost": "$10-25/month",
  "time_to_results": "3-4 weeks",
  "side_effects": ["Nausea", "Headache"],
  "frequency": "Once daily",
  "brand": "Generic available"
}
```

**Aggregated Data** (`goal_implementation_links.aggregated_fields`):
```json
{
  "cost": {
    "mode": "$10-25/month",
    "values": [
      {"value": "$10-25/month", "count": 15, "percentage": 60},
      {"value": "$25-50/month", "count": 10, "percentage": 40}
    ],
    "totalReports": 25
  },
  "side_effects": {
    "mode": "Nausea",
    "values": [
      {"value": "Nausea", "count": 12, "percentage": 48},
      {"value": "Headache", "count": 8, "percentage": 32}
    ],
    "totalReports": 25
  }
}
```

This dual-storage approach preserves individual contributions while enabling efficient aggregated displays.

## 🎨 Frontend Architecture

### Component Structure

```
/components
├── /atoms              # Basic building blocks
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Card.tsx
├── /molecules          # Composite components
│   ├── RatingDisplay.tsx
│   ├── SolutionCard.tsx
│   └── SearchBar.tsx
├── /organisms          # Complex features
│   ├── SolutionList.tsx
│   ├── GoalHeader.tsx
│   └── ContributionForm.tsx
└── /templates          # Page layouts
    └── PageLayout.tsx
```

### Rendering Strategy

1. **Server Components (default)**: For data fetching and SEO
2. **Client Components**: Only for interactivity ('use client')
3. **Streaming**: Suspense boundaries for perceived performance
4. **Static Generation**: Pre-render common pages

### State Management Patterns

```typescript
// 1. Server State - In server components
const solutions = await getSolutionsForGoal(goalId);

// 2. Local State - For UI interactions
const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');

// 3. Form State - Controlled components
const [formData, setFormData] = useState<SolutionFormData>(initialData);

// 4. No Global State - Deliberate choice for simplicity
```

### Mobile-First Responsive Design

```typescript
// Desktop: Hover interactions
onMouseEnter={() => setShowRating(true)}

// Mobile: Touch gestures
const handlers = useSwipeable({
  onSwipedLeft: () => setShowRating(true),
  trackMouse: false // Mobile only
});
```

## 🔄 Data Flow Patterns

### 1. Browse Flow (Server → Client)

```
Server Component: Fetch goals with solutions
          ↓
    Page renders with data
          ↓
Client: Filter/sort without refetch
          ↓
Progressive disclosure on interaction
```

### 2. Contribution Flow (Two-Phase Submission)

```
User Input → Auto-categorization → Form Selection → Step 1-3 Collection
                                         ↓
                         Initial Submission (Required Fields Only)
                                         ↓
                      Store in ratings.solution_fields (Individual)
                                         ↓
                         Success Screen (Optional Fields)
                                         ↓
                   updateSolutionFields (Merge Additional Data)
                                         ↓
                     Trigger Aggregation Service → Store in aggregated_fields
```

### 3. Search Flow (Fuzzy Matching)

```typescript
// Fuzzy search implementation
const results = await supabase.rpc('search_solutions_fuzzy', {
  search_term: query
});

// Match scoring:
// 1.0 = Exact match
// 0.9 = Starts with term
// 0.8 = Contains term
// 0.4+ = Fuzzy match
```

## 🛡️ Security Architecture

### Authentication Flow

```typescript
// Server-side auth check
import { createServerSupabaseClient } from '@/lib/database/server';

export default async function ProtectedPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');
  // ... rest of page
}
```

### Row Level Security (RLS)

All tables except `admin_users` have RLS enabled:

```sql
-- Public can read approved content
CREATE POLICY "public_read_approved" ON solutions
  FOR SELECT USING (is_approved = true);

-- Users can create content
CREATE POLICY "authenticated_create" ON solutions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Users can update own content
CREATE POLICY "users_update_own" ON solutions
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);
```

### Data Validation Layers

1. **Frontend**: Zod schemas
2. **API**: Input validation
3. **Database**: Constraints
4. **RLS**: Access control

## 🚀 Performance Optimizations

### Database Performance

```sql
-- Critical indexes for search
CREATE INDEX idx_solutions_title_trgm 
  ON solutions USING gin (LOWER(title) gin_trgm_ops);

-- Foreign key performance
CREATE INDEX idx_gil_goal_variant 
  ON goal_implementation_links(goal_id, implementation_id);

-- Sorting performance
CREATE INDEX idx_gil_effectiveness_desc 
  ON goal_implementation_links(avg_effectiveness DESC NULLS LAST);
```

### Frontend Performance

```typescript
// 1. Code splitting by route
const SessionForm = dynamic(() => import('./forms/SessionForm'));

// 2. Image optimization
import Image from 'next/image';

// 3. List virtualization for 50+ items
import { FixedSizeList } from 'react-window';

// 4. Debounced search
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  []
);
```

### Caching Strategy

- **Static Pages**: CDN cache with stale-while-revalidate
- **API Routes**: Cache headers for public data
- **Database**: Connection pooling via Supabase
- **Assets**: Immutable cache with hashed filenames

## 📡 API Patterns

### Server Actions (Preferred)

```typescript
// app/actions/solutions.ts
'use server';

export async function createSolution(data: SolutionData) {
  const supabase = createServerClient();
  
  // Validate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  // Insert with RLS
  const { data: solution, error } = await supabase
    .from('solutions')
    .insert({ ...data, created_by: user.id })
    .select()
    .single();
    
  if (error) throw error;
  return solution;
}
```

### API Routes (When Needed)

```typescript
// app/api/search/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query || query.length < 3) {
    return NextResponse.json({ results: [] });
  }
  
  const results = await searchSolutions(query);
  return NextResponse.json({ results });
}
```

## 🏗️ Key Implementation Patterns

### Form System Architecture

9 form templates handle 23 solution categories:

```typescript
// Form selection based on category
const formComponents = {
  dosage_form: DosageForm,      // 4 categories
  session_form: SessionForm,     // 7 categories
  practice_form: PracticeForm,   // 3 categories
  purchase_form: PurchaseForm,   // 2 categories
  app_form: AppForm,            // 1 category
  community_form: CommunityForm, // 2 categories
  lifestyle_form: LifestyleForm, // 2 categories
  hobby_form: HobbyForm,        // 1 category
  financial_form: FinancialForm // 1 category
};

const categoryToForm = {
  'medications': 'dosage_form',
  'therapists_counselors': 'session_form',
  'exercise_movement': 'practice_form',
  // ... etc
};
```

### Auto-Categorization System

```typescript
// 10,000+ keywords for intelligent categorization
const detectCategory = async (input: string) => {
  // 1. Check existing solutions (fuzzy match)
  const existingMatch = await searchSolutions(input);
  if (existingMatch) return existingMatch.category;
  
  // 2. Check exact keywords
  const keywordMatch = await checkKeywordMatch(input);
  if (keywordMatch) return keywordMatch;
  
  // 3. Check patterns (drug suffixes, etc)
  const patternMatch = await checkPatterns(input);
  if (patternMatch) return patternMatch;
  
  // 4. Show category picker
  return null;
};
```

### Failed Solutions Tracking

```typescript
// Track what didn't work (negative ratings)
interface FailedSolution {
  solution_id: string;
  effectiveness_rating: 1 | 2 | 3; // Low ratings
  is_primary: false; // Marks as "didn't work"
}

// In form: "What else did you try?"
const handleFailedSolutions = async (failed: string[]) => {
  for (const solutionName of failed) {
    // Search existing or create new
    const solution = await findOrCreateSolution(solutionName);
    
    // Create negative rating
    await createRating({
      solution_id: solution.id,
      effectiveness_rating: 2, // Didn't work well
      is_primary: false
    });
  }
};
```

### Progressive Disclosure Pattern

```typescript
// Simple view: Essential info only
// Detailed view: Full distributions

interface ViewState {
  global: 'simple' | 'detailed';
  individual: Record<string, 'simple' | 'detailed'>;
}

const getCardView = (cardId: string, viewState: ViewState) => {
  // Global toggle overrides individual states
  if (viewState.global === 'detailed') return 'detailed';
  return viewState.individual[cardId] || 'simple';
};
```

## 🔧 Development Workflow

### Local Setup

```bash
# 1. Clone repository
git clone https://github.com/yourusername/wwfm-platform.git

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Add Supabase credentials

# 4. Run development server
npm run dev # Runs on port 3002

# 5. Run type checking
npm run type-check
```

### Common Development Tasks

```bash
# Add a new form template
1. Create components/solutions/forms/YourForm.tsx
2. Add to formComponents mapping
3. Update categoryToForm mapping
4. Add form fields to solution_fields types

# Add a new solution category
1. Update solution_category enum in database
2. Add to form mappings
3. Add keywords to category_keywords table
4. Update TypeScript types

# Debug a query
1. Use Supabase SQL editor
2. Check RLS policies with SELECT * FROM pg_policies
3. Test with different auth contexts
```

### Error Handling Patterns

```typescript
// Consistent error handling
export async function safeOperation<T>(
  operation: () => Promise<T>,
  context: string
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    console.error(`[${context}] Operation failed:`, error);
    return { 
      error: error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred' 
    };
  }
}

// Usage
const { data: solutions, error } = await safeOperation(
  () => getSolutionsForGoal(goalId),
  'GoalPage'
);
```

## 📚 Key Design Decisions

### Why Server Components by Default?

1. **Better Performance**: Less JavaScript to download
2. **Direct Data Access**: No API layer needed
3. **SEO Friendly**: Content is server-rendered
4. **Simpler Mental Model**: Data fetching with components

### Why Two-Layer Solution Architecture?

1. **Avoid Duplication**: One "Vitamin D" entry for all uses
2. **Flexible Effectiveness**: Same solution, different results per goal
3. **Clean Variants**: Only where scientifically meaningful
4. **Easier Maintenance**: Update once, affects all uses

### Why JSONB for Form Data?

1. **Schema Flexibility**: Different forms need different fields
2. **No Migrations**: Add fields without database changes
3. **Query Performance**: PostgreSQL JSONB is indexed
4. **Type Safety**: TypeScript interfaces match JSONB structure

### Why 9 Forms for 23 Categories?

1. **Similar Patterns**: Group categories with similar data needs
2. **Maintainability**: Fewer forms to maintain and test
3. **Consistency**: Similar categories have same UX
4. **Flexibility**: Each form can have category-specific fields

### Why Fuzzy Search with pg_trgm?

1. **Typo Tolerance**: Users make spelling mistakes
2. **Native Performance**: PostgreSQL built-in, no external service
3. **Ranking**: Score matches by similarity
4. **Language Agnostic**: Works for any text

### Why Aggressive Search Filtering?

1. **Force Specificity**: "Therapy" is useless, "CBT with BetterHelp" is trackable
2. **Data Quality**: Generic entries make effectiveness ratings meaningless
3. **User Guidance**: Prompts users toward actionable solutions
4. **Prevent Pollution**: Stops category names becoming solutions

The search pipeline has 4 layers of filtering to ensure quality. See [Solution Search Data Flow](/docs/architecture/SOLUTION_SEARCH_DATA_FLOW.md) for implementation details.

## 🎯 Architecture Principles

1. **User-Centric**: Optimize for the end user experience
2. **Progressive Enhancement**: Basic functionality works everywhere
3. **Type Safety**: TypeScript everywhere, no `any` types
4. **Performance First**: Every query and render optimized
5. **Clear Patterns**: Consistent, documented approaches
6. **Testable**: Pure functions, dependency injection
7. **Accessible**: WCAG 2.1 AA compliance target

## 🚨 Common Pitfalls & Solutions

### Problem: Rating submission fails with foreign key error
**Solution**: Ensure `implementation_id` references a `solution_variant.id`, not `solution.id`

```typescript
// ❌ Wrong
const rating = { implementation_id: solution.id }

// ✅ Correct
const rating = { implementation_id: variant.id }
```

### Problem: RLS policies blocking access
**Solution**: Check auth context and policy conditions

```sql
-- Debug RLS
SELECT * FROM solutions 
WHERE is_approved = true; -- Should work for public

-- Check current user
SELECT auth.uid();
```

### Problem: Slow goal page load
**Solution**: Ensure indexes exist and queries are optimized

```sql
-- Check query plan
EXPLAIN ANALYZE
SELECT * FROM goal_implementation_links
WHERE goal_id = 'some-uuid'
ORDER BY avg_effectiveness DESC;
```

### Problem: TypeScript errors with Supabase types
**Solution**: Regenerate types when schema changes

```bash
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

### Problem: Search returns no results for generic terms
**Solution**: This is intentional - the system requires specificity

```typescript
// Instead of accepting "therapy", prompt for:
"Try being more specific: CBT therapy, EMDR, BetterHelp"
```

This ensures trackable, ratable solutions rather than vague categories.

---

**Next Steps**: 
- See [Database Schema](/docs/database/schema.md) for detailed table structures
- See [Solution Search Data Flow](/docs/architecture/SOLUTION_SEARCH_DATA_FLOW.md) for complete search pipeline
- See [Form Templates](/docs/forms/README.md) for form implementation details