-- Migration: Add UUID id column as primary key to goal_followers table
-- This aligns with platform convention where all tables use id as primary key
-- Safe migration: table currently has 0 rows (new feature, not yet in production use)
-- Date: 2025-10-16

-- Add id column with auto-generated UUIDs as default
ALTER TABLE goal_followers
  ADD COLUMN id UUID DEFAULT gen_random_uuid();

-- Update any existing rows to have UUIDs (safe even though there are 0 rows)
UPDATE goal_followers SET id = gen_random_uuid() WHERE id IS NULL;

-- Make id column required (NOT NULL)
ALTER TABLE goal_followers
  ALTER COLUMN id SET NOT NULL;

-- Drop existing composite primary key constraint
ALTER TABLE goal_followers
  DROP CONSTRAINT IF EXISTS goal_followers_pkey;

-- Make id the new primary key
ALTER TABLE goal_followers
  ADD PRIMARY KEY (id);

-- Keep composite uniqueness as constraint to prevent duplicate follows
ALTER TABLE goal_followers
  ADD CONSTRAINT goal_followers_user_goal_unique
  UNIQUE (user_id, goal_id);

-- Recreate indexes for performance (drop old ones first to avoid conflicts)
DROP INDEX IF EXISTS idx_goal_followers_user_id;
DROP INDEX IF EXISTS idx_goal_followers_goal_id;
DROP INDEX IF EXISTS idx_goal_followers_user_status;
DROP INDEX IF EXISTS idx_goal_followers_last_active;

-- Add optimized indexes
CREATE INDEX idx_goal_followers_user_id_v2 ON goal_followers(user_id);
CREATE INDEX idx_goal_followers_goal_id_v2 ON goal_followers(goal_id);
CREATE INDEX idx_goal_followers_user_status_v2 ON goal_followers(user_id, status);
CREATE INDEX idx_goal_followers_last_active_v2 ON goal_followers(last_active_at DESC);

-- Add helpful comments
COMMENT ON COLUMN goal_followers.id IS 'Primary key UUID - aligns with platform convention (all tables use id PK)';
COMMENT ON CONSTRAINT goal_followers_user_goal_unique ON goal_followers IS 'Ensures one follow per user per goal (composite uniqueness)';
