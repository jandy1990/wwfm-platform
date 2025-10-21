# Bug Report: human_rating_count Not Syncing

## Issue
`goal_implementation_links.human_rating_count` remains at 0 even when human ratings exist, causing solutions not to display on the frontend.

## Root Cause
**Race condition in the submission flow:**

### Current Flow (BROKEN):
1. **Step 5** (`submit-solution.ts:380`): Rating inserted into `ratings` table
2. **Trigger fires**: `increment_human_rating_count()` tries to UPDATE `goal_implementation_links`
3. **UPDATE fails silently**: Record doesn't exist yet!
4. **Step 6** (`submit-solution.ts:399`): `solutionAggregator` creates `goal_implementation_links` with `human_rating_count = 0`

### Evidence:
```
Rating created:     2025-10-16 01:30:01.620731+00
goal_link created:  2025-10-16 01:30:05.545147+00  (4 seconds later!)
```

The trigger executes before the goal_implementation_links record exists.

## Impact
- Solutions don't appear on frontend even when approved
- `human_rating_count` shows 0 when actual count is 1+
- Transition threshold never met organically
- Data integrity compromised

## The Fix

### Option 1: Make Trigger Use UPSERT (RECOMMENDED)
Modify `increment_human_rating_count()` to create the record if it doesn't exist:

```sql
CREATE OR REPLACE FUNCTION public.increment_human_rating_count()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.data_source = 'human' THEN
    -- UPSERT: Create record if doesn't exist, update if it does
    INSERT INTO goal_implementation_links (
      goal_id,
      implementation_id,
      human_rating_count,
      rating_count,
      avg_effectiveness,
      last_rating_at,
      needs_aggregation
    )
    VALUES (
      NEW.goal_id,
      NEW.implementation_id,
      1,  -- Initial count
      1,  -- Initial rating count
      NEW.effectiveness_score,  -- Initial effectiveness
      NOW(),
      TRUE
    )
    ON CONFLICT (goal_id, implementation_id) DO UPDATE SET
      human_rating_count = goal_implementation_links.human_rating_count + 1,
      last_rating_at = NOW(),
      needs_aggregation = TRUE;

    -- Queue for background aggregation
    INSERT INTO aggregation_queue (goal_id, implementation_id)
    VALUES (NEW.goal_id, NEW.implementation_id)
    ON CONFLICT (goal_id, implementation_id) DO UPDATE SET
      queued_at = NOW(),
      processing = FALSE;
  END IF;

  RETURN NEW;
END;
$function$;
```

### Option 2: Create goal_implementation_links BEFORE Rating
Reorder `submit-solution.ts` to create the link in Step 5, before inserting the rating.

**Recommendation**: Option 1 is safer - the trigger becomes self-sufficient and handles the race condition.

## Test Case
Solution: "Vitamin D (DevTools Test)"
- Solution ID: `22803d72-4818-4877-9027-f3d7e5ebd765`
- Variant ID: `7977c2e0-40ff-4a42-908e-708eaf6da1cc`
- Rating ID: `b6b02200-d58a-4b76-b064-78e547e25d61`
- Expected `human_rating_count`: 1
- Actual `human_rating_count`: 0 (before manual fix)

## Related Files
- `/app/actions/submit-solution.ts` (lines 380-399)
- Database trigger: `trigger_increment_human_rating_count`
- Database function: `increment_human_rating_count()`

## Date Found
2025-10-16 during Chrome DevTools E2E testing
