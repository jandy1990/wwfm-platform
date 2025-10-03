import { test, expect } from '@playwright/test';
import { clearTestRatingsForSolution } from '../utils/test-cleanup';

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
    
    // Fill the form using our updated filler
    await page.waitForTimeout(1000)
    
    // Step 1: Effectiveness + Time + Cost + Product Details
    console.log('Starting PurchaseForm filler - 3-step wizard')
    console.log('Step 1: Filling effectiveness, time, cost, and product details')
    
    // Click effectiveness rating (4 stars)
    const ratingButtons = await page.locator('.grid.grid-cols-5 button').all()
    if (ratingButtons.length >= 4) {
      await ratingButtons[3].click() // 4 stars
      console.log('Selected 4-star rating')
    }
    await page.waitForTimeout(500)
    
    // Select time to results (regular select dropdown)
    const timeSelect = page.locator('select').first()
    await timeSelect.selectOption('1-2 weeks')
    console.log('Selected time to results: 1-2 weeks')
    await page.waitForTimeout(300)
    
    // Select cost type first (RadioGroup)
    console.log('Selecting cost type: one_time')
    // Click on the label text instead of the radio input
    await page.click('text="One-time purchase"')
    await page.waitForTimeout(500)
    
    // Select cost range using Select component
    // Find the cost range Select component (it has SelectTrigger)
    const costRangeSelect = page.locator('[data-state="closed"]').first()
    await costRangeSelect.click()
    await page.waitForTimeout(300)
    
    // Select from the dropdown options (for one_time, no "/month" suffix)
    await page.click('text="$50-100"')
    console.log('Selected cost range: $50-100')
    await page.waitForTimeout(300)
    
    // For products_devices category: need productType and easeOfUse
    console.log('Filling products_devices specific fields')
    
    // Debug: Take screenshot before trying to select product type
    await page.screenshot({ path: 'before-product-type-screenshot.png' })
    console.log('Screenshot taken before product type selection')
    
    // Wait a bit longer and look for the Select components
    await page.waitForTimeout(1000)
    
    // Try to find all Select components by different methods
    const selectTriggers = await page.locator('button[role="combobox"]').count()
    console.log(`Found ${selectTriggers} Select trigger buttons`)
    
    if (selectTriggers >= 2) {
      // Select product type (should be 2nd Select component)
      console.log('Attempting to click second Select trigger for product type')
      const productTypeSelect = page.locator('button[role="combobox"]').nth(1)
      await productTypeSelect.click()
      await page.waitForTimeout(500)
      
      // Wait for dropdown to appear and try to select Physical device
      try {
        await page.click('text="Physical device"', { timeout: 3000 })
        console.log('Selected product type: Physical device')
      } catch (e) {
        console.log('Could not find Physical device option, trying alternative approach')
        // Try clicking first option that contains "device"
        await page.click('[role="option"]:has-text("device"):first')
        console.log('Selected first device option')
      }
      await page.waitForTimeout(300)
      
      // Select ease of use (should be 3rd Select component)
      console.log('Attempting to click third Select trigger for ease of use')
      const easeSelect = page.locator('button[role="combobox"]').nth(2)
      await easeSelect.click()
      await page.waitForTimeout(500)
      
      try {
        await page.click('text="Easy to use"', { timeout: 3000 })
        console.log('Selected ease of use: Easy to use')
      } catch (e) {
        console.log('Could not find Easy to use option, selecting first available')
        await page.click('[role="option"]:first')
        console.log('Selected first ease option')
      }
      await page.waitForTimeout(300)
    } else {
      console.log('Could not find expected Select components, skipping category-specific fields')
    }
    
    // Click Continue to Step 2
    console.log('Clicked Continue to Step 2')
    const continueBtn1 = page.locator('button:has-text("Continue"):not([disabled])')
    await continueBtn1.click()
    await page.waitForTimeout(1500)
    
    // Step 2: Issues
    console.log('Step 2: Selecting issues')
    await page.click('label:has-text("None")')
    await page.waitForTimeout(500)
    
    // Click Continue to Step 3
    console.log('Clicked Continue to Step 3')
    const continueBtn2 = page.locator('button:has-text("Continue"):not([disabled])')
    await continueBtn2.click()
    await page.waitForTimeout(1500)
    
    // Step 3: Failed Solutions (Optional)
    console.log('Step 3: Skipping failed solutions')
    // This step is optional - can proceed directly to submit
    
    // Submit form
    console.log('Submit button found, clicking...')
    const submitBtn = page.locator('button:has-text("Submit")')
    await submitBtn.click()
    
    // Wait longer for submission to complete (like HobbyForm)
    await page.waitForTimeout(5000)
    
    // Verify the form was processed (success, duplicate, or any completion message)
    const pageContent = await page.textContent('body')
    const wasProcessed = pageContent?.includes('Thank you') || 
                        pageContent?.includes('already') || 
                        pageContent?.includes('recorded') ||
                        pageContent?.includes('success') ||
                        pageContent?.includes('submitted') ||
                        pageContent?.includes('added')
    
    // Also check if we're still on Step 3 (which means submission failed)
    const stillOnStep3 = await page.locator('text="What else did you try?"').isVisible().catch(() => false)
    
    if (stillOnStep3) {
      // Check for any error alerts
      const alerts = await page.locator('[role="alert"]').all()
      for (const alert of alerts) {
        const alertText = await alert.textContent()
        console.log('Alert found:', alertText || '(empty)')
      }
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'purchase-test-failure-screenshot.png' })
      console.log('Screenshot saved to purchase-test-failure-screenshot.png')
      
      throw new Error('PurchaseForm submission failed - still on Step 3')
    }
    
    expect(wasProcessed).toBeTruthy()
    console.log('Test completed successfully!')
  })
});