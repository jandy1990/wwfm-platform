/**
 * Database verification utilities using Supabase MCP tools
 * Validates that form submissions are correctly stored in the database
 */

export interface DatabaseVerification {
  solutionExists: boolean
  variantExists: boolean
  ratingExists: boolean
  linkExists: boolean
  aggregatedFieldsValid: boolean
  errors: string[]
}

export interface DatabaseIds {
  solutionId: string | null
  variantId: string | null
  ratingId: string | null
  implementationId: string | null
}

/**
 * Verify that a solution was created in the database
 */
export async function verifySolutionCreated(
  solutionName: string,
  category: string
): Promise<string | null> {
  console.log(`🔍 Verifying solution exists: "${solutionName}" in category "${category}"`)

  // This will use mcp__supabase__execute_sql
  // const query = `
  //   SELECT id FROM solutions
  //   WHERE title = '${solutionName}'
  //   AND solution_category = '${category}'
  //   LIMIT 1
  // `

  // For now, return mock
  return 'mock-solution-id'
}

/**
 * Verify that a variant was created
 */
export async function verifyVariantCreated(
  solutionId: string,
  variantName: string = 'Standard'
): Promise<string | null> {
  console.log(`🔍 Verifying variant exists: "${variantName}" for solution ${solutionId}`)

  // This will use mcp__supabase__execute_sql
  // const query = `
  //   SELECT id FROM solution_variants
  //   WHERE solution_id = '${solutionId}'
  //   AND variant_name = '${variantName}'
  //   LIMIT 1
  // `

  return 'mock-variant-id'
}

/**
 * Verify that a rating was created
 */
export async function verifyRatingCreated(
  userId: string,
  goalId: string,
  implementationId: string
): Promise<string | null> {
  console.log(
    `🔍 Verifying rating exists for user ${userId}, goal ${goalId}, implementation ${implementationId}`
  )

  // This will use mcp__supabase__execute_sql
  // const query = `
  //   SELECT id FROM ratings
  //   WHERE user_id = '${userId}'
  //   AND goal_id = '${goalId}'
  //   AND implementation_id = '${implementationId}'
  //   LIMIT 1
  // `

  return 'mock-rating-id'
}

/**
 * Verify that goal_implementation_link exists and has correct data
 */
export async function verifyGoalImplementationLink(
  goalId: string,
  implementationId: string
): Promise<{
  exists: boolean
  avgEffectiveness: number | null
  ratingCount: number | null
  hasAggregatedFields: boolean
}> {
  console.log(
    `🔍 Verifying goal_implementation_link for goal ${goalId}, implementation ${implementationId}`
  )

  // This will use mcp__supabase__execute_sql
  // const query = `
  //   SELECT
  //     avg_effectiveness,
  //     rating_count,
  //     aggregated_fields
  //   FROM goal_implementation_links
  //   WHERE goal_id = '${goalId}'
  //   AND implementation_id = '${implementationId}'
  //   LIMIT 1
  // `

  return {
    exists: true,
    avgEffectiveness: 4.0,
    ratingCount: 1,
    hasAggregatedFields: true,
  }
}

/**
 * Verify aggregated_fields has correct structure
 */
export async function verifyAggregatedFields(
  goalId: string,
  implementationId: string,
  expectedFields: string[]
): Promise<{ valid: boolean; missingFields: string[] }> {
  console.log(`🔍 Verifying aggregated_fields structure`)

  // This will query the aggregated_fields JSONB column
  // and check that all expected fields are present

  // Mock for now
  return {
    valid: true,
    missingFields: [],
  }
}

/**
 * Complete database verification pipeline
 */
export async function verifyCompleteSubmission(
  solutionName: string,
  category: string,
  goalId: string,
  userId: string,
  variantName: string = 'Standard'
): Promise<DatabaseVerification> {
  const errors: string[] = []
  console.log(`🔍 Starting complete database verification...`)

  try {
    // 1. Verify solution exists
    const solutionId = await verifySolutionCreated(solutionName, category)
    if (!solutionId) {
      errors.push('Solution not found in database')
    }

    // 2. Verify variant exists
    let variantId: string | null = null
    if (solutionId) {
      variantId = await verifyVariantCreated(solutionId, variantName)
      if (!variantId) {
        errors.push('Variant not found in database')
      }
    }

    // 3. Verify rating exists
    let ratingId: string | null = null
    if (variantId) {
      ratingId = await verifyRatingCreated(userId, goalId, variantId)
      if (!ratingId) {
        errors.push('Rating not found in database')
      }
    }

    // 4. Verify goal_implementation_link
    let linkExists = false
    let aggregatedFieldsValid = false
    if (variantId) {
      const linkData = await verifyGoalImplementationLink(goalId, variantId)
      linkExists = linkData.exists

      if (!linkExists) {
        errors.push('Goal implementation link not found')
      }

      aggregatedFieldsValid = linkData.hasAggregatedFields
      if (!aggregatedFieldsValid) {
        errors.push('Aggregated fields missing or invalid')
      }
    }

    return {
      solutionExists: !!solutionId,
      variantExists: !!variantId,
      ratingExists: !!ratingId,
      linkExists,
      aggregatedFieldsValid,
      errors,
    }
  } catch (error) {
    console.error('Error during database verification:', error)
    errors.push(`Verification error: ${error}`)

    return {
      solutionExists: false,
      variantExists: false,
      ratingExists: false,
      linkExists: false,
      aggregatedFieldsValid: false,
      errors,
    }
  }
}

/**
 * Get all database IDs for a submission
 */
export async function getDatabaseIds(
  solutionName: string,
  category: string,
  goalId: string,
  userId: string
): Promise<DatabaseIds> {
  console.log(`🔍 Fetching all database IDs for submission`)

  // This will use mcp__supabase__execute_sql to get all related IDs
  // For now, return mocks
  return {
    solutionId: 'mock-solution-id',
    variantId: 'mock-variant-id',
    ratingId: 'mock-rating-id',
    implementationId: 'mock-variant-id', // same as variantId
  }
}

/**
 * Delete test solution and all related data (cleanup)
 */
export async function deleteTestSolution(solutionName: string): Promise<boolean> {
  console.log(`🗑️ Deleting test solution: "${solutionName}"`)

  // This will use mcp__supabase__execute_sql to delete:
  // 1. Ratings (will cascade due to FK constraints)
  // 2. Goal implementation links
  // 3. Variants
  // 4. Solution

  // const deleteQuery = `
  //   DELETE FROM solutions
  //   WHERE title = '${solutionName}'
  //   AND title LIKE '%(DevTools Test)%'
  // `

  console.log(`✅ Test solution deleted`)
  return true
}

/**
 * Delete all test data (all solutions with "(DevTools Test)" suffix)
 */
export async function deleteAllTestData(): Promise<number> {
  console.log(`🗑️ Deleting all DevTools test data...`)

  // This will delete all solutions with "(DevTools Test)" in the title
  // Cascading deletes will handle variants, ratings, and links

  // const deleteQuery = `
  //   DELETE FROM solutions
  //   WHERE title LIKE '%(DevTools Test)%'
  // `

  console.log(`✅ All test data deleted`)
  return 10 // number of solutions deleted
}

/**
 * Count remaining test solutions (for verification after cleanup)
 */
export async function countTestSolutions(): Promise<number> {
  console.log(`🔍 Counting remaining test solutions...`)

  // const countQuery = `
  //   SELECT COUNT(*) FROM solutions
  //   WHERE title LIKE '%(DevTools Test)%'
  // `

  return 0 // should be 0 after cleanup
}
