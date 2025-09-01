⚠️⚠️⚠️ **IMPORTANT FOR AI ASSISTANTS** ⚠️⚠️⚠️

# Files in /archive That Contain OUTDATED Field Names

## DO NOT USE THESE FILES AS REFERENCE FOR FIELD NAMES:

### Files with WRONG field names:
1. **WWFM Forms Field Matrix - ACTUAL Implementation - ARCHIVED 2025-01.md**
   - Uses `barriers` instead of `challenges`
   - Uses `issues` instead of `challenges`
   - Uses `time_to_enjoyment` instead of `time_to_results`
   - Uses `skincareFrequency` instead of `skincare_frequency`
   - Uses `long_term_sustainability` instead of `still_following`

2. **FORMS_DATA_FLOW_ANALYSIS.md**
   - Contains old field name references
   - Analysis is outdated

3. **FORMS_DATA_FLOW_ANALYSIS_COMPLETE.md**
   - References `issues` and `barriers`
   - Contains outdated field mappings

4. **DATA_FLOW_FIX_PLAN.md**
   - References old field names like `weekly_prep_time`, `sustainability_reason`
   - Plan has been superseded

5. **FORM_DATA_FLOW_MATRIX.md**
   - Contains outdated field mappings
   - References old naming conventions

## ✅ USE THESE INSTEAD:

### For Current Field Names:
- `/docs/WWFM Solution Fields Matrix - Code-Aligned.md` - THIS IS THE SOURCE OF TRUTH
- `/docs/WWFM Solution Generation Instructions.md` - Updated with correct names
- `/scripts/ai-solution-generator/config/category-fields.ts` - The actual generator config

### For Current Implementation:
- The actual form files in `/components/organisms/solutions/forms/`
- `/components/goal/GoalPageClient.tsx` - CATEGORY_CONFIG

## Summary of Correct Field Names:

| Old (WRONG) | Current (CORRECT) |
|-------------|-------------------|
| `barriers` | `challenges` |
| `issues` | `challenges` |
| `time_to_enjoyment` | `time_to_results` |
| `time_to_impact` | `time_to_results` |
| `skincareFrequency` | `skincare_frequency` |
| `long_term_sustainability` | `still_following` |
| `adjustment_period` | `previous_sleep_hours` |
| `prep_time` | `weekly_prep_time` |
| `sustainability` | `still_following` |
| `service_type` | `specialty` |

## Important Note:
All forms now save fields with snake_case naming and there are NO transformations needed. The system is fully aligned:
- Forms save the correct names
- Generator expects the correct names
- Display shows the correct names
- Documentation reflects the correct names

Date: January 2025
Last verified: Today