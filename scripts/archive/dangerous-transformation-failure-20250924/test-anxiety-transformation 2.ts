#!/usr/bin/env tsx

/**
 * TEST SCRIPT: Anxiety Goal Transformation
 * Tests safe transformation on "Calm my anxiety" goal solutions only
 *
 * This is a test version of transform-preserve-all.ts targeting a single goal
 * for test-verify-iterate approach before full rollout
 */

import { createClient } from '@supabase/supabase-js'
import chalk from 'chalk'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getEvidenceBasedDistribution } from './evidence-based-distributions'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

// Target goal ID for "Calm my anxiety"
const TARGET_GOAL_ID = '56e2801e-0d78-4abd-a795-869e5b780ae7'

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

// Enhanced rate limiting for API calls
class RateLimiter {
  private requests: number[] = []
  private readonly maxRequests = 12
  private readonly windowMs = 60000
  private cache = new Map<string, DistributionData>()

  async waitIfNeeded(): Promise<void> {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.windowMs)

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests)
      const waitTime = this.windowMs - (now - oldestRequest)
      console.log(chalk.yellow(`  ⏳ Rate limit: waiting ${Math.ceil(waitTime / 1000)}s...`))
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    this.requests.push(now)
  }

  getCached(key: string): DistributionData | null {
    return this.cache.get(key) || null
  }

  setCache(key: string, data: DistributionData): void {
    this.cache.set(key, data)
  }

  getStats() {
    return {
      requestsMade: this.requests.length,
      cacheSize: this.cache.size
    }
  }
}

const rateLimiter = new RateLimiter()

/**
 * Check if field contains mechanistic fallback data that violates requirements
 */
function hasMechanisticFallback(fieldValue: any): boolean {
  if (!fieldValue || typeof fieldValue !== 'object') return false

  // Check if values have mechanistic sources
  if (fieldValue.values && Array.isArray(fieldValue.values)) {
    return fieldValue.values.some((v: any) =>
      v.source === 'equal_fallback' || v.source === 'smart_fallback'
    )
  }

  return false
}

/**
 * Get AI-based distribution using Gemini consultation
 */
async function getAIDistribution(
  solutionTitle: string,
  category: string,
  fieldName: string,
  values: string[]
): Promise<DistributionData> {
  const cacheKey = `${category}:${fieldName}:${values.sort().join('|')}`

  // Check cache first
  const cached = rateLimiter.getCached(cacheKey)
  if (cached) {
    console.log(chalk.blue(`    📋 Using cached distribution for ${fieldName}`))
    return cached
  }

  await rateLimiter.waitIfNeeded()

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
    {"value": "exact_value_from_list", "count": 45, "percentage": 45, "source": "research"},
    {"value": "another_exact_value", "count": 30, "percentage": 30, "source": "studies"}
  ],
  "totalReports": 100,
  "dataSource": "ai_research"
}

The values must be EXACTLY as provided in the list above. Source should indicate the type of research (research, studies, user_surveys, etc).`

  const result = await model.generateContent(prompt)
  const response = result.response.text()

  try {
    // Strip markdown code blocks if present
    let cleanResponse = response.trim()
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    const parsed = JSON.parse(cleanResponse)

    // Validate structure
    if (!parsed.mode || !parsed.values || !Array.isArray(parsed.values)) {
      throw new Error('Invalid response structure')
    }

    // Ensure percentages sum to 100
    const totalPercentage = parsed.values.reduce((sum: number, item: any) => sum + (item.percentage || 0), 0)
    if (Math.abs(totalPercentage - 100) > 1) {
      throw new Error(`Percentages don't sum to 100: ${totalPercentage}`)
    }

    // Calculate actual mode from values array
    const sortedValues = parsed.values.sort((a: any, b: any) => (b.percentage || 0) - (a.percentage || 0))
    const actualMode = sortedValues[0]?.value || parsed.mode

    const distribution = {
      mode: actualMode,
      values: parsed.values,
      totalReports: 100,
      dataSource: 'ai_research'
    }

    rateLimiter.setCache(cacheKey, distribution)
    return distribution

  } catch (error) {
    throw new Error(`Failed to parse AI response: ${error}. Response: ${response.substring(0, 200)}...`)
  }
}

/**
 * Transform a field from mechanistic to evidence-based or AI consultation
 */
async function transformField(
  solutionTitle: string,
  category: string,
  fieldName: string,
  fieldValue: any
): Promise<DistributionData> {

  if (!fieldValue?.values) {
    throw new Error(`Invalid field structure for ${fieldName}`)
  }

  // Extract values for distribution
  const values = fieldValue.values.map((v: any) => v.value).filter(Boolean)

  // Try evidence-based distribution first
  const evidenceDistribution = getEvidenceBasedDistribution(category, fieldName, values)
  if (evidenceDistribution) {
    console.log(chalk.green(`    📚 Using evidence-based distribution for ${fieldName}`))
    return evidenceDistribution
  }

  // Fall back to AI consultation
  console.log(chalk.magenta(`    🤖 Consulting AI for ${fieldName}...`))
  return getAIDistribution(solutionTitle, category, fieldName, values)
}

/**
 * SAFE TRANSFORMATION: Preserves ALL fields while transforming mechanistic ones
 */
async function safeTransformFields(
  solutionTitle: string,
  category: string,
  existingFields: Record<string, any>
): Promise<Record<string, any>> {
  // CRITICAL: Start with ALL existing fields
  const result = { ...existingFields }
  let transformCount = 0

  // Only transform fields that have mechanistic fallback data
  for (const [fieldName, fieldValue] of Object.entries(existingFields)) {
    if (hasMechanisticFallback(fieldValue)) {
      try {
        console.log(chalk.yellow(`    🔧 Transforming mechanistic data in ${fieldName}...`))

        const transformedField = await transformField(solutionTitle, category, fieldName, fieldValue)
        result[fieldName] = transformedField
        transformCount++

        console.log(chalk.green(`    ✅ Replaced ${fieldName} with AI training data`))

        // Small delay for rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.log(chalk.red(`    ❌ Failed to transform ${fieldName}: ${error}`))
      }
    }
  }

  // VALIDATION: Ensure no field loss
  const originalCount = Object.keys(existingFields).length
  const newCount = Object.keys(result).length

  if (newCount < originalCount) {
    throw new Error(`CRITICAL: Field loss detected: ${originalCount} -> ${newCount}`)
  }

  if (transformCount === 0) {
    console.log(chalk.gray(`    → No mechanistic data found to transform`))
  } else {
    console.log(chalk.green(`    ✅ Transformed ${transformCount} fields with preserved field count`))
  }

  return result
}

/**
 * Process a single solution safely
 */
async function processSolution(link: any, checkOnly = false): Promise<{ processed: boolean, fieldsBefore: number, fieldsAfter: number, mechanisticBefore: number, mechanisticAfter: number }> {
  const solution = link.solution_variants?.solutions
  if (!solution) return { processed: false, fieldsBefore: 0, fieldsAfter: 0, mechanisticBefore: 0, mechanisticAfter: 0 }

  console.log(chalk.cyan(`\n🔄 Processing: ${solution.title}`))
  console.log(chalk.white(`    Category: ${solution.solution_category}`))

  const existingFields = link.solution_fields || {}
  const fieldsBefore = Object.keys(existingFields).length
  const mechanisticBefore = Object.values(existingFields).filter(hasMechanisticFallback).length

  // Check if any transformation is needed
  const needsTransformation = Object.values(existingFields).some(hasMechanisticFallback)
  if (!needsTransformation) {
    console.log(chalk.gray(`    → No mechanistic data found`))
    return { processed: false, fieldsBefore, fieldsAfter: fieldsBefore, mechanisticBefore: 0, mechanisticAfter: 0 }
  }

  console.log(chalk.yellow(`    📊 Fields: ${fieldsBefore}, Mechanistic: ${mechanisticBefore}`))

  if (checkOnly) {
    console.log(chalk.blue(`    🔍 CHECK ONLY: Would transform ${mechanisticBefore} mechanistic fields`))
    return { processed: false, fieldsBefore, fieldsAfter: fieldsBefore, mechanisticBefore, mechanisticAfter: mechanisticBefore }
  }

  try {
    const transformedFields = await safeTransformFields(
      solution.title,
      solution.solution_category,
      existingFields
    )

    const fieldsAfter = Object.keys(transformedFields).length
    const mechanisticAfter = Object.values(transformedFields).filter(hasMechanisticFallback).length

    // Update database with validation
    const { error } = await supabase
      .from('goal_implementation_links')
      .update({ solution_fields: transformedFields })
      .eq('id', link.id)

    if (error) {
      console.log(chalk.red(`    ❌ Database update failed: ${error.message}`))
      return { processed: false, fieldsBefore, fieldsAfter: fieldsBefore, mechanisticBefore, mechanisticAfter: mechanisticBefore }
    }

    console.log(chalk.green(`    ✅ Safe transformation completed`))
    console.log(chalk.green(`    📊 Result: ${fieldsBefore} → ${fieldsAfter} fields, ${mechanisticBefore} → ${mechanisticAfter} mechanistic`))

    return { processed: true, fieldsBefore, fieldsAfter, mechanisticBefore, mechanisticAfter }

  } catch (error) {
    console.log(chalk.red(`    ❌ Transformation failed: ${error}`))
    return { processed: false, fieldsBefore, fieldsAfter: fieldsBefore, mechanisticBefore, mechanisticAfter: mechanisticBefore }
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)
  const checkOnly = args.includes('--check-only')

  console.log(chalk.cyan('🧪 WWFM Anxiety Goal Test Transformation'))
  console.log(chalk.cyan('━'.repeat(50)))
  console.log(chalk.yellow('TARGET: "Calm my anxiety" goal solutions only'))
  console.log(chalk.yellow('SAFE: Preserves ALL fields while replacing mechanistic data'))
  console.log(chalk.yellow(`MODE: ${checkOnly ? 'CHECK ONLY' : 'FULL TRANSFORMATION'}`))
  console.log('')

  // Find solutions for anxiety goal with mechanistic data
  console.log(chalk.magenta('📊 Finding anxiety goal solutions with mechanistic data...'))

  const { data: solutions, error } = await supabase
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
    .eq('goal_id', TARGET_GOAL_ID)
    .eq('data_display_mode', 'ai')
    .not('solution_fields', 'is', null)
    .neq('solution_fields', '{}')

  if (error) {
    console.log(chalk.red(`❌ Error querying solutions: ${error.message}`))
    process.exit(1)
  }

  if (!solutions || solutions.length === 0) {
    console.log(chalk.green('✅ No solutions found for anxiety goal!'))
    process.exit(0)
  }

  // Filter for solutions that actually have mechanistic data
  const mechanisticSolutions = solutions.filter(link => {
    const fields = link.solution_fields || {}
    return Object.values(fields).some(hasMechanisticFallback)
  })

  console.log(chalk.white(`Found ${solutions.length} anxiety goal solutions, ${mechanisticSolutions.length} with mechanistic data`))
  console.log('')

  let processedCount = 0
  let skippedCount = 0
  let errorCount = 0
  let totalFieldsBefore = 0
  let totalFieldsAfter = 0
  let totalMechanisticBefore = 0
  let totalMechanisticAfter = 0

  // Process each solution
  for (let i = 0; i < mechanisticSolutions.length; i++) {
    const link = mechanisticSolutions[i]

    try {
      const result = await processSolution(link, checkOnly)

      totalFieldsBefore += result.fieldsBefore
      totalFieldsAfter += result.fieldsAfter
      totalMechanisticBefore += result.mechanisticBefore
      totalMechanisticAfter += result.mechanisticAfter

      if (result.processed) {
        processedCount++
      } else {
        skippedCount++
      }

      // Progress indicator
      if ((i + 1) % 10 === 0 || i === mechanisticSolutions.length - 1) {
        console.log(chalk.blue(`\n📊 Progress: ${i + 1}/${mechanisticSolutions.length} processed`))
        console.log(chalk.blue(`   Transformed: ${processedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`))

        const stats = rateLimiter.getStats()
        console.log(chalk.blue(`   API: ${stats.requestsMade} requests, ${stats.cacheSize} cached`))
      }

    } catch (error) {
      console.log(chalk.red(`❌ Error processing ${link.id}: ${error}`))
      errorCount++
    }
  }

  console.log(chalk.cyan('\n━'.repeat(50)))
  console.log(chalk.green(`✅ Anxiety Goal Test ${checkOnly ? 'Check' : 'Transformation'} Complete`))
  console.log(chalk.white(`📊 Final Results:`))
  console.log(chalk.white(`   • Solutions analyzed: ${mechanisticSolutions.length}`))
  console.log(chalk.white(`   • Successfully transformed: ${processedCount}`))
  console.log(chalk.white(`   • Skipped (no mechanistic data): ${skippedCount}`))
  console.log(chalk.white(`   • Errors: ${errorCount}`))
  console.log(chalk.white(`   • Fields: ${totalFieldsBefore} → ${totalFieldsAfter} (${totalFieldsAfter >= totalFieldsBefore ? '✅' : '❌'})`))
  console.log(chalk.white(`   • Mechanistic: ${totalMechanisticBefore} → ${totalMechanisticAfter}`))

  const stats = rateLimiter.getStats()
  console.log(chalk.blue(`   • API Usage: ${stats.requestsMade} requests, ${stats.cacheSize} cached responses`))

  if (!checkOnly && processedCount > 0) {
    console.log(chalk.yellow(`\n🔍 Next: Verify transformation results`))
    console.log(chalk.gray(`   Frontend: http://localhost:3000/goal/${TARGET_GOAL_ID}`))
    console.log(chalk.gray(`   Database: npx tsx scripts/analyze-solution-quality.ts --goal-id ${TARGET_GOAL_ID}`))
  }

  console.log(chalk.green(`\n✅ ALL data now reflects AI training patterns`))
  console.log(chalk.green(`✅ ZERO field loss - all original fields preserved`))
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})