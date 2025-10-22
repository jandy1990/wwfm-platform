#!/usr/bin/env node

/**
 * Fix Exercise Frequency Script
 * 
 * Specifically fixes exercise frequency that were incorrectly mapped to "three times daily"
 * when they should be weekly frequencies
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import chalk from 'chalk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function main() {
  console.log(chalk.cyan('🔧 Fixing Exercise Frequency Mappings'))
  console.log(chalk.gray('━'.repeat(50)))
  
  // Find all exercise solutions with "three times daily" frequency
  const { data: issues, error } = await supabase
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
    .eq('solution_variants.solutions.solution_category', 'exercise_movement')
    .eq('solution_variants.solutions.source_type', 'ai_foundation')
    .or(`solution_fields->>frequency.eq.three times daily,solution_fields->>frequency.eq.twice daily`)
  
  if (error) {
    console.error(chalk.red('Error fetching data:'), error)
    return
  }
  
  console.log(chalk.yellow(`Found ${issues?.length || 0} exercise frequency issues to fix`))
  
  let fixedCount = 0
  
  for (const link of issues || []) {
    const currentFreq = link.solution_fields?.frequency
    let newFreq = currentFreq
    
    // Map daily frequencies to more appropriate weekly frequencies for exercise
    if (currentFreq === 'three times daily') {
      newFreq = '3-5 times per week'
    } else if (currentFreq === 'twice daily') {
      newFreq = '3-5 times per week'
    } else if (currentFreq === 'once daily') {
      // Daily exercise is reasonable, but let's check if it should be less frequent
      newFreq = 'Daily' // Keep as daily for now
    }
    
    if (newFreq !== currentFreq) {
      const updatedFields = {
        ...link.solution_fields,
        frequency: newFreq
      }
      
      const { error: updateError } = await supabase
        .from('goal_implementation_links')
        .update({ solution_fields: updatedFields })
        .eq('id', link.id)
      
      if (!updateError) {
        console.log(chalk.green(`  ✅ Fixed: "${currentFreq}" → "${newFreq}"`))
        fixedCount++
      } else {
        console.error(chalk.red(`  ❌ Failed to fix: ${updateError.message}`))
      }
    }
  }
  
  console.log(chalk.cyan('\n' + '═'.repeat(50)))
  console.log(chalk.green(`✅ Fixed ${fixedCount} exercise frequency issues`))
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})