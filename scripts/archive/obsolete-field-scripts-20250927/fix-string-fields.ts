#!/usr/bin/env tsx

/**
 * FIX STRING FIELDS SCRIPT
 *
 * Converts string fields to proper DistributionData format.
 * Specifically targets cost, challenges, and still_following fields that are strings.
 */

import { createClient } from '@supabase/supabase-js'
import chalk from 'chalk'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

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

function convertStringToDistribution(stringValue: string, fieldName: string): DistributionData {
  // Create a simple distribution with the string value as 100%
  return {
    mode: stringValue,
    values: [
      { value: stringValue, count: 100, percentage: 100, source: 'research' }
    ],
    totalReports: 100,
    dataSource: 'ai_research'
  }
}

async function findStringFieldRecords(goalId: string): Promise<any[]> {
  console.log(chalk.cyan(`🔍 Finding records with string fields...`))

  const { data: records, error } = await supabase
    .from('goal_implementation_links')
    .select('id, aggregated_fields')
    .eq('goal_id', goalId)
    .eq('data_display_mode', 'ai')

  if (error) {
    console.error(chalk.red('Database error:'), error)
    return []
  }

  const stringFieldRecords = []

  for (const record of records || []) {
    const fields = record.aggregated_fields || {}
    const stringFields = []

    // Check each field type
    const fieldsToCheck = ['cost', 'challenges', 'still_following']
    for (const fieldName of fieldsToCheck) {
      if (typeof fields[fieldName] === 'string') {
        stringFields.push({ fieldName, value: fields[fieldName] })
      }
    }

    if (stringFields.length > 0) {
      stringFieldRecords.push({
        id: record.id,
        aggregated_fields: fields,
        stringFields
      })
    }
  }

  console.log(chalk.white(`📊 Found ${stringFieldRecords.length} records with string fields`))
  return stringFieldRecords
}

async function fixStringFields(record: any, dryRun: boolean = false): Promise<boolean> {
  const updatedFields = { ...record.aggregated_fields }
  let changesMade = false

  for (const stringField of record.stringFields) {
    const { fieldName, value } = stringField

    // Convert string to DistributionData
    const distributionData = convertStringToDistribution(value, fieldName)
    updatedFields[fieldName] = distributionData
    changesMade = true

    console.log(chalk.yellow(`   🔧 Converting ${fieldName}: "${value}" → DistributionData with 1 option`))
  }

  if (!changesMade) {
    return false
  }

  if (dryRun) {
    console.log(chalk.blue(`🔍 DRY RUN - Would convert string fields in record ${record.id}`))
    return true
  }

  const { error } = await supabase
    .from('goal_implementation_links')
    .update({ aggregated_fields: updatedFields })
    .eq('id', record.id)

  if (error) {
    console.error(chalk.red(`❌ Failed to update record ${record.id}:`), error)
    return false
  }

  return true
}

async function main() {
  const args = process.argv.slice(2)
  const goalId = args.find(arg => arg.startsWith('--goal-id='))?.split('=')[1]
  const dryRun = args.includes('--dry-run')

  console.log(chalk.magenta('🔧 STRING FIELDS CONVERSION SCRIPT'))
  console.log(chalk.magenta('═'.repeat(50)))

  if (dryRun) {
    console.log(chalk.blue('🔍 DRY RUN MODE - No changes will be made\n'))
  }

  if (!goalId) {
    console.log(chalk.red('❌ Usage:'))
    console.log(chalk.white('  --goal-id=<uuid>        Target specific goal (REQUIRED)'))
    console.log(chalk.white('  --dry-run               Preview changes without applying'))
    console.log(chalk.gray('\nExample:'))
    console.log(chalk.gray('  npx tsx scripts/fix-string-fields.ts --goal-id=56e2801e-0d78-4abd-a795-869e5b780ae7 --dry-run'))
    process.exit(1)
  }

  console.log(chalk.cyan(`🎯 Converting string fields in goal: ${goalId}\n`))

  const stringFieldRecords = await findStringFieldRecords(goalId)

  if (stringFieldRecords.length === 0) {
    console.log(chalk.green('✅ No string field records found!'))
    return
  }

  let successCount = 0
  let errorCount = 0

  for (const record of stringFieldRecords) {
    console.log(chalk.white(`\n🔄 Processing record ${record.id}`))
    const fieldDescriptions = record.stringFields.map((sf: any) => `${sf.fieldName}: "${sf.value}"`).join(', ')
    console.log(chalk.gray(`   String fields: ${fieldDescriptions}`))

    const success = await fixStringFields(record, dryRun)

    if (success) {
      successCount++
      if (!dryRun) {
        console.log(chalk.green(`✅ Converted string fields in record ${record.id}`))
      }
    } else {
      errorCount++
    }
  }

  console.log(chalk.white(`\n📈 Results:`))
  console.log(chalk.green(`   ✅ Fixed: ${successCount}`))
  if (errorCount > 0) {
    console.log(chalk.red(`   ❌ Errors: ${errorCount}`))
  }

  if (dryRun) {
    console.log(chalk.blue('\n🔍 DRY RUN complete. Run without --dry-run to apply fixes.'))
  } else {
    console.log(chalk.green('\n✨ String fields converted! The generation script should now regenerate these with proper distributions.'))
  }
}

main().catch(console.error)