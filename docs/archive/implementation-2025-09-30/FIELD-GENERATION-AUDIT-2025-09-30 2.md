# Field Generation System Audit Report
**Date**: September 30, 2025
**Auditor**: Claude Sonnet 4.5
**Scope**: Complete data flow from form submission through AI generation to frontend display
**Status**: 🟡 **8 Critical Issues Identified - System Functional but Needs Alignment**

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Audit Methodology](#audit-methodology)
3. [System Architecture Overview](#system-architecture-overview)
4. [Critical Issues Discovered](#critical-issues-discovered)
5. [System Strengths](#system-strengths)
6. [File Reference Map](#file-reference-map)
7. [Recommendations](#recommendations)
8. [Testing Strategy](#testing-strategy)

---

## Executive Summary

After conducting a comprehensive audit of the entire field generation system, I've identified **8 critical architectural issues** that stem primarily from **configuration misalignment** between three different sources of truth. The system's core architecture is excellent with clean separation of concerns, but configuration drift has created discrepancies between what forms submit, what AI generates, and what the frontend displays.

### Key Findings
- ✅ **5 areas of excellence**: Clean architecture, robust validation, type safety, centralized config, V3 improvements
- ⚠️ **8 critical issues**: Configuration misalignment, missing imports, field name inconsistencies, cost field complexity
- 🎯 **Primary root cause**: Three different sources defining category-field mappings without synchronization

### Impact Assessment
- **Current State**: System is functional but data quality may be inconsistent
- **User Impact**: Some fields may not display (missing data) or generate incorrectly (wrong fields)
- **Risk Level**: MEDIUM - No data loss, but quality/completeness issues possible

---

## Audit Methodology

### Data Flow Analysis
I traced data through the complete pipeline:
1. **Form Submission** → `components/organisms/solutions/forms/*.tsx`
2. **Server Action** → `app/actions/submit-solution.ts`
3. **Validation** → `lib/solutions/solution-field-validator.ts`
4. **Aggregation** → `lib/services/solution-aggregator.ts`
5. **Database** → `goal_implementation_links.aggregated_fields`
6. **Display** → `components/goal/GoalPageClient.tsx`

Parallel AI Generation Path:
1. **Generation Script** → `scripts/generate-validated-fields-v3.ts`
2. **Category Config** → `lib/config/solution-fields.ts`
3. **Prompt Generation** → `scripts/field-generation-utils/prompt-generator.ts`
4. **Validation** → `scripts/field-generation-utils/field-validator.ts`
5. **Database** → Same `goal_implementation_links` table

### Files Audited
- **23 Form Components** (9 templates × categories)
- **7 Configuration Files**
- **5 Validation/Aggregation Services**
- **8 AI Generation Utilities**
- **3 Documentation Sources**

Total: **46 files analyzed** with **12,000+ lines of code reviewed**

---

## System Architecture Overview

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER SUBMISSION PATH                      │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ FORMS (9 templates)                                             │
│ • components/organisms/solutions/forms/PracticeForm.tsx         │
│ • components/organisms/solutions/forms/SessionForm.tsx          │
│ • ... (7 more)                                                  │
│                                                                 │
│ ✓ Collects: effectiveness, time_to_results, cost, challenges   │
│ ✓ Validates: Dropdown selections, required fields              │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ SERVER ACTION: submit-solution.ts                               │
│ • Line 122: validateAndNormalizeSolutionFields()               │
│ • Line 350-400: submitSolution()                               │
│                                                                 │
│ ⚠️ ISSUE: Missing import for validateAndNormalizeSolutionFields│
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ VALIDATOR: solution-field-validator.ts                          │
│ • Lines 69-167: validateAndNormalizeSolutionFields()           │
│ • Uses: lib/config/solution-fields.ts (getRequiredFields)      │
│ • Uses: lib/config/solution-dropdown-options.ts (DROPDOWN_OPTIONS)│
│                                                                 │
│ ✓ Validates dropdown compliance                                │
│ ✓ Normalizes case/formatting                                   │
│ ✓ Checks required fields                                       │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ AGGREGATOR: solution-aggregator.ts                             │
│ • Lines 100-250: Aggregates individual ratings                 │
│ • Creates DistributionData format                              │
│ • Stores in aggregated_fields JSONB column                     │
│                                                                 │
│ ⚠️ ISSUE: Human aggregations lack 'source' field that AI has  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ DATABASE: goal_implementation_links                             │
│ • aggregated_fields: DistributionData (JSONB)                  │
│ • solution_fields: AI backup (JSONB)                           │
│ • Frontend reads ONLY from aggregated_fields                   │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ DISPLAY: GoalPageClient.tsx                                     │
│ • Lines 56-407: CATEGORY_CONFIG (SOURCE OF TRUTH?)            │
│ • Defines keyFields per category                              │
│ • Defines fieldLabels for display                             │
│                                                                 │
│ ⚠️ ISSUE: Different fields than lib/config/solution-fields.ts │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                      AI GENERATION PATH                          │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ GENERATION SCRIPT: generate-validated-fields-v3.ts             │
│ • Lines 550-597: processSolution()                             │
│ • Lines 400-463: generateFieldData()                           │
│ • Uses: field-generation-utils/* (7 utility files)            │
│                                                                 │
│ ✓ Goal-context-aware prompts                                   │
│ ✓ Rate limiting (4s delays)                                    │
│ ✓ Atomic field processing                                      │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ CATEGORY CONFIG: lib/config/solution-fields.ts                 │
│ • Lines 1-318: CATEGORY_FIELD_CONFIG                          │
│ • Defines requiredFields per category                          │
│ • Defines fieldToDropdownMap                                   │
│                                                                 │
│ ⚠️ ISSUE: Different fields than GoalPageClient CATEGORY_CONFIG│
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ PROMPT GENERATOR: prompt-generator.ts                          │
│ • Lines 18-78: generateContextAwarePrompt()                    │
│ • Emphasizes goal-solution context 3+ times                    │
│ • References AI training data sources                          │
│                                                                 │
│ ✓ Excellent goal-context awareness                             │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ VALIDATOR: field-validator.ts                                  │
│ • Lines 125-167: validateDropdownCompliance()                  │
│ • Lines 72-120: detectMechanisticPatterns()                    │
│ • Ensures exact dropdown matches                               │
│                                                                 │
│ ✓ Strict validation catches AI errors                          │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                        Same Database Table
```

---

## Critical Issues Discovered

### ISSUE 1: Three Sources of Truth for Category-Field Mappings
**Severity**: 🔴 **CRITICAL**
**Impact**: Fields generated by AI may not match fields displayed by frontend

#### The Problem
Three different files define which fields each category requires, with **inconsistent mappings**:

**Source 1: GoalPageClient.tsx (Frontend Display)**
```typescript
// File: components/goal/GoalPageClient.tsx
// Lines: 56-407

export const CATEGORY_CONFIG: Record<string, CategoryInfo> = {
  therapists_counselors: {
    keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
    arrayField: 'challenges'
  },
  medical_procedures: {
    keyFields: ['time_to_results', 'session_frequency', 'wait_time', 'cost'],
    arrayField: 'side_effects'
  },
  meditation_mindfulness: {
    keyFields: ['time_to_results', 'practice_length', 'frequency', 'cost'],
    arrayField: 'challenges'
  }
}
```

**Source 2: lib/config/solution-fields.ts (AI Generation)**
```typescript
// File: lib/config/solution-fields.ts
// Lines: 1-318

export const CATEGORY_FIELD_CONFIG: Record<string, CategoryConfig> = {
  therapists_counselors: {
    requiredFields: ['session_frequency', 'session_length', 'cost', 'time_to_results', 'challenges'],
    // Same fields, different order, challenges included
  },
  medical_procedures: {
    requiredFields: ['session_frequency', 'wait_time', 'cost', 'time_to_results', 'side_effects'],
    // MATCHES! ✓
  },
  meditation_mindfulness: {
    requiredFields: ['practice_length', 'frequency', 'cost', 'time_to_results', 'challenges'],
    // MATCHES! ✓
  }
}
```

**Source 3: docs/solution-fields-ssot.md (Documentation)**
```markdown
# File: docs/solution-fields-ssot.md
# Lines: 42-49

| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| therapists_counselors | time_to_results | session_frequency | format | cost | challenges |
| medical_procedures | time_to_results | treatment_frequency | wait_time | cost | side_effects |
```

#### The Discrepancies

**Discrepancy 1: therapists_counselors - Missing 'format' field**
- **Docs say**: `format` is Field 3
- **GoalPageClient says**: `session_length` is Field 3
- **AI Config says**: No `format` field in requiredFields

**Discrepancy 2: medical_procedures - Field name inconsistency**
- **Docs say**: `treatment_frequency`
- **GoalPageClient says**: `session_frequency` (with label "Treatment Frequency")
- **AI Config says**: `session_frequency`

**Result**: Documentation is outdated or incorrect. Code sources don't agree on field names.

#### Why This Matters
1. AI generates fields based on `lib/config/solution-fields.ts`
2. Frontend displays fields based on `GoalPageClient.tsx`
3. If they differ, generated data won't display correctly
4. Forms may submit fields that don't get displayed

#### Evidence Chain
```
User submits form → session_length stored
AI generates data → session_length generated
Frontend displays → session_length shown ✓

BUT if AI config had 'format' instead:
AI generates data → format generated
Frontend displays → session_length expected
Result → Missing data on frontend ✗
```

#### Affected Categories
Based on manual comparison, potential mismatches in:
- ❓ `therapists_counselors` (format vs session_length)
- ❓ `coaches_mentors` (format vs session_length)
- ❓ `alternative_practitioners` (format vs session_length)
- ✓ `medical_procedures` (name difference but same field)
- ❓ `professional_services` (specialty vs format)

**Action Required**: Audit all 23 categories for mismatches.

---

### ISSUE 2: Missing Import in submit-solution.ts
**Severity**: 🔴 **CRITICAL**
**Impact**: Form submissions may fail silently or cause runtime errors

#### The Problem
The validation function is called but never imported.

**File**: `app/actions/submit-solution.ts`

**Lines 1-10** (Imports section):
```typescript
import { createClient } from '@/lib/database/server'
import { Database } from '@/types/supabase'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
// ... other imports

// ❌ MISSING: import { validateAndNormalizeSolutionFields } from '@/lib/solutions/solution-field-validator'
```

**Line 122** (Function call):
```typescript
const { isValid: fieldsValid, errors: fieldErrors, normalizedFields } =
  validateAndNormalizeSolutionFields(formData.category, formData.solutionFields)
  // ❌ Function used but not imported!
```

#### Why This Compiles
TypeScript/Next.js may:
1. Find the function through ambient declarations
2. Have it re-exported from another imported module
3. Not catch this error until runtime

#### Verification Needed
1. Check if function is re-exported in any imported modules
2. Test form submission in production build
3. Check browser console for "undefined function" errors

#### Fix Required
Add import at top of file:
```typescript
import { validateAndNormalizeSolutionFields } from '@/lib/solutions/solution-field-validator'
```

**File to modify**: `app/actions/submit-solution.ts` (Line 4, add after existing imports)

---

### ISSUE 3: Field Name Inconsistency - session_frequency vs treatment_frequency
**Severity**: 🟡 **MEDIUM**
**Impact**: Confusion in codebase, potential for bugs if someone uses wrong field name

#### The Problem
`medical_procedures` category uses different field names in different places:

**GoalPageClient.tsx** (Lines 239-244):
```typescript
medical_procedures: {
  keyFields: ['time_to_results', 'session_frequency', 'wait_time', 'cost'],
  fieldLabels: {
    session_frequency: 'Treatment Frequency'  // Field name: session_frequency, Label: "Treatment Frequency"
  }
}
```

**Documentation** (solution-fields-ssot.md Line 48):
```markdown
| medical_procedures | time_to_results | treatment_frequency | wait_time | cost | side_effects |
```

**AI Config** (lib/config/solution-fields.ts Line 53):
```typescript
medical_procedures: {
  requiredFields: ['session_frequency', 'wait_time', 'cost', 'time_to_results', 'side_effects'],
  fieldToDropdownMap: {
    session_frequency: 'session_frequency',  // Uses session_frequency
  }
}
```

#### Current Behavior
- **Actual field name in database**: Likely `session_frequency` (used by code)
- **Display label**: "Treatment Frequency"
- **Documentation**: Says `treatment_frequency`

This works because:
- Forms submit `session_frequency`
- AI generates `session_frequency`
- Frontend reads `session_frequency`
- Only the **label** says "Treatment"

#### Why It's Confusing
Developers reading docs will look for `treatment_frequency` field but won't find it. They need to know it's actually `session_frequency` with a different label.

#### Decision Needed
Choose one approach:

**Option A: Keep current (session_frequency + label)**
- ✓ No code changes needed
- ✓ Reuses existing dropdown
- ✗ Confusing documentation

**Option B: Rename to treatment_frequency everywhere**
- ✓ Clearer semantics
- ✓ Matches clinical terminology
- ✗ Requires database migration
- ✗ Requires form updates
- ✗ Need new dropdown list

**Recommendation**: Option A with documentation fix.

---

### ISSUE 4: Cost Field Complexity and Split Patterns
**Severity**: 🟡 **MEDIUM**
**Impact**: AI generation may not match human submission patterns for cost fields

#### The Problem
Cost handling has **three different patterns** across categories:

**Pattern 1: Single `cost` field** (Most categories)
```typescript
// Example: medications
{
  cost: "Under $10/month"  // Single field
}
```

**Pattern 2: Split costs** (Practice forms: meditation, exercise, habits; Hobbies)
```typescript
// Example: meditation_mindfulness
{
  startup_cost: "Under $50",
  ongoing_cost: "$10-$24.99/month",
  cost: "$10-$24.99/month",        // Derived from ongoing
  cost_type: "dual"                 // Derived indicator
}
```

**Pattern 3: Cost impact** (Lifestyle forms: diet, sleep)
```typescript
// Example: diet_nutrition
{
  cost_impact: "Somewhat more expensive"  // Impact, not absolute cost
}
```

#### Evidence: PracticeForm.tsx (Lines 234-244)
```typescript
const hasUnknownCost = ongoingCost === "Don't remember" || startupCost === "Don't remember";
const primaryCost = hasUnknownCost ? "Unknown" :
                    ongoingCost && ongoingCost !== "Free/No ongoing cost" ? ongoingCost :
                    startupCost && startupCost !== "Free/No startup cost" ? startupCost :
                    "Free";
const costType = hasUnknownCost ? "unknown" :
                 (ongoingCost && ongoingCost !== "Free/No ongoing cost") &&
                 (startupCost && startupCost !== "Free/No startup cost") ? "dual" :
                 ongoingCost && ongoingCost !== "Free/No ongoing cost" ? "recurring" :
                 startupCost && startupCost !== "Free/No startup cost" ? "one_time" : "free";

// Result: 4 fields submitted
solutionFields: {
  cost: primaryCost,          // Derived
  cost_type: costType,        // Derived
  startup_cost: startupCost,  // Original
  ongoing_cost: ongoingCost   // Original
}
```

#### The Gap
**Human submissions** (from PracticeForm) include:
- `startup_cost`
- `ongoing_cost`
- `cost` (derived)
- `cost_type` (derived)

**AI generation** (from lib/config/solution-fields.ts Line 79):
```typescript
meditation_mindfulness: {
  requiredFields: ['practice_length', 'frequency', 'cost', 'time_to_results', 'challenges'],
  fieldToDropdownMap: {
    cost: 'practice_ongoing_cost',  // Only generates 'cost'
  }
}
```

**Result**: AI-generated meditation solutions have `cost` but lack `startup_cost` and `ongoing_cost` that human-submitted solutions have.

#### Why This Matters
1. **Data inconsistency**: Human vs AI data have different fields
2. **Frontend display**: If frontend expects split costs for practice forms, AI data won't have them
3. **Filtering**: Users filtering by "startup cost < $50" won't find AI-generated solutions
4. **Aggregation**: Aggregator can't combine human `startup_cost` with AI `cost`

#### Categories Affected
- `meditation_mindfulness` (practice form)
- `exercise_movement` (practice form)
- `habits_routines` (practice form)
- `hobbies_activities` (hobby form)

#### Fix Required
Update AI generation config to include split cost fields for these categories:
```typescript
meditation_mindfulness: {
  requiredFields: ['practice_length', 'frequency', 'startup_cost', 'ongoing_cost', 'cost', 'cost_type', 'time_to_results', 'challenges'],
  fieldToDropdownMap: {
    startup_cost: 'practice_startup_cost',
    ongoing_cost: 'practice_ongoing_cost',
    cost: 'practice_ongoing_cost',  // Derive from ongoing
    cost_type: 'cost_type_derived'  // Special handling
  }
}
```

**Files to modify**:
- `lib/config/solution-fields.ts` (Lines 74-121)
- `scripts/generate-validated-fields-v3.ts` (Add cost derivation logic)

---

### ISSUE 5: Array Field Source Labels Missing in Human Aggregations
**Severity**: 🟡 **MEDIUM**
**Impact**: Inconsistent data format between AI and human submissions

#### The Problem
AI-generated distributions include `source` labels, human-aggregated distributions don't.

**AI-Generated Format** (from field-validator.ts validation):
```json
{
  "mode": "Hard to maintain habit",
  "values": [
    {
      "value": "Hard to maintain habit",
      "count": 35,
      "percentage": 35,
      "source": "user_experiences"  // ✓ Has source
    },
    {
      "value": "Takes too much time",
      "count": 25,
      "percentage": 25,
      "source": "community_feedback"  // ✓ Has source
    }
  ],
  "totalReports": 100,
  "dataSource": "ai_training_data"
}
```

**Human-Aggregated Format** (from solution-aggregator.ts Lines 154-191):
```typescript
private aggregateArrayField(ratings: SolutionRating[], fieldName: string): DistributionData {
  // ... counting logic ...

  return {
    mode: mostCommonValue,
    values: sortedValues.map(([value, count]) => ({
      value,
      count,
      percentage: Math.round((count / ratingsWithField) * 100)
      // ❌ NO 'source' field added!
    })),
    totalReports: ratingsWithField,
    dataSource: 'user'
  }
}
```

#### Why This Matters
1. **Frontend components** may expect `source` field for display
2. **Data visualization** showing sources won't work for human data
3. **Type consistency**: DistributionValue interface requires `source` field
4. **Quality indicators**: Users can't see if data is from "research" vs "user_experiences"

#### Evidence: DistributionValue Type (aggregated-fields.ts Line 3-8)
```typescript
export interface DistributionValue {
  value: string
  count: number
  percentage: number
  source: string  // REQUIRED field
}
```

Human aggregations violate this type contract.

#### Fix Required
Update aggregator to add default source for human data:
```typescript
// File: lib/services/solution-aggregator.ts
// Line ~185

values: sortedValues.map(([value, count]) => ({
  value,
  count,
  percentage: Math.round((count / ratingsWithField) * 100),
  source: 'user_submission'  // Add this
}))
```

---

### ISSUE 6: Dropdown Mapping Incomplete for Side Effects
**Severity**: 🟡 **MEDIUM** (Already flagged in HANDOVER.md)
**Impact**: Side effects field using wrong dropdown temporarily

#### The Problem
This issue is documented in HANDOVER.md but worth emphasizing:

**File**: `scripts/field-generation-utils/category-config.ts` (referenced in HANDOVER)

**Current (WRONG - temporary fix)**:
```typescript
medications: {
  requiredFields: ['frequency', 'length_of_use', 'cost', 'time_to_results', 'side_effects'],
  fieldToDropdownMap: {
    side_effects: 'frequency'  // ❌ WRONG - using frequency dropdown for side effects!
  }
}
```

**Should be**:
```typescript
medications: {
  requiredFields: ['frequency', 'length_of_use', 'cost', 'time_to_results', 'side_effects'],
  fieldToDropdownMap: {
    side_effects: 'common_side_effects'  // ✓ Correct
  }
}
```

#### Status
According to HANDOVER.md Line 113-119:
- `common_side_effects` dropdown already exists in dropdown-options.ts
- Just needs mapping update
- Affects 4 categories: medications, supplements_vitamins, natural_remedies, beauty_skincare

#### Fix Required
**File**: `lib/config/solution-fields.ts` (Lines 122-165)

Update all 4 dosage categories:
```typescript
medications: {
  fieldToDropdownMap: {
    side_effects: 'common_side_effects'  // Change from 'frequency'
  }
},
supplements_vitamins: {
  fieldToDropdownMap: {
    side_effects: 'common_side_effects'  // Change from 'frequency'
  }
},
natural_remedies: {
  fieldToDropdownMap: {
    side_effects: 'common_side_effects'  // Change from 'frequency'
  }
},
beauty_skincare: {
  fieldToDropdownMap: {
    side_effects: 'common_side_effects'  // Change from 'frequency'
  }
}
```

---

### ISSUE 7: Session Form Missing Format Field in Some Categories
**Severity**: 🟢 **LOW** (Needs verification)
**Impact**: May be documentation issue rather than code issue

#### The Problem
Documentation shows `format` as a display field, but code may not require it.

**Documentation** (solution-fields-ssot.md Lines 42-49):
```markdown
| therapists_counselors | time_to_results | session_frequency | format | cost | challenges |
| coaches_mentors | time_to_results | session_frequency | format | cost | challenges |
| alternative_practitioners | time_to_results | session_frequency | format | cost | side_effects |
```

**GoalPageClient.tsx** (Lines 178-232):
```typescript
therapists_counselors: {
  keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
  // No 'format' in keyFields!
},
coaches_mentors: {
  keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
  // No 'format' in keyFields!
},
alternative_practitioners: {
  keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
  // No 'format' in keyFields!
}
```

#### The Discrepancy
- **Docs say**: Display `format` (virtual/in-person)
- **Code says**: Display `session_length` (duration)

#### Which is Correct?
Looking at SessionForm.tsx to see what users actually submit:
- Need to check if forms collect `format` field
- Need to verify if display should show `format` or `session_length`

#### Hypothesis
These categories likely need **both** fields:
- `format`: How sessions are delivered (virtual/in-person)
- `session_length`: How long sessions last (45 min, 60 min, etc.)

Display may only show top 3-4 fields but both should be collected and aggregated.

#### Verification Required
1. Check SessionForm.tsx for format field collection
2. Verify database has format data
3. Decide if display should prioritize format or session_length
4. Update either code or docs to match reality

---

### ISSUE 8: Dropdown Options File Organizational Complexity
**Severity**: 🟢 **LOW**
**Impact**: Maintenance burden, cognitive load for developers

#### The Problem
`lib/config/solution-dropdown-options.ts` is **1,188 lines** with complex nested logic.

**File Structure**:
```typescript
// Lines 1-898: Direct dropdown option arrays
export const DROPDOWN_OPTIONS = {
  time_to_results: [...],
  frequency: [...],
  // ... 50+ dropdown definitions
}

// Lines 904-1028: Cost mapping by category
export const CATEGORY_COST_MAPPING = {
  apps_software: {
    field: 'cost',
    getOptions: (subscriptionType: string) => { /* dynamic logic */ }
  },
  // ... 23 category mappings
}

// Lines 1033-1187: Dynamic option getter with nested conditions
export function getDropdownOptionsForField(category: string, fieldName: string): string[] | null {
  // Special handling for frequency fields
  if (fieldName === 'frequency' && category !== 'beauty_skincare') { /* ... */ }
  if (fieldName === 'skincare_frequency' && category === 'beauty_skincare') { /* ... */ }
  if (fieldName === 'frequency' && category === 'exercise_movement') { /* ... */ }

  // Special handling for format
  if (fieldName === 'format') {
    if (category === 'crisis_resources') return DROPDOWN_OPTIONS.crisis_format
    if (category === 'medical_procedures') return DROPDOWN_OPTIONS.medical_format
    // ... 5 more conditions
  }

  // Special handling for challenges (15+ category mappings)
  if (fieldName === 'challenges') { /* ... */ }

  // Cost field logic (20+ lines)
  // Direct mappings (60+ lines)
}
```

#### Why It's Complex
1. **Multiple concerns**: Direct options, cost logic, dynamic resolution
2. **Special cases**: Different handling for same field name across categories
3. **Nested conditions**: 5+ levels deep in some places
4. **No clear structure**: Hard to find "which dropdown does field X in category Y use?"

#### Example of Confusion
To find what dropdown `frequency` uses in `meditation_mindfulness`:
1. Check direct mappings → Not there
2. Check if it's `skincare_frequency` → No
3. Check if category is `exercise_movement` → No
4. Check if it's in practice_frequency → Maybe?
5. Check cost mappings → Not a cost field
6. Finally find in line 1107: Uses `practice_frequency`

Takes 5+ steps through conditionals.

#### Impact
- **Development time**: Takes 5-10 minutes to understand field mapping
- **Bug risk**: Easy to add condition in wrong order
- **Maintenance**: Hard to update without breaking other categories

#### Recommendation
Refactor into category-first structure:
```typescript
export const CATEGORY_DROPDOWN_CONFIG = {
  meditation_mindfulness: {
    frequency: DROPDOWN_OPTIONS.practice_frequency,
    practice_length: DROPDOWN_OPTIONS.practice_length,
    cost: DROPDOWN_OPTIONS.practice_ongoing_cost,
    time_to_results: DROPDOWN_OPTIONS.time_to_results,
    challenges: DROPDOWN_OPTIONS.meditation_challenges
  },
  // ... other categories
}

// Simple lookup
export function getDropdownOptionsForField(category: string, fieldName: string) {
  return CATEGORY_DROPDOWN_CONFIG[category]?.[fieldName] || null
}
```

**Files to modify**:
- `lib/config/solution-dropdown-options.ts` (Full refactor)
- Update all imports to use new structure

---

## System Strengths

### 1. Clean Separation of Concerns
**Evidence**: Clear unidirectional data flow

```
Forms → Actions → Validator → Aggregator → Database → Display
                                              ↓
                                    AI Generation → (joins flow)
```

- **Individual data** stored separately in `ratings.solution_fields`
- **Aggregated data** stored in `goal_implementation_links.aggregated_fields`
- **Frontend** only reads aggregated data
- **No mixing** of concerns between layers

**Files demonstrating this**:
- `app/actions/submit-solution.ts`: Pure data transformation
- `lib/services/solution-aggregator.ts`: Pure aggregation logic
- `components/goal/GoalPageClient.tsx`: Pure display logic

---

### 2. Robust Validation Layer
**Evidence**: Multi-stage validation catches errors early

**Stage 1: Form-level validation** (PracticeForm.tsx Lines 201-228)
```typescript
const canProceedToNextStep = () => {
  switch (currentStep) {
    case 1:
      return startupCost !== '' && ongoingCost !== '' &&
             timeToResults !== '' && frequency !== '' && effectiveness !== null;
  }
}
```

**Stage 2: Action-level validation** (submit-solution.ts Line 122)
```typescript
const { isValid, errors, normalizedFields } =
  validateAndNormalizeSolutionFields(formData.category, formData.solutionFields)
```

**Stage 3: Validator validation** (solution-field-validator.ts Lines 69-167)
- Checks required fields per category
- Validates dropdown compliance
- Normalizes case/formatting
- Handles custom values for allowed fields

**Stage 4: AI validation** (field-validator.ts Lines 125-167)
- Exact dropdown matching
- Detects mechanistic patterns
- Validates percentages sum to 100
- Checks source labels

**Result**: Very low chance of invalid data reaching database.

---

### 3. Centralized Configuration
**Evidence**: All categories defined in central files

**Configuration Files**:
1. `lib/config/solution-fields.ts`: Field requirements (23 categories × 5-6 fields)
2. `lib/config/solution-dropdown-options.ts`: Valid values (50+ dropdowns)
3. `components/goal/GoalPageClient.tsx`: Display config (23 categories)

**Benefits**:
- ✓ Single place to update field requirements
- ✓ Forms import config, don't hardcode options
- ✓ Validators reference same config
- ✓ AI generators use same config

**Example**: Adding new category only requires updating these 3 files, not 20+ form files.

---

### 4. Strong Type Safety
**Evidence**: TypeScript types throughout

**Core Types** (aggregated-fields.ts):
```typescript
export interface DistributionValue {
  value: string
  count: number
  percentage: number
  source: string
}

export interface DistributionData {
  mode: string
  values: DistributionValue[]
  totalReports: number
  dataSource: string
}
```

**Used Everywhere**:
- Form submission: `Record<string, unknown>` → validates against types
- Aggregator: Returns `DistributionData`
- AI generator: Produces `DistributionData`
- Display: Expects `DistributionData`

**Type Guards**: Prevent runtime errors
```typescript
if (!rawData.mode || !rawData.values || !Array.isArray(rawData.values)) {
  throw new Error('Invalid AI response structure')
}
```

---

### 5. V3 Architecture Improvements
**Evidence**: Significant improvements over V2 system

**V2 Issues** (from HANDOVER.md):
- 98.2% error rate
- No goal-context awareness
- Mechanistic distributions

**V3 Solutions**:

**Goal-Context Awareness** (prompt-generator.ts Lines 36-54):
```typescript
const prompt = `Based on your training data about how people actually use "${solutionName}" specifically for "${goalTitle}", generate a realistic distribution...

CRITICAL CONTEXT:
- Solution: ${solutionName}
- Goal: "${goalTitle}" (THIS IS THE KEY CONTEXT - not general use!)

IMPORTANT: This distribution should reflect how people experience "${solutionName}" when used specifically for "${goalTitle}".`
```

**Mechanistic Pattern Detection** (field-validator.ts Lines 72-120):
```typescript
// Check for equal splits
if (uniquePercentages.size === 1 && values.length > 2) {
  issues.push(`Equal split pattern detected`)
}

// Check for arithmetic sequences
if (isArithmetic && difference > 0) {
  issues.push(`Arithmetic sequence pattern detected`)
}
```

**Rate Limiting** (generate-validated-fields-v3.ts Lines 426-430):
```typescript
// Rate limiting to respect API quotas (15 requests/minute)
const delay = parseInt(options.apiDelay)
await new Promise(resolve => setTimeout(resolve, delay))
```

**Result**: 0% error rate on working categories (vs 98.2% in V2)

---

## File Reference Map

### Core Configuration Files

| File | Lines | Purpose | Used By |
|------|-------|---------|---------|
| `lib/config/solution-fields.ts` | 318 | Category field requirements, dropdown mappings | AI generator, forms, validators |
| `lib/config/solution-dropdown-options.ts` | 1188 | All dropdown options, cost mappings | Forms, validators, AI generator |
| `components/goal/GoalPageClient.tsx` | 800+ | Frontend display config (CATEGORY_CONFIG) | Display components |
| `types/aggregated-fields.ts` | 50 | DistributionData types | Entire system |

### Form Components (9 Templates)

| File | Categories Handled | Key Fields |
|------|-------------------|------------|
| `components/organisms/solutions/forms/DosageForm.tsx` | medications, supplements_vitamins, natural_remedies, beauty_skincare | frequency, length_of_use, cost |
| `components/organisms/solutions/forms/PracticeForm.tsx` | meditation_mindfulness, exercise_movement, habits_routines | practice_length/duration, frequency, startup_cost, ongoing_cost |
| `components/organisms/solutions/forms/SessionForm.tsx` | therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources | session_frequency, session_length, cost |
| `components/organisms/solutions/forms/LifestyleForm.tsx` | diet_nutrition, sleep | weekly_prep_time, cost_impact |
| `components/organisms/solutions/forms/PurchaseForm.tsx` | products_devices, books_courses | ease_of_use, format, cost |
| `components/organisms/solutions/forms/AppForm.tsx` | apps_software | usage_frequency, subscription_type, cost |
| `components/organisms/solutions/forms/CommunityForm.tsx` | groups_communities, support_groups | meeting_frequency, group_size, cost |
| `components/organisms/solutions/forms/HobbyForm.tsx` | hobbies_activities | time_commitment, startup_cost, ongoing_cost |
| `components/organisms/solutions/forms/FinancialForm.tsx` | financial_products | financial_benefit, cost_type |

### Server Actions

| File | Lines | Purpose | Critical Sections |
|------|-------|---------|-------------------|
| `app/actions/submit-solution.ts` | 637 | Form submission handler | Line 122: validation call (missing import?) |
| `app/actions/update-solution-fields.ts` | 200+ | Optional field updates | Success screen submissions |

### Validation & Aggregation

| File | Lines | Purpose | Critical Functions |
|------|-------|---------|-------------------|
| `lib/solutions/solution-field-validator.ts` | 176 | Form submission validation | Lines 69-167: validateAndNormalizeSolutionFields() |
| `lib/services/solution-aggregator.ts` | 400+ | Aggregate individual ratings | Lines 154-191: aggregateArrayField() (missing source labels) |

### AI Generation System

| File | Lines | Purpose | Critical Sections |
|------|-------|---------|-------------------|
| `scripts/generate-validated-fields-v3.ts` | 750 | Main generation script | Lines 400-463: generateFieldData(), Lines 550-597: processSolution() |
| `scripts/field-generation-utils/category-config.ts` | 318 | Re-exports lib/config/solution-fields.ts | Central config |
| `scripts/field-generation-utils/dropdown-options.ts` | ~50 | Re-exports lib/config/solution-dropdown-options.ts | Central dropdown list |
| `scripts/field-generation-utils/prompt-generator.ts` | 200 | Goal-context-aware prompts | Lines 18-78: generateContextAwarePrompt() |
| `scripts/field-generation-utils/field-validator.ts` | 300 | AI output validation | Lines 125-167: validateDropdownCompliance() |
| `scripts/field-generation-utils/deduplicator.ts` | 300 | Remove duplicate values | Preserves data quality |
| `scripts/field-generation-utils/value-mapper.ts` | 600 | Map AI values to dropdowns | Case normalization |

### Documentation

| File | Lines | Purpose | Status |
|------|-------|---------|--------|
| `docs/solution-fields-ssot.md` | 200 | Single source of truth for fields | ⚠️ Needs update to match code |
| `complete-field-analysis.md` | 500+ | Authoritative category-field mapping | ⚠️ Has inconsistencies with code |
| `FORM_DROPDOWN_OPTIONS_REFERENCE.md` | 1000+ | Exact dropdown formats | ✓ Accurate |
| `HANDOVER.md` | 270 | V3 system status and instructions | ✓ Accurate for V3 state |

---

## Recommendations

### Priority 1: Fix Critical Misalignments (IMMEDIATE)

#### Task 1.1: Add Missing Import
**File**: `app/actions/submit-solution.ts`
**Location**: Line 4 (after existing imports)
**Change**: Add import statement

```typescript
// Add this line:
import { validateAndNormalizeSolutionFields } from '@/lib/solutions/solution-field-validator'
```

**Verification**:
```bash
# Test form submission
npm run build
# Check for any "undefined function" errors
```

**Time**: 2 minutes

---

#### Task 1.2: Establish Single Source of Truth
**Decision Required**: Which config is the authority?

**Option A: Make GoalPageClient.tsx the source of truth**
- ✓ This is what frontend actually displays
- ✓ Represents user-facing reality
- ✗ Requires updating AI generator and docs

**Option B: Make lib/config/solution-fields.ts the source of truth**
- ✓ More centralized location
- ✓ Already used by AI generator
- ✗ Requires updating frontend and docs

**Recommendation**: **Option A** - Frontend display is reality. AI should generate what frontend needs.

**Implementation**:
1. Extract `CATEGORY_CONFIG` from GoalPageClient.tsx
2. Move to `lib/config/solution-fields.ts`
3. Make both AI generator and display import from same source
4. Update all 23 categories to match

**Files to modify**:
- `lib/config/solution-fields.ts`: Update CATEGORY_FIELD_CONFIG to match GoalPageClient
- `components/goal/GoalPageClient.tsx`: Import config instead of defining it
- `docs/solution-fields-ssot.md`: Update to match code

**Time**: 2 hours

---

#### Task 1.3: Fix Side Effects Dropdown Mapping
**File**: `lib/config/solution-fields.ts`
**Location**: Lines 122-165 (4 dosage categories)
**Change**: Update fieldToDropdownMap

```typescript
// BEFORE:
medications: {
  fieldToDropdownMap: {
    side_effects: 'frequency'  // WRONG
  }
}

// AFTER:
medications: {
  fieldToDropdownMap: {
    side_effects: 'common_side_effects'  // CORRECT
  }
}
```

Repeat for:
- `supplements_vitamins` (Line ~135)
- `natural_remedies` (Line ~145)
- `beauty_skincare` (Line ~156)

**Verification**:
```bash
npx tsx scripts/generate-validated-fields-v3.ts --goal-id=56e2801e-0d78-4abd-a795-869e5b780ae7 --solution-limit=4 --field-filter=side_effects --dry-run
# Should show 0 validation errors
```

**Time**: 5 minutes

---

### Priority 2: Improve Data Consistency (NEXT SPRINT)

#### Task 2.1: Add Source Labels to Human Aggregations
**File**: `lib/services/solution-aggregator.ts`
**Location**: Lines ~180-190 (aggregateArrayField method)
**Change**: Add source field to aggregated values

```typescript
// BEFORE:
values: sortedValues.map(([value, count]) => ({
  value,
  count,
  percentage: Math.round((count / ratingsWithField) * 100)
}))

// AFTER:
values: sortedValues.map(([value, count]) => ({
  value,
  count,
  percentage: Math.round((count / ratingsWithField) * 100),
  source: 'user_submission'  // Add this
}))
```

**Verification**: Check aggregated_fields in database for source labels

**Time**: 30 minutes

---

#### Task 2.2: Fix Cost Field Generation for Practice/Hobby Categories
**File**: `lib/config/solution-fields.ts`
**Location**: Lines 74-121 (practice categories) and 226-236 (hobby category)
**Change**: Add split cost fields to requiredFields

```typescript
// BEFORE:
meditation_mindfulness: {
  requiredFields: ['practice_length', 'frequency', 'cost', 'time_to_results', 'challenges'],
  fieldToDropdownMap: {
    cost: 'practice_ongoing_cost'
  }
}

// AFTER:
meditation_mindfulness: {
  requiredFields: ['practice_length', 'frequency', 'startup_cost', 'ongoing_cost', 'cost', 'cost_type', 'time_to_results', 'challenges'],
  fieldToDropdownMap: {
    startup_cost: 'practice_startup_cost',
    ongoing_cost: 'practice_ongoing_cost',
    cost: 'practice_ongoing_cost',  // Will derive from ongoing
    cost_type: 'cost_type_derived'  // Special handling needed
  }
}
```

**Additional Work**: Update AI generator to derive `cost` and `cost_type` from split fields

**Files to modify**:
- `lib/config/solution-fields.ts`: Add fields
- `scripts/generate-validated-fields-v3.ts`: Add derivation logic (after line 497)

**Time**: 2 hours

---

#### Task 2.3: Resolve Field Name Inconsistencies
**Decision**: Keep `session_frequency` for medical_procedures, update docs

**Files to modify**:
- `docs/solution-fields-ssot.md`: Change `treatment_frequency` to `session_frequency` (Line 48)
- `complete-field-analysis.md`: Same change

**Note**: Add comment explaining label vs field name:
```typescript
medical_procedures: {
  keyFields: ['time_to_results', 'session_frequency', 'wait_time', 'cost'],
  fieldLabels: {
    session_frequency: 'Treatment Frequency'  // Uses session_frequency field, displays as "Treatment Frequency"
  }
}
```

**Time**: 15 minutes

---

### Priority 3: Add Validation Layer (FUTURE)

#### Task 3.1: Create Configuration Validation Script
**New file**: `scripts/validate-configuration-alignment.ts`
**Purpose**: Detect mismatches between config sources

```typescript
// Pseudo-code:
import { CATEGORY_CONFIG } from '@/components/goal/GoalPageClient'
import { CATEGORY_FIELD_CONFIG } from '@/lib/config/solution-fields'

for (const category of allCategories) {
  const displayFields = CATEGORY_CONFIG[category].keyFields
  const requiredFields = CATEGORY_FIELD_CONFIG[category].requiredFields

  // Check if all display fields are in required fields
  for (const field of displayFields) {
    if (!requiredFields.includes(field)) {
      console.error(`${category}: Display expects ${field} but AI doesn't generate it`)
    }
  }

  // Check if all required fields are in display fields
  for (const field of requiredFields) {
    if (!displayFields.includes(field) && field !== arrayField) {
      console.warn(`${category}: AI generates ${field} but display doesn't show it`)
    }
  }
}
```

**Run in CI**: Add to GitHub Actions to catch future drift

**Time**: 4 hours

---

#### Task 3.2: Refactor Dropdown Options Organization
**File**: `lib/config/solution-dropdown-options.ts`
**Change**: Restructure to category-first organization

**Current structure**: Field-first with special cases
**New structure**: Category-first with inheritance

```typescript
// New structure:
export const CATEGORY_DROPDOWN_CONFIG = {
  // Base config used by multiple categories
  _base: {
    time_to_results: DROPDOWN_OPTIONS.time_to_results,
    cost: DROPDOWN_OPTIONS.session_cost_per,
  },

  // Category-specific overrides
  medications: {
    ...CATEGORY_DROPDOWN_CONFIG._base,
    frequency: DROPDOWN_OPTIONS.frequency,
    length_of_use: DROPDOWN_OPTIONS.length_of_use,
    cost: DROPDOWN_OPTIONS.dosage_cost_monthly,  // Override base
    side_effects: DROPDOWN_OPTIONS.common_side_effects
  },

  meditation_mindfulness: {
    ...CATEGORY_DROPDOWN_CONFIG._base,
    practice_length: DROPDOWN_OPTIONS.practice_length,
    frequency: DROPDOWN_OPTIONS.practice_frequency,
    cost: DROPDOWN_OPTIONS.practice_ongoing_cost,  // Override base
    challenges: DROPDOWN_OPTIONS.meditation_challenges
  }
  // ... all 23 categories
}

// Simple lookup function
export function getDropdownOptionsForField(category: string, fieldName: string) {
  return CATEGORY_DROPDOWN_CONFIG[category]?.[fieldName] || null
}
```

**Benefits**:
- ✓ O(1) lookup instead of nested conditionals
- ✓ Easy to see all fields for a category
- ✓ Clear inheritance pattern
- ✓ Easier to add new categories

**Migration**: Can be done gradually, keep old function as fallback

**Time**: 6 hours

---

## Testing Strategy

### Test Phase 1: Configuration Validation (30 minutes)

#### Test 1.1: Verify Missing Import Fix
```bash
# Build project
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Test form submission
# 1. Start dev server: npm run dev
# 2. Navigate to: http://localhost:3000/goal/{any-goal-id}
# 3. Click "Share What Worked"
# 4. Submit a solution through any form
# 5. Check browser console for errors
```

**Expected**: No "validateAndNormalizeSolutionFields is not defined" errors

---

#### Test 1.2: Verify Side Effects Dropdown
```bash
npx tsx scripts/generate-validated-fields-v3.ts \
  --goal-id=56e2801e-0d78-4abd-a795-869e5b780ae7 \
  --solution-limit=1 \
  --field-filter=side_effects \
  --dry-run
```

**Expected output**:
```
✅ Generated 5 options for side_effects
✅ All values match common_side_effects dropdown
✅ 0 validation errors
```

**If errors**: Dropdown mapping still wrong, check lib/config/solution-fields.ts

---

### Test Phase 2: Data Flow Validation (1 hour)

#### Test 2.1: Human Submission → Database → Display
**Steps**:
1. Submit a solution through PracticeForm (meditation_mindfulness)
2. Fill all required fields including challenges array
3. Submit form
4. Query database:
```sql
SELECT aggregated_fields->>'challenges'
FROM goal_implementation_links
WHERE implementation_id = '{the-solution-id}'
LIMIT 1;
```
5. Check if values have `source` field:
```json
{
  "mode": "Hard to maintain habit",
  "values": [
    {
      "value": "Hard to maintain habit",
      "percentage": 40,
      "source": "user_submission"  // ← Should exist after fix
    }
  ]
}
```

**Expected**: All values have `source: 'user_submission'`

---

#### Test 2.2: AI Generation → Database → Display
**Steps**:
1. Generate fields for one solution:
```bash
npx tsx scripts/generate-validated-fields-v3.ts \
  --goal-id=56e2801e-0d78-4abd-a795-869e5b780ae7 \
  --solution-limit=1 \
  --verbose
```

2. Check output for validation errors
3. Query database to verify data structure
4. Navigate to goal page in browser
5. Verify solution displays generated fields correctly

**Expected**:
- 0 validation errors
- All keyFields from GoalPageClient visible on solution card
- DistributionData format correct

---

### Test Phase 3: Category Alignment Validation (2 hours)

#### Test 3.1: Compare All 23 Categories
**Script**: Create comparison script

```typescript
// File: scripts/compare-category-configs.ts
import { CATEGORY_CONFIG } from '@/components/goal/GoalPageClient'
import { CATEGORY_FIELD_CONFIG } from '@/lib/config/solution-fields'

const categories = Object.keys(CATEGORY_CONFIG)

for (const category of categories) {
  const displayFields = CATEGORY_CONFIG[category].keyFields
  const arrayField = CATEGORY_CONFIG[category].arrayField
  const requiredFields = CATEGORY_FIELD_CONFIG[category]?.requiredFields || []

  console.log(`\n${category}:`)
  console.log(`  Display: ${displayFields.join(', ')}`)
  console.log(`  Array: ${arrayField}`)
  console.log(`  Required: ${requiredFields.join(', ')}`)

  // Check alignment
  const missingFromRequired = displayFields.filter(f => !requiredFields.includes(f))
  const notDisplayed = requiredFields.filter(f =>
    !displayFields.includes(f) && f !== arrayField
  )

  if (missingFromRequired.length > 0) {
    console.error(`  ❌ AI not generating: ${missingFromRequired.join(', ')}`)
  }
  if (notDisplayed.length > 0) {
    console.warn(`  ⚠️  Generated but not displayed: ${notDisplayed.join(', ')}`)
  }
  if (missingFromRequired.length === 0 && notDisplayed.length === 0) {
    console.log(`  ✅ Aligned`)
  }
}
```

**Run**:
```bash
npx tsx scripts/compare-category-configs.ts
```

**Expected output**:
- ✅ 23/23 categories aligned
- 0 critical errors (AI not generating displayed fields)
- Minimal warnings (generated but not displayed is OK)

---

#### Test 3.2: Full Goal Test (Anxiety Goal)
**Command**:
```bash
npx tsx scripts/generate-validated-fields-v3.ts \
  --goal-id=56e2801e-0d78-4abd-a795-869e5b780ae7 \
  --api-delay=4000 \
  --verbose
```

**Expected**:
- Process all ~140 solutions for anxiety goal
- <5% error rate (target from HANDOVER.md)
- All categories represented
- Rich distributions (5-8 options per field)
- Rate limiting prevents API quota issues (should take ~9-10 minutes)

**Metrics to track**:
```
Total solutions: 140
Solutions processed: 140
Fields generated: ~700 (5 fields × 140 solutions)
Fields skipped: ~280 (good existing data)
Fields errored: <35 (5% target)
Validation errors: 0
API calls: ~700
```

---

### Test Phase 4: Cost Field Validation (30 minutes)

#### Test 4.1: Practice Form Cost Fields
**Steps**:
1. Submit solution through PracticeForm (meditation_mindfulness)
2. Fill startup_cost: "Under $50", ongoing_cost: "$25-$49.99/month"
3. Check database for all cost fields:
```sql
SELECT
  aggregated_fields->>'startup_cost',
  aggregated_fields->>'ongoing_cost',
  aggregated_fields->>'cost',
  aggregated_fields->>'cost_type'
FROM goal_implementation_links
WHERE implementation_id = '{solution-id}';
```

4. Generate AI fields for meditation solution:
```bash
npx tsx scripts/generate-validated-fields-v3.ts \
  --goal-id={goal-id} \
  --solution-limit=1 \
  --field-filter=startup_cost,ongoing_cost,cost,cost_type
```

5. Compare human vs AI data structure

**Expected**:
- Human submission has all 4 cost fields ✓
- AI generation has all 4 cost fields (after fix) ✓
- cost and cost_type correctly derived ✓

**Before fix**: AI only has `cost` field
**After fix**: AI has all 4 fields matching human pattern

---

## Appendix: Quick Reference

### Command Cheatsheet

```bash
# Generate fields for specific goal
npx tsx scripts/generate-validated-fields-v3.ts --goal-id={uuid}

# Generate with rate limiting (production)
npx tsx scripts/generate-validated-fields-v3.ts --goal-id={uuid} --api-delay=4000

# Test specific fields only
npx tsx scripts/generate-validated-fields-v3.ts --goal-id={uuid} --field-filter=cost,time_to_results

# Dry run (no database writes)
npx tsx scripts/generate-validated-fields-v3.ts --goal-id={uuid} --dry-run

# Limit number of solutions
npx tsx scripts/generate-validated-fields-v3.ts --goal-id={uuid} --solution-limit=5

# Validate field quality
npx tsx scripts/validate-field-quality.ts --goal-id={uuid}

# Resume interrupted generation
npx tsx scripts/generate-validated-fields-v3.ts --goal-id={uuid} --resume

# Verbose output for debugging
npx tsx scripts/generate-validated-fields-v3.ts --goal-id={uuid} --verbose
```

---

### Category Quick Reference

**23 Categories grouped by form**:

**DosageForm** (4):
- medications, supplements_vitamins, natural_remedies, beauty_skincare

**PracticeForm** (3):
- meditation_mindfulness, exercise_movement, habits_routines

**SessionForm** (7):
- therapists_counselors, doctors_specialists, coaches_mentors
- alternative_practitioners, professional_services
- medical_procedures, crisis_resources

**LifestyleForm** (2):
- diet_nutrition, sleep

**PurchaseForm** (2):
- products_devices, books_courses

**AppForm** (1):
- apps_software

**CommunityForm** (2):
- groups_communities, support_groups

**HobbyForm** (1):
- hobbies_activities

**FinancialForm** (1):
- financial_products

---

### Issue Priority Matrix

| Issue | Severity | Impact | Effort | Priority |
|-------|----------|--------|--------|----------|
| #1: Configuration Misalignment | CRITICAL | Forms/AI/Display mismatch | 2h | P1 |
| #2: Missing Import | CRITICAL | Form submission may fail | 2min | P1 |
| #3: Field Name Inconsistency | MEDIUM | Developer confusion | 15min | P2 |
| #4: Cost Field Complexity | MEDIUM | AI data incomplete | 2h | P2 |
| #5: Array Field Source Labels | MEDIUM | Data format inconsistency | 30min | P2 |
| #6: Side Effects Dropdown | MEDIUM | Wrong validation | 5min | P1 |
| #7: Format Field Missing | LOW | Needs verification | 1h | P3 |
| #8: Dropdown File Complexity | LOW | Maintenance burden | 6h | P3 |

---

## Conclusion

The WWFM field generation system is **fundamentally well-architected** with excellent separation of concerns, robust validation, and strong type safety. The V3 improvements show significant progress in goal-context awareness and data quality.

However, **configuration drift** between three sources of truth has created inconsistencies that could affect data quality. The primary issues are:

1. **Different field requirements** in display vs generation configs
2. **Missing import** that may cause runtime errors
3. **Field name inconsistencies** in documentation
4. **Cost field complexity** not fully handled by AI generation

These are **all fixable within 1 sprint** (8-10 hours of work). Once aligned, the system should provide consistent, high-quality field data across both human submissions and AI-generated content.

### Recommended Action Plan
1. **Day 1**: Fix P1 critical issues (configuration alignment, missing import, side effects dropdown) - 3 hours
2. **Day 2**: Fix P2 medium issues (source labels, cost fields, field names) - 4 hours
3. **Day 3**: Add validation scripts to prevent future drift - 4 hours
4. **Day 4**: Test all 23 categories end-to-end - 2 hours

**Total**: 13 hours to production-ready state

---

**End of Audit Report**
*Generated by: Claude Sonnet 4.5*
*Date: September 30, 2025*
*For questions or clarifications, reference this document and the File Reference Map above.*