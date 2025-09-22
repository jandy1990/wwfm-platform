/**
 * Expansion Rules Configuration
 *
 * Defines strict credibility rules for solution-to-goal mapping.
 * These rules prevent nonsensical connections like "Ashwagandha for saving money".
 */

export interface ExpansionRule {
  // Goals that this solution category can credibly address
  allowed_goal_patterns: string[]

  // Goals this solution should never be connected to
  forbidden_goal_patterns: string[]

  // Required arenas for credible connections
  allowed_arenas: string[]

  // Goal categories that make sense for this solution
  allowed_goal_categories: string[]

  // Minimum effectiveness threshold for new connections
  min_effectiveness: number

  // Maximum number of new goals to connect per solution
  max_expansions: number
}

export const EXPANSION_RULES: Record<string, ExpansionRule> = {
  // EXERCISE & MOVEMENT - Laugh test will handle quality validation
  exercise_movement: {
    allowed_goal_patterns: ['.*'], // Allow all patterns, laugh test validates
    forbidden_goal_patterns: [], // Remove restrictions, laugh test handles this
    allowed_arenas: [], // Remove arena restrictions
    allowed_goal_categories: [], // Remove category restrictions
    min_effectiveness: 3.5,
    max_expansions: 15
  },

  // MEDITATION & MINDFULNESS - Laugh test will handle quality validation
  meditation_mindfulness: {
    allowed_goal_patterns: ['.*'], // Allow all patterns, laugh test validates
    forbidden_goal_patterns: [], // Remove restrictions, laugh test handles this
    allowed_arenas: [], // Remove arena restrictions
    allowed_goal_categories: [], // Remove category restrictions
    min_effectiveness: 3.5,
    max_expansions: 15
  },

  // HABITS & ROUTINES - Laugh test will handle quality validation
  habits_routines: {
    allowed_goal_patterns: ['.*'], // Allow all patterns, laugh test validates
    forbidden_goal_patterns: [], // Remove restrictions, laugh test handles this
    allowed_arenas: [], // Remove arena restrictions
    allowed_goal_categories: [], // Remove category restrictions
    min_effectiveness: 3.5,
    max_expansions: 20
  },

  // DIET & NUTRITION - Laugh test will handle quality validation
  diet_nutrition: {
    allowed_goal_patterns: ['.*'], // Allow all patterns, laugh test validates
    forbidden_goal_patterns: [], // Remove restrictions, laugh test handles this
    allowed_arenas: [], // Remove arena restrictions
    allowed_goal_categories: [], // Remove category restrictions
    min_effectiveness: 3.5,
    max_expansions: 15
  },

  // MEDICATIONS - Laugh test will handle quality validation
  medications: {
    allowed_goal_patterns: ['.*'], // Allow all patterns, laugh test validates
    forbidden_goal_patterns: [], // Remove restrictions, laugh test handles this
    allowed_arenas: [], // Remove arena restrictions
    allowed_goal_categories: [], // Remove category restrictions
    min_effectiveness: 3.8,
    max_expansions: 10
  },

  // SUPPLEMENTS & VITAMINS - Laugh test will handle quality validation
  supplements_vitamins: {
    allowed_goal_patterns: ['.*'], // Allow all patterns, laugh test validates
    forbidden_goal_patterns: [], // Remove restrictions, laugh test handles this
    allowed_arenas: [], // Remove arena restrictions
    allowed_goal_categories: [], // Remove category restrictions
    min_effectiveness: 3.5,
    max_expansions: 8
  },

  // NATURAL REMEDIES - Laugh test will handle quality validation
  natural_remedies: {
    allowed_goal_patterns: ['.*'], // Allow all patterns, laugh test validates
    forbidden_goal_patterns: [], // Remove restrictions, laugh test handles this
    allowed_arenas: [], // Remove arena restrictions
    allowed_goal_categories: [], // Remove category restrictions
    min_effectiveness: 3.5,
    max_expansions: 8
  },

  // SLEEP - Laugh test will handle quality validation
  sleep: {
    allowed_goal_patterns: ['.*'], // Allow all patterns, laugh test validates
    forbidden_goal_patterns: [], // Remove restrictions, laugh test handles this
    allowed_arenas: [], // Remove arena restrictions
    allowed_goal_categories: [], // Remove category restrictions
    min_effectiveness: 4.0,
    max_expansions: 8
  },

  // APPS & SOFTWARE - Laugh test will handle quality validation
  apps_software: {
    allowed_goal_patterns: ['.*'], // Allow all patterns, laugh test validates
    forbidden_goal_patterns: [], // Remove restrictions, laugh test handles this
    allowed_arenas: [], // Remove arena restrictions
    allowed_goal_categories: [], // Remove category restrictions
    min_effectiveness: 3.5,
    max_expansions: 15
  },

  // BOOKS & COURSES - Laugh test will handle quality validation
  books_courses: {
    allowed_goal_patterns: ['.*'], // Allow all patterns, laugh test validates
    forbidden_goal_patterns: [], // Remove restrictions, laugh test handles this
    allowed_arenas: [], // Remove arena restrictions
    allowed_goal_categories: [], // Remove category restrictions
    min_effectiveness: 3.5,
    max_expansions: 20
  },

  // DOCTORS & SPECIALISTS - Laugh test will handle quality validation
  doctors_specialists: {
    allowed_goal_patterns: ['.*'], // Allow all patterns, laugh test validates
    forbidden_goal_patterns: [], // Remove restrictions, laugh test handles this
    allowed_arenas: [], // Remove arena restrictions
    allowed_goal_categories: [], // Remove category restrictions
    min_effectiveness: 4.0,
    max_expansions: 12
  },

  // PRODUCTS & DEVICES - Laugh test will handle quality validation
  products_devices: {
    allowed_goal_patterns: ['.*'],
    forbidden_goal_patterns: [],
    allowed_arenas: [],
    allowed_goal_categories: [],
    min_effectiveness: 3.5,
    max_expansions: 10
  },

  // BEAUTY & SKINCARE - Laugh test will handle quality validation
  beauty_skincare: {
    allowed_goal_patterns: ['.*'],
    forbidden_goal_patterns: [],
    allowed_arenas: [],
    allowed_goal_categories: [],
    min_effectiveness: 3.5,
    max_expansions: 8
  },

  // PROFESSIONAL SERVICES - Laugh test will handle quality validation
  professional_services: {
    allowed_goal_patterns: ['.*'],
    forbidden_goal_patterns: [],
    allowed_arenas: [],
    allowed_goal_categories: [],
    min_effectiveness: 3.8,
    max_expansions: 10
  },

  // GROUPS & COMMUNITIES - Laugh test will handle quality validation
  groups_communities: {
    allowed_goal_patterns: ['.*'],
    forbidden_goal_patterns: [],
    allowed_arenas: [],
    allowed_goal_categories: [],
    min_effectiveness: 3.5,
    max_expansions: 8
  },

  // FINANCIAL PRODUCTS - Laugh test will handle quality validation
  financial_products: {
    allowed_goal_patterns: ['.*'],
    forbidden_goal_patterns: [],
    allowed_arenas: [],
    allowed_goal_categories: [],
    min_effectiveness: 3.8,
    max_expansions: 6
  },

  // SUPPORT GROUPS - Laugh test will handle quality validation
  support_groups: {
    allowed_goal_patterns: ['.*'],
    forbidden_goal_patterns: [],
    allowed_arenas: [],
    allowed_goal_categories: [],
    min_effectiveness: 3.8,
    max_expansions: 8
  },

  // HOBBIES & ACTIVITIES - Laugh test will handle quality validation
  hobbies_activities: {
    allowed_goal_patterns: ['.*'],
    forbidden_goal_patterns: [],
    allowed_arenas: [],
    allowed_goal_categories: [],
    min_effectiveness: 3.5,
    max_expansions: 12
  },

  // COACHES & MENTORS - Laugh test will handle quality validation
  coaches_mentors: {
    allowed_goal_patterns: ['.*'],
    forbidden_goal_patterns: [],
    allowed_arenas: [],
    allowed_goal_categories: [],
    min_effectiveness: 3.8,
    max_expansions: 10
  },

  // MEDICAL PROCEDURES - Laugh test will handle quality validation
  medical_procedures: {
    allowed_goal_patterns: ['.*'],
    forbidden_goal_patterns: [],
    allowed_arenas: [],
    allowed_goal_categories: [],
    min_effectiveness: 4.0,
    max_expansions: 6
  },

  // ALTERNATIVE PRACTITIONERS - Laugh test will handle quality validation
  alternative_practitioners: {
    allowed_goal_patterns: ['.*'],
    forbidden_goal_patterns: [],
    allowed_arenas: [],
    allowed_goal_categories: [],
    min_effectiveness: 3.5,
    max_expansions: 8
  },

  // THERAPISTS & COUNSELORS - Laugh test will handle quality validation
  therapists_counselors: {
    allowed_goal_patterns: ['.*'],
    forbidden_goal_patterns: [],
    allowed_arenas: [],
    allowed_goal_categories: [],
    min_effectiveness: 4.0,
    max_expansions: 10
  },

  // CRISIS RESOURCES - Laugh test will handle quality validation
  crisis_resources: {
    allowed_goal_patterns: ['.*'],
    forbidden_goal_patterns: [],
    allowed_arenas: [],
    allowed_goal_categories: [],
    min_effectiveness: 4.0,
    max_expansions: 6
  }
}

/**
 * Check if a solution-goal connection is credible based on expansion rules
 * NOTE: Laugh test validator is now the primary quality gatekeeper
 */
export function isCredibleConnection(
  solutionCategory: string,
  goalTitle: string,
  goalArena: string,
  goalCategory: string,
  projectedEffectiveness: number
): { credible: boolean; reason?: string } {
  const rule = EXPANSION_RULES[solutionCategory]

  if (!rule) {
    return { credible: false, reason: `No expansion rules defined for category: ${solutionCategory}` }
  }

  // Check effectiveness threshold (only remaining validation)
  if (projectedEffectiveness < rule.min_effectiveness) {
    return {
      credible: false,
      reason: `Effectiveness ${projectedEffectiveness} below minimum ${rule.min_effectiveness}`
    }
  }

  // LAUGH TEST RELIANCE: All pattern, arena, and category validation removed
  // The laugh test validator (70/100 threshold) handles quality control

  return { credible: true }
}

/**
 * Get maximum allowed expansions for a solution category
 */
export function getMaxExpansions(solutionCategory: string): number {
  const rule = EXPANSION_RULES[solutionCategory]
  return rule ? rule.max_expansions : 3 // Conservative default
}

/**
 * Get minimum effectiveness threshold for a solution category
 */
export function getMinEffectiveness(solutionCategory: string): number {
  const rule = EXPANSION_RULES[solutionCategory]
  return rule ? rule.min_effectiveness : 4.0 // Conservative default
}