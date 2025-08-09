import { test, expect } from '@playwright/test'
import { 
  generateTestSolution, 
  cleanupTestData,
  verifyDataPipeline,
  waitForSuccessPage
} from '../utils/test-helpers'

const TEST_GOAL_ID = process.env.TEST_GOAL_ID!

test.describe('AppForm - Complete E2E Tests', () => {
  test('apps_software: complete form submission flow', async ({ page }) => {
    // Generate properly named solution that will auto-categorize
    const baseData = generateTestSolution('apps_software')
    const testData = {
      solutionName: baseData.title,
      category: 'apps_software',
      goalId: baseData.goalId,
      // Form data
      effectiveness: 4,
      timeToResults: '1-2 weeks',
      usageFrequency: 'Daily',
      subscriptionType: 'Monthly subscription',
      cost: '$10-$19.99/month',
      platform: 'iOS',
      challenges: 'Getting into the habit',
      otherInfo: 'Automated test notes for app form'
    }
    
    // Navigate to add solution page
    await page.goto(`/goal/${TEST_GOAL_ID}/add-solution`)
    
    // Step 0: Solution name and category selection
    await page.fill('input[placeholder*="Headspace"]', testData.solutionName)
    
    // Wait for dropdown to appear
    await page.waitForTimeout(1500)
    
    // Select from dropdown if it appears
    const dropdown = page.locator('.absolute.z-10.w-full.mt-1.bg-white, .absolute.z-10.w-full.mt-1.bg-gray-800')
    if (await dropdown.isVisible({ timeout: 2000 })) {
      const dropdownItem = dropdown.locator('button').first()
      if (await dropdownItem.isVisible()) {
        await dropdownItem.click()
        await page.waitForTimeout(500)
      }
    }
    
    // Click Continue button
    const continueFromSearch = page.locator('button:has-text("Continue")')
    await continueFromSearch.waitFor({ state: 'visible', timeout: 5000 })
    await continueFromSearch.click()
    
    // Wait for navigation
    await page.waitForTimeout(2000)
    
    // If category picker shows, select the category
    const categoryPicker = page.locator('text="Choose a category"')
    if (await categoryPicker.isVisible({ timeout: 3000 })) {
      // Expand "Things you use" section
      const thingsYouUse = page.locator('button:has-text("Things you use")')
      if (await thingsYouUse.isVisible()) {
        await thingsYouUse.click()
        await page.waitForTimeout(500)
      }
      
      // Click Apps & Software
      const appsButton = page.locator('button:has-text("Apps & Software")')
      if (await appsButton.isVisible()) {
        await appsButton.click()
        await page.waitForTimeout(2000)
      }
    }
    
    // Wait for form to be visible
    await page.waitForSelector('select:visible', { timeout: 10000 })
    
    // Step 1: Subscription type and cost
    await page.waitForSelector('text=/Subscription|Cost|Free/', { timeout: 5000 })
    
    // Select subscription type first
    const subscriptionSelect = page.locator('select:visible').first()
    await subscriptionSelect.selectOption('Monthly subscription')
    await page.waitForTimeout(500) // Wait for cost options to update
    
    // Select cost (this should be the second select now)
    const costSelect = page.locator('select:visible').nth(1)
    await costSelect.selectOption('$10-$19.99/month')
    
    // Click Continue to Step 2
    await page.waitForTimeout(1000)
    const continueToStep2 = page.locator('button:has-text("Continue"):not([disabled])')
    await continueToStep2.waitFor({ state: 'visible', timeout: 5000 })
    await continueToStep2.click()
    
    // Step 2: Effectiveness
    await page.waitForSelector('text=/How effective|Rate your experience/', { timeout: 5000 })
    
    // Click the effectiveness rating button (1-5)
    const ratingButtons = await page.locator('button').filter({ hasText: /^[1-5]$/ }).all()
    if (ratingButtons.length >= testData.effectiveness) {
      await ratingButtons[testData.effectiveness - 1].click()
    }
    
    // Select time to results
    const timeSelect = page.locator('select:visible').first()
    await timeSelect.selectOption('1-2 weeks')
    
    // Click Continue to Step 3
    await page.waitForTimeout(1000)
    const continueToStep3 = page.locator('button:has-text("Continue"):not([disabled])')
    await continueToStep3.waitFor({ state: 'visible', timeout: 5000 })
    await continueToStep3.click()
    
    // Step 3: Usage details
    await page.waitForSelector('text=/Usage|How often|Platform/', { timeout: 5000 })
    
    // Select usage frequency
    const frequencySelect = page.locator('select:visible').first()
    await frequencySelect.selectOption('Daily')
    
    // Select platform
    const platformSelect = page.locator('select:visible').nth(1)
    await platformSelect.selectOption('iOS')
    
    // Click Continue to Step 4
    await page.waitForTimeout(1000)
    const continueToStep4 = page.locator('button:has-text("Continue"):not([disabled])')
    await continueToStep4.waitFor({ state: 'visible', timeout: 5000 })
    await continueToStep4.click()
    
    // Step 4: Additional info
    await page.waitForSelector('text=/Additional|Challenges|Other/', { timeout: 5000 })
    
    // Fill challenges if visible
    const challengesInput = page.locator('input[placeholder*="challenge" i], textarea[placeholder*="challenge" i]')
    if (await challengesInput.isVisible()) {
      await challengesInput.fill(testData.challenges)
    }
    
    // Fill other info
    const textarea = page.locator('textarea:visible').last()
    if (await textarea.isVisible()) {
      await textarea.fill(testData.otherInfo)
    }
    
    // Wait for form validation
    await page.waitForTimeout(1000)
    
    // Submit the form
    const submitBtn = page.locator('button:has-text("Submit"):not([disabled])')
    await submitBtn.waitFor({ state: 'visible', timeout: 5000 })
    await submitBtn.click()
    
    // Wait for success
    await waitForSuccessPage(page)
    
    // Verify data in database
    const result = await verifyDataPipeline(testData.solutionName, testData.category)
    expect(result.success).toBe(true)
    
    // Cleanup
    await cleanupTestData(testData.solutionName)
  })
})