// Universal debugging tool for WWFM - works on any page
const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function debugPage(url = 'http://localhost:3001', options = {}) {
  // Set default options
  options = {
    cleanup: true,
    keepLast: 3,
    openReport: true,
    summary: false,
    headless: true,
    ...options
  };

  const browser = await chromium.launch({ 
    headless: options.headless,
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
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      type: request.resourceType(),
      time: new Date().toISOString()
    });
  });
  
  page.on('response', response => {
    const req = networkRequests.find(r => r.url === response.url());
    if (req) {
      req.status = response.status();
      req.statusText = response.statusText();
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
    const startTime = Date.now();
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    const loadTime = Date.now() - startTime;
    
    // Wait a bit for any dynamic content
    await page.waitForTimeout(2000);
    
    // Get page data
    const pageData = await page.evaluate(() => {
      // Basic page info
      const title = document.title;
      const url = window.location.href;
      const pathname = window.location.pathname;
      
      // Meta tags
      const metaTags = {};
      document.querySelectorAll('meta').forEach(meta => {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (name && content) {
          metaTags[name] = content;
        }
      });
      
      // Check for key elements
      const hasNavigation = !!document.querySelector('nav, [role="navigation"]');
      const hasHeader = !!document.querySelector('header, [role="banner"]');
      const hasFooter = !!document.querySelector('footer, [role="contentinfo"]');
      const hasMain = !!document.querySelector('main, [role="main"]');
      
      // Forms
      const forms = Array.from(document.querySelectorAll('form')).map(form => ({
        action: form.action,
        method: form.method,
        fields: Array.from(form.querySelectorAll('input, textarea, select')).map(field => ({
          type: field.type || field.tagName.toLowerCase(),
          name: field.name,
          id: field.id,
          required: field.required
        }))
      }));
      
      // Links
      const links = Array.from(document.querySelectorAll('a[href]')).map(link => ({
        text: link.textContent.trim(),
        href: link.href,
        isExternal: !link.href.startsWith(window.location.origin)
      }));
      
      // Images
      const images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.width,
        height: img.height
      }));
      
      // Buttons
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]'))
        .map(btn => btn.textContent?.trim() || btn.value || 'Unnamed button');
      
      // Headings structure
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        level: parseInt(h.tagName[1]),
        text: h.textContent.trim()
      }));
      
      // Lists
      const lists = {
        ordered: document.querySelectorAll('ol').length,
        unordered: document.querySelectorAll('ul').length,
        definition: document.querySelectorAll('dl').length
      };
      
      // Tables
      const tables = Array.from(document.querySelectorAll('table')).map(table => ({
        rows: table.rows.length,
        columns: table.rows[0]?.cells.length || 0,
        hasHeader: !!table.querySelector('thead')
      }));
      
      // Check accessibility
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])').length;
      const buttonsWithoutText = Array.from(document.querySelectorAll('button')).filter(btn => !btn.textContent.trim()).length;
      const inputsWithoutLabels = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"])')).filter(input => {
        const id = input.id;
        return !id || !document.querySelector(`label[for="${id}"]`);
      }).length;
      
      // Performance metrics
      const performance = {
        domNodes: document.getElementsByTagName('*').length,
        images: document.images.length,
        scripts: document.scripts.length,
        stylesheets: document.styleSheets.length
      };
      
      return {
        title,
        url,
        pathname,
        meta: metaTags,
        structure: {
          hasNavigation,
          hasHeader,
          hasFooter,
          hasMain
        },
        forms,
        links: links.slice(0, 50), // Limit to first 50 links
        images: images.slice(0, 20), // Limit to first 20 images
        buttons: buttons.slice(0, 30), // Limit to first 30 buttons
        headings,
        lists,
        tables,
        accessibility: {
          imagesWithoutAlt,
          buttonsWithoutText,
          inputsWithoutLabels
        },
        performance
      };
    });
    
    // Create timestamped output directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
    const outputDir = options.outputDir || `debug-output/${timestamp}`;
    await fs.mkdir(outputDir, { recursive: true });
    
    // Save screenshots (skip in summary mode)
    if (!options.summary) {
      // Full page screenshot
      await page.screenshot({ 
        path: `${outputDir}/full-page.png`,
        fullPage: true 
      });
      
      // Viewport screenshot
      await page.screenshot({ 
        path: `${outputDir}/viewport.png`
      });
      
      // Mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.screenshot({ 
        path: `${outputDir}/mobile-view.png`
      });
    }
    
    // Create comprehensive debug report
    const debugReport = {
      url,
      timestamp: new Date().toISOString(),
      loadTime: `${loadTime}ms`,
      pageData,
      consoleLogs: consoleLogs.slice(-50), // Last 50 logs
      networkRequests: networkRequests.filter(r => !r.url.includes('_next/static')).slice(-50),
      errors: pageErrors,
      failedRequests: networkRequests.filter(r => r.status >= 400),
      viewport: await page.viewportSize()
    };
    
    // Save JSON report
    await fs.writeFile(
      `${outputDir}/report.json`,
      JSON.stringify(debugReport, null, 2)
    );
    
    // Create HTML report
    const { failedRequests } = debugReport;
    const htmlReport = `
<!DOCTYPE html>
<html>
<head>
  <title>Debug Report - ${pageData.title}</title>
  <style>
    body { font-family: system-ui; margin: 20px; line-height: 1.6; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    img { max-width: 100%; border: 1px solid #ccc; }
    pre { background: #f5f5f5; padding: 15px; overflow: auto; border-radius: 5px; }
    .error { color: #d32f2f; background: #ffebee; padding: 10px; border-radius: 5px; }
    .warning { color: #f57c00; background: #fff3e0; padding: 10px; border-radius: 5px; }
    .success { color: #388e3c; background: #e8f5e9; padding: 10px; border-radius: 5px; }
    .log-entry { margin: 5px 0; padding: 5px 10px; background: #f9f9f9; border-left: 3px solid #ccc; }
    .log-entry.error { border-color: #d32f2f; }
    .log-entry.warn { border-color: #f57c00; }
    details { margin: 10px 0; }
    summary { cursor: pointer; font-weight: bold; padding: 10px; background: #e0e0e0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
  </style>
</head>
<body>
  <h1>Debug Report: ${pageData.title}</h1>
  <p><strong>URL:</strong> <a href="${url}">${url}</a></p>
  <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  <p><strong>Load Time:</strong> ${loadTime}ms</p>
  
  <div class="grid">
    <div class="${loadTime < 1000 ? 'success' : loadTime < 3000 ? 'warning' : 'error'}">
      Load Time: ${loadTime}ms
    </div>
    <div class="${pageErrors.length === 0 ? 'success' : 'error'}">
      Page Errors: ${pageErrors.length}
    </div>
  </div>
  
  ${!options.summary ? `
  <h2>Screenshots</h2>
  <div class="grid">
    <div>
      <h3>Desktop View</h3>
      <img src="viewport.png" />
    </div>
    <div>
      <h3>Mobile View</h3>
      <img src="mobile-view.png" />
    </div>
  </div>
  ` : ''}
  
  <details>
    <summary>Page Structure</summary>
    <pre>${JSON.stringify(pageData.headings, null, 2)}</pre>
  </details>
  
  <details>
    <summary>Performance Metrics</summary>
    <pre>${JSON.stringify(pageData.performance, null, 2)}</pre>
  </details>
  
  <details>
    <summary>Forms (${pageData.forms.length})</summary>
    <pre>${JSON.stringify(pageData.forms, null, 2)}</pre>
  </details>
  
  <details>
    <summary>Accessibility Issues</summary>
    <pre>${JSON.stringify(pageData.accessibility, null, 2)}</pre>
  </details>
  
  <details open>
    <summary>Console Logs (${consoleLogs.length})</summary>
    ${consoleLogs.slice(-20).map(log => `
      <div class="log-entry ${log.type}">
        <strong>${log.time.split('T')[1].split('.')[0]}</strong> [${log.type}] ${log.text}
      </div>
    `).join('')}
  </details>
  
  ${failedRequests.length > 0 ? `
    <details open>
      <summary class="error">Failed Requests (${failedRequests.length})</summary>
      <table>
        <tr><th>Status</th><th>URL</th><th>Type</th></tr>
        ${failedRequests.map(req => `
          <tr>
            <td>${req.status}</td>
            <td>${req.url.substring(0, 80)}...</td>
            <td>${req.type}</td>
          </tr>
        `).join('')}
      </table>
    </details>
  ` : ''}
  
  ${pageErrors.length > 0 ? `
    <details open>
      <summary class="error">Page Errors (${pageErrors.length})</summary>
      ${pageErrors.map(error => `
        <div class="error">
          <strong>${error.message}</strong>
          <pre>${error.stack || 'No stack trace'}</pre>
        </div>
      `).join('')}
    </details>
  ` : ''}
</body>
</html>
    `;
    
    await fs.writeFile(`${outputDir}/report.html`, htmlReport);
    
    console.log('\n📊 Debug Report Generated:');
    console.log(`📁 Output directory: ${outputDir}`);
    console.log('📁 Files created:');
    console.log(`   - ${outputDir}/report.html (open in browser)`);
    console.log(`   - ${outputDir}/report.json (raw data)`);
    if (!options.summary) {
      console.log(`   - ${outputDir}/full-page.png`);
      console.log(`   - ${outputDir}/viewport.png`);
      console.log(`   - ${outputDir}/mobile-view.png`);
    }
    
    console.log('\n📈 Quick Summary:');
    console.log(`   - Page Title: ${pageData.title}`);
    console.log(`   - Load Time: ${loadTime}ms`);
    console.log(`   - DOM Nodes: ${pageData.performance.domNodes}`);
    console.log(`   - Console Logs: ${consoleLogs.length}`);
    console.log(`   - Network Requests: ${networkRequests.length}`);
    console.log(`   - Failed Requests: ${debugReport.failedRequests.length}`);
    console.log(`   - Page Errors: ${pageErrors.length}`);
    
    if (pageData.accessibility.imagesWithoutAlt > 0 || 
        pageData.accessibility.buttonsWithoutText > 0 || 
        pageData.accessibility.inputsWithoutLabels > 0) {
      console.log('\n⚠️  Accessibility Issues Found:');
      if (pageData.accessibility.imagesWithoutAlt > 0) {
        console.log(`   - ${pageData.accessibility.imagesWithoutAlt} images without alt text`);
      }
      if (pageData.accessibility.buttonsWithoutText > 0) {
        console.log(`   - ${pageData.accessibility.buttonsWithoutText} buttons without text`);
      }
      if (pageData.accessibility.inputsWithoutLabels > 0) {
        console.log(`   - ${pageData.accessibility.inputsWithoutLabels} inputs without labels`);
      }
    }
    
    console.log('\n✅ Debug session complete!\n');
    
    // Auto-open report if requested
    if (options.openReport && !options.summary) {
      const { exec } = require('child_process');
      const openCommand = process.platform === 'darwin' ? 'open' : 
                         process.platform === 'win32' ? 'start' : 'xdg-open';
      exec(`${openCommand} ${outputDir}/report.html`);
    }
    
    // Cleanup old sessions if requested
    if (options.cleanup) {
      await cleanupOldSessions(options.keepLast);
    }
    
    return outputDir;
    
  } catch (error) {
    console.error('Error during debug session:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Cleanup function
async function cleanupOldSessions(keepLast = 3) {
  try {
    const debugDir = 'debug-output';
    const entries = await fs.readdir(debugDir, { withFileTypes: true });
    
    // Get all timestamped directories
    const sessions = entries
      .filter(entry => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}T/.test(entry.name))
      .map(entry => ({
        name: entry.name,
        path: path.join(debugDir, entry.name)
      }))
      .sort((a, b) => b.name.localeCompare(a.name)); // Sort newest first
    
    // Remove old sessions
    if (sessions.length > keepLast) {
      const toRemove = sessions.slice(keepLast);
      for (const session of toRemove) {
        await fs.rm(session.path, { recursive: true, force: true });
        console.log(`🗑️  Removed old session: ${session.name}`);
      }
    }
  } catch (error) {
    console.warn('Could not cleanup old sessions:', error.message);
  }
}

// Compare two debug sessions
async function compareSessions(session1, session2) {
  try {
    const data1 = JSON.parse(await fs.readFile(`debug-output/${session1}/report.json`, 'utf8'));
    const data2 = JSON.parse(await fs.readFile(`debug-output/${session2}/report.json`, 'utf8'));
    
    console.log('\n📊 Comparison Report:');
    console.log('━'.repeat(50));
    
    // Compare load times
    const loadTime1 = parseInt(data1.loadTime);
    const loadTime2 = parseInt(data2.loadTime);
    const loadTimeDiff = loadTime2 - loadTime1;
    console.log(`\n⏱️  Load Time:`);
    console.log(`   Session 1: ${data1.loadTime}`);
    console.log(`   Session 2: ${data2.loadTime}`);
    console.log(`   Difference: ${loadTimeDiff > 0 ? '+' : ''}${loadTimeDiff}ms ${loadTimeDiff > 0 ? '🔴' : '🟢'}`);
    
    // Compare DOM nodes
    const nodes1 = data1.pageData.performance.domNodes;
    const nodes2 = data2.pageData.performance.domNodes;
    const nodesDiff = nodes2 - nodes1;
    console.log(`\n🌲 DOM Nodes:`);
    console.log(`   Session 1: ${nodes1}`);
    console.log(`   Session 2: ${nodes2}`);
    console.log(`   Difference: ${nodesDiff > 0 ? '+' : ''}${nodesDiff} ${Math.abs(nodesDiff) > 100 ? '⚠️' : '✅'}`);
    
    // Compare errors
    console.log(`\n❌ Errors:`);
    console.log(`   Session 1: ${data1.errors.length}`);
    console.log(`   Session 2: ${data2.errors.length}`);
    
    // Compare console logs
    const errors1 = data1.consoleLogs.filter(log => log.type === 'error').length;
    const errors2 = data2.consoleLogs.filter(log => log.type === 'error').length;
    console.log(`\n📝 Console Errors:`);
    console.log(`   Session 1: ${errors1}`);
    console.log(`   Session 2: ${errors2}`);
    
    console.log('\n' + '━'.repeat(50));
  } catch (error) {
    console.error('Error comparing sessions:', error.message);
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  let url = 'http://localhost:3001';
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      if (key === 'compare') {
        options.compare = true;
        options.session1 = args[++i];
        options.session2 = args[++i];
      } else if (key === 'summary') {
        options.summary = true;
      } else if (key === 'no-cleanup') {
        options.cleanup = false;
      } else if (key === 'no-open') {
        options.openReport = false;
      } else if (key === 'keep-last') {
        options.keepLast = parseInt(value) || 3;
      } else if (key === 'headless') {
        options.headless = value !== 'false';
      }
    } else if (arg.startsWith('http')) {
      url = arg;
    }
  }
  
  return { url, options };
}

// Run the debug tool
if (require.main === module) {
  const { url, options } = parseArgs();
  
  if (options.compare) {
    compareSessions(options.session1, options.session2).catch(console.error);
  } else {
    console.log(`
🔍 Debug Page Tool
${'═'.repeat(50)}
URL: ${url}
Options: ${JSON.stringify(options, null, 2)}
`);
    debugPage(url, options).catch(console.error);
  }
}

module.exports = { debugPage, cleanupOldSessions, compareSessions };