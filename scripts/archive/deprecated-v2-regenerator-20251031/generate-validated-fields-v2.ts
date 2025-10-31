#!/usr/bin/env tsx

/**
 * ⚠️⚠️⚠️ DEPRECATED - DO NOT USE THIS SCRIPT ⚠️⚠️⚠️
 *
 * DEPRECATED: October 31, 2025
 * ARCHIVED TO: scripts/archive/deprecated-v2-regenerator-20251031/
 *
 * CRITICAL ISSUES THAT LED TO DEPRECATION:
 * 1. ❌ Uses hardcoded category-field mappings (lines 44-77) that DO NOT match SSOT
 * 2. ❌ SSOT (GoalPageClient.tsx) defines 'keyFields' + 'arrayField' structure
 * 3. ❌ V2 uses flat list mixing display fields with array fields
 * 4. ❌ Missing fields: doctors_specialists missing 'insurance_coverage', has wrong 'session_frequency'
 * 5. ❌ Missing fields: exercise_movement missing 'duration'
 * 6. ❌ Missing fields: professional_services has 'session_length' instead of 'specialty'
 * 7. ❌ Missing fields: support_groups has 'group_size' instead of 'format'
 * 8. ❌ Wrong field for financial_products: has 'cost' instead of 'cost_type'
 * 9. ❌ Auto-fix logic (lines 320-362) masks data quality problems
 * 10. ❌ Completely duplicated code - out of sync with shared libraries at lib/ai-generation/fields/
 *
 * USE INSTEAD: scripts/generate-validated-fields-v3.ts
 * - ✅ Aligned to SSOT (GoalPageClient.tsx CATEGORY_CONFIG)
 * - ✅ Uses shared validation libraries
 * - ✅ Proper keyFields + arrayField separation
 * - ✅ No hardcoded mappings
 * - ✅ Better error handling and state management
 *
 * SSOT AUTHORITY:
 * - Code: components/goal/GoalPageClient.tsx CATEGORY_CONFIG (Lines 56-407)
 * - Docs: docs/solution-fields-ssot.md
 *
 * This file is preserved for historical reference only.
 *
 * @deprecated since 2025-10-31
 * @see scripts/generate-validated-fields-v3.ts for replacement
 */

/**
 * ORIGINAL DESCRIPTION (DEPRECATED):
 * ENHANCED VALIDATED FIELD GENERATION SCRIPT V2
 *
 * This script creates a truly scalable field generation system by:
 * 1. REMOVING ALL hardcoded patterns - uses ONLY AI-generated data
 * 2. Auto-fixing invalid dropdown values and string fields inline
 * 3. Supporting multiple AI providers (Gemini, Claude, OpenAI)
 * 4. Being goal-aware for contextually appropriate distributions
 * 5. Handling all error types automatically without separate fix scripts
 */

import { createClient } from '@supabase/supabase-js'
import { GeminiClient } from './field-generation-utils/gemini-client'
import { mapAllFieldsToDropdowns } from './field-generation-utils/value-mapper'
import { parseJSONSafely } from './field-generation-utils/json-repair'
import chalk from 'chalk'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Database client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

interface DistributionValue {
  value: string
  count: number
  percentage: number
  source: string
}

interface DistributionData {
  mode: string
  values: DistributionValue[]
  totalReports: number
  dataSource: string
}

// Category field mappings from GoalPageClient.tsx
const CATEGORY_REQUIRED_FIELDS: Record<string, string[]> = {
  // Session-based categories
  therapists_counselors: ['session_frequency', 'session_length', 'cost', 'time_to_results'],
  coaches_mentors: ['session_frequency', 'session_length', 'cost', 'time_to_results'],
  alternative_practitioners: ['session_frequency', 'session_length', 'cost', 'time_to_results'],

  // Medical categories
  doctors_specialists: ['session_frequency', 'wait_time', 'cost', 'time_to_results'],
  medical_procedures: ['session_frequency', 'wait_time', 'cost', 'time_to_results'],
  crisis_resources: ['response_time', 'cost', 'time_to_results'],

  // Practice categories
  meditation_mindfulness: ['practice_length', 'frequency', 'time_to_results'],
  exercise_movement: ['frequency', 'cost', 'time_to_results'],
  habits_routines: ['time_commitment', 'cost', 'time_to_results'],

  // Dosage categories
  medications: ['frequency', 'length_of_use', 'cost', 'time_to_results', 'side_effects'],
  supplements_vitamins: ['frequency', 'length_of_use', 'cost', 'time_to_results', 'side_effects'],
  natural_remedies: ['frequency', 'length_of_use', 'cost', 'time_to_results', 'side_effects'],
  beauty_skincare: ['skincare_frequency', 'length_of_use', 'cost', 'time_to_results', 'side_effects'],

  // Other categories
  books_courses: ['format', 'learning_difficulty', 'cost', 'time_to_results'],
  apps_software: ['usage_frequency', 'subscription_type', 'cost', 'time_to_results'],
  diet_nutrition: ['weekly_prep_time', 'still_following', 'cost', 'time_to_results'],
  sleep: ['previous_sleep_hours', 'still_following', 'cost', 'time_to_results'],
  products_devices: ['ease_of_use', 'product_type', 'cost', 'time_to_results'],
  hobbies_activities: ['time_commitment', 'frequency', 'cost', 'time_to_results'],
  groups_communities: ['meeting_frequency', 'group_size', 'cost', 'time_to_results'],
  financial_products: ['financial_benefit', 'access_time', 'cost', 'time_to_results'],
  support_groups: ['meeting_frequency', 'group_size', 'cost', 'time_to_results'],
  professional_services: ['session_frequency', 'session_length', 'cost', 'time_to_results']
}

// Valid dropdown values for validation - COMPLETE SET
const VALID_DROPDOWN_VALUES: Record<string, string[]> = {
  time_to_results: [
    'Immediately', 'Within days', '1-2 weeks', '3-4 weeks',
    '1-2 months', '3-6 months', '6+ months', 'Still evaluating'
  ],
  session_frequency: [
    'One-time only', 'As needed', 'Multiple times per week',
    'Weekly', 'Fortnightly', 'Monthly', 'Every 2-3 months'
  ],
  session_length: [
    '15 minutes', '30 minutes', '45 minutes', '60 minutes',
    '90 minutes', '2+ hours', 'Varies'
  ],
  frequency: [
    'once daily', 'twice daily', 'three times daily', 'four times daily',
    'as needed', 'every other day', 'twice weekly', 'weekly', 'monthly'
  ],
  practice_frequency: [
    'Daily', '5-6 times per week', '3-4 times per week', '1-2 times per week',
    'Weekly', 'Few times a month', 'As needed'
  ],
  practice_length: [
    'Under 5 minutes', '5-10 minutes', '10-20 minutes', '20-30 minutes',
    '30-45 minutes', '45-60 minutes', 'Over 1 hour'
  ],
  skincare_frequency: [
    'Twice daily (AM & PM)', 'Once daily (morning)', 'Once daily (night)',
    'Every other day', '2-3 times per week', 'Weekly', 'As needed (spot treatment)'
  ],
  length_of_use: [
    'Less than 1 month', '1-3 months', '3-6 months', '6-12 months',
    '1-2 years', 'Over 2 years', 'As needed', 'Still using'
  ],
  time_commitment: [
    '15-30 minutes', '30-60 minutes', '1-2 hours', '2-4 hours',
    'Half day', 'Full day', 'Varies significantly'
  ],
  wait_time: [
    'Same day', 'Within a week', '1-2 weeks', '2-4 weeks',
    '1-2 months', '2+ months'
  ],
  response_time: [
    'Immediate', 'Within 5 minutes', 'Within 30 minutes',
    'Within hours', 'Within 24 hours', 'Within a couple of days',
    'More than a couple of days'
  ],
  financial_benefit: [
    'No direct financial benefit', 'Under $25/month saved/earned',
    '$25-100/month saved/earned', '$100-250/month saved/earned',
    '$250-500/month saved/earned', '$500-1000/month saved/earned',
    'Over $1000/month saved/earned', 'Varies significantly'
  ],
  access_time: [
    'Instant approval', 'Same day', '1-3 business days',
    '1-2 weeks', '2-4 weeks', 'Over a month'
  ],
  weekly_prep_time: [
    'No extra time', 'Under 1 hour/week', '1-2 hours/week',
    '2-4 hours/week', '4-6 hours/week', '6-8 hours/week',
    'Over 8 hours/week'
  ],
  previous_sleep_hours: [
    'Under 4 hours', '4-5 hours', '5-6 hours', '6-7 hours',
    '7-8 hours', 'Over 8 hours', 'Highly variable'
  ],
  still_following: [
    'Yes, actively following', 'Yes, with modifications',
    'Partially following', 'No longer following'
  ],
  format: [
    'Physical book', 'E-book', 'Audiobook', 'Online course',
    'Video series', 'Workbook/PDF', 'App-based', 'Other'
  ],
  learning_difficulty: [
    'Beginner friendly', 'Some experience helpful',
    'Intermediate level', 'Advanced level', 'Expert level'
  ],
  usage_frequency: [
    'Multiple times daily', 'Daily', 'Few times a week',
    'Weekly', 'As needed'
  ],
  subscription_type: [
    'Free version', 'Monthly subscription',
    'Annual subscription', 'One-time purchase'
  ],
  meeting_frequency: [
    'Daily', 'Several times per week', 'Weekly', 'Bi-weekly',
    'Monthly', 'As needed', 'Special events only'
  ],
  group_size: [
    'Small (under 10 people)', 'Medium (10-20 people)',
    'Large (20-50 people)', 'Very large (50+ people)',
    'Varies significantly', 'One-on-one'
  ],
  ease_of_use: [
    'Very easy to use', 'Easy to use', 'Moderate learning curve',
    'Difficult to use', 'Very difficult to use'
  ],
  product_type: [
    'Physical device', 'Mobile app', 'Software', 'Wearable',
    'Subscription service', 'Other'
  ],
  cost: [
    'Free', 'Under $10/month', '$10-25/month', '$25-50/month',
    '$50-100/month', '$100-200/month', 'Over $200/month',
    'Under $20', '$20-50', '$50-100', '$100-250', '$250-500', 'Over $1000',
    'Under $50', '$50-100', '$100-150', '$150-250', '$250-500', 'Over $500'
  ],
  side_effects: [
    'None', 'Nausea', 'Headache', 'Dizziness', 'Drowsiness', 'Insomnia',
    'Dry mouth', 'Weight gain', 'Weight loss', 'Sexual side effects',
    'Constipation', 'Diarrhea', 'Fatigue', 'Anxiety', 'Mood changes',
    'Skin irritation', 'Allergic reaction', 'Other (please describe)'
  ],
  challenges: [
    'None', 'High cost', 'Limited availability', 'Not covered by insurance',
    'Long wait times', 'Finding qualified professionals', 'Scheduling conflicts',
    'Transportation issues', 'Uncomfortable side effects', 'Lack of immediate results',
    'Requires lifestyle changes', 'Social stigma', 'Time commitment',
    'Physical discomfort', 'Difficulty concentrating', 'Racing thoughts',
    'Emotional overwhelm', 'Self-doubt', 'Inconsistent results', 'Consistency',
    'Time constraints', 'Initial learning curve', 'Cost', 'Finding qualified provider'
  ]
}

// Invalid dropdown value mappings for auto-fixing
const INVALID_VALUE_MAPPINGS: Record<string, Record<string, string>> = {
  cost: {
    '$100+/month': '$100-200/month',
    '$25+/month': '$25-50/month',
  },
  challenges: {
    'Consistency with counseling': 'Consistency',
    'Processing traumatic memories': 'Emotional overwhelm',
    'Cost of NRT': 'Cost',
    'Information overload': 'Difficulty concentrating',
    'Meal planning': 'Time commitment',
    'Class schedule conflicts': 'Scheduling conflicts',
    'Meal planning and preparation': 'Time commitment',
    'Identifying low GI foods': 'Initial learning curve',
    'Finding time to cook': 'Time commitment'
  },
  side_effects: {
    'None reported': 'None',
    'Improved mood': 'None'
  }
}

// AI Provider types
type AIProvider = 'gemini' | 'claude' | 'openai' | 'auto'

class AIProviderManager {
  public geminiClient: GeminiClient

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found in environment')
    }
    this.geminiClient = new GeminiClient(process.env.GEMINI_API_KEY)
  }

  async generateFieldData(
    fieldName: string,
    category: string,
    solutionTitle: string,
    goalTitle?: string
  ): Promise<DistributionData | null> {
    try {
      return await this.callGemini(fieldName, category, solutionTitle, goalTitle)
    } catch (error: any) {
      console.log(chalk.red(`⚠️  Gemini failed: ${error.message}`))
      return null
    }
  }


  private async callGemini(
    fieldName: string,
    category: string,
    solutionTitle: string,
    goalTitle?: string
  ): Promise<DistributionData | null> {
    const goalContext = goalTitle ? `for the goal "${goalTitle}"` : ''

    // Generate natural values first, then map to dropdowns
    const prompt = `Based on your training data from medical literature, clinical studies, consumer research, and real-world usage patterns, generate a realistic distribution for the ${fieldName} field.

Solution: ${solutionTitle}
Category: ${category}
${goalContext ? `Context: When used ${goalContext}` : ''}

Field: ${fieldName}

Generate natural values as you would normally describe them (e.g., "twice daily", "$25/month", "2 weeks", "moderate"). The system will map these to the appropriate dropdown options.

Create a distribution that reflects authentic patterns from your training data. Provide 5-8 options with varied percentages (never equal splits). Use realistic sources like "research", "studies", "clinical_trials", "consumer_reports".

Return ONLY a JSON object in this exact format:
{
  "mode": "most_common_natural_value",
  "values": [
    {"value": "natural_value_1", "count": 35, "percentage": 35, "source": "research"},
    {"value": "natural_value_2", "count": 25, "percentage": 25, "source": "studies"}
  ],
  "totalReports": 100,
  "dataSource": "ai_research"
}`

    const responseText = await this.geminiClient.generateContent(prompt)

    try {
      const distributionData = parseJSONSafely(responseText.trim())

      // Map natural values to dropdown options
      if (distributionData.values) {
        for (const value of distributionData.values) {
          // Map the natural value to dropdown using the value mapper
          const mappedFields = mapAllFieldsToDropdowns({ [fieldName]: value.value }, category)
          value.value = mappedFields[fieldName] || value.value
        }

        // Update mode to mapped value
        const mappedFields = mapAllFieldsToDropdowns({ [fieldName]: distributionData.mode }, category)
        distributionData.mode = mappedFields[fieldName] || distributionData.mode
      }

      return distributionData as DistributionData
    } catch (error) {
      console.log(chalk.red(`Failed to parse Gemini response: ${responseText}`))
      throw error
    }
  }



}

/**
 * Auto-fix invalid dropdown values
 */
function autoFixInvalidDropdownValue(value: string, fieldName: string): string {
  const fieldMappings = INVALID_VALUE_MAPPINGS[fieldName]
  if (fieldMappings && fieldMappings[value]) {
    const fixedValue = fieldMappings[value]
    console.log(chalk.blue(`🔧 Auto-fixed ${fieldName}: "${value}" → "${fixedValue}"`))
    return fixedValue
  }
  return value
}

/**
 * Auto-fix an entire DistributionData object
 */
function autoFixDistributionData(data: any, fieldName: string): any {
  if (!data || typeof data !== 'object' || !Array.isArray(data.values)) {
    return data
  }

  const fixedData = { ...data }
  let hasChanges = false

  // Fix values array
  fixedData.values = data.values.map((item: any) => {
    const originalValue = item.value
    const fixedValue = autoFixInvalidDropdownValue(originalValue, fieldName)

    if (fixedValue !== originalValue) {
      hasChanges = true
      return { ...item, value: fixedValue }
    }
    return item
  })

  // Fix mode if needed
  const originalMode = data.mode
  const fixedMode = autoFixInvalidDropdownValue(originalMode, fieldName)
  if (fixedMode !== originalMode) {
    fixedData.mode = fixedMode
    hasChanges = true
  }

  return hasChanges ? fixedData : data
}

/**
 * Convert string field to DistributionData format
 */
function convertStringToDistribution(stringValue: string, fieldName: string): DistributionData {
  // Auto-fix the string value first
  const fixedValue = autoFixInvalidDropdownValue(stringValue, fieldName)

  return {
    mode: fixedValue,
    values: [
      { value: fixedValue, count: 100, percentage: 100, source: 'research' }
    ],
    totalReports: 100,
    dataSource: 'ai_research'
  }
}

/**
 * Enhanced field regeneration check
 */
function needsFieldRegeneration(fieldData: any, fieldName: string): boolean {
  // Missing or empty field
  if (!fieldData || Object.keys(fieldData).length === 0) {
    return true
  }

  // String fields need to be converted to DistributionData format
  if (typeof fieldData === 'string') {
    console.log(chalk.yellow(`📝 String field detected: ${fieldName}`))
    return true
  }

  // Check for quality issues in DistributionData
  if (fieldData.values) {
    // Single value at 100% - will be regenerated with AI for variety
    if (fieldData.values.length === 1) {
      console.log(chalk.yellow(`🔄 Single-value field detected: ${fieldName}`))
      return true
    }

    // Too few options (quality degradation)
    if (fieldData.values.length < 4) {
      console.log(chalk.yellow(`📊 Low diversity field detected: ${fieldName} (${fieldData.values.length} options)`))
      return true
    }

    // Contains fallback/trash sources
    const hasFallbackSources = fieldData.values.some((v: any) =>
      v.source?.includes('fallback') ||
      v.source?.includes('smart_fallback') ||
      v.source?.includes('equal_fallback')
    )

    if (hasFallbackSources) {
      console.log(chalk.yellow(`🗑️  Fallback sources detected: ${fieldName}`))
      return true
    }

    // Check for invalid dropdown values
    const validValues = VALID_DROPDOWN_VALUES[fieldName]
    if (validValues) {
      const hasInvalidValues = fieldData.values.some((v: any) =>
        !validValues.includes(v.value)
      )

      if (hasInvalidValues) {
        console.log(chalk.yellow(`❌ Invalid dropdown values detected: ${fieldName}`))
        return true
      }
    }
  }

  return false
}

/**
 * Get solutions for a specific goal with comprehensive data
 */
async function findSolutionsForGoal(goalId: string, limit?: number): Promise<any[]> {
  console.log(chalk.cyan(`🔍 Searching for solutions in goal: ${goalId}`))

  const { data: solutions, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      goal_id,
      aggregated_fields,
      goals!inner(title),
      solution_variants!inner(
        id,
        variant_name,
        solutions!inner(
          title,
          solution_category
        )
      )
    `)
    .eq('goal_id', goalId)
    .eq('data_display_mode', 'ai')

  if (error) {
    console.error(chalk.red('Database error:'), error)
    return []
  }

  if (!solutions || solutions.length === 0) {
    console.log(chalk.yellow(`⚠️  No AI solutions found for goal: ${goalId}`))
    return []
  }

  const transformedSolutions = solutions.map(solution => ({
    link_id: solution.id,
    goal_id: solution.goal_id,
    goal_title: solution.goals?.title || 'Unknown Goal',
    aggregated_fields: solution.aggregated_fields || {},
    solution_title: solution.solution_variants?.solutions?.title || 'Unknown',
    solution_category: solution.solution_variants?.solutions?.solution_category || 'unknown',
    variant_name: solution.solution_variants?.variant_name || 'Standard'
  }))

  // Sort solutions by quality issues - most broken first
  transformedSolutions.sort((a, b) => {
    const aFieldCount = Object.keys(a.aggregated_fields || {}).length
    const bFieldCount = Object.keys(b.aggregated_fields || {}).length
    return aFieldCount - bFieldCount
  })

  console.log(chalk.white(`📊 Found ${transformedSolutions.length} AI solutions in goal`))
  console.log(chalk.gray(`   Goal: ${transformedSolutions[0]?.goal_title}`))

  return limit ? transformedSolutions.slice(0, limit) : transformedSolutions
}

/**
 * Process a single solution with enhanced error handling
 */
async function processSolution(
  solution: any,
  aiManager: AIProviderManager,
  dryRun: boolean = false
): Promise<{ success: boolean; fieldsProcessed: number; errors: string[] }> {
  const { link_id, solution_title, solution_category, goal_title, aggregated_fields } = solution

  console.log(chalk.white(`\n🔄 Processing: ${solution_title} (${solution_category})`))
  console.log(chalk.gray(`   Goal context: ${goal_title}`))

  const requiredFields = CATEGORY_REQUIRED_FIELDS[solution_category] || []
  if (requiredFields.length === 0) {
    console.log(chalk.yellow(`⚠️  Unknown category: ${solution_category}`))
    return { success: false, fieldsProcessed: 0, errors: ['Unknown category'] }
  }

  const existingFields = { ...aggregated_fields }
  let fieldsToProcess: string[] = []
  let fieldsProcessed = 0
  const errors: string[] = []

  // Determine which fields need regeneration
  for (const fieldName of requiredFields) {
    const fieldData = existingFields[fieldName]

    if (!fieldData || needsFieldRegeneration(fieldData, fieldName)) {
      fieldsToProcess.push(fieldName)
    }
  }

  // Also check existing fields for quality issues
  for (const fieldName of Object.keys(existingFields)) {
    if (!requiredFields.includes(fieldName)) continue
    if (fieldsToProcess.includes(fieldName)) continue

    if (needsFieldRegeneration(existingFields[fieldName], fieldName)) {
      fieldsToProcess.push(fieldName)
    }
  }

  if (fieldsToProcess.length === 0) {
    console.log(chalk.green(`⏭️  ${solution_title} - All fields good quality`))
    return { success: true, fieldsProcessed: 0, errors: [] }
  }

  console.log(chalk.cyan(`   Fields needing processing: ${fieldsToProcess.join(', ')}`))

  if (dryRun) {
    console.log(chalk.blue(`🔍 DRY RUN - Would process ${solution_title}:`))
    console.log(chalk.blue(`   Category: ${solution_category}`))
    console.log(chalk.blue(`   Processing fields: ${fieldsToProcess.join(', ')}`))
    return { success: true, fieldsProcessed: fieldsToProcess.length, errors: [] }
  }

  // Process each field
  const updatedFields = { ...existingFields }

  for (const fieldName of fieldsToProcess) {
    try {
      const existingData = existingFields[fieldName]

      // Handle string fields
      if (typeof existingData === 'string') {
        console.log(chalk.yellow(`   🔧 Converting string field: ${fieldName}`))
        updatedFields[fieldName] = convertStringToDistribution(existingData, fieldName)
        fieldsProcessed++
        continue
      }

      // Handle invalid values in existing DistributionData
      if (existingData && typeof existingData === 'object' && existingData.values) {
        const fixedData = autoFixDistributionData(existingData, fieldName)
        if (fixedData !== existingData) {
          console.log(chalk.yellow(`   🔧 Auto-fixed invalid values: ${fieldName}`))
          updatedFields[fieldName] = fixedData
          fieldsProcessed++

          // If the fix resolved the quality issues, skip AI generation
          if (!needsFieldRegeneration(fixedData, fieldName)) {
            continue
          }
        }
      }

      // Generate with AI
      console.log(chalk.cyan(`   🤖 Generating with AI: ${fieldName}...`))
      const distributionData = await aiManager.generateFieldData(
        fieldName,
        solution_category,
        solution_title,
        goal_title
      )

      if (distributionData) {
        updatedFields[fieldName] = distributionData
        fieldsProcessed++
        console.log(chalk.green(`   ✅ Generated ${fieldName}: ${distributionData.values.length} options`))
      } else {
        errors.push(`Failed to generate ${fieldName}`)
        console.log(chalk.red(`   ❌ Failed to generate ${fieldName}`))
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      const errorMsg = `${fieldName}: ${error}`
      errors.push(errorMsg)
      console.log(chalk.red(`   ❌ Error processing ${fieldName}: ${error}`))
    }
  }

  // Update database if we have changes
  if (fieldsProcessed > 0) {
    const { error: updateError } = await supabase
      .from('goal_implementation_links')
      .update({
        aggregated_fields: updatedFields,
        updated_at: new Date().toISOString()
      })
      .eq('id', link_id)

    if (updateError) {
      errors.push(`Database update failed: ${updateError.message}`)
      console.log(chalk.red(`   ❌ Database update failed: ${updateError.message}`))
      return { success: false, fieldsProcessed, errors }
    }

    console.log(chalk.green(`   ✅ Updated ${fieldsProcessed} fields for ${solution_title}`))
  }

  return {
    success: errors.length === 0,
    fieldsProcessed,
    errors
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2)
  const goalId = args.find(arg => arg.startsWith('--goal-id='))?.split('=')[1]
  const limit = args.find(arg => arg.startsWith('--limit='))?.split('=')[1]
  const dryRun = args.includes('--dry-run')
  const verbose = args.includes('--verbose')
  const provider = args.find(arg => arg.startsWith('--provider='))?.split('=')[1] as AIProvider || 'auto'

  console.log(chalk.magenta('🔧 ENHANCED VALIDATED FIELD GENERATION SCRIPT V2'))
  console.log(chalk.magenta('═'.repeat(70)))

  if (dryRun) {
    console.log(chalk.blue('🔍 DRY RUN MODE - No changes will be made\n'))
  }

  if (!goalId) {
    console.log(chalk.red('❌ Usage:'))
    console.log(chalk.white('  --goal-id=<uuid>        Target specific goal (REQUIRED)'))
    console.log(chalk.white('  --limit=<number>        Limit number of solutions to process'))
    console.log(chalk.white('  --provider=<provider>   AI provider: gemini|claude|openai|auto'))
    console.log(chalk.white('  --dry-run               Preview changes without applying'))
    console.log(chalk.white('  --verbose               Extra logging'))
    console.log(chalk.gray('\nExample:'))
    console.log(chalk.gray('  npx tsx scripts/generate-validated-fields-v2.ts \\'))
    console.log(chalk.gray('    --goal-id=56e2801e-0d78-4abd-a795-869e5b780ae7 \\'))
    console.log(chalk.gray('    --limit=10 --dry-run'))
    process.exit(1)
  }

  console.log(chalk.cyan(`🎯 Processing Goal: ${goalId}`))
  console.log(chalk.cyan('━'.repeat(70)))

  // Initialize AI provider manager
  const aiManager = new AIProviderManager()

  // Get solutions for the goal
  const solutions = await findSolutionsForGoal(goalId, limit ? parseInt(limit) : undefined)

  if (solutions.length === 0) {
    console.log(chalk.yellow('No solutions found to process'))
    return
  }

  // Process solutions
  let successCount = 0
  let errorCount = 0
  let totalFieldsProcessed = 0
  const allErrors: string[] = []

  for (const solution of solutions) {
    const result = await processSolution(solution, aiManager, dryRun)

    if (result.success) {
      successCount++
    } else {
      errorCount++
    }

    totalFieldsProcessed += result.fieldsProcessed
    allErrors.push(...result.errors)
  }

  // Final summary
  console.log(chalk.white(`\n📈 Results:`))
  console.log(chalk.green(`   ✅ Successful: ${successCount}`))
  if (errorCount > 0) {
    console.log(chalk.red(`   ❌ Errors: ${errorCount}`))
  }
  console.log(chalk.blue(`   🔧 Fields processed: ${totalFieldsProcessed}`))

  // Show Gemini usage stats
  const stats = aiManager.geminiClient.getUsageStats()
  console.log(chalk.white('\n🤖 AI Provider Usage:'))
  console.log(chalk.blue(`   Gemini: ${stats.requestsToday} requests today`))
  console.log(chalk.blue(`   Remaining: ${stats.requestsRemaining}`))

  if (allErrors.length > 0 && verbose) {
    console.log(chalk.white('\n🚨 Errors encountered:'))
    allErrors.forEach(error => console.log(chalk.red(`   • ${error}`)))
  }

  if (dryRun) {
    console.log(chalk.blue('\n🔍 DRY RUN complete. Run without --dry-run to apply changes.'))
  } else {
    console.log(chalk.green('\n✨ Field generation complete!'))
  }
}

main().catch(console.error)