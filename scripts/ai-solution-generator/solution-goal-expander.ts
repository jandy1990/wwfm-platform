#!/usr/bin/env tsx

/**
 * Solution-to-Goal Expansion System
 *
 * Conservative, quality-first approach to expanding solution-goal connections.
 * Uses Gemini for bulk generation with strict credibility validation.
 */

import { createClient } from '@supabase/supabase-js'
import { Command } from 'commander'
import { GeminiClient } from './generators/gemini-client'
import { CredibilityValidator, SolutionData, GoalData } from './services/credibility-validator'
import { ExpansionDataHandler, ExpandedGoalLink } from './services/expansion-data-handler'
import { LaughTestValidator } from './services/laugh-test-validator'
import { createSolutionToGoalPrompt } from './prompts/expansion-prompts'
import { parseJSONSafely } from './utils/json-repair'
import { getMaxExpansions, getMinEffectiveness } from './config/expansion-rules'
import chalk from 'chalk'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize command line parser
const program = new Command()
  .name('solution-goal-expander')
  .description('Expand high-impact solutions to credible additional goals')
  .option('--solution-id <id>', 'Expand specific solution by ID')
  .option('--category <category>', 'Focus on solutions in specific category')
  .option('--dry-run', 'Preview without making database changes')
  .option('--no-strict-mode', 'Disable strict mode (default: enabled)')
  .option('--strict-mode <value>', 'Strict mode setting (true/false)', 'true')
  .option('--limit <number>', 'Maximum solutions to process', '200')
  .option('--max-goals <number>', 'Maximum goals per solution', '5')
  .option('--min-effectiveness <number>', 'Minimum effectiveness for new connections', '4.0')
  .option('--laugh-test', 'Enable laugh test validation (always enabled)', 'true')
  .option('--laugh-threshold <number>', 'Laugh test score threshold (0-100)', '70')
  .parse()

const options = program.opts()

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
const dataHandler = new ExpansionDataHandler(supabase)
const laughTestValidator = new LaughTestValidator(gemini)

async function main() {
  console.log(chalk.cyan('🔄 WWFM Solution-to-Goal Expansion System'))
  console.log(chalk.cyan('━'.repeat(60)))
  console.log(chalk.white('🎯 Conservative, quality-first expansion approach'))
  console.log(chalk.white('🧠 Using Gemini AI with strict credibility validation'))
  const strictMode = options.noStrictMode ? false : (options.strictMode === 'false' ? false : true)
  console.log(chalk.yellow(`⚡ Strict mode: ${strictMode ? 'ENABLED' : 'DISABLED'}`))
  console.log(chalk.gray(`📊 Max solutions: ${options.limit}, Max goals per solution: ${options.maxGoals}`))

  if (options.dryRun) {
    console.log(chalk.yellow('\n⚠️  DRY RUN MODE - No database changes will be made'))
  }

  try {
    // Step 1: Find candidate solutions for expansion
    const candidateSolutions = await findExpansionCandidates()

    if (candidateSolutions.length === 0) {
      console.log(chalk.yellow('\n💭 No suitable solutions found for expansion'))
      return
    }

    console.log(chalk.green(`\n✅ Found ${candidateSolutions.length} candidate solutions for expansion`))

    let totalExpansions = 0
    let totalCandidatesEvaluated = 0
    let totalApproved = 0

    // Step 2: Process each solution
    for (const solution of candidateSolutions) {
      console.log(chalk.blue(`\n${'═'.repeat(60)}`))
      console.log(chalk.blue(`🔍 Processing: ${solution.title}`))
      console.log(chalk.blue(`${'═'.repeat(60)}`))

      try {
        // Find credible goal candidates
        const validationReport = await validator.findCredibleCandidates(solution, {
          maxCandidates: parseInt(options.maxGoals),
          strictMode: strictMode
        })

        console.log(validator.generateReport(validationReport))

        totalCandidatesEvaluated += validationReport.candidates.length
        totalApproved += validationReport.approved_count

        // Skip if no approved candidates
        if (validationReport.approved_count === 0) {
          console.log(chalk.yellow('   No credible candidates found, skipping...'))
          continue
        }

        // Step 3: Generate goal-specific data with Gemini
        const approvedCandidates = validationReport.candidates.filter(c => c.result.credible)
        const expansionData = await generateExpansionData(solution, approvedCandidates.map(c => c.goal), strictMode)

        if (expansionData.length === 0) {
          console.log(chalk.yellow('   Gemini generation failed, skipping...'))
          continue
        }

        // Step 4: Prepare and insert goal links
        if (!options.dryRun) {
          const insertResults = await createGoalLinks(solution, expansionData)
          totalExpansions += insertResults.successful

          console.log(chalk.cyan(`\n📊 Solution Results:`))
          console.log(chalk.green(`   ✅ New connections: ${insertResults.successful}`))
          console.log(chalk.yellow(`   ⏭️  Skipped: ${insertResults.skipped}`))
          console.log(chalk.red(`   ❌ Failed: ${insertResults.failed}`))
        } else {
          console.log(chalk.yellow(`\n💭 Dry run: Would create ${expansionData.length} connections`))
          totalExpansions += expansionData.length
        }

      } catch (error) {
        console.error(chalk.red(`   ❌ Error processing solution: ${error.message}`))
        continue
      }
    }

    // Final summary
    console.log(chalk.cyan('\n' + '═'.repeat(60)))
    console.log(chalk.cyan('📊 Expansion Summary'))
    console.log(chalk.cyan('═'.repeat(60)))
    console.log(chalk.white(`🔍 Solutions processed: ${candidateSolutions.length}`))
    console.log(chalk.white(`📋 Goal candidates evaluated: ${totalCandidatesEvaluated}`))
    console.log(chalk.white(`✅ Candidates approved: ${totalApproved}`))
    console.log(chalk.green(`🔗 New connections created: ${totalExpansions}`))

    if (totalExpansions > 0) {
      const approvalRate = ((totalApproved / totalCandidatesEvaluated) * 100).toFixed(1)
      console.log(chalk.white(`📈 Approval rate: ${approvalRate}%`))
    }

    if (options.dryRun) {
      console.log(chalk.yellow('\n💡 This was a dry run. To create connections, run without --dry-run'))
    }

  } catch (error) {
    console.error(chalk.red('\n❌ Fatal error:'), error)
    process.exit(1)
  }
}

/**
 * Find solutions that are good candidates for expansion
 */
async function findExpansionCandidates(): Promise<SolutionData[]> {
  console.log(chalk.cyan('\n🔍 Finding expansion candidates...'))

  let query = supabase
    .from('solutions')
    .select(`
      id,
      title,
      description,
      solution_category,
      solution_variants!inner(
        id,
        goal_implementation_links!inner(
          goal_id,
          avg_effectiveness,
          goals(
            id,
            title,
            arenas(name),
            categories(name)
          )
        )
      )
    `)
    .eq('source_type', 'ai_foundation')

  // Apply filters
  if (options.solutionId) {
    query = query.eq('id', options.solutionId)
  }

  if (options.category) {
    query = query.eq('solution_category', options.category)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Error fetching solutions: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return []
  }

  // Process and filter candidates
  const candidates: SolutionData[] = []

  for (const solution of data) {
    // Skip if no variants (shouldn't happen with ai_foundation solutions)
    if (!solution.solution_variants || solution.solution_variants.length === 0) {
      continue
    }

    // Collect all goal links from all variants
    const allGoalLinks = []
    for (const variant of solution.solution_variants) {
      if (variant.goal_implementation_links) {
        allGoalLinks.push(...variant.goal_implementation_links)
      }
    }

    const connectionCount = allGoalLinks.length
    const avgEffectiveness = allGoalLinks.length > 0
      ? allGoalLinks.reduce((sum, link) => sum + parseFloat(link.avg_effectiveness), 0) / allGoalLinks.length
      : 0

    // Apply selection criteria
    const minEffectiveness = parseFloat(options.minEffectiveness)
    const maxConnections = getMaxExpansions(solution.solution_category)

    // Include if: high effectiveness, low connections, room for expansion
    if (avgEffectiveness >= minEffectiveness && connectionCount <= 5 && connectionCount < maxConnections) {
      candidates.push({
        id: solution.id,
        title: solution.title,
        solution_category: solution.solution_category,
        description: solution.description || '',
        effectiveness: avgEffectiveness,
        current_goals: allGoalLinks.map(link => ({
          id: link.goal_id,
          title: link.goals?.title || 'Unknown',
          arena: link.goals?.arenas?.name || 'Unknown',
          category: link.goals?.categories?.name || 'Unknown'
        }))
      })
    }
  }

  // Sort by effectiveness descending, limit results
  candidates.sort((a, b) => b.effectiveness - a.effectiveness)
  return candidates.slice(0, parseInt(options.limit))
}

/**
 * Generate expansion data using Gemini
 */
async function generateExpansionData(
  solution: SolutionData,
  targetGoals: GoalData[],
  strictMode: boolean
): Promise<any[]> {
  console.log(chalk.cyan(`\n🤖 Generating expansion data with Gemini...`))

  try {
    // Create prompt for Gemini
    const currentGoal = solution.current_goals[0]?.title || 'general health improvement'
    const prompt = createSolutionToGoalPrompt(
      {
        title: solution.title,
        description: solution.description,
        category: solution.solution_category,
        effectiveness: solution.effectiveness,
        current_goal: currentGoal
      },
      targetGoals.map(goal => ({
        title: goal.title,
        description: goal.description,
        arena: goal.arena,
        category: goal.category
      })),
      {
        strictMode: strictMode,
        minEffectiveness: parseFloat(options.minEffectiveness)
      }
    )

    // Generate with Gemini
    const responseText = await gemini.generateContent(prompt)
    console.log(chalk.gray(`   📝 Response length: ${responseText.length} characters`))
    console.log(chalk.gray(`   📝 Response preview: ${responseText.substring(0, 200)}...`))

    // Parse JSON response
    const expansionResults = parseJSONSafely(responseText)
    console.log(chalk.gray(`   📝 Parsed result type: ${Array.isArray(expansionResults) ? 'array' : typeof expansionResults}`))

    if (!Array.isArray(expansionResults)) {
      throw new Error('Gemini response is not an array')
    }

    // Filter to only credible connections
    const credibleResults = expansionResults.filter(result =>
      result.credible === true &&
      result.effectiveness >= parseFloat(options.minEffectiveness)
    )

    console.log(chalk.green(`   ✅ Generated ${credibleResults.length} credible connections`))

    // Apply laugh test validation (always enabled)
    if (credibleResults.length > 0) {
      const laughThreshold = parseInt(options.laughThreshold) || 70

      // Prepare connections for laugh test
      const connectionsForLaughTest = credibleResults.map(result => ({
        solution_title: solution.title,
        solution_category: solution.solution_category,
        goal_title: result.goal_id,
        goal_arena: targetGoals.find(g => g.title === result.goal_id)?.arena || 'Unknown',
        goal_category: targetGoals.find(g => g.title === result.goal_id)?.category || 'Unknown',
        effectiveness: result.effectiveness,
        rationale: result.effectiveness_rationale || 'No rationale provided'
      }))

      const laughTestResults = await laughTestValidator.batchValidate(connectionsForLaughTest, {
        threshold: laughThreshold,
        logVerbose: true
      })

      // Filter based on laugh test results
      const finalResults = laughTestResults.passed_connections.map((_, index) =>
        credibleResults[index]
      ).filter(Boolean)

      console.log(chalk.cyan(`   🎭 Laugh test: ${finalResults.length}/${credibleResults.length} connections passed`))

      if (laughTestResults.rejected_count > 0) {
        console.log(chalk.yellow(`   🚫 Rejected ${laughTestResults.rejected_count} spurious connections`))
      }

      return finalResults
    }

    return credibleResults

  } catch (error) {
    console.error(chalk.red(`   ❌ Gemini generation error: ${error.message}`))
    return []
  }
}

/**
 * Create goal implementation links from expansion data
 */
async function createGoalLinks(
  solution: SolutionData,
  expansionData: any[]
): Promise<{ successful: number; failed: number; skipped: number }> {
  console.log(chalk.cyan(`\n📥 Creating goal implementation links...`))

  // Get solution variant info
  const variantInfo = await dataHandler.getSolutionVariantInfo(solution.id)
  if (!variantInfo) {
    throw new Error(`No variant found for solution: ${solution.title}`)
  }

  // Prepare goal links
  const goalLinks: ExpandedGoalLink[] = []

  for (const expansion of expansionData) {
    try {
      // Find the goal ID from the title
      const targetGoal = await findGoalByTitle(expansion.goal_id)
      if (!targetGoal) {
        console.log(chalk.yellow(`   ⚠️ Goal not found: ${expansion.goal_id}`))
        continue
      }

      // Prepare goal link data
      const goalLink = await dataHandler.prepareGoalLinkData(
        variantInfo,
        targetGoal.id,
        expansion.effectiveness,
        expansion.effectiveness_rationale || 'Expanded from high-effectiveness solution',
        expansion.goal_specific_adaptation || `Application of ${solution.title} for ${targetGoal.title}`,
        expansion.fields || {},
        targetGoal.title
      )

      // Validate data
      const validation = dataHandler.validateGoalLinkData(goalLink)
      if (!validation.valid) {
        console.log(chalk.red(`   ❌ Validation failed for ${targetGoal.title}: ${validation.errors.join(', ')}`))
        continue
      }

      goalLinks.push(goalLink)

    } catch (error) {
      console.error(chalk.red(`   ❌ Error preparing goal link: ${error.message}`))
      continue
    }
  }

  // Batch insert
  return await dataHandler.batchInsertGoalLinks(goalLinks)
}

/**
 * Find goal by title (helper function)
 */
async function findGoalByTitle(goalTitle: string): Promise<{ id: string; title: string } | null> {
  const { data, error } = await supabase
    .from('goals')
    .select('id, title')
    .eq('title', goalTitle)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

// Run the main function
main().catch(error => {
  console.error(chalk.red('Unhandled error:'), error)
  process.exit(1)
})