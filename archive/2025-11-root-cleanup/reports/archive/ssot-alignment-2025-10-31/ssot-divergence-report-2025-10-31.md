# SSOT Divergence Report - Complete Analysis
**Date:** October 31, 2025
**Analysis:** Line-by-line deep dive of generator & regenerator systems
**SSOT Authority:** `components/goal/GoalPageClient.tsx` CATEGORY_CONFIG (Lines 56-407)

---

## 🎯 Executive Summary

**Status:** 🔴 **CRITICAL MISALIGNMENT DETECTED**

**Findings:**
- **ALL 23 categories** have structural misalignment in `lib/config/solution-fields.ts`
- **V2 regenerator** completely divergent (hardcoded wrong mappings)
- **4 critical documentation files** need updates
- **1 false alarm** in documentation (line 905 bug doesn't exist)

**Impact:**
- Field generators create wrong field sets
- Validation checks for wrong fields
- Array fields mixed with display fields
- Cost field missing from dosage categories in some configs

---

## 🔴 CRITICAL ISSUE #1: Structural Mismatch

### SSOT Structure (GoalPageClient.tsx)
```typescript
medications: {
  keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],  // 4 display fields
  arrayField: 'side_effects'  // 1 separate array field
}
```

### Current lib/config/solution-fields.ts Structure
```typescript
medications: {
  requiredFields: ['frequency', 'length_of_use', 'time_to_results', 'side_effects'],  // ❌ Mixes array with display
  // ❌ Missing 'cost'
  // ❌ No arrayField property
}
```

**Problem:** The structure itself is wrong. Not just field names, but the architectural pattern.

---

## 🔴 CRITICAL ISSUE #2: Missing Cost Fields

| Category | SSOT keyFields | lib/config requiredFields | Missing? |
|----------|----------------|---------------------------|----------|
| medications | includes `cost` | ❌ No cost | Missing |
| supplements_vitamins | includes `cost` | ❌ No cost | Missing |
| natural_remedies | includes `cost` | ❌ No cost | Missing |
| beauty_skincare | includes `cost` | ❌ No cost | Missing |

**Impact:** Dosage categories don't have cost field generated/validated despite SSOT requiring it.

**Root Cause:** Comments in lib/config say "Cost moved to success screen (optional)" but SSOT shows cost IS in keyFields for display.

---

## 🔴 CRITICAL ISSUE #3: Array Fields Mixed with Key Fields

| Category | SSOT arrayField | lib/config requiredFields | Issue |
|----------|-----------------|---------------------------|-------|
| ALL 23 categories | Separate property | ❌ Included in array | Mixed concerns |

**Example:**
- SSOT: `therapists_counselors` has `arrayField: 'challenges'`
- lib/config: Includes `'challenges'` in `requiredFields` array
- Problem: Validation treats it like a display field, but frontend displays it separately as pills

---

## 🔴 CRITICAL ISSUE #4: V2 Completely Divergent

**File:** `scripts/generate-validated-fields-v2.ts` Lines 44-77

| Category | V2 Hardcoded | SSOT keyFields | Match? |
|----------|--------------|----------------|--------|
| doctors_specialists | `['session_frequency', 'wait_time', 'cost', 'time_to_results']` | `['time_to_results', 'wait_time', 'insurance_coverage', 'cost']` | ❌ Has session_frequency, missing insurance_coverage |
| exercise_movement | `['frequency', 'cost', 'time_to_results']` | `['time_to_results', 'frequency', 'duration', 'cost']` | ❌ Missing duration |
| professional_services | `['session_frequency', 'session_length', 'cost', 'time_to_results']` | `['time_to_results', 'session_frequency', 'specialty', 'cost']` | ❌ Has session_length, missing specialty |
| support_groups | `['meeting_frequency', 'group_size', 'cost', 'time_to_results']` | `['time_to_results', 'meeting_frequency', 'format', 'cost']` | ❌ Has group_size, missing format |

**V2 Status:** 🔴 **8+ categories completely wrong** - MUST BE DEPRECATED

---

## 💰 Cost Field Complexity Analysis

### Pattern 1: Single Cost Display (19 categories)
**SSOT:** `keyFields` includes `'cost'`
**lib/config:** Some missing from requiredFields (dosage categories)
**Action:** Add `'cost'` to keyFields for all categories that display it

### Pattern 2: Split Cost Collection → Single Display (4 categories)
**Categories:** meditation_mindfulness, exercise_movement, habits_routines, hobbies_activities

**Current Behavior:**
- Forms collect: `startup_cost`, `ongoing_cost`
- Code derives: single `cost` + `cost_type`
- SSOT shows: Only `'cost'` in keyFields

**lib/config Issue:**
- Has ALL of: `startup_cost`, `ongoing_cost`, `cost`, `cost_type` in requiredFields
- Creates confusion: which fields are required?

**Correct Interpretation:**
- **keyFields:** `['cost']` (what's displayed)
- **Collection fields:** `startup_cost`, `ongoing_cost` (for derivation)
- **Database stores:** All 4 fields for flexibility
- **Validation should check:** `cost` field has valid data (derived is present)

### Pattern 3: Cost Type (1 category)
**Category:** financial_products
**SSOT:** `keyFields` includes `'cost_type'` (not `'cost'`)
**lib/config:** ✅ Correct

### Pattern 4: Cost Impact (2 categories)
**Categories:** diet_nutrition, sleep
**SSOT:** `keyFields` includes `'cost'` with label "Cost Impact"
**lib/config:** ✅ Correct

---

## 📊 Complete Category-by-Category Divergence

### ✅ MINIMAL ISSUES (5 categories)
**Only array field separation needed:**
1. crisis_resources
2. diet_nutrition
3. sleep
4. products_devices
5. books_courses

### 🟡 MODERATE ISSUES (7 categories)
**Array field + field order issues:**
6. apps_software
7. groups_communities
8. support_groups
9. therapists_counselors
10. coaches_mentors
11. alternative_practitioners
12. medical_procedures

### 🔴 CRITICAL ISSUES (11 categories)
**Missing cost + array field + other issues:**
13. medications - Missing cost
14. supplements_vitamins - Missing cost
15. natural_remedies - Missing cost
16. beauty_skincare - Missing cost
17. meditation_mindfulness - Cost derivation confusion
18. exercise_movement - Cost derivation confusion
19. habits_routines - Cost derivation confusion
20. hobbies_activities - Cost derivation confusion (8 fields!)
21. doctors_specialists - Array field issue
22. professional_services - Array field issue
23. financial_products - Array field issue

---

## 📋 Remediation Actions Required

### Phase 2: Code Alignment

**File:** `lib/config/solution-fields.ts` (ALL 358 lines need review)

**Action 1:** Change structure for ALL 23 categories:
```typescript
// ❌ OLD STRUCTURE:
export interface CategoryConfig {
  requiredFields: string[]  // Mixed keyFields + arrayField
  fieldToDropdownMap: Record<string, string>
  contextSources: string[]
}

// ✅ NEW STRUCTURE:
export interface CategoryConfig {
  keyFields: string[]  // 3-4 display fields only
  arrayField?: string  // Separate: 'challenges' or 'side_effects'
  fieldToDropdownMap: Record<string, string>
  contextSources: string[]
  needsVariants?: boolean  // For dosage categories
}
```

**Action 2:** For EACH category:
1. Extract SSOT keyFields from GoalPageClient.tsx
2. Extract SSOT arrayField from GoalPageClient.tsx
3. Update CategoryConfig entry
4. Verify field order matches SSOT (time_to_results first for most)

**Action 3:** Update helper functions:
```typescript
// Update function name and return
export function getKeyFields(category: string): string[] {
  return CATEGORY_FIELD_CONFIG[category]?.keyFields || []
}

export function getArrayField(category: string): string | undefined {
  return CATEGORY_FIELD_CONFIG[category]?.arrayField
}

// Keep for backward compatibility, but combine keyFields + arrayField
export function getRequiredFields(category: string): string[] {
  const config = CATEGORY_FIELD_CONFIG[category]
  const fields = [...(config?.keyFields || [])]
  if (config?.arrayField) {
    fields.push(config.arrayField)
  }
  return fields
}
```

---

### Phase 3: V2 Deprecation

**Action 1:** Create archive directory
```bash
mkdir -p scripts/archive/deprecated-v2-regenerator-20251031
```

**Action 2:** Move V2 with deprecation notice
```bash
mv scripts/generate-validated-fields-v2.ts scripts/archive/deprecated-v2-regenerator-20251031/
```

**Action 3:** Add deprecation header to archived file

**Action 4:** Create archive README documenting issues

**Action 5:** Search for V2 references:
```bash
grep -r "generate-validated-fields-v2" . --include="*.ts" --include="*.md" --include="*.json" --exclude-dir=node_modules --exclude-dir=archive
```

---

### Phase 4: Documentation Updates

**CLAUDE.md:**
- Add SSOT section (after line 10)
- Remove/correct line 905 bug (around line 445)
- Add V2 deprecation notice
- Verify any category field examples

**README.md:**
- Update V2 references to V3
- Add SSOT reference if relevant

**ARCHITECTURE.md:**
- Update JSONB examples (lines 89-119) to show keyFields + arrayField structure
- Verify field examples

**solution-field-data-flow.md:**
- Ensure pipeline reflects SSOT structure

**Other READMEs:**
- Update as needed based on content

---

### Phase 5: Testing

**Create:** `tests/ssot-alignment.test.ts`

**Tests:**
1. lib/config keyFields match GoalPageClient for all 23 categories
2. lib/config arrayField matches GoalPageClient for all categories
3. No arrayField in keyFields
4. All 23 categories defined in both configs
5. Field structure validation (3-4 keyFields, 1 arrayField)

---

## 🎯 Success Criteria

**Code Alignment:**
- [ ] lib/config/solution-fields.ts uses keyFields + arrayField structure
- [ ] All 23 categories match SSOT exactly
- [ ] Cost field in keyFields for 19 categories
- [ ] Array fields separated from keyFields

**V2 Deprecation:**
- [ ] V2 moved to archive folder
- [ ] Deprecation notice added
- [ ] No active code references V2
- [ ] Archive README created

**Documentation:**
- [ ] CLAUDE.md has SSOT section
- [ ] False alarm removed/corrected
- [ ] V2 deprecation documented
- [ ] All READMEs updated

**Testing:**
- [ ] SSOT alignment test created
- [ ] All tests pass
- [ ] Test prevents future drift

---

## ⏱️ Time Estimates

- Phase 1: ✅ Complete (2 hours)
- Phase 2: 2.5 hours (code alignment)
- Phase 3: 1.5 hours (V2 deprecation)
- Phase 4: 3.5 hours (documentation)
- Phase 5: 2.25 hours (testing)
- Phase 6: 1.25 hours (validation)

**Total Remaining:** ~11 hours

---

## 🚨 Critical Path

1. **MUST** fix lib/config/solution-fields.ts FIRST (blocks everything)
2. **THEN** deprecate V2 (prevents future misuse)
3. **THEN** update docs (aligns understanding)
4. **THEN** create tests (prevents regression)
5. **FINALLY** verify complete alignment

This report serves as the blueprint for Phase 2-6 execution.
