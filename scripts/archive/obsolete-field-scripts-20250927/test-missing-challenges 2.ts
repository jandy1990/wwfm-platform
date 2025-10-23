#!/usr/bin/env tsx

/**
 * Test script for solutions with missing challenges field
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

async function main() {
  console.log(chalk.cyan('🧪 Testing Missing Challenges Fix'))
  console.log(chalk.cyan('━'.repeat(50)))

  // Find specific solutions with missing challenges
  const { data: links, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      goal_id,
      solution_fields,
      solution_variants!inner(
        solutions!inner(
          id,
          title,
          solution_category
        )
      )
    `)
    .eq('data_display_mode', 'ai')
    .not('solution_fields', 'is', null)
    .neq('solution_fields', '{}')
    .eq('solution_variants.solutions.solution_category', 'apps_software')
    .in('solution_variants.solutions.title', ['Coinbase App', 'Plant Nanny', 'Streaks Habit Tracker App'])
    .limit(5)

  if (error) {
    console.error(chalk.red('❌ Error fetching solutions:'), error)
    process.exit(1)
  }

  if (!links || links.length === 0) {
    console.log(chalk.yellow('No solutions found'))
    process.exit(0)
  }

  console.log(chalk.green(`✅ Found ${links.length} solutions to analyze\n`))

  for (const link of links) {
    const solution = link.solution_variants?.solutions
    if (!solution) continue

    console.log(chalk.cyan(`🔍 ${solution.title}`))
    console.log(chalk.white(`   Link ID: ${link.id}`))

    if (link.solution_fields) {
      const fields = Object.keys(link.solution_fields)
      console.log(chalk.white(`   Fields: ${fields.join(', ')}`))

      // Check each field
      for (const [fieldName, fieldValue] of Object.entries(link.solution_fields)) {
        const isTransformed = fieldValue &&
                             typeof fieldValue === 'object' &&
                             'dataSource' in fieldValue

        console.log(chalk.white(`   ${fieldName}: ${isTransformed ? chalk.green('✓ Transformed') : chalk.red('✗ Needs Transform')}`))
      }
    }

    console.log('')
  }
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})