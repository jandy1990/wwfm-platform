#!/usr/bin/env node

/**
 * Test Output Analyzer
 * 
 * Parses Playwright test output and provides a clean summary
 */

const fs = require('fs');
const path = require('path');

// Get input file from command line or use default
const inputFile = process.argv[2] || 'test-output.txt';

if (!fs.existsSync(inputFile)) {
  console.error(`❌ File not found: ${inputFile}`);
  console.log('\nUsage: node analyze-test-output.js [test-output-file]');
  console.log('Or redirect test output: npm run test:forms 2>&1 | tee test-output.txt');
  process.exit(1);
}

// Read and clean the file
const content = fs.readFileSync(inputFile, 'utf8');

// Strip ANSI codes
function stripAnsi(str) {
  return str.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');
}

const cleanContent = stripAnsi(content);
const lines = cleanContent.split('\n');

// Parse results
const results = {
  tests: [],
  passed: [],
  failed: [],
  errors: [],
  warnings: [],
  issues: {
    solutionNotFound: [],
    alreadyRated: [],
    rlsPolicy: [],
    timeout: [],
    notApproved: []
  }
};

let currentTest = null;
let currentTestLines = [];

lines.forEach((line, index) => {
  const trimmed = line.trim();
  
  // Detect test names
  if (trimmed.includes('[chromium] ›') || trimmed.includes('› tests/e2e/')) {
    if (currentTest) {
      // Save previous test
      analyzeTest(currentTest, currentTestLines);
    }
    // Extract test name
    const parts = trimmed.split('›');
    currentTest = parts[parts.length - 1].trim();
    currentTestLines = [];
    results.tests.push(currentTest);
  }
  
  // Detect pass/fail
  if (trimmed.includes('✓') && currentTest) {
    results.passed.push(currentTest);
  } else if ((trimmed.includes('✕') || trimmed.includes('failed')) && currentTest) {
    results.failed.push(currentTest);
  }
  
  // Collect test output
  if (currentTest) {
    currentTestLines.push(trimmed);
  }
  
  // Detect specific issues
  if (trimmed.includes('Solution not found in dropdown')) {
    results.issues.solutionNotFound.push({
      test: currentTest,
      line: index + 1,
      context: trimmed
    });
  }
  
  if (trimmed.includes('already rated this solution')) {
    results.issues.alreadyRated.push({
      test: currentTest,
      line: index + 1,
      context: trimmed
    });
  }
  
  if (trimmed.includes('RLS policy') || trimmed.includes('row-level security')) {
    results.issues.rlsPolicy.push({
      test: currentTest,
      line: index + 1,
      context: trimmed
    });
  }
  
  if (trimmed.includes('timeout') || trimmed.includes('Timeout')) {
    results.issues.timeout.push({
      test: currentTest,
      line: index + 1,
      context: trimmed
    });
  }
  
  if (trimmed.includes('is_approved') || trimmed.includes('not approved')) {
    results.issues.notApproved.push({
      test: currentTest,
      line: index + 1,
      context: trimmed
    });
  }
  
  // Detect errors
  if (trimmed.includes('Error:') || trimmed.includes('error:')) {
    results.errors.push({
      test: currentTest,
      line: index + 1,
      message: trimmed
    });
  }
});

// Analyze last test if any
if (currentTest) {
  analyzeTest(currentTest, currentTestLines);
}

function analyzeTest(testName, testLines) {
  // Additional analysis per test
  // Could add more sophisticated parsing here
}

// Generate report
console.log('');
console.log('='.repeat(60));
console.log('📊 PLAYWRIGHT TEST ANALYSIS REPORT');
console.log('='.repeat(60));
console.log('');

// Summary
console.log('📈 SUMMARY');
console.log('-'.repeat(40));
console.log(`Total Tests: ${results.tests.length}`);
console.log(`✅ Passed: ${results.passed.length}`);
console.log(`❌ Failed: ${results.failed.length}`);
console.log(`📋 Pass Rate: ${((results.passed.length / results.tests.length) * 100).toFixed(1)}%`);
console.log('');

// Failed tests
if (results.failed.length > 0) {
  console.log('❌ FAILED TESTS');
  console.log('-'.repeat(40));
  results.failed.forEach(test => {
    console.log(`  • ${test}`);
  });
  console.log('');
}

// Common Issues
console.log('⚠️ COMMON ISSUES DETECTED');
console.log('-'.repeat(40));

if (results.issues.solutionNotFound.length > 0) {
  console.log(`\n🔍 Solution Not Found (${results.issues.solutionNotFound.length} occurrences)`);
  results.issues.solutionNotFound.slice(0, 3).forEach(issue => {
    console.log(`  Line ${issue.line}: ${issue.test || 'Unknown test'}`);
  });
  if (results.issues.solutionNotFound.length > 3) {
    console.log(`  ... and ${results.issues.solutionNotFound.length - 3} more`);
  }
  console.log('  💡 Fix: Ensure test fixtures exist and are approved');
}

if (results.issues.alreadyRated.length > 0) {
  console.log(`\n🔄 Already Rated (${results.issues.alreadyRated.length} occurrences)`);
  results.issues.alreadyRated.slice(0, 3).forEach(issue => {
    console.log(`  Line ${issue.line}: ${issue.test || 'Unknown test'}`);
  });
  console.log('  💡 Fix: Run test:db:seed to clear old ratings');
}

if (results.issues.rlsPolicy.length > 0) {
  console.log(`\n🔒 RLS Policy Violations (${results.issues.rlsPolicy.length} occurrences)`);
  results.issues.rlsPolicy.slice(0, 3).forEach(issue => {
    console.log(`  Line ${issue.line}: ${issue.test || 'Unknown test'}`);
  });
  console.log('  💡 Fix: Check if test is trying to create solutions instead of using fixtures');
}

if (results.issues.timeout.length > 0) {
  console.log(`\n⏱️ Timeouts (${results.issues.timeout.length} occurrences)`);
  results.issues.timeout.slice(0, 3).forEach(issue => {
    console.log(`  Line ${issue.line}: ${issue.test || 'Unknown test'}`);
  });
  console.log('  💡 Fix: Check if dev server is running, or increase timeout');
}

if (results.issues.notApproved.length > 0) {
  console.log(`\n🚫 Not Approved (${results.issues.notApproved.length} occurrences)`);
  results.issues.notApproved.slice(0, 3).forEach(issue => {
    console.log(`  Line ${issue.line}: ${issue.test || 'Unknown test'}`);
  });
  console.log('  💡 Fix: Run UPDATE solutions SET is_approved = true WHERE source_type = \'test_fixture\'');
}

// Errors
if (results.errors.length > 0) {
  console.log('\n🔴 ERRORS');
  console.log('-'.repeat(40));
  results.errors.slice(0, 5).forEach(error => {
    console.log(`  Line ${error.line}: ${error.message.substring(0, 80)}...`);
  });
  if (results.errors.length > 5) {
    console.log(`  ... and ${results.errors.length - 5} more errors`);
  }
}

// Recommendations
console.log('\n💡 RECOMMENDATIONS');
console.log('-'.repeat(40));

const recommendations = [];

if (results.issues.solutionNotFound.length > 0) {
  recommendations.push('1. Run: npm run test:db:seed to ensure fixtures exist');
  recommendations.push('2. Verify fixtures are approved in database');
}

if (results.issues.alreadyRated.length > 0) {
  recommendations.push('3. Clear test data: npm run test:cleanup');
}

if (results.issues.rlsPolicy.length > 0) {
  recommendations.push('4. Review test code for solution creation attempts');
  recommendations.push('5. Ensure tests use TEST_SOLUTIONS fixtures');
}

if (results.failed.length > results.tests.length * 0.5) {
  recommendations.push('6. Check if dev server is running: npm run dev');
  recommendations.push('7. Verify database connection and credentials');
}

if (recommendations.length === 0) {
  recommendations.push('✅ No major issues detected!');
}

recommendations.forEach(rec => console.log(rec));

// Output file info
console.log('\n📄 OUTPUT');
console.log('-'.repeat(40));
console.log(`Analyzed: ${inputFile}`);
console.log(`Total lines: ${lines.length}`);

// Save summary to JSON
const summaryFile = inputFile.replace('.txt', '-summary.json');
fs.writeFileSync(summaryFile, JSON.stringify(results, null, 2));
console.log(`Summary saved: ${summaryFile}`);

console.log('\n' + '='.repeat(60));
console.log('');
