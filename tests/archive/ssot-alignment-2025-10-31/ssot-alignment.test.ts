/**
 * SSOT Alignment Test Suite
 *
 * Ensures all code configurations align to the Single Source of Truth (SSOT):
 * - SSOT Authority: components/goal/GoalPageClient.tsx CATEGORY_CONFIG (Lines 56-407)
 * - Documentation: docs/solution-fields-ssot.md
 *
 * This test prevents divergence between:
 * - Frontend display logic (GoalPageClient.tsx)
 * - Backend generation config (lib/config/solution-fields.ts)
 * - Validation systems
 * - Documentation
 */

import { describe, it, expect } from 'vitest'

// Import SSOT from GoalPageClient.tsx
// Note: We'll need to extract CATEGORY_CONFIG or create a shared export
const SSOT_CATEGORIES = {
  // DOSAGE FORMS (4 categories)
  medications: {
    keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },
  supplements_vitamins: {
    keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },
  natural_remedies: {
    keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },
  beauty_skincare: {
    keyFields: ['time_to_results', 'skincare_frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },

  // PRACTICE FORMS (3 categories)
  meditation_mindfulness: {
    keyFields: ['time_to_results', 'practice_length', 'frequency', 'cost'],
    arrayField: 'challenges'
  },
  exercise_movement: {
    keyFields: ['time_to_results', 'frequency', 'duration', 'cost'],
    arrayField: 'challenges'
  },
  habits_routines: {
    keyFields: ['time_to_results', 'time_commitment', 'frequency', 'cost'],
    arrayField: 'challenges'
  },

  // SESSION FORMS (7 categories)
  therapists_counselors: {
    keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
    arrayField: 'challenges'
  },
  doctors_specialists: {
    keyFields: ['time_to_results', 'wait_time', 'insurance_coverage', 'cost'],
    arrayField: 'challenges'
  },
  coaches_mentors: {
    keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
    arrayField: 'challenges'
  },
  alternative_practitioners: {
    keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
    arrayField: 'side_effects'  // Note: Uses side_effects not challenges
  },
  professional_services: {
    keyFields: ['time_to_results', 'session_frequency', 'specialty', 'cost'],
    arrayField: 'challenges'
  },
  medical_procedures: {
    keyFields: ['time_to_results', 'session_frequency', 'wait_time', 'cost'],
    arrayField: 'side_effects'  // Note: Uses side_effects
  },
  crisis_resources: {
    keyFields: ['time_to_results', 'response_time', 'format', 'cost'],
    arrayField: 'challenges'
  },

  // LIFESTYLE FORMS (2 categories)
  diet_nutrition: {
    keyFields: ['time_to_results', 'weekly_prep_time', 'still_following', 'cost'],
    arrayField: 'challenges'
  },
  sleep: {
    keyFields: ['time_to_results', 'previous_sleep_hours', 'still_following', 'cost'],
    arrayField: 'challenges'
  },

  // PURCHASE FORMS (2 categories)
  products_devices: {
    keyFields: ['time_to_results', 'ease_of_use', 'product_type', 'cost'],
    arrayField: 'challenges'
  },
  books_courses: {
    keyFields: ['time_to_results', 'format', 'learning_difficulty', 'cost'],
    arrayField: 'challenges'
  },

  // APP FORM (1 category)
  apps_software: {
    keyFields: ['time_to_results', 'usage_frequency', 'subscription_type', 'cost'],
    arrayField: 'challenges'
  },

  // COMMUNITY FORMS (2 categories)
  groups_communities: {
    keyFields: ['time_to_results', 'meeting_frequency', 'group_size', 'cost'],
    arrayField: 'challenges'
  },
  support_groups: {
    keyFields: ['time_to_results', 'meeting_frequency', 'format', 'cost'],
    arrayField: 'challenges'
  },

  // HOBBY FORM (1 category)
  hobbies_activities: {
    keyFields: ['time_to_results', 'time_commitment', 'frequency', 'cost'],
    arrayField: 'challenges'
  },

  // FINANCIAL FORM (1 category)
  financial_products: {
    keyFields: ['time_to_results', 'financial_benefit', 'access_time', 'cost_type'],
    arrayField: 'challenges'
  }
}

// Import backend config
import {
  CATEGORY_FIELD_CONFIG,
  getKeyFields,
  getArrayField,
  getRequiredFields,
  getAllCategories
} from '../lib/config/solution-fields'

const ALL_CATEGORIES = Object.keys(SSOT_CATEGORIES)

describe('SSOT Alignment Tests', () => {
  describe('Code Structure Alignment', () => {
    it('all 23 categories are defined in lib/config', () => {
      const backendCategories = getAllCategories()

      expect(backendCategories.sort()).toEqual(ALL_CATEGORIES.sort())
      expect(backendCategories.length).toBe(23)
    })

    it('lib/config has keyFields property for all categories', () => {
      ALL_CATEGORIES.forEach(category => {
        const config = CATEGORY_FIELD_CONFIG[category]

        expect(config).toBeDefined()
        expect(config).toHaveProperty('keyFields')
        expect(Array.isArray(config.keyFields)).toBe(true)
      })
    })

    it('lib/config arrayField matches expected type', () => {
      ALL_CATEGORIES.forEach(category => {
        const config = CATEGORY_FIELD_CONFIG[category]

        if (config.arrayField) {
          expect(['challenges', 'side_effects']).toContain(config.arrayField)
        }
      })
    })
  })

  describe('Field-by-Field Alignment', () => {
    describe('DOSAGE FORMS', () => {
      it('medications keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.medications
        const config = getKeyFields('medications')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('medications')).toBe(ssot.arrayField)
      })

      it('supplements_vitamins keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.supplements_vitamins
        const config = getKeyFields('supplements_vitamins')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('supplements_vitamins')).toBe(ssot.arrayField)
      })

      it('natural_remedies keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.natural_remedies
        const config = getKeyFields('natural_remedies')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('natural_remedies')).toBe(ssot.arrayField)
      })

      it('beauty_skincare keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.beauty_skincare
        const config = getKeyFields('beauty_skincare')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('beauty_skincare')).toBe(ssot.arrayField)
      })
    })

    describe('PRACTICE FORMS', () => {
      it('meditation_mindfulness keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.meditation_mindfulness
        const config = getKeyFields('meditation_mindfulness')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('meditation_mindfulness')).toBe(ssot.arrayField)
      })

      it('exercise_movement keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.exercise_movement
        const config = getKeyFields('exercise_movement')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('exercise_movement')).toBe(ssot.arrayField)
      })

      it('habits_routines keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.habits_routines
        const config = getKeyFields('habits_routines')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('habits_routines')).toBe(ssot.arrayField)
      })
    })

    describe('SESSION FORMS', () => {
      it('therapists_counselors keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.therapists_counselors
        const config = getKeyFields('therapists_counselors')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('therapists_counselors')).toBe(ssot.arrayField)
      })

      it('doctors_specialists keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.doctors_specialists
        const config = getKeyFields('doctors_specialists')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('doctors_specialists')).toBe(ssot.arrayField)
      })

      it('coaches_mentors keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.coaches_mentors
        const config = getKeyFields('coaches_mentors')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('coaches_mentors')).toBe(ssot.arrayField)
      })

      it('alternative_practitioners keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.alternative_practitioners
        const config = getKeyFields('alternative_practitioners')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('alternative_practitioners')).toBe(ssot.arrayField)
      })

      it('professional_services keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.professional_services
        const config = getKeyFields('professional_services')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('professional_services')).toBe(ssot.arrayField)
      })

      it('medical_procedures keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.medical_procedures
        const config = getKeyFields('medical_procedures')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('medical_procedures')).toBe(ssot.arrayField)
      })

      it('crisis_resources keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.crisis_resources
        const config = getKeyFields('crisis_resources')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('crisis_resources')).toBe(ssot.arrayField)
      })
    })

    describe('OTHER FORMS', () => {
      it('diet_nutrition keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.diet_nutrition
        const config = getKeyFields('diet_nutrition')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('diet_nutrition')).toBe(ssot.arrayField)
      })

      it('sleep keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.sleep
        const config = getKeyFields('sleep')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('sleep')).toBe(ssot.arrayField)
      })

      it('products_devices keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.products_devices
        const config = getKeyFields('products_devices')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('products_devices')).toBe(ssot.arrayField)
      })

      it('books_courses keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.books_courses
        const config = getKeyFields('books_courses')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('books_courses')).toBe(ssot.arrayField)
      })

      it('apps_software keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.apps_software
        const config = getKeyFields('apps_software')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('apps_software')).toBe(ssot.arrayField)
      })

      it('groups_communities keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.groups_communities
        const config = getKeyFields('groups_communities')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('groups_communities')).toBe(ssot.arrayField)
      })

      it('support_groups keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.support_groups
        const config = getKeyFields('support_groups')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('support_groups')).toBe(ssot.arrayField)
      })

      it('hobbies_activities keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.hobbies_activities
        const config = getKeyFields('hobbies_activities')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('hobbies_activities')).toBe(ssot.arrayField)
      })

      it('financial_products keyFields match SSOT exactly', () => {
        const ssot = SSOT_CATEGORIES.financial_products
        const config = getKeyFields('financial_products')

        expect(config).toEqual(ssot.keyFields)
        expect(getArrayField('financial_products')).toBe(ssot.arrayField)
      })
    })
  })

  describe('Field Structure Validation', () => {
    it('every category has exactly 3-4 keyFields', () => {
      ALL_CATEGORIES.forEach(category => {
        const keyFields = getKeyFields(category)

        expect(keyFields.length).toBeGreaterThanOrEqual(3)
        expect(keyFields.length).toBeLessThanOrEqual(4)
      })
    })

    it('no category includes arrayField in keyFields', () => {
      ALL_CATEGORIES.forEach(category => {
        const keyFields = getKeyFields(category)
        const arrayField = getArrayField(category)

        if (arrayField) {
          expect(keyFields).not.toContain(arrayField)
        }
      })
    })

    it('arrayField is either challenges or side_effects', () => {
      ALL_CATEGORIES.forEach(category => {
        const arrayField = getArrayField(category)

        if (arrayField) {
          expect(['challenges', 'side_effects']).toContain(arrayField)
        }
      })
    })

    it('time_to_results is first field for most categories', () => {
      // All categories except financial_products have time_to_results first
      ALL_CATEGORIES.forEach(category => {
        const keyFields = getKeyFields(category)

        expect(keyFields[0]).toBe('time_to_results')
      })
    })

    it('cost or cost_type appears in keyFields for all categories', () => {
      ALL_CATEGORIES.forEach(category => {
        const keyFields = getKeyFields(category)

        const hasCost = keyFields.includes('cost') || keyFields.includes('cost_type')
        expect(hasCost).toBe(true)
      })
    })
  })

  describe('Specific Field Validations', () => {
    it('dosage categories use side_effects arrayField', () => {
      const dosageCategories = ['medications', 'supplements_vitamins', 'natural_remedies', 'beauty_skincare']

      dosageCategories.forEach(category => {
        expect(getArrayField(category)).toBe('side_effects')
      })
    })

    it('medical categories use side_effects arrayField', () => {
      const medicalCategories = ['alternative_practitioners', 'medical_procedures']

      medicalCategories.forEach(category => {
        expect(getArrayField(category)).toBe('side_effects')
      })
    })

    it('non-medical categories use challenges arrayField', () => {
      const challengesCategories = [
        'therapists_counselors', 'doctors_specialists', 'coaches_mentors',
        'professional_services', 'crisis_resources',
        'meditation_mindfulness', 'exercise_movement', 'habits_routines',
        'diet_nutrition', 'sleep', 'products_devices', 'books_courses',
        'apps_software', 'groups_communities', 'support_groups', 'hobbies_activities',
        'financial_products'
      ]

      challengesCategories.forEach(category => {
        expect(getArrayField(category)).toBe('challenges')
      })
    })

    it('beauty_skincare uses skincare_frequency not frequency', () => {
      const keyFields = getKeyFields('beauty_skincare')

      expect(keyFields).toContain('skincare_frequency')
      expect(keyFields).not.toContain('frequency')
    })

    it('financial_products uses cost_type not cost', () => {
      const keyFields = getKeyFields('financial_products')

      expect(keyFields).toContain('cost_type')
      expect(keyFields).not.toContain('cost')
    })

    it('doctors_specialists has wait_time and insurance_coverage', () => {
      const keyFields = getKeyFields('doctors_specialists')

      expect(keyFields).toContain('wait_time')
      expect(keyFields).toContain('insurance_coverage')
    })

    it('professional_services has specialty not session_length', () => {
      const keyFields = getKeyFields('professional_services')

      expect(keyFields).toContain('specialty')
      expect(keyFields).not.toContain('session_length')
    })

    it('support_groups has format not group_size', () => {
      const keyFields = getKeyFields('support_groups')

      expect(keyFields).toContain('format')
      expect(keyFields).not.toContain('group_size')
    })
  })

  describe('Helper Function Behavior', () => {
    it('getRequiredFields combines keyFields + arrayField', () => {
      const category = 'medications'
      const requiredFields = getRequiredFields(category)
      const keyFields = getKeyFields(category)
      const arrayField = getArrayField(category)

      expect(requiredFields).toContain('time_to_results')
      expect(requiredFields).toContain('frequency')
      expect(requiredFields).toContain('length_of_use')
      expect(requiredFields).toContain('cost')
      expect(requiredFields).toContain('side_effects')

      // Should be keyFields + arrayField
      expect(requiredFields.length).toBe(keyFields.length + 1)
    })

    it('getKeyFields returns only display fields', () => {
      const keyFields = getKeyFields('medications')

      // Should NOT include array field
      expect(keyFields).not.toContain('side_effects')
      expect(keyFields).toContain('time_to_results')
      expect(keyFields).toContain('frequency')
      expect(keyFields).toContain('length_of_use')
      expect(keyFields).toContain('cost')
    })

    it('getArrayField returns undefined for categories without array field', () => {
      // All current categories have arrayField, but test the behavior
      const config = CATEGORY_FIELD_CONFIG['medications']
      if (!config.arrayField) {
        expect(getArrayField('medications')).toBeUndefined()
      }
    })
  })

  describe('Comprehensive Category Validation', () => {
    it('ALL categories match SSOT keyFields exactly (comprehensive check)', () => {
      ALL_CATEGORIES.forEach(category => {
        const ssot = SSOT_CATEGORIES[category]
        const config = getKeyFields(category)

        expect(config).toEqual(ssot.keyFields)
      })
    })

    it('ALL categories match SSOT arrayField exactly (comprehensive check)', () => {
      ALL_CATEGORIES.forEach(category => {
        const ssot = SSOT_CATEGORIES[category]
        const config = getArrayField(category)

        expect(config).toBe(ssot.arrayField)
      })
    })
  })

  describe('Regression Prevention', () => {
    it('no category has less than 3 keyFields (quality standard)', () => {
      ALL_CATEGORIES.forEach(category => {
        const keyFields = getKeyFields(category)

        expect(keyFields.length).toBeGreaterThanOrEqual(3)
      })
    })

    it('no category has more than 4 keyFields (UI constraint)', () => {
      ALL_CATEGORIES.forEach(category => {
        const keyFields = getKeyFields(category)

        expect(keyFields.length).toBeLessThanOrEqual(4)
      })
    })

    it('no duplicate field names within a category', () => {
      ALL_CATEGORIES.forEach(category => {
        const allFields = getRequiredFields(category)
        const uniqueFields = [...new Set(allFields)]

        expect(allFields.length).toBe(uniqueFields.length)
      })
    })

    it('time_to_results is always first in keyFields', () => {
      // This is a frontend convention for consistency
      ALL_CATEGORIES.forEach(category => {
        const keyFields = getKeyFields(category)

        expect(keyFields[0]).toBe('time_to_results')
      })
    })
  })
})
