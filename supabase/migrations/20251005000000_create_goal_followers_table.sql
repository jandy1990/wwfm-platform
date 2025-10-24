-- Migration: Create goal_followers table
-- Enables users to follow goals and track their progress
-- Date: 2025-10-05 (before status tracking migration)

-- Create goal_followers table with base structure
CREATE TABLE goal_followers (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Initially use composite primary key (user_id, goal_id)
  -- This will be replaced with UUID id in migration 20251016102638
  PRIMARY KEY (user_id, goal_id)
);

-- Add helpful comments
COMMENT ON TABLE goal_followers IS 'Tracks which goals users are following';
COMMENT ON COLUMN goal_followers.user_id IS 'User who is following the goal';
COMMENT ON COLUMN goal_followers.goal_id IS 'Goal being followed';
COMMENT ON COLUMN goal_followers.created_at IS 'When user started following this goal';
