/**
 * Test the Value Mapper
 * 
 * This script tests that natural AI-generated values
 * are correctly mapped to dropdown options
 */

import { 
  mapCostToDropdown, 
  mapTimeToDropdown, 
  mapFrequencyToDropdown,
  mapAllFieldsToDropdowns 
} from './utils/value-mapper'
import { getDropdownOptionsForField } from './config/dropdown-options'
import chalk from 'chalk'

console.log(chalk.cyan.bold('\n🧪 Testing Value Mapper\n'))
console.log(chalk.gray('━'.repeat(50)))

// Test cost mapping
console.log(chalk.yellow('\n📊 Testing Cost Mapping:'))
const costTests = [
  { input: '$18/month', category: 'medications' },
  { input: 'free', category: 'apps_software' },
  { input: '$75', category: 'products_devices' },
  { input: '$150 per session', category: 'therapists_counselors' },
  { input: '$7.99/month', category: 'apps_software' }
]

costTests.forEach(test => {
  const options = getDropdownOptionsForField(test.category, 'cost')
  if (options) {
    const result = mapCostToDropdown(test.input, options)
    console.log(chalk.gray(`  "${test.input}" → "${result}"`))
  }
})

// Test time mapping
console.log(chalk.yellow('\n⏱️  Testing Time Mapping:'))
const timeTests = [
  { input: '2 weeks', field: 'time_to_results' },
  { input: 'immediately', field: 'time_to_results' },
  { input: 'about a month', field: 'time_to_results' },
  { input: '3 days', field: 'time_to_results' },
  { input: '6 months', field: 'time_to_results' }
]

const timeOptions = getDropdownOptionsForField('medications', 'time_to_results')
if (timeOptions) {
  timeTests.forEach(test => {
    const result = mapTimeToDropdown(test.input, timeOptions)
    console.log(chalk.gray(`  "${test.input}" → "${result}"`))
  })
}

// Test frequency mapping
console.log(chalk.yellow('\n🔄 Testing Frequency Mapping:'))
const frequencyTests = [
  { input: 'twice a day', category: 'medications' },
  { input: 'every morning', category: 'medications' },
  { input: '3 times per week', category: 'exercise_movement' },
  { input: 'daily', category: 'meditation_mindfulness' },
  { input: 'as needed', category: 'medications' }
]

frequencyTests.forEach(test => {
  const options = getDropdownOptionsForField(test.category, 'frequency')
  if (options) {
    const result = mapFrequencyToDropdown(test.input, options)
    console.log(chalk.gray(`  "${test.input}" → "${result}"`))
  }
})

// Test complete field mapping
console.log(chalk.yellow('\n📦 Testing Complete Solution Mapping:'))
const testSolution = {
  fields: {
    cost: '$18/month',
    time_to_results: '2-3 weeks',
    frequency: 'twice daily',
    length_of_use: '6 months or more',
    side_effects: ['Nausea', 'Headache', 'Dizziness']
  },
  category: 'medications'
}

console.log(chalk.gray('\n  Original fields:'))
console.log(chalk.gray(JSON.stringify(testSolution.fields, null, 4)))

const mappedFields = mapAllFieldsToDropdowns(testSolution.fields, testSolution.category)

console.log(chalk.gray('\n  Mapped fields:'))
console.log(chalk.green(JSON.stringify(mappedFields, null, 4)))

// Show changes
console.log(chalk.cyan('\n  Changes made:'))
for (const [field, originalValue] of Object.entries(testSolution.fields)) {
  if (JSON.stringify(originalValue) !== JSON.stringify(mappedFields[field])) {
    console.log(chalk.yellow(`    ${field}: "${originalValue}" → "${mappedFields[field]}"`))
  } else {
    console.log(chalk.gray(`    ${field}: No change needed`))
  }
}

console.log(chalk.green.bold('\n✅ Value Mapper Test Complete!\n'))
