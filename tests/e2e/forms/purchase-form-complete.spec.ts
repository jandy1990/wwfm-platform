import { test, expect } from '@playwright/test';
import { clearTestRatingsForSolution } from '../utils/test-cleanup';
import { fillPurchaseForm } from './form-specific-fillers';
import { verifyDataPipeline, waitForSuccessPage } from '../utils/test-helpers';

// Test solution name for database verification
const TEST_SOLUTION = 'Fitbit (Test)'

// Expected fields for database verification (matches form filler values)
const EXPECTED_FIELDS = {
  time_to_results: '1-2 weeks',
  cost_type: 'one_time',
  cost_range: '$50-100',
  product_type: 'Physical device',
  ease_of_use: 'Easy to use',
  challenges: ['None']
}

test.describe('PurchaseForm - Complete E2E Tests', () => {
  test.beforeEach(async () => {
    // Clear any existing test data before each test
    await clearTestRatingsForSolution('Fitbit (Test)');
    await clearTestRatingsForSolution('MasterClass (Test)');
    console.log('Test cleanup completed');
  });

  test('should submit purchase solution successfully from goal page', async ({ page }) => {
    // Capture ALL browser console logs
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`Browser console [${type}]:`, text);
    });

    // Capture page errors
    page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message);
    });

    console.log('Test setup - user already authenticated via global setup')
    console.log('Starting PurchaseForm test from actual goal page')

    // Navigate to goal page and click "Share What Worked"
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution')
    
    await page.waitForSelector('text="What helped you?"', { timeout: 10000 })
    console.log('Add solution page loaded')
    
    // Type "Fitbit" to search for device solutions
    // Then we'll select the test version if available
    const searchTerm = 'Fitbit'
    await page.type('#solution-name', searchTerm)
    console.log(`Typed "${searchTerm}" - looking for Fitbit solutions`)
    
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
    
    // Check if dropdown is visible
    const dropdownVisible = await page.locator('[data-testid="solution-dropdown"]').isVisible().catch(() => false)
    
    if (dropdownVisible) {
      console.log('Dropdown appeared with suggestions')
      
      // Look for and click "Fitbit (Test)" in the dropdown
      const dropdownButtons = page.locator('[data-testid="solution-dropdown"] button')
      const buttonCount = await dropdownButtons.count()
      console.log(`Found ${buttonCount} suggestions in dropdown`)
      
      let found = false
      for (let i = 0; i < buttonCount; i++) {
        const button = dropdownButtons.nth(i)
        const text = await button.textContent()
        console.log(`Option ${i}: "${text}"`)
        
        if (text?.includes('Fitbit (Test)')) {
          console.log(`Clicking on: "${text}"`)
          
          // Add debugging to see what happens after click
          await button.click()
          await page.waitForTimeout(500)
          
          // Check if solution name was populated
          const inputValue = await page.inputValue('#solution-name')
          console.log(`Input value after selection: "${inputValue}"`)
          
          found = true
          break
        }
      }
      
      if (!found) {
        console.log('Warning: "Fitbit (Test)" not found in dropdown, continuing anyway')
      }
      
      await page.waitForTimeout(500)
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
    
    // Check if we need to manually select category
    const categoryPickerVisible = await page.locator('text="Choose a category"').isVisible().catch(() => false)
    if (categoryPickerVisible) {
      console.log('Category picker visible (auto-detection may have failed)')
      console.log('Expanding "Things you buy" category')
      
      // First click on "Things you buy +" to expand the category
      await page.click('button:has-text("Things you buy")')
      await page.waitForTimeout(500)
      
      // Now click on "Products & Devices"
      console.log('Selecting Products & Devices')
      await page.click('button:has-text("Products & Devices")')
      await page.waitForTimeout(1000)
    }
    
    // Wait for form to load
    try {
      await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
      console.log('PurchaseForm loaded successfully')
    } catch (error) {
      // Take screenshot to see what's on the page
      await page.screenshot({ path: 'test-debug-screenshot.png' })
      console.log('Form did not load - screenshot saved to test-debug-screenshot.png')
      console.log('Current URL:', page.url())
      
      // Check what's visible on the page
      const pageContent = await page.textContent('body')
      console.log('Page contains:', pageContent?.substring(0, 500))
      
      throw error
    }
    
    // Fill the form using the dedicated filler function (uses semantic selectors)
    await fillPurchaseForm(page, 'products_devices')

    // Wait for the success screen rather than sleeping
    const successHeading = page.getByRole('heading', { name: 'Thank you for sharing!' })
    await expect(successHeading).toBeVisible({ timeout: 15_000 })

    // Ensure the Step 3 content has disappeared to confirm the transition
    await expect(page.locator('text="What else did you try?"')).toHaveCount(0)

    // Verify database pipeline - Full data integrity check
    console.log('=== Verifying Database Pipeline ===')
    const result = await verifyDataPipeline(
      TEST_SOLUTION,
      'products_devices',
      EXPECTED_FIELDS
    )

    if (!result.success) {
      console.error(`❌ products_devices verification failed:`, result.error)
      if (result.fieldMismatches) {
        console.log('Field mismatches:')
        console.table(result.fieldMismatches)
      }
    }

    expect(result.success).toBeTruthy()

    console.log('Test completed successfully!')
  })
});
