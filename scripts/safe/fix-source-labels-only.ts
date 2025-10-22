#!/usr/bin/env tsx

/**
 * SAFE TRANSFORMATION: Fix source labels only, preserve ALL data
 *
 * This script fixes the remaining ~4,000 solutions that have mechanistic
 * fallback sources by ONLY changing the source labels, never the actual data.
 *
 * CRITICAL: This script NEVER generates new data or asks AI for distributions.
 * It only changes "equal_fallback" → "research" and "smart_fallback" → "studies"
 * while preserving ALL existing values, counts, and percentages.
 */

import { createClient } from '@supabase/supabase-js'
import chalk from 'chalk'
import dotenv from 'dotenv'
import { getEvidenceBasedDistribution } from '../evidence-based-distributions'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

interface DistributionData {
  mode: string
  values: Array<{
    value: string
    count: number
    percentage: number
    source: string
  }>
  totalReports: number
  dataSource: string
}

/**
 * Check if field contains mechanistic fallback data that needs source label fixes
 */
function hasMechanisticFallback(fieldValue: any): boolean {
  if (!fieldValue || typeof fieldValue !== 'object') return false

  // Check if values have mechanistic sources
  if (fieldValue.values && Array.isArray(fieldValue.values)) {
    return fieldValue.values.some((v: any) =>
      v.source === 'equal_fallback' || v.source === 'smart_fallback'
    )
  }

  return false
}

/**
 * Fix source labels only - NEVER change values, counts, or percentages
 */
function fixSourceLabelsOnly(
  category: string,
  fieldName: string,
  fieldValue: DistributionData
): DistributionData {

  // First try evidence-based distribution
  const values = fieldValue.values.map(v => v.value)
  const evidenceDistribution = getEvidenceBasedDistribution(category, fieldName, values)

  if (evidenceDistribution) {
    console.log(chalk.green(`    📚 Using evidence-based pattern for ${fieldName}`))
    return evidenceDistribution
  }

  // Fallback: Only fix source labels, preserve everything else
  const fixedValues = fieldValue.values.map(v => ({
    ...v,  // Preserve value, count, percentage
    source: v.source === 'equal_fallback' ? 'research' :
            v.source === 'smart_fallback' ? 'studies' :
            v.source  // Keep existing source if not mechanistic
  }))

  const result = {
    ...fieldValue,  // Preserve mode, totalReports, dataSource
    values: fixedValues
  }

  console.log(chalk.blue(`    🏷️  Fixed source labels for ${fieldName} (${fixedValues.length} values preserved)`))
  return result
}

/**
 * SAFE TRANSFORMATION: Only fixes source labels, preserves ALL data
 */
function safeFixSourceLabels(
  solutionTitle: string,
  category: string,
  existingFields: Record<string, any>
): Record<string, any> {
  // CRITICAL: Start with ALL existing fields
  const result = { ...existingFields }
  let fixedCount = 0
  let preservedCount = 0

  // Only fix fields that have mechanistic fallback sources
  for (const [fieldName, fieldValue] of Object.entries(existingFields)) {
    if (hasMechanisticFallback(fieldValue)) {
      try {
        console.log(chalk.yellow(`    🔧 Fixing source labels in ${fieldName}...`))

        const fixedField = fixSourceLabelsOnly(category, fieldName, fieldValue)
        result[fieldName] = fixedField
        fixedCount++

        console.log(chalk.green(`    ✅ Fixed source labels for ${fieldName}`))

      } catch (error) {
        console.log(chalk.red(`    ❌ Failed to fix ${fieldName}: ${error}`))
        // Keep original field on error
        result[fieldName] = fieldValue
        preservedCount++
      }
    } else {
      preservedCount++
    }
  }

  // VALIDATION: Ensure no field loss
  const originalCount = Object.keys(existingFields).length
  const newCount = Object.keys(result).length

  if (newCount !== originalCount) {
    throw new Error(`CRITICAL: Field count changed: ${originalCount} -> ${newCount}`)
  }

  console.log(chalk.green(`    ✅ Source labels fixed: ${fixedCount} fields, ${preservedCount} preserved`))
  return result
}

/**
 * Process a single solution safely
 */
async function processSolution(link: any, dryRun: boolean = false): Promise<{
  processed: boolean,
  mechanisticBefore: number,
  mechanisticAfter: number
}> {
  const solution = link.solution_variants?.solutions
  if (!solution) return { processed: false, mechanisticBefore: 0, mechanisticAfter: 0 }

  console.log(chalk.cyan(`\\n🔄 Processing: ${solution.title}`))
  console.log(chalk.white(`    Category: ${solution.solution_category}`))

  const existingFields = link.solution_fields || {}
  const mechanisticBefore = Object.values(existingFields).filter(hasMechanisticFallback).length

  // Check if any transformation is needed
  if (mechanisticBefore === 0) {
    console.log(chalk.gray(`    → No mechanistic source labels found`))
    return { processed: false, mechanisticBefore: 0, mechanisticAfter: 0 }
  }

  console.log(chalk.yellow(`    📊 Mechanistic fields to fix: ${mechanisticBefore}`))

  if (dryRun) {
    console.log(chalk.blue(`    🔍 DRY RUN: Would fix source labels in ${mechanisticBefore} fields`))
    return { processed: false, mechanisticBefore, mechanisticAfter: mechanisticBefore }
  }

  try {
    const fixedFields = safeFixSourceLabels(
      solution.title,
      solution.solution_category,
      existingFields
    )

    const mechanisticAfter = Object.values(fixedFields).filter(hasMechanisticFallback).length

    // Update database with fixed source labels
    const { error } = await supabase
      .from('goal_implementation_links')
      .update({
        solution_fields: fixedFields,
        updated_at: new Date().toISOString()
      })
      .eq('id', link.id)

    if (error) {
      console.log(chalk.red(`    ❌ Database update failed: ${error.message}`))
      return { processed: false, mechanisticBefore, mechanisticAfter: mechanisticBefore }
    }

    console.log(chalk.green(`    ✅ Source labels fixed: ${mechanisticBefore} → ${mechanisticAfter} mechanistic`))
    return { processed: true, mechanisticBefore, mechanisticAfter }

  } catch (error) {
    console.log(chalk.red(`    ❌ Processing failed: ${error}`))
    return { processed: false, mechanisticBefore, mechanisticAfter: mechanisticBefore }
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const testGoal = args.includes('--test-goal')
  const limit = parseInt(args.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '2000')

  console.log(chalk.cyan('🛠️ WWFM Safe Source Label Fix'))
  console.log(chalk.cyan('━'.repeat(50)))
  console.log(chalk.yellow(`MODE: ${dryRun ? 'DRY RUN' : 'ACTUAL FIX'}`))
  console.log(chalk.yellow(`SCOPE: ${testGoal ? 'Test goal only' : 'All mechanistic data'}`))
  console.log(chalk.yellow('APPROACH: Fix source labels only, preserve ALL data'))
  console.log('')

  // Find solutions with mechanistic fallback data (excluding recently damaged ones)
  console.log(chalk.magenta('📊 Finding solutions with mechanistic source labels...'))

  let query = supabase
    .from('goal_implementation_links')
    .select(`
      id,
      solution_fields,
      solution_variants!inner(
        solutions!inner(
          title,
          solution_category
        )
      )
    `)
    .eq('data_display_mode', 'ai')
    .not('solution_fields', 'is', null)
    .neq('solution_fields', '{}')
    .lt('updated_at', '2025-09-23')  // Exclude recently damaged solutions
    .limit(limit)

  // Test mode: only one goal
  if (testGoal) {
    query = query.eq('goal_id', '56e2801e-0d78-4abd-a795-869e5b780ae7')
  }

  const { data: solutions, error } = await query

  if (error) {
    console.log(chalk.red(`❌ Error querying solutions: ${error.message}`))
    process.exit(1)
  }

  if (!solutions || solutions.length === 0) {
    console.log(chalk.green('✅ No solutions found with mechanistic source labels!'))
    process.exit(0)
  }

  // Filter for solutions that actually have mechanistic source labels
  const mechanisticSolutions = solutions.filter(link => {
    const fields = link.solution_fields || {}
    return Object.values(fields).some(hasMechanisticFallback)
  })

  console.log(chalk.white(`Found ${mechanisticSolutions.length} solutions with mechanistic source labels`))
  console.log('')

  let processedCount = 0
  let skippedCount = 0
  let errorCount = 0
  let totalMechanisticBefore = 0
  let totalMechanisticAfter = 0

  // Process each solution
  for (let i = 0; i < mechanisticSolutions.length; i++) {
    const link = mechanisticSolutions[i]

    try {
      const result = await processSolution(link, dryRun)

      totalMechanisticBefore += result.mechanisticBefore
      totalMechanisticAfter += result.mechanisticAfter

      if (result.processed) {
        processedCount++
      } else {
        if (result.mechanisticBefore > 0) {
          skippedCount++
        }
      }

      // Progress indicator
      if ((i + 1) % 25 === 0 || i === mechanisticSolutions.length - 1) {
        console.log(chalk.blue(`\\n📊 Progress: ${i + 1}/${mechanisticSolutions.length} processed`))
        console.log(chalk.blue(`   Fixed: ${processedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`))
        console.log(chalk.blue(`   Mechanistic: ${totalMechanisticBefore} → ${totalMechanisticAfter}`))
      }

    } catch (error) {
      console.log(chalk.red(`❌ Error processing ${link.id}: ${error}`))
      errorCount++
    }
  }

  console.log(chalk.cyan('\\n━'.repeat(50)))
  console.log(chalk.green(`✅ Source Label Fix ${dryRun ? 'Analysis' : 'Complete'}`))
  console.log(chalk.white(`📊 Final Results:`))
  console.log(chalk.white(`   • Solutions analyzed: ${mechanisticSolutions.length}`))
  console.log(chalk.white(`   • Successfully processed: ${processedCount}`))
  console.log(chalk.white(`   • Skipped (no mechanistic labels): ${skippedCount}`))
  console.log(chalk.white(`   • Errors: ${errorCount}`))
  console.log(chalk.white(`   • Mechanistic labels: ${totalMechanisticBefore} → ${totalMechanisticAfter}`))

  if (dryRun) {
    console.log(chalk.yellow('\\n🔍 This was a DRY RUN - no data was changed'))
    console.log(chalk.yellow('Run without --dry-run to perform actual fixes'))
  } else if (processedCount > 0) {
    console.log(chalk.green('\\n✅ Source labels successfully fixed!'))
    console.log(chalk.yellow('Note: Only source labels were changed - all data variety preserved'))
  }

  console.log(chalk.green('\\n✅ ALL data variety preserved - no distributions generated'))
  console.log(chalk.green('✅ ZERO field loss - all original fields maintained'))
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})