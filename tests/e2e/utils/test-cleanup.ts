/**
 * Test Cleanup Utilities
 * 
 * Cleans up test data between runs to allow repeated testing
 * while preserving the test fixtures themselves
 */

import { getTestSupabase } from './test-helpers'

/**
 * Clear all test user ratings for test fixtures
 * This allows the same test solutions to be rated again
 */
export async function clearTestRatings(goalId: string = process.env.TEST_GOAL_ID!) {
  const supabase = getTestSupabase()
  
  console.log('🧹 Clearing test ratings for goal:', goalId)
  
  // First, get all test fixture variant IDs
  const { data: testVariants } = await supabase
    .from('solution_variants')
    .select('id, solution_id')
    .in('solution_id', 
      supabase
        .from('solutions')
        .select('id')
        .eq('source_type', 'test_fixture')
    )
  
  if (!testVariants || testVariants.length === 0) {
    console.log('No test fixtures found')
    return
  }
  
  const variantIds = testVariants.map(v => v.id)
  
  // Delete from goal_implementation_links
  const { error: linkError, count: linkCount } = await supabase
    .from('goal_implementation_links')
    .delete()
    .eq('goal_id', goalId)
    .in('implementation_id', variantIds)
  
  if (linkError) {
    console.error('Error clearing goal_implementation_links:', linkError)
  } else {
    console.log(`✅ Cleared ${linkCount || 0} goal_implementation_links`)
  }
  
  // Delete from ratings table
  const { error: ratingError, count: ratingCount } = await supabase
    .from('ratings')
    .delete()
    .eq('goal_id', goalId)
    .in('solution_variant_id', variantIds)
  
  if (ratingError) {
    console.error('Error clearing ratings:', ratingError)
  } else {
    console.log(`✅ Cleared ${ratingCount || 0} ratings`)
  }
  
  return { linksCleared: linkCount || 0, ratingsCleared: ratingCount || 0 }
}

/**
 * Clear test ratings for a specific solution
 */
export async function clearTestRatingsForSolution(
  solutionTitle: string, 
  goalId: string = process.env.TEST_GOAL_ID!
) {
  const supabase = getTestSupabase()
  
  // Find the solution
  const { data: solution } = await supabase
    .from('solutions')
    .select('id')
    .eq('title', solutionTitle)
    .single()
  
  if (!solution) {
    console.log(`Solution "${solutionTitle}" not found`)
    return
  }
  
  // Find its variants
  const { data: variants } = await supabase
    .from('solution_variants')
    .select('id')
    .eq('solution_id', solution.id)
  
  if (!variants || variants.length === 0) {
    console.log('No variants found for solution')
    return
  }
  
  const variantIds = variants.map(v => v.id)
  
  // Delete goal_implementation_links
  await supabase
    .from('goal_implementation_links')
    .delete()
    .eq('goal_id', goalId)
    .in('implementation_id', variantIds)
  
  // Delete ratings
  await supabase
    .from('ratings')
    .delete()
    .eq('goal_id', goalId)
    .in('solution_variant_id', variantIds)
  
  console.log(`✅ Cleared ratings for "${solutionTitle}"`)
}

/**
 * Setup function to run before each test suite
 */
export async function setupTestEnvironment() {
  // Clear all test ratings before starting tests
  await clearTestRatings()
  console.log('✅ Test environment ready')
}

/**
 * Verify data was actually saved to Supabase
 */
export async function verifyDataInSupabase(
  solutionTitle: string,
  goalId: string = process.env.TEST_GOAL_ID!
) {
  const supabase = getTestSupabase()
  
  // Find the solution
  const { data: solution } = await supabase
    .from('solutions')
    .select('id, title')
    .eq('title', solutionTitle)
    .single()
  
  if (!solution) {
    return { success: false, error: 'Solution not found' }
  }
  
  // Find variants
  const { data: variants } = await supabase
    .from('solution_variants')
    .select('id, variant_name')
    .eq('solution_id', solution.id)
  
  if (!variants || variants.length === 0) {
    return { success: false, error: 'No variants found' }
  }
  
  // Check goal_implementation_links
  const { data: links } = await supabase
    .from('goal_implementation_links')
    .select('*')
    .eq('goal_id', goalId)
    .in('implementation_id', variants.map(v => v.id))
  
  // Check ratings
  const { data: ratings } = await supabase
    .from('ratings')
    .select('*')
    .eq('goal_id', goalId)
    .in('solution_variant_id', variants.map(v => v.id))
  
  return {
    success: true,
    solution,
    variants,
    links: links || [],
    ratings: ratings || [],
    summary: {
      hasLinks: (links?.length || 0) > 0,
      hasRatings: (ratings?.length || 0) > 0,
      linkCount: links?.length || 0,
      ratingCount: ratings?.length || 0
    }
  }
}