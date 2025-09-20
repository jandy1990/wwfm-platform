#!/usr/bin/env node

/**
 * Comprehensive Cleanup Script for WWFM Platform
 * Removes all test artifacts, debug files, and temporary helpers
 */

const fs = require('fs');
const path = require('path');

// Define what to clean
const filesToDelete = {
  // Root level screenshots and debug files
  screenshots: [
    'ERROR.png',
    'before-product-type-screenshot.png',
    'debug-after-category.png',
    'debug-after-continue.png',
    'debug-after-dropdown.png',
    'debug-after-typing.png',
    'hobby-test-failure-screenshot.png',
    'submission-result.png',
    'test-debug-screenshot.png',
    'test-failure-screenshot.png',
    'session-test-debug-screenshot.png'
  ],
  
  // Debug scripts
  debugScripts: [
    'debug-chunk1.js',
    'test-search-debug.js',
    'test-search-debug.mjs',
    'dev-server.log'
  ],
  
  // Temporary test scripts (keeping only essential ones)
  testScripts: [
    'scripts/check-cbt-therapy.js',
    'scripts/check-link-schema.js',
    'scripts/check-search-functions.js',
    'scripts/check-searchable-test-solutions.js',
    'scripts/check-test-solution.js',
    'scripts/check-working-test-solution.js',
    'scripts/diagnose-search.js',
    'scripts/diagnose-tests.js',
    'scripts/find-dosage-test-solutions.js',
    'scripts/find-session-test-solutions.js',
    'scripts/find-test-solutions-simple.js',
    'scripts/inspect-forms.js',
    'scripts/investigate-cbt-search.js',
    'scripts/link-cbt-therapy.js',
    'scripts/link-session-test-solutions.js',
    'scripts/quick-inspect.js',
    'scripts/quick-test-check.js',
    'scripts/run-quick-form-test.js',
    'scripts/run-test-suite.js',
    'scripts/test-cleanup.js',
    // Keep: test-all-forms.js, test-connection.js, validate-database.ts, preflight-check.js
  ]
};

const dirsToClean = [
  'debug-output',
  'test-results',
  'playwright-report'
];

// Essential scripts to keep
const keepScripts = [
  'scripts/test-all-forms.js',
  'scripts/test-connection.js',
  'scripts/validate-database.ts',
  'scripts/preflight-check.js',
  'scripts/add-backup-to-forms.js',
  'scripts/add-full-backup.js',
  'scripts/update-remaining-forms.js'
];

console.log('🧹 Starting comprehensive cleanup of test artifacts...\n');

let deletedCount = 0;
let errorCount = 0;

// Delete individual files
function deleteFile(filepath) {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log(`✅ Deleted: ${filepath}`);
      deletedCount++;
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error deleting ${filepath}:`, error.message);
    errorCount++;
    return false;
  }
}

// Delete directory recursively
function deleteDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Deleted directory: ${dirPath}`);
      deletedCount++;
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error deleting directory ${dirPath}:`, error.message);
    errorCount++;
    return false;
  }
}

// 1. Clean screenshots
console.log('📸 Cleaning screenshots...');
filesToDelete.screenshots.forEach(file => {
  deleteFile(path.join(process.cwd(), file));
});

// 2. Clean debug scripts
console.log('\n🔧 Cleaning debug scripts...');
filesToDelete.debugScripts.forEach(file => {
  deleteFile(path.join(process.cwd(), file));
});

// 3. Clean test scripts (keeping essential ones)
console.log('\n📝 Cleaning temporary test scripts...');
filesToDelete.testScripts.forEach(file => {
  deleteFile(path.join(process.cwd(), file));
});

// 4. Clean directories
console.log('\n📁 Cleaning test directories...');
dirsToClean.forEach(dir => {
  deleteDirectory(path.join(process.cwd(), dir));
});

// 5. Clean .trash directory if it exists
console.log('\n🗑️ Cleaning trash directory...');
deleteDirectory(path.join(process.cwd(), '.trash'));

// 6. List remaining essential scripts
console.log('\n📋 Essential scripts preserved:');
keepScripts.forEach(script => {
  if (fs.existsSync(path.join(process.cwd(), script))) {
    console.log(`  ✓ ${script}`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('🎉 Cleanup Complete!');
console.log(`  ✅ Deleted: ${deletedCount} items`);
if (errorCount > 0) {
  console.log(`  ⚠️  Errors: ${errorCount}`);
}
console.log('='.repeat(50));

// Final check for any remaining artifacts
console.log('\n🔍 Checking for any remaining artifacts...');
const remainingPngs = fs.readdirSync(process.cwd())
  .filter(file => file.endsWith('.png') || file.endsWith('-screenshot.png'));

if (remainingPngs.length > 0) {
  console.log('\n⚠️  Found remaining images that might be artifacts:');
  remainingPngs.forEach(file => console.log(`  - ${file}`));
  console.log('\nConsider manually reviewing these files.');
} else {
  console.log('✅ No remaining test artifacts found in root directory.');
}

console.log('\n💡 Tip: Run "git status" to see all changes before committing.');
console.log('💡 You may want to add these patterns to .gitignore:');
console.log('  *.png');
console.log('  debug-*');
console.log('  test-results/');
console.log('  playwright-report/');