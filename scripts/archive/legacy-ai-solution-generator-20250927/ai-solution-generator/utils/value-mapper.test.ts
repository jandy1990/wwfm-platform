import assert from 'node:assert/strict'

import { mapAllFieldsToDropdowns } from './value-mapper'
import { validateFields } from '../config/category-fields'

async function run() {
  const mappedDosage = mapAllFieldsToDropdowns(
    {
      side_effects: ['Nausea', ' nausea ', 'Headaches', 'NAUSEA'],
      frequency: 'Once daily'
    },
    'natural_remedies'
  )

  assert.ok(Array.isArray(mappedDosage.side_effects), 'side_effects should remain an array')
  assert.equal(mappedDosage.side_effects.length, 2, 'Duplicate side_effect entries should be removed')
  assert.ok(
    mappedDosage.side_effects.includes('Nausea'),
    'Canonical dropdown value should be preserved after dedupe'
  )
  assert.equal(
    mappedDosage.frequency,
    'once daily',
    'Frequency value should map to canonical dropdown casing'
  )

  const validationErrors = validateFields('meditation_mindfulness', {
    startup_cost: 'Free',
    ongoing_cost: 'Free',
    time_to_results: 'Immediately'
  })

  assert.ok(
    validationErrors.some(error => error.includes('challenges')),
    'Validation should require array field for category configuration'
  )

  const cleanedMeditation = mapAllFieldsToDropdowns(
    {
      challenges: ['Lack of time', 'lack of time', 'difficulty focusing'],
      startup_cost: 'Free',
      ongoing_cost: 'Free',
      time_to_results: '1-2 weeks'
    },
    'meditation_mindfulness'
  )

  assert.equal(
    cleanedMeditation.challenges.length,
    2,
    'Challenges array should remove case-insensitive duplicates'
  )

  console.log('✅ value-mapper normalization checks passed')
}

run().catch(error => {
  console.error('❌ value-mapper normalization checks failed')
  console.error(error)
  process.exit(1)
})
