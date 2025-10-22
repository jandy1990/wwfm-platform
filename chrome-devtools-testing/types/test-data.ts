/**
 * TypeScript types for Chrome DevTools test data
 * Covers all 9 form templates and 23 categories
 */

// Base interface for all test submissions
export interface BaseTestData {
  solutionName: string
  category: string
  template: FormTemplate
  goalId: string
  effectiveness: 1 | 2 | 3 | 4 | 5
  timeToResults: TimeToResults
  isAuthenticated: boolean
}

// Form templates
export type FormTemplate =
  | 'DosageForm'
  | 'SessionForm'
  | 'PracticeForm'
  | 'AppForm'
  | 'HobbyForm'
  | 'CommunityForm'
  | 'LifestyleForm'
  | 'PurchaseForm'
  | 'FinancialForm'

// Solution categories (all 23)
export type SolutionCategory =
  // Dosage categories (4)
  | 'medications'
  | 'supplements_vitamins'
  | 'natural_remedies'
  | 'beauty_skincare'
  // Session categories (7)
  | 'therapists_counselors'
  | 'doctors_specialists'
  | 'coaches_mentors'
  | 'alternative_practitioners'
  | 'professional_services'
  | 'medical_procedures'
  | 'crisis_resources'
  // Practice categories (3)
  | 'meditation_mindfulness'
  | 'exercise_movement'
  | 'habits_routines'
  // Other categories (9)
  | 'apps_software'
  | 'hobbies_activities'
  | 'groups_communities'
  | 'support_groups'
  | 'products_devices'
  | 'books_courses'
  | 'diet_nutrition'
  | 'sleep'
  | 'financial_products'

// Common field types
export type TimeToResults =
  | 'Immediately'
  | 'Within days'
  | '1-2 weeks'
  | '3-4 weeks'
  | '1-2 months'
  | '3-6 months'
  | '6+ months'
  | 'Still evaluating'

export type CostRange =
  | 'Free'
  | 'Under $10/month'
  | '$10-25/month'
  | '$25-50/month'
  | '$50-100/month'
  | '$100-200/month'
  | '$200-500/month'
  | '$500-1000/month'
  | 'Over $1000/month'
  | 'Under $20'
  | '$20-50'
  | '$50-100'
  | '$100-250'
  | '$250-500'
  | '$500-1000'
  | 'Over $1000'

// DOSAGE FORM TEST DATA (medications, supplements_vitamins, natural_remedies, beauty_skincare)
export interface DosageFormTestData extends BaseTestData {
  template: 'DosageForm'
  category: 'medications' | 'supplements_vitamins' | 'natural_remedies' | 'beauty_skincare'

  // Dosage fields (not for beauty_skincare)
  doseAmount?: string
  doseUnit?: string
  frequency?: string

  // Beauty-specific
  skincareFrequency?: string

  // Common fields
  lengthOfUse: string
  sideEffects: string[]
  cost?: CostRange

  // Variant data (for non-Standard variants)
  variantData?: {
    amount: number
    unit: string
    form?: string
  }
}

// SESSION FORM TEST DATA (7 categories)
export interface SessionFormTestData extends BaseTestData {
  template: 'SessionForm'
  category:
    | 'therapists_counselors'
    | 'doctors_specialists'
    | 'coaches_mentors'
    | 'alternative_practitioners'
    | 'professional_services'
    | 'medical_procedures'
    | 'crisis_resources'

  sessionFrequency?: string
  sessionLength?: string
  waitTime?: string
  responseTime?: string
  specialty?: string
  format?: string
  insuranceCoverage?: string
  challenges?: string[]
  cost?: CostRange
}

// PRACTICE FORM TEST DATA (3 categories)
export interface PracticeFormTestData extends BaseTestData {
  template: 'PracticeForm'
  category: 'meditation_mindfulness' | 'exercise_movement' | 'habits_routines'

  practiceLength?: string
  frequency?: string
  duration?: string
  timeCommitment?: string
  challenges?: string[]
  cost?: CostRange
}

// APP FORM TEST DATA
export interface AppFormTestData extends BaseTestData {
  template: 'AppForm'
  category: 'apps_software'

  usageFrequency: string
  subscriptionType: string
  platform?: string
  challenges?: string[]
  cost?: CostRange
}

// HOBBY FORM TEST DATA
export interface HobbyFormTestData extends BaseTestData {
  template: 'HobbyForm'
  category: 'hobbies_activities'

  frequency: string
  timeCommitment?: string
  challenges?: string[]
  cost?: CostRange
}

// COMMUNITY FORM TEST DATA (2 categories)
export interface CommunityFormTestData extends BaseTestData {
  template: 'CommunityForm'
  category: 'groups_communities' | 'support_groups'

  meetingFrequency: string
  groupSize?: string
  format?: string
  challenges?: string[]
  cost?: CostRange
}

// LIFESTYLE FORM TEST DATA (2 categories)
export interface LifestyleFormTestData extends BaseTestData {
  template: 'LifestyleForm'
  category: 'diet_nutrition' | 'sleep'

  weeklyPrepTime?: string
  previousSleepHours?: string
  stillFollowing?: string
  challenges?: string[]
  cost?: CostRange
}

// PURCHASE FORM TEST DATA
export interface PurchaseFormTestData extends BaseTestData {
  template: 'PurchaseForm'
  category: 'products_devices'

  productType?: string
  easeOfUse?: string
  challenges?: string[]
  cost?: CostRange
}

// FINANCIAL FORM TEST DATA
export interface FinancialFormTestData extends BaseTestData {
  template: 'FinancialForm'
  category: 'financial_products'

  financialBenefit?: string
  accessTime?: string
  challenges?: string[]
  cost?: CostRange
}

// Union type of all test data
export type AnyFormTestData =
  | DosageFormTestData
  | SessionFormTestData
  | PracticeFormTestData
  | AppFormTestData
  | HobbyFormTestData
  | CommunityFormTestData
  | LifestyleFormTestData
  | PurchaseFormTestData
  | FinancialFormTestData

// Template to category mapping
export const TEMPLATE_CATEGORIES: Record<FormTemplate, SolutionCategory[]> = {
  DosageForm: ['medications', 'supplements_vitamins', 'natural_remedies', 'beauty_skincare'],
  SessionForm: [
    'therapists_counselors',
    'doctors_specialists',
    'coaches_mentors',
    'alternative_practitioners',
    'professional_services',
    'medical_procedures',
    'crisis_resources',
  ],
  PracticeForm: ['meditation_mindfulness', 'exercise_movement', 'habits_routines'],
  AppForm: ['apps_software'],
  HobbyForm: ['hobbies_activities'],
  CommunityForm: ['groups_communities', 'support_groups'],
  LifestyleForm: ['diet_nutrition', 'sleep'],
  PurchaseForm: ['products_devices'],
  FinancialForm: ['financial_products'],
}

// Categories with real variants (not just "Standard")
export const VARIANT_CATEGORIES = [
  'medications',
  'supplements_vitamins',
  'natural_remedies',
  'beauty_skincare',
] as const

export type VariantCategory = typeof VARIANT_CATEGORIES[number]
