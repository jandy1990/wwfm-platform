# WWFM Testing Guide

> **📚 For complete testing documentation, see [Master Testing Guide](/docs/testing/MASTER_TESTING_GUIDE.md)**

## 🚨 CRITICAL: Test Setup Required

**BEFORE running ANY tests against production database, you MUST create test fixtures:**

```bash
# STEP 1: Create test fixtures (MANDATORY)
npm run test:setup

# STEP 2: Run tests
npm run test:critical
```

**Why this matters:**
- Creates 24 test solutions with "(Test)" suffix
- Without this, ALL tests fail with "Solution not found"
- Must be run at start of every new testing session
- Takes ~30 seconds to complete

## Quick Start (Pre-Launch Testing)

We now run Chromium tests against a disposable Supabase stack so each run starts from a blank slate.

### The One Command You Need:
```bash
npm run test:forms:local
```

This command:
- 🚀 boots a local Supabase instance via the CLI
- 🧹 wipes/seed fixtures through the existing setup scripts
- 🧪 executes all Chromium Playwright tests sequentially
- 🛑 tears the Supabase containers down at the end

> **Note:** install the [Supabase CLI](https://supabase.com/docs/guides/cli/start) (and Docker) before running the command.

## Full Setup Guide (If Needed)

If you're setting up from scratch:

### Step 1: Prerequisites
```bash
# Install test dependencies
npm install

# Install Playwright browsers (only needed once)
npx playwright install

# Install the Supabase CLI (macOS example)
brew install supabase/tap/supabase
# See https://supabase.com/docs/guides/cli/start for other platforms
 
# Install PostgreSQL client tools for psql / pg_restore
brew install libpq
brew link --force libpq
```

### Step 2: Start + Seed Local Test Data
```bash
# Bring up Supabase, provision fixtures, run Chromium tests, then shut everything down
npm run test:forms:local
```

The command is idempotent - run it whenever you need a clean slate. It also writes `.env.test.local` from the Supabase CLI output so you do not need to copy keys manually.

> First run? Restore the schema before seeding. Start the stack (`npm run test:db:start`) and use `psql`/`pg_restore` to load a backup into `postgres://postgres:postgres@127.0.0.1:54322/postgres`. The data persists across runs.

> Make sure no manual `npm run dev` process is already bound to port 3000. The Playwright webServer launches its own Next.js instance and will automatically reuse an existing server when available.

### Step 3: Optional Helpers
```bash
# Start Supabase only (useful when debugging)
npm run test:db:start

# Reset/seed fixtures without launching Playwright
npm run test:db:seed

# Stop containers (run if a test run aborts before cleanup)
npm run test:db:stop

# Run Supabase integration checks once Supabase is running
npm run test:integration
```

---

## What These Tests Do

The WWFM platform is a crowdsourced mental health solution tracker. These E2E tests verify that users can:
1. Search for solutions
2. Fill out forms for different solution types
3. Submit their experiences
4. Have data correctly saved to the database

We test 9 different form types covering 23 solution categories (medications, apps, therapy, etc.).

## Test Status

✅ **Desktop Tests: All 96 Chromium tests passing**
⚠️  **Mobile Tests: Currently failing due to duplicate rating issues**
🔧 **Skipped Tests: 6 tests skipped (validation/restoration features pending)**

**Total: 176 tests** covering all 9 form types
- DosageForm: medications, supplements, natural remedies, beauty products
- SessionForm: therapy, doctors, coaches, classes, treatments
- PracticeForm: exercise, meditation, habits
- AppForm: apps & software
- PurchaseForm: products, devices, books, courses
- CommunityForm: support groups, online communities
- LifestyleForm: diet, nutrition, sleep
- HobbyForm: hobbies & activities
- FinancialForm: financial products

## 🆕 Improved Test Infrastructure (October 2025)

We've refactored the testing infrastructure to improve reliability:

**New Utilities** (in `tests/e2e/utils/`):
- `wait-helpers.ts` - Semantic waits (no more arbitrary timeouts)
- `navigation-helpers.ts` - Reusable navigation patterns
- `test-lifecycle.ts` - Automatic cleanup & fixtures

**New Template** (in `tests/e2e/templates/`):
- `improved-form-test.template.ts` - Declarative test generator

**Example Migrations**:
- `app-form-improved.spec.ts` - Simple form example
- `dosage-form-improved.spec.ts` - Complex form with variants

**Benefits**:
- 85% less code per test (400 lines → 60 lines)
- 6x faster execution (parallelization enabled)
- No arbitrary timeouts (deterministic waits)
- Automatic cleanup (no more "already rated" errors)

## Daily Development Workflow

### For Regular Development:
```bash
# This is all you need - runs cleanup + desktop tests
npm run test:quick
```

### Before Committing:
```bash
# Run full desktop suite (also includes automatic cleanup)
npm run test:forms:chromium
```

### Before Major Releases:
```bash
# Full Chromium pass against disposable Supabase (includes cleanup)
npm run test:forms:local

# Optional: run the legacy combined suite (requires Supabase already running)
# npm run test:forms
```

## All Available Commands

```bash
# Quick smoke test (re-uses whatever Supabase you have running)
npm run test:quick

# Full Chromium suite against disposable Supabase
npm run test:forms:local

# Legacy full suite (Chromium + mobile) - requires Supabase already running
npm run test:forms

# Desktop only (Chromium)
npm run test:forms:chromium

# Mobile only (Chromium Mobile project)
npm run test:forms:mobile

# Interactive UI / headed modes
npm run test:forms:ui
npm run test:forms:debug

# View Playwright report
npm run test:forms:report

# Manage disposable Supabase manually
npm run test:db:start
npm run test:db:seed
npm run test:db:status
npm run test:db:stop
```

**Note:** `npm run test:forms:local` and `npm run test:db:seed` handle cleanup automatically. If you call the legacy Playwright commands directly, run the seed step first to avoid "already rated" errors.

## Automatic Test Output Capture

**All test runs automatically save complete output to `test-results/latest.json`** - No more truncated error messages!

### Why This Matters

When tests run in CI or are piped through other tools, output can be truncated. The automatic capture system ensures you always have access to the full test results, including:
- Complete error messages
- Full stack traces
- All test timings
- Detailed failure information

### Viewing Test Results

```bash
# View full JSON output from latest test run
npm run test:results

# View quick summary (passed/failed counts, timings)
npm run test:results:summary

# Open HTML report in browser
npm run test:forms:report
```

### For Debugging

**Claude/Developers:** When investigating test failures, read `/Users/jackandrews/Desktop/wwfm-platform/test-results/latest.json` for complete output. This file contains:
- All test names and their status
- Complete error messages (not truncated)
- Stack traces for failures
- Test execution timings
- Browser console logs
- Network request logs (if enabled)

### How It Works

The capture system runs automatically on every test execution:
1. Test runner executes (Playwright)
2. JSON reporter saves results to `test-results/latest.json`
3. Results persist between runs (latest always available)
4. No configuration needed - works out of the box

### File Locations

- **Latest results:** `test-results/latest.json` (always current)
- **HTML report:** `playwright-report/index.html` (after `npm run test:forms:report`)
- **Test artifacts:** `test-results/` (screenshots, traces, videos)

**Pro tip:** Bookmark `test-results/latest.json` in your editor for quick access to test output!

## Troubleshooting

### Tests are failing with "Solution not found in dropdown" or "Found 0 suggestions"
**Causes:**
- Test fixtures don't have "(Test)" suffix
- Fixtures aren't linked to test goal
- Fixtures aren't approved
- Fixtures don't have variants

**Solution:** Run `npm run test:db:seed` to recreate everything properly

### Tests fail with "You've already rated this solution"
**Cause:** Previous test runs left ratings in database
**Solution:** Run `npm run test:db:seed` (it cleans up old ratings)

### Tests timeout or hang
**Possible causes:**
1. Dev server not running → Start it with `npm run dev`
2. Wrong port → Tests expect localhost:3000
3. Database connection issues → Check your `.env.local` file

### "Test user not found" error
**Solution:** Run `npm run test:db:seed` to create the test user

### Tests pass locally but fail in CI
**Check:**
1. Environment variables are set in CI
2. Test database is accessible from CI
3. CI has correct Node/npm versions

## Environment Requirements

Your `.env.test.local` (auto-generated) or `.env.local` file needs these variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
```

The tests will:
- Use test user: `test@wwfm-platform.com` (password: `TestPassword123!`)
- Create test fixtures with "(Test)" suffix
- Use a dedicated test goal (ID: `56e2801e-0d78-4abd-a795-869e5b780ae7`)

## Why These Setup Steps Matter

Understanding what the setup does helps diagnose issues:

| Setup Step | What Happens | What Goes Wrong Without It |
|------|-------|--------------|
| **Clean ratings** | Deletes previous test ratings | "You've already rated this solution" errors |
| **Create fixtures with (Test) suffix** | Creates 23 fake solutions | No test data to work with |
| **Create variants** | Adds "20mg tablet", "Standard", etc. | Forms can't save without variants |
| **Link to goal** | Connects fixtures to test goal ID | **Search returns 0 results** (most common issue!) |
| **Mark as approved** | Sets `is_approved = true` | Fixtures filtered out by search |

**The #1 cause of test failures:** Fixtures not linked to test goal. Without this link, the search will never find them!

## How It Works

### Test Architecture
1. **Global Setup** (`tests/setup/global-setup.ts`): Logs in test user once before all tests
2. **Test Fixtures**: 23 permanent test solutions in database marked with "(Test)" suffix
3. **Form Tests**: Each form type has comprehensive tests for data flow
4. **Cleanup**: Test setup cleans old data before each run

### Test Fixtures
Test fixtures are fake solutions used for testing. **All have "(Test)" suffix** to distinguish them from real data:
- `Headspace (Test)` → Apps & Software
- `Prozac (Test)` → Medications (with "20mg tablet" variant)
- `Vitamin D (Test)` → Supplements (with "1000 IU capsule" variant)
- `CBT Therapy (Test)` → Therapists
- ...and 19 more

**Critical requirements for test fixtures:**
1. **Must have "(Test)" suffix** - This identifies them as test data
2. **Must be approved** (`is_approved = true`) - Or they won't appear in search
3. **Must have variants** - Even if just "Standard" for non-dosage categories
4. **Must be linked to test goal** - Via `goal_implementation_links` table
5. **Previous ratings must be cleaned** - Or you'll get "already rated" errors

All of this is handled automatically by `npm run test:db:seed`!

### What Gets Tested
Each form test verifies:
1. User can search and find test fixtures
2. Form fields work correctly
3. Data saves to correct database tables
4. Success page displays after submission
5. Validation works properly

## Advanced Usage

### Running Specific Tests
```bash
# Single test file
npx playwright test tests/e2e/forms/app-form.spec.ts

# Test by pattern
npx playwright test -grep "DosageForm"

# Specific browser
npx playwright test -project=chromium
```

### Debugging
```bash
# Step through test interactively
npm run test:forms:debug

# See browser while tests run
npm run test:forms:headed

# Generate trace for failed tests
npx playwright test -trace on
```

### Manual Database Setup
If automated setup fails, you can manually set up the database:

1. Run SQL in Supabase dashboard: `tests/setup/manual-setup.sql`
2. Then run: `npm run test:db:seed`

## File Structure
```
tests/
├── e2e/
│   └── forms/
│       ├── *-form.spec.ts        # Individual form tests
│       ├── *-form-complete.spec.ts # Complete E2E tests
│       └── form-test-factory.ts   # Test generator
├── setup/
│   ├── complete-test-setup.js    # All-in-one setup script
│   ├── manual-setup.sql          # Manual SQL if needed
│   └── global-setup.ts           # Playwright auth setup
└── README.md                      # This file
```

## Need Help?

1. **First step for any issue:** Run `npm run test:db:seed`
2. **Check prerequisites:** Is dev server running? (`npm run dev`)
3. **Review test output:** Tests log detailed progress
4. **Use debug mode:** `npm run test:forms:debug` to step through
5. **Check database:** Ensure test fixtures exist with "(Test)" suffix

## Contributing

When adding new tests:
1. Use existing test fixtures (don't create new ones)
2. Follow naming convention: `*-form.spec.ts` or `*-form-complete.spec.ts`
3. Clean up test data after tests (but never delete test fixtures)
4. Ensure tests are independent and can run in any order
5. Add clear error messages for debugging

---

**Remember:** When in doubt, run `npm run test:db:seed` - it fixes most issues!
