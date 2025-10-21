// Focused test suite for the 23 previously failing cases
// Run with: npx tsx test-categorization-fixes.ts

import { detectCategoriesFromKeywords } from './lib/solutions/categorization';

interface TestCase {
  input: string;
  expected: string;
  description: string;
}

// These are the 23 cases that FAILED in the initial comprehensive test
const failedCases: TestCase[] = [
  { input: 'Chamomile Tea', expected: 'natural_remedies', description: 'Herbal tea (was: sleep)' },
  { input: 'Ginger', expected: 'natural_remedies', description: 'Natural root (was: apps_software)' },
  { input: 'Lavender Oil', expected: 'natural_remedies', description: 'Essential oil (was: sleep)' },
  { input: 'Turmeric', expected: 'supplements_vitamins', description: 'Natural spice (was: supplements/beauty tie)' },
  { input: 'Echinacea', expected: 'natural_remedies', description: 'Herbal supplement (was: supplements_vitamins)' },
  { input: 'St Johns Wort', expected: 'supplements_vitamins', description: 'Herbal antidepressant (was: natural_remedies)' },
  { input: 'Light Therapy Lamp', expected: 'products_devices', description: 'SAD treatment device (was: sleep)' },
  { input: 'Dancing', expected: 'hobbies_activities', description: 'Movement exercise (was: exercise_movement)' },
  { input: 'Breathing Exercises', expected: 'meditation_mindfulness', description: 'Breath work (was: sleep)' },
  { input: 'Atomic Habits', expected: 'books_courses', description: 'Self-help book (was: habits_routines)' },
  { input: 'The Power of Now', expected: 'books_courses', description: 'Mindfulness book (was: no detection)' },
  { input: 'Coursera Course', expected: 'apps_software', description: 'Online course (SHOULD BE apps_software)' },
  { input: 'Udemy', expected: 'apps_software', description: 'Online learning platform (SHOULD BE apps_software)' },
  { input: 'MasterClass', expected: 'apps_software', description: 'Expert courses (SHOULD BE apps_software)' },
  { input: 'Intermittent Fasting', expected: 'diet_nutrition', description: 'Eating pattern (was: habits_routines tie)' },
  { input: 'Meal Prep', expected: 'diet_nutrition', description: 'Food planning (was: apps_software)' },
  { input: 'White Noise Machine', expected: 'products_devices', description: 'Sleep aid device (was: sleep)' },
  { input: 'SMART Recovery', expected: 'support_groups', description: 'Addiction support (was: crisis_resources tie)' },
  { input: 'Psychiatrist', expected: 'doctors_specialists', description: 'Mental health doctor (was: therapists_counselors)' },
  { input: 'Chiropractor', expected: 'doctors_specialists', description: 'Spinal adjustment (was: alternative_practitioners)' },
  { input: 'Morning Routine', expected: 'habits_routines', description: 'Daily habit (was: apps_software tie)' },
  { input: 'Journaling', expected: 'habits_routines', description: 'Reflective practice (was: hobbies_activities)' },
  { input: 'Hyaluronic Acid', expected: 'beauty_skincare', description: 'Moisturizing ingredient (was: supplements_vitamins)' },
];

async function runFocusedTests() {
  console.log('🧪 Focused Auto-Categorization Test - Previously Failed Cases');
  console.log('📊 Testing 23 items that failed in initial run\n');
  console.log('='.repeat(80));

  let passed = 0;
  let failed = 0;
  const results: Array<{ test: TestCase; passed: boolean; actual: string | null }> = [];

  for (const testCase of failedCases) {
    try {
      const matches = await detectCategoriesFromKeywords(testCase.input);

      if (matches.length === 0) {
        failed++;
        results.push({ test: testCase, passed: false, actual: null });
        console.log(`❌ "${testCase.input}" → NO DETECTION (expected: ${testCase.expected})`);
      } else {
        const topMatch = matches[0].category;
        if (topMatch === testCase.expected) {
          passed++;
          results.push({ test: testCase, passed: true, actual: topMatch });
          console.log(`✅ "${testCase.input}" → ${topMatch}`);
        } else {
          failed++;
          results.push({ test: testCase, passed: false, actual: topMatch });
          console.log(`❌ "${testCase.input}" → ${topMatch} (expected: ${testCase.expected})`);
        }
      }
    } catch (error) {
      failed++;
      results.push({ test: testCase, passed: false, actual: null });
      console.log(`❌ "${testCase.input}" → ERROR: ${error instanceof Error ? error.message : error}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 RESULTS: ${passed}/${failedCases.length} now passing`);
  console.log(`   Previously: 0/${failedCases.length} (all failed)`);
  console.log(`   Improvement: +${passed} fixes`);
  console.log(`   Success Rate: ${Math.round((passed / failedCases.length) * 100)}%\n`);

  if (failed > 0) {
    console.log(`⚠️  Still failing: ${failed} items\n`);
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - "${r.test.input}": ${r.test.description}`);
    });
  }

  console.log('='.repeat(80));

  process.exit(failed > 0 ? 1 : 0);
}

runFocusedTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
