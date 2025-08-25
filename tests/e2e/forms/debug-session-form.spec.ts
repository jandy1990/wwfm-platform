import { test, expect } from '@playwright/test';

test('Debug SessionForm therapists_counselors', async ({ page }) => {
  console.log('Starting debug test...');
  
  // Navigate directly to the form
  await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
  
  // Wait for page to load
  await page.waitForSelector('#solution-name', { timeout: 10000 });
  console.log('Page loaded');
  
  // Type solution name
  await page.fill('#solution-name', 'CBT Therapy (Test)');
  console.log('Typed solution name');
  
  // Wait a bit for dropdown
  await page.waitForTimeout(2000);
  
  // Close dropdown if open
  await page.keyboard.press('Escape');
  
  // Click Continue
  const continueBtn = page.locator('button:has-text("Continue")');
  await continueBtn.click({ force: true });
  console.log('Clicked Continue');
  
  // Wait for form to load
  await page.waitForTimeout(3000);
  
  // Check what's on the page
  const pageText = await page.textContent('body');
  
  // Check if we're on the form
  if (pageText?.includes('How well it worked')) {
    console.log('✅ Form loaded successfully');
    
    // Try to fill the form
    // 1. Click effectiveness rating
    const ratingButtons = await page.locator('button').filter({ hasText: /^[1-5]$/ }).all();
    if (ratingButtons.length >= 4) {
      await ratingButtons[3].click();
      console.log('✅ Selected 4-star rating');
    } else {
      console.log('❌ Could not find rating buttons');
    }
    
    // 2. Select time to results
    const timeSelect = page.locator('select').first();
    if (await timeSelect.isVisible()) {
      await timeSelect.selectOption({ index: 1 });
      console.log('✅ Selected time to results');
    } else {
      console.log('❌ Time select not found');
    }
    
    // 3. Check for radio buttons
    const radioButtons = await page.locator('input[type="radio"]').count();
    console.log(`Found ${radioButtons} radio buttons`);
    
    if (radioButtons > 0) {
      // Click per_session radio
      await page.locator('input[type="radio"][value="per_session"]').click({ force: true });
      console.log('✅ Selected per_session cost type');
      
      // Wait for cost range to appear
      await page.waitForTimeout(1000);
      
      // Check for cost range dropdown
      const costRangeTrigger = page.locator('button[role="combobox"]').filter({ hasText: 'Select cost range' });
      if (await costRangeTrigger.isVisible()) {
        console.log('✅ Cost range dropdown is visible');
        
        // Try to open it
        await costRangeTrigger.click();
        await page.waitForTimeout(500);
        
        // Check if options appeared
        const optionCount = await page.locator('[role="option"]').count();
        console.log(`Found ${optionCount} cost range options`);
        
        if (optionCount > 0) {
          await page.locator('[role="option"]').first().click();
          console.log('✅ Selected first cost range option');
        }
      } else {
        console.log('❌ Cost range dropdown not visible');
      }
    } else {
      console.log('❌ No radio buttons found - category detection may have failed');
    }
    
    // Check if Continue button is enabled
    await page.waitForTimeout(1000);
    const continueStep2 = page.locator('button:has-text("Continue")');
    const isDisabled = await continueStep2.isDisabled();
    
    if (!isDisabled) {
      console.log('✅ Continue button is ENABLED - validation passed!');
    } else {
      console.log('❌ Continue button is still DISABLED - validation failed');
      
      // Debug what's missing
      const effectiveness = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          if (btn.className.includes('border-blue-500')) {
            return btn.textContent;
          }
        }
        return null;
      });
      console.log(`Effectiveness selected: ${effectiveness}`);
    }
    
  } else if (pageText?.includes('Choose a category')) {
    console.log('⚠️ Category picker appeared - auto-detection failed');
    
    // Click the category
    await page.click('button:has-text("People you see")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Therapists & Counselors")');
    console.log('Selected category manually');
    
    // Wait for form to load
    await page.waitForTimeout(2000);
    
    // Now try to fill the form
    const formText = await page.textContent('body');
    if (formText?.includes('How well it worked')) {
      console.log('✅ Form loaded after category selection');
      
      // Fill the form
      // 1. Effectiveness
      const ratingButtons = await page.locator('.grid.grid-cols-5 button').all();
      if (ratingButtons.length >= 4) {
        await ratingButtons[3].click();
        console.log('✅ Selected 4-star rating');
      }
      
      // 2. Time to results
      await page.selectOption('select:first-of-type', { index: 1 });
      console.log('✅ Selected time to results');
      
      // 3. Cost type radio
      await page.locator('label:has-text("Per session")').click();
      console.log('✅ Selected per_session cost type');
      await page.waitForTimeout(1000);
      
      // 4. Cost range
      const costTrigger = page.locator('button[role="combobox"]').filter({ hasText: 'Select cost range' });
      if (await costTrigger.isVisible()) {
        await costTrigger.click();
        await page.waitForTimeout(500);
        await page.locator('[role="option"]').first().click();
        console.log('✅ Selected cost range');
      }
      
      // 5. Session frequency (REQUIRED for therapists)
      // This is likely a Select component, not native select
      const allComboboxes = await page.locator('button[role="combobox"]').all();
      console.log(`Found ${allComboboxes.length} Select components`);
      
      // Log what each combobox contains
      for (let i = 0; i < allComboboxes.length; i++) {
        const text = await allComboboxes[i].textContent();
        console.log(`Combobox ${i}: "${text}"`);
      }
      
      // Session frequency should be the 2nd Select component (after cost range)
      if (allComboboxes.length > 1) {
        const freqTrigger = allComboboxes[1];
        await freqTrigger.click();
        await page.waitForTimeout(500);
        
        // Look for Weekly option
        const weeklyOption = page.locator('[role="option"]').filter({ hasText: 'Weekly' });
        if (await weeklyOption.isVisible()) {
          await weeklyOption.click();
          console.log('✅ Selected session frequency: Weekly');
        } else {
          // Fallback to first option
          await page.locator('[role="option"]').first().click();
          console.log('✅ Selected session frequency (first available)');
        }
        await page.waitForTimeout(300);
      }
      
      // 6. Format (3rd Select component)
      if (allComboboxes.length > 2) {
        const formatTrigger = allComboboxes[2];
        await formatTrigger.click();
        await page.waitForTimeout(500);
        
        // Look for In-person option
        const inPersonOption = page.locator('[role="option"]').filter({ hasText: 'In-person' });
        if (await inPersonOption.isVisible()) {
          await inPersonOption.click();
          console.log('✅ Selected format: In-person');
        } else {
          await page.locator('[role="option"]').first().click();
          console.log('✅ Selected format (first available)');
        }
        await page.waitForTimeout(300);
      }
      
      // 7. Session length (REQUIRED for therapists - 4th Select component)
      if (allComboboxes.length > 3) {
        const lengthTrigger = allComboboxes[3];
        await lengthTrigger.click();
        await page.waitForTimeout(500);
        
        // Look for 60 minutes option
        const sixtyMinOption = page.locator('[role="option"]').filter({ hasText: '60 minutes' });
        if (await sixtyMinOption.isVisible()) {
          await sixtyMinOption.click();
          console.log('✅ Selected session length: 60 minutes');
        } else {
          await page.locator('[role="option"]').first().click();
          console.log('✅ Selected session length (first available)');
        }
        await page.waitForTimeout(300);
      }
      
      // Check Continue button
      await page.waitForTimeout(1000);
      const continueBtn = page.locator('button:has-text("Continue")');
      const isDisabled = await continueBtn.isDisabled();
      
      if (!isDisabled) {
        console.log('🎉 SUCCESS! Continue button is ENABLED');
        console.log('All required fields have been filled correctly!');
        
        // Try to continue to Step 2
        await continueBtn.click();
        await page.waitForTimeout(1000);
        
        const step2Text = await page.textContent('body');
        if (step2Text?.includes('Any challenges') || step2Text?.includes('Step 2')) {
          console.log('✅ Successfully moved to Step 2!');
        }
      } else {
        console.log('❌ Continue button still DISABLED');
        console.log('Missing required fields for validation');
      }
    }
  } else {
    console.log('❌ Unknown page state');
    console.log('Page contains:', pageText?.substring(0, 200));
  }
});