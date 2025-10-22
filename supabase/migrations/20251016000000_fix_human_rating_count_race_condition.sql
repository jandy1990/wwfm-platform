-- Fix human_rating_count Race Condition
-- Migration: Replace UPDATE with UPSERT in increment_human_rating_count()
-- Created: October 16, 2025
-- Bug Report: BUG_REPORT_human_rating_count_sync.md

-- This fixes a critical race condition where:
-- 1. Rating inserted → trigger fires → tries to UPDATE goal_implementation_links (doesn't exist!)
-- 2. UPDATE fails silently
-- 3. Later, solutionAggregator creates goal_implementation_links with human_rating_count = 0
-- Result: Solutions never display on frontend

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

-- Add comment explaining the fix
COMMENT ON FUNCTION public.increment_human_rating_count() IS
  'Increments human_rating_count using UPSERT to handle race condition where goal_implementation_links may not exist yet when rating is inserted. Fixed October 16, 2025.';
