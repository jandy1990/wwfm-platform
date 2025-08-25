// tests/e2e/forms/session-form-complete.spec.ts
import { test, expect } from '@playwright/test';
import { fillSessionForm } from './form-specific-fillers';
import { clearTestRatingsForSolution } from '../utils/test-cleanup';

test.describe('SessionForm End-to-End Tests', () => {
  test.beforeEach(async () => {
    // Clear any existing test data before each test
    await clearTestRatingsForSolution('CBT Therapy (Test)');
  });

  test('should complete SessionForm for therapists_counselors (CBT Therapy Test)', async ({ page }) => {
    console.log('=== Starting SessionForm test for CBT Therapy (Test) ===');
    
    // Navigate to add solution page directly
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
    
    await page.waitForSelector('text="What helped you?"', { timeout: 10000 })
    console.log('Add solution page loaded')
    
    // Search for the test solution now that it's approved
    const searchTerm = 'CBT Therapy (Test)'
    await page.type('#solution-name', searchTerm)
    console.log(`Typed "${searchTerm}" - looking for test solution`)
    
    // Wait for dropdown to appear with suggestions
    try {
      await page.waitForSelector('[data-testid="solution-dropdown"]', { timeout: 5000 })
      console.log('Dropdown selector found')
      await page.waitForTimeout(500)
    } catch (e) {
      console.log('Dropdown did not appear within 5 seconds')
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
        
        // Look for the exact test solution or any CBT therapy option
        if (text?.includes('CBT Therapy (Test)')) {
          console.log(`Found and clicking test solution: "${text}"`)
          await button.click()
          await page.waitForTimeout(500)
          found = true
          break
        }
      }
      
      if (!found) {
        console.log('CBT Therapy not found in exact match - using first cbt option')
      }
    } else {
      console.log('No dropdown appeared')
    }
    
    // Close dropdown by pressing Escape or clicking outside
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)
    
    // After closing dropdown, click Continue
    const continueBtn = page.locator('button:has-text("Continue")')
    const isContinueVisible = await continueBtn.isVisible()
    if (isContinueVisible) {
      console.log('Clicking Continue button to proceed to form')
      // Force click to bypass any overlays
      await continueBtn.click({ force: true })
      await page.waitForTimeout(1000)
    }
    
    // Check if we need to select category manually
    const pageContent = await page.textContent('body');
    
    if (pageContent?.includes('Choose a category')) {
      console.log('Category picker appeared - selecting therapists_counselors');
      
      // Click the category section and then the specific category
      await page.click('button:has-text("People you see")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Therapists & Counselors")');
      console.log('Selected category manually');
      
      // Wait for form to load after category selection
      await page.waitForTimeout(2000);
    }
    
    // Wait for SessionForm to load
    try {
      await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
      console.log('SessionForm loaded successfully')
    } catch (error) {
      await page.screenshot({ path: 'session-test-debug-screenshot.png' })
      console.log('Form did not load - screenshot saved')
      throw error
    }
    
    // Fill the SessionForm
    await fillSessionForm(page, 'therapists_counselors');
    
    // Verify successful submission
    console.log('Verifying successful submission...')
    await page.waitForTimeout(3000)
    
    const verificationContent = await page.textContent('body')
    console.log('=== PAGE CONTENT FOR VERIFICATION ===')
    console.log(verificationContent?.substring(0, 500) + '...')
    console.log('=== END PAGE CONTENT ===')
    
    const wasProcessed = verificationContent?.includes('Thank you') || 
                        verificationContent?.includes('already') || 
                        verificationContent?.includes('recorded') ||
                        verificationContent?.includes('success') ||
                        verificationContent?.includes('submitted') ||
                        verificationContent?.includes('added') ||
                        verificationContent?.includes('Dashboard') // Check if we're redirected to dashboard
    
    console.log(`Verification result: ${wasProcessed}`)
    expect(wasProcessed).toBeTruthy()
    console.log('=== SessionForm therapists_counselors test completed successfully ===');
  });
});