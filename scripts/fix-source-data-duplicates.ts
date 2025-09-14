#!/usr/bin/env tsx
/**
 * ROOT CAUSE FIX: Eliminate Duplicates in Source Data
 *
 * The AI solution generator created duplicate values in ai_field_distributions.
 * This script fixes the source data by properly consolidating duplicates.
 *
 * Example Fix:
 * BEFORE: [{"name": "Weekly", "percentage": 15}, {"name": "Weekly", "percentage": 5}]
 * AFTER:  [{"name": "Weekly", "percentage": 20}]
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

interface DistributionItem {
  name: string
  percentage: number
}

interface FieldDistribution {
  id: string
  solution_id: string
  goal_id: string
  field_name: string
  distributions: DistributionItem[]
}

/**
 * Consolidate duplicate values in a distribution array
 */
function consolidateDistributionDuplicates(distributions: DistributionItem[]): DistributionItem[] {
  const valueMap = new Map<string, number>()

  // Sum percentages for duplicate values
  for (const item of distributions) {
    const existing = valueMap.get(item.name) || 0
    valueMap.set(item.name, existing + item.percentage)
  }

  // Convert back to array and sort by percentage (highest first)
  const consolidated = Array.from(valueMap.entries())
    .map(([name, percentage]) => ({ name, percentage }))
    .sort((a, b) => b.percentage - a.percentage)

  return consolidated
}

/**
 * Normalize percentages to ensure they sum to 100%
 */
function normalizePercentages(distributions: DistributionItem[]): DistributionItem[] {
  const total = distributions.reduce((sum, item) => sum + item.percentage, 0)

  if (total === 0) return distributions

  // Scale to 100% and round to 1 decimal place
  return distributions.map(item => ({
    name: item.name,
    percentage: Math.round((item.percentage / total) * 100 * 10) / 10
  }))
}

/**
 * Check if a distribution array has duplicates
 */
function hasDuplicates(distributions: DistributionItem[]): boolean {
  const names = distributions.map(item => item.name)
  return names.length !== new Set(names).size
}

/**
 * Fetch all field distributions with duplicates (in batches)
 */
async function fetchDistributionsWithDuplicates(): Promise<FieldDistribution[]> {
  console.log('🔍 Fetching ALL field distributions with duplicates...')

  const batchSize = 1000
  let allWithDuplicates: FieldDistribution[] = []
  let offset = 0
  let totalProcessed = 0

  while (true) {
    const { data: batch, error } = await supabase
      .from('ai_field_distributions')
      .select('id, solution_id, goal_id, field_name, distributions')
      .order('solution_id, goal_id, field_name')
      .range(offset, offset + batchSize - 1)

    if (error) {
      throw new Error(`Failed to fetch distributions: ${error.message}`)
    }

    if (!batch || batch.length === 0) {
      break // No more records
    }

    // Filter for those with duplicates in this batch
    const withDuplicatesInBatch = batch.filter(dist => hasDuplicates(dist.distributions))
    allWithDuplicates.push(...withDuplicatesInBatch)

    totalProcessed += batch.length
    console.log(`📊 Processed ${totalProcessed} records, found ${withDuplicatesInBatch.length} with duplicates in this batch`)

    if (batch.length < batchSize) {
      break // Last batch
    }

    offset += batchSize
  }

  console.log(`📊 TOTAL: Found ${allWithDuplicates.length} field distributions with duplicates out of ${totalProcessed} total`)

  return allWithDuplicates
}

/**
 * Fix duplicates in source data
 */
async function fixSourceDataDuplicates() {
  console.log('🚀 Starting source data duplicate elimination...\n')

  // Step 1: Fetch all problematic distributions
  const problematicDistributions = await fetchDistributionsWithDuplicates()

  if (problematicDistributions.length === 0) {
    console.log('✅ No duplicates found in source data!')
    return
  }

  let fixedCount = 0
  let totalDuplicatesRemoved = 0

  // Step 2: Process each distribution
  for (const dist of problematicDistributions) {
    const originalCount = dist.distributions.length
    const originalDuplicates = originalCount - new Set(dist.distributions.map(d => d.name)).size

    if (originalDuplicates === 0) continue // Skip if no duplicates

    console.log(`[FIX] ${dist.field_name}: ${originalCount} values → removing ${originalDuplicates} duplicates`)

    // Consolidate duplicates
    const consolidated = consolidateDistributionDuplicates(dist.distributions)
    const normalized = normalizePercentages(consolidated)

    // Update in database
    const { error } = await supabase
      .from('ai_field_distributions')
      .update({
        distributions: normalized,
        updated_at: new Date().toISOString()
      })
      .eq('id', dist.id)

    if (error) {
      console.error(`❌ Error updating ${dist.field_name}:`, error.message)
    } else {
      fixedCount++
      totalDuplicatesRemoved += originalDuplicates

      // Log example of fix
      if (fixedCount <= 5) {
        console.log(`   BEFORE: ${JSON.stringify(dist.distributions.slice(0, 3))}...`)
        console.log(`   AFTER:  ${JSON.stringify(normalized.slice(0, 3))}...`)
        console.log('')
      }

      if (fixedCount % 100 === 0) {
        console.log(`✅ Fixed ${fixedCount} distributions...`)
      }
    }
  }

  console.log(`\n🎉 Source data deduplication complete!`)
  console.log(`✅ Fixed ${fixedCount} field distributions`)
  console.log(`📉 Removed ${totalDuplicatesRemoved} total duplicate values`)
  console.log(`\n🔧 Next step: Re-run transfer to propagate clean data to UI layer`)
}

/**
 * Validate that duplicates are eliminated
 */
async function validateNoDuplicatesRemain(): Promise<boolean> {
  console.log('\n🔍 Validating that all duplicates are eliminated...')

  const { data: distributions, error } = await supabase
    .from('ai_field_distributions')
    .select('field_name, distributions')

  if (error) {
    console.error('❌ Validation failed:', error.message)
    return false
  }

  let duplicatesFound = 0
  for (const dist of distributions) {
    if (hasDuplicates(dist.distributions)) {
      duplicatesFound++
      console.log(`❌ Still has duplicates: ${dist.field_name}`)
    }
  }

  if (duplicatesFound === 0) {
    console.log('✅ SUCCESS: Zero duplicates found in source data!')
    return true
  } else {
    console.log(`❌ FAILED: ${duplicatesFound} distributions still have duplicates`)
    return false
  }
}

// Execute if run directly
async function main() {
  try {
    await fixSourceDataDuplicates()
    const success = await validateNoDuplicatesRemain()

    if (success) {
      console.log('\n🚀 Source data is now clean and ready for UI propagation!')
    } else {
      console.log('\n⚠️ Some duplicates remain. May need additional processing.')
    }
  } catch (error) {
    console.error('\n💥 Source data fix failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { fixSourceDataDuplicates, validateNoDuplicatesRemain }