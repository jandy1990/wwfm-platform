#!/usr/bin/env tsx

/**
 * Clear Goal Field Data
 *
 * Surgically removes field data for a specific goal to enable clean regeneration.
 * Supports selective field clearing and category filtering for precise control.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { Command } from 'commander'
import chalk from 'chalk'

import { getRequiredFields } from './field-generation-utils/category-config'
import { backupGoalFields } from './backup-goal-fields'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const program = new Command()

program
  .name('clear-goal-fields')
  .description('Clear field data for a specific goal to enable regeneration')
  .requiredOption('--goal-id <uuid>', 'Goal ID to clear')
  .option('--field-filter <fields>', 'Only clear specific fields (comma-separated)')
  .option('--category-filter <categories>', 'Only clear specific categories (comma-separated)')
  .option('--clear-all-fields', 'Clear ALL aggregated_fields (not just category-required ones)')
  .option('--clear-solution-fields', 'Also clear solution_fields')
  .option('--dry-run', 'Preview changes without applying them')
  .option('--skip-backup', 'Skip backup creation (dangerous!)')
  .option('--force', 'Skip confirmation prompts')
  .option('--verbose', 'Verbose output')
  .parse()

const options = program.opts()

interface ClearStats {
  totalSolutions: number
  solutionsCleared: number
  fieldsCleared: number
  categoriesProcessed: string[]
  fieldsProcessed: string[]
}

/**
 * Get solutions for clearing
 */
async function getSolutionsData(goalId: string) {
  console.log(chalk.blue(`📊 Loading solutions for goal: ${goalId}`))

  // Get goal title
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .select('title')
    .eq('id', goalId)
    .single()

  if (goalError) {
    throw new Error(`Failed to get goal: ${goalError.message}`)
  }

  // Get solution links
  const { data: links, error: linksError } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      aggregated_fields,
      solution_fields,
      solution_variants!inner (
        solutions!inner (
          title,
          solution_category
        )
      )
    `)
    .eq('goal_id', goalId)

  if (linksError) {
    throw new Error(`Failed to get solution links: ${linksError.message}`)
  }

  if (!links || links.length === 0) {
    throw new Error(`No solutions found for goal ${goalId}`)
  }

  return {
    goalTitle: goal.title,
    solutions: links.map(link => ({
      id: link.id,
      name: (link.solution_variants as any)?.solutions?.title || 'Unknown',
      category: (link.solution_variants as any)?.solutions?.solution_category || 'unknown',
      aggregated_fields: link.aggregated_fields || {},
      solution_fields: link.solution_fields || {}
    }))
  }
}

/**
 * Determine fields to clear for a solution
 */
function getFieldsToClear(
  solutionCategory: string,
  existingAggregatedFields: Record<string, any>
): string[] {
  // If clearing all fields, return all existing field names
  if (options.clearAllFields) {
    return Object.keys(existingAggregatedFields)
  }

  // Get required fields for this category
  const requiredFields = getRequiredFields(solutionCategory)

  // Apply field filter if specified
  const fieldsFromCategory = options.fieldFilter
    ? requiredFields.filter(field => options.fieldFilter.split(',').includes(field))
    : requiredFields

  // Only clear fields that actually exist
  return fieldsFromCategory.filter(field => existingAggregatedFields.hasOwnProperty(field))
}

/**
 * Clear fields from a solution
 */
async function clearSolutionFields(
  solutionId: string,
  solutionName: string,
  category: string,
  aggregatedFields: Record<string, any>,
  solutionFields: Record<string, any>
): Promise<{ fieldsCleared: number; fieldsProcessed: string[] }> {
  const fieldsToClear = getFieldsToClear(category, aggregatedFields)

  if (fieldsToClear.length === 0) {
    if (options.verbose) {
      console.log(chalk.gray(`    No fields to clear for ${solutionName}`))
    }
    return { fieldsCleared: 0, fieldsProcessed: [] }
  }

  if (options.dryRun) {
    console.log(chalk.blue(`    [DRY RUN] Would clear: ${fieldsToClear.join(', ')}`))
    return { fieldsCleared: fieldsToClear.length, fieldsProcessed: fieldsToClear }
  }

  // Create updated fields objects
  const updatedAggregatedFields = { ...aggregatedFields }
  const updatedSolutionFields = options.clearSolutionFields ? { ...solutionFields } : solutionFields

  // Remove specified fields
  for (const fieldName of fieldsToClear) {
    delete updatedAggregatedFields[fieldName]
    if (options.clearSolutionFields) {
      delete updatedSolutionFields[fieldName]
    }
  }

  // Update database
  const updateData: any = {
    aggregated_fields: updatedAggregatedFields
  }

  if (options.clearSolutionFields) {
    updateData.solution_fields = updatedSolutionFields
  }

  const { error } = await supabase
    .from('goal_implementation_links')
    .update(updateData)
    .eq('id', solutionId)

  if (error) {
    throw new Error(`Failed to update solution ${solutionName}: ${error.message}`)
  }

  console.log(chalk.yellow(`    🧹 Cleared ${fieldsToClear.length} fields: ${fieldsToClear.join(', ')}`))

  return { fieldsCleared: fieldsToClear.length, fieldsProcessed: fieldsToClear }
}

/**
 * Preview clearing operation
 */
async function previewClearingOperation(goalId: string): Promise<ClearStats> {
  const { goalTitle, solutions } = await getSolutionsData(goalId)

  console.log(chalk.yellow(`\n🔍 Preview: Clearing fields for "${goalTitle}"`))

  // Apply category filter
  const filteredSolutions = solutions.filter(solution => {
    if (options.categoryFilter) {
      const allowedCategories = options.categoryFilter.split(',')
      return allowedCategories.includes(solution.category)
    }
    return true
  })

  const stats: ClearStats = {
    totalSolutions: filteredSolutions.length,
    solutionsCleared: 0,
    fieldsCleared: 0,
    categoriesProcessed: [...new Set(filteredSolutions.map(s => s.category))],
    fieldsProcessed: []
  }

  // Analyze each solution
  for (const solution of filteredSolutions) {
    const fieldsToClear = getFieldsToClear(solution.category, solution.aggregated_fields)

    if (fieldsToClear.length > 0) {
      stats.solutionsCleared++
      stats.fieldsCleared += fieldsToClear.length

      // Track unique fields being processed
      for (const field of fieldsToClear) {
        if (!stats.fieldsProcessed.includes(field)) {
          stats.fieldsProcessed.push(field)
        }
      }
    }

    if (options.verbose) {
      const status = fieldsToClear.length > 0 ? chalk.yellow('🧹') : chalk.gray('⏭️')
      console.log(`  ${status} ${solution.name} (${solution.category}): ${fieldsToClear.length} fields`)
      if (fieldsToClear.length > 0 && options.verbose) {
        console.log(chalk.gray(`      ${fieldsToClear.join(', ')}`))
      }
    }
  }

  return stats
}

/**
 * Show confirmation prompt
 */
function showConfirmation(stats: ClearStats, goalTitle: string): boolean {
  if (options.force) {
    return true
  }

  console.log(chalk.yellow('\n⚠️  CLEARING OPERATION SUMMARY:'))
  console.log(chalk.gray(`Goal: "${goalTitle}"`))
  console.log(chalk.gray(`Solutions to modify: ${stats.solutionsCleared}/${stats.totalSolutions}`))
  console.log(chalk.gray(`Total fields to clear: ${stats.fieldsCleared}`))
  console.log(chalk.gray(`Categories: ${stats.categoriesProcessed.join(', ')}`))
  console.log(chalk.gray(`Fields: ${stats.fieldsProcessed.join(', ')}`))

  if (options.clearSolutionFields) {
    console.log(chalk.red('⚠️  Will also clear solution_fields'))
  }

  if (options.clearAllFields) {
    console.log(chalk.red('⚠️  Will clear ALL aggregated_fields (not just category-required)'))
  }

  console.log(chalk.yellow('\n⚠️  This operation cannot be undone without a backup!'))

  if (options.dryRun) {
    console.log(chalk.blue('\n🔍 DRY RUN: No actual changes will be made'))
    return true
  }

  // In a real implementation, you'd use a proper prompt library
  console.log(chalk.blue('\nContinue with clearing? (This would show Y/N prompt in real implementation)'))

  // For this script, assume "yes" for now
  // In production, add proper prompting
  return true
}

/**
 * Execute clearing operation
 */
async function executeClearingOperation(goalId: string): Promise<ClearStats> {
  const { goalTitle, solutions } = await getSolutionsData(goalId)

  // Apply category filter
  const filteredSolutions = solutions.filter(solution => {
    if (options.categoryFilter) {
      const allowedCategories = options.categoryFilter.split(',')
      return allowedCategories.includes(solution.category)
    }
    return true
  })

  const stats: ClearStats = {
    totalSolutions: filteredSolutions.length,
    solutionsCleared: 0,
    fieldsCleared: 0,
    categoriesProcessed: [...new Set(filteredSolutions.map(s => s.category))],
    fieldsProcessed: []
  }

  console.log(chalk.blue(`\n🧹 Clearing fields for "${goalTitle}" (${filteredSolutions.length} solutions)`))

  // Process each solution
  for (const solution of filteredSolutions) {
    try {
      const result = await clearSolutionFields(
        solution.id,
        solution.name,
        solution.category,
        solution.aggregated_fields,
        solution.solution_fields
      )

      if (result.fieldsCleared > 0) {
        stats.solutionsCleared++
        stats.fieldsCleared += result.fieldsCleared

        // Track unique fields
        for (const field of result.fieldsProcessed) {
          if (!stats.fieldsProcessed.includes(field)) {
            stats.fieldsProcessed.push(field)
          }
        }
      }

    } catch (error) {
      console.error(chalk.red(`❌ Failed to clear ${solution.name}: ${error.message}`))
    }
  }

  return stats
}

/**
 * Main clearing function
 */
async function main(): Promise<void> {
  try {
    console.log(chalk.blue('🧹 WWFM Field Data Clearer'))
    console.log(chalk.gray('=============================='))
    console.log(chalk.gray(`Goal ID: ${options.goalId}`))
    console.log(chalk.gray(`Field filter: ${options.fieldFilter || 'category-required fields'}`))
    console.log(chalk.gray(`Category filter: ${options.categoryFilter || 'all categories'}`))
    console.log(chalk.gray(`Clear all fields: ${options.clearAllFields ? 'YES' : 'NO'}`))
    console.log(chalk.gray(`Clear solution fields: ${options.clearSolutionFields ? 'YES' : 'NO'}`))
    console.log(chalk.gray(`Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`))

    // Create backup unless skipped
    if (!options.skipBackup && !options.dryRun) {
      console.log(chalk.blue('\n💾 Creating backup...'))
      await backupGoalFields(options.goalId, 'backups')
      console.log(chalk.green('✅ Backup created'))
    }

    // Preview operation
    const previewStats = await previewClearingOperation(options.goalId)

    // Get confirmation
    const { goalTitle } = await getSolutionsData(options.goalId)
    const confirmed = showConfirmation(previewStats, goalTitle)

    if (!confirmed) {
      console.log(chalk.yellow('🚫 Operation cancelled'))
      return
    }

    // Execute clearing
    const finalStats = options.dryRun ? previewStats : await executeClearingOperation(options.goalId)

    // Final summary
    console.log(chalk.green('\n🎉 Clearing Complete!'))
    console.log(chalk.blue('\n📊 Final Statistics:'))
    console.log(chalk.gray(`   Solutions processed: ${finalStats.solutionsCleared}/${finalStats.totalSolutions}`))
    console.log(chalk.gray(`   Fields cleared: ${finalStats.fieldsCleared}`))
    console.log(chalk.gray(`   Categories affected: ${finalStats.categoriesProcessed.join(', ')}`))
    console.log(chalk.gray(`   Field types cleared: ${finalStats.fieldsProcessed.join(', ')}`))

    if (options.dryRun) {
      console.log(chalk.blue('\n🔍 DRY RUN - No actual changes were made'))
      console.log(chalk.white('Remove --dry-run flag to apply changes'))
    } else if (finalStats.fieldsCleared > 0) {
      console.log(chalk.green('\n✅ Database updated successfully'))
      console.log(chalk.blue('🎯 Ready for field regeneration using V3 system'))
      console.log(chalk.white(`Next: npx tsx scripts/generate-validated-fields-v3.ts --goal-id=${options.goalId}`))
    } else {
      console.log(chalk.yellow('\n⚠️  No fields were cleared (no matching fields found)'))
    }

  } catch (error) {
    console.error(chalk.red(`❌ Clearing failed: ${error.message}`))

    if (error.stack && options.verbose) {
      console.error(chalk.gray(error.stack))
    }

    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { getFieldsToClear, clearSolutionFields }