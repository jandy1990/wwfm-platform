import { test, expect } from '@playwright/test'
import { 
  generateTestSolution, 
  cleanupTestData,
  verifyDataPipeline,
  testSupabase
} from '../utils/test-helpers'

// Load environment variables for testing
const TEST_GOAL_ID = process.env.TEST_GOAL_ID!

test.describe('DosageForm - Complete E2E Tests', () => {
  test.describe('Multi-step form flow', () => {
    const categories = ['medications', 'supplements_vitamins', 'natural_remedies', 'beauty_skincare']
    
    for (const category of categories) {
      test(`${category}: complete form submission flow`, async ({ page }) => {
        const testData = {
          solutionName: `Test ${category} ${Date.now()}`,
          category,
          // Step 1 data
          doseAmount: category === 'beauty_skincare' ? '' : '20',
          doseUnit: category === 'beauty_skincare' ? '' : 'mg',
          frequency: category === 'beauty_skincare' ? '' : 'twice daily',
          skincareFrequency: category === 'beauty_skincare' ? 'twice_daily' : '',
          // Step 2 data
          effectiveness: 4,
          timeToResults: '1-2 weeks',
          // Step 3 data
          sideEffects: ['None'],
          // Step 4 data
          costRange: '$25-50/month',
          brand: 'Test Brand',
          form: category === 'medications' ? 'tablet' : 
                category === 'supplements_vitamins' ? 'capsule' : '',
          otherInfo: 'Automated test notes'
        }
        
        // Navigate to add solution page
        await page.goto(`/goal/${TEST_GOAL_ID}/add-solution`)
        
        // Step 0: Solution name and category selection
        await page.fill('input[placeholder*="solution"]', testData.solutionName)
        
        // Wait for auto-categorization or select manually
        await page.waitForTimeout(1000) // Give auto-categorization time to work
        
        // If category picker shows, select the category
        const categoryPicker = page.locator('text="Select a category"')
        if (await categoryPicker.isVisible({ timeout: 2000 })) {
          await page.click(`button:has-text("${category}")`)
        }
        
        // Confirm category if confirmation dialog appears
        const confirmButton = page.locator('button:has-text("Yes, this is correct")')
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click()
        }
        
        // Now we should be in the DosageForm
        // Step 1: Dosage information
        if (category === 'beauty_skincare') {
          // Skincare uses different frequency selector
          const skincareSelect = page.locator('select').first()
          await skincareSelect.selectOption(testData.skincareFrequency)
        } else {
          // Fill dosage amount
          await page.fill('input[type="text"]', testData.doseAmount)
          
          // Select unit
          const unitSelect = page.locator('select').first()
          await unitSelect.selectOption(testData.doseUnit)
          
          // Select frequency
          const frequencySelect = page.locator('select').nth(1)
          await frequencySelect.selectOption(testData.frequency)
        }
        
        // Click Continue to Step 2
        await page.click('button:has-text("Continue")')
        
        // Step 2: Effectiveness
        // Click star rating
        await page.click(`button[aria-label="${testData.effectiveness} stars"]`)
        
        // Select time to results
        const timeSelect = page.locator('select').first()
        await timeSelect.selectOption(testData.timeToResults)
        
        // Click Continue to Step 3
        await page.click('button:has-text("Continue")')
        
        // Step 3: Side effects (None is selected by default)
        // For this test, we'll keep the default
        
        // Click Continue to Step 4
        await page.click('button:has-text("Continue")')
        
        // Step 4: Additional info
        // Select cost range
        const costSelect = page.locator('select').first()
        await costSelect.selectOption(testData.costRange)
        
        // Fill brand
        await page.fill('input[placeholder="Brand/Manufacturer"]', testData.brand)
        
        // Select form if applicable
        if (testData.form) {
          const formSelect = page.locator('select').nth(1)
          await formSelect.selectOption(testData.form)
        }
        
        // Fill other info
        await page.fill('textarea', testData.otherInfo)
        
        // Submit the form
        await page.click('button:has-text("Submit")')
        
        // Wait for success navigation
        await page.waitForURL(/\/goal\/.*\/(success|solutions)/, { timeout: 10000 })
        
        // Verify data in database
        const result = await verifyDataPipeline(testData.solutionName, category)
        expect(result.success).toBe(true)
        
        if (result.success) {
          // Verify solution
          expect(result.solution.solution_category).toBe(category)
          expect(result.solution.title).toBe(testData.solutionName)
          
          // Verify variant
          if (category !== 'beauty_skincare') {
            expect(result.variant.amount).toBe(20)
            expect(result.variant.unit).toBe('mg')
          }
          
          // Verify solution fields
          expect(result.solutionFields.effectiveness).toBe(testData.effectiveness)
          expect(result.solutionFields.time_to_results).toBe(testData.timeToResults)
          expect(result.solutionFields.cost).toBe(testData.costRange)
          expect(result.solutionFields.side_effects).toEqual(['None'])
        }
        
        // Cleanup
        await cleanupTestData(testData.solutionName)
      })
    }
  })
  
  test.describe('Form validation', () => {
    test('validates required fields on each step', async ({ page }) => {
      await page.goto(`/goal/${TEST_GOAL_ID}/add-solution`)
      
      // Enter solution name and select category
      await page.fill('input[placeholder*="solution"]', 'Test Validation Med')
      await page.waitForTimeout(1000)
      
      // Select medications category
      const categoryButton = page.locator('button:has-text("medications")')
      if (await categoryButton.isVisible({ timeout: 2000 })) {
        await categoryButton.click()
      }
      
      // Confirm category
      const confirmButton = page.locator('button:has-text("Yes, this is correct")')
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click()
      }
      
      // Step 1: Try to continue without filling fields
      await page.click('button:has-text("Continue")')
      
      // Should not advance to next step
      await expect(page.locator('text="How effective was"')).not.toBeVisible()
      
      // Fill required fields
      await page.fill('input[type="text"]', '10')
      await page.locator('select').first().selectOption('mg')
      await page.locator('select').nth(1).selectOption('once daily')
      
      // Now should be able to continue
      await page.click('button:has-text("Continue")')
      await expect(page.locator('text="How effective was"')).toBeVisible()
      
      // Cleanup
      await cleanupTestData('Test Validation Med')
    })
  })
  
  test.describe('Navigation', () => {
    test('preserves data when navigating back and forward', async ({ page }) => {
      await page.goto(`/goal/${TEST_GOAL_ID}/add-solution`)
      
      const solutionName = `Test Navigation ${Date.now()}`
      await page.fill('input[placeholder*="solution"]', solutionName)
      await page.waitForTimeout(1000)
      
      // Select category
      const categoryButton = page.locator('button:has-text("supplements_vitamins")')
      if (await categoryButton.isVisible({ timeout: 2000 })) {
        await categoryButton.click()
      }
      
      const confirmButton = page.locator('button:has-text("Yes, this is correct")')
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click()
      }
      
      // Fill Step 1
      await page.fill('input[type="text"]', '1000')
      await page.locator('select').first().selectOption('IU')
      await page.locator('select').nth(1).selectOption('once daily')
      
      // Go to Step 2
      await page.click('button:has-text("Continue")')
      
      // Fill Step 2
      await page.click('button[aria-label="5 stars"]')
      await page.locator('select').first().selectOption('Within days')
      
      // Go back to Step 1
      await page.click('button:has-text("Back")')
      
      // Verify data is preserved
      await expect(page.locator('input[type="text"]')).toHaveValue('1000')
      await expect(page.locator('select').first()).toHaveValue('IU')
      await expect(page.locator('select').nth(1)).toHaveValue('once daily')
      
      // Go forward again
      await page.click('button:has-text("Continue")')
      
      // Verify Step 2 data is preserved
      await expect(page.locator('button[aria-label="5 stars"]')).toHaveAttribute('aria-pressed', 'true')
      await expect(page.locator('select').first()).toHaveValue('Within days')
      
      // Cleanup
      await cleanupTestData(solutionName)
    })
  })
  
  test.describe('Special cases', () => {
    test('handles custom side effects', async ({ page }) => {
      await page.goto(`/goal/${TEST_GOAL_ID}/add-solution`)
      
      const solutionName = `Test Custom Side Effects ${Date.now()}`
      await page.fill('input[placeholder*="solution"]', solutionName)
      await page.waitForTimeout(1000)
      
      // Quick navigation to side effects step
      const categoryButton = page.locator('button:has-text("medications")')
      if (await categoryButton.isVisible({ timeout: 2000 })) {
        await categoryButton.click()
      }
      
      const confirmButton = page.locator('button:has-text("Yes, this is correct")')
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click()
      }
      
      // Fill minimum required fields to get to side effects
      await page.fill('input[type="text"]', '50')
      await page.locator('select').first().selectOption('mg')
      await page.locator('select').nth(1).selectOption('once daily')
      await page.click('button:has-text("Continue")')
      
      // Step 2
      await page.click('button[aria-label="3 stars"]')
      await page.locator('select').first().selectOption('3-4 weeks')
      await page.click('button:has-text("Continue")')
      
      // Step 3: Side effects
      // Uncheck "None" and select some side effects
      await page.click('label:has-text("None")')
      await page.click('label:has-text("Nausea")')
      await page.click('label:has-text("Headache")')
      
      // Add custom side effect
      await page.click('button:has-text("Add custom")')
      await page.fill('input[placeholder="Describe the side effect"]', 'Test custom effect')
      await page.press('input[placeholder="Describe the side effect"]', 'Enter')
      
      // Continue to submission
      await page.click('button:has-text("Continue")')
      
      // Fill cost and submit
      await page.locator('select').first().selectOption('$10-25/month')
      await page.click('button:has-text("Submit")')
      
      // Wait for success
      await page.waitForURL(/\/goal\/.*\/(success|solutions)/, { timeout: 10000 })
      
      // Verify side effects were saved
      const result = await verifyDataPipeline(solutionName, 'medications')
      if (result.success) {
        expect(result.solutionFields.side_effects).toContain('Nausea')
        expect(result.solutionFields.side_effects).toContain('Headache')
        expect(result.solutionFields.side_effects).toContain('Test custom effect')
        expect(result.solutionFields.side_effects).not.toContain('None')
      }
      
      // Cleanup
      await cleanupTestData(solutionName)
    })
  })
})