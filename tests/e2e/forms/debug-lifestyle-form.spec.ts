import { test, expect } from '@playwright/test';
import { fillLifestyleForm } from './form-specific-fillers';

test('Debug LifestyleForm submission', async ({ page }) => {
  console.log('=== Debugging LifestyleForm ===');
  
  // Monitor console
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Error') || text.includes('submitting')) {
      console.log(`BROWSER: ${text}`);
    }
  });
  
  // Navigate
  await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
  await page.waitForSelector('#solution-name', { timeout: 10000 });
  
  // Type and select
  await page.type('#solution-name', 'Mediterranean Diet (Test)');
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
    if (text?.includes('Mediterranean Diet (Test)')) {
      console.log(`Selecting: "${text}"`);
      await button.click();
      break;
    }
  }
  
  await page.waitForTimeout(500);
  
  // Continue
  await page.locator('button:has-text("Continue")').click();
  await page.waitForSelector('text="How well it worked"', { timeout: 5000 });
  console.log('Form loaded');
  
  // Fill form
  await fillLifestyleForm(page, 'diet_nutrition');
  console.log('Form submitted');
  
  // Check what happens
  await page.waitForTimeout(5000);
  
  const url = page.url();
  const hasThankYou = await page.locator('text="Thank you"').isVisible().catch(() => false);
  const hasError = await page.locator('.text-red-500').count() > 0;
  const stillOnForm = await page.locator('text="How well it worked"').isVisible().catch(() => false);
  
  console.log('\n=== RESULTS ===');
  console.log(`URL: ${url}`);
  console.log(`Has Thank You: ${hasThankYou}`);
  console.log(`Has Error: ${hasError}`);
  console.log(`Still on form: ${stillOnForm}`);
  
  // Check if rating was created
  const pageContent = await page.textContent('body');
  if (pageContent?.includes('already rated')) {
    console.log('⚠️ "Already rated" message found - submission succeeded on previous run');
  }
});