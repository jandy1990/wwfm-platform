#!/usr/bin/env tsx

/**
 * Restore Goal Field Data
 *
 * Restores field data from a backup file, allowing recovery from
 * failed generation attempts or unwanted changes.
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import { Command } from 'commander'
import chalk from 'chalk'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

interface BackupData {
  metadata: {
    timestamp: string
    goalId: string
    goalTitle: string
    solutionCount: number
    backupVersion: string
    command: string
  }
  goalImplementationLinks: Array<{
    id: string
    goal_id: string
    implementation_id: string
    aggregated_fields: any
    solution_fields: any
    effectiveness_rating: number
    created_at: string
    updated_at: string
    implementation_name: string
    implementation_category: string
  }>
}

const program = new Command()

program
  .name('restore-goal-fields')
  .description('Restore field data from a backup file')
  .requiredOption('--backup-file <path>', 'Path to backup file')
  .option('--dry-run', 'Preview changes without applying them')
  .option('--force', 'Skip confirmation prompts')
  .option('--restore-solution-fields', 'Also restore solution_fields (not just aggregated_fields)')
  .option('--verbose', 'Verbose output')
  .parse()

const options = program.opts()

async function loadBackupFile(backupPath: string): Promise<BackupData> {
  console.log(chalk.blue(`📂 Loading backup file: ${backupPath}`))

  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`)
  }

  try {
    const backupContent = fs.readFileSync(backupPath, 'utf8')
    const backupData: BackupData = JSON.parse(backupContent)

    // Validate backup structure
    if (!backupData.metadata || !backupData.goalImplementationLinks) {
      throw new Error('Invalid backup file structure')
    }

    if (!Array.isArray(backupData.goalImplementationLinks)) {
      throw new Error('Invalid goalImplementationLinks structure')
    }

    console.log(chalk.green(`✅ Backup file loaded successfully`))
    console.log(chalk.gray(`   Backup timestamp: ${backupData.metadata.timestamp}`))
    console.log(chalk.gray(`   Goal: ${backupData.metadata.goalTitle}`))
    console.log(chalk.gray(`   Solutions: ${backupData.metadata.solutionCount}`))

    return backupData

  } catch (error) {
    throw new Error(`Failed to parse backup file: ${error.message}`)
  }
}

async function getCurrentFieldData(goalId: string): Promise<any[]> {
  const { data: currentLinks, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      aggregated_fields,
      solution_fields,
      implementations!inner (
        name,
        category
      )
    `)
    .eq('goal_id', goalId)

  if (error) {
    throw new Error(`Failed to fetch current data: ${error.message}`)
  }

  return currentLinks || []
}

async function compareWithCurrent(backupData: BackupData): Promise<{
  toUpdate: number
  toSkip: number
  missing: number
  differences: Array<{
    id: string
    name: string
    changes: string[]
  }>
}> {
  console.log(chalk.blue(`🔍 Comparing backup with current data...`))

  const currentData = await getCurrentFieldData(backupData.metadata.goalId)
  const currentMap = new Map(currentData.map(item => [item.id, item]))

  let toUpdate = 0
  let toSkip = 0
  let missing = 0
  const differences: Array<{ id: string; name: string; changes: string[] }> = []

  for (const backupLink of backupData.goalImplementationLinks) {
    const current = currentMap.get(backupLink.id)

    if (!current) {
      missing++
      differences.push({
        id: backupLink.id,
        name: backupLink.implementation_name,
        changes: ['MISSING: Link not found in current database']
      })
      continue
    }

    const changes: string[] = []

    // Compare aggregated_fields
    const currentAggregated = JSON.stringify(current.aggregated_fields)
    const backupAggregated = JSON.stringify(backupLink.aggregated_fields)

    if (currentAggregated !== backupAggregated) {
      changes.push('aggregated_fields differ')
    }

    // Compare solution_fields if restoring them
    if (options.restoreSolutionFields) {
      const currentSolution = JSON.stringify(current.solution_fields)
      const backupSolution = JSON.stringify(backupLink.solution_fields)

      if (currentSolution !== backupSolution) {
        changes.push('solution_fields differ')
      }
    }

    if (changes.length > 0) {
      toUpdate++
      differences.push({
        id: backupLink.id,
        name: backupLink.implementation_name,
        changes
      })
    } else {
      toSkip++
    }
  }

  return { toUpdate, toSkip, missing, differences }
}

async function promptForConfirmation(
  backupData: BackupData,
  comparison: {
    toUpdate: number
    toSkip: number
    missing: number
    differences: Array<{ id: string; name: string; changes: string[] }>
  }
): Promise<boolean> {
  if (options.force) {
    return true
  }

  console.log(chalk.yellow('\n📊 Restore Summary:'))
  console.log(chalk.gray(`Goal: ${backupData.metadata.goalTitle}`))
  console.log(chalk.gray(`Backup from: ${backupData.metadata.timestamp}`))
  console.log(chalk.gray(`Solutions to update: ${comparison.toUpdate}`))
  console.log(chalk.gray(`Solutions unchanged: ${comparison.toSkip}`))
  console.log(chalk.gray(`Missing solutions: ${comparison.missing}`))

  if (comparison.differences.length > 0 && options.verbose) {
    console.log(chalk.blue('\n📝 Changes to apply:'))
    for (const diff of comparison.differences.slice(0, 10)) {
      console.log(chalk.gray(`  ${diff.name}: ${diff.changes.join(', ')}`))
    }
    if (comparison.differences.length > 10) {
      console.log(chalk.gray(`  ... and ${comparison.differences.length - 10} more`))
    }
  }

  // In a real CLI, you'd use a proper prompt library
  // For now, we'll auto-confirm in dry-run mode
  if (options.dryRun) {
    console.log(chalk.blue('\n🔍 DRY RUN: Would apply these changes'))
    return false
  }

  console.log(chalk.yellow('\n⚠️  This will overwrite current field data!'))
  console.log(chalk.blue('Continue with restore? (This would show a Y/N prompt in real implementation)'))

  // For this script, assume "yes" for now
  // In production, you'd add proper prompting
  return true
}

async function restoreFieldData(
  backupData: BackupData,
  dryRun: boolean = false
): Promise<void> {
  console.log(chalk.blue(`🔄 ${dryRun ? 'DRY RUN: ' : ''}Restoring field data...`))

  let updated = 0
  let skipped = 0
  let errors = 0

  for (const backupLink of backupData.goalImplementationLinks) {
    try {
      if (dryRun) {
        console.log(chalk.gray(`Would restore: ${backupLink.implementation_name}`))
        updated++
        continue
      }

      // Prepare update data
      const updateData: any = {
        aggregated_fields: backupLink.aggregated_fields
      }

      if (options.restoreSolutionFields && backupLink.solution_fields) {
        updateData.solution_fields = backupLink.solution_fields
      }

      // Update the database
      const { error } = await supabase
        .from('goal_implementation_links')
        .update(updateData)
        .eq('id', backupLink.id)

      if (error) {
        console.error(chalk.red(`Failed to restore ${backupLink.implementation_name}: ${error.message}`))
        errors++
        continue
      }

      console.log(chalk.green(`✅ Restored: ${backupLink.implementation_name}`))
      updated++

    } catch (error) {
      console.error(chalk.red(`Error restoring ${backupLink.implementation_name}: ${error.message}`))
      errors++
    }
  }

  console.log(chalk.blue(`\n📊 Restore complete:`))
  console.log(chalk.gray(`   Updated: ${updated}`))
  console.log(chalk.gray(`   Skipped: ${skipped}`))
  console.log(chalk.gray(`   Errors: ${errors}`))

  if (errors > 0) {
    console.log(chalk.yellow(`\n⚠️  ${errors} errors occurred during restore`))
  }
}

async function main(): Promise<void> {
  try {
    console.log(chalk.blue('🔄 Goal Field Restore Tool'))
    console.log(chalk.gray('=================================='))

    const { backupFile } = options

    // Load backup file
    const backupData = await loadBackupFile(backupFile)

    // Compare with current state
    const comparison = await compareWithCurrent(backupData)

    // Show comparison and get confirmation
    const confirmed = await promptForConfirmation(backupData, comparison)

    if (!confirmed) {
      console.log(chalk.yellow('🚫 Restore cancelled'))
      return
    }

    // Perform restore
    await restoreFieldData(backupData, options.dryRun)

    if (options.dryRun) {
      console.log(chalk.blue('\n🔍 DRY RUN completed - no changes made'))
      console.log(chalk.white('Run without --dry-run to apply changes'))
    } else {
      console.log(chalk.green('\n🎉 Restore completed successfully!'))
    }

  } catch (error) {
    console.error(chalk.red(`❌ Restore failed: ${error.message}`))
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { loadBackupFile, restoreFieldData }