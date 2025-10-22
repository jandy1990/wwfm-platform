# Cost Validation Fix Plan
**Created**: October 16, 2025
**Status**: Ready for Implementation
**Priority**: CRITICAL - Blocks form submissions across 3 templates (13 categories)

---

## Executive Summary

Found **3 broken form templates** affecting **13 categories** where frontend shows dynamic cost options but backend validates against hardcoded static options. Additionally found **6 SSOT/code mismatches** that will cause AI-generated data to fail validation.

**Impact**:
- SessionForm: 6/7 categories broken (therapists, doctors, coaches, alternative practitioners, professional services, medical procedures)
- PurchaseForm: 2/2 categories broken (books_courses, products_devices)
- DosageForm: 4/4 categories likely broken (medications, supplements, natural remedies, beauty skincare)

**Root Cause**: Validation mapping uses static `options` arrays instead of dynamic `getOptions()` functions like the working AppForm implementation.

---

## Phase 1: Fix Dynamic Cost Validation (CRITICAL)

### Objective
Make backend validation context-aware for all forms with dynamic cost selection.

### Changes Required

#### 1.1 Update `lib/config/solution-dropdown-options.ts`

**Change SessionForm categories from static to dynamic** (lines 984-1010):

```typescript
// BEFORE (BROKEN):
therapists_counselors: {
  field: 'cost',
  options: DROPDOWN_OPTIONS.session_cost_per  // ❌ Hardcoded
},

// AFTER (FIXED):
therapists_counselors: {
  field: 'cost',
  getOptions: (sessionCostType: string) => {
    if (sessionCostType === 'per_session') return DROPDOWN_OPTIONS.session_cost_per
    if (sessionCostType === 'monthly') return DROPDOWN_OPTIONS.session_cost_monthly
    if (sessionCostType === 'total') return DROPDOWN_OPTIONS.session_cost_total
    return DROPDOWN_OPTIONS.session_cost_per // default
  }
},
```

**Apply same pattern to**:
- doctors_specialists (per_session, monthly, total)
- coaches_mentors (per_session, monthly, total)
- alternative_practitioners (per_session, monthly, total)
- professional_services (per_session, monthly, total)
- medical_procedures (per_session, monthly, total)

**Change PurchaseForm categories**:

```typescript
// BEFORE (BROKEN):
products_devices: {
  field: 'cost',
  options: DROPDOWN_OPTIONS.purchase_cost_onetime  // ❌ Hardcoded
},

// AFTER (FIXED):
products_devices: {
  field: 'cost',
  getOptions: (purchaseCostType: string) => {
    if (purchaseCostType === 'one_time') return DROPDOWN_OPTIONS.purchase_cost_onetime
    if (purchaseCostType === 'subscription') return DROPDOWN_OPTIONS.purchase_cost_subscription
    return DROPDOWN_OPTIONS.purchase_cost_onetime // default
  }
},
```

**Apply same pattern to**:
- books_courses

**Change DosageForm categories**:

```typescript
// BEFORE (BROKEN):
medications: {
  field: 'cost',
  options: DROPDOWN_OPTIONS.dosage_cost_monthly  // ❌ Hardcoded
},

// AFTER (FIXED):
medications: {
  field: 'cost',
  getOptions: (dosageCostType: string) => {
    if (dosageCostType === 'monthly') return DROPDOWN_OPTIONS.dosage_cost_monthly
    if (dosageCostType === 'one_time') return DROPDOWN_OPTIONS.dosage_cost_onetime
    return DROPDOWN_OPTIONS.dosage_cost_monthly // default
  }
},
```

**Apply same pattern to**:
- supplements_vitamins
- natural_remedies
- beauty_skincare

#### 1.2 Update `lib/solutions/solution-field-validator.ts`

**Modify validation to pass cost type context**:

Current code around line 91-130 validates fields but doesn't pass cost type context.

**Required changes**:
1. Extract cost type from fields (e.g., `session_cost_type`, `purchase_cost_type`, `cost_type`)
2. Pass cost type to `getDropdownSource()` or create new `getDropdownSourceWithContext()`
3. Update validation calls to use dynamic options

**New function signature**:
```typescript
function getDropdownSourceWithContext(
  fieldName: string,
  category: string,
  contextFields: Record<string, unknown>
): string | string[] | undefined
```

#### 1.3 Update `lib/config/solution-fields.ts`

**No changes required** - This file defines required fields, not validation logic.

### Testing Phase 1

Test each affected category with all cost type variations:

**SessionForm**:
- [ ] therapists_counselors - per_session cost
- [ ] therapists_counselors - monthly cost
- [ ] therapists_counselors - total cost
- [ ] doctors_specialists - all 3 cost types
- [ ] coaches_mentors - all 3 cost types
- [ ] alternative_practitioners - all 3 cost types
- [ ] professional_services - all 3 cost types
- [ ] medical_procedures - all 3 cost types

**PurchaseForm**:
- [ ] products_devices - one_time cost
- [ ] products_devices - subscription cost
- [ ] books_courses - one_time cost
- [ ] books_courses - subscription cost

**DosageForm**:
- [ ] medications - monthly cost
- [ ] medications - one_time cost
- [ ] supplements_vitamins - both cost types
- [ ] natural_remedies - both cost types
- [ ] beauty_skincare - both cost types

---

## Phase 2: Align SSOT to Code

### Objective
Update SSOT document to match production code values, preventing future AI data generation mismatches.

### 2.1 Update `FORM_DROPDOWN_OPTIONS_REFERENCE.md`

**Session Costs - Per Session** (lines 470-478):

```markdown
**Per Session:**
- "Free"
- "Under $50"
- "$50-100"
- "$100-150"        # Changed from $100-200
- "$150-250"        # Changed from $200-300
- "$250-500"        # Changed from $300-500
- "Over $500"
- "Don't remember"
```

**Session Costs - Monthly** (lines 480-487):

```markdown
**Monthly:**
- "Free"
- "Under $10/month"      # Changed from "Under $100"
- "$10-25/month"         # Changed from "$100-300"
- "$25-50/month"         # NEW
- "$50-100/month"        # Changed from "$300-500"
- "$100-200/month"       # Changed from "$500-1000"
- "Over $200/month"      # Changed from "Over $1000"
- "Don't remember"
```

**AppForm - One-time** (lines 33-42):

```markdown
#### One-time Cost Options (when cost_type = "one_time")
- "Free"
- "Under $5"
- "$5-$9.99"            # Changed from "Under $10"
- "$10-$24.99"          # Changed from "$10-25"
- "$25-$49.99"          # Changed from "$25-50"
- "$50-$99.99"          # Changed from "$50-100"
- "$100-$249.99"        # Changed from "$100-250"
- "$250+"               # Changed from "Over $250"
```

**AppForm - Subscription** (lines 43-51):

```markdown
#### Subscription Cost Options (when cost_type = "subscription")
- "Free"
- "Under $5/month"
- "$5-$9.99/month"      # Changed from "$5-10/month"
- "$10-$19.99/month"    # Changed from "$10-25/month"
- "$20-$49.99/month"    # Changed from "$25-50/month"
- "$50-$99.99/month"    # Changed from "$50-100/month"
- "$100+/month"         # Changed from "Over $100/month"
```

**HobbyForm - Startup** (lines 211-217):

```markdown
**Startup:**
- "Free/No startup cost"
- "Under $50"
- "$50-$100"            # Changed from "$50-200"
- "$100-$250"           # NEW
- "$250-$500"           # Changed from "$200-500"
- "$500-$1,000"         # Changed from "$500-1000"
- "$1,000-$2,500"       # NEW
- "$2,500-$5,000"       # NEW
- "Over $5,000"         # Changed from "Over $1000"
```

**HobbyForm - Ongoing** (lines 218-223):

```markdown
**Ongoing:**
- "Free/No ongoing cost"
- "Under $25/month"
- "$25-$50/month"       # Changed from "$25-100/month"
- "$50-$100/month"      # NEW
- "$100-$200/month"     # Changed from "$100-300/month"
- "$200-$500/month"     # NEW
- "Over $500/month"     # Changed from "Over $300/month"
```

### 2.2 Add Missing Dropdown Definitions

Need to add to `lib/config/solution-dropdown-options.ts`:

**Purchase costs** (currently missing):
```typescript
purchase_cost_subscription: [
  "Free",
  "Under $10/month",
  "$10-25/month",
  "$25-50/month",
  "$50-100/month",
  "Over $100/month",
  "Don't remember"
],
```

**Dosage one-time costs** (currently missing):
```typescript
dosage_cost_onetime: [
  "Free",
  "Under $20",
  "$20-50",
  "$50-100",
  "$100-250",
  "$250-500",
  "Over $500",
  "Don't remember"
],
```

---

## Phase 3: Data Migration

### Objective
Transform existing AI-generated data to use new SSOT-aligned values.

### 3.1 Identify Affected Records

Query production database for solutions with mismatched cost values:

```sql
-- Session costs (monthly) - most critical
SELECT s.id, s.title, s.solution_category,
       gil.aggregated_fields->>'session_cost'
FROM solutions s
JOIN goal_implementation_links gil ON gil.implementation_id = s.id
WHERE s.solution_category IN (
  'therapists_counselors', 'doctors_specialists', 'coaches_mentors',
  'alternative_practitioners', 'professional_services', 'medical_procedures'
)
AND gil.aggregated_fields->>'session_cost_type' = 'monthly'
AND gil.aggregated_fields->>'session_cost' IN (
  'Under $100', '$100-300', '$300-500', '$500-1000', 'Over $1000'
);

-- Count affected records
SELECT solution_category, COUNT(*) as affected_count
FROM solutions s
JOIN goal_implementation_links gil ON gil.implementation_id = s.id
WHERE -- same WHERE clause as above
GROUP BY solution_category;
```

### 3.2 Create Migration Script

**File**: `scripts/migrations/migrate-cost-values-20251016.ts`

**Logic**:
1. Backup current data to `aggregated_fields_backup`
2. Transform values using mapping table:
   - "Under $100" → "Under $10/month"
   - "$100-300" → "$50-100/month" (best fit)
   - "$300-500" → "$100-200/month" (best fit)
   - "$500-1000" → "Over $200/month" (best fit)
   - "Over $1000" → "Over $200/month"
3. Update `aggregated_fields` with new values
4. Log all transformations for review

**Mapping Strategy**:
- Conservative approach: Map to closest lower bound
- Log ambiguous mappings for manual review
- Create rollback script

### 3.3 Validation After Migration

Run validation script to ensure:
- All cost values now match code dropdowns
- No data loss occurred
- Distribution data integrity maintained
- Frontend displays correctly

---

## Phase 4: Comprehensive Testing

### 4.1 Automated Testing

Create test suite: `tests/e2e/cost-validation.spec.ts`

Test matrix:
- 9 form templates × cost variations = ~30 test cases
- Verify validation accepts correct values
- Verify validation rejects incorrect values
- Verify submission succeeds end-to-end

### 4.2 Chrome DevTools Manual Testing

Continue DevTools testing started in HANDOVER.md:

**Completed**:
- [x] SessionForm - therapists_counselors (found the bug!)

**Pending**:
- [ ] SessionForm - all other cost types
- [ ] PracticeForm - meditation_mindfulness
- [ ] AppForm - apps_software
- [ ] DosageForm - medications (all cost types)
- [ ] PurchaseForm - books_courses (all cost types)
- [ ] HobbyForm - hobbies_activities
- [ ] CommunityForm - groups_communities
- [ ] LifestyleForm - diet_nutrition
- [ ] FinancialForm - financial_products

---

## Implementation Checklist

### Phase 1: Fix Validation (Day 1)
- [ ] Update SessionForm validation mappings (6 categories)
- [ ] Update PurchaseForm validation mappings (2 categories)
- [ ] Update DosageForm validation mappings (4 categories)
- [ ] Update solution-field-validator.ts to pass context
- [ ] Add missing dropdown option arrays
- [ ] Test SessionForm with monthly cost selection
- [ ] Test all affected categories with Chrome DevTools

### Phase 2: Align SSOT (Day 1-2)
- [ ] Update FORM_DROPDOWN_OPTIONS_REFERENCE.md
- [ ] Add purchase_cost_subscription dropdown
- [ ] Add dosage_cost_onetime dropdown
- [ ] Document changes in HANDOVER.md

### Phase 3: Data Migration (Day 2)
- [ ] Query database for affected records
- [ ] Create migration script with backups
- [ ] Test migration on sample data
- [ ] Run migration on production
- [ ] Validate migrated data

### Phase 4: Testing (Day 2-3)
- [ ] Create automated test suite
- [ ] Run full Chrome DevTools testing matrix
- [ ] Fix any issues discovered
- [ ] Document all test results

---

## Risk Assessment

**High Risk**:
- Data migration could corrupt AI-generated distributions if not careful
- Mapping SSOT values to code values requires judgment calls

**Medium Risk**:
- Missing edge cases in dynamic validation logic
- Performance impact of function calls vs static arrays (negligible)

**Low Risk**:
- SSOT alignment - documentation only, no code impact

**Mitigation**:
- Comprehensive backups before migration
- Staged rollout with validation checks
- Rollback script prepared
- Conservative mapping strategy (prefer lower bounds)

---

## Success Criteria

1. ✅ All 3 broken form templates accept valid dynamic cost submissions
2. ✅ SSOT matches code 100% for all cost fields
3. ✅ AI data migrated successfully with <1% data loss
4. ✅ All 9 form templates pass Chrome DevTools E2E testing
5. ✅ Zero validation errors for valid user inputs
6. ✅ Proper error messages for invalid inputs

---

## Files Modified

### Code Changes:
1. `lib/config/solution-dropdown-options.ts` - Dynamic validation mappings
2. `lib/solutions/solution-field-validator.ts` - Context-aware validation
3. `lib/config/solution-dropdown-options.ts` - Add missing dropdown arrays

### Documentation:
1. `FORM_DROPDOWN_OPTIONS_REFERENCE.md` - SSOT alignment
2. `HANDOVER.md` - Update current status
3. `COST_VALIDATION_FIX_PLAN.md` - This document

### Scripts:
1. `scripts/migrations/migrate-cost-values-20251016.ts` - Data migration
2. `tests/e2e/cost-validation.spec.ts` - Test suite

---

## Timeline

**Day 1 (4-6 hours)**:
- Phase 1: Fix validation logic (2-3 hours)
- Phase 2: Align SSOT (1 hour)
- Initial testing (1-2 hours)

**Day 2 (4-6 hours)**:
- Phase 3: Data migration (2-3 hours)
- Phase 4: Comprehensive testing (2-3 hours)

**Total Estimate**: 8-12 hours spread over 2 days

---

## Next Steps

1. Get user approval for this plan
2. Create git branch: `fix/cost-validation-dynamic`
3. Start Phase 1 implementation
4. Test incrementally as each category is fixed
5. Proceed to Phase 2 once Phase 1 validation passes
