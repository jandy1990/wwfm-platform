-- Update RLS policies for discussion replies to support feature flag toggling
-- The UI (CommunityDiscussions component) will control gating based on NEXT_PUBLIC_ENABLE_CONTENT_GATING
-- This migration allows reading replies at the database level for all users
-- Write operations still require authentication

-- Drop existing SELECT policies on goal_discussions
DROP POLICY IF EXISTS "public_read_top_level_discussions" ON goal_discussions;
DROP POLICY IF EXISTS "authenticated_read_replies" ON goal_discussions;

-- Policy: Allow everyone to read all discussions (both top-level and replies)
-- The UI layer will control whether to show gated overlays based on the feature flag
CREATE POLICY "public_read_all_discussions"
ON goal_discussions
FOR SELECT
USING (true);

-- Note: Write policies remain unchanged - still require authentication
-- INSERT, UPDATE, DELETE policies should already exist and require auth.uid() IS NOT NULL
