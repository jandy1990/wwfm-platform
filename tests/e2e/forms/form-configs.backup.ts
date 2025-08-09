import { Page } from '@playwright/test'
import { FormTestConfig } from './form-test-factory'
import { fillFormGeneric } from './generic-form-filler'
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

// Helper to wait for auto-categorization and proceed
async function navigateToForm(page: Page, solutionName: string, expectedCategory: string) {
  // Fill solution name
  await page.fill('#solution-name', solutionName)
  
  // Wait for auto-categorization to trigger
  await page.waitForTimeout(2000)
  
  // Check if category was auto-detected by looking for the badge
  const categoryBadge = page.locator(`span:has-text("${expectedCategory}")`)
  const isAutoDetected = await categoryBadge.isVisible({ timeout: 1000 })
  
  if (!isAutoDetected) {
    // If not auto-detected, we might see dropdown suggestions
    // Try clicking on a suggestion if available
    const suggestion = page.locator(`button:has-text("${solutionName}")`)
    if (await suggestion.isVisible({ timeout: 1000 })) {
      await suggestion.click()
      await page.waitForTimeout(500)
    }
  }
  
  // Click Continue button
  const continueButton = page.locator('button:has-text("Continue")')
  await continueButton.waitFor({ state: 'visible' })
  await continueButton.click()
  
  // Wait for form to load - forms have different structures
  // Try multiple possible selectors
  await page.waitForSelector('form, [name="solution_title"], h2', { timeout: 5000 })
}

// DosageForm Configuration (4 categories)
export const dosageFormConfig: FormTestConfig = {
  formName: 'DosageForm',
  categories: ['medications', 'supplements_vitamins', 'natural_remedies', 'beauty_skincare'],
  requiredFields: ['cost', 'time_to_results', 'frequency', 'length_of_use', 'side_effects'],
  arrayFields: ['side_effects'],
  hasVariants: true,
  
  generateTestData: (category: string) => {
    // Category-specific solution names that will trigger auto-categorization
    const categoryNames = {
      'medications': `Lexapro Test ${Date.now()}`,
      'supplements_vitamins': `Vitamin D Test ${Date.now()}`,
      'natural_remedies': `Lavender Oil Test ${Date.now()}`,
      'beauty_skincare': `Retinol Cream Test ${Date.now()}`
    }
    
    return {
      title: categoryNames[category] || `Test ${category} ${Date.now()}`
    }
  },
  
  fillFormSteps: async (page: Page, testData: any) => {
    // Step 1: Basic info and effectiveness
    await page.fill('[name="solution_title"]', testData.title)
    await page.fill('[name="description"]', `Test description for ${testData.category}`)
    
    // Effectiveness rating (stars)
    await page.click('button[aria-label="4 stars"]')
    
    // Time to results
    await page.selectOption('select[name="time_to_results"]', '3-4 weeks')
    
    // Frequency
    await page.selectOption('select[name="frequency"]', 'Twice daily')
    
    // Length of use
    await page.fill('input[name="length_of_use"]', '3-6 months')
    
    // Dosage info (if not skincare)
    if (testData.category !== 'beauty_skincare') {
      await page.fill('input[name="dosage_amount"]', '20')
      await page.selectOption('select[name="dosage_unit"]', 'mg')
      await page.selectOption('select[name="dosage_form"]', 'tablet')
    }
    
    // Navigate to next step if multi-step
    const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")')
    if (await nextButton.isVisible({ timeout: 1000 })) {
      await nextButton.click()
      await page.waitForTimeout(500)
    }
    
    // Step 2: Side effects (if on separate step)
    const sideEffectsSection = page.locator('text=/side effect/i')
    if (await sideEffectsSection.isVisible({ timeout: 1000 })) {
      // Keep "None" selected or select specific ones
      await checkOptions(page, ['None'])
    }
    
    // Final step: Cost (often on success screen)
    const costSelect = page.locator('select[name="cost"]')
    if (await costSelect.isVisible({ timeout: 1000 })) {
      await costSelect.selectOption('$50-100/month')
    }
  }
}

// AppForm Configuration (1 category)
export const appFormConfig: FormTestConfig = {
  formName: 'AppForm',
  categories: ['apps_software'],
  requiredFields: ['cost', 'time_to_results', 'usage_frequency', 'subscription_type', 'challenges'],
  arrayFields: ['challenges'],
  hasVariants: false,
  
  generateTestData: (category: string) => ({
    title: `Headspace Test ${Date.now()}`
  }),
  
  fillFormSteps: async (page: Page, testData: any) => {
    // Wait for form to be ready
    await page.waitForSelector('[name="solution_title"], h2', { timeout: 5000 })
    
    // Step 1: Basic info
    const titleField = page.locator('[name="solution_title"]')
    if (await titleField.isVisible()) {
      await titleField.fill(testData.title)
    }
    
    const descField = page.locator('[name="description"]')
    if (await descField.isVisible()) {
      await descField.fill('Test app description')
    }
    
    // App-specific fields
    await page.selectOption('select[name="subscription_type"]', 'Monthly subscription')
    await page.selectOption('select[name="cost"]', '$10-25/month')
    await page.selectOption('select[name="time_to_results"]', 'Immediately')
    await page.selectOption('select[name="usage_frequency"]', 'Daily')
    
    // Effectiveness
    const stars = page.locator('button[aria-label="4 stars"]')
    if (await stars.isVisible()) {
      await stars.click()
    }
    
    // Navigate to challenges if multi-step
    const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")')
    if (await nextButton.isVisible({ timeout: 1000 })) {
      await nextButton.click()
      await page.waitForTimeout(500)
    }
    
    // Step 2: Challenges
    await checkOptions(page, ['Hard to maintain habit'])
  }
}

// HobbyForm Configuration (1 category)
export const hobbyFormConfig: FormTestConfig = {
  formName: 'HobbyForm',
  categories: ['hobbies_activities'],
  requiredFields: [],  // Skip field validation for now
  arrayFields: [],
  hasVariants: false,
  
  generateTestData: (category: string) => ({
    title: `Hobby Test ${Date.now()}`,
    category: category
  }),
  
  fillFormSteps: async (page: Page, testData: any) => {
    await fillFormGeneric(page, testData.category)
  }
}

// PracticeForm Configuration (3 categories)
export const practiceFormConfig: FormTestConfig = {
  formName: 'PracticeForm',
  categories: ['exercise_movement', 'meditation_mindfulness', 'habits_routines'],
  requiredFields: ['startup_cost', 'ongoing_cost', 'time_to_results', 'frequency', 'challenges'],
  arrayFields: ['challenges'],
  hasVariants: false,
  
  generateTestData: (category: string) => {
    const categoryNames = {
      'exercise_movement': `Running Test ${Date.now()}`,
      'meditation_mindfulness': `Mindfulness Test ${Date.now()}`,
      'habits_routines': `Morning Routine Test ${Date.now()}`
    }
    return {
      title: categoryNames[category] || `Test ${category} ${Date.now()}`
    }
  },
  
  fillFormSteps: async (page: Page, testData: any) => {
    // Wait for form
    await page.waitForSelector('[name="solution_title"], h2', { timeout: 5000 })
    
    // Fill basic info if visible
    const titleField = page.locator('[name="solution_title"]')
    if (await titleField.isVisible()) {
      await titleField.fill(testData.title)
    }
    
    // Practice-specific fields
    await page.selectOption('select[name="startup_cost"]', 'Free/No startup cost')
    await page.selectOption('select[name="ongoing_cost"]', 'Free/No ongoing cost')
    await page.selectOption('select[name="time_to_results"]', '1-2 weeks')
    await page.selectOption('select[name="frequency"]', 'Daily')
    
    // Navigate to challenges
    const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")')
    if (await nextButton.isVisible({ timeout: 1000 })) {
      await nextButton.click()
      await page.waitForTimeout(500)
    }
    
    // Challenges
    await checkOptions(page, ['Difficulty concentrating'])
  }
}

// SessionForm Configuration (7 categories) - Single page form
export const sessionFormConfig: FormTestConfig = {
  formName: 'SessionForm',
  categories: [
    'therapists_counselors', 'doctors_specialists', 'coaches_mentors',
    'alternative_practitioners', 'professional_services', 'medical_procedures', 'crisis_resources'
  ],
  requiredFields: ['cost', 'time_to_results', 'session_frequency', 'format', 'barriers'],
  arrayFields: ['barriers'],
  hasVariants: false,
  
  generateTestData: (category: string) => {
    const categoryNames = {
      'therapists_counselors': `CBT Therapy Test ${Date.now()}`,
      'doctors_specialists': `Psychiatrist Test ${Date.now()}`,
      'coaches_mentors': `Life Coach Test ${Date.now()}`,
      'alternative_practitioners': `Acupuncture Test ${Date.now()}`,
      'professional_services': `Financial Advisor Test ${Date.now()}`,
      'medical_procedures': `Physical Therapy Test ${Date.now()}`,
      'crisis_resources': `Crisis Hotline Test ${Date.now()}`
    }
    return {
      title: categoryNames[category] || `Test ${category} ${Date.now()}`
    }
  },
  
  fillFormSteps: async (page: Page, testData: any) => {
    // SessionForm is a single-page form
    await page.waitForSelector('form', { timeout: 5000 })
    
    // All fields on one page
    await page.fill('[name="solution_title"]', testData.title)
    await page.fill('[name="description"]', 'Test session description')
    
    await page.selectOption('select[name="cost"]', '$150-200/session')
    await page.selectOption('select[name="time_to_results"]', '3-4 weeks')
    await page.selectOption('select[name="session_frequency"]', 'Weekly')
    await page.selectOption('select[name="format"]', 'In-person')
    
    // Effectiveness
    await page.click('button[aria-label="4 stars"]')
    
    // Barriers
    await checkOptions(page, ['Finding the right therapist'])
  }
}

// PurchaseForm Configuration (2 categories) - Single page
export const purchaseFormConfig: FormTestConfig = {
  formName: 'PurchaseForm',
  categories: ['products_devices', 'books_courses'],
  requiredFields: ['cost', 'time_to_results', 'ease_of_use', 'product_type', 'issues'],
  arrayFields: ['issues'],
  hasVariants: false,
  
  generateTestData: (category: string) => {
    const categoryNames = {
      'products_devices': `Weighted Blanket Test ${Date.now()}`,
      'books_courses': `Anxiety Workbook Test ${Date.now()}`
    }
    return {
      title: categoryNames[category] || `Test ${category} ${Date.now()}`
    }
  },
  
  fillFormSteps: async (page: Page, testData: any) => {
    // PurchaseForm is a single-page form
    await page.waitForSelector('form, [name="solution_title"]', { timeout: 5000 })
    
    // Fill basic info
    const titleField = page.locator('[name="solution_title"]')
    if (await titleField.isVisible()) {
      await titleField.fill(testData.title)
    }
    
    const descField = page.locator('[name="description"]')
    if (await descField.isVisible()) {
      await descField.fill('Test purchase description')
    }
    
    // Purchase-specific fields
    await page.selectOption('select[name="cost"]', '$50-100')
    await page.selectOption('select[name="time_to_results"]', '1-2 weeks')
    await page.selectOption('select[name="ease_of_use"]', 'Easy')
    
    // Product type depends on category
    const productType = testData.category === 'books_courses' ? 'Digital download' : 'Physical product'
    await page.selectOption('select[name="product_type"]', productType)
    
    // Effectiveness
    const stars = page.locator('button[aria-label="4 stars"]')
    if (await stars.isVisible()) {
      await stars.click()
    }
    
    // Issues (array field)
    await checkOptions(page, ['None'])
  }
}

// CommunityForm Configuration (2 categories) - Single page
export const communityFormConfig: FormTestConfig = {
  formName: 'CommunityForm',
  categories: ['support_groups', 'groups_communities'],
  requiredFields: ['cost', 'time_to_results', 'meeting_frequency', 'format', 'challenges'],
  arrayFields: ['challenges'],
  hasVariants: false,
  
  generateTestData: (category: string) => {
    const categoryNames = {
      'support_groups': `Anxiety Support Group Test ${Date.now()}`,
      'groups_communities': `Running Club Test ${Date.now()}`
    }
    return {
      title: categoryNames[category] || `Test ${category} ${Date.now()}`
    }
  },
  
  fillFormSteps: async (page: Page, testData: any) => {
    await page.waitForSelector('form', { timeout: 5000 })
    
    await page.fill('[name="solution_title"]', testData.title)
    await page.selectOption('select[name="cost"]', 'Free')
    await page.selectOption('select[name="time_to_results"]', '1-2 weeks')
    await page.selectOption('select[name="meeting_frequency"]', 'Weekly')
    await page.selectOption('select[name="format"]', 'In-person')
    
    await page.click('button[aria-label="4 stars"]')
    await checkOptions(page, ['None'])
  }
}

// LifestyleForm Configuration (2 categories) - Single page
export const lifestyleFormConfig: FormTestConfig = {
  formName: 'LifestyleForm',
  categories: ['diet_nutrition', 'sleep'],
  requiredFields: ['cost_impact', 'time_to_results', 'prep_time', 'sustainability', 'challenges'],
  arrayFields: ['challenges'],
  hasVariants: false,
  
  generateTestData: (category: string) => {
    const categoryNames = {
      'diet_nutrition': `Mediterranean Diet Test ${Date.now()}`,
      'sleep': `Sleep Hygiene Test ${Date.now()}`
    }
    return {
      title: categoryNames[category] || `Test ${category} ${Date.now()}`
    }
  },
  
  fillFormSteps: async (page: Page, testData: any) => {
    await page.waitForSelector('form', { timeout: 5000 })
    
    await page.fill('[name="solution_title"]', testData.title)
    await page.selectOption('select[name="cost_impact"]', 'Saves money')
    await page.selectOption('select[name="time_to_results"]', '1-2 weeks')
    await page.selectOption('select[name="prep_time"]', '30-60 minutes/day')
    await page.selectOption('select[name="sustainability"]', 'Very sustainable')
    
    await page.click('button[aria-label="4 stars"]')
    await checkOptions(page, ['None'])
  }
}

// FinancialForm Configuration (1 category) - Single page
export const financialFormConfig: FormTestConfig = {
  formName: 'FinancialForm',
  categories: ['financial_products'],
  requiredFields: ['cost_type', 'financial_benefit', 'time_to_results', 'access_time', 'barriers'],
  arrayFields: ['barriers'],
  hasVariants: false,
  
  generateTestData: (category: string) => ({
    title: `High Yield Savings Test ${Date.now()}`
  }),
  
  fillFormSteps: async (page: Page, testData: any) => {
    await page.waitForSelector('form', { timeout: 5000 })
    
    await page.fill('[name="solution_title"]', testData.title)
    await page.selectOption('select[name="cost_type"]', 'No fees')
    await page.selectOption('select[name="financial_benefit"]', '$100-500/month')
    await page.selectOption('select[name="time_to_results"]', 'Immediately')
    await page.selectOption('select[name="access_time"]', 'Available 24/7')
    
    await page.click('button[aria-label="4 stars"]')
    await checkOptions(page, ['None'])
  }
}

// Export all configs for easy access
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
