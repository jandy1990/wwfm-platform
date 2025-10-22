#!/usr/bin/env tsx

/**
 * Backup Goal Field Data
 *
 * Creates a complete backup of field data for a specific goal before
 * any modifications. Backs up both aggregated_fields and solution_fields
 * while preserving all other data (effectiveness, ratings, etc.)
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
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
  .name('backup-goal-fields')
  .description('Backup field data for a specific goal')
  .requiredOption('--goal-id <uuid>', 'Goal ID to backup')
  .option('--output-dir <path>', 'Output directory for backup', 'backups')
  .option('--include-solution-fields', 'Include solution_fields in backup (not just aggregated_fields)')
  .option('--verbose', 'Verbose output')
  .parse()

const options = program.opts()

async function createBackupDirectory(outputDir: string): Promise<void> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
    console.log(chalk.green(`Created backup directory: ${outputDir}`))
  }
}

async function getGoalTitle(goalId: string): Promise<string> {
  const { data: goal, error } = await supabase
    .from('goals')
    .select('title')
    .eq('id', goalId)
    .single()

  if (error) {
    throw new Error(`Failed to get goal title: ${error.message}`)
  }

  return goal?.title || 'Unknown Goal'
}

async function backupGoalFields(goalId: string, outputDir: string): Promise<string> {
  console.log(chalk.blue(`📦 Creating backup for goal: ${goalId}`))

  // Get goal title for metadata
  const goalTitle = await getGoalTitle(goalId)
  console.log(chalk.gray(`Goal: ${goalTitle}`))

  // Query goal implementation links with implementation details
  const { data: links, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      goal_id,
      implementation_id,
      aggregated_fields,
      solution_fields,
      effectiveness_rating,
      created_at,
      updated_at,
      implementations!inner (
        name,
        category
      )
    `)
    .eq('goal_id', goalId)

  if (error) {
    throw new Error(`Failed to fetch goal implementation links: ${error.message}`)
  }

  if (!links || links.length === 0) {
    throw new Error(`No implementation links found for goal ${goalId}`)
  }

  console.log(chalk.gray(`Found ${links.length} implementation links`))

  // Process data for backup
  const backupLinks = links.map(link => ({
    id: link.id,
    goal_id: link.goal_id,
    implementation_id: link.implementation_id,
    aggregated_fields: link.aggregated_fields,
    solution_fields: options.includeSolutionFields ? link.solution_fields : null,
    effectiveness_rating: link.effectiveness_rating,
    created_at: link.created_at,
    updated_at: link.updated_at,
    implementation_name: (link.implementations as any)?.name || 'Unknown',
    implementation_category: (link.implementations as any)?.category || 'unknown'
  }))

  // Create backup object
  const backupData: BackupData = {
    metadata: {
      timestamp: new Date().toISOString(),
      goalId,
      goalTitle,
      solutionCount: backupLinks.length,
      backupVersion: '1.0.0',
      command: process.argv.join(' ')
    },
    goalImplementationLinks: backupLinks
  }

  // Generate filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `goal-fields-${goalId}-${timestamp}.json`
  const filepath = path.join(outputDir, filename)

  // Write backup file
  fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2))

  // Calculate stats
  const withAggregatedFields = backupLinks.filter(link => link.aggregated_fields).length
  const withSolutionFields = backupLinks.filter(link => link.solution_fields).length

  console.log(chalk.green(`✅ Backup created: ${filepath}`))
  console.log(chalk.gray(`   Solutions with aggregated_fields: ${withAggregatedFields}/${backupLinks.length}`))

  if (options.includeSolutionFields) {
    console.log(chalk.gray(`   Solutions with solution_fields: ${withSolutionFields}/${backupLinks.length}`))
  }

  // Calculate file size
  const stats = fs.statSync(filepath)
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2)
  console.log(chalk.gray(`   File size: ${fileSizeMB} MB`))

  return filepath
}

async function validateBackup(filepath: string): Promise<void> {
  console.log(chalk.blue(`🔍 Validating backup: ${filepath}`))

  try {
    const backupContent = fs.readFileSync(filepath, 'utf8')
    const backupData: BackupData = JSON.parse(backupContent)

    // Validate structure
    if (!backupData.metadata || !backupData.goalImplementationLinks) {
      throw new Error('Invalid backup structure')
    }

    if (!Array.isArray(backupData.goalImplementationLinks)) {
      throw new Error('goalImplementationLinks is not an array')
    }

    // Validate each link
    for (const link of backupData.goalImplementationLinks) {
      if (!link.id || !link.goal_id || !link.implementation_id) {
        throw new Error(`Invalid link structure: ${JSON.stringify(link)}`)
      }
    }

    console.log(chalk.green(`✅ Backup validation passed`))
    console.log(chalk.gray(`   Metadata: ${JSON.stringify(backupData.metadata, null, 2)}`))

  } catch (error) {
    throw new Error(`Backup validation failed: ${error.message}`)
  }
}

async function main(): Promise<void> {
  try {
    console.log(chalk.blue('🚀 Goal Field Backup Tool'))
    console.log(chalk.gray('================================'))

    const { goalId, outputDir } = options

    // Validate goal ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(goalId)) {
      throw new Error('Invalid goal ID format (must be UUID)')
    }

    // Create output directory
    await createBackupDirectory(outputDir)

    // Create backup
    const backupFilepath = await backupGoalFields(goalId, outputDir)

    // Validate backup
    await validateBackup(backupFilepath)

    console.log(chalk.green('\n🎉 Backup completed successfully!'))
    console.log(chalk.blue(`\nTo restore this backup later:`))
    console.log(chalk.white(`npx tsx scripts/restore-goal-fields.ts --backup-file="${backupFilepath}"`))

  } catch (error) {
    console.error(chalk.red(`❌ Backup failed: ${error.message}`))
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { backupGoalFields, validateBackup }