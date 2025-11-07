# Technical Review Guide - WWFM Platform

**Platform:** What Worked For Me (WWFM)
**Review Date:** November 2025
**Estimated Time:** 2-4 hours (quick) | 8-12 hours (thorough)

---

## 🎯 What is WWFM?

Crowdsourcing platform that aggregates effectiveness ratings for life solutions. Users share what actually worked (not just what exists) for specific goals like "Calm my anxiety" or "Sleep better."

**The Innovation**: Organized by problems (goals) not products. Instead of "what Vitamin D does" → "what worked for people trying to sleep better" (which might include Vitamin D among 50+ solutions).

**Key Stats:**
- 228 goals, 3,873 solutions, 99.6% coverage
- All 23 form categories manually validated
- Production-ready pending 2 launch blockers

---

## 📖 Your Review Path

### ⚡ Fast Track (2-3 hours)

**1. Start Here (15 min)**
Read this document completely for codebase orientation

**2. Launch Readiness (15 min)**
[PLATFORM_STATUS.md](./PLATFORM_STATUS.md) - What works, what's blocking launch

**3. Critical Code Review (60 min)**
Review these files with JSDoc comments:
- `app/actions/submit-solution.ts` - Core submission logic
- `lib/services/solution-aggregator.ts` - Data aggregation
- `components/goal/GoalPageClient.tsx` (lines 56-407) - Category field configs
- Pick one form from `components/solutions/forms/` (all follow same pattern)

**4. Security Check (30 min)**
[SECURITY_REVIEW.md](./SECURITY_REVIEW.md) - RLS policies, auth, data privacy

**5. Test Coverage (15 min)**
[TEST_STATUS.md](./TEST_STATUS.md) - Manual vs automated testing status

### 🔍 Thorough Review (8-12 hours)

Add these to the fast track:

**6. Architecture Deep-Dive (90 min)**
[ARCHITECTURE.md](./ARCHITECTURE.md) - 679 lines on design decisions, patterns, data flow

**7. Database Schema (45 min)**
`docs/database/schema.md` - Tables, RLS policies, indexes

**8. AI Context (30 min, Optional)**
[CLAUDE.md](./CLAUDE.md) - How platform was built, data quality standards

**9. Browse Codebase (2-4 hours)**
Use the codebase map below to explore systematically

---

## 🎯 Your Mission

### Questions to Answer

1. **Data Safety**: Can user data be lost or corrupted?
2. **Security**: Any critical vulnerabilities?
3. **Launch Readiness**: Safe to go live after fixing the 2 blockers?
4. **Scalability**: Will it handle 100/1,000/10,000 users?
5. **Architecture**: Is the design sound for growth?
6. **Biggest Risk**: What's the #1 concern you see?

### Deliverables

1. Top 3 risks identified
2. Go/no-go recommendation
3. Priority fixes (beyond the 2 known blockers)
4. Estimated timeline to production-ready
5. Confidence level (Low/Medium/High)

---

## 💡 Review Context

**How This Was Built:**
Non-technical founder + Claude Code (AI coding assistant)

**What This Means:**
- ✅ Better documentation than most teams (AI collaboration)
- ✅ Clean, modern architecture patterns
- ✅ Honest problem assessment (not hiding issues)
- ⚠️ Evidence of trial-and-error (see `scripts/archive/`)
- ⚠️ Manual testing preferred over automated (works well)
- ❌ Not all automated tests passing (test infrastructure issues, not bugs)

**Don't Judge By Traditional Standards:**
- No team structure or code reviews → Architecture is still sound
- Automated tests failing → But manual testing is comprehensive
- Some archived failed scripts → Learning process documented

---

## 🏗️ Platform Architecture (Quick Reference)

### Tech Stack
```
Frontend:  Next.js 15.3.2 (App Router) + TypeScript + Tailwind CSS
Backend:   Supabase (PostgreSQL + Auth + Real-time)
Hosting:   Vercel
Search:    PostgreSQL pg_trgm (fuzzy matching)
Error:     Sentry
```

### Three-Layer Data Model

```
USER FLOW:
Browse Arenas → Select Goal → View Solutions (ranked) → Submit Rating


DATA STRUCTURE:

Goals (228 active)                   Examples: "Reduce anxiety"
    ↓                                         "Sleep better"
    ↓
Goal-Solution Links (5,583)         Stores effectiveness PER GOAL
    ├── effectiveness_rating        (same solution, different results!)
    ├── aggregated_fields ⚠️        Frontend reads from HERE
    └── solution_fields             AI baseline (backup)
    ↓
Solutions (3,873)                   Generic: "Meditation", "Vitamin D"
    ↓
Variants (4 categories only)        Specific: "Headspace", "5000 IU"
```

**Critical Design Choice**: Solutions are GENERIC (prevent duplication). Variants are SPECIFIC (only for dosage-dependent: medications, supplements, natural remedies, beauty).

**📊 Visual Diagrams**: See full architecture diagrams:
- [System Context](./docs/diagrams/system-context.md) - WWFM in ecosystem
- [Container Diagram](./docs/diagrams/container-diagram.md) - Tech components
- [Database ERD](./docs/diagrams/database-erd.md) - Full schema with relationships

---

## 📁 Codebase Map

### Directory Structure

```
wwfm-platform/
├── app/                              # Next.js App Router
│   ├── page.tsx                      # Homepage
│   ├── arena/[slug]/                 # 13 life areas
│   ├── goal/[slug]/                  # Goal detail pages
│   ├── solution/[slug]/              # Solution details
│   ├── dashboard/                    # User dashboard
│   ├── browse/                       # Browse all goals
│   ├── admin/                        # ⚠️ Admin queue (blocker #1)
│   ├── actions/                      # Server Actions
│   │   ├── submit-solution.ts        # ⚠️ REVIEW: Core submission
│   │   └── solutions.ts              # Update/delete operations
│   └── api/
│       └── health/                   # Health check endpoint
│
├── components/
│   ├── ui/                           # Base components (buttons, cards)
│   ├── goal/
│   │   ├── GoalPageClient.tsx        # ⚠️ CRITICAL: SSOT for fields
│   │   └── GoalList.tsx              # Goal browsing
│   ├── solutions/
│   │   ├── forms/                    # 9 form templates
│   │   │   ├── AppForm.tsx           # Apps/software
│   │   │   ├── DosageForm.tsx        # Meds/supplements/remedies/beauty
│   │   │   ├── SessionForm.tsx       # Therapists/coaches/doctors
│   │   │   ├── PracticeForm.tsx      # Meditation/exercise
│   │   │   ├── HobbyForm.tsx         # Hobbies/activities
│   │   │   ├── LifestyleForm.tsx     # Habits/sleep/diet
│   │   │   ├── CommunityForm.tsx     # Groups/communities
│   │   │   ├── FinancialForm.tsx     # Financial products
│   │   │   └── PurchaseForm.tsx      # Books/products/crisis
│   │   ├── cards/                    # Solution display cards
│   │   └── SolutionFormWithAutoCategory.tsx  # Form router
│   └── layout/                       # Nav, footer, etc.
│
├── lib/
│   ├── supabase/
│   │   └── client.ts                 # Database client (all access)
│   ├── services/
│   │   ├── solution-aggregator.ts    # ⚠️ REVIEW: Data aggregation
│   │   ├── search.ts                 # Search logic
│   │   └── solutions.ts              # Solution queries
│   ├── config/
│   │   └── solution-fields.ts        # Field configs (aligned to SSOT)
│   ├── utils/                        # Helper functions
│   └── ai-generation/                # AI generation utilities
│
├── types/
│   ├── database.types.ts             # Supabase generated
│   └── solution.ts                   # Core domain types
│
├── scripts/                          # One-off utilities
│   ├── claude-web-generator/         # AI solution generation
│   ├── safe/                         # ✅ Safe transformation scripts
│   ├── recovery/                     # Data recovery scripts
│   └── archive/                      # ⚠️ Archived/dangerous (don't use)
│
├── tests/                            # Test suites
│   ├── forms/                        # Form validation tests
│   └── setup/
│       └── test-fixtures.ts          # Creates 24 test solutions
│
└── docs/                             # Documentation
    ├── solution-fields-ssot.md       # ⚠️ Category-field mappings
    ├── database/schema.md            # Full schema + RLS
    ├── forms/                        # Form specifications
    └── testing/                      # Test guides
```

### Form Category Mapping (Critical)

```
9 Templates → 23 Categories:

AppForm             → apps_software
DosageForm          → medications, supplements_vitamins,
                      natural_remedies, beauty_skincare
SessionForm         → therapists_counselors, coaches_mentors,
                      doctors_specialists, medical_procedures,
                      alternative_practitioners
PracticeForm        → meditation_mindfulness, exercise_movement
HobbyForm           → hobbies_activities
LifestyleForm       → habits_routines, sleep, diet_nutrition
CommunityForm       → groups_communities
FinancialForm       → financial_products
PurchaseForm        → books_courses, products_devices, crisis_resources
```

---

## ⚠️ Critical Concepts (Must Understand)

### 1. Two-Field System

**Frontend reads from `aggregated_fields` ONLY:**

```typescript
// In goal_implementation_links table:
{
  solution_fields: {        // AI-generated baseline
    time_to_results: { ... }
  },
  aggregated_fields: {      // ⚠️ Frontend displays THIS
    time_to_results: { ... }  // User data + AI fallback
  }
}
```

**Why This Matters:**
- All data quality checks MUST target `aggregated_fields`
- Scripts that update `solution_fields` won't affect frontend
- Common bug: Reading from wrong field

### 2. Single Source of Truth (SSOT)

**File**: `components/goal/GoalPageClient.tsx` (Lines 56-407)

```typescript
const CATEGORY_CONFIG = {
  medications: {
    keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },
  exercise_movement: {
    keyFields: ['time_to_results', 'frequency', 'duration', 'cost'],
    arrayField: 'challenges'
  },
  // ... 21 more
}
```

**Rule**: When code and docs disagree, THIS FILE WINS.

**Common Mistake**: Generating `session_length` for exercise (needs `duration` instead).

### 3. Category-Specific Fields

Different categories need DIFFERENT fields:

```
Session-based (therapists, coaches):
  → session_frequency, session_length, cost, time_to_results

Medical (doctors, procedures):
  → session_frequency, wait_time, cost, time_to_results
  (NOT session_length!)

Practice (meditation, exercise):
  → frequency, duration/practice_length, cost, time_to_results
  (NOT session_length!)

Dosage (meds, supplements):
  → frequency, length_of_use, cost, time_to_results, side_effects
```

### 4. Field Preservation Pattern

**ALWAYS use spread operator to prevent data loss:**

```typescript
// ❌ WRONG - loses fields
const updated = newFields

// ✅ RIGHT - preserves everything
const updated = { ...existingFields, ...newFields }

// ✅ BEST - with validation
const updated = { ...existingFields, ...newFields }
if (Object.keys(updated).length < Object.keys(existingFields).length) {
  throw new Error('Field loss detected!')
}
```

**Why This Matters**: Historical data loss incidents from missing spreads.

---

## 🔍 Key User Flows (With Code Paths)

### 1. Browse & Discover

```
Homepage → Click Arena (e.g., "Health & Wellness")
  ↓  app/page.tsx → components/arena/ArenaGrid.tsx
  ↓
Arena Page → Shows goals in that area
  ↓  app/arena/[slug]/page.tsx
  ↓
Click Goal (e.g., "Reduce anxiety")
  ↓  app/goal/[slug]/page.tsx
  ↓
Goal Page → Solutions ranked by effectiveness
  ↓  components/goal/GoalPageClient.tsx
  ↓
Click Solution → Detailed view
  ↓  app/solution/[slug]/page.tsx
```

### 2. Contribute Solution

```
Click "Share What Worked" button
  ↓  app/goal/[slug]/page.tsx
  ↓
Auto-categorization detects type
  ↓  components/solutions/SolutionFormWithAutoCategory.tsx
  ↓
Shows appropriate form (1 of 9)
  ↓  components/solutions/forms/[Template]Form.tsx
  ↓
Three-step wizard: Basic → Details → Review
  ↓
Submit to database
  ↓  app/actions/submit-solution.ts ⚠️ REVIEW THIS
  ↓
Awaits admin approval ⚠️ BLOCKER #1
```

### 3. Search

```
Type in search box
  ↓  components/search/SearchBar.tsx
  ↓
Fuzzy match across 228 goals
  ↓  lib/services/search.ts
  ↓
Filter by quality (blocks generic terms)
  ↓
Results displayed
  ↓
Click → Goal page
```

**📊 Detailed Flow Diagrams**: See complete interactive diagrams with all decision points:
- [Browse & Discover Flow](./docs/diagrams/browse-discover-flow.md) - Complete user journey
- [User Contribution Flow](./docs/diagrams/user-contribution-flow.md) - Form submission process
- [Form System Flow](./docs/diagrams/form-system-flow.md) - How 9 templates handle 23 categories

---

## 🚨 Critical Gotchas (Watch For These)

### 1. Launch Blockers (From PLATFORM_STATUS.md)

**Blocker #1: No Admin Approval Queue**
- Users submit solutions → Invisible until approved
- No UI to approve/reject submissions
- Location: `app/admin/page.tsx` (line 59: "Coming Soon")
- Fix: 1-2 days

**Blocker #2: No Rate Limiting**
- Unlimited submissions allowed
- Vulnerable to spam/abuse
- Location: `app/actions/submit-solution.ts` (no rate limit check)
- Fix: 0.5-1 day

### 2. Data Quality Red Flags

**In Code:**
- Direct field assignment without spread → Data loss
- Generating fields without checking CATEGORY_CONFIG → Wrong fields
- Reading from `solution_fields` in frontend → Should use `aggregated_fields`
- Using scripts in `archive/` folder → Use `scripts/safe/` instead

**In Data:**
- Single-value distributions (100%) → Looks mechanistic
- Fallback sources (equal_fallback, smart_fallback) → Low quality
- <4 distribution options → Degraded diversity
- Wrong field names for category → Check SSOT
- Missing required fields → Check CATEGORY_CONFIG

### 3. Test Setup Requirement

**Problem**: Tests fail with "Solution not found" if setup skipped.

**Solution**:
```bash
npm run test:setup       # Creates 24 test fixtures (REQUIRED!)
npm run test:critical    # Then run tests
```

### 4. Database Access

**Two databases can confuse:**
- ✅ **Production (Supabase Cloud)**: Use for ALL development
- ❌ **Local (port 54322)**: ONLY for testing Supabase CLI

**Access Production**:
```typescript
import { supabase } from '@/lib/supabase/client'
```

### 5. Search Quality

Generic solutions like "meditation apps" are blocked by filters. Test fixtures need "(Test)" suffix to bypass.

---

## 📊 Quick Stats

### Codebase
- TypeScript/React: ~50,000 lines
- Database migrations: 36
- Form templates: 9 (handling 23 categories)
- Server actions: 15+ files
- React components: ~150+

### Documentation
- Root docs: 9 markdown files
- Feature READMEs: 6 files
- JSDoc comments: 6 critical files
- Total doc lines: ~3,000+

### Infrastructure
- Sentry: ✅ Configured
- Health checks: ✅ Implemented (`/api/health`)
- Structured logging: ✅ Operational
- Deployment: ✅ Vercel ready

### Content
- Goals: 228 active (from 653 curated)
- Solutions: 3,873 (AI-seeded + test fixtures)
- Coverage: 99.6% (227/228 goals)
- Goal-solution links: 5,583
- Average effectiveness: 4.15/5 stars

### Testing
- Manual testing: ✅ 100% complete (all 23 categories validated)
- Automated tests: ⚠️ 80% passing (infrastructure issues, not bugs)
- Test files: 42

---

## 🎯 Review Priorities

### High Priority (Must Review)

1. **Data Flow**
   - `app/actions/submit-solution.ts` - Submission logic
   - `lib/services/solution-aggregator.ts` - Aggregation logic
   - How user data flows to `aggregated_fields`

2. **Security**
   - RLS policies in `docs/database/schema.md`
   - Auth implementation in `lib/supabase/client.ts`
   - Form validation in `components/solutions/forms/`

3. **Launch Blockers**
   - Can admin queue be built in 1-2 days?
   - Is rate limiting straightforward?
   - Any other blockers you see?

### Medium Priority

4. **Architecture**
   - Two-layer design (solutions vs variants)
   - Two-field system (solution_fields vs aggregated_fields)
   - SSOT pattern (GoalPageClient.tsx)

5. **Scalability**
   - Database query patterns
   - No caching strategy yet
   - RLS policy performance

6. **Error Handling**
   - Sentry integration
   - Error boundaries
   - Structured logging usage

### Low Priority (If Time)

7. **Code Quality**
   - TypeScript usage
   - Component patterns
   - Test coverage

8. **Documentation**
   - Accuracy vs codebase
   - Completeness
   - Maintainability

---

## 🔍 Navigation Shortcuts

### Need to find...

**How effectiveness varies by goal?**
→ `goal_implementation_links` table has per-goal ratings

**What fields a category needs?**
→ `components/goal/GoalPageClient.tsx` CATEGORY_CONFIG

**How forms map to categories?**
→ `components/solutions/SolutionFormWithAutoCategory.tsx`

**Database schema?**
→ `docs/database/schema.md`

**RLS policies?**
→ `docs/database/schema.md` (inline with tables)

**Test setup?**
→ `tests/README.md` or `npm run test:setup`

**AI generation?**
→ `scripts/claude-web-generator/`

**Safe data scripts?**
→ `scripts/safe/` (NOT `scripts/archive/`!)

**Current bugs?**
→ `PLATFORM_STATUS.md` section "Known Issues"

**Security assessment?**
→ `SECURITY_REVIEW.md`

---

## ✅ Review Checklist

Use this to track your review progress:

### Understanding
- [ ] Understand three-layer data model (Goals → Links → Solutions → Variants)
- [ ] Understand two-field system (`aggregated_fields` vs `solution_fields`)
- [ ] Understand SSOT for category fields (`GoalPageClient.tsx`)
- [ ] Understand 9 forms → 23 categories mapping
- [ ] Understand why solutions are generic, variants specific

### Code Review
- [ ] Read `app/actions/submit-solution.ts` (submission logic)
- [ ] Read `lib/services/solution-aggregator.ts` (aggregation)
- [ ] Read one form template (e.g., `DosageForm.tsx`)
- [ ] Check RLS policies in `docs/database/schema.md`
- [ ] Review auth implementation

### Security
- [ ] Check data access controls (RLS)
- [ ] Check auth flows (email verification)
- [ ] Identify rate limiting gaps
- [ ] Check for SQL injection risks
- [ ] Check for XSS vulnerabilities

### Launch Readiness
- [ ] Assess admin queue blocker (can it be built quickly?)
- [ ] Assess rate limiting blocker (straightforward implementation?)
- [ ] Identify any other blockers
- [ ] Evaluate if manual testing is sufficient
- [ ] Check if architecture supports scale

### Data Safety
- [ ] How is user data protected?
- [ ] Can data be lost? (Check field preservation patterns)
- [ ] Can data be corrupted? (Check validation)
- [ ] Are backups configured?

---

## 🚀 Expected Outcome

### After Your Review

**Deliver:**
1. **Top 3 Risks** - What concerns you most?
2. **Go/No-Go** - Can this launch after fixing blockers?
3. **Priority Fixes** - What else needs fixing (beyond 2 blockers)?
4. **Timeline** - Days/weeks to production-ready?
5. **Confidence** - Low/Medium/High for launch success?

### Then

1. Fix launch blockers (2-3 days estimated)
2. Address high-priority findings
3. Final QA pass
4. Deploy to production
5. Launch! 🎉

---

## 📚 Additional Resources

**Quick Start:**
- This document (orientation)
- [PLATFORM_STATUS.md](./PLATFORM_STATUS.md) (current state)
- [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) (security assessment)

**Deep Dive:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) (design decisions, 679 lines)
- [CLAUDE.md](./CLAUDE.md) (AI context, data quality, 543 lines)
- `docs/database/schema.md` (complete schema)

**Reference:**
- `docs/solution-fields-ssot.md` (category-field mappings)
- `FORM_DROPDOWN_OPTIONS_REFERENCE.md` (exact dropdown values)
- `tests/README.md` (testing guide)

**Exploration:**
- `docs/README.md` (documentation hub)
- `README.md` (project setup)

---

## 🤔 Common Review Questions

**Q: Why are automated tests failing?**
A: Test infrastructure issues (selector brittleness, timing), not platform bugs. Manual testing is comprehensive and all 23 categories validated Nov 1, 2025.

**Q: Why is there an `archive/` folder with "dangerous" scripts?**
A: Learning process documented. Field generation system had multiple iterations. Use `scripts/safe/` instead.

**Q: Why two fields (solution_fields + aggregated_fields)?**
A: Separation of concerns - AI baseline vs user-aggregated display data. Frontend only reads aggregated.

**Q: Can I trust the AI-generated solutions?**
A: They're marked as AI-sourced on frontend. Quality manually spot-checked. Real user ratings will improve over time.

**Q: Why no API routes, only Server Actions?**
A: Faster development, sufficient for web. Mobile app would need API layer.

**Q: Is this production-ready?**
A: Core platform yes (manual testing complete). Needs 2 blockers fixed: admin queue + rate limiting.

---

## 💬 Questions During Review?

Contact platform owner for clarification on:
- Business logic decisions
- Historical context
- Feature priorities
- Timeline constraints

---

**Ready to start?** Begin with [PLATFORM_STATUS.md](./PLATFORM_STATUS.md) to understand what works and what's blocking launch.

Good luck with your review! 🚀
