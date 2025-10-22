-- Migration: Add status tracking and activity monitoring to goal_followers
-- Enables users to track goals, mark as achieved, and monitor engagement

-- Add new columns to goal_followers table
ALTER TABLE goal_followers
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'following'
    CHECK (status IN ('following', 'achieved')),
  ADD COLUMN IF NOT EXISTS achieved_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now();

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_goal_followers_user_id
  ON goal_followers(user_id);

CREATE INDEX IF NOT EXISTS idx_goal_followers_goal_id
  ON goal_followers(goal_id);

CREATE INDEX IF NOT EXISTS idx_goal_followers_user_status
  ON goal_followers(user_id, status);

CREATE INDEX IF NOT EXISTS idx_goal_followers_last_active
  ON goal_followers(last_active_at DESC);

-- Function to update last_active_at when user rates solution for followed goal
CREATE OR REPLACE FUNCTION update_goal_follower_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE goal_followers
  SET last_active_at = NEW.created_at
  WHERE user_id = NEW.user_id
    AND goal_id = NEW.goal_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on ratings table to track activity
DROP TRIGGER IF EXISTS rating_updates_follower_activity ON ratings;

CREATE TRIGGER rating_updates_follower_activity
  AFTER INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_follower_activity();

-- Enable RLS on goal_followers table
ALTER TABLE goal_followers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view own follows" ON goal_followers;
DROP POLICY IF EXISTS "Users can insert own follows" ON goal_followers;
DROP POLICY IF EXISTS "Users can delete own follows" ON goal_followers;
DROP POLICY IF EXISTS "Users can update own follows" ON goal_followers;
DROP POLICY IF EXISTS "Public can view follower counts" ON goal_followers;

-- RLS Policies
CREATE POLICY "Users can view own follows"
  ON goal_followers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own follows"
  ON goal_followers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own follows"
  ON goal_followers FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own follows"
  ON goal_followers FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow public to view follower counts (aggregated)
CREATE POLICY "Public can view follower counts"
  ON goal_followers FOR SELECT
  USING (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON goal_followers TO authenticated;
GRANT SELECT ON goal_followers TO anon;
