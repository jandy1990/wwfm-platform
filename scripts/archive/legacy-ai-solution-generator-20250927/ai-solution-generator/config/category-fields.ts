/**
 * Category Field Configuration
 * 
 * Defines the required fields for each solution category
 * Based on CATEGORY_CONFIG in GoalPageClient.tsx
 * 
 * CRITICAL: These field names MUST match exactly what the UI expects
 * All dropdown values are defined in dropdown-options.ts
 */

export interface CategoryFieldConfig {
  required: string[]
  arrayField?: string
  needsVariants?: boolean
}

export const CATEGORY_FIELDS: Record<string, CategoryFieldConfig> = {
  // DOSAGE FORMS (4 categories) - Need variants with amount/unit/form
  medications: {
    required: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects',
    needsVariants: true
  },
  supplements_vitamins: {
    required: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects',
    needsVariants: true
  },
  natural_remedies: {
    required: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects',
    needsVariants: true
  },
  beauty_skincare: {
    required: ['time_to_results', 'skincare_frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects',
    needsVariants: true
  },

  // PRACTICE FORMS (3 categories)
  meditation_mindfulness: {
    required: ['startup_cost', 'ongoing_cost', 'time_to_results', 'frequency'],
    arrayField: 'challenges'
  },
  exercise_movement: {
    required: ['startup_cost', 'ongoing_cost', 'time_to_results', 'frequency'],
    arrayField: 'challenges'
  },
  habits_routines: {
    required: ['startup_cost', 'ongoing_cost', 'time_to_results', 'time_commitment'],
    arrayField: 'challenges'
  },

  // APP FORM (1 category)
  apps_software: {
    required: ['cost', 'time_to_results', 'usage_frequency', 'subscription_type'],
    arrayField: 'challenges'
  },

  // SESSION FORMS (7 categories)
  therapists_counselors: {
    required: ['cost', 'time_to_results', 'session_frequency', 'format'],
    arrayField: 'challenges'
  },
  doctors_specialists: {
    required: ['cost', 'time_to_results', 'wait_time', 'insurance_coverage'],
    arrayField: 'challenges'
  },
  coaches_mentors: {
    required: ['cost', 'time_to_results', 'session_frequency', 'format'],
    arrayField: 'challenges'
  },
  alternative_practitioners: {
    required: ['cost', 'time_to_results', 'session_frequency', 'treatment_type'],
    arrayField: 'side_effects'
  },
  professional_services: {
    required: ['cost', 'time_to_results', 'specialty', 'frequency'],
    arrayField: 'challenges'
  },
  medical_procedures: {
    required: ['cost', 'time_to_results', 'recovery_time', 'sessions_required'],
    arrayField: 'side_effects'
  },
  crisis_resources: {
    required: ['cost', 'time_to_results', 'format', 'response_time'],
    arrayField: 'challenges'
  },

  // PURCHASE FORMS (2 categories)
  products_devices: {
    required: ['cost', 'time_to_results', 'ease_of_use', 'product_type'],
    arrayField: 'challenges'
  },
  books_courses: {
    required: ['cost', 'time_to_results', 'format', 'time_to_complete'],
    arrayField: 'challenges'
  },

  // COMMUNITY FORMS (2 categories)
  support_groups: {
    required: ['cost', 'time_to_results', 'meeting_frequency', 'format'],
    arrayField: 'challenges'
  },
  groups_communities: {
    required: ['cost', 'time_to_results', 'meeting_frequency', 'format'],
    arrayField: 'challenges'
  },

  // LIFESTYLE FORMS (2 categories)
  diet_nutrition: {
    required: ['cost_impact', 'time_to_results', 'weekly_prep_time', 'still_following'],
    arrayField: 'challenges'
  },
  sleep: {
    required: ['cost_impact', 'time_to_results', 'previous_sleep_hours', 'still_following'],
    arrayField: 'challenges'
  },

  // HOBBY FORM (1 category)
  hobbies_activities: {
    required: ['time_commitment', 'startup_cost', 'ongoing_cost', 'time_to_results'],
    arrayField: 'challenges'
  },

  // FINANCIAL FORM (1 category)
  financial_products: {
    required: ['cost_type', 'financial_benefit', 'time_to_results', 'access_time'],
    arrayField: 'challenges'
  }
}

/**
 * Variant options for dosage categories
 * These are the only 4 categories that have multiple variants
 */
export const DOSAGE_VARIANTS = {
  medications: {
    amounts: [5, 10, 20, 25, 50, 100, 200],
    units: ['mg', 'mcg', 'ml'],
    forms: ['tablet', 'capsule', 'liquid', 'injection', 'patch']
  },
  supplements_vitamins: {
    amounts: [100, 250, 500, 1000, 5000],
    units: ['mg', 'mcg', 'IU', 'ml'],
    forms: ['tablet', 'capsule', 'softgel', 'powder', 'liquid', 'gummy']
  },
  natural_remedies: {
    amounts: [50, 100, 250, 500, 1000],
    units: ['mg', 'ml', 'drops'],
    forms: ['tincture', 'tea', 'extract', 'oil', 'capsule', 'powder']
  },
  beauty_skincare: {
    amounts: [0.5, 1, 2, 5, 10],
    units: ['%', 'oz', 'ml'],
    forms: ['serum', 'cream', 'gel', 'lotion', 'mask', 'cleanser']
  }
}

/**
 * Get the required fields for a category
 */
export function getRequiredFields(category: string): string[] {
  return CATEGORY_FIELDS[category]?.required || []
}

/**
 * Get the array field for a category
 */
export function getArrayField(category: string): string | undefined {
  return CATEGORY_FIELDS[category]?.arrayField
}

/**
 * Check if a category needs variants
 */
export function needsVariants(category: string): boolean {
  return CATEGORY_FIELDS[category]?.needsVariants || false
}

/**
 * Validate that a solution has all required fields
 * Now also checks if field values match dropdown options
 */
export function validateFields(category: string, fields: Record<string, any>): string[] {
  const config = CATEGORY_FIELDS[category]
  if (!config) return [`Unknown category: ${category}`]
  
  const errors: string[] = []
  
  // Check required fields
  for (const field of config.required) {
    if (!fields[field]) {
      errors.push(`Missing required field: ${field}`)
    }
  }
  
  // Check array field
  if (config.arrayField && !fields[config.arrayField]) {
    errors.push(`Missing array field: ${config.arrayField}`)
  } else if (config.arrayField) {
    const arrayValue = fields[config.arrayField]
    if (!Array.isArray(arrayValue) || arrayValue.length === 0) {
      errors.push(`Missing array field: ${config.arrayField}`)
    }
  }

  // Note: Dropdown value validation is now handled in master-prompts.ts
  // via validateDropdownValues function
  
  return errors
}
