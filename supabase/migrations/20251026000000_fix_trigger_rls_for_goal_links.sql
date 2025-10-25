-- Migration: Fix RLS blocking database trigger from creating goal_implementation_links
-- Issue: increment_human_rating_count() trigger runs as postgres role but RLS requires authenticated
-- Impact: New submissions create ratings but not goal_implementation_links, causing test failures

-- Add policy to allow postgres role (system triggers) to INSERT goal_implementation_links
CREATE POLICY "System triggers can create goal implementation links"
ON goal_implementation_links
FOR INSERT
TO postgres
WITH CHECK (true);

-- Verification query (should return the new policy):
-- SELECT policyname, roles, cmd
-- FROM pg_policies
-- WHERE tablename = 'goal_implementation_links' AND policyname = 'System triggers can create goal implementation links';
