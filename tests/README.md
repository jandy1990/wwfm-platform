# WWFM Testing Guide

> **📚 For complete testing documentation, see [Master Testing Guide](/docs/testing/MASTER_TESTING_GUIDE.md)**

## Quick Start (Pre-Launch Testing)

Since we're pre-launch with no real users, we keep testing simple and reliable:

### The One Command You Need:
```bash
npm run test:quick
```
This automatically cleans data and runs all desktop tests. That's it!

### Why This Works:
- **Automatic cleanup** - Every test run starts fresh (no "already rated" errors)
- **Sequential execution** - Tests run one at a time (no conflicts)
- **Desktop-only by default** - Faster and more reliable for development
- **Simple** - No complex infrastructure needed pre-launch

## Full Setup Guide (If Needed)

If you're setting up from scratch:

### Step 1: Prerequisites
```bash
# Install test dependencies
npm install

# Install Playwright browsers (only needed once)
npx playwright install
```

### Step 2: Setup Test Environment
```bash
# This single command sets up EVERYTHING you need:
npm run test:setup
```

This command will:
- ✅ Create/verify test user account (test@wwfm-platform.com)
- ✅ **Clean up previous test ratings** (prevents "already rated" errors)
- ✅ Create 23 test fixtures with **(Test) suffix** (e.g., "Headspace (Test)")
- ✅ **Create variants** for each fixture (e.g., "20mg tablet" for medications)
- ✅ **Link all fixtures to test goal** (CRITICAL - without this, search won't find them!)
- ✅ Mark all fixtures as approved (required for them to appear in search)
- ✅ Verify everything is ready

**Expected output:**
```
🚀 WWFM Complete Test Setup

📋 Step 1: Checking test user...
   ✅ Test user exists
📋 Step 2: Cleaning up old test ratings...
   ✅ Cleaned up old ratings
📋 Step 3: Setting up test fixtures...
   ✅ Test fixtures created
📋 Step 4: Verifying setup...
   ✅ All 23 test fixtures verified
   ✅ 23 fixtures linked to test goal

✅ Test setup complete! You can now run tests with:
   npm run test:forms
```

### Step 3: Run Tests
```bash
# Run all tests
npm run test:forms

# OR run tests with visual browser (helpful for debugging)
npm run test:forms:headed

# OR run tests in interactive UI mode
npm run test:forms:ui
```

**That's it!** The tests should now run successfully.

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
# Run everything including mobile (also includes automatic cleanup)
npm run test:forms
```

## All Available Commands

```bash
# Quick test (RECOMMENDED - cleanup + desktop tests)
npm run test:quick

# Full test suite (cleanup + all tests)
npm run test:forms

# Desktop only (cleanup + chromium tests)
npm run test:forms:chromium

# Mobile only (cleanup + mobile tests)
npm run test:forms:mobile

# Interactive UI mode
npm run test:forms:ui

# Debug mode
npm run test:forms:debug

# View test report
npm run test:forms:report

# Manual setup (usually not needed - automatic in test commands)
npm run test:setup
```

**Note:** All test commands now automatically run cleanup first, so you never need to worry about "already rated" errors!

## Troubleshooting

### Tests are failing with "Solution not found in dropdown" or "Found 0 suggestions"
**Causes:**
- Test fixtures don't have "(Test)" suffix
- Fixtures aren't linked to test goal
- Fixtures aren't approved
- Fixtures don't have variants

**Solution:** Run `npm run test:setup` to recreate everything properly

### Tests fail with "You've already rated this solution"
**Cause:** Previous test runs left ratings in database
**Solution:** Run `npm run test:setup` (it cleans up old ratings)

### Tests timeout or hang
**Possible causes:**
1. Dev server not running → Start it with `npm run dev`
2. Wrong port → Tests expect localhost:3000
3. Database connection issues → Check your `.env.local` file

### "Test user not found" error
**Solution:** Run `npm run test:setup` to create the test user

### Tests pass locally but fail in CI
**Check:**
1. Environment variables are set in CI
2. Test database is accessible from CI
3. CI has correct Node/npm versions

## Environment Requirements

Your `.env.local` file needs these variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

The tests will:
- Use test user: `test@wwfm-platform.com` (password: `TestPassword123!`)
- Create test fixtures with "(Test)" suffix
- Use a dedicated test goal (ID: `56e2801e-0d78-4abd-a795-869e5b780ae7`)

## Why These Setup Steps Matter

Understanding what the setup does helps diagnose issues:

| Setup Step | What Happens | What Goes Wrong Without It |
|------------|--------------|---------------------------|
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

All of this is handled automatically by `npm run test:setup`!

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
npx playwright test --grep "DosageForm"

# Specific browser
npx playwright test --project=chromium
```

### Debugging
```bash
# Step through test interactively
npm run test:forms:debug

# See browser while tests run
npm run test:forms:headed

# Generate trace for failed tests
npx playwright test --trace on
```

### Manual Database Setup
If automated setup fails, you can manually set up the database:

1. Run SQL in Supabase dashboard: `tests/setup/manual-setup.sql`
2. Then run: `npm run test:setup`

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

1. **First step for any issue:** Run `npm run test:setup`
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

**Remember:** When in doubt, run `npm run test:setup` - it fixes most issues!