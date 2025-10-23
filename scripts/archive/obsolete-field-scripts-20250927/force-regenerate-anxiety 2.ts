#!/usr/bin/env tsx

/**
 * FORCE ANXIETY SOLUTION REGENERATION WITH API COST TRACKING
 *
 * This script bypasses ALL detection logic and force regenerates EVERY solution
 * for the "Calm my anxiety" goal to measure actual Gemini API usage and costs.
 *
 * Key differences from generate-validated-fields.ts:
 * - NO quality detection - regenerates ALL solutions
 * - NO field quality checks - regenerates ALL required fields
 * - Detailed API call tracking and cost analysis
 * - Cost extrapolation across entire platform
 *
 * Usage:
 *   npx tsx scripts/force-regenerate-anxiety.ts --dry-run
 *   npx tsx scripts/force-regenerate-anxiety.ts
 */

import { createClient } from '@supabase/supabase-js'
import chalk from 'chalk'
import dotenv from 'dotenv'
import { GeminiClient } from './ai-solution-generator/generators/gemini-client.js'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Enhanced Gemini client with API call tracking
class TrackedGeminiClient extends GeminiClient {
  private apiCallCount = 0
  private startTime = Date.now()

  async generateContent(prompt: string): Promise<string> {
    this.apiCallCount++
    console.log(chalk.cyan(`🤖 API Call #${this.apiCallCount}`))
    return super.generateContent(prompt)
  }

  getApiStats() {
    const elapsedTime = Date.now() - this.startTime
    const stats = this.getUsageStats()
    return {
      totalCalls: this.apiCallCount,
      elapsedTimeMs: elapsedTime,
      requestsToday: stats.requestsToday,
      requestsRemaining: stats.requestsRemaining
    }
  }
}

// Initialize tracked Gemini client
let geminiClient: TrackedGeminiClient | null = null
if (process.env.GEMINI_API_KEY) {
  geminiClient = new TrackedGeminiClient(process.env.GEMINI_API_KEY)
  console.log(chalk.green('✅ Gemini API client initialized with tracking'))
} else {
  console.error(chalk.red('❌ GEMINI_API_KEY required for this script'))
  process.exit(1)
}

const ANXIETY_GOAL_ID = '56e2801e-0d78-4abd-a795-869e5b780ae7'

// Category configurations - what fields each category needs
const CATEGORY_FIELD_CONFIG: Record<string, {
  keyFields: string[]
  arrayField: string | null
}> = {
  'therapists_counselors': {
    keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
    arrayField: 'challenges'
  },
  'coaches_mentors': {
    keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
    arrayField: 'challenges'
  },
  'alternative_practitioners': {
    keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
    arrayField: 'side_effects'
  },
  'professional_services': {
    keyFields: ['time_to_results', 'session_frequency', 'specialty', 'cost'],
    arrayField: 'challenges'
  },
  'medical_procedures': {
    keyFields: ['time_to_results', 'session_frequency', 'wait_time', 'cost'],
    arrayField: 'side_effects'
  },
  'doctors_specialists': {
    keyFields: ['time_to_results', 'wait_time', 'insurance_coverage', 'cost'],
    arrayField: 'challenges'
  },
  'crisis_resources': {
    keyFields: ['time_to_results', 'response_time', 'cost'],
    arrayField: null
  },
  'medications': {
    keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },
  'supplements_vitamins': {
    keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },
  'natural_remedies': {
    keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },
  'beauty_skincare': {
    keyFields: ['time_to_results', 'skincare_frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },
  'meditation_mindfulness': {
    keyFields: ['time_to_results', 'practice_length', 'frequency'],
    arrayField: 'challenges'
  },
  'exercise_movement': {
    keyFields: ['time_to_results', 'frequency', 'cost'],
    arrayField: 'challenges'
  },
  'habits_routines': {
    keyFields: ['time_to_results', 'time_commitment', 'cost'],
    arrayField: 'challenges'
  },
  'books_courses': {
    keyFields: ['time_to_results', 'format', 'learning_difficulty', 'cost'],
    arrayField: 'challenges'
  },
  'products_devices': {
    keyFields: ['time_to_results', 'ease_of_use', 'product_type', 'cost'],
    arrayField: 'challenges'
  },
  'groups_communities': {
    keyFields: ['time_to_results', 'meeting_frequency', 'group_size', 'cost'],
    arrayField: 'challenges'
  },
  'support_groups': {
    keyFields: ['time_to_results', 'meeting_frequency', 'format', 'cost'],
    arrayField: 'challenges'
  },
  'diet_nutrition': {
    keyFields: ['time_to_results', 'weekly_prep_time', 'still_following', 'cost'],
    arrayField: 'challenges'
  },
  'sleep': {
    keyFields: ['time_to_results', 'previous_sleep_hours', 'still_following', 'cost'],
    arrayField: 'challenges'
  },
  'apps_software': {
    keyFields: ['time_to_results', 'usage_frequency', 'subscription_type', 'cost'],
    arrayField: 'challenges'
  },
  'hobbies_activities': {
    keyFields: ['time_to_results', 'time_commitment', 'frequency', 'cost'],
    arrayField: 'challenges'
  },
  'financial_products': {
    keyFields: ['time_to_results', 'financial_benefit', 'access_time'],
    arrayField: 'challenges'
  }
}

// Valid dropdown values from actual forms
const VALID_DROPDOWN_VALUES: Record<string, string[]> = {
  'session_frequency': [
    'One-time only',
    'As needed',
    'Multiple times per week',
    'Weekly',
    'Fortnightly',
    'Monthly',
    'Every 2-3 months',
    'Other'
  ],
  'session_length': [
    '15 minutes',
    '30 minutes',
    '45 minutes',
    '60 minutes',
    '90 minutes',
    '2+ hours',
    'Varies'
  ],
  'learning_difficulty': [
    'Beginner',
    'Intermediate',
    'Advanced',
    'All levels'
  ],
  'group_size': [
    '2-5 people',
    '6-10 people',
    '11-15 people',
    '16-25 people',
    '25+ people',
    'Varies'
  ],
  'practice_length': [
    '5-10 minutes',
    '10-15 minutes',
    '15-30 minutes',
    '30-45 minutes',
    '45+ minutes',
    'Varies'
  ],
  'frequency': [
    'Daily',
    'Multiple times daily',
    'Every other day',
    'Weekly',
    'As needed'
  ],
  'length_of_use': [
    'Short-term (days-weeks)',
    'Medium-term (1-6 months)',
    'Long-term (6+ months)',
    'Ongoing/permanent'
  ],
  'skincare_frequency': [
    'Once daily',
    'Twice daily',
    'Every other day',
    'Weekly',
    'As needed'
  ],
  'wait_time': [
    'Same week',
    '1-2 weeks',
    '3-4 weeks',
    '1-2 months',
    '3+ months'
  ],
  'insurance_coverage': [
    'Fully covered',
    'Partially covered',
    'Not covered',
    'Coverage varies by plan'
  ],
  'cost': [
    'Free',
    'Under $10/month',
    '$10-25/month',
    '$25-50/month',
    '$50-100/month',
    '$100-200/month',
    'Over $200/month',
    'Under $20',
    '$20-50',
    '$50-100',
    '$100-250',
    '$250-500',
    'Over $1000'
  ],
  'subscription_type': [
    'Free',
    'Freemium',
    'Monthly subscription',
    'One-time purchase',
    'Annual subscription'
  ],
  'time_commitment': [
    'Under 5 minutes',
    '5-15 minutes',
    '15-30 minutes',
    '30-60 minutes',
    'Over 1 hour'
  ],
  'format': [
    'Book',
    'Online course',
    'Audiobook',
    'Video course',
    'Workshop/seminar',
    'In-person',
    'Online/virtual',
    'Hybrid',
    'Phone-based'
  ],
  'usage_frequency': [
    'Multiple times daily',
    'Daily',
    'Several times per week',
    'Weekly',
    'Monthly',
    'As needed'
  ],
  'weekly_prep_time': [
    'Under 1 hour',
    '1-2 hours',
    '2-3 hours',
    '3-4 hours',
    'Over 4 hours',
    '4-6 hours',
    'Over 6 hours'
  ],
  'still_following': [
    'Yes, consistently',
    'Yes, mostly',
    'Mostly, with some flexibility',
    'Mostly',
    'Sometimes',
    'Partially',
    'Occasionally',
    'No, stopped'
  ],
  'previous_sleep_hours': [
    'Under 4 hours',
    '4 hours or less',
    '4-5 hours',
    '5 hours',
    '5-6 hours',
    '6 hours',
    '6-7 hours',
    '7 hours',
    '7-8 hours',
    '8+ hours',
    'Over 8 hours'
  ],
  'time_to_results': [
    'Immediately',
    'Within days',
    '1-2 weeks',
    '3-4 weeks',
    '1-2 months',
    '3-6 months',
    '6+ months',
    'Still evaluating'
  ],
  'response_time': [
    'Immediate',
    'Within 5 minutes',
    'Within 30 minutes',
    'Within hours',
    'Within 24 hours',
    'Within a couple of days',
    'More than a couple of days'
  ],
  'ease_of_use': [
    'Very easy to use',
    'Easy to use',
    'Moderate learning curve',
    'Difficult to use'
  ],
  'product_type': [
    'Fitness tracker',
    'Smart device',
    'Wearable',
    'Home appliance',
    'Audio equipment',
    'Other'
  ],
  'meeting_frequency': [
    'Daily',
    'Several times per week',
    'Weekly',
    'Fortnightly',
    'Monthly',
    'As needed'
  ],
  'specialty': [
    'Financial planning',
    'Legal consultation',
    'Career coaching',
    'Life coaching',
    'Business consulting'
  ],
  'financial_benefit': [
    '$100-250/month saved/earned',
    '$25-100/month saved/earned',
    'No direct financial benefit',
    '$250-500/month saved/earned',
    'Varies significantly'
  ],
  'access_time': [
    '1-3 business days',
    'Instant approval',
    'Same day',
    '1-2 weeks',
    '2-4 weeks'
  ],
  'challenges': [
    'Time constraints',
    'Consistency',
    'Initial learning curve',
    'Cost',
    'Finding qualified provider',
    'Requires lifestyle changes',
    'Time commitment',
    'Lack of immediate results',
    'Self-doubt',
    'Emotional overwhelm',
    'Difficulty concentrating'
  ],
  'side_effects': [
    'None',
    'Drowsiness',
    'Nausea',
    'Headache',
    'Dizziness',
    'Fatigue',
    'Skin irritation',
    'Dry mouth',
    'Weight gain',
    'Sexual side effects',
    'Mood changes'
  ]
}

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
 * Generate field distribution using Gemini AI
 */
async function generateFieldWithGemini(
  fieldName: string,
  category: string,
  solutionTitle: string
): Promise<DistributionData | null> {
  if (!geminiClient) {
    console.log(chalk.red(`❌ No Gemini client available for ${fieldName}`))
    return null
  }

  // Get valid dropdown values
  const validValues = VALID_DROPDOWN_VALUES[fieldName]
  if (!validValues) {
    console.log(chalk.yellow(`⚠️  No valid dropdown values for field: ${fieldName}`))
    return null
  }

  const prompt = `Based on medical literature and research data, generate a realistic distribution for this field.

Solution: ${solutionTitle}
Category: ${category}
Field: ${fieldName}
Valid options: ${validValues.join(', ')}

Return ONLY a JSON object with this structure:
{
  "mode": "most_common_option",
  "values": [
    {"value": "option1", "count": 40, "percentage": 40, "source": "research"},
    {"value": "option2", "count": 30, "percentage": 30, "source": "studies"}
  ],
  "totalReports": 100,
  "dataSource": "ai_research"
}

Requirements:
- Use 4-6 different options from the valid list
- Percentages must add to 100
- Base on realistic research patterns, not equal distributions`

  try {
    const response = await geminiClient.generateContent(prompt)
    const distributionData = JSON.parse(response)

    // Validate response
    if (!distributionData.mode || !Array.isArray(distributionData.values)) {
      throw new Error('Invalid response structure')
    }

    // Validate all values are from the allowed list
    for (const item of distributionData.values) {
      if (!validValues.includes(item.value)) {
        throw new Error(`Invalid dropdown value: ${item.value}`)
      }
    }

    return distributionData
  } catch (error: any) {
    console.log(chalk.red(`   ❌ Gemini failed for ${fieldName}: ${error.message}`))
    return null
  }
}

/**
 * Get all solutions for anxiety goal - NO FILTERING, NO DETECTION
 */
async function getAllAnxietySolutions() {
  console.log(chalk.cyan('🔍 Getting ALL solutions for anxiety goal...'))

  const { data: solutions, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      goal_id,
      aggregated_fields,
      solution_variants!inner(
        solutions!inner(
          title,
          solution_category
        )
      )
    `)
    .eq('goal_id', ANXIETY_GOAL_ID)
    .eq('data_display_mode', 'ai')

  if (error) {
    console.error(chalk.red('Database error:'), error)
    return []
  }

  const transformedSolutions = solutions.map(solution => ({
    link_id: solution.id,
    goal_id: solution.goal_id,
    aggregated_fields: solution.aggregated_fields || {},
    solution_title: solution.solution_variants?.solutions?.title || 'Unknown',
    solution_category: solution.solution_variants?.solutions?.solution_category || 'unknown'
  }))

  console.log(chalk.white(`📊 Found ${transformedSolutions.length} total solutions`))
  return transformedSolutions
}

/**
 * Force regenerate ALL required fields for a solution
 */
async function forceRegenerateAllFields(solution: any, dryRun: boolean = false): Promise<boolean> {
  const category = solution.solution_category
  const config = CATEGORY_FIELD_CONFIG[category]

  if (!config) {
    console.log(chalk.yellow(`⚠️  Unknown category: ${category}, skipping`))
    return false
  }

  // Get ALL required fields for this category
  const requiredFields = [...config.keyFields]
  if (config.arrayField) {
    requiredFields.push(config.arrayField)
  }

  console.log(chalk.white(`🔄 FORCE REGENERATING: ${solution.solution_title}`))
  console.log(chalk.gray(`   Category: ${category}`))
  console.log(chalk.gray(`   Required fields: ${requiredFields.join(', ')}`))

  if (dryRun) {
    console.log(chalk.blue('🔍 DRY RUN - Would regenerate ALL required fields'))
    return true
  }

  const newFields: Record<string, any> = {}
  let successfulFields = 0

  // Force regenerate every required field
  for (const fieldName of requiredFields) {
    console.log(chalk.cyan(`   🤖 Generating ${fieldName}...`))

    const fieldData = await generateFieldWithGemini(
      fieldName,
      category,
      solution.solution_title
    )

    if (fieldData) {
      newFields[fieldName] = fieldData
      successfulFields++
      console.log(chalk.green(`   ✅ Generated ${fieldName} (${fieldData.values.length} options)`))
    } else {
      console.log(chalk.red(`   ❌ Failed to generate ${fieldName}`))
    }

    // Brief delay between fields to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Update the database with ALL regenerated fields
  if (Object.keys(newFields).length > 0) {
    const { error } = await supabase
      .from('goal_implementation_links')
      .update({ aggregated_fields: newFields })
      .eq('id', solution.link_id)

    if (error) {
      console.error(chalk.red(`❌ Database update failed:`), error)
      return false
    }

    console.log(chalk.green(`✅ Successfully regenerated ${successfulFields}/${requiredFields.length} fields`))
    return true
  }

  return false
}

/**
 * Calculate and display cost analysis
 */
function displayCostAnalysis(stats: any, solutionCount: number) {
  console.log(chalk.cyan('\n' + '='.repeat(60)))
  console.log(chalk.cyan('📊 GEMINI API COST ANALYSIS'))
  console.log(chalk.cyan('='.repeat(60)))

  console.log(chalk.white(`\n🎯 Anxiety Goal Results:`))
  console.log(chalk.gray(`   Solutions processed: ${solutionCount}`))
  console.log(chalk.gray(`   Total API calls: ${stats.totalCalls}`))
  console.log(chalk.gray(`   Processing time: ${Math.round(stats.elapsedTimeMs / 1000)}s`))
  console.log(chalk.gray(`   Requests today: ${stats.requestsToday}`))
  console.log(chalk.gray(`   Remaining in free tier: ${stats.requestsRemaining}`))

  // Calculate platform-wide extrapolation
  const totalSolutions = 3873 // Total solutions on platform
  const callsPerSolution = stats.totalCalls / solutionCount
  const totalCallsNeeded = Math.ceil(callsPerSolution * totalSolutions)

  console.log(chalk.white(`\n🌍 Platform-Wide Extrapolation:`))
  console.log(chalk.gray(`   Total solutions on platform: ${totalSolutions}`))
  console.log(chalk.gray(`   Average API calls per solution: ${callsPerSolution.toFixed(2)}`))
  console.log(chalk.gray(`   Total API calls needed: ${totalCallsNeeded.toLocaleString()}`))

  // Cost analysis
  const freeDaily = 1000
  const daysNeeded = Math.ceil(totalCallsNeeded / freeDaily)
  const callsBeyondFree = Math.max(0, totalCallsNeeded - freeDaily)

  console.log(chalk.white(`\n💰 Cost Analysis:`))
  console.log(chalk.gray(`   Free tier limit: ${freeDaily} calls/day`))
  console.log(chalk.gray(`   Days needed (free tier): ${daysNeeded}`))
  console.log(chalk.gray(`   Calls beyond free tier: ${callsBeyondFree.toLocaleString()}`))

  if (callsBeyondFree > 0) {
    // Gemini 2.0 Flash pricing (estimated)
    const estimatedCostPer1000 = 0.075 // $0.075 per 1K requests (rough estimate)
    const totalCost = (callsBeyondFree / 1000) * estimatedCostPer1000
    console.log(chalk.yellow(`   Estimated cost beyond free tier: $${totalCost.toFixed(2)}`))
  } else {
    console.log(chalk.green(`   ✅ Can be completed entirely within free tier!`))
  }

  console.log(chalk.cyan('\n' + '='.repeat(60)))
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')

  console.log(chalk.cyan('🚀 FORCE ANXIETY REGENERATION WITH API TRACKING'))
  console.log(chalk.cyan('='.repeat(60)))

  if (dryRun) {
    console.log(chalk.yellow('🔍 DRY RUN MODE - No changes will be made\n'))
  }

  // Get ALL anxiety solutions
  const solutions = await getAllAnxietySolutions()

  if (solutions.length === 0) {
    console.log(chalk.red('❌ No solutions found'))
    return
  }

  let successCount = 0
  let errorCount = 0

  // Force regenerate EVERY solution (limit to first 5 for initial test)
  const solutionsToProcess = solutions.slice(0, 5)
  for (const solution of solutionsToProcess) {
    const success = await forceRegenerateAllFields(solution, dryRun)

    if (success) {
      successCount++
    } else {
      errorCount++
    }
  }

  // Display final results and cost analysis
  const stats = geminiClient!.getApiStats()

  console.log(chalk.white(`\n📈 Regeneration Results:`))
  console.log(chalk.green(`   ✅ Successful: ${successCount}`))
  console.log(chalk.red(`   ❌ Errors: ${errorCount}`))
  console.log(chalk.gray(`   Total processed: ${solutions.length}`))

  displayCostAnalysis(stats, solutionsToProcess.length)

  console.log(chalk.green('\n✨ Analysis complete!'))
}

main().catch(console.error)