# ⚠️ START HERE: Critical Testing Setup

## 🚨 YOU MUST READ THIS BEFORE RUNNING ANY TESTS

### For Claude Code / AI Assistants

**If you're about to run tests (`npm run test:critical`), STOP and read this first.**

---

## Production Database Testing (Most Common)

**Step-by-step mandatory process:**

### 1️⃣ FIRST: Create Test Fixtures
```bash
npm run test:setup
```

**What this does:**
- Creates 24 test solutions with "(Test)" suffix
- Example: "Headspace (Test)", "Vitamin D (Test)", "CBT Therapy (Test)"
- Approves and links them to test goal
- Takes ~30 seconds

**What happens if you skip this:**
- ❌ ALL 17 tests fail with "Solution not found"
- ❌ Tests try to CREATE new solutions (wrong behavior)
- ❌ Database errors cascade
- ❌ You waste 10+ minutes debugging obvious failures

### 2️⃣ THEN: Run Tests
```bash
npm run test:critical
```

### 3️⃣ AFTER: Extract Failures
```bash
npm run test:failures
```

---

## Why This Wasn't Obvious

**What went wrong:**
- `HANDOVER.md` listed `test:critical` without mentioning `test:setup`
- `CLAUDE.md` had test debugging info but no setup requirement
- `tests/README.md` mentioned setup but not prominently enough
- Quick reference assumed you'd know to run setup first

**What's fixed now:**
- ✅ HANDOVER.md: Prominent "BEFORE RUNNING TESTS" section
- ✅ CLAUDE.md: Critical warning at top of testing section
- ✅ tests/README.md: Mandatory setup at very top
- ✅ quick-reference.md: Setup as first step
- ✅ THIS FILE: Impossible to miss warning

---

## Complete Error Analysis (Latest Run)

### Error Types Found (Multiple Issues):

**1. Missing Test Fixtures (PRIMARY)**
- Error: "Solution '[Name] (Test)' not found"
- Cause: Skipped `npm run test:setup`
- Fix: Run setup, restart tests

**2. Database Trigger Broken (FIXED)**
- Error: "relation ratings does not exist" in trigger
- Cause: `calculate_contribution_points` function had wrong search_path
- Fix: Applied SQL patch with explicit `public.ratings` qualification
- Status: Fixed in database, needs dev server restart

**3. Duplicate Keys (MINOR)**
- Error: "duplicate key value violates unique constraint"
- Cause: Test fixtures created multiple times
- Fix: Proper cleanup between runs

**4. RLS Violations (NON-BLOCKING)**
- Error: "row-level security policy" on retrospective_schedules
- Impact: Optional feature, doesn't block tests

---

## Next Claude Instance: Your Action Plan

```bash
# Kill all background processes except dev server
# Kill old dev server if needed
lsof -ti:3000 | xargs kill -9

# Start fresh dev server
npm run dev &  # Let it start in background

# Wait for "Ready" message (~5 seconds)

# Run test setup (MANDATORY)
npm run test:setup

# Run tests
npm run test:critical

# Extract failures
npm run test:failures

# Read failure report
cat test-results/failures-summary.md
```

**Do NOT skip `npm run test:setup`** - it's not optional, it's not a nice-to-have, it's REQUIRED.
