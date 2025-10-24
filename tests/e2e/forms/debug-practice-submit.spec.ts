// Debug test to check if PracticeForm handleSubmit executes
import { test, expect } from '@playwright/test';

test.describe('PracticeForm Submit Debug', () => {
  test('should log browser console when Submit clicked', async ({ page }) => {
    // Capture browser console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log(`[BROWSER CONSOLE] ${text}`);
    });

    // Sign in
    await page.goto('/auth/signin');
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', 'test@wwfm-platform.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Navigate to add solution
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
    await page.waitForSelector('text="What helped you?"');

    // Search and select Mindfulness Meditation (Test)
    await page.type('#solution-name', 'Mindfulness Meditation (Test)');
    await page.waitForTimeout(1000);

    const dropdownVisible = await page.locator('[data-testid="solution-dropdown"]').isVisible().catch(() => false);
    if (dropdownVisible) {
      const button = page.locator('[data-testid="solution-dropdown"] button').first();
      await button.click();
      await page.waitForTimeout(500);
    }

    // Click Continue if needed
    const continueBtn = page.locator('button:has-text("Continue")');
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(1000);
    }

    // Wait for form to load
    await page.waitForSelector('text="When did you notice results?"', { timeout: 5000 });
    console.log('✓ PracticeForm loaded');

    // Fill minimal required fields for Step 1
    // Effectiveness
    await page.click('[data-rating="4"]');
    console.log('Selected effectiveness');

    // Time to results
    const timeTrigger = page.locator('label:has-text("When did you notice results?")').locator('../..').locator('button[role="combobox"]');
    await timeTrigger.click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').filter({ hasText: '1-2 weeks' }).click();
    console.log('Selected time to results');

    // Startup cost
    const startupTrigger = page.locator('label:has-text("Initial startup cost")').locator('..').locator('button[role="combobox"]');
    await startupTrigger.click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').filter({ hasText: 'Free/No startup cost' }).click();
    console.log('Selected startup cost');

    // Ongoing cost
    const ongoingTrigger = page.locator('label:has-text("Ongoing cost")').locator('..').locator('button[role="combobox"]');
    await ongoingTrigger.click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').filter({ hasText: 'Free/No ongoing cost' }).click();
    console.log('Selected ongoing cost');

    // Frequency
    const frequencyTrigger = page.locator('label:has-text("How often?")').locator('..').locator('button[role="combobox"]');
    await frequencyTrigger.click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').filter({ hasText: '3-4 times per week' }).click();
    console.log('Selected frequency');

    // Practice length (category-specific for meditation_mindfulness)
    const practiceTrigger = page.locator('label:has-text("Practice length")').locator('..').locator('button[role="combobox"]');
    await practiceTrigger.click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').filter({ hasText: '10-20 minutes' }).click();
    console.log('Selected practice length');

    // Move to Step 2
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(500);
    console.log('Moved to Step 2');

    // Select challenge: None
    const challengeTrigger = page.locator('label:has-text("Challenges")').locator('..').locator('button[role="combobox"]');
    await challengeTrigger.click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').filter({ hasText: 'None' }).click();
    console.log('Selected challenge: None');

    // Move to Step 3
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(500);
    console.log('Moved to Step 3');

    // Check if Submit button exists and is enabled
    const submitBtn = page.locator('button:has-text("Submit"):not([disabled])');
    const submitExists = await submitBtn.isVisible();
    console.log(`Submit button visible: ${submitExists}`);

    if (submitExists) {
      console.log('About to click Submit button...');

      // Click Submit and wait
      await submitBtn.click();
      console.log('Clicked Submit button');

      // Wait a bit to see console logs
      await page.waitForTimeout(5000);

      // Check if handleSubmit was called
      const handleSubmitCalled = consoleLogs.some(log => log.includes('[PracticeForm] handleSubmit called'));
      console.log(`\nhandleSubmit was called: ${handleSubmitCalled}`);

      if (handleSubmitCalled) {
        console.log('✓ handleSubmit executed!');
        console.log('\nAll browser console logs:');
        consoleLogs.forEach(log => console.log(`  ${log}`));
      } else {
        console.log('❌ handleSubmit was NOT called!');
        console.log('\nAll browser console logs:');
        consoleLogs.forEach(log => console.log(`  ${log}`));

        // Take screenshot for debugging
        await page.screenshot({ path: 'debug-practice-submit.png' });
        console.log('Screenshot saved to debug-practice-submit.png');
      }
    } else {
      console.log('❌ Submit button not found or disabled');
    }
  });
});
