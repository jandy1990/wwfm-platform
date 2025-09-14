#!/usr/bin/env tsx
/**
 * Transfer AI Distribution Data to Aggregated Fields
 *
 * This script transfers the properly mapped distribution data from ai_field_distributions
 * to goal_implementation_links.aggregated_fields for AI solutions.
 *
 * This fixes the UI display issue where users see unmapped values like
 * "Online and in-person meetings, online tools" instead of proper dropdown values.
 */

import { createClient } from '@supabase/supabase-js'
import { mapToDropdownValue } from './ai-solution-generator/utils/value-mapper.js'

// Supabase connection
const supabaseUrl = 'https://wqxkhxdbxdtpuvuvgirx.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_KEY not found in environment')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface DistributionItem {
  name: string
  percentage: number
}

interface AggregatedFieldValue {
  value: string
  percentage: number
  count: number
}

interface AggregatedField {
  mode: string
  values: AggregatedFieldValue[]
  totalReports: number
}

interface SolutionDistributions {
  solution_id: string
  goal_id: string
  variant_id: string
  category: string
  fields: Record<string, DistributionItem[]>
}

/**
 * Transform distribution format to aggregated format with value mapping
 */
function transformDistributionToAggregated(
  distributions: DistributionItem[],
  fieldName: string,
  category: string
): AggregatedField {
  if (!distributions || distributions.length === 0) {
    return {
      mode: '',
      values: [],
      totalReports: 0
    }
  }

  // Apply value mapping and consolidate duplicates that may result from mapping
  const mappedValues = new Map<string, number>()

  for (const item of distributions) {
    try {
      // Map raw AI value to proper dropdown value
      const mappedValue = mapToDropdownValue(fieldName, item.name, category)
      const existing = mappedValues.get(mappedValue) || 0
      mappedValues.set(mappedValue, existing + item.percentage)
    } catch (error) {
      // If mapping fails, use original value
      const existing = mappedValues.get(item.name) || 0
      mappedValues.set(item.name, existing + item.percentage)
    }
  }

  // Convert back to array and sort by percentage
  const consolidatedDistributions = Array.from(mappedValues.entries())
    .map(([name, percentage]) => ({ name, percentage }))
    .sort((a, b) => b.percentage - a.percentage)

  // Find the mode (highest percentage after mapping)
  const mode = consolidatedDistributions[0]?.name || ''

  // Transform to aggregated format
  const values: AggregatedFieldValue[] = consolidatedDistributions.map(item => ({
    value: item.name,
    percentage: Math.round(item.percentage * 10) / 10, // Round to 1 decimal place
    count: 1 // AI data represents 1 "report" per distribution
  }))

  return {
    mode,
    values,
    totalReports: 1 // AI solutions count as 1 report
  }
}

/**
 * Fetch all AI field distributions grouped by solution and goal
 */
async function fetchAIDistributions(): Promise<SolutionDistributions[]> {
  console.log('📊 Fetching AI field distributions...')

  // Fetch all records in batches to avoid limits
  const batchSize = 1000
  let allDistributions: any[] = []
  let offset = 0

  while (true) {
    const { data: batch, error } = await supabase
      .from('ai_field_distributions')
      .select(`
        solution_id,
        goal_id,
        field_name,
        distributions,
        solutions!solution_id (
          solution_category
        )
      `)
      .order('solution_id, goal_id, field_name')
      .range(offset, offset + batchSize - 1)

    if (error) {
      throw new Error(`Failed to fetch distributions: ${error.message}`)
    }

    if (!batch || batch.length === 0) {
      break
    }

    allDistributions.push(...batch)
    console.log(`📊 Fetched ${allDistributions.length} distribution records...`)

    if (batch.length < batchSize) {
      break
    }

    offset += batchSize
  }

  const distributions = allDistributions

  console.log(`📋 Found ${distributions.length} field distribution records`)

  // Group by solution_id and goal_id
  const grouped = new Map<string, SolutionDistributions>()

  for (const dist of distributions) {
    const key = `${dist.solution_id}-${dist.goal_id}`
    const category = dist.solutions?.solution_category || 'unknown'

    if (!grouped.has(key)) {
      grouped.set(key, {
        solution_id: dist.solution_id,
        goal_id: dist.goal_id,
        variant_id: '', // Will be filled later
        category: category,
        fields: {}
      })
    }

    const group = grouped.get(key)!
    group.fields[dist.field_name] = dist.distributions
  }

  console.log(`🎯 Grouped into ${grouped.size} solution-goal combinations`)
  return Array.from(grouped.values())
}

/**
 * Get the variant IDs for AI solutions (in batches)
 */
async function enrichWithVariantIds(solutionDistributions: SolutionDistributions[]): Promise<SolutionDistributions[]> {
  console.log('🔗 Getting variant IDs for AI solutions...')

  // Get all unique solution IDs
  const solutionIds = [...new Set(solutionDistributions.map(sd => sd.solution_id))]
  console.log(`🔍 Found ${solutionIds.length} unique solution IDs`)

  // Fetch variants in batches to avoid URI too large error
  const batchSize = 100
  const variantMap = new Map<string, string>()
  let totalFetched = 0

  for (let i = 0; i < solutionIds.length; i += batchSize) {
    const batch = solutionIds.slice(i, i + batchSize)

    const { data: variants, error } = await supabase
      .from('solution_variants')
      .select('id, solution_id')
      .in('solution_id', batch)

    if (error) {
      throw new Error(`Failed to fetch variants: ${error.message}`)
    }

    // Add to mapping
    variants.forEach(variant => {
      variantMap.set(variant.solution_id, variant.id)
    })

    totalFetched += variants.length
    console.log(`📦 Fetched ${totalFetched} variants...`)
  }

  // Enrich the data
  const enriched = solutionDistributions.map(sd => ({
    ...sd,
    variant_id: variantMap.get(sd.solution_id) || ''
  })).filter(sd => sd.variant_id) // Only keep those with valid variant IDs

  console.log(`✅ Enriched ${enriched.length} solution distributions with variant IDs`)
  return enriched
}

/**
 * Update goal_implementation_links with transformed aggregated_fields
 */
async function updateAggregatedFields(solutionDistributions: SolutionDistributions[]): Promise<void> {
  console.log('🔄 Updating aggregated_fields...')

  let successCount = 0
  let errorCount = 0

  for (const sd of solutionDistributions) {
    try {
      // Transform all fields to aggregated format with proper value mapping
      const aggregatedFields: Record<string, AggregatedField> = {}

      for (const [fieldName, distributions] of Object.entries(sd.fields)) {
        aggregatedFields[fieldName] = transformDistributionToAggregated(
          distributions,
          fieldName,
          sd.category
        )
      }

      // Add metadata
      aggregatedFields._metadata = {
        computed_at: new Date().toISOString(),
        data_source: 'ai_foundation',
        user_ratings: 0,
        ai_enhanced: true,
        confidence: 'high',
        value_mapped: true,
        mapping_version: 'v2_with_deduplication'
      } as any

      // Update the goal_implementation_link
      const { error } = await supabase
        .from('goal_implementation_links')
        .update({ aggregated_fields: aggregatedFields })
        .eq('implementation_id', sd.variant_id)
        .eq('goal_id', sd.goal_id)

      if (error) {
        console.error(`❌ Error updating ${sd.solution_id}-${sd.goal_id}:`, error.message)
        errorCount++
      } else {
        successCount++
        if (successCount % 100 === 0) {
          console.log(`✅ Updated ${successCount} records...`)
        }
      }
    } catch (err) {
      console.error(`❌ Error processing ${sd.solution_id}-${sd.goal_id}:`, err)
      errorCount++
    }
  }

  console.log(`\n🎉 Transfer complete!`)
  console.log(`✅ Successfully updated: ${successCount} records`)
  console.log(`❌ Errors: ${errorCount} records`)
}

/**
 * Main execution function
 */
async function transferAIDistributions() {
  try {
    console.log('🚀 Starting AI distribution transfer...\n')

    // Step 1: Fetch all AI distributions
    const distributions = await fetchAIDistributions()

    // Step 2: Enrich with variant IDs
    const enrichedDistributions = await enrichWithVariantIds(distributions)

    // Step 3: Update aggregated_fields
    await updateAggregatedFields(enrichedDistributions)

    console.log('\n🏁 Transfer completed successfully!')
    console.log('🎯 UI should now display proper dropdown values for AI solutions')

  } catch (error) {
    console.error('\n💥 Transfer failed:', error)
    process.exit(1)
  }
}

// Execute if run directly
if (require.main === module) {
  transferAIDistributions()
}

export { transferAIDistributions }