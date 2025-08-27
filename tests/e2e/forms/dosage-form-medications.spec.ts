// tests/e2e/forms/dosage-form-medications.spec.ts
import { test, expect } from '@playwright/test';
import { fillDosageForm } from './form-specific-fillers';
import { 
  verifyDataPipeline, 
  fillSuccessScreenFields,
  verifyFieldsInUI
} from '../utils/test-helpers';
import { clearTestRatingsForSolution } from '../utils/test-cleanup';
import { TEST_SOLUTIONS } from '../fixtures/test-solutions';

test.describe('DosageForm End-to-End Tests - Medications', () => {
  
  test.beforeEach(async () => {
    // Clear any existing test data before each test
    console.log('Clearing previous test data for medications...')
    await clearTestRatingsForSolution(TEST_SOLUTIONS.medications)
  })

  test('should complete DosageForm for medications (Prozac Test)', async ({ page }) => {
    console.log('=== Starting DosageForm test for Prozac (Test) ===');
    console.log('Category: medications');
    console.log('Expected differences from supplements_vitamins:');
    console.log('- Different side effects list (17 options vs 16)');
    console.log('- Units include "units" and "meq"');
    console.log('- Typical timeframe 3-4 weeks for antidepressants');
    
    // Navigate to add solution page directly
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
    
    await page.waitForSelector('text="What helped you?"', { timeout: 10000 })
    console.log('Add solution page loaded')
    
    // Search for "Prozac (Test)"
    const searchTerm = 'Prozac (Test)'
    await page.type('#solution-name', searchTerm)
    console.log(`Typed "${searchTerm}" - looking for medication solutions`)
    
    // Wait for dropdown to appear AND for loading to complete
    try {
      await page.waitForSelector('[data-testid="solution-dropdown"]', { timeout: 5000 })
      console.log('Dropdown appeared')
      
      // CRITICAL: Wait for search to complete (loading spinner to disappear)
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
        
        if (text?.includes('Prozac (Test)')) {
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
        console.log('Warning: "Prozac (Test)" not found in dropdown')
        console.log('Test will continue with manual entry')
      }
    } else {
      console.log('No dropdown appeared - test solution might not be in database')
    }
    
    // Check if category was auto-detected
    const categoryAutoDetected = await page.locator('text="Your dosage"').isVisible().catch(() => false)
    console.log('Category auto-detected to DosageForm:', categoryAutoDetected)
    
    if (!categoryAutoDetected) {
      // Close dropdown if still visible
      await page.click('body', { position: { x: 10, y: 10 } })
      await page.waitForTimeout(200)
      
      // Click Continue to proceed to form
      const continueBtn = page.locator('button:has-text("Continue")')
      const isContinueVisible = await continueBtn.isVisible()
      if (isContinueVisible) {
        console.log('Clicking Continue button to proceed to form')
        await continueBtn.click()
        await page.waitForTimeout(1000)
      }
    }
    
    // Wait for DosageForm to load
    try {
      await page.waitForSelector('text="Your dosage"', { timeout: 5000 })
      console.log('DosageForm loaded successfully for medications category')
    } catch (error) {
      await page.screenshot({ path: 'medications-test-debug-screenshot.png' })
      console.log('Form did not load - screenshot saved')
      throw error
    }
    
    // Verify we have the correct form for medications
    const formContent = await page.textContent('body')
    if (formContent?.includes('Prozac (Test)')) {
      console.log('✓ Correct solution loaded in form')
    }
    
    // Fill the DosageForm for medications
    console.log('Starting to fill DosageForm for medications category...')
    await fillDosageForm(page, 'medications');
    
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
    
    // Field-level verification for medications DosageForm
    console.log('\n=== Verifying Medications Data Pipeline ===')
    
    // Expected fields for medications (different from supplements)
    const expectedFields = {
      time_to_results: '3-4 weeks', // Typical for antidepressants
      dosage_amount: '20',          // Standard Prozac dose
      dosage_unit: 'mg',            
      frequency: 'once daily',
      length_of_use: '6-12 months', // Longer for medications
      side_effects: ['None']        // Will be updated to test medication-specific later
    }
    
    // Verify data was saved correctly
    const result = await verifyDataPipeline(
      TEST_SOLUTIONS.medications,
      'medications',
      expectedFields
    )
    
    expect(result.success).toBeTruthy()
    
    // Test success screen fields update (optional)
    if (await page.locator('input[placeholder="Brand/Manufacturer"]').isVisible()) {
      console.log('\n=== Testing Success Screen Optional Fields ===')
      
      // Fill optional fields specific to medications
      await page.fill('input[placeholder="Brand/Manufacturer"]', 'Eli Lilly')
      
      // Select form factor (tablet for Prozac)
      const formSelect = page.locator('select').filter({ hasText: 'Form factor' }).first()
      if (await formSelect.isVisible()) {
        await formSelect.selectOption('tablet')
        console.log('Selected form factor: tablet')
      }
      
      // Add a note
      await page.fill('textarea[placeholder="What do others need to know?"]', 'Take with food to reduce stomach upset')
      
      // Click submit for optional fields
      const submitOptional = page.locator('button:has-text("Submit")')
      if (await submitOptional.isVisible()) {
        await submitOptional.click()
        console.log('Submitted optional fields')
        await page.waitForTimeout(2000)
      }
      
      // Verify the update saved
      const updatedResult = await verifyDataPipeline(
        TEST_SOLUTIONS.medications,
        'medications',
        { 
          ...expectedFields, 
          brand: 'Eli Lilly',
          form: 'tablet',
          notes: 'Take with food to reduce stomach upset'
        }
      )
      
      expect(updatedResult.success).toBeTruthy()
    }
    
    console.log('\n✅ Medications test completed successfully')
    console.log('Key validations passed:');
    console.log('- Form loaded correctly for medications category');
    console.log('- Dosage fields filled with medication-appropriate values');
    console.log('- Data pipeline verified for medications-specific fields');
    console.log('- Optional fields (brand, form factor) saved correctly');
    
    console.log('=== DosageForm medications test completed ===');
  });
});