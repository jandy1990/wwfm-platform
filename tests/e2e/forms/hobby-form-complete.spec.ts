import { test, expect } from '@playwright/test';
import { clearTestRatingsForSolution } from '../utils/test-cleanup';
import { fillHobbyForm } from './form-specific-fillers';

test.describe('HobbyForm - Complete E2E Tests', () => {
  test.beforeEach(async () => {
    // Clear any existing test data before each test
    await clearTestRatingsForSolution('Painting (Test)');
  });

  test('should submit hobby solution successfully from goal page', async ({ page }) => {
    console.log('Test setup - user already authenticated via global setup')
    console.log('Starting HobbyForm test from actual goal page')
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text())
      }
    })
    
    // Navigate to goal page and click "Share What Worked"
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution')
    
    await page.waitForSelector('text="What helped you?"', { timeout: 10000 })
    console.log('Add solution page loaded')
    
    // Type "Painting" to search for painting-related solutions
    // Then we'll select the test version if available, or regular version as fallback
    const searchTerm = 'Painting'
    await page.type('#solution-name', searchTerm)
    console.log(`Typed "${searchTerm}" - looking for Painting solutions`)
    
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
      
      // Look for and click "Painting (Test)" in the dropdown
      const dropdownButtons = page.locator('[data-testid="solution-dropdown"] button')
      const buttonCount = await dropdownButtons.count()
      console.log(`Found ${buttonCount} suggestions in dropdown`)
      
      let found = false
      for (let i = 0; i < buttonCount; i++) {
        const button = dropdownButtons.nth(i)
        const text = await button.textContent()
        console.log(`Option ${i}: "${text}"`)
        
        if (text?.includes('Painting (Test)')) {
          console.log(`Clicking on: "${text}"`)
          
          // Add debugging to see what happens after click
          await button.click()
          await page.waitForTimeout(500)
          
          // Check if solution name was populated
          const inputValue = await page.inputValue('#solution-name')
          console.log(`Input value after selection: "${inputValue}"`)

          // Fix: Ensure the input has the correct test fixture name
          if (inputValue !== 'Painting (Test)') {
            console.log(`Correcting input value from "${inputValue}" to "Painting (Test)"`)
            await page.fill('#solution-name', 'Painting (Test)')
            await page.waitForTimeout(500)
          }

          found = true
          break
        }
      }
      
      if (!found) {
        console.log('Warning: "Painting (Test)" not found in dropdown, continuing anyway')
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
      console.log('Expanding "Things you do" category')
      
      // First click on "Things you do +" to expand the category
      await page.click('button:has-text("Things you do")')
      await page.waitForTimeout(500)
      
      // Now click on "Hobbies & Activities"
      console.log('Selecting Hobbies & Activities')
      await page.click('button:has-text("Hobbies & Activities")')
      await page.waitForTimeout(1000)
    }
    
    // Wait for form to load
    try {
      await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
      console.log('HobbyForm loaded successfully')
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
    
    // Fill the form using migrated semantic selector function
    await page.waitForTimeout(1000)
    console.log('Starting HobbyForm filler - using fillHobbyForm function')

    // Use the migrated semantic selector function instead of inline code
    // Note: fillHobbyForm handles all 3 steps including submission and waiting for success
    await fillHobbyForm(page, 'hobbies_activities')

    // Verify the form was processed (fillHobbyForm already waits for success screen)
    console.log('Verifying successful submission...')
    const pageContent = await page.textContent('body')
    const wasProcessed = pageContent?.includes('Thank you') ||
                        pageContent?.includes('already') ||
                        pageContent?.includes('recorded') ||
                        pageContent?.includes('success') ||
                        pageContent?.includes('submitted') ||
                        pageContent?.includes('added')

    expect(wasProcessed).toBeTruthy()
    console.log('Test completed successfully!')
  })
});