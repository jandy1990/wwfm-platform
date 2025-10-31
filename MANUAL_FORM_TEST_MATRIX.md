# WWFM Manual Form Testing Checklist

**GOAL FOR ALL TESTS:** "Reduce anxiety"
**URL:** http://localhost:3002/test-forms
**Total Forms:** 23 categories

**NOTE:** Solution names are pre-populated by the forms. Don't change them!
**All values below verified against production database** (2025-10-28)

**IMPORTANT (Oct 31, 2025 Update):**
- References to deleted files removed (validate-documentation-sync.ts, etc.)
- Documentation consolidated: Quality standards → CLAUDE.md, Form system → ARCHITECTURE.md
- SSOT alignment complete: lib/config/solution-fields.ts now uses keyFields + arrayField structure
- See "INTERSECTING DOCUMENTS" section below for current file locations

---

## 📊 TESTING STATUS TRACKER

**Last Updated:** 2025-10-31
**Progress:** 5/23 forms tested (22%)

**COMPLETED TODAY:**
1. ✅ Apps & Software (AppForm)
2. ✅ Medications (DosageForm)
3. ✅ Supplements & Vitamins (DosageForm)
4. ✅ Natural Remedies (DosageForm)
5. ✅ Beauty & Skincare (DosageForm)

**NEXT TO TEST:** Therapists & Counselors (SessionForm) - Form #6

| # | Form | Category | Status | Date Tested | Notes |
|---|------|----------|--------|-------------|-------|
| 1 | AppForm | Apps & Software | ✅ PASS | 2025-10-31 | One-time cost options updated |
| 2 | DosageForm | Medications | ✅ PASS | 2025-10-31 | 15/15 fields validated, cost_type removed |
| 3 | DosageForm | Supplements & Vitamins | ✅ PASS | 2025-10-31 | 16/16 fields validated, test matrix corrected |
| 4 | DosageForm | Natural Remedies | ✅ PASS | 2025-10-31 | 15/15 fields validated, all perfect |
| 5 | DosageForm | Beauty & Skincare | ✅ PASS | 2025-10-31 | 14/14 fields validated, no brand/form fields |
| 6 | SessionForm | Therapists & Counselors | ⬜ Not Tested | - | - |
| 7 | SessionForm | Doctors & Specialists | ⬜ Not Tested | - | - |
| 8 | SessionForm | Coaches & Mentors | ⬜ Not Tested | - | - |
| 9 | SessionForm | Alternative Practitioners | ⬜ Not Tested | - | - |
| 10 | SessionForm | Professional Services | ⬜ Not Tested | - | - |
| 11 | SessionForm | Crisis Resources | ⬜ Not Tested | - | - |
| 12 | PracticeForm | Meditation & Mindfulness | ⬜ Not Tested | - | - |
| 13 | PracticeForm | Exercise & Movement | ⬜ Not Tested | - | - |
| 14 | PracticeForm | Habits & Routines | ⬜ Not Tested | - | - |
| 15 | HobbyForm | Hobbies & Activities | ⬜ Not Tested | - | - |
| 16 | LifestyleForm | Diet & Nutrition | ⬜ Not Tested | - | - |
| 17 | LifestyleForm | Sleep | ⬜ Not Tested | - | - |
| 18 | CommunityForm | Support Groups | ⬜ Not Tested | - | - |
| 19 | CommunityForm | Groups & Communities | ⬜ Not Tested | - | - |
| 20 | FinancialForm | Financial Products | ⬜ Not Tested | - | - |
| 21 | PurchaseForm | Products & Devices | ⬜ Not Tested | - | - |
| 22 | PurchaseForm | Books & Courses | ⬜ Not Tested | - | - |
| 23 | PurchaseForm | Online Services | ⬜ Not Tested | - | - |

**Status Legend:**
- ⬜ Not Tested
- 🔄 In Progress
- ✅ PASS - Form submitted successfully, optional fields working
- ❌ FAIL - Issues found during testing
- ⚠️ PARTIAL - Form works but has minor issues

**Testing Instructions:**
1. Update status to 🔄 when starting a form
2. Mark ✅ PASS when both initial submission AND optional fields complete successfully
3. Mark ❌ FAIL if errors occur, add details in Notes column
4. Update "Last Updated" and "Progress" counts at top
5. Add any relevant notes about issues or updates

---

## 🤖 WORKFLOW FOR CLAUDE (MANDATORY AFTER EACH TEST)

**CURRENT STATUS (as of 2025-10-31):**
- ✅ **4 forms completed and validated** (Apps, Medications, Supplements, Natural Remedies)
- 🔄 **Next form to test:** Beauty & Skincare (Form #5)
- 📍 **Current progress:** 4/23 forms (17%)

**CRITICAL:** After user completes EACH form, follow this exact process:

### 1. User Says "I've completed [Form Name]"

### 2. You Validate Database
- Use SQL query from "DATABASE VALIDATION INSTRUCTIONS" section below
- Replace `SOLUTION_NAME` with the test solution name from the form section
- Validate EVERY field against the test matrix specification
- Create validation table showing Expected vs Actual

### 3. Launch Sub-Agent for Independent Validation
- Use Task tool with `general-purpose` subagent
- Give them the same task (query DB + validate against test matrix)
- They should reach identical conclusions

### 4. Compare Results
- Your validation vs Sub-agent validation
- If both match: ✅ Report success to user
- If different: ⚠️ Investigate discrepancy

### 5. Update Status Tracker
- Change form status from 🔄 to ✅ PASS (or ❌ FAIL)
- Update "Last Updated" date
- Update "Progress" counter
- Add any notes to the Notes column

### 6. Report to User
Present a summary table with validation results from both validators.

**⚠️ DO NOT SKIP THIS WORKFLOW** - The user needs field-by-field validation after every form!

---

## 🔗 INTERSECTING DOCUMENTS - CHANGE PROPAGATION MAP

**CRITICAL:** When making changes to forms, those changes ripple through multiple files. This section maps WHAT type of change triggers updates to WHICH files.

### 📊 Change Type Matrix

#### 🔵 Type 1: Adding/Removing a Form Field

**Triggers updates to:**

1. **Form Component** (ALWAYS)
   - `components/organisms/solutions/forms/[FormName].tsx`
   - Add/remove field state, inputs, validation

2. **Dropdown Options Config** (if field has dropdown)
   - `lib/config/solution-dropdown-options.ts` - Add dropdown options array
   - `scripts/solution-generator/config/dropdown-options.ts` - Mirror for generators

3. **Category Field Config** (ALWAYS)
   - `lib/config/solution-fields.ts` - Add field to `keyFields` or `arrayField`
   - Update `fieldToDropdownMap` to map field to dropdown options

4. **SSOT Documentation** (ALWAYS)
   - `docs/solution-fields-ssot.md` - Update category field matrix table

5. **Dropdown Reference Docs** (if field has dropdown)
   - `FORM_DROPDOWN_OPTIONS_REFERENCE.md` - Document dropdown options

6. **Test Files** (ALWAYS)
   - `tests/e2e/forms/form-specific-fillers.ts` - Add field to test filler logic
   - `tests/e2e/forms/[form-name]-complete.spec.ts` - Update test expectations
   - `MANUAL_FORM_TEST_MATRIX.md` - Update test specification

7. **Generator Prompts** (if AI generates this data)
   - `scripts/solution-generator/prompts/master-prompts-improved.ts` - Add field examples
   - `scripts/solution-generator/generators/solution-generator.ts` - May need field handling

8. **Validation Scripts** (ALWAYS)
   - `lib/ai-generation/fields/validator.ts` - May need validation rules
   - `scripts/validate-field-quality.ts` - May need field quality checks

9. **Database** (RARELY - fields stored in JSONB)
   - ⚠️ Usually NO database changes needed (JSONB flexibility)
   - Only if adding new table column or constraint

---

#### 🟢 Type 2: Changing Dropdown Options (Add/Remove/Rename Values)

**Example:** Changing app one-time costs from "$250+" to "$1000+"

**Triggers updates to:**

1. **Dropdown Options Configs** (ALWAYS)
   - `lib/config/solution-dropdown-options.ts` - Update options array
   - `scripts/solution-generator/config/dropdown-options.ts` - Mirror change

2. **Form Components** (ALWAYS)
   - `components/organisms/solutions/forms/[FormName].tsx` - Update SelectItem values

3. **Reference Documentation** (ALWAYS)
   - `FORM_DROPDOWN_OPTIONS_REFERENCE.md` - Update documented options

4. **Test Files** (ALWAYS)
   - `tests/e2e/forms/form-specific-fillers.ts` - Update test values if needed
   - `MANUAL_FORM_TEST_MATRIX.md` - Update expected values in test cases

5. **Generator Prompts** (if examples exist)
   - `scripts/solution-generator/prompts/master-prompts-improved.ts` - Update examples

6. **Validation Scripts** (if they check specific values)
   - `scripts/validate-field-quality.ts` - Update expected values if needed

7. **Existing Data Migration** (ONLY if renaming values)
   - Create migration script to update existing database values
   - ⚠️ CRITICAL: Test on subset first!

---

#### 🟡 Type 3: Changing Field Behavior/Logic (e.g., cost_type removal)

**Example:** Removing cost_type for medications

**Triggers updates to:**

1. **Form Component** (ALWAYS)
   - `components/organisms/solutions/forms/[FormName].tsx` - Update state, UI, submission logic

2. **Category Field Config** (ALWAYS)
   - `lib/config/solution-fields.ts` - Update `fieldToDropdownMap` if fallback behavior changes

3. **Validation Logic** (ALWAYS)
   - `lib/solutions/solution-field-validator.ts` - Update conditional validation
   - May affect how cost fields are validated

4. **Test Files** (ALWAYS)
   - `tests/e2e/forms/form-specific-fillers.ts` - Update test logic
   - `MANUAL_FORM_TEST_MATRIX.md` - Update test specification

5. **Generator Prompts** (ALWAYS)
   - `scripts/solution-generator/prompts/master-prompts-improved.ts` - Update examples
   - Ensure AI generates correct format

6. **Documentation** (ALWAYS)
   - `FORM_DROPDOWN_OPTIONS_REFERENCE.md` - Update behavior notes
   - `docs/solution-fields-ssot.md` - Update if display fields change
   - `ARCHITECTURE.md` - Update form system section

---

#### 🟣 Type 4: Adding a New Category

**Example:** Adding "mental_health_apps" category

**Triggers updates to:**

1. **Database Schema** (ALWAYS)
   - Migration to add category to enum constraint
   - Run via Supabase migrations

2. **Category Field Config** (ALWAYS)
   - `lib/config/solution-fields.ts` - Add new category entry with all fields

3. **Form Mapping** (ALWAYS)
   - Determine which of 9 forms handles this category
   - Update form's category list/mapping

4. **Dropdown Options** (if new options needed)
   - `lib/config/solution-dropdown-options.ts` - Add category-specific dropdowns
   - `scripts/solution-generator/config/dropdown-options.ts` - Mirror

5. **SSOT Documentation** (ALWAYS)
   - `docs/solution-fields-ssot.md` - Add category to matrix

6. **Test Files** (ALWAYS)
   - Add test case to `MANUAL_FORM_TEST_MATRIX.md`
   - Add to `tests/e2e/forms/form-specific-fillers.ts`
   - Create test spec file

7. **Generator System** (ALWAYS)
   - `scripts/solution-generator/prompts/master-prompts-improved.ts` - Add to examples
   - Update generator to handle new category

8. **Auto-Categorization** (ALWAYS)
   - Add keywords to `category_keywords` table in database
   - Test auto-categorization works

---

#### 🔴 Type 5: Changing Cost Structure (Type, Format, Options)

**Example:** Changing from monthly to one-time costs

**Triggers updates to:**

1. **Form Component** (ALWAYS)
   - `components/organisms/solutions/forms/[FormName].tsx` - Update cost UI, toggles, submission

2. **Dropdown Options** (ALWAYS)
   - `lib/config/solution-dropdown-options.ts` - Update cost options arrays
   - `scripts/solution-generator/config/dropdown-options.ts` - Mirror

3. **Category Field Config** (ALWAYS)
   - `lib/config/solution-fields.ts` - Update `fieldToDropdownMap` cost mapping

4. **Validation Logic** (ALWAYS)
   - `lib/solutions/solution-field-validator.ts` - Update cost validation logic

5. **Test Files** (ALWAYS)
   - `tests/e2e/forms/form-specific-fillers.ts` - Update cost test values
   - `MANUAL_FORM_TEST_MATRIX.md` - Update expected cost values

6. **Generator Prompts** (ALWAYS)
   - `scripts/solution-generator/prompts/master-prompts-improved.ts` - Update cost examples

7. **Documentation** (ALWAYS)
   - `FORM_DROPDOWN_OPTIONS_REFERENCE.md` - Update cost options
   - `docs/solution-fields-ssot.md` - Update if field name changes

8. **Existing Data** (if changing format)
   - May need migration script to convert existing cost values
   - Check `goal_implementation_links.aggregated_fields`

---

### 📁 Complete File Reference by Category

#### 🎨 **FORM COMPONENTS** (9 files)
```
components/organisms/solutions/forms/
├── AppForm.tsx                    # Apps & Software
├── DosageForm.tsx                 # Medications, Supplements, Natural Remedies, Beauty
├── SessionForm.tsx                # Therapists, Doctors, Coaches, Alt Practitioners, Professional, Crisis, Medical Procedures
├── PracticeForm.tsx               # Meditation, Exercise, Habits
├── HobbyForm.tsx                  # Hobbies & Activities
├── LifestyleForm.tsx              # Diet, Sleep
├── CommunityForm.tsx              # Support Groups, Groups & Communities
├── FinancialForm.tsx              # Financial Products
└── PurchaseForm.tsx               # Products, Books, Online Services

Shared:
├── shared/FormSectionHeader.tsx
├── shared/ProgressCelebration.tsx
├── shared/TestModeCountdown.tsx
├── shared/validation-helpers.ts
└── shared/constants.ts
```

**Update when:** Adding/removing fields, changing field behavior, updating UI

---

#### ⚙️ **CONFIGURATION FILES** (6 files)
```
lib/config/
├── solution-dropdown-options.ts   # All dropdown options (MAIN SOURCE)
├── solution-fields.ts             # Category field mappings (keyFields + arrayField structure)
└── features.ts                    # Feature flags (rarely needs updates)

scripts/solution-generator/config/
├── dropdown-options.ts            # Generator dropdown options (MIRROR of lib/config)
├── category-fields.ts             # Re-exports from lib/ai-generation/fields/category.ts
└── expansion-rules.ts             # Solution expansion rules

Note: After Oct 31 2025 SSOT alignment, lib/config/solution-fields.ts now uses:
  - keyFields: [3-4 display fields]
  - arrayField: 'challenges' or 'side_effects' (separate)
```

**Update when:**
- Dropdown options change → Both dropdown-options.ts files
- Field mappings change → solution-fields.ts, category-fields.ts
- New category added → All config files

---

#### ✅ **VALIDATION & PROCESSING** (8 files)
```
lib/solutions/
└── solution-field-validator.ts    # Validates form submissions

lib/ai-generation/fields/
├── validator.ts                   # AI field validation
├── aggregation.ts                 # Field aggregation logic
├── deduplicator.ts                # Removes duplicate values
├── value-mapper.ts                # Maps old → new dropdown values
└── category.ts                    # Category-specific logic (exports getKeyFields, getArrayField)

lib/services/
├── solution-aggregator.ts         # Aggregates ratings → aggregated_fields
└── aggregation-queue-processor.ts # Background aggregation

scripts/
├── validate-field-quality.ts      # Checks field data quality
├── validate-distribution-format.ts # Checks distribution format
└── audit-category-alignment.ts    # Audits category alignment

Note: validate-documentation-sync.ts was removed (Oct 31 2025 cleanup)
```

**Update when:**
- Field validation rules change
- Dropdown options change (validator needs new valid values)
- Cost logic changes (validator needs new cost handling)
- Aggregation logic changes

---

#### 🤖 **AI GENERATORS & REGENERATORS** (10+ files)
```
scripts/solution-generator/
├── generators/solution-generator.ts     # Main generator
├── prompts/master-prompts-improved.ts   # Field examples (UPDATE when fields change!)
├── prompts/master-prompts-v2.ts         # Alternative prompts
├── database/inserter.ts                 # Inserts generated data
├── database/canonical.ts                # Canonical data operations
└── utils/value-mapper.ts                # Maps generated → valid values

scripts/
├── generate-validated-fields-v3.ts      # Field regeneration script
├── evidence-based-distributions.ts      # Evidence-based field generation
└── comprehensive-field-audit.ts         # Audits field quality

lib/ai-generation/fields/
└── prompt.ts                            # Field generation prompts
```

**Update when:**
- Adding/removing fields (update prompts with examples)
- Dropdown options change (update examples, value mapper)
- Field names change (update prompts, generators)

---

#### 📚 **DOCUMENTATION** (7 files)
```
Root Documentation:
├── FORM_DROPDOWN_OPTIONS_REFERENCE.md   # Complete dropdown reference (UPDATE ALWAYS)
├── MANUAL_FORM_TEST_MATRIX.md           # Manual testing specs (UPDATE ALWAYS)
├── ARCHITECTURE.md                      # System architecture (update if major changes)
├── CLAUDE.md                            # AI assistant guide (update for patterns)
└── README.md                            # Project overview (rarely needs form updates)

docs/
├── solution-fields-ssot.md              # Category-field mappings (UPDATE ALWAYS)
├── solution-field-data-flow.md          # Data flow documentation
└── database/schema.md                   # Database schema docs

Note: Quality standards and form system details are in CLAUDE.md and ARCHITECTURE.md respectively
```

**Update when:**
- ANY form change → Update FORM_DROPDOWN_OPTIONS_REFERENCE.md
- Field changes → Update docs/solution-fields-ssot.md
- Behavior changes → Update ARCHITECTURE.md forms section
- Quality/validation changes → Update CLAUDE.md
- New test cases → Update MANUAL_FORM_TEST_MATRIX.md

---

#### 🧪 **TESTING FILES** (15+ files)
```
tests/e2e/forms/
├── form-specific-fillers.ts             # Test data for all forms (UPDATE ALWAYS)
├── form-configs.ts                      # Form configurations
├── app-form-complete.spec.ts            # App form E2E test
├── dosage-form-complete.spec.ts         # Dosage form E2E test
├── dosage-form-medications.spec.ts      # Medications specific
├── dosage-form-beauty-skincare.spec.ts  # Beauty specific
├── dosage-form-natural-remedies.spec.ts # Natural remedies specific
├── session-form-complete.spec.ts        # Session form E2E test
├── practice-form-complete.spec.ts       # Practice form E2E test
├── hobby-form-complete.spec.ts          # Hobby form E2E test
├── lifestyle-form-complete.spec.ts      # Lifestyle form E2E test
├── community-form-complete.spec.ts      # Community form E2E test
├── financial-form-complete.spec.ts      # Financial form E2E test
└── purchase-form-complete.spec.ts       # Purchase form E2E test

Root:
└── MANUAL_FORM_TEST_MATRIX.md           # Manual testing specifications
```

**Update when:**
- Field changes → Update form-specific-fillers.ts
- Dropdown changes → Update expected values in specs
- Test case changes → Update MANUAL_FORM_TEST_MATRIX.md

---

#### 🗄️ **DATABASE & MIGRATIONS** (Rarely)
```
Database Tables (via Supabase):
├── solutions                      # Solution records
├── solution_variants              # Variant records
├── ratings                        # Contains solution_fields JSONB
└── goal_implementation_links      # Contains aggregated_fields JSONB

Schema Constraints:
└── category enum constraint       # When adding new category

Validation:
└── CHECK constraints              # Rarely - only for strict validation
```

**Update when:**
- New category added → Update enum constraint
- New table/column needed → Create migration (RARE)
- ⚠️ JSONB fields (solution_fields, aggregated_fields) → Usually NO migration needed!

---

#### 🔧 **SERVER ACTIONS** (2 files)
```
app/actions/
├── submit-solution.ts             # Handles form submission
└── update-solution-fields.ts      # Handles success screen optional fields
```

**Update when:**
- Submission logic changes
- New required validation needed
- Field processing changes

---

### 🎯 Quick Reference: "I Changed X, What Do I Update?"

| Change Type | Primary Files | Secondary Files | Optional Files |
|-------------|---------------|-----------------|----------------|
| **Added field to form** | Form.tsx, solution-fields.ts, solution-dropdown-options.ts | SSOT docs, test fillers, prompts | Validators |
| **Removed field from form** | Form.tsx, solution-fields.ts | SSOT docs, test fillers, test matrix | Generators |
| **Changed dropdown options** | solution-dropdown-options.ts (both), Form.tsx | DROPDOWN_REFERENCE.md, test matrix | Prompts |
| **Changed cost structure** | Form.tsx, solution-fields.ts, validator.ts | Dropdown options, test files | Migration script |
| **Added new category** | Database enum, solution-fields.ts, forms | All configs, all docs, all tests | Everything! |
| **Changed field name** | Form.tsx, solution-fields.ts | SSOT docs, generators, validators, tests | Migration script |

---

### ⚠️ CRITICAL REMINDERS

1. **Always update BOTH dropdown files:**
   - `lib/config/solution-dropdown-options.ts` (frontend uses this)
   - `scripts/solution-generator/config/dropdown-options.ts` (AI generators use this)

2. **Always update test files when changing forms:**
   - `tests/e2e/forms/form-specific-fillers.ts` (E2E tests will fail otherwise)
   - `MANUAL_FORM_TEST_MATRIX.md` (manual testing will be outdated)

3. **SSOT documents are authoritative:**
   - `docs/solution-fields-ssot.md` - What fields exist
   - `FORM_DROPDOWN_OPTIONS_REFERENCE.md` - What values are valid
   - When code and docs disagree → Update docs to match code!

4. **Database changes are RARE:**
   - JSONB fields are flexible by design
   - Only migrate data if renaming values that exist in production
   - Test migrations on subset first!

5. **Archive files don't need updates:**
   - Files in `scripts/archive/*` are deprecated
   - Files in `docs/archive/*` are historical
   - Skip these when making changes

---

## ☐ 1. Apps & Software (AppForm)
**Solution:** `Test apps software solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐⭐ (5)

**Step 1:**
- Usage Frequency: "Daily"
- Subscription Type: "Monthly subscription"
- Cost: "$10-$19.99/month"
- Time to Results: "3-4 weeks"

**Step 2 - Challenges:** Subscription too expensive, Too many notifications

**Step 3 - Failed Solutions:**
1. Failed-App-1 (2 stars)
2. Failed-App-2 (1 star)

**Success Screen:**
- Platform: "iOS (iPhone/iPad)"
- Notes: "TEST: App works great for daily tracking"

---

## ☐ 2. Medications (DosageForm)
**Solution:** `Test medications solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐ (4)

**Step 1:**
- Dose Amount: "500"
- Dose Unit: "mg"
- Frequency: "twice daily"
- Length of Use: "3-6 months"
- Time to Results: "1-2 weeks"

**Step 2 - Side Effects:** Nausea, Headache

**Step 3 - Failed Solutions:**
1. Failed-Med-1 (1 star)

**Success Screen:**
- Cost: "$20-50"
- Brand: "Generic available"
- Form: "Tablet"
- Notes: "TEST: Medication taken with food"

---

## ☐ 3. Supplements & Vitamins (DosageForm)
**Solution:** `Test supplements vitamins solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐⭐ (5)

**Step 1:**
- Dose Amount: "400"
- Dose Unit: "mg"
- Frequency: "once daily"
- Length of Use: "6-12 months"
- Time to Results: "3-4 weeks"

**Step 2 - Side Effects:** Upset stomach, Nausea

**Step 3 - Failed Solutions:**
1. Failed-Supplement-1 (3 stars)

**Success Screen:**
- Cost Toggle: "Monthly"
- Cost: "$10-25/month"
- Brand: "Nature's Best"
- Form: "Capsule"
- Notes: "TEST: Supplement works best at bedtime"

---

## ☐ 4. Natural Remedies (DosageForm)
**Solution:** `Test natural remedies solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐ (4)

**Step 1:**
- Dose Amount: "2"
- Dose Unit: "tsp"
- Frequency: "twice weekly"
- Length of Use: "3-6 months"
- Time to Results: "Within days"

**Step 2 - Side Effects:** Drowsiness, Upset stomach

**Step 3 - Failed Solutions:**
1. Failed-Remedy-1 (2 stars)

**Success Screen:**
- Cost Toggle: "Monthly"
- Cost: "$10-25/month"
- Brand: "Traditional Medicinals"
- Form: "Tea bags"
- Notes: "TEST: Natural remedy brewed for 5 minutes"

---

## ☐ 5. Beauty & Skincare (DosageForm)
**Solution:** `Test beauty skincare solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐⭐ (5)

**Step 1:**
- Skincare Frequency: "Once daily (night)"
- Length of Use: "3-6 months"
- Time to Results: "1-2 weeks"

**Step 2 - Side Effects:** Dryness/peeling, Redness/irritation

**Step 3 - Failed Solutions:**
1. Failed-Skincare-1 (1 star)

**Success Screen:**
- Cost Toggle: "Monthly"
- Cost: "$25-50/month"
- Notes: "TEST: Skincare applied after cleansing"

**Note:** Brand is part of solution name. No Brand or Form fields on success screen for beauty_skincare.

---

## ☐ 6. Therapists & Counselors (SessionForm)
**Solution:** `Test therapists counselors solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐⭐ (5)

**Step 1:**
- Session Frequency: "Weekly"
- Session Length: "60 minutes"
- Cost: "$100-150"
- Time to Results: "3-4 weeks"

**Step 2 - Challenges:** Finding right therapist fit, Cost/insurance issues

**Step 3 - Failed Solutions:**
1. Failed-Therapist-1 (2 stars)
2. Failed-Therapist-2 (3 stars)

**Success Screen:**
- Therapy Type: "Cognitive Behavioral Therapy (CBT)"
- Format: "In-person"
- Insurance Coverage: "Partially covered"
- Notes: "TEST: Therapist specializes in anxiety disorders"

---

## ☐ 7. Doctors & Specialists (SessionForm)
**Solution:** `Test doctors specialists solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐ (4)

**Step 1:**
- Wait Time: "2-4 weeks"
- Insurance Coverage: "Fully covered by insurance"
- Cost: "$150-250"
- Time to Results: "1-2 months"

**Step 2 - Challenges:** Long wait times, Short appointments

**Step 3 - Failed Solutions:**
1. Failed-Doctor-1 (2 stars)

**Success Screen:**
- Specialty: "Psychiatry"
- Format: "In-person"
- Notes: "TEST: Doctor provides medication management"

---

## ☐ 8. Coaches & Mentors (SessionForm)
**Solution:** `Test coaches mentors solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐ (4)

**Step 1:**
- Session Frequency: "Fortnightly"
- Session Length: "60 minutes"
- Cost: "$50-100"
- Time to Results: "3-4 weeks"

**Step 2 - Challenges:** Expensive without insurance, Less regulated quality

**Step 3 - Failed Solutions:**
1. Failed-Coach-1 (3 stars)

**Success Screen:**
- Coaching Type: "Life coaching"
- Format: "Virtual/Online"
- Notes: "TEST: Coach focuses on stress management techniques"

---

## ☐ 9. Alternative Practitioners (SessionForm)
**Solution:** `Test alternative practitioners solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐ (4)

**Step 1:**
- Session Frequency: "Weekly"
- Session Length: "45 minutes"
- Cost: "$50-100"
- Time to Results: "1-2 weeks"

**Step 2 - Side Effects:** Temporary discomfort, Temporary worsening

**Step 3 - Failed Solutions:**
1. Failed-Alternative-1 (2 stars)

**Success Screen:**
- Practice Type: "Acupuncture"
- Format: "In-person"
- Notes: "TEST: Practitioner uses traditional Chinese methods"

---

## ☐ 10. Professional Services (SessionForm)
**Solution:** `Test professional services solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐ (4)

**Step 1:**
- Session Frequency: "Monthly"
- Specialty: "Career/Business coach"
- Cost: "$100-150"
- Time to Results: "1-2 months"

**Step 2 - Challenges:** Finding qualified professionals, High cost

**Step 3 - Failed Solutions:**
1. Failed-Service-1 (2 stars)

**Success Screen:**
- Format: "Virtual/Online"
- Notes: "TEST: Professional helps with work-related anxiety"

---

## ☐ 11. Crisis Resources (SessionForm)
**Solution:** `Test crisis resources solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐⭐ (5)

**Step 1:**
- Response Time: "Immediate"
- Format: "Phone"
- Cost: "Free"
- Time to Results: "Immediately"

**Step 2 - Challenges:** Long wait times, Difficulty getting through

**Step 3 - Failed Solutions:**
1. Failed-Crisis-1 (3 stars)

**Success Screen:**
- Availability: "24/7"
- Notes: "TEST: Hotline provides immediate support during panic attacks"

---

## ☐ 12. Meditation & Mindfulness (PracticeForm)
**Solution:** `Test meditation mindfulness solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐⭐ (5)

**Step 1:**
- Practice Length: "10-20 minutes"
- Frequency: "Daily"
- Startup Cost: "Free/No startup cost"
- Ongoing Cost: "$10-$24.99/month"
- Time to Results: "1-2 weeks"

**Step 2 - Challenges:** Restlessness, Difficulty concentrating

**Step 3 - Failed Solutions:**
1. Failed-Meditation-1 (2 stars)

**Success Screen:**
- Type: "Guided meditation app"
- Notes: "TEST: Practice works best in the morning"

---

## ☐ 13. Exercise & Movement (PracticeForm)
**Solution:** `Test exercise movement solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐ (4)

**Step 1:**
- Duration: "30-45 minutes"
- Frequency: "3-4 times per week"
- Startup Cost: "Under $50"
- Ongoing Cost: "$25-$49.99/month"
- Time to Results: "1-2 weeks"

**Step 2 - Challenges:** Muscle soreness (normal), Joint pain

**Step 3 - Failed Solutions:**
1. Failed-Exercise-1 (3 stars)

**Success Screen:**
- Exercise Type: "Yoga"
- Notes: "TEST: Exercise includes breathing techniques"

---

## ☐ 14. Habits & Routines (PracticeForm)
**Solution:** `Test habits routines solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐⭐ (5)

**Step 1:**
- Time Commitment: "10-20 minutes"
- Frequency: "Daily"
- Startup Cost: "Free/No startup cost"
- Ongoing Cost: "Free/No ongoing cost"
- Time to Results: "1-2 weeks"

**Step 2 - Challenges:** Hard to remember, Time constraints

**Step 3 - Failed Solutions:**
1. Failed-Habit-1 (2 stars)

**Success Screen:**
- Habit Type: "Journaling"
- Notes: "TEST: Routine works best with coffee in morning"

---

## ☐ 15. Hobbies & Activities (HobbyForm)
**Solution:** `Test hobbies activities solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐ (4)

**Step 1:**
- Time Commitment: "2-4 hours"
- Frequency: "Weekly"
- Startup Cost: "$50-$100"
- Ongoing Cost: "$25-$50/month"
- Time to Results: "1-2 weeks"

**Step 2 - Challenges:** Higher cost than expected, More time-intensive than expected

**Step 3 - Failed Solutions:**
1. Failed-Hobby-1 (3 stars)

**Success Screen:**
- Activity Type: "Creative arts"
- Notes: "TEST: Hobby provides relaxing creative outlet"

---

## ☐ 16. Diet & Nutrition (LifestyleForm)
**Solution:** `Test diet nutrition solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐ (4)

**Step 1:**
- Weekly Prep Time: "2-4 hours/week"
- Still Following: "Yes, consistently"
- Cost Impact: "About the same"
- Time to Results: "3-4 weeks"

**Step 2 - Challenges:** Cravings and temptations, Meal planning and prep time

**Step 3 - Failed Solutions:**
1. Failed-Diet-1 (2 stars)

**Success Screen:**
- Diet Type: "Mediterranean"
- Notes: "TEST: Diet rich in omega-3 fatty acids"

---

## ☐ 17. Sleep (LifestyleForm)
**Solution:** `Test sleep solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐⭐ (5)

**Step 1:**
- Previous Sleep Hours: "5-6 hours"
- Still Following: "Yes, consistently"
- Cost Impact: "Free"
- Time to Results: "1-2 weeks"

**Step 2 - Challenges:** Hard to maintain schedule, Work/family conflicts

**Step 3 - Failed Solutions:**
1. Failed-Sleep-1 (2 stars)

**Success Screen:**
- Current Sleep Hours: "7-8 hours"
- Notes: "TEST: Routine includes 10pm bedtime and no screens"

---

## ☐ 18. Support Groups (CommunityForm)
**Solution:** `Test support groups solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐⭐ (5)

**Step 1:**
- Meeting Frequency: "Several times per week"
- Format: "Hybrid (both)"
- Payment Frequency: "Free or donation-based"
- Cost: "Donation-based"
- Time to Results: "1-2 weeks"

**Step 2 - Challenges:** Inconsistent attendance, Group dynamics issues

**Step 3 - Failed Solutions:**
1. Failed-SupportGroup-1 (2 stars)

**Success Screen:**
- Commitment Type: "Regular attendance expected"
- Accessibility Level: "Very welcoming"
- Leadership Style: "Peer-led"
- Notes: "TEST: Support group follows 12-step tradition"

---

## ☐ 19. Groups & Communities (CommunityForm)
**Solution:** `Test groups communities solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐ (4)

**Step 1:**
- Meeting Frequency: "Weekly"
- Group Size: "Medium (10-20 people)"
- Payment Frequency: "Free or donation-based"
- Cost: "Free"
- Time to Results: "3-4 weeks"

**Step 2 - Challenges:** Scheduling conflicts, Location/Transportation

**Step 3 - Failed Solutions:**
1. Failed-Community-1 (3 stars)

**Success Screen:**
- Format: "In-person only"
- Commitment Type: "Drop-in anytime"
- Accessibility Level: "Very welcoming"
- Notes: "TEST: Group meets every Tuesday evening"

---

## ☐ 20. Financial Products (FinancialForm)
**Solution:** `Test financial products solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐ (4)

**Step 1:**
- Cost Type: "Free to use"
- Financial Benefit: "Over $1000/month saved/earned"
- Access Time: "Same day"
- Time to Results: "3-6 months"

**Step 2 - Challenges:** Credit score too low, Income requirements not met

**Step 3 - Failed Solutions:**
1. Failed-Financial-1 (2 stars)

**Success Screen:**
- Product Type: "Savings account"
- Notes: "TEST: Financial product provides peace of mind"

---

## ☐ 21. Products & Devices (PurchaseForm)
**Solution:** `Test products devices solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐ (4)

**Step 1:**
- Ease of Use: "Very easy to use"
- Product Type: "Physical device"
- Cost: "$20-50"
- Time to Results: "Within days"

**Step 2 - Challenges:** Build quality concerns, Difficult to set up

**Step 3 - Failed Solutions:**
1. Failed-Product-1 (3 stars)

**Success Screen:**
- Brand/Model: "LectroFan"
- Notes: "TEST: Product helps mask environmental noise"

---

## ☐ 22. Books & Courses (PurchaseForm)
**Solution:** `Test books courses solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐⭐ (5)

**Step 1:**
- Format: "Physical book"
- Learning Difficulty: "Some experience helpful"
- Cost: "$10-25"
- Time to Results: "3-4 weeks"

**Step 2 - Challenges:** Too basic/too advanced, Not enough practical examples

**Step 3 - Failed Solutions:**
1. Failed-Book-1 (2 stars)

**Success Screen:**
- Author/Instructor: "Dr. David Burns"
- Notes: "TEST: Book includes practical exercises and worksheets"

---

## ☐ 23. Online Services (PurchaseForm)
**Solution:** `Test online services solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐ (4)

**Step 1:**
- Ease of Use: "Very easy to use"
- Service Type: "Mobile app"
- Cost: "$100-250"
- Time to Results: "3-4 weeks"

**Step 2 - Challenges:** Build quality concerns, Difficult to set up

**Step 3 - Failed Solutions:**
1. Failed-OnlineService-1 (3 stars)

**Success Screen:**
- Provider: "BetterHelp"
- Notes: "TEST: Service offers unlimited messaging with therapist"

---

## COMPLETION CHECKLIST

After finishing all 23 forms:

✅ **All forms submitted successfully**
✅ **All success screens completed with optional fields**
✅ **All failed solutions entered**
✅ **Ready for Supabase verification**

**Next Step:** Tell Claude "I'm done with manual testing" and they will verify all data in Supabase.

---

## VERIFICATION QUERIES

When verifying in Supabase, Claude will search for:

**Primary Solutions (23):**
- "Test apps software solution"
- "Test medications solution"
- "Test supplements vitamins solution"
- "Test natural remedies solution"
- "Test beauty skincare solution"
- "Test therapists counselors solution"
- "Test doctors specialists solution"
- "Test coaches mentors solution"
- "Test alternative practitioners solution"
- "Test professional services solution"
- "Test crisis resources solution"
- "Test meditation mindfulness solution"
- "Test exercise movement solution"
- "Test habits routines solution"
- "Test hobbies activities solution"
- "Test diet nutrition solution"
- "Test sleep solution"
- "Test support groups solution"
- "Test groups communities solution"
- "Test financial products solution"
- "Test products devices solution"
- "Test books courses solution"
- "Test online services solution"

**Failed Solutions (~26 total):**
All starting with "Failed-" prefix

---

## 🔍 DATABASE VALIDATION INSTRUCTIONS (FOR CLAUDE)

**IMPORTANT:** After the user completes each form, you MUST validate the data in the database field-by-field.

### Validation Process (2-Step):

1. **You validate directly** using the SQL query below
2. **Launch a sub-agent** for independent validation (they should get identical results)
3. **Compare findings** and report discrepancies

### Step 1: Query the Database

**Supabase Project ID:** `wqxkhxdbxdtpuvuvgirx`

Use this SQL query (replace `SOLUTION_NAME` with the actual test solution name):

```sql
-- Find the test solution and all related data
SELECT
  s.id as solution_id,
  s.title as solution_title,
  s.solution_category,
  s.created_at as solution_created_at,
  sv.id as variant_id,
  sv.variant_name,
  r.id as rating_id,
  r.effectiveness_score,
  r.solution_fields as rating_solution_fields,
  r.goal_id,
  r.created_at as rating_created_at,
  gil.id as gil_id,
  gil.avg_effectiveness,
  gil.rating_count,
  gil.solution_fields as gil_solution_fields,
  gil.aggregated_fields as gil_aggregated_fields
FROM solutions s
LEFT JOIN solution_variants sv ON sv.solution_id = s.id
LEFT JOIN ratings r ON r.solution_id = s.id
LEFT JOIN goal_implementation_links gil ON gil.implementation_id = sv.id
WHERE s.title = 'SOLUTION_NAME'
  AND s.created_at > NOW() - INTERVAL '1 hour'
ORDER BY s.created_at DESC
LIMIT 1;
```

**Example:** For App Form, replace `SOLUTION_NAME` with `Test apps software solution`

### Step 2: Validate Each Field

**Compare against the test matrix** (the numbered sections below, e.g., "## ☐ 1. Apps & Software")

**Check TWO locations:**
1. ✅ `ratings.solution_fields` - Individual submission data
2. ✅ `goal_implementation_links.aggregated_fields` - Aggregated display data

**Create a validation table:**

| Field | Expected (Test Matrix) | Actual (Database) | Status | Notes |
|-------|------------------------|-------------------|--------|-------|
| Solution Title | ... | ... | ✅/❌/⚠️ | ... |
| Effectiveness | ... | ... | ✅/❌/⚠️ | ... |
| Field 1 | ... | ... | ✅/❌/⚠️ | ... |
| ... | ... | ... | ... | ... |

### Step 3: Launch Independent Sub-Agent Validation

Use the `Task` tool with `general-purpose` subagent:

```
Your Task:
1. Query Supabase (project: wqxkhxdbxdtpuvuvgirx) for solution "SOLUTION_NAME" created in last hour
2. Read test spec from /Users/jackandrews/Desktop/wwfm-platform/MANUAL_FORM_TEST_MATRIX.md
3. Validate EVERY field from test matrix against database
4. Check both ratings.solution_fields AND goal_implementation_links.aggregated_fields

Return: Markdown table with Field Name, Expected, Actual, Status, Notes
```

### Step 4: Compare & Report

- Compare your findings with sub-agent's findings
- Report any discrepancies (should be 0 if both validated correctly)
- Mark form as ✅ PASS or ❌ FAIL in the status tracker

### Important Notes:

**❗ Failed Solutions Storage:**
- Failed solutions are stored as JSON in `ratings.solution_fields.failed_solutions_text`
- They are NOT created as separate solution records
- Format: `[{"name":"Failed-X","rating":2}, ...]`

**❗ Goal Association:**
- All tests use goal: "Reduce anxiety" (ID: `56e2801e-0d78-4abd-a795-869e5b780ae7`)
- Verify `ratings.goal_id` matches this

**❗ Timing:**
- Query within 1 hour of submission (`NOW() - INTERVAL '1 hour'`)
- If not found, increase interval or check solution name spelling

**❗ Common Issues:**
- Platform fields may be simplified (e.g., "iOS (iPhone/iPad)" → "iOS")
- Notes may have punctuation added (period at end)
- These are acceptable minor normalizations

### Database Tables Reference:

- `solutions` - The solution record (title, category)
- `solution_variants` - Variant (usually "Standard" for non-dosage)
- `ratings` - User rating with `solution_fields` JSON
- `goal_implementation_links` - Goal-solution connection with `aggregated_fields` JSON

### Expected JSON Structure in Database:

**ratings.solution_fields** (Individual submission data):
```json
{
  "cost": "$10-$19.99/month",
  "notes": "TEST: App works great for daily tracking.",
  "platform": "iOS",
  "cost_type": "recurring",
  "challenges": ["Subscription too expensive", "Too many notifications"],
  "time_to_results": "3-4 weeks",
  "usage_frequency": "Daily",
  "subscription_type": "Monthly subscription",
  "failed_solutions_text": [
    {"name": "Failed-App-1", "rating": 2},
    {"name": "Failed-App-2", "rating": 1}
  ]
}
```

**goal_implementation_links.aggregated_fields** (Display data):
```json
{
  "cost": {
    "mode": "$10-$19.99/month",
    "values": [{"value": "$10-$19.99/month", "count": 1, "percentage": 100, "source": "user_submission"}],
    "totalReports": 1,
    "dataSource": "user_submission"
  },
  "usage_frequency": {
    "mode": "Daily",
    "values": [{"value": "Daily", "count": 1, "percentage": 100, "source": "user_submission"}],
    "totalReports": 1,
    "dataSource": "user_submission"
  },
  // ... similar structure for all other fields
}
```

**Key Points:**
- `solution_fields`: Flat key-value pairs (individual data)
- `aggregated_fields`: DistributionData format with mode, values array, percentages
- Both should contain the same field values, just different structures

---

## 📝 EXAMPLE VALIDATION (App Form - Completed 2025-10-31)

**This shows exactly what your validation report should look like:**

### My Validation Results:

| Field | Expected (Test Matrix) | Actual (Database) | Status | Notes |
|-------|------------------------|-------------------|--------|-------|
| Solution Title | Test apps software solution | Test apps software solution | ✅ MATCH | - |
| Effectiveness | 5 stars | 5.0 | ✅ MATCH | - |
| Usage Frequency | Daily | Daily | ✅ MATCH | - |
| Subscription Type | Monthly subscription | Monthly subscription | ✅ MATCH | - |
| Cost | $10-$19.99/month | $10-$19.99/month | ✅ MATCH | - |
| Time to Results | 3-4 weeks | 3-4 weeks | ✅ MATCH | - |
| Challenges | Subscription too expensive, Too many notifications | ["Subscription too expensive", "Too many notifications"] | ✅ MATCH | Stored as array |
| Failed Solutions | Failed-App-1 (2★), Failed-App-2 (1★) | [{"name":"Failed-App-1","rating":2}, {"name":"Failed-App-2","rating":1}] | ✅ MATCH | JSON format |
| Platform | iOS (iPhone/iPad) | iOS | ⚠️ PARTIAL | Simplified |
| Notes | TEST: App works great for daily tracking | TEST: App works great for daily tracking. | ✅ MATCH | Period added |

**Sub-Agent Validation:** ✅ Reached identical conclusions (10/10 fields, 9 exact matches, 1 partial)

**Final Verdict:** ✅ PASS - All fields validated successfully

---

## 📝 EXAMPLE VALIDATION 2 (Medication Form - Completed 2025-10-31)

### My Validation Results:

| Field | Expected (Test Matrix) | Actual (Database) | Status | Notes |
|-------|------------------------|-------------------|--------|-------|
| Solution Title | Test medications solution | Test medications solution | ✅ MATCH | - |
| Effectiveness | 4 stars | 4.0 | ✅ MATCH | - |
| Dose Amount | 500 | 500 | ✅ MATCH | In variant and rating |
| Dose Unit | mg | mg | ✅ MATCH | In variant and rating |
| Variant Name | (auto-generated) | 500mg | ✅ MATCH | - |
| Frequency | twice daily | twice daily | ✅ MATCH | Lowercase correct |
| Length of Use | 3-6 months | 3-6 months | ✅ MATCH | - |
| Time to Results | 1-2 weeks | 1-2 weeks | ✅ MATCH | - |
| Side Effects | Nausea, Headache | ["Nausea", "Headache"] | ✅ MATCH | Array format |
| Failed Solutions | Failed-Med-1 (1★) | [{"name":"Failed-Med-1","rating":1}] | ✅ MATCH | JSON format |
| Cost | $20-50 | $20-50 | ✅ MATCH | No cost_type stored |
| Brand | Generic available | Generic available | ✅ MATCH | - |
| Form | Tablet | tablet | ✅ MATCH | Lowercase correct |
| Notes | TEST: Medication taken with food | TEST: Medication taken with food | ✅ MATCH | - |

**Final Verdict:** ✅ PASS - 15/15 fields validated successfully

**Key Observations:**
- Variant data correctly stored in solution_variants table (500mg)
- No cost_type field stored (medications simplified)
- Form values are lowercase ("tablet", "twice daily")
- All data properly propagated to aggregated_fields

---

## DATABASE VALIDATION COMPLETED

✅ All challenge/side effect options verified against production database
✅ Database constraint updated to support all 23 categories
✅ Fallback code removed from all 9 forms
✅ Proper error handling added
✅ Single source of truth: Database only
