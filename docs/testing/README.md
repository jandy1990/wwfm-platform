# WWFM Testing Documentation

## Overview

WWFM uses automated E2E testing to ensure the form submission pipeline works correctly from UI to database. This documentation covers the complete testing setup, from local development to CI/CD.

## Quick Start

### 1. Set Up Environment

```bash
# Copy test environment template
cp .env.test.local.example .env.test.local

# Add your credentials to .env.test.local
# - Service role key from Supabase dashboard
# - Test goal ID is already set
```

### 2. Run Tests Locally

```bash
# Install dependencies (if not already done)
npm install
npx playwright install

# Run all form tests
npm run test:forms

# Run specific form tests
npm run test:forms -- dosage-form

# Run with UI (recommended for debugging)
npm run test:forms:ui
```

### 3. View Results

```bash
# Generate HTML report
npm run test:forms:report
```

## Documentation Index

### Setup & Configuration
- [Implementation Plan](./implementation-plan.md) - Full project plan with checklist
- [Testing Setup Guide](./testing-setup.md) - Original comprehensive guide
- [GitHub Secrets Setup](./github-secrets-setup.md) - CI/CD configuration

### Test Structure
- [Test Directory Structure](/tests/STRUCTURE.md) - How tests are organized
- [Test Utilities](/tests/README.md) - Helper functions and patterns
- [Form Test Factory](/tests/e2e/forms/README.md) - Reusable test framework

### CI/CD
- [GitHub Actions README](/.github/workflows/README.md) - Workflow documentation
- [Workflows](/.github/workflows/) - Automated test execution

### Special Topics
- [Handling Seeded Data](/tests/e2e/notes/handling-seeded-data.md) - Testing with AI-generated content

## Key Concepts

### 1. Test Goal Isolation

All tests run against a dedicated test goal to avoid polluting production data:
- Goal ID: `91d4a950-bb87-4570-b32d-cf4f4a4bb20d`
- Title: "TEST GOAL - Automated E2E Testing"
- Tagged with: `['test', 'automated', 'e2e', 'ignore-for-analytics']`

### 2. Form Testing Flow

Each form test follows this pattern:
1. Navigate to `/goal/{TEST_GOAL_ID}/add-solution`
2. Enter solution name (triggers auto-categorization)
3. Confirm or select category
4. Fill multi-step form
5. Submit and verify data in database

### 3. Data Verification

Tests verify the complete data pipeline:
```
Form Input → Solution Creation → Variant Creation → Goal Link → JSONB Fields
```

### 4. Test Factory Pattern

The test factory (`form-test-factory.ts`) provides:
- Automated tests for all form categories
- Consistent test structure
- Easy addition of new forms
- Built-in cleanup

## Current Test Coverage

### ✅ Implemented
- **DosageForm** (4 categories)
  - medications
  - supplements_vitamins
  - natural_remedies
  - beauty_skincare

### 📋 Ready for Implementation
- **SessionForm** (7 categories)
- **PracticeForm** (3 categories)
- **AppForm** (1 category)

### ⏳ Pending Forms
- PurchaseForm (2 categories)
- CommunityForm (2 categories)
- LifestyleForm (2 categories)
- HobbyForm (1 category)
- FinancialForm (1 category)

## Best Practices

### 1. Writing Tests

```typescript
// Use descriptive test names
test('medications: complete form submission flow', async ({ page }) => {
  // Test implementation
})

// Always cleanup test data
test.afterEach(async () => {
  await cleanupTestData(testData.title)
})

// Use data attributes for selectors when possible
await page.click('[data-testid="submit-button"]')
```

### 2. Debugging Failed Tests

```bash
# Run single test with headed browser
npm run test:forms:headed -- -g "medications"

# Use debug mode with breakpoints
npm run test:forms:debug

# Check screenshots in test results
open playwright-report/index.html
```

### 3. CI/CD Considerations

- Tests run on every PR affecting forms
- Nightly tests run across all browsers
- Keep tests under 5 minutes total
- Use GitHub secrets for credentials

## Troubleshooting

### Common Issues

#### "Missing required environment variables"
- Check `.env.test.local` exists and has all 4 variables
- Ensure no typos in variable names

#### "Solution not found in database"
- Form may have validation errors
- Check browser console in headed mode
- Verify test goal exists and is approved

#### "Timeout waiting for element"
- Selectors may have changed
- Use Playwright Inspector to find new selectors
- Check if form structure changed

#### Tests pass locally but fail in CI
- Ensure GitHub secrets are set correctly
- Check for timing issues (CI may be slower)
- Verify same Node/browser versions

### Debug Commands

```bash
# List all available tests
npm run test:forms -- --list

# Run with verbose logging
DEBUG=pw:api npm run test:forms

# Generate trace for debugging
npm run test:forms -- --trace on
```

## Adding New Form Tests

### 1. Create Form Configuration

Add to `/tests/e2e/forms/form-configs.ts`:

```typescript
export const yourFormConfig: FormTestConfig = {
  formName: 'YourForm',
  categories: ['category1', 'category2'],
  requiredFields: ['field1', 'field2'],
  // ... configuration
}
```

### 2. Create Test File

Create `/tests/e2e/forms/your-form.spec.ts`:

```typescript
import { createFormTest } from './form-test-factory'
import { yourFormConfig } from './form-configs'

createFormTest(yourFormConfig)
```

### 3. Run Tests

```bash
npm run test:forms -- your-form
```

### 4. Update Documentation

- Add to coverage list
- Update any changed selectors
- Document special cases

## Maintenance

### Weekly Tasks
- Review test execution times
- Check for flaky tests
- Update selectors if UI changed

### Monthly Tasks
- Review test coverage
- Update documentation
- Optimize slow tests
- Archive old test reports

### On Each Release
- Run full test suite
- Update test data if needed
- Document any new patterns

## Resources

### Internal
- [CLAUDE.md](/CLAUDE.md) - AI assistant instructions
- [ARCHITECTURE.md](/ARCHITECTURE.md) - System architecture
- [Database Schema](/docs/database/schema.md) - Table structures

### External
- [Playwright Documentation](https://playwright.dev)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)

## Contact

For questions about testing:
1. Check this documentation first
2. Review test examples in codebase
3. Ask in team chat with @testing tag

---

**Remember**: Every form needs tests. No exceptions! 🧪