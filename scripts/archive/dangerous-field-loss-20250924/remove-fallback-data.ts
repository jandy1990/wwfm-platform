#!/usr/bin/env tsx

/**
 * Remove all fallback-generated data from solution_fields
 *
 * This script identifies and removes any distributions that contain
 * fallback sources, reverting them to original broken format
 * so we can re-process with proper AI consultation.
 */

import { createClient } from '@supabase/supabase-js'
import chalk from 'chalk'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function main() {
  console.log(chalk.cyan('🧹 Removing Fallback-Generated Data'))
  console.log(chalk.cyan('━'.repeat(50)))

  // Find all records with fallback data
  const { data: records, error } = await supabase
    .from('goal_implementation_links')
    .select('id, solution_fields')
    .eq('data_display_mode', 'ai')
    .not('solution_fields', 'is', null)

  if (error) {
    console.error(chalk.red('❌ Error fetching records:'), error)
    process.exit(1)
  }

  if (!records || records.length === 0) {
    console.log(chalk.yellow('No AI records found'))
    process.exit(0)
  }

  console.log(chalk.blue(`Found ${records.length} AI records to check`))

  let cleanedCount = 0
  let totalCount = 0

  for (const record of records) {
    totalCount++

    if (!record.solution_fields || typeof record.solution_fields !== 'object') {
      continue
    }

    const solutionFields = record.solution_fields as any
    let hasFollowbackData = false
    const cleanedFields: any = {}

    // Check each field for fallback sources
    for (const [fieldName, fieldValue] of Object.entries(solutionFields)) {
      if (fieldValue && typeof fieldValue === 'object' && 'values' in fieldValue) {
        const distribution = fieldValue as any

        // Check if this distribution has fallback sources
        const hasFallbackSource = Array.isArray(distribution.values) &&
          distribution.values.some((v: any) =>
            v.source && (
              v.source.includes('fallback') ||
              v.source === 'smart_fallback' ||
              v.source === 'equal_fallback'
            )
          )

        if (hasFallbackSource) {
          hasFollowbackData = true
          console.log(chalk.yellow(`  Removing fallback field: ${fieldName}`))
          // Don't include this field in cleaned data (effectively removing it)
        } else {
          // Keep non-fallback distributions
          cleanedFields[fieldName] = fieldValue
        }
      } else {
        // Keep raw/non-distribution fields as-is
        cleanedFields[fieldName] = fieldValue
      }
    }

    // If we found fallback data, update the record
    if (hasFollowbackData) {
      console.log(chalk.red(`🧹 Cleaning record ${record.id}`))

      const { error: updateError } = await supabase
        .from('goal_implementation_links')
        .update({ solution_fields: cleanedFields })
        .eq('id', record.id)

      if (updateError) {
        console.error(chalk.red(`❌ Failed to clean record ${record.id}:`), updateError)
      } else {
        cleanedCount++
      }
    }
  }

  // Final summary
  console.log(chalk.cyan('\n' + '━'.repeat(50)))
  console.log(chalk.cyan('📊 CLEANUP SUMMARY'))
  console.log(chalk.cyan('━'.repeat(50)))
  console.log(chalk.blue(`📋 Total records checked: ${totalCount}`))
  console.log(chalk.green(`🧹 Records cleaned: ${cleanedCount}`))
  console.log(chalk.yellow(`🔄 Records ready for re-processing: ${cleanedCount}`))

  if (cleanedCount > 0) {
    console.log(chalk.green('\n✅ Fallback data removal complete!'))
    console.log(chalk.blue('Ready to re-run with proper AI consultation.'))
  } else {
    console.log(chalk.gray('\nNo fallback data found to remove.'))
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('Fatal error:'), error)
    process.exit(1)
  })
}