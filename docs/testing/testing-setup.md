# WWFM Form Testing Implementation Plan

> **Document Type**: Implementation Guide for Automated Form Testing  
> **Created**: July 2025  
> **Purpose**: Enable automated testing of form data pipeline from UI to database  
> **Status**: Ready for Implementation

## 📋 Executive Summary

This plan outlines the implementation of automated E2E tests for WWFM's form system, ensuring that user-submitted solution data flows correctly through all system layers. Starting with the already-implemented DosageForm, we'll create a testing framework that scales to all 9 form types.

## 🎯 Context & Current State

### System Overview
- **Platform**: Next.js 15 + Supabase + TypeScript
- **Forms Location**: `/components/organisms/solutions/forms/`
- **Currently Implemented**: DosageForm (1 of 9)
- **Data Flow**: Form → API → Supabase → `solutions` + `solution_variants` + `goal_implementation_links`

### Related Documentation
- **Database Schema**: See `/docs/database-schema.md`
- **Form Implementation**: See `/docs/WWFM Solution Generation Guide v5 - Complete Instructions.md`
- **Architecture**: See `/ARCHITECTURE.md`
- **Current Issues**: Solution count discrepancy (474 vs 123)

### Form Categories & Required Fields
Reference: `/components/goal/GoalPageClient.tsx` - CATEGORY_CONFIG

**Implemented:**
- ✅ DosageForm (4 categories): medications, supplements_vitamins, natural_remedies, beauty_skincare

**To Implement:**
- ⬜ SessionForm (7 categories)
- ⬜ PracticeForm (3 categories)  
- ⬜ AppForm (1 category)
- ⬜ PurchaseForm (2 categories)
- ⬜ CommunityForm (2 categories)
- ⬜ LifestyleForm (2 categories)
- ⬜ HobbyForm (1 category)
- ⬜ FinancialForm (1 category)

## 🏗️ Implementation Strategy

### Phase 1: Test Infrastructure Setup (Day 1)

#### 1.1 Install Playwright
```bash
npm install -D @playwright/test @playwright/test-utils
npx playwright install
```

#### 1.2 Create Test Configuration
**File**: `/playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
})
```

#### 1.3 Create Test Utilities
**File**: `/tests/e2e/utils/test-helpers.ts`
```typescript
import { createClient } from '@supabase/supabase-js'
import { Page } from '@playwright/test'

// Test database client with service key
export const testSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Bypasses RLS for testing
)

// Test data factory
export function generateTestSolution(category: string) {
  const timestamp = Date.now()
  return {
    title: `Test ${category} ${timestamp}`,
    description: `Automated test solution for ${category}`,
    category,
    goalId: process.env.TEST_GOAL_ID || '56e2801e-0d78-4abd-a795-869e5b780ae7'
  }
}

// Database cleanup
export async function cleanupTestData(titlePattern: string) {
  const { error } = await testSupabase
    .from('solutions')
    .delete()
    .like('title', `${titlePattern}%`)
    
  if (error) console.error('Cleanup failed:', error)
}

// Wait for navigation helper
export async function waitForSuccessPage(page: Page) {
  await page.waitForURL(/\/goal\/.*\/(success|solutions)/, { timeout: 10000 })
}
```

### Phase 2: DosageForm Tests (Day 1-2)

#### 2.1 Core DosageForm Test
**File**: `/tests/e2e/forms/dosage-form.spec.ts`
```typescript
import { test, expect } from '@playwright/test'
import { testSupabase, generateTestSolution, cleanupTestData, waitForSuccessPage } from '../utils/test-helpers'

test.describe('DosageForm - Complete Data Pipeline', () => {
  const testData = generateTestSolution('medications')
  
  test.afterEach(async () => {
    await cleanupTestData(testData.title)
  })

  test('saves all 5 required fields to correct tables', async ({ page }) => {
    // Navigate to add solution page
    await page.goto(`/goal/${testData.goalId}/add-solution`)
    
    // Step 1: Select category
    await page.selectOption('[name="solution_category"]', 'medications')
    await page.click('button:has-text("Next")')
    
    // Step 2: Fill DosageForm
    await page.fill('[name="solution_title"]', testData.title)
    await page.fill('[name="description"]', testData.description)
    
    // Required fields (verify against form dropdown options)
    await page.selectOption('[name="cost"]', '$50-100/month')
    await page.selectOption('[name="time_to_results"]', '3-4 weeks')
    await page.selectOption('[name="frequency"]', 'Twice daily')
    await page.fill('[name="length_of_use"]', '6 months')
    
    // Array field - side effects
    await page.check('label:has-text("Nausea")')
    await page.check('label:has-text("Headache")')
    
    // Variant information
    await page.fill('[name="dosage_amount"]', '20')
    await page.selectOption('[name="dosage_unit"]', 'mg')
    await page.selectOption('[name="dosage_form"]', 'tablet')
    
    // Submit
    await page.click('button[type="submit"]')
    await waitForSuccessPage(page)
    
    // Verify in database - solutions table
    const { data: solution } = await testSupabase
      .from('solutions')
      .select('*')
      .eq('title', testData.title)
      .single()
      
    expect(solution).toBeDefined()
    expect(solution.solution_category).toBe('medications')
    
    // Verify variant created
    const { data: variants } = await testSupabase
      .from('solution_variants')
      .select('*')
      .eq('solution_id', solution.id)
      
    expect(variants).toHaveLength(1)
    expect(variants[0].amount).toBe(20)
    expect(variants[0].unit).toBe('mg')
    expect(variants[0].form).toBe('tablet')
    
    // Verify goal_implementation_links has solution_fields
    const { data: goalLink } = await testSupabase
      .from('goal_implementation_links')
      .select('*')
      .eq('goal_id', testData.goalId)
      .eq('implementation_id', variants[0].id)
      .single()
      
    expect(goalLink.solution_fields).toMatchObject({
      cost: '$50-100/month',
      time_to_results: '3-4 weeks',
      frequency: 'Twice daily',
      length_of_use: '6 months',
      side_effects: ['Nausea', 'Headache']
    })
    
    // Verify exactly 5 fields saved
    expect(Object.keys(goalLink.solution_fields)).toHaveLength(5)
  })

  test('handles all 4 dosage categories', async ({ page }) => {
    const categories = [
      'medications',
      'supplements_vitamins', 
      'natural_remedies',
      'beauty_skincare'
    ]
    
    for (const category of categories) {
      const categoryTestData = generateTestSolution(category)
      
      await page.goto(`/goal/${testData.goalId}/add-solution`)
      await page.selectOption('[name="solution_category"]', category)
      await page.click('button:has-text("Next")')
      
      // Verify correct form loads
      await expect(page.locator('h2')).toContainText(category.replace('_', ' '))
      
      // Verify variant fields are present
      await expect(page.locator('[name="dosage_amount"]')).toBeVisible()
      
      await cleanupTestData(categoryTestData.title)
    }
  })
})
```

#### 2.2 Data Integrity Tests
**File**: `/tests/e2e/forms/dosage-form-integrity.spec.ts`
```typescript
test.describe('DosageForm - Data Integrity', () => {
  test('preserves array field structure', async ({ page }) => {
    // Test that side_effects remains an array
    const result = await submitDosageForm(page, {
      side_effects: ['Nausea', 'Dizziness', 'Dry mouth']
    })
    
    expect(Array.isArray(result.solution_fields.side_effects)).toBe(true)
    expect(result.solution_fields.side_effects).toHaveLength(3)
  })
  
  test('rejects invalid data', async ({ page }) => {
    await page.goto(`/goal/${testData.goalId}/add-solution`)
    await page.selectOption('[name="solution_category"]', 'medications')
    await page.click('button:has-text("Next")')
    
    // Try to submit without required fields
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.locator('text=Cost is required')).toBeVisible()
  })
})
```

### Phase 3: Test Template System (Day 2)

#### 3.1 Create Reusable Test Factory
**File**: `/tests/e2e/forms/form-test-factory.ts`
```typescript
import { test, expect, Page } from '@playwright/test'
import { testSupabase } from '../utils/test-helpers'

export interface FormTestConfig {
  formName: string
  category: string
  requiredFields: string[]
  arrayFields?: string[]
  hasVariants: boolean
  fillForm: (page: Page) => Promise<void>
  verifyData: (data: any) => void
}

export function createFormTest(config: FormTestConfig) {
  test.describe(`${config.formName} - Data Pipeline`, () => {
    test('saves all required fields correctly', async ({ page }) => {
      const testTitle = `Test ${config.category} ${Date.now()}`
      
      // Navigate and select category
      await page.goto(`/goal/${process.env.TEST_GOAL_ID}/add-solution`)
      await page.selectOption('[name="solution_category"]', config.category)
      await page.click('button:has-text("Next")')
      
      // Fill form using provided function
      await page.fill('[name="solution_title"]', testTitle)
      await config.fillForm(page)
      
      // Submit and wait
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/goal\/.*\/(success|solutions)/)
      
      // Verify in database
      const { data: goalLink } = await testSupabase
        .from('goal_implementation_links')
        .select(`
          *,
          solution_variants!inner(
            *,
            solutions!inner(*)
          )
        `)
        .eq('solution_variants.solutions.title', testTitle)
        .single()
        
      // Verify all required fields present
      config.requiredFields.forEach(field => {
        expect(goalLink.solution_fields).toHaveProperty(field)
      })
      
      // Run custom verification
      config.verifyData(goalLink)
      
      // Cleanup
      await testSupabase
        .from('solutions')
        .delete()
        .eq('id', goalLink.solution_variants.solutions.id)
    })
  })
}
```

#### 3.2 Apply Template to New Forms
**File**: `/tests/e2e/forms/app-form.spec.ts`
```typescript
import { createFormTest } from './form-test-factory'

createFormTest({
  formName: 'AppForm',
  category: 'apps_software',
  requiredFields: ['cost', 'time_to_results', 'usage_frequency', 'subscription_type', 'challenges'],
  arrayFields: ['challenges'],
  hasVariants: false,
  
  fillForm: async (page) => {
    await page.selectOption('[name="cost_range"]', '$10-20/month')
    await page.selectOption('[name="time_to_results"]', 'Immediately')
    await page.selectOption('[name="usage_frequency"]', 'Daily')
    await page.selectOption('[name="subscription_type"]', 'Premium/Pro')
    await page.check('label:has-text("Hard to maintain habit")')
    await page.check('label:has-text("Too many notifications")')
  },
  
  verifyData: (data) => {
    expect(data.solution_fields.challenges).toContain('Hard to maintain habit')
    expect(data.solution_fields.challenges).toContain('Too many notifications')
    expect(data.solution_variants.variant_name).toBe('Standard')
  }
})
```

### Phase 4: Continuous Integration (Day 3)

#### 4.1 GitHub Actions Configuration
**File**: `/.github/workflows/form-tests.yml`
```yaml
name: Form E2E Tests

on:
  pull_request:
    paths:
      - 'components/organisms/solutions/forms/**'
      - 'app/goal/**/add-solution/**'
      - 'tests/e2e/forms/**'
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Playwright
      run: npx playwright install --with-deps
      
    - name: Run form tests
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
        TEST_GOAL_ID: ${{ secrets.TEST_GOAL_ID }}
      run: npm run test:forms
      
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

#### 4.2 Package.json Scripts
```json
{
  "scripts": {
    "test:forms": "playwright test tests/e2e/forms",
    "test:forms:ui": "playwright test tests/e2e/forms --ui",
    "test:forms:debug": "playwright test tests/e2e/forms --debug",
    "test:forms:headed": "playwright test tests/e2e/forms --headed"
  }
}
```

## 📊 Implementation Timeline

### Week 1
- **Day 1**: Setup infrastructure + DosageForm basic test
- **Day 2**: Complete DosageForm tests + create template
- **Day 3**: CI/CD setup + documentation

### Week 2-3 (As forms are built)
- **30 min per form**: Add tests using template
- **Running total**: Test suite grows with each form

## 🚨 Critical Success Factors

### 1. Test Data Isolation
- Use timestamp-based naming
- Clean up after each test
- Use dedicated test goal ID

### 2. Form Dropdown Synchronization
- Reference `/components/organisms/solutions/forms/` for exact dropdown values
- Update tests when dropdown options change
- Consider storing options in shared constants

### 3. Database Schema Awareness
- Understand `solution_fields` JSONB structure
- Know which categories create variants
- Verify data lands in correct tables

## 📋 Checklist for Each New Form

When implementing a new form, complete these steps:

- [ ] Create form component in `/components/organisms/solutions/forms/`
- [ ] Add form to switch statement in add-solution page
- [ ] Create test file using `form-test-factory`
- [ ] Verify all required fields from `CATEGORY_CONFIG`
- [ ] Test array field handling (if applicable)
- [ ] Test variant creation (if applicable)
- [ ] Run test locally: `npm run test:forms -- [form-name]`
- [ ] Verify test passes in CI

## 🔍 Debugging Common Issues

### "Solution not found in database"
- Check if form submission actually succeeded
- Verify test is looking in correct table
- Check RLS policies aren't blocking

### "Field count mismatch"
- Compare against `CATEGORY_CONFIG` in `GoalPageClient.tsx`
- Check if field names match exactly
- Verify array fields are properly formatted

### "Timeout waiting for navigation"
- Increase timeout in `waitForSuccessPage`
- Check for form validation errors
- Verify API endpoints are working

## 📚 Additional Resources

- **Playwright Docs**: https://playwright.dev/docs/intro
- **Supabase Testing**: https://supabase.com/docs/guides/testing
- **Project Docs**: See `/docs/` directory
- **Database Schema**: See `/supabase/migrations/`

## 🎯 Success Metrics

- **All forms have tests**: 9/9 forms covered
- **Tests run in < 5 minutes**: Keep suite fast
- **Zero flaky tests**: Reliable results
- **Clear failure messages**: Easy debugging

---

**Next Steps**: Start with Phase 1 infrastructure setup, then implement DosageForm tests to validate the approach before scaling to other forms.