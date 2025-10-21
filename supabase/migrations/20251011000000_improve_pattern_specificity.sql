-- Migration: Improve Pattern Specificity for Auto-Categorization
-- Date: October 11, 2025
-- Purpose: Fix overly broad patterns causing false category matches

-- ============================================================================
-- PHASE 1: Fix Overly Broad Patterns
-- ============================================================================

-- Fix apps_software patterns (was: "% app%" matching too broadly)
UPDATE category_keywords
SET patterns = ARRAY[
  '% app',          -- Must end with " app" (word boundary)
  'app %',          -- Must start with "app "
  '% app %',        -- " app " in middle
  ' application',   -- Word boundary
  'mobile app',     -- Specific compound
  'fitness app',    -- Specific compound
  'meditation app', -- Specific compound
  'tracking app',   -- Specific compound
  '%software%',     -- Keep this one (specific enough)
  '%program%',      -- Keep (but monitor)
  '%platform%',     -- Keep
  '%web app%',      -- Specific compound
  '%ios%',          -- Platform indicator
  '%android%',      -- Platform indicator
  '%digital%',      -- Keep
  '%online%'        -- Keep
]
WHERE category = 'apps_software';

-- Fix products_devices patterns (was: "%tool%", "%device%" too broad)
UPDATE category_keywords
SET patterns = ARRAY[
  ' device',         -- Word boundary (not "evidence")
  'device ',         -- Word boundary
  ' device ',        -- Middle word
  'smart device',    -- Specific compound
  'fitness device',  -- Specific compound
  'wearable device', -- Specific compound
  'tracking device', -- Specific compound
  'medical device',  -- Specific compound
  ' product',        -- Word boundary
  'product ',        -- Word boundary
  'fitness equipment', -- Specific
  'home device',     -- Specific
  '%machine%',       -- Keep (specific enough)
  '%monitor%',       -- Keep (specific enough)
  '%tracker%'        -- Keep (but may need refinement)
]
WHERE category = 'products_devices';

-- ============================================================================
-- PHASE 2: Remove Duplicate Brand Keywords
-- ============================================================================

-- Fitbit should ONLY be in products_devices (physical device)
-- Remove from apps_software keyword array
UPDATE category_keywords
SET keywords = array_remove(keywords, 'fitbit')
WHERE category = 'apps_software';

-- Keep "fitbit app" in apps_software (it's specific)
-- This stays as-is

-- Garmin should be products_devices primarily
UPDATE category_keywords
SET keywords = array_remove(keywords, 'garmin')
WHERE category = 'apps_software'
AND 'garmin' = ANY(keywords);

-- Apple Watch is primarily a device
UPDATE category_keywords
SET keywords = array_remove(keywords, 'apple watch')
WHERE category = 'apps_software'
AND 'apple watch' = ANY(keywords);

-- ============================================================================
-- PHASE 3: Fix Other Problematic Broad Patterns
-- ============================================================================

-- Fix therapists_counselors patterns
UPDATE category_keywords
SET patterns = array_replace(patterns, '%therap%', '% therapy')
WHERE category = 'therapists_counselors'
AND '%therap%' = ANY(patterns);

-- Add more specific therapy patterns
UPDATE category_keywords
SET patterns = patterns || ARRAY['%therapist%', '%counselor%', '%counseling%']
WHERE category = 'therapists_counselors'
AND NOT ('%therapist%' = ANY(patterns));

-- Fix medications patterns (was "%medic%" too broad)
UPDATE category_keywords
SET patterns = array_replace(patterns, '%medic%', '%medication%')
WHERE category = 'medications'
AND '%medic%' = ANY(patterns);

-- ============================================================================
-- PHASE 4: Add Validation Comments
-- ============================================================================

COMMENT ON TABLE category_keywords IS
'Category keyword and pattern mappings for auto-categorization.
Pattern guidelines (as of 2025-10-11):
- Patterns should be >= 8 characters OR have word boundaries (spaces)
- Avoid single-word wildcards like "%app%" (too broad)
- Use compound terms like "fitness app" or word boundaries like " app"
- Physical device brands belong in products_devices, not apps_software';

-- ============================================================================
-- VERIFICATION QUERIES (for manual testing after migration)
-- ============================================================================

-- Verify pattern changes
-- SELECT category, patterns FROM category_keywords
-- WHERE category IN ('apps_software', 'products_devices', 'therapists_counselors', 'medications');

-- Verify Fitbit only in products_devices
-- SELECT category, 'fitbit' = ANY(keywords) as has_fitbit
-- FROM category_keywords
-- WHERE 'fitbit' = ANY(keywords);
