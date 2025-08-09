import { test, expect } from '@playwright/test'
import { generateTestSolution } from '../utils/test-helpers'

const TEST_GOAL_ID = process.env.TEST_GOAL_ID!

test.describe('Debug Form Flow', () => {
  test('debug medication form navigation', async ({ page }) => {
    // Generate a properly named solution
    const testData = generateTestSolution('medications')
    console.log('Test solution:', testData.title)
    
    // Navigate to add solution page
    await page.goto(`/goal/${TEST_GOAL_ID}/add-solution`)
    
    // Wait for page to load
    await page.waitForSelector('input[placeholder*="Headspace"]', { timeout: 10000 })
    
    // Fill in the solution name
    await page.fill('input[placeholder*="Headspace"]', testData.title)
    console.log('Filled solution name:', testData.title)
    
    // Wait for dropdown to appear with suggestions
    await page.waitForTimeout(1500)
    
    // Check if dropdown is visible
    const dropdown = page.locator('.absolute.z-10.w-full.mt-1.bg-white, .absolute.z-10.w-full.mt-1.bg-gray-800')
    const dropdownVisible = await dropdown.isVisible()
    console.log('Dropdown visible?', dropdownVisible)
    
    if (dropdownVisible) {
      // Look for an item in the dropdown to click
      // Could be an existing solution or a suggestion
      const dropdownItem = page.locator('.absolute.z-10.w-full.mt-1').locator('button').first()
      if (await dropdownItem.isVisible()) {
        const itemText = await dropdownItem.textContent()
        console.log('Clicking dropdown item:', itemText)
        await dropdownItem.click()
        await page.waitForTimeout(500)
      }
    }
    
    // Take a screenshot to see what's on screen
    await page.screenshot({ path: 'debug-after-dropdown.png' })
    
    // Now check if Continue button is visible
    const continueButton = page.locator('button:has-text("Continue")')
    const isContinueVisible = await continueButton.isVisible()
    console.log('Continue button visible?', isContinueVisible)
    
    if (isContinueVisible) {
      // Click Continue
      await continueButton.click()
      console.log('Clicked Continue button')
      
      // Wait for navigation
      await page.waitForTimeout(3000)
      
      // Take another screenshot
      await page.screenshot({ path: 'debug-after-continue.png' })
      
      // Check what's on the page now
      const hasChooseCategory = await page.locator('text="Choose a category"').isVisible()
      const hasDosageForm = await page.locator('text=/How much|Dosage|How often/').isVisible()
      
      console.log('Has category picker?', hasChooseCategory)
      console.log('Has dosage form?', hasDosageForm)
      
      if (hasChooseCategory) {
        // We need to select a category
        console.log('Category picker is showing, looking for medications button')
        
        // Look for the "Things you take" section
        const thingsYouTake = page.locator('button:has-text("Things you take")')
        if (await thingsYouTake.isVisible()) {
          await thingsYouTake.click()
          await page.waitForTimeout(500)
        }
        
        // Now click on Medications
        const medButton = page.locator('button:has-text("Medications")')
        if (await medButton.isVisible()) {
          await medButton.click()
          console.log('Selected Medications category')
          await page.waitForTimeout(2000)
          await page.screenshot({ path: 'debug-after-category.png' })
        }
      }
      
      // Final check - are we on the form now?
      const finalFormCheck = await page.locator('text=/How much|Dosage|How often/').isVisible()
      console.log('Final check - on dosage form?', finalFormCheck)
      
      // List all visible inputs and selects
      const inputs = await page.locator('input:visible').count()
      const selects = await page.locator('select:visible').count()
      console.log(`Visible inputs: ${inputs}, Visible selects: ${selects}`)
    }
  })
})