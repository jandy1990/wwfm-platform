import { test, expect } from '@playwright/test';
import { fillPracticeForm } from './form-specific-fillers';

test('Debug PracticeForm with full console output', async ({ page }) => {
  console.log('=== Full debug of PracticeForm submission ===');
  
  // Capture ALL console messages
  const logs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push(`[${msg.type()}] ${text}`);
    if (text.includes('Server action') || text.includes('Submission') || text.includes('showSuccessScreen')) {
      console.log(`IMPORTANT: ${text}`);
    }
  });
  
  // Navigate
  await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
  await page.waitForSelector('#solution-name', { timeout: 10000 });
  
  // Type and select
  await page.type('#solution-name', 'Running (Test)');
  await page.waitForTimeout(1000);
  
  // Wait for dropdown
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
      await button.click();
      break;
    }
  }
  
  await page.waitForTimeout(500);
  
  // Continue
  await page.locator('button:has-text("Continue")').click();
  await page.waitForSelector('text="How well it worked"', { timeout: 5000 });
  
  // Fill form
  console.log('Filling form...');
  await fillPracticeForm(page, 'exercise_movement');
  console.log('Form submitted, waiting for response...');
  
  // Wait longer for any async operations
  await page.waitForTimeout(5000);
  
  // Check final state
  const url = page.url();
  const hasThankYou = await page.locator('text="Thank you"').isVisible().catch(() => false);
  const hasError = await page.locator('.text-red-500').count() > 0;
  
  console.log('\n=== FINAL STATE ===');
  console.log(`URL: ${url}`);
  console.log(`Has Thank You: ${hasThankYou}`);
  console.log(`Has Error: ${hasError}`);
  
  // Print relevant logs
  console.log('\n=== RELEVANT LOGS ===');
  logs.filter(log => 
    log.includes('Server action') || 
    log.includes('Submission') || 
    log.includes('showSuccessScreen') ||
    log.includes('Error') ||
    log.includes('result')
  ).forEach(log => console.log(log));
  
  // Take screenshot
  await page.screenshot({ path: 'practice-verbose-debug.png' });
});