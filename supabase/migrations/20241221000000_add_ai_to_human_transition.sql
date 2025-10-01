-- AI to Human Data Transition System
-- Migration: Add columns and infrastructure for transitioning from AI to human data
-- Created: December 2024

DO $migration$
DECLARE
  gil_exists BOOLEAN;
  ratings_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'goal_implementation_links'
  ) INTO gil_exists;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'ratings'
  ) INTO ratings_exists;

  IF NOT gil_exists OR NOT ratings_exists THEN
    RAISE NOTICE 'Skipping migration 20241221000000_add_ai_to_human_transition: required tables are missing.';
    RETURN;
  END IF;

  -- Add transition tracking columns to goal_implementation_links
  EXECUTE 'ALTER TABLE goal_implementation_links
    ADD COLUMN IF NOT EXISTS ai_snapshot JSONB,
    ADD COLUMN IF NOT EXISTS human_rating_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS data_display_mode TEXT DEFAULT ''ai'' CHECK (data_display_mode IN (''ai'', ''human'')),
    ADD COLUMN IF NOT EXISTS transition_threshold INTEGER DEFAULT 3,
    ADD COLUMN IF NOT EXISTS needs_aggregation BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS last_rating_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS transitioned_at TIMESTAMP';

  -- Performance indexes (CRITICAL for scale)
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_gil_display_mode
    ON goal_implementation_links(data_display_mode)';

  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_gil_human_count
    ON goal_implementation_links(human_rating_count)';

  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_gil_needs_aggregation
    ON goal_implementation_links(needs_aggregation)
    WHERE needs_aggregation = TRUE';

  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_gil_last_rating_at
    ON goal_implementation_links(last_rating_at)
    WHERE last_rating_at IS NOT NULL';

  -- Create aggregation queue table to prevent blocking on rating submission
  EXECUTE 'CREATE TABLE IF NOT EXISTS aggregation_queue (
    goal_id UUID NOT NULL,
    implementation_id UUID NOT NULL,
    queued_at TIMESTAMP DEFAULT NOW(),
    processing BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    last_error TEXT,
    PRIMARY KEY (goal_id, implementation_id)
  )';

  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_aggregation_queue_processing
    ON aggregation_queue(processing, queued_at)
    WHERE processing = FALSE';

  -- Add data_source column to ratings table for tracking individual rating sources
  EXECUTE 'ALTER TABLE ratings ADD COLUMN IF NOT EXISTS
    data_source TEXT DEFAULT ''human'' CHECK (data_source IN (''human'', ''ai_system'', ''test''))';

  -- Performance-optimized counting trigger (CRITICAL: only increment, no aggregation)
  EXECUTE $function$
    CREATE OR REPLACE FUNCTION increment_human_rating_count()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.data_source = 'human' THEN
        UPDATE goal_implementation_links
        SET
          human_rating_count = human_rating_count + 1,
          last_rating_at = NOW(),
          needs_aggregation = TRUE
        WHERE goal_id = NEW.goal_id
          AND implementation_id = NEW.implementation_id;

        INSERT INTO aggregation_queue (goal_id, implementation_id)
        VALUES (NEW.goal_id, NEW.implementation_id)
        ON CONFLICT (goal_id, implementation_id) DO UPDATE SET
          queued_at = NOW(),
          processing = FALSE;
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  $function$;

  EXECUTE 'DROP TRIGGER IF EXISTS trigger_increment_human_rating_count ON ratings';

  EXECUTE $function$
    CREATE TRIGGER trigger_increment_human_rating_count
      AFTER INSERT ON ratings
      FOR EACH ROW
      EXECUTE FUNCTION increment_human_rating_count();
  $function$;

  -- Function for atomic transition with race condition prevention
  EXECUTE $function$
    CREATE OR REPLACE FUNCTION check_and_execute_transition(
      p_goal_id UUID,
      p_implementation_id UUID
    )
    RETURNS BOOLEAN AS $$
    DECLARE
      v_transitioned BOOLEAN := FALSE;
      v_lock_key BIGINT;
    BEGIN
      v_lock_key := hashtext(p_goal_id::text || p_implementation_id::text);

      PERFORM pg_advisory_xact_lock(v_lock_key);

      UPDATE goal_implementation_links
      SET
        data_display_mode = 'human',
        transitioned_at = NOW(),
        needs_aggregation = TRUE
      WHERE goal_id = p_goal_id
        AND implementation_id = p_implementation_id
        AND data_display_mode = 'ai'
        AND human_rating_count >= transition_threshold;

      GET DIAGNOSTICS v_transitioned = ROW_COUNT;

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
  $function$;

  -- Preserve existing AI data as snapshot
  EXECUTE 'UPDATE goal_implementation_links
    SET ai_snapshot = aggregated_fields,
        data_display_mode = ''ai''
    WHERE aggregated_fields IS NOT NULL
      AND ai_snapshot IS NULL';

  -- Add comments for future developers
  EXECUTE 'COMMENT ON COLUMN goal_implementation_links.ai_snapshot IS ''Frozen copy of original AI-generated data, preserved forever''';
  EXECUTE 'COMMENT ON COLUMN goal_implementation_links.human_rating_count IS ''Fast counter of human ratings, updated by trigger''';
  EXECUTE 'COMMENT ON COLUMN goal_implementation_links.data_display_mode IS ''What data source to display: ai or human''';
  EXECUTE 'COMMENT ON COLUMN goal_implementation_links.transition_threshold IS ''Number of human ratings needed to switch to human data''';
  EXECUTE 'COMMENT ON COLUMN goal_implementation_links.needs_aggregation IS ''Flag indicating this link needs background aggregation''';

  EXECUTE 'COMMENT ON TABLE aggregation_queue IS ''Queue for background aggregation processing to prevent blocking rating submissions''';

  EXECUTE 'COMMENT ON FUNCTION check_and_execute_transition(UUID, UUID) IS ''Atomically checks and executes transition from AI to human data with race condition protection''';
END;
$migration$;
