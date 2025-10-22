#!/usr/bin/env tsx

/**
 * AI Wisdom Data Seed Script
 *
 * Generates realistic wisdom data for all goals using AI training data patterns.
 * This seeds hypothesized long-term impact data that will transition to human data
 * after 10 real retrospectives.
 *
 * Features:
 * - Context-aware generation (goal-specific wisdom)
 * - Realistic lasting_value_score (1.5-4.8 range)
 * - 5-8 unexpected benefits per goal
 * - State file for resumability
 * - API rate limiting (4 second delay)
 * - Dry-run mode for testing
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { Command } from 'commander'
import chalk from 'chalk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import path from 'path'

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
  .name('seed-ai-wisdom-data')
  .description('Generate AI wisdom data for all goals')
  .option('--dry-run', 'Preview changes without applying them')
  .option('--resume', 'Resume from last checkpoint')
  .option('--api-delay <ms>', 'Delay between API calls in milliseconds', '4000')
  .option('--state-file <path>', 'Path to generator state file', '.cache/wisdom-seed/state.json')
  .option('--goal-limit <number>', 'Limit number of goals to process (for testing)', '0')
  .option('--verbose', 'Verbose output')
  .parse()

const options = program.opts()

const stateFilePath = path.resolve(options.stateFile)
const isDryRun = Boolean(options.dryRun)

// Types
interface Goal {
  id: string
  title: string
  arena: string
}

interface WisdomData {
  lasting_value_score: number
  common_benefits: string[]
  total_retrospectives: number
  data_source: 'ai_training_data'
  ai_generated_at: string
}

interface GeneratorState {
  processedGoalIds: string[]
  lastUpdated: string
  totalGoals?: number
}

interface ProcessingStats {
  totalGoals: number
  goalsProcessed: number
  goalsSkipped: number
  goalsErrored: number
  apiCalls: number
  startTime: number
}

// Global processing state
const stats: ProcessingStats = {
  totalGoals: 0,
  goalsProcessed: 0,
  goalsSkipped: 0,
  goalsErrored: 0,
  apiCalls: 0,
  startTime: Date.now()
}

let generatorState: GeneratorState = {
  processedGoalIds: [],
  lastUpdated: new Date().toISOString()
}

function ensureStateDirectory(filePath: string): void {
  const dir = path.dirname(filePath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function loadState(statePath: string, resume: boolean): GeneratorState {
  if (resume) {
    if (!existsSync(statePath)) {
      console.warn(chalk.yellow('⚠️  Resume requested but no state file found – starting fresh.'))
      return {
        processedGoalIds: [],
        lastUpdated: new Date().toISOString()
      }
    }

    try {
      const stateData = readFileSync(statePath, 'utf8')
      const state = JSON.parse(stateData) as GeneratorState
      console.log(chalk.green(`✅ Loaded state: ${state.processedGoalIds.length} goals already processed`))
      return state
    } catch (error) {
      console.error(chalk.red(`❌ Failed to load state file: ${(error as Error).message}`))
      console.warn(chalk.yellow('⚠️  Starting fresh...'))
      return {
        processedGoalIds: [],
        lastUpdated: new Date().toISOString()
      }
    }
  }

  return {
    processedGoalIds: [],
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
 * Fetch all goals from database
 */
async function getAllGoals(): Promise<Goal[]> {
  console.log(chalk.blue('📊 Loading all goals from database...'))

  const { data, error } = await supabase
    .from('goals')
    .select(`
      id,
      title,
      arenas!inner (
        name
      )
    `)
    .order('title')

  if (error) {
    throw new Error(`Failed to fetch goals: ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error('No goals found in database')
  }

  // Transform data
  const goals: Goal[] = data.map(goal => {
    const arenaData = (goal.arenas ?? null) as { name?: string } | null
    return {
      id: goal.id,
      title: goal.title,
      arena: arenaData?.name ?? 'Unknown'
    }
  })

  console.log(chalk.green(`✅ Loaded ${goals.length} goals`))

  return goals
}

/**
 * Generate wisdom data using AI with goal context
 */
async function generateWisdomData(goal: Goal): Promise<WisdomData> {
  console.log(chalk.gray(`  🤖 Generating wisdom data for "${goal.title}"...`))

  const prompt = `Based on your training data about people who achieved the goal "${goal.title}" (in the life area: ${goal.arena}), generate realistic long-term impact data.

CONTEXT:
This is for a platform that helps people find solutions to life challenges. We're generating hypothesized wisdom data based on AI training patterns that will eventually be replaced by real user retrospectives after 6+ months.

CRITICAL INSTRUCTIONS:
1. The lasting_value_score should reflect realistic long-term impact for this specific goal
2. Generate 5-8 unexpected benefits that people might experience 6+ months after achieving this goal
3. These should feel authentic - like they came from real people reflecting on their lives
4. Draw from psychology research, user experience patterns, and longitudinal studies in your training data

SCORING GUIDE for lasting_value_score:
- 1.5-2.5: Low lasting impact (temporary relief, limited life change)
- 2.5-3.5: Moderate lasting impact (noticeable improvements, some life changes)
- 3.5-4.5: High lasting impact (fundamental positive changes, significant life improvements)
- 4.5-4.8: Very high lasting impact (transformative, life-changing results)

UNEXPECTED BENEFITS GUIDE:
- Should be specific and concrete (not generic like "felt better")
- Should reflect second-order effects (e.g., "Improved sleep" → "More energy for creative projects")
- Should feel personal and human (use first-person language like "Found myself...")
- Examples:
  * "Started taking on leadership roles I would have avoided before"
  * "Noticed my relationships improved without actively working on them"
  * "Found myself naturally making healthier choices in other areas"
  * "Developed a new appreciation for quiet moments alone"

Return ONLY a JSON object in this exact format:
{
  "lasting_value_score": 3.7,
  "common_benefits": [
    "First unexpected benefit here",
    "Second unexpected benefit here",
    "Third unexpected benefit here",
    "Fourth unexpected benefit here",
    "Fifth unexpected benefit here"
  ]
}

Remember: This should reflect patterns from your training data about how achieving "${goal.title}" impacts people's lives 6+ months later.`

  if (options.verbose) {
    console.log(chalk.gray(`    Prompt: ${prompt.substring(0, 300)}...`))
  }

  // Call AI
  const result = await model.generateContent(prompt)
  const response = result.response.text()
  stats.apiCalls++

  // Rate limiting (15 requests/minute = 1 every 4 seconds)
  if (!isDryRun) {
    const delay = parseInt(options.apiDelay)
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  if (options.verbose) {
    console.log(chalk.gray(`    Response: ${response.substring(0, 200)}...`))
  }

  // Parse JSON response
  let rawData: { lasting_value_score: number; common_benefits: string[] }
  try {
    // Clean response (remove markdown formatting if present)
    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim()
    rawData = JSON.parse(cleanResponse)
  } catch (error) {
    throw new Error(`Failed to parse AI response: ${(error as Error).message}`)
  }

  // Validate structure
  if (
    typeof rawData.lasting_value_score !== 'number' ||
    !Array.isArray(rawData.common_benefits) ||
    rawData.common_benefits.length < 5
  ) {
    throw new Error('Invalid AI response structure')
  }

  // Validate score range
  if (rawData.lasting_value_score < 1 || rawData.lasting_value_score > 5) {
    throw new Error(`Invalid lasting_value_score: ${rawData.lasting_value_score} (must be 1-5)`)
  }

  console.log(
    chalk.green(
      `    ✅ Generated score: ${rawData.lasting_value_score.toFixed(1)}/5 with ${rawData.common_benefits.length} benefits`
    )
  )

  return {
    lasting_value_score: rawData.lasting_value_score,
    common_benefits: rawData.common_benefits,
    total_retrospectives: 0, // AI data starts at 0
    data_source: 'ai_training_data',
    ai_generated_at: new Date().toISOString()
  }
}

/**
 * Save wisdom data to database
 */
async function saveWisdomData(goalId: string, wisdomData: WisdomData): Promise<void> {
  if (isDryRun) {
    console.log(chalk.yellow('    [DRY RUN] Would insert wisdom data'))
    return
  }

  // Check if wisdom data already exists
  const { data: existing } = await supabase
    .from('goal_wisdom_scores')
    .select('id')
    .eq('goal_id', goalId)
    .single()

  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from('goal_wisdom_scores')
      .update({
        lasting_value_score: wisdomData.lasting_value_score,
        common_benefits: wisdomData.common_benefits,
        total_retrospectives: wisdomData.total_retrospectives,
        data_source: wisdomData.data_source,
        ai_generated_at: wisdomData.ai_generated_at
      })
      .eq('goal_id', goalId)

    if (error) {
      throw new Error(`Failed to update wisdom data: ${error.message}`)
    }

    console.log(chalk.blue('    📝 Updated existing wisdom data'))
  } else {
    // Insert new record
    const { error } = await supabase.from('goal_wisdom_scores').insert({
      goal_id: goalId,
      lasting_value_score: wisdomData.lasting_value_score,
      common_benefits: wisdomData.common_benefits,
      total_retrospectives: wisdomData.total_retrospectives,
      data_source: wisdomData.data_source,
      ai_generated_at: wisdomData.ai_generated_at,
      retrospectives_6m: 0,
      retrospectives_12m: 0,
      worth_pursuing_percentage: null
    })

    if (error) {
      throw new Error(`Failed to insert wisdom data: ${error.message}`)
    }

    console.log(chalk.green('    ✅ Inserted new wisdom data'))
  }
}

/**
 * Process a single goal
 */
async function processGoal(goal: Goal): Promise<boolean> {
  try {
    console.log(chalk.cyan(`\n🎯 Processing: ${goal.title} (${goal.arena})`))

    // Generate wisdom data
    const wisdomData = await generateWisdomData(goal)

    // Save to database
    await saveWisdomData(goal.id, wisdomData)

    stats.goalsProcessed++
    return true
  } catch (error) {
    console.error(chalk.red(`  ❌ Error: ${(error as Error).message}`))
    stats.goalsErrored++
    return false
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(chalk.bold.blue('\n🌟 AI Wisdom Data Seed Script\n'))

  if (isDryRun) {
    console.log(chalk.yellow('🔍 DRY RUN MODE - No changes will be saved\n'))
  }

  // Load state
  generatorState = loadState(stateFilePath, options.resume)

  // Get all goals
  let goals = await getAllGoals()

  // Apply goal limit if specified (for testing)
  if (options.goalLimit > 0) {
    const limit = parseInt(options.goalLimit)
    console.log(chalk.yellow(`⚠️  Limiting to ${limit} goals for testing\n`))
    goals = goals.slice(0, limit)
  }

  stats.totalGoals = goals.length

  // Filter out already processed goals if resuming
  const goalsToProcess = options.resume
    ? goals.filter(goal => !generatorState.processedGoalIds.includes(goal.id))
    : goals

  console.log(chalk.blue(`📊 Processing ${goalsToProcess.length} goals\n`))

  // Process each goal
  for (const goal of goalsToProcess) {
    const success = await processGoal(goal)

    if (success) {
      // Update state
      generatorState.processedGoalIds.push(goal.id)
      generatorState.lastUpdated = new Date().toISOString()
      generatorState.totalGoals = goals.length
      saveState(stateFilePath, generatorState)
    }

    // Progress update every 10 goals
    if ((stats.goalsProcessed + stats.goalsErrored) % 10 === 0) {
      const elapsed = (Date.now() - stats.startTime) / 1000 / 60
      const rate = (stats.goalsProcessed + stats.goalsErrored) / elapsed
      const remaining = (goalsToProcess.length - stats.goalsProcessed - stats.goalsErrored) / rate
      console.log(
        chalk.gray(
          `\n📊 Progress: ${stats.goalsProcessed}/${goalsToProcess.length} | ` +
            `Errors: ${stats.goalsErrored} | ` +
            `Rate: ${rate.toFixed(1)} goals/min | ` +
            `ETA: ${remaining.toFixed(0)} min\n`
        )
      )
    }
  }

  // Final stats
  const totalTime = (Date.now() - stats.startTime) / 1000 / 60
  console.log(chalk.bold.green('\n✅ Processing Complete!\n'))
  console.log(chalk.blue('📊 Final Statistics:'))
  console.log(chalk.gray(`  Goals processed: ${stats.goalsProcessed}`))
  console.log(chalk.gray(`  Goals skipped: ${stats.goalsSkipped}`))
  console.log(chalk.gray(`  Goals errored: ${stats.goalsErrored}`))
  console.log(chalk.gray(`  API calls: ${stats.apiCalls}`))
  console.log(chalk.gray(`  Total time: ${totalTime.toFixed(1)} minutes`))
  console.log(chalk.gray(`  Average: ${(totalTime / stats.goalsProcessed).toFixed(2)} min/goal\n`))

  if (isDryRun) {
    console.log(chalk.yellow('🔍 DRY RUN - No changes were saved to database\n'))
  } else {
    console.log(chalk.green('💾 All wisdom data saved to database\n'))
  }
}

// Run main function
main().catch(error => {
  console.error(chalk.red(`\n❌ Fatal error: ${error.message}\n`))
  process.exit(1)
})
