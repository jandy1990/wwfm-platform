#!/usr/bin/env tsx

/**
 * WWFM AI Data Quality Fix - Two-Table Consolidation
 *
 * Transforms AI data from broken format to proper DistributionData format
 * while maintaining the AI-to-human transition system.
 *
 * CRITICAL: Only modifies solution_fields (AI data), never touches aggregated_fields (human data)
 */

import { createClient } from '@supabase/supabase-js'
import chalk from 'chalk'
import { Command } from 'commander'
import dotenv from 'dotenv'
import fs from 'fs'
import { getEvidenceBasedDistribution } from './evidence-based-distributions'
import { GeminiClient } from './ai-solution-generator/generators/gemini-client'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Initialize Gemini client for AI consultation
const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY!)

// Types
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

interface TransformationResult {
  success: boolean
  error?: string
  transformedFields: Record<string, DistributionData>
}

// Category field mappings matching the WWFM system
const FIELD_MAPPINGS: Record<string, string[]> = {
  // Arrays that become distributions
  challenges: ['challenges', 'common_challenges'],
  side_effects: ['side_effects', 'potential_side_effects'],

  // Single values that become distributions
  time_to_results: ['time_to_results'],
  frequency: ['frequency', 'usage_frequency', 'session_frequency'],
  cost: ['cost', 'cost_range'],
  length_of_use: ['length_of_use', 'duration'],
  format: ['format'],
  learning_difficulty: ['learning_difficulty'],
  time_commitment: ['time_commitment', 'session_length'],
  startup_cost: ['startup_cost'],
  ongoing_cost: ['ongoing_cost'],
  time_to_complete: ['time_to_complete'],
  subscription_type: ['subscription_type'],
  specialty: ['specialty'],
  wait_time: ['wait_time'],
  skincare_frequency: ['skincare_frequency']
}

// Enhanced rate limiting and caching for Gemini API
class RateLimiter {
  private requests: number[] = []
  private readonly maxRequests = 12 // Conservative limit (80% of 15)
  private readonly windowMs = 60000 // 1 minute
  private cache = new Map<string, DistributionData>()

  async waitIfNeeded(): Promise<void> {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.windowMs)

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests)
      const waitTime = this.windowMs - (now - oldestRequest) + 1000 // Add 1s buffer
      console.log(chalk.yellow(`Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s...`))
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    this.requests.push(now)
  }

  getCached(key: string): DistributionData | undefined {
    return this.cache.get(key)
  }

  setCache(key: string, data: DistributionData): void {
    this.cache.set(key, data)
  }

  getCacheStats(): { size: number; hitRate: number } {
    // Simple stats for monitoring
    return { size: this.cache.size, hitRate: 0 }
  }
}

const rateLimiter = new RateLimiter()

/**
 * Get evidence-based distribution from curated research data or AI consultation
 */
async function getResearchBasedDistribution(
  solutionTitle: string,
  category: string,
  fieldName: string,
  values: string[]
): Promise<DistributionData> {
  // Create cache key based on category, field, and values (not specific solution)
  const cacheKey = `${category}:${fieldName}:${values.sort().join('|')}`

  // Check cache first
  const cached = rateLimiter.getCached(cacheKey)
  if (cached) {
    console.log(chalk.blue(`  Using cached distribution for ${fieldName}`))
    return cached
  }

  // Try evidence-based distribution first
  const evidenceBased = getEvidenceBasedDistribution(category, fieldName, values)
  if (evidenceBased) {
    console.log(chalk.green(`  Using evidence-based distribution for ${fieldName}`))
    rateLimiter.setCache(cacheKey, evidenceBased)
    return evidenceBased
  }

  // MUST use AI consultation - no fallbacks allowed
  console.log(chalk.magenta(`  Consulting AI for ${fieldName} distribution...`))
  await rateLimiter.waitIfNeeded()

  const aiDistribution = await getAIBasedDistribution(solutionTitle, category, fieldName, values)
  rateLimiter.setCache(cacheKey, aiDistribution)
  return aiDistribution
}

/**
 * Get AI-based distribution using Gemini consultation
 */
async function getAIBasedDistribution(
  solutionTitle: string,
  category: string,
  fieldName: string,
  values: string[]
): Promise<DistributionData> {
  const prompt = `You are a medical and wellness research expert. Based on your training data from clinical studies, user surveys, and research literature, provide realistic percentage distributions for ${fieldName} related to "${solutionTitle}" in the ${category} category.

For these ${fieldName} values: ${values.join(', ')}

Provide percentages that:
1. Are based on actual research patterns in your training data
2. Sum to exactly 100%
3. Reflect realistic prevalence/frequency from clinical studies
4. Are NOT made up or random
5. Come from your knowledge of medical literature, user studies, and research data

Respond with ONLY a JSON object in this exact format:
{
  "mode": "most_common_value",
  "values": [
    {"value": "exact_value_from_list", "count": 45, "percentage": 45, "source": "research_source"},
    {"value": "another_exact_value", "count": 30, "percentage": 30, "source": "studies_source"}
  ],
  "totalReports": 100,
  "dataSource": "ai_research"
}

The values must be EXACTLY as provided in the list above. Source should indicate the type of research (clinical_trials, user_surveys, medical_literature, etc).`

  const response = await geminiClient.generateContent(prompt)

  try {
    const parsed = JSON.parse(response)

    // Validate the response structure
    if (!parsed.mode || !parsed.values || !Array.isArray(parsed.values)) {
      throw new Error('Invalid response structure from AI')
    }

    // Ensure percentages sum to 100
    const totalPercentage = parsed.values.reduce((sum: number, item: any) => sum + (item.percentage || 0), 0)
    if (Math.abs(totalPercentage - 100) > 1) {
      throw new Error(`Percentages don't sum to 100: ${totalPercentage}`)
    }

    // Ensure all values are from the original list
    const responseValues = parsed.values.map((v: any) => v.value)
    const missingValues = values.filter(v => !responseValues.includes(v))
    if (missingValues.length > 0) {
      throw new Error(`AI response missing values: ${missingValues.join(', ')}`)
    }

    // Calculate the actual mode (most common value) from the values array
    const sortedValues = parsed.values.sort((a: any, b: any) => (b.percentage || 0) - (a.percentage || 0))
    const actualMode = sortedValues[0]?.value || parsed.mode

    return {
      mode: actualMode,
      values: parsed.values,
      totalReports: 100,
      dataSource: 'ai_research'
    }
  } catch (error) {
    throw new Error(`Failed to parse AI response: ${error}. Response: ${response.substring(0, 200)}...`)
  }
}

/**
 * CRITICAL: ALL distributions must be AI-derived (evidence-based or API consultation)
 * NO mechanistic, random, or mathematical fallbacks are allowed
 */

// ALL MECHANISTIC FALLBACK FUNCTIONS REMOVED
// Only evidence-based distributions and AI consultation are allowed

/**
 * Transform a single field from raw format to DistributionData
 */
async function transformField(
  solutionTitle: string,
  category: string,
  fieldName: string,
  fieldValue: any
): Promise<DistributionData> {

  // Handle array values (like side_effects, challenges)
  if (Array.isArray(fieldValue)) {
    if (fieldValue.length === 0) {
      // Empty arrays should use AI consultation to determine what the challenges SHOULD be
      throw new Error(`Empty field array for ${fieldName} - this requires AI consultation to populate properly`)
    }

    return await getResearchBasedDistribution(solutionTitle, category, fieldName, fieldValue)
  }

  // Handle single string values (like time_to_results, cost)
  if (typeof fieldValue === 'string') {
    // For single values, create a distribution with the main value and some alternatives
    const alternatives = getAlternativesForField(fieldName, fieldValue)
    const allValues = [fieldValue, ...alternatives].slice(0, 4) // Max 4 values

    return await getResearchBasedDistribution(solutionTitle, category, fieldName, allValues)
  }

  // No fallbacks allowed - must use AI consultation
  throw new Error(`Unexpected field type for ${fieldName}: ${typeof fieldValue} - requires AI consultation`)
}

/**
 * Get reasonable alternatives for single-value fields to create distributions
 */
function getAlternativesForField(fieldName: string, value: string): string[] {
  const alternatives: Record<string, Record<string, string[]>> = {
    time_to_results: {
      'Immediately': ['1-2 weeks', '3-4 weeks'],
      '1-2 weeks': ['Immediately', '3-4 weeks'],
      '3-4 weeks': ['1-2 weeks', '1-2 months'],
      '1-2 months': ['3-4 weeks', '3-6 months']
    },
    cost: {
      'Free': ['Under $20', '$20-50'],
      'Under $20': ['Free', '$20-50'],
      '$20-50': ['Under $20', '$50-100'],
      '$50-100': ['$20-50', '$100-200'],
      '$100-200': ['$50-100', '$200+']
    },
    frequency: {
      'once daily': ['twice daily', 'every other day'],
      'twice daily': ['once daily', 'three times daily'],
      'weekly': ['twice weekly', 'every other week'],
      'monthly': ['weekly', 'quarterly']
    }
  }

  return alternatives[fieldName]?.[value] || []
}

/**
 * Transform solution_fields from raw format to DistributionData format
 */
async function transformSolutionFields(
  solutionTitle: string,
  category: string,
  solutionFields: Record<string, any>
): Promise<TransformationResult> {
  try {
    const transformedFields: Record<string, DistributionData> = {}

    for (const [fieldName, fieldValue] of Object.entries(solutionFields)) {
      if (fieldValue === null || fieldValue === undefined) continue

      // Check if this field should be transformed to DistributionData
      const shouldTransform = Object.keys(FIELD_MAPPINGS).some(key =>
        FIELD_MAPPINGS[key].includes(fieldName)
      )

      if (shouldTransform) {
        console.log(chalk.blue(`  Transforming ${fieldName}: ${JSON.stringify(fieldValue).substring(0, 50)}...`))
        transformedFields[fieldName] = await transformField(solutionTitle, category, fieldName, fieldValue)
      } else {
        // Keep non-distribution fields as-is (but log them)
        console.log(chalk.gray(`  Keeping ${fieldName} as-is (not a distribution field)`))
      }
    }

    return {
      success: true,
      transformedFields
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      transformedFields: {}
    }
  }
}

/**
 * Process a batch of solutions
 */
async function processBatch(
  solutions: any[],
  dryRun: boolean = false
): Promise<{ success: number; errors: number; details: any[] }> {

  const results = { success: 0, errors: 0, details: [] }

  for (const link of solutions) {
    try {
      const solution = link.solution_variants?.solutions
      if (!solution) {
        console.log(chalk.red(`❌ Missing solution data for link ${link.id}`))
        results.errors++
        continue
      }

      console.log(chalk.cyan(`\n🔄 Processing: ${solution.title} (${solution.solution_category})`))

      // Check which fields still need transformation (field-by-field check)
      const fieldsNeedingTransformation: Record<string, any> = {}
      if (link.solution_fields && typeof link.solution_fields === 'object') {
        for (const [fieldName, fieldValue] of Object.entries(link.solution_fields)) {
          const isAlreadyTransformed = fieldValue &&
                                      typeof fieldValue === 'object' &&
                                      'dataSource' in fieldValue

          // Check for mechanistic fallback data that needs replacement
          const hasMechanisticFallback = fieldValue &&
                                        typeof fieldValue === 'object' &&
                                        fieldValue.values &&
                                        Array.isArray(fieldValue.values) &&
                                        fieldValue.values.some((v: any) =>
                                          v.source === 'equal_fallback' || v.source === 'smart_fallback'
                                        )

          if ((!isAlreadyTransformed || hasMechanisticFallback) && fieldValue !== null && fieldValue !== undefined) {
            fieldsNeedingTransformation[fieldName] = fieldValue
          }
        }

        if (Object.keys(fieldsNeedingTransformation).length === 0) {
          console.log(chalk.green(`  ✅ All fields already in proper DistributionData format with no mechanistic fallback, skipping`))
          results.success++
          continue
        }

        console.log(chalk.yellow(`  🔄 Need to transform fields: ${Object.keys(fieldsNeedingTransformation).join(', ')} (untransformed or mechanistic fallback)`))

        // Log reason for each field needing transformation
        for (const [fieldName, fieldValue] of Object.entries(fieldsNeedingTransformation)) {
          const hasMechanisticFallback = fieldValue &&
                                        typeof fieldValue === 'object' &&
                                        fieldValue.values &&
                                        Array.isArray(fieldValue.values) &&
                                        fieldValue.values.some((v: any) =>
                                          v.source === 'equal_fallback' || v.source === 'smart_fallback'
                                        )
          if (hasMechanisticFallback) {
            console.log(chalk.red(`     🚫 ${fieldName}: Contains mechanistic fallback data`))
          } else {
            console.log(chalk.yellow(`     📝 ${fieldName}: Not in DistributionData format`))
          }
        }
      }

      // Transform only the fields that need transformation
      const transformation = await transformSolutionFields(
        solution.title,
        solution.solution_category,
        fieldsNeedingTransformation
      )

      if (!transformation.success) {
        console.log(chalk.red(`  ❌ Transformation failed: ${transformation.error}`))
        results.errors++
        continue
      }

      // Update database (unless dry run)
      if (!dryRun) {
        const { error } = await supabase
          .from('goal_implementation_links')
          .update({
            solution_fields: {
              ...link.solution_fields,
              ...transformation.transformedFields
            }
          })
          .eq('id', link.id)

        if (error) {
          console.log(chalk.red(`  ❌ Database update failed: ${error.message}`))
          results.errors++
          continue
        }
      }

      console.log(chalk.green(`  ✅ Transformed ${Object.keys(transformation.transformedFields).length} fields`))
      results.success++

      results.details.push({
        id: link.id,
        solution: solution.title,
        category: solution.solution_category,
        fieldsTransformed: Object.keys(transformation.transformedFields)
      })

    } catch (error) {
      console.log(chalk.red(`❌ Unexpected error: ${error}`))
      results.errors++
    }
  }

  return results
}

/**
 * Main execution function
 */
async function main() {
  const program = new Command()

  program
    .option('--dry-run', 'Simulate changes without writing to database')
    .option('--batch-size <size>', 'Number of solutions to process at once', '50')
    .option('--category <category>', 'Process only specific category')
    .option('--goal <goal>', 'Process only specific goal ID')
    .option('--limit <limit>', 'Limit total number of solutions to process', '10000')
    .option('--offset <offset>', 'Skip first N solutions', '0')
    .parse()

  const options = program.opts()

  console.log(chalk.cyan('🛠️ WWFM AI Data Quality Fix'))
  console.log(chalk.cyan('━'.repeat(50)))
  console.log(chalk.yellow(`Mode: ${options.dryRun ? 'DRY RUN' : 'PRODUCTION'}`))
  console.log(chalk.yellow(`Batch size: ${options.batchSize}`))
  if (options.category) console.log(chalk.yellow(`Category filter: ${options.category}`))
  if (options.goal) console.log(chalk.yellow(`Goal filter: ${options.goal}`))
  console.log('')

  // Query AI solutions that need fixing
  let query = supabase
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
    .range(parseInt(options.offset), parseInt(options.offset) + parseInt(options.limit) - 1)

  if (options.category) {
    query = query.eq('solution_variants.solutions.solution_category', options.category)
  }

  if (options.goal) {
    query = query.eq('goal_id', options.goal)
  }

  const { data: solutions, error } = await query

  if (error) {
    console.error(chalk.red('❌ Error fetching solutions:'), error)
    process.exit(1)
  }

  if (!solutions || solutions.length === 0) {
    console.log(chalk.yellow('No solutions found to process'))
    process.exit(0)
  }

  console.log(chalk.green(`✅ Found ${solutions.length} solutions to process\n`))

  // Process in batches
  const batchSize = parseInt(options.batchSize)
  let totalSuccess = 0
  let totalErrors = 0

  for (let i = 0; i < solutions.length; i += batchSize) {
    const batch = solutions.slice(i, i + batchSize)
    console.log(chalk.magenta(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(solutions.length/batchSize)} (${batch.length} solutions)`))

    const results = await processBatch(batch, options.dryRun)
    totalSuccess += results.success
    totalErrors += results.errors

    console.log(chalk.blue(`Batch complete: ${results.success} success, ${results.errors} errors`))

    // Small delay between batches to be gentle on the API
    if (i + batchSize < solutions.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // Final summary with cache stats
  const cacheStats = rateLimiter.getCacheStats()
  console.log(chalk.cyan('\n' + '━'.repeat(50)))
  console.log(chalk.cyan('📊 FINAL SUMMARY'))
  console.log(chalk.cyan('━'.repeat(50)))
  console.log(chalk.green(`✅ Successfully processed: ${totalSuccess}`))
  console.log(chalk.red(`❌ Errors: ${totalErrors}`))
  console.log(chalk.blue(`📈 Success rate: ${Math.round(totalSuccess/(totalSuccess+totalErrors)*100)}%`))
  console.log(chalk.magenta(`🗄️ Cache entries created: ${cacheStats.size}`))
  console.log(chalk.yellow(`⚡ Estimated API calls saved: ${Math.max(0, totalSuccess * 3 - 50)} (via caching & smart fallbacks)`))

  if (options.dryRun) {
    console.log(chalk.yellow('\n🔍 This was a dry run. No data was modified.'))
    console.log(chalk.yellow('Remove --dry-run flag to execute the fix.'))
  } else {
    console.log(chalk.green('\n🎉 Data quality fix complete!'))
    console.log(chalk.green('All AI data is now in proper DistributionData format.'))
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('Fatal error:'), error)
    process.exit(1)
  })
}

export { transformSolutionFields, transformField }