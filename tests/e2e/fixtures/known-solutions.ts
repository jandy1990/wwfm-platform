/**
 * Known solutions that reliably auto-categorize to their expected categories.
 * These have been verified to work with the auto-categorization system.
 */

export const KNOWN_SOLUTIONS = {
  medications: [
    { name: 'Prozac', category: 'medications' },
    { name: 'Lexapro', category: 'medications' },
    { name: 'Zoloft', category: 'medications' },
    { name: 'Xanax', category: 'medications' },
    { name: 'Adderall', category: 'medications' }
  ],
  supplements_vitamins: [
    { name: 'Vitamin D', category: 'supplements_vitamins' },
    { name: 'Magnesium', category: 'supplements_vitamins' },
    { name: 'Omega 3', category: 'supplements_vitamins' },
    { name: 'Vitamin B12', category: 'supplements_vitamins' },
    { name: 'Probiotics', category: 'supplements_vitamins' }
  ],
  apps_software: [
    { name: 'Headspace', category: 'apps_software' },
    { name: 'Calm', category: 'apps_software' },
    { name: 'MyFitnessPal', category: 'apps_software' },
    { name: 'Duolingo', category: 'apps_software' },
    { name: 'Forest', category: 'apps_software' }
  ],
  therapists_counselors: [
    { name: 'CBT Therapy', category: 'therapists_counselors' },
    { name: 'EMDR Therapy', category: 'therapists_counselors' },
    { name: 'Talk Therapy', category: 'therapists_counselors' },
    { name: 'Marriage Counseling', category: 'therapists_counselors' }
  ],
  exercise_movement: [
    { name: 'Running', category: 'exercise_movement' },
    { name: 'Yoga', category: 'exercise_movement' },
    { name: 'Weight Training', category: 'exercise_movement' },
    { name: 'Swimming', category: 'exercise_movement' },
    { name: 'Pilates', category: 'exercise_movement' }
  ],
  meditation_mindfulness: [
    { name: 'Mindfulness Meditation', category: 'meditation_mindfulness' },
    { name: 'Breathing Exercises', category: 'meditation_mindfulness' },
    { name: 'Body Scan', category: 'meditation_mindfulness' },
    { name: 'Guided Meditation', category: 'meditation_mindfulness' }
  ],
  habits_routines: [
    { name: 'Morning Routine', category: 'habits_routines' },
    { name: 'Journaling', category: 'habits_routines' },
    { name: 'Gratitude Practice', category: 'habits_routines' },
    { name: 'Time Blocking', category: 'habits_routines' }
  ],
  doctors_specialists: [
    { name: 'Psychiatrist', category: 'doctors_specialists' },
    { name: 'Cardiologist', category: 'doctors_specialists' },
    { name: 'Dermatologist', category: 'doctors_specialists' },
    { name: 'Neurologist', category: 'doctors_specialists' }
  ],
  coaches_mentors: [
    { name: 'Life Coach', category: 'coaches_mentors' },
    { name: 'Career Coach', category: 'coaches_mentors' },
    { name: 'Executive Coach', category: 'coaches_mentors' },
    { name: 'Fitness Coach', category: 'coaches_mentors' }
  ],
  alternative_practitioners: [
    { name: 'Acupuncture', category: 'alternative_practitioners' },
    { name: 'Chiropractor', category: 'alternative_practitioners' },
    { name: 'Naturopath', category: 'alternative_practitioners' },
    { name: 'Reiki', category: 'alternative_practitioners' }
  ],
  professional_services: [
    { name: 'Massage Therapy', category: 'professional_services' },
    { name: 'Personal Trainer', category: 'professional_services' },
    { name: 'Nutritionist', category: 'professional_services' },
    { name: 'Physical Therapy', category: 'professional_services' }
  ],
  medical_procedures: [
    { name: 'Surgery', category: 'medical_procedures' },
    { name: 'Botox', category: 'medical_procedures' },
    { name: 'Laser Treatment', category: 'medical_procedures' },
    { name: 'MRI Scan', category: 'medical_procedures' }
  ],
  crisis_resources: [
    { name: 'Crisis Hotline', category: 'crisis_resources' },
    { name: 'Emergency Services', category: 'crisis_resources' },
    { name: 'Suicide Prevention', category: 'crisis_resources' }
  ],
  products_devices: [
    { name: 'Fitbit', category: 'products_devices' },
    { name: 'Apple Watch', category: 'products_devices' },
    { name: 'Weighted Blanket', category: 'products_devices' },
    { name: 'Light Therapy Lamp', category: 'products_devices' },
    { name: 'White Noise Machine', category: 'products_devices' }
  ],
  books_courses: [
    { name: 'Atomic Habits', category: 'books_courses' },
    { name: 'The Power of Now', category: 'books_courses' },
    { name: 'Coursera Course', category: 'books_courses' },
    { name: 'MasterClass', category: 'books_courses' }
  ],
  support_groups: [
    { name: 'AA Meeting', category: 'support_groups' },
    { name: 'Group Therapy', category: 'support_groups' },
    { name: 'Online Support Group', category: 'support_groups' },
    { name: 'Peer Support', category: 'support_groups' }
  ],
  groups_communities: [
    { name: 'Running Club', category: 'groups_communities' },
    { name: 'Book Club', category: 'groups_communities' },
    { name: 'Discord Community', category: 'groups_communities' },
    { name: 'Reddit Community', category: 'groups_communities' }
  ],
  diet_nutrition: [
    { name: 'Keto Diet', category: 'diet_nutrition' },
    { name: 'Intermittent Fasting', category: 'diet_nutrition' },
    { name: 'Mediterranean Diet', category: 'diet_nutrition' },
    { name: 'Plant-Based Diet', category: 'diet_nutrition' }
  ],
  sleep: [
    { name: 'Sleep Schedule', category: 'sleep' },
    { name: 'Melatonin', category: 'sleep' },
    { name: 'Sleep Hygiene', category: 'sleep' },
    { name: 'CPAP Machine', category: 'sleep' }
  ],
  hobbies_activities: [
    { name: 'Painting', category: 'hobbies_activities' },
    { name: 'Gardening', category: 'hobbies_activities' },
    { name: 'Photography', category: 'hobbies_activities' },
    { name: 'Cooking', category: 'hobbies_activities' },
    { name: 'Hiking', category: 'hobbies_activities' }
  ],
  financial_products: [
    { name: 'Budgeting App', category: 'financial_products' },
    { name: 'Investment Account', category: 'financial_products' },
    { name: 'Credit Card', category: 'financial_products' },
    { name: 'Savings Account', category: 'financial_products' }
  ],
  natural_remedies: [
    { name: 'Turmeric', category: 'natural_remedies' },
    { name: 'Ginger Tea', category: 'natural_remedies' },
    { name: 'Essential Oils', category: 'natural_remedies' },
    { name: 'Herbal Tea', category: 'natural_remedies' }
  ],
  beauty_skincare: [
    { name: 'Retinol', category: 'beauty_skincare' },
    { name: 'Moisturizer', category: 'beauty_skincare' },
    { name: 'Sunscreen', category: 'beauty_skincare' },
    { name: 'Face Serum', category: 'beauty_skincare' }
  ]
}

// Helper to get a random solution for a category
export function getTestSolution(category: string) {
  const solutions = KNOWN_SOLUTIONS[category as keyof typeof KNOWN_SOLUTIONS]
  if (!solutions || solutions.length === 0) {
    throw new Error(`No known solutions for category: ${category}`)
  }
  return solutions[0] // Always use first one for consistency in tests
}