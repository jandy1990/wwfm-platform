#!/usr/bin/env tsx
/**
 * Create Missing Goal Implementation Links
 *
 * This script identifies solution-goal combinations that have ai_field_distributions
 * but no goal_implementation_links, and creates the missing links using default variants.
 *
 * This fixes the 57 missing combinations preventing full data transfer.
 */

import { createClient } from '@supabase/supabase-js'

// Supabase connection
const supabaseUrl = 'https://wqxkhxdbxdtpuvuvgirx.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_KEY not found in environment')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface MissingLink {
  solution_id: string
  goal_id: string
  solution_title: string
  goal_title: string
}

/**
 * Get all solution-goal combinations that have ai_field_distributions but no goal_implementation_links
 */
async function getMissingLinks(): Promise<MissingLink[]> {
  console.log('🔍 Finding solution-goal combinations with ai_field_distributions but no goal_implementation_links...')

  const { data: missing, error } = await supabase.rpc('get_missing_goal_implementation_links')

  if (error) {
    // Fallback to direct query since custom function might not exist
    const query = `
      SELECT DISTINCT
          afd.solution_id,
          afd.goal_id,
          s.title as solution_title,
          g.title as goal_title
      FROM ai_field_distributions afd
      JOIN solutions s ON afd.solution_id = s.id
      JOIN goals g ON afd.goal_id = g.id
      WHERE s.source_type = 'ai_foundation'
      AND NOT EXISTS (
          SELECT 1 FROM goal_implementation_links gil
          JOIN solution_variants sv ON gil.implementation_id = sv.id
          WHERE sv.solution_id = afd.solution_id
          AND gil.goal_id = afd.goal_id
      )
    `

    const { data: directResult, error: directError } = await supabase.rpc('exec_sql', { sql: query })

    if (directError) {
      // Final fallback - use a simpler approach
      console.log('📊 Using alternative query method...')
      return await getMissingLinksAlternative()
    }

    return directResult || []
  }

  return missing || []
}

/**
 * Alternative method to get missing links
 */
async function getMissingLinksAlternative(): Promise<MissingLink[]> {
  // Get all solution-goal combinations with ai_field_distributions
  const { data: withDistributions, error: distError } = await supabase
    .from('ai_field_distributions')
    .select(`
      solution_id,
      goal_id,
      solutions!inner(title, source_type),
      goals!inner(title)
    `)
    .eq('solutions.source_type', 'ai_foundation')

  if (distError) {
    throw new Error(`Failed to get distributions: ${distError.message}`)
  }

  // Get all existing goal_implementation_links
  const { data: existingLinks, error: linkError } = await supabase
    .from('goal_implementation_links')
    .select(`
      goal_id,
      solution_variants!inner(solution_id)
    `)

  if (linkError) {
    throw new Error(`Failed to get existing links: ${linkError.message}`)
  }

  // Find combinations that exist in distributions but not in links
  const existing = new Set(
    existingLinks.map(link => `${link.solution_variants.solution_id}-${link.goal_id}`)
  )

  const missing = withDistributions
    .filter(dist => !existing.has(`${dist.solution_id}-${dist.goal_id}`))
    .map(dist => ({
      solution_id: dist.solution_id,
      goal_id: dist.goal_id,
      solution_title: dist.solutions.title,
      goal_title: dist.goals.title
    }))

  // Remove duplicates
  const uniqueMissing = missing.filter((item, index, arr) =>
    index === arr.findIndex(t => t.solution_id === item.solution_id && t.goal_id === item.goal_id)
  )

  return uniqueMissing
}

/**
 * Get default variant for each solution
 */
async function getDefaultVariants(solutionIds: string[]): Promise<Map<string, string>> {
  console.log('🔗 Getting default variants for solutions...')

  const variantMap = new Map<string, string>()

  // Process in batches
  const batchSize = 50
  for (let i = 0; i < solutionIds.length; i += batchSize) {
    const batch = solutionIds.slice(i, i + batchSize)

    const { data: variants, error } = await supabase
      .from('solution_variants')
      .select('id, solution_id, is_default')
      .in('solution_id', batch)
      .order('is_default', { ascending: false }) // Default variants first
      .order('created_at', { ascending: true })   // Then oldest first

    if (error) {
      throw new Error(`Failed to get variants: ${error.message}`)
    }

    // For each solution, pick the first variant (default if available, otherwise oldest)
    for (const solutionId of batch) {
      const solutionVariants = variants.filter(v => v.solution_id === solutionId)
      if (solutionVariants.length > 0) {
        variantMap.set(solutionId, solutionVariants[0].id)
      }
    }
  }

  console.log(`✅ Found variants for ${variantMap.size} solutions`)
  return variantMap
}

/**
 * Create goal_implementation_links for missing combinations
 */
async function createMissingLinks(missing: MissingLink[], variantMap: Map<string, string>): Promise<void> {
  console.log('🔨 Creating missing goal_implementation_links...')

  let successCount = 0
  let errorCount = 0

  for (const link of missing) {
    const variantId = variantMap.get(link.solution_id)

    if (!variantId) {
      console.warn(`⚠️  No variant found for solution: ${link.solution_title}`)
      errorCount++
      continue
    }

    try {
      const { error } = await supabase
        .from('goal_implementation_links')
        .insert({
          goal_id: link.goal_id,
          implementation_id: variantId,
          avg_effectiveness: 0.00,
          rating_count: 0,
          aggregated_fields: {}, // Will be populated by transfer script
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error(`❌ Error creating link for ${link.solution_title} → ${link.goal_title}:`, error.message)
        errorCount++
      } else {
        successCount++
        if (successCount % 10 === 0) {
          console.log(`✅ Created ${successCount} links...`)
        }
      }
    } catch (err) {
      console.error(`❌ Exception creating link for ${link.solution_title} → ${link.goal_title}:`, err)
      errorCount++
    }
  }

  console.log(`\n🎉 Link creation complete!`)
  console.log(`✅ Successfully created: ${successCount} links`)
  console.log(`❌ Errors: ${errorCount} links`)
}

/**
 * Main execution function
 */
async function createMissingGoalImplementationLinks() {
  try {
    console.log('🚀 Starting goal_implementation_links creation...\n')

    // Step 1: Find missing combinations
    const missing = await getMissingLinks()
    console.log(`📋 Found ${missing.length} missing goal_implementation_links`)

    if (missing.length === 0) {
      console.log('✨ No missing links found - all combinations already exist!')
      return
    }

    // Step 2: Get default variants for all solutions
    const solutionIds = [...new Set(missing.map(m => m.solution_id))]
    const variantMap = await getDefaultVariants(solutionIds)

    // Step 3: Create missing links
    await createMissingLinks(missing, variantMap)

    console.log('\n🏁 Goal implementation links creation completed!')
    console.log('🎯 Transfer script can now process all solution-goal combinations')

  } catch (error) {
    console.error('\n💥 Creation failed:', error)
    process.exit(1)
  }
}

// Execute if run directly
if (require.main === module) {
  createMissingGoalImplementationLinks()
}

export { createMissingGoalImplementationLinks }