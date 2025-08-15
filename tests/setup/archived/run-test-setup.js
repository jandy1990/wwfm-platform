#!/usr/bin/env node

/**
 * Complete Test Setup Script
 * Run this before running any E2E tests to ensure everything is ready
 */

require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 WWFM Complete Test Setup\n');

// Step-by-step setup with clear progress indicators
const steps = [
  {
    name: 'Check test user exists',
    command: 'node tests/setup/check-test-user.js',
    description: 'Verifying test@wwfm-platform.com user exists...',
    optional: false
  },
  {
    name: 'Clean up old test ratings',
    command: 'node tests/setup/cleanup-test-ratings.js',
    description: 'Cleaning up any previous test ratings to avoid conflicts...',
    optional: true // Won't fail if service key is not available
  },
  {
    name: 'Setup test fixtures',
    command: 'node tests/setup/setup-test-fixtures.js',
    description: 'Creating and linking all 23 test fixtures...',
    optional: false
  },
  {
    name: 'Verify test fixtures',
    command: 'node tests/setup/verify-test-fixtures.js',
    description: 'Verifying all test fixtures are properly configured...',
    optional: false
  }
];

let failedSteps = [];

// Run each step
for (const step of steps) {
  console.log(`\n📋 ${step.description}`);
  
  try {
    execSync(step.command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log(`✅ ${step.name} completed`);
  } catch (error) {
    if (step.optional) {
      console.log(`⚠️  ${step.name} failed (optional step, continuing...)`);
    } else {
      console.error(`❌ ${step.name} failed`);
      failedSteps.push(step.name);
    }
  }
}

console.log('\n' + '='.repeat(50));

if (failedSteps.length > 0) {
  console.log('\n❌ Setup completed with errors:');
  failedSteps.forEach(step => console.log(`   - ${step}`));
  console.log('\nPlease fix these issues before running tests.');
  process.exit(1);
} else {
  console.log('\n✅ Test setup complete! You can now run tests with:');
  console.log('   npm run test:forms');
  console.log('\n📝 Other useful commands:');
  console.log('   npm run test:forms:ui       # Interactive UI mode');
  console.log('   npm run test:forms:headed   # See browser while testing');
  console.log('   npm run test:forms:debug    # Debug mode');
  console.log('   npm run test:forms:report   # View HTML report');
}