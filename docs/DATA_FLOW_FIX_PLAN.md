# Data Flow Fix Implementation Plan

## Overview
Fix the 50% data loss issue identified in DATA_FLOW_AUDIT_FINDINGS.md by adding all missing field aggregations and fixing specific field inconsistencies.

## Implementation Phases

### Phase 1: Add Missing Aggregations (2 hours)
**Goal:** Ensure all user-submitted fields are aggregated for display

1. **Update solution-aggregator.ts** to include all 36 missing fields:
   
   **DosageForm fields to add:**
   - `dosage_amount` (using new naming convention)
   - `dosage_unit` (using new naming convention)
   - `skincare_frequency`
   
   **AppForm fields to add:**
   - `usage_frequency`
   - `subscription_type`
   - `platform`
   
   **PracticeForm fields to add:**
   - `duration`
   - `best_time`
   - `location`
   
   **LifestyleForm fields to add:**
   - `weekly_prep_time`
   - `previous_sleep_hours`
   - `still_following`
   - `sustainability_reason`
   - `social_impact`
   - `sleep_quality_change`
   - `specific_approach`
   - `cost_impact`
   
   **PurchaseForm fields to add:**
   - `purchase_cost_type`
   - `cost_range`
   - `product_type`
   - `ease_of_use`
   - `format`
   - `learning_difficulty`
   - `completion_status`
   
   **CommunityForm fields to add:**
   - `meeting_frequency`
   - `group_size`
   - `payment_frequency`
   - `commitment_type`
   - `accessibility_level`
   - `leadership_style`
   
   **FinancialForm fields to add:**
   - `financial_benefit`
   - `access_time`
   - `provider`
   - `minimum_requirements`
   - `ease_of_use`

2. **Add new aggregation methods** for special field types:
   - Boolean aggregation for `still_following`
   - Array aggregation for `minimum_requirements`

### Phase 2: Fix Field Naming & Location Handling (45 min)
**Goal:** Resolve field naming inconsistencies and duplicate submissions

#### 2A. Standardize Dosage Field Names
**Change dose_amount → dosage_amount throughout:**
1. Update DosageForm.tsx to send `dosage_amount` and `dosage_unit` instead of `dose_amount` and `dose_unit`
2. Update solution-aggregator.ts to aggregate `dosage_amount` and `dosage_unit`
3. This aligns with what GoalPageClient.tsx already expects (line 517)

#### 2B. Move Location to Success Screen Only (PracticeForm)
**Remove location from initial submission:**
1. Remove `location: location` from lines 308 and 312 in PracticeForm.tsx
2. Keep location handling in updateAdditionalInfo (line 386)
3. Update comment on line 321 to be accurate
4. Ensure location field shows in success screen UI for exercise_movement and meditation_mindfulness
5. Consider adding location field to success screen for habits_routines (or remove from updateAdditionalInfo)

### Phase 3: Re-aggregate Existing Data (1 hour)
**Goal:** Update existing data to use new aggregations and field names

1. Create migration script to re-process all existing ratings
2. Update all goal_implementation_links with proper aggregated_fields
3. Handle field name changes (dose_amount → dosage_amount) in migration
4. Verify historical data now displays correctly

### Phase 4: Testing & Validation (1 hour)
**Goal:** Ensure all fixes work correctly

1. Test each form's complete flow
2. Verify dosage fields now display correctly
3. Verify location only sent once (in success screen)
4. Verify all other fields display with actual data
5. Update test expectations for new field names
6. Document any remaining issues

## Expected Outcomes

### After Phase 1:
- All fields will be aggregated (but some with wrong names)
- Most forms will show complete data
- DosageForm still won't show dosage (due to naming mismatch)

### After Phase 2:
- Dosage fields will display correctly
- No more duplicate location submissions
- All field names consistent

### After Phase 3:
- Historical data will display correctly
- All existing ratings will have proper aggregations

### After Phase 4:
- Full system validated and working
- Tests updated to match new behavior
- Any edge cases documented

## Success Criteria

✅ All 9 forms display ALL collected data
✅ No "No data" messages for fields users have submitted
✅ Dosage information displays correctly
✅ Location field handled consistently
✅ No duplicate field submissions
✅ Historical data properly migrated

## Risk Assessment

- **Low risk:** Mostly additive changes to aggregation
- **Medium risk:** Field renaming requires careful migration
- **Mitigation:** Phase-by-phase execution with validation between phases

## Rollback Plan

If issues arise:
1. Aggregation changes can be reverted (data still stored in ratings table)
2. Field name changes can be rolled back with reverse migration
3. All original data preserved in ratings.solution_fields

---

*Plan created: [Current Date]*
*Based on: DATA_FLOW_AUDIT_FINDINGS.md*
*Status: READY FOR EXECUTION*