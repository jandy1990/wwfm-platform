import { test, expect, Page } from '@playwright/test'
import { 
  testSupabase, 
  cleanupTestData, 
  waitForSuccessPage,
  verifyDataPipeline,
  verifyJSONBStructure,
  generateTestSolution
} from '../utils/test-helpers'

export interface FormTestConfig {
  formName: string
  categories: string[]  // Multiple categories can use the same form
  requiredFields: string[]
  arrayFields?: string[]
  hasVariants: boolean
  
  // Step-based form filling
  fillFormSteps: (page: Page, testData: any) => Promise<void>
  
  // Custom data generation
  generateTestData?: (category: string) => any
  
  // Custom verification
  verifyData?: (result: any, testData: any) => void
  
  // Navigation handling
  navigateToForm?: (page: Page, goalId: string, category: string) => Promise<void>
}

export function createFormTest(config: FormTestConfig) {
  test.describe(`${config.formName} - Data Pipeline Tests`, () => {
    // Test each category that uses this form
    for (const category of config.categories) {
      test.describe(category, () => {
        let testData: any
        
        test.beforeEach(async () => {
          // Generate test data
          const baseData = generateTestSolution(category)
          testData = config.generateTestData 
            ? { ...baseData, ...config.generateTestData(category) }
            : baseData
        })
        
        test.afterEach(async () => {
          // Cleanup test data
          await cleanupTestData(testData.title)
        })
        
        test('saves all required fields to correct tables', async ({ page }) => {
          // Navigate to form
          if (config.navigateToForm) {
            await config.navigateToForm(page, testData.goalId, category)
          } else {
            // Default navigation
            await page.goto(`/goal/${testData.goalId}/add-solution`)
            
            // Step 1: Category selection
            await page.selectOption('[name="solution_category"]', category)
            await page.click('button:has-text("Next")')
          }
          
          // Fill form using step-based approach
          await config.fillFormSteps(page, testData)
          
          // Submit form
          await page.click('button[type="submit"]')
          await waitForSuccessPage(page)
          
          // Verify data pipeline
          const result = await verifyDataPipeline(testData.title, category)
          expect(result.success).toBe(true)
          
          if (!result.success) {
            throw new Error(result.error)
          }
          
          // Verify solution
          expect(result.solution).toBeDefined()
          expect(result.solution.solution_category).toBe(category)
          expect(result.solution.title).toBe(testData.title)
          
          // Verify variant
          expect(result.variant).toBeDefined()
          if (config.hasVariants) {
            // Categories with real variants
            expect(result.variant.variant_name).not.toBe('Standard')
          } else {
            // Categories with standard variant only
            expect(result.variant.variant_name).toBe('Standard')
          }
          
          // Verify goal implementation link
          expect(result.goalLink).toBeDefined()
          expect(result.goalLink.goal_id).toBe(testData.goalId)
          expect(result.goalLink.implementation_id).toBe(result.variant.id)
          
          // Verify solution fields structure
          const fieldValidation = verifyJSONBStructure(
            result.solutionFields,
            config.requiredFields
          )
          
          expect(fieldValidation.isValid).toBe(true)
          expect(fieldValidation.missingFields).toEqual([])
          expect(fieldValidation.actualFieldCount).toBe(config.requiredFields.length)
          
          // Verify array fields maintained structure
          if (config.arrayFields) {
            for (const field of config.arrayFields) {
              if (result.solutionFields[field]) {
                expect(Array.isArray(result.solutionFields[field])).toBe(true)
              }
            }
          }
          
          // Run custom verification if provided
          if (config.verifyData) {
            config.verifyData(result, testData)
          }
        })
        
        test('handles form validation', async ({ page }) => {
          // Navigate to form
          if (config.navigateToForm) {
            await config.navigateToForm(page, testData.goalId, category)
          } else {
            await page.goto(`/goal/${testData.goalId}/add-solution`)
            await page.selectOption('[name="solution_category"]', category)
            await page.click('button:has-text("Next")')
          }
          
          // Try to submit without filling required fields
          await page.click('button[type="submit"]')
          
          // Should show validation errors (not navigate away)
          await expect(page).not.toHaveURL(/\/goal\/.*\/(success|solutions)/)
          
          // Look for validation messages
          const validationMessage = page.locator('text=/required|fill|enter/i').first()
          await expect(validationMessage).toBeVisible({ timeout: 2000 })
        })
        
        test('handles backward navigation', async ({ page }) => {
          // Navigate to form
          if (config.navigateToForm) {
            await config.navigateToForm(page, testData.goalId, category)
          } else {
            await page.goto(`/goal/${testData.goalId}/add-solution`)
            await page.selectOption('[name="solution_category"]', category)
            await page.click('button:has-text("Next")')
          }
          
          // Fill first part of form
          await page.fill('[name="solution_title"]', testData.title)
          
          // Navigate back if multi-step
          const backButton = page.locator('button:has-text("Back")')
          if (await backButton.isVisible()) {
            await backButton.click()
            
            // Should preserve category selection
            const selectedCategory = await page.inputValue('[name="solution_category"]')
            expect(selectedCategory).toBe(category)
          }
        })
      })
    }
  })
}

// Helper to create a simple test for forms not yet implemented
export function createPlaceholderTest(formName: string, categories: string[]) {
  test.describe(`${formName} - Placeholder Tests`, () => {
    test.skip('implementation pending', async () => {
      // This test is skipped but documents which forms need implementation
      expect(categories).toBeDefined()
    })
  })
}