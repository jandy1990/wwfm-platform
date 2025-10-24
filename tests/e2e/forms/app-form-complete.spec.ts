import { test, expect } from '@playwright/test'
import { 
  generateTestSolution, 
  cleanupTestData,
  verifyDataPipeline,
  waitForSuccessPage
} from '../utils/test-helpers'
import { clearTestRatingsForSolution } from '../utils/test-cleanup'

const TEST_GOAL_ID = process.env.TEST_GOAL_ID!

test.describe('AppForm - Complete E2E Tests', () => {
  test.beforeEach(async () => {
    // Clear any existing test data before each test
    await clearTestRatingsForSolution('Headspace (Test)')
  })
  
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
    
    // Wait for dropdown to appear and search to complete
    await page.waitForTimeout(2000)
    
    // Select the specific test solution from dropdown
    const dropdown = page.locator('[data-testid="solution-dropdown"]')
    await dropdown.waitFor({ state: 'visible', timeout: 5000 })
    
    // Look for the specific solution in the dropdown
    const solutionButton = dropdown.locator(`button:has-text("${testData.solutionName}")`)
    if (await solutionButton.isVisible()) {
      console.log('Found test solution in dropdown, clicking it')
      await solutionButton.click()
      await page.waitForTimeout(500)
    } else {
      // If not found, click the first item
      console.log('Test solution not found, clicking first dropdown item')
      const firstButton = dropdown.locator('button').first()
      await firstButton.click()
      await page.waitForTimeout(500)
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

    // Wait for Portal hydration and data loading (CRITICAL for shadcn Select)
    console.log('Waiting for Portal hydration and data loading...')
    await page.waitForTimeout(1000)
    // Wait for the first Select field label to be fully visible and interactive
    await page.locator('text="When did you notice results?"').waitFor({ state: 'visible', timeout: 15000 })
    await page.waitForTimeout(500) // Additional wait for Select component to be fully interactive
    console.log('Portal hydration complete, starting form fill...')

    // Step 1: Fill all required fields in order

    // 1. Effectiveness rating (required) - look for the emoji button for 4 stars (😊)
    const rating4Button = page.locator('button:has-text("😊")')
    await rating4Button.click()
    console.log('Selected 4-star rating')
    await page.waitForTimeout(300)

    // 2. Time to results (first Select component)
    const timeSelectTrigger = page.locator('button[role="combobox"]').first()
    await timeSelectTrigger.click()
    await page.waitForTimeout(300)
    await page.click('text="1-2 weeks"')
    console.log('Selected time to results')
    await page.waitForTimeout(300)

    // 3. Usage frequency (second Select component)
    const usageSelectTrigger = page.locator('button[role="combobox"]').nth(1)
    await usageSelectTrigger.click()
    await page.waitForTimeout(300)
    await page.click('text="Daily"')
    console.log('Selected usage frequency')
    await page.waitForTimeout(300)

    // 4. Subscription type (third Select component)
    const subscriptionSelectTrigger = page.locator('button[role="combobox"]').nth(2)
    await subscriptionSelectTrigger.click()
    await page.waitForTimeout(300)
    await page.click('text="Monthly subscription"')
    console.log('Selected subscription type')
    await page.waitForTimeout(500) // Wait for cost field to appear

    // 5. Cost (fourth Select component - appears after subscription type is set)
    const costSelectTrigger = page.locator('button[role="combobox"]').nth(3)
    await costSelectTrigger.waitFor({ state: 'visible', timeout: 5000 })
    await costSelectTrigger.click()
    await page.waitForTimeout(300)
    await page.click('text="$10-$19.99/month"')
    console.log('Selected cost: $10-$19.99/month')
    await page.waitForTimeout(300)
    
    // Click Continue to Step 2
    await page.waitForTimeout(1000)
    const continueToStep2 = page.locator('button:has-text("Continue"):not([disabled])')
    await continueToStep2.waitFor({ state: 'visible', timeout: 5000 })
    await continueToStep2.click()
    
    // Step 2: Challenges
    await page.waitForSelector('text=/challenges|side effects/', { timeout: 5000 })
    
    // Select "None" for challenges
    const noneCheckbox = page.locator('label:has-text("None")')
    await noneCheckbox.click()
    console.log('Selected "None" for challenges')
    
    // Click Continue to Step 3
    await page.waitForTimeout(1000)
    const continueToStep3 = page.locator('button:has-text("Continue"):not([disabled])')
    await continueToStep3.waitFor({ state: 'visible', timeout: 5000 })
    await continueToStep3.click()
    console.log('Clicked Continue to Step 3')
    
    // Step 3: Failed solutions (optional - just skip)
    // Wait for either the failed solutions text or the submit button
    await page.waitForTimeout(2000)
    
    // Submit form
    const submitBtn = page.locator('button').filter({ hasText: /Share Solution|Submit/i })
    await submitBtn.waitFor({ state: 'visible', timeout: 5000 })
    await submitBtn.click()
    console.log('Clicked submit button')
    
    // Wait for success
    await waitForSuccessPage(page)
    
    // Verify data in database
    const result = await verifyDataPipeline(testData.solutionName, testData.category)
    expect(result.success).toBe(true)
    
    // Cleanup
    await cleanupTestData(testData.solutionName)
  })
})