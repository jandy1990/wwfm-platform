// tests/e2e/forms/practice-form-complete.spec.ts
import { test, expect } from '@playwright/test';
import { fillPracticeForm } from './form-specific-fillers';
import { clearTestRatingsForSolution } from '../utils/test-cleanup';

test.describe('PracticeForm End-to-End Tests', () => {

  test.beforeEach(async () => {
    // Clean up any existing test ratings before each test
    console.log('Cleaning up test ratings...');
    await clearTestRatingsForSolution('Running (Test)');
    await clearTestRatingsForSolution('Mindfulness Meditation (Test)');
    await clearTestRatingsForSolution('Morning Routine (Test)');
  });

  test('should complete PracticeForm for exercise_movement (Running Test)', async ({ page }) => {
    console.log('=== Starting PracticeForm test for Running (Test) ===');
    
    // Navigate to add solution page directly
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
    
    await page.waitForSelector('text="What helped you?"', { timeout: 10000 })
    console.log('Add solution page loaded')
    
    // Search for "Running (Test)"
    const searchTerm = 'Running (Test)'
    await page.type('#solution-name', searchTerm)
    console.log(`Typed "${searchTerm}" - looking for exercise solutions`)
    
    // Wait for dropdown to appear AND for loading to complete
    try {
      await page.waitForSelector('[data-testid="solution-dropdown"]', { timeout: 5000 })
      console.log('Dropdown appeared')
      
      // CRITICAL: Wait for search to complete and results to load
      // Wait for the dropdown to have actual button elements (results)
      await page.waitForFunction(() => {
        const dropdown = document.querySelector('[data-testid="solution-dropdown"]')
        const buttons = dropdown?.querySelectorAll('button')
        return buttons && buttons.length > 0
      }, { timeout: 5000 })
      console.log('Search completed, results loaded')
      
      // Additional small wait to ensure DOM is stable
      await page.waitForTimeout(500)
    } catch (e) {
      console.log('Dropdown did not appear or search results did not load within 5 seconds')
    }
    
    // CRITICAL: Must select from dropdown to get existingSolutionId
    // Wait for dropdown and select the solution
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
        
        if (text?.includes('Running (Test)')) {
          console.log(`Clicking on: "${text}" to set existingSolutionId`)
          await button.click()
          await page.waitForTimeout(500)
          
          const inputValue = await page.inputValue('#solution-name')
          console.log(`Input value after selection: "${inputValue}"`)
          
          found = true
          break
        }
      }
      
      if (!found) {
        console.log('ERROR: "Running (Test)" not found in dropdown - will create duplicate!')
        throw new Error('Test solution "Running (Test)" not found in dropdown')
      }
    } else {
      console.log('ERROR: No dropdown appeared - cannot select existing solution!')
      throw new Error('Dropdown did not appear for existing test solution')
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
      console.log('Category picker visible - selecting Practice category')
      
      // Click on "Practice +" to expand the category
      await page.click('button:has-text("Practice")')
      await page.waitForTimeout(500)
      
      // Click on "Exercise/Movement"
      console.log('Selecting Exercise/Movement')
      await page.click('button:has-text("Exercise/Movement")')
      await page.waitForTimeout(1000)
    }
    
    // Wait for PracticeForm to load
    try {
      await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
      console.log('PracticeForm loaded successfully')
    } catch (error) {
      await page.screenshot({ path: 'practice-test-debug-screenshot.png' })
      console.log('Form did not load - screenshot saved')
      throw error
    }
    
    // Fill the PracticeForm (now includes waiting for success)
    await fillPracticeForm(page, 'exercise_movement');
    
    // The fillPracticeForm now waits for the success screen, 
    // but let's verify it's actually there
    console.log('Verifying successful submission...')
    
    const pageContent = await page.textContent('body')
    const wasProcessed = pageContent?.includes('Thank you') || 
                        pageContent?.includes('already') || 
                        pageContent?.includes('recorded') ||
                        pageContent?.includes('success') ||
                        pageContent?.includes('submitted') ||
                        pageContent?.includes('added')
    
    expect(wasProcessed).toBeTruthy()
    console.log('=== PracticeForm exercise_movement test completed successfully ===');
  });

  test('should complete PracticeForm for meditation_mindfulness (Mindfulness Meditation Test)', async ({ page }) => {
    console.log('=== Starting PracticeForm test for Mindfulness Meditation (Test) ===');
    
    // Navigate to add solution page directly
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
    
    await page.waitForSelector('text="What helped you?"', { timeout: 10000 })
    console.log('Add solution page loaded')
    
    // Search for "Mindfulness Meditation (Test)"
    const searchTerm = 'Mindfulness Meditation (Test)'
    await page.type('#solution-name', searchTerm)
    console.log(`Typed "${searchTerm}" - looking for meditation solutions`)
    
    // Wait for dropdown to appear AND for loading to complete
    try {
      await page.waitForSelector('[data-testid="solution-dropdown"]', { timeout: 5000 })
      console.log('Dropdown appeared')
      
      // CRITICAL: Wait for search to complete and results to load
      // Wait for the dropdown to have actual button elements (results)
      await page.waitForFunction(() => {
        const dropdown = document.querySelector('[data-testid="solution-dropdown"]')
        const buttons = dropdown?.querySelectorAll('button')
        return buttons && buttons.length > 0
      }, { timeout: 5000 })
      console.log('Search completed, results loaded')
      
      // Additional small wait to ensure DOM is stable
      await page.waitForTimeout(500)
    } catch (e) {
      console.log('Dropdown did not appear or search results did not load within 5 seconds')
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
        
        if (text?.includes('Mindfulness Meditation (Test)')) {
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
        console.log('ERROR: "Mindfulness Meditation (Test)" not found in dropdown - will create duplicate!')
        throw new Error('Test solution "Mindfulness Meditation (Test)" not found in dropdown')
      }
    } else {
      console.log('ERROR: No dropdown appeared - cannot select existing solution!')
      throw new Error('Dropdown did not appear for existing test solution')
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
      console.log('Category picker visible - selecting Practice category')
      
      // Click on "Practice +" to expand the category
      await page.click('button:has-text("Practice")')
      await page.waitForTimeout(500)
      
      // Click on "Meditation/Mindfulness"
      console.log('Selecting Meditation/Mindfulness')
      await page.click('button:has-text("Meditation/Mindfulness")')
      await page.waitForTimeout(1000)
    }
    
    // Wait for PracticeForm to load
    try {
      await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
      console.log('PracticeForm loaded successfully')
    } catch (error) {
      await page.screenshot({ path: 'practice-test-debug-screenshot.png' })
      console.log('Form did not load - screenshot saved')
      throw error
    }
    
    // Fill the PracticeForm
    await fillPracticeForm(page, 'meditation_mindfulness');
    
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
    console.log('=== PracticeForm meditation_mindfulness test completed successfully ===');
  });

  test('should complete PracticeForm for habits_routines (Morning Routine Test)', async ({ page }) => {
    console.log('=== Starting PracticeForm test for Morning Routine (Test) ===');
    
    // Navigate to add solution page directly
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
    
    await page.waitForSelector('text="What helped you?"', { timeout: 10000 })
    console.log('Add solution page loaded')
    
    // Search for "Morning Routine (Test)"
    const searchTerm = 'Morning Routine (Test)'
    await page.type('#solution-name', searchTerm)
    console.log(`Typed "${searchTerm}" - looking for habits solutions`)
    
    // Wait for dropdown to appear AND for loading to complete
    try {
      await page.waitForSelector('[data-testid="solution-dropdown"]', { timeout: 5000 })
      console.log('Dropdown appeared')
      
      // CRITICAL: Wait for search to complete and results to load
      // Wait for the dropdown to have actual button elements (results)
      await page.waitForFunction(() => {
        const dropdown = document.querySelector('[data-testid="solution-dropdown"]')
        const buttons = dropdown?.querySelectorAll('button')
        return buttons && buttons.length > 0
      }, { timeout: 5000 })
      console.log('Search completed, results loaded')
      
      // Additional small wait to ensure DOM is stable
      await page.waitForTimeout(500)
    } catch (e) {
      console.log('Dropdown did not appear or search results did not load within 5 seconds')
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
        
        if (text?.includes('Morning Routine (Test)')) {
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
        console.log('ERROR: "Morning Routine (Test)" not found in dropdown - will create duplicate!')
        throw new Error('Test solution "Morning Routine (Test)" not found in dropdown')
      }
    } else {
      console.log('ERROR: No dropdown appeared - cannot select existing solution!')
      throw new Error('Dropdown did not appear for existing test solution')
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
      console.log('Category picker visible - selecting Practice category')
      
      // Click on "Practice +" to expand the category
      await page.click('button:has-text("Practice")')
      await page.waitForTimeout(500)
      
      // Click on "Habits/Routines"
      console.log('Selecting Habits/Routines')
      await page.click('button:has-text("Habits/Routines")')
      await page.waitForTimeout(1000)
    }
    
    // Wait for PracticeForm to load
    try {
      await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
      console.log('PracticeForm loaded successfully')
    } catch (error) {
      await page.screenshot({ path: 'practice-test-debug-screenshot.png' })
      console.log('Form did not load - screenshot saved')
      throw error
    }
    
    // Fill the PracticeForm
    await fillPracticeForm(page, 'habits_routines');
    
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
    console.log('=== PracticeForm habits_routines test completed successfully ===');
  });
});