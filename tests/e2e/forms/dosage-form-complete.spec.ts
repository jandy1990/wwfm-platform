// tests/e2e/forms/dosage-form-complete.spec.ts
import { test, expect } from '@playwright/test';
import { fillDosageForm } from './form-specific-fillers';
import { 
  verifyDataPipeline, 
  fillSuccessScreenFields,
  verifyFieldsInUI
} from '../utils/test-helpers';
import { clearTestRatingsForSolution } from '../utils/test-cleanup';
import { TEST_SOLUTIONS } from '../fixtures/test-solutions';

test.describe('DosageForm End-to-End Tests', () => {
  
  test.beforeEach(async () => {
    // Clear any existing test data before each test
    console.log('Clearing previous test data...')
    await clearTestRatingsForSolution(TEST_SOLUTIONS.supplements_vitamins)
  })

  test('should complete DosageForm for supplements_vitamins (Vitamin D Test)', async ({ page }) => {
    console.log('=== Starting DosageForm test for Vitamin D (Test) ===');
    
    // Navigate to add solution page directly
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
    
    await page.waitForSelector('text="What helped you?"', { timeout: 10000 })
    console.log('Add solution page loaded')
    
    // Search for "Vitamin D (Test)"
    const searchTerm = 'Vitamin D (Test)'
    await page.type('#solution-name', searchTerm)
    console.log(`Typed "${searchTerm}" - looking for supplement solutions`)
    
    // Wait for dropdown to appear AND for loading to complete
    try {
      await page.waitForSelector('[data-testid="solution-dropdown"]', { timeout: 5000 })
      console.log('Dropdown appeared')
      
      // CRITICAL: Wait for search to complete (loading spinner to disappear)
      // The component shows "Searching..." while loading
      await page.waitForSelector('[data-testid="solution-dropdown"]:not(:has-text("Searching..."))', { timeout: 5000 })
      console.log('Search completed, results ready')
      
      // Additional small wait to ensure DOM is stable
      await page.waitForTimeout(200)
    } catch (e) {
      console.log('Dropdown did not appear or search did not complete within 5 seconds')
    }
    
    // Check if dropdown is visible and select solution
    const dropdownVisible = await page.locator('[data-testid="solution-dropdown"]').isVisible().catch(() => false)
    
    if (dropdownVisible) {
      console.log('Dropdown appeared with suggestions')
      
      const dropdownButtons = page.locator('[data-testid="solution-dropdown"] button')
      const buttonCount = await dropdownButtons.count()
      console.log(`Found ${buttonCount} suggestions in dropdown`)
      
      let found = false
      for (let i = 0; i < buttonCount; i++) {
        const button = dropdownButtons.nth(i)
        const text = await button.textContent()
        console.log(`Option ${i}: "${text}"`)
        
        if (text?.includes('Vitamin D (Test)')) {
          console.log(`Clicking on: "${text}"`)
          await button.click()
          await page.waitForTimeout(500)
          
          const inputValue = await page.inputValue('#solution-name')
          console.log(`Input value after selection: "${inputValue}"`)
          
          found = true
          break
        }
      }
      
      if (!found) {
        console.log('Warning: "Vitamin D (Test)" not found in dropdown')
      }
    } else {
      console.log('No dropdown appeared - test solution might not be in database')
    }
    
    // Check if category was auto-detected
    const categoryAutoDetected = await page.locator('text="How well it worked"').isVisible().catch(() => false)
    console.log('Category auto-detected:', categoryAutoDetected)
    
    if (!categoryAutoDetected) {
      // IMPORTANT: Close dropdown by clicking outside it to avoid interference
      await page.click('body', { position: { x: 10, y: 10 } })
      await page.waitForTimeout(200) // Give dropdown time to close
      
      // Verify dropdown is closed before continuing
      const dropdownStillVisible = await page.locator('[data-testid="solution-dropdown"]').isVisible().catch(() => false)
      if (dropdownStillVisible) {
        console.log('Warning: Dropdown still visible, attempting to close with Escape')
        await page.keyboard.press('Escape')
        await page.waitForTimeout(200)
      }
      
      // Click Continue if still on search page
      const continueBtn = page.locator('button:has-text("Continue")')
      const isContinueVisible = await continueBtn.isVisible()
      if (isContinueVisible) {
        console.log('Clicked Continue button')
        await continueBtn.click()
        await page.waitForTimeout(1000)
      }
    }
    
    // Wait for DosageForm to load
    try {
      await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
      console.log('DosageForm loaded successfully')
    } catch (error) {
      await page.screenshot({ path: 'dosage-test-debug-screenshot.png' })
      console.log('Form did not load - screenshot saved')
      throw error
    }
    
    // Fill the DosageForm
    await fillDosageForm(page, 'supplements_vitamins');
    
    // Verify successful submission
    console.log('Verifying successful submission...')
    await page.waitForTimeout(3000)
    
    const pageContent = await page.textContent('body')
    const wasProcessed = pageContent?.includes('Thank you') || 
                        pageContent?.includes('already') || 
                        pageContent?.includes('recorded') ||
                        pageContent?.includes('success') ||
                        pageContent?.includes('submitted') ||
                        pageContent?.includes('added')
    
    expect(wasProcessed).toBeTruthy()
    
    // Field-level verification for DosageForm
    console.log('\n=== Verifying DosageForm Data Pipeline ===')
    
    // Expected fields based on what fillDosageForm sets
    const expectedFields = {
      effectiveness: 4,
      time_to_results: '1-2 weeks',
      cost: '$10-30',
      dosage_amount: '5000',  // Changed from dose_amount
      dosage_unit: 'IU',      // Changed from dose_unit
      usage_frequency: 'Daily',
      time_of_day: ['Morning'],
      with_food: true
    }
    
    // Verify data was saved correctly
    const result = await verifyDataPipeline(
      TEST_SOLUTIONS.supplements_vitamins,
      'supplements_vitamins',
      expectedFields
    )
    
    expect(result.success).toBeTruthy()
    
    // Test success screen fields update
    if (await page.locator('text="What else helped?"').isVisible()) {
      console.log('\n=== Testing Success Screen Fields ===')
      
      const successFields = {
        side_effects: 'None',
        would_recommend: true,
        additional_notes: 'Test note for vitamin D'
      }
      
      await fillSuccessScreenFields(page, successFields)
      
      // Verify the update saved
      await page.waitForTimeout(2000)
      const updatedResult = await verifyDataPipeline(
        TEST_SOLUTIONS.supplements_vitamins,
        'supplements_vitamins',
        { ...expectedFields, ...successFields }
      )
      
      expect(updatedResult.success).toBeTruthy()
    }
    
    // Navigate to solution display page to verify UI
    console.log('\n=== Verifying UI Display ===')
    await page.goto(`/goal/56e2801e-0d78-4abd-a795-869e5b780ae7`)
    await page.waitForTimeout(2000)
    
    // Look for our solution in the UI
    const solutionCard = page.locator(`text="${TEST_SOLUTIONS.supplements_vitamins}"`)
    if (await solutionCard.isVisible()) {
      await solutionCard.click()
      await page.waitForTimeout(1000)
      
      // Verify key fields are displayed
      const uiFields = {
        'Dosage Amount': '5000',
        'Dosage Unit': 'IU',
        'Usage Frequency': 'Daily',
        'Time Of Day': 'Morning'
      }
      
      const uiResults = await verifyFieldsInUI(page, uiFields)
      const allVisible = Object.values(uiResults).every(v => v)
      expect(allVisible).toBeTruthy()
    }
    
    console.log('=== DosageForm supplements_vitamins test completed successfully ===');
  });
});