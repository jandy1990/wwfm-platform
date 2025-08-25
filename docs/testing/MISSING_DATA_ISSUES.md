# Missing Test Data Issues

> **Created**: January 26, 2025  
> **Purpose**: Track missing database data that affects test execution

## Critical Data Gaps

### 1. FinancialForm - Missing Challenge Options ⚠️

**Table**: `challenge_options`  
**Issue**: No data for `category = 'financial_products'`  
**Impact**: Form falls back to hardcoded values, causing timing issues in tests  
**Discovery**: Test was timing out trying to click "None" option before async load completed

**Query that returns empty**:
```sql
SELECT * FROM challenge_options 
WHERE category = 'financial_products' 
AND is_active = true 
ORDER BY display_order;
-- Returns: []
```

**Current Workaround**: 
- Form uses fallback array defined in FinancialForm.tsx (lines 168-182)
- BUT: The fallback is NOT working - challenges never appear!
- Test updated to skip challenge selection and continue anyway
- Form submission still works without selecting challenges 

**Root Cause**: The form is stuck in `loading = true` state, never showing challenge options

**Permanent Fix Needed**:
1. Fix the async loading issue in FinancialForm (setLoading not being called?)
2. Populate the `challenge_options` table with financial_products data
3. OR: Remove database dependency and use only hardcoded values (like AppForm does)

### 2. Search Function Database Error

**Error**: Search function throwing database errors
**Impact**: Dropdown search shows errors but still works
**Discovery**: Found in HobbyForm test console logs

**Error Message**:
```
Error searching keywords as solutions: {
  code: 42804, 
  details: Returned type character varying(50) does not match expected type text in column 2., 
  hint: null, 
  message: structure of query does not match function result type
}
```

**Current Impact**: 
- Search still returns results despite errors
- May affect performance
- Should be fixed to prevent future issues

### 3. Other Forms to Check

Need to verify if similar issues exist for:
- [ ] HobbyForm - challenge options
- [ ] PurchaseForm - challenge options  
- [ ] DosageForm - side effects options

## Recommended Actions

1. **Immediate**: Update tests to handle async loading with proper waits
2. **Short-term**: Document all missing data in this file
3. **Long-term**: Either populate tables or standardize on hardcoded values

## Notes

- AppForm doesn't use database for challenges (hardcoded array)
- This inconsistency between forms causes confusion
- Consider standardizing approach across all forms