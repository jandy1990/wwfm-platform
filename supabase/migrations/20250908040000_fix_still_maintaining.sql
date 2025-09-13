-- Migration: Fix "Still Maintaining" → "Benefits Lasted"
-- Changes the concept from "still using the solution" to "benefits lasted over time"
-- This works better for time-bound solutions like therapy courses, books, surgeries

-- 1. Update goal_retrospectives table
ALTER TABLE goal_retrospectives 
RENAME COLUMN still_maintaining TO benefits_lasted;

-- Update the comment to reflect new meaning
COMMENT ON COLUMN goal_retrospectives.benefits_lasted IS 'Whether the benefits from the solution persisted over time';

-- 2. Update goal_implementation_links table
ALTER TABLE goal_implementation_links
RENAME COLUMN maintenance_rate TO lasting_benefit_rate;

ALTER TABLE goal_implementation_links
RENAME COLUMN maintenance_count TO lasting_benefit_count;

-- Update comments
COMMENT ON COLUMN goal_implementation_links.lasting_benefit_rate IS 'Percentage of users who report lasting benefits from this solution for this goal';
COMMENT ON COLUMN goal_implementation_links.lasting_benefit_count IS 'Number of retrospectives contributing to lasting benefit rate';