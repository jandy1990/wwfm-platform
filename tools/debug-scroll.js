// Tool to capture screenshots at different scroll positions
const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function captureScrolledScreenshots(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewportSize({ width: 1280, height: 720 });
  
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Create output directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = `debug-output/scroll-${timestamp}`;
  await fs.mkdir(outputDir, { recursive: true });
  
  // Capture at different scroll positions
  const scrollPositions = [0, 500, 1000, 1500, 2000, 2500];
  
  for (let i = 0; i < scrollPositions.length; i++) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), scrollPositions[i]);
    await page.waitForTimeout(500); // Wait for any animations
    
    await page.screenshot({
      path: path.join(outputDir, `scroll-${scrollPositions[i]}px.png`),
      fullPage: false
    });
  }
  
  // Also capture with hover state
  await page.evaluate(() => window.scrollTo(0, 500));
  const cards = await page.$$('.solution-card, [class*="solution"], [class*="card"]');
  if (cards.length > 0) {
    await cards[0].hover();
    await page.waitForTimeout(300); // Wait for hover animation
    await page.screenshot({
      path: path.join(outputDir, 'with-hover.png'),
      fullPage: false
    });
  }
  
  // Mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  await page.screenshot({
    path: path.join(outputDir, 'mobile-top.png'),
    fullPage: false
  });
  
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outputDir, 'mobile-scrolled.png'),
    fullPage: false
  });
  
  await browser.close();
  
  console.log(`Screenshots saved to ${outputDir}`);
}

// Run the tool
const url = process.argv[2] || 'http://localhost:3001/goal/56e2801e-0d78-4abd-a795-869e5b780ae7';
captureScrolledScreenshots(url).catch(console.error);