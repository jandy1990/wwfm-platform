#!/usr/bin/env tsx

/**
 * SAFE RECOVERY: Restores lost fields from ai_snapshot backup
 *
 * Fixes ~200 solutions that lost startup_cost/ongoing_cost fields during
 * transformation. Preserves ALL existing fields while adding recovered ones.
 *
 * CRITICAL: This script ADDS fields, never removes them
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
 * Synthesize cost field using form logic - chooses most relevant cost
 */
function synthesizeCostField(startupCost: any, ongoingCost: any): string {
  // Extract mode if DistributionData, otherwise use string value
  const startupValue = typeof startupCost === 'object' ? startupCost.mode : startupCost
  const ongoingValue = typeof ongoingCost === 'object' ? ongoingCost.mode : ongoingCost

  // Priority: ongoing cost over startup cost (if not free)
  if (ongoingValue && ongoingValue !== "Free/No ongoing cost") return ongoingValue
  if (startupValue && startupValue !== "Free/No startup cost") return startupValue

  return "Free"
}

/**
 * Determine cost type based on startup and ongoing costs
 */
function determineCostType(startupCost: any, ongoingCost: any): string {
  const startupValue = typeof startupCost === 'object' ? startupCost.mode : startupCost
  const ongoingValue = typeof ongoingCost === 'object' ? ongoingCost.mode : ongoingCost

  const hasStartup = startupValue && startupValue !== "Free/No startup cost"
  const hasOngoing = ongoingValue && ongoingValue !== "Free/No ongoing cost"

  if (hasStartup && hasOngoing) return "dual"
  if (hasOngoing) return "recurring"
  if (hasStartup) return "one_time"
  return "free"
}

/**
 * Update solution with field validation
 */
async function updateWithValidation(id: string, updatedFields: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('goal_implementation_links')
      .update({ solution_fields: updatedFields })
      .eq('id', id)

    if (error) {
      console.log(chalk.red(`    ❌ Database update failed: ${error.message}`))
      return false
    }

    return true
  } catch (error) {
    console.log(chalk.red(`    ❌ Update error: ${error}`))
    return false
  }
}

/**
 * Recover a single damaged solution
 */
async function recoverSolution(link: any): Promise<boolean> {
  const snapshot = link.ai_snapshot
  const existingFields = link.solution_fields || {}

  console.log(chalk.cyan(`\n🔄 Processing: ${link.id}`))

  if (!snapshot?.startup_cost || !snapshot?.ongoing_cost) {
    console.log(chalk.gray('    → No startup/ongoing cost in snapshot'))
    return false
  }

  // CRITICAL: Preserve ALL existing fields while adding recovered ones
  const recovered = {
    ...existingFields,  // Keep everything that exists
    startup_cost: snapshot.startup_cost,  // Restore from snapshot
    ongoing_cost: snapshot.ongoing_cost,
    // Add synthesized fields based on recovered data
    cost: synthesizeCostField(snapshot.startup_cost, snapshot.ongoing_cost),
    cost_type: determineCostType(snapshot.startup_cost, snapshot.ongoing_cost)
  }

  // Validation: Ensure no field loss
  const originalCount = Object.keys(existingFields).length
  const newCount = Object.keys(recovered).length

  if (newCount < originalCount) {
    console.log(chalk.red(`    ❌ Field loss prevented: ${originalCount} -> ${newCount}`))
    return false
  }

  console.log(chalk.green(`    ✅ Fields preserved: ${originalCount} -> ${newCount}`))
  console.log(chalk.green(`    ✅ Restored: startup_cost, ongoing_cost, cost, cost_type`))

  // Update database
  const success = await updateWithValidation(link.id, recovered)
  if (success) {
    console.log(chalk.green(`    ✅ Recovery successful`))
  }

  return success
}

/**
 * Main recovery function
 */
async function main() {
  console.log(chalk.cyan('🔧 WWFM Field Recovery from AI Snapshot'))
  console.log(chalk.cyan('━'.repeat(50)))
  console.log(chalk.yellow('SAFE: Preserves ALL existing fields while restoring lost ones'))
  console.log('')

  // Find solutions that lost startup_cost/ongoing_cost but have them in snapshot
  console.log(chalk.magenta('📊 Finding damaged solutions...'))

  const { data: damaged, error } = await supabase
    .from('goal_implementation_links')
    .select('id, solution_fields, ai_snapshot')
    .not('ai_snapshot->startup_cost', 'is', null)  // Has startup_cost in snapshot
    .not('ai_snapshot->ongoing_cost', 'is', null)  // Has ongoing_cost in snapshot
    .is('solution_fields->startup_cost', null)     // Missing from current fields
    .eq('data_display_mode', 'ai')
    .limit(500)

  if (error) {
    console.log(chalk.red(`❌ Error querying damaged solutions: ${error.message}`))
    process.exit(1)
  }

  if (!damaged || damaged.length === 0) {
    console.log(chalk.green('✅ No damaged solutions found - all data intact!'))
    process.exit(0)
  }

  console.log(chalk.white(`Found ${damaged.length} solutions to recover`))
  console.log('')

  let recoveredCount = 0
  let skippedCount = 0
  let errorCount = 0

  // Process each damaged solution
  for (let i = 0; i < damaged.length; i++) {
    const link = damaged[i]

    try {
      const success = await recoverSolution(link)
      if (success) {
        recoveredCount++
      } else {
        skippedCount++
      }

      // Progress indicator
      if ((i + 1) % 25 === 0) {
        console.log(chalk.blue(`\n📊 Progress: ${i + 1}/${damaged.length} processed`))
        console.log(chalk.blue(`   Recovered: ${recoveredCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`))
      }

    } catch (error) {
      console.log(chalk.red(`❌ Error processing ${link.id}: ${error}`))
      errorCount++
    }
  }

  console.log(chalk.cyan('\n━'.repeat(50)))
  console.log(chalk.green('✅ Recovery Complete'))
  console.log(chalk.white(`📊 Final Results:`))
  console.log(chalk.white(`   • Solutions processed: ${damaged.length}`))
  console.log(chalk.white(`   • Successfully recovered: ${recoveredCount}`))
  console.log(chalk.white(`   • Skipped (no snapshot data): ${skippedCount}`))
  console.log(chalk.white(`   • Errors: ${errorCount}`))

  if (recoveredCount > 0) {
    console.log(chalk.yellow(`\n🔍 Next: Validate recovery with quality analysis`))
    console.log(chalk.gray(`   npx tsx scripts/analyze-solution-quality.ts --limit 6000`))
  }
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})