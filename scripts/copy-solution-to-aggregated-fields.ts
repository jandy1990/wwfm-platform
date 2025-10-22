#!/usr/bin/env npx tsx

/**
 * Copy Good Data from solution_fields to aggregated_fields
 *
 * ISSUE: Frontend reads ONLY from aggregated_fields but that contains degraded 2-option data
 * SOLUTION: Copy the good 4-8 option DistributionData from solution_fields to aggregated_fields
 *
 * This script specifically fixes the anxiety goal where:
 * - solution_fields has GOOD data (4-8 options with research sources)
 * - aggregated_fields has BAD data (2 options from conservative_mapping)
 */

import { createClient } from '@supabase/supabase-js'
import chalk from 'chalk'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

const ANXIETY_GOAL_ID = '56e2801e-0d78-4abd-a795-869e5b780ae7'

async function copyFieldsForAnxietyGoal(dryRun: boolean = true) {
  console.log(chalk.blue('🔄 COPY SOLUTION_FIELDS TO AGGREGATED_FIELDS'))
  console.log(chalk.blue('══════════════════════════════════════════════'))

  if (dryRun) {
    console.log(chalk.yellow('🔍 DRY RUN MODE - No changes will be made\n'))
  }

  // Get all anxiety goal solutions
  const { data: links, error } = await supabase
    .from('goal_implementation_links')
    .select('id, solution_fields, aggregated_fields')
    .eq('goal_id', ANXIETY_GOAL_ID)

  if (error) {
    console.error(chalk.red('❌ Failed to fetch data:'), error)
    return
  }

  console.log(chalk.green(`🎯 Found ${links.length} solutions in anxiety goal\n`))

  let copiedCount = 0
  let skippedCount = 0

  for (const link of links) {
    const solutionFields = link.solution_fields as Record<string, any>
    const aggregatedFields = link.aggregated_fields as Record<string, any>

    // Find DistributionData fields in solution_fields
    const distributionFields: Record<string, DistributionData> = {}

    for (const [fieldName, fieldData] of Object.entries(solutionFields || {})) {
      // Check if it's DistributionData format
      if (fieldData &&
          typeof fieldData === 'object' &&
          'mode' in fieldData &&
          'values' in fieldData &&
          Array.isArray((fieldData as any).values)) {
        distributionFields[fieldName] = fieldData as DistributionData
      }
    }

    if (Object.keys(distributionFields).length === 0) {
      console.log(chalk.gray(`⏭️  No DistributionData found in solution_fields for link ${link.id}`))
      skippedCount++
      continue
    }

    // Check if aggregated_fields has degraded data for these fields
    let needsCopy = false
    const fieldsToUpdate: string[] = []

    for (const [fieldName, solutionData] of Object.entries(distributionFields)) {
      const aggregatedData = aggregatedFields?.[fieldName] as DistributionData | undefined

      if (!aggregatedData) {
        console.log(chalk.cyan(`  📝 ${fieldName}: missing in aggregated_fields`))
        fieldsToUpdate.push(fieldName)
        needsCopy = true
      } else if (aggregatedData.values?.length < solutionData.values?.length) {
        console.log(chalk.cyan(`  📝 ${fieldName}: ${aggregatedData.values.length} → ${solutionData.values.length} options`))
        fieldsToUpdate.push(fieldName)
        needsCopy = true
      }
    }

    if (!needsCopy) {
      console.log(chalk.gray(`⏭️  Link ${link.id} - aggregated_fields already has good data`))
      skippedCount++
      continue
    }

    console.log(chalk.green(`🔄 Copying fields for link ${link.id}:`))
    for (const fieldName of fieldsToUpdate) {
      console.log(chalk.green(`   ${fieldName}: copying from solution_fields`))
    }

    if (!dryRun) {
      // Preserve existing aggregated_fields metadata
      const updatedAggregatedFields = {
        ...aggregatedFields,
        ...distributionFields
      }

      const { error: updateError } = await supabase
        .from('goal_implementation_links')
        .update({ aggregated_fields: updatedAggregatedFields })
        .eq('id', link.id)

      if (updateError) {
        console.error(chalk.red(`❌ Failed to update link ${link.id}:`), updateError)
        continue
      }
    }

    copiedCount++
  }

  console.log(chalk.blue('\n📈 Results:'))
  console.log(chalk.green(`   ✅ Copied: ${copiedCount}`))
  console.log(chalk.gray(`   ⏭️  Skipped (good data): ${skippedCount}`))

  if (dryRun) {
    console.log(chalk.yellow('\n🔍 This was a dry run. Use --real to make actual changes.'))
  } else {
    console.log(chalk.green('\n✨ Copy operation complete!'))
  }
}

// Parse command line arguments
const isDryRun = !process.argv.includes('--real')

copyFieldsForAnxietyGoal(isDryRun).catch(console.error)