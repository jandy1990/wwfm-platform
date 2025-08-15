-- Create All Test Fixtures Script
-- This script creates all 23 test fixtures needed for E2E testing
-- Run this in Supabase SQL editor before running tests

-- First, delete any existing test fixtures to start fresh
DELETE FROM solution_variants 
WHERE solution_id IN (
  SELECT id FROM solutions WHERE source_type = 'test_fixture'
);

DELETE FROM solutions 
WHERE source_type = 'test_fixture';

-- Create test solutions for each category
-- Each solution has "(Test)" suffix and source_type = 'test_fixture'

-- 1. Apps & Software
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Headspace (Test)', 'apps_software', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 2. Medications
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Prozac (Test)', 'medications', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 3. Supplements & Vitamins
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Vitamin D (Test)', 'supplements_vitamins', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 4. Natural Remedies
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Lavender Oil (Test)', 'natural_remedies', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 5. Beauty & Skincare
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Retinol Cream (Test)', 'beauty_skincare', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 6. Exercise & Movement
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Running (Test)', 'exercise_movement', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 7. Meditation & Mindfulness
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Mindfulness Meditation (Test)', 'meditation_mindfulness', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 8. Habits & Routines
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Morning Routine (Test)', 'habits_routines', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 9. Therapists & Counselors
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('CBT Therapy (Test)', 'therapists_counselors', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 10. Doctors & Specialists
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Psychiatrist (Test)', 'doctors_specialists', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 11. Coaches & Mentors
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Life Coach (Test)', 'coaches_mentors', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 12. Alternative Practitioners
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Acupuncture (Test)', 'alternative_practitioners', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 13. Professional Services
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Financial Advisor (Test)', 'professional_services', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 14. Medical Procedures
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Physical Therapy (Test)', 'medical_procedures', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 15. Crisis Resources
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Crisis Hotline (Test)', 'crisis_resources', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 16. Products & Devices
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Fitbit (Test)', 'products_devices', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 17. Books & Courses
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Cognitive Therapy Book (Test)', 'books_courses', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 18. Support Groups
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Anxiety Support Group (Test)', 'support_groups', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 19. Groups & Communities
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Running Club (Test)', 'groups_communities', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 20. Diet & Nutrition
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Mediterranean Diet (Test)', 'diet_nutrition', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 21. Sleep
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Sleep Hygiene (Test)', 'sleep', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 22. Hobbies & Activities
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('Painting (Test)', 'hobbies_activities', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- 23. Financial Products
INSERT INTO solutions (title, solution_category, source_type, is_approved, created_by)
VALUES ('High Yield Savings (Test)', 'financial_products', 'test_fixture', true, '00000000-0000-0000-0000-000000000000');

-- Now create variants for each solution
-- Most categories use "Standard" variant, except dosage categories

-- Create variants for non-dosage categories (Standard variant)
INSERT INTO solution_variants (solution_id, variant_name, is_primary)
SELECT id, 'Standard', true
FROM solutions
WHERE source_type = 'test_fixture'
AND solution_category NOT IN ('medications', 'supplements_vitamins', 'natural_remedies', 'beauty_skincare');

-- Create specific variants for dosage categories
-- Medications - 20mg tablet
INSERT INTO solution_variants (solution_id, variant_name, is_primary, dosage_amount, dosage_unit, dosage_form)
SELECT id, '20mg tablet', true, 20, 'mg', 'tablet'
FROM solutions
WHERE source_type = 'test_fixture' AND solution_category = 'medications';

-- Supplements - 1000IU softgel
INSERT INTO solution_variants (solution_id, variant_name, is_primary, dosage_amount, dosage_unit, dosage_form)
SELECT id, '1000IU softgel', true, 1000, 'IU', 'softgel'
FROM solutions
WHERE source_type = 'test_fixture' AND solution_category = 'supplements_vitamins';

-- Natural Remedies - 5 drops oil
INSERT INTO solution_variants (solution_id, variant_name, is_primary, dosage_amount, dosage_unit, dosage_form)
SELECT id, '5 drops oil', true, 5, 'drops', 'oil'
FROM solutions
WHERE source_type = 'test_fixture' AND solution_category = 'natural_remedies';

-- Beauty & Skincare - Standard (no specific dosage)
INSERT INTO solution_variants (solution_id, variant_name, is_primary)
SELECT id, 'Standard', true
FROM solutions
WHERE source_type = 'test_fixture' AND solution_category = 'beauty_skincare';

-- Verify the setup
SELECT 
  s.title, 
  s.solution_category,
  s.is_approved,
  s.source_type,
  sv.variant_name
FROM solutions s
JOIN solution_variants sv ON sv.solution_id = s.id
WHERE s.source_type = 'test_fixture'
ORDER BY s.solution_category, s.title;

-- Should return exactly 23 rows, all with is_approved = true