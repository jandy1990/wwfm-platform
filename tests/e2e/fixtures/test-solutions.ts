/**
 * Test Solutions Fixture
 * 
 * These are permanent test solutions created in the database for testing purposes.
 * Each solution:
 * - Has "(Test)" in the title for clear identification
 * - Is marked with source_type = 'test_fixture'
 * - Has appropriate variants (dosage or Standard)
 * - Is pre-approved and ready for use
 * 
 * DO NOT DELETE these from the database - they are permanent fixtures.
 */

export const TEST_SOLUTIONS = {
  // Apps & Software
  apps_software: 'Headspace (Test)',
  
  // Dosage categories (with specific variants)
  medications: 'Prozac (Test)', // 20mg tablet
  supplements_vitamins: 'Vitamin D (Test)', // 1000IU softgel
  natural_remedies: 'Lavender Oil (Test)', // 5 drops oil
  beauty_skincare: 'Retinol Cream (Test)', // Standard variant
  
  // Practice categories
  exercise_movement: 'Running (Test)',
  meditation_mindfulness: 'Mindfulness Meditation (Test)',
  habits_routines: 'Morning Routine (Test)',
  
  // Session categories
  therapists_counselors: 'CBT Therapy (Test)',
  doctors_specialists: 'Psychiatrist (Test)',
  coaches_mentors: 'Life Coach (Test)',
  alternative_practitioners: 'Acupuncture (Test)',
  professional_services: 'Financial Advisor (Test)',
  medical_procedures: 'Physical Therapy (Test)',
  crisis_resources: 'Crisis Hotline (Test)',
  
  // Purchase categories
  products_devices: 'Fitbit (Test)',
  books_courses: 'Cognitive Therapy Book (Test)',
  
  // Community categories
  support_groups: 'Anxiety Support Group (Test)',
  groups_communities: 'Running Club (Test)',
  
  // Lifestyle categories
  diet_nutrition: 'Mediterranean Diet (Test)',
  sleep: 'Sleep Hygiene (Test)',
  
  // Hobby category
  hobbies_activities: 'Painting (Test)',
  
  // Financial category
  financial_products: 'High Yield Savings (Test)'
} as const;

// Type-safe category type
export type SolutionCategory = keyof typeof TEST_SOLUTIONS;

// Helper to get test solution for a category
export function getTestSolution(category: SolutionCategory): string {
  return TEST_SOLUTIONS[category];
}

// All test solution titles for cleanup/verification
export const ALL_TEST_SOLUTIONS = Object.values(TEST_SOLUTIONS);

// SQL to verify test solutions exist (for test setup)
export const VERIFY_TEST_SOLUTIONS_SQL = `
  SELECT 
    solution_category,
    COUNT(*) as count
  FROM solutions 
  WHERE source_type = 'test_fixture'
  GROUP BY solution_category
  ORDER BY solution_category;
`;

// Expected count per category (should always be 1)
export const EXPECTED_TEST_SOLUTION_COUNT = 23;