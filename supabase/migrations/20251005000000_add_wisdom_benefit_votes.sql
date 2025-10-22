-- Add Wisdom Benefit Voting System
-- Migration: Enable users to vote on unexpected benefits and track AI vs human data
-- Created: October 2025

-- Add data source tracking to goal_wisdom_scores
ALTER TABLE goal_wisdom_scores
  ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'ai_training_data' CHECK (data_source IN ('ai_training_data', 'human_aggregated')),
  ADD COLUMN IF NOT EXISTS ai_generated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS transitioned_at TIMESTAMPTZ;

-- Create wisdom benefit votes table (similar to discussion_votes)
CREATE TABLE IF NOT EXISTS wisdom_benefit_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  benefit_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, goal_id, benefit_text)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_wisdom_benefit_votes_user_goal
  ON wisdom_benefit_votes(user_id, goal_id);

CREATE INDEX IF NOT EXISTS idx_wisdom_benefit_votes_goal
  ON wisdom_benefit_votes(goal_id);

CREATE INDEX IF NOT EXISTS idx_wisdom_scores_data_source
  ON goal_wisdom_scores(data_source);

-- RLS policies for wisdom_benefit_votes
ALTER TABLE wisdom_benefit_votes ENABLE ROW LEVEL SECURITY;

-- Users can view all benefit votes
CREATE POLICY "Anyone can view wisdom benefit votes"
  ON wisdom_benefit_votes FOR SELECT
  USING (true);

-- Users can insert their own votes
CREATE POLICY "Users can vote on wisdom benefits"
  ON wisdom_benefit_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can remove their wisdom benefit votes"
  ON wisdom_benefit_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON COLUMN goal_wisdom_scores.data_source IS 'Data source: ai_training_data (AI-seeded) or human_aggregated (10+ retrospectives)';
COMMENT ON COLUMN goal_wisdom_scores.ai_generated_at IS 'When AI wisdom data was generated';
COMMENT ON COLUMN goal_wisdom_scores.transitioned_at IS 'When wisdom transitioned from AI to human data (at 10th retrospective)';
COMMENT ON TABLE wisdom_benefit_votes IS 'Tracks user votes on unexpected benefits from goal wisdom';
