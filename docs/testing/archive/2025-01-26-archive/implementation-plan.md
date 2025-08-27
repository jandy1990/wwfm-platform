# WWFM Testing Infrastructure Implementation Plan

> **Purpose**: Step-by-step guide for implementing automated E2E testing for WWFM forms
> **Approach**: Full implementation following Option 1
> **Timeline**: 3 days initial setup + ongoing as forms are built
> **Status**: Ready to implement

## 📋 Implementation Checklist

### Phase 1: Test Infrastructure Setup (Day 1)

#### Task 1.1: Install Playwright and Dependencies
- [ ] Run `npm install -D @playwright/test playwright`
- [ ] Run `npx playwright install` to install browsers
- [ ] Add Playwright to .gitignore:
  - [ ] `/test-results/`
  - [ ] `/playwright-report/`
  - [ ] `/playwright/.cache/`
- [ ] Verify installation with `npx playwright test --version`

#### Task 1.2: Create Playwright Configuration
- [ ] Create `/playwright.config.ts` with:
  - [ ] Test directory configuration (`./tests/e2e`)
  - [ ] Browser projects (Chrome desktop + mobile)
  - [ ] Base URL configuration
  - [ ] Web server configuration for dev server
  - [ ] Reporter configuration (HTML)
  - [ ] Trace collection settings
- [ ] Test configuration with `npx playwright test --list`

#### Task 1.3: Set Up Test Environment Variables
- [ ] Create `.env.test.local` file
- [ ] Add required variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_KEY` (for test database access)
  - [ ] `TEST_GOAL_ID` (dedicated test goal)
- [ ] Update `.gitignore` to exclude `.env.test.local`
- [ ] Document env setup in testing README

#### Task 1.4: Create Test Utilities
- [ ] Create directory structure:
  - [ ] `/tests/e2e/utils/`
  - [ ] `/tests/e2e/forms/`
  - [ ] `/tests/e2e/fixtures/`
- [ ] Create `/tests/e2e/utils/test-helpers.ts`:
  - [ ] Test Supabase client with service key
  - [ ] `generateTestSolution()` function
  - [ ] `cleanupTestData()` function
  - [ ] `waitForSuccessPage()` helper
  - [ ] Authentication helpers
- [ ] Create `/tests/e2e/fixtures/test-data.ts`:
  - [ ] Sample form data for each category
  - [ ] Expected field mappings
  - [ ] Dropdown option constants

#### Task 1.5: Create Test Goal in Database
- [ ] Create dedicated test goal in Supabase
- [ ] Goal title: "TEST - Automated Testing Goal"
- [ ] Arena: "Feeling & Emotion" (or similar)
- [ ] Note the UUID for TEST_GOAL_ID
- [ ] Ensure goal is approved and visible

### Phase 2: DosageForm Test Implementation (Day 1-2)

#### Task 2.1: Create Core DosageForm Test
- [x] Create `/tests/e2e/forms/dosage-form.spec.ts`
- [x] Create comprehensive test file `/tests/e2e/forms/dosage-form-complete.spec.ts`
- [x] Implement test: "saves all required fields to correct tables"
  - [x] Navigate to add solution page
  - [x] Handle auto-categorization flow
  - [x] Fill all 4 steps of multi-step form
  - [x] Submit form
  - [x] Verify data in solutions table
  - [x] Verify variant creation
  - [x] Verify goal_implementation_links
  - [x] Verify solution_fields JSONB structure
- [x] Add cleanup in afterEach hook

#### Task 2.2: Test All 4 Dosage Categories
- [x] Create test: "handles all 4 dosage categories"
  - [x] Test medications
  - [x] Test supplements_vitamins
  - [x] Test natural_remedies
  - [x] Test beauty_skincare (special handling for frequency)
- [x] Verify variant fields present for each
- [x] Verify correct form loads

#### Task 2.3: Create Data Integrity Tests
- [x] Test array field preservation (side_effects)
- [x] Test validation error handling
- [x] Test custom side effects addition
- [x] Test navigation preserves data
- [x] Implemented in dosage-form-complete.spec.ts

#### Task 2.4: Create Edge Case Tests
- [x] Test form navigation (back/forward)
- [x] Test data preservation during navigation
- [x] Test custom side effects
- [ ] Test session timeout handling (deferred)
- [ ] Test concurrent form submissions (deferred)
- [ ] Test network error recovery (deferred)

### Phase 3: Test Template System (Day 2)

#### Task 3.1: Create Form Test Factory
- [x] Create `/tests/e2e/forms/form-test-factory.ts`
- [x] Define `FormTestConfig` interface
- [x] Implement `createFormTest()` function
- [x] Support for:
  - [x] Required fields validation
  - [x] Array fields handling
  - [x] Variant vs standard logic
  - [x] Custom verification functions
  - [x] Automatic cleanup

#### Task 3.2: Create Test Templates for Each Form Type
- [x] Create test template configurations:
  - [x] SessionForm (7 categories)
  - [x] PracticeForm (3 categories)
  - [x] AppForm (1 category)
  - [x] PurchaseForm (2 categories) - placeholder
  - [x] CommunityForm (2 categories) - placeholder
  - [x] LifestyleForm (2 categories) - placeholder
  - [x] HobbyForm (1 category) - placeholder
  - [x] FinancialForm (1 category) - placeholder
- [x] Document required fields for each

#### Task 3.3: Create Helper Test Utilities
- [x] Category detection test helpers
- [x] Dropdown option validators - in test-data.ts
- [x] Form field mappers - in form-configs.ts
- [x] Success/error state checkers - in factory
- [x] Performance measurement helpers - deferred

### Phase 4: CI/CD Integration (Day 3)

#### Task 4.1: Create GitHub Actions Workflow
- [x] Create `/.github/workflows/form-tests.yml`
- [x] Configure triggers:
  - [x] On PR to form-related paths
  - [x] On push to main branch
  - [x] Manual trigger option
- [x] Set up test job:
  - [x] Ubuntu latest runner
  - [x] Node 18 setup
  - [x] Dependency caching
  - [x] Playwright installation
  - [x] Test execution
  - [x] Artifact upload

#### Task 4.2: Configure GitHub Secrets
- [x] Add repository secrets documentation
  - [x] `NEXT_PUBLIC_SUPABASE_URL`
  - [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [x] `SUPABASE_SERVICE_KEY`
  - [x] `TEST_GOAL_ID`
- [x] Document secret requirements
- [x] Create setup guide

#### Task 4.3: Update Package.json Scripts
- [x] Add test scripts:
  - [x] `test:forms` - Run all form tests
  - [x] `test:forms:ui` - Run with Playwright UI
  - [x] `test:forms:debug` - Debug mode
  - [x] `test:forms:headed` - Run in headed mode
  - [x] `test:forms:report` - Generate HTML report
  - [x] `test:forms:ci` - CI-optimized with GitHub reporter
- [x] Scripts are ready to use

#### Task 4.4: Create CI/CD Documentation
- [x] Create `/.github/workflows/README.md`
- [x] Create `/docs/testing/github-secrets-setup.md`
- [x] Document workflow triggers
- [x] Document debugging CI failures
- [x] Create nightly test workflow

### Phase 5: Documentation (Completed)

#### Task 5.1: Create Comprehensive Documentation
- [x] Create main testing README at `/docs/testing/README.md`
- [x] Create quick reference guide
- [x] Create `.env.test.local.example` template
- [x] Update main README with testing section
- [x] Document folder structure
- [x] Create troubleshooting guides

#### Task 5.2: Documentation Created
- [x] `/docs/testing/README.md` - Main testing documentation
- [x] `/docs/testing/quick-reference.md` - Quick command reference
- [x] `/tests/STRUCTURE.md` - Test directory structure
- [x] `/.github/workflows/README.md` - CI/CD documentation
- [x] `/docs/testing/github-secrets-setup.md` - Secrets configuration
- [x] `.env.test.local.example` - Environment template

### Ongoing: As Forms Are Built

#### Template for Adding New Form Tests
For each new form implementation:
- [ ] Create form component in `/components/organisms/solutions/forms/`
- [ ] Add form to switch statement in add-solution page
- [ ] Create test file using factory: `/tests/e2e/forms/[form-name].spec.ts`
- [ ] Define required fields from CATEGORY_CONFIG
- [ ] Implement fillForm function
- [ ] Implement verifyData function
- [ ] Test locally: `npm run test:forms -- [form-name]`
- [ ] Verify CI passes
- [ ] Update test documentation

#### Maintenance Tasks
- [ ] Weekly test suite health check
- [ ] Update tests when dropdowns change
- [ ] Monitor test execution time
- [ ] Review and fix flaky tests
- [ ] Update test data fixtures
- [ ] Performance optimization as needed

## 🎯 Success Criteria

### Phase 1 Complete When:
- [ ] Playwright installed and configured
- [ ] Test utilities created and working
- [ ] Environment properly configured
- [ ] Can run a basic test successfully

### Phase 2 Complete When:
- [ ] DosageForm fully tested
- [ ] All 4 dosage categories covered
- [ ] Data integrity verified
- [ ] Edge cases handled

### Phase 3 Complete When:
- [ ] Test factory created
- [ ] Templates ready for all 9 forms
- [ ] Documentation complete

### Phase 4 Complete When:
- [ ] CI/CD pipeline working
- [ ] Tests run on every PR
- [ ] Reports generated
- [ ] Team can run tests locally

### Phase 5 Success Metrics:
- [ ] 9/9 forms have test coverage
- [ ] Test suite runs in < 5 minutes
- [ ] Zero flaky tests
- [ ] Clear failure messages
- [ ] Easy to add new tests

## 🚨 Critical Notes for AI Agents

1. **Database Access**: Tests use SUPABASE_SERVICE_KEY which bypasses RLS. Never commit this key.

2. **Test Isolation**: Always use timestamp-based naming and cleanup after tests.

3. **Form Categories**: Reference CATEGORY_CONFIG in GoalPageClient.tsx for exact field names and dropdown values.

4. **Data Flow**: Remember the flow: Form → Solution → Variant → goal_implementation_links (with solution_fields)

5. **Variants**: Only 4 categories create real variants. Others use "Standard" variant.

6. **Array Fields**: side_effects, challenges, barriers, etc. must remain arrays in solution_fields.

7. **Environment**: Test against localhost:3000 by default. CI uses GitHub secrets.

## 📝 Command Reference

```bash
# Install
npm install -D @playwright/test playwright
npx playwright install

# Run tests
npm run test:forms              # All form tests
npm run test:forms:ui           # With UI
npm run test:forms:debug        # Debug mode
npm run test:forms -- --headed  # See browser

# Run specific test
npm run test:forms -- dosage-form

# Generate report
npx playwright show-report
```

## 🔗 Related Documentation

- Testing Setup Guide: `/testing/testing-setup.md`
- Architecture: `/ARCHITECTURE.md`
- Database Schema: `/docs/database/schema.md`
- Component Structure: `/components/goal/GoalPageClient.tsx`

---

**Next Step**: Begin with Phase 1, Task 1.1 - Install Playwright