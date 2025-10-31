// tests/e2e/forms/session-form-complete.spec.ts
import { test, expect, Page } from '@playwright/test';
import { fillSessionForm } from './form-specific-fillers';
import { clearTestRatingsForSolution } from '../utils/test-cleanup';
import { verifyDataPipeline, waitForSuccessPage } from '../utils/test-helpers';

// Test solution names for database verification
const TEST_SOLUTIONS = {
  therapists_counselors: 'CBT Therapy (Test)',
  doctors_specialists: 'Psychiatrist (Test)',
  coaches_mentors: 'Life Coach (Test)',
  alternative_practitioners: 'Acupuncture (Test)',
  professional_services: 'Financial Advisor (Test)',
  crisis_resources: 'Crisis Hotline (Test)'
}

// Expected fields for database verification (matches form filler values)
const EXPECTED_FIELDS = {
  therapists_counselors: {
    time_to_results: '3-6 months',
    session_frequency: 'Weekly',
    session_length: '60 minutes',  // Fixed: was "50-60 minutes", now matches actual dropdown
    cost: '$100-150',  // Fixed: matches actual per_session dropdown options
    challenges: ['None']
  },

  doctors_specialists: {
    time_to_results: '1-2 months',
    session_frequency: 'Monthly',
    wait_time: '1-2 weeks',
    insurance_coverage: 'Fully covered by insurance',
    cost: '$50-100',  // Fixed: matches actual per_session dropdown options
    challenges: ['None']
  },

  coaches_mentors: {
    time_to_results: '1-2 months',
    session_frequency: 'Fortnightly',
    session_length: '60 minutes',
    cost: '$100-150',  // Fixed: matches actual per_session dropdown options
    challenges: ['None']
  },

  alternative_practitioners: {
    time_to_results: '1-2 months',
    session_frequency: 'Weekly',
    session_length: '60 minutes',
    cost: '$50-100',
    side_effects: ['None']
  },

  professional_services: {
    time_to_results: '1-2 weeks',
    session_frequency: 'As needed',
    specialty: 'Personal trainer/Fitness coach',
    cost: '$50-100',
    challenges: ['None']
  },

  crisis_resources: {
    time_to_results: 'Immediately',
    response_time: 'Immediate',
    format: 'Phone',
    cost: 'Free',
    challenges: ['None']
  }
}

/**
 * Helper function to search for and select a test solution
 * Waits for search results to appear before checking dropdown
 */
async function searchAndSelectSolution(page: Page, solutionName: string): Promise<boolean> {
  console.log(`Searching for: "${solutionName}"`)
  
  // Type the solution name
  await page.type('#solution-name', solutionName)
  console.log(`Typed "${solutionName}"`)
  
  // Wait for search results to appear (not just the dropdown container)
  try {
    await page.waitForSelector('[data-testid="solution-dropdown"] button', { 
      timeout: 5000,
      state: 'visible' 
    })
    console.log('Dropdown appeared with results')
  } catch (e) {
    console.log('No results appeared within 5 seconds')
    
    // Check what's in the dropdown
    const dropdownContent = await page.locator('[data-testid="solution-dropdown"]').textContent().catch(() => '')
    if (dropdownContent?.includes('Searching')) {
      console.log('Search still in progress after 5 seconds')
    } else if (dropdownContent?.includes('Add')) {
      console.log('Search completed but fixture not found - dropdown shows "Add as new"')
    }
    
    throw new Error(`Test fixture "${solutionName}" not found in search results. This indicates a test setup issue.`)
  }
  
  // Count and check buttons
  const buttons = page.locator('[data-testid="solution-dropdown"] button')
  const count = await buttons.count()
  console.log(`Found ${count} suggestions in dropdown`)
  
  if (count === 0) {
    throw new Error(`Test fixture "${solutionName}" not found in dropdown despite buttons being present`)
  }
  
  // Find and click the matching solution
  for (let i = 0; i < count; i++) {
    const text = await buttons.nth(i).textContent()
    console.log(`Option ${i}: "${text}"`)
    if (text?.includes(solutionName)) {
      console.log(`Found and clicking: "${text}"`)
      await buttons.nth(i).click()
      await page.waitForTimeout(500)
      return true
    }
  }
  
  console.log(`Warning: Exact match for "${solutionName}" not found, test will continue`)
  return false
}

test.describe('SessionForm End-to-End Tests', () => {
  test.beforeEach(async () => {
    // Clear any existing test data before each test
    await clearTestRatingsForSolution('CBT Therapy (Test)');
    await clearTestRatingsForSolution('Psychiatrist (Test)');
    await clearTestRatingsForSolution('Life Coach (Test)');
    await clearTestRatingsForSolution('Acupuncture (Test)');
    await clearTestRatingsForSolution('Financial Advisor (Test)');
    await clearTestRatingsForSolution('Crisis Hotline (Test)');
  });

  test('should complete SessionForm for therapists_counselors (CBT Therapy Test)', async ({ page }) => {
    console.log('=== Starting SessionForm test for CBT Therapy (Test) ===');
    
    // Navigate to add solution page directly
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
    
    await page.waitForSelector('text="What helped you?"', { timeout: 10000 })
    console.log('Add solution page loaded')
    
    // Use the helper to search and select the test solution
    const searchTerm = 'CBT Therapy (Test)'
    const found = await searchAndSelectSolution(page, searchTerm)
    
    if (!found) {
      // Close dropdown if we didn't find exact match
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    }
    
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

    // Wait for Radix Portal hydration + challenge options loading (CRITICAL for shadcn Select)
    // SessionForm now uses shadcn Select which requires Portal hydration before interacting
    console.log('Waiting for Portal hydration and data loading...')
    await page.waitForTimeout(1000)
    // Wait for the first Select field label to be fully visible and interactive
    await page.locator('text="When did you notice results?"').waitFor({ state: 'visible', timeout: 15000 })
    await page.waitForTimeout(500) // Additional wait for Select component to be fully interactive
    console.log('Portal hydration complete, starting form fill...')

    // Fill the SessionForm
    await fillSessionForm(page, 'therapists_counselors');
    
    // Verify successful submission - UI check
    console.log('Verifying successful submission...')
    await waitForSuccessPage(page)

    // Verify database pipeline - Full data integrity check
    console.log('=== Verifying Database Pipeline ===')
    const result = await verifyDataPipeline(
      TEST_SOLUTIONS.therapists_counselors,
      'therapists_counselors',
      EXPECTED_FIELDS.therapists_counselors
    )

    expect(result.success).toBeTruthy()

    if (!result.success) {
      console.error(`❌ therapists_counselors verification failed:`, result.error)
      if (result.fieldMismatches) {
        console.log('Field mismatches:')
        console.table(result.fieldMismatches)
      }
    }

    console.log('=== SessionForm therapists_counselors test completed successfully ===');
  });

  test('should complete SessionForm for doctors_specialists (Psychiatrist Test)', async ({ page }) => {
    // Increase timeout for this test - server processing can take >90s
    test.setTimeout(120000)
    console.log('=== Starting SessionForm test for Psychiatrist (Test) ===');
    
    // Navigate to add solution page directly
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
    
    await page.waitForSelector('text="What helped you?"', { timeout: 10000 })
    console.log('Add solution page loaded')
    
    // Use the helper to search and select the test solution
    const searchTerm = 'Psychiatrist (Test)'
    const found = await searchAndSelectSolution(page, searchTerm)
    
    if (!found) {
      // Close dropdown if we didn't find exact match
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    }
    
    // Click Continue
    const continueBtn = page.locator('button:has-text("Continue")')
    const isContinueVisible = await continueBtn.isVisible()
    if (isContinueVisible) {
      console.log('Clicking Continue button to proceed to form')
      await continueBtn.click({ force: true })
      await page.waitForTimeout(1000)
    }
    
    // Check if category picker appears
    const pageContent = await page.textContent('body');
    
    if (pageContent?.includes('Choose a category')) {
      console.log('Category picker appeared - selecting doctors_specialists');
      
      await page.click('button:has-text("People you see")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Doctors & Specialists")');
      console.log('Selected category manually');
      
      await page.waitForTimeout(2000);
    }
    
    // Wait for SessionForm to load
    try {
      await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
      console.log('SessionForm loaded successfully')
    } catch (error) {
      await page.screenshot({ path: 'doctors-test-debug-screenshot.png' })
      console.log('Form did not load - screenshot saved')
      throw error
    }

    // Wait for Radix Portal hydration + challenge options loading (CRITICAL for shadcn Select)
    console.log('Waiting for Portal hydration and data loading...')
    await page.waitForTimeout(1000)
    await page.locator('text="When did you notice results?"').waitFor({ state: 'visible', timeout: 15000 })
    await page.waitForTimeout(500)
    console.log('Portal hydration complete, starting form fill...')

    // Fill the SessionForm for doctors_specialists
    // Based on code inspection, doctors_specialists requires:
    // - effectiveness, timeToResults, costType, costRange
    // - sessionFrequency (REQUIRED)
    // - waitTime appears but is OPTIONAL
    await fillSessionForm(page, 'doctors_specialists');
    
    // Verify successful submission - UI check
    console.log('Verifying successful submission...')
    await waitForSuccessPage(page)

    // Verify database pipeline - Full data integrity check
    console.log('=== Verifying Database Pipeline ===')
    const result = await verifyDataPipeline(
      TEST_SOLUTIONS.doctors_specialists,
      'doctors_specialists',
      EXPECTED_FIELDS.doctors_specialists
    )

    expect(result.success).toBeTruthy()

    if (!result.success) {
      console.error(`❌ doctors_specialists verification failed:`, result.error)
      if (result.fieldMismatches) {
        console.log('Field mismatches:')
        console.table(result.fieldMismatches)
      }
    }

    console.log('=== SessionForm doctors_specialists test completed successfully ===');
  });

  test('should complete SessionForm for coaches_mentors (Life Coach Test)', async ({ page }) => {
    console.log('=== Starting SessionForm test for Life Coach (Test) ===');
    
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
    await page.waitForSelector('text="What helped you?"', { timeout: 10000 })
    console.log('Add solution page loaded')
    
    const searchTerm = 'Life Coach (Test)'
    const found = await searchAndSelectSolution(page, searchTerm)
    
    if (!found) {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    }
    
    const continueBtn = page.locator('button:has-text("Continue")')
    await continueBtn.click({ force: true })
    await page.waitForTimeout(1000)
    
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('Choose a category')) {
      console.log('Selecting coaches_mentors category');
      await page.click('button:has-text("People you see")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Coaches & Mentors")');
      await page.waitForTimeout(2000);
    }
    
    await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
    console.log('SessionForm loaded successfully')

    // Wait for Radix Portal hydration + challenge options loading (CRITICAL for shadcn Select)
    console.log('Waiting for Portal hydration and data loading...')
    await page.waitForTimeout(1000)
    await page.locator('text="When did you notice results?"').waitFor({ state: 'visible', timeout: 15000 })
    await page.waitForTimeout(500)
    console.log('Portal hydration complete, starting form fill...')

    // Based on code inspection, coaches_mentors requires:
    // - effectiveness, timeToResults, costType, costRange, sessionFrequency
    await fillSessionForm(page, 'coaches_mentors');

    // Verify successful submission - UI check
    console.log('Verifying successful submission...')
    await waitForSuccessPage(page)

    // Verify database pipeline - Full data integrity check
    console.log('=== Verifying Database Pipeline ===')
    const result = await verifyDataPipeline(
      TEST_SOLUTIONS.coaches_mentors,
      'coaches_mentors',
      EXPECTED_FIELDS.coaches_mentors
    )

    expect(result.success).toBeTruthy()

    if (!result.success) {
      console.error(`❌ coaches_mentors verification failed:`, result.error)
      if (result.fieldMismatches) {
        console.log('Field mismatches:')
        console.table(result.fieldMismatches)
      }
    }

    console.log('=== SessionForm coaches_mentors test completed successfully ===');
  });

  test('should complete SessionForm for alternative_practitioners (Acupuncture Test)', async ({ page }) => {
    console.log('=== Starting SessionForm test for Acupuncture (Test) ===');
    
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
    await page.waitForSelector('text="What helped you?"', { timeout: 10000 })
    console.log('Add solution page loaded')
    
    const searchTerm = 'Acupuncture (Test)'
    const found = await searchAndSelectSolution(page, searchTerm)
    
    if (!found) {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    }
    
    const continueBtn = page.locator('button:has-text("Continue")')
    await continueBtn.click({ force: true })
    await page.waitForTimeout(1000)
    
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('Choose a category')) {
      console.log('Selecting alternative_practitioners category');
      await page.click('button:has-text("People you see")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Alternative Practitioners")');
      await page.waitForTimeout(2000);
    }
    
    await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
    console.log('SessionForm loaded successfully')

    // Wait for Radix Portal hydration + challenge options loading (CRITICAL for shadcn Select)
    console.log('Waiting for Portal hydration and data loading...')
    await page.waitForTimeout(1000)
    await page.locator('text="When did you notice results?"').waitFor({ state: 'visible', timeout: 15000 })
    await page.waitForTimeout(500)
    console.log('Portal hydration complete, starting form fill...')

    // Based on code inspection, alternative_practitioners requires:
    // - effectiveness, timeToResults, costType, costRange, sessionFrequency
    // - Has SIDE EFFECTS step instead of challenges
    await fillSessionForm(page, 'alternative_practitioners');

    // Verify successful submission - UI check
    console.log('Verifying successful submission...')
    await waitForSuccessPage(page)

    // Verify database pipeline - Full data integrity check
    console.log('=== Verifying Database Pipeline ===')
    const result = await verifyDataPipeline(
      TEST_SOLUTIONS.alternative_practitioners,
      'alternative_practitioners',
      EXPECTED_FIELDS.alternative_practitioners
    )

    expect(result.success).toBeTruthy()

    if (!result.success) {
      console.error(`❌ alternative_practitioners verification failed:`, result.error)
      if (result.fieldMismatches) {
        console.log('Field mismatches:')
        console.table(result.fieldMismatches)
      }
    }

    console.log('=== SessionForm alternative_practitioners test completed successfully ===');
  });

  test('should complete SessionForm for professional_services (Financial Advisor Test)', async ({ page }) => {
    console.log('=== Starting SessionForm test for Financial Advisor (Test) ===');
    
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
    await page.waitForSelector('text="What helped you?"', { timeout: 10000 })
    console.log('Add solution page loaded')
    
    const searchTerm = 'Financial Advisor (Test)'
    const found = await searchAndSelectSolution(page, searchTerm)
    
    if (!found) {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    }
    
    const continueBtn = page.locator('button:has-text("Continue")')
    await continueBtn.click({ force: true })
    await page.waitForTimeout(1000)
    
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('Choose a category')) {
      console.log('Selecting professional_services category');
      await page.click('button:has-text("People you see")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Professional Services")');
      await page.waitForTimeout(2000);
    }
    
    await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
    console.log('SessionForm loaded successfully')

    // Wait for Radix Portal hydration + challenge options loading (CRITICAL for shadcn Select)
    console.log('Waiting for Portal hydration and data loading...')
    await page.waitForTimeout(1000)
    await page.locator('text="When did you notice results?"').waitFor({ state: 'visible', timeout: 15000 })
    await page.waitForTimeout(500)
    console.log('Portal hydration complete, starting form fill...')

    // Based on code inspection, professional_services requires:
    // - effectiveness, timeToResults, costType, costRange
    // - specialty (REQUIRED)
    // - sessionFrequency (REQUIRED)
    await fillSessionForm(page, 'professional_services');

    // Verify successful submission - UI check
    console.log('Verifying successful submission...')
    await waitForSuccessPage(page)

    // Verify database pipeline - Full data integrity check
    console.log('=== Verifying Database Pipeline ===')
    const result = await verifyDataPipeline(
      TEST_SOLUTIONS.professional_services,
      'professional_services',
      EXPECTED_FIELDS.professional_services
    )

    expect(result.success).toBeTruthy()

    if (!result.success) {
      console.error(`❌ professional_services verification failed:`, result.error)
      if (result.fieldMismatches) {
        console.log('Field mismatches:')
        console.table(result.fieldMismatches)
      }
    }

    console.log('=== SessionForm professional_services test completed successfully ===');
  });

  test('should complete SessionForm for crisis_resources (Crisis Hotline Test)', async ({ page }) => {
    // Increase timeout for this test - page crashes are unpredictable
    test.setTimeout(120000)

    // Add browser error logging to capture JavaScript errors
    page.on('pageerror', error => {
      console.log('🔴 BROWSER ERROR:', error.message)
      console.log('Stack:', error.stack)
    })

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 CONSOLE ERROR:', msg.text())
      }
    })

    console.log('=== Starting SessionForm test for Crisis Hotline (Test) ===');

    // Navigate to add solution page
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
    
    await page.waitForSelector('text="What helped you?"', { timeout: 10000 })
    console.log('Add solution page loaded')
    
    const searchTerm = 'Crisis Hotline (Test)'
    const found = await searchAndSelectSolution(page, searchTerm)
    
    if (!found) {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    }
    
    const continueBtn = page.locator('button:has-text("Continue")')
    await continueBtn.click({ force: true })
    await page.waitForTimeout(1000)
    
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('Choose a category')) {
      console.log('Selecting crisis_resources category');
      await page.click('button:has-text("People you see")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Crisis Resources")');
      await page.waitForTimeout(2000);
    }
    
    // Wait for form to load
    await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
    console.log('SessionForm loaded successfully')

    // Wait for Radix Portal hydration + challenge options loading (CRITICAL for shadcn Select)
    console.log('Waiting for Portal hydration and data loading...')
    await page.waitForTimeout(1000)
    await page.locator('text="When did you notice results?"').waitFor({ state: 'visible', timeout: 15000 })
    await page.waitForTimeout(500)
    console.log('Portal hydration complete, starting form fill...')

    // Based on code inspection, crisis_resources:
    // - Does NOT need costType (special case)
    // - Does NOT need sessionFrequency
    // - REQUIRES responseTime
    // - Has different cost options: Free, Donation-based, Sliding scale, Don't remember
    await fillSessionForm(page, 'crisis_resources');

    // Verify successful submission - UI check
    console.log('Verifying successful submission...')
    await waitForSuccessPage(page)

    // Verify database pipeline - Full data integrity check
    console.log('=== Verifying Database Pipeline ===')
    const result = await verifyDataPipeline(
      TEST_SOLUTIONS.crisis_resources,
      'crisis_resources',
      EXPECTED_FIELDS.crisis_resources
    )

    expect(result.success).toBeTruthy()

    if (!result.success) {
      console.error(`❌ crisis_resources verification failed:`, result.error)
      if (result.fieldMismatches) {
        console.log('Field mismatches:')
        console.table(result.fieldMismatches)
      }
    }

    console.log('=== SessionForm crisis_resources test completed successfully ===');
  });
});