# Testing Quick Reference

## 🚀 Essential Commands

```bash
# Run all tests
npm run test:forms

# Run specific form
npm run test:forms -- dosage-form

# Debug with UI
npm run test:forms:ui

# Debug single test
npm run test:forms:debug -- -g "medications"

# View report
npm run test:forms:report
```

## 🔑 Environment Setup

Create `.env.test.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://wqxkhxdbxdtpuvuvgirx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...  # Get from .env.local
SUPABASE_SERVICE_KEY=eyJhbGc...           # Get from Supabase dashboard
TEST_GOAL_ID=91d4a950-bb87-4570-b32d-cf4f4a4bb20d
```

## 📁 Key Files

- **Test Factory**: `/tests/e2e/forms/form-test-factory.ts`
- **Form Configs**: `/tests/e2e/forms/form-configs.ts`
- **Test Helpers**: `/tests/e2e/utils/test-helpers.ts`
- **Test Data**: `/tests/e2e/fixtures/test-data.ts`

## ✅ Testing Checklist

Before pushing:
- [ ] Run tests locally
- [ ] Check no hardcoded waits
- [ ] Verify cleanup works
- [ ] Update selectors if UI changed
- [ ] Add new tests for new features

## 🐛 Debug Tips

1. **Can't find element**: Use `page.pause()` to inspect
2. **Timeout errors**: Increase timeout or check selectors
3. **Data not saved**: Check form validation errors
4. **Flaky tests**: Add proper waits, not `waitForTimeout`

## 📝 Test Pattern

```typescript
test('form name: test description', async ({ page }) => {
  // Arrange
  const testData = generateTestSolution('category')
  
  // Act
  await page.goto(`/goal/${TEST_GOAL_ID}/add-solution`)
  // ... fill form
  
  // Assert
  const result = await verifyDataPipeline(testData.title, 'category')
  expect(result.success).toBe(true)
  
  // Cleanup
  await cleanupTestData(testData.title)
})
```

## 🎯 Selectors Priority

1. `data-testid` attributes (best)
2. Role/label selectors
3. Text content
4. CSS selectors (avoid if possible)

## 🔄 CI/CD

- Tests run on every PR
- Add GitHub secrets for deployment
- Check Actions tab for results
- Download artifacts for debugging

## 💡 Pro Tips

- Use `test.only` for focused development
- Run `npx playwright codegen` to generate selectors
- Add `await page.screenshot()` for debugging
- Use `test.describe` to group related tests
- Keep tests independent - no shared state!

---

**Need help?** Check `/docs/testing/README.md` for full documentation.