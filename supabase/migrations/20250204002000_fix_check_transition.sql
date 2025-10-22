-- Fix check_and_execute_transition function to use integer row count
-- Prevents boolean/integer comparison errors during RPC execution

BEGIN;

CREATE OR REPLACE FUNCTION check_and_execute_transition(
  p_goal_id UUID,
  p_implementation_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_rows_updated INTEGER := 0;
  v_lock_key BIGINT;
BEGIN
  -- Create unique lock key from goal+implementation IDs
  v_lock_key := hashtext(p_goal_id::text || p_implementation_id::text);

  -- Advisory lock prevents concurrent transitions (released at transaction end)
  PERFORM pg_advisory_xact_lock(v_lock_key);

  -- Update display mode when threshold reached
  UPDATE goal_implementation_links
  SET
    data_display_mode = 'human',
    transitioned_at = NOW(),
    needs_aggregation = TRUE
  WHERE goal_id = p_goal_id
    AND implementation_id = p_implementation_id
    AND data_display_mode = 'ai'
    AND human_rating_count >= transition_threshold;

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

  -- Queue aggregation if transition occurred
  IF v_rows_updated > 0 THEN
    INSERT INTO aggregation_queue (goal_id, implementation_id)
    VALUES (p_goal_id, p_implementation_id)
    ON CONFLICT (goal_id, implementation_id) DO UPDATE SET
      queued_at = NOW(),
      processing = FALSE;
  END IF;

  RETURN v_rows_updated > 0;
END;
$$ LANGUAGE plpgsql;

COMMIT;
