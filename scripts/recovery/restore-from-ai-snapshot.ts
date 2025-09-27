#!/usr/bin/env tsx

/**
 * RECOVERY SCRIPT: Restore damaged solutions from ai_snapshot backup
 *
 * This script restores the 848 solutions that were damaged by the flawed
 * transformation scripts on September 23-24, 2025.
 *
 * SAFE: Only restores from existing backup data, no AI generation
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

interface RecoveryStats {
  total: number
  restored: number
  skipped: number
  errors: number
}

/**
 * Validate that restored data has the expected variety
 */
function validateDataVariety(data: any, fieldName: string): boolean {
  if (!data || !data.values || !Array.isArray(data.values)) {
    return false
  }

  // Check for data variety - should have multiple options with different percentages
  const values = data.values
  if (values.length < 2) {
    console.log(chalk.yellow(`    ⚠️  ${fieldName}: Only ${values.length} option (may be valid)`))
    return true // Single option can be valid
  }

  // Check for percentage variety - avoid 100% single values or equal splits
  const percentages = values.map(v => v.percentage || 0)
  const hasVariety = percentages.some((p, i) => percentages.findIndex(p2 => p2 === p) === i)

  if (!hasVariety) {
    console.log(chalk.red(`    ❌ ${fieldName}: No percentage variety`))
    return false
  }

  console.log(chalk.green(`    ✅ ${fieldName}: ${values.length} options with variety`))
  return true
}

/**
 * Restore a single solution from its ai_snapshot
 */
async function restoreSolution(record: any, dryRun: boolean = false): Promise<boolean> {
  try {
    const { id, ai_snapshot, solution_fields: currentFields } = record

    if (!ai_snapshot || typeof ai_snapshot !== 'object') {
      console.log(chalk.gray(`    → No valid snapshot data`))
      return false
    }

    // Remove metadata from snapshot before using as solution_fields
    const { _metadata, ...restoredFields } = ai_snapshot

    // Validate restored data has variety
    let validFields = 0
    let totalFields = 0

    for (const [fieldName, fieldData] of Object.entries(restoredFields)) {
      totalFields++
      if (validateDataVariety(fieldData, fieldName)) {
        validFields++
      }
    }

    console.log(chalk.cyan(`    📊 Validation: ${validFields}/${totalFields} fields have good variety`))

    if (dryRun) {
      console.log(chalk.blue(`    🔍 DRY RUN: Would restore ${Object.keys(restoredFields).length} fields`))
      return true
    }

    // Restore the data
    const { error } = await supabase
      .from('goal_implementation_links')
      .update({
        solution_fields: restoredFields,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.log(chalk.red(`    ❌ Database error: ${error.message}`))
      return false
    }

    console.log(chalk.green(`    ✅ Restored ${Object.keys(restoredFields).length} fields`))
    return true

  } catch (error) {
    console.log(chalk.red(`    ❌ Error: ${error}`))
    return false
  }
}

/**
 * Main recovery function
 */
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const testGoal = args.includes('--test-goal')

  console.log(chalk.cyan('🔄 WWFM Data Recovery from AI Snapshot'))
  console.log(chalk.cyan('━'.repeat(50)))
  console.log(chalk.yellow(`MODE: ${dryRun ? 'DRY RUN' : 'ACTUAL RECOVERY'}`))
  console.log(chalk.yellow(`SCOPE: ${testGoal ? 'Anxiety goal only' : 'All damaged solutions'}`))
  console.log('')

  // Create backup table first
  if (!dryRun) {
    console.log(chalk.magenta('📦 Creating backup of current state...'))

    const { error: backupError } = await supabase.rpc('create_recovery_backup', {
      backup_table_name: 'recovery_backup_20250924'
    })

    if (backupError) {
      console.log(chalk.yellow(`⚠️  Backup creation note: ${backupError.message}`))
    } else {
      console.log(chalk.green('✅ Backup created: recovery_backup_20250924'))
    }
  }

  // Query damaged solutions
  console.log(chalk.magenta('🔍 Finding damaged solutions with snapshot backup...'))

  let query = supabase
    .from('goal_implementation_links')
    .select(`
      id,
      goal_id,
      ai_snapshot,
      solution_fields,
      solution_variants!inner(
        solutions!inner(
          title,
          solution_category
        )
      )
    `)
    .eq('data_display_mode', 'ai')
    .gte('updated_at', '2025-09-23')
    .not('ai_snapshot', 'is', null)
    .neq('ai_snapshot', '{}')

  // Test mode: only anxiety goal
  if (testGoal) {
    query = query.eq('goal_id', '56e2801e-0d78-4abd-a795-869e5b780ae7')
  }

  const { data: damagedSolutions, error } = await query

  if (error) {
    console.log(chalk.red(`❌ Query error: ${error.message}`))
    process.exit(1)
  }

  if (!damagedSolutions || damagedSolutions.length === 0) {
    console.log(chalk.green('✅ No damaged solutions found!'))
    process.exit(0)
  }

  console.log(chalk.white(`Found ${damagedSolutions.length} solutions to recover`))
  console.log('')

  const stats: RecoveryStats = { total: 0, restored: 0, skipped: 0, errors: 0 }

  // Process each solution
  for (let i = 0; i < damagedSolutions.length; i++) {
    const solution = damagedSolutions[i]
    const solutionTitle = solution.solution_variants?.solutions?.title || 'Unknown'
    const solutionCategory = solution.solution_variants?.solutions?.solution_category || 'unknown'

    stats.total++

    console.log(chalk.cyan(`\n[${i + 1}/${damagedSolutions.length}] ${solutionTitle}`))
    console.log(chalk.white(`    Category: ${solutionCategory}`))

    const success = await restoreSolution(solution, dryRun)

    if (success) {
      stats.restored++
    } else {
      if (solution.ai_snapshot) {
        stats.errors++
      } else {
        stats.skipped++
      }
    }

    // Progress indicator
    if ((i + 1) % 25 === 0 || i === damagedSolutions.length - 1) {
      console.log(chalk.blue(`\n📊 Progress: ${i + 1}/${damagedSolutions.length}`))
      console.log(chalk.blue(`   Restored: ${stats.restored}, Skipped: ${stats.skipped}, Errors: ${stats.errors}`))
    }
  }

  // Final results
  console.log(chalk.cyan('\n━'.repeat(50)))
  console.log(chalk.green(`✅ Recovery ${dryRun ? 'Analysis' : 'Complete'}`))
  console.log(chalk.white('📊 Final Results:'))
  console.log(chalk.white(`   • Total solutions: ${stats.total}`))
  console.log(chalk.white(`   • Successfully restored: ${stats.restored}`))
  console.log(chalk.white(`   • Skipped (no snapshot): ${stats.skipped}`))
  console.log(chalk.white(`   • Errors: ${stats.errors}`))

  if (dryRun) {
    console.log(chalk.yellow('\n🔍 This was a DRY RUN - no data was changed'))
    console.log(chalk.yellow('Run without --dry-run to perform actual recovery'))
  } else if (stats.restored > 0) {
    console.log(chalk.green('\n✅ Data successfully restored from backup!'))
    console.log(chalk.yellow('Next: Verify the restored data quality'))
    if (testGoal) {
      console.log(chalk.gray('   Check: http://localhost:3000/goal/56e2801e-0d78-4abd-a795-869e5b780ae7'))
    }
  }
}

// SQL function to create backup (run once)
const CREATE_BACKUP_FUNCTION = `
CREATE OR REPLACE FUNCTION create_recovery_backup(backup_table_name text)
RETURNS void AS $$
BEGIN
  EXECUTE format('CREATE TABLE %I AS SELECT * FROM goal_implementation_links WHERE updated_at >= ''2025-09-23''', backup_table_name);
END;
$$ LANGUAGE plpgsql;
`

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})