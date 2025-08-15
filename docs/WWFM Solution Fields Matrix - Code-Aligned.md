# WWFM Solution Fields Matrix - Code-Aligned Version
> **Updated**: January 2025  
> **Source**: `/components/goal/GoalPageClient.tsx` CATEGORY_CONFIG (lines 84-348)  
> **Purpose**: Exact field requirements for solution generation - THIS IS THE SOURCE OF TRUTH

## 📋 Matrix Overview

Every solution card displays exactly **4 key fields** + **1 array field** (optional). This document shows the EXACT field names as they appear in the code and must be used for generation.

## 🎯 Category-to-Fields Mapping

### DOSAGE FORMS (4 categories)
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| medications | `time_to_results` | `frequency` | `length_of_use` | `cost` | `side_effects` |
| supplements_vitamins | `time_to_results` | `frequency` | `length_of_use` | `cost` | `side_effects` |
| natural_remedies | `time_to_results` | `frequency` | `length_of_use` | `cost` | `side_effects` |
| beauty_skincare | `time_to_results` | `skincareFrequency` ⚠️ | `length_of_use` | `cost` | `side_effects` |

**⚠️ CRITICAL**: beauty_skincare uses `skincareFrequency` not `frequency`

### PRACTICE FORMS (3 categories)
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| meditation_mindfulness | `time_to_results` | `practice_length` | `startup_cost` | `ongoing_cost` | `challenges` |
| exercise_movement | `time_to_results` | `frequency` | `startup_cost` | `ongoing_cost` | `challenges` |
| habits_routines | `time_to_results` | `time_commitment` | `startup_cost` | `ongoing_cost` | `challenges` |

### SESSION FORMS (7 categories)
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| therapists_counselors | `time_to_results` | `session_frequency` | `format` | `cost` | `barriers` |
| doctors_specialists | `time_to_results` | `wait_time` | `insurance_coverage` | `cost` | `barriers` |
| coaches_mentors | `time_to_results` | `session_frequency` | `format` | `cost` | `barriers` |
| alternative_practitioners | `time_to_results` | `session_frequency` | `format` | `cost` | `side_effects` ⚠️ |
| professional_services | `time_to_results` | `session_frequency` | `format` | `cost` | `barriers` |
| medical_procedures | `time_to_results` | `treatment_frequency` | `wait_time` | `cost` | `side_effects` |
| crisis_resources | `time_to_results` | `response_time` | `format` | `cost` | **null** ⚠️ |

**⚠️ CRITICAL**: 
- alternative_practitioners uses `side_effects` not `barriers`
- crisis_resources has NO array field (null)

### LIFESTYLE FORMS (2 categories)
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| diet_nutrition | `time_to_results` | `weekly_prep_time` | `long_term_sustainability` | `cost_impact` | `challenges` |
| sleep | `time_to_results` | `previous_sleep_hours` | `long_term_sustainability` | `cost_impact` | `challenges` |

### PURCHASE FORMS (2 categories)
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| products_devices | `time_to_results` | `ease_of_use` | `product_type` | `cost` | `issues` ⚠️ |
| books_courses | `time_to_results` | `format` | `learning_difficulty` | `cost` | `issues` ⚠️ |

**⚠️ CRITICAL**: Uses `issues` not `challenges`

### APP FORM (1 category)
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| apps_software | `time_to_results` | `usage_frequency` | `subscription_type` | `cost` | `challenges` |

### COMMUNITY FORMS (2 categories)
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| groups_communities | `time_to_results` | `meeting_frequency` | `group_size` | `cost` | `challenges` |
| support_groups | `time_to_results` | `meeting_frequency` | `format` | `cost` | `challenges` |

### HOBBY FORM (1 category)
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| hobbies_activities | `time_to_enjoyment` ⚠️ | `time_commitment` | `startup_cost` | `ongoing_cost` | `barriers` |

**⚠️ CRITICAL**: Uses `time_to_enjoyment` not `time_to_results`

### FINANCIAL FORM (1 category)
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| financial_products | `time_to_impact` ⚠️ | `cost_type` | `financial_benefit` | `access_time` | `barriers` |

**⚠️ CRITICAL**: Uses `time_to_impact` not `time_to_results`

## ⚠️ Critical Field Variations Summary

### Time Fields (3 variations)
- **Standard** (19 categories): `time_to_results`
- **Hobbies**: `time_to_enjoyment`
- **Financial**: `time_to_impact`

### Frequency Fields (7 variations)
- **Dosage forms**: `frequency` (meds, supplements, natural)
- **Beauty**: `skincareFrequency`
- **Exercise**: `frequency`
- **Sessions**: `session_frequency` (therapists, coaches, alternative, professional)
- **Medical procedures**: `treatment_frequency`
- **Groups**: `meeting_frequency`
- **Apps**: `usage_frequency`

### Cost Fields (4 types)
- **Single**: `cost` (most categories)
- **Split**: `startup_cost` + `ongoing_cost` (practice forms, hobbies)
- **Impact**: `cost_impact` (lifestyle forms)
- **Type**: `cost_type` (financial)

### Array Fields (5 types)
1. **`side_effects`** (6 categories): medications, supplements, natural, beauty, alternative practitioners, medical procedures
2. **`challenges`** (9 categories): meditation, exercise, habits, diet, sleep, apps, groups, support groups
3. **`barriers`** (6 categories): therapists, doctors, coaches, professional services, hobbies, financial
4. **`issues`** (2 categories): products, books
5. **`null`** (1 category): crisis_resources

## 📊 Data Requirements per Solution

```typescript
// Required structure for EVERY solution
interface SolutionData {
  // Core fields
  title: string
  description: string  
  solution_category: string // Must match one of 23 categories exactly
  
  // The 4 display fields (exact names from matrix above)
  solution_fields: {
    [field1_name]: string | number    // e.g., "time_to_results": "3-4 weeks"
    [field2_name]: string | number    // e.g., "frequency": "Twice daily"
    [field3_name]: string | number    // e.g., "length_of_use": "3-6 months"
    [field4_name]: string | number    // e.g., "cost": "$50-100/month"
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

- **Display Logic**: `/components/goal/GoalPageClient.tsx` (CATEGORY_CONFIG object)
- **Form Templates**: `/components/solutions/forms/[FormName].tsx`
- **Database Schema**: `/docs/database/schema.md`
- **Dropdown Options**: See archived matrix for complete lists
- **Old Matrix (archived)**: `/docs/archive/WWFM Forms Field Matrix - ACTUAL Implementation - ARCHIVED 2025-01.md`

## ✅ Validation Checklist

Before generating any solution, verify:

- [ ] Using exact field names from this matrix (e.g., `skincareFrequency` not `frequency` for beauty)
- [ ] All 4 required fields have values
- [ ] Array field name matches category (e.g., `barriers` for therapists, not `challenges`)
- [ ] Array values in solution_fields exactly match distribution names
- [ ] All percentages in distributions sum to 100
- [ ] Field values match dropdown options from forms
- [ ] Variants only created for 4 dosage categories

---

**This is the source of truth for solution generation. Any discrepancies should be resolved by checking `/components/goal/GoalPageClient.tsx`**