#!/usr/bin/env node

/**
 * Pre-flight check before running tests
 * Validates everything is ready
 */

const path = require('path');
const fs = require('fs');

console.log('🔍 WWFM Test Pre-flight Check');
console.log('==============================\n');

let issues = [];

// 1. Check .env.test.local exists
const envPath = path.join(__dirname, '..', '.env.test.local');
if (fs.existsSync(envPath)) {
  console.log('✅ Test environment file exists');
  
  // Load and check variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasServiceKey = envContent.includes('SUPABASE_SERVICE_KEY=eyJ');
  const hasTestGoal = envContent.includes('TEST_GOAL_ID=');
  
  if (!hasServiceKey) {
    issues.push('Service key appears to be placeholder');
  }
  if (!hasTestGoal) {
    issues.push('TEST_GOAL_ID not configured');
  }
} else {
  console.log('❌ Missing .env.test.local');
  issues.push('Copy .env.test.local.example to .env.test.local');
}

// 2. Check if Playwright is installed
const playwrightPath = path.join(__dirname, '..', 'node_modules', '@playwright', 'test');
if (fs.existsSync(playwrightPath)) {
  console.log('✅ Playwright is installed');
} else {
  console.log('❌ Playwright not installed');
  issues.push('Run: npm install');
}

// 3. Check if test files exist
const testDir = path.join(__dirname, '..', 'tests', 'e2e', 'forms');
if (fs.existsSync(testDir)) {
  const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.spec.ts'));
  console.log(`✅ Found ${testFiles.length} test files`);
  
  // List them
  console.log('   Test files:');
  testFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
} else {
  console.log('❌ Test directory not found');
  issues.push('Test files missing');
}

// 4. Check form implementations exist
const formsDir = path.join(__dirname, '..', 'components', 'organisms', 'solutions', 'forms');
if (fs.existsSync(formsDir)) {
  const formFiles = fs.readdirSync(formsDir).filter(f => f.endsWith('Form.tsx'));
  console.log(`✅ Found ${formFiles.length} form implementations`);
} else {
  console.log('❌ Forms directory not found');
  issues.push('Form components missing');
}

// 5. Check package.json scripts
const packageJson = require('../../package.json');
const hasTestScripts = packageJson.scripts && packageJson.scripts['test:forms'];
if (hasTestScripts) {
  console.log('✅ Test scripts configured in package.json');
} else {
  console.log('❌ Test scripts not found in package.json');
  issues.push('Test scripts not configured');
}

// Summary
console.log('\n==============================');
if (issues.length === 0) {
  console.log('✅ All checks passed!\n');
  console.log('Next steps:');
  console.log('  1. Make sure dev server is running: npm run dev');
  console.log('  2. Run tests: npm run test:forms');
  console.log('  3. Or run with UI: npm run test:forms:ui');
} else {
  console.log('❌ Issues found:\n');
  issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
  console.log('\nFix these issues before running tests.');
}

console.log('\n📝 Test Information:');
console.log('  Test user: test@wwfm-platform.com');
console.log('  Test goal ID: 91d4a950-bb87-4570-b32d-cf4f4a4bb20d');
console.log('  Expected dev server: http://localhost:3000');

process.exit(issues.length > 0 ? 1 : 0);
