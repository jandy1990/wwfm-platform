-- Migration: Remove "ginger" from apps_software
-- Date: October 11, 2025
-- Purpose: Ginger is a natural remedy (tea/root), not an app

-- Remove ginger from apps_software
UPDATE category_keywords
SET keywords = array_remove(keywords, 'ginger')
WHERE category = 'apps_software'
AND 'ginger' = ANY(keywords);

-- Verify ginger is only in natural_remedies
COMMENT ON TABLE category_keywords IS
'Category keyword and pattern mappings for auto-categorization.
Last updated: 2025-10-11 - Fixed ginger categorization (natural remedy only, not app)';
