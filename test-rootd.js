const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  
  console.log('Testing Rootd alignment with explicit grid columns...');
  await page.goto('http://localhost:3000/goal/56e2801e-0d78-4abd-a795-869e5b780ae7', {
    waitUntil: 'networkidle',
    timeout: 30000
  });
  
  await page.waitForSelector('.solution-card', { timeout: 10000 });
  
  // Switch to detailed view
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const detailedBtn = buttons.find(btn => btn.textContent.includes('Detailed'));
    if (detailedBtn) detailedBtn.click();
  });
  await page.waitForTimeout(1000);
  
  // Find and capture Rootd card
  const cardHandle = await page.evaluateHandle(() => {
    const cards = Array.from(document.querySelectorAll('.solution-card'));
    return cards.find(card => {
      const titleElement = card.querySelector('h3');
      return titleElement && titleElement.textContent.includes('Rootd');
    });
  });
  
  const element = cardHandle.asElement();
  if (element) {
    await element.screenshot({ 
      path: 'debug-output/rootd-with-explicit-columns.png',
      type: 'png'
    });
    console.log('✓ Captured Rootd with explicit grid columns');
  }
  
  await browser.close();
})();