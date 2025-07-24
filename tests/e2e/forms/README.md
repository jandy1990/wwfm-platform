# Form Test Factory Documentation

## Overview

The form test factory provides a reusable system for testing all 9 WWFM form types. It handles the common testing patterns while allowing customization for form-specific behavior.

## Using the Factory

### 1. Create a Form Configuration

```typescript
import { FormTestConfig } from './form-test-factory'

export const yourFormConfig: FormTestConfig = {
  formName: 'YourForm',
  categories: ['category1', 'category2'], // All categories using this form
  requiredFields: ['field1', 'field2', 'field3'],
  arrayFields: ['multi_select_field'], // Optional
  hasVariants: false, // true only for dosage categories
  
  generateTestData: (category: string) => ({
    // Return test data specific to this form
    field1: 'value1',
    field2: 'value2',
    field3: 'value3',
    multi_select_field: ['option1', 'option2']
  }),
  
  fillFormSteps: async (page: Page, testData: any) => {
    // Fill form fields step by step
    await fillStandardFields(page, testData) // title & description
    await selectOption(page, '[name="field1"]', testData.field1)
    // ... fill other fields
  },
  
  verifyData: (result, testData) => {
    // Optional: Additional verification
    expect(result.solutionFields.field1).toBe(testData.field1)
  }
}
```

### 2. Create Test File

```typescript
import { createFormTest } from './form-test-factory'
import { yourFormConfig } from './form-configs'

// This creates all standard tests
createFormTest(yourFormConfig)

// Add form-specific tests if needed
test.describe('YourForm - Special Cases', () => {
  test('handles special scenario', async ({ page }) => {
    // Your custom test
  })
})
```

## What the Factory Tests

Each form configuration automatically gets these tests:

1. **Data Pipeline Test** (per category)
   - Verifies form submission creates correct database entries
   - Checks solution, variant, and goal_implementation_links
   - Validates JSONB field structure
   - Ensures array fields maintain their type

2. **Validation Test**
   - Attempts submission without required fields
   - Verifies validation messages appear

3. **Navigation Test**
   - Tests backward navigation preserves data
   - Verifies multi-step form behavior

## Form Configuration Reference

### Required Properties

- `formName`: Display name for test suite
- `categories`: Array of solution categories using this form
- `requiredFields`: Fields that must be in solution_fields JSONB
- `hasVariants`: Whether categories create real variants (vs "Standard")
- `fillFormSteps`: Function to fill out the form

### Optional Properties

- `arrayFields`: Fields that should remain arrays in JSONB
- `generateTestData`: Custom test data generator
- `verifyData`: Additional verification logic
- `navigateToForm`: Custom navigation (if not standard flow)

## Adding a New Form

1. Check which categories use your form in `GoalPageClient.tsx`
2. Note the required fields from `CATEGORY_CONFIG`
3. Create configuration in `form-configs.ts`
4. Create test file using the factory
5. Run tests: `npm run test:forms -- your-form`

## Handling Multi-Step Forms

With the new UX changes (forward navigation, field dots), forms may have multiple steps:

```typescript
fillFormSteps: async (page: Page, testData: any) => {
  // Step 1: Basic info
  await fillStandardFields(page, testData)
  
  // Check for next button (multi-step)
  const nextButton = page.locator('button:has-text("Next")')
  if (await nextButton.isVisible()) {
    await nextButton.click()
  }
  
  // Step 2: Category-specific fields
  await selectOption(page, '[name="cost"]', testData.cost)
  // ... more fields
}
```

## Testing with Seeded Data

The factory handles cases where solutions already exist:

1. Uses unique timestamps in solution names
2. Cleanup only removes test-specific data
3. Verifies data in context of TEST_GOAL_ID

## Debugging Tips

1. **Run single test**: 
   ```bash
   npm run test:forms -- dosage-form -g "saves all required fields"
   ```

2. **Debug mode**:
   ```bash
   npm run test:forms:debug -- dosage-form
   ```

3. **See browser**:
   ```bash
   npm run test:forms:headed -- dosage-form
   ```

4. **Check test data**:
   Add `console.log(result)` in `verifyData` callback

## Common Issues

### "Element not found"
- Form structure may have changed
- Check if field names match actual form
- Use Playwright Inspector to find correct selectors

### "Validation failed"
- Required fields list may be outdated
- Check `CATEGORY_CONFIG` for current fields
- Verify dropdown options match test data

### "Cleanup failed"
- Foreign key constraints
- Solution may be linked to other goals
- Check cleanup function logic