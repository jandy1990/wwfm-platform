# WWFM Testing: The Complete Guide

> **⚠️ THIS IS THE AUTHORITATIVE TESTING GUIDE**  
> All other testing documentation should reference this document.  
> Last updated: January 26, 2025 (Post-consolidation)

## 📚 Active Documentation
- **This Guide**: Complete testing reference
- **[FORM_FIX_PROGRESS.md](./FORM_FIX_PROGRESS.md)**: Live dashboard of test status (8/9 forms working)
- **[FORM_FIX_PROCESS.md](./FORM_FIX_PROCESS.md)**: Systematic debugging approach
- **[quick-reference.md](./quick-reference.md)**: Command cheatsheet

## 🚀 Quick Start (2 minutes)

```bash
# Just run this - it handles everything:
npm run test:forms

# That's it! Tests will run with automatic setup and cleanup.
```

**If tests fail**, see [Troubleshooting](#troubleshooting) or continue reading for details.

---

## 🎯 Core Concepts (MUST READ)

### Understanding Our Test Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    TEST EXECUTION                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Test Fixtures (Permanent)                           │
│     ├── 23 pre-created solutions                        │
│     ├── All have "(Test)" suffix                        │
│     ├── Must be approved (is_approved = true)           │
│     └── NEVER deleted by tests                          │
│                                                          │
│  2. Test Creates (Temporary)                            │
│     ├── Ratings (user's effectiveness score)            │
│     ├── Goal Implementation Links                       │
│     └── These ARE deleted after each test               │
│                                                          │
│  3. What Tests Do                                       │
│     ├── Find existing fixture (e.g., "Headspace (Test)")│
│     ├── Submit rating for that fixture                  │
│     ├── Verify data saved correctly                     │
│     └── Clean up the rating (not the fixture!)          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Why This Architecture?

1. **Tests use EXISTING solutions** (fixtures) because:
   - 90% of real users select existing solutions
   - No RLS (Row Level Security) issues
   - Tests run faster (no solution creation)
   - Predictable data for debugging

2. **Tests only create RATINGS** because:
   - That's what users actually do
   - Ratings can be safely deleted
   - Each test run starts fresh

3. **Fixtures have "(Test)" suffix** because:
   - Clearly identifies test data
   - Won't interfere with real data
   - Easy to filter in queries

### The Golden Rules

🔴 **NEVER**:
- Create new solutions in tests (use fixtures)
- Delete test fixtures (they're permanent)
- Override fixture names with timestamps
- Skip the approval step for fixtures

🟢 **ALWAYS**:
- Use pre-created test fixtures
- Clean up ratings after tests
- Keep fixtures approved (is_approved = true)
- Use exact fixture names from TEST_SOLUTIONS

---

## 📦 Test Fixtures Reference

All test fixtures are defined in `/tests/e2e/fixtures/test-solutions.ts`:

| Category | Fixture Name | What It Tests |
|----------|-------------|---------------|
| apps_software | Headspace (Test) | App form submission |
| medications | Prozac (Test) | Dosage form with mg units |
| supplements_vitamins | Vitamin D (Test) | Dosage form with IU units |
| support_groups | Anxiety Support Group (Test) | Community form |
| ... | ... | ... |

**Total: 23 fixtures covering all form types**

### Critical Fixture Requirements

```sql
-- All fixtures MUST be approved for search to work:
UPDATE solutions 
SET is_approved = true 
WHERE source_type = 'test_fixture';

-- Verify they're ready:
SELECT title, is_approved 
FROM solutions 
WHERE source_type = 'test_fixture';
-- Should show 23 rows, all with is_approved = true
```

---

## 🏃 Running Tests

### Basic Commands

```bash
# Run all tests (recommended)
npm run test:forms

# Run specific form tests
npm run test:forms -- app-form-complete

# Run with UI to see what's happening
npm run test:forms:ui

# Debug mode with breakpoints
npm run test:forms:debug

# Run specific test by name
npx playwright test -g "should submit app solution"
```

### What Happens When Tests Run

1. **Global Setup** (`global-setup.ts`)
   - Logs in test user once
   - Saves auth state

2. **Before Each Test**
   - Cleans previous ratings for fixture
   - Ensures clean slate

3. **Test Execution**
   - Navigates to goal page
   - Searches for test fixture
   - Fills and submits form
   - Verifies data in database

4. **After Each Test**
   - Cleans up ratings created
   - Preserves fixtures

### Test User Credentials

- Email: `test@wwfm-platform.com`
- Password: `TestPassword123!`
- User ID: Auto-created on first run
- Goal ID: `56e2801e-0d78-4abd-a795-869e5b780ae7`

---

## ✍️ Writing New Tests

### Step 1: Understand What You're Testing

Tests verify that:
1. User can find and select a test fixture
2. Form fields work correctly
3. Data saves to correct tables
4. Aggregation runs properly

### Step 2: Use the Correct Pattern

```typescript
// CORRECT: Use existing fixture
const testData = {
  title: TEST_SOLUTIONS.apps_software, // "Headspace (Test)"
  category: 'apps_software'
};

// WRONG: Don't create dynamic names
const testData = {
  title: `Test Solution ${Date.now()}`, // ❌ NO!
  category: 'apps_software'
};
```

### Step 3: Follow Test Structure

```typescript
test('should submit solution successfully', async ({ page }) => {
  // 1. Clean up any previous test data
  await clearTestRatingsForSolution(TEST_SOLUTIONS.apps_software);
  
  // 2. Navigate to goal page
  await page.goto(`/goal/${TEST_GOAL_ID}/add-solution`);
  
  // 3. Search for fixture
  await page.fill('#solution-name', TEST_SOLUTIONS.apps_software);
  
  // 4. Select from dropdown (fixture must exist and be approved!)
  await page.click(`text="${TEST_SOLUTIONS.apps_software}"`);
  
  // 5. Fill form fields
  // ... form-specific code ...
  
  // 6. Submit and verify
  await page.click('button:text("Submit")');
  await expect(page).toHaveURL(/success/);
  
  // 7. Verify in database
  const data = await verifyDataInSupabase(TEST_SOLUTIONS.apps_software);
  expect(data.success).toBe(true);
});
```

### Common Patterns

#### Pattern: Multi-step Forms
```typescript
// Step through wizard-style forms
await page.click('button:text("Continue")'); // Step 1 → 2
await page.click('button:text("Continue")'); // Step 2 → 3
await page.click('button:text("Submit")');   // Final step
```

#### Pattern: Optional Fields
```typescript
// Skip optional sections in forms
if (await page.locator('text="Any challenges?"').isVisible()) {
  // Challenges are optional, just continue
  await page.click('button:text("Continue")');
}
```

#### Pattern: Dropdown Selection
```typescript
// Always close dropdowns after selection
await page.click(`text="${solutionName}"`);
await page.click('body'); // Click outside to close
await page.waitForTimeout(200); // Let dropdown close
```

---

## 🔧 Troubleshooting

### Error: "Solution not found in dropdown"

**Cause**: Fixture doesn't exist or isn't approved  
**Fix**:
```sql
-- Check if fixture exists and is approved
SELECT title, is_approved, source_type 
FROM solutions 
WHERE title LIKE '%Headspace%';

-- If not approved, fix it:
UPDATE solutions 
SET is_approved = true 
WHERE source_type = 'test_fixture';
```

### Error: "You've already rated this solution"

**Cause**: Previous test didn't clean up  
**Fix**:
```bash
# Run cleanup before tests
npm run test:setup
```

### Error: "New row violates RLS policy"

**Cause**: Test is trying to CREATE a solution instead of using fixture  
**Fix**:
1. Check form config isn't overriding title
2. Ensure using TEST_SOLUTIONS constant
3. Verify fixture exists in database

### Error: Tests timeout

**Possible causes**:
1. Dev server not running → `npm run dev`
2. Wrong port → Tests expect localhost:3000
3. Dropdown not closing → Click outside after selection
4. Form structure changed → Update selectors

### Tests pass locally but fail in CI

**Check**:
1. GitHub secrets are set (SUPABASE_URL, SUPABASE_SERVICE_KEY)
2. Fixtures exist in production database
3. Fixtures are approved in production

---

## 📁 File Structure

```
tests/
├── e2e/
│   ├── forms/
│   │   ├── *-complete.spec.ts     # Full E2E tests
│   │   ├── form-test-factory.ts   # Reusable test generator
│   │   ├── form-configs.ts        # Form configurations
│   │   └── form-specific-fillers.ts # Form filling logic
│   ├── fixtures/
│   │   └── test-solutions.ts      # List of test fixtures
│   └── utils/
│       ├── test-helpers.ts        # Helper functions
│       └── test-cleanup.ts        # Cleanup utilities
└── setup/
    ├── global-setup.ts            # Playwright auth setup
    └── complete-test-setup.js     # Database setup script
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ DON'T: Override Fixture Names
```typescript
// WRONG - This breaks everything!
generateTestData: (category) => ({
  title: `Community Test ${Date.now()}`, // ❌
  category: category
})

// CORRECT - Use the fixture
generateTestData: (category) => ({
  // Don't override title, let it use TEST_SOLUTIONS
  category: category
})
```

### ❌ DON'T: Delete Test Fixtures
```typescript
// WRONG - Never delete fixtures!
await supabase.from('solutions').delete()
  .eq('title', 'Headspace (Test)'); // ❌

// CORRECT - Only delete ratings
await supabase.from('ratings').delete()
  .eq('implementation_id', variantId); // ✅
```

### ❌ DON'T: Create New Solutions in Tests
```typescript
// WRONG - Tests shouldn't create solutions
await supabase.from('solutions').insert({
  title: 'My New Test Solution' // ❌
});

// CORRECT - Use existing fixtures
await page.fill('#solution-name', TEST_SOLUTIONS.apps_software);
```

---

## 📚 Additional Resources

### Internal Documentation
- [`/tests/e2e/fixtures/test-solutions.ts`](/tests/e2e/fixtures/test-solutions.ts) - Fixture definitions
- [`/CLAUDE.md`](/CLAUDE.md) - AI assistant context
- [`/docs/database/schema.md`](/docs/database/schema.md) - Database structure

### Deprecated Documentation
The following docs are outdated. Use this guide instead:
- ~~/tests/e2e/forms/README.md~~ (Partial info, references this guide)
- ~~/docs/testing/testing-setup.md~~ (Old approach)
- ~~/docs/archive/*~~ (Historical only)

### External Resources
- [Playwright Documentation](https://playwright.dev)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)

---

## 🆘 Getting Help

1. **First**: Re-read this guide, especially [Troubleshooting](#troubleshooting)
2. **Second**: Check test output for specific errors
3. **Third**: Run in debug mode to see what's happening
4. **Fourth**: Ask team with specific error message

---

## 📋 Quick Reference Card

```bash
# Setup
npm run test:setup          # One-time setup

# Running Tests  
npm run test:forms          # Run all tests
npm run test:forms:ui       # Run with UI
npm run test:forms:debug    # Debug mode

# Specific Tests
npm run test:forms -- app-form
npm run test:forms -- --grep "medications"

# Cleanup
npm run test:cleanup        # Clean test data
```

**Remember**: 
- Tests use EXISTING fixtures (don't create solutions)
- Fixtures must be APPROVED (is_approved = true)
- Tests create RATINGS (which get cleaned up)
- Fixtures are PERMANENT (never deleted)

---

*This document is the single source of truth for WWFM testing. All other documentation should reference this guide.*