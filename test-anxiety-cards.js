// Script to find and screenshot anxiety goal cards
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // Navigate to browse page
    await page.goto('http://localhost:3001/browse');
    await page.waitForLoadState('networkidle');
    
    // Click on mental health or wellness arena
    const arenaLinks = await page.$$('a[href*="/arena/"]');
    console.log(`Found ${arenaLinks.length} arena links`);
    
    for (const link of arenaLinks) {
      const text = await link.textContent();
      console.log(`Arena: ${text}`);
      if (text.toLowerCase().includes('mental') || text.toLowerCase().includes('wellness')) {
        await link.click();
        await page.waitForLoadState('networkidle');
        break;
      }
    }
    
    // Look for anxiety-related goals
    const goalLinks = await page.$$('a[href*="/goal/"]');
    console.log(`Found ${goalLinks.length} goal links`);
    
    for (const link of goalLinks) {
      const text = await link.textContent();
      if (text.toLowerCase().includes('anxiety')) {
        console.log(`Found anxiety goal: ${text}`);
        const href = await link.getAttribute('href');
        console.log(`Goal URL: ${href}`);
        
        // Navigate to the goal page
        await page.goto(`http://localhost:3001${href}`);
        await page.waitForLoadState('networkidle');
        
        // Wait for solution cards to load
        await page.waitForSelector('.solution-card', { timeout: 10000 });
        
        // Get the first solution card
        const firstCard = await page.$('.solution-card');
        if (firstCard) {
          const solutionTitle = await firstCard.$eval('h3', el => el.textContent);
          console.log(`First solution: ${solutionTitle}`);
          
          // Screenshot 1: Desktop Simple View
          await firstCard.screenshot({ 
            path: 'card1-desktop-simple.png',
            type: 'png'
          });
          console.log('Captured: card1-desktop-simple.png');
          
          // Click to expand to detailed view
          await firstCard.click();
          await page.waitForTimeout(500); // Wait for animation
          
          // Screenshot 2: Desktop Detailed View
          await firstCard.screenshot({ 
            path: 'card1-desktop-detailed.png',
            type: 'png'
          });
          console.log('Captured: card1-desktop-detailed.png');
          
          // Switch to mobile viewport
          await page.setViewportSize({ width: 375, height: 667 });
          await page.waitForTimeout(500);
          
          // Screenshot 3: Mobile Simple View
          await firstCard.screenshot({ 
            path: 'card1-mobile-simple.png',
            type: 'png'
          });
          console.log('Captured: card1-mobile-simple.png');
          
          // Click to expand on mobile
          await firstCard.click();
          await page.waitForTimeout(500);
          
          // Screenshot 4: Mobile Detailed View
          await firstCard.screenshot({ 
            path: 'card1-mobile-detailed.png',
            type: 'png'
          });
          console.log('Captured: card1-mobile-detailed.png');
          
          console.log('All screenshots captured successfully!');
        }
        break;
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();