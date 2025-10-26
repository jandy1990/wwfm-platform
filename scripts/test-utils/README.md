# Test Utilities

This directory contains scripts that make test debugging and analysis easier.

## 📊 Extract Failures Script

**File:** `extract-failures.js`

**Purpose:** Automatically extracts test failures from Playwright JSON output into a readable, Claude-friendly Markdown report.

### Features

- ✅ Processes 455KB JSON into < 100KB Markdown
- ✅ Extracts only failure information (no noise)
- ✅ Prioritizes field mismatches (most actionable)
- ✅ Includes diagnostics and stack traces
- ✅ Detects when all tests pass
- ✅ Consistent format every time

### Usage

```bash
# Extract failures from last test run
npm run test:failures

# Run tests + extract failures (integrated)
npm run test:debug
npm run test:critical:debug

# Direct execution
node scripts/test-utils/extract-failures.js
```

### Output

**Location:** `test-results/failures-summary.md`

**Format:**
- Summary statistics
- Quick navigation links
- Detailed failure sections:
  - Test name and location
  - Error message
  - Field mismatches (highlighted)
  - Diagnostic output (last 20 lines)
  - Stack trace (collapsed)

**Size:** Always under 100KB (readable by Claude in one go)

### Configuration

Edit the `CONFIG` object in `extract-failures.js`:

```javascript
const CONFIG = {
  inputPath: 'test-results/latest.json',
  outputPath: 'test-results/failures-summary.md',
  maxOutputSize: 100 * 1024,        // 100KB limit
  maxDiagnosticLines: 20,           // Last N lines of output
  maxStackLines: 30,                // Stack trace depth
  maxErrorMessageLength: 2000       // Truncate long errors
};
```

### Error Handling

**If input file doesn't exist:**
```
❌ Error: test-results/latest.json not found
   Run tests first: npm run test:e2e
```

**If no failures:**
```
✅ All tests passed! No failures to extract.
📄 Summary written to: test-results/failures-summary.md
```

**If report is too large:**
```
⚠️  Warning: Report is 125.34KB (target: 100KB)
   Consider reducing maxDiagnosticLines or maxStackLines in config
```

### How It Works

1. **Reads** `test-results/latest.json` (Playwright output)
2. **Filters** to only failed tests
3. **Extracts** for each failure:
   - Error message (cleaned of ANSI codes)
   - Field mismatches (parsed from stdout)
   - Last 20 lines of diagnostic output
   - Stack trace (filtered to relevant lines)
4. **Formats** as structured Markdown
5. **Writes** to `test-results/failures-summary.md`

### Field Mismatch Detection

The script intelligently parses test output for field mismatches:

```javascript
// Detects patterns like:
Field Mismatch: meeting_frequency
Expected: Weekly
Actual:   weekly
```

These are extracted and highlighted in the report for easy debugging.

### Integration with CI

```yaml
# GitHub Actions example
- name: Run tests
  run: npm run test:critical

- name: Extract failures
  if: failure()
  run: npm run test:failures

- name: Upload failure report
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: test-failures
    path: test-results/failures-summary.md
```

## 📚 Related Documentation

- **Main guide:** `/docs/testing/DEBUGGING-TEST-FAILURES.md`
- **Quick reference:** `/docs/testing/QUICK-REFERENCE-TEST-DEBUGGING.md`
- **Example output:** `/docs/testing/EXAMPLE-FAILURE-REPORT.md`
- **Test setup:** `/tests/README.md`

## 🎯 Design Principles

1. **Always readable by Claude** - Under 100KB, complete context
2. **Information hierarchy** - Most actionable info first
3. **Consistent format** - Same structure every time
4. **Zero guesswork** - Complete error context included
5. **Automated** - One command, no manual parsing

## 🔄 Future Enhancements

Potential improvements:
- [ ] Add filtering by test file or suite
- [ ] Support multiple output formats (JSON, HTML)
- [ ] Integration with test retry logic
- [ ] Automated issue detection patterns
- [ ] Comparison with previous test runs

## 🤝 Contributing

When modifying the extraction script:

1. **Maintain size target** - Keep output under 100KB
2. **Test with failures** - Ensure it handles various error types
3. **Update docs** - Keep DEBUGGING-TEST-FAILURES.md in sync
4. **Preserve format** - Don't break existing report structure
5. **Consider Claude** - Will Claude be able to read and use the output?

## ⚙️ Technical Details

**Language:** Node.js (CommonJS)
**Dependencies:** None (uses only Node.js built-ins)
**Input:** Playwright JSON reporter output
**Output:** Structured Markdown
**Execution:** Can be run standalone or via npm scripts

**Key Functions:**
- `extractFailures()` - Main orchestration
- `processFailure()` - Process single test failure
- `extractFieldMismatches()` - Parse stdout for field issues
- `extractDiagnostics()` - Get last N lines of output
- `formatFailure()` - Convert to Markdown
- `stripAnsi()` - Clean color codes

## 🐛 Troubleshooting

**Script won't run:**
```bash
# Make executable
chmod +x scripts/test-utils/extract-failures.js

# Or use node directly
node scripts/test-utils/extract-failures.js
```

**No failures extracted but tests failed:**
- Check that tests are logging field mismatches correctly
- Verify test output format matches extraction patterns
- Run with `--reporter=json` flag

**Report is too large:**
- Reduce `maxDiagnosticLines` in config
- Reduce `maxStackLines` in config
- Consider truncating error messages more aggressively

---

**Remember:** This tool is designed to make Claude's debugging experience effortless. If you modify it, test with Claude!
