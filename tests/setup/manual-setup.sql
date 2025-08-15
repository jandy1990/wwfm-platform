-- Manual Test Setup SQL
-- Run this in Supabase SQL editor if the automated setup isn't working
-- This handles everything that requires service-level access

-- 1. Create test goal if it doesn't exist
INSERT INTO goals (id, title, description, arena_id, is_approved)
VALUES (
  '56e2801e-0d78-4abd-a795-869e5b780ae7',
  'Reduce anxiety',
  'Lower anxiety levels and feel calmer',
  (SELECT id FROM arenas WHERE name = 'Feeling & Emotion'),
  true
) ON CONFLICT (id) DO NOTHING;

-- 2. Clean up test user ratings (replace with actual user ID)
DELETE FROM ratings 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'test@wwfm-platform.com'
);

-- 3. Clean up old test fixtures
DELETE FROM goal_implementation_links 
WHERE solution_id IN (
  SELECT id FROM solutions WHERE source_type = 'test_fixture'
);

DELETE FROM solution_variants 
WHERE solution_id IN (
  SELECT id FROM solutions WHERE source_type = 'test_fixture'
);

DELETE FROM solutions 
WHERE source_type = 'test_fixture';

-- 4. The automated script (complete-test-setup.js) will handle:
-- - Creating test fixtures
-- - Creating variants
-- - Linking to goals
-- Run: npm run test:setup