#!/usr/bin/env tsx

/**
 * Quality-First Solution-to-Goal Expansion System
 *
 * Priority-based expansion that focuses on quality over quantity:
 * 1. Zero-connection solutions (genuine gaps)
 * 2. Single-connection solutions (underutilized)
 * 3. Two-connection solutions (minimal coverage)
 *
 * Uses atomic progress tracking and intelligent stopping criteria.
 */

import { createClient } from '@supabase/supabase-js'
import { Command } from 'commander'
import { GeminiClient } from './generators/gemini-client'
import { CredibilityValidator, SolutionData, GoalData } from './services/credibility-validator'
import { ExpansionDataHandler, ExpandedGoalLink } from './services/expansion-data-handler'
import { LaughTestValidator } from './services/laugh-test-validator'
import { ProgressTracker } from './services/progress-tracker'
import { createSolutionToGoalPrompt } from './prompts/expansion-prompts'
import { parseJSONSafely } from './utils/json-repair'
import chalk from 'chalk'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize command line parser
const program = new Command()
  .name('solution-goal-expander-quality')
  .description('Quality-first expansion with priority-based solution selection')
  .option('--category <category>', 'Focus on solutions in specific category')
  .option('--mode <mode>', 'Priority mode: zero|single|double|auto', 'auto')
  .option('--batch-size <number>', 'Solutions per batch', '20')
  .option('--quality-threshold <number>', 'Rejection rate stop threshold (0-100)', '70')
  .option('--coverage-target <number>', 'Category completion target (0-100)', '95')
  .option('--max-goals <number>', 'Maximum goals per solution', '5')
  .option('--laugh-threshold <number>', 'Laugh test score threshold (0-100)', '70')
  .option('--force-write', 'Force updates even when data is unchanged')
  .option('--dirty-only', 'Process only links flagged as needing aggregation/cleanup')
  .option('--dry-run', 'Preview without making database changes')
  .parse()

const options = program.opts()

// Validate required options
if (!options.category) {
  console.error(chalk.red('❌ --category is required'))
  console.log(chalk.gray('Available categories: sleep, apps_software, books_courses, etc.'))
  process.exit(1)
}

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

if (!process.env.GEMINI_API_KEY) {
  console.error(chalk.red('❌ GEMINI_API_KEY not found in environment variables'))
  process.exit(1)
}

const gemini = new GeminiClient(process.env.GEMINI_API_KEY!)
const validator = new CredibilityValidator(supabase)
const dataHandler = new ExpansionDataHandler(supabase, {
  forceWrite: Boolean(options.forceWrite),
  dirtyOnly: Boolean(options.dirtyOnly)
})
const laughTestValidator = new LaughTestValidator(gemini)
const progressTracker = new ProgressTracker()

async function main() {
  console.log(chalk.bold.cyan('\n🔄 WWFM Quality-First Solution Expansion'))
  console.log(chalk.cyan('━'.repeat(80)))
  console.log(chalk.white('🎯 Priority-based expansion: zero → single → double connections'))
  console.log(chalk.white('🧠 Using Gemini AI with laugh test quality validation'))
  console.log(chalk.gray(`📊 Category: ${options.category}, Mode: ${options.mode}, Batch: ${options.batchSize}`))
  console.log(chalk.gray(`🎭 Quality threshold: ${options.qualityThreshold}%, Coverage target: ${options.coverageTarget}%`))

  if (options.dryRun) {
    console.log(chalk.yellow('\n⚠️  DRY RUN MODE - No database changes will be made'))
  }

  try {
    // Initialize progress tracking
    await progressTracker.initializeProgress()

    // Check if expansion should continue for this category
    const shouldContinue = await progressTracker.shouldContinueExpansion(
      options.category,
      parseInt(options.qualityThreshold)
    )

    if (!shouldContinue.shouldContinue) {
      console.log(chalk.yellow(`\n⚠️  Expansion stopped: ${shouldContinue.reason}`))
      return
    }

    console.log(chalk.green(`\n✅ Expansion approved: ${shouldContinue.reason}`))

    let totalExpansions = 0
    let totalRejected = 0
    let batchNumber = 0
    let consecutiveEmptyBatches = 0

    while (true) {
      batchNumber++

      // Get next batch of solutions based on priority
      const batch = await progressTracker.claimNextBatch(
        options.category,
        options.mode as 'zero' | 'single' | 'double' | 'auto',
        parseInt(options.batchSize)
      )

      if (!batch || batch.solutions.length === 0) {
        consecutiveEmptyBatches++
        console.log(chalk.yellow(`\n📭 No solutions available for batch ${batchNumber}`))

        if (consecutiveEmptyBatches >= 3) {
          console.log(chalk.yellow('⚠️  No work available after 3 empty batches, stopping'))
          break
        }
        continue
      }

      consecutiveEmptyBatches = 0

      console.log(chalk.bold.white(`\n📦 Processing Batch ${batchNumber} (${batch.priority_mode} connections)`))
      console.log(chalk.cyan('─'.repeat(80)))
      console.log(chalk.gray(`Solutions in batch: ${batch.solutions.length}`))

      let batchExpansions = 0
      let batchRejected = 0

      // Process each solution in the batch
      for (const solutionProgress of batch.solutions) {
        console.log(chalk.blue(`\n${'═'.repeat(60)}`))
        console.log(chalk.blue(`🔍 Processing: ${solutionProgress.solution_id}`))
        console.log(chalk.blue(`${'═'.repeat(60)}`))

        try {
          // Get basic solution data first
          const { data: solutionData, error } = await supabase
            .from('solutions')
            .select('id, title, description, solution_category')
            .eq('id', solutionProgress.solution_id)
            .single()

          if (error || !solutionData) {
            console.error(chalk.red(`❌ Failed to fetch solution data: ${error?.message || 'Not found'}`))
            await progressTracker.updateProgress(solutionProgress.solution_id, {
              successful_connections: 0,
              error: error?.message || 'Solution not found'
            })
            continue
          }

          // Get current goal connections separately
          const { data: currentGoals } = await supabase
            .from('goal_implementation_links')
            .select(`
              goal_id,
              avg_effectiveness,
              goals(id, title, arenas(name), categories(name))
            `)
            .eq('solution_id', solutionProgress.solution_id)

          // Transform to expected format
          const solution: SolutionData = {
            id: solutionData.id,
            title: solutionData.title,
            solution_category: solutionData.solution_category,
            description: solutionData.description || '',
            effectiveness: 0, // Will be calculated
            current_goals: []
          }

          // Extract current goals from goal links
          if (currentGoals) {
            for (const link of currentGoals) {
              if (link.goals) {
                solution.current_goals.push({
                  id: link.goal_id,
                  title: link.goals.title,
                  arena: link.goals.arenas?.name || 'Unknown',
                  category: link.goals.categories?.name || 'Unknown'
                })
              }
            }
          }

          console.log(chalk.gray(`Current connections: ${solution.current_goals.length}`))

          // Find credible goal candidates
          const validationReport = await validator.findCredibleCandidates(solution, {
            maxCandidates: parseInt(options.maxGoals),
            strictMode: false // Quality controlled by laugh test instead
          })

          console.log(validator.generateReport(validationReport))

          // Extract approved candidates from validation report
          const approvedCandidates = validationReport.candidates
            .filter(candidate => candidate.result.credible)
            .map(candidate => candidate.goal)

          if (approvedCandidates.length === 0) {
            console.log(chalk.yellow('⚠️  No credible candidates found, skipping solution'))
            await progressTracker.updateProgress(solutionProgress.solution_id, {
              successful_connections: 0,
              rejection_rate: 100
            })
            batchRejected++
            continue
          }

          // Generate expansion data with Gemini
          console.log(chalk.cyan('\n🤖 Generating expansion data with Gemini...'))

          // Transform data to match prompt interface
          const promptSolution = {
            title: solution.title,
            description: solution.description,
            category: solution.solution_category,
            effectiveness: solution.effectiveness,
            current_goal: solution.current_goals.map(g => g.title).join(', ') || 'None'
          }

          const promptGoals = approvedCandidates.map(goal => ({
            id: goal.id,
            title: goal.title,
            description: goal.description,
            arena: goal.arena,
            category: goal.category
          }))

          const prompt = createSolutionToGoalPrompt(
            promptSolution,
            promptGoals,
            {
              strictMode: false,
              minEffectiveness: 3.0
            }
          )

          const response = await gemini.generateContent(prompt)
          console.log(chalk.gray(`   📝 Response length: ${response.length} characters`))

          const parsed = parseJSONSafely(response)

          if (!Array.isArray(parsed)) {
            console.log(chalk.yellow('⚠️  Invalid response format, skipping solution'))
            await progressTracker.updateProgress(solutionProgress.solution_id, {
              successful_connections: 0,
              error: 'Invalid response format'
            })
            continue
          }

          const credibleConnections = parsed.filter(conn => conn.credible === true)
          console.log(chalk.gray(`   📝 Parsed result type: array`))
          console.log(chalk.green(`   ✅ Generated ${credibleConnections.length} credible connections`))

          // Debug: log actual Gemini response
          if (credibleConnections.length > 0) {
            console.log(chalk.gray(`   🔍 First connection goal_id: "${credibleConnections[0].goal_id}"`))
          }

          // Debug: log first connection to understand format
          if (credibleConnections.length > 0) {
            console.log(chalk.gray(`   🔍 Sample connection format: ${JSON.stringify(Object.keys(credibleConnections[0]))}`))
          }

          if (credibleConnections.length === 0) {
            console.log(chalk.yellow('   Gemini generation failed, skipping...'))
            await progressTracker.updateProgress(solutionProgress.solution_id, {
              successful_connections: 0,
              rejection_rate: 100
            })
            batchRejected++
            continue
          }

          // Run laugh test validation (primary quality gate)
          console.log(chalk.magenta('\n🎭 Running laugh test validation on connections'))
          console.log(chalk.gray(`   Threshold: ${options.laughThreshold}/100, Batch size: ${credibleConnections.length}`))

          const laughTestResults = await laughTestValidator.batchValidate(
            credibleConnections.map(conn => {
              // Find goal title from approved candidates based on goal_id
              const goalCandidate = approvedCandidates.find(candidate => candidate.id === conn.goal_id)
              const goalTitle = goalCandidate?.title || conn.goal_title || conn.goalTitle || 'Unknown Goal'

              console.log(chalk.gray(`   🎯 Laugh test prep: ${conn.goal_id} → "${goalTitle}" (found candidate: ${!!goalCandidate})`))

              return {
                solutionTitle: solution.title,
                goalTitle: goalTitle,
                rationale: conn.rationale || conn.effectiveness_rationale || conn.reason || conn.explanation || 'No rationale provided'
              }
            }),
            { threshold: parseInt(options.laughThreshold) }
          )

          // Map passed connections back to original format with goal_id and effectiveness
          const passedConnections = laughTestResults.passed_connections.map(passedConn => {
            // Find the original connection that matches this passed one
            const originalConnection = credibleConnections.find(conn => {
              const goalCandidate = approvedCandidates.find(candidate => candidate.id === conn.goal_id)
              const goalTitle = goalCandidate?.title || conn.goal_title || conn.goalTitle || 'Unknown Goal'
              return goalTitle === passedConn.goalTitle
            })

            if (!originalConnection) {
              console.warn(`Could not find original connection for passed goal: ${passedConn.goalTitle}`)
              return null
            }

            const mappedConnection = {
              goal_id: originalConnection.goal_id,
              effectiveness: parseFloat(originalConnection.effectiveness) || 3.5,
              effectiveness_rationale: originalConnection.rationale || originalConnection.effectiveness_rationale || passedConn.rationale,
              goal_specific_adaptation: originalConnection.goal_specific_adaptation || '',
              fields: originalConnection.solution_fields || {}
            }

            console.log(chalk.gray(`   🔗 Mapped connection: ${passedConn.goalTitle} → ${mappedConnection.goal_id}`))
            return mappedConnection
          }).filter(conn => conn !== null)

          console.log(chalk.magenta(`📊 Laugh Test Results:`))
          console.log(chalk.magenta(`   Total connections: ${credibleConnections.length}`))
          console.log(chalk.magenta(`   ✅ Passed: ${laughTestResults.passed_count}`))
          console.log(chalk.magenta(`   ❌ Rejected: ${laughTestResults.rejected_count}`))
          console.log(chalk.magenta(`   🔄 Rejection rate: ${laughTestResults.rejection_rate.toFixed(1)}%`))

          if (laughTestResults.rejected_count > 0) {
            console.log(chalk.yellow(`❌ Rejected Connections:`))
            laughTestResults.rejected_connections.forEach((rejectedConn) => {
              console.log(chalk.yellow(`   • "${solution.title}" → "${rejectedConn.original.goalTitle}"`))
              console.log(chalk.yellow(`     Score: ${rejectedConn.validation.overall_score}/100`))
            })
          }

          if (passedConnections.length === 0) {
            console.log(chalk.yellow('   🚫 All connections rejected by laugh test'))
            await progressTracker.updateProgress(solutionProgress.solution_id, {
              successful_connections: 0,
              rejection_rate: laughTestResults.rejection_rate
            })
            batchRejected++
            continue
          }

          console.log(chalk.green(`   🎭 Laugh test: ${passedConnections.length}/${credibleConnections.length} connections passed`))

          // Create goal implementation links (if not dry run)
          if (!options.dryRun) {
            console.log(chalk.cyan('\n📥 Creating goal implementation links...'))

            const insertedLinks = await dataHandler.createGoalLinks(
              solution.id,
              passedConnections,
              approvedCandidates
            )

            console.log(chalk.green(`📊 Successfully created ${insertedLinks.length} new connections`))

            // Update progress
            const avgEffectiveness = passedConnections.reduce((sum, conn) =>
              sum + (parseFloat(conn.effectiveness) || 3.5), 0
            ) / passedConnections.length

            await progressTracker.updateProgress(solutionProgress.solution_id, {
              successful_connections: insertedLinks.length,
              rejection_rate: laughTestResults.rejection_rate,
              avg_effectiveness: avgEffectiveness
            })

            batchExpansions += insertedLinks.length
          } else {
            console.log(chalk.gray('📋 Dry run: would create goal implementation links'))
            batchExpansions += passedConnections.length
          }

        } catch (error) {
          console.error(chalk.red(`❌ Error processing solution ${solutionProgress.solution_id}: ${error}`))
          console.error(chalk.red(`   Stack trace: ${error instanceof Error ? error.stack : 'No stack trace'}`))
          await progressTracker.updateProgress(solutionProgress.solution_id, {
            successful_connections: 0,
            error: String(error)
          })
        }
      }

      // Batch summary
      totalExpansions += batchExpansions
      totalRejected += batchRejected
      const batchRejectionRate = batch.solutions.length > 0 ?
        (batchRejected / batch.solutions.length) * 100 : 0

      console.log(chalk.bold.white(`\n📊 Batch ${batchNumber} Summary:`))
      console.log(chalk.cyan('─'.repeat(40)))
      console.log(chalk.green(`✅ New connections: ${batchExpansions}`))
      console.log(chalk.yellow(`🔄 Rejection rate: ${batchRejectionRate.toFixed(1)}%`))
      console.log(chalk.gray(`⏭️  Solutions processed: ${batch.solutions.length}`))

      // Check if we should continue expansion
      const continueCheck = await progressTracker.shouldContinueExpansion(
        options.category,
        parseInt(options.qualityThreshold)
      )

      if (!continueCheck.shouldContinue) {
        console.log(chalk.yellow(`\n⚠️  Stopping expansion: ${continueCheck.reason}`))
        break
      }

      // Rate limiting pause
      if (batchNumber % 5 === 0) {
        console.log(chalk.gray('\n⏱️  Rate limiting pause (2s)...'))
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    // Final summary
    const categoryStats = await progressTracker.getCategoryStats(options.category)

    console.log(chalk.bold.green(`\n🎉 Expansion Complete for ${options.category}`))
    console.log(chalk.green('═'.repeat(60)))
    console.log(chalk.white(`Total New Connections: ${totalExpansions}`))
    console.log(chalk.white(`Category Coverage: ${categoryStats.coverage_percentage.toFixed(1)}%`))
    console.log(chalk.white(`Solutions Processed: ${batchNumber > 0 ? (batchNumber - 1) * parseInt(options.batchSize) : 0}`))
    console.log(chalk.white(`Zero Connections Remaining: ${categoryStats.zero_connections}`))
    console.log(chalk.white(`Average Effectiveness: ${categoryStats.avg_effectiveness.toFixed(2)}`))

    if (categoryStats.coverage_percentage >= parseInt(options.coverageTarget)) {
      console.log(chalk.bold.green(`\n🎯 CATEGORY COMPLETE: ${options.category} reached ${options.coverageTarget}% coverage target!`))
    }

  } catch (error) {
    console.error(chalk.red('❌ Fatal error:'), error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('❌ Unhandled error:'), error)
    process.exit(1)
  })
}
