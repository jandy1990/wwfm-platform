# Debugging Test Failures - Complete Guide

## 🎯 Quick Start: Finding Test Failures

**ALWAYS start here when debugging test failures:**

```bash
# 1. Run tests and extract failures automatically
npm run test:debug

# OR run critical tests with failure extraction
npm run test:critical:debug

# 2. Read the processed failure report
cat test-results/failures-summary.md
```

**That's it!** The failure report contains everything Claude needs to debug.

---

## 📊 Understanding the Failure Report

### Report Location
**ALWAYS READ THIS FILE:** `/Users/jackandrews/Desktop/wwfm-platform/test-results/failures-summary.md`

### Report Structure

```markdown
# Test Failure Report 🔴

**Generated:** 2025-10-26T12:34:56Z
**Source:** test-results/latest.json

## Summary
- Total Tests: 45
- Passed: 42 ✅
- Failed: 3 ❌
- Skipped: 0 ⏭️
- Duration: 125.45s

## Failed Tests
1. [Test Name 1](#link)
2. [Test Name 2](#link)
3. [Test Name 3](#link)

## Detailed Failures

### 1/3: Community Form Complete - Submit with all fields
**Location:** tests/e2e/forms/community-form-complete.spec.ts:45
**Duration:** 12.34s

**Error:**
```
Expected "Weekly" but got "weekly"
```

**Field Mismatches:**
```
Field Mismatch: meeting_frequency
Expected: Weekly
Actual:   weekly
Source:   Database value doesn't match dropdown option
```

**Diagnostic Output (last 20 lines):**
```
✓ Form loaded successfully
✓ Filled meeting_frequency: Weekly
✓ Form submitted
✗ Database verification failed
  - Field: meeting_frequency
  - Expected: Weekly
  - Actual: weekly
```

<details>
<summary>Stack Trace</summary>

```
at tests/e2e/forms/community-form-complete.spec.ts:45:10
at Community Form Complete Test Suite:12:5
```
</details>
```

---

## 🔍 What Makes This System Bulletproof

### 1. **Automatic Extraction**
- No manual JSON parsing needed
- No guessing at jq commands
- One command gets everything

### 2. **Always Readable**
- Always under 100KB (Claude can read fully)
- Structured Markdown format
- Quick navigation with links

### 3. **Complete Information**
Each failure includes:
- Test name and file location
- Error message
- Field mismatches (HIGHEST PRIORITY)
- Last 20 lines of diagnostic output
- Full stack trace (collapsed)

### 4. **Prioritized Data**
Information ordered by usefulness:
1. **Field Mismatches** - Most actionable
2. **Error Message** - What failed
3. **Diagnostics** - Detailed output
4. **Stack Trace** - File/line numbers

### 5. **Success Detection**
When all tests pass:
```markdown
# Test Results: All Passing ✅

**No failures to report!** All tests passed successfully.
```

---

## 🛠️ Usage Patterns

### For Claude: Debugging Workflow

1. **Check if report exists:**
   ```bash
   cat test-results/failures-summary.md
   ```

2. **If report doesn't exist, generate it:**
   ```bash
   npm run test:failures
   ```

3. **Read the entire report** (it's always small enough)

4. **Focus on Field Mismatches first** - these are the most actionable errors

5. **Use test location to find code:**
   ```
   Location: tests/e2e/forms/community-form-complete.spec.ts:45
   ```

6. **Check diagnostics for context** about what happened before failure

7. **Use stack trace** only if you need exact file/line numbers

### For Developers: Integrated Workflows

#### After Running Tests
```bash
# Manual extraction if needed
npm run test:failures

# Integrated: Run tests + extract failures
npm run test:debug
npm run test:critical:debug
```

#### Continuous Integration
```yaml
# In CI workflow
- run: npm run test:critical
- run: npm run test:failures
- uses: actions/upload-artifact@v3
  with:
    name: test-failures
    path: test-results/failures-summary.md
```

---

## 📋 Common Failure Patterns

### 1. Case Mismatch (Most Common)
```
Field Mismatch: session_frequency
Expected: Weekly
Actual:   weekly
```
**Fix:** Check dropdown options match database values exactly

### 2. Missing Field
```
Field Mismatch: meeting_frequency
Expected: Weekly
Actual:   undefined
```
**Fix:** Form not saving field, check form submission logic

### 3. Wrong Field Name
```
Field Mismatch: frequency
Expected: Weekly
Actual:   (field doesn't exist)
```
**Fix:** Check field name mapping in form → database

### 4. Distribution Data Issues
```
Field Mismatch: side_effects
Expected: DistributionData object
Actual:   String value
```
**Fix:** Check aggregation script, should convert to DistributionData

---

## 🔧 Script Configuration

The extraction script can be tuned if needed:

**Location:** `/Users/jackandrews/Desktop/wwfm-platform/scripts/test-utils/extract-failures.js`

**Configuration Options:**
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

**When to adjust:**
- If report exceeds 100KB, reduce `maxDiagnosticLines` or `maxStackLines`
- If you need more context, increase `maxDiagnosticLines`
- If errors are truncated, increase `maxErrorMessageLength`

---

## 🚨 Troubleshooting the Extraction System

### Problem: "latest.json not found"
```bash
❌ Error: test-results/latest.json not found
   Run tests first: npm run test:e2e
```

**Solution:** Run tests first to generate the JSON:
```bash
npm run test:critical
npm run test:failures
```

### Problem: Report is empty
Check if tests actually failed:
```bash
npm run test:results:summary
```

### Problem: Report is too large
Reduce configuration limits in `extract-failures.js`:
```javascript
maxDiagnosticLines: 10,  // Reduce from 20
maxStackLines: 15,       // Reduce from 30
```

### Problem: Missing field mismatch details
Check test stdout is being captured correctly. Tests should log mismatches like:
```javascript
console.log(`Field Mismatch: ${fieldName}`);
console.log(`Expected: ${expected}`);
console.log(`Actual: ${actual}`);
```

---

## 📝 For Future Claude Instances

### ALWAYS Do This When Asked to Debug Tests:

1. **Read the failure summary first:**
   ```bash
   cat test-results/failures-summary.md
   ```

2. **If it doesn't exist, generate it:**
   ```bash
   npm run test:failures
   ```

3. **Read the ENTIRE report** - it's designed to be small enough

4. **Start with Field Mismatches** - they're the most actionable

5. **Only then look at error messages and diagnostics**

### NEVER Do This:

- ❌ Don't try to read `test-results/latest.json` directly (455KB, too large)
- ❌ Don't use complex jq commands to parse JSON
- ❌ Don't guess at what failed - read the report
- ❌ Don't look at stack traces first - start with field mismatches

### Trust the System:

This extraction system is **designed specifically for Claude**:
- Always under 100KB (readable in one go)
- Information prioritized by usefulness
- Consistent format every time
- Complete error context
- No manual parsing needed

**Just read `test-results/failures-summary.md` and debug from there.**

---

## 🎓 Understanding the Test System

### Test Data Flow
1. **Form fills** field with value from dropdown
2. **Form submits** to database via action
3. **Test verifies** database value matches expected
4. **If mismatch:** Logged to stdout and causes failure

### Why Field Mismatches Happen
- **Case differences:** "Weekly" vs "weekly"
- **Field name mapping:** Form uses one name, DB uses another
- **Type conversion:** String vs DistributionData
- **Missing aggregation:** Data not copied to aggregated_fields

### How Tests Detect Issues
```typescript
// Tests compare exact values
expect(dbValue).toBe(expectedValue);

// Common mismatches:
"Weekly" !== "weekly"         // Case mismatch
undefined !== "Weekly"        // Missing field
"string" !== {mode: "X"}     // Type mismatch
```

---

## 📚 Related Documentation

- **Test Setup:** `/tests/README.md`
- **Form Testing:** `/docs/testing/form-testing-guide.md`
- **Database Schema:** `/docs/database/schema.md`
- **Field Validation:** `/FORM_DROPDOWN_OPTIONS_REFERENCE.md`

---

## ✅ Success Criteria

The extraction system works if:

1. ✅ Report is always under 100KB
2. ✅ All field mismatches are captured
3. ✅ Error messages are complete
4. ✅ Diagnostics provide context
5. ✅ Stack traces are available (but collapsed)
6. ✅ One command generates everything
7. ✅ Claude can read the entire report

**This system is designed to make debugging effortless. Use it!**
