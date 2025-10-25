-- Migration: Fix Ambiguous Keyword Mappings
-- Date: October 11, 2025
-- Purpose: Resolve category ambiguities based on form field analysis

-- ============================================================================
-- PHASE 1: Add Missing Keywords
-- ============================================================================

-- Add "The Power of Now" to books_courses
UPDATE category_keywords
SET keywords = keywords || ARRAY['the power of now']
WHERE category = 'books_courses'
AND NOT ('the power of now' = ANY(keywords));

-- ============================================================================
-- PHASE 2: Fix Doctor/Therapist Ambiguities
-- ============================================================================

-- Chiropractor is a doctor (science degree), NOT alternative practitioner
UPDATE category_keywords
SET keywords = array_remove(keywords, 'chiropractor')
WHERE category = 'alternative_practitioners'
AND 'chiropractor' = ANY(keywords);

-- Add chiropractor to doctors_specialists if not present
UPDATE category_keywords
SET keywords = keywords || ARRAY['chiropractor']
WHERE category = 'doctors_specialists'
AND NOT ('chiropractor' = ANY(keywords));

-- Psychiatrist is a medical doctor, NOT a therapist
-- Remove from therapists_counselors
UPDATE category_keywords
SET keywords = array_remove(keywords, 'psychiatrist')
WHERE category = 'therapists_counselors'
AND 'psychiatrist' = ANY(keywords);

-- Ensure psychiatrist is in doctors_specialists
UPDATE category_keywords
SET keywords = keywords || ARRAY['psychiatrist']
WHERE category = 'doctors_specialists'
AND NOT ('psychiatrist' = ANY(keywords));

-- ============================================================================
-- PHASE 3: Natural Remedies vs Supplements (Dosage-based decisions)
-- ============================================================================

-- Ginger: natural remedy (tea/fresh root format)
-- Move from supplements to natural_remedies
UPDATE category_keywords
SET keywords = array_remove(keywords, 'ginger')
WHERE category = 'supplements_vitamins'
AND 'ginger' = ANY(keywords);

UPDATE category_keywords
SET keywords = keywords || ARRAY['ginger']
WHERE category = 'natural_remedies'
AND NOT ('ginger' = ANY(keywords));

-- Lavender Oil: natural remedy (topical/aromatherapy)
UPDATE category_keywords
SET keywords = array_remove(keywords, 'lavender oil')
WHERE category = 'sleep'
AND 'lavender oil' = ANY(keywords);

UPDATE category_keywords
SET keywords = keywords || ARRAY['lavender oil', 'lavender']
WHERE category = 'natural_remedies'
AND NOT ('lavender oil' = ANY(keywords));

-- Echinacea: natural remedy (tea/tincture format)
UPDATE category_keywords
SET keywords = array_remove(keywords, 'echinacea')
WHERE category = 'supplements_vitamins'
AND 'echinacea' = ANY(keywords);

UPDATE category_keywords
SET keywords = keywords || ARRAY['echinacea']
WHERE category = 'natural_remedies'
AND NOT ('echinacea' = ANY(keywords));

-- St Johns Wort: supplement (standardized mg doses, drug interactions)
UPDATE category_keywords
SET keywords = array_remove(keywords, 'st johns wort')
WHERE category = 'natural_remedies'
AND 'st johns wort' = ANY(keywords);

UPDATE category_keywords
SET keywords = keywords || ARRAY['st johns wort', 'st john\'s wort']
WHERE category = 'supplements_vitamins'
AND NOT ('st johns wort' = ANY(keywords));

-- Turmeric: supplement (curcumin capsules for internal health)
UPDATE category_keywords
SET keywords = array_remove(keywords, 'turmeric')
WHERE category = 'natural_remedies'
AND 'turmeric' = ANY(keywords);

UPDATE category_keywords
SET keywords = array_remove(keywords, 'turmeric')
WHERE category = 'beauty_skincare'
AND 'turmeric' = ANY(keywords);

UPDATE category_keywords
SET keywords = keywords || ARRAY['turmeric', 'curcumin']
WHERE category = 'supplements_vitamins'
AND NOT ('turmeric' = ANY(keywords));

-- Chamomile Tea: natural remedy (not sleep category)
UPDATE category_keywords
SET keywords = array_remove(keywords, 'chamomile tea')
WHERE category = 'sleep'
AND 'chamomile tea' = ANY(keywords);

UPDATE category_keywords
SET keywords = keywords || ARRAY['chamomile tea', 'chamomile']
WHERE category = 'natural_remedies'
AND NOT ('chamomile tea' = ANY(keywords));

-- ============================================================================
-- PHASE 4: Beauty/Skincare Clarifications
-- ============================================================================

-- Hyaluronic Acid: beauty/skincare (topical serum, AM/PM routine)
UPDATE category_keywords
SET keywords = array_remove(keywords, 'hyaluronic acid')
WHERE category = 'supplements_vitamins'
AND 'hyaluronic acid' = ANY(keywords);

UPDATE category_keywords
SET keywords = keywords || ARRAY['hyaluronic acid']
WHERE category = 'beauty_skincare'
AND NOT ('hyaluronic acid' = ANY(keywords));

-- ============================================================================
-- PHASE 5: Devices vs Lifestyle Categories
-- ============================================================================

-- White Noise Machine: product/device (physical purchase with setup)
UPDATE category_keywords
SET keywords = array_remove(keywords, 'white noise machine')
WHERE category = 'sleep'
AND 'white noise machine' = ANY(keywords);

UPDATE category_keywords
SET keywords = keywords || ARRAY['white noise machine', 'white noise']
WHERE category = 'products_devices'
AND NOT ('white noise machine' = ANY(keywords));

-- Light Therapy Lamp: product/device (physical device purchase)
UPDATE category_keywords
SET keywords = array_remove(keywords, 'light therapy lamp')
WHERE category = 'sleep'
AND 'light therapy lamp' = ANY(keywords);

UPDATE category_keywords
SET keywords = keywords || ARRAY['light therapy lamp', 'sad lamp']
WHERE category = 'products_devices'
AND NOT ('light therapy lamp' = ANY(keywords));

-- ============================================================================
-- PHASE 6: Practice-based Activities
-- ============================================================================

-- Breathing Exercises: meditation/mindfulness (practice with session length)
UPDATE category_keywords
SET keywords = array_remove(keywords, 'breathing exercises')
WHERE category = 'sleep'
AND 'breathing exercises' = ANY(keywords);

UPDATE category_keywords
SET keywords = keywords || ARRAY['breathing exercises', 'breathwork']
WHERE category = 'meditation_mindfulness'
AND NOT ('breathing exercises' = ANY(keywords));

-- Dancing: hobby/activity (recreational enjoyment focus)
UPDATE category_keywords
SET keywords = array_remove(keywords, 'dancing')
WHERE category = 'exercise_movement'
AND 'dancing' = ANY(keywords);

UPDATE category_keywords
SET keywords = keywords || ARRAY['dancing', 'dance']
WHERE category = 'hobbies_activities'
AND NOT ('dancing' = ANY(keywords));

-- Journaling: habit/routine (daily practice for mental health)
UPDATE category_keywords
SET keywords = array_remove(keywords, 'journaling')
WHERE category = 'hobbies_activities'
AND 'journaling' = ANY(keywords);

UPDATE category_keywords
SET keywords = keywords || ARRAY['journaling', 'journal']
WHERE category = 'habits_routines'
AND NOT ('journaling' = ANY(keywords));

-- ============================================================================
-- PHASE 7: Diet/Nutrition Clarifications
-- ============================================================================

-- Intermittent Fasting: diet/nutrition (eating pattern with meal timing)
UPDATE category_keywords
SET keywords = array_remove(keywords, 'intermittent fasting')
WHERE category = 'habits_routines'
AND 'intermittent fasting' = ANY(keywords);

UPDATE category_keywords
SET keywords = keywords || ARRAY['intermittent fasting', 'if', 'fasting']
WHERE category = 'diet_nutrition'
AND NOT ('intermittent fasting' = ANY(keywords));

-- Meal Prep: diet/nutrition (food preparation activity)
UPDATE category_keywords
SET keywords = array_remove(keywords, 'meal prep')
WHERE category = 'apps_software'
AND 'meal prep' = ANY(keywords);

UPDATE category_keywords
SET keywords = keywords || ARRAY['meal prep', 'meal prepping']
WHERE category = 'diet_nutrition'
AND NOT ('meal prep' = ANY(keywords));

-- ============================================================================
-- PHASE 8: Books vs Online Platforms
-- ============================================================================

-- Atomic Habits: book (not habits_routines category)
UPDATE category_keywords
SET keywords = array_remove(keywords, 'atomic habits')
WHERE category = 'habits_routines'
AND 'atomic habits' = ANY(keywords);

UPDATE category_keywords
SET keywords = keywords || ARRAY['atomic habits']
WHERE category = 'books_courses'
AND NOT ('atomic habits' = ANY(keywords));

-- Note: Coursera, Udemy, MasterClass are correctly categorized as apps_software
-- They are digital platforms/apps, not physical books

-- ============================================================================
-- PHASE 9: Support Groups vs Crisis Resources
-- ============================================================================

-- SMART Recovery: support group (not crisis resource)
UPDATE category_keywords
SET keywords = array_remove(keywords, 'smart recovery')
WHERE category = 'crisis_resources'
AND 'smart recovery' = ANY(keywords);

UPDATE category_keywords
SET keywords = keywords || ARRAY['smart recovery']
WHERE category = 'support_groups'
AND NOT ('smart recovery' = ANY(keywords));

-- ============================================================================
-- VERIFICATION
-- ============================================================================

COMMENT ON TABLE category_keywords IS
'Category keyword and pattern mappings for auto-categorization.
Last updated: 2025-10-11 - Fixed ambiguous keyword mappings based on form field analysis.

Key decisions:
- Natural remedies: tea/tincture format (ginger, echinacea, chamomile, lavender oil)
- Supplements: standardized mg doses (st johns wort, turmeric)
- Devices: physical purchases (white noise machine, light therapy lamp)
- Practices: session-based activities (breathing exercises)
- Hobbies: recreational enjoyment (dancing)
- Habits: daily mental health practices (journaling)
- Diet: eating patterns and food prep (intermittent fasting, meal prep)
- Doctors: medical degree holders (psychiatrist, chiropractor)';
