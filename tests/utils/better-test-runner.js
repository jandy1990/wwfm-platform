#!/usr/bin/env node

/**
 * Better Test Runner - Captures clean, structured test output
 * 
 * This script runs Playwright tests and captures output in a more readable format
 * without ANSI escape codes and with better structure.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const testFile = args[0] || 'tests/e2e/forms';
const outputFile = args[1] || 'test-output-clean.txt';

// Strip ANSI escape codes
function stripAnsi(str) {
  // Remove all ANSI escape sequences
  return str.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');
}

// Format timestamp
function timestamp() {
  return new Date().toISOString().split('T')[1].split('.')[0];
}

// Create output streams
const outputPath = path.join(process.cwd(), outputFile);
const outputStream = fs.createWriteStream(outputPath);
const jsonPath = outputPath.replace('.txt', '.json');
const jsonResults = {
  startTime: new Date().toISOString(),
  tests: [],
  summary: {},
  errors: [],
  warnings: []
};

console.log(`🧪 Running tests: ${testFile}`);
console.log(`📝 Output will be saved to: ${outputPath}`);
console.log(`📊 JSON results will be saved to: ${jsonPath}`);
console.log('');

// Write header
outputStream.write(`WWFM Test Output - ${new Date().toISOString()}\n`);
outputStream.write(`${'='.repeat(80)}\n\n`);

// Spawn playwright test process
const testProcess = spawn('npx', [
  'playwright',
  'test',
  testFile,
  '--reporter=list',
  '--project=chromium'
], {
  env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
  shell: true
});

let currentTest = null;
let testCount = 0;
let passCount = 0;
let failCount = 0;
let currentOutput = [];

// Process stdout
testProcess.stdout.on('data', (data) => {
  const lines = stripAnsi(data.toString()).split('\n');
  
  lines.forEach(line => {
    const cleaned = line.trim();
    if (!cleaned) return;
    
    // Write to file
    outputStream.write(`[${timestamp()}] ${cleaned}\n`);
    
    // Parse test status
    if (cleaned.includes('[chromium] ›')) {
      // New test starting
      if (currentTest) {
        // Save previous test
        jsonResults.tests.push({
          name: currentTest,
          status: 'completed',
          output: currentOutput
        });
      }
      currentTest = cleaned.split('›')[1]?.trim();
      currentOutput = [];
      testCount++;
      console.log(`\n📋 Test ${testCount}: ${currentTest}`);
    } else if (cleaned.includes('✓')) {
      passCount++;
      console.log(`  ✅ PASSED`);
      if (currentTest) {
        jsonResults.tests.push({
          name: currentTest,
          status: 'passed',
          output: currentOutput
        });
        currentTest = null;
      }
    } else if (cleaned.includes('✕') || cleaned.includes('failed')) {
      failCount++;
      console.log(`  ❌ FAILED`);
      if (currentTest) {
        jsonResults.tests.push({
          name: currentTest,
          status: 'failed',
          output: currentOutput
        });
        currentTest = null;
      }
    } else if (cleaned.includes('Error:') || cleaned.includes('error:')) {
      console.log(`  ⚠️ Error: ${cleaned}`);
      jsonResults.errors.push({
        test: currentTest,
        message: cleaned
      });
    } else if (cleaned.includes('Warning:') || cleaned.includes('warning:')) {
      jsonResults.warnings.push({
        test: currentTest,
        message: cleaned
      });
    }
    
    // Collect output for current test
    if (currentTest) {
      currentOutput.push(cleaned);
    }
    
    // Special markers to track
    if (cleaned.includes('Solution not found')) {
      console.log(`  🔍 Issue: Solution not found in dropdown`);
    } else if (cleaned.includes('already rated')) {
      console.log(`  🔄 Issue: Solution already rated`);
    } else if (cleaned.includes('RLS policy')) {
      console.log(`  🔒 Issue: RLS policy violation`);
    } else if (cleaned.includes('timeout')) {
      console.log(`  ⏱️ Issue: Test timeout`);
    }
  });
});

// Process stderr
testProcess.stderr.on('data', (data) => {
  const cleaned = stripAnsi(data.toString()).trim();
  if (cleaned) {
    outputStream.write(`[${timestamp()}] [ERROR] ${cleaned}\n`);
    console.error(`  🔴 ${cleaned}`);
    jsonResults.errors.push({
      test: currentTest,
      message: cleaned,
      type: 'stderr'
    });
  }
});

// Process exit
testProcess.on('close', (code) => {
  // Save final test if any
  if (currentTest) {
    jsonResults.tests.push({
      name: currentTest,
      status: 'incomplete',
      output: currentOutput
    });
  }
  
  // Summary
  const summary = {
    total: testCount,
    passed: passCount,
    failed: failCount,
    incomplete: testCount - passCount - failCount,
    exitCode: code
  };
  
  jsonResults.summary = summary;
  jsonResults.endTime = new Date().toISOString();
  
  // Write summary to text file
  outputStream.write(`\n${'='.repeat(80)}\n`);
  outputStream.write('TEST SUMMARY\n');
  outputStream.write(`${'='.repeat(80)}\n`);
  outputStream.write(`Total Tests: ${summary.total}\n`);
  outputStream.write(`Passed: ${summary.passed}\n`);
  outputStream.write(`Failed: ${summary.failed}\n`);
  outputStream.write(`Incomplete: ${summary.incomplete}\n`);
  outputStream.write(`Exit Code: ${code}\n`);
  outputStream.write(`\nCommon Issues Found:\n`);
  
  // Analyze common issues
  const issues = {
    'Solution not found': 0,
    'Already rated': 0,
    'RLS policy': 0,
    'Timeout': 0
  };
  
  jsonResults.tests.forEach(test => {
    test.output?.forEach(line => {
      if (line.includes('Solution not found')) issues['Solution not found']++;
      if (line.includes('already rated')) issues['Already rated']++;
      if (line.includes('RLS policy')) issues['RLS policy']++;
      if (line.includes('timeout')) issues['Timeout']++;
    });
  });
  
  Object.entries(issues).forEach(([issue, count]) => {
    if (count > 0) {
      outputStream.write(`  - ${issue}: ${count} occurrences\n`);
    }
  });
  
  outputStream.end();
  
  // Write JSON results
  fs.writeFileSync(jsonPath, JSON.stringify(jsonResults, null, 2));
  
  // Console summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${summary.passed}/${summary.total}`);
  console.log(`❌ Failed: ${summary.failed}/${summary.total}`);
  if (summary.incomplete > 0) {
    console.log(`⚠️ Incomplete: ${summary.incomplete}/${summary.total}`);
  }
  console.log('');
  console.log(`📄 Clean output saved to: ${outputPath}`);
  console.log(`📊 JSON results saved to: ${jsonPath}`);
  
  if (code !== 0) {
    console.log(`\n⚠️ Tests exited with code ${code}`);
    process.exit(code);
  }
});

// Handle process interruption
process.on('SIGINT', () => {
  console.log('\n\n🛑 Test run interrupted');
  testProcess.kill();
  process.exit(1);
});