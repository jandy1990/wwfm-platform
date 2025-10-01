#!/usr/bin/env node

/**
 * WWFM Forms Test Runner
 * 
 * This script runs all form tests and provides a comprehensive report
 * Usage: node scripts/test-all-forms.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const FORMS = [
  { name: 'dosage-form', categories: 4 },
  { name: 'app-form', categories: 1 },
  { name: 'session-form', categories: 7 },
  { name: 'practice-form', categories: 3 },
  { name: 'purchase-form', categories: 2 },
  { name: 'community-form', categories: 2 },
  { name: 'lifestyle-form', categories: 2 },
  { name: 'hobby-form', categories: 1 },
  { name: 'financial-form', categories: 1 }
];

const results = {
  passed: [],
  failed: [],
  errors: []
};

console.log('🧪 WWFM Forms Validation Suite');
console.log('==============================\n');

async function runTest(formName) {
  return new Promise((resolve) => {
    console.log(`\n📋 Testing ${formName}...`);
    
    const startTime = Date.now();
    
    exec(`npm run test:forms -- ${formName}`, (error, stdout, stderr) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      if (error) {
        console.error(`❌ ${formName} failed (${duration}s)`);
        results.failed.push({
          form: formName,
          duration,
          error: error.message,
          stdout,
          stderr
        });
      } else {
        console.log(`✅ ${formName} passed (${duration}s)`);
        results.passed.push({
          form: formName,
          duration
        });
      }
      
      resolve();
    });
  });
}

async function runAllTests() {
  const startTime = Date.now();
  
  // Run tests sequentially to avoid database conflicts
  for (const form of FORMS) {
    await runTest(form.name);
  }
  
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  // Generate summary report
  console.log('\n\n📊 Test Results Summary');
  console.log('======================');
  console.log(`Total forms tested: ${FORMS.length}`);
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⏱️  Total time: ${totalDuration}s`);
  
  // Show detailed results
  if (results.failed.length > 0) {
    console.log('\n\n❌ Failed Forms:');
    results.failed.forEach(({ form, error }) => {
      console.log(`\n${form}:`);
      console.log(`  Error: ${error}`);
    });
  }
  
  // Coverage report
  console.log('\n\n📈 Coverage Report:');
  const totalCategories = FORMS.reduce((sum, form) => sum + form.categories, 0);
  const passedCategories = results.passed.reduce((sum, result) => {
    const form = FORMS.find(f => f.name === result.form);
    return sum + (form ? form.categories : 0);
  }, 0);
  
  console.log(`Categories tested: ${passedCategories}/${totalCategories} (${((passedCategories/totalCategories) * 100).toFixed(1)}%)`);
  
  // Save detailed report
  const reportPath = path.join(__dirname, '..', 'test-results', 'form-validation-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: FORMS.length,
      passed: results.passed.length,
      failed: results.failed.length,
      duration: totalDuration
    },
    results
  }, null, 2));
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  // Exit with appropriate code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run the tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
