// Single test to check if categorization is working
import { detectCategoriesFromKeywords } from './lib/solutions/categorization';

async function testSingle() {
  console.log('Testing: "Ginger"');
  const start = Date.now();

  try {
    const result = await detectCategoriesFromKeywords('Ginger');
    const elapsed = Date.now() - start;

    console.log(`Result: ${result[0]?.category || 'NO MATCH'}`);
    console.log(`Time: ${elapsed}ms`);
    console.log(`Expected: natural_remedies`);
    console.log(`Status: ${result[0]?.category === 'natural_remedies' ? '✅ PASS' : '❌ FAIL'}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

testSingle();
