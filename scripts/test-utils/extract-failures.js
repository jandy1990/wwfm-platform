#!/usr/bin/env node
/**
 * Test Failure Extraction System
 *
 * Automatically extracts and formats test failures into a readable report.
 * Designed to always be under 100KB for full Claude readability.
 *
 * Usage:
 *   node scripts/test-utils/extract-failures.js
 *   npm run test:failures
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  inputPath: 'test-results/latest.json',
  outputPath: 'test-results/failures-summary.md',
  maxOutputSize: 100 * 1024, // 100KB
  maxDiagnosticLines: 20,
  maxStackLines: 30,
  maxErrorMessageLength: 2000
};

// ANSI color code stripper
function stripAnsi(str) {
  return str.replace(/\u001b\[[0-9;]*m/g, '');
}

// Truncate string with ellipsis
function truncate(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

// Extract important error patterns from stdout (generic, not specific to field mismatches)
function extractErrorPatterns(stdout) {
  if (!stdout) return null;

  const lines = stdout.split('\n');
  const patterns = [];

  // Look for common error indicators
  const errorIndicators = [
    '❌',           // Error emoji
    'Error:',       // Explicit errors
    'Failed',       // Failure messages
    'expected',     // Assertion failures
    'Missing',      // Missing data
    'Mismatch',     // Data mismatches
    'Timeout',      // Timeout errors
    'not found',    // Not found errors
  ];

  for (const line of lines) {
    const cleanLine = stripAnsi(line);

    // Check if line contains any error indicator
    if (errorIndicators.some(indicator => cleanLine.includes(indicator))) {
      patterns.push(cleanLine);
    }
  }

  return patterns.length > 0 ? patterns : null;
}

// Extract last N lines of diagnostic output
function extractDiagnostics(stdout, maxLines = CONFIG.maxDiagnosticLines) {
  if (!stdout) return null;

  const lines = stripAnsi(stdout).split('\n').filter(line => line.trim());

  if (lines.length === 0) return null;

  // Take last N lines
  const diagnosticLines = lines.slice(-maxLines);

  // Remove common noise
  const filtered = diagnosticLines.filter(line =>
    !line.includes('npx playwright') &&
    !line.includes('Running') &&
    line.trim().length > 0
  );

  return filtered.length > 0 ? filtered : null;
}

// Extract clean stack trace
function extractStack(error) {
  if (!error || !error.stack) return null;

  const lines = stripAnsi(error.stack).split('\n');
  const relevantLines = lines
    .slice(0, CONFIG.maxStackLines)
    .filter(line => {
      const trimmed = line.trim();
      // Keep error lines and project file references
      return trimmed && (
        trimmed.startsWith('at ') ||
        trimmed.startsWith('Error:') ||
        trimmed.includes('/tests/')
      );
    });

  return relevantLines.length > 0 ? relevantLines : null;
}

// Process a single test failure
function processFailure(result, test, spec) {
  const failure = {
    name: spec.title,  // spec has the test name
    location: `${spec.file}:${spec.line}`,
    duration: `${(result.duration / 1000).toFixed(2)}s`,
    status: result.status || 'unknown',
    retry: result.retry || 0,
    error: null,
    errorPatterns: null,
    diagnostics: null,
    stack: null
  };

  // Extract error message
  if (result.error?.message) {
    failure.error = truncate(stripAnsi(result.error.message), CONFIG.maxErrorMessageLength);
  }

  // Extract error patterns from stdout (generic)
  const stdoutText = result.stdout?.map(s => s.text).join('') || '';
  failure.errorPatterns = extractErrorPatterns(stdoutText);

  // Extract diagnostics
  failure.diagnostics = extractDiagnostics(stdoutText);

  // Extract stack trace
  failure.stack = extractStack(result.error);

  return failure;
}

// Format failure as Markdown
function formatFailure(failure, index, total) {
  const sections = [];

  // Header
  sections.push(`### ${index + 1}/${total}: ${failure.name}`);
  sections.push('');
  sections.push(`**Location:** \`${failure.location}\``);
  sections.push(`**Duration:** ${failure.duration}`);
  sections.push(`**Status:** ${failure.status}${failure.retry > 0 ? ` (retry ${failure.retry})` : ''}`);
  sections.push('');

  // Error message (most important)
  if (failure.error) {
    sections.push('**Error Message:**');
    sections.push('```');
    sections.push(failure.error);
    sections.push('```');
    sections.push('');
  }

  // Error patterns from stdout (critical debugging info)
  if (failure.errorPatterns && failure.errorPatterns.length > 0) {
    sections.push('**Error Patterns in Output:**');
    sections.push('```');
    // Limit to most relevant patterns (first 15)
    const displayPatterns = failure.errorPatterns.slice(0, 15);
    sections.push(displayPatterns.join('\n'));
    if (failure.errorPatterns.length > 15) {
      sections.push(`\n... and ${failure.errorPatterns.length - 15} more error lines`);
    }
    sections.push('```');
    sections.push('');
  }

  // Diagnostics (last N lines for context)
  if (failure.diagnostics && failure.diagnostics.length > 0) {
    sections.push('<details>');
    sections.push('<summary>Last 20 Lines of Output</summary>');
    sections.push('');
    sections.push('```');
    sections.push(failure.diagnostics.join('\n'));
    sections.push('```');
    sections.push('</details>');
    sections.push('');
  }

  // Stack trace
  if (failure.stack && failure.stack.length > 0) {
    sections.push('<details>');
    sections.push('<summary>Stack Trace</summary>');
    sections.push('');
    sections.push('```');
    sections.push(failure.stack.join('\n'));
    sections.push('```');
    sections.push('</details>');
    sections.push('');
  }

  sections.push('---');
  sections.push('');

  return sections.join('\n');
}

// Generate summary statistics
function generateSummary(results) {
  // Use Playwright's built-in stats (more reliable)
  const playwrightStats = results.stats || {};

  return {
    total: (playwrightStats.expected || 0) + (playwrightStats.unexpected || 0) + (playwrightStats.skipped || 0),
    passed: playwrightStats.expected || 0,
    failed: playwrightStats.unexpected || 0,  // Playwright calls failures "unexpected"
    skipped: playwrightStats.skipped || 0,
    flaky: playwrightStats.flaky || 0,
    duration: playwrightStats.duration || 0
  };
}

// Main extraction logic
function extractFailures() {
  console.log('🔍 Extracting test failures...\n');

  // Check if input file exists
  if (!fs.existsSync(CONFIG.inputPath)) {
    console.error(`❌ Error: ${CONFIG.inputPath} not found`);
    console.error('   Run tests first: npm run test:e2e');
    process.exit(1);
  }

  // Read and parse JSON
  let results;
  try {
    const data = fs.readFileSync(CONFIG.inputPath, 'utf8');
    results = JSON.parse(data);
  } catch (error) {
    console.error(`❌ Error reading ${CONFIG.inputPath}:`, error.message);
    process.exit(1);
  }

  // Generate summary statistics
  const stats = generateSummary(results);

  // Check if there are any failures
  if (stats.failed === 0) {
    const successReport = [
      '# Test Results: All Passing ✅',
      '',
      `**Generated:** ${new Date().toISOString()}`,
      '',
      '## Summary',
      '',
      `- **Total Tests:** ${stats.total}`,
      `- **Passed:** ${stats.passed} ✅`,
      `- **Failed:** ${stats.failed}`,
      `- **Skipped:** ${stats.skipped}`,
      `- **Duration:** ${(stats.duration / 1000).toFixed(2)}s`,
      '',
      '---',
      '',
      '**No failures to report!** All tests passed successfully.',
      ''
    ].join('\n');

    fs.writeFileSync(CONFIG.outputPath, successReport);
    console.log('✅ All tests passed! No failures to extract.');
    console.log(`📄 Summary written to: ${CONFIG.outputPath}\n`);
    return;
  }

  // Collect all failures
  const failures = [];

  // Recursively traverse suite tree
  function traverseSuites(suites) {
    if (!suites || !Array.isArray(suites)) return;

    suites.forEach(suite => {
      // Process nested suites first
      if (suite.suites) {
        traverseSuites(suite.suites);
      }

      // Process specs in this suite
      if (suite.specs && Array.isArray(suite.specs)) {
        suite.specs.forEach(spec => {
          // Only process failed specs
          if (spec.ok === false && spec.tests) {
            spec.tests.forEach(test => {
              if (!test.results) return;

              // Collect all non-passing results
              test.results.forEach(result => {
                if (result && result.status !== 'passed' && result.status !== 'skipped') {
                  failures.push(processFailure(result, test, spec));
                }
              });
            });
          }
        });
      }
    });
  }

  // Start traversal
  if (results.suites) {
    traverseSuites(results.suites);
  }

  // Build Markdown report
  const report = [];

  // Header
  report.push('# Test Failure Report 🔴');
  report.push('');
  report.push(`**Generated:** ${new Date().toISOString()}`);
  report.push(`**Source:** \`${CONFIG.inputPath}\``);
  report.push('');

  // Summary
  report.push('## Summary');
  report.push('');
  report.push(`- **Total Tests:** ${stats.total}`);
  report.push(`- **Passed:** ${stats.passed} ✅`);
  report.push(`- **Failed:** ${stats.failed} ❌`);
  report.push(`- **Skipped:** ${stats.skipped} ⏭️`);
  report.push(`- **Duration:** ${(stats.duration / 1000).toFixed(2)}s`);
  report.push('');

  // Quick navigation
  report.push('## Failed Tests');
  report.push('');
  failures.forEach((failure, index) => {
    report.push(`${index + 1}. [${failure.name}](#${index + 1}${failures.length}-${failure.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})`);
  });
  report.push('');
  report.push('---');
  report.push('');

  // Detailed failures
  report.push('## Detailed Failures');
  report.push('');

  failures.forEach((failure, index) => {
    const section = formatFailure(failure, index, failures.length);
    report.push(section);
  });

  // Footer
  report.push('---');
  report.push('');
  report.push('**How to use this report:**');
  report.push('1. Read the Summary to understand overall test health');
  report.push('2. Check Error Message for the assertion that failed');
  report.push('3. Review Error Patterns for critical lines from test output');
  report.push('4. Expand "Last 20 Lines of Output" for full context');
  report.push('5. Expand Stack Trace if you need exact file/line numbers');
  report.push('');
  report.push('**Pro tip:** Search for specific patterns using Ctrl+F (e.g., "Missing", "expected", "❌")');
  report.push('');

  const markdown = report.join('\n');

  // Check size
  const sizeKB = Buffer.byteLength(markdown, 'utf8') / 1024;

  if (sizeKB > CONFIG.maxOutputSize / 1024) {
    console.warn(`⚠️  Warning: Report is ${sizeKB.toFixed(2)}KB (target: ${CONFIG.maxOutputSize / 1024}KB)`);
    console.warn('   Consider reducing maxDiagnosticLines or maxStackLines in config');
  }

  // Write output
  fs.writeFileSync(CONFIG.outputPath, markdown);

  // Success message
  console.log(`✅ Extracted ${failures.length} failure(s)`);
  console.log(`📄 Report written to: ${CONFIG.outputPath}`);
  console.log(`📊 Size: ${sizeKB.toFixed(2)}KB / ${CONFIG.maxOutputSize / 1024}KB`);
  console.log('');
  console.log('📖 Read the full report:');
  console.log(`   cat ${CONFIG.outputPath}`);
  console.log('');
}

// Run if called directly
if (require.main === module) {
  extractFailures();
}

module.exports = { extractFailures };
