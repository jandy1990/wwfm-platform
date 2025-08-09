# Test Solutions Setup

## Overview

We use **permanent test solutions** in the database for all form tests. This approach provides:
- ✅ Realistic testing (users select existing solutions 90% of the time)
- ✅ Fast test execution (no database writes)
- ✅ Predictable debugging (same data every time)
- ✅ No RLS policy complications

## Test Solutions Created

All test solutions have been created in Supabase with:
- **(Test)** suffix in the title for clear identification
- `source_type = 'test_fixture'` for database queries
- Proper categorization and variants
- **MUST BE APPROVED** for search to work (is_approved = true)

### Complete List

| Category | Test Solution | Variant |
|----------|--------------|---------|
| apps_software | Headspace (Test) | Standard |
| medications | Prozac (Test) | 20mg tablet |
| supplements_vitamins | Vitamin D (Test) | 1000IU softgel |
| natural_remedies | Lavender Oil (Test) | 5 drops oil |
| beauty_skincare | Retinol Cream (Test) | Standard |
| exercise_movement | Running (Test) | Standard |
| meditation_mindfulness | Mindfulness Meditation (Test) | Standard |
| habits_routines | Morning Routine (Test) | Standard |
| therapists_counselors | CBT Therapy (Test) | Standard |
| doctors_specialists | Psychiatrist (Test) | Standard |
| coaches_mentors | Life Coach (Test) | Standard |
| alternative_practitioners | Acupuncture (Test) | Standard |
| professional_services | Financial Advisor (Test) | Standard |
| medical_procedures | Physical Therapy (Test) | Standard |
| crisis_resources | Crisis Hotline (Test) | Standard |
| products_devices | Fitbit (Test) | Standard |
| books_courses | Cognitive Therapy Book (Test) | Standard |
| support_groups | Anxiety Support Group (Test) | Standard |
| groups_communities | Running Club (Test) | Standard |
| diet_nutrition | Mediterranean Diet (Test) | Standard |
| sleep | Sleep Hygiene (Test) | Standard |
| hobbies_activities | Painting (Test) | Standard |
| financial_products | High Yield Savings (Test) | Standard |

## 🚨 CRITICAL: Test Fixtures Must Be Approved

**The search functionality filters out non-approved solutions!** Test fixtures MUST have `is_approved = true` or they won't appear in search dropdowns during tests.

### Approve Test Fixtures (Required Step)
After creating test fixtures, run this SQL:

```sql
-- Approve all test fixtures so they appear in search
UPDATE solutions 
SET is_approved = true 
WHERE source_type = 'test_fixture';

-- Verify all are approved
SELECT title, is_approved, source_type 
FROM solutions 
WHERE source_type = 'test_fixture'
ORDER BY title;
```

**Location**: `/tests/setup/approve-test-fixtures.sql`

## How Tests Use These Solutions

### 1. Test Configuration
```typescript
// tests/e2e/fixtures/test-solutions.ts
export const TEST_SOLUTIONS = {
  apps_software: 'Headspace (Test)',
  medications: 'Prozac (Test)',
  // ... etc
}
```

### 2. In Tests
```typescript
// Tests now use pre-created solutions
const testData = generateTestSolution('apps_software')
// Returns: { title: 'Headspace (Test)', ... }

// Fill form with test solution
await page.fill('#solution-name', testData.title)
```

### 3. Auto-Categorization
The test solutions are named to trigger correct auto-categorization:
- "Headspace" → apps_software
- "Prozac" → medications
- "Running" → exercise_movement

## Important Notes

### DO NOT DELETE Test Fixtures
The cleanup function has been updated to protect test fixtures:
```typescript
// This will skip cleanup for any test fixture
if (titlePattern.includes('(Test)')) {
  console.log('Skipping cleanup for test fixture:', titlePattern)
  return
}
```

### Verifying Test Solutions Exist and Are Approved
```sql
-- Check all test solutions are present AND approved
SELECT 
  solution_category,
  title,
  is_approved,
  source_type
FROM solutions 
WHERE source_type = 'test_fixture'
ORDER BY solution_category;

-- Should return exactly 23 rows, all with is_approved = true
```

### If Test Solutions Are Missing or Not Approved
1. First check if they exist:
   ```sql
   SELECT COUNT(*) FROM solutions WHERE source_type = 'test_fixture';
   ```

2. If they exist but aren't approved:
   ```sql
   -- Run the approval script
   UPDATE solutions SET is_approved = true WHERE source_type = 'test_fixture';
   ```

3. If missing entirely, recreate them using the setup scripts in `/tests/setup/`

## Why Search Requires Approval

The application's search function (`/lib/solutions/categorization.ts`) filters results:

```typescript
// This is why test fixtures must be approved
const { data: solutions } = await supabase
  .from('solutions')
  .select('id, title, solution_category')
  .ilike('title', `%${normalizedSearch}%`)
  .eq('is_approved', true)  // ← Only approved solutions appear
  .limit(20);
```

Without `is_approved = true`, test fixtures won't appear in the dropdown when tests try to search for them.

## Benefits Over Creating New Solutions

1. **No RLS Issues**: Test user can select existing solutions without INSERT permissions
2. **Faster Tests**: No database writes means tests run in seconds
3. **Predictable**: Same solution IDs every time aids debugging
4. **Realistic**: Matches actual user behavior
5. **Clean Database**: No accumulation of test data

## Testing Solution Creation Separately

While form tests use existing solutions, we can still test solution creation:

```typescript
// tests/e2e/solution-creation.spec.ts
test.describe('Solution Creation', () => {
  test('admin can create new solution', async ({ page }) => {
    // Uses admin credentials
    // Specifically tests the creation path
  })
})
```

## Troubleshooting

### Test fails with "Solution not found in dropdown"
1. **Check approval status**: 
   ```sql
   SELECT title, is_approved FROM solutions 
   WHERE title LIKE '%CBT Therapy%';
   ```
2. If `is_approved = false`, run the approval script
3. Verify solution title matches exactly (including "(Test)")

### Test creates new solution instead of using existing
- Ensure exact title match: 'Headspace (Test)' not 'Headspace Test'
- Check that solution is approved in database
- Verify test is using `generateTestSolution()` helper

### Cleanup deleted test fixtures
- Test fixtures should NEVER be deleted
- If deleted, re-run creation script
- Then run approval script
- Check cleanup function isn't matching fixture patterns

---

## Summary

The test solution approach gives us:
- ✅ Reliable, fast tests
- ✅ No RLS complications  
- ✅ Realistic user flows
- ✅ Clean, predictable data

**Remember**: Always ensure test fixtures are approved (`is_approved = true`) or tests will fail!