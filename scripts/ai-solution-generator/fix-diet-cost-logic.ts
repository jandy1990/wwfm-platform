#!/usr/bin/env node

/**
 * Fix Diet/Nutrition Cost Impact Logic
 * 
 * The dropdown values are valid, but the logic is wrong.
 * Solutions like "Mindful Eating" shouldn't be "Significantly more expensive"
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
  console.log(chalk.cyan('🔧 Fixing Diet/Nutrition Cost Impact Logic'))
  console.log(chalk.gray('━'.repeat(50)))
  
  let fixedCount = 0
  
  // Get all diet_nutrition solutions
  const { data: dietSolutions, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      solution_fields,
      solution_variants!inner(
        solutions!inner(
          title,
          solution_category,
          description
        )
      )
    `)
    .eq('solution_variants.solutions.solution_category', 'diet_nutrition')
    .eq('rating_count', 1) // AI-generated
  
  if (error) {
    console.error(chalk.red('Error fetching diet solutions:'), error)
    return
  }
  
  console.log(chalk.yellow(`Found ${dietSolutions?.length || 0} diet_nutrition solutions to review`))
  
  for (const link of dietSolutions || []) {
    const title = link.solution_variants.solutions.title.toLowerCase()
    const description = link.solution_variants.solutions.description?.toLowerCase() || ''
    const currentCostImpact = link.solution_fields?.cost_impact
    
    // Determine appropriate cost impact based on solution type
    let appropriateCostImpact = currentCostImpact
    
    // Solutions that should be "About the same" or less expensive
    if (title.includes('mindful') || 
        title.includes('planning') || 
        title.includes('tracking') ||
        title.includes('water') ||
        title.includes('hydration') ||
        title.includes('portion') ||
        title.includes('reduce') ||
        description.includes('mindful') ||
        description.includes('awareness')) {
      appropriateCostImpact = "About the same"
    }
    
    // Solutions that are typically more expensive
    else if (title.includes('organic') ||
             title.includes('supplement') ||
             title.includes('whole foods') ||
             title.includes('fresh') ||
             title.includes('quality') ||
             description.includes('organic') ||
             description.includes('high-quality')) {
      appropriateCostImpact = "Somewhat more expensive"
    }
    
    // Solutions that might reduce costs
    else if (title.includes('cooking at home') ||
             title.includes('meal prep') ||
             title.includes('bulk') ||
             title.includes('seasonal') ||
             description.includes('save money') ||
             description.includes('budget')) {
      appropriateCostImpact = "Somewhat less expensive"
    }
    
    // Solutions focused on specific diets
    else if (title.includes('keto') ||
             title.includes('paleo') ||
             title.includes('vegan') ||
             title.includes('mediterranean')) {
      appropriateCostImpact = "Somewhat more expensive"
    }
    
    // Intermittent fasting and similar
    else if (title.includes('fasting') ||
             title.includes('intermittent')) {
      appropriateCostImpact = "Somewhat less expensive"
    }
    
    // Default for general healthy eating
    else if (title.includes('healthy') ||
             title.includes('balanced')) {
      appropriateCostImpact = "About the same"
    }
    
    // Update if different from current
    if (appropriateCostImpact !== currentCostImpact) {
      console.log(chalk.yellow(`\n  Solution: ${link.solution_variants.solutions.title}`))
      console.log(chalk.gray(`    Current: ${currentCostImpact}`))
      console.log(chalk.green(`    New: ${appropriateCostImpact}`))
      
      const updatedFields = {
        ...link.solution_fields,
        cost_impact: appropriateCostImpact
      }
      
      const { error: updateError } = await supabase
        .from('goal_implementation_links')
        .update({ solution_fields: updatedFields })
        .eq('id', link.id)
      
      if (!updateError) {
        fixedCount++
      } else {
        console.error(chalk.red(`    ❌ Failed to update: ${updateError.message}`))
      }
    }
  }
  
  // Summary
  console.log(chalk.cyan('\n' + '═'.repeat(50)))
  console.log(chalk.green(`✅ Fixed ${fixedCount} diet/nutrition cost impact values`))
  
  // Show distribution after fix
  const { data: distribution, error: distError } = await supabase
    .from('goal_implementation_links')
    .select(`
      solution_fields->>'cost_impact' as cost_impact
    `)
    .eq('solution_variants.solutions.solution_category', 'diet_nutrition')
    .eq('rating_count', 1)
  
  if (!distError && distribution) {
    const counts: Record<string, number> = {}
    distribution.forEach(row => {
      const value = row.cost_impact || 'null'
      counts[value] = (counts[value] || 0) + 1
    })
    
    console.log(chalk.blue('\n📊 New distribution of cost_impact values:'))
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([value, count]) => {
        console.log(chalk.gray(`  ${value}: ${count}`))
      })
  }
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})