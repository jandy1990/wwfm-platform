# Test Utilities

This directory contains utilities to make test output easier to read and analyze.

## 🔄 Automatic Output Capture (Built-In)

All tests now automatically save complete JSON output to `test-results/latest.json` via Playwright's multi-reporter configuration. This provides:
- **Zero configuration needed** - Works immediately for all test commands
- **Works for ALL test commands** - `npm test`, `npm run test:forms`, individual test files
- **Complete output** - No truncation, all test data included
- **Instant access for debugging** - Just read the JSON file after any test run

### Recommended Workflow

**For quick debugging:**
```bash
npm run test:forms  # Run tests
cat test-results/latest.json  # Or open in editor - complete output available
```

**For clean text reports:**
```bash
npm run test:better  # Strips ANSI codes, creates clean .txt file
```

**For full analysis pipeline:**
```bash
npm run test:capture  # Run tests + analyze + generate recommendations
```

### How It Relates to Existing Tools

The automatic capture and the existing `better-test-runner.js` serve complementary purposes:

| Feature | Automatic Capture | better-test-runner.js |
|---------|------------------|---------------------|
| **Setup** | None - built into Playwright config | Manual npm command |
| **Format** | JSON | Clean text + JSON |
| **ANSI Codes** | Included in output | Stripped automatically |
| **Use Case** | Quick debugging, CI artifacts | Human-readable logs, analysis |
| **Analysis** | Manual inspection | Automated pattern detection |

**Use automatic capture when:**
- You need to quickly check test output after a run
- You're working in CI/CD and need artifact uploads
- You want complete machine-readable output

**Use `test:better` when:**
- You need human-readable text without ANSI codes
- You want automated issue detection and recommendations
- You're debugging complex test failures

Both outputs are valuable and serve different needs. The automatic capture ensures you never lose test output, while the better-test-runner provides enhanced analysis and clean formatting.

## 🎯 The Problem

Playwright test output can be difficult to parse because:
- ANSI escape codes clutter the output (`[1A[2K` etc.)
- Multiple output streams interleave (stdout, stderr, console)
- Long outputs get truncated
- Hard to spot patterns in failures

## 🛠️ The Solution

Two new utilities that provide clean, structured test output:

### 1. Better Test Runner (`better-test-runner.js`)

Runs tests and captures clean output without ANSI codes.

```bash
# Run with npm script
npm run test:better

# Or run directly
node tests/utils/better-test-runner.js [test-path] [output-file]

# Examples
npm run test:better                                    # Run all form tests
node tests/utils/better-test-runner.js app-form        # Run specific test
node tests/utils/better-test-runner.js . my-output.txt # Custom output file
```

**Features:**
- Strips ANSI escape codes automatically
- Captures output to both console and file
- Creates JSON summary with structured data
- Tracks common issues (timeouts, RLS errors, etc.)
- Shows progress in real-time

**Output Files:**
- `test-output-clean.txt` - Human-readable test log
- `test-output-clean.json` - Structured JSON with all test data

### 2. Test Output Analyzer (`analyze-test-output.js`)

Analyzes existing test output to find patterns and issues.

```bash
# Run with npm script on last test run
npm run test:analyze

# Or analyze any test output file
npm run test:analyze test-output.txt
node tests/utils/analyze-test-output.js any-output-file.txt
```

**Features:**
- Parses raw Playwright output
- Identifies common issues:
  - Solution not found in dropdown
  - Already rated errors
  - RLS policy violations
  - Timeouts
  - Approval issues
- Provides specific fix recommendations
- Generates summary statistics

**Output:**
- Console report with issues and recommendations
- JSON summary file (`*-summary.json`)

## 📋 Quick Commands

### Best Workflow for Debugging

```bash
# 1. Capture test output with analysis
npm run test:capture

# This runs tests, saves output, and analyzes it automatically
# You'll get both the raw output and a clean analysis
```

### Individual Commands

```bash
# Run tests with clean output
npm run test:better

# Analyze existing output
npm run test:analyze test-output.txt

# Full capture + analysis pipeline
npm run test:capture
```

## 📊 Example Output

### Better Test Runner
```
🧪 Running tests: tests/e2e/forms
📝 Output will be saved to: test-output-clean.txt
📊 JSON results will be saved to: test-output-clean.json

📋 Test 1: app-form-complete.spec.ts
  ✅ PASSED

📋 Test 2: community-form-complete.spec.ts
  ⚠️ Error: Solution not found in dropdown
  ❌ FAILED

==================================================
📊 TEST RESULTS SUMMARY
==================================================
✅ Passed: 1/2
❌ Failed: 1/2

📄 Clean output saved to: test-output-clean.txt
📊 JSON results saved to: test-output-clean.json
```

### Test Analyzer
```
📊 PLAYWRIGHT TEST ANALYSIS REPORT
============================================================

📈 SUMMARY
----------------------------------------
Total Tests: 176
✅ Passed: 150
❌ Failed: 26
📋 Pass Rate: 85.2%

⚠️ COMMON ISSUES DETECTED
----------------------------------------
🔍 Solution Not Found (12 occurrences)
  Line 234: community-form test
  💡 Fix: Ensure test fixtures exist and are approved

🔒 RLS Policy Violations (8 occurrences)
  Line 567: form-test-factory
  💡 Fix: Check if test is trying to create solutions

💡 RECOMMENDATIONS
----------------------------------------
1. Run: npm run test:db:seed to ensure fixtures exist
2. Verify fixtures are approved in database
3. Review test code for solution creation attempts
```

## 🐛 Troubleshooting

### "File not found" error
Make sure you're running from the project root, not from the tests directory.

### No output captured
Some CI environments don't support tee. Use redirection instead:
```bash
npm run test:forms > test-output.txt 2>&1
npm run test:analyze test-output.txt
```

### ANSI codes still appearing
The analyzer strips most ANSI codes, but some may slip through. The better-test-runner prevents them entirely by setting NO_COLOR=1.

## 🔄 Integration with CI

These tools work great in CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Run tests with analysis
  run: |
    npm run test:better
    npm run test:analyze test-output-clean.txt
    
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v2
  with:
    name: test-results
    path: |
      test-output-clean.txt
      test-output-clean.json
      test-output-clean-summary.json
```

## 💡 Tips

1. **For quick debugging**: Use `npm run test:capture` - it does everything
2. **For CI**: Use `npm run test:better` for clean logs
3. **For post-mortem**: Save output and use analyzer later
4. **For specific tests**: Pass test name to better-test-runner

## 🚀 Future Improvements

Potential enhancements:
- [ ] HTML report generation
- [ ] Slack/Discord notifications for failures
- [ ] Historical trend analysis
- [ ] Automatic issue creation for failures
- [ ] Integration with test management tools

---

These utilities make test output much more manageable. No more scrolling through pages of ANSI codes to find the actual error!