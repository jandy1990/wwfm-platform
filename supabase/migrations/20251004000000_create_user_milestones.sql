-- Create user_milestones table for tracking milestone achievements

CREATE TABLE IF NOT EXISTS user_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  milestone_type VARCHAR(50) NOT NULL, -- 'points', 'ratings', 'discussions', etc.
  milestone_key VARCHAR(100) NOT NULL, -- e.g., 'seeker', 'guide', 'pathfinder', etc.
  threshold INTEGER NOT NULL, -- The points/count threshold for this milestone
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points_at_achievement INTEGER, -- User's total points when achieved

  -- Prevent duplicate milestone achievements
  CONSTRAINT unique_user_milestone UNIQUE (user_id, milestone_key),

  -- Ensure milestone types are valid
  CONSTRAINT milestone_type_check CHECK (milestone_type IN ('points', 'ratings', 'discussions', 'solutions', 'helpful_votes'))
);

-- Indexes for performance
CREATE INDEX idx_user_milestones_user_id ON user_milestones(user_id);
CREATE INDEX idx_user_milestones_achieved_at ON user_milestones(achieved_at DESC);
CREATE INDEX idx_user_milestones_milestone_key ON user_milestones(milestone_key);

-- RLS Policies
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;

-- Users can view their own milestones
CREATE POLICY "Users can view their own milestones"
  ON user_milestones
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only system can insert milestone achievements (via functions)
CREATE POLICY "System can insert milestones"
  ON user_milestones
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Comment explaining the table
COMMENT ON TABLE user_milestones IS 'Tracks when users achieve contribution milestones for gamification and achievement history';
