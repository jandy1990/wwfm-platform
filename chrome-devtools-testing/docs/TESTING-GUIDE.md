# Chrome DevTools Testing Framework - User Guide

## Overview

This framework enables comprehensive end-to-end testing of all WWFM forms using Chrome DevTools MCP tools. It validates the complete data pipeline from form submission → database → frontend display.

## Testing Progress: 2/23 Categories Complete

**Approach**: Template-by-template systematic testing of all category variations

**Completed**:
1. ✅ DosageForm → supplements_vitamins (Vitamin D)
2. ✅ SessionForm → therapists_counselors (CBT Therapist) - **Bug discovered & fixed!**

**Next Priority**: Complete DosageForm (3 remaining)
- medications
- natural_remedies
- beauty_skincare

## Testing Strategy

### Template-by-Template Systematic Approach

We test **ALL category variations** of each template before moving to the next:

1. **DosageForm** (4 categories total)
   - ✅ supplements_vitamins
   - ⏳ medications
   - ⏳ natural_remedies
   - ⏳ beauty_skincare

2. **SessionForm** (7 categories total)
   - ✅ therapists_counselors
   - ⏳ coaches_mentors
   - ⏳ alternative_practitioners
   - ⏳ doctors_specialists
   - ⏳ medical_procedures
   - ⏳ professional_services
   - ⏳ crisis_resources

3. **PracticeForm** (3 categories total)
   - ⏳ meditation_mindfulness
   - ⏳ exercise_movement
   - ⏳ habits_routines

4. **Remaining Templates** (9 categories total)
   - AppForm: apps_software
   - HobbyForm: hobbies_activities
   - CommunityForm: groups_communities, support_groups
   - LifestyleForm: diet_nutrition, sleep
   - PurchaseForm: products_devices, books_courses
   - FinancialForm: financial_products

**Total Coverage**: 23 categories across 9 templates

## What We've Built

### ✅ Core Infrastructure (Phase 1 Complete)

1. **Type System** (`types/`)
   - `test-data.ts`: Complete TypeScript types for all 9 templates and 23 categories
   - `tracking.ts`: Submission tracking and statistics types

2. **Helper Libraries** (`helpers/`)
   - `devtools.ts`: Chrome DevTools MCP wrapper functions
   - `navigation.ts`: Page navigation and flow control
   - `form-filling.ts`: Category-specific form interactions
   - `database.ts`: Supabase verification utilities via MCP

3. **Test Data** (`data/`)
   - `test-solutions.ts`: Pre-configured test data for all 23 categories
   - Each solution tagged with "(DevTools Test)" for easy cleanup

4. **Example Scripts** (`scripts/`)
   - `example-test.ts`: Complete working example for supplements_vitamins
   - Demonstrates full 15-step testing flow

5. **Documentation** (`docs/`)
   - This guide
   - Comprehensive README.md

## Quick Start Guide

### Prerequisites

1. **Chrome Browser**: Running with DevTools MCP server connected
2. **Dev Server**: WWFM app running on localhost
3. **Environment Variables**:
   ```bash
   export PLAYWRIGHT_TEST_BASE_URL="http://localhost:3000"
   export TEST_GOAL_ID="56e2801e-0d78-4abd-a795-869e5b780ae7"
   export TEST_USER_ID="your-test-user-id"
   ```

### Running Your First Test

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Open Chrome and navigate to the test goal page** (manually for now):
   ```
   http://localhost:3000/goal/56e2801e-0d78-4abd-a795-869e5b780ae7
   ```

3. **In Claude Code, run the example test**:
   Just ask: *"Run the example DevTools test for supplements"*

   The test will:
   - Navigate through the form flow
   - Fill all fields with test data
   - Submit the form
   - Verify database records
   - Verify frontend display
   - Take screenshots
   - Log results

4. **View results**:
   - Screenshots in `results/screenshots/`
   - Console output shows each step
   - Database verification confirms data pipeline

## Test Execution Flow

Each test follows this 15-step pattern:

```
1.  Navigate to goal page
2.  Open add solution flow
3.  Search for solution
4.  Handle auto-categorization
5.  Fill form step 1 (effectiveness, main fields)
6.  Fill form step 2 (side effects/challenges)
7.  Skip optional step 3 (failed solutions)
8.  Submit form
9.  Capture success screenshot
10. Return to goal page
11. Verify solution appears on frontend
12. Capture goal page screenshot
13. Verify database records (solution, variant, rating, link)
14. Fetch and log database IDs
15. Record submission for tracking
```

## Testing Categories

### By Template

**DosageForm** (4 categories):
- ✅ `medications` - Test Medication (DevTools Test)
- ✅ `supplements_vitamins` - Vitamin D (DevTools Test) ← Example ready
- ✅ `natural_remedies` - Ashwagandha (DevTools Test)
- ✅ `beauty_skincare` - Retinol Serum (DevTools Test)

**SessionForm** (7 categories):
- ✅ `therapists_counselors` - CBT Therapist (DevTools Test)
- ✅ `doctors_specialists` - Psychiatrist (DevTools Test)
- ✅ `coaches_mentors` - Life Coach (DevTools Test)
- ✅ `alternative_practitioners` - Acupuncturist (DevTools Test)
- ✅ `professional_services` - Personal Trainer (DevTools Test)
- ✅ `medical_procedures` - Physical Therapy (DevTools Test)
- ✅ `crisis_resources` - Crisis Hotline (DevTools Test)

**PracticeForm** (3 categories):
- ✅ `meditation_mindfulness` - Guided Meditation (DevTools Test)
- ✅ `exercise_movement` - Running (DevTools Test)
- ✅ `habits_routines` - Morning Routine (DevTools Test)

**AppForm** (1 category):
- ✅ `apps_software` - Headspace (DevTools Test)

**HobbyForm** (1 category):
- ✅ `hobbies_activities` - Photography (DevTools Test)

**CommunityForm** (2 categories):
- ✅ `groups_communities` - Running Club (DevTools Test)
- ✅ `support_groups` - Anxiety Support Group (DevTools Test)

**LifestyleForm** (2 categories):
- ✅ `diet_nutrition` - Mediterranean Diet (DevTools Test)
- ✅ `sleep` - Consistent Bedtime (DevTools Test)

**PurchaseForm** (1 category):
- ✅ `products_devices` - White Noise Machine (DevTools Test)

**FinancialForm** (1 category):
- ✅ `financial_products` - High-Yield Savings (DevTools Test)

**Total**: 9 templates, 23 categories, all with pre-configured test data ✅

## Database Verification

Each test verifies the complete data pipeline:

### 1. `solutions` Table
**Key Columns:**
- `id` (uuid) - Solution ID
- `title` (text) - Solution name (e.g., "Vitamin D (DevTools Test)")
- `solution_category` (text) - Category (e.g., "supplements_vitamins")
- `is_approved` (boolean) - Approval status (false until 3 reviews)
- `created_at` (timestamp)

**Verification Query:**
```sql
SELECT id, title, solution_category, is_approved, created_at
FROM solutions
WHERE title = 'Your Solution Name (DevTools Test)'
ORDER BY created_at DESC LIMIT 1;
```

### 2. `solution_variants` Table
**Key Columns:**
- `id` (uuid) - Variant ID
- `solution_id` (uuid) - FK to solutions
- `variant_name` (text) - Variant identifier (e.g., "5000IU")
- `amount` (text) - Dosage amount (e.g., "5000")
- `unit` (text) - Dosage unit (e.g., "IU")
- `form` (text) - Form factor (optional)
- `is_default` (boolean) - Whether this is the default variant
- `created_at` (timestamp)

**Note:** Only used for 4 dosage categories (medications, supplements_vitamins, natural_remedies, beauty_skincare). Other categories create a "Standard" variant.

**Verification Query:**
```sql
SELECT id, variant_name, amount, unit, form, is_default
FROM solution_variants
WHERE solution_id = 'your-solution-id';
```

### 3. `ratings` Table
**Key Columns:**
- `id` (uuid) - Rating ID
- `solution_id` (uuid) - FK to solutions
- `user_id` (uuid) - FK to auth.users
- `goal_id` (uuid) - FK to goals
- `implementation_id` (uuid) - FK to solution_variants
- `effectiveness_score` (numeric) - 1.0 to 5.0
- `duration_used` (text) - How long used (e.g., "6-12 months")
- `side_effects` (text) - Side effects experienced
- `solution_fields` (jsonb) - All form field data
- `data_source` (text) - "human" or "ai"
- `completion_percentage` (integer) - Form completion %
- `is_quick_rating` (boolean) - Quick vs full rating
- `created_at` (timestamp)

**Important:** Rating stores ALL user-submitted form data in `solution_fields` JSONB.

**Verification Query:**
```sql
SELECT id, effectiveness_score, duration_used, side_effects,
       solution_fields, data_source, completion_percentage
FROM ratings
WHERE solution_id = 'your-solution-id'
  AND goal_id = 'your-goal-id';
```

### 4. `goal_implementation_links` Table
**Key Columns:**
- `id` (uuid) - Link ID
- `goal_id` (uuid) - FK to goals
- `implementation_id` (uuid) - FK to solution_variants
- `avg_effectiveness` (numeric) - Average effectiveness rating
- `rating_count` (integer) - Number of ratings
- `aggregated_fields` (jsonb) - **Frontend reads from here**
- `solution_fields` (jsonb) - AI-generated baseline data
- `data_display_mode` (text) - "ai" or "human"
- `transition_threshold` (integer) - Reviews needed to go live (usually 3)
- `human_rating_count` (integer) - Count of human ratings
- `needs_aggregation` (boolean) - Whether data needs re-aggregation
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Critical:** Frontend ONLY reads from `aggregated_fields`, not `solution_fields`.

**Verification Query:**
```sql
SELECT id, goal_id, implementation_id, avg_effectiveness,
       rating_count, aggregated_fields, data_display_mode,
       transition_threshold, human_rating_count
FROM goal_implementation_links
WHERE implementation_id = 'your-variant-id';
```

### 5. Frontend Display Requirements

**Solutions appear on goal page when:**
- `solutions.is_approved = true` (requires `transition_threshold` reviews, typically 3)
- `goal_implementation_links` exists for that goal
- `aggregated_fields` contains properly formatted distribution data

**Distribution Data Format (in aggregated_fields):**
```json
{
  "_metadata": {
    "confidence": "low|medium|high",
    "total_ratings": 1,
    "data_source": "user",
    "last_aggregated": "2025-10-16T01:30:04.973Z"
  },
  "frequency": {
    "mode": "once daily",
    "values": [
      {
        "value": "once daily",
        "count": 1,
        "percentage": 100,
        "source": "user_submission"
      }
    ],
    "totalReports": 1,
    "dataSource": "user_submission"
  }
}
```

All using Supabase MCP tools (no direct database access needed).

## Frontend Verification

Each test confirms:

1. Solution appears in goal page solution list
2. Solution card displays correctly
3. Category-specific icons shown
4. Effectiveness rating visible
5. Distribution fields rendered (if applicable)

## Cleanup

All test data uses `"(DevTools Test)"` suffix for easy identification.

**Manual cleanup**:
```sql
DELETE FROM solutions WHERE title LIKE '%(DevTools Test)%';
```

**Automated cleanup** (via helper functions):
- `deleteTestSolution(name)` - Remove one test
- `deleteAllTestData()` - Remove all tests
- `countTestSolutions()` - Verify cleanup

## Next Steps

### Phase 2: Template Testing (Now Available!)

You can now test any template/category combination:

1. **Pick a category** from the list above
2. **Ask Claude Code**: *"Test the [category] form using DevTools"*
3. Claude will:
   - Use the pre-configured test data
   - Run through the complete flow
   - Verify database and frontend
   - Provide screenshots and results

### Phase 3: Full Coverage (Coming Soon)

- Automated test suite for all 23 categories
- Parallel execution
- Comprehensive reporting
- Variant testing (specific dosages)
- Anonymous user flow testing

### Phase 4: Dashboard (Coming Soon)

- Visual progress tracking
- Screenshot gallery
- Real-time test execution monitoring
- Historical results

## React Form Handling & Dropdown Values

### Critical: Dropdown Value Format

**Forms use machine-readable lowercase values, NOT display text:**

```javascript
// ❌ WRONG - Display text
{ text: "Once daily", value: "once daily" }  // Use "once daily" not "Once daily"

// ✅ CORRECT - Machine-readable value
await fillDropdown('frequency', 'once daily')  // lowercase
```

**Common Dropdown Values:**
- Frequency: `"once daily"`, `"twice daily"`, `"three times daily"`, `"as needed"`
- Time to Results: `"1-2 weeks"`, `"3-4 weeks"`, `"1-2 months"`, `"3-6 months"`
- Length of Use: `"less than 1 month"`, `"1-3 months"`, `"3-6 months"`, `"6-12 months"`, `"1+ years"`
- Cost: `"Free"`, `"Under $10/month"`, `"$10-30/month"`, `"$30-50/month"`, etc.

**Always use lowercase, hyphenated, machine-readable format.**

### Filling React-Controlled Dropdowns

Chrome DevTools `fill()` method doesn't work with React. Use `evaluate_script` instead:

```javascript
// ✅ CORRECT Pattern for React Dropdowns
await evaluateScript({
  function: `(element) => {
    const select = element;

    // Override native setter to bypass React
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLSelectElement.prototype, "value"
    ).set;

    // Set value
    nativeInputValueSetter.call(select, 'once daily');

    // Trigger React events
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));

    return select.value;
  }`,
  args: [{ uid: 'dropdown-uid-from-snapshot' }]
});
```

### Snapshot Freshness

**Always take a fresh snapshot before clicking/filling:**

```javascript
// ❌ WRONG - Stale UIDs
const snapshot = await takeSnapshot();
await click(snapshot.continueButton);
await fill(snapshot.nextField);  // ERROR: Stale snapshot!

// ✅ CORRECT - Fresh snapshot per action
const snapshot1 = await takeSnapshot();
await click(snapshot1.continueButton);

const snapshot2 = await takeSnapshot();  // Fresh!
await fill(snapshot2.nextField);
```

**UIDs become stale after any page interaction.** Always re-snapshot.

## Troubleshooting

### Common Issues

**Test data not appearing on frontend**:
- Check that solution has `is_approved = true` (requires 3 reviews)
- Verify `goal_implementation_links` exists with proper `aggregated_fields`
- Confirm user is authenticated
- Check `transition_threshold` reached (usually 3 reviews)

**Database verification failing**:
- Use correct column names (see Database Verification section)
- Check Supabase MCP connection
- Verify RLS policies allow test user access
- Remember: `solution_fields` is JSONB, not individual columns

**Form not filling correctly**:
- Use lowercase machine-readable dropdown values
- Use `evaluate_script` for React dropdowns, not `fill()`
- Take fresh snapshot before each action
- Trigger both 'input' and 'change' events for React
- Check timing (may need additional waits)

**"Column does not exist" errors**:
- Check table schema in Database Verification section
- Many fields stored in JSONB (`solution_fields`, `aggregated_fields`)
- Use correct query patterns from verification examples

## Support

For issues or questions:
1. Check console output for detailed error messages
2. Review screenshots in `results/screenshots/`
3. Inspect database directly using Supabase dashboard
4. Ask Claude Code for help debugging specific steps

## Architecture Notes

### Why This Approach?

1. **Chrome DevTools MCP**: Direct browser control without Playwright overhead
2. **Complete Pipeline**: Validates every step from form → database → display
3. **Reusable Framework**: Test any category with minimal code
4. **Visual Confirmation**: Screenshots prove frontend rendering
5. **Database Verification**: Supabase MCP ensures data integrity

### Key Design Decisions

- **Test data suffix**: Makes cleanup safe and easy
- **Template-based**: 9 templates handle all 23 categories
- **Step-by-step logging**: Easy debugging and progress tracking
- **Mock-first approach**: Framework built before actual DevTools integration
- **Type-safe**: Full TypeScript coverage prevents errors

## Files Reference

```
chrome-devtools-testing/
├── types/
│   ├── test-data.ts         # All category types
│   └── tracking.ts          # Submission tracking
├── helpers/
│   ├── devtools.ts          # MCP wrappers
│   ├── navigation.ts        # Page navigation
│   ├── form-filling.ts      # Form interactions
│   └── database.ts          # DB verification
├── data/
│   └── test-solutions.ts    # Test data (23 categories)
├── scripts/
│   └── example-test.ts      # Working example
└── docs/
    └── TESTING-GUIDE.md     # This file
```

## Success Criteria

A successful test must:
- ✅ Complete all 15 steps without errors
- ✅ Create database records (solution, variant, rating, link)
- ✅ Display solution on goal page
- ✅ Capture success and goal page screenshots
- ✅ Log all database IDs
- ✅ Be cleanable via suffix filter

---

**Framework Status**: ✅ Phase 1 Complete - Ready for Template Testing!

Ask Claude Code: *"Test the [category] form using DevTools"* to begin.
