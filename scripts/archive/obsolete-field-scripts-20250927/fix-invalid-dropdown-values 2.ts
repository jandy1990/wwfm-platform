#!/usr/bin/env tsx

/**
 * FIX INVALID DROPDOWN VALUES SCRIPT
 *
 * Fixes specific invalid dropdown values found in existing database records:
 * 1. "$100+/month" -> "$100-200/month"
 * 2. "Consistency with counseling" -> "Consistency"
 *
 * This script directly updates the aggregated_fields to fix validation failures.
 */

import { createClient } from '@supabase/supabase-js'
import chalk from 'chalk'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

interface DropdownFix {
  fieldName: string
  invalidValue: string
  validValue: string
  description: string
}

const DROPDOWN_FIXES: DropdownFix[] = [
  {
    fieldName: 'cost',
    invalidValue: '$100+/month',
    validValue: '$100-200/month',
    description: 'Fix invalid cost range format'
  },
  {
    fieldName: 'cost',
    invalidValue: '$25+/month',
    validValue: '$25-50/month',
    description: 'Fix invalid cost range format'
  },
  {
    fieldName: 'challenges',
    invalidValue: 'Consistency with counseling',
    validValue: 'Consistency',
    description: 'Fix overly specific challenge text'
  },
  {
    fieldName: 'challenges',
    invalidValue: 'Processing traumatic memories',
    validValue: 'Emotional overwhelm',
    description: 'Map specific challenge to valid option'
  },
  {
    fieldName: 'challenges',
    invalidValue: 'Cost of NRT',
    validValue: 'Cost',
    description: 'Simplify specific cost challenge'
  },
  {
    fieldName: 'challenges',
    invalidValue: 'Information overload',
    validValue: 'Difficulty concentrating',
    description: 'Map to closest valid challenge'
  },
  {
    fieldName: 'challenges',
    invalidValue: 'Meal planning',
    validValue: 'Time commitment',
    description: 'Map meal planning to time challenge'
  },
  {
    fieldName: 'challenges',
    invalidValue: 'Class schedule conflicts',
    validValue: 'Scheduling conflicts',
    description: 'Use standard scheduling challenge'
  },
  {
    fieldName: 'challenges',
    invalidValue: 'Meal planning and preparation',
    validValue: 'Time commitment',
    description: 'Map meal prep to time challenge'
  },
  {
    fieldName: 'challenges',
    invalidValue: 'Identifying low GI foods',
    validValue: 'Initial learning curve',
    description: 'Map specific knowledge to learning challenge'
  },
  {
    fieldName: 'challenges',
    invalidValue: 'Finding time to cook',
    validValue: 'Time commitment',
    description: 'Map cooking time to general time challenge'
  },
  {
    fieldName: 'side_effects',
    invalidValue: 'None reported',
    validValue: 'None',
    description: 'Standardize none response'
  },
  {
    fieldName: 'side_effects',
    invalidValue: 'Improved mood',
    validValue: 'None',
    description: 'Positive effects should be None'
  }
]

async function findRecordsWithInvalidValues(goalId: string): Promise<any[]> {
  console.log(chalk.cyan(`🔍 Finding records with invalid dropdown values...`))

  const { data: records, error } = await supabase
    .from('goal_implementation_links')
    .select('id, aggregated_fields')
    .eq('goal_id', goalId)
    .eq('data_display_mode', 'ai')

  if (error) {
    console.error(chalk.red('Database error:'), error)
    return []
  }

  const problematicRecords = []

  for (const record of records || []) {
    const fields = record.aggregated_fields || {}
    let hasInvalidValues = false
    const invalidValues = []

    for (const fix of DROPDOWN_FIXES) {
      const fieldData = fields[fix.fieldName]
      if (fieldData?.values && Array.isArray(fieldData.values)) {
        const hasInvalidValue = fieldData.values.some((v: any) => v.value === fix.invalidValue)
        if (hasInvalidValue) {
          hasInvalidValues = true
          invalidValues.push(`${fix.fieldName}: "${fix.invalidValue}"`)
        }
      }
    }

    if (hasInvalidValues) {
      problematicRecords.push({
        id: record.id,
        aggregated_fields: fields,
        invalidValues
      })
    }
  }

  console.log(chalk.white(`📊 Found ${problematicRecords.length} records with invalid dropdown values`))
  return problematicRecords
}

async function fixRecord(record: any, dryRun: boolean = false): Promise<boolean> {
  const updatedFields = { ...record.aggregated_fields }
  let changesMade = false

  for (const fix of DROPDOWN_FIXES) {
    const fieldData = updatedFields[fix.fieldName]
    if (fieldData?.values && Array.isArray(fieldData.values)) {
      fieldData.values = fieldData.values.map((v: any) => {
        if (v.value === fix.invalidValue) {
          changesMade = true
          console.log(chalk.yellow(`   🔧 ${fix.fieldName}: "${fix.invalidValue}" → "${fix.validValue}"`))
          return { ...v, value: fix.validValue }
        }
        return v
      })

      // Update mode if it was also invalid
      if (fieldData.mode === fix.invalidValue) {
        fieldData.mode = fix.validValue
        changesMade = true
      }
    }
  }

  if (!changesMade) {
    return false
  }

  if (dryRun) {
    console.log(chalk.blue(`🔍 DRY RUN - Would fix record ${record.id}`))
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

  console.log(chalk.magenta('🔧 INVALID DROPDOWN VALUES FIX SCRIPT'))
  console.log(chalk.magenta('═'.repeat(50)))

  if (dryRun) {
    console.log(chalk.blue('🔍 DRY RUN MODE - No changes will be made\n'))
  }

  if (!goalId) {
    console.log(chalk.red('❌ Usage:'))
    console.log(chalk.white('  --goal-id=<uuid>        Target specific goal (REQUIRED)'))
    console.log(chalk.white('  --dry-run               Preview changes without applying'))
    console.log(chalk.gray('\nExample:'))
    console.log(chalk.gray('  npx tsx scripts/fix-invalid-dropdown-values.ts --goal-id=56e2801e-0d78-4abd-a795-869e5b780ae7 --dry-run'))
    process.exit(1)
  }

  console.log(chalk.cyan(`🎯 Fixing invalid dropdown values in goal: ${goalId}\n`))

  // Show what will be fixed
  console.log(chalk.white('📋 Dropdown value fixes:'))
  for (const fix of DROPDOWN_FIXES) {
    console.log(chalk.gray(`   ${fix.fieldName}: "${fix.invalidValue}" → "${fix.validValue}"`))
    console.log(chalk.gray(`      ${fix.description}`))
  }
  console.log()

  const problematicRecords = await findRecordsWithInvalidValues(goalId)

  if (problematicRecords.length === 0) {
    console.log(chalk.green('✅ No records with invalid dropdown values found!'))
    return
  }

  let successCount = 0
  let errorCount = 0

  for (const record of problematicRecords) {
    console.log(chalk.white(`\n🔄 Processing record ${record.id}`))
    console.log(chalk.gray(`   Invalid values: ${record.invalidValues.join(', ')}`))

    const success = await fixRecord(record, dryRun)

    if (success) {
      successCount++
      if (!dryRun) {
        console.log(chalk.green(`✅ Fixed record ${record.id}`))
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
    console.log(chalk.green('\n✨ Dropdown values fixed! Re-run the generation script to verify.'))
  }
}

main().catch(console.error)