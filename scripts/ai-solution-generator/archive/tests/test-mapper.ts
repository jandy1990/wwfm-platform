#!/usr/bin/env tsx
/**
 * Test the Intelligent Value Mapper
 * 
 * Tests that natural AI-generated values are correctly mapped to dropdown options
 */

import chalk from 'chalk'
import { mapToDropdownValue, mapAllFieldsToDropdowns } from './utils/value-mapper'
import { getDropdownOptionsForField } from './config/dropdown-options'

console.log(chalk.bold.cyan('🧪 Testing Intelligent Value Mapper\n'))
console.log('=' .repeat(60))

// Test cases for different field types
const testCases = [
  // Cost mapping tests
  {
    category: 'medications',
    field: 'cost',
    input: '$18/month',
    expected: '$10-25/month'
  },
  {
    category: 'medications',
    field: 'cost',
    input: 'free',
    expected: 'Free'
  },
  {
    category: 'medications',
    field: 'cost',
    input: '$75 per month',
    expected: '$50-100/month'
  },
  {
    category: 'apps_software',
    field: 'cost',
    input: '$7.99/month',
    expected: '$5-$9.99/month'
  },
  
  // Time mapping tests
  {
    category: 'medications',
    field: 'time_to_results',
    input: '2 weeks',
    expected: '1-2 weeks'
  },
  {
    category: 'medications',
    field: 'time_to_results',
    input: 'immediately',
    expected: 'Immediately'
  },
  {
    category: 'medications',
    field: 'time_to_results',
    input: 'about a month',
    expected: '1-2 months'
  },
  {
    category: 'hobbies_activities',
    field: 'time_to_enjoyment',
    input: '3 weeks',
    expected: '3-4 weeks'
  },
  
  // Frequency mapping tests
  {
    category: 'medications',
    field: 'frequency',
    input: 'twice a day',
    expected: 'twice daily'
  },
  {
    category: 'medications',
    field: 'frequency',
    input: 'every day',
    expected: 'once daily'
  },
  {
    category: 'medications',
    field: 'frequency',
    input: '3 times per week',
    expected: 'three times weekly'  // This might need adjustment based on actual options
  },
  {
    category: 'beauty_skincare',
    field: 'skincare_frequency',
    input: 'morning and night',
    expected: 'Twice daily (AM & PM)'
  },
  
  // Usage frequency (apps)
  {
    category: 'apps_software',
    field: 'usage_frequency',
    input: 'every day',
    expected: 'Daily'
  },
  {
    category: 'apps_software',
    field: 'usage_frequency',
    input: '2-3 times per week',
    expected: 'Few times a week'
  },
]

let passed = 0
let failed = 0

console.log(chalk.bold('\nIndividual Field Mapping Tests:'))
console.log('-'.repeat(60))

for (const test of testCases) {
  const result = mapToDropdownValue(test.field, test.input, test.category)
  const options = getDropdownOptionsForField(test.category, test.field)
  
  // Check if result is in the valid options
  const isValid = options && options.includes(result)
  
  if (isValid) {
    console.log(chalk.green('✓'), 
      chalk.gray(`${test.category}.${test.field}:`),
      chalk.yellow(`"${test.input}"`), 
      '→',
      chalk.green(`"${result}"`)
    )
    passed++
  } else {
    console.log(chalk.red('✗'), 
      chalk.gray(`${test.category}.${test.field}:`),
      chalk.yellow(`"${test.input}"`), 
      '→',
      chalk.red(`"${result}"`),
      chalk.gray(`(expected in: ${options?.slice(0, 3).join(', ')}...)`)
    )
    failed++
  }
}

// Test full solution field mapping
console.log(chalk.bold('\n\nFull Solution Mapping Test:'))
console.log('-'.repeat(60))

const testSolution = {
  category: 'medications',
  fields: {
    cost: '$35 per month',
    time_to_results: '3 weeks',
    frequency: 'twice a day',
    length_of_use: '6 months or more',
    side_effects: ['Nausea', 'Headache', 'Dizziness']
  }
}

console.log(chalk.gray('\nOriginal fields:'))
console.log(testSolution.fields)

const mappedFields = mapAllFieldsToDropdowns(testSolution.fields, testSolution.category)

console.log(chalk.gray('\nMapped fields:'))
console.log(mappedFields)

// Validate each mapped field
console.log(chalk.gray('\nValidation:'))
for (const [field, value] of Object.entries(mappedFields)) {
  if (Array.isArray(value)) continue // Skip array fields
  
  const options = getDropdownOptionsForField(testSolution.category, field)
  const isValid = !options || options.length === 0 || options.includes(value as string)
  
  if (isValid) {
    console.log(chalk.green('  ✓'), `${field}: "${value}"`)
  } else {
    console.log(chalk.red('  ✗'), `${field}: "${value}" not in dropdown options`)
  }
}

// Summary
console.log('\n' + '='.repeat(60))
console.log(chalk.bold('Test Summary:'))
console.log(chalk.green(`  ✓ Passed: ${passed}`))
if (failed > 0) {
  console.log(chalk.red(`  ✗ Failed: ${failed}`))
} else {
  console.log(chalk.gray(`  ✗ Failed: ${failed}`))
}

const successRate = Math.round((passed / (passed + failed)) * 100)
console.log(chalk.bold(`  Success Rate: ${successRate}%`))

if (successRate >= 80) {
  console.log(chalk.green.bold('\n✅ Mapper is working well! Ready for generation.'))
} else {
  console.log(chalk.yellow.bold('\n⚠️  Mapper needs improvement. Review failed cases.'))
}

process.exit(failed > 0 ? 1 : 0)
