-- Temporarily disable contribution points trigger until RLS compatibility issue is resolved
--
-- Issue: The trigger function cannot access the ratings table due to RLS policies,
-- even with SECURITY DEFINER. This blocks all form submissions.
--
-- Impact: Contribution points will not be automatically calculated when users submit ratings.
-- This is acceptable as forms are critical functionality and contribution points are
-- a nice-to-have feature.
--
-- TODO: Investigate proper RLS bypass for trigger functions in Supabase/PostgreSQL
-- See: https://github.com/orgs/supabase/discussions/3563

ALTER TABLE public.ratings DISABLE TRIGGER update_contribution_points_on_rating;
