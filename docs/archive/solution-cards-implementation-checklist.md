# Solution Cards Implementation Checklist - Handover Document

**Last Updated**: July 10, 2025  
**Current Developer**: Jack Andrews  
**Project**: WWFM (What Works For Me) Platform  
**Component**: Goal Page Solution Cards (`/goal/[id]`)

## 🎯 Executive Summary

We're implementing interactive solution cards for the WWFM goal page. Users can rate solutions that worked for them, view different information densities, and see variants for medication-type solutions. The rating feature is currently broken due to a foreign key constraint issue.

## 📊 Current Status Overview

### ✅ Completed
- Goal page redesign with gradient header and stats
- Rating container transform (desktop hover interaction)
- Basic rating click handler implementation
- Claude Code CLI tool setup and authentication
- Database structure understanding (solutions → variants → ratings)

### 🚧 In Progress
- **CRITICAL BUG**: Rating submission failing with foreign key constraint error
  - Error: "Key is not present in table 'solution_variants'"
  - Root cause: Non-variant solutions aren't passing variant prop to InteractiveRating
  - Solution identified: Need to pass `bestVariant` to InteractiveRating component

### ❌ Not Started
- Per-card view toggle
- Mobile swipe-to-rate
- Distribution display in detailed view
- Side effects section
- Loading & error states
- Analytics tracking

## 🐛 Critical Bug: Rating Submission

### The Problem
When users click rating stars, the database insert fails with:
```
POST https://wqxkhxdbxdtpuvuvgirx.supabase.co/rest/v1/ratings 409 (Conflict)
Error: "insert or update on table 'ratings' violates foreign key constraint 'ratings_implementation_id_fkey'"
```

### Root Cause Analysis
1. The `ratings` table requires `implementation_id` to reference a valid `solution_variants.id`
2. For non-variant solutions (apps, therapy, etc.), the InteractiveRating component is NOT receiving a variant prop
3. The code tries to use `solution.id` as fallback, but that's not a valid variant ID

### The Fix
In `GoalPageClient.tsx` around line 653, the non-variant InteractiveRating is missing the variant prop:

```typescript
// CURRENT (BROKEN):
<InteractiveRating
  solution={{
    id: solution.id,
    title: solution.title,
    solution_category: solution.solution_category
  }}
  goalId={goal.id}
  initialRating={bestRating}
  ratingCount={totalReviews}
  // ❌ NO VARIANT PROP!
/>

// FIXED:
<InteractiveRating
  solution={{
    id: solution.id,
    title: solution.title,
    solution_category: solution.solution_category
  }}
  variant={{
    id: bestVariant.id,
    variant_name: bestVariant.variant_name
  }}  // ✅ ADD THIS!
  goalId={goal.id}
  initialRating={bestRating}
  ratingCount={totalReviews}
/>
```

### Additional Issues Found
1. **Authentication**: Cookie parsing errors preventing auth in client components
2. **Duplicate ratings**: Getting 409 conflicts when user tries to rate again
3. **Upsert needed**: Should update existing ratings instead of always inserting

## 📁 Key Files & Locations

### Components
- `/components/solutions/InteractiveRating.tsx` - Rating component with hover transform
- `/app/goal/[id]/GoalPageClient.tsx` - Main goal page component (needs variant prop fix)
- `/components/ui/RatingDisplay.tsx` - Non-interactive rating display

### Database Tables
- `solutions` - Generic approaches (474 total)
- `solution_variants` - Specific versions (113 total, all solutions have at least one)
- `ratings` - User ratings (requires valid implementation_id → variant.id)
- `goal_implementation_links` - Connects goals to variants with effectiveness data

### Categories with Variants
Only 4 categories have multiple variants:
- medications
- supplements_vitamins
- natural_remedies
- beauty_skincare

All other categories use a single "Standard" variant.

## 🔧 Environment & Tools

### Development Setup
- Next.js 15.3.2 with TypeScript
- Supabase for backend (project: wqxkhxdbxdtpuvuvgirx)
- Tailwind CSS for styling
- Local dev: http://localhost:3004

### Claude Code CLI
- Location: `~/.claude/local/claude`
- Version: 1.0.44
- Add to PATH: `export PATH="$HOME/.claude/local:$PATH"`

### Common Issues & Fixes
1. **Terminal paste '00~' prefix**: Add to ~/.bashrc:
   ```bash
   set enable-bracketed-paste off
   ```

2. **Claude Desktop spinning wheel**: Clear cache:
   ```bash
   rm -rf ~/Library/Application\ Support/Claude
   rm -rf ~/Library/Caches/com.anthropic.claude*
   ```

## 📋 Implementation Checklist

### Phase 1: Fix Critical Bug ⚠️ PRIORITY
- [ ] Add variant prop to non-variant InteractiveRating components
- [ ] Implement upsert instead of insert for ratings
- [ ] Test rating submission works for all solution types
- [ ] Handle auth properly in client components

### Phase 2: Core Interactions
- [ ] **Per-Card View Toggle**
  - Click card body to toggle individual view
  - Exclude clicks on buttons, links, rating area
  - Maintain state map: `{cardId: 'simple' | 'detailed'}`
  - Global toggle overrides individual states

- [ ] **Mobile Swipe-to-Rate**
  - Install react-swipeable
  - Swipe left reveals rating overlay
  - Swipe right hides rating overlay
  - Visual hint: "← Swipe" on card hover

### Phase 3: Data Display
- [ ] **Distribution Display (Detailed View)**
  - Field label with report count: "COST (142)"
  - Top 3 values with percentages
  - "others (X%)" for remaining values
  - Handle n=1, n≤3, multi-select cases

- [ ] **Side Effects Section**
  - Yellow-background chips
  - "Add side effect" button (hidden until hover)
  - Inline text input on click

### Phase 4: Polish
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Optimistic updates
- [ ] Performance optimization (virtualization for 50+ items)
- [ ] Analytics tracking

## 🎨 UI/UX Decisions Made

1. **Gradient header** with prominent stats (55 solutions, 89% success)
2. **Amazon-style related goals** menu (text links, not cards)
3. **Clean dropdown controls** replacing pill clutter
4. **Desktop hover-to-rate** (stars appear in same container)
5. **Mobile swipe-to-rate** (gesture-based interaction)
6. **Simple vs Detailed toggle** affects all cards globally

## 🚀 Next Steps for New Developer

1. **Immediate Priority**: Fix the rating bug by adding variant prop
2. **Test thoroughly**: Ensure ratings work for both variant and non-variant solutions
3. **Continue Phase 2**: Implement per-card toggle and mobile swipe
4. **Use Claude Code**: `claude components/solutions/InteractiveRating.tsx` for AI assistance

## 📝 Key Learnings & Gotchas

1. **Every solution has a variant** - Even non-variant categories have a "Standard" variant
2. **implementation_id is crucial** - Must point to variant.id, never solution.id
3. **bestVariant is already calculated** - Just needs to be passed as prop
4. **Auth issues in client components** - Consider passing userId from server component
5. **Database uses upsert pattern** - Users can update their ratings

## 🔗 Related Documentation

- WWFM Project Guide
- Form Templates (for understanding solution categories)
- Product Roadmap (35% goal coverage, need 80%)
- Technical Reference (database schema details)

---

**Handover Note**: The rating feature is the most critical functionality. Once fixed, users can start contributing real effectiveness data. The fix is simple - just pass the variant prop that's already available in the component. Good luck! 🚀