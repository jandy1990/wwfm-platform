# WWFM Testing Documentation

## 📚 Active Documentation (6 files)

| Document | Purpose | Status |
|----------|---------|--------|
| **[MASTER_TESTING_GUIDE.md](./MASTER_TESTING_GUIDE.md)** | Complete testing reference guide | ✅ Primary Reference |
| **[FORM_FIX_PROGRESS.md](./FORM_FIX_PROGRESS.md)** | Live dashboard tracking test status | ✅ 23/23 categories working! |
| **[FORM_FIX_PROCESS.md](./FORM_FIX_PROCESS.md)** | Systematic debugging approach | ✅ Process Guide |
| **[TEST_SUITE_ASSESSMENT.md](./TEST_SUITE_ASSESSMENT.md)** | Test suite structure and optimization | ✅ Assessment |
| **[TEST_SETUP_ASSESSMENT.md](./TEST_SETUP_ASSESSMENT.md)** | Test setup and fixture management | ✅ Setup Guide |
| **[quick-reference.md](./quick-reference.md)** | Essential commands cheatsheet | ✅ Quick Reference |

## 🚀 Quick Start

```bash
# Tiered Testing Approach (fastest to most comprehensive)
npm run test:smoke        # 6 tests, ~30 seconds - Basic functionality
npm run test:critical     # 34 tests, ~5 minutes - All form completions
npm run test:forms:local  # Chromium + disposable Supabase (recommended)
npm run test:forms        # Legacy all projects (requires Supabase running)

# Run specific form tests
npm run test:forms -- session-form

# Run with UI for debugging
npm run test:forms:ui

# Manage disposable Supabase
npm run test:db:start
npm run test:db:seed
npm run test:db:status
npm run test:db:stop

# Cleanup helpers
npm run test:reset       # Nuclear cleanup of all test data
```

> Supabase CLI + Docker are required for the \`test:forms:local\` / \`test:db:*\` commands.

### Restore schema/data before first run

```bash
npm run test:db:start
# Load a plain SQL dump
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f ~/Downloads/wwfm-backup.sql
# Or load a pg_dump archive
pg_restore --clean --if-exists --no-owner \
  -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  ~/Downloads/wwfm-backup.backup
npm run test:db:stop
```

Use password `postgres` unless overridden. Docker keeps the restored data between runs.

## 📊 Current Test Status

**Overall: 23/23 categories working (100% coverage)** 🎉

### Test Suite Metrics
- **Total E2E Tests**: 186 (reduced from 216 after removing debug tests)
- **Smoke Tests**: 6 core functionality checks
- **Critical Tests**: 34 form completion tests
- **Full Suite Runtime**: ~15 minutes

### ✅ All Forms Working (9)
- **AppForm**: apps
- **PracticeForm**: therapies, activities 
- **CommunityForm**: communities
- **LifestyleForm**: lifestyle_changes
- **HobbyForm**: hobbies
- **PurchaseForm**: products_purchases
- **FinancialForm**: financial_services  
- **SessionForm**: All 6 categories (therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, crisis_resources)
- **DosageForm**: All 4 categories (supplements_vitamins, medications, natural_remedies, beauty_skincare)

For detailed status, see [FORM_FIX_PROGRESS.md](./FORM_FIX_PROGRESS.md)

## 🎯 Tiered Testing Strategy

Our test suite uses a tiered approach for efficiency:

### Tier 1: Smoke Tests (6 tests, ~30 seconds)
- **Purpose**: Verify core functionality after deployments
- **Coverage**: Authentication, browsing, solution search
- **When to run**: After every deploy, before deeper testing
- **Command**: `npm run test:smoke`

### Tier 2: Critical Tests (34 tests, ~5 minutes)
- **Purpose**: Ensure all form submissions work end-to-end
- **Coverage**: Complete submission flow for all 23 categories
- **When to run**: Before merging PRs, after significant changes
- **Command**: `npm run test:critical`

### Tier 3: Full Suite (186 tests, ~15 minutes)
- **Purpose**: Comprehensive validation including edge cases
- **Coverage**: All forms, variants, error handling, data pipeline
- **When to run**: Before releases, after major refactors
- **Command**: `npm run test:forms:local` (Chromium)
- Optional legacy suite: `npm run test:forms` (requires Supabase running)

## 🔧 Test Setup & Maintenance

### Prerequisites
```bash
# Initial setup - creates test fixtures in database
npm run test:db:seed

# This creates:
# - Test solutions with "(Test)" suffix
# - Test user account (test@wwfm-platform.com)
# - Test goal (Reduce anxiety and stress)
```

### Cleanup Options
```bash
# Nuclear reset - clears ALL test data
npm run test:reset

# Individual test cleanup (automatic)
# Each test file has beforeEach() hooks that clear its specific data
```

### CI/CD Integration
The GitHub Actions workflow automatically:
1. Runs `test:db:seed` to ensure fixtures exist
2. Executes tests based on PR labels
3. Reports results back to the PR

## 🗂️ Archive

Historical documentation has been moved to [`/archive/`](./archive/) to reduce clutter while preserving institutional knowledge.

## 💡 Need Help?

1. **Start with**: [MASTER_TESTING_GUIDE.md](./MASTER_TESTING_GUIDE.md) for complete reference
2. **Check status**: [FORM_FIX_PROGRESS.md](./FORM_FIX_PROGRESS.md) for current issues
3. **Debug forms**: [FORM_FIX_PROCESS.md](./FORM_FIX_PROCESS.md) for systematic approach
4. **Test setup**: [TEST_SETUP_ASSESSMENT.md](./TEST_SETUP_ASSESSMENT.md) for fixture management
5. **Quick commands**: [quick-reference.md](./quick-reference.md) for common tasks
