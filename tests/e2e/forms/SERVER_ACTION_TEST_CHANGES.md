# Test Factory Updates for Server Action

## Overview
The test factory has been updated to align with the new server action submission logic. This document outlines the changes made and any remaining work needed.

## Key Changes Made

### 1. Data Pipeline Verification (`test-helpers.ts`)
- ✅ Updated `verifyDataPipeline` to check for `user_ratings` table entries
- ✅ Modified to expect `solution_fields` on `goal_implementation_links` (not `solutions`)
- ✅ Added category verification to ensure correct categorization
- ✅ Made field validation more flexible (server action handles defaults)

### 2. Test Factory (`form-test-factory.ts`)
- ✅ Updated variant verification logic for beauty_skincare (uses Standard variant)
- ✅ Modified field count expectations (server action may store minimal fields)
- ✅ Added user rating verification when available

### 3. Form Configurations (`form-configs.ts`)
- ✅ Added note about beauty_skincare variant handling
- ✅ Kept `requiredFields` empty (server action handles validation)

## How Server Action Changes Impact Tests

### Data Storage Location
| Field | Old Location | New Location |
|-------|-------------|--------------|
| solution_fields | solutions table | goal_implementation_links table |
| effectiveness | solutions table | goal_implementation_links + user_ratings |
| time_to_results | solutions table | goal_implementation_links |
| User-specific ratings | N/A | user_ratings table |

### Variant Creation
- **Dosage categories** (medications, supplements_vitamins, natural_remedies): Create specific variants like "200mg capsule"
- **Beauty/Skincare**: Uses DosageForm but creates "Standard" variant
- **All other categories**: Create "Standard" variant

### New Tables Involved
1. `user_ratings` - Individual user ratings (when authenticated)
2. `failed_solution_ratings` - Failed solutions tracking
3. `goal_implementation_links` - Now stores all form fields in `solution_fields` JSONB

## Test Execution

The tests should still pass because:
1. UI interactions remain the same
2. Generic form filler adapts to form structure
3. Verification now checks correct tables
4. Field validation is more flexible

## Running Tests

```bash
# Run all form tests
npm run test:forms

# Run specific form test
npm run test:forms -- dosage-form

# Run with UI to see interactions
npm run test:forms:ui

# Debug mode for troubleshooting
npm run test:forms:debug
```

## What Tests Verify

1. ✅ Form submission creates solution
2. ✅ Correct variant type created (dosage vs Standard)
3. ✅ Goal implementation link created
4. ✅ Solution fields stored (location updated)
5. ✅ User rating created (when authenticated)
6. ✅ Category correctly assigned

## Known Limitations

1. **Anonymous Users**: Tests may not create `user_ratings` entries for anonymous users
2. **Failed Solutions**: Not currently tested (could be added)
3. **Duplicate Prevention**: Not tested (server action prevents duplicates)
4. **Auto-approval**: Not tested (solutions auto-approve at 3+ ratings)

## Recommended Additional Tests

1. **Duplicate Prevention Test**
   - Submit same solution twice
   - Verify second submission is rejected

2. **Failed Solutions Test**
   - Add failed solutions during form submission
   - Verify `failed_solution_ratings` entries created

3. **Auto-approval Test**
   - Submit 3+ ratings for same solution
   - Verify `is_approved` flag updates

4. **SessionStorage Backup Test**
   - Fill form partially
   - Navigate away and return
   - Verify data restored

## Summary

The test factory has been updated to work with the new server action submission logic. The main changes involve:
- Verifying data in the correct tables
- More flexible field validation
- Checking for user ratings when available
- Correct variant type expectations

Tests should continue to work with minimal changes because the UI flow remains the same, and the verification logic has been updated to check the new data structure.