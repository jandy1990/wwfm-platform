# 🔍 FIELD VALIDATION REQUIREMENTS - ACTUAL FIELD NAMES

**Updated**: September 24, 2025
**Purpose**: AUTHORITATIVE reference for ALL actual field names used in GoalPageClient.tsx
**Critical**: Previous documentation had WRONG field names causing catastrophic generation failures

---

## 🚨 VALIDATION FAILURES THAT CAUSED DISASTER (Sept 24, 2025)

1. **Wrong Field Names**: Documentation said "session_length" but therapists_counselors uses "session_frequency"
2. **Missing Dual Fields**: therapists_counselors actually uses BOTH session_frequency AND session_length
3. **Wrong Dropdown Values**: Used "$50-100" instead of exact "$50-$99.99" format
4. **No Form Validation**: Never checked against FORM_DROPDOWN_OPTIONS_REFERENCE.md
5. **Lost Data Diversity**: Generated 4 options instead of preserving 5-8
6. **Frontend Breakage**: [Object Object] errors due to invalid dropdown values

**Result**: All generated data was invalid and caused display errors.

---

## ✅ ACTUAL FIELD NAMES (From GoalPageClient.tsx)

### Universal Fields (All 23 Categories)
- `time_to_results` - Required on ALL solution cards

### Cost Fields (Most Categories)
Frontend uses fallback logic: `cost` OR (`startup_cost` + `ongoing_cost`)
- `cost` - Single cost value
- `startup_cost` - Initial cost (combined with ongoing)
- `ongoing_cost` - Monthly/recurring cost (combined with startup)

**Cost Exceptions** (NO cost fields):
- `meditation_mindfulness`
- `financial_products`

---

## 📋 CATEGORY-SPECIFIC FIELD MAPPINGS

### DOSAGE FORMS (4 categories)
Pattern: keyFields + side_effects array

**medications**:
- keyFields: `['time_to_results', 'frequency', 'length_of_use', 'cost']`
- arrayField: `'side_effects'`

**supplements_vitamins**:
- keyFields: `['time_to_results', 'frequency', 'length_of_use', 'cost']`
- arrayField: `'side_effects'`

**natural_remedies**:
- keyFields: `['time_to_results', 'frequency', 'length_of_use', 'cost']`
- arrayField: `'side_effects'`

**beauty_skincare**:
- keyFields: `['time_to_results', 'skincare_frequency', 'length_of_use', 'cost']`
- arrayField: `'side_effects'`
- ⚠️ Uses `skincare_frequency` (not `frequency`)

### PRACTICE FORMS (3 categories)
Pattern: keyFields + challenges array

**meditation_mindfulness**:
- keyFields: `['time_to_results', 'practice_length', 'frequency']`
- arrayField: `'challenges'`
- ⚠️ NO cost field

**exercise_movement**:
- keyFields: `['time_to_results', 'frequency', 'cost']`
- arrayField: `'challenges'`

**habits_routines**:
- keyFields: `['time_to_results', 'time_commitment', 'cost']`
- arrayField: `'challenges'`

### SESSION FORMS (7 categories)
Pattern: keyFields + varied array fields

**therapists_counselors**: ⚠️ **CRITICAL - USES BOTH FIELDS**
- keyFields: `['time_to_results', 'session_frequency', 'session_length', 'cost']`
- arrayField: `'challenges'`
- ⚠️ Requires BOTH `session_frequency` AND `session_length`

**doctors_specialists**:
- keyFields: `['time_to_results', 'wait_time', 'insurance_coverage', 'cost']`
- arrayField: `'challenges'`

**coaches_mentors**: ⚠️ **CRITICAL - USES BOTH FIELDS**
- keyFields: `['time_to_results', 'session_frequency', 'session_length', 'cost']`
- arrayField: `'challenges'`
- ⚠️ Requires BOTH `session_frequency` AND `session_length`

**alternative_practitioners**: ⚠️ **CRITICAL - DUAL FIELDS + SIDE EFFECTS**
- keyFields: `['time_to_results', 'session_frequency', 'session_length', 'cost']`
- arrayField: `'side_effects'` (NOT challenges!)
- ⚠️ Requires BOTH `session_frequency` AND `session_length`

**professional_services**:
- keyFields: `['time_to_results', 'session_frequency', 'specialty', 'cost']`
- arrayField: `'challenges'`
- ⚠️ Uses `specialty` (not session_length)

**medical_procedures**:
- keyFields: `['time_to_results', 'session_frequency', 'wait_time', 'cost']`
- arrayField: `'side_effects'` (NOT challenges!)

**crisis_resources**:
- keyFields: `['time_to_results', 'response_time', 'cost']`
- arrayField: `null` (NO array field!)

### LIFESTYLE FORMS (2 categories)
Pattern: keyFields + challenges array

**diet_nutrition**:
- keyFields: `['time_to_results', 'weekly_prep_time', 'still_following', 'cost']`
- arrayField: `'challenges'`

**sleep**:
- keyFields: `['time_to_results', 'previous_sleep_hours', 'still_following', 'cost']`
- arrayField: `'challenges'`

### PURCHASE FORMS (2 categories)
Pattern: keyFields + challenges array

**products_devices**:
- keyFields: `['time_to_results', 'ease_of_use', 'product_type', 'cost']`
- arrayField: `'challenges'`

**books_courses**:
- keyFields: `['time_to_results', 'format', 'learning_difficulty', 'cost']`
- arrayField: `'challenges'`

### APP FORM (1 category)
Pattern: keyFields + challenges array

**apps_software**:
- keyFields: `['time_to_results', 'usage_frequency', 'subscription_type', 'cost']`
- arrayField: `'challenges'`

### COMMUNITY FORMS (2 categories)
Pattern: keyFields + challenges array

**groups_communities**:
- keyFields: `['time_to_results', 'meeting_frequency', 'group_size', 'cost']`
- arrayField: `'challenges'`

**support_groups**:
- keyFields: `['time_to_results', 'meeting_frequency', 'format', 'cost']`
- arrayField: `'challenges'`

### HOBBY FORM (1 category)
Pattern: keyFields + challenges array

**hobbies_activities**:
- keyFields: `['time_to_results', 'time_commitment', 'frequency', 'cost']`
- arrayField: `'challenges'`

### FINANCIAL FORM (1 category)
Pattern: keyFields + challenges array

**financial_products**:
- keyFields: `['time_to_results', 'financial_benefit', 'access_time']`
- arrayField: `'challenges'`
- ⚠️ NO cost field

---

## 🚨 CRITICAL DUAL FIELD REQUIREMENTS

### Categories Requiring BOTH session_frequency AND session_length:
1. **therapists_counselors** - Both fields mandatory
2. **coaches_mentors** - Both fields mandatory
3. **alternative_practitioners** - Both fields mandatory

### Categories Using side_effects (NOT challenges):
1. **medications** - Medical array field
2. **supplements_vitamins** - Medical array field
3. **natural_remedies** - Medical array field
4. **beauty_skincare** - Medical array field
5. **alternative_practitioners** - Exception: session category with medical array
6. **medical_procedures** - Exception: session category with medical array

### Categories with NO array field:
1. **crisis_resources** - Unique exception, arrayField: null

### Categories with NO cost field:
1. **meditation_mindfulness** - Practice category exception
2. **financial_products** - Financial category exception

---

## 📊 FIELD VALIDATION MATRIX

### Critical Missing Fields (100% missing - Display Breaking):
1. **session_frequency** (265 solutions) - therapists_counselors, coaches_mentors, alternative_practitioners
2. **session_length** (265 solutions) - therapists_counselors, coaches_mentors, alternative_practitioners
3. **learning_difficulty** (833 solutions) - books_courses only
4. **group_size** (152 solutions) - groups_communities only
5. **practice_length** (160 solutions) - meditation_mindfulness only

### High Priority (81% missing - Cost Display):
6. **startup_cost** & **ongoing_cost** (4,444 solutions) - Most categories

### Medium Priority (UX Impact):
7. **side_effects** (637/1,336 missing) - Medical categories only
8. **challenges** (881/4,102 missing) - Most categories

---

## ⚠️ MANDATORY VALIDATION CHECKLIST

### Before ANY Field Generation:
- [ ] **Field names verified**: Cross-reference against GoalPageClient.tsx keyFields
- [ ] **Dual fields identified**: session_frequency AND session_length for 3 categories
- [ ] **Array field correct**: side_effects vs challenges vs null per category
- [ ] **Cost field logic**: Verify cost/startup_cost/ongoing_cost per category
- [ ] **Dropdown values validated**: Must match FORM_DROPDOWN_OPTIONS_REFERENCE.md EXACTLY
- [ ] **Data diversity preserved**: 5-8 options minimum (never hardcode 4)
- [ ] **Single solution test**: ALWAYS test 1 solution before batch

### Dropdown Value Format Requirements:
- Cost: "$50-$99.99" (NOT "$50-100")
- Frequency: "Weekly" (NOT "weekly")
- Length: "45-50 minutes" (NOT "45-50 min")
- All values must exist in form dropdown options

### Post-Generation Validation:
- [ ] **NO [Object Object] errors**: Test frontend display
- [ ] **All required fields populated**: 100% coverage for critical fields
- [ ] **Dropdown compatibility**: All values work in forms
- [ ] **Data diversity maintained**: No collapse from 5-8 to 2-4 options
- [ ] **Source attribution**: "research" or "studies" only

---

## 🎯 GENERATION SCRIPT REQUIREMENTS

### MANDATORY Script Structure:
```typescript
// 1. GOAL-SPECIFIC FILTERING
const solutions = await supabase
  .from('goal_implementation_links')
  .select('*')
  .eq('goal_id', SPECIFIC_GOAL_ID)  // CRITICAL: Must filter by goal
  .eq('data_display_mode', 'ai')

// 2. FIELD PRESERVATION PATTERN
const updatedFields = {
  ...existingFields,  // NEVER lose existing data
  ...newFields
}

// 3. VALIDATION BEFORE SAVE
if (Object.keys(updatedFields).length < Object.keys(existingFields).length) {
  throw new Error('Field loss detected!')
}

// 4. DROPDOWN VALIDATION
const validValues = FORM_DROPDOWN_OPTIONS[fieldName]
if (!validValues.includes(newValue)) {
  throw new Error(`Invalid dropdown value: ${newValue}`)
}
```

### Evidence-Based Generation Requirements:
- All patterns must reflect AI training data (medical literature, studies)
- NO mechanistic distributions (equal_fallback, smart_fallback)
- Realistic percentage patterns from research
- Source attribution: "research" or "studies"
- Preserve 5-8 option diversity

---

**Reference Source**: GoalPageClient.tsx CATEGORY_CONFIGS (lines 62-395)
**Last Verified**: September 24, 2025
**Authority**: This document overrides ALL previous field documentation