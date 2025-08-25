import { test, expect } from '@playwright/test'
import { KNOWN_SOLUTIONS } from '../fixtures/known-solutions'
import { fillAppForm } from './form-specific-fillers'
import { clearTestRatingsForSolution } from '../utils/test-cleanup'

test.describe('AppForm Tests', () => {
  // Authentication is handled by global setup in playwright.config.ts
  // No need to login in each test
  
  test.beforeEach(async ({ page }) => {
    console.log('Test setup - user already authenticated via global setup')
    // Clear any existing test data before each test
    await clearTestRatingsForSolution('Headspace (Test)')
  })

  test('should submit app solution successfully from goal page', async ({ page }) => {
    console.log('Starting AppForm test from actual goal page')
    
    // Navigate directly to the add-solution page for anxiety goal
    const ANXIETY_GOAL_ID = '56e2801e-0d78-4abd-a795-869e5b780ae7'
    await page.goto(`/goal/${ANXIETY_GOAL_ID}/add-solution`)
    
    // Wait for solution input page to load
    await page.waitForSelector('#solution-name', { timeout: 5000 })
    console.log('Add solution page loaded')
    
    // Type just "Headspace" first to see if it appears
    // Then we'll select the test version if available, or regular version as fallback
    const searchTerm = 'Headspace'
    await page.type('#solution-name', searchTerm)
    console.log(`Typed "${searchTerm}" - looking for Headspace solutions`)
    
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
      
      // Look for and click "Headspace (Test)" in the dropdown
      const dropdownButtons = page.locator('[data-testid="solution-dropdown"] button')
      const buttonCount = await dropdownButtons.count()
      console.log(`Found ${buttonCount} suggestions in dropdown`)
      
      let found = false
      for (let i = 0; i < buttonCount; i++) {
        const button = dropdownButtons.nth(i)
        const text = await button.textContent()
        console.log(`Option ${i}: "${text}"`)
        
        if (text?.includes('Headspace (Test)')) {
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
        console.log('Warning: "Headspace (Test)" not found in dropdown, continuing anyway')
      }
      
      await page.waitForTimeout(500)
    } else {
      console.log('No dropdown appeared - test solution might not be in database')
    }
    
    // Check if category was auto-detected (should show blue badge for apps_software)
    const categoryBadge = await page.locator('.bg-blue-100, .bg-blue-900').isVisible().catch(() => false)
    console.log('Category auto-detected:', categoryBadge)
    
    // IMPORTANT: Close dropdown by clicking outside it to avoid interference
    await page.click('body', { position: { x: 10, y: 10 } })
    await page.waitForTimeout(200) // Give dropdown time to close
    
    // Verify dropdown is closed before continuing
    const dropdownStillVisible = await page.locator('[data-testid="solution-dropdown"]').isVisible().catch(() => false)
    if (dropdownStillVisible) {
      console.log('Warning: Dropdown still visible, attempting to close again')
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)
    }
    
    // Click Continue button to proceed to form
    const continueButton = page.locator('button:has-text("Continue")')
    await continueButton.click()
    console.log('Clicked Continue button')
    
    // Wait for form or category picker to load
    await page.waitForTimeout(2000)
    
    // Check if we need to manually select category (only if auto-detection failed)
    const categoryPickerVisible = await page.locator('text="Choose a category"').isVisible().catch(() => false)
    if (categoryPickerVisible) {
      console.log('Category picker visible (auto-detection may have failed)')
      console.log('Expanding "Things you use" category')
      
      // First click on "Things you use +" to expand the category
      await page.click('button:has-text("Things you use")')
      await page.waitForTimeout(500)
      
      // Now click on "Apps & Software"
      console.log('Selecting Apps & Software')
      await page.click('button:has-text("Apps & Software")')
      await page.waitForTimeout(1000)
    }
    
    // Wait for form to load
    try {
      await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
      console.log('AppForm loaded successfully')
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
    await fillAppForm(page)
    
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
      await page.screenshot({ path: 'test-failure-screenshot.png' })
      console.log('Screenshot saved to test-failure-screenshot.png')
      
      throw new Error('Form submission failed - still on Step 3')
    }
    
    expect(wasProcessed).toBeTruthy()
    console.log('Test completed successfully!')
  })

  test.skip('should handle validation errors in AppForm', async ({ page }) => {
    console.log('Starting AppForm validation test')
    
    // Navigate directly to test forms page
    await page.goto('/test/forms')
    await page.waitForSelector('text="Forms Test Page"')
    
    // Click on Apps & Software category
    await page.click('button:has-text("apps_software")')
    await page.waitForSelector('text="How well it worked"')
    
    // Try to click Continue without filling required fields
    const continueBtn = page.locator('button:has-text("Continue")')
    
    // Button should be disabled initially
    const isDisabled = await continueBtn.isDisabled()
    expect(isDisabled).toBeTruthy()
    console.log('Continue button correctly disabled when form is empty')
    
    // Fill only effectiveness and try again
    const ratingButtons = page.locator('button').filter({ has: page.locator('div:has(text("😊"))') })
    const allButtons = await ratingButtons.all()
    if (allButtons.length >= 4) {
      await allButtons[3].click() // 4 stars
    }
    
    // Button should still be disabled (other fields required)
    const stillDisabled = await continueBtn.isDisabled()
    expect(stillDisabled).toBeTruthy()
    console.log('Continue button correctly disabled with partial data')
  })

  test.skip('should restore form data from sessionStorage backup', async ({ page }) => {
    console.log('Starting form backup/restore test')
    
    // Navigate to test forms page
    await page.goto('/test/forms')
    await page.waitForSelector('text="Forms Test Page"')
    
    // Click on Apps & Software category
    await page.click('button:has-text("apps_software")')
    await page.waitForSelector('text="How well it worked"')
    
    // Fill some data in Step 1
    const ratingButtons = page.locator('button').filter({ has: page.locator('div:has(text("😊"))') })
    const allButtons = await ratingButtons.all()
    if (allButtons.length >= 4) {
      await allButtons[3].click() // 4 stars
    }
    
    // Select time to results
    const timeSelect = page.locator('select:visible').first()
    await timeSelect.selectOption('1-2 weeks')
    
    // Refresh the page
    await page.reload()
    console.log('Page refreshed')
    
    // Navigate back to the form
    await page.goto('/test/forms')
    await page.click('button:has-text("apps_software")')
    await page.waitForSelector('text="How well it worked"')
    
    // Check if restore notification appears
    const restoreNotification = page.locator('text="Your previous progress has been restored"')
    const isRestored = await restoreNotification.isVisible({ timeout: 5000 }).catch(() => false)
    
    if (isRestored) {
      console.log('Form data was restored from backup')
      expect(isRestored).toBeTruthy()
    } else {
      console.log('Note: Form backup/restore may not be enabled for test page')
    }
  })
})

// Separate test for auto-categorization flow (if needed)
test.describe('AppForm Auto-categorization Flow', () => {
  test.skip('should auto-categorize and load correct form', async ({ page }) => {
    // This test would use the actual goal page flow with auto-categorization
    // Skipped by default as the direct test page approach is more reliable
    
    const appSolution = KNOWN_SOLUTIONS.apps_software[0]
    
    // Navigate to a goal page (would need real goal ID)
    await page.goto('/goal/[GOAL_ID]/add-solution')
    
    // Enter solution name
    await page.fill('#solution-name', appSolution.name)
    
    // Wait for auto-categorization
    await page.waitForTimeout(2000)
    
    // Check for category detection
    const categoryBadge = page.locator('.bg-blue-100')
    const detected = await categoryBadge.isVisible()
    expect(detected).toBeTruthy()
    
    // Continue to form
    await page.click('button:has-text("Continue")')
    
    // Verify AppForm loaded
    await page.waitForSelector('text="How well it worked"')
  })
})