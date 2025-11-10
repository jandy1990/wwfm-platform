/**
 * Goal-to-Category Mapping
 *
 * Maps all 33 high-traffic goals to their narrative categories.
 * This determines which category-specific diversity instructions are used.
 */

import { NarrativeCategory } from './narrative-categories';

export const GOAL_CATEGORY_MAP: Record<string, NarrativeCategory> = {
  // ============================================
  // MENTAL HEALTH (12 goals)
  // ============================================
  'Reduce anxiety': 'mental_health',
  'Manage stress': 'mental_health',
  'Improve emotional regulation': 'mental_health',
  'Channel anger productively': 'mental_health',
  'Live with ADHD': 'mental_health',
  'Live with depression': 'mental_health',
  'Navigate autism challenges': 'mental_health',
  'Live with social anxiety': 'mental_health',
  'Build confidence': 'mental_health',
  'Quit drinking': 'mental_health',
  'Stop emotional eating': 'mental_health',
  'Get over dating anxiety': 'mental_health',

  // ============================================
  // PHYSICAL HEALTH (7 goals)
  // ============================================
  'Sleep better': 'physical_health',
  'Fall asleep faster': 'physical_health',
  'Beat afternoon slump': 'physical_health',
  'Find exercise I enjoy': 'physical_health',
  'Start exercising': 'physical_health',
  'Bike long distances': 'physical_health',
  'Manage chronic pain': 'physical_health',

  // ============================================
  // BEAUTY/SKINCARE (5 goals)
  // ============================================
  'Clear up acne': 'beauty_skincare',
  'Fix dry skin': 'beauty_skincare',
  'Have healthier hair': 'beauty_skincare',
  'Have healthy nails': 'beauty_skincare',

  // ============================================
  // WEIGHT/FITNESS (2 goals)
  // ============================================
  'Lose weight sustainably': 'weight_fitness',
  'Lose belly fat': 'weight_fitness',

  // ============================================
  // WOMEN'S HEALTH (4 goals)
  // ============================================
  'Navigate menopause': 'womens_health',
  'Reduce menopause hot flashes': 'womens_health',
  'Manage painful periods': 'womens_health',
  'Manage PCOS': 'womens_health',

  // ============================================
  // LIFE SKILLS (4 goals)
  // ============================================
  'Develop morning routine': 'life_skills',
  'Overcome procrastination': 'life_skills',
  'Save money': 'life_skills',
  'Improve credit score': 'life_skills'
};

/**
 * Get narrative category for a goal title
 * Throws error if goal not found in mapping
 */
export function getGoalCategory(goalTitle: string): NarrativeCategory {
  const category = GOAL_CATEGORY_MAP[goalTitle];

  if (!category) {
    throw new Error(
      `No category mapping found for goal: "${goalTitle}". ` +
      `Available goals: ${Object.keys(GOAL_CATEGORY_MAP).join(', ')}`
    );
  }

  return category;
}

/**
 * Check if a goal has a category mapping
 */
export function hasCategory(goalTitle: string): boolean {
  return goalTitle in GOAL_CATEGORY_MAP;
}

/**
 * Get all goals in the mapping (for validation/testing)
 */
export function getAllMappedGoals(): string[] {
  return Object.keys(GOAL_CATEGORY_MAP);
}

/**
 * Get goals grouped by category
 */
export function getGoalsGroupedByCategory(): Record<NarrativeCategory, string[]> {
  const grouped: Record<NarrativeCategory, string[]> = {
    mental_health: [],
    physical_health: [],
    weight_fitness: [],
    womens_health: [],
    beauty_skincare: [],
    life_skills: []
  };

  for (const [goal, category] of Object.entries(GOAL_CATEGORY_MAP)) {
    grouped[category].push(goal);
  }

  return grouped;
}

/**
 * Get category distribution statistics
 */
export function getCategoryStats(): Record<string, number> {
  const stats: Record<string, number> = {};

  for (const category of Object.values(GOAL_CATEGORY_MAP)) {
    stats[category] = (stats[category] || 0) + 1;
  }

  return stats;
}
