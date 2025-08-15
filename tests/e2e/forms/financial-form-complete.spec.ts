import { test, expect } from '@playwright/test';

test.describe('FinancialForm - Complete E2E Tests', () => {
  test('should submit financial solution successfully from goal page', async ({ page }) => {
    console.log('Test setup - user already authenticated via global setup')
    console.log('Starting FinancialForm test from actual goal page')
    
    // Navigate to goal page and click "Share What Worked"
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution')
    
    await page.waitForSelector('text="What helped you?"', { timeout: 10000 })
    console.log('Add solution page loaded')
    
    // Type "High Yield Savings" to search for financial solutions
    // Then we'll select the test version if available
    const searchTerm = 'High Yield Savings'
    await page.type('#solution-name', searchTerm)
    console.log(`Typed "${searchTerm}" - looking for High Yield Savings solutions`)
    
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
      
      // Look for and click "High Yield Savings (Test)" in the dropdown
      const dropdownButtons = page.locator('[data-testid="solution-dropdown"] button')
      const buttonCount = await dropdownButtons.count()
      console.log(`Found ${buttonCount} suggestions in dropdown`)
      
      let found = false
      for (let i = 0; i < buttonCount; i++) {
        const button = dropdownButtons.nth(i)
        const text = await button.textContent()
        console.log(`Option ${i}: "${text}"`)
        
        if (text?.includes('High Yield Savings (Test)')) {
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
        console.log('Warning: "High Yield Savings (Test)" not found in dropdown, continuing anyway')
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
      console.log('Expanding "Money & Finance" category')
      
      // First click on "Money & Finance +" to expand the category
      await page.click('button:has-text("Money & Finance")')
      await page.waitForTimeout(500)
      
      // Now click on "Financial Products"
      console.log('Selecting Financial Products')
      await page.click('button:has-text("Financial Products")')
      await page.waitForTimeout(1000)
    }
    
    // Wait for form to load
    try {
      await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
      console.log('FinancialForm loaded successfully')
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
    
    // Step 1: Product Details + Effectiveness + Time to Impact
    console.log('Starting FinancialForm filler - 3-step wizard')
    console.log('Step 1: Filling product details and effectiveness')
    
    // Select cost type (required field)
    const costTypeSelect = page.locator('select').first()
    await costTypeSelect.selectOption('Free')
    console.log('Selected cost type: Free')
    await page.waitForTimeout(300)
    
    // Select financial benefit (required field)
    const benefitSelect = page.locator('select').nth(1) 
    await benefitSelect.selectOption('$25-100/month saved/earned')
    console.log('Selected financial benefit: $25-100/month saved/earned')
    await page.waitForTimeout(300)
    
    // Select access time (required field)
    const accessSelect = page.locator('select').nth(2)
    await accessSelect.selectOption('Same day')
    console.log('Selected access time: Same day')
    await page.waitForTimeout(300)
    
    // Click effectiveness rating (4 stars)
    const ratingButtons = await page.locator('.grid.grid-cols-5 button').all()
    if (ratingButtons.length >= 4) {
      await ratingButtons[3].click() // 4 stars
      console.log('Selected 4-star rating')
    }
    await page.waitForTimeout(500)
    
    // Select time to impact (required field)
    const timeToImpactSelect = page.locator('select').nth(3)
    await timeToImpactSelect.selectOption('1-2 weeks')
    console.log('Selected time to impact: 1-2 weeks')
    await page.waitForTimeout(300)
    
    // Click Continue to Step 2
    console.log('Clicked Continue to Step 2')
    const continueBtn1 = page.locator('button:has-text("Continue"):not([disabled])')
    await continueBtn1.click()
    await page.waitForTimeout(1500)
    
    // Step 2: Barriers
    console.log('Step 2: Selecting barriers')
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
    await page.waitForTimeout(2000)
    
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
      await page.screenshot({ path: 'financial-test-failure-screenshot.png' })
      console.log('Screenshot saved to financial-test-failure-screenshot.png')
      
      throw new Error('FinancialForm submission failed - still on Step 3')
    }
    
    expect(wasProcessed).toBeTruthy()
    console.log('Test completed successfully!')
  })
});