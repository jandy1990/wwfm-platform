# WWFM E2E Testing Guide

## Overview

This directory contains end-to-end tests for the WWFM platform using Playwright. The tests focus on verifying the complete data flow from form submission through to database storage.

**✅ Status: All 9 form types are fully tested and working!**

## Setup

### 1. Install Dependencies

```bash
npm install -D @playwright/test playwright
npx playwright install
```

### 2. Configure Environment

Copy the test environment template and add your credentials:

```bash
cp .env.test.local.example .env.test.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anonymous key
- `SUPABASE_SERVICE_KEY`: Service role key (bypasses RLS for testing)
- `TEST_GOAL_ID`: UUID of a dedicated test goal

### 3. Create Test Goal

In your Supabase dashboard or using SQL:

```sql
INSERT INTO goals (title, description, arena_id, is_approved)
VALUES (
  'TEST - Automated Testing Goal',
  'This goal is used for automated E2E testing. Do not delete.',
  (SELECT id FROM arenas LIMIT 1),
  true
);
```

### 4. Create and Approve Test Fixtures (CRITICAL)

The tests use pre-created test solutions that MUST exist and be approved in the database:

```sql
-- After test fixtures are created, they MUST be approved
-- Run this script: /tests/setup/approve-test-fixtures.sql

UPDATE solutions 
SET is_approved = true 
WHERE source_type = 'test_fixture';

-- Verify all 23 test fixtures are approved
SELECT title, is_approved, source_type 
FROM solutions 
WHERE source_type = 'test_fixture';
```

**⚠️ IMPORTANT**: Test fixtures must have `is_approved = true` or they won't appear in search dropdowns during tests. The application filters search results to only show approved solutions.

## Running Tests

```bash
# Run all form tests
npm run test:forms

# Run tests with UI mode (interactive)
npm run test:forms:ui

# Run tests in debug mode
npm run test:forms:debug

# Run tests with visible browser
npm run test:forms:headed

# Run specific test file
npm run test:forms -- dosage-form

# Generate and view HTML report
npm run test:forms:report
```

## Test Fixtures

Tests use permanent test solutions in the database (see `/tests/e2e/TEST_SOLUTIONS_SETUP.md`):
- All have "(Test)" suffix for identification
- Marked with `source_type = 'test_fixture'`
- MUST have `is_approved = true` to appear in search
- Protected from cleanup functions

Example test fixtures:
- `CBT Therapy (Test)` → therapists_counselors
- `Headspace (Test)` → apps_software
- `Prozac (Test)` → medications

## Writing Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test'
import { testSupabase, generateTestSolution, cleanupTestData } from '../utils/test-helpers'

test.describe('FormName - Data Pipeline', () => {
  const testData = generateTestSolution('category_name')
  
  test.afterEach(async () => {
    await cleanupTestData(testData.title)
  })

  test('saves all required fields', async ({ page }) => {
    // Your test implementation
  })
})
```

### Using Test Helpers

```typescript
// Generate unique test data
const testData = generateTestSolution('medications')

// Fill standard fields
await fillStandardFields(page, testData)

// Select dropdown options
await selectOption(page, '[name="cost"]', '$50-100/month')

// Check multiple checkboxes
await checkOptions(page, ['Nausea', 'Headache'])

// Wait for success navigation
await waitForSuccessPage(page)

// Verify JSONB structure
const validation = verifyJSONBStructure(solutionFields, expectedFields)
expect(validation.isValid).toBe(true)
```

## Test Data

Test fixtures are available in `/tests/e2e/fixtures/test-data.ts`:
- `FORM_DROPDOWN_OPTIONS`: All dropdown values by field name
- `ARRAY_FIELD_OPTIONS`: Checkbox/multi-select options
- `SAMPLE_FORM_DATA`: Example data for each category
- `EXPECTED_FIELDS_BY_FORM`: Required fields per form type

## Debugging Failed Tests

### View Test Report
```bash
npm run test:forms:report
```

### Debug Mode
```bash
npm run test:forms:debug
```

### Common Issues

1. **"Solution not found in dropdown"**
   - Check if test fixtures are approved: `SELECT title, is_approved FROM solutions WHERE source_type = 'test_fixture'`
   - Run approval script if needed: `/tests/setup/approve-test-fixtures.sql`
   - Verify exact title match including "(Test)" suffix

2. **"Radio button not being selected"**
   - SessionForm now uses standard HTML radio inputs instead of shadcn RadioGroup
   - This was fixed to ensure test compatibility
   - See `/docs/testing/SESSIONFORM_FIX.md` for details

2. **"Solution not found in database"**
   - Check if form submission succeeded
   - Verify RLS policies aren't blocking
   - Check test is using correct table

3. **"Field count mismatch"**
   - Compare against CATEGORY_CONFIG in GoalPageClient.tsx
   - Verify field names match exactly
   - Check array fields are properly formatted

4. **"Timeout waiting for navigation"**
   - Increase timeout in waitForSuccessPage
   - Check for form validation errors
   - Verify API endpoints are working

5. **"Cannot find element"**
   - Use Playwright Inspector to find correct selectors
   - Check if element is within Shadow DOM
   - Verify element is visible before interaction

## CI/CD Integration

Tests run automatically on:
- Pull requests affecting form code
- Pushes to main branch
- Manual workflow dispatch

See `.github/workflows/form-tests.yml` for configuration.

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data (but never test fixtures)
3. **Unique Names**: Use test fixtures for predictability
4. **Explicit Waits**: Use proper wait conditions
5. **Error Messages**: Write descriptive assertions
6. **Fixture Approval**: Always verify test fixtures are approved

## Troubleshooting

### Test Fixtures Not Appearing in Search

This is the most common issue. The application filters search results to only show approved solutions:

```sql
-- Check approval status
SELECT title, is_approved 
FROM solutions 
WHERE source_type = 'test_fixture';

-- Fix if needed
UPDATE solutions 
SET is_approved = true 
WHERE source_type = 'test_fixture';
```

### Local Development Issues

If tests fail locally but pass in CI:
1. Check your local environment variables
2. Ensure dev server is running on correct port
3. Clear Playwright cache: `npx playwright clean-downloads`
4. Update browsers: `npx playwright install`
5. Verify test fixtures are approved in your local database

### Need Help?

- Playwright Docs: https://playwright.dev
- Project Architecture: /ARCHITECTURE.md
- Form Implementation: /testing/testing-setup.md
- Test Fixtures Setup: /tests/e2e/TEST_SOLUTIONS_SETUP.md