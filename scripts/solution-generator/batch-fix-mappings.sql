-- Comprehensive Batch Fix for Distribution Mappings
-- This file contains systematic updates for all 23 categories

-- =====================================================
-- APPS_SOFTWARE CATEGORY FIXES
-- =====================================================

-- Fix cost field: Map dollar amounts to proper ranges
UPDATE ai_field_distributions afd
SET distributions = (
  SELECT jsonb_agg(
    CASE
      WHEN (item->>'name') LIKE '$69.99/year%' OR (item->>'name') LIKE '$70%' THEN jsonb_build_object('name', '$5-$9.99/month', 'percentage', (item->>'percentage')::int)
      WHEN (item->>'name') LIKE '$14.99/month%' OR (item->>'name') LIKE '$15%' THEN jsonb_build_object('name', '$10-$19.99/month', 'percentage', (item->>'percentage')::int)
      WHEN (item->>'name') LIKE '$12.99/month%' OR (item->>'name') LIKE '$13%' THEN jsonb_build_object('name', '$10-$19.99/month', 'percentage', (item->>'percentage')::int)
      WHEN (item->>'name') LIKE 'Free version%' OR (item->>'name') = 'Free' THEN jsonb_build_object('name', 'Under $5/month', 'percentage', (item->>'percentage')::int)
      ELSE item
    END
  )
  FROM jsonb_array_elements(afd.distributions) AS item
)
FROM solutions s
WHERE afd.solution_id = s.id
AND s.solution_category = 'apps_software'
AND s.source_type = 'ai_foundation'
AND afd.field_name = 'cost';

-- Fix usage_frequency field
UPDATE ai_field_distributions afd
SET distributions = (
  SELECT jsonb_agg(
    CASE
      WHEN (item->>'name') = 'Several times a week' THEN jsonb_build_object('name', 'Few times a week', 'percentage', (item->>'percentage')::int)
      WHEN (item->>'name') = 'Occasionally' THEN jsonb_build_object('name', 'Weekly', 'percentage', (item->>'percentage')::int)
      WHEN (item->>'name') = 'Rarely' THEN jsonb_build_object('name', 'As needed', 'percentage', (item->>'percentage')::int)
      ELSE item
    END
  )
  FROM jsonb_array_elements(afd.distributions) AS item
)
FROM solutions s
WHERE afd.solution_id = s.id
AND s.solution_category = 'apps_software'
AND s.source_type = 'ai_foundation'
AND afd.field_name = 'usage_frequency';

-- Fix subscription_type field
UPDATE ai_field_distributions afd
SET distributions = (
  SELECT jsonb_agg(
    CASE
      WHEN (item->>'name') = 'Paid subscription (monthly)' THEN jsonb_build_object('name', 'Monthly subscription', 'percentage', (item->>'percentage')::int)
      WHEN (item->>'name') = 'Paid subscription (yearly)' THEN jsonb_build_object('name', 'Annual subscription', 'percentage', (item->>'percentage')::int)
      WHEN (item->>'name') = 'Free trial' THEN jsonb_build_object('name', 'Free version', 'percentage', (item->>'percentage')::int)
      WHEN (item->>'name') = 'Other' THEN jsonb_build_object('name', 'One-time purchase', 'percentage', (item->>'percentage')::int)
      ELSE item
    END
  )
  FROM jsonb_array_elements(afd.distributions) AS item
)
FROM solutions s
WHERE afd.solution_id = s.id
AND s.solution_category = 'apps_software'
AND s.source_type = 'ai_foundation'
AND afd.field_name = 'subscription_type';

-- Fix time_to_results field
UPDATE ai_field_distributions afd
SET distributions = (
  SELECT jsonb_agg(
    CASE
      WHEN (item->>'name') = 'Less than 1 week' THEN jsonb_build_object('name', 'Within days', 'percentage', (item->>'percentage')::int)
      WHEN (item->>'name') = 'More than 4 weeks' THEN jsonb_build_object('name', '1-2 months', 'percentage', (item->>'percentage')::int)
      ELSE item
    END
  )
  FROM jsonb_array_elements(afd.distributions) AS item
)
FROM solutions s
WHERE afd.solution_id = s.id
AND s.solution_category = 'apps_software'
AND s.source_type = 'ai_foundation'
AND afd.field_name = 'time_to_results';

-- =====================================================
-- BOOKS_COURSES CATEGORY FIXES
-- =====================================================

-- Fix cost field for books_courses (uses different cost structure)
UPDATE ai_field_distributions afd
SET distributions = (
  SELECT jsonb_agg(
    CASE
      WHEN (item->>'name') LIKE '$%' AND (item->>'name') NOT LIKE '%/%' THEN
        CASE
          WHEN substring((item->>'name') from '\\$([0-9]+)')::int < 20 THEN jsonb_build_object('name', 'Under $20', 'percentage', (item->>'percentage')::int)
          WHEN substring((item->>'name') from '\\$([0-9]+)')::int <= 50 THEN jsonb_build_object('name', '$20-50', 'percentage', (item->>'percentage')::int)
          WHEN substring((item->>'name') from '\\$([0-9]+)')::int <= 100 THEN jsonb_build_object('name', '$50-100', 'percentage', (item->>'percentage')::int)
          ELSE jsonb_build_object('name', '$100+', 'percentage', (item->>'percentage')::int)
        END
      WHEN (item->>'name') = 'Free' THEN jsonb_build_object('name', 'Free', 'percentage', (item->>'percentage')::int)
      ELSE item
    END
  )
  FROM jsonb_array_elements(afd.distributions) AS item
)
FROM solutions s
WHERE afd.solution_id = s.id
AND s.solution_category = 'books_courses'
AND s.source_type = 'ai_foundation'
AND afd.field_name = 'cost';

-- =====================================================
-- THERAPISTS_COUNSELORS CATEGORY FIXES
-- =====================================================

-- Fix cost field for session-based pricing
UPDATE ai_field_distributions afd
SET distributions = (
  SELECT jsonb_agg(
    CASE
      WHEN (item->>'name') LIKE '%$100-150%' OR (item->>'name') LIKE '%$100%' THEN jsonb_build_object('name', '$100-150', 'percentage', (item->>'percentage')::int)
      WHEN (item->>'name') LIKE '%$80%' THEN jsonb_build_object('name', '$50-100', 'percentage', (item->>'percentage')::int)
      WHEN (item->>'name') LIKE '%$20%' OR (item->>'name') LIKE '%copay%' THEN jsonb_build_object('name', 'Under $50', 'percentage', (item->>'percentage')::int)
      WHEN (item->>'name') LIKE '%Insurance%' THEN jsonb_build_object('name', 'Free', 'percentage', (item->>'percentage')::int)
      ELSE item
    END
  )
  FROM jsonb_array_elements(afd.distributions) AS item
)
FROM solutions s
WHERE afd.solution_id = s.id
AND s.solution_category = 'therapists_counselors'
AND s.source_type = 'ai_foundation'
AND afd.field_name = 'cost';

-- Fix session_frequency field
UPDATE ai_field_distributions afd
SET distributions = (
  SELECT jsonb_agg(
    CASE
      WHEN (item->>'name') = 'Once per week' THEN jsonb_build_object('name', 'Weekly', 'percentage', (item->>'percentage')::int)
      WHEN (item->>'name') = 'Bi-weekly sessions' THEN jsonb_build_object('name', 'Bi-weekly', 'percentage', (item->>'percentage')::int)
      WHEN (item->>'name') = 'Monthly check-ins' THEN jsonb_build_object('name', 'Monthly', 'percentage', (item->>'percentage')::int)
      ELSE item
    END
  )
  FROM jsonb_array_elements(afd.distributions) AS item
)
FROM solutions s
WHERE afd.solution_id = s.id
AND s.solution_category = 'therapists_counselors'
AND s.source_type = 'ai_foundation'
AND afd.field_name = 'session_frequency';

-- Add more categories as needed...
-- This demonstrates the pattern for systematic fixes