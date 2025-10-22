// Test script to validate auto-categorization fixes
// Run with: npx tsx test-categorization-fix.ts

import { detectCategoriesFromKeywords } from './lib/solutions/categorization';

async function testCategorization() {
  console.log('🧪 Testing Auto-Categorization Fixes\n');
  console.log('='.repeat(60));

  const testCases = [
    {
      input: 'Vitamin D (DevTools Test)',
      expected: 'supplements_vitamins',
      description: 'Bug #1: Test fixture with parentheses'
    },
    {
      input: 'Vitamin D',
      expected: 'supplements_vitamins',
      description: 'Clean vitamin name'
    },
    {
      input: 'Headspace',
      expected: 'apps_software',
      description: 'App name'
    },
    {
      input: 'Running',
      expected: 'exercise_movement',
      description: 'Exercise activity'
    },
    {
      input: 'CBT Therapy (Test)',
      expected: 'therapists_counselors',
      description: 'Therapy with test suffix'
    },
    {
      input: 'B12',
      expected: 'supplements_vitamins',
      description: 'Short vitamin name'
    },
    {
      input: 'Lexapro',
      expected: 'medications',
      description: 'Medication name'
    },
    {
      input: 'Meditation',
      expected: 'meditation_mindfulness',
      description: 'Practice category'
    },
    {
      input: 'Fitbit',
      expected: 'products_devices',
      description: 'Product/device'
    },
    {
      input: 'AA',
      expected: 'support_groups',
      description: 'Support group acronym'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.description}`);
    console.log(`   Input: "${testCase.input}"`);
    console.log(`   Expected: ${testCase.expected}`);

    try {
      const results = await detectCategoriesFromKeywords(testCase.input);

      if (results.length === 0) {
        console.log(`   ❌ FAIL: No categories detected`);
        failed++;
        continue;
      }

      const topMatch = results[0];
      console.log(`   Detected: ${topMatch.category} (confidence: ${topMatch.confidence})`);

      if (topMatch.category === testCase.expected) {
        console.log(`   ✅ PASS`);
        passed++;
      } else {
        console.log(`   ❌ FAIL: Expected ${testCase.expected}, got ${topMatch.category}`);
        console.log(`   All matches:`, results.map(r => `${r.category} (${r.confidence})`).join(', '));
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ ERROR:`, error instanceof Error ? error.message : error);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Results: ${passed}/${testCases.length} passed (${failed} failed)`);
  console.log(`   Success Rate: ${Math.round((passed / testCases.length) * 100)}%\n`);

  process.exit(failed > 0 ? 1 : 0);
}

testCategorization().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
