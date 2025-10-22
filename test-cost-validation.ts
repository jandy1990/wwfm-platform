/**
 * Test script to verify cost validation fix for SessionForm monthly costs
 */

import { validateAndNormalizeSolutionFields } from './lib/solutions/solution-field-validator'

// Test data: SessionForm with monthly cost type and monthly cost value
const testData = {
  category: 'therapists_counselors',
  fields: {
    session_cost_type: 'monthly',
    cost: '$100-200/month',
    session_length: '60 minutes',
    session_frequency: 'Weekly'
  }
}

console.log('Testing cost validation fix...\n')
console.log('Category:', testData.category)
console.log('Fields:', JSON.stringify(testData.fields, null, 2))
console.log('\n---\n')

const result = validateAndNormalizeSolutionFields(
  testData.category,
  testData.fields,
  { allowPartial: true } // Skip required field validation, test only cost validation
)

console.log('Validation Result:')
console.log('- Is Valid:', result.isValid)
console.log('- Errors:', result.errors.length > 0 ? result.errors : 'None')
console.log('- Normalized Fields:', JSON.stringify(result.normalizedFields, null, 2))

if (result.isValid) {
  console.log('\n✅ SUCCESS: Validation passed! The fix is working correctly.')
} else {
  console.log('\n❌ FAILURE: Validation failed. The bug is still present.')
  console.log('Expected: isValid=true')
  console.log('Actual: isValid=false')
  console.log('Errors:', result.errors.join('; '))
}
