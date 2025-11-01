/**
 * Category Configuration Interface
 *
 * SSOT Authority: components/goal/GoalPageClient.tsx CATEGORY_CONFIG (Lines 56-407)
 * Documentation: docs/solution-fields-ssot.md
 *
 * Structure aligns to frontend display:
 * - keyFields: 3-4 fields displayed on solution cards
 * - arrayField: 1 field displayed separately as pills (challenges or side_effects)
 */
export interface CategoryConfig {
  keyFields: string[]  // 3-4 display fields (from SSOT)
  arrayField?: string  // challenges or side_effects (displayed separately)
  fieldToDropdownMap: Record<string, string>
  contextSources: string[]
  needsVariants?: boolean  // Only for dosage categories
}

export const CATEGORY_FIELD_CONFIG: Record<string, CategoryConfig> = {
  therapists_counselors: {
    // SSOT: GoalPageClient.tsx lines 170-183
    keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
    arrayField: 'challenges',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      session_frequency: 'session_frequency',
      session_length: 'session_length',
      cost: 'session_cost_per',
      challenges: 'therapy_challenges'
    },
    contextSources: ['user_experiences', 'studies', 'expert_analysis', 'case_studies']
  },
  coaches_mentors: {
    // SSOT: GoalPageClient.tsx lines 198-211
    keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
    arrayField: 'challenges',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      session_frequency: 'session_frequency',
      session_length: 'session_length',
      cost: 'session_cost_per',
      challenges: 'coaching_challenges'
    },
    contextSources: ['user_experiences', 'case_studies', 'expert_analysis', 'community_feedback']
  },
  alternative_practitioners: {
    // SSOT: GoalPageClient.tsx lines 212-225
    keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
    arrayField: 'side_effects',  // Note: Uses side_effects instead of challenges
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      session_frequency: 'session_frequency',
      session_length: 'session_length',
      cost: 'session_cost_per',
      side_effects: 'common_side_effects'
    },
    contextSources: ['user_experiences', 'community_feedback', 'case_studies', 'studies']
  },
  doctors_specialists: {
    // SSOT: GoalPageClient.tsx lines 184-197
    keyFields: ['time_to_results', 'wait_time', 'insurance_coverage', 'cost'],
    arrayField: 'challenges',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      wait_time: 'wait_time_doctors',
      insurance_coverage: 'insurance_coverage',
      cost: 'session_cost_per',
      challenges: 'medical_challenges'
    },
    contextSources: ['studies', 'expert_analysis', 'user_experiences', 'medical_literature']
  },
  medical_procedures: {
    // SSOT: GoalPageClient.tsx lines 240-253
    keyFields: ['time_to_results', 'session_frequency', 'wait_time', 'cost'],
    arrayField: 'side_effects',  // Note: Uses side_effects like alternative_practitioners
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      session_frequency: 'session_frequency',
      wait_time: 'wait_time_procedures',
      cost: 'session_cost_total',
      side_effects: 'common_side_effects'
    },
    contextSources: ['studies', 'medical_literature', 'user_experiences', 'expert_analysis']
  },
  crisis_resources: {
    // SSOT: GoalPageClient.tsx lines 254-267
    keyFields: ['time_to_results', 'response_time', 'format', 'cost'],
    arrayField: 'challenges',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      response_time: 'response_time',
      format: 'crisis_format',
      cost: 'crisis_cost',
      challenges: 'crisis_challenges'
    },
    contextSources: ['user_experiences', 'case_studies', 'expert_analysis', 'studies']
  },
  meditation_mindfulness: {
    // SSOT: GoalPageClient.tsx lines 126-139
    // Note: Forms collect startup_cost + ongoing_cost, but display shows single derived 'cost'
    keyFields: ['time_to_results', 'practice_length', 'frequency', 'cost'],
    arrayField: 'challenges',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      practice_length: 'practice_length',
      frequency: 'practice_frequency',
      cost: 'practice_ongoing_cost',  // Derived from startup + ongoing
      startup_cost: 'practice_startup_cost',  // Collected but not in keyFields
      ongoing_cost: 'practice_ongoing_cost',  // Collected but not in keyFields
      challenges: 'meditation_challenges'
    },
    contextSources: [
      'meditation app reviews',
      'mindfulness community forums',
      'meditation teacher guidance',
      'contemplative practice studies'
    ]
  },
  exercise_movement: {
    // SSOT: GoalPageClient.tsx lines 140-153
    // Note: Forms collect startup_cost + ongoing_cost, but display shows single derived 'cost'
    keyFields: ['time_to_results', 'frequency', 'duration', 'cost'],
    arrayField: 'challenges',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      frequency: 'practice_frequency',
      duration: 'session_duration',
      cost: 'practice_ongoing_cost',  // Derived from startup + ongoing
      startup_cost: 'practice_startup_cost',  // Collected but not in keyFields
      ongoing_cost: 'practice_ongoing_cost',  // Collected but not in keyFields
      challenges: 'exercise_challenges'
    },
    contextSources: [
      'fitness community discussions',
      'exercise program reviews',
      'trainer recommendations',
      'workout effectiveness studies'
    ]
  },
  habits_routines: {
    // SSOT: GoalPageClient.tsx lines 154-167
    // Note: Forms collect startup_cost + ongoing_cost, but display shows single derived 'cost'
    keyFields: ['time_to_results', 'time_commitment', 'frequency', 'cost'],
    arrayField: 'challenges',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      time_commitment: 'habits_time_commitment',
      frequency: 'practice_frequency',
      cost: 'practice_ongoing_cost',  // Derived from startup + ongoing
      startup_cost: 'practice_startup_cost',  // Collected but not in keyFields
      ongoing_cost: 'practice_ongoing_cost',  // Collected but not in keyFields
      challenges: 'habits_challenges'
    },
    contextSources: [
      'habit formation forums',
      'productivity community feedback',
      'behavior change studies',
      'routine optimization blogs'
    ]
  },
  medications: {
    // SSOT: GoalPageClient.tsx lines 68-81
    keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      frequency: 'frequency',
      length_of_use: 'length_of_use',
      cost: 'dosage_cost_onetime',  // Medications use one-time purchase costs
      side_effects: 'common_side_effects'
    },
    contextSources: ['research', 'studies', 'clinical_trials', 'medical_literature'],
    needsVariants: true
  },
  supplements_vitamins: {
    // SSOT: GoalPageClient.tsx lines 82-95
    keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      frequency: 'frequency',
      length_of_use: 'length_of_use',
      cost: 'dosage_cost_monthly',
      side_effects: 'common_side_effects'
    },
    contextSources: ['research', 'studies', 'consumer_reports', 'user_reviews'],
    needsVariants: true
  },
  natural_remedies: {
    // SSOT: GoalPageClient.tsx lines 96-109
    keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      frequency: 'frequency',
      length_of_use: 'length_of_use',
      cost: 'dosage_cost_monthly',
      side_effects: 'common_side_effects'
    },
    contextSources: ['studies', 'user_experiences', 'community_feedback', 'research'],
    needsVariants: true
  },
  beauty_skincare: {
    // SSOT: GoalPageClient.tsx lines 110-123
    keyFields: ['time_to_results', 'skincare_frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      skincare_frequency: 'skincare_frequency',
      length_of_use: 'length_of_use',
      cost: 'dosage_cost_monthly',
      side_effects: 'common_side_effects'
    },
    contextSources: ['user_reviews', 'beauty_experts', 'consumer_reports', 'community_feedback'],
    needsVariants: true
  },
  books_courses: {
    // SSOT: GoalPageClient.tsx lines 314-327
    keyFields: ['time_to_results', 'format', 'learning_difficulty', 'cost'],
    arrayField: 'challenges',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      format: 'book_format',
      learning_difficulty: 'learning_difficulty',
      cost: 'purchase_cost_onetime',
      challenges: 'learning_challenges'
    },
    contextSources: ['user_reviews', 'expert_analysis', 'community_feedback', 'case_studies']
  },
  apps_software: {
    // SSOT: GoalPageClient.tsx lines 330-343
    keyFields: ['time_to_results', 'usage_frequency', 'subscription_type', 'cost'],
    arrayField: 'challenges',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      usage_frequency: 'usage_frequency',
      subscription_type: 'subscription_type',
      cost: 'app_cost',
      challenges: 'app_challenges'
    },
    contextSources: [
      'app store reviews',
      'software user forums',
      'tech product reviews',
      'productivity app comparisons'
    ]
  },
  diet_nutrition: {
    // SSOT: GoalPageClient.tsx lines 270-283
    keyFields: ['time_to_results', 'weekly_prep_time', 'still_following', 'cost'],
    arrayField: 'challenges',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      weekly_prep_time: 'weekly_prep_time',
      still_following: 'still_following',
      cost: 'diet_cost_impact',  // Note: Labeled "Cost Impact" not absolute cost
      challenges: 'diet_challenges'
    },
    contextSources: ['user_experiences', 'studies', 'expert_analysis', 'community_feedback']
  },
  sleep: {
    // SSOT: GoalPageClient.tsx lines 284-297
    keyFields: ['time_to_results', 'sleep_quality_change', 'still_following', 'cost'],
    arrayField: 'challenges',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      sleep_quality_change: 'sleep_quality_change',
      still_following: 'still_following',
      cost: 'sleep_cost_impact',  // Note: Labeled "Cost Impact" not absolute cost
      challenges: 'sleep_challenges'
    },
    contextSources: ['user_experiences', 'studies', 'community_feedback', 'expert_analysis']
  },
  products_devices: {
    // SSOT: GoalPageClient.tsx lines 300-313
    keyFields: ['time_to_results', 'ease_of_use', 'product_type', 'cost'],
    arrayField: 'challenges',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      ease_of_use: 'ease_of_use',
      product_type: 'product_type',
      cost: 'purchase_cost_onetime',
      challenges: 'product_challenges'
    },
    contextSources: ['user_reviews', 'consumer_reports', 'tech_reviews', 'community_feedback']
  },
  hobbies_activities: {
    // SSOT: GoalPageClient.tsx lines 376-389
    // Note: Forms collect startup_cost + ongoing_cost, derives cost + cost_type for display
    keyFields: ['time_to_results', 'time_commitment', 'frequency', 'cost'],
    arrayField: 'challenges',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      time_commitment: 'time_commitment',
      frequency: 'hobby_frequency',
      cost: 'hobby_ongoing_cost',  // Derived from startup + ongoing
      startup_cost: 'startup_cost',  // Collected but not in keyFields
      ongoing_cost: 'hobby_ongoing_cost',  // Collected but not in keyFields
      // cost_type is internal (free/one_time/recurring/dual) - NOT validated against dropdown
      challenges: 'hobby_challenges'
    },
    contextSources: ['community_feedback', 'user_experiences', 'expert_analysis', 'enthusiast_forums']
  },
  groups_communities: {
    // SSOT: GoalPageClient.tsx lines 346-359
    keyFields: ['time_to_results', 'meeting_frequency', 'group_size', 'cost'],
    arrayField: 'challenges',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      meeting_frequency: 'meeting_frequency',
      group_size: 'group_size',
      cost: 'community_cost_monthly',
      challenges: 'community_challenges'
    },
    contextSources: ['community_feedback', 'user_experiences', 'case_studies', 'expert_analysis']
  },
  support_groups: {
    // SSOT: GoalPageClient.tsx lines 360-373
    keyFields: ['time_to_results', 'meeting_frequency', 'format', 'cost'],
    arrayField: 'challenges',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      meeting_frequency: 'meeting_frequency',
      format: 'community_format',
      cost: 'support_group_cost',
      challenges: 'support_group_challenges'
    },
    contextSources: ['community_feedback', 'user_experiences', 'case_studies', 'expert_analysis']
  },
  financial_products: {
    // SSOT: GoalPageClient.tsx lines 392-405
    keyFields: ['time_to_results', 'financial_benefit', 'access_time', 'cost_type'],
    arrayField: 'challenges',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      financial_benefit: 'financial_benefit',
      access_time: 'access_time',
      cost_type: 'cost_type',  // Note: Uses cost_type instead of cost
      challenges: 'financial_challenges'
    },
    contextSources: ['user_reports', 'financial_advisors', 'case_studies', 'expert_analysis']
  },
  professional_services: {
    // SSOT: GoalPageClient.tsx lines 226-239
    keyFields: ['time_to_results', 'session_frequency', 'specialty', 'cost'],
    arrayField: 'challenges',
    fieldToDropdownMap: {
      time_to_results: 'time_to_results',
      session_frequency: 'session_frequency',
      specialty: 'service_type',
      cost: 'session_cost_per',
      challenges: 'professional_service_challenges'
    },
    contextSources: ['user_experiences', 'case_studies', 'expert_analysis', 'community_feedback']
  }
}

/**
 * Get key display fields for a category (from SSOT)
 * These are the 3-4 fields shown on solution cards
 */
export function getKeyFields(category: string): string[] {
  const config = CATEGORY_FIELD_CONFIG[category]
  if (!config) {
    throw new Error(`Unknown category: ${category}`)
  }
  return config.keyFields
}

/**
 * Get array field for a category (from SSOT)
 * This is the single field displayed separately as pills (challenges or side_effects)
 */
export function getArrayField(category: string): string | undefined {
  const config = CATEGORY_FIELD_CONFIG[category]
  if (!config) {
    throw new Error(`Unknown category: ${category}`)
  }
  return config.arrayField
}

/**
 * Get all required fields (keyFields + arrayField combined)
 * Use this for validation that checks ALL fields should exist
 */
export function getRequiredFields(category: string): string[] {
  const config = CATEGORY_FIELD_CONFIG[category]
  if (!config) {
    throw new Error(`Unknown category: ${category}`)
  }
  const fields = [...config.keyFields]
  if (config.arrayField) {
    fields.push(config.arrayField)
  }
  return fields
}

export function getDropdownSource(fieldName: string, category: string): string {
  const config = CATEGORY_FIELD_CONFIG[category]
  if (!config) {
    throw new Error(`Unknown category: ${category}`)
  }
  const dropdownSource = config.fieldToDropdownMap[fieldName]
  if (!dropdownSource) {
    throw new Error(`No dropdown mapping for field ${fieldName} in category ${category}`)
  }
  return dropdownSource
}

export function getContextSources(category: string): string[] {
  const config = CATEGORY_FIELD_CONFIG[category]
  if (!config) {
    throw new Error(`Unknown category: ${category}`)
  }
  return config.contextSources
}

export function isValidCategory(category: string): boolean {
  return category in CATEGORY_FIELD_CONFIG
}

export function getAllCategories(): string[] {
  return Object.keys(CATEGORY_FIELD_CONFIG)
}
