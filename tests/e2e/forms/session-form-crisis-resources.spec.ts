// tests/e2e/forms/session-form-crisis-resources.spec.ts
import { test, expect, Page } from '@playwright/test';
import { 
  verifyDataPipeline, 
  fillSuccessScreenFields
} from '../utils/test-helpers';
import { clearTestRatingsForSolution } from '../utils/test-cleanup';
import { TEST_SOLUTIONS } from '../fixtures/test-solutions';

// Custom minimal filler for crisis_resources ONLY
async function fillCrisisResourcesForm(page: Page) {
  console.log('Starting minimal crisis_resources form filler');
  
  // Wait for form to load - SessionForm shows effectiveness first
  await page.waitForSelector('text="How well it worked"', { timeout: 10000 });
  console.log('Form loaded - starting with Step 1');
  
  // ============ STEP 1: Core Fields ============
  console.log('Step 1: Filling effectiveness and required fields');
  
  // 1. Effectiveness rating (REQUIRED)
  console.log('Selecting effectiveness rating...');
  const ratingButtons = page.locator('.grid.grid-cols-5 button');
  const buttonCount = await ratingButtons.count();
  console.log(`Found ${buttonCount} rating buttons`);
  
  if (buttonCount >= 4) {
    await ratingButtons.nth(3).click(); // 4 stars
    console.log('Selected 4-star effectiveness rating');
  } else {
    throw new Error(`Expected 5 rating buttons, found ${buttonCount}`);
  }
  await page.waitForTimeout(500);
  
  // 2. Time to results (REQUIRED)
  console.log('Selecting time to results...');
  const timeButtons = page.locator('button').filter({ hasText: /days|weeks|months/ });
  const hasTimeButtons = await timeButtons.first().isVisible().catch(() => false);
  
  if (hasTimeButtons) {
    console.log('Time buttons found - using button UI');
    const immediateBtn = timeButtons.filter({ hasText: 'Immediately' }).first();
    if (await immediateBtn.isVisible()) {
      await immediateBtn.click();
      console.log('Selected "Immediately" for time to results');
    } else {
      await timeButtons.first().click();
      console.log('Selected first available time option');
    }
  } else {
    console.log('No time buttons - checking for select dropdown');
    const timeSelect = page.locator('select').first();
    await timeSelect.selectOption('Immediately');
    console.log('Selected "Immediately" from dropdown');
  }
  await page.waitForTimeout(500);
  
  // 3. Cost range (REQUIRED) - Special options for crisis_resources
  console.log('Selecting cost range...');
  // For crisis_resources: Free, Donation-based, Sliding scale, Don't remember
  // NO cost type selection needed
  
  const costButton = page.locator('button[role="combobox"]').first();
  await costButton.click();
  await page.waitForTimeout(300);
  await page.click('[role="option"]:has-text("Free")');
  console.log('Selected cost range: Free');
  await page.waitForTimeout(500);
  
  // 3b. Session format (appears to be second dropdown)
  console.log('Selecting session format...');
  const formatDropdown = page.locator('button[role="combobox"]').nth(1);
  await formatDropdown.click();
  await page.waitForTimeout(300);
  await page.click('[role="option"]:has-text("Phone")');
  console.log('Selected session format: Phone');
  await page.waitForTimeout(500);
  
  // 4. Response time (REQUIRED for crisis_resources) 
  console.log('Selecting response time...');
  
  // Based on the output: 3 dropdowns found
  // Index 0: Cost range (Free)
  // Index 1: Session format (Phone/Text/Online)
  // Index 2: Response time (should be this one!)
  const dropdownTriggers = page.locator('button[role="combobox"]');
  const triggerCount = await dropdownTriggers.count();
  console.log(`Found ${triggerCount} dropdown triggers`);
  
  if (triggerCount >= 3) {
    // Response time is the THIRD dropdown (index 2)
    const responseDropdown = dropdownTriggers.nth(2);
    
    // Get the text of the dropdown to verify
    const dropdownText = await responseDropdown.textContent();
    console.log(`Third dropdown text (should be response time): "${dropdownText}"`);
    
    console.log('Clicking response time dropdown (third combobox)...');
    await responseDropdown.click();
    await page.waitForTimeout(500);
    
    // Wait for options to appear
    await page.waitForSelector('[role="option"]', { timeout: 3000 });
    
    // Get all options to see what's available
    const options = await page.locator('[role="option"]').allTextContents();
    console.log('Response time options:', options);
    
    // Look for response time options
    const immediateOption = page.locator('[role="option"]:has-text("Immediate")').first();
    const minutesOption = page.locator('[role="option"]:has-text("Within minutes")').first();
    
    if (await immediateOption.isVisible()) {
      await immediateOption.click();
      console.log('Selected response time: Immediate');
    } else if (await minutesOption.isVisible()) {
      await minutesOption.click();
      console.log('Selected response time: Within minutes');
    } else {
      // Select first available option
      await page.locator('[role="option"]').first().click();
      console.log(`Selected first available response time: ${options[0]}`);
    }
  } else {
    console.log(`ERROR: Expected 3 dropdowns for crisis_resources but found ${triggerCount}`);
    console.log('Dropdowns should be: 1) Cost range, 2) Session format, 3) Response time');
    
    // Still try to find response time somehow
    if (triggerCount === 2) {
      // Maybe session format is optional or missing?
      const responseDropdown = dropdownTriggers.nth(1);
      await responseDropdown.click();
      await page.waitForTimeout(500);
      const options = await page.locator('[role="option"]').allTextContents();
      
      // Check if these are response time options
      if (options.some(opt => opt.includes('Immediate') || opt.includes('minutes'))) {
        await page.locator('[role="option"]').first().click();
        console.log('Selected response time from second dropdown');
      }
    }
  }
  await page.waitForTimeout(500);
  
  // Session format was already selected as dropdown #2
  console.log('Session format already selected via dropdown');
  
  // Click Continue to Step 2
  console.log('Clicking Continue to Step 2...');
  const continueBtn = page.locator('button:has-text("Continue")').first();
  const isDisabled = await continueBtn.isDisabled();
  console.log(`Continue button disabled state: ${isDisabled}`);
  
  if (isDisabled) {
    console.log('ERROR: Continue button is still disabled after filling required fields');
    console.log('This means we are missing a required field for crisis_resources');
    // Take a screenshot for debugging
    await page.screenshot({ path: 'crisis-resources-continue-disabled.png' });
    throw new Error('Continue button disabled - missing required field');
  }
  
  await continueBtn.click();
  console.log('Clicked Continue button');
  
  // Wait and verify we moved to Step 2
  await page.waitForTimeout(1000);
  
  // ============ STEP 2: Challenges ============
  console.log('Step 2: Waiting for challenges to load...');
  
  try {
    // Wait for challenge checkboxes to appear
    await page.waitForSelector('label:has-text("None")', { timeout: 5000 });
    console.log('Challenges loaded - selecting None');
    await page.click('label:has-text("None")');
  } catch (e) {
    console.log('No challenges appeared - may be optional or not loaded');
  }
  await page.waitForTimeout(500);
  
  // Click Continue to Step 3
  const continueBtn2 = page.locator('button:has-text("Continue")').first();
  if (await continueBtn2.isVisible()) {
    console.log('Clicking Continue to Step 3...');
    await continueBtn2.click();
    await page.waitForTimeout(1000);
  }
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  console.log('Step 3: Skipping failed solutions');
  
  // Click Submit
  const submitBtn = page.locator('button:has-text("Submit")');
  console.log('Clicking Submit button...');
  await submitBtn.click();
  
  // Wait for submission to process
  console.log('Waiting for submission to process...');
  await page.waitForTimeout(5000); // Give more time for processing
  
  // Check if we're on success screen or redirected
  const currentUrl = page.url();
  console.log(`Current URL after submission: ${currentUrl}`);
  
  // Check for success indicators
  const pageContent = await page.textContent('body');
  if (pageContent?.includes('Thank you') || 
      pageContent?.includes('success') || 
      pageContent?.includes('What else') || 
      currentUrl.includes('success') ||
      !pageContent?.includes('How well it worked')) { // Form is gone
    console.log('✅ Form submitted successfully');
  } else {
    console.log('Warning: Still on form page after submission');
  }
}

test.describe('SessionForm - Crisis Resources Isolated Test', () => {
  
  test.beforeEach(async () => {
    console.log('Clearing previous test data for crisis_resources...');
    await clearTestRatingsForSolution(TEST_SOLUTIONS.crisis_resources);
  });

  test('should complete SessionForm for crisis_resources without crashing', async ({ page }) => {
    console.log('=== Starting ISOLATED crisis_resources test ===');
    console.log('Test fixture: Crisis Hotline (Test)');
    console.log('Category: crisis_resources');
    console.log('Key differences:');
    console.log('- NO cost type (one-time/recurring)');
    console.log('- NO session frequency');
    console.log('- REQUIRES response time');
    console.log('- Different cost options: Free, Donation-based, Sliding scale');
    
    // Navigate to add solution page
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
    
    await page.waitForSelector('text="What helped you?"', { timeout: 10000 });
    console.log('Add solution page loaded');
    
    // Search for "Crisis Hotline (Test)"
    const searchTerm = 'Crisis Hotline (Test)';
    console.log(`Typing search term: "${searchTerm}"`);
    await page.type('#solution-name', searchTerm);
    
    // Wait for dropdown
    try {
      await page.waitForSelector('[data-testid="solution-dropdown"]', { timeout: 5000 });
      console.log('Dropdown appeared');
      
      // Wait for search to complete
      await page.waitForSelector('[data-testid="solution-dropdown"]:not(:has-text("Searching..."))', { timeout: 5000 });
      console.log('Search completed');
      
      // Find and click our test solution
      const dropdownButtons = page.locator('[data-testid="solution-dropdown"] button');
      const buttonCount = await dropdownButtons.count();
      console.log(`Found ${buttonCount} suggestions`);
      
      let found = false;
      for (let i = 0; i < buttonCount; i++) {
        const button = dropdownButtons.nth(i);
        const text = await button.textContent();
        console.log(`Option ${i}: "${text}"`);
        
        if (text?.includes('Crisis Hotline (Test)')) {
          console.log(`Clicking on: "${text}"`);
          await button.click();
          await page.waitForTimeout(500);
          found = true;
          break;
        }
      }
      
      if (!found) {
        console.log('Test solution not found in dropdown - typing manually');
      }
    } catch (e) {
      console.log('Dropdown did not appear - continuing with manual entry');
    }
    
    // Check if we need to select category manually
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('Choose a category')) {
      console.log('Manual category selection needed');
      await page.click('button:has-text("People you see")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Crisis Resources")');
      await page.waitForTimeout(1000);
    }
    
    // Click Continue to proceed to form
    const continueToForm = page.locator('button:has-text("Continue")').first();
    if (await continueToForm.isVisible()) {
      console.log('Clicking Continue to proceed to form');
      await continueToForm.click();
      await page.waitForTimeout(1000);
    }
    
    // Verify SessionForm loaded
    try {
      await page.waitForSelector('text="How well it worked"', { timeout: 5000 });
      console.log('SessionForm loaded successfully');
    } catch (error) {
      console.log('Form did not load - taking screenshot');
      await page.screenshot({ path: 'crisis-resources-form-load-fail.png' });
      throw error;
    }
    
    // Fill the form with minimal approach
    console.log('Starting form filling with minimal approach...');
    await fillCrisisResourcesForm(page);
    
    // Verify submission - check multiple indicators
    console.log('Verifying successful submission...');
    await page.waitForTimeout(2000);
    
    const finalUrl = page.url();
    const finalContent = await page.textContent('body');
    
    console.log(`Final URL: ${finalUrl}`);
    console.log(`Page contains "How well it worked": ${finalContent?.includes('How well it worked')}`);
    console.log(`Page contains "What else": ${finalContent?.includes('What else')}`);
    console.log(`Page contains "Thank you": ${finalContent?.includes('Thank you')}`);
    
    const wasProcessed = 
      finalContent?.includes('Thank you') || 
      finalContent?.includes('recorded') ||
      finalContent?.includes('success') ||
      finalContent?.includes('What else') ||
      finalUrl.includes('success') ||
      !finalContent?.includes('How well it worked'); // Form is gone
    
    expect(wasProcessed).toBeTruthy();
    
    // Verify data pipeline
    console.log('\n=== Verifying Crisis Resources Data Pipeline ===');
    
    const expectedFields = {
      time_to_results: 'Immediately',
      cost_range: 'Free',
      response_time: 'Immediate'
      // session_format and challenges are optional, not always saved
    };
    
    const result = await verifyDataPipeline(
      TEST_SOLUTIONS.crisis_resources,
      'crisis_resources',
      expectedFields
    );
    
    expect(result.success).toBeTruthy();
    
    console.log('\n✅ Crisis resources test completed successfully');
    console.log('Key achievements:');
    console.log('- Form loaded without crashing');
    console.log('- All required fields filled');
    console.log('- Form submitted successfully');
    console.log('- Data pipeline verified');
    
    console.log('=== Crisis resources isolated test completed ===');
  });
});