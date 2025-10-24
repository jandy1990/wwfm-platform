import { test, expect } from '@playwright/test';
import { clearTestRatingsForSolution } from '../utils/test-cleanup';
import { fillFinancialForm } from './form-specific-fillers';

test.describe('FinancialForm - Complete E2E Tests', () => {
  test.beforeEach(async () => {
    // Clear any existing test data before each test
    await clearTestRatingsForSolution('High Yield Savings (Test)');
  });

  test('should submit financial solution successfully from goal page', async ({ page }) => {
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

    // Wait for Radix Portal hydration + challenge options loading (CRITICAL for shadcn Select)
    // FinancialForm now uses shadcn Select which requires Portal hydration before interacting
    console.log('Waiting for Portal hydration and data loading...')
    await page.waitForTimeout(1000)
    // Wait for the first SelectTrigger button (costType field) to be fully visible and interactive
    await page.locator('text="Cost type"').waitFor({ state: 'visible', timeout: 15000 })
    await page.waitForTimeout(500) // Additional wait for Select component to be fully interactive
    console.log('Portal hydration complete, starting form fill...')

    // Fill the form using the shared filler function
    await fillFinancialForm(page);
    
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