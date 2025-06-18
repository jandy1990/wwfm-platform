export const SOLUTION_CATEGORIES = {
  // Things you take (4)
  supplements_vitamins: 'dosage_form',
  medications: 'dosage_form',
  natural_remedies: 'dosage_form',
  beauty_skincare: 'dosage_form',
  
  // People you see (7)
  therapists_counselors: 'session_form',
  doctors_specialists: 'session_form',
  coaches_mentors: 'session_form',
  alternative_practitioners: 'session_form',
  professional_services: 'session_form',
  medical_procedures: 'session_form',
  crisis_resources: 'session_form',
  
  // Things you do (6)
  exercise_movement: 'practice_form',
  meditation_mindfulness: 'practice_form',
  habits_routines: 'practice_form',
  hobbies_activities: 'hobby_form',
  groups_communities: 'community_form',
  support_groups: 'community_form',
  
  // Things you use (3)
  apps_software: 'app_form',
  products_devices: 'purchase_form',
  books_courses: 'purchase_form',
  
  // Changes you make (2)
  diet_nutrition: 'lifestyle_form',
  sleep: 'lifestyle_form',
  
  // Financial (1)
  financial_products: 'financial_form'
} as const;

export type SolutionCategory = keyof typeof SOLUTION_CATEGORIES;
export type FormTemplate = typeof SOLUTION_CATEGORIES[SolutionCategory];

export const TIME_TO_RESULTS_OPTIONS = [
  'Immediately',
  'Within days',
  '1-2 weeks',
  '3-4 weeks',
  '1-2 months',
  '3-6 months',
  '6+ months',
  'Still evaluating'
] as const;

// Cost ranges
export const COST_RANGES = {
  monthly: [
    'Free',
    'Under $10/month',
    '$10-25/month',
    '$25-50/month',
    '$50-100/month',
    '$100-200/month',
    'Over $200/month'
  ],
  one_time: [
    'Free',
    'Under $20',
    '$20-50',
    '$50-100',
    '$100-250',
    '$250-500',
    '$500-1000',
    'Over $1000'
  ],
  per_session: [
    'Free',
    'Under $50',
    '$50-100',
    '$100-150',
    '$150-250',
    '$250-500',
    'Over $500'
  ],
  per_week: [
    'Under $15/week',
    '$15-30/week',
    '$30-50/week',
    '$50-75/week',
    '$75-100/week',
    'Over $100/week'
  ],
  subscription: [
    'Free',
    'Free with ads',
    'Under $5/month',
    '$5-10/month',
    '$10-20/month',
    '$20-50/month',
    'Over $50/month'
  ],
  total: [
    'Free',
    'Under $100',
    '$100-500',
    '$500-1,000',
    '$1,000-5,000',
    '$5,000-10,000',
    'Over $10,000'
  ]
} as const;
