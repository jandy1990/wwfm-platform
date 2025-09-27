-- Copy Good Data from solution_fields to aggregated_fields for Anxiety Goal
--
-- ISSUE: Frontend reads ONLY from aggregated_fields but that contains degraded 2-option data
-- SOLUTION: Copy the good 4-8 option DistributionData from solution_fields to aggregated_fields

-- First, let's check what we have
SELECT
  id,
  jsonb_object_keys(solution_fields) as solution_field_keys,
  jsonb_object_keys(aggregated_fields) as aggregated_field_keys
FROM goal_implementation_links
WHERE goal_id = '56e2801e-0d78-4abd-a795-869e5b780ae7'
LIMIT 3;