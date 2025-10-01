-- Migration: Fix "Still Maintaining" → "Benefits Lasted"
-- Adds guards so it skips cleanly when tables/columns are absent

DO $migration$
DECLARE
  retros_exists BOOLEAN;
  gil_exists BOOLEAN;
  has_still BOOLEAN;
  has_benefits BOOLEAN;
  has_maintenance_rate BOOLEAN;
  has_lasting_rate BOOLEAN;
  has_maintenance_count BOOLEAN;
  has_lasting_count BOOLEAN;
BEGIN
  -- Check for tables first
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'goal_retrospectives'
  ) INTO retros_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'goal_implementation_links'
  ) INTO gil_exists;

  IF NOT retros_exists THEN
    RAISE NOTICE 'Skipping migration 20250908040000_fix_still_maintaining: goal_retrospectives missing.';
  ELSE
    -- Only rename if the old column exists and the new one does not
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'goal_retrospectives'
        AND column_name = 'still_maintaining'
    ) INTO has_still;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'goal_retrospectives'
        AND column_name = 'benefits_lasted'
    ) INTO has_benefits;

    IF has_still AND NOT has_benefits THEN
      EXECUTE 'ALTER TABLE goal_retrospectives RENAME COLUMN still_maintaining TO benefits_lasted';
      EXECUTE 'COMMENT ON COLUMN goal_retrospectives.benefits_lasted IS ''Whether the benefits from the solution persisted over time''';
    ELSE
      RAISE NOTICE 'Skipping column rename on goal_retrospectives: expected columns not found.';
    END IF;
  END IF;

  IF NOT gil_exists THEN
    RAISE NOTICE 'Skipping migration 20250908040000_fix_still_maintaining: goal_implementation_links missing.';
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'goal_implementation_links'
        AND column_name = 'maintenance_rate'
    ) INTO has_maintenance_rate;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'goal_implementation_links'
        AND column_name = 'lasting_benefit_rate'
    ) INTO has_lasting_rate;

    IF has_maintenance_rate AND NOT has_lasting_rate THEN
      EXECUTE 'ALTER TABLE goal_implementation_links RENAME COLUMN maintenance_rate TO lasting_benefit_rate';
      EXECUTE 'COMMENT ON COLUMN goal_implementation_links.lasting_benefit_rate IS ''Percentage of users who report lasting benefits from this solution for this goal''';
    ELSE
      RAISE NOTICE 'Skipping maintenance_rate rename: expected columns not found.';
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'goal_implementation_links'
        AND column_name = 'maintenance_count'
    ) INTO has_maintenance_count;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'goal_implementation_links'
        AND column_name = 'lasting_benefit_count'
    ) INTO has_lasting_count;

    IF has_maintenance_count AND NOT has_lasting_count THEN
      EXECUTE 'ALTER TABLE goal_implementation_links RENAME COLUMN maintenance_count TO lasting_benefit_count';
      EXECUTE 'COMMENT ON COLUMN goal_implementation_links.lasting_benefit_count IS ''Number of retrospectives contributing to lasting benefit rate''';
    ELSE
      RAISE NOTICE 'Skipping maintenance_count rename: expected columns not found.';
    END IF;
  END IF;
END;
$migration$;
