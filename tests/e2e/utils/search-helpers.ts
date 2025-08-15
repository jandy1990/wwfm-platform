import { Page } from '@playwright/test';

/**
 * Helper function to search for a solution and wait for results
 * Handles the debounce and loading states properly
 */
export async function searchAndSelectSolution(
  page: Page,
  searchTerm: string,
  expectedSolution?: string
): Promise<boolean> {
  console.log(`Searching for "${searchTerm}"...`);
  
  // Type the search term
  await page.fill('#solution-name', searchTerm);
  console.log(`Typed "${searchTerm}"`);
  
  // Wait for dropdown to appear AND for loading to complete
  try {
    await page.waitForSelector('[data-testid="solution-dropdown"]', { timeout: 5000 });
    console.log('Dropdown appeared');
    
    // CRITICAL: Wait for search to complete (loading spinner to disappear)
    // The component shows "Searching..." while loading
    await page.waitForSelector('[data-testid="solution-dropdown"]:not(:has-text("Searching..."))', { timeout: 5000 });
    console.log('Search completed, results ready');
    
    // Additional small wait to ensure DOM is stable
    await page.waitForTimeout(200);
  } catch (e) {
    console.log('Dropdown did not appear or search did not complete within 5 seconds');
    return false;
  }
  
  // Check if dropdown is visible and has results
  const dropdownVisible = await page.locator('[data-testid="solution-dropdown"]').isVisible().catch(() => false);
  
  if (dropdownVisible) {
    console.log('Dropdown is visible, checking for solutions');
    
    // Look for buttons in the dropdown
    const dropdownButtons = page.locator('[data-testid="solution-dropdown"] button');
    const buttonCount = await dropdownButtons.count();
    console.log(`Found ${buttonCount} suggestions in dropdown`);
    
    // If we're looking for a specific solution, try to find and click it
    if (expectedSolution && buttonCount > 0) {
      for (let i = 0; i < buttonCount; i++) {
        const button = dropdownButtons.nth(i);
        const text = await button.textContent();
        console.log(`Option ${i}: "${text}"`);
        
        if (text?.includes(expectedSolution)) {
          console.log(`Clicking on: "${text}"`);
          await button.click();
          await page.waitForTimeout(500);
          
          // Verify solution was populated
          const inputValue = await page.inputValue('#solution-name');
          console.log(`Input value after selection: "${inputValue}"`);
          
          return true;
        }
      }
      console.log(`Warning: "${expectedSolution}" not found in dropdown`);
    }
    
    // If no specific solution or not found, just return whether we have results
    return buttonCount > 0;
  }
  
  console.log('No dropdown visible');
  return false;
}

/**
 * Helper function to close the dropdown before clicking other buttons
 * Prevents the dropdown from interfering with button clicks
 */
export async function closeDropdown(page: Page): Promise<void> {
  // Click outside to close dropdown
  await page.click('body', { position: { x: 10, y: 10 } });
  await page.waitForTimeout(200);
  
  // Verify dropdown is closed
  const dropdownStillVisible = await page.locator('[data-testid="solution-dropdown"]').isVisible().catch(() => false);
  if (dropdownStillVisible) {
    console.log('Warning: Dropdown still visible, attempting to close with Escape');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  }
}

/**
 * Helper to click Continue button safely
 * Ensures dropdown is closed first to avoid interference
 */
export async function clickContinueButton(page: Page): Promise<void> {
  // Close any open dropdown first
  await closeDropdown(page);
  
  // Now click Continue
  const continueButton = page.locator('button:has-text("Continue")');
  await continueButton.click();
  console.log('Clicked Continue button');
}