-- Content Gating: RLS Policies for Discussion Replies
-- Anonymous users can see top-level discussions
-- Authenticated users can see replies

-- Drop existing SELECT policies on goal_discussions if any
DROP POLICY IF EXISTS "public_read_goal_discussions" ON goal_discussions;
DROP POLICY IF EXISTS "public_read_top_level_discussions" ON goal_discussions;
DROP POLICY IF EXISTS "authenticated_read_replies" ON goal_discussions;

-- Policy: Public can read top-level discussions (no parent_id)
-- This allows anonymous users to see all top-level discussions and their metadata
CREATE POLICY "public_read_top_level_discussions"
ON goal_discussions
FOR SELECT
USING (
  parent_id IS NULL
);

-- Policy: Authenticated users can read replies (has parent_id)
-- This restricts reply content to logged-in users only
CREATE POLICY "authenticated_read_replies"
ON goal_discussions
FOR SELECT
USING (
  parent_id IS NOT NULL AND
  auth.uid() IS NOT NULL
);

-- Note: Write policies (INSERT, UPDATE, DELETE) remain unchanged
-- Users must still be authenticated to create/edit/delete discussions and replies
