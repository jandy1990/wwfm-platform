import { test } from '@playwright/test';
import { clearTestRatingsForSolution } from '../utils/test-cleanup';
import { fillFinancialForm } from './form-specific-fillers';

test.describe('FinancialForm Debug - Console Logging', () => {
  test.beforeEach(async () => {
    await clearTestRatingsForSolution('High Yield Savings (Test)');
  });

  test('debug financial form submission with console logs', async ({ page }) => {
    // Capture ALL console messages from the browser
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`;
      consoleMessages.push(text);
      console.log('BROWSER:', text);
    });

    // Capture page errors
    page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message);
      consoleMessages.push(`[error] ${error.message}`);
    });

    console.log('Starting FinancialForm debug test');

    // Navigate to add solution page
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
    await page.waitForSelector('text="What helped you?"', { timeout: 10000 });

    // Search and select High Yield Savings (Test)
    await page.type('#solution-name', 'High Yield Savings');
    await page.waitForSelector('[data-testid="solution-dropdown"]', { timeout: 5000 });
    await page.waitForTimeout(500);

    const dropdownButtons = page.locator('[data-testid="solution-dropdown"] button');
    const buttonCount = await dropdownButtons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = dropdownButtons.nth(i);
      const text = await button.textContent();
      if (text?.includes('High Yield Savings (Test)')) {
        await button.click();
        await page.waitForTimeout(500);
        break;
      }
    }

    // Check if category was auto-detected
    const formLoaded = await page.locator('text="How well it worked"').isVisible().catch(() => false);

    if (!formLoaded) {
      // Click Continue if needed
      const continueBtn = page.locator('button:has-text("Continue")');
      if (await continueBtn.isVisible()) {
        await continueBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // Wait for form to load
    await page.waitForSelector('text="How well it worked"', { timeout: 5000 });
    console.log('FinancialForm loaded');

    // Fill the form
    await fillFinancialForm(page);

    // Check if we're on success screen or still on form
    await page.waitForTimeout(15000); // Wait 15 seconds to see what happens

    const successScreenVisible = await page.locator('text="Thank you for sharing!"').isVisible().catch(() => false);
    const stillOnStep3 = await page.locator('text="What else did you try?"').isVisible().catch(() => false);

    console.log('After 15 seconds:');
    console.log('- Success screen visible:', successScreenVisible);
    console.log('- Still on Step 3:', stillOnStep3);
    console.log('- Total console messages captured:', consoleMessages.length);
    console.log('\nAll browser console messages:');
    consoleMessages.forEach(msg => console.log(msg));

    // Take screenshot
    await page.screenshot({ path: 'financial-debug-final-state.png', fullPage: true });
    console.log('Screenshot saved to financial-debug-final-state.png');
  });
});
