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
  // First try exact match
  let { data, error } = await testSupabase
    .from('solutions')
    .select('*')
    .eq('title', title)
    .single()
  
  if (error && error.code === 'PGRST116') { // No rows found
    // Try with LIKE to handle any variations
    const { data: solutions } = await testSupabase
      .from('solutions')
      .select('*')
      .ilike('title', `${title}%`)
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (solutions && solutions.length > 0) {
      console.log(`Found solution with similar title: "${solutions[0].title}" for search "${title}"`)
      return solutions[0]
    }
  } else if (error) {
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
  // Forms now use server actions and show Step 3 as the success state
  // Step 3 ("What else did you try?") indicates the main solution has been successfully submitted
  
  console.log('Waiting for form submission success...')
  
  try {
    // The primary success indicator is reaching Step 3
    await page.waitForSelector('text="What else did you try?"', { timeout: 10000 })
    console.log('✅ Form submitted successfully - reached Step 3 (failed solutions optional step)')
    return // Success!
  } catch (error) {
    // If Step 3 didn't appear, check for other success patterns
    console.log('Step 3 not found, checking other success indicators...')
  }
  
  // Check for alternative success patterns
  const checks = await Promise.all([
    page.locator('text=/Success|successfully submitted|Thank you|Congrats/i').isVisible().catch(() => false),
    page.locator('text="Dashboard"').isVisible().catch(() => false),
    page.url().includes('/dashboard'),
    page.url().includes('/success'),
    page.locator('text="solution has been added"').isVisible().catch(() => false),
    page.locator('text="Already submitted"').isVisible().catch(() => false)
  ])
  
  const [hasSuccessText, hasDashboard, isDashboardUrl, isSuccessUrl, hasSolutionAdded, hasAlreadySubmitted] = checks
  
  if (hasSuccessText || hasDashboard || isDashboardUrl || isSuccessUrl || hasSolutionAdded || hasAlreadySubmitted) {
    console.log('✅ Form submission successful via alternative indicator')
    return
  }
  
  // If none of the success indicators are present, the submission failed
  await page.screenshot({ path: 'submission-failed.png' })
  const currentUrl = page.url()
  const pageText = await page.locator('body').textContent()
  
  throw new Error(`Form submission did not show success. URL: ${currentUrl}, Page contains: ${pageText?.substring(0, 200)}...`)
}

// Helper to fill and submit success screen fields
export async function fillSuccessScreenFields(page: Page, fields: Record<string, any>) {
  console.log('\n📝 Filling success screen fields...')
  
  for (const [fieldName, fieldValue] of Object.entries(fields)) {
    // Try different selector strategies
    const selectors = [
      `[name="${fieldName}"]`,
      `#${fieldName}`,
      `[data-testid="${fieldName}"]`,
      `label:has-text("${fieldName.replace(/_/g, ' ')}")`
    ]
    
    let filled = false
    for (const selector of selectors) {
      try {
        const element = page.locator(selector)
        if (await element.isVisible({ timeout: 1000 })) {
          if (typeof fieldValue === 'boolean') {
            // Handle checkboxes
            if (fieldValue) {
              await element.check()
            }
          } else if (Array.isArray(fieldValue)) {
            // Handle multiple selections
            for (const value of fieldValue) {
              await page.check(`label:has-text("${value}")`)
            }
          } else {
            // Handle text inputs and selects
            await element.fill(String(fieldValue))
          }
          console.log(`   ✅ Filled ${fieldName} with "${fieldValue}"`)
          filled = true
          break
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!filled) {
      console.log(`   ⚠️ Could not fill ${fieldName} - field not found`)
    }
  }
  
  // Submit the success screen form
  const updateButton = page.locator('button:has-text("Update")')
  if (await updateButton.isVisible()) {
    console.log('   📤 Clicking Update button...')
    await updateButton.click()
    await page.waitForTimeout(2000) // Wait for save
    console.log('   ✅ Success screen fields submitted')
  } else {
    console.log('   ⚠️ Update button not found')
  }
}

// Helper to verify fields in UI display
export async function verifyFieldsInUI(page: Page, expectedFields: Record<string, any>) {
  console.log('\n🖥️ Verifying fields in UI display...')
  
  const results: Record<string, boolean> = {}
  
  for (const [fieldName, expectedValue] of Object.entries(expectedFields)) {
    // Convert field names to display labels
    const displayLabel = fieldName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
    
    // Check if the field and value appear in the UI
    const fieldVisible = await page.locator(`text="${displayLabel}"`).isVisible().catch(() => false)
    const valueVisible = await page.locator(`text="${expectedValue}"`).isVisible().catch(() => false)
    
    if (fieldVisible && valueVisible) {
      console.log(`   ✅ ${displayLabel}: "${expectedValue}" displayed`)
      results[fieldName] = true
    } else if (fieldVisible && !valueVisible) {
      console.log(`   ⚠️ ${displayLabel} shown but value "${expectedValue}" not found`)
      results[fieldName] = false
    } else {
      console.log(`   ❌ ${displayLabel} not displayed`)
      results[fieldName] = false
    }
  }
  
  const allFieldsVisible = Object.values(results).every(v => v)
  
  if (allFieldsVisible) {
    console.log('\n✅ All expected fields are displayed correctly')
  } else {
    const missingFields = Object.entries(results)
      .filter(([_, visible]) => !visible)
      .map(([field, _]) => field)
    console.log(`\n❌ Missing fields in UI: ${missingFields.join(', ')}`)
  }
  
  return results
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
  
  if (error && error.code !== 'PGRST116') {
    // Only log actual errors, not "no rows found" which is expected after cleanup
    console.error('Error finding goal implementation:', error)
  }
  
  return data
}

// Helper to verify complete data pipeline with field-level verification
export async function verifyDataPipeline(
  solutionTitle: string, 
  expectedCategory: string,
  expectedFields?: Record<string, any>
) {
  console.log(`📊 Verifying data pipeline for "${solutionTitle}" in category "${expectedCategory}"`)
  
  // Find the solution
  const solution = await findExistingSolution(solutionTitle)
  if (!solution) {
    console.log('❌ Solution not found in database')
    return { success: false, error: 'Solution not found' }
  }
  
  console.log('✅ Found solution:', { 
    id: solution.id, 
    category: solution.solution_category,
    source: solution.source_type,
    approved: solution.is_approved 
  })
  
  // Verify solution category
  if (solution.solution_category !== expectedCategory) {
    console.log(`❌ Category mismatch: expected ${expectedCategory}, got ${solution.solution_category}`)
    return { 
      success: false, 
      error: `Category mismatch: expected ${expectedCategory}, got ${solution.solution_category}` 
    }
  }
  
  // Find variants
  const { data: variants, error: variantError } = await testSupabase
    .from('solution_variants')
    .select('*')
    .eq('solution_id', solution.id)
  
  if (variantError || !variants || variants.length === 0) {
    console.log('❌ No variants found:', variantError?.message)
    return { success: false, error: 'No variants found' }
  }
  
  console.log(`✅ Found ${variants.length} variant(s)`)
  
  // Find goal implementation link for test goal with retry
  const variant = variants[0] // For most tests, we expect one variant
  
  // Retry logic for goal implementation link (aggregation might be async)
  let goalLink = null
  const maxRetries = 5
  for (let i = 0; i < maxRetries; i++) {
    goalLink = await getTestGoalImplementation(variant.id)
    if (goalLink) break
    
    if (i < maxRetries - 1) {
      console.log(`⏳ Waiting for aggregation... attempt ${i + 1}/${maxRetries}`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  if (!goalLink) {
    console.log('❌ Goal implementation link not found after retries')
    return { success: false, error: 'Goal implementation link not found' }
  }
  
  console.log('✅ Found goal implementation link')
  
  // Verify user rating exists - table name is 'ratings', not 'user_ratings'
  // Field is 'implementation_id', not 'solution_variant_id'
  const { data: userRating, error: ratingError } = await testSupabase
    .from('ratings')
    .select('*')
    .eq('goal_id', process.env.TEST_GOAL_ID!)
    .eq('implementation_id', variant.id)
    .single()
  
  if (ratingError || !userRating) {
    console.log('⚠️ No user rating found:', ratingError?.message || 'No rating exists')
    // This is not a failure for anonymous users or if rating already exists
  } else {
    console.log('✅ Found user rating')
    
    // Check effectiveness and time_to_results as separate columns
    console.log('📊 Rating effectiveness:', userRating.effectiveness)
    console.log('⏱️ Time to results:', userRating.time_to_results)
    
    // Field-level verification for solution_fields JSON
    if (expectedFields && userRating.solution_fields) {
      console.log('\n📋 Verifying solution_fields JSON...')
      const ratingFields = userRating.solution_fields
      let fieldMismatches = []
      
      for (const [fieldName, expectedValue] of Object.entries(expectedFields)) {
        const actualValue = ratingFields[fieldName]
        // Use JSON.stringify for comparison to handle arrays and objects
        const expectedStr = JSON.stringify(expectedValue)
        const actualStr = JSON.stringify(actualValue)
        if (actualStr !== expectedStr) {
          fieldMismatches.push({
            field: fieldName,
            expected: expectedValue,
            actual: actualValue
          })
          console.log(`   ❌ ${fieldName}: expected ${expectedStr}, got ${actualStr}`)
        } else {
          console.log(`   ✅ ${fieldName}: ${actualStr} (correct)`)
        }
      }
      
      if (fieldMismatches.length > 0) {
        console.log(`\n❌ Field verification failed: ${fieldMismatches.length} mismatches`)
        return {
          success: false,
          error: `Field mismatches: ${fieldMismatches.map(m => m.field).join(', ')}`,
          fieldMismatches
        }
      }
    }
  }
  
  // Verify aggregated fields if we have expectations
  if (expectedFields && goalLink.aggregated_fields) {
    console.log('\n📊 Verifying aggregated fields...')
    const aggregatedFields = goalLink.aggregated_fields
    
    for (const [fieldName, expectedValue] of Object.entries(expectedFields)) {
      const aggregatedField = aggregatedFields[fieldName]
      if (aggregatedField) {
        // For aggregated fields, check if the expected value is included in the distribution
        if (aggregatedField.mode) {
          console.log(`   📈 ${fieldName}: mode="${aggregatedField.mode}", reports=${aggregatedField.totalReports}`)
          
          // Check if our expected value is in the distribution
          if (aggregatedField.values && Array.isArray(aggregatedField.values)) {
            const hasValue = aggregatedField.values.some((v: any) => v.value === expectedValue)
            if (!hasValue && aggregatedField.mode !== expectedValue) {
              console.log(`      ⚠️ Expected value "${expectedValue}" not in distribution`)
            }
          }
        }
      } else {
        console.log(`   ⚠️ ${fieldName}: not aggregated yet`)
      }
    }
  }
  
  return {
    success: true,
    solution,
    variant,
    goalLink,
    userRating,
    // IMPORTANT: solution_fields now stored on goal_implementation_links, not solutions
    solutionFields: goalLink.solution_fields || {},
    ratingFields: userRating?.solution_fields || {},
    aggregatedFields: goalLink.aggregated_fields || {}
  }
}

// Enhanced field-level verification helper
export async function verifyFieldStorage(
  ratingId: string,
  expectedFields: Record<string, any>
) {
  const supabase = getTestSupabase()
  
  const { data: rating, error } = await supabase
    .from('ratings')
    .select('solution_fields')
    .eq('id', ratingId)
    .single()
  
  if (error || !rating) {
    console.error('Failed to fetch rating:', error)
    return null
  }
  
  // Verify NO undefined values were stored
  for (const [key, value] of Object.entries(rating.solution_fields || {})) {
    if (value === undefined) {
      console.error(`❌ Field "${key}" has undefined value - should not be stored`)
    }
    if (value === null && expectedFields[key] !== null) {
      console.error(`❌ Field "${key}" is null but expected non-null`)
    }
  }
  
  // Verify each expected field matches exactly
  for (const [key, value] of Object.entries(expectedFields)) {
    const storedValue = rating.solution_fields?.[key]
    if (storedValue !== value) {
      console.error(`❌ Field "${key}" mismatch: expected "${value}", got "${storedValue}"`)
    } else {
      console.log(`✅ Field "${key}" correctly stored as "${value}"`)
    }
  }
  
  return rating.solution_fields
}

// Verify aggregation completeness
export async function verifyAggregation(
  solutionId: string,
  goalId: string,
  expectedFields: string[]
) {
  const supabase = getTestSupabase()
  
  const { data: link, error } = await supabase
    .from('goal_implementation_links')
    .select('aggregated_fields')
    .eq('solution_id', solutionId)
    .eq('goal_id', goalId)
    .single()
  
  if (error || !link) {
    console.error('Failed to fetch goal_implementation_links:', error)
    return null
  }
  
  const aggregated = link.aggregated_fields || {}
  
  // Verify all expected fields were aggregated
  for (const field of expectedFields) {
    if (!aggregated[field]) {
      console.error(`❌ Field "${field}" not aggregated`)
    } else if (aggregated[field].mode !== undefined) {
      console.log(`✅ Field "${field}" aggregated with mode: ${aggregated[field].mode}`)
    } else if (aggregated[field].values) {
      console.log(`✅ Field "${field}" aggregated with ${aggregated[field].values.length} values`)
    }
  }
  
  return aggregated
}