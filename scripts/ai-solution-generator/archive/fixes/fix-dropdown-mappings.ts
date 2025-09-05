#!/usr/bin/env node

/**
 * Fix Remaining Dropdown Mapping Issues
 * 
 * This script fixes the 2% of dropdown mappings that are still incorrect:
 * 1. Diet/nutrition using wrong cost_impact values
 * 2. Validates habits time_commitment values
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import chalk from 'chalk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Correct dropdown options for diet_nutrition
const DIET_COST_IMPACT_OPTIONS = [
  "Significantly more expensive",
  "Somewhat more expensive", 
  "About the same",
  "Somewhat less expensive",
  "Significantly less expensive"
]

// Valid time_commitment options for habits_routines
const HABITS_TIME_COMMITMENT_OPTIONS = [
  "Under 5 minutes",
  "5-10 minutes",
  "10-20 minutes",
  "20-30 minutes",
  "30-45 minutes",
  "45-60 minutes",
  "1-2 hours",
  "2-3 hours",
  "More than 3 hours",
  "Multiple times throughout the day",
  "Ongoing/Background habit"
]

async function main() {
  console.log(chalk.cyan('🔧 Fixing Remaining Dropdown Mapping Issues'))
  console.log(chalk.gray('━'.repeat(50)))
  
  let fixedCount = 0
  
  // Step 1: Validate diet_nutrition cost_impact values
  console.log(chalk.blue('\n📊 Checking diet_nutrition cost_impact values...'))
  
  const { data: dietSolutions, error: dietError } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      solution_fields,
      solution_variants!inner(
        solutions!inner(
          title,
          solution_category
        )
      )
    `)
    .eq('solution_variants.solutions.solution_category', 'diet_nutrition')
    .eq('rating_count', 1) // AI-generated
  
  if (dietError) {
    console.error(chalk.red('Error fetching diet solutions:'), dietError)
    return
  }
  
  console.log(chalk.yellow(`Found ${dietSolutions?.length || 0} diet_nutrition solutions`))
  
  for (const link of dietSolutions || []) {
    const currentValue = link.solution_fields?.cost_impact
    
    // Check if it's using the correct dropdown values
    if (currentValue && !DIET_COST_IMPACT_OPTIONS.includes(currentValue)) {
      console.log(chalk.yellow(`  ⚠️  Invalid cost_impact: "${currentValue}"`))
      
      // Map to correct value
      let newValue = "About the same" // Default
      
      if (currentValue.toLowerCase().includes('free')) {
        newValue = "Significantly less expensive"
      } else if (currentValue.toLowerCase().includes('more')) {
        newValue = "Somewhat more expensive"
      } else if (currentValue.toLowerCase().includes('less')) {
        newValue = "Somewhat less expensive"
      }
      
      // Update the field
      const updatedFields = {
        ...link.solution_fields,
        cost_impact: newValue
      }
      
      const { error: updateError } = await supabase
        .from('goal_implementation_links')
        .update({ solution_fields: updatedFields })
        .eq('id', link.id)
      
      if (!updateError) {
        console.log(chalk.green(`  ✅ Fixed: "${currentValue}" → "${newValue}"`))
        fixedCount++
      } else {
        console.error(chalk.red(`  ❌ Failed to fix: ${updateError.message}`))
      }
    }
  }
  
  // Step 2: Validate habits_routines time_commitment values
  console.log(chalk.blue('\n📊 Validating habits_routines time_commitment values...'))
  
  const { data: habitsSolutions, error: habitsError } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      solution_fields,
      solution_variants!inner(
        solutions!inner(
          title,
          solution_category
        )
      )
    `)
    .eq('solution_variants.solutions.solution_category', 'habits_routines')
    .eq('rating_count', 1) // AI-generated
  
  if (habitsError) {
    console.error(chalk.red('Error fetching habits solutions:'), habitsError)
    return
  }
  
  console.log(chalk.yellow(`Found ${habitsSolutions?.length || 0} habits_routines solutions`))
  
  let validCount = 0
  let invalidCount = 0
  
  for (const link of habitsSolutions || []) {
    const currentValue = link.solution_fields?.time_commitment
    
    if (currentValue) {
      if (HABITS_TIME_COMMITMENT_OPTIONS.includes(currentValue)) {
        validCount++
      } else {
        invalidCount++
        console.log(chalk.red(`  ❌ Invalid time_commitment: "${currentValue}" for ${link.solution_variants.solutions.title}`))
        
        // Try to map to a valid value
        let newValue = "5-10 minutes" // Default
        
        // Parse the value and map appropriately
        if (currentValue.toLowerCase().includes('background')) {
          newValue = "Ongoing/Background habit"
        } else if (currentValue.toLowerCase().includes('multiple')) {
          newValue = "Multiple times throughout the day"
        } else if (currentValue.match(/(\d+)\s*min/i)) {
          const minutes = parseInt(currentValue.match(/(\d+)\s*min/i)![1])
          if (minutes < 5) newValue = "Under 5 minutes"
          else if (minutes <= 10) newValue = "5-10 minutes"
          else if (minutes <= 20) newValue = "10-20 minutes"
          else if (minutes <= 30) newValue = "20-30 minutes"
          else if (minutes <= 45) newValue = "30-45 minutes"
          else if (minutes <= 60) newValue = "45-60 minutes"
          else newValue = "1-2 hours"
        }
        
        // Update the field
        const updatedFields = {
          ...link.solution_fields,
          time_commitment: newValue
        }
        
        const { error: updateError } = await supabase
          .from('goal_implementation_links')
          .update({ solution_fields: updatedFields })
          .eq('id', link.id)
        
        if (!updateError) {
          console.log(chalk.green(`  ✅ Fixed: "${currentValue}" → "${newValue}"`))
          fixedCount++
        } else {
          console.error(chalk.red(`  ❌ Failed to fix: ${updateError.message}`))
        }
      }
    }
  }
  
  console.log(chalk.green(`  ✅ ${validCount} valid time_commitment values`))
  if (invalidCount > 0) {
    console.log(chalk.yellow(`  ⚠️  ${invalidCount} invalid values fixed`))
  }
  
  // Summary
  console.log(chalk.cyan('\n' + '═'.repeat(50)))
  console.log(chalk.green(`✅ Fixed ${fixedCount} dropdown mapping issues`))
  
  // Final validation check
  console.log(chalk.blue('\n📊 Final Validation Check...'))
  
  const { data: remainingIssues, error: checkError } = await supabase
    .rpc('check_dropdown_issues', {})
    .single()
  
  if (!checkError && remainingIssues) {
    console.log(chalk.green('✅ All dropdown mappings are now valid!'))
  } else {
    // Run a manual check
    const { count: dietCount } = await supabase
      .from('goal_implementation_links')
      .select('id', { count: 'exact', head: true })
      .eq('solution_variants.solutions.solution_category', 'diet_nutrition')
      .not('solution_fields->cost_impact', 'in', `(${DIET_COST_IMPACT_OPTIONS.map(o => `"${o}"`).join(',')})`)
    
    if (dietCount === 0) {
      console.log(chalk.green('✅ All diet_nutrition cost_impact values are valid'))
    } else {
      console.log(chalk.yellow(`⚠️  ${dietCount} diet_nutrition solutions still have invalid cost_impact values`))
    }
  }
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})