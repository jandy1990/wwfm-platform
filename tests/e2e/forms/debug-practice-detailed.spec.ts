import { test, expect } from '@playwright/test';
import { fillPracticeForm } from './form-specific-fillers';

test('Debug PracticeForm submission in detail', async ({ page }) => {
  console.log('=== Starting detailed PracticeForm debug ===');
  
  // Enable console monitoring
  page.on('console', msg => {
    if (msg.type() === 'log' || msg.type() === 'error') {
      console.log(`BROWSER ${msg.type().toUpperCase()}: ${msg.text()}`);
    }
  });
  
  // Navigate to add solution page
  await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution');
  
  // Wait for page to load
  await page.waitForSelector('#solution-name', { timeout: 10000 });
  console.log('Page loaded');
  
  // Type the test solution
  await page.fill('#solution-name', 'Running (Test)');
  console.log('Typed solution name: Running (Test)');
  
  // Wait and close dropdown
  await page.waitForTimeout(2000);
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
    
    // Click the category - updated to match correct category structure
    await page.click('button:has-text("Practice")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Exercise/Movement")');
    console.log('Selected category manually');
    
    // Wait for form to load
    await page.waitForTimeout(2000);
  }
  
  // Check if form loaded
  const formContent = await page.textContent('body');
  if (formContent?.includes('How well it worked')) {
    console.log('✅ Form loaded successfully');
    
    // Fill the form
    try {
      await fillPracticeForm(page, 'exercise_movement');
      console.log('✅ Form filled and submitted');
      
      // Monitor for navigation or success screen
      console.log('Waiting for response after submission...');
      
      // Try multiple times to check the state
      for (let i = 0; i < 10; i++) {
        await page.waitForTimeout(1000);
        
        const currentUrl = page.url();
        console.log(`After ${i+1}s - URL: ${currentUrl}`);
        
        const content = await page.textContent('body');
        
        // Check for various outcomes
        if (content?.includes('Thank you')) {
          console.log('✅ SUCCESS! "Thank you" found');
          const context = content.match(/.{0,100}Thank you.{0,100}/)?.[0];
          console.log('Context:', context);
          break;
        } else if (content?.includes('error')) {
          console.log('❌ ERROR found');
          const errorContext = content.match(/.{0,100}[Ee]rror.{0,100}/)?.[0];
          console.log('Error context:', errorContext);
          break;
        } else if (content?.includes('404')) {
          console.log('❌ 404 ERROR - Page not found');
          break;
        } else if (content?.includes('What else did you try')) {
          console.log('📍 Still on Step 3 - Failed solutions');
        } else {
          // Try to identify what page we're on
          const heading = await page.locator('h1').first().textContent().catch(() => null);
          const title = await page.title();
          console.log(`Current page - Title: "${title}", H1: "${heading}"`);
        }
      }
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'practice-form-after-submit.png' });
      console.log('Screenshot saved as practice-form-after-submit.png');
      
    } catch (error) {
      console.log('❌ Error during form filling/submission:', error);
    }
  } else {
    console.log('❌ Form did not load');
  }
  
  console.log('=== Test complete ===');
});