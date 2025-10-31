-- Database Health Check: Dropdown Options Coverage
-- Verifies all 23 solution categories have challenge or side effect options
-- Run this before deployment or after schema changes

WITH all_categories AS (
  SELECT unnest(ARRAY[
    'apps_software', 'medications', 'supplements_vitamins', 'natural_remedies',
    'beauty_skincare', 'therapists_counselors', 'doctors_specialists',
    'coaches_mentors', 'alternative_practitioners', 'professional_services',
    'crisis_resources', 'meditation_mindfulness', 'exercise_movement',
    'habits_routines', 'hobbies_activities', 'diet_nutrition', 'sleep',
    'support_groups', 'groups_communities', 'financial_products',
    'products_devices', 'books_courses', 'online_services'
  ]) AS category
),
challenge_counts AS (
  SELECT category, COUNT(*) as count
  FROM challenge_options
  WHERE is_active = true
  GROUP BY category
),
side_effect_counts AS (
  SELECT category, COUNT(*) as count
  FROM side_effect_options
  WHERE is_active = true
  GROUP BY category
)
SELECT
  ac.category,
  COALESCE(cc.count, 0) as challenge_options,
  COALESCE(sec.count, 0) as side_effect_options,
  CASE
    WHEN COALESCE(cc.count, 0) > 0 THEN '✓ Challenge options available'
    WHEN COALESCE(sec.count, 0) > 0 THEN '✓ Side effect options available'
    ELSE '❌ MISSING - No options configured!'
  END as status,
  CASE
    WHEN COALESCE(cc.count, 0) = 0 AND COALESCE(sec.count, 0) = 0 THEN true
    ELSE false
  END as has_issue
FROM all_categories ac
LEFT JOIN challenge_counts cc ON ac.category = cc.category
LEFT JOIN side_effect_counts sec ON ac.category = sec.category
ORDER BY has_issue DESC, ac.category;

-- Expected result: All categories should have has_issue = false
-- If any category has has_issue = true, forms for that category will break!
