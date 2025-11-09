/**
 * Category Field Hints
 *
 * User-friendly descriptions of what fields we'll ask for each category.
 * Used in CategorySwitcher component to help users understand which form they're filling out.
 *
 * Source: Extracted from CategoryConfirmation.tsx
 */

export const CATEGORY_FIELD_HINTS: Record<string, string> = {
  // Things you take (4 categories)
  supplements_vitamins: 'dosage, frequency, side effects, brand',
  medications: 'dosage, frequency, side effects',
  natural_remedies: 'dosage, frequency, side effects',
  beauty_skincare: 'product type, frequency, side effects, brand',

  // People you see (7 categories)
  therapists_counselors: 'session frequency, cost, insurance, format',
  doctors_specialists: 'visit frequency, cost, insurance, wait time',
  coaches_mentors: 'session frequency, cost, format',
  alternative_practitioners: 'session frequency, cost, side effects',
  professional_services: 'session frequency, cost, format',
  medical_procedures: 'cost, recovery time, risks, effectiveness',
  crisis_resources: 'availability, cost, format',

  // Things you do (6 categories)
  exercise_movement: 'frequency, equipment needed, difficulty, challenges',
  meditation_mindfulness: 'frequency, duration, guidance type, challenges',
  habits_routines: 'time commitment, difficulty, challenges',
  hobbies_activities: 'time commitment, costs, difficulty, enjoyment',
  groups_communities: 'meeting frequency, cost, format, size',
  support_groups: 'meeting frequency, cost, format, approach',

  // Things you use (3 categories)
  apps_software: 'cost, features, platform, usage frequency',
  products_devices: 'cost, ease of use, effectiveness',
  books_courses: 'cost, format, difficulty, completion',

  // Changes you make (2 categories)
  diet_nutrition: 'difficulty, cost impact, challenges, sustainability',
  sleep: 'adjustment time, challenges, cost',

  // Financial (1 category)
  financial_products: 'fees, interest rates, requirements, benefits'
};

/**
 * Get field hints for a specific category
 * Returns a user-friendly string describing what we'll ask about
 */
export function getCategoryFieldHints(category: string): string {
  return CATEGORY_FIELD_HINTS[category] || 'various details about your experience';
}
