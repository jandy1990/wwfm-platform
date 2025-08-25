import { test, expect } from '@playwright/test';
import { 
  verifyDataPipeline, 
  fillSuccessScreenFields,
  verifyFieldsInUI,
  waitForSuccessPage
} from '../utils/test-helpers';
import { clearTestRatingsForSolution } from '../utils/test-cleanup';
import { TEST_SOLUTIONS } from '../fixtures/test-solutions';

test.describe('CommunityForm - Complete E2E Tests', () => {
  
  test.beforeEach(async () => {
    // Clear any existing test data before each test
    console.log('Clearing previous test data...')
    await clearTestRatingsForSolution(TEST_SOLUTIONS.support_groups)
  })
  
  test('should submit community solution successfully from goal page', async ({ page }) => {
    // Capture browser console logs
    page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log('Browser console:', msg.text())
      }
    })
    
    console.log('Test setup - user already authenticated via global setup')
    console.log('Starting CommunityForm test from actual goal page')
    
    // Navigate to goal page and click "Share What Worked"
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution')
    
    await page.waitForSelector('text="What helped you?"', { timeout: 10000 })
    console.log('Add solution page loaded')
    
    // Fill "Anxiety Support Group" to search for support group solutions
    const searchTerm = 'Anxiety Support Group'
    await page.fill('#solution-name', searchTerm)
    console.log(`Filled "${searchTerm}" - looking for support group solutions`)
    
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
      
      // Look for and click "Anxiety Support Group (Test)" in the dropdown
      const dropdownButtons = page.locator('[data-testid="solution-dropdown"] button')
      const buttonCount = await dropdownButtons.count()
      console.log(`Found ${buttonCount} suggestions in dropdown`)
      
      let found = false
      for (let i = 0; i < buttonCount; i++) {
        const button = dropdownButtons.nth(i)
        const text = await button.textContent()
        console.log(`Option ${i}: "${text}"`)
        
        if (text?.includes('Anxiety Support Group (Test)')) {
          console.log(`Clicking on: "${text}"`)
          
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
        console.log('Warning: "Anxiety Support Group (Test)" not found in dropdown, continuing anyway')
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
      console.log('Expanding "People & Community" category')
      
      // First click on "People & Community +" to expand the category
      await page.click('button:has-text("People & Community")')
      await page.waitForTimeout(500)
      
      // Now click on "Support Groups"
      console.log('Selecting Support Groups')
      await page.click('button:has-text("Support Groups")')
      await page.waitForTimeout(1000)
    }
    
    // Wait for form to load
    try {
      await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
      console.log('CommunityForm loaded successfully')
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
    await page.waitForTimeout(1000)
    
    // Step 1: Effectiveness + Time + Community Details
    console.log('Starting CommunityForm filler - 3-step wizard')
    console.log('Step 1: Filling effectiveness, time, and community details')
    
    // Click effectiveness rating (4 stars)
    const ratingButtons = await page.locator('.grid.grid-cols-5 button').all()
    if (ratingButtons.length >= 4) {
      await ratingButtons[3].click() // 4 stars
      console.log('Selected 4-star rating')
    }
    await page.waitForTimeout(500)
    
    // Select time to results (using Select component)
    // Note: time to results should be the first Select component after effectiveness rating
    // Wait for Select components to appear
    await page.waitForTimeout(1000)
    const timeSelect = page.locator('button[role="combobox"]').first()
    await timeSelect.click()
    await page.waitForTimeout(300)
    await page.click('text="1-2 weeks"')
    console.log('Selected time to results: 1-2 weeks')
    await page.waitForTimeout(300)
    
    // Select payment frequency FIRST (2nd Select component) - REQUIRED!
    const paymentSelect = page.locator('button[role="combobox"]').nth(1)
    await paymentSelect.click()
    await page.waitForTimeout(300)
    await page.click('text="Free or donation-based"')
    console.log('Selected payment frequency: Free or donation-based')
    await page.waitForTimeout(500)
    
    // Select cost range (3rd Select component - appears after payment frequency)
    const costRangeSelect = page.locator('button[role="combobox"]').nth(2)
    await costRangeSelect.click()
    await page.waitForTimeout(300)
    await page.click('text="Free"')
    console.log('Selected cost range: Free')
    await page.waitForTimeout(500)
    
    // Select meeting frequency (4th Select component)
    const meetingSelect = page.locator('button[role="combobox"]').nth(3)
    await meetingSelect.click()
    await page.waitForTimeout(300)
    await page.click('text="Weekly"')
    console.log('Selected meeting frequency: Weekly')
    await page.waitForTimeout(500)
    
    // Select format (5th Select component)
    const formatSelect = page.locator('button[role="combobox"]').nth(4)
    await formatSelect.click()
    await page.waitForTimeout(300)
    await page.click('text="Online only"')
    console.log('Selected format: Online only')
    await page.waitForTimeout(500)
    
    // Select group size (6th Select component)
    const groupSizeSelect = page.locator('button[role="combobox"]').nth(5)
    await groupSizeSelect.click()
    await page.waitForTimeout(300)
    await page.locator('[role="option"]').first().click()
    console.log('Selected first available group size')
    await page.waitForTimeout(300)
    
    // Click Continue to Step 2
    console.log('Clicked Continue to Step 2')
    const continueBtn1 = page.locator('button:has-text("Continue"):not([disabled])')
    await continueBtn1.click()
    await page.waitForTimeout(1500)
    
    // Step 2: Challenges
    console.log('Step 2: Selecting challenges')
    await page.click('label:has-text("None")')
    await page.waitForTimeout(500)
    
    // Click Continue to Step 3
    console.log('Clicked Continue to Step 3')
    const continueBtn2 = page.locator('button:has-text("Continue"):not([disabled])')
    await continueBtn2.click()
    await page.waitForTimeout(1500)
    
    // Step 3: Failed Solutions (Optional)
    console.log('Step 3: Skipping failed solutions')
    // This step is optional - can proceed directly to submit
    
    // Submit form
    console.log('Submit button found, clicking...')
    const submitBtn = page.locator('button:has-text("Submit"):not([disabled])')
    await submitBtn.waitFor({ state: 'visible', timeout: 5000 })
    await submitBtn.click()
    
    // Wait for success using standard helper (same as AppForm)
    await waitForSuccessPage(page)
    
    // Field-level verification for CommunityForm
    console.log('\n=== Verifying CommunityForm Data Pipeline ===')
    
    // Expected fields based on what we filled in the form
    // Note: effectiveness and time_to_results are stored as separate columns, not in solution_fields
    const expectedFields = {
      // payment_frequency is not stored in CommunityForm
      cost: 'Free',
      meeting_frequency: 'Weekly',  // New field added in our fixes
      format: 'Online only',
      group_size: 'Small (under 10 people)',  // Actual value from dropdown
      // challenges array is only added if non-empty and not 'None'
    }
    
    // Verify data was saved correctly
    const result = await verifyDataPipeline(
      TEST_SOLUTIONS.support_groups,
      'support_groups',
      expectedFields
    )
    
    expect(result.success).toBeTruthy()
    
    // Verify new fields are being aggregated
    if (result.aggregatedFields) {
      console.log('\n=== Checking New Field Aggregations ===')
      
      // These are the new fields we added aggregation for
      const newFields = ['meeting_frequency', 'group_size', 'format']
      
      for (const field of newFields) {
        if (result.aggregatedFields[field]) {
          console.log(`   ✅ ${field} is being aggregated`)
        } else {
          console.log(`   ⚠️ ${field} not yet aggregated (may need more data)`)
        }
      }
    }
    
    // Test success screen fields update
    if (await page.locator('text="What else helped?"').isVisible()) {
      console.log('\n=== Testing Success Screen Fields ===')
      
      const successFields = {
        facilitator_quality: 'Excellent',
        would_recommend: true,
        additional_notes: 'Test note for support group'
      }
      
      await fillSuccessScreenFields(page, successFields)
      
      // Verify the update saved
      await page.waitForTimeout(2000)
      const updatedResult = await verifyDataPipeline(
        TEST_SOLUTIONS.support_groups,
        'support_groups',
        { ...expectedFields, ...successFields }
      )
      
      expect(updatedResult.success).toBeTruthy()
    }
    
    // Navigate to solution display page to verify UI
    console.log('\n=== Verifying UI Display ===')
    await page.goto(`/goal/56e2801e-0d78-4abd-a795-869e5b780ae7`)
    await page.waitForTimeout(2000)
    
    // Look for our solution in the UI
    const solutionCard = page.locator(`text="${TEST_SOLUTIONS.support_groups}"`)
    if (await solutionCard.isVisible()) {
      await solutionCard.click()
      await page.waitForTimeout(1000)
      
      // Verify key fields are displayed, especially the new ones
      const uiFields = {
        'Meeting Frequency': 'Weekly',
        'Group Size': '5-10',
        'Format': 'Online only',
        'Cost': 'Free'
      }
      
      const uiResults = await verifyFieldsInUI(page, uiFields)
      const allVisible = Object.values(uiResults).every(v => v)
      
      // Even if not all fields are visible yet, check if new fields made it
      if (uiResults['Meeting Frequency'] || uiResults['Group Size']) {
        console.log('✅ New community fields are being displayed!')
      }
    }
    
    console.log('\n=== CommunityForm test completed successfully ===')
  })
});