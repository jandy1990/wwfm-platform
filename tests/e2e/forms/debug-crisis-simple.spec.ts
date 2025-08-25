import { test, expect } from '@playwright/test';

test('Simple crisis_resources navigation test', async ({ page }) => {
  console.log('=== Simple crisis_resources test ===');
  
  // Navigate directly with crisis_resources category
  await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution?solution=Crisis%20Hotline%20(Test)&category=crisis_resources');
  
  // Wait for form to load
  await page.waitForSelector('h2:has-text("How well it worked")', { timeout: 10000 });
  console.log('Form loaded with crisis_resources category');
  
  // Fill minimal required fields for Step 1
  // Click 4-star rating
  await page.click('.grid.grid-cols-5 button:nth-child(4)');
  console.log('Selected 4-star rating');
  
  // Select time to results
  await page.selectOption('select', '1-2 weeks');
  console.log('Selected time to results');
  
  // Select cost range (no radio buttons for crisis_resources)
  await page.click('button[role="combobox"]:has-text("Select cost range")');
  await page.waitForTimeout(500);
  await page.click('[role="option"]:first-child');
  console.log('Selected cost range');
  
  // Select format
  await page.click('button[role="combobox"]:has-text("Select format")');
  await page.waitForTimeout(500);
  await page.click('[role="option"]:has-text("Phone")');
  console.log('Selected format');
  
  // Select response time (required for crisis_resources)
  await page.click('button[role="combobox"]:has-text("How quickly")');
  await page.waitForTimeout(500);
  await page.click('[role="option"]:has-text("Immediate")');
  console.log('Selected response time');
  
  // Now try to click Continue
  console.log('About to click Continue button...');
  
  // Add listener for console messages
  page.on('console', msg => {
    if (msg.text().includes('[DEBUG]')) {
      console.log('Browser console:', msg.text());
    }
  });
  
  // Add listener for page errors
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  // Try to click Continue
  try {
    const continueBtn = page.locator('button:has-text("Continue")').first();
    const isDisabled = await continueBtn.isDisabled();
    console.log('Continue button disabled?', isDisabled);
    
    if (!isDisabled) {
      console.log('Clicking Continue...');
      await continueBtn.click();
      console.log('Clicked Continue successfully');
      
      // Wait a bit to see what happens
      await page.waitForTimeout(2000);
      
      // Check if we made it to Step 2
      const pageContent = await page.textContent('body');
      if (pageContent?.includes('Any challenges')) {
        console.log('✅ SUCCESS! Made it to Step 2');
      } else if (pageContent?.includes('Step 2')) {
        console.log('✅ Made it to Step 2');
      } else {
        console.log('Current page content:', pageContent?.substring(0, 200));
      }
    } else {
      console.log('❌ Continue button is disabled');
    }
  } catch (error) {
    console.log('❌ Error clicking Continue:', error);
  }
  
  // Keep the page open for a bit to see any errors
  await page.waitForTimeout(5000);
});