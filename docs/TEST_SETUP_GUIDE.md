# WWFM Test Setup Guide

## Quick Start

Before running any tests, you MUST run the setup command:

```bash
npm run test:setup
```

This command:
1. Creates/verifies the test user (test@wwfm-platform.com)
2. Cleans up old test data
3. Sets up test fixtures (23 pre-configured test solutions)
4. Verifies everything is ready

## Running Tests

After setup, you can run tests:

```bash
# Run all form tests
npm run test:forms

# Run specific test file
npm run test:forms -- tests/e2e/forms/dosage-form-complete.spec.ts

# Run with UI mode (interactive)
npm run test:forms:ui

# Run with browser visible
npm run test:forms:headed

# Debug mode
npm run test:forms:debug
```

## Common Issues & Solutions

### Issue 1: "Failed to sign in test user"

**Cause:** Next.js build cache corruption or server not running properly

**Solution:**
```bash
# 1. Kill existing dev server
pkill -f "next dev"

# 2. Clear Next.js cache
rm -rf .next

# 3. Start fresh dev server
npm run dev

# 4. Re-run test setup
npm run test:setup

# 5. Try tests again
npm run test:forms
```

### Issue 2: "Already rated" errors

**Cause:** Test data wasn't cleaned up properly

**Solution:**
```bash
npm run test:setup
```

### Issue 3: Tests timeout

**Cause:** Server is slow or tests are running too fast

**Solution:**
- Ensure dev server is running: `npm run dev`
- Run tests with single worker: Tests are already configured for this
- Increase timeout in playwright.config.ts if needed

## Test Architecture

### Authentication
- Uses global setup (tests/setup/global-setup.ts)
- Creates auth.json with saved session
- All tests share this authentication

### Test Fixtures
- 23 pre-configured test solutions (one per category)
- All have "(Test)" suffix to identify them
- Stored in tests/fixtures/test-solutions.ts

### Data Cleanup
- test:setup cleans all test data before starting
- Individual tests can use clearTestRatingsForSolution() 
- Test fixtures are preserved between runs

## Enhanced Test Features (Added Today)

### Field-Level Verification
Tests now verify that submitted data is correctly:
1. Saved to the database
2. Aggregated properly
3. Displayed in the UI

Example:
```typescript
const result = await verifyDataPipeline(
  TEST_SOLUTIONS.supplements_vitamins,
  'supplements_vitamins',
  {
    effectiveness: 4,
    dosage_amount: '5000',
    dosage_unit: 'IU'
  }
)
```

### Success Screen Testing
Tests can now verify optional success screen fields:
```typescript
await fillSuccessScreenFields(page, {
  side_effects: 'None',
  would_recommend: true
})
```

### UI Display Verification
Tests verify that fields appear correctly in the UI:
```typescript
await verifyFieldsInUI(page, {
  'Dosage Amount': '5000',
  'Dosage Unit': 'IU'
})
```

## Test User Credentials

- Email: test@wwfm-platform.com
- Password: TestPassword123!
- Created automatically by test:setup if doesn't exist

## Environment Variables

Required in .env.test.local:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
TEST_GOAL_ID=56e2801e-0d78-4abd-a795-869e5b780ae7
```

## Directory Structure

```
tests/
├── e2e/
│   ├── forms/              # Form-specific tests
│   ├── fixtures/            # Test data fixtures
│   └── utils/               # Helper functions
├── setup/
│   ├── global-setup.ts      # Auth setup
│   └── complete-test-setup.js # Data setup
└── playwright.config.ts     # Test configuration
```

## Important Commands Summary

```bash
# ALWAYS run this first
npm run test:setup

# Then run tests
npm run test:forms           # All tests
npm run test:forms:ui        # Interactive UI
npm run test:forms:headed    # See browser
npm run test:forms:debug     # Debug mode

# If auth fails, rebuild:
rm -rf .next && npm run dev
```