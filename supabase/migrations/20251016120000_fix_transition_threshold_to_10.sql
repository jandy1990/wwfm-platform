-- Fix transition_threshold: Ensure all defaults and values are 10
-- Migration: October 16, 2025
-- Context: The table default was accidentally set to 3, and the race condition
--          fix migration also used 3. This migration corrects everything to 10.

-- Step 1: Fix the table default
ALTER TABLE goal_implementation_links
  ALTER COLUMN transition_threshold SET DEFAULT 10;

-- Step 2: Fix any records that have threshold < 10
UPDATE goal_implementation_links
SET transition_threshold = 10
WHERE transition_threshold < 10;

-- Step 3: Update the trigger function to use 10
CREATE OR REPLACE FUNCTION public.increment_human_rating_count()
RETURNS TRIGGER
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
      needs_aggregation,
      data_display_mode,
      transition_threshold
    )
    VALUES (
      NEW.goal_id,
      NEW.implementation_id,
      1,  -- Initial human rating count
      1,  -- Initial total rating count
      NEW.effectiveness_score,  -- Initial effectiveness
      NOW(),
      TRUE,  -- Needs aggregation
      'ai',  -- Start with AI display mode until threshold reached
      10  -- Default threshold (10 reviews required)
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

-- Add comment explaining the threshold
COMMENT ON FUNCTION public.increment_human_rating_count() IS
  'Increments human_rating_count using UPSERT to handle race condition. Uses transition_threshold of 10 (requires 10 human reviews before going live). Fixed October 16, 2025.';
