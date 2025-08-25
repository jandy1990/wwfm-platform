import { test, expect } from '@playwright/test';
import { fillPracticeForm } from './form-specific-fillers';

test('Debug PracticeForm success screen', async ({ page }) => {
  console.log('=== Debugging PracticeForm success screen ===');
  
  // Enable console monitoring
  page.on('console', msg => {
    if (msg.type() === 'log' || msg.type() === 'error') {
      console.log(`BROWSER: ${msg.text()}`);
    }
  });
  
  // Navigate and setup
  await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
  await page.waitForSelector('#solution-name', { timeout: 10000 });
  
  // Type and select from dropdown
  await page.type('#solution-name', 'Running (Test)');
  
  // Wait for dropdown with results
  await page.waitForSelector('[data-testid="solution-dropdown"]', { timeout: 5000 });
  await page.waitForFunction(() => {
    const dropdown = document.querySelector('[data-testid="solution-dropdown"]')
    const buttons = dropdown?.querySelectorAll('button')
    return buttons && buttons.length > 0
  }, { timeout: 5000 });
  
  // Select from dropdown
  const dropdownButtons = page.locator('[data-testid="solution-dropdown"] button');
  const buttonCount = await dropdownButtons.count();
  
  for (let i = 0; i < buttonCount; i++) {
    const button = dropdownButtons.nth(i);
    const text = await button.textContent();
    if (text?.includes('Running (Test)')) {
      console.log(`Selecting: "${text}"`);
      await button.click();
      break;
    }
  }
  
  await page.waitForTimeout(500);
  
  // Continue to form
  const continueBtn = page.locator('button:has-text("Continue")');
  await continueBtn.click();
  
  // Wait for form
  await page.waitForSelector('text="How well it worked"', { timeout: 5000 });
  console.log('Form loaded');
  
  // Fill form
  await fillPracticeForm(page, 'exercise_movement');
  console.log('Form submitted');
  
  // Wait and check what happens
  console.log('Monitoring page after submission...');
  
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(1000);
    
    // Check URL
    const url = page.url();
    console.log(`\n=== Check ${i+1} ===`);
    console.log(`URL: ${url}`);
    
    // Check for success indicators
    const hasThankYou = await page.locator('text="Thank you"').isVisible().catch(() => false);
    const hasSuccess = await page.locator('text="success"').isVisible().catch(() => false);
    const hasRecorded = await page.locator('text="recorded"').isVisible().catch(() => false);
    
    if (hasThankYou || hasSuccess || hasRecorded) {
      console.log('✅ SUCCESS SCREEN FOUND!');
      console.log(`- Thank you: ${hasThankYou}`);
      console.log(`- Success: ${hasSuccess}`);
      console.log(`- Recorded: ${hasRecorded}`);
      
      // Get the actual text
      const h1Text = await page.locator('h1').first().textContent().catch(() => 'No H1');
      const bodyText = await page.locator('body').textContent();
      console.log(`H1 Text: ${h1Text}`);
      
      // Find success message
      const successMatch = bodyText?.match(/Thank you[^.!]*/);
      if (successMatch) {
        console.log(`Success message: "${successMatch[0]}"`);
      }
      break;
    }
    
    // Check if still on form
    const stillOnForm = await page.locator('text="How well it worked"').isVisible().catch(() => false);
    if (stillOnForm) {
      console.log('Still on form (Step 1)');
    }
    
    const onStep3 = await page.locator('text="What else did you try"').isVisible().catch(() => false);
    if (onStep3) {
      console.log('Still on Step 3 (Failed solutions)');
    }
    
    // Check for errors
    const hasError = await page.locator('text="error"').isVisible().catch(() => false);
    if (hasError) {
      console.log('❌ ERROR FOUND');
      const errorText = await page.locator('*:has-text("error")').first().textContent();
      console.log(`Error: ${errorText}`);
      break;
    }
    
    // Check for 404
    const has404 = await page.locator('text="404"').isVisible().catch(() => false);
    if (has404) {
      console.log('❌ 404 ERROR');
      break;
    }
  }
  
  // Take screenshot
  await page.screenshot({ path: 'practice-success-debug.png' });
  console.log('\nScreenshot saved as practice-success-debug.png');
});