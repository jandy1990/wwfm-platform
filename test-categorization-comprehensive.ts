// Comprehensive Auto-Categorization Test Suite
// 100 test cases covering all 23 categories
// Run with: npx tsx test-categorization-comprehensive.ts

import { detectCategoriesFromKeywords } from './lib/solutions/categorization';

interface TestCase {
  input: string;
  expected: string;
  description: string;
  category: string;
}

const testCases: TestCase[] = [
  // ========================================
  // supplements_vitamins (10 tests)
  // ========================================
  { input: 'Vitamin D', expected: 'supplements_vitamins', description: 'Basic vitamin', category: 'supplements_vitamins' },
  { input: 'B12', expected: 'supplements_vitamins', description: 'Vitamin abbreviation', category: 'supplements_vitamins' },
  { input: 'Omega-3', expected: 'supplements_vitamins', description: 'Common supplement', category: 'supplements_vitamins' },
  { input: 'Magnesium', expected: 'supplements_vitamins', description: 'Mineral supplement', category: 'supplements_vitamins' },
  { input: 'Vitamin C', expected: 'supplements_vitamins', description: 'Common vitamin', category: 'supplements_vitamins' },
  { input: 'Iron Supplement', expected: 'supplements_vitamins', description: 'Mineral with keyword', category: 'supplements_vitamins' },
  { input: 'Multivitamin', expected: 'supplements_vitamins', description: 'Combined supplement', category: 'supplements_vitamins' },
  { input: 'Fish Oil', expected: 'supplements_vitamins', description: 'Oil supplement', category: 'supplements_vitamins' },
  { input: 'Vitamin E', expected: 'supplements_vitamins', description: 'Fat-soluble vitamin', category: 'supplements_vitamins' },
  { input: 'Calcium', expected: 'supplements_vitamins', description: 'Mineral', category: 'supplements_vitamins' },

  // ========================================
  // medications (10 tests)
  // ========================================
  { input: 'Lexapro', expected: 'medications', description: 'Brand name antidepressant', category: 'medications' },
  { input: 'Sertraline', expected: 'medications', description: 'Generic SSRI', category: 'medications' },
  { input: 'Zoloft', expected: 'medications', description: 'Brand name SSRI', category: 'medications' },
  { input: 'Prozac', expected: 'medications', description: 'Brand name antidepressant', category: 'medications' },
  { input: 'Wellbutrin', expected: 'medications', description: 'Brand name medication', category: 'medications' },
  { input: 'Adderall', expected: 'medications', description: 'ADHD medication', category: 'medications' },
  { input: 'Xanax', expected: 'medications', description: 'Anti-anxiety medication', category: 'medications' },
  { input: 'Ambien', expected: 'medications', description: 'Sleep medication', category: 'medications' },
  { input: 'Ibuprofen', expected: 'medications', description: 'Over-the-counter medication', category: 'medications' },
  { input: 'Aspirin', expected: 'medications', description: 'Common medication', category: 'medications' },

  // ========================================
  // natural_remedies (8 tests)
  // ========================================
  { input: 'Chamomile Tea', expected: 'natural_remedies', description: 'Herbal tea', category: 'natural_remedies' },
  { input: 'Ginger', expected: 'natural_remedies', description: 'Natural root', category: 'natural_remedies' },
  { input: 'Lavender Oil', expected: 'natural_remedies', description: 'Essential oil', category: 'natural_remedies' },
  { input: 'Turmeric', expected: 'natural_remedies', description: 'Natural spice', category: 'natural_remedies' },
  { input: 'Green Tea', expected: 'natural_remedies', description: 'Herbal beverage', category: 'natural_remedies' },
  { input: 'Peppermint', expected: 'natural_remedies', description: 'Herbal remedy', category: 'natural_remedies' },
  { input: 'Echinacea', expected: 'natural_remedies', description: 'Herbal supplement', category: 'natural_remedies' },
  { input: 'St Johns Wort', expected: 'natural_remedies', description: 'Herbal antidepressant', category: 'natural_remedies' },

  // ========================================
  // apps_software (10 tests)
  // ========================================
  { input: 'Headspace', expected: 'apps_software', description: 'Meditation app', category: 'apps_software' },
  { input: 'Calm', expected: 'apps_software', description: 'Meditation app', category: 'apps_software' },
  { input: 'MyFitnessPal', expected: 'apps_software', description: 'Fitness tracking app', category: 'apps_software' },
  { input: 'Strava', expected: 'apps_software', description: 'Exercise tracking app', category: 'apps_software' },
  { input: 'Insight Timer', expected: 'apps_software', description: 'Meditation app', category: 'apps_software' },
  { input: 'Peloton App', expected: 'apps_software', description: 'Fitness app', category: 'apps_software' },
  { input: 'Noom', expected: 'apps_software', description: 'Weight loss app', category: 'apps_software' },
  { input: 'BetterHelp App', expected: 'apps_software', description: 'Therapy app', category: 'apps_software' },
  { input: 'Sleep Cycle', expected: 'apps_software', description: 'Sleep tracking app', category: 'apps_software' },
  { input: 'Duolingo', expected: 'apps_software', description: 'Learning app', category: 'apps_software' },

  // ========================================
  // products_devices (8 tests)
  // ========================================
  { input: 'Fitbit', expected: 'products_devices', description: 'Fitness tracker device', category: 'products_devices' },
  { input: 'Apple Watch', expected: 'products_devices', description: 'Smartwatch', category: 'products_devices' },
  { input: 'Garmin', expected: 'products_devices', description: 'GPS fitness device', category: 'products_devices' },
  { input: 'Oura Ring', expected: 'products_devices', description: 'Sleep tracking ring', category: 'products_devices' },
  { input: 'Whoop', expected: 'products_devices', description: 'Fitness strap', category: 'products_devices' },
  { input: 'Withings Scale', expected: 'products_devices', description: 'Smart scale', category: 'products_devices' },
  { input: 'Light Therapy Lamp', expected: 'products_devices', description: 'SAD treatment device', category: 'products_devices' },
  { input: 'Massage Gun', expected: 'products_devices', description: 'Recovery device', category: 'products_devices' },

  // ========================================
  // therapists_counselors (6 tests)
  // ========================================
  { input: 'CBT Therapy', expected: 'therapists_counselors', description: 'Cognitive behavioral therapy', category: 'therapists_counselors' },
  { input: 'Psychotherapy', expected: 'therapists_counselors', description: 'Talk therapy', category: 'therapists_counselors' },
  { input: 'Couples Counseling', expected: 'therapists_counselors', description: 'Relationship therapy', category: 'therapists_counselors' },
  { input: 'Family Therapy', expected: 'therapists_counselors', description: 'Family counseling', category: 'therapists_counselors' },
  { input: 'EMDR', expected: 'therapists_counselors', description: 'Trauma therapy', category: 'therapists_counselors' },
  { input: 'Dialectical Behavior Therapy', expected: 'therapists_counselors', description: 'DBT therapy', category: 'therapists_counselors' },

  // ========================================
  // exercise_movement (8 tests)
  // ========================================
  { input: 'Running', expected: 'exercise_movement', description: 'Cardio exercise', category: 'exercise_movement' },
  { input: 'Yoga', expected: 'exercise_movement', description: 'Mind-body exercise', category: 'exercise_movement' },
  { input: 'Swimming', expected: 'exercise_movement', description: 'Full-body exercise', category: 'exercise_movement' },
  { input: 'Walking', expected: 'exercise_movement', description: 'Low-impact exercise', category: 'exercise_movement' },
  { input: 'Pilates', expected: 'exercise_movement', description: 'Core exercise', category: 'exercise_movement' },
  { input: 'Weight Lifting', expected: 'exercise_movement', description: 'Strength training', category: 'exercise_movement' },
  { input: 'Cycling', expected: 'exercise_movement', description: 'Cardio exercise', category: 'exercise_movement' },
  { input: 'Dancing', expected: 'exercise_movement', description: 'Movement exercise', category: 'exercise_movement' },

  // ========================================
  // meditation_mindfulness (5 tests)
  // ========================================
  { input: 'Meditation', expected: 'meditation_mindfulness', description: 'Mindfulness practice', category: 'meditation_mindfulness' },
  { input: 'Mindfulness', expected: 'meditation_mindfulness', description: 'Awareness practice', category: 'meditation_mindfulness' },
  { input: 'Breathing Exercises', expected: 'meditation_mindfulness', description: 'Breath work', category: 'meditation_mindfulness' },
  { input: 'Guided Meditation', expected: 'meditation_mindfulness', description: 'Led meditation', category: 'meditation_mindfulness' },
  { input: 'Transcendental Meditation', expected: 'meditation_mindfulness', description: 'TM practice', category: 'meditation_mindfulness' },

  // ========================================
  // books_courses (5 tests)
  // ========================================
  { input: 'Atomic Habits', expected: 'books_courses', description: 'Self-help book', category: 'books_courses' },
  { input: 'The Power of Now', expected: 'books_courses', description: 'Mindfulness book', category: 'books_courses' },
  { input: 'Coursera Course', expected: 'books_courses', description: 'Online course', category: 'books_courses' },
  { input: 'Udemy', expected: 'books_courses', description: 'Online learning platform', category: 'books_courses' },
  { input: 'MasterClass', expected: 'books_courses', description: 'Expert courses', category: 'books_courses' },

  // ========================================
  // diet_nutrition (5 tests)
  // ========================================
  { input: 'Mediterranean Diet', expected: 'diet_nutrition', description: 'Dietary approach', category: 'diet_nutrition' },
  { input: 'Keto Diet', expected: 'diet_nutrition', description: 'Low-carb diet', category: 'diet_nutrition' },
  { input: 'Intermittent Fasting', expected: 'diet_nutrition', description: 'Eating pattern', category: 'diet_nutrition' },
  { input: 'Meal Prep', expected: 'diet_nutrition', description: 'Food planning', category: 'diet_nutrition' },
  { input: 'Plant-Based Diet', expected: 'diet_nutrition', description: 'Vegan/vegetarian diet', category: 'diet_nutrition' },

  // ========================================
  // sleep (5 tests)
  // ========================================
  { input: 'Sleep Hygiene', expected: 'sleep', description: 'Sleep habits', category: 'sleep' },
  { input: 'White Noise Machine', expected: 'sleep', description: 'Sleep aid device', category: 'sleep' },
  { input: 'Weighted Blanket', expected: 'sleep', description: 'Sleep comfort item', category: 'sleep' },
  { input: 'Blackout Curtains', expected: 'sleep', description: 'Sleep environment', category: 'sleep' },
  { input: 'Sleep Schedule', expected: 'sleep', description: 'Sleep routine', category: 'sleep' },

  // ========================================
  // support_groups (4 tests)
  // ========================================
  { input: 'AA', expected: 'support_groups', description: 'Alcoholics Anonymous', category: 'support_groups' },
  { input: 'NA', expected: 'support_groups', description: 'Narcotics Anonymous', category: 'support_groups' },
  { input: 'Al-Anon', expected: 'support_groups', description: 'Family support group', category: 'support_groups' },
  { input: 'SMART Recovery', expected: 'support_groups', description: 'Addiction support', category: 'support_groups' },

  // ========================================
  // doctors_specialists (3 tests)
  // ========================================
  { input: 'Psychiatrist', expected: 'doctors_specialists', description: 'Mental health doctor', category: 'doctors_specialists' },
  { input: 'Endocrinologist', expected: 'doctors_specialists', description: 'Hormone specialist', category: 'doctors_specialists' },
  { input: 'Cardiologist', expected: 'doctors_specialists', description: 'Heart specialist', category: 'doctors_specialists' },

  // ========================================
  // alternative_practitioners (3 tests)
  // ========================================
  { input: 'Acupuncture', expected: 'alternative_practitioners', description: 'Traditional Chinese medicine', category: 'alternative_practitioners' },
  { input: 'Chiropractor', expected: 'alternative_practitioners', description: 'Spinal adjustment', category: 'alternative_practitioners' },
  { input: 'Naturopath', expected: 'alternative_practitioners', description: 'Natural medicine practitioner', category: 'alternative_practitioners' },

  // ========================================
  // coaches_mentors (3 tests)
  // ========================================
  { input: 'Life Coach', expected: 'coaches_mentors', description: 'Personal development coach', category: 'coaches_mentors' },
  { input: 'Career Coach', expected: 'coaches_mentors', description: 'Professional development', category: 'coaches_mentors' },
  { input: 'Business Mentor', expected: 'coaches_mentors', description: 'Business guidance', category: 'coaches_mentors' },

  // ========================================
  // groups_communities (3 tests)
  // ========================================
  { input: 'Reddit Community', expected: 'groups_communities', description: 'Online forum', category: 'groups_communities' },
  { input: 'Facebook Group', expected: 'groups_communities', description: 'Social media group', category: 'groups_communities' },
  { input: 'Meetup Group', expected: 'groups_communities', description: 'Local community', category: 'groups_communities' },

  // ========================================
  // hobbies_activities (3 tests)
  // ========================================
  { input: 'Gardening', expected: 'hobbies_activities', description: 'Outdoor hobby', category: 'hobbies_activities' },
  { input: 'Photography', expected: 'hobbies_activities', description: 'Creative hobby', category: 'hobbies_activities' },
  { input: 'Painting', expected: 'hobbies_activities', description: 'Artistic activity', category: 'hobbies_activities' },

  // ========================================
  // habits_routines (2 tests)
  // ========================================
  { input: 'Morning Routine', expected: 'habits_routines', description: 'Daily habit', category: 'habits_routines' },
  { input: 'Journaling', expected: 'habits_routines', description: 'Reflective practice', category: 'habits_routines' },

  // ========================================
  // beauty_skincare (2 tests)
  // ========================================
  { input: 'Retinol', expected: 'beauty_skincare', description: 'Skincare ingredient', category: 'beauty_skincare' },
  { input: 'Hyaluronic Acid', expected: 'beauty_skincare', description: 'Moisturizing ingredient', category: 'beauty_skincare' },

  // ========================================
  // medical_procedures (2 tests)
  // ========================================
  { input: 'Blood Test', expected: 'medical_procedures', description: 'Diagnostic test', category: 'medical_procedures' },
  { input: 'MRI Scan', expected: 'medical_procedures', description: 'Imaging procedure', category: 'medical_procedures' },

  // ========================================
  // crisis_resources (2 tests)
  // ========================================
  { input: 'Crisis Hotline', expected: 'crisis_resources', description: 'Emergency support', category: 'crisis_resources' },
  { input: '988 Suicide Prevention', expected: 'crisis_resources', description: 'Crisis number', category: 'crisis_resources' },

  // ========================================
  // financial_products (2 tests)
  // ========================================
  { input: 'HSA Account', expected: 'financial_products', description: 'Health savings', category: 'financial_products' },
  { input: '401k', expected: 'financial_products', description: 'Retirement account', category: 'financial_products' },
];

async function runComprehensiveTests() {
  console.log('🧪 Comprehensive Auto-Categorization Test Suite');
  console.log('📊 Testing 100 inputs across all 23 categories\n');
  console.log('='.repeat(80));

  let passed = 0;
  let failed = 0;
  const failedTests: Array<{ test: TestCase; actual: string | null; allMatches: string }> = [];
  const categoryStats: Record<string, { total: number; passed: number }> = {};

  for (const testCase of testCases) {
    // Initialize category stats
    if (!categoryStats[testCase.category]) {
      categoryStats[testCase.category] = { total: 0, passed: 0 };
    }
    categoryStats[testCase.category].total++;

    try {
      const results = await detectCategoriesFromKeywords(testCase.input);

      if (results.length === 0) {
        failed++;
        failedTests.push({
          test: testCase,
          actual: null,
          allMatches: 'No categories detected'
        });
        continue;
      }

      const topMatch = results[0];

      if (topMatch.category === testCase.expected) {
        passed++;
        categoryStats[testCase.category].passed++;
      } else {
        failed++;
        failedTests.push({
          test: testCase,
          actual: topMatch.category,
          allMatches: results.map(r => `${r.category} (${r.confidence})`).join(', ')
        });
      }
    } catch (error) {
      failed++;
      failedTests.push({
        test: testCase,
        actual: null,
        allMatches: `ERROR: ${error instanceof Error ? error.message : error}`
      });
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 OVERALL RESULTS: ${passed}/${testCases.length} passed (${failed} failed)`);
  console.log(`   Success Rate: ${Math.round((passed / testCases.length) * 100)}%\n`);

  // Category breakdown
  console.log('📋 CATEGORY BREAKDOWN:\n');
  const sortedCategories = Object.entries(categoryStats).sort((a, b) => a[0].localeCompare(b[0]));

  for (const [category, stats] of sortedCategories) {
    const rate = Math.round((stats.passed / stats.total) * 100);
    const status = stats.passed === stats.total ? '✅' : '⚠️';
    console.log(`${status} ${category.padEnd(30)} ${stats.passed}/${stats.total} (${rate}%)`);
  }

  // Failed tests details
  if (failedTests.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log(`\n❌ FAILED TESTS (${failedTests.length}):\n`);

    for (const failure of failedTests) {
      console.log(`Input: "${failure.test.input}"`);
      console.log(`  Expected: ${failure.test.expected}`);
      console.log(`  Actual: ${failure.actual || 'No detection'}`);
      console.log(`  All matches: ${failure.allMatches}`);
      console.log(`  Description: ${failure.test.description}\n`);
    }
  }

  console.log('='.repeat(80));

  process.exit(failed > 0 ? 1 : 0);
}

runComprehensiveTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
