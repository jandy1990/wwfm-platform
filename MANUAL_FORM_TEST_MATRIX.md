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

**Last Updated:** 2025-11-01
**Progress:** 17/23 forms tested (74%)

**COMPLETED TODAY:**
1. ✅ Apps & Software (AppForm)
2. ✅ Medications (DosageForm)
3. ✅ Supplements & Vitamins (DosageForm)
4. ✅ Natural Remedies (DosageForm)
5. ✅ Beauty & Skincare (DosageForm)
6. ✅ Therapists & Counselors (SessionForm)
7. ✅ Doctors & Specialists (SessionForm)
8. ✅ Coaches & Mentors (SessionForm)
9. ✅ Alternative Practitioners (SessionForm)
10. ✅ Professional Services (SessionForm)
11. ✅ Crisis Resources (SessionForm)
12. ✅ Meditation & Mindfulness (PracticeForm)
13. ✅ Exercise & Movement (PracticeForm)
14. ✅ Habits & Routines (PracticeForm)
15. ✅ Hobbies & Activities (HobbyForm)
16. ✅ Diet & Nutrition (LifestyleForm)
17. ✅ Sleep (LifestyleForm)

**NEXT TO TEST:** Support Groups (CommunityForm) - Form #18

---

## 🔄 HANDOFF NOTES FOR NEXT SESSION

**Session Date:** 2025-11-01
**Forms Remaining:** 6 out of 23 (26%)

### **Critical Changes Made This Session:**

#### 1. **SessionForm Major Updates:**
- ✅ Fixed LAZY validation (was EAGER, felt clunky)
- ✅ Insurance coverage simplified (6 → 4 options, removed HSA/FSA)
- ✅ Field reordering (frequency → length → format → insurance → cost)
- ✅ Optional fields moved to success screen (format, insurance for some categories)
- ✅ session_length changed to ranges ("45-60 minutes" not "60 minutes")
- ✅ "Less regulated quality" challenge removed (coaches_mentors)
- ✅ "Varies by condition" removed (typical_treatment_length)
- ✅ Nutritionist/Dietitian split (RD → doctors, Nutritionist → professional_services)
- ✅ Professional services specialty alphabetized with "Other (please specify)" custom text

#### 2. **Success Screen UX (All 9 Forms):**
- ✅ Option A implemented: Fields disable after submit, button changes to "✓ Saved"
- ✅ Solution name removed from success message (now generic)

#### 3. **PracticeForm & HobbyForm:**
- ✅ Cost validation fix ("Free" → "Free/No ongoing cost")
- ✅ cost_type removed from validation for hobbies_activities
- ✅ Habits defaults to free costs (81% are free)
- ✅ Hobby definition box removed

#### 4. **LifestyleForm Major Changes:**
- ✅ Diet: Removed "Diet Type" and "Helpful resources" from success screen
- ✅ Diet: Kept "Social Impact" (valuable)
- ✅ Diet: Added "Other (please specify)" with custom text for stopped reasons
- ✅ **Sleep SSOT Change:** `previous_sleep_hours` → `sleep_quality_change` as keyField
  - Updated 15 intersecting files (SSOT, form, configs, generators, docs, tests)
  - previous/current hours now optional on success screen
  - Removed specific_approach field
- ✅ Toast error handling added to LifestyleForm
- ✅ Cost label: "Cost impact" (diet) vs "Cost" (sleep)

#### 5. **Admin Dashboard Created:**
- ✅ `/admin` route with authentication
- ✅ Custom specialty review component
- ✅ Promotion system for popular "Other" entries (10+ uses threshold)
- ✅ Documentation in `/docs/admin/ADMIN_DASHBOARD.md`

#### 6. **Alternative Practitioners:**
- ✅ Side effects cleaned up (20 → 14 options, removed pseudoscience terms)

### **Remaining Forms (6):**

**CommunityForm (2 categories):**
- Support Groups
- Groups & Communities

**FinancialForm (1 category):**
- Financial Products

**PurchaseForm (3 categories):**
- Products & Devices
- Books & Courses
- Online Services

### **Known Patterns to Continue:**

1. **Validation Process:**
   - Query Supabase directly
   - Launch independent sub-agent
   - Compare results
   - Mark PASS if 100% or explain discrepancies

2. **Common Fixes Applied:**
   - LAZY validation (not EAGER)
   - Success screen Option A (disable fields + "✓ Saved" button)
   - Remove redundant fields (type fields when solution name indicates type)
   - Alphabetize dropdowns for usability
   - Add "Other (please specify)" with custom text where appropriate

3. **Boolean Field Handling:**
   - `still_following` stored as boolean, not string - THIS IS CORRECT
   - Test matrix shows user labels but DB uses boolean

4. **Cost Field Patterns:**
   - Some forms have cost_type (internal field, don't validate against dropdowns)
   - Practice/Hobby forms: dual-cost system (startup + ongoing)
   - Session forms: cost toggle (per_session vs monthly)
   - Lifestyle forms: cost_impact (comparison or absolute)

### **Files to Check When Making Changes:**

Always refer to **INTERSECTING DOCUMENTS** section (lines 114-571) for complete file list.

**Quick reference:**
- SSOT Source: `components/goal/GoalPageClient.tsx` CATEGORY_CONFIG
- Config: `lib/config/solution-dropdown-options.ts` + `scripts/solution-generator/config/dropdown-options.ts`
- Form: Individual form component files
- Docs: `docs/solution-fields-ssot.md`, `FORM_DROPDOWN_OPTIONS_REFERENCE.md`, this file
- Tests: `tests/e2e/forms/` files
- Validators: `lib/services/solution-aggregator.ts`, audit scripts

### **Test Workflow:**

1. User completes form manually
2. Claude queries Supabase for data
3. Claude launches sub-agent for independent verification
4. Both compare against test matrix
5. Report validation table with all fields
6. Mark PASS/FAIL in status tracker
7. Update progress counter

**Database Access:** Use `mcp__supabase__execute_sql` with project ID `wqxkhxdbxdtpuvuvgirx`

---

| # | Form | Category | Status | Date Tested | Notes |
|---|------|----------|--------|-------------|-------|
| 1 | AppForm | Apps & Software | ✅ PASS | 2025-10-31 | One-time cost options updated |
| 2 | DosageForm | Medications | ✅ PASS | 2025-10-31 | 15/15 fields validated, cost_type removed |
| 3 | DosageForm | Supplements & Vitamins | ✅ PASS | 2025-10-31 | 16/16 fields validated, test matrix corrected |
| 4 | DosageForm | Natural Remedies | ✅ PASS | 2025-10-31 | 15/15 fields validated, all perfect |
| 5 | DosageForm | Beauty & Skincare | ✅ PASS | 2025-10-31 | 14/14 fields validated, no brand/form fields |
| 6 | SessionForm | Therapists & Counselors | ✅ PASS | 2025-10-31 | 20/20 fields validated, LAZY validation fixed |
| 7 | SessionForm | Doctors & Specialists | ✅ PASS | 2025-10-31 | 19/19 fields validated, session_length ranges implemented |
| 8 | SessionForm | Coaches & Mentors | ✅ PASS | 2025-10-31 | 17/17 fields validated, new session_length ranges working |
| 9 | SessionForm | Alternative Practitioners | ✅ PASS | 2025-10-31 | 17/17 fields validated, side effects cleaned up (20→14 options) |
| 10 | SessionForm | Professional Services | ✅ PASS | 2025-10-31 | 17/17 fields validated, session_length added to success screen |
| 11 | SessionForm | Crisis Resources | ✅ PASS | 2025-10-31 | 13/13 fields validated, availability checkboxes working |
| 12 | PracticeForm | Meditation & Mindfulness | ✅ PASS | 2025-10-31 | 17/17 fields validated, dual-cost system working |
| 13 | PracticeForm | Exercise & Movement | ✅ PASS | 2025-11-01 | 17/17 fields validated, dual-cost system working |
| 14 | PracticeForm | Habits & Routines | ✅ PASS | 2025-11-01 | 16/16 fields validated, free cost defaults working |
| 15 | HobbyForm | Hobbies & Activities | ✅ PASS | 2025-11-01 | 15/15 fields validated, cost_type validation fixed |
| 16 | LifestyleForm | Diet & Nutrition | ✅ PASS | 2025-11-01 | 12/12 fields validated, social impact field working |
| 17 | LifestyleForm | Sleep | ✅ PASS | 2025-11-01 | 13/13 fields validated, sleep_quality_change SSOT change complete |
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
   - `components/organisms/solutions/SolutionFormWithAutoCategory.tsx` - Add category to routing logic
   - Determine which of 9 forms handles this category
   - Update form's category list/mapping in the form component itself

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

#### 🎯 **SSOT SOURCE (HIGHEST AUTHORITY)** (1 file - CHECK THIS FIRST!)
```
components/goal/
└── GoalPageClient.tsx                # Lines 56-407: CATEGORY_CONFIG (AUTHORITATIVE)
                                      # Defines keyFields + arrayField for ALL 23 categories
                                      # This is THE source of truth - all forms must align to this
```

**Critical:** When adding/removing fields from forms, ALWAYS verify against CATEGORY_CONFIG in this file first!
**Rule:** If code disagrees with docs, CODE WINS. GoalPageClient.tsx IS the code that runs in production.

**Update when:**
- Adding/removing a category (add to CATEGORY_CONFIG)
- Changing which fields display on solution cards (update keyFields)
- Changing array field type (update arrayField: 'challenges' or 'side_effects')

---

#### 🎨 **FORM COMPONENTS** (10 files)
```
components/organisms/solutions/
└── SolutionFormWithAutoCategory.tsx  # Form router (maps categories → form components)

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

**Update when:**
- Adding/removing fields → Individual form files
- Changing field behavior → Individual form files
- Adding new category → SolutionFormWithAutoCategory.tsx routing logic
- Updating UI → Individual form files and shared components

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

#### 🧪 **TESTING FILES** (20+ files)
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
├── session-form-crisis-resources.spec.ts # Crisis resources specific
├── practice-form-complete.spec.ts       # Practice form E2E test
├── hobby-form-complete.spec.ts          # Hobby form E2E test
├── lifestyle-form-complete.spec.ts      # Lifestyle form E2E test
├── community-form-complete.spec.ts      # Community form E2E test
├── financial-form-complete.spec.ts      # Financial form E2E test
└── purchase-form-complete.spec.ts       # Purchase form E2E test

tests/e2e/utils/
├── test-helpers.ts                      # fillSuccessScreenFields, verifyDataPipeline, etc.
└── test-cleanup.ts                      # clearTestRatingsForSolution

tests/e2e/fixtures/
├── test-solutions.ts                    # TEST_SOLUTIONS constant (solution names)
└── test-data.ts                         # FORM_DROPDOWN_OPTIONS test data

Root:
└── MANUAL_FORM_TEST_MATRIX.md           # Manual testing specifications
```

**Update when:**
- Field changes → Update form-specific-fillers.ts, test-helpers.ts if success screen logic changes
- Dropdown changes → Update expected values in specs, test-data.ts
- Test case changes → Update MANUAL_FORM_TEST_MATRIX.md
- New test solution names → Update test-solutions.ts

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
| **Added field to form** | **GoalPageClient.tsx (CATEGORY_CONFIG)**, Form.tsx, solution-fields.ts, solution-dropdown-options.ts | SSOT docs, test fillers, prompts | Validators |
| **Removed field from form** | **GoalPageClient.tsx (CATEGORY_CONFIG)**, Form.tsx, solution-fields.ts | SSOT docs, test fillers, test matrix | Generators |
| **Changed dropdown options** | solution-dropdown-options.ts (both), Form.tsx | DROPDOWN_REFERENCE.md, test matrix, test-data.ts | Prompts |
| **Changed cost structure** | Form.tsx, solution-fields.ts, validator.ts | Dropdown options, test files | Migration script |
| **Added new category** | **GoalPageClient.tsx (CATEGORY_CONFIG)**, Database enum, solution-fields.ts, forms | All configs, all docs, all tests | Everything! |
| **Changed field name** | **GoalPageClient.tsx (CATEGORY_CONFIG)**, Form.tsx, solution-fields.ts | SSOT docs, generators, validators, tests | Migration script |

---

### ⚠️ CRITICAL REMINDERS

1. **ALWAYS check GoalPageClient.tsx FIRST:**
   - `components/goal/GoalPageClient.tsx` - CATEGORY_CONFIG is THE source of truth
   - Defines what fields display on solution cards (keyFields)
   - ALL forms, configs, and docs must align to this
   - **Rule:** When code and docs disagree → CODE WINS (GoalPageClient.tsx is the code)

2. **Always update BOTH dropdown files:**
   - `lib/config/solution-dropdown-options.ts` (frontend uses this)
   - `scripts/solution-generator/config/dropdown-options.ts` (AI generators use this)

3. **Always update test files when changing forms:**
   - `tests/e2e/forms/form-specific-fillers.ts` (E2E tests will fail otherwise)
   - `MANUAL_FORM_TEST_MATRIX.md` (manual testing will be outdated)
   - `tests/e2e/fixtures/test-data.ts` (if dropdown options changed)

4. **SSOT documents are authoritative:**
   - `components/goal/GoalPageClient.tsx` - **HIGHEST AUTHORITY** (runtime code)
   - `docs/solution-fields-ssot.md` - What fields exist (should mirror GoalPageClient.tsx)
   - `FORM_DROPDOWN_OPTIONS_REFERENCE.md` - What values are valid
   - When code and docs disagree → Update docs to match code!

5. **Database changes are RARE:**
   - JSONB fields are flexible by design
   - Only migrate data if renaming values that exist in production
   - Test migrations on subset first!

6. **Archive files don't need updates:**
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
- Session Length: "45-60 minutes"
- Cost per session: "$100-150"
- Time to Results: "3-4 weeks"

**Step 2 - Challenges:** Finding right therapist fit, Cost/insurance issues

**Step 3 - Failed Solutions:**
1. Failed-Therapist-1 (2 stars)
2. Failed-Therapist-2 (3 stars)

**Success Screen (Optional):**
- Format: "In-person"
- Insurance Coverage: "Partially covered by insurance"
- Completed Treatment: "Still ongoing"
- Notes: "TEST: Therapist specializes in anxiety disorders"

**SSOT keyFields:** time_to_results, session_frequency, session_length, cost

---

## ☐ 7. Doctors & Specialists (SessionForm)
**Solution:** `Test doctors specialists solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐ (4)

**Step 1:**
- Wait Time: "2-4 weeks" (REQUIRED)
- Insurance Coverage: "Fully covered by insurance" (REQUIRED)
- Cost per session: "$150-250" (REQUIRED)
- Time to Results: "1-2 months" (REQUIRED)

**Step 2 - Challenges:** Long wait times, Short appointments

**Step 3 - Failed Solutions:**
1. Failed-Doctor-1 (2 stars)

**Success Screen (Optional):**
- Session Frequency: "Monthly"
- Session Length: "15-30 minutes"
- Format: "In-person"
- Typical Treatment Length: "6-12 months"
- Notes: "TEST: Doctor provides medication management"

**SSOT keyFields:** time_to_results, wait_time, insurance_coverage, cost

---

## ☐ 8. Coaches & Mentors (SessionForm)
**Solution:** `Test coaches mentors solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐ (4)

**Step 1:**
- Session Frequency: "Fortnightly"
- Session Length: "45-60 minutes"
- Cost per session: "$50-100"
- Time to Results: "3-4 weeks"

**Step 2 - Challenges:** Expensive without insurance, Finding qualified professionals

**Step 3 - Failed Solutions:**
1. Failed-Coach-1 (3 stars)

**Success Screen (Optional):**
- Format: "Virtual/Online"
- Completed Treatment: "Still ongoing"
- Notes: "TEST: Coach focuses on stress management techniques"

**SSOT keyFields:** time_to_results, session_frequency, session_length, cost

---

## ☐ 9. Alternative Practitioners (SessionForm)
**Solution:** `Test alternative practitioners solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐ (4)

**Step 1:**
- Session Frequency: "Weekly"
- Session Length: "30-45 minutes"
- Cost per session: "$50-100"
- Time to Results: "1-2 weeks"

**Step 2 - Side Effects:** Temporary discomfort, Muscle soreness

**Step 3 - Failed Solutions:**
1. Failed-Alternative-1 (2 stars)

**Success Screen (Optional):**
- Format: "In-person"
- Typical Treatment Length: "2-4 sessions"
- Notes: "TEST: Practitioner uses traditional Chinese methods"

**SSOT keyFields:** time_to_results, session_frequency, session_length, cost

---

## ☐ 10. Professional Services (SessionForm)
**Solution:** `Test professional services solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐ (4)

**Step 1:**
- Session Frequency: "Monthly"
- Specialty: "Career/Business coach" (REQUIRED)
- Cost per session: "$100-150"
- Time to Results: "1-2 months"

**Step 2 - Challenges:** Finding qualified professionals, High cost

**Step 3 - Failed Solutions:**
1. Failed-Service-1 (2 stars)

**Success Screen (Optional):**
- Session Length: "45-60 minutes"
- Format: "Virtual/Online"
- Notes: "TEST: Professional helps with work-related anxiety"

**SSOT keyFields:** time_to_results, session_frequency, specialty, cost

---

## ☐ 11. Crisis Resources (SessionForm)
**Solution:** `Test crisis resources solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐⭐ (5)

**Step 1:**
- Response Time: "Immediate"
- Format: "Phone" (REQUIRED)
- Cost: "Free"
- Time to Results: "Immediately"

**Step 2 - Challenges:** Long wait times, Difficulty getting through

**Step 3 - Failed Solutions:**
1. Failed-Crisis-1 (3 stars)

**Success Screen (Optional):**
- Availability: "24/7"
- Notes: "TEST: Hotline provides immediate support during panic attacks"

**SSOT keyFields:** time_to_results, response_time, format, cost

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

**Success Screen (Optional):**
- Best Time of Day: "Morning (7-10am)"
- Where You Practice: "Home"
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

**Success Screen (Optional):**
- Best Time of Day: "Morning (7-10am)"
- Where You Practice: "Outdoors"
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

**Success Screen (Optional):**
- Best Time of Day: "Morning (7-10am)"
- Notes: "TEST: Routine works best with coffee in morning"

**Note:** Location field does NOT appear for habits_routines (they don't have a physical location)

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

**Success Screen (Optional):**
- Community or Group Name: (leave blank)
- Notes: "TEST: Hobby provides relaxing creative outlet"

---

## ☐ 16. Diet & Nutrition (LifestyleForm)
**Solution:** `Test diet nutrition solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐ (4)

**Step 1:**
- Weekly Prep Time: "2-4 hours/week"
- Still Following: "Yes, consistently" (stored as boolean `true`)
- Cost Impact: "About the same"
- Time to Results: "3-4 weeks"

**Step 2 - Challenges:** Cravings and temptations, Meal planning and prep time

**Step 3 - Failed Solutions:**
1. Failed-Diet-1 (2 stars)

**Success Screen (Optional):**
- Social Impact: "No impact"
- Notes: "TEST: Diet rich in omega-3 fatty acids"

---

## ☐ 17. Sleep (LifestyleForm)
**Solution:** `Test sleep solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐⭐ (5)

**IMPORTANT (Nov 2025 Update):**
- `sleep_quality_change` is now REQUIRED (Step 1) - replaces previous_sleep_hours
- `previous_sleep_hours` and `current_sleep_hours` are OPTIONAL (Success screen)

**Step 1:**
- Sleep Quality Change: "Significantly better" (REQUIRED - NEW keyField)
- Still Following: "Yes, consistently" (stored as boolean `true`)
- Cost: "Free"
- Time to Results: "1-2 weeks"

**Step 2 - Challenges:** Hard to maintain schedule, Work/family conflicts

**Step 3 - Failed Solutions:**
1. Failed-Sleep-1 (2 stars)

**Success Screen (Optional):**
- Previous Sleep Hours: "5-6 hours"
- Current Sleep Hours: "7-8 hours"
- Notes: "TEST: Routine includes 10pm bedtime and no screens"

**SSOT keyFields:** time_to_results, sleep_quality_change, still_following, cost

---

## ☐ 18. Support Groups (CommunityForm)
**Solution:** `Test support groups solution` *(pre-populated)*
**Stars:** ⭐⭐⭐⭐⭐ (5)

**Step 1:**
- Payment Type: "Donation-based"
- Meeting Frequency: "Several times per week"
- Format: "Hybrid"
- Group Size: "Medium (10-20 people)"
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
- Payment Type: "Free"
- Meeting Frequency: "Weekly"
- Format: "In-person only"
- Group Size: "Medium (10-20 people)"
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

**❗ Boolean Fields:**
- `still_following` is stored as BOOLEAN (`true`/`false`), not string
- Test matrix shows user-facing text ("Yes, consistently") but DB stores boolean
- This is CORRECT - do not flag as mismatch

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
