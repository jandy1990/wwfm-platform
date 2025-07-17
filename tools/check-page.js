// Enhanced debugging tool for WWFM
const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function checkPage(url = 'http://localhost:3001/goal/4b721437-85db-4ca5-8a4c-e1a54affad85', options = {}) {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: options.devtools || false 
  });
  
  const page = await browser.newPage();
  
  // Capture console logs
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      time: new Date().toISOString()
    });
  });
  
  // Capture network requests
  const networkRequests = [];
  page.on('request', request => {
    if (request.url().includes('supabase') || request.url().includes('api')) {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        type: request.resourceType()
      });
    }
  });
  
  // Capture errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack
    });
  });
  
  try {
    // Navigate with performance timing
    const startTime = Date.now();
    await page.goto(url, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    // Extract comprehensive page data
    const pageData = await page.evaluate(() => {
      // Get all React component data attributes
      const getReactProps = (element) => {
        const props = {};
        for (let key in element) {
          if (key.startsWith('__reactProps')) {
            return element[key];
          }
        }
        return props;
      };
      
      // Find solution cards and extract data
      const solutionCards = document.querySelectorAll('[class*="solution"], [class*="Solution"]');
      const solutions = Array.from(solutionCards).map(card => {
        const titleEl = card.querySelector('h3, h4, [class*="title"]');
        const ratingEl = card.querySelector('[class*="rating"], [class*="Rating"]');
        const effectivenessEl = card.querySelector('[class*="effectiveness"]');
        
        return {
          title: titleEl?.textContent?.trim() || 'Unknown',
          rating: ratingEl?.textContent?.trim() || 'No rating',
          effectiveness: effectivenessEl?.textContent?.trim() || 'No effectiveness',
          classes: card.className,
          hasVariants: card.textContent.includes('variant') || card.textContent.includes('option')
        };
      });
      
      // Get page stats
      const stats = {
        title: document.querySelector('h1')?.textContent?.trim() || 'No title',
        totalSolutions: document.querySelector('[class*="solution-count"], [class*="stats"]')?.textContent || 'Unknown',
        viewMode: document.querySelector('[class*="view-toggle"]')?.textContent || 'Unknown'
      };
      
      // Check for common issues
      const issues = [];
      
      // Check for React errors
      const errorBoundary = document.querySelector('[class*="error"], .error-boundary');
      if (errorBoundary) issues.push('Error boundary triggered');
      
      // Check for loading states stuck
      const loadingElements = document.querySelectorAll('[class*="loading"], [class*="skeleton"]');
      if (loadingElements.length > 0) issues.push(`${loadingElements.length} loading elements still visible`);
      
      // Check for missing data
      if (solutions.length === 0) issues.push('No solutions found on page');
      
      // Get all data attributes (often used for debugging)
      const dataAttributes = {};
      document.querySelectorAll('[data-*]').forEach(el => {
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('data-')) {
            dataAttributes[attr.name] = attr.value;
          }
        });
      });
      
      return {
        stats,
        solutionCount: solutions.length,
        solutions: solutions.slice(0, 5),
        issues,
        dataAttributes: Object.keys(dataAttributes).slice(0, 10), // First 10
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    });
    
    // Take multiple screenshots
    await page.screenshot({ 
      path: 'screenshots/full-page.png',
      fullPage: true 
    });
    
    // Take viewport screenshot
    await page.screenshot({ 
      path: 'screenshots/viewport.png'
    });
    
    // Take specific element screenshots if they exist
    const goalHeader = await page.$('h1');
    if (goalHeader) {
      await goalHeader.screenshot({ path: 'screenshots/goal-header.png' });
    }
    
    const firstSolution = await page.$('[class*="solution"], [class*="Solution"]');
    if (firstSolution) {
      await firstSolution.screenshot({ path: 'screenshots/first-solution.png' });
    }
    
    // Get computed styles for debugging
    const styles = await page.evaluate(() => {
      const element = document.querySelector('[class*="solution"], [class*="Solution"]');
      if (!element) return null;
      
      const computed = window.getComputedStyle(element);
      return {
        display: computed.display,
        visibility: computed.visibility,
        opacity: computed.opacity,
        transform: computed.transform,
        zIndex: computed.zIndex
      };
    });
    
    // Create debug report
    const debugReport = {
      url,
      timestamp: new Date().toISOString(),
      loadTime: `${loadTime}ms`,
      pageData,
      styles,
      consoleLogs: consoleLogs.slice(-20), // Last 20 logs
      networkRequests: networkRequests.slice(-20), // Last 20 requests
      errors: pageErrors,
      viewport: await page.viewportSize()
    };
    
    // Save debug report
    await fs.mkdir('screenshots', { recursive: true });
    await fs.writeFile(
      'screenshots/debug-report.json',
      JSON.stringify(debugReport, null, 2)
    );
    
    // Create an HTML report with everything
    const htmlReport = `
<!DOCTYPE html>
<html>
<head>
  <title>WWFM Debug Report - ${new Date().toLocaleString()}</title>
  <style>
    body { font-family: system-ui; margin: 20px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    img { max-width: 100%; border: 1px solid #ccc; }
    pre { background: #f5f5f5; padding: 10px; overflow: auto; }
    .error { color: red; }
    .warning { color: orange; }
    .log-entry { margin: 5px 0; padding: 5px; background: #f9f9f9; }
  </style>
</head>
<body>
  <h1>WWFM Debug Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <p>URL: <a href="${url}">${url}</a></p>
  <p>Load Time: ${loadTime}ms</p>
  
  <h2>Page State</h2>
  <pre>${JSON.stringify(pageData, null, 2)}</pre>
  
  <h2>Screenshots</h2>
  <div class="grid">
    <div>
      <h3>Viewport</h3>
      <img src="viewport.png" />
    </div>
    <div>
      <h3>First Solution</h3>
      <img src="first-solution.png" />
    </div>
  </div>
  
  <h2>Console Logs</h2>
  ${consoleLogs.map(log => `
    <div class="log-entry ${log.type}">
      <strong>${log.type}</strong>: ${log.text}
    </div>
  `).join('')}
  
  <h2>Network Requests</h2>
  <pre>${JSON.stringify(networkRequests, null, 2)}</pre>
  
  ${pageErrors.length > 0 ? `
    <h2 class="error">Page Errors</h2>
    <pre class="error">${JSON.stringify(pageErrors, null, 2)}</pre>
  ` : ''}
</body>
</html>
    `;
    
    await fs.writeFile('screenshots/debug-report.html', htmlReport);
    
    console.log('📊 Debug Report Generated:');
    console.log('- Full page screenshot: screenshots/full-page.png');
    console.log('- Debug report: screenshots/debug-report.html');
    console.log('- JSON data: screenshots/debug-report.json');
    console.log('\n📈 Quick Stats:');
    console.log(`- Solutions found: ${pageData.solutionCount}`);
    console.log(`- Load time: ${loadTime}ms`);
    console.log(`- Console logs: ${consoleLogs.length}`);
    console.log(`- Network requests: ${networkRequests.length}`);
    if (pageData.issues.length > 0) {
      console.log(`\n⚠️  Issues detected:`);
      pageData.issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    return debugReport;
    
  } finally {
    if (!options.keepOpen) {
      await browser.close();
    }
  }
}

// Additional utility functions
async function comparePages(url1, url2) {
  console.log('📊 Comparing pages...');
  const [before, after] = await Promise.all([
    checkPage(url1, { keepOpen: false }),
    checkPage(url2, { keepOpen: false })
  ]);
  
  const comparison = {
    solutionCountDiff: after.pageData.solutionCount - before.pageData.solutionCount,
    loadTimeDiff: parseInt(after.loadTime) - parseInt(before.loadTime),
    newErrors: after.errors.filter(e => !before.errors.find(be => be.message === e.message))
  };
  
  console.log('\n📈 Comparison Results:');
  console.log(`Solution count: ${before.pageData.solutionCount} → ${after.pageData.solutionCount} (${comparison.solutionCountDiff > 0 ? '+' : ''}${comparison.solutionCountDiff})`);
  console.log(`Load time: ${before.loadTime} → ${after.loadTime} (${comparison.loadTimeDiff > 0 ? '+' : ''}${comparison.loadTimeDiff}ms)`);
  
  return comparison;
}

// Run it
if (require.main === module) {
  const args = process.argv.slice(2);
  const url = args[0] || 'http://localhost:3001/goal/4b721437-85db-4ca5-8a4c-e1a54affad85';
  const command = args[1];
  
  if (command === 'compare' && args[2]) {
    comparePages(url, args[2]).catch(console.error);
  } else {
    checkPage(url, { devtools: args.includes('--devtools') }).catch(console.error);
  }
}

module.exports = { checkPage, comparePages };
