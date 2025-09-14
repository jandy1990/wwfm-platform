#!/usr/bin/env tsx
/**
 * CRITICAL FIX: Remove Duplicate Values in Aggregated Fields
 *
 * The comprehensive fix created duplicate entries in the aggregated_fields.
 * This script consolidates duplicate values by merging their percentages and counts.
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

/**
 * Consolidate duplicate values in an aggregated field
 */
function consolidateDuplicateValues(field: AggregatedField): AggregatedField {
  const valueMap = new Map<string, { percentage: number, count: number }>()

  // Combine duplicate values
  for (const valueItem of field.values) {
    const existing = valueMap.get(valueItem.value)
    if (existing) {
      // Merge duplicates by averaging percentages and summing counts
      existing.percentage = (existing.percentage + valueItem.percentage) / 2
      existing.count += valueItem.count
    } else {
      valueMap.set(valueItem.value, {
        percentage: valueItem.percentage,
        count: valueItem.count
      })
    }
  }

  // Convert back to array and sort by percentage
  const consolidatedValues = Array.from(valueMap.entries())
    .map(([value, data]) => ({
      value,
      percentage: data.percentage,
      count: data.count
    }))
    .sort((a, b) => b.percentage - a.percentage)

  // Update mode to the highest percentage value
  const newMode = consolidatedValues[0]?.value || field.mode

  return {
    mode: newMode,
    values: consolidatedValues,
    totalReports: field.totalReports
  }
}

/**
 * Fix duplicates in a solution's aggregated fields
 */
function fixSolutionDuplicates(aggregatedFields: Record<string, AggregatedField>): {
  fields: Record<string, AggregatedField>,
  duplicatesFound: number
} {
  const fixedFields: Record<string, AggregatedField> = {}
  let duplicatesFound = 0

  for (const [fieldName, fieldData] of Object.entries(aggregatedFields)) {
    if (fieldName === '_metadata') {
      fixedFields[fieldName] = fieldData
      continue
    }

    // Check if there are duplicates in this field
    const valueCount = new Map<string, number>()
    for (const valueItem of fieldData.values || []) {
      valueCount.set(valueItem.value, (valueCount.get(valueItem.value) || 0) + 1)
    }

    const hasDuplicates = Array.from(valueCount.values()).some(count => count > 1)

    if (hasDuplicates) {
      duplicatesFound += Array.from(valueCount.values()).reduce((sum, count) => sum + Math.max(0, count - 1), 0)
      fixedFields[fieldName] = consolidateDuplicateValues(fieldData)
    } else {
      fixedFields[fieldName] = fieldData
    }
  }

  return { fields: fixedFields, duplicatesFound }
}

/**
 * Process all AI solutions to remove duplicates
 */
async function fixAllDuplicates() {
  console.log('🚀 Starting duplicate value cleanup...\n')

  // Get all AI solutions with aggregated fields
  const { data: solutions, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      implementation_id,
      goal_id,
      aggregated_fields,
      solution_variants!implementation_id (
        id,
        solution_id,
        solutions (
          id,
          solution_category,
          source_type
        )
      )
    `)
    .eq('solution_variants.solutions.source_type', 'ai_foundation')
    .not('aggregated_fields', 'is', null)

  if (error) {
    throw new Error(`Failed to fetch solutions: ${error.message}`)
  }

  console.log(`📊 Processing ${solutions.length} AI solutions for duplicate cleanup...`)

  let solutionsFixed = 0
  let totalDuplicatesRemoved = 0

  for (const solution of solutions) {
    if (!solution.solution_variants?.solutions) continue

    const category = solution.solution_variants.solutions.solution_category
    const { fields: fixedFields, duplicatesFound } = fixSolutionDuplicates(solution.aggregated_fields)

    if (duplicatesFound > 0) {
      console.log(`[DEDUP] ${category} solution: removed ${duplicatesFound} duplicates`)

      // Update metadata
      if (fixedFields._metadata) {
        fixedFields._metadata.deduped_at = new Date().toISOString()
        fixedFields._metadata.duplicates_removed = duplicatesFound
      }

      // Update in database
      const { error: updateError } = await supabase
        .from('goal_implementation_links')
        .update({ aggregated_fields: fixedFields })
        .eq('implementation_id', solution.implementation_id)
        .eq('goal_id', solution.goal_id)

      if (updateError) {
        console.error(`❌ Error updating solution:`, updateError.message)
      } else {
        solutionsFixed++
        totalDuplicatesRemoved += duplicatesFound

        if (solutionsFixed % 100 === 0) {
          console.log(`✅ Processed ${solutionsFixed} solutions...`)
        }
      }
    }
  }

  console.log(`\n🎉 Deduplication complete!`)
  console.log(`🔧 Fixed ${solutionsFixed} solutions`)
  console.log(`📉 Removed ${totalDuplicatesRemoved} total duplicate values`)
  console.log(`\n✅ UI should now show clean, single instances of each dropdown value`)
}

// Execute if run directly
if (require.main === module) {
  fixAllDuplicates()
}

export { fixAllDuplicates }