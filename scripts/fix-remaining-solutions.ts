#!/usr/bin/env tsx

/**
 * Targeted script to fix ONLY solutions that actually need transformation
 * Identifies solutions lacking proper DistributionData format and processes them
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
  console.log(chalk.cyan('🎯 Targeted Solution Quality Fix'))
  console.log(chalk.cyan('━'.repeat(50)))

  // Find solutions that need transformation
  const query = `
    SELECT
      gil.id,
      gil.goal_id,
      gil.solution_fields,
      s.title as solution_title,
      s.solution_category
    FROM goal_implementation_links gil
    JOIN solution_variants sv ON gil.implementation_id = sv.id
    JOIN solutions s ON sv.solution_id = s.id
    WHERE gil.data_display_mode = 'ai'
      AND gil.solution_fields IS NOT NULL
      AND gil.solution_fields != '{}'::jsonb
      AND (
        -- Solutions with fields that lack proper DistributionData format
        EXISTS (
          SELECT 1 FROM jsonb_each(gil.solution_fields) AS field(key, value)
          WHERE jsonb_typeof(field.value) = 'object'
            AND (
              field.value ? 'mode' = false
              OR field.value ? 'values' = false
              OR field.value ? 'totalReports' = false
              OR jsonb_typeof(field.value->'values') != 'array'
            )
        )
        OR
        -- Solutions with plain string/array fields (not DistributionData objects)
        EXISTS (
          SELECT 1 FROM jsonb_each(gil.solution_fields) AS field(key, value)
          WHERE jsonb_typeof(field.value) IN ('string', 'array')
        )
      )
    LIMIT 1000
  `

  const { data: solutions, error } = await supabase.rpc('exec_sql', {
    sql: query
  })

  if (error) {
    console.error(chalk.red('❌ Error fetching solutions:'), error)
    process.exit(1)
  }

  console.log(chalk.green(`✅ Found ${solutions?.length || 0} solutions needing transformation`))

  if (!solutions || solutions.length === 0) {
    console.log(chalk.yellow('🎉 All solutions are already in proper DistributionData format!'))
    process.exit(0)
  }

  // Show sample of what needs fixing
  console.log(chalk.yellow('\n📋 Sample solutions needing transformation:'))
  solutions.slice(0, 5).forEach((sol: any) => {
    console.log(chalk.white(`   ${sol.solution_title} (${sol.solution_category})`))
  })

  console.log(chalk.cyan('\n' + '━'.repeat(50)))
  console.log(chalk.yellow('💡 Run the main transformation script with targeted processing'))
  console.log(chalk.white('   npx tsx scripts/fix-ai-data-quality-final.ts --batch-size 50'))
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})