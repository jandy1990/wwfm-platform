-- Raise default transition threshold from 3 to 10 and align existing records

DO $migration$
DECLARE
  gil_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'goal_implementation_links'
  ) INTO gil_exists;

  IF NOT gil_exists THEN
    RAISE NOTICE 'Skipping migration 20250204000000_raise_transition_threshold_to_10: goal_implementation_links missing.';
    RETURN;
  END IF;

  EXECUTE 'ALTER TABLE goal_implementation_links
    ALTER COLUMN transition_threshold SET DEFAULT 10';

  EXECUTE 'UPDATE goal_implementation_links
    SET transition_threshold = 10
    WHERE transition_threshold IS NULL OR transition_threshold < 10';
END;
$migration$;
