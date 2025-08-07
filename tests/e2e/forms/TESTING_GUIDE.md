# WWFM Forms Testing Guide

## 🚀 Quick Start

All 9 forms now have automated Playwright tests configured! Here's how to run them:

### Run All Tests (Recommended First Step)
```bash
# Run all form tests with summary report
npm run test:forms:all

# Run with UI to see what's happening
npm run test:forms:ui

# Run specific form test
npm run test:forms -- app-form
```

### Validate Database After Tests
```bash
# Check that test data was saved correctly
npm run test:forms:validate
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run test:forms` | Run all form tests headlessly |
| `npm run test:forms:all` | Run all tests with detailed reporting |
| `npm run test:forms:ui` | Run tests with Playwright UI |
| `npm run test:forms:debug` | Debug mode for troubleshooting |
| `npm run test:forms:headed` | Run tests with visible browser |
| `npm run test:forms:validate` | Validate database after tests |
| `npm run test:forms -- [form-name]` | Run specific form test |

## 🧪 What Gets Tested

Each form test validates:
1. ✅ Form renders correctly
2. ✅ All required fields can be filled
3. ✅ Data saves to correct database tables
4. ✅ Solution variants created properly
5. ✅ Array fields (challenges, side_effects, etc.) stored as arrays
6. ✅ Effectiveness ratings saved
7. ✅ Navigation works (multi-step forms)
8. ✅ Success screen displays

## 📊 Forms Coverage

| Form | Categories | Test Status |
|------|------------|-------------|
| DosageForm | 4 (medications, supplements, etc.) | ✅ Configured |
| AppForm | 1 (apps_software) | ✅ Configured |
| SessionForm | 7 (therapists, doctors, etc.) | ✅ Configured |
| PracticeForm | 3 (meditation, exercise, habits) | ✅ Configured |
| PurchaseForm | 2 (products, books) | ✅ Configured |
| CommunityForm | 2 (support groups, communities) | ✅ Configured |
| LifestyleForm | 2 (diet, sleep) | ✅ Configured |
| HobbyForm | 1 (hobbies_activities) | ✅ Configured |
| FinancialForm | 1 (financial_products) | ✅ Configured |

**Total: 23 categories across 9 forms**

## 🔍 Troubleshooting

### Tests Failing?

1. **Check form structure**: Forms may have changed since tests were written
   ```bash
   npm run test:forms:debug -- failing-form
   ```

2. **Update selectors**: Use Playwright Inspector to find correct selectors
   ```bash
   npx playwright codegen http://localhost:3002/goal/[goal-id]/add-solution
   ```

3. **Verify dropdown options**: Check that test data matches actual form options

### Common Issues

- **"Element not found"**: Form structure changed, update selectors in `form-configs.ts`
- **"Invalid option"**: Dropdown values changed, update test data
- **"Foreign key violation"**: Solution already exists, cleanup may have failed
- **"Timeout"**: Form may be loading slowly, add wait conditions

## 📈 Next Steps

1. **Run initial test suite**: 
   ```bash
   npm run test:forms:all
   ```

2. **Fix any failing tests**: Update configurations based on actual form behavior

3. **Run database validation**:
   ```bash
   npm run test:forms:validate
   ```

4. **Set up CI/CD**: Tests are ready for GitHub Actions integration

## 🎯 Manual Testing Checklist

While automated tests cover the main flow, also manually verify:

- [ ] Mobile responsiveness (test on actual device)
- [ ] Form validation messages appear correctly
- [ ] Back button preserves entered data
- [ ] Success screen shows correct information
- [ ] Failed solutions search works
- [ ] Auto-categorization suggests correct form

## 📝 Updating Tests

When forms change:

1. Update test configuration in `/tests/e2e/forms/form-configs.ts`
2. Run the specific form test to verify
3. Update this documentation if needed

---

**Questions?** Check the test output for specific error messages, or run tests in debug mode to see exactly what's happening.
