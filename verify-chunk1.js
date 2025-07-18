// Debug script to capture solution cards after Chunk 1 completion
const { chromium } = require('playwright');
const fs = require('fs').promises;

async function captureGoalPage() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100 // Slow down for visibility
  });
  
  const page = await browser.newPage();
  
  try {
    // First, let's find a goal with solutions
    console.log('🔍 Finding a goal with solutions...');
    
    // Go to browse page
    await page.goto('http://localhost:3002/browse');
    await page.waitForLoadState('networkidle');
    
    // Look for any goal link
    const goalLinks = await page.$$('a[href*="/goals/"]');
    console.log(`Found ${goalLinks.length} goal links`);
    
    let goalUrl = null;
    
    // Try to find a goal with "anxiety" in the name as those have solutions
    for (const link of goalLinks) {
      const text = await link.textContent();
      if (text && text.toLowerCase().includes('anxiety')) {
        const href = await link.getAttribute('href');
        goalUrl = `http://localhost:3002${href}`;
        console.log(`Found anxiety goal: ${text}`);
        console.log(`URL: ${goalUrl}`);
        break;
      }
    }
    
    // If no anxiety goal, take the first available
    if (!goalUrl && goalLinks.length > 0) {
      const href = await goalLinks[0].getAttribute('href');
      goalUrl = `http://localhost:3002${href}`;
      console.log(`Using first available goal: ${goalUrl}`);
    }
    
    if (!goalUrl) {
      throw new Error('No goals found on browse page');
    }
    
    // Navigate to the goal page
    await page.goto(goalUrl);
    await page.waitForLoadState('networkidle');
    
    // Wait for solution cards
    await page.waitForSelector('[data-testid="solution-card"], .solution-card, article', { 
      timeout: 10000 
    });
    
    // Get all solution cards
    const cards = await page.$$('[data-testid="solution-card"], .solution-card, article');
    console.log(`Found ${cards.length} solution cards`);
    
    // Create output directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
    const outputDir = `debug-output/chunk1-verification-${timestamp}`;
    await fs.mkdir(outputDir, { recursive: true });
    
    // Capture full page
    await page.screenshot({ 
      path: `${outputDir}/full-page.png`,
      fullPage: true 
    });
    
    // Focus on the first few cards
    for (let i = 0; i < Math.min(3, cards.length); i++) {
      const card = cards[i];
      
      // Get card details
      const cardContent = await card.textContent();
      console.log(`\nCard ${i + 1} content preview:`, cardContent.substring(0, 200) + '...');
      
      // Screenshot desktop view
      await page.setViewportSize({ width: 1920, height: 1080 });
      await card.screenshot({ 
        path: `${outputDir}/card-${i + 1}-desktop.png` 
      });
      
      // Screenshot mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500); // Wait for responsive adjustment
      await card.screenshot({ 
        path: `${outputDir}/card-${i + 1}-mobile.png` 
      });
      
      // Look for specific elements we expect
      const hasRequiredFields = await card.evaluate(el => {
        // Check for prevalence structure
        const hasMostCommon = el.textContent.includes('Most common:');
        const hasPercentages = el.textContent.match(/\d+%/g);
        const hasMoreIndicator = el.textContent.includes('+ ') && el.textContent.includes('more');
        
        // Check for array headers with counts
        const hasArrayCounts = el.textContent.match(/\(top \d+ of \d+\)/);
        
        return {
          hasMostCommon,
          percentageCount: hasPercentages ? hasPercentages.length : 0,
          hasMoreIndicator,
          hasArrayCounts: !!hasArrayCounts
        };
      });
      
      console.log(`Card ${i + 1} validation:`, hasRequiredFields);
    }
    
    // Create HTML report
    const report = `
<!DOCTYPE html>
<html>
<head>
  <title>Chunk 1 Verification Report</title>
  <style>
    body { font-family: system-ui; margin: 20px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    img { max-width: 100%; border: 1px solid #ccc; }
    .checklist { background: #f5f5f5; padding: 15px; border-radius: 5px; }
    .check { color: green; }
    .cross { color: red; }
  </style>
</head>
<body>
  <h1>Chunk 1 Verification Report</h1>
  <p><strong>Goal URL:</strong> ${goalUrl}</p>
  <p><strong>Cards Found:</strong> ${cards.length}</p>
  <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  
  <div class="checklist">
    <h2>Requirements Checklist:</h2>
    <ul>
      <li>✓ Should show exactly 4 required fields</li>
      <li>✓ Should have "Most common:" labels</li>
      <li>✓ Should show percentages (e.g., 45%)</li>
      <li>✓ Should have "+ X more" indicators</li>
      <li>✓ Array headers should show counts (e.g., "top 3 of 12")</li>
      <li>✓ Should NOT show optional fields</li>
    </ul>
  </div>
  
  <h2>Desktop Views</h2>
  <div class="grid">
    ${Array.from({ length: Math.min(3, cards.length) }, (_, i) => `
      <div>
        <h3>Card ${i + 1}</h3>
        <img src="card-${i + 1}-desktop.png" />
      </div>
    `).join('')}
  </div>
  
  <h2>Mobile Views</h2>
  <div class="grid">
    ${Array.from({ length: Math.min(3, cards.length) }, (_, i) => `
      <div>
        <h3>Card ${i + 1}</h3>
        <img src="card-${i + 1}-mobile.png" />
      </div>
    `).join('')}
  </div>
  
  <h2>Full Page</h2>
  <img src="full-page.png" style="max-width: 100%;" />
</body>
</html>`;
    
    await fs.writeFile(`${outputDir}/report.html`, report);
    
    console.log('\n✅ Debug complete!');
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`📄 Open ${outputDir}/report.html to view results`);
    
    // Auto-open report
    const { exec } = require('child_process');
    const openCommand = process.platform === 'darwin' ? 'open' : 
                       process.platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${openCommand} ${outputDir}/report.html`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('\n👀 Browser left open for manual inspection. Close when done.');
    // await browser.close();
  }
}

// Run the capture
captureGoalPage().catch(console.error);
