#!/usr/bin/env node

/**
 * Fix Empty Solution Links Script
 * 
 * Injects appropriate field data for the 130 empty solution links
 * that were created before the generator improvements.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import chalk from 'chalk'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Template field data based on current generator output
const SOLUTION_FIELD_TEMPLATES = {
  'Headspace App': {
    cost: '$12.99/month',
    time_to_results: 'Immediately',
    usage_frequency: 'Daily',
    subscription_type: 'Monthly subscription',
    challenges: ['Consistency', 'Finding time for sessions', 'Requires discipline']
  },
  
  'Cognitive Behavioral Therapy (CBT) with a Licensed Therapist': {
    cost: '$50-100',
    time_to_results: '1-2 months',
    session_frequency: 'Weekly',
    format: 'In-person',
    challenges: ['Finding the right therapist match', 'Maintaining consistent engagement', 'Initial cost']
  },
  
  'App: Sleep Cycle': {
    cost: '$29.99/year',
    time_to_results: '1-2 weeks',
    usage_frequency: 'Daily',
    subscription_type: 'Annual subscription', 
    challenges: ['Remembering to use consistently', 'Understanding sleep data', 'Battery drain']
  },
  
  'Intermittent Fasting (16/8 Method)': {
    cost_impact: 'Saves money',
    time_to_results: '1-2 weeks',
    weekly_prep_time: 'Under 30 minutes',
    still_following: 'High with consistent effort',
    challenges: ['Initial hunger', 'Social eating situations', 'Maintaining consistency']
  },
  
  'Mindful Eating Practices': {
    cost_impact: 'Free',
    time_to_results: '3-4 weeks',
    weekly_prep_time: 'Under 30 minutes',
    still_following: 'Moderate with effort',
    challenges: ['Remembering to eat mindfully', 'Slowing down meals', 'Emotional eating triggers']
  },
  
  'Couch to 5K Running Program': {
    startup_cost: '$50-100',
    ongoing_cost: 'Free/No ongoing cost',
    time_to_results: '3-4 weeks',
    frequency: '3 times per week',
    challenges: ['Initial fatigue', 'Weather dependency', 'Finding motivation']
  },
  
  'Dialectical Behavior Therapy (DBT) Skills Training': {
    cost: '$20-50',
    time_to_results: '1-2 months',
    format: 'Online course',
    time_to_complete: '5-10 hours',
    challenges: ['Applying skills in real situations', 'Understanding complex concepts', 'Requires practice']
  },
  
  'Acupuncture': {
    cost: '$50-100',
    time_to_results: '3-4 weeks',
    session_frequency: 'Weekly',
    treatment_type: 'Traditional needling',
    side_effects: ['Mild bruising', 'Temporary soreness']
  }
}

function transformToAggregatedFields(fields: Record<string, any>): Record<string, any> {
  const aggregated: any = {
    _metadata: {
      computed_at: new Date().toISOString(),
      last_aggregated: new Date().toISOString(),
      total_ratings: 1,
      data_source: 'template_injected',
      confidence: 'template_generated'
    }
  }

  // Transform each field to distribution format
  for (const [fieldName, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      // Array fields (like challenges, side_effects)
      const totalItems = value.length
      aggregated[fieldName] = {
        mode: value[0], // Most common item
        values: value.map((item, index) => ({
          value: item,
          count: 1,
          percentage: Math.round(100 / totalItems) + (index === totalItems - 1 ? 100 % totalItems : 0)
        })),
        totalReports: 1
      }
    } else {
      // Single value fields
      aggregated[fieldName] = {
        mode: value,
        values: [{
          value: value,
          count: 1,
          percentage: 100
        }],
        totalReports: 1
      }
    }
  }

  return aggregated
}

async function fixEmptyLinks() {
  console.log(chalk.cyan('🔧 WWFM Empty Links Repair Script'))
  console.log(chalk.gray('=' .repeat(50)))
  
  // Get all empty links with solution titles
  const { data: emptyLinks, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      solution_variants!inner(
        solutions!inner(title)
      )
    `)
    .eq('solution_fields', '{}')
    .eq('aggregated_fields', '{}')
  
  if (error) {
    console.error(chalk.red('❌ Error fetching empty links:'), error)
    return
  }
  
  console.log(chalk.yellow(`📋 Found ${emptyLinks.length} empty links to fix`))
  
  let fixedCount = 0
  let skippedCount = 0
  
  for (const link of emptyLinks) {
    const solutionTitle = link.solution_variants.solutions.title
    const template = SOLUTION_FIELD_TEMPLATES[solutionTitle]
    
    if (!template) {
      console.log(chalk.gray(`   ⏭️  Skipping "${solutionTitle}" (no template)`))
      skippedCount++
      continue
    }
    
    console.log(chalk.blue(`   🔧 Fixing "${solutionTitle}"`))
    
    const aggregatedFields = transformToAggregatedFields(template)
    
    const { error: updateError } = await supabase
      .from('goal_implementation_links')
      .update({
        solution_fields: template,
        aggregated_fields: aggregatedFields
      })
      .eq('id', link.id)
    
    if (updateError) {
      console.error(chalk.red(`   ❌ Error updating link ${link.id}:`), updateError)
    } else {
      console.log(chalk.green(`   ✅ Fixed "${solutionTitle}"`))
      fixedCount++
    }
  }
  
  console.log(chalk.green('\n📊 Repair Summary:'))
  console.log(chalk.green(`   ✅ Fixed: ${fixedCount} links`))
  console.log(chalk.gray(`   ⏭️  Skipped: ${skippedCount} links (no template)`))
  console.log(chalk.cyan(`   🎉 Repair complete!`))
}

fixEmptyLinks().catch(console.error)