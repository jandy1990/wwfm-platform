// tests/e2e/forms/lifestyle-form-complete.spec.ts
import { test, expect } from '@playwright/test';
import { fillLifestyleForm } from './form-specific-fillers';
import { clearTestRatingsForSolution } from '../utils/test-cleanup';

test.describe('LifestyleForm End-to-End Tests', () => {
  test.beforeEach(async () => {
    // Clear any existing test data before each test
    await clearTestRatingsForSolution('Mediterranean Diet (Test)');
    await clearTestRatingsForSolution('Sleep Hygiene (Test)');
  });

  test('should complete LifestyleForm for diet_nutrition (Mediterranean Diet Test)', async ({ page }) => {
    console.log('=== Starting LifestyleForm test for Mediterranean Diet (Test) ===');
    
    // Navigate to add solution page directly
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
    
    await page.waitForSelector('text="What helped you?"', { timeout: 10000 })
    console.log('Add solution page loaded')
    
    // Search for "Mediterranean Diet (Test)"
    const searchTerm = 'Mediterranean Diet (Test)'
    await page.type('#solution-name', searchTerm)
    console.log(`Typed "${searchTerm}" - looking for Mediterranean Diet solutions`)
    
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
      
      // Look for and click "Mediterranean Diet (Test)" in the dropdown
      const dropdownButtons = page.locator('[data-testid="solution-dropdown"] button')
      const buttonCount = await dropdownButtons.count()
      console.log(`Found ${buttonCount} suggestions in dropdown`)
      
      let found = false
      for (let i = 0; i < buttonCount; i++) {
        const button = dropdownButtons.nth(i)
        const text = await button.textContent()
        console.log(`Option ${i}: "${text}"`)
        
        if (text?.includes('Mediterranean Diet (Test)')) {
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
        console.log('Warning: "Mediterranean Diet (Test)" not found in dropdown')
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
    
    // Check if we need to manually select category
    const categoryPickerVisible = await page.locator('text="Choose a category"').isVisible().catch(() => false)
    if (categoryPickerVisible) {
      console.log('Category picker visible - selecting Lifestyle category')
      
      // Click on "Lifestyle +" to expand the category
      await page.click('button:has-text("Lifestyle")')
      await page.waitForTimeout(500)
      
      // Click on "Diet/Nutrition"
      console.log('Selecting Diet/Nutrition')
      await page.click('button:has-text("Diet/Nutrition")')
      await page.waitForTimeout(1000)
    }
    
    // Wait for LifestyleForm to load
    try {
      await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
      console.log('LifestyleForm loaded successfully')
    } catch (error) {
      await page.screenshot({ path: 'lifestyle-test-debug-screenshot.png' })
      console.log('Form did not load - screenshot saved to lifestyle-test-debug-screenshot.png')
      throw error
    }

    // Wait for Radix Portal hydration + challenge options loading (CRITICAL for shadcn Select)
    // LifestyleForm now uses shadcn Select which requires Portal hydration before interacting
    console.log('Waiting for Portal hydration and data loading...')
    await page.waitForTimeout(1000)
    // Wait for the first SelectTrigger button (timeToResults field) to be fully visible and interactive
    await page.locator('text="When did you notice results?"').waitFor({ state: 'visible', timeout: 15000 })
    await page.waitForTimeout(500) // Additional wait for Select component to be fully interactive
    console.log('Portal hydration complete, starting form fill...')

    // Fill the LifestyleForm
    await fillLifestyleForm(page, 'diet_nutrition');
    
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
    console.log('=== LifestyleForm diet_nutrition test completed successfully ===');
  });

  test('should complete LifestyleForm for sleep (Sleep Hygiene Test)', async ({ page }) => {
    console.log('=== Starting LifestyleForm test for Sleep Hygiene (Test) ===');
    
    // Navigate to add solution page directly
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
    
    await page.waitForSelector('text="What helped you?"', { timeout: 10000 })
    console.log('Add solution page loaded')
    
    // Search for "Sleep Hygiene (Test)"
    const searchTerm = 'Sleep Hygiene (Test)'
    await page.type('#solution-name', searchTerm)
    console.log(`Typed "${searchTerm}" - looking for Sleep Hygiene solutions`)
    
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
      
      // Look for and click "Sleep Hygiene (Test)" in the dropdown
      const dropdownButtons = page.locator('[data-testid="solution-dropdown"] button')
      const buttonCount = await dropdownButtons.count()
      console.log(`Found ${buttonCount} suggestions in dropdown`)
      
      let found = false
      for (let i = 0; i < buttonCount; i++) {
        const button = dropdownButtons.nth(i)
        const text = await button.textContent()
        console.log(`Option ${i}: "${text}"`)
        
        if (text?.includes('Sleep Hygiene (Test)')) {
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
        console.log('Warning: "Sleep Hygiene (Test)" not found in dropdown')
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
    
    // Check if we need to manually select category
    const categoryPickerVisible = await page.locator('text="Choose a category"').isVisible().catch(() => false)
    if (categoryPickerVisible) {
      console.log('Category picker visible - selecting Lifestyle category')
      
      // Click on "Lifestyle +" to expand the category
      await page.click('button:has-text("Lifestyle")')
      await page.waitForTimeout(500)
      
      // Click on "Sleep"
      console.log('Selecting Sleep')
      await page.click('button:has-text("Sleep")')
      await page.waitForTimeout(1000)
    }
    
    // Wait for LifestyleForm to load
    try {
      await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
      console.log('LifestyleForm loaded successfully')
    } catch (error) {
      await page.screenshot({ path: 'lifestyle-test-debug-screenshot.png' })
      console.log('Form did not load - screenshot saved to lifestyle-test-debug-screenshot.png')
      throw error
    }

    // Wait for Radix Portal hydration + challenge options loading (CRITICAL for shadcn Select)
    // LifestyleForm now uses shadcn Select which requires Portal hydration before interacting
    console.log('Waiting for Portal hydration and data loading...')
    await page.waitForTimeout(1000)
    // Wait for the first SelectTrigger button (timeToResults field) to be fully visible and interactive
    await page.locator('text="When did you notice results?"').waitFor({ state: 'visible', timeout: 15000 })
    await page.waitForTimeout(500) // Additional wait for Select component to be fully interactive
    console.log('Portal hydration complete, starting form fill...')

    // Fill the LifestyleForm
    await fillLifestyleForm(page, 'sleep');
    
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
    console.log('=== LifestyleForm sleep test completed successfully ===');
  });
});