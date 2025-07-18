// Quick verification script for Chunk 1 changes
const { chromium } = require('playwright');

async function verifyChunk1() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 Verifying Chunk 1 Implementation...\n');
  
  await page.goto('http://localhost:3003/goal/56e2801e-0d78-4abd-a795-869e5b780ae7');
  await page.waitForLoadState('networkidle');
  
  // Wait for solution cards
  await page.waitForSelector('article', { timeout: 5000 });
  
  // Analyze the first solution card
  const cardAnalysis = await page.evaluate(() => {
    const card = document.querySelector('article');
    if (!card) return null;
    
    const content = card.innerText;
    const lines = content.split('\n').filter(l => l.trim());
    
    // Check for key elements
    const analysis = {
      title: lines[0] || 'No title',
      hasMostCommon: content.includes('Most common:'),
      percentages: content.match(/\d+%/g) || [],
      hasMoreIndicator: content.includes('+ ') && content.includes('more'),
      arrayHeaderMatch: content.match(/\(top \d+ of \d+\)/),
      
      // Count field labels
      fieldLabels: ['COST', 'TIME TO RESULTS', 'FREQUENCY', 'DOSAGE', 'FORMAT', 'LOCATION']
        .filter(label => content.toUpperCase().includes(label)),
      
      // First few lines for inspection
      firstLines: lines.slice(0, 15)
    };
    
    return analysis;
  });
  
  console.log('📊 Card Analysis Results:\n');
  console.log('Title:', cardAnalysis.title);
  console.log('Has "Most common:" labels:', cardAnalysis.hasMostCommon ? '✅' : '❌');
  console.log('Number of percentages found:', cardAnalysis.percentages.length);
  console.log('Sample percentages:', cardAnalysis.percentages.slice(0, 5));
  console.log('Has "+ X more" indicator:', cardAnalysis.hasMoreIndicator ? '✅' : '❌');
  console.log('Has array count format:', cardAnalysis.arrayHeaderMatch ? '✅' : '❌');
  console.log('Number of visible fields:', cardAnalysis.fieldLabels.length);
  console.log('Visible fields:', cardAnalysis.fieldLabels);
  
  console.log('\n📝 Card Content Preview:');
  cardAnalysis.firstLines.forEach(line => console.log('  ', line));
  
  // Take a screenshot
  await page.screenshot({ path: 'chunk1-verification.png', fullPage: true });
  console.log('\n📸 Screenshot saved as chunk1-verification.png');
  
  console.log('\n✅ Verification complete! Check the screenshot and output above.');
  
  // Keep browser open
  console.log('\n👀 Browser left open for manual inspection.');
}

verifyChunk1().catch(console.error);
