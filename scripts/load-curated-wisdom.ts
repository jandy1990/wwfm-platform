#!/usr/bin/env tsx

/**
 * Load manually curated wisdom data into database
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import chalk from 'chalk'
import { WISDOM_DATA } from './wisdom-data'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function main() {
  console.log(chalk.bold.blue('\n🌟 Loading Curated Wisdom Data\n'))

  // Get all goals
  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select('id, title')
    .order('title')

  if (goalsError || !goals) {
    throw new Error(`Failed to fetch goals: ${goalsError?.message}`)
  }

  console.log(chalk.blue(`📊 Found ${goals.length} goals in database\n`))

  let inserted = 0
  let updated = 0
  let errors = 0
  let missing = 0

  for (const goal of goals) {
    try {
      const wisdomData = WISDOM_DATA[goal.title]

      if (!wisdomData) {
        console.log(chalk.yellow(`⚠️  No wisdom data for: ${goal.title}`))
        missing++
        continue
      }

      console.log(chalk.cyan(`Processing: ${goal.title} (${wisdomData.score}/5)`))

      // Check if exists
      const { data: existing } = await supabase
        .from('goal_wisdom_scores')
        .select('id')
        .eq('goal_id', goal.id)
        .single()

      const wisdomRecord = {
        goal_id: goal.id,
        lasting_value_score: wisdomData.score,
        common_benefits: wisdomData.benefits,
        total_retrospectives: 0,
        data_source: 'ai_training_data',
        ai_generated_at: new Date().toISOString(),
        retrospectives_6m: 0,
        retrospectives_12m: 0,
        worth_pursuing_percentage: null
      }

      if (existing) {
        // Update
        const { error } = await supabase
          .from('goal_wisdom_scores')
          .update(wisdomRecord)
          .eq('goal_id', goal.id)

        if (error) throw error
        console.log(chalk.blue('  ✓ Updated'))
        updated++
      } else {
        // Insert
        const { error } = await supabase
          .from('goal_wisdom_scores')
          .insert(wisdomRecord)

        if (error) throw error
        console.log(chalk.green('  ✓ Inserted'))
        inserted++
      }
    } catch (error) {
      console.error(chalk.red(`  ✗ Error: ${(error as Error).message}`))
      errors++
    }
  }

  // Summary
  console.log(chalk.bold.green(`\n✅ Complete!\n`))
  console.log(chalk.blue('📊 Summary:'))
  console.log(chalk.gray(`  Inserted: ${inserted}`))
  console.log(chalk.gray(`  Updated: ${updated}`))
  console.log(chalk.gray(`  Errors: ${errors}`))
  console.log(chalk.gray(`  Missing data: ${missing}\n`))

  if (missing > 0) {
    console.log(chalk.yellow(`⚠️  ${missing} goals are missing wisdom data in the curated file\n`))
  }
}

main().catch(error => {
  console.error(chalk.red(`\n❌ Fatal error: ${error.message}\n`))
  process.exit(1)
})
