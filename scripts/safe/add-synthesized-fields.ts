#!/usr/bin/env tsx

/**
 * SAFE: Add synthesized cost fields to old-schema solutions
 *
 * Adds cost and cost_type fields to 1,026 solutions that have startup_cost/ongoing_cost
 * but are missing the synthesized display fields.
 *
 * CRITICAL: Preserves ALL existing fields, only ADDS new ones
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
 * Add synthesized fields to a single solution
 */
async function addSynthesizedFields(link: any): Promise<boolean> {
  const existingFields = link.solution_fields || {}

  console.log(chalk.cyan(`\n🔄 Processing: ${link.id}`))

  if (!existingFields.startup_cost || !existingFields.ongoing_cost) {
    console.log(chalk.gray('    → Missing startup_cost or ongoing_cost'))
    return false
  }

  if (existingFields.cost) {
    console.log(chalk.gray('    → Already has synthesized cost field'))
    return false
  }

  // CRITICAL: Preserve ALL existing fields while adding synthesized ones
  const enhanced = {
    ...existingFields,  // Keep everything that exists
    cost: synthesizeCostField(existingFields.startup_cost, existingFields.ongoing_cost),
    cost_type: determineCostType(existingFields.startup_cost, existingFields.ongoing_cost)
  }

  // Validation: Ensure no field loss
  const originalCount = Object.keys(existingFields).length
  const newCount = Object.keys(enhanced).length

  if (newCount <= originalCount) {
    console.log(chalk.red(`    ❌ No fields added: ${originalCount} -> ${newCount}`))
    return false
  }

  console.log(chalk.green(`    ✅ Fields enhanced: ${originalCount} -> ${newCount}`))
  console.log(chalk.green(`    ✅ Added: cost="${enhanced.cost}", cost_type="${enhanced.cost_type}"`))

  // Update database
  const success = await updateWithValidation(link.id, enhanced)
  if (success) {
    console.log(chalk.green(`    ✅ Enhancement successful`))
  }

  return success
}

/**
 * Main function to add synthesized fields
 */
async function main() {
  console.log(chalk.cyan('🔧 WWFM Add Synthesized Fields to Old Schema'))
  console.log(chalk.cyan('━'.repeat(50)))
  console.log(chalk.yellow('SAFE: Preserves ALL existing fields while adding cost/cost_type'))
  console.log('')

  // Find old-schema solutions that need synthesized fields
  console.log(chalk.magenta('📊 Finding old-schema solutions...'))

  const { data: oldSchema, error } = await supabase
    .from('goal_implementation_links')
    .select('id, solution_fields')
    .not('solution_fields->startup_cost', 'is', null)  // Has startup_cost
    .not('solution_fields->ongoing_cost', 'is', null)  // Has ongoing_cost
    .is('solution_fields->cost', null)                 // Missing synthesized cost
    .eq('data_display_mode', 'ai')
    .limit(1500)

  if (error) {
    console.log(chalk.red(`❌ Error querying old-schema solutions: ${error.message}`))
    process.exit(1)
  }

  if (!oldSchema || oldSchema.length === 0) {
    console.log(chalk.green('✅ No old-schema solutions found - all have synthesized fields!'))
    process.exit(0)
  }

  console.log(chalk.white(`Found ${oldSchema.length} solutions to enhance`))
  console.log('')

  let enhancedCount = 0
  let skippedCount = 0
  let errorCount = 0

  // Process each old-schema solution
  for (let i = 0; i < oldSchema.length; i++) {
    const link = oldSchema[i]

    try {
      const success = await addSynthesizedFields(link)
      if (success) {
        enhancedCount++
      } else {
        skippedCount++
      }

      // Progress indicator
      if ((i + 1) % 50 === 0) {
        console.log(chalk.blue(`\n📊 Progress: ${i + 1}/${oldSchema.length} processed`))
        console.log(chalk.blue(`   Enhanced: ${enhancedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`))
      }

    } catch (error) {
      console.log(chalk.red(`❌ Error processing ${link.id}: ${error}`))
      errorCount++
    }
  }

  console.log(chalk.cyan('\n━'.repeat(50)))
  console.log(chalk.green('✅ Synthesized Field Addition Complete'))
  console.log(chalk.white(`📊 Final Results:`))
  console.log(chalk.white(`   • Solutions processed: ${oldSchema.length}`))
  console.log(chalk.white(`   • Successfully enhanced: ${enhancedCount}`))
  console.log(chalk.white(`   • Skipped (already had fields): ${skippedCount}`))
  console.log(chalk.white(`   • Errors: ${errorCount}`))

  if (enhancedCount > 0) {
    console.log(chalk.yellow(`\n🔍 Next: Validate enhancement with quality analysis`))
    console.log(chalk.gray(`   npx tsx scripts/analyze-solution-quality.ts --limit 6000`))
  }
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})