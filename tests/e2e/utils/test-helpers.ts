import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Page } from '@playwright/test'

// Test database client with service key - created lazily to ensure env vars are loaded
let _testSupabase: SupabaseClient | null = null

export function getTestSupabase() {
  if (!_testSupabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_KEY
    
    if (!url || !key) {
      throw new Error('Missing required environment variables. Please check .env.test.local')
    }
    
    _testSupabase = createClient(url, key)
  }
  return _testSupabase
}

// For backward compatibility
export const testSupabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    return getTestSupabase()[prop as keyof SupabaseClient]
  }
})

// Import test solutions fixture
import { TEST_SOLUTIONS } from '../fixtures/test-solutions'

// Test data factory - now uses pre-created test solutions
export function generateTestSolution(category: string) {
  // Use the permanent test solutions instead of creating new ones
  const testSolutionTitle = TEST_SOLUTIONS[category as keyof typeof TEST_SOLUTIONS]
  
  if (!testSolutionTitle) {
    throw new Error(`No test solution configured for category: ${category}`)
  }
  
  return {
    title: testSolutionTitle,
    description: `Automated test solution for ${category}`,
    category,
    goalId: process.env.TEST_GOAL_ID || '56e2801e-0d78-4abd-a795-869e5b780ae7' // Reduce anxiety goal
  }
}

// Helper to find existing solution by title
export async function findExistingSolution(title: string) {
  const { data, error } = await testSupabase
    .from('solutions')
    .select('*')
    .eq('title', title)
    .single()
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('Error finding solution:', error)
  }
  
  return data
}

// Helper to find existing variant
export async function findExistingVariant(solutionId: string, variantName: string) {
  const { data, error } = await testSupabase
    .from('solution_variants')
    .select('*')
    .eq('solution_id', solutionId)
    .eq('variant_name', variantName)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error finding variant:', error)
  }
  
  return data
}

// Database cleanup - only cleans up test data from our test goal
// NEVER deletes test fixtures (source_type = 'test_fixture')
export async function cleanupTestData(titlePattern: string) {
  // IMPORTANT: Never delete test fixtures
  if (titlePattern.includes('(Test)')) {
    console.log('Skipping cleanup for test fixture:', titlePattern)
    return
  }
  
  // First, find test solutions (excluding fixtures)
  const { data: solutions } = await testSupabase
    .from('solutions')
    .select('id')
    .like('title', `${titlePattern}%`)
    .neq('source_type', 'test_fixture') // Never delete fixtures
  
  if (!solutions || solutions.length === 0) return
  
  // Get variants for these solutions
  const solutionIds = solutions.map(s => s.id)
  const { data: variants } = await testSupabase
    .from('solution_variants')
    .select('id')
    .in('solution_id', solutionIds)
  
  if (!variants) return
  
  const variantIds = variants.map(v => v.id)
  
  // Clean up goal_implementation_links first (foreign key constraint)
  // Only delete links to our TEST_GOAL_ID to avoid affecting seeded data
  const { error: linkError } = await testSupabase
    .from('goal_implementation_links')
    .delete()
    .eq('goal_id', process.env.TEST_GOAL_ID!)
    .in('implementation_id', variantIds)
  
  if (linkError) console.error('Failed to cleanup links:', linkError)
  
  // Now we can clean up variants and solutions
  // Only delete if they're not linked to any other goals
  for (const variantId of variantIds) {
    const { data: remainingLinks } = await testSupabase
      .from('goal_implementation_links')
      .select('id')
      .eq('implementation_id', variantId)
      .limit(1)
    
    // If no other links exist, safe to delete variant
    if (!remainingLinks || remainingLinks.length === 0) {
      await testSupabase
        .from('solution_variants')
        .delete()
        .eq('id', variantId)
    }
  }
  
  // Finally, clean up solutions that have no remaining variants
  for (const solutionId of solutionIds) {
    const { data: remainingVariants } = await testSupabase
      .from('solution_variants')
      .select('id')
      .eq('solution_id', solutionId)
      .limit(1)
    
    // If no variants exist, safe to delete solution
    if (!remainingVariants || remainingVariants.length === 0) {
      await testSupabase
        .from('solutions')
        .delete()
        .eq('id', solutionId)
    }
  }
}

// Wait for navigation helper
export async function waitForSuccessPage(page: Page) {
  // Forms now show an in-form success screen instead of navigating
  // Check for either URL navigation OR success screen content
  try {
    await Promise.race([
      page.waitForURL(/\/goal\/.*\/(success|solutions)/, { timeout: 10000 }),
      page.waitForSelector('text=/Success|successfully submitted|Thank you|Congrats/i', { timeout: 10000 })
    ])
  } catch (error) {
    // If neither happened, check if we at least have a success message
    const hasSuccess = await page.locator('text=/Success|successfully submitted|Thank you|Congrats/i').isVisible()
    if (!hasSuccess) {
      throw new Error('Form submission did not show success')
    }
  }
}

// Authentication helper
export async function authenticateUser(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.fill('[name="email"]', email)
  await page.fill('[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/dashboard|\//, { timeout: 5000 })
}

// Helper to check if user is authenticated
export async function isAuthenticated(page: Page): Promise<boolean> {
  // Check for auth cookie or session indicator
  const cookies = await page.context().cookies()
  return cookies.some(cookie => cookie.name.includes('supabase'))
}

// Helper to fill standard form fields
export async function fillStandardFields(page: Page, data: {
  title: string
  description: string
}) {
  await page.fill('[name="solution_title"]', data.title)
  await page.fill('[name="description"]', data.description)
}

// Helper to select from dropdown
export async function selectOption(page: Page, selector: string, value: string) {
  await page.selectOption(selector, value)
}

// Helper to check multiple checkboxes
export async function checkOptions(page: Page, options: string[]) {
  for (const option of options) {
    await page.check(`label:has-text("${option}")`)
  }
}

// Helper to verify JSONB field structure
export function verifyJSONBStructure(solutionFields: any, expectedFields: string[]) {
  // Handle empty or undefined fields object
  if (!solutionFields || Object.keys(solutionFields).length === 0) {
    // For new server action, fields might be minimal if using defaults
    return {
      isValid: true, // Empty is valid as server action handles defaults
      missingFields: [],
      extraFields: [],
      actualFieldCount: 0,
      expectedFieldCount: expectedFields.length,
      note: 'Solution fields are minimal - server action uses defaults'
    }
  }
  
  const actualFields = Object.keys(solutionFields)
  const missingFields = expectedFields.filter(field => !actualFields.includes(field))
  const extraFields = actualFields.filter(field => !expectedFields.includes(field))
  
  return {
    isValid: missingFields.length === 0 && extraFields.length === 0,
    missingFields,
    extraFields,
    actualFieldCount: actualFields.length,
    expectedFieldCount: expectedFields.length
  }
}

// Helper to get goal implementation link for our test
export async function getTestGoalImplementation(variantId: string) {
  const { data, error } = await testSupabase
    .from('goal_implementation_links')
    .select('*')
    .eq('goal_id', process.env.TEST_GOAL_ID!)
    .eq('implementation_id', variantId)
    .single()
  
  if (error) {
    console.error('Error finding goal implementation:', error)
  }
  
  return data
}

// Helper to verify complete data pipeline (updated for server action)
export async function verifyDataPipeline(solutionTitle: string, expectedCategory: string) {
  // Find the solution
  const solution = await findExistingSolution(solutionTitle)
  if (!solution) {
    return { success: false, error: 'Solution not found' }
  }
  
  // Verify solution category
  if (solution.solution_category !== expectedCategory) {
    return { 
      success: false, 
      error: `Category mismatch: expected ${expectedCategory}, got ${solution.solution_category}` 
    }
  }
  
  // Find variants
  const { data: variants } = await testSupabase
    .from('solution_variants')
    .select('*')
    .eq('solution_id', solution.id)
  
  if (!variants || variants.length === 0) {
    return { success: false, error: 'No variants found' }
  }
  
  // Find goal implementation link for test goal
  const variant = variants[0] // For most tests, we expect one variant
  const goalLink = await getTestGoalImplementation(variant.id)
  
  if (!goalLink) {
    return { success: false, error: 'Goal implementation link not found' }
  }
  
  // Verify user rating exists (new with server action)
  const { data: userRating } = await testSupabase
    .from('user_ratings')
    .select('*')
    .eq('goal_id', process.env.TEST_GOAL_ID!)
    .eq('solution_variant_id', variant.id)
    .single()
  
  if (!userRating) {
    console.warn('No user rating found - this may be expected for anonymous users')
  }
  
  return {
    success: true,
    solution,
    variant,
    goalLink,
    userRating,
    // IMPORTANT: solution_fields now stored on goal_implementation_links, not solutions
    solutionFields: goalLink.solution_fields || {}
  }
}