# Test Debugging Quick Reference

## 🚀 One-Command Solutions

### For Claude: Start Here

```bash
# Read the failure report (ALWAYS do this first)
cat test-results/failures-summary.md
```

If file doesn't exist:
```bash
npm run test:failures
```

### For Developers: Integrated Workflows

```bash
# Run tests + extract failures automatically
npm run test:debug

# Run critical tests + extract failures
npm run test:critical:debug

# Just extract failures from last test run
npm run test:failures
```

---

## 📊 File Locations

| File | Purpose | Size | When to Read |
|------|---------|------|--------------|
| `test-results/failures-summary.md` | **Processed failure report** | < 100KB | **ALWAYS read this first** |
| `test-results/latest.json` | Raw Playwright JSON | 455KB | Never (too large) |
| `playwright-report/` | HTML test report | Varies | For visual debugging |

---

## 🎯 Common Failure Patterns

### 1. Case Mismatch (Most Common)
**Symptom:** `Expected "Weekly" but got "weekly"`

**Location in Report:**
```markdown
Field Mismatch: meeting_frequency
Expected: Weekly
Actual:   weekly
```

**Fix:**
1. Check `FORM_DROPDOWN_OPTIONS_REFERENCE.md` for correct case
2. Update form dropdown to match exactly
3. Verify database stores exact dropdown value

### 2. Missing Field
**Symptom:** `Expected "Weekly" but got undefined`

**Location in Report:**
```markdown
Field Mismatch: meeting_frequency
Expected: Weekly
Actual:   undefined
```

**Fix:**
1. Check form submission logic saves field
2. Verify field name matches database column
3. Check aggregation script includes field

### 3. Type Mismatch
**Symptom:** `Cannot read property 'mode' of undefined`

**Location in Report:**
```markdown
Field Mismatch: session_frequency
Expected: DistributionData {mode: "Weekly", ...}
Actual:   "Weekly" (string)
```

**Fix:**
1. Check aggregation script converts to DistributionData
2. Verify field regeneration for this category
3. See `complete-field-analysis.md` for required format

---

## 🔍 Debugging Workflow

### Step 1: Read Failure Report
```bash
cat test-results/failures-summary.md
```

### Step 2: Identify Pattern
- Case mismatch? → Check dropdown options
- Missing field? → Check form submission
- Type mismatch? → Check aggregation script

### Step 3: Locate Code
Use the Location field:
```
Location: tests/e2e/forms/community-form-complete.spec.ts:45
```

### Step 4: Find Related Files
Based on test type:
- Form test → `components/organisms/solutions/forms/`
- Field validation → `FORM_DROPDOWN_OPTIONS_REFERENCE.md`
- Database → `app/actions/` and `lib/database/`
- Aggregation → `scripts/generate-validated-fields-v3.ts`

### Step 5: Fix and Verify
```bash
# Make your fix
# Then run tests + extract failures
npm run test:critical:debug

# Read updated report
cat test-results/failures-summary.md
```

---

## 📚 Key Reference Documents

| Document | Purpose |
|----------|---------|
| `FORM_DROPDOWN_OPTIONS_REFERENCE.md` | Exact dropdown values and formats |
| `complete-field-analysis.md` | Category-specific required fields |
| `docs/testing/DEBUGGING-TEST-FAILURES.md` | Complete debugging guide |
| `HANDOVER.md` | Current task status and context |

---

## ⚠️ Common Mistakes to Avoid

### ❌ DON'T:
- Read `test-results/latest.json` directly (too large)
- Use complex jq commands to parse JSON
- Guess at what failed without reading report
- Look at stack traces first
- Run tests without extracting failures

### ✅ DO:
- Read `test-results/failures-summary.md` first
- Focus on Field Mismatches section
- Use `npm run test:debug` for integrated workflow
- Check dropdown reference for exact values
- Verify field names match category requirements

---

## 🛠️ Scripts Cheat Sheet

```bash
# Test execution
npm run test:forms              # All form tests
npm run test:critical           # Critical tests only
npm run test:quick              # Smoke test

# Failure extraction
npm run test:failures           # Extract failures from last run
npm run test:debug              # Run tests + extract
npm run test:critical:debug     # Critical + extract

# Results viewing
npm run test:results:summary    # Quick stats
npm run test:forms:report       # HTML report
cat test-results/failures-summary.md  # Full failure details
```

---

## 💡 Pro Tips

1. **Always extract failures after test runs**
   - Makes debugging 10x faster
   - Consistent format every time

2. **Field Mismatches are gold**
   - Most actionable error type
   - Usually simple fixes

3. **Use integrated commands**
   - `npm run test:debug` does everything
   - No need to run separately

4. **Check category requirements**
   - Different categories need different fields
   - See `complete-field-analysis.md`

5. **Trust the system**
   - Report is always under 100KB
   - Always has complete context
   - Designed specifically for Claude

---

## 🎯 Success Checklist

Before asking for help, verify:

- [ ] Read `test-results/failures-summary.md`
- [ ] Checked Field Mismatches section
- [ ] Located test file from Location field
- [ ] Reviewed dropdown reference for field
- [ ] Checked category requirements
- [ ] Ran `npm run test:failures` for latest data

If all checked and still stuck, you have all the info needed to ask for help!

---

**Remember:** The failure extraction system is designed to make debugging effortless. Use it!
