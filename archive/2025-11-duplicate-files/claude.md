CLAUDE.md - WWFM Project Overview for AI Assistants

🎯 What is WWFM?
WWFM (What Worked For Me) is a platform that crowdsources solutions to life challenges. Users share what actually worked for them - from reducing anxiety to getting promoted - creating a searchable database of real-world solutions with effectiveness ratings.

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

## 🎯 Single Source of Truth (SSOT) for Category Fields

**CRITICAL**: All category-field mappings MUST align to the authoritative source.

**Code Authority (PRIMARY):**
- **File**: `components/goal/GoalPageClient.tsx`
- **Object**: `CATEGORY_CONFIG` (Lines 56-407)
- **Structure**: Each category defines `keyFields` (3-4 display fields) + `arrayField` (challenges or side_effects)
- **Rule**: This is the RUNTIME source of truth - what actually displays on frontend

**Documentation Reference:**
- **File**: `/docs/solution-fields-ssot.md`
- **Updated**: September 30, 2025
- **Rule**: When code and docs disagree, **CODE WINS**

**Example Structure (from SSOT):**
```typescript
medications: {
  keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],  // 4 display fields
  arrayField: 'side_effects'  // 1 array field (shown as pills)
}

exercise_movement: {
  keyFields: ['time_to_results', 'frequency', 'duration', 'cost'],  // 4 display fields
  arrayField: 'challenges'  // 1 array field (shown as pills)
}
```

**All Systems MUST Align to CATEGORY_CONFIG:**
- ✅ Field generators (`scripts/solution-generator/`, `scripts/generate-validated-fields-v3.ts`)
- ✅ Validators (`scripts/validate-field-quality.ts`, `lib/ai-generation/fields/validator.ts`)
- ✅ Config files (`lib/config/solution-fields.ts` - **UPDATED Oct 31, 2025**)
- ✅ Tests (all test fixtures must use correct field names)
- ✅ Documentation (CLAUDE.md, ARCHITECTURE.md, READMEs)

**Key Points:**
1. **KeyFields vs ArrayField**: Display fields (keyFields) are shown in card body, array fields shown separately as pills
2. **Cost Derivation**: Practice/hobby forms collect `startup_cost` + `ongoing_cost`, but SSOT `keyFields` shows single derived `cost`
3. **Field Count**: Every category has exactly 3-4 keyFields + 1 optional arrayField
4. **Verification**: Always check GoalPageClient.tsx when in doubt - it reflects true runtime behavior

**Recent Alignment (Oct 31, 2025):**
- ✅ `lib/config/solution-fields.ts` updated to match SSOT structure
- ✅ Interface changed from `requiredFields` to `keyFields` + `arrayField`
- ✅ All 23 categories aligned to GoalPageClient.tsx
- ✅ New helper functions: `getKeyFields()`, `getArrayField()`, `getRequiredFields()`

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

## ⚠️ CRITICAL: Running Tests

**BEFORE running ANY tests, you MUST run test setup:**
```bash
npm run test:setup  # Creates 24 test fixtures - REQUIRED!
npm run test:critical  # Then run tests
```

**If you see "Solution [Name] (Test) not found":** You forgot `npm run test:setup`

**Debugging Test Failures:** Read `test-results/failures-summary.md` after running tests (see `/docs/testing/` for guides)

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

🧪 Test Output Capture (CRITICAL FOR AI ASSISTANTS)
**Automatic Complete Output:** ALL test runs automatically save complete results to `test-results/latest.json`
**No Truncation:** Full test output, error messages, and stack traces always captured
**How to Access:**
- Read directly: Use Read tool on `/Users/jackandrews/Desktop/wwfm-platform/test-results/latest.json`
- View in terminal: `npm run test:results` (formatted JSON)
- Quick summary: `npm run test:results:summary` (pass/fail counts)
- HTML report: `npm run test:forms:report` (browsable UI)

**For Claude Code:**
When tests fail or you need complete output, ALWAYS read `test-results/latest.json` instead of relying on truncated terminal output. This file contains the complete test results with full error messages, field mismatches, and diagnostic information.

📝 Key Documentation
README.md: Setup and overview
ARCHITECTURE.md: Design decisions and patterns
/docs/database/schema.md: Complete database structure
/tests/README.md: Testing guide
/docs/forms/: Form specifications
🔌 Supabase Connection

## ⚠️ CRITICAL: Database Usage Guidelines

**PRODUCTION DATABASE (ALWAYS USE THIS):**
- URL: https://wqxkhxdbxdtpuvuvgirx.supabase.co
- Project: wwfm
- Access via: Supabase MCP tools (mcp__supabase__*) or lib/database/client.ts
- This is the LIVE database with real user data
- Use for ALL feature development, queries, and data operations

**LOCAL TEST DATABASE (TESTING INFRASTRUCTURE ONLY):**
- Config: supabase/config.toml (marked as "local-testing-only")
- Port: 54322 (PostgreSQL)
- Purpose: ONLY for testing Supabase CLI and migration infrastructure
- ⚠️ NEVER query this database via psql commands
- ⚠️ NEVER use this for feature development or data exploration
- ⚠️ This database does NOT contain production data

**How to Access Production Data:**
1. ✅ Use Supabase MCP tools: `mcp__supabase__execute_sql`, `mcp__supabase__list_tables`, etc.
2. ✅ Use TypeScript client: `import { supabase } from '@/lib/database/client'`
3. ❌ NEVER use: `psql -h 127.0.0.1 -p 54322` (this is the local test database)

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

## 🔧 Data Quality Architecture (Updated: September 2025)

### Two-Field Approach (Distribution Display Architecture)
WWFM uses two JSONB fields in goal_implementation_links for distribution data:
- **solution_fields**: AI-generated DistributionData (rich 4-8 option distributions)
- **aggregated_fields**: Display-ready DistributionData (human-aggregated OR AI data for frontend)
- **Frontend reads ONLY from aggregated_fields** (no fallback to solution_fields)
- **Both use DistributionData format**: mode, values array, percentages, sources for rich displays

### AI Data Format
AI-generated data stored with explicit markers:
```json
{
  "side_effects": {
    "mode": "Nausea",
    "values": [
      {"value": "Nausea", "count": 40, "percentage": 40, "source": "research"},
      {"value": "Headache", "count": 25, "percentage": 25, "source": "studies"}
    ],
    "totalReports": 100,  // Standardized virtual base for AI data
    "dataSource": "ai_research"
  }
}
```

### ⚠️ CRITICAL: Data Transformation Rules (September 2025)

After a critical data quality failure, these rules are NON-NEGOTIABLE:

#### ✅ CORRECT Approach: Source Label Fixes Only
```typescript
// SAFE - Only fix source labels, preserve ALL data
function fixSourceLabelsOnly(field: DistributionData) {
  return {
    ...field,  // Keep mode, values, percentages unchanged
    values: field.values.map(v => ({
      ...v,  // Keep value, count, percentage
      source: v.source === 'equal_fallback' ? 'research' :
              v.source === 'smart_fallback' ? 'studies' : v.source
    }))
  }
}
```

#### ❌ FORBIDDEN Approach: AI Generation
```typescript
// DANGEROUS - NEVER DO THIS
const prompt = `provide realistic percentage distributions for ${fieldName}...`
const aiResponse = await model.generateContent(prompt)
```

#### Field Preservation Pattern (MANDATORY)
```typescript
// ✅ ALWAYS use this pattern
const updated = { ...existingFields, ...newFields }

// WITH validation
if (Object.keys(updated).length < Object.keys(existing).length) {
  throw new Error('Field loss detected!')
}

// ❌ NEVER do this
const updated = newFields  // Loses existing fields
```

### Key Principles
- **Data variety preservation**: Never collapse rich distributions (5-8 options)
- **Form validation**: All values must match exact dropdown options
- **No AI generation**: Never ask AI to create new distributions
- **Source labels only**: Only change metadata, never actual data
- **Backup first**: Always ensure ai_snapshot is populated before changes
- **Test first**: Single goal validation before broad rollout

### Safe Scripts Reference
- **Recovery**: `scripts/recovery/restore-from-ai-snapshot.ts`
- **Source fixes**: `scripts/safe/fix-source-labels-only.ts`
- **Validation**: Check against `FORM_DROPDOWN_OPTIONS_REFERENCE.md`
- **Archived dangerous**: `scripts/archive/dangerous-transformation-failure-20250924/`

Remember: WWFM helps real people find solutions to life challenges. Every feature should make it easier to discover what works or share what worked for you.

---

## 🔍 External Review (November 2025)

Platform prepared for technical review. **For reviewers:** See [FOR_REVIEWER.md](./FOR_REVIEWER.md) and [PLATFORM_STATUS.md](./PLATFORM_STATUS.md).

## ⚠️ CRITICAL: Field Preservation Pattern (MANDATORY)

### NEVER LOSE FIELDS - Use This Pattern Everywhere

```typescript
// ❌ WRONG - loses fields
function updateSolutionFields(fields: any) {
  const transformedFields = transformData(fields)
  return transformedFields  // DANGER: Lost original fields
}

// ✅ RIGHT - preserves fields
function updateSolutionFields(fields: any) {
  const transformedFields = transformData(fields)
  return { ...fields, ...transformedFields }  // SAFE: Keeps everything
}

// ✅ WITH validation (BEST)
function updateSolutionFields(fields: any) {
  const transformedFields = transformData(fields)
  const updated = { ...fields, ...transformedFields }

  // Validate no field loss
  if (Object.keys(updated).length < Object.keys(fields).length) {
    throw new Error(`Field loss detected: ${Object.keys(fields).length} -> ${Object.keys(updated).length}`)
  }

  return updated
}
```

### Data Requirements (NON-NEGOTIABLE)
ALL solution data MUST reflect AI training data patterns:
- ✅ Medical literature, clinical studies (AI training sources)
- ✅ User research, surveys (AI training sources)
- ✅ Evidence-based distributions from research
- ❌ Equal mathematical splits (mechanistic)
- ❌ Random percentages (not from training data)
- ❌ Smart fallbacks or algorithmic distributions

### Archived Dangerous Scripts - DO NOT USE
- `scripts/archive/dangerous-field-loss-20250924/*` - These scripts cause data loss
- Use `scripts/safe/*` and `scripts/recovery/*` instead

### Safe Script Examples
- `scripts/safe/add-synthesized-fields.ts` - Adds fields with preservation
- `scripts/recovery/recover-from-snapshot.ts` - Recovers without data loss

## 🚨 CRITICAL: Field Generation System Issues (September 2025)

After discovering multiple systematic issues in the field generation system during anxiety goal investigation:

### CORE PRINCIPLE: Regenerate Degraded Data, Not Just Missing Data
The script now identifies and regenerates fields with trash/degraded data quality:

1. **Quality Detection Indicators**:
   - Missing or empty fields
   - <4 distribution options (degraded diversity)
   - Fallback sources (smart_fallback, equal_fallback)
   - Wrong case/format (weekly vs Weekly)
   - Invalid dropdown values
   - Equal percentage distributions (mechanistic data)

2. **Category-Based Regeneration**:
   - Only regenerates fields REQUIRED for each category (per GoalPageClient.tsx)
   - Preserves good quality existing data
   - Uses evidence-based patterns with 5-8 options

### MANDATORY Quality Checks:
1. **Field Names**: Must match GoalPageClient.tsx keyFields exactly
2. **Dropdown Values**: Must match actual form dropdowns exactly
3. **Goal-Specific Filtering**: Always filter by goal_id
4. **Data Quality Assessment**: Check existing data quality before regeneration
5. **Evidence-Based Patterns**: Use research-based distributions (not mechanistic)

### ⚠️ CRITICAL: Category-Specific Field Requirements (SOURCE: GoalPageClient.tsx)
**STOP GENERATING WRONG FIELDS** - Each category has DIFFERENT required fields!

#### SESSION-BASED Categories (need session_frequency + session_length):
- **therapists_counselors**: session_frequency, session_length, cost, time_to_results
- **coaches_mentors**: session_frequency, session_length, cost, time_to_results
- **alternative_practitioners**: session_frequency, session_length, cost, time_to_results

#### MEDICAL Categories (need session_frequency + wait_time, NOT session_length):
- **doctors_specialists**: session_frequency, wait_time, cost, time_to_results
- **medical_procedures**: session_frequency, wait_time, cost, time_to_results
- **crisis_resources**: response_time, cost, time_to_results (NO session fields)

#### PRACTICE Categories:
- **meditation_mindfulness**: practice_length, frequency, time_to_results (NO session_length!)
- **exercise_movement**: frequency, cost, time_to_results (NO session_length, NO practice_length!)
- **habits_routines**: time_commitment, cost, time_to_results (NO session fields!)

#### DOSAGE Categories (need frequency + length_of_use):
- **medications**: frequency, length_of_use, cost, time_to_results, side_effects
- **supplements_vitamins**: frequency, length_of_use, cost, time_to_results, side_effects
- **natural_remedies**: frequency, length_of_use, cost, time_to_results, side_effects
- **beauty_skincare**: skincare_frequency (NOT frequency!), length_of_use, cost, time_to_results, side_effects

#### OTHER Categories:
- **books_courses**: format, learning_difficulty, cost, time_to_results (NO session fields!)
- **apps_software**: usage_frequency, subscription_type, cost, time_to_results
- **diet_nutrition**: weekly_prep_time, still_following, cost, time_to_results
- **sleep**: previous_sleep_hours, still_following, cost, time_to_results
- **products_devices**: ease_of_use, product_type, cost, time_to_results
- **hobbies_activities**: time_commitment, frequency, cost, time_to_results
- **groups_communities**: meeting_frequency, group_size, cost, time_to_results
- **financial_products**: financial_benefit, access_time, cost, time_to_results

### Quality Assessment Pattern (MANDATORY):
```typescript
// 1. FIRST CHECK IF FIELD IS REQUIRED FOR THIS CATEGORY
function shouldFieldExistForCategory(fieldName: string, category: string): boolean {
  const categoryConfig = CATEGORY_CONFIG[category]; // from GoalPageClient.tsx
  if (!categoryConfig) return false;
  return categoryConfig.keyFields.includes(fieldName);
}

// 2. Check data quality ONLY for required fields
function needsFieldRegeneration(fieldData: any, fieldName: string, category: string): boolean {
  // DON'T regenerate fields that shouldn't exist for this category!
  if (!shouldFieldExistForCategory(fieldName, category)) return false;

  // Missing or empty
  if (!fieldData || Object.keys(fieldData).length === 0) return true;

  // String fields need to be converted to DistributionData format
  if (typeof fieldData === 'string') return true;

  // Single value at 100% looks weird
  if (fieldData.values?.length === 1) return true;

  // Too few options (degraded quality)
  if (fieldData.values?.length < 4) return true;

  // Fallback sources (trash data)
  if (fieldData.values?.some(v => v.source?.includes('fallback'))) return true;

  // Wrong case/format
  if (fieldName === 'session_frequency' &&
      fieldData.values?.some(v => v.value === 'weekly')) return true;

  // Invalid dropdown values
  if (!validateDropdownValues(fieldName, fieldData.values)) return true;

  return false;
}

// 3. Only regenerate category-required fields
const requiredFields = CATEGORY_CONFIGS[category].keyFields;
const fieldsToRegenerate = requiredFields.filter(field =>
  needsFieldRegeneration(existingFields[field], field, category) // Pass category!
);
```

### Quality Standards After Regeneration:
- **5+ Options**: All regenerated fields have 5-8 distribution options
- **Research Sources**: All sources are "research" or "studies" (not fallback)
- **Valid Dropdown Values**: All values work in actual form dropdowns
- **Evidence-Based Distributions**: Realistic percentages from research patterns

### Reference Documents:
- **`docs/solution-fields-ssot.md`** - AUTHORITATIVE category-field mapping (prevents wrong field generation)
- `FORM_DROPDOWN_OPTIONS_REFERENCE.md` - Exact dropdown value formats
- `HANDOVER.md` - Current task status and execution instructions

### 🚨 Generation System Issues (UPDATED October 2025)

**✅ RESOLVED**: The "line 905 bug" mentioned in September 2025 was a **FALSE ALARM**. This bug only existed in archived scripts (`scripts/archive/obsolete-field-scripts-20250927/`), **NOT in active code**. The current generator does NOT skip time_to_results.

**Actual Root Causes Identified** (Deep-dive analysis Oct 31, 2025):
1. **Over-aggressive deduplication** - Collapses "Daily" + "once daily" into single value, losing diversity
2. **Fallback diversity injection** - Adds mechanistic templates (40/30/20/10) when AI generates 2-3 valid values
3. **No field preservation validation** - Updates can lose existing fields (violates "never lose fields" principle)
4. **Vague prompt instructions** - AI never explicitly told to avoid single-value 100% distributions
5. **SSOT misalignment** (CRITICAL) - lib/config/solution-fields.ts used wrong field structure until Oct 31, 2025

**✅ FIXED October 31, 2025**:
- SSOT alignment complete - all configs now match GoalPageClient.tsx CATEGORY_CONFIG
- V2 regenerator deprecated and archived
- Interface updated to use keyFields + arrayField structure

**Remaining Issues** (Future work):
- Deduplication logic needs category-awareness
- Fallback diversity should only activate for <2 values (not <4)
- Prompts need explicit "no single-value distributions" prohibition

### CRITICAL REMINDER: Frontend Data Source
⚠️ **Frontend reads ONLY from `aggregated_fields`** - Never from `solution_fields`
- All quality scripts MUST check `aggregated_fields` for data quality assessment
- All regeneration scripts MUST write to `aggregated_fields` for frontend display
- Emergency data copy: Use `scripts/copy-solution-to-aggregated-fields.ts`

### CRITICAL REMINDER: Category-Specific Fields
⚠️ **Different categories need DIFFERENT fields** - See **[Solution Fields SSOT](docs/solution-fields-ssot.md)**

**Quick examples:**
- exercise_movement: `time_to_results`, `frequency`, `duration`, `cost` (NO session_length!)
- books_courses: `time_to_results`, `format`, `learning_difficulty`, `cost` (NO session_length!)
- therapists_counselors: `time_to_results`, `session_frequency`, `session_length`, `cost`

**Rule:** STOP generating universal field sets! Each category has specific keyFields defined in SSOT.

**Authority:** components/goal/GoalPageClient.tsx CATEGORY_CONFIG for all 23 categories

---

## 📚 Documentation Map

**For AI Assistants (Start Here):**
- [Solution Fields SSOT](docs/solution-fields-ssot.md) - Category-field mappings (authority: GoalPageClient.tsx)
- [Dropdown Options Reference](FORM_DROPDOWN_OPTIONS_REFERENCE.md) - Exact dropdown values
- This file (CLAUDE.md) - Quality standards, configuration, database setup, common issues

**For Developers:**
- [README.md](README.md) - Project overview and quick start
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design, forms, patterns
- [Testing Guide](tests/README.md) - Complete test setup

**For Complete Navigation:**
- [Documentation Hub](docs/README.md) - All documentation indexed with quick navigation table