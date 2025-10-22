# E2E Test Fixing Plan - October 2, 2025

## 📊 Current Situation

**Test Status:** 83/93 passing (89.2%)
**Remaining Failures:** 10 tests across 4 forms
**Blocking Issue:** Authentication setup failing, preventing new test runs

---

## 🎯 Overall Goal

Get all 93 E2E tests passing (100% success rate)

---

## 📋 Detailed Action Plan

### Phase 1: Unblock Testing Infrastructure ⚡ **CRITICAL**

**Current Blocker:** Global auth setup times out during login redirect

**Problem Analysis:**
- Test user exists and is confirmed in database
- Signin page loads successfully
- Login redirect times out at line 69 of `global-setup.ts`
- Expected redirect pattern: `/\/(dashboard|goal|$)/`
- Timeout: 10 seconds

**Root Cause Investigation:**
1. Check actual redirect URL after successful login
2. Verify redirect pattern matches current app behavior
3. May have changed from `/dashboard` to `/home` or root `/`

**Implementation Steps:**
1. Read `app/auth/signin/page.tsx` to understand redirect logic
2. Check `app/page.tsx` to see if home page is the default redirect
3. Update redirect pattern in `tests/setup/global-setup.ts` line 69:
   ```typescript
   // Current:
   await page.waitForURL(/\/(dashboard|goal|$)/, { timeout: 10000 })

   // Proposed:
   await page.waitForURL(/\/(dashboard|goal|home|$)/, { timeout: 30000 })
   ```
4. Increase timeout from 10s to 30s to account for database operations
5. Test by running smoke tests

**Files to Modify:**
- `tests/setup/global-setup.ts` (line 69)

**Success Criteria:**
- Auth setup completes without errors
- `tests/setup/auth.json` is created
- Smoke tests can run

**Estimated Time:** 30 minutes

---

### Phase 2: Fix FinancialForm Submission Hanging 🔧 **HIGH PRIORITY**

**Affected Tests:** 2 tests (FinancialForm complete test + factory test)

**Problem Analysis:**
- Submit button visible, enabled, and clicked
- Success screen never appears (30 second timeout)
- No error alerts or console logs
- Still on Step 3 after submit
- `submitSolution` server action may be hanging

**Root Cause Investigation:**
1. Check if `handleSubmit` is being called (add browser console logging)
2. Verify `submitSolution` server action receives the request
3. Check database operations in `submit-solution.ts` for bottlenecks
4. Measure execution time of `check_and_execute_transition` RPC function
5. Verify database client connection in test environment

**Diagnostic Actions:**
1. Add detailed console logging to FinancialForm.tsx `handleSubmit` (line 262):
   ```typescript
   const handleSubmit = async () => {
     console.log('[FinancialForm] handleSubmit called');
     setIsSubmitting(true);
     console.log('[FinancialForm] State set to submitting');

     try {
       console.log('[FinancialForm] Calling submitSolution with:', submissionData);
       const result = await submitSolution(submissionData);
       console.log('[FinancialForm] submitSolution returned:', result);
       // ...
   ```

2. Add granular timing logs to `submit-solution.ts`:
   ```typescript
   console.log('[submitSolution] Step 1: Auth check - START');
   const startTime = Date.now();
   // ... operation
   console.log(`[submitSolution] Step 1: Auth check - COMPLETE (${Date.now() - startTime}ms)`);
   ```

3. Test RPC function performance:
   ```sql
   EXPLAIN ANALYZE
   SELECT check_and_execute_transition(
     '56e2801e-0d78-4abd-a795-869e5b780ae7'::uuid,
     'variant-id'::uuid
   );
   ```

**Implementation Options:**

**Option A: Add Timeout Handling (Quick Fix)**
```typescript
// In FinancialForm.tsx handleSubmit
const submitWithTimeout = async () => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Submission timed out after 20 seconds')), 20000)
  );

  try {
    const result = await Promise.race([
      submitSolution(submissionData),
      timeout
    ]);
    return result;
  } catch (error) {
    if (error.message.includes('timed out')) {
      alert('Submission is taking longer than expected. Please try again.');
    }
    throw error;
  }
};
```

**Option B: Optimize Database Operations (Proper Fix)**
- Profile each database query in `submit-solution.ts`
- Add database indexes if needed
- Make `check_and_execute_transition` non-blocking
- Use database transactions for faster writes

**Option C: Debug-First Approach (Recommended)**
1. Run test with browser console logging enabled
2. Check server logs during test execution
3. Identify which step hangs
4. Apply targeted fix based on findings

**Files to Modify:**
- `components/organisms/solutions/forms/FinancialForm.tsx` (line 262-323)
- `app/actions/submit-solution.ts` (add timing logs throughout)
- Potentially database indexes or RPC function

**Success Criteria:**
- FinancialForm submissions complete within 30 seconds
- Success screen appears reliably
- 2 FinancialForm tests pass

**Estimated Time:** 2-3 hours (1 hour investigation, 1-2 hours implementation)

---

### Phase 3: Fix PurchaseForm Failure 🛠️ **MEDIUM PRIORITY**

**Affected Tests:** 1 test (PurchaseForm complete test)

**Problem Analysis:**
- New failure that appeared in Run #2
- Could be related to books_courses filler changes
- Could be related to products_devices "None" database addition
- Need logs to diagnose

**Root Cause Investigation:**
1. Run test individually with full logging
2. Check which category is being tested (books_courses or products_devices)
3. Verify database "None" option was added correctly
4. Check if new fillPurchaseForm code works correctly

**Implementation Steps:**
1. Run diagnostic test:
   ```bash
   PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000 \
   npx playwright test tests/e2e/forms/purchase-form-complete.spec.ts \
   --reporter=list --project=chromium 2>&1 | tee /tmp/purchase-debug.log
   ```

2. Analyze logs to identify failure point

3. Based on failure type, apply fix:
   - **If "None" not found:** Verify SQL insert succeeded
   - **If field validation failed:** Check required fields for category
   - **If Continue button disabled:** Debug fillPurchaseForm filler logic
   - **If category detection failed:** Check auto-categorization logic

4. Verify database state:
   ```sql
   SELECT category, label FROM challenge_options
   WHERE category IN ('books_courses', 'products_devices')
   AND label = 'None';
   ```

**Files to Potentially Modify:**
- `tests/e2e/forms/form-specific-fillers.ts` (fillPurchaseForm function)
- `lib/config/solution-fields.ts` (if validation is wrong)
- Database (if "None" option missing)

**Success Criteria:**
- 1 PurchaseForm test passes
- No regression in books_courses handling

**Estimated Time:** 1-2 hours

---

### Phase 4: Fix SessionForm Browser Crashes 💥 **MEDIUM PRIORITY**

**Affected Tests:** 3 tests (crisis_resources, doctors_specialists variants)

**Problem Analysis:**
- "Page context lost during form fill" errors
- Browser crashes after 90-second timeout
- Suggests memory leak or infinite render loop
- SessionForm is complex with many fields and database queries

**Root Cause Investigation:**
1. Check SessionForm.tsx for useEffect issues:
   ```typescript
   // Look for patterns like:
   useEffect(() => {
     setSomeState(value); // This could trigger this useEffect again!
   }, [someState]); // Infinite loop
   ```

2. Check database query performance:
   ```sql
   EXPLAIN ANALYZE
   SELECT label FROM challenge_options
   WHERE category = 'crisis_resources' AND is_active = true;

   EXPLAIN ANALYZE
   SELECT label FROM side_effect_options
   WHERE category = 'crisis_resources' AND is_active = true;
   ```

3. Add memory monitoring to test:
   ```typescript
   page.on('console', msg => {
     console.log(`[BROWSER ${msg.type()}]:`, msg.text());
   });

   page.on('pageerror', error => {
     console.log('[PAGE ERROR]:', error.message);
   });
   ```

4. Try running test with headed browser to observe behavior

**Potential Issues:**
- **Issue A:** useEffect dependencies causing render loops
- **Issue B:** Database queries timing out
- **Issue C:** Too many DOM elements causing memory issues
- **Issue D:** Test timeout too aggressive for SessionForm complexity

**Implementation Options:**

**Option A: Fix Render Loops**
- Review all useEffect hooks in SessionForm.tsx
- Add proper dependency arrays
- Use useCallback for functions
- Add early returns to prevent unnecessary renders

**Option B: Optimize Database Queries**
- Add indexes to challenge_options and side_effect_options
- Batch queries instead of multiple individual queries
- Cache results in React state

**Option C: Increase Test Timeout**
- Change test timeout from 90s to 120s
- Add more generous wait times in fillSessionForm
- Use waitForLoadState('networkidle') before interactions

**Option D: Simplify SessionForm Loading**
- Add loading state that blocks rendering until data ready
- Lazy load challenges and side effects
- Reduce number of simultaneous state updates

**Files to Potentially Modify:**
- `components/organisms/solutions/forms/SessionForm.tsx` (useEffect hooks)
- `tests/e2e/forms/form-specific-fillers.ts` (fillSessionForm, add delays)
- `tests/e2e/forms/session-form-complete.spec.ts` (increase timeout)
- Database (add indexes if needed)

**Success Criteria:**
- 3 SessionForm tests pass without crashes
- No "Page context lost" errors
- Tests complete within 120 seconds

**Estimated Time:** 2-3 hours (SessionForm is complex)

---

### Phase 5: Verify CommunityForm Fix ✅ **LOW PRIORITY**

**Affected Tests:** 1 test (CommunityForm groups_communities)

**Problem Analysis:**
- "None" option was missing from database
- SQL fix already applied in previous session
- Should pass on next test run

**Verification Steps:**
1. Confirm database has "None" option:
   ```sql
   SELECT category, label, display_order FROM challenge_options
   WHERE category = 'groups_communities' AND label = 'None';
   ```

2. Run test to verify:
   ```bash
   PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000 \
   npx playwright test tests/e2e/forms/community-form-complete.spec.ts \
   --reporter=list --project=chromium
   ```

**Files to Modify:**
- None (fix already applied)

**Success Criteria:**
- 1 CommunityForm test passes
- "None" option visible and selectable

**Estimated Time:** 15 minutes (verification only)

---

## 📅 Execution Timeline

### Session 1 (2-3 hours) - **Unblock and Diagnose**
1. ✅ **Phase 1:** Fix global-setup auth redirect (30 min)
2. ✅ **Phase 5:** Verify CommunityForm fix (15 min)
3. ✅ **Phase 2 Part 1:** Add diagnostic logging to FinancialForm (30 min)
4. ✅ **Phase 2 Part 2:** Run diagnostic test and analyze (1 hour)

**Session 1 Target:** 84-85/93 tests passing (CommunityForm fixed, FinancialForm diagnosed)

---

### Session 2 (2-3 hours) - **Fix Critical Issues**
5. ✅ **Phase 2 Part 3:** Implement FinancialForm fix (1-2 hours)
6. ✅ **Phase 3:** Debug and fix PurchaseForm (1-2 hours)

**Session 2 Target:** 86-87/93 tests passing (FinancialForm + PurchaseForm fixed)

---

### Session 3 (2-3 hours) - **Fix Complex Issues and Verify**
7. ✅ **Phase 4:** Debug and fix SessionForm crashes (2-3 hours)
8. ✅ **Final Run:** Execute full test suite to verify all 93 tests pass

**Session 3 Target:** 93/93 tests passing (100% success!)

---

## 📊 Success Metrics

| Phase | Metric | Target |
|-------|--------|--------|
| Phase 1 | Auth setup success | 100% |
| Phase 2 | FinancialForm tests passing | 2/2 |
| Phase 3 | PurchaseForm tests passing | 1/1 |
| Phase 4 | SessionForm tests passing | 3/3 |
| Phase 5 | CommunityForm tests passing | 1/1 |
| **TOTAL** | **Overall test pass rate** | **93/93 (100%)** |

---

## 🚨 Risk Mitigation

### Risk 1: Auth Setup Cannot Be Fixed
**Impact:** Cannot run any tests
**Mitigation:**
- Try manual login and copy auth.json from successful session
- Update global-setup to skip if auth.json already exists
- Use headed browser mode to debug exact redirect URL

### Risk 2: FinancialForm Fix Requires Backend Changes
**Impact:** May need database optimization or RPC changes
**Mitigation:**
- Start with client-side timeout handling
- Profile database queries to identify bottlenecks
- Add retry logic as temporary workaround

### Risk 3: SessionForm Crashes Cannot Be Reproduced
**Impact:** Hard to debug without consistent reproduction
**Mitigation:**
- Run tests multiple times to find pattern
- Use headed browser to observe crash behavior
- Add extensive logging to narrow down crash point

### Risk 4: Time Overruns
**Impact:** May not complete all phases in estimated time
**Mitigation:**
- Prioritize Phase 1 and 2 (auth + FinancialForm)
- Document partial progress in HANDOVER.md
- Create clear reproduction steps for remaining issues

---

## 📁 Files That Will Be Modified

### Confirmed Modifications
1. `tests/setup/global-setup.ts` - Auth redirect pattern and timeout
2. `components/organisms/solutions/forms/FinancialForm.tsx` - Add logging/timeout handling
3. `app/actions/submit-solution.ts` - Add timing logs

### Potential Modifications (Based on Findings)
4. `tests/e2e/forms/form-specific-fillers.ts` - PurchaseForm and SessionForm fillers
5. `components/organisms/solutions/forms/SessionForm.tsx` - Fix render loops
6. `tests/e2e/forms/session-form-complete.spec.ts` - Increase timeout
7. `lib/config/solution-fields.ts` - If validation rules need adjustment
8. Database - Indexes or additional "None" options if needed

---

## 🎯 Final Deliverables

1. **All 93 tests passing** at 100% success rate
2. **Updated HANDOVER.md** with final test results
3. **Test execution log** documenting all runs and improvements
4. **Performance baseline** for future regression testing
5. **Documentation** of any workarounds or known issues

---

## 💡 Key Principles

1. **Investigate before fixing** - Always understand root cause first
2. **One issue at a time** - Don't batch fixes without testing
3. **Document everything** - Log findings for future reference
4. **Test after each fix** - Verify improvement before moving on
5. **Preserve working tests** - Don't introduce regressions

---

**Plan Created:** October 2, 2025, 7:45 AM
**Total Estimated Time:** 6-9 hours across 3 sessions
**Confidence Level:** High for Phases 1-3, Medium for Phase 4
**Ready to Execute:** YES (awaiting user approval)
