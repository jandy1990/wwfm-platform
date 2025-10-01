export interface CategoryConfig {
  requiredFields: string[]
  fieldToDropdownMap: Record<string, string>
  contextSources: string[]
}

export const CATEGORY_FIELD_CONFIG: Record<string, CategoryConfig> = {
  therapists_counselors: {
    requiredFields: ['session_frequency', 'session_length', 'cost', 'time_to_results', 'challenges'],
    fieldToDropdownMap: {
      session_frequency: 'session_frequency',
      session_length: 'session_length',
      cost: 'session_cost_per',
      time_to_results: 'time_to_results',
      challenges: 'therapy_challenges'
    },
    contextSources: ['user_experiences', 'studies', 'expert_analysis', 'case_studies']
  },
  coaches_mentors: {
    requiredFields: ['session_frequency', 'session_length', 'cost', 'time_to_results', 'challenges'],
    fieldToDropdownMap: {
      session_frequency: 'session_frequency',
      session_length: 'session_length',
      cost: 'session_cost_per',
      time_to_results: 'time_to_results',
      challenges: 'coaching_challenges'
    },
    contextSources: ['user_experiences', 'case_studies', 'expert_analysis', 'community_feedback']
  },
  alternative_practitioners: {
    requiredFields: ['session_frequency', 'session_length', 'cost', 'time_to_results', 'side_effects'],
    fieldToDropdownMap: {
      session_frequency: 'session_frequency',
      session_length: 'session_length',
      cost: 'session_cost_per',
      time_to_results: 'time_to_results',
      side_effects: 'common_side_effects'
    },
    contextSources: ['user_experiences', 'community_feedback', 'case_studies', 'studies']
  },
  doctors_specialists: {
    requiredFields: ['wait_time', 'insurance_coverage', 'cost', 'time_to_results', 'challenges'],
    fieldToDropdownMap: {
      wait_time: 'wait_time_doctors',
      insurance_coverage: 'insurance_coverage',
      cost: 'session_cost_per',
      time_to_results: 'time_to_results',
      challenges: 'medical_challenges'
    },
    contextSources: ['studies', 'expert_analysis', 'user_experiences', 'medical_literature']
  },
  medical_procedures: {
    requiredFields: ['session_frequency', 'wait_time', 'cost', 'time_to_results', 'side_effects'],
    fieldToDropdownMap: {
      session_frequency: 'session_frequency',
      wait_time: 'wait_time_procedures',
      cost: 'session_cost_total',
      time_to_results: 'time_to_results',
      side_effects: 'common_side_effects'
    },
    contextSources: ['studies', 'medical_literature', 'user_experiences', 'expert_analysis']
  },
  crisis_resources: {
    requiredFields: ['time_to_results', 'response_time', 'format', 'cost', 'challenges'],
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
    requiredFields: [
      'practice_length',
      'frequency',
      'startup_cost',
      'ongoing_cost',
      'cost',
      'cost_type',
      'time_to_results',
      'challenges'
    ],
    fieldToDropdownMap: {
      practice_length: 'practice_length',
      frequency: 'practice_frequency',
      startup_cost: 'practice_startup_cost',
      ongoing_cost: 'practice_ongoing_cost',
      // cost and cost_type need derivation logic
      time_to_results: 'time_to_results',
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
    requiredFields: [
      'frequency',
      'duration',
      'startup_cost',
      'ongoing_cost',
      'cost',
      'cost_type',
      'time_to_results',
      'challenges'
    ],
    fieldToDropdownMap: {
      frequency: 'practice_frequency',
      duration: 'session_duration',
      startup_cost: 'practice_startup_cost',
      ongoing_cost: 'practice_ongoing_cost',
      // cost and cost_type need derivation logic
      time_to_results: 'time_to_results',
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
    requiredFields: [
      'time_commitment',
      'frequency',
      'startup_cost',
      'ongoing_cost',
      'cost',
      'cost_type',
      'time_to_results',
      'challenges'
    ],
    fieldToDropdownMap: {
      time_commitment: 'habits_time_commitment',
      frequency: 'practice_frequency',
      startup_cost: 'practice_startup_cost',
      ongoing_cost: 'practice_ongoing_cost',
      // cost and cost_type need derivation logic
      time_to_results: 'time_to_results',
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
    // Cost moved to success screen (optional) - removed from required fields
    requiredFields: ['frequency', 'length_of_use', 'time_to_results', 'side_effects'],
    fieldToDropdownMap: {
      frequency: 'frequency',
      length_of_use: 'length_of_use',
      cost: 'dosage_cost_monthly',
      time_to_results: 'time_to_results',
      side_effects: 'common_side_effects'
    },
    contextSources: ['research', 'studies', 'clinical_trials', 'medical_literature']
  },
  supplements_vitamins: {
    // Cost moved to success screen (optional) - removed from required fields
    requiredFields: ['frequency', 'length_of_use', 'time_to_results', 'side_effects'],
    fieldToDropdownMap: {
      frequency: 'frequency',
      length_of_use: 'length_of_use',
      cost: 'dosage_cost_monthly',
      time_to_results: 'time_to_results',
      side_effects: 'common_side_effects'
    },
    contextSources: ['research', 'studies', 'consumer_reports', 'user_reviews']
  },
  natural_remedies: {
    // Cost moved to success screen (optional) - removed from required fields
    requiredFields: ['frequency', 'length_of_use', 'time_to_results', 'side_effects'],
    fieldToDropdownMap: {
      frequency: 'frequency',
      length_of_use: 'length_of_use',
      cost: 'dosage_cost_monthly',
      time_to_results: 'time_to_results',
      side_effects: 'common_side_effects'
    },
    contextSources: ['studies', 'user_experiences', 'community_feedback', 'research']
  },
  beauty_skincare: {
    // Cost moved to success screen (optional) - removed from required fields
    requiredFields: ['skincare_frequency', 'length_of_use', 'time_to_results', 'side_effects'],
    fieldToDropdownMap: {
      skincare_frequency: 'skincare_frequency',
      length_of_use: 'length_of_use',
      cost: 'dosage_cost_monthly',
      time_to_results: 'time_to_results',
      side_effects: 'common_side_effects'
    },
    contextSources: ['user_reviews', 'beauty_experts', 'consumer_reports', 'community_feedback']
  },
  books_courses: {
    requiredFields: ['format', 'learning_difficulty', 'cost', 'time_to_results', 'challenges'],
    fieldToDropdownMap: {
      format: 'book_format',
      learning_difficulty: 'learning_difficulty',
      cost: 'purchase_cost_onetime',
      time_to_results: 'time_to_results',
      challenges: 'learning_challenges'
    },
    contextSources: ['user_reviews', 'expert_analysis', 'community_feedback', 'case_studies']
  },
  apps_software: {
    requiredFields: ['usage_frequency', 'subscription_type', 'cost', 'time_to_results', 'challenges'],
    fieldToDropdownMap: {
      usage_frequency: 'usage_frequency',
      subscription_type: 'subscription_type',
      cost: 'app_cost',
      time_to_results: 'time_to_results',
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
    requiredFields: ['weekly_prep_time', 'still_following', 'cost', 'time_to_results', 'challenges'],
    fieldToDropdownMap: {
      weekly_prep_time: 'weekly_prep_time',
      still_following: 'still_following',
      cost: 'diet_cost_impact',
      time_to_results: 'time_to_results',
      challenges: 'diet_challenges'
    },
    contextSources: ['user_experiences', 'studies', 'expert_analysis', 'community_feedback']
  },
  sleep: {
    requiredFields: ['previous_sleep_hours', 'still_following', 'cost', 'time_to_results', 'challenges'],
    fieldToDropdownMap: {
      previous_sleep_hours: 'previous_sleep_hours',
      still_following: 'still_following',
      cost: 'sleep_cost_impact',
      time_to_results: 'time_to_results',
      challenges: 'sleep_challenges'
    },
    contextSources: ['user_experiences', 'studies', 'community_feedback', 'expert_analysis']
  },
  products_devices: {
    requiredFields: ['ease_of_use', 'product_type', 'cost', 'time_to_results', 'challenges'],
    fieldToDropdownMap: {
      ease_of_use: 'ease_of_use',
      product_type: 'product_type',
      cost: 'purchase_cost_onetime',
      time_to_results: 'time_to_results',
      challenges: 'product_challenges'
    },
    contextSources: ['user_reviews', 'consumer_reports', 'tech_reviews', 'community_feedback']
  },
  hobbies_activities: {
    requiredFields: [
      'time_commitment',
      'frequency',
      'startup_cost',
      'ongoing_cost',
      'cost',
      'cost_type',
      'time_to_results',
      'challenges'
    ],
    fieldToDropdownMap: {
      time_commitment: 'time_commitment',
      frequency: 'hobby_frequency',
      startup_cost: 'startup_cost',
      ongoing_cost: 'hobby_ongoing_cost',
      // cost and cost_type need derivation logic
      time_to_results: 'time_to_results',
      challenges: 'hobby_challenges'
    },
    contextSources: ['community_feedback', 'user_experiences', 'expert_analysis', 'enthusiast_forums']
  },
  groups_communities: {
    requiredFields: ['meeting_frequency', 'group_size', 'cost', 'time_to_results', 'challenges'],
    fieldToDropdownMap: {
      meeting_frequency: 'meeting_frequency',
      group_size: 'group_size',
      cost: 'community_cost_monthly',
      time_to_results: 'time_to_results',
      challenges: 'community_challenges'
    },
    contextSources: ['community_feedback', 'user_experiences', 'case_studies', 'expert_analysis']
  },
  support_groups: {
    requiredFields: ['meeting_frequency', 'format', 'cost', 'time_to_results', 'challenges'],
    fieldToDropdownMap: {
      meeting_frequency: 'meeting_frequency',
      format: 'community_format',
      cost: 'support_group_cost',
      time_to_results: 'time_to_results',
      challenges: 'support_group_challenges'
    },
    contextSources: ['community_feedback', 'user_experiences', 'case_studies', 'expert_analysis']
  },
  financial_products: {
    requiredFields: ['cost_type', 'financial_benefit', 'access_time', 'time_to_results', 'challenges'],
    fieldToDropdownMap: {
      cost_type: 'cost_type',
      financial_benefit: 'financial_benefit',
      access_time: 'access_time',
      time_to_results: 'time_to_results',
      challenges: 'financial_challenges'
    },
    contextSources: ['user_reports', 'financial_advisors', 'case_studies', 'expert_analysis']
  },
  professional_services: {
    requiredFields: ['session_frequency', 'specialty', 'cost', 'time_to_results', 'challenges'],
    fieldToDropdownMap: {
      session_frequency: 'session_frequency',
      specialty: 'service_type',
      cost: 'session_cost_per',
      time_to_results: 'time_to_results',
      challenges: 'professional_service_challenges'
    },
    contextSources: ['user_experiences', 'case_studies', 'expert_analysis', 'community_feedback']
  }
}

export function getRequiredFields(category: string): string[] {
  const config = CATEGORY_FIELD_CONFIG[category]
  if (!config) {
    throw new Error(`Unknown category: ${category}`)
  }
  return config.requiredFields
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
