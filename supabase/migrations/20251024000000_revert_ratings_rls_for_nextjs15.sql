-- Revert RLS policy on ratings table to fix Next.js 15 server action authentication
--
-- PROBLEM: Supabase performance linter recommended changing auth.uid() to (SELECT auth.uid())
-- This optimization breaks authentication in Next.js 15 server actions because the subquery
-- returns NULL even when the user is authenticated.
--
-- SOLUTION: Revert to original auth.uid() syntax which works correctly in Next.js 15
--
-- See: https://github.com/supabase/supabase/issues/... (Next.js 15 + RLS subquery issue)

-- Drop the "optimized" policy
DROP POLICY IF EXISTS "Users create own ratings" ON public.ratings;

-- Recreate with working syntax for Next.js 15
CREATE POLICY "Users create own ratings" ON public.ratings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Note: The (SELECT auth.uid()) optimization is good for performance at scale,
-- but it's incompatible with Next.js 15 server actions as of October 2024.
-- Once Next.js or Supabase fixes this compatibility issue, we can re-apply the optimization.
