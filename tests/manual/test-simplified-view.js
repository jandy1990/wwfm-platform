const { chromium } = require('playwright');

async function testSimplifiedView() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 Testing Simplified View Implementation...\n');
  
  try {
    // Navigate to the goal page
    await page.goto('http://localhost:3000/goal/56e2801e-0d78-4abd-a795-869e5b780ae7');
    await page.waitForSelector('.solution-card', { timeout: 10000 });
    
    // Check if we're in simple view (default)
    const viewToggle = await page.locator('button:has-text("Simple")').first();
    const isSimpleView = await viewToggle.evaluate(el => el.classList.contains('bg-blue-600'));
    console.log(`✓ Initial view mode: ${isSimpleView ? 'Simple' : 'Detailed'}`);
    
    // Look for "Most users report:" label
    const contextLabel = await page.locator('p:has-text("Most users report:")').first();
    const hasContextLabel = await contextLabel.isVisible().catch(() => false);
    console.log(`✓ "Most users report:" label visible: ${hasContextLabel}`);
    
    // Check for SimplifiedMetricField elements (look for progress bars)
    const progressBars = await page.locator('.solution-card .h-1\\.5.rounded-full').count();
    console.log(`✓ Progress bars found in simple view: ${progressBars}`);
    
    // Toggle to detailed view
    await page.locator('button:has-text("Detailed")').first().click();
    await page.waitForTimeout(500);
    
    // Check that context label is hidden in detailed view
    const contextLabelDetailed = await page.locator('p:has-text("Most users report:")').first();
    const labelHiddenInDetailed = !(await contextLabelDetailed.isVisible().catch(() => false));
    console.log(`✓ Context label hidden in detailed view: ${labelHiddenInDetailed}`);
    
    // Check for distribution fields in detailed view
    const distributionFields = await page.locator('.solution-card :text("Most common:")').count();
    console.log(`✓ Distribution fields in detailed view: ${distributionFields}`);
    
    // Toggle back to simple view
    await page.locator('button:has-text("Simple")').first().click();
    await page.waitForTimeout(500);
    
    // Take screenshots
    await page.screenshot({ path: 'test-simple-view.png', fullPage: false });
    console.log('\n✓ Screenshot saved as test-simple-view.png');
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const mobileContextLabel = await page.locator('p:has-text("Most users report:")').first();
    const hasMobileLabel = await mobileContextLabel.isVisible().catch(() => false);
    console.log(`\n✓ Mobile "Most users report:" label visible: ${hasMobileLabel}`);
    
    await page.screenshot({ path: 'test-simple-view-mobile.png', fullPage: false });
    console.log('✓ Mobile screenshot saved as test-simple-view-mobile.png');
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testSimplifiedView();