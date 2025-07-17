// Tool to capture screenshots in detailed view
const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function captureDetailedView(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Click the "Detailed" toggle button
  const detailedButton = await page.$('button:has-text("Detailed")');
  if (detailedButton) {
    await detailedButton.click();
    await page.waitForTimeout(1000); // Wait for transition
  }
  
  // Create output directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = `debug-output/detailed-${timestamp}`;
  await fs.mkdir(outputDir, { recursive: true });
  
  // Capture detailed view at different positions
  await page.screenshot({
    path: path.join(outputDir, 'detailed-top.png'),
    fullPage: false
  });
  
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outputDir, 'detailed-scrolled.png'),
    fullPage: false
  });
  
  // Check hover in detailed view
  const cards = await page.$$('.solution-card, [class*="solution"], [class*="card"]');
  if (cards.length > 1) {
    await cards[1].hover();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(outputDir, 'detailed-hover.png'),
      fullPage: false
    });
  }
  
  await browser.close();
  console.log(`Screenshots saved to ${outputDir}`);
}

// Run the tool
const url = process.argv[2] || 'http://localhost:3001/goal/56e2801e-0d78-4abd-a795-869e5b780ae7';
captureDetailedView(url).catch(console.error);