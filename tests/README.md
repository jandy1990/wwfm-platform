# WWFM E2E Testing Guide

## Overview

This directory contains end-to-end tests for the WWFM platform using Playwright. The tests focus on verifying the complete data flow from form submission through to database storage.

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

1. **"Solution not found in database"**
   - Check if form submission succeeded
   - Verify RLS policies aren't blocking
   - Check test is using correct table

2. **"Field count mismatch"**
   - Compare against CATEGORY_CONFIG in GoalPageClient.tsx
   - Verify field names match exactly
   - Check array fields are properly formatted

3. **"Timeout waiting for navigation"**
   - Increase timeout in waitForSuccessPage
   - Check for form validation errors
   - Verify API endpoints are working

4. **"Cannot find element"**
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
2. **Cleanup**: Always clean up test data
3. **Unique Names**: Use timestamps in test data
4. **Explicit Waits**: Use proper wait conditions
5. **Error Messages**: Write descriptive assertions

## Troubleshooting

### Local Development Issues

If tests fail locally but pass in CI:
1. Check your local environment variables
2. Ensure dev server is running on correct port
3. Clear Playwright cache: `npx playwright clean-downloads`
4. Update browsers: `npx playwright install`

### Need Help?

- Playwright Docs: https://playwright.dev
- Project Architecture: /ARCHITECTURE.md
- Form Implementation: /testing/testing-setup.md