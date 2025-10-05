/**
 * Test Cleanup Utilities
 * 
 * Cleans up test data between runs to allow repeated testing
 * while preserving the test fixtures themselves
 */

import { getTestSupabase } from './test-helpers'
import { createClient } from '@supabase/supabase-js'

/**
 * Get admin client that bypasses RLS completely
 */
function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY
  
  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_KEY in environment')
  }
  
  // Create admin client with explicit RLS bypass
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    }
  })
}

/**
 * Clear all test user ratings for test fixtures
 * This allows the same test solutions to be rated again
 */
export async function clearTestRatings(goalId: string = process.env.TEST_GOAL_ID!) {
  const supabase = getAdminSupabase()

  console.log('🧹 Clearing test ratings for goal:', goalId)

  const { data: fixtureSolutions, error: fixtureError } = await supabase
    .from('solutions')
    .select('id')
    .eq('source_type', 'test_fixture')

  if (fixtureError) {
    console.error('Error fetching test fixtures:', fixtureError.message)
    return { linksCleared: 0, ratingsCleared: 0 }
  }

  if (!fixtureSolutions || fixtureSolutions.length === 0) {
    console.log('No test fixtures found')
    return { linksCleared: 0, ratingsCleared: 0 }
  }

  const solutionIds = fixtureSolutions.map(s => s.id)

  const { data: variants, error: variantError } = await supabase
    .from('solution_variants')
    .select('id')
    .in('solution_id', solutionIds)

  if (variantError) {
    console.error('Error fetching fixture variants:', variantError.message)
    return { linksCleared: 0, ratingsCleared: 0 }
  }

  if (!variants || variants.length === 0) {
    console.log('No fixture variants found')
    return { linksCleared: 0, ratingsCleared: 0 }
  }

  const variantIds = variants.map(v => v.id)

  const { data: ratingRows } = await supabase
    .from('ratings')
    .select('id')
    .eq('goal_id', goalId)
    .in('implementation_id', variantIds)

  if (ratingRows && ratingRows.length > 0) {
    const ratingIds = ratingRows.map(r => r.id)

    await supabase
      .from('retrospective_schedules')
      .delete()
      .in('rating_id', ratingIds)

    await supabase
      .from('goal_retrospectives')
      .delete()
      .in('rating_id', ratingIds)
  }

  const { data: deletedLinks, error: linkError } = await supabase
    .from('goal_implementation_links')
    .delete()
    .eq('goal_id', goalId)
    .in('implementation_id', variantIds)
    .select('id')

  if (linkError) {
    console.error('Error clearing goal_implementation_links:', linkError.message)
  } else {
    console.log(`✅ Cleared ${deletedLinks?.length || 0} goal_implementation_links`)
  }

  const { data: deletedRatings, error: ratingError } = await supabase
    .from('ratings')
    .delete()
    .eq('goal_id', goalId)
    .in('implementation_id', variantIds)
    .select('id')

  if (ratingError) {
    console.error('Error clearing ratings:', ratingError.message)
  } else {
    console.log(`✅ Cleared ${deletedRatings?.length || 0} ratings`)
  }

  return {
    linksCleared: deletedLinks?.length || 0,
    ratingsCleared: deletedRatings?.length || 0
  }
}

/**
 * Clear test ratings for a specific solution - uses admin client
 */
export async function clearTestRatingsForSolution(
  solutionTitle: string, 
  goalId: string = process.env.TEST_GOAL_ID!
) {
  // Use admin client to bypass RLS
  const supabase = getAdminSupabase()
  
  console.log(`🧹 Clearing ratings for solution: "${solutionTitle}" on goal: ${goalId}`)
  
  // Find the solution
  const { data: solution, error: solutionError } = await supabase
    .from('solutions')
    .select('id, source_type')
    .eq('title', solutionTitle)
    .single()
  
  if (solutionError || !solution) {
    console.log(`Solution "${solutionTitle}" not found - may be first run`)
    return { linksDeleted: 0, ratingsDeleted: 0 }
  }
  
  // Never delete test fixtures themselves
  if (solution.source_type === 'test_fixture') {
    console.log(`✅ "${solutionTitle}" is a test fixture - will only clear ratings, not the solution`)
  }
  
  // Find its variants
  const { data: variants, error: variantError } = await supabase
    .from('solution_variants')
    .select('id')
    .eq('solution_id', solution.id)
  
  if (variantError || !variants || variants.length === 0) {
    console.log('No variants found for solution')
    return { linksDeleted: 0, ratingsDeleted: 0 }
  }
  
  const variantIds = variants.map(v => v.id)
  console.log(`Found ${variantIds.length} variants to clean for "${solutionTitle}"`)

  // First, find all ratings that need to be deleted
  const { data: ratingsToDelete } = await supabase
    .from('ratings')
    .select('id')
    .eq('goal_id', goalId)
    .in('implementation_id', variantIds)

  let deletedRetrospectives = 0
  if (ratingsToDelete && ratingsToDelete.length > 0) {
    const ratingIds = ratingsToDelete.map(r => r.id)

    // Delete retrospective_schedules first (they reference ratings)
    const { data: deletedSchedulesData, error: schedulesError } = await supabase
      .from('retrospective_schedules')
      .delete()
      .in('rating_id', ratingIds)
      .select()

    let deletedSchedules = 0
    if (schedulesError) {
      console.error('Error deleting retrospective_schedules:', schedulesError.message)
    } else {
      deletedSchedules = deletedSchedulesData?.length || 0
      if (deletedSchedules > 0) {
        console.log(`✅ Deleted ${deletedSchedules} retrospective_schedules`)
      }
    }

    // Delete goal_retrospectives (they also reference ratings)
    const { data: deletedRetroData, error: retroError } = await supabase
      .from('goal_retrospectives')
      .delete()
      .in('rating_id', ratingIds)
      .select()

    if (retroError) {
      console.error('Error deleting goal_retrospectives:', retroError.message)
    } else {
      deletedRetrospectives = deletedRetroData?.length || 0
      if (deletedRetrospectives > 0) {
        console.log(`✅ Deleted ${deletedRetrospectives} goal_retrospectives`)
      }
    }
  }

  // First, clear aggregated_fields to prevent contamination (before deleting links)
  const { error: clearFieldsError } = await supabase
    .from('goal_implementation_links')
    .update({ aggregated_fields: {} })
    .eq('goal_id', goalId)
    .in('implementation_id', variantIds)

  if (clearFieldsError) {
    console.error('Error clearing aggregated_fields:', clearFieldsError.message)
  } else {
    console.log(`✅ Cleared aggregated_fields for "${solutionTitle}"`)
  }

  // Delete goal_implementation_links - get count of deleted rows
  const { data: deletedLinks, error: linkError } = await supabase
    .from('goal_implementation_links')
    .delete()
    .eq('goal_id', goalId)
    .in('implementation_id', variantIds)
    .select()

  if (linkError) {
    console.error('Error deleting goal_implementation_links:', linkError.message)
  }

  // Delete ratings - using implementation_id field (not solution_variant_id)
  const { data: deletedRatings, error: ratingError } = await supabase
    .from('ratings')
    .delete()
    .eq('goal_id', goalId)
    .in('implementation_id', variantIds)
    .select()
  
  if (ratingError) {
    console.error('Error deleting ratings:', ratingError.message)
  }
  
  const linksDeleted = deletedLinks?.length || 0
  const ratingsDeleted = deletedRatings?.length || 0
  
  if (linksDeleted > 0 || ratingsDeleted > 0) {
    console.log(`✅ Cleared for "${solutionTitle}": ${ratingsDeleted} ratings, ${linksDeleted} links`)
  }
  
  return { linksDeleted, ratingsDeleted }
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
 * Aggressive cleanup for a specific solution - deletes everything
 */
export async function aggressiveCleanupForSolution(
  solutionTitle: string,
  goalId: string = process.env.TEST_GOAL_ID!
) {
  const supabase = getAdminSupabase()

  console.log(`🔥 Aggressive cleanup for "${solutionTitle}" (goal ${goalId})`)

  const { data: solutions, error: searchError } = await supabase
    .from('solutions')
    .select('id, source_type')
    .eq('title', solutionTitle)

  if (searchError || !solutions || solutions.length === 0) {
    console.log('No solutions found to clean')
    return { success: true, message: 'No solutions found' }
  }

  for (const solution of solutions) {
    const { data: variants } = await supabase
      .from('solution_variants')
      .select('id')
      .eq('solution_id', solution.id)

    if (!variants || variants.length === 0) {
      continue
    }

    const variantIds = variants.map(v => v.id)

    const { data: goalLinks } = await supabase
      .from('goal_implementation_links')
      .select('id, implementation_id')
      .eq('goal_id', goalId)
      .in('implementation_id', variantIds)

    if (!goalLinks || goalLinks.length === 0) {
      continue
    }

    const linkedVariantIds = goalLinks.map(link => link.implementation_id)

    const { data: ratingRows } = await supabase
      .from('ratings')
      .select('id')
      .eq('goal_id', goalId)
      .in('implementation_id', linkedVariantIds)

    if (ratingRows && ratingRows.length > 0) {
      const ratingIds = ratingRows.map(r => r.id)

      await supabase
        .from('retrospective_schedules')
        .delete()
        .in('rating_id', ratingIds)

      await supabase
        .from('goal_retrospectives')
        .delete()
        .in('rating_id', ratingIds)

      await supabase
        .from('ratings')
        .delete()
        .in('id', ratingIds)
    }

    await supabase
      .from('goal_implementation_links')
      .delete()
      .eq('goal_id', goalId)
      .in('implementation_id', linkedVariantIds)

    for (const variantId of linkedVariantIds) {
      const { data: remainingLinks } = await supabase
        .from('goal_implementation_links')
        .select('id')
        .eq('implementation_id', variantId)
        .limit(1)

      if (!remainingLinks || remainingLinks.length === 0) {
        await supabase
          .from('solution_variants')
          .delete()
          .eq('id', variantId)
      }
    }

    const { data: remainingVariants } = await supabase
      .from('solution_variants')
      .select('id')
      .eq('solution_id', solution.id)
      .limit(1)

    if ((!remainingVariants || remainingVariants.length === 0) && solution.source_type !== 'test_fixture') {
      await supabase
        .from('solutions')
        .delete()
        .eq('id', solution.id)
    }
  }

  return { success: true, message: 'Aggressive cleanup complete' }
}

/**
 * Verify data was actually saved to Supabase
 */
export async function verifyDataInSupabase(
  solutionTitle: string,
  goalId: string = process.env.TEST_GOAL_ID!
) {
  const supabase = getTestSupabase()
  
  console.log(`🔍 Verifying solution "${solutionTitle}" for goal ${goalId}`)
  
  // Find the solution - it might be user_generated and not approved yet
  // First try exact match
  let { data: solution, error: solutionError } = await supabase
    .from('solutions')
    .select('id, title, source_type, is_approved, solution_category')
    .eq('title', solutionTitle)
    .single()
  
  // If not found, try with LIKE for partial matches
  if (solutionError && solutionError.code === 'PGRST116') {
    const { data: solutions } = await supabase
      .from('solutions')
      .select('id, title, source_type, is_approved, solution_category')
      .ilike('title', `${solutionTitle}%`)
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (solutions && solutions.length > 0) {
      solution = solutions[0]
      solutionError = null
      console.log(`Found solution with similar title: "${solution.title}"`)
    }
  }
  
  if (solutionError || !solution) {
    console.log('❌ Solution not found:', solutionError?.message)
    return { success: false, error: 'Solution not found' }
  }
  
  console.log('✅ Found solution:', { 
    id: solution.id, 
    source_type: solution.source_type,
    is_approved: solution.is_approved 
  })
  
  // Find variants
  const { data: variants, error: variantError } = await supabase
    .from('solution_variants')
    .select('id, variant_name, solution_id')
    .eq('solution_id', solution.id)
  
  if (variantError || !variants || variants.length === 0) {
    console.log('❌ No variants found:', variantError?.message)
    return { success: false, error: 'No variants found' }
  }
  
  console.log(`✅ Found ${variants.length} variant(s):`, variants.map(v => v.variant_name))
  
  // Check goal_implementation_links
  const { data: links, error: linkError } = await supabase
    .from('goal_implementation_links')
    .select('*')
    .eq('goal_id', goalId)
    .in('implementation_id', variants.map(v => v.id))
  
  if (linkError) {
    console.log('⚠️ Error checking links:', linkError.message)
  }
  
  // Check ratings - the new field name is implementation_id, not solution_variant_id
  const { data: ratings, error: ratingError } = await supabase
    .from('ratings')
    .select('*')
    .eq('goal_id', goalId)
    .in('implementation_id', variants.map(v => v.id))
  
  if (ratingError) {
    console.log('⚠️ Error checking ratings:', ratingError.message)
  }
  
  const hasLinks = (links?.length || 0) > 0
  const hasRatings = (ratings?.length || 0) > 0
  
  console.log(`📊 Data verification summary:`)
  console.log(`   - Links: ${links?.length || 0} (${hasLinks ? '✅' : '❌'})`)
  console.log(`   - Ratings: ${ratings?.length || 0} (${hasRatings ? '✅' : '❌'})`)
  
  // For server action submissions, we expect:
  // 1. Solution exists (any source_type)
  // 2. At least one variant exists
  // 3. At least one link exists
  // 4. At least one rating exists
  const success = solution && variants.length > 0 && hasLinks && hasRatings
  
  return {
    success,
    solution,
    variants,
    links: links || [],
    ratings: ratings || [],
    summary: {
      hasLinks,
      hasRatings,
      linkCount: links?.length || 0,
      ratingCount: ratings?.length || 0
    },
    error: success ? undefined : `Missing data: solution=${!!solution}, variants=${variants.length}, links=${hasLinks}, ratings=${hasRatings}`
  }
}
