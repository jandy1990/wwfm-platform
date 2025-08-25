import { test, expect } from '@playwright/test';
import { fillPracticeForm } from './form-specific-fillers';

test('Debug PracticeForm exercise_movement', async ({ page }) => {
  console.log('=== Starting exercise_movement debug test ===');
  
  // Navigate to add solution page
  await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
  
  // Wait for page to load
  await page.waitForSelector('#solution-name', { timeout: 10000 });
  console.log('Page loaded');
  
  // Type the test solution for exercise_movement
  await page.fill('#solution-name', 'Running (Test)');
  console.log('Typed solution name: Running (Test)');
  
  // Wait for dropdown
  await page.waitForTimeout(2000);
  
  // Close dropdown if open
  await page.keyboard.press('Escape');
  
  // Click Continue
  const continueBtn = page.locator('button:has-text("Continue")');
  await continueBtn.click({ force: true });
  console.log('Clicked Continue');
  
  // Wait for navigation
  await page.waitForTimeout(2000);
  
  // Check if category picker appears
  const pageContent = await page.textContent('body');
  
  if (pageContent?.includes('Choose a category')) {
    console.log('Category picker appeared - selecting exercise_movement');
    
    // Click the category
    await page.click('button:has-text("Activities")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Exercise & Movement")');
    console.log('Selected category manually');
    
    // Wait for form to load
    await page.waitForTimeout(2000);
  }
  
  // Check if form loaded
  const formContent = await page.textContent('body');
  if (formContent?.includes('How well it worked')) {
    console.log('✅ Form loaded successfully');
    
    // Use the fillPracticeForm function
    try {
      await fillPracticeForm(page, 'exercise_movement');
      console.log('✅ Form filled successfully');
      
      // Check where we are after submission
      await page.waitForTimeout(5000);
      const finalContent = await page.textContent('body');
      
      if (finalContent?.includes('Thank you')) {
        console.log('✅ SUCCESS! Form submitted successfully - "Thank you" found');
        console.log('Full success text:', finalContent?.match(/Thank you[^<]*/)?.[0]);
      } else if (finalContent?.includes('error')) {
        console.log('❌ ERROR found in page:', finalContent?.match(/[Ee]rror[^<]*/)?.[0]);
      } else if (finalContent?.includes('What else did you try')) {
        console.log('📍 Currently on Step 3 - Failed solutions');
      } else {
        console.log('⚠️ Unexpected state after form submission');
        console.log('Page title/header:', finalContent?.match(/<h[1-3][^>]*>([^<]+)/)?.[1]);
        
        // Check if we're still on Step 3 or somewhere else
        if (finalContent?.includes('Step 3')) {
          console.log('Still on Step 3');
        }
        
        // Check for any error messages
        const errorElements = await page.locator('.text-red-500, .text-red-600, .error').all();
        for (const element of errorElements) {
          const text = await element.textContent();
          console.log('Found error element:', text);
        }
      }
      
    } catch (error) {
      console.log('❌ Error filling form:', error);
    }
  } else {
    console.log('❌ Form did not load');
    console.log('Page contains:', formContent?.substring(0, 200));
  }
  
  console.log('=== Test complete ===');
});