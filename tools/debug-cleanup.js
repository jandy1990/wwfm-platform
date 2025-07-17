#!/usr/bin/env node

// Cleanup script for debug sessions
const { cleanupOldSessions } = require('./debug-page');

// Parse command line arguments
const args = process.argv.slice(2);
let keepLast = 3;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg.startsWith('--keep-last=')) {
    keepLast = parseInt(arg.split('=')[1]) || 3;
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
🗑️  Debug Cleanup Tool
${'═'.repeat(50)}

Usage: node tools/debug-cleanup.js [options]

Options:
  --keep-last=N    Keep the last N debug sessions (default: 3)
  --help, -h       Show this help message

Examples:
  node tools/debug-cleanup.js
  node tools/debug-cleanup.js --keep-last=5
`);
    process.exit(0);
  }
}

console.log(`
🗑️  Cleaning up debug sessions
${'═'.repeat(50)}
Keeping last ${keepLast} sessions
`);

cleanupOldSessions(keepLast)
  .then(() => console.log('\n✅ Cleanup complete!\n'))
  .catch(error => console.error('\n❌ Cleanup failed:', error.message));