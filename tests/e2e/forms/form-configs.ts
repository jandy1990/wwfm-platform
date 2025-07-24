import { Page } from '@playwright/test'
import { FormTestConfig } from './form-test-factory'
import { 
  fillStandardFields, 
  selectOption, 
  checkOptions 
} from '../utils/test-helpers'
import { 
  FORM_DROPDOWN_OPTIONS, 
  ARRAY_FIELD_OPTIONS,
  EXPECTED_FIELDS_BY_FORM 
} from '../fixtures/test-data'

// DosageForm Configuration (4 categories)
export const dosageFormConfig: FormTestConfig = {
  formName: 'DosageForm',
  categories: ['medications', 'supplements_vitamins', 'natural_remedies', 'beauty_skincare'],
  requiredFields: ['cost', 'time_to_results', 'side_effects', 'effectiveness'],
  arrayFields: ['side_effects'],
  hasVariants: true,
  
  generateTestData: (category: string) => ({
    // Basic solution info
    solutionName: `Test ${category} Solution ${Date.now()}`,
    
    // Step 1: Dosage info
    doseAmount: category === 'beauty_skincare' ? '' : '20',
    doseUnit: category === 'beauty_skincare' ? '' : 'mg',
    frequency: category === 'beauty_skincare' ? '' : 'twice daily',
    skincareFrequency: category === 'beauty_skincare' ? 'twice_daily' : '',
    
    // Step 2: Effectiveness
    effectiveness: 4,
    timeToResults: '1-2 weeks',
    
    // Step 3: Side effects
    sideEffects: ['None'],
    
    // Step 4: Additional info
    costRange: '$25-50/month',
    brand: 'Test Brand',
    form: category === 'medications' ? 'tablet' : category === 'supplements_vitamins' ? 'capsule' : '',
    otherInfo: 'Test notes'
  }),
  
  fillFormSteps: async (page: Page, testData: any) => {
    // The form already has the solution name from the previous step
    // Step 1: Dosage information
    if (testData.category === 'beauty_skincare') {
      // Skincare uses different frequency selector
      await page.selectOption('select[value="' + testData.skincareFrequency + '"]', testData.skincareFrequency)
    } else {
      // Other categories use dosage fields
      await page.fill('input[type="text"][value=""]', testData.doseAmount) // First text input
      await page.selectOption('select[value=""]', testData.doseUnit) // Unit dropdown
      await page.selectOption('select[value=""]', testData.frequency) // Frequency dropdown
    }
    
    // Click Continue to Step 2
    await page.click('button:has-text("Continue")')
    
    // Step 2: Effectiveness
    await page.click(`button[aria-label="${testData.effectiveness} stars"]`) // Star rating
    await page.selectOption('select[value=""]', testData.timeToResults)
    
    // Click Continue to Step 3
    await page.click('button:has-text("Continue")')
    
    // Step 3: Side effects (already has 'None' selected by default)
    // Click Continue to Step 4
    await page.click('button:has-text("Continue")')
    
    // Step 4: Additional info
    await page.selectOption('select[value="dont_remember"]', testData.costRange)
    await page.fill('input[placeholder="Brand/Manufacturer"]', testData.brand)
    if (testData.form) {
      await page.selectOption('select[value=""]', testData.form)
    }
    await page.fill('textarea', testData.otherInfo)
  },
  
  verifyData: (result, testData) => {
    // Verify solution fields
    expect(result.solutionFields.effectiveness).toBe(testData.effectiveness)
    expect(result.solutionFields.time_to_results).toBe(testData.timeToResults)
    expect(result.solutionFields.cost).toBe(testData.costRange)
    expect(result.solutionFields.side_effects).toEqual(testData.sideEffects)
    
    // Verify variant data for non-skincare categories
    if (testData.category !== 'beauty_skincare') {
      expect(result.variant.amount).toBe(parseInt(testData.doseAmount))
      expect(result.variant.unit).toBe(testData.doseUnit)
    }
  }
}

// SessionForm Configuration (7 categories)
export const sessionFormConfig: FormTestConfig = {
  formName: 'SessionForm',
  categories: [
    'therapists_counselors',
    'doctors_specialists', 
    'coaches_mentors',
    'alternative_practitioners',
    'professional_services',
    'medical_procedures',
    'crisis_resources'
  ],
  requiredFields: EXPECTED_FIELDS_BY_FORM.session_form,
  arrayFields: ['barriers', 'side_effects'],
  hasVariants: false,
  
  generateTestData: (category: string) => ({
    cost: '$100-200/month',
    time_to_results: '1-2 months',
    session_frequency: 'Weekly',
    format: 'Video call',
    barriers: ['Cost', 'Finding right provider'],
    // Category-specific fields
    ...(category === 'doctors_specialists' && {
      wait_time: '1-2 weeks',
      insurance_coverage: 'Partially covered'
    }),
    ...(category === 'medical_procedures' && {
      treatment_frequency: 'Monthly',
      wait_time: '3-4 weeks',
      side_effects: ['Fatigue', 'Nausea']
    })
  }),
  
  fillFormSteps: async (page: Page, testData: any) => {
    await fillStandardFields(page, testData)
    
    // Common fields
    await selectOption(page, '[name="cost"]', testData.cost)
    await selectOption(page, '[name="time_to_results"]', testData.time_to_results)
    
    // Session-specific fields
    if (testData.session_frequency) {
      await selectOption(page, '[name="session_frequency"]', testData.session_frequency)
    }
    if (testData.format) {
      await selectOption(page, '[name="format"]', testData.format)
    }
    
    // Category-specific fields
    if (testData.wait_time) {
      await selectOption(page, '[name="wait_time"]', testData.wait_time)
    }
    if (testData.insurance_coverage) {
      await selectOption(page, '[name="insurance_coverage"]', testData.insurance_coverage)
    }
    if (testData.treatment_frequency) {
      await selectOption(page, '[name="treatment_frequency"]', testData.treatment_frequency)
    }
    
    // Array fields
    if (testData.barriers) {
      await checkOptions(page, testData.barriers)
    }
    if (testData.side_effects) {
      await checkOptions(page, testData.side_effects)
    }
  }
}

// PracticeForm Configuration (3 categories)
export const practiceFormConfig: FormTestConfig = {
  formName: 'PracticeForm',
  categories: ['meditation_mindfulness', 'exercise_movement', 'habits_routines'],
  requiredFields: EXPECTED_FIELDS_BY_FORM.practice_form,
  arrayFields: ['challenges'],
  hasVariants: false,
  
  generateTestData: (category: string) => ({
    startup_cost: 'Free',
    ongoing_cost: '$10-25/month',
    time_to_results: '1-2 weeks',
    practice_length: '20-30 minutes',
    challenges: ['Hard to maintain habit', 'Takes too much time'],
    // Category-specific
    ...(category === 'exercise_movement' && {
      frequency: 'Daily'
    }),
    ...(category === 'habits_routines' && {
      time_commitment: '15-30 min/day'
    })
  }),
  
  fillFormSteps: async (page: Page, testData: any) => {
    await fillStandardFields(page, testData)
    
    await selectOption(page, '[name="startup_cost"]', testData.startup_cost)
    await selectOption(page, '[name="ongoing_cost"]', testData.ongoing_cost)
    await selectOption(page, '[name="time_to_results"]', testData.time_to_results)
    
    if (testData.practice_length) {
      await selectOption(page, '[name="practice_length"]', testData.practice_length)
    }
    if (testData.frequency) {
      await selectOption(page, '[name="frequency"]', testData.frequency)
    }
    if (testData.time_commitment) {
      await selectOption(page, '[name="time_commitment"]', testData.time_commitment)
    }
    
    if (testData.challenges) {
      await checkOptions(page, testData.challenges)
    }
  }
}

// AppForm Configuration (1 category)
export const appFormConfig: FormTestConfig = {
  formName: 'AppForm',
  categories: ['apps_software'],
  requiredFields: EXPECTED_FIELDS_BY_FORM.app_form,
  arrayFields: ['challenges'],
  hasVariants: false,
  
  generateTestData: () => ({
    cost: '$10-25/month',
    time_to_results: 'Immediately',
    usage_frequency: 'Daily',
    subscription_type: 'Premium/Pro',
    challenges: ['Hard to maintain habit', 'Too many notifications']
  }),
  
  fillFormSteps: async (page: Page, testData: any) => {
    await fillStandardFields(page, testData)
    
    await selectOption(page, '[name="cost"]', testData.cost)
    await selectOption(page, '[name="time_to_results"]', testData.time_to_results)
    await selectOption(page, '[name="usage_frequency"]', testData.usage_frequency)
    await selectOption(page, '[name="subscription_type"]', testData.subscription_type)
    
    if (testData.challenges) {
      await checkOptions(page, testData.challenges)
    }
  }
}

// Additional form configurations would follow the same pattern...
// Leaving as placeholders for now since forms aren't implemented yet

export const allFormConfigs = [
  dosageFormConfig,
  sessionFormConfig,
  practiceFormConfig,
  appFormConfig,
  // Add other configs as forms are implemented
]