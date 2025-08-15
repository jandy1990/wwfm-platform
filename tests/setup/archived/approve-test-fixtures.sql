-- Approve Test Fixtures Script
-- This script ensures all test fixtures are approved so they appear in search results
-- Run this after creating test fixtures and before running E2E tests

-- Update all test fixtures to be approved
UPDATE solutions 
SET is_approved = true 
WHERE source_type = 'test_fixture';

-- Verify the update
SELECT 
  title, 
  solution_category,
  is_approved, 
  source_type,
  created_at
FROM solutions 
WHERE source_type = 'test_fixture'
ORDER BY solution_category, title;

-- Expected result: 23 rows, all with is_approved = true