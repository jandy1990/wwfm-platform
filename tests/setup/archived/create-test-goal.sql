-- SQL Script to create a dedicated test goal for E2E testing
-- Run this in your Supabase SQL editor

-- First, get an arena_id (using "Feeling & Emotion" as it's likely to exist)
WITH test_arena AS (
  SELECT id FROM arenas 
  WHERE name = 'Feeling & Emotion' 
  LIMIT 1
)
INSERT INTO goals (
  title,
  description,
  arena_id,
  is_approved,
  meta_tags
)
SELECT 
  'TEST GOAL - Automated E2E Testing',
  'DO NOT DELETE - This goal is used for automated testing. Any solutions added here are test data and should be ignored for analytics.',
  test_arena.id,
  true,
  ARRAY['test', 'automated', 'e2e', 'ignore-for-analytics']
FROM test_arena
RETURNING id, title;

-- The query will return the UUID of the created goal
-- Copy this UUID and add it to your .env.test.local as TEST_GOAL_ID