import { test, expect } from '@playwright/test';
import { fillSessionForm } from './form-specific-fillers';

test('Debug SessionForm doctors_specialists', async ({ page }) => {
  console.log('=== Starting doctors_specialists debug test ===');
  
  // Navigate to add solution page
  await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
  
  // Wait for page to load
  await page.waitForSelector('#solution-name', { timeout: 10000 });
  console.log('Page loaded');
  
  // Type the test solution for doctors_specialists
  await page.fill('#solution-name', 'Psychiatrist (Test)');
  console.log('Typed solution name: Psychiatrist (Test)');
  
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
    console.log('Category picker appeared - selecting doctors_specialists');
    
    // Click the category
    await page.click('button:has-text("People you see")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Doctors & Specialists")');
    console.log('Selected category manually');
    
    // Wait for form to load
    await page.waitForTimeout(2000);
  }
  
  // Check if form loaded
  const formContent = await page.textContent('body');
  if (formContent?.includes('How well it worked')) {
    console.log('✅ Form loaded successfully');
    
    // Use the fillSessionForm function
    try {
      await fillSessionForm(page, 'doctors_specialists');
      console.log('✅ Form filled successfully');
      
      // Check where we are after submission
      await page.waitForTimeout(3000);
      const finalContent = await page.textContent('body');
      
      if (finalContent?.includes('Thank you')) {
        console.log('✅ SUCCESS! Form submitted successfully');
      } else if (finalContent?.includes('What else did you try')) {
        console.log('✅ Made it to Step 3 - form working correctly');
      } else {
        console.log('⚠️ Unexpected state after form submission');
        console.log('Page contains:', finalContent?.substring(0, 200));
      }
      
    } catch (error) {
      console.log('❌ Error filling form:', error);
      
      // Try to debug what's missing
      const continueButton = page.locator('button:has-text("Continue")');
      const isDisabled = await continueButton.isDisabled();
      
      if (isDisabled) {
        console.log('❌ Continue button is DISABLED - validation failed');
        
        // Check what fields might be missing
        const allSelects = await page.locator('select').all();
        const allComboboxes = await page.locator('button[role="combobox"]').all();
        
        console.log(`Found ${allSelects.length} native selects`);
        console.log(`Found ${allComboboxes.length} Select components`);
        
        // Log the state of each combobox
        for (let i = 0; i < allComboboxes.length; i++) {
          const text = await allComboboxes[i].textContent();
          console.log(`Combobox ${i}: "${text}"`);
        }
      }
    }
  } else {
    console.log('❌ Form did not load');
    console.log('Page contains:', formContent?.substring(0, 200));
  }
  
  console.log('=== Test complete ===');
});