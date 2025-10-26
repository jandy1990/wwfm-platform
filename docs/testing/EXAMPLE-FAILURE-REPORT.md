# Test Failure Report 🔴

**Generated:** 2025-10-26T14:30:45.123Z
**Source:** `test-results/latest.json`

## Summary

- **Total Tests:** 45
- **Passed:** 42 ✅
- **Failed:** 3 ❌
- **Skipped:** 0 ⏭️
- **Duration:** 125.45s

## Failed Tests

1. [Community Form Complete - Submit with all fields](#1/3-community-form-complete---submit-with-all-fields)
2. [Practice Form Complete - Verify meditation fields](#2/3-practice-form-complete---verify-meditation-fields)
3. [Session Form Complete - Check session frequency](#3/3-session-form-complete---check-session-frequency)

---

## Detailed Failures

### 1/3: Community Form Complete - Submit with all fields

**Location:** `tests/e2e/forms/community-form-complete.spec.ts:45`
**Duration:** 12.34s

**Error:**
```
Expected "Weekly" but got "weekly"
```

**Field Mismatches:**
```
Field Mismatch: meeting_frequency
Expected: Weekly
Actual:   weekly
Source:   Database value doesn't match dropdown option
---
```

**Diagnostic Output (last 20 lines):**
```
✓ Form loaded successfully
✓ Filled meeting_frequency: Weekly
✓ Filled group_size: 10-20 people
✓ Filled cost: Free
✓ Form submitted successfully
✗ Database verification failed
  Field: meeting_frequency
  Expected: Weekly
  Actual:   weekly
  Issue: Case mismatch - form uses "Weekly", database has "weekly"
```

<details>
<summary>Stack Trace</summary>

```
Error: Expected "Weekly" but got "weekly"
    at tests/e2e/forms/community-form-complete.spec.ts:45:10
    at Community Form Complete Test Suite:12:5
    at /node_modules/@playwright/test/lib/worker/testRunner.js:234:15
```
</details>

---

### 2/3: Practice Form Complete - Verify meditation fields

**Location:** `tests/e2e/forms/practice-form-complete.spec.ts:67`
**Duration:** 8.91s

**Error:**
```
Expected practice_length to be "10-20 minutes" but got undefined
```

**Field Mismatches:**
```
Field Mismatch: practice_length
Expected: 10-20 minutes
Actual:   undefined
Source:   Field not saved to database
---
```

**Diagnostic Output (last 20 lines):**
```
✓ Form loaded successfully
✓ Selected category: meditation_mindfulness
✓ Filled practice_length: 10-20 minutes
✓ Filled frequency: Daily
✓ Form submitted successfully
✗ Database verification failed
  Field: practice_length
  Expected: 10-20 minutes
  Actual:   undefined
  Issue: Field not found in aggregated_fields
  Diagnosis: Form may not be saving practice_length to database
```

<details>
<summary>Stack Trace</summary>

```
Error: Expected practice_length to be "10-20 minutes" but got undefined
    at tests/e2e/forms/practice-form-complete.spec.ts:67:15
    at Practice Form Complete Test Suite:23:8
    at /node_modules/@playwright/test/lib/worker/testRunner.js:234:15
```
</details>

---

### 3/3: Session Form Complete - Check session frequency

**Location:** `tests/e2e/forms/session-form-complete.spec.ts:89`
**Duration:** 15.67s

**Error:**
```
TypeError: Cannot read property 'mode' of undefined
```

**Field Mismatches:**
```
Field Mismatch: session_frequency
Expected: DistributionData {mode: "Weekly", values: [...]}
Actual:   "Weekly" (string)
Source:   Type mismatch - expected DistributionData object, got string
---
```

**Diagnostic Output (last 20 lines):**
```
✓ Form loaded successfully
✓ Selected category: therapists_counselors
✓ Filled session_frequency: Weekly
✓ Filled session_length: 45-60 minutes
✓ Filled cost: $100-200
✓ Form submitted successfully
✗ Database verification failed
  Field: session_frequency
  Expected Type: DistributionData object
  Actual Type: string
  Actual Value: "Weekly"
  Issue: Field stored as string instead of DistributionData
  Diagnosis: Aggregation script may not have converted to DistributionData format
```

<details>
<summary>Stack Trace</summary>

```
TypeError: Cannot read property 'mode' of undefined
    at GoalPageClient.tsx:245:30
    at tests/e2e/forms/session-form-complete.spec.ts:89:12
    at Session Form Complete Test Suite:34:7
    at /node_modules/@playwright/test/lib/worker/testRunner.js:234:15
```
</details>

---

---

**How to use this report:**
1. Read the Summary to understand overall test health
2. Check Field Mismatches first (most actionable)
3. Review Error messages for assertion failures
4. Use Diagnostic Output for detailed debugging
5. Expand Stack Traces if you need file/line numbers

**Pro tip:** Search for specific test names using Ctrl+F

