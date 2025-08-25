import { test, expect } from '@playwright/test'
import { generateTestSolution } from '../utils/test-helpers'
import { fillFormGeneric } from './generic-form-filler'

const TEST_GOAL_ID = process.env.TEST_GOAL_ID!

test.describe('Debug Generic Form Filler', () => {
  test('debug app form with generic filler', async ({ page }) => {
    // Generate a properly named solution
    const testData = generateTestSolution('apps_software')
    console.log('Test solution:', testData.title)
    
    // Navigate to add solution page
    await page.goto(`/goal/${TEST_GOAL_ID}/add-solution`)
    
    // Wait for page to load
    await page.waitForSelector('input[placeholder*="Headspace"]', { timeout: 10000 })
    
    // Fill in the solution name
    await page.fill('input[placeholder*="Headspace"]', testData.title)
    console.log('Filled solution name:', testData.title)
    
    // Wait for dropdown to appear and search to complete
    await page.waitForTimeout(2000)
    
    // Select from dropdown if it appears
    const dropdown = page.locator('[data-testid="solution-dropdown"]')
    try {
      await dropdown.waitFor({ state: 'visible', timeout: 3000 })
      const firstButton = dropdown.locator('button').first()
      await firstButton.click()
      await page.waitForTimeout(500)
    } catch (e) {
      // Dropdown didn't appear, continue
    }
    
    // Click Continue
    const continueButton = page.locator('button:has-text("Continue")')
    if (await continueButton.isVisible()) {
      await continueButton.click()
      console.log('Clicked Continue button')
      await page.waitForTimeout(2000)
    }
    
    // Now call the generic form filler
    console.log('Starting generic form filler...')
    await fillFormGeneric(page, 'apps_software')
    
    // Check if we reached the success page
    const currentUrl = page.url()
    console.log('Final URL:', currentUrl)
    
    // Check if submit button is visible
    const submitBtn = page.locator('button:has-text("Submit"):visible')
    if (await submitBtn.isVisible()) {
      console.log('Submit button is visible')
      const isDisabled = await submitBtn.isDisabled()
      console.log('Submit button disabled?', isDisabled)
      
      if (!isDisabled) {
        await submitBtn.click()
        await page.waitForTimeout(3000)
        console.log('Clicked submit, final URL:', page.url())
      }
    } else {
      console.log('Submit button not found')
    }
  })
  
  test('debug medication form with generic filler', async ({ page }) => {
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
    
    // Wait for dropdown to appear and search to complete
    await page.waitForTimeout(2000)
    
    // Select from dropdown if it appears
    const dropdown = page.locator('[data-testid="solution-dropdown"]')
    try {
      await dropdown.waitFor({ state: 'visible', timeout: 3000 })
      const firstButton = dropdown.locator('button').first()
      await firstButton.click()
      await page.waitForTimeout(500)
    } catch (e) {
      // Dropdown didn't appear, continue
    }
    
    // Click Continue
    const continueButton = page.locator('button:has-text("Continue")')
    if (await continueButton.isVisible()) {
      await continueButton.click()
      console.log('Clicked Continue button')
      await page.waitForTimeout(2000)
    }
    
    // Now call the generic form filler
    console.log('Starting generic form filler...')
    await fillFormGeneric(page, 'medications')
    
    // Check if we reached the success page
    const currentUrl = page.url()
    console.log('Final URL:', currentUrl)
    
    // Check if submit button is visible
    const submitBtn = page.locator('button:has-text("Submit"):visible')
    if (await submitBtn.isVisible()) {
      console.log('Submit button is visible')
      const isDisabled = await submitBtn.isDisabled()
      console.log('Submit button disabled?', isDisabled)
      
      if (!isDisabled) {
        await submitBtn.click()
        await page.waitForTimeout(3000)
        console.log('Clicked submit, final URL:', page.url())
      }
    } else {
      console.log('Submit button not found')
    }
  })
})