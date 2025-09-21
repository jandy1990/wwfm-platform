-- AI to Human Data Transition System
-- Migration: Add columns and infrastructure for transitioning from AI to human data
-- Created: December 2024

BEGIN;

-- Add transition tracking columns to goal_implementation_links
ALTER TABLE goal_implementation_links ADD COLUMN IF NOT EXISTS
  ai_snapshot JSONB,                    -- Frozen copy of original AI data
  human_rating_count INTEGER DEFAULT 0, -- Count of human ratings (FAST counter)
  data_display_mode TEXT DEFAULT 'ai' CHECK (data_display_mode IN ('ai', 'human')),
  transition_threshold INTEGER DEFAULT 3, -- Start low for momentum, increase to 5 later
  needs_aggregation BOOLEAN DEFAULT FALSE, -- Queue flag for background aggregation
  last_rating_at TIMESTAMP,            -- For cron job scheduling
  transitioned_at TIMESTAMP;           -- Audit trail

-- Performance indexes (CRITICAL for scale)
CREATE INDEX IF NOT EXISTS idx_gil_display_mode
  ON goal_implementation_links(data_display_mode);

CREATE INDEX IF NOT EXISTS idx_gil_human_count
  ON goal_implementation_links(human_rating_count);

CREATE INDEX IF NOT EXISTS idx_gil_needs_aggregation
  ON goal_implementation_links(needs_aggregation)
  WHERE needs_aggregation = TRUE;

CREATE INDEX IF NOT EXISTS idx_gil_last_rating_at
  ON goal_implementation_links(last_rating_at)
  WHERE last_rating_at IS NOT NULL;

-- Create aggregation queue table to prevent blocking on rating submission
CREATE TABLE IF NOT EXISTS aggregation_queue (
  goal_id UUID NOT NULL,
  implementation_id UUID NOT NULL,
  queued_at TIMESTAMP DEFAULT NOW(),
  processing BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  PRIMARY KEY (goal_id, implementation_id)
);

CREATE INDEX IF NOT EXISTS idx_aggregation_queue_processing
  ON aggregation_queue(processing, queued_at)
  WHERE processing = FALSE;

-- Add data_source column to ratings table for tracking individual rating sources
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS
  data_source TEXT DEFAULT 'human' CHECK (data_source IN ('human', 'ai_system', 'test'));

-- Performance-optimized counting trigger (CRITICAL: only increment, no aggregation)
CREATE OR REPLACE FUNCTION increment_human_rating_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Only count human ratings (exclude AI system and test data)
  IF NEW.data_source = 'human' THEN
    -- Fast counter update (no aggregation here!)
    UPDATE goal_implementation_links
    SET
      human_rating_count = human_rating_count + 1,
      last_rating_at = NOW(),
      needs_aggregation = TRUE  -- Flag for background processing
    WHERE goal_id = NEW.goal_id
      AND implementation_id = NEW.implementation_id;

    -- Queue for background aggregation (non-blocking)
    INSERT INTO aggregation_queue (goal_id, implementation_id)
    VALUES (NEW.goal_id, NEW.implementation_id)
    ON CONFLICT (goal_id, implementation_id) DO UPDATE SET
      queued_at = NOW(),
      processing = FALSE;  -- Reset if previously stuck
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for counting (only runs on INSERT, not UPDATE)
DROP TRIGGER IF EXISTS trigger_increment_human_rating_count ON ratings;
CREATE TRIGGER trigger_increment_human_rating_count
  AFTER INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION increment_human_rating_count();

-- Function for atomic transition with race condition prevention
CREATE OR REPLACE FUNCTION check_and_execute_transition(
  p_goal_id UUID,
  p_implementation_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_transitioned BOOLEAN := FALSE;
  v_lock_key BIGINT;
BEGIN
  -- Create unique lock key from goal+implementation IDs
  v_lock_key := hashtext(p_goal_id::text || p_implementation_id::text);

  -- Advisory lock prevents concurrent transitions (released at transaction end)
  PERFORM pg_advisory_xact_lock(v_lock_key);

  -- Re-check conditions inside lock (protects against race conditions)
  UPDATE goal_implementation_links
  SET
    data_display_mode = 'human',
    transitioned_at = NOW(),
    needs_aggregation = TRUE  -- Queue immediate aggregation
  WHERE goal_id = p_goal_id
    AND implementation_id = p_implementation_id
    AND data_display_mode = 'ai'  -- Only transition if still showing AI
    AND human_rating_count >= transition_threshold;

  GET DIAGNOSTICS v_transitioned = ROW_COUNT;

  -- Queue for immediate aggregation if transition occurred
  IF v_transitioned THEN
    INSERT INTO aggregation_queue (goal_id, implementation_id)
    VALUES (p_goal_id, p_implementation_id)
    ON CONFLICT (goal_id, implementation_id) DO UPDATE SET
      queued_at = NOW(),
      processing = FALSE;
  END IF;

  RETURN v_transitioned > 0;
END;
$$ LANGUAGE plpgsql;

-- Preserve existing AI data as snapshot
-- This runs once to copy current aggregated_fields to ai_snapshot
UPDATE goal_implementation_links
SET
  ai_snapshot = aggregated_fields,
  data_display_mode = 'ai'
WHERE aggregated_fields IS NOT NULL
  AND ai_snapshot IS NULL;

-- Add comments for future developers
COMMENT ON COLUMN goal_implementation_links.ai_snapshot IS 'Frozen copy of original AI-generated data, preserved forever';
COMMENT ON COLUMN goal_implementation_links.human_rating_count IS 'Fast counter of human ratings, updated by trigger';
COMMENT ON COLUMN goal_implementation_links.data_display_mode IS 'What data source to display: ai or human';
COMMENT ON COLUMN goal_implementation_links.transition_threshold IS 'Number of human ratings needed to switch to human data';
COMMENT ON COLUMN goal_implementation_links.needs_aggregation IS 'Flag indicating this link needs background aggregation';

COMMENT ON TABLE aggregation_queue IS 'Queue for background aggregation processing to prevent blocking rating submissions';

COMMENT ON FUNCTION check_and_execute_transition(UUID, UUID) IS 'Atomically checks and executes transition from AI to human data with race condition protection';

COMMIT;