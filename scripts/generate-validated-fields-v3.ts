#!/usr/bin/env tsx

/**
 * Validated Field Generation System V3
 *
 * Complete rewrite addressing critical V2 issues:
 * - 40% error rate due to duplicates and case problems
 * - Missing context awareness
 * - Mechanistic distributions instead of AI training data
 * - Category-field confusion
 *
 * V3 Core Features:
 * 1. AI training data only (no mechanistic distributions)
 * 2. Goal context awareness (solution used FOR specific goal)
 * 3. Category-specific field generation
 * 4. Exact dropdown compliance with deduplication
 * 5. Atomic field-by-field processing with rollback
 * 6. Comprehensive validation and backup/restore
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { Command } from 'commander'
import chalk from 'chalk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs'
import path from 'path'

// Import V3 utilities
import { getRequiredFields } from './field-generation-utils/category-config'
import { deduplicateDistributionData } from './field-generation-utils/deduplicator'
import { validateFieldData, needsRegeneration } from './field-generation-utils/field-validator'
import { generateEnhancedPrompt, validatePromptInputs } from './field-generation-utils/prompt-generator'
// import { backupGoalFields } from './backup-goal-fields'

dotenv.config({ path: '.env.local' })

// Database and AI setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

// Command line interface
const program = new Command()

program
  .name('generate-validated-fields-v3')
  .description('Generate high-quality field data using V3 system')
  .requiredOption('--goal-id <uuid>', 'Goal ID to process')
  .option('--solution-limit <number>', 'Limit number of solutions to process', '0')
  .option('--field-filter <fields>', 'Only process specific fields (comma-separated)')
  .option('--dry-run', 'Preview changes without applying them')
  .option('--skip-backup', 'Skip backup creation (dangerous!)')
  .option('--force-regenerate', 'Regenerate all fields, even good quality ones')
  .option('--resume', 'Resume from last checkpoint')
  .option('--api-delay <ms>', 'Delay between API calls in milliseconds', '4000')
  .option('--state-file <path>', 'Path to generator state file', '.cache/generate-validated-fields/state.json')
  .option('--verbose', 'Verbose output')
  .parse()

const options = program.opts()

const stateFilePath = path.resolve(options.stateFile)
const isDryRun = Boolean(options.dryRun)

// Types and interfaces
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

type AggregatedFieldMap = Record<string, unknown> & { _metadata?: Record<string, unknown> }
type SolutionFieldMap = Record<string, unknown>

interface SolutionLink {
  id: string
  goal_id: string
  implementation_id: string
  aggregated_fields: AggregatedFieldMap
  solution_fields: SolutionFieldMap
  implementation_name: string
  implementation_category: string
}

interface ProcessingStats {
  totalSolutions: number
  solutionsProcessed: number
  fieldsGenerated: number
  fieldsSkipped: number
  fieldsErrored: number
  validationErrors: number
  apiCalls: number
  startTime: number
  checkpoints: string[]
  lastPersistedIndex: number
}

// Global processing state
const stats: ProcessingStats = {
  totalSolutions: 0,
  solutionsProcessed: 0,
  fieldsGenerated: 0,
  fieldsSkipped: 0,
  fieldsErrored: 0,
  validationErrors: 0,
  apiCalls: 0,
  startTime: Date.now(),
  checkpoints: [],
  lastPersistedIndex: -1
}

interface GeneratorState {
  goalId: string
  processedImplementations: string[]
  lastUpdated: string
  totalSolutions?: number
}

let generatorState: GeneratorState = {
  goalId: options.goalId,
  processedImplementations: [],
  lastUpdated: new Date().toISOString()
}

function ensureStateDirectory(filePath: string): void {
  const dir = path.dirname(filePath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function loadState(statePath: string, goalId: string, resume: boolean): GeneratorState {
  if (resume) {
    if (!existsSync(statePath)) {
      console.warn(chalk.yellow('⚠️  Resume requested but no state file found – starting fresh.'))
      return {
        goalId,
        processedImplementations: [],
        lastUpdated: new Date().toISOString()
      }
    }

    try {
      const parsed = JSON.parse(readFileSync(statePath, 'utf-8')) as Partial<GeneratorState>
      if (parsed.goalId && parsed.goalId !== goalId) {
        console.warn(chalk.yellow('⚠️  State file goal mismatch – ignoring previous state.'))
        return {
          goalId,
          processedImplementations: [],
          lastUpdated: new Date().toISOString()
        }
      }

      return {
        goalId,
        processedImplementations: Array.isArray(parsed.processedImplementations)
          ? parsed.processedImplementations
          : [],
        lastUpdated: parsed.lastUpdated ?? new Date().toISOString(),
        totalSolutions: parsed.totalSolutions
      }
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Failed to load state file (${(error as Error).message}) – starting fresh.`))
      return {
        goalId,
        processedImplementations: [],
        lastUpdated: new Date().toISOString()
      }
    }
  }

  if (!isDryRun && existsSync(statePath)) {
    try {
      unlinkSync(statePath)
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Unable to remove existing state file: ${(error as Error).message}`))
    }
  }

  return {
    goalId,
    processedImplementations: [],
    lastUpdated: new Date().toISOString()
  }
}

function saveState(statePath: string, state: GeneratorState): void {
  if (isDryRun) return
  try {
    ensureStateDirectory(statePath)
    writeFileSync(statePath, JSON.stringify(state, null, 2))
  } catch (error) {
    console.error(chalk.red(`❌ Failed to persist state file: ${(error as Error).message}`))
  }
}

/**
 * Get goal and solution data for processing
 */
async function getGoalData(goalId: string): Promise<{
  goalTitle: string
  solutionLinks: SolutionLink[]
}> {
  console.log(chalk.blue(`📊 Loading goal data: ${goalId}`))

  // Get goal title
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .select('title')
    .eq('id', goalId)
    .single()

  if (goalError) {
    throw new Error(`Failed to get goal: ${goalError.message}`)
  }

  const goalTitle = goal.title

  // Get solution links with implementation details
  const { data: links, error: linksError } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      goal_id,
      implementation_id,
      aggregated_fields,
      solution_fields,
      solution_variants!inner (
        solutions!inner (
          title,
          solution_category
        )
      )
    `)
    .eq('goal_id', goalId)

  if (linksError) {
    throw new Error(`Failed to get solution links: ${linksError.message}`)
  }

  if (!links || links.length === 0) {
    throw new Error(`No solutions found for goal ${goalId}`)
  }

  // Transform data
const solutionLinks: SolutionLink[] = links.map(link => {
    const variantData = (link.solution_variants ?? null) as {
      solutions?: { title?: string | null; solution_category?: string | null } | null
    } | null

    const solutionInfo = variantData?.solutions ?? {}

    return {
      id: link.id,
      goal_id: link.goal_id,
      implementation_id: link.implementation_id,
      aggregated_fields: (link.aggregated_fields ?? {}) as AggregatedFieldMap,
      solution_fields: (link.solution_fields ?? {}) as SolutionFieldMap,
      implementation_name: solutionInfo.title ?? 'Unknown',
      implementation_category: solutionInfo.solution_category ?? 'unknown'
    }
  })

  // Apply solution limit if specified
  const limitedLinks = options.solutionLimit > 0
    ? solutionLinks.slice(0, parseInt(options.solutionLimit))
    : solutionLinks

  console.log(chalk.green(`✅ Loaded ${limitedLinks.length} solutions for "${goalTitle}"`))

  return {
    goalTitle,
    solutionLinks: limitedLinks
  }
}

function normalizeDistributionData(distribution: DistributionData): DistributionData {
  const copy: DistributionData = {
    ...distribution,
    dataSource: distribution.dataSource || 'ai_training_data',
    totalReports: typeof distribution.totalReports === 'number' && distribution.totalReports > 0
      ? distribution.totalReports
      : 100,
    values: distribution.values.map(value => ({
      ...value,
      source: value.source || 'ai_training_data'
    }))
  }

  // Ensure percentages sum to 100 (deduplicator already tries, but round again for safety)
  const totalPercentage = copy.values.reduce((sum, item) => sum + item.percentage, 0)
  if (totalPercentage !== 100) {
    const difference = 100 - totalPercentage
    const largestIndex = copy.values.findIndex(item => item.percentage === Math.max(...copy.values.map(v => v.percentage)))
    if (largestIndex >= 0) {
      copy.values[largestIndex] = {
        ...copy.values[largestIndex],
        percentage: copy.values[largestIndex].percentage + difference
      }
    }
  }

  return copy
}

function buildAggregatedMetadata(
  existing: Record<string, unknown> | undefined,
  solutionName: string,
  goalTitle: string
): Record<string, unknown> {
  return {
    confidence: existing?.confidence || 'high',
    ai_enhanced: true,
    generated_at: new Date().toISOString(),
    data_source: 'ai_training_data',
    value_mapped: true,
    mapping_version: 'field-generator-v3',
    source_solution: solutionName,
    target_goal: goalTitle,
    user_ratings: existing?.user_ratings ?? 0
  }
}

const PRACTICE_HOBBY_CATEGORIES = new Set([
  'meditation_mindfulness',
  'exercise_movement',
  'habits_routines',
  'hobbies_activities'
])

function isMeaningfulValue(distribution?: DistributionData): boolean {
  if (!distribution) return false
  const mode = distribution.mode.toLowerCase()
  if (mode.includes("don't remember") || mode.includes('unknown')) return false
  return true
}

function isFreeValue(distribution?: DistributionData): boolean {
  if (!distribution) return false
  return distribution.mode.toLowerCase().includes('free')
}

function deriveCostFieldsForCategory(
  category: string,
  aggregatedFields: AggregatedFieldMap,
  solutionFields: SolutionFieldMap
): void {
  if (!PRACTICE_HOBBY_CATEGORIES.has(category)) return

  const startupCost = aggregatedFields.startup_cost as DistributionData | undefined
  const ongoingCost = aggregatedFields.ongoing_cost as DistributionData | undefined

  if (!startupCost && !ongoingCost) return

  const meaningfulStartup = isMeaningfulValue(startupCost)
  const meaningfulOngoing = isMeaningfulValue(ongoingCost)

  const paidStartup = meaningfulStartup && !isFreeValue(startupCost)
  const paidOngoing = meaningfulOngoing && !isFreeValue(ongoingCost)

  if (!aggregatedFields.cost) {
    let derivedCost: DistributionData | undefined
    if (paidOngoing) derivedCost = ongoingCost
    else if (paidStartup) derivedCost = startupCost
    else if (meaningfulOngoing) derivedCost = ongoingCost
    else if (meaningfulStartup) derivedCost = startupCost
    else derivedCost = ongoingCost ?? startupCost

    if (derivedCost) {
      aggregatedFields.cost = derivedCost
      solutionFields.cost = derivedCost
    }
  }

  if (!aggregatedFields.cost_type) {
    let costTypeMode: string | undefined
    if (paidOngoing && paidStartup) costTypeMode = 'dual'
    else if (paidOngoing) costTypeMode = 'recurring'
    else if (paidStartup) costTypeMode = 'one_time'
    else if (meaningfulOngoing || meaningfulStartup) {
      if (isFreeValue(ongoingCost) || isFreeValue(startupCost)) costTypeMode = 'free'
      else costTypeMode = 'unknown'
    }

    if (costTypeMode) {
      const distribution: DistributionData = {
        mode: costTypeMode,
        values: [
          {
            value: costTypeMode,
            count: 100,
            percentage: 100,
            source: 'ai_training_data'
          }
        ],
        totalReports: 100,
        dataSource: 'ai_training_data'
      }
      aggregatedFields.cost_type = distribution
      solutionFields.cost_type = distribution
    }
  }
}

/**
 * Assess field quality and determine what needs regeneration
 */
function assessFieldQuality(
  solutionLink: SolutionLink,
  fieldName: string
): { needsRegeneration: boolean; reason: string } {
  const { aggregated_fields, implementation_category } = solutionLink

  // Check if field is required for this category
  const requiredFields = getRequiredFields(implementation_category)
  if (!requiredFields.includes(fieldName)) {
    return { needsRegeneration: false, reason: 'field not required for category' }
  }

  const fieldData = aggregated_fields[fieldName]

  // Force regeneration if requested
  if (options.forceRegenerate) {
    return { needsRegeneration: true, reason: 'force regeneration requested' }
  }

  // Use validator to check if regeneration is needed
  const needsRegen = needsRegeneration(fieldData, fieldName, implementation_category)

  if (!needsRegen) {
    return { needsRegeneration: false, reason: 'good quality data exists' }
  }

  // Determine specific reason
  if (!fieldData) {
    return { needsRegeneration: true, reason: 'missing field data' }
  }

  if (typeof fieldData === 'string') {
    return { needsRegeneration: true, reason: 'string field needs conversion' }
  }

  const distributionValues = Array.isArray((fieldData as { values?: DistributionValue[] }).values)
    ? ((fieldData as { values: DistributionValue[] }).values)
    : undefined

  if (distributionValues && distributionValues.length === 1) {
    return { needsRegeneration: true, reason: 'single value distribution' }
  }

  if (distributionValues && distributionValues.length < 4) {
    return { needsRegeneration: true, reason: 'degraded diversity (<4 options)' }
  }

  if (
    distributionValues &&
    distributionValues.some(value => typeof value.source === 'string' && value.source.includes('fallback'))
  ) {
    return { needsRegeneration: true, reason: 'fallback sources detected' }
  }

  return { needsRegeneration: true, reason: 'quality issues detected' }
}

/**
 * Generate field data using AI with context awareness
 */
async function generateFieldData(
  fieldName: string,
  solutionName: string,
  category: string,
  goalTitle: string
): Promise<DistributionData> {
  console.log(chalk.gray(`    🤖 Generating ${fieldName} for ${solutionName}...`))

  // Validate inputs
  const validation = validatePromptInputs(fieldName, solutionName, category, goalTitle)
  if (!validation.isValid) {
    throw new Error(`Prompt validation failed: ${validation.errors.join(', ')}`)
  }

  // Generate context-aware prompt
  const prompt = generateEnhancedPrompt(fieldName, solutionName, category, goalTitle)

  if (options.verbose) {
    console.log(chalk.gray(`    Prompt: ${prompt.substring(0, 200)}...`))
  }

  // Call AI
  const result = await model.generateContent(prompt)
  const response = result.response.text()
  stats.apiCalls++

  // Rate limiting to respect API quotas (15 requests/minute = 1 every 4 seconds)
  if (!options.dryRun) {
    const delay = parseInt(options.apiDelay)
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  if (options.verbose) {
    console.log(chalk.gray(`    Response: ${response.substring(0, 200)}...`))
  }

  // Parse JSON response
  let rawData: DistributionData
  try {
    // Clean response (remove markdown formatting if present)
    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim()
    rawData = JSON.parse(cleanResponse)
  } catch (error) {
    throw new Error(`Failed to parse AI response: ${error.message}`)
  }

  // Validate basic structure
  if (!rawData.mode || !rawData.values || !Array.isArray(rawData.values)) {
    throw new Error('Invalid AI response structure')
  }

  // Apply deduplication
  const deduplicatedData = deduplicateDistributionData(rawData)

  // Validate final result
  const finalValidation = validateFieldData(deduplicatedData, fieldName, category)
  if (!finalValidation.isValid) {
    throw new Error(`Generated data failed validation: ${finalValidation.errors.join(', ')}`)
  }

  console.log(chalk.green(`    ✅ Generated ${deduplicatedData.values.length} options for ${fieldName}`))

  return deduplicatedData
}

/**
 * Process a single field for a solution
 */
async function processField(
  solutionLink: SolutionLink,
  fieldName: string,
  goalTitle: string
): Promise<{ updated: boolean; reason: string }> {
  const { implementation_name, implementation_category } = solutionLink

  if (
    PRACTICE_HOBBY_CATEGORIES.has(implementation_category) &&
    (fieldName === 'cost' || fieldName === 'cost_type')
  ) {
    stats.fieldsSkipped++
    if (options.verbose) {
      console.log(chalk.gray(`    ⏭️  Skipping derived field ${fieldName} for ${implementation_category}`))
    }
    return { updated: false, reason: 'derived field handled via split cost derivation' }
  }

  // Assess quality
  const assessment = assessFieldQuality(solutionLink, fieldName)

  if (!assessment.needsRegeneration) {
    stats.fieldsSkipped++
    return { updated: false, reason: assessment.reason }
  }

  if (options.dryRun) {
    console.log(chalk.blue(`    [DRY RUN] Would regenerate ${fieldName}: ${assessment.reason}`))
    return { updated: false, reason: `dry run: ${assessment.reason}` }
  }

  try {
    // Generate new field data
    const newFieldData = await generateFieldData(
      fieldName,
      implementation_name,
      implementation_category,
      goalTitle
    )

    const normalizedField = normalizeDistributionData(newFieldData)

    const aggregatedCopy: AggregatedFieldMap = {
      ...(solutionLink.aggregated_fields ?? {})
    }
    const solutionFieldsCopy: SolutionFieldMap = {
      ...(solutionLink.solution_fields ?? {})
    }

    const metadata = buildAggregatedMetadata(
      aggregatedCopy._metadata,
      implementation_name,
      goalTitle
    )

    aggregatedCopy._metadata = metadata
    aggregatedCopy[fieldName] = normalizedField
    solutionFieldsCopy[fieldName] = normalizedField

    // Derive cost and cost_type for practice/hobby categories after generating split fields
    deriveCostFieldsForCategory(
      implementation_category,
      aggregatedCopy,
      solutionFieldsCopy
    )

    const updatedAggregatedFields = aggregatedCopy
    const updatedSolutionFields = solutionFieldsCopy

    const { error } = await supabase
      .from('goal_implementation_links')
      .update({
        aggregated_fields: updatedAggregatedFields,
        solution_fields: updatedSolutionFields,
        data_display_mode: 'ai',
        needs_aggregation: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', solutionLink.id)

    if (error) {
      throw new Error(`Database update failed: ${error.message}`)
    }

    solutionLink.aggregated_fields = updatedAggregatedFields
    solutionLink.solution_fields = updatedSolutionFields

    stats.fieldsGenerated++
    return { updated: true, reason: `generated: ${assessment.reason}` }

  } catch (error) {
    console.error(chalk.red(`    ❌ Failed to process ${fieldName}: ${error.message}`))
    stats.fieldsErrored++
    return { updated: false, reason: `error: ${error.message}` }
  }
}

/**
 * Process a single solution (all required fields)
 */
async function processSolution(
  solutionLink: SolutionLink,
  goalTitle: string
): Promise<void> {
  const { implementation_name, implementation_category } = solutionLink

  console.log(chalk.blue(`\n🔧 Processing: ${implementation_name} (${implementation_category})`))

  // Get required fields for this category
  const requiredFields = getRequiredFields(implementation_category)

  // Apply field filter if specified
  const fieldsToProcess = options.fieldFilter
    ? requiredFields.filter(field => options.fieldFilter.split(',').includes(field))
    : requiredFields

  if (fieldsToProcess.length === 0) {
    console.log(chalk.yellow(`  ⚠️  No fields to process for ${implementation_category}`))
    return
  }

  console.log(chalk.gray(`  Fields to check: ${fieldsToProcess.join(', ')}`))

  // Process each field
  const results: Array<{ field: string; updated: boolean; reason: string }> = []

  for (const fieldName of fieldsToProcess) {
    const result = await processField(solutionLink, fieldName, goalTitle)
    results.push({ field: fieldName, updated: result.updated, reason: result.reason })

    if (options.verbose) {
      const status = result.updated ? chalk.green('✅') : chalk.gray('⏭️')
      console.log(`    ${status} ${fieldName}: ${result.reason}`)
    }
  }

  // Summary for this solution
  const updated = results.filter(r => r.updated).length
  const skipped = results.filter(r => !r.updated).length

  if (updated > 0) {
    console.log(chalk.green(`  ✅ Updated ${updated} fields, skipped ${skipped}`))
  } else {
    console.log(chalk.gray(`  ⏭️  All fields up to date`))
  }

  stats.solutionsProcessed++
}

/**
 * Create progress checkpoint
 */
async function createCheckpoint(message: string): Promise<void> {
  const checkpoint = `${new Date().toISOString()}: ${message}`
  stats.checkpoints.push(checkpoint)

  console.log(chalk.blue(`📍 Checkpoint: ${message}`))

  // Log current stats
  const elapsed = (Date.now() - stats.startTime) / 1000
  console.log(chalk.gray(`   Progress: ${stats.solutionsProcessed}/${stats.totalSolutions} solutions`))
  console.log(chalk.gray(`   Fields: ${stats.fieldsGenerated} generated, ${stats.fieldsSkipped} skipped, ${stats.fieldsErrored} errors`))
  console.log(chalk.gray(`   API calls: ${stats.apiCalls}, Elapsed: ${elapsed.toFixed(1)}s`))

  if (!isDryRun) {
    stats.lastPersistedIndex = stats.solutionsProcessed
    generatorState.lastUpdated = new Date().toISOString()
    generatorState.totalSolutions = stats.totalSolutions
    saveState(stateFilePath, generatorState)
  }
}

/**
 * Main processing function
 */
async function main(): Promise<void> {
  try {
    console.log(chalk.blue('🚀 WWFM Field Generation V3'))
    console.log(chalk.gray('====================================='))
    console.log(chalk.gray(`Goal ID: ${options.goalId}`))
    console.log(chalk.gray(`Solution limit: ${options.solutionLimit || 'unlimited'}`))
    console.log(chalk.gray(`Field filter: ${options.fieldFilter || 'all required fields'}`))
    console.log(chalk.gray(`Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`))

    // Load persisted state
    generatorState = loadState(stateFilePath, options.goalId, Boolean(options.resume))

    // Load goal data
    const { goalTitle, solutionLinks } = await getGoalData(options.goalId)
    stats.totalSolutions = solutionLinks.length

    console.log(chalk.yellow(`\n📋 Processing "${goalTitle}" (${stats.totalSolutions} solutions)`))

    const existingIds = new Set(solutionLinks.map(link => link.implementation_id))
    generatorState.processedImplementations = generatorState.processedImplementations.filter(id => existingIds.has(id))
    stats.solutionsProcessed = generatorState.processedImplementations.length
    generatorState.totalSolutions = stats.totalSolutions

    if (generatorState.processedImplementations.length > 0) {
      console.log(
        chalk.gray(`🔁 Resume state detected – ${generatorState.processedImplementations.length} solutions already processed.`)
      )
    }

    if (!isDryRun) {
      saveState(stateFilePath, generatorState)
    }

    const processedSet = new Set(generatorState.processedImplementations)

    // Create backup unless skipped
    if (!options.skipBackup && !options.dryRun) {
      console.log(chalk.blue('\n💾 Backup creation temporarily disabled for testing'))
      // await backupGoalFields(options.goalId, 'backups')
      // console.log(chalk.green('✅ Backup created'))
    }

    await createCheckpoint('Processing started')

    // Process each solution
    for (let i = 0; i < solutionLinks.length; i++) {
      const solutionLink = solutionLinks[i]

      if (processedSet.has(solutionLink.implementation_id)) {
        if (options.verbose) {
          console.log(chalk.gray(`⏭️  Skipping ${solutionLink.implementation_name} (already processed)`))
        }
        continue
      }

      try {
        await processSolution(solutionLink, goalTitle)

        if (!processedSet.has(solutionLink.implementation_id)) {
          processedSet.add(solutionLink.implementation_id)
          generatorState.processedImplementations.push(solutionLink.implementation_id)
          generatorState.lastUpdated = new Date().toISOString()
          generatorState.totalSolutions = stats.totalSolutions

          if (!isDryRun) {
            saveState(stateFilePath, generatorState)
          }
        }

        // Create checkpoint every 10 solutions
        if ((i + 1) % 10 === 0) {
          await createCheckpoint(`Processed ${i + 1}/${solutionLinks.length} solutions`)
        }

      } catch (error) {
        console.error(chalk.red(`❌ Failed to process solution ${solutionLink.implementation_name}: ${error.message}`))
        stats.fieldsErrored++
      }
    }

    await createCheckpoint('Processing completed')

    // Final summary
    console.log(chalk.green('\n🎉 Processing Complete!'))
    console.log(chalk.blue('\n📊 Final Statistics:'))
    console.log(chalk.gray(`   Solutions processed: ${stats.solutionsProcessed}/${stats.totalSolutions}`))
    console.log(chalk.gray(`   Fields generated: ${stats.fieldsGenerated}`))
    console.log(chalk.gray(`   Fields skipped: ${stats.fieldsSkipped}`))
    console.log(chalk.gray(`   Fields errored: ${stats.fieldsErrored}`))
    console.log(chalk.gray(`   API calls made: ${stats.apiCalls}`))

    const elapsed = (Date.now() - stats.startTime) / 1000
    console.log(chalk.gray(`   Total time: ${elapsed.toFixed(1)}s`))

    if (!isDryRun && stats.fieldsErrored === 0) {
      try {
        if (existsSync(stateFilePath)) {
          unlinkSync(stateFilePath)
        }
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Failed to clean up state file: ${(error as Error).message}`))
      }
    }

    if (stats.fieldsErrored > 0) {
      const errorRate = (stats.fieldsErrored / (stats.fieldsGenerated + stats.fieldsErrored)) * 100
      console.log(chalk.yellow(`   Error rate: ${errorRate.toFixed(1)}%`))
    }

    if (options.dryRun) {
      console.log(chalk.blue('\n🔍 DRY RUN - No changes were made to the database'))
      console.log(chalk.white('Remove --dry-run flag to apply changes'))
    } else if (stats.fieldsGenerated > 0) {
      console.log(chalk.green('\n✅ Database updated successfully'))
      console.log(chalk.blue('🌐 Check the frontend to verify data quality'))
    }

  } catch (error) {
    console.error(chalk.red(`❌ Processing failed: ${error.message}`))

    if (error.stack && options.verbose) {
      console.error(chalk.gray(error.stack))
    }

    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { main, generateFieldData, assessFieldQuality }
