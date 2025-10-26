# WWFM Testing: The Complete Guide

> **⚠️ THIS IS THE AUTHORITATIVE TESTING GUIDE**
> All other testing documentation should reference this document.
> Last updated: October 26, 2025 (Added mandatory test setup section)

## 🚨 MANDATORY SETUP FOR PRODUCTION DATABASE TESTS

**IF testing against production database (wqxkhxdbxdtpuvuvgirx.supabase.co):**

```bash
# REQUIRED STEP 1: Create test fixtures
npm run test:setup

# STEP 2: Run tests
npm run test:critical
```

**Skip `test:setup` and ALL tests fail with "Solution not found"**

This creates 24 test solutions with "(Test)" suffix that tests depend on.

---

## 📚 Active Documentation
- **This Guide**: Complete testing reference
- **[FORM_FIX_PROGRESS.md](./FORM_FIX_PROGRESS.md)**: Live dashboard of test status (8/9 forms working)
- **[FORM_FIX_PROCESS.md](./FORM_FIX_PROCESS.md)**: Systematic debugging approach
- **[quick-reference.md](./quick-reference.md)**: Command cheatsheet

## 🚀 Quick Start (2 minutes)

```bash
# Disposable Supabase + Chromium suite
npm run test:forms:local

# That's it! The script starts Supabase, seeds fixtures, runs tests, then stops Supabase.
```

> Requires the Supabase CLI and Docker to be installed locally.

### Prepare the database before the first run

The local Supabase container starts empty. Restore a production dump (schema + reference data) once before running the tests:

```bash
# Start Supabase locally if it is not running yet
npm run test:db:start

# Restore a plain SQL dump
psql \
  -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  -f ~/Downloads/wwfm-backup.sql

# Or restore a pg_dump archive
pg_restore \
  --clean --if-exists --no-owner \
  -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  ~/Downloads/wwfm-backup.backup

# When finished
npm run test:db:stop
```

Use password `postgres` unless you changed it. The restored data is persisted by Docker; repeat this only if you wipe the volumes.

**If tests fail**, see [Troubleshooting](#troubleshooting) or continue reading for details.

---

## 📊 Complete Test Output Capture

### Automatic JSON Output Generation

**Every test run automatically generates complete, non-truncated output** at:
```
test-results/latest.json
```

This file contains:
- Full test results for all specs
- Complete error messages (no truncation)
- Stack traces with line numbers
- Test timing information
- Browser console logs
- Network request details

### Why This Matters

1. **Terminal Output Truncates**: Console output often cuts off critical error details
2. **AI Assistant Analysis**: The JSON file is essential for debugging with AI tools
3. **Complete Context**: Captures everything needed to diagnose failures
4. **Searchable**: Easy to grep/search for specific errors or patterns

### Viewing Test Results

```bash
# Pretty-print the latest results
cat test-results/latest.json | jq '.'

# Search for specific errors
cat test-results/latest.json | jq '.suites[].specs[] | select(.ok == false)'

# View specific test details
cat test-results/latest.json | jq '.suites[] | select(.title | contains("app-form"))'

# Count failures
cat test-results/latest.json | jq '[.suites[].specs[] | select(.ok == false)] | length'
```

### Integration with Testing Workflow

```
┌─────────────────────────────────────────────────────────┐
│                    TEST EXECUTION FLOW                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Run Tests                                           │
│     npm run test:forms:local                            │
│                                                          │
│  2. Automatic Output Capture                            │
│     ├── Console shows live progress                     │
│     ├── JSON captures complete details                  │
│     └── Saved to test-results/latest.json               │
│                                                          │
│  3. Review Results                                      │
│     ├── Quick scan: Terminal output                     │
│     ├── Deep dive: latest.json                          │
│     └── Visual: HTML report (if generated)              │
│                                                          │
│  4. Debug Failures                                      │
│     ├── Check latest.json for full error                │
│     ├── Review stack traces                             │
│     └── Share JSON with team/AI for analysis            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### When to Use JSON vs HTML Reports

**Use latest.json when**:
- Debugging test failures
- Working with AI assistants
- Searching for specific errors
- Need complete, untruncated output
- Terminal output is insufficient

**Use HTML reports when**:
- Visual overview of test suite
- Sharing results with non-technical stakeholders
- Need screenshots/videos of failures
- Want interactive exploration

```bash
# Generate HTML report (in addition to JSON)
npx playwright show-report
```

### Essential for AI Assistant Debugging

When asking AI assistants to help debug test failures:

```bash
# 1. Run the tests
npm run test:forms:local

# 2. Share the complete output
cat test-results/latest.json

# AI can now see:
# - Exact error messages (not truncated)
# - Full stack traces
# - All test context
# - Timing information
```

**Without latest.json**: AI sees truncated errors like "...ReferenceError: xyz is not..."
**With latest.json**: AI sees complete error, stack trace, and full context for accurate diagnosis

### Troubleshooting Output Capture

**Issue**: `latest.json` not generated
**Cause**: Playwright reporter not configured
**Fix**: Check `playwright.config.ts` includes JSON reporter:
```typescript
reporter: [
  ['list'],
  ['json', { outputFile: 'test-results/latest.json' }]
]
```

**Issue**: JSON file is empty or incomplete
**Cause**: Tests crashed before completion
**Fix**: Run with `--max-failures=1` to stop after first failure and capture partial results

**Issue**: Need older test results
**Solution**: Copy `latest.json` before next run:
```bash
cp test-results/latest.json test-results/backup-$(date +%Y%m%d-%H%M%S).json
```

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
# Full Chromium suite against disposable Supabase (recommended)
npm run test:forms:local

# Legacy all-project suite (requires Supabase already running)
npm run test:forms

# Run a specific form or spec
npm run test:forms -- app-form-complete

# Interactive and debug modes
npm run test:forms:ui
npm run test:forms:debug

# Run specific test by name
npx playwright test -g "should submit app solution"

# Manage disposable Supabase manually
npm run test:db:start
npm run test:db:seed
npm run test:db:status
npm run test:db:stop
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

> **💡 Pro Tip**: All test runs generate complete output at `test-results/latest.json` with full error messages and stack traces. See [Complete Test Output Capture](#complete-test-output-capture) for details.

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
npm run test:db:seed
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
5. Next.js still compiling and serving the 404 placeholder → wait for the message `This page could not be found.` to disappear (tests now wait up to 60 s automatically)

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
2. **Second**: Check `test-results/latest.json` for complete error details
3. **Third**: Run in debug mode to see what's happening
4. **Fourth**: Ask team/AI with:
   - Specific error message from `latest.json`
   - Full stack trace
   - What you've already tried

**When asking for help, always include**:
```bash
# Share complete test results
cat test-results/latest.json
```

This provides untruncated errors, stack traces, and full context for accurate debugging.

---

## 📋 Quick Reference Card

```bash
# Setup
npm run test:db:seed          # One-time setup

# Running Tests
npm run test:forms          # Run all tests
npm run test:forms:ui       # Run with UI
npm run test:forms:debug    # Debug mode

# Specific Tests
npm run test:forms -- app-form
npm run test:forms -- --grep "medications"

# View Test Results
cat test-results/latest.json | jq '.'  # Complete results
cat test-results/latest.json | jq '.suites[].specs[] | select(.ok == false)'  # Failures only

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
