# Testing Quick Reference
**Complete Guide:** See [Testing README](../../tests/README.md)

---

## 🚨 MANDATORY FIRST STEP

**Before running ANY tests:**
```bash
npm run test:setup  # Creates 24 test fixtures with "(Test)" suffix
```

**Without this:** ALL tests fail with "Solution not found"

---

## 🚀 Essential Commands

```bash
# Test Execution (Tiered)
npm run test:smoke        # 6 tests, ~30 seconds
npm run test:critical     # 17 tests, ~5 minutes (recommended)
npm run test:forms        # All form tests

# Integrated Workflows (Run + Debug)
npm run test:debug              # Run tests + extract failures
npm run test:critical:debug     # Critical tests + extract failures

# Failure Analysis
npm run test:failures           # Extract failures from last run
cat test-results/failures-summary.md  # Read failure report (ALWAYS do this!)

# Results Viewing
npm run test:results:summary    # Quick stats
npm run test:forms:report       # HTML report

# Test Debugging
npm run test:forms:ui          # Interactive UI
npm run test:forms:debug       # Debug mode
```

---

## 🔍 Debugging Workflow

### Step 1: Read Failure Report (ALWAYS START HERE)
```bash
cat test-results/failures-summary.md
```

### Step 2: Identify Pattern

**Most Common Patterns:**

1. **Case Mismatch** → `Expected "Weekly" but got "weekly"`
   - Fix: Check `FORM_DROPDOWN_OPTIONS_REFERENCE.md` for correct case

2. **Missing Field** → `Expected "Weekly" but got undefined`
   - Fix: Check form submission saves field correctly

3. **Type Mismatch** → `Cannot read property 'mode' of undefined`
   - Fix: Check aggregation converts to DistributionData format

### Step 3: Locate Code
Use Location field from report:
```
Location: tests/e2e/forms/session-form-complete.spec.ts:229
```

### Step 4: Fix and Re-test
```bash
# Make fix, then run integrated workflow
npm run test:critical:debug

# Read updated report
cat test-results/failures-summary.md
```

---

## 🔧 Local Supabase (Optional)

**For disposable database testing:**
```bash
npm run test:db:start     # Start local Supabase (Docker)
npm run test:db:seed      # Seed test fixtures
npm run test:db:status    # Check status
npm run test:db:stop      # Stop and remove

# Run tests against local DB
npm run test:forms:local  # Complete workflow (start → seed → test → stop)
```

**Requirements:** Supabase CLI + Docker

---

## 🚨 Emergency Recovery

### "All tests failing after DB restore"
```bash
npm run test:db:verify    # Checks what's missing

# If arenas/categories empty, restore complete dump
npm run test:db:stop
npm run test:db:start
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  -f path/to/complete-dump.sql

npm run test:db:seed
```

### "Port 3000 conflicts"
```bash
pkill -9 -f "next dev"
lsof -ti:3000 | xargs kill -9
rm -rf .next
```

### "Test fixtures not found"
```bash
npm run test:setup  # Re-create fixtures
```

---

## 📁 Key Files

**Test Infrastructure:**
- `/tests/e2e/forms/form-test-factory.ts` - Test generation
- `/tests/e2e/utils/test-helpers.ts` - Helper functions
- `/tests/setup/complete-test-setup.js` - Fixture creation

**Reference Documents:**
- `FORM_DROPDOWN_OPTIONS_REFERENCE.md` - Exact dropdown values
- `docs/solution-fields-ssot.md` - Category-field mappings

---

## ⚠️ Common Mistakes

### ❌ DON'T:
- Read `test-results/latest.json` directly (too large - 455KB)
- Run tests without `npm run test:setup` first
- Use hardcoded waits (`waitForTimeout`)
- Guess at failures without reading report

### ✅ DO:
- Read `test-results/failures-summary.md` first
- Use `npm run test:debug` for integrated workflow
- Check dropdown reference for exact values
- Use proper wait strategies (waitForSelector, etc.)

---

## 💡 Pro Tips

1. **Integrated workflows are your friend**
   - `npm run test:debug` does everything automatically

2. **Field Mismatches section is gold**
   - Most actionable error type
   - Usually simple dropdown/case fixes

3. **Use the right tool:**
   - Quick debugging → Read failures-summary.md
   - Visual debugging → `npm run test:forms:ui`
   - Deep inspection → `npm run test:forms:report` (HTML)

4. **Test independence:**
   - Each test should cleanup after itself
   - No shared state between tests
   - Use unique test data identifiers

---

## 📚 Full Documentation

**This is a QUICK REFERENCE only.**

**Complete guides:**
- **[Testing README](../../tests/README.md)** - Full setup and troubleshooting
- **[Start Here Guide](START-HERE-TESTING.md)** - Entry point for new testers
- **[Debugging Guide](DEBUGGING-TEST-FAILURES.md)** - Comprehensive debugging

---

**Last Updated:** October 31, 2025
