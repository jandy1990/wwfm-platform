-- Migration script to fix effectiveness ratings scale
-- This converts ratings from 1-5 scale to 0-10 scale
-- Only updates ratings that appear to be on the 1-5 scale (values <= 5)

-- First, let's check what we're about to update
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN avg_effectiveness <= 5 THEN 1 END) as records_to_update,
    MIN(avg_effectiveness) as min_rating,
    MAX(avg_effectiveness) as max_rating,
    AVG(avg_effectiveness) as avg_rating
FROM goal_implementation_links
WHERE avg_effectiveness IS NOT NULL;

-- Update ratings that are on 1-5 scale to 0-10 scale
-- Only update if avg_effectiveness is <= 5 (to avoid double-converting)
UPDATE goal_implementation_links
SET avg_effectiveness = avg_effectiveness * 2,
    updated_at = NOW()
WHERE avg_effectiveness IS NOT NULL
  AND avg_effectiveness <= 5;

-- Verify the update
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN avg_effectiveness <= 5 THEN 1 END) as remaining_low_ratings,
    MIN(avg_effectiveness) as min_rating,
    MAX(avg_effectiveness) as max_rating,
    AVG(avg_effectiveness) as avg_rating
FROM goal_implementation_links
WHERE avg_effectiveness IS NOT NULL;

-- Also update any ratings in the ratings table if they store effectiveness_rating
-- Check if this column exists and has similar issues
SELECT 
    COUNT(*) as total_ratings,
    COUNT(CASE WHEN effectiveness_rating <= 5 THEN 1 END) as ratings_to_update,
    MIN(effectiveness_rating) as min_rating,
    MAX(effectiveness_rating) as max_rating,
    AVG(effectiveness_rating) as avg_rating
FROM ratings
WHERE effectiveness_rating IS NOT NULL;

-- Update ratings table if needed (uncomment if the table has this issue)
-- UPDATE ratings
-- SET effectiveness_rating = effectiveness_rating * 2,
--     updated_at = NOW()
-- WHERE effectiveness_rating IS NOT NULL
--   AND effectiveness_rating <= 5;