/**
 * Test data templates for all 23 solution categories
 * Each solution includes "(DevTools Test)" suffix for easy identification and cleanup
 */

import type {
  DosageFormTestData,
  SessionFormTestData,
  PracticeFormTestData,
  AppFormTestData,
  HobbyFormTestData,
  CommunityFormTestData,
  LifestyleFormTestData,
  PurchaseFormTestData,
  FinancialFormTestData,
} from '../types/test-data'

// Test goal ID (will be provided at runtime or from environment)
const TEST_GOAL_ID = process.env.TEST_GOAL_ID || '56e2801e-0d78-4abd-a795-869e5b780ae7'

// DOSAGE FORM TEST DATA (4 categories)

export const medicationsTestData: DosageFormTestData = {
  solutionName: 'Test Medication (DevTools Test)',
  category: 'medications',
  template: 'DosageForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 4,
  timeToResults: '1-2 weeks',
  doseAmount: '500',
  doseUnit: 'mg',
  frequency: 'twice daily',
  lengthOfUse: '3-6 months',
  sideEffects: ['None'],
  cost: '$10-25/month',
  isAuthenticated: true,
}

export const supplementsTestData: DosageFormTestData = {
  solutionName: 'Vitamin D (DevTools Test)',
  category: 'supplements_vitamins',
  template: 'DosageForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 5,
  timeToResults: '3-4 weeks',
  doseAmount: '5000',
  doseUnit: 'IU',
  frequency: 'once daily',
  lengthOfUse: '6-12 months',
  sideEffects: ['None'],
  cost: 'Under $10/month',
  isAuthenticated: true,
  // Variant test (specific dosage)
  variantData: {
    amount: 5000,
    unit: 'IU',
    form: 'softgel',
  },
}

export const naturalRemediesTestData: DosageFormTestData = {
  solutionName: 'Ashwagandha (DevTools Test)',
  category: 'natural_remedies',
  template: 'DosageForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 4,
  timeToResults: '1-2 weeks',
  doseAmount: '600',
  doseUnit: 'mg',
  frequency: 'twice daily',
  lengthOfUse: '3-6 months',
  sideEffects: ['None'],
  cost: 'Under $10/month',
  isAuthenticated: true,
}

export const beautySkincarTestData: DosageFormTestData = {
  solutionName: 'Retinol Serum (DevTools Test)',
  category: 'beauty_skincare',
  template: 'DosageForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 5,
  timeToResults: '3-4 weeks',
  skincareFrequency: 'once_daily_pm',
  lengthOfUse: '6-12 months',
  sideEffects: ['Dryness/peeling', 'Initially worse before better'],
  cost: '$25-50/month',
  isAuthenticated: true,
}

// SESSION FORM TEST DATA (7 categories)

export const therapistsTestData: SessionFormTestData = {
  solutionName: 'CBT Therapist (DevTools Test)',
  category: 'therapists_counselors',
  template: 'SessionForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 5,
  timeToResults: '1-2 months',
  sessionFrequency: 'Weekly',
  sessionLength: '50-60 minutes',
  challenges: ['Finding the right fit'],
  cost: '$100-150', // Per-session cost (Fix #14: therapists_counselors is per-session only)
  isAuthenticated: true,
}

export const doctorsTestData: SessionFormTestData = {
  solutionName: 'Psychiatrist (DevTools Test)',
  category: 'doctors_specialists',
  template: 'SessionForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 4,
  timeToResults: '1-2 months',
  waitTime: '2-4 weeks',
  insuranceCoverage: 'Partially covered by insurance',
  challenges: ['Finding the right fit'], // ADDED: Required field for doctors_specialists
  cost: '$150-250', // Per-session cost (Fix #14: doctors_specialists is per-session only)
  isAuthenticated: true,
}

export const coachesTestData: SessionFormTestData = {
  solutionName: 'Life Coach (DevTools Test)',
  category: 'coaches_mentors',
  template: 'SessionForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 4,
  timeToResults: '1-2 months',
  sessionFrequency: 'Bi-weekly',
  sessionLength: '45-50 minutes',
  challenges: ['Finding the right fit'], // ADDED: Required field for coaches_mentors
  cost: '$100-200/month',
  isAuthenticated: true,
}

export const alternativePractitionersTestData: SessionFormTestData = {
  solutionName: 'Acupuncturist (DevTools Test)',
  category: 'alternative_practitioners',
  template: 'SessionForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 4,
  timeToResults: '3-4 weeks',
  sessionFrequency: 'Weekly',
  sessionLength: '30-45 minutes',
  sideEffects: ['None'], // ADDED: Required field for alternative_practitioners
  cost: '$50-100/month',
  isAuthenticated: true,
}

export const professionalServicesTestData: SessionFormTestData = {
  solutionName: 'Personal Trainer (DevTools Test)',
  category: 'professional_services',
  template: 'SessionForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 5,
  timeToResults: '1-2 weeks',
  sessionFrequency: 'Twice weekly',
  specialty: 'Fitness training',
  challenges: ['Maintaining consistency'], // ADDED: Required field for professional_services
  cost: '$100-200/month',
  isAuthenticated: true,
}

export const medicalProceduresTestData: SessionFormTestData = {
  solutionName: 'Physical Therapy (DevTools Test)',
  category: 'medical_procedures',
  template: 'SessionForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 4,
  timeToResults: '3-4 weeks',
  sessionFrequency: 'Weekly',
  waitTime: '1-2 weeks',
  sideEffects: ['Temporary soreness'], // ADDED: Required field for medical_procedures
  cost: '$100-200/month',
  isAuthenticated: true,
}

export const crisisResourcesTestData: SessionFormTestData = {
  solutionName: 'Crisis Hotline (DevTools Test)',
  category: 'crisis_resources',
  template: 'SessionForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 5,
  timeToResults: 'Immediately',
  responseTime: 'Within minutes',
  format: 'Phone',
  cost: 'Free',
  isAuthenticated: true,
}

// PRACTICE FORM TEST DATA (3 categories)

export const meditationTestData: PracticeFormTestData = {
  solutionName: 'Guided Meditation (DevTools Test)',
  category: 'meditation_mindfulness',
  template: 'PracticeForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 4,
  timeToResults: '1-2 weeks',
  practiceLength: '10-15 minutes',
  frequency: 'Daily',
  startupCost: 'Free', // ADDED: Required field for meditation_mindfulness
  ongoingCost: 'Free', // ADDED: Required field for meditation_mindfulness
  costType: 'one_time', // ADDED: Required field for meditation_mindfulness
  challenges: ['Maintaining consistency'],
  cost: 'Free',
  isAuthenticated: true,
}

export const exerciseTestData: PracticeFormTestData = {
  solutionName: 'Running (DevTools Test)',
  category: 'exercise_movement',
  template: 'PracticeForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 5,
  timeToResults: '1-2 weeks',
  frequency: '3-4 times per week',
  duration: '30-45 minutes',
  startupCost: 'Under $50', // ADDED: Required field for exercise_movement
  ongoingCost: 'Free', // ADDED: Required field for exercise_movement
  costType: 'one_time', // ADDED: Required field for exercise_movement
  challenges: ['Maintaining consistency'], // ADDED: Required field for exercise_movement
  cost: 'Free',
  isAuthenticated: true,
}

export const habitsTestData: PracticeFormTestData = {
  solutionName: 'Morning Routine (DevTools Test)',
  category: 'habits_routines',
  template: 'PracticeForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 4,
  timeToResults: '1-2 weeks',
  timeCommitment: '30-60 minutes daily',
  frequency: 'Daily',
  startupCost: 'Free', // ADDED: Required field for habits_routines
  ongoingCost: 'Free', // ADDED: Required field for habits_routines
  costType: 'one_time', // ADDED: Required field for habits_routines
  challenges: ['Maintaining consistency'], // ADDED: Required field for habits_routines
  cost: 'Free',
  isAuthenticated: true,
}

// APP FORM TEST DATA (1 category)

export const appsTestData: AppFormTestData = {
  solutionName: 'Headspace (DevTools Test)',
  category: 'apps_software',
  template: 'AppForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 4,
  timeToResults: '1-2 weeks',
  usageFrequency: 'Daily',
  subscriptionType: 'Monthly subscription',
  platform: 'iOS',
  challenges: ['Getting into the habit'],
  cost: '$10-25/month',
  isAuthenticated: true,
}

// HOBBY FORM TEST DATA (1 category)

export const hobbiesTestData: HobbyFormTestData = {
  solutionName: 'Photography (DevTools Test)',
  category: 'hobbies_activities',
  template: 'HobbyForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 4,
  timeToResults: '1-2 weeks',
  frequency: '2-3 times per week',
  timeCommitment: '1-2 hours per session',
  startupCost: '$50-100', // ADDED: Required field for hobbies_activities
  ongoingCost: 'Under $50/month', // ADDED: Required field for hobbies_activities
  costType: 'one_time', // ADDED: Required field for hobbies_activities
  challenges: ['Time to practice'], // ADDED: Required field for hobbies_activities
  cost: '$50-100',
  isAuthenticated: true,
}

// COMMUNITY FORM TEST DATA (2 categories)

export const groupsTestData: CommunityFormTestData = {
  solutionName: 'Running Club (DevTools Test)',
  category: 'groups_communities',
  template: 'CommunityForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 5,
  timeToResults: 'Immediately',
  meetingFrequency: 'Weekly',
  groupSize: '10-20 people',
  format: 'In-person',
  challenges: ['None'], // ADDED: Required field for groups_communities
  cost: 'Free',
  isAuthenticated: true,
}

export const supportGroupsTestData: CommunityFormTestData = {
  solutionName: 'Anxiety Support Group (DevTools Test)',
  category: 'support_groups',
  template: 'CommunityForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 4,
  timeToResults: '1-2 weeks',
  meetingFrequency: 'Weekly',
  groupSize: '5-10 people',
  format: 'Virtual',
  challenges: ['Opening up to others'], // ADDED: Required field for support_groups
  cost: 'Free',
  isAuthenticated: true,
}

// LIFESTYLE FORM TEST DATA (2 categories)

export const dietTestData: LifestyleFormTestData = {
  solutionName: 'Mediterranean Diet (DevTools Test)',
  category: 'diet_nutrition',
  template: 'LifestyleForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 4,
  timeToResults: '3-4 weeks',
  weeklyPrepTime: '3-5 hours',
  stillFollowing: 'Yes, consistently',
  challenges: ['Time for meal prep'],
  cost: '$50-100/month',
  isAuthenticated: true,
}

export const sleepTestData: LifestyleFormTestData = {
  solutionName: 'Consistent Bedtime (DevTools Test)',
  category: 'sleep',
  template: 'LifestyleForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 5,
  timeToResults: '1-2 weeks',
  previousSleepHours: '5-6 hours',
  stillFollowing: 'Yes, consistently',
  challenges: ['Sticking to schedule'], // ADDED: Required field for sleep
  cost: 'Free',
  isAuthenticated: true,
}

// PURCHASE FORM TEST DATA (2 categories)

export const productsTestData: PurchaseFormTestData = {
  solutionName: 'White Noise Machine (DevTools Test)',
  category: 'products_devices',
  template: 'PurchaseForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 4,
  timeToResults: 'Immediately',
  productType: 'Sleep aid',
  easeOfUse: 'Very easy',
  challenges: ['None'], // ADDED: Required field for products_devices
  cost: '$20-50',
  isAuthenticated: true,
}

export const booksCoursesTestData: PurchaseFormTestData = {
  solutionName: 'The Power of Now (DevTools Test)',
  category: 'books_courses',
  template: 'PurchaseForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 5,
  timeToResults: '1-2 weeks',
  format: 'Book',
  learningDifficulty: 'Easy',
  challenges: ['Finding time to read'], // ADDED: Required field for books_courses
  cost: '$20-50',
  isAuthenticated: true,
}

// FINANCIAL FORM TEST DATA (1 category)

export const financialTestData: FinancialFormTestData = {
  solutionName: 'High-Yield Savings (DevTools Test)',
  category: 'financial_products',
  template: 'FinancialForm',
  goalId: TEST_GOAL_ID,
  effectiveness: 4,
  timeToResults: 'Immediately',
  costType: 'Free to use', // ADDED: Required field for financial_products
  financialBenefit: '$100-500/month',
  accessTime: 'Same day',
  challenges: ['None'], // ADDED: Required field for financial_products
  cost: 'Free',
  isAuthenticated: true,
}

// Aggregate all test data
export const ALL_TEST_DATA = {
  // Dosage (4)
  medications: medicationsTestData,
  supplements_vitamins: supplementsTestData,
  natural_remedies: naturalRemediesTestData,
  beauty_skincare: beautySkincarTestData,

  // Session (7)
  therapists_counselors: therapistsTestData,
  doctors_specialists: doctorsTestData,
  coaches_mentors: coachesTestData,
  alternative_practitioners: alternativePractitionersTestData,
  professional_services: professionalServicesTestData,
  medical_procedures: medicalProceduresTestData,
  crisis_resources: crisisResourcesTestData,

  // Practice (3)
  meditation_mindfulness: meditationTestData,
  exercise_movement: exerciseTestData,
  habits_routines: habitsTestData,

  // Other (9)
  apps_software: appsTestData,
  hobbies_activities: hobbiesTestData,
  groups_communities: groupsTestData,
  support_groups: supportGroupsTestData,
  diet_nutrition: dietTestData,
  sleep: sleepTestData,
  products_devices: productsTestData,
  books_courses: booksCoursesTestData,
  financial_products: financialTestData,
}

// Template-based grouping
export const TEST_DATA_BY_TEMPLATE = {
  DosageForm: [medicationsTestData, supplementsTestData, naturalRemediesTestData, beautySkincarTestData],
  SessionForm: [
    therapistsTestData,
    doctorsTestData,
    coachesTestData,
    alternativePractitionersTestData,
    professionalServicesTestData,
    medicalProceduresTestData,
    crisisResourcesTestData,
  ],
  PracticeForm: [meditationTestData, exerciseTestData, habitsTestData],
  AppForm: [appsTestData],
  HobbyForm: [hobbiesTestData],
  CommunityForm: [groupsTestData, supportGroupsTestData],
  LifestyleForm: [dietTestData, sleepTestData],
  PurchaseForm: [productsTestData, booksCoursesTestData],
  FinancialForm: [financialTestData],
}
