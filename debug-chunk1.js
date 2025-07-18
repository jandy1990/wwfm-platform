// Debug script to capture solution cards after Chunk 1 changes
const { debugPage } = require('./tools/debug-page.js');

// Use the goal ID from the recent debug session
const goalUrl = 'http://localhost:3001/goal/56e2801e-0d78-4abd-a795-869e5b780ae7';

(async () => {
  console.log('🔍 Debugging Goal Page After Chunk 1 Changes');
  console.log('=' . repeat(50));
  console.log(`URL: ${goalUrl}`);
  
  try {
    const outputDir = await debugPage(goalUrl, {
      cleanup: false,
      openReport: true,
      summary: false
    });
    
    console.log('\n✅ Debug complete!');
    console.log(`📁 Check the screenshots in: ${outputDir}`);
    console.log('\nLook for:');
    console.log('- Only 2 required fields showing (cost, time_to_results)');
    console.log('- "Most common:" labels');
    console.log('- Vertical stacking of prevalence values');
    console.log('- Array field headers with counts');
    console.log('- Percentages on array pills');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
