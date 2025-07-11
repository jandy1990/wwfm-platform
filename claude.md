# claude.md - WWFM AI Collaboration Guide

## Project Overview

**WWFM (What Works For Me)** is a platform where people share solutions that actually worked for their life challenges. Users browse goals, see aggregated effectiveness ratings, and contribute their own experiences.

**Current Status**: Platform operational with 35% goal coverage (227/652 goals have solutions). Target: 80% coverage with 2,000+ solutions.

## Quick Context

```bash
# Development
URL: http://localhost:3004
Stack: Next.js 15.3.2, TypeScript, Supabase, Tailwind CSS
Database: PostgreSQL (Supabase hosted)

# Key Metrics
- 529 solutions (474 original + 55 new)
- 190 variants (113 original + 77 new)  
- 652 total goals across 13 arenas
- 23 solution categories
- 9 form templates
```

## Critical Architecture Decisions

### 1. Two-Layer Solution System
- **Solutions**: Generic approaches (e.g., "Vitamin D", "CBT Therapy")
- **Variants**: Specific versions (e.g., "1000 IU softgel", "Standard")
- Only 4 categories have real variants: medications, supplements_vitamins, natural_remedies, beauty_skincare
- Other 19 categories use a single "Standard" variant

### 2. Data Flow
```
User rates solution → Creates rating record → Updates goal_implementation_links → Reflects in UI
```

### 3. Key Relationships
- Every solution MUST have at least one variant
- Ratings link to variant IDs, not solution IDs
- Effectiveness is stored in goal_implementation_links, not on variants

## File Structure

```
/app
  /goal/[id]/
    page.tsx                    # Server component
    GoalPageClient.tsx         # Client component (main logic)
  /browse/                     # Browse all goals
  /arena/[slug]/              # Arena pages
  
/components
  /solutions/
    InteractiveRating.tsx      # Hover-to-rate component
    SolutionCard.tsx          # Card display
    forms/                    # 9 form templates
      DosageForm.tsx          # Complete
      SessionForm.tsx         # TODO
      PracticeForm.tsx        # TODO
      
/lib
  /services/
    goal-solutions.ts         # Fetches solutions for goals
    ratings.ts               # Rating submission logic
  supabase.ts                # Client creation
  supabase-server.ts         # Server client
```

## Common Commands

```bash
# Development
npm run dev                  # Start on port 3004

# Database
npx supabase db push         # Push migrations
npx supabase db reset        # Reset database

# Type Generation
npm run generate-types       # Generate TypeScript types from Supabase

# Testing Queries in Supabase SQL Editor
-- Check goal solutions
SELECT s.title, sv.variant_name, gil.avg_effectiveness
FROM goal_implementation_links gil
JOIN solution_variants sv ON sv.id = gil.implementation_id
JOIN solutions s ON s.id = sv.solution_id
WHERE gil.goal_id = '[GOAL_ID]'
ORDER BY gil.avg_effectiveness DESC;

-- Verify all solutions have variants
SELECT COUNT(*) FROM solutions s
LEFT JOIN solution_variants sv ON sv.solution_id = s.id
WHERE sv.id IS NULL;
```

## Current Issues & Patterns

### Known Bugs
1. **Rating submission fails** - Missing variant prop in InteractiveRating
2. **Auth in client components** - Cookie parsing errors
3. **Duplicate ratings** - Need upsert instead of insert

### Code Patterns
```typescript
// Fetching solutions with variants
const { data } = await supabase
  .from('goal_implementation_links')
  .select(`
    *,
    solution_variants!implementation_id (
      *,
      solutions (*)
    )
  `)
  .eq('goal_id', goalId);

// Always check for variants
const variant = solution.solution_variants?.[0] || solution.variants?.[0];
if (!variant) {
  console.error('No variant found for solution:', solution.id);
}
```

### Common Pitfalls
- Don't use solution.id for ratings - use variant.id
- Remember effectiveness comes from goal_implementation_links
- Check for both solution_variants and variants arrays (data inconsistency)

## Database Schema Quick Reference

### Core Tables
- **solutions**: Generic approaches (id, title, solution_category)
- **solution_variants**: Specific versions (id, solution_id, variant_name)
- **goal_implementation_links**: Connects goals to variants (goal_id, implementation_id, avg_effectiveness)
- **ratings**: User ratings (solution_id, implementation_id, goal_id, effectiveness_score)

### Foreign Key Chain
```
ratings.implementation_id → solution_variants.id
solution_variants.solution_id → solutions.id
goal_implementation_links.implementation_id → solution_variants.id
```

## AI Assistant Guidelines

When analyzing this codebase:

1. **Always verify variant existence** before any rating operations
2. **Check both naming conventions**: solution_variants vs variants (inconsistent in codebase)
3. **Use fuzzy search** for solution lookups (pg_trgm enabled)
4. **Respect the form system**: 9 templates map to 23 categories
5. **Test queries in Supabase** before implementing

## Testing Checklist

- [ ] Can users browse goals?
- [ ] Do solutions display with correct effectiveness?
- [ ] Can users rate solutions (1-5 stars)?
- [ ] Do ratings update the average?
- [ ] Are variants showing for medications/supplements?
- [ ] Is the "Simple/Detailed" view toggle working?

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://wqxkhxdbxdtpuvuvgirx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Deployment

- Platform: Vercel
- Database: Supabase (US East)
- Domain: [TBD]

## Next Major Milestones

1. Fix rating submission bug
2. Complete remaining 8 form templates  
3. Generate 1,500+ more solutions
4. Implement distribution displays
5. Launch with 80% goal coverage

## Questions for AI to Ask

Before making changes, verify:
- Which variant should this rating connect to?
- Is this a variant category or standard category?
- Where is effectiveness stored for this goal-solution pair?
- Am I using the correct foreign key relationships?