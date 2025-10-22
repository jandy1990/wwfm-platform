# Solution Field Configuration (SSOT)
> **Updated**: September 30, 2025 - Corrected to match actual code
> **Primary source**: `components/goal/GoalPageClient.tsx` `CATEGORY_CONFIG` (Lines 56-407)
> **⚠️ VERIFICATION NOTICE**: This document attempts to match code but may drift. Always verify against `GoalPageClient.tsx` CATEGORY_CONFIG which reflects true runtime behavior.

This document is the single source of truth for every field the platform expects per solution category. All generators, migrations, QA scripts, and documentation **must** reference this file (via `/docs/solution-fields-ssot.md`).

> **Reminder**: `time_to_complete` is **not** displayed for any category and should not be targeted by regeneration scripts.

For end-to-end context on how these fields travel through the system, see `/docs/solution-field-data-flow.md`.

## Using This Document
1. **When adding or changing fields**: Verify against `GoalPageClient.tsx` first, then update this doc
2. **During audits**: Compare Supabase data or generated fixtures against the tables below
3. **For prompt engineering**: Link Gemini/GPT prompts to the canonical field names here to avoid mismatches in generated distributions
4. **When in doubt**: Check `components/goal/GoalPageClient.tsx` lines 56-407 for ground truth

## 📋 Matrix Overview

Every solution card displays exactly **3-4 key fields** + **1 array field** (optional). This document shows the EXACT field names as they appear in the code and must be used for generation.

**⚠️ UPDATE (September 2025)**: All practice and financial categories now display four fields for visual consistency.

## 🎯 Category-to-Fields Mapping

### DOSAGE FORMS (4 categories)
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| medications | `time_to_results` | `frequency` | `length_of_use` | `cost` | `side_effects` |
| supplements_vitamins | `time_to_results` | `frequency` | `length_of_use` | `cost` | `side_effects` |
| natural_remedies | `time_to_results` | `frequency` | `length_of_use` | `cost` | `side_effects` |
| beauty_skincare | `time_to_results` | `skincare_frequency` ⚠️ | `length_of_use` | `cost` | `side_effects` |

**⚠️ CRITICAL**: beauty_skincare uses `skincare_frequency` not `frequency`

**Code Reference**: `components/goal/GoalPageClient.tsx` Lines 62-117

### PRACTICE FORMS (3 categories)
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| meditation_mindfulness | `time_to_results` | `practice_length` | `frequency` | `cost` | `challenges` |
| exercise_movement | `time_to_results` | `frequency` | `duration` | `cost` | `challenges` |
| habits_routines | `time_to_results` | `time_commitment` | `frequency` | `cost` | `challenges` |

**Code Reference**: `components/goal/GoalPageClient.tsx` Lines 119-161

### SESSION FORMS (7 categories)
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| therapists_counselors | `time_to_results` | `session_frequency` | `session_length` | `cost` | `challenges` |
| doctors_specialists | `time_to_results` | `wait_time` | `insurance_coverage` | `cost` | `challenges` |
| coaches_mentors | `time_to_results` | `session_frequency` | `session_length` | `cost` | `challenges` |
| alternative_practitioners | `time_to_results` | `session_frequency` | `session_length` | `cost` | `side_effects` ⚠️ |
| professional_services | `time_to_results` | `session_frequency` | `specialty` | `cost` | `challenges` |
| medical_procedures | `time_to_results` | `session_frequency` | `wait_time` | `cost` | `side_effects` |
| crisis_resources | `time_to_results` | `response_time` | `format` | `cost` | `challenges` |

**⚠️ CRITICAL NOTES**:
- alternative_practitioners uses `side_effects` not `challenges`
- medical_procedures field name is `session_frequency` (UI label is "Treatment Frequency")
- Forms collect `format` field for most categories but display shows `session_length` (except crisis_resources shows format)

**Code Reference**: `components/goal/GoalPageClient.tsx` Lines 163-261

### LIFESTYLE FORMS (2 categories)
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| diet_nutrition | `time_to_results` | `weekly_prep_time` | `still_following` | `cost` | `challenges` |
| sleep | `time_to_results` | `previous_sleep_hours` | `still_following` | `cost` | `challenges` |

**⚠️ NOTE**: `cost` field uses `cost_impact` label ("Cost Impact") not absolute cost

**Code Reference**: `components/goal/GoalPageClient.tsx` Lines 263-291

### PURCHASE FORMS (2 categories)
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| products_devices | `time_to_results` | `ease_of_use` | `product_type` | `cost` | `challenges` |
| books_courses | `time_to_results` | `format` | `learning_difficulty` | `cost` | `challenges` |

**Code Reference**: `components/goal/GoalPageClient.tsx` Lines 293-322

### APP FORM (1 category)
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| apps_software | `time_to_results` | `usage_frequency` | `subscription_type` | `cost` | `challenges` |

**Code Reference**: `components/goal/GoalPageClient.tsx` Lines 324-337

### COMMUNITY FORMS (2 categories)
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| groups_communities | `time_to_results` | `meeting_frequency` | `group_size` | `cost` | `challenges` |
| support_groups | `time_to_results` | `meeting_frequency` | `format` | `cost` | `challenges` |

**Code Reference**: `components/goal/GoalPageClient.tsx` Lines 339-367

### HOBBY FORM (1 category)
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| hobbies_activities | `time_to_results` | `time_commitment` | `frequency` | `cost` | `challenges` |

**⚠️ NOTE**: Hobby form COLLECTS split costs (`startup_cost`, `ongoing_cost`) but DISPLAYS single `cost` (same pattern as practice forms)

**Code Reference**: `components/goal/GoalPageClient.tsx` Lines 369-383

### FINANCIAL FORM (1 category)
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| financial_products | `time_to_results` | `financial_benefit` | `access_time` | `cost_type` | `challenges` |

**⚠️ NOTE**:
- UI label is "Time to Impact" but field name is `time_to_results`
- Uses `cost_type` not `cost` (cost structure varies by product type)

**Code Reference**: `components/goal/GoalPageClient.tsx` Lines 385-407

## ⚠️ Critical Field Variations Summary

### Time Fields (1 variation)
- **Universal** (all 23 categories): `time_to_results`

### Frequency Fields (7 variations)
- **Dosage forms**: `frequency` (medications, supplements, natural_remedies)
- **Beauty**: `skincare_frequency` (beauty_skincare only)
- **Exercise**: `frequency` (exercise_movement)
- **Practice**: `frequency` (meditation_mindfulness, habits_routines)
- **Sessions**: `session_frequency` (therapists_counselors, coaches_mentors, alternative_practitioners, professional_services, medical_procedures)
- **Groups**: `meeting_frequency` (groups_communities, support_groups)
- **Apps**: `usage_frequency` (apps_software)

### Cost Fields (4 patterns)
1. **Single cost**: `cost` (most categories - 17 categories)
2. **Split costs**: `startup_cost` + `ongoing_cost` (hobbies_activities only in display; practice forms collect but derive single `cost`)
3. **Cost impact**: `cost` field with label "Cost Impact" (diet_nutrition, sleep)
4. **Cost type**: `cost_type` (financial_products)

### Array Fields (2 types)
1. **`side_effects`** (6 categories): medications, supplements_vitamins, natural_remedies, beauty_skincare, alternative_practitioners, medical_procedures
2. **`challenges`** (17 categories): All other categories use challenges for difficulties/obstacles

## 📊 Data Collection vs Display

**Important**: Forms may collect MORE fields than what's displayed on solution cards. This is intentional.

**Example**: Session forms (therapists_counselors, coaches_mentors, etc.)
- **Forms collect**: `format` (In-person/Virtual/Phone), `session_length` (duration), `session_frequency`
- **Display shows**: `session_frequency`, `session_length`, `cost`, `time_to_results`
- **Why**: `format` is collected for filtering/search but `session_length` is more relevant for cards

**Practice forms collect split costs** but may derive single cost:
- **Forms collect**: `startup_cost`, `ongoing_cost`
- **Forms derive**: `cost` (from ongoing or startup), `cost_type` (one_time/recurring/dual)
- **Display shows**: `cost` (single field)
- **Database stores**: All 4 fields for flexibility

## 📊 Data Requirements per Solution

```typescript
// Required structure for EVERY solution
interface SolutionData {
  // Core fields
  title: string
  description: string
  solution_category: string // Must match one of 23 categories exactly

  // The 3-4 display fields (exact names from matrix above)
  solution_fields: {
    [field1_name]: string | number    // e.g., "time_to_results": "3-4 weeks"
    [field2_name]: string | number    // e.g., "frequency": "Twice daily"
    [field3_name]: string | number    // e.g., "length_of_use": "3-6 months"
    [field4_name]?: string | number   // e.g., "cost": "$50-100/month" (optional for some)
    [array_field]?: string[]          // e.g., "side_effects": ["Nausea", "Headache"]
  }

  // Prevalence distributions for ALL displayed fields
  ai_field_distributions: [
    {
      solution_id: string,
      goal_id: string,
      field_name: string,
      distributions: [
        {name: string, percentage: number}  // name MUST match solution_fields value
      ]
    }
  ]

  // Variants (only for 4 dosage categories)
  variants?: {
    amount?: number      // e.g., 50
    unit?: string        // e.g., "mg"
    form?: string        // e.g., "tablet"
    variant_name: string // e.g., "50mg tablet"
  }[]
}
```

## 🚨 Array Field Matching Requirements

**CRITICAL**: Array field values in `solution_fields` MUST EXACTLY match distribution names:

```typescript
// ✅ CORRECT - Values match exactly
solution_fields: {
  side_effects: ["Nausea", "Headache", "Dizziness"]
}

ai_field_distributions: {
  field_name: "side_effects",
  distributions: [
    {name: "Nausea", percentage: 45},     // ✅ Exact match
    {name: "Headache", percentage: 30},   // ✅ Exact match
    {name: "Dizziness", percentage: 25}   // ✅ Exact match
  ]
}

// ❌ WRONG - Values don't match
solution_fields: {
  side_effects: ["Nausea", "Headache"]
}

ai_field_distributions: {
  field_name: "side_effects",
  distributions: [
    {name: "Feeling sick", percentage: 45},  // ❌ Doesn't match "Nausea"
    {name: "Head pain", percentage: 30}      // ❌ Doesn't match "Headache"
  ]
}
```

## 🔗 Key Reference Files

- **Display Logic (SOURCE OF TRUTH)**: `/components/goal/GoalPageClient.tsx` Lines 56-407 (CATEGORY_CONFIG object)
- **AI Generation Config**: `/lib/config/solution-fields.ts` (should match display logic)
- **Form Templates**: `/components/organisms/solutions/forms/[FormName].tsx`
- **Dropdown Options**: `/lib/config/solution-dropdown-options.ts`
- **Database Schema**: `/docs/database/schema.md`
- **Old Matrix (archived)**: `/docs/archive/WWFM Forms Field Matrix - ACTUAL Implementation - ARCHIVED 2025-01.md`

## ✅ Validation Checklist

Before generating any solution, verify:

- [ ] Using exact field names from GoalPageClient.tsx CATEGORY_CONFIG (not this doc if they differ!)
- [ ] All 3-4 required display fields have values
- [ ] Array field name matches category (e.g., `challenges` for most, `side_effects` for medical)
- [ ] Array values in solution_fields exactly match distribution names
- [ ] All percentages in distributions sum to 100
- [ ] Field values match dropdown options from forms
- [ ] Variants only created for 4 dosage categories
- [ ] For practice forms: split cost fields collected AND single cost derived
- [ ] For medical_procedures: field is `session_frequency` (not `treatment_frequency`)

## 🔍 Verification Instructions

**To verify this document matches code**:

1. Open `components/goal/GoalPageClient.tsx`
2. Find CATEGORY_CONFIG (starts around Line 56)
3. For each category, compare:
   - `keyFields` array in code
   - Field names in this doc's tables
4. Report any mismatches as documentation bugs

**Example verification**:
```typescript
// Code (GoalPageClient.tsx Line 125):
meditation_mindfulness: {
  keyFields: ['time_to_results', 'practice_length', 'frequency', 'cost']
}

// This doc (Line 36):
| meditation_mindfulness | time_to_results | practice_length | frequency | cost |

// ✅ Match confirmed
```

## 📝 Change Log

**September 30, 2025**:
- **CORRECTED**: Session form fields (therapists, coaches, alternative) - Changed `format` to `session_length` to match code
- **CORRECTED**: medical_procedures frequency field - Uses `session_frequency` everywhere (not `treatment_frequency`)
- **ADDED**: Verification notice warning docs may drift from code
- **ADDED**: Data collection vs display section explaining why forms collect more than display shows
- **ADDED**: Verification instructions for future doc updates
- **REMOVED**: Incorrect frequency variation listing for treatment_frequency

---

**This document reflects runtime behavior as of September 30, 2025. When code and docs disagree, CODE WINS.**
