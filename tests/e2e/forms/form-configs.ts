import { Page } from '@playwright/test'
import { FormTestConfig } from './form-test-factory'
import { fillFormSpecific } from './form-specific-fillers'

// Simplified configs using generic filler for all forms

// DosageForm Configuration (4 categories)
// Note: beauty_skincare uses this form but creates Standard variants
export const dosageFormConfig: FormTestConfig = {
  formName: 'DosageForm',
  categories: ['medications', 'supplements_vitamins', 'natural_remedies', 'beauty_skincare'],
  requiredFields: [], // Server action handles field storage
  arrayFields: [],
  hasVariants: true, // Only medications, supplements, natural_remedies create dosage variants
  generateTestData: (category: string) => ({
    title: `Dosage Test ${Date.now()}`,
    category: category
  }),
  fillFormSteps: async (page: Page, testData: any) => {
    await fillFormSpecific(page, testData.category)
  }
}

// AppForm Configuration (1 category)
export const appFormConfig: FormTestConfig = {
  formName: 'AppForm',
  categories: ['apps_software'],
  requiredFields: [],
  arrayFields: [],
  hasVariants: false,
  generateTestData: (category: string) => ({
    title: `App Test ${Date.now()}`,
    category: category
  }),
  fillFormSteps: async (page: Page, testData: any) => {
    await fillFormSpecific(page, testData.category)
  }
}

// HobbyForm Configuration (1 category)
export const hobbyFormConfig: FormTestConfig = {
  formName: 'HobbyForm',
  categories: ['hobbies_activities'],
  requiredFields: [],
  arrayFields: [],
  hasVariants: false,
  generateTestData: (category: string) => ({
    title: `Hobby Test ${Date.now()}`,
    category: category
  }),
  fillFormSteps: async (page: Page, testData: any) => {
    await fillFormSpecific(page, testData.category)
  }
}

// PracticeForm Configuration (3 categories)
export const practiceFormConfig: FormTestConfig = {
  formName: 'PracticeForm',
  categories: ['exercise_movement', 'meditation_mindfulness', 'habits_routines'],
  requiredFields: [],
  arrayFields: [],
  hasVariants: false,
  generateTestData: (category: string) => ({
    title: `Practice Test ${Date.now()}`,
    category: category
  }),
  fillFormSteps: async (page: Page, testData: any) => {
    await fillFormSpecific(page, testData.category)
  }
}

// SessionForm Configuration (7 categories)
export const sessionFormConfig: FormTestConfig = {
  formName: 'SessionForm',
  categories: [
    'therapists_counselors', 'doctors_specialists', 'coaches_mentors',
    'alternative_practitioners', 'professional_services', 'medical_procedures', 'crisis_resources'
  ],
  requiredFields: [],
  arrayFields: [],
  hasVariants: false,
  generateTestData: (category: string) => ({
    title: `Session Test ${Date.now()}`,
    category: category
  }),
  fillFormSteps: async (page: Page, testData: any) => {
    await fillFormSpecific(page, testData.category)
  }
}

// PurchaseForm Configuration (2 categories)
export const purchaseFormConfig: FormTestConfig = {
  formName: 'PurchaseForm',
  categories: ['products_devices', 'books_courses'],
  requiredFields: [],
  arrayFields: [],
  hasVariants: false,
  generateTestData: (category: string) => ({
    title: `Purchase Test ${Date.now()}`,
    category: category
  }),
  fillFormSteps: async (page: Page, testData: any) => {
    await fillFormSpecific(page, testData.category)
  }
}

// CommunityForm Configuration (2 categories)
export const communityFormConfig: FormTestConfig = {
  formName: 'CommunityForm',
  categories: ['support_groups', 'groups_communities'],
  requiredFields: [],
  arrayFields: [],
  hasVariants: false,
  generateTestData: (category: string) => ({
    title: `Community Test ${Date.now()}`,
    category: category
  }),
  fillFormSteps: async (page: Page, testData: any) => {
    await fillFormSpecific(page, testData.category)
  }
}

// LifestyleForm Configuration (2 categories)
export const lifestyleFormConfig: FormTestConfig = {
  formName: 'LifestyleForm',
  categories: ['diet_nutrition', 'sleep'],
  requiredFields: [],
  arrayFields: [],
  hasVariants: false,
  generateTestData: (category: string) => ({
    title: `Lifestyle Test ${Date.now()}`,
    category: category
  }),
  fillFormSteps: async (page: Page, testData: any) => {
    await fillFormSpecific(page, testData.category)
  }
}

// FinancialForm Configuration (1 category)
export const financialFormConfig: FormTestConfig = {
  formName: 'FinancialForm',
  categories: ['financial_products'],
  requiredFields: [],
  arrayFields: [],
  hasVariants: false,
  generateTestData: (category: string) => ({
    title: `Financial Test ${Date.now()}`,
    category: category
  }),
  fillFormSteps: async (page: Page, testData: any) => {
    await fillFormSpecific(page, testData.category)
  }
}

// Export all configs as an array
export const allFormConfigs = [
  dosageFormConfig,
  appFormConfig,
  hobbyFormConfig,
  practiceFormConfig,
  sessionFormConfig,
  purchaseFormConfig,
  communityFormConfig,
  lifestyleFormConfig,
  financialFormConfig
]

// Helper to get config by form name
export function getFormConfig(formName: string): FormTestConfig | undefined {
  return allFormConfigs.find(config => config.formName === formName)
}

// Helper to get config by category
export function getFormConfigByCategory(category: string): FormTestConfig | undefined {
  return allFormConfigs.find(config => config.categories.includes(category))
}