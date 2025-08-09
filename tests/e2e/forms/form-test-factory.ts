import { test, expect, Page } from '@playwright/test'
import { 
  testSupabase, 
  cleanupTestData, 
  waitForSuccessPage,
  verifyDataPipeline,
  verifyJSONBStructure,
  generateTestSolution
} from '../utils/test-helpers'
import { clearTestRatingsForSolution, verifyDataInSupabase } from '../utils/test-cleanup'

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
            
          // Clear any existing ratings for this test solution
          // This allows the test to run multiple times
          await clearTestRatingsForSolution(testData.title)
          console.log(`🧹 Cleared previous ratings for ${testData.title}`)
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
            // Default navigation for auto-categorization flow
            await page.goto(`/goal/${testData.goalId}/add-solution`)
            
            // Wait for page to fully load
            await page.waitForSelector('#solution-name', { timeout: 10000 })
            
            // Step 1: Enter solution name in the search field
            await page.fill('#solution-name', testData.title)
            
            // Wait for auto-categorization to work
            await page.waitForTimeout(2000)
            
            // Check if category badge appears (indicates auto-detection worked)
            const categoryBadge = page.locator('.bg-blue-100, .bg-blue-900')
            const hasAutoDetected = await categoryBadge.isVisible({ timeout: 1000 })
            
            if (!hasAutoDetected) {
              // Try clicking on a dropdown suggestion if available
              const suggestion = page.locator(`button:has-text("${testData.title}")`).first()
              if (await suggestion.isVisible({ timeout: 1000 })) {
                await suggestion.click()
                await page.waitForTimeout(500)
              }
            }
            
            // Click Continue button - wait for it to be enabled
            const continueButton = page.locator('button:has-text("Continue")')
            await continueButton.waitFor({ state: 'visible' })
            await continueButton.click()
            
            // Wait for navigation
            await page.waitForTimeout(2000)
            
            // Check if category picker appears
            const categoryPicker = page.locator('text="Choose a category"')
            if (await categoryPicker.isVisible({ timeout: 3000 })) {
              // Need to select category manually
              // Map categories to their sections
              const categoryToSection: Record<string, string> = {
                'medications': 'Things you take',
                'supplements_vitamins': 'Things you take',
                'natural_remedies': 'Things you take',
                'beauty_skincare': 'Things you take',
                'apps_software': 'Things you use',
                'products_devices': 'Things you use',
                'books_courses': 'Things you use',
                'exercise_movement': 'Things you do',
                'meditation_mindfulness': 'Things you do',
                'habits_routines': 'Things you do',
                'hobbies_activities': 'Things you do',
                'support_groups': 'Things you do',
                'groups_communities': 'Things you do',
                'therapists_counselors': 'People you see',
                'doctors_specialists': 'People you see',
                'coaches_mentors': 'People you see',
                'alternative_practitioners': 'People you see',
                'professional_services': 'People you see',
                'medical_procedures': 'People you see',
                'crisis_resources': 'People you see',
                'diet_nutrition': 'Changes you make',
                'sleep': 'Changes you make',
                'financial_products': 'Financial'
              }
              
              const categoryDisplayNames: Record<string, string> = {
                'medications': 'Medications',
                'supplements_vitamins': 'Supplements & Vitamins',
                'natural_remedies': 'Natural Remedies',
                'beauty_skincare': 'Beauty & Skincare',
                'apps_software': 'Apps & Software',
                'exercise_movement': 'Exercise & Movement',
                'meditation_mindfulness': 'Meditation & Mindfulness',
                'habits_routines': 'Habits & Routines',
                'therapists_counselors': 'Therapists & Counselors',
                'doctors_specialists': 'Doctors & Specialists',
                'coaches_mentors': 'Coaches & Mentors',
                'alternative_practitioners': 'Alternative Practitioners',
                'professional_services': 'Professional Services',
                'medical_procedures': 'Medical Procedures',
                'crisis_resources': 'Crisis Resources',
                'products_devices': 'Products & Devices',
                'books_courses': 'Books & Courses',
                'support_groups': 'Support Groups',
                'groups_communities': 'Groups & Communities',
                'diet_nutrition': 'Diet & Nutrition',
                'sleep': 'Sleep',
                'hobbies_activities': 'Hobbies & Activities',
                'financial_products': 'Financial Products'
              }
              
              // Click the section first
              const section = categoryToSection[category]
              if (section) {
                const sectionButton = page.locator(`button:has-text("${section}")`)
                if (await sectionButton.isVisible()) {
                  await sectionButton.click()
                  await page.waitForTimeout(500)
                }
              }
              
              // Click the specific category
              const displayName = categoryDisplayNames[category]
              if (displayName) {
                const categoryButton = page.locator(`button:has-text("${displayName}")`)
                if (await categoryButton.isVisible()) {
                  await categoryButton.click()
                  await page.waitForTimeout(2000)
                }
              }
            }
            
            // Wait for form to load - use multiple possible selectors
            await page.waitForSelector('select:visible, input[type="text"]:visible, button:has-text("Continue")', { timeout: 10000 })
          }
          
          // Fill form using step-based approach
          await config.fillFormSteps(page, testData)
          
          // Submit form - look for Submit button (may not have type="submit")
          // Wait a bit to ensure form is ready
          await page.waitForTimeout(2000)
          const submitBtn = page.locator('button:has-text("Submit"):visible').first()
          if (await submitBtn.count() > 0) {
            console.log('Found submit button, clicking...')
            await submitBtn.click()
          } else {
            console.log('Submit button not found, form may not have navigated to final step')
            throw new Error('Submit button not found')
          }
          await waitForSuccessPage(page)
          
          // Wait a moment for data to be saved
          await page.waitForTimeout(2000)
          
          // Verify data was actually saved to Supabase
          console.log(`🔍 Verifying data in Supabase for ${testData.title}...`)
          const supabaseData = await verifyDataInSupabase(testData.title, testData.goalId)
          
          // Check that data was saved
          expect(supabaseData.success).toBe(true)
          expect(supabaseData.summary.hasLinks).toBe(true)
          expect(supabaseData.summary.hasRatings).toBe(true)
          
          console.log(`✅ Verified in Supabase:`, {
            links: supabaseData.summary.linkCount,
            ratings: supabaseData.summary.ratingCount
          })
          
          // Also run original verification
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
          if (config.hasVariants && category !== 'beauty_skincare') {
            // Dosage categories (except beauty_skincare) have real variants
            expect(result.variant.variant_name).not.toBe('Standard')
          } else {
            // All other categories use Standard variant
            expect(result.variant.variant_name).toBe('Standard')
          }
          
          // Verify goal implementation link
          expect(result.goalLink).toBeDefined()
          expect(result.goalLink.goal_id).toBe(testData.goalId)
          expect(result.goalLink.implementation_id).toBe(result.variant.id)
          
          // With server action, solution_fields are on goal_implementation_links
          // and may be minimal since defaults are handled server-side
          const fieldValidation = verifyJSONBStructure(
            result.solutionFields,
            config.requiredFields
          )
          
          // Just verify it's valid - field count may vary with server action
          expect(fieldValidation.isValid).toBe(true)
          
          // If user rating exists, verify it matches
          if (result.userRating) {
            expect(result.userRating.goal_id).toBe(testData.goalId)
            expect(result.userRating.solution_variant_id).toBe(result.variant.id)
          }
          
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
            // Default navigation for auto-categorization flow
            await page.goto(`/goal/${testData.goalId}/add-solution`)
            
            // Wait for page to load
            await page.waitForSelector('#solution-name', { timeout: 10000 })
            
            // Enter solution name
            await page.fill('#solution-name', testData.title)
            await page.waitForTimeout(1500)
            
            // Click Continue button
            const continueButton = page.locator('button:has-text("Continue")')
            await continueButton.waitFor({ state: 'visible' })
            await continueButton.click()
            
            // Wait for form to appear - use multiple possible selectors
            await page.waitForSelector('form, h2, .space-y-6', { timeout: 5000 })
          }
          
          // Try to submit without filling required fields
          // For multi-step forms, try clicking Continue button which should be disabled
          const continueBtn = page.locator('button:has-text("Continue"):visible').first()
          if (await continueBtn.count() > 0) {
            // Check if it's disabled (validation should prevent proceeding)
            const isDisabled = await continueBtn.isDisabled()
            expect(isDisabled).toBe(true)
          } else {
            // Single step form - try submit button
            const submitBtn = page.locator('button:has-text("Submit"):visible').first()
            if (await submitBtn.count() > 0) {
              await submitBtn.click()
              // Should show validation errors (not navigate away)
              await expect(page).not.toHaveURL(/\/goal\/.*\/(success|solutions)/)
            }
          }
          
          // Look for validation messages
          const validationMessage = page.locator('text=/required|fill|enter/i').first()
          await expect(validationMessage).toBeVisible({ timeout: 2000 })
        })
        
        test('handles backward navigation', async ({ page }) => {
          // Navigate to form
          if (config.navigateToForm) {
            await config.navigateToForm(page, testData.goalId, category)
          } else {
            // Default navigation for auto-categorization flow
            await page.goto(`/goal/${testData.goalId}/add-solution`)
            
            // Wait for page to load
            await page.waitForSelector('#solution-name', { timeout: 10000 })
            
            // Enter solution name
            await page.fill('#solution-name', testData.title)
            await page.waitForTimeout(1500)
            
            // Click Continue button
            const continueButton = page.locator('button:has-text("Continue")')
            await continueButton.waitFor({ state: 'visible' })
            await continueButton.click()
            
            // Wait for form to appear - use multiple possible selectors
            await page.waitForSelector('form, h2, .space-y-6', { timeout: 5000 })
          }
          
          // Start filling the form (different forms have different structures)
          // Most forms are multi-step, so we'll just check if we can navigate
          
          // Navigate back if multi-step
          const backButton = page.locator('button:has-text("Back")')
          if (await backButton.isVisible()) {
            await backButton.click()
            
            // For our multi-step forms, we don't have a solution_category field
            // Instead check that we're still on the form (not back at search)
            const isStillOnForm = await page.locator('button:has-text("Continue"), button:has-text("Submit")').isVisible()
            expect(isStillOnForm).toBe(true)
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