# Chrome DevTools E2E Testing Framework

## Overview
Comprehensive end-to-end testing system for all WWFM forms using Chrome DevTools MCP tools.

## Directory Structure

```
chrome-devtools-testing/
├── README.md                 # This file
├── types/
│   ├── test-data.ts         # TypeScript types for all test data
│   └── tracking.ts          # Types for submission tracking
├── helpers/
│   ├── navigation.ts        # Navigation helper functions
│   ├── form-filling.ts      # Form interaction utilities
│   ├── devtools.ts          # Chrome DevTools wrappers
│   └── database.ts          # Supabase verification utilities
├── data/
│   ├── test-solutions.ts    # Test data for all 23 categories
│   └── test-goals.ts        # Test goal configurations
├── tracking/
│   ├── submissions.json     # Submission tracking database
│   └── dashboard.html       # Visual progress dashboard
├── scripts/
│   ├── test-single-category.ts    # Test one category
│   ├── test-template.ts           # Test one template
│   ├── test-all-forms.ts          # Run complete test suite
│   └── cleanup-test-data.ts       # Remove all test data
├── results/
│   ├── screenshots/         # Screenshots of submissions
│   └── logs/               # Error logs and debug info
└── docs/
    ├── TESTING-GUIDE.md    # How to use this framework
    └── RESULTS.md          # Live test results
```

## Quick Start

### Run All Tests
```bash
npm run test:devtools:all
```

### Test Single Category
```bash
npm run test:devtools:category -- supplements_vitamins
```

### Test Single Template
```bash
npm run test:devtools:template -- DosageForm
```

### View Results Dashboard
```bash
open chrome-devtools-testing/tracking/dashboard.html
```

### Cleanup Test Data
```bash
npm run test:devtools:cleanup
```

## Test Data Naming Convention

All test solutions follow this pattern:
- **Format**: `"[Solution Name] (DevTools Test)"`
- **Examples**:
  - `"Vitamin D (DevTools Test)"`
  - `"Headspace (DevTools Test)"`
  - `"CBT Therapist (DevTools Test)"`

This ensures easy identification and cleanup of test data.

## Coverage Goals

**Target**: Test all 23 category variations across 9 form templates

**Progress**: 2/23 categories complete ✅

**Testing Strategy**: Template-by-template systematic testing
1. Complete all DosageForm categories (4 total)
2. Complete all SessionForm categories (7 total)
3. Complete all PracticeForm categories (3 total)
4. Complete remaining templates (9 categories)

**Quality Checks**:
- ✅ Database verification (solutions, variants, ratings, goal_implementation_links)
- ✅ Frontend display validation
- ✅ Field validation against SSOT
- ✅ Complete cleanup capability

## Features

### Navigation Helpers
- Auto-navigate to goal pages
- Open "Share What Worked" modal
- Handle authentication flows
- Navigate through form steps

### Form Filling
- Category-specific field population
- Smart wait for form elements
- Handle dropdowns, checkboxes, text inputs
- Submit and capture success state

### Database Verification
- Query Supabase via MCP tools
- Verify solution creation
- Check variant records
- Validate goal_implementation_links
- Confirm aggregated_fields

### Frontend Validation
- Navigate to goal page
- Verify solution appears in list
- Check effectiveness display
- Validate category-specific fields
- Screenshot solution cards

### Cleanup
- Delete ratings records
- Remove test solutions
- Clean up variants
- Update goal_implementation_links
- No orphaned data

## Architecture

### Data Flow Validation
```
Form Input → submitSolution action
           ↓
    solutions table → solution_variants table
           ↓
    ratings table → goal_implementation_links table
           ↓
    Frontend Display (GoalPageClient)
```

Each test validates every step of this pipeline.

## Test Results

See `docs/RESULTS.md` for detailed test execution results and screenshots.

---

## ⚠️ IMPORTANT UPDATE: Playwright Testing for SessionForm Cost Validation

### Background
Automated testing through Chrome DevTools MCP encountered significant challenges with React's controlled components, rapid re-renders, and modal state management. The form's multi-step wizard pattern with async field rendering makes raw DevTools automation unreliable.

### Recommended Testing Approach

**Option 1: Playwright E2E Tests (RECOMMENDED)**

A complete Playwright test suite has been created: `playwright/session-form-cost-validation.spec.ts`

**Prerequisites:**
```bash
npm install -D @playwright/test
npx playwright install chromium
```

**Run tests:**
```bash
# Ensure dev server is running
npm run dev

# In another terminal, run Playwright tests
npx playwright test chrome-devtools-testing/playwright/session-form-cost-validation.spec.ts

# Run with UI mode for debugging
npx playwright test chrome-devtools-testing/playwright/session-form-cost-validation.spec.ts --ui

# Run specific test
npx playwright test -g "therapists_counselors"
```

**What the tests verify:**
- ✅ Form loads and accepts solution name
- ✅ Auto-categorization detects correct category
- ✅ Cost radio buttons visible/hidden correctly:
  - `therapists_counselors`, `coaches_mentors`, `alternative_practitioners`, `doctors_specialists`: NO radio (per-session only)
  - `professional_services`: Per-session/Monthly radio
  - `medical_procedures`: Per-session/Monthly/Total 3-way radio
  - `crisis_resources`: Static dropdown, no radio
- ✅ Cost dropdown shows correct options for each category
- ✅ Form submission succeeds
- ✅ Screenshots captured for manual review

**Option 2: Manual Testing Checklist**

See `SESSION_FORM_TEST_RESULTS.md` for detailed manual testing checklist for all 7 SessionForm categories.

**Quick manual test:**
1. Navigate to: http://localhost:3001/goal/56e2801e-0d78-4abd-a795-869e5b780ae7
2. Click "Share What Worked"
3. Enter solution name: "CBT Therapist (DevTools Test)"
4. Fill form fields
5. **CRITICAL**: Check if cost radio buttons are visible
6. **CRITICAL**: Check cost dropdown options format
7. Submit and verify success

**Option 3: Browser Console Testing**

See `SESSION_FORM_TEST_RESULTS.md` for JavaScript console testing scripts.

### Test Data for SessionForm Categories

| Category | Test Solution Name | Expected Cost UI |
|----------|-------------------|------------------|
| therapists_counselors | CBT Therapist (DevTools Test) | NO radio buttons |
| coaches_mentors | Life Coach (DevTools Test) | NO radio buttons |
| alternative_practitioners | Acupuncturist (DevTools Test) | NO radio buttons |
| doctors_specialists | Psychiatrist (DevTools Test) | NO radio buttons |
| professional_services | Personal Trainer (DevTools Test) | Per-session/Monthly radio |
| medical_procedures | Physical Therapy (DevTools Test) | 3-way radio |
| crisis_resources | Crisis Hotline (DevTools Test) | Static dropdown |

All test data defined in: `data/test-solutions.ts`

### Known Chrome DevTools MCP Limitations

The Chrome DevTools MCP has challenges with:
- React controlled components (rapid re-renders)
- Stale snapshot UIDs
- Modal state management
- Async form field rendering

**Solution**: Use Playwright instead of raw DevTools commands for complex form testing.
