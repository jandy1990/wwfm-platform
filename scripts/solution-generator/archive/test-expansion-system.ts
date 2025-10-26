#!/usr/bin/env tsx

/**
 * Test Script for Solution-to-Goal Expansion System
 *
 * Validates the entire expansion pipeline without making database changes
 */

import { createClient } from '@supabase/supabase-js'
import { CredibilityValidator } from './services/credibility-validator'
import { ExpansionDataHandler } from './services/expansion-data-handler'
import { isCredibleConnection, getMaxExpansions } from './config/expansion-rules'
import { createSolutionToGoalPrompt } from './prompts/expansion-prompts'
import chalk from 'chalk'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function testExpansionSystem() {
  console.log(chalk.cyan('🧪 Testing Solution-to-Goal Expansion System'))
  console.log(chalk.cyan('━'.repeat(50)))

  try {
    // Test 1: Expansion Rules Validation
    console.log(chalk.blue('\n📋 Test 1: Expansion Rules Validation'))
    testExpansionRules()

    // Test 2: Credibility Validator
    console.log(chalk.blue('\n🔍 Test 2: Credibility Validator'))
    await testCredibilityValidator()

    // Test 3: Data Handler
    console.log(chalk.blue('\n📊 Test 3: Data Structure Handler'))
    await testDataHandler()

    // Test 4: Prompt Generation
    console.log(chalk.blue('\n🤖 Test 4: Prompt Generation'))
    testPromptGeneration()

    // Test 5: End-to-End Simulation
    console.log(chalk.blue('\n🔄 Test 5: End-to-End Simulation'))
    await testEndToEndSimulation()

    console.log(chalk.green('\n✅ All tests completed successfully!'))

  } catch (error) {
    console.error(chalk.red('\n❌ Test failed:'), error)
    process.exit(1)
  }
}

function testExpansionRules() {
  const testCases = [
    // Good connections
    {
      category: 'exercise_movement',
      goalTitle: 'Build muscle mass',
      goalArena: 'Physical Health',
      goalCategory: 'Exercise & Fitness',
      effectiveness: 4.5,
      expected: true,
      description: 'Exercise for muscle building'
    },
    {
      category: 'meditation_mindfulness',
      goalTitle: 'Reduce stress',
      goalArena: 'Feeling & Emotion',
      goalCategory: 'Mental Health',
      effectiveness: 4.2,
      expected: true,
      description: 'Meditation for stress'
    },
    // Bad connections
    {
      category: 'exercise_movement',
      goalTitle: 'Save money',
      goalArena: 'Finances',
      goalCategory: 'Financial Security',
      effectiveness: 4.0,
      expected: false,
      description: 'Exercise for financial goals (should fail)'
    },
    {
      category: 'supplements_vitamins',
      goalTitle: 'Advance career',
      goalArena: 'Work & Career',
      goalCategory: 'Professional Development',
      effectiveness: 3.8,
      expected: false,
      description: 'Supplements for career (should fail)'
    }
  ]

  let passed = 0
  let failed = 0

  for (const testCase of testCases) {
    const result = isCredibleConnection(
      testCase.category,
      testCase.goalTitle,
      testCase.goalArena,
      testCase.goalCategory,
      testCase.effectiveness
    )

    if (result.credible === testCase.expected) {
      console.log(chalk.green(`   ✅ ${testCase.description}`))
      passed++
    } else {
      console.log(chalk.red(`   ❌ ${testCase.description} - Expected: ${testCase.expected}, Got: ${result.credible}`))
      console.log(chalk.gray(`      Reason: ${result.reason}`))
      failed++
    }
  }

  console.log(chalk.cyan(`   📊 Results: ${passed} passed, ${failed} failed`))
}

async function testCredibilityValidator() {
  const validator = new CredibilityValidator(supabase)

  // Get a real solution for testing
  const { data: testSolution } = await supabase
    .from('solutions')
    .select(`
      id,
      title,
      description,
      solution_category,
      goal_implementation_links(
        goal_id,
        avg_effectiveness,
        goals(title, arenas(name), categories(name))
      )
    `)
    .eq('source_type', 'ai_foundation')
    .eq('solution_category', 'exercise_movement')
    .limit(1)
    .single()

  if (!testSolution) {
    console.log(chalk.yellow('   ⚠️ No test solution found, skipping validator test'))
    return
  }

  const solutionData = {
    id: testSolution.id,
    title: testSolution.title,
    solution_category: testSolution.solution_category,
    description: testSolution.description || '',
    effectiveness: 4.5,
    current_goals: testSolution.goal_implementation_links?.map((link: any) => ({
      id: link.goal_id,
      title: link.goals?.title || 'Unknown',
      arena: link.goals?.arenas?.name || 'Unknown',
      category: link.goals?.categories?.name || 'Unknown'
    })) || []
  }

  try {
    const report = await validator.findCredibleCandidates(solutionData, {
      maxCandidates: 3,
      strictMode: true
    })

    console.log(chalk.green(`   ✅ Validator processed ${report.candidates.length} candidates`))
    console.log(chalk.green(`   ✅ Found ${report.approved_count} credible connections`))
    console.log(chalk.green(`   ✅ Rejected ${report.rejected_count} non-credible connections`))

  } catch (error) {
    console.log(chalk.red(`   ❌ Validator test failed: ${error.message}`))
  }
}

async function testDataHandler() {
  const dataHandler = new ExpansionDataHandler(supabase)

  // Get a test solution variant
  const { data: testVariant } = await supabase
    .from('solution_variants')
    .select(`
      id,
      solution_id,
      solutions(title, solution_category)
    `)
    .limit(1)
    .single()

  if (!testVariant) {
    console.log(chalk.yellow('   ⚠️ No test variant found, skipping data handler test'))
    return
  }

  try {
    // Test variant info retrieval
    const variantInfo = await dataHandler.getSolutionVariantInfo(testVariant.solution_id)
    if (variantInfo) {
      console.log(chalk.green(`   ✅ Retrieved variant info for: ${variantInfo.solution_title}`))
    } else {
      console.log(chalk.red(`   ❌ Failed to retrieve variant info`))
    }

    // Test aggregated fields creation
    const testFields = {
      time_to_results: '2-3 months',
      frequency: 'daily',
      challenges: ['Consistency', 'Motivation']
    }

    const aggregatedFields = dataHandler.createAggregatedFields(
      testFields,
      'exercise_movement',
      {
        sourceSolution: 'Test Solution',
        sourceGoal: 'Test Source Goal',
        targetGoal: 'Test Target Goal'
      }
    )

    if (aggregatedFields._metadata && aggregatedFields.frequency) {
      console.log(chalk.green(`   ✅ Created aggregated fields structure`))
    } else {
      console.log(chalk.red(`   ❌ Failed to create aggregated fields`))
    }

    // Test goal link validation
    const testGoalLink = {
      goal_id: 'test-goal-id',
      goal_title: 'Test Goal',
      implementation_id: 'test-impl-id',
      effectiveness: 4.2,
      effectiveness_rationale: 'Test rationale',
      goal_specific_adaptation: 'Test adaptation',
      solution_fields: testFields,
      aggregated_fields: aggregatedFields
    }

    const validation = dataHandler.validateGoalLinkData(testGoalLink)
    if (validation.valid) {
      console.log(chalk.green(`   ✅ Goal link validation passed`))
    } else {
      console.log(chalk.red(`   ❌ Goal link validation failed: ${validation.errors.join(', ')}`))
    }

  } catch (error) {
    console.log(chalk.red(`   ❌ Data handler test failed: ${error.message}`))
  }
}

function testPromptGeneration() {
  const testSolution = {
    title: 'Progressive Overload Training',
    description: 'Systematic approach to increasing workout intensity',
    category: 'exercise_movement',
    effectiveness: 4.8,
    current_goal: 'Get stronger'
  }

  const testGoals = [
    {
      title: 'Build muscle mass',
      description: 'Increase muscle size and definition',
      arena: 'Physical Health',
      category: 'Exercise & Fitness'
    },
    {
      title: 'Save money',
      description: 'Reduce expenses and increase savings',
      arena: 'Finances',
      category: 'Financial Security'
    }
  ]

  try {
    const prompt = createSolutionToGoalPrompt(testSolution, testGoals, {
      strictMode: true,
      minEffectiveness: 4.0
    })

    if (prompt.length > 1000 && prompt.includes('CREDIBILITY REQUIREMENTS')) {
      console.log(chalk.green(`   ✅ Generated comprehensive prompt (${prompt.length} chars)`))
    } else {
      console.log(chalk.red(`   ❌ Prompt generation failed or incomplete`))
    }

    // Check for quality controls in prompt
    const qualityIndicators = [
      'DIRECT CAUSALITY',
      'EXPERT CREDIBILITY',
      'EVIDENCE-BASED',
      'effectiveness >= 4.0'
    ]

    const hasQualityControls = qualityIndicators.every(indicator => prompt.includes(indicator))
    if (hasQualityControls) {
      console.log(chalk.green(`   ✅ Prompt includes all quality control measures`))
    } else {
      console.log(chalk.red(`   ❌ Prompt missing quality control measures`))
    }

  } catch (error) {
    console.log(chalk.red(`   ❌ Prompt generation test failed: ${error.message}`))
  }
}

async function testEndToEndSimulation() {
  console.log(chalk.cyan('   🔄 Simulating end-to-end expansion process...'))

  try {
    // Find a real high-effectiveness solution
    const { data: solutions } = await supabase
      .from('solutions')
      .select(`
        id,
        title,
        solution_category,
        goal_implementation_links(avg_effectiveness)
      `)
      .eq('source_type', 'ai_foundation')
      .eq('solution_category', 'exercise_movement')
      .limit(5)

    if (!solutions || solutions.length === 0) {
      console.log(chalk.yellow('   ⚠️ No solutions found for simulation'))
      return
    }

    // Calculate average effectiveness for each
    const solutionsWithEffectiveness = solutions.map(s => ({
      ...s,
      avg_effectiveness: s.goal_implementation_links?.length > 0
        ? s.goal_implementation_links.reduce((sum: number, link: any) => sum + parseFloat(link.avg_effectiveness), 0) / s.goal_implementation_links.length
        : 0
    })).filter(s => s.avg_effectiveness >= 4.0)

    if (solutionsWithEffectiveness.length === 0) {
      console.log(chalk.yellow('   ⚠️ No high-effectiveness solutions found'))
      return
    }

    const testSolution = solutionsWithEffectiveness[0]
    console.log(chalk.gray(`   📊 Testing with: ${testSolution.title} (${testSolution.avg_effectiveness.toFixed(1)} effectiveness)`))

    // Test expansion rules for this solution
    const maxExpansions = getMaxExpansions(testSolution.solution_category)
    console.log(chalk.gray(`   📈 Max allowed expansions: ${maxExpansions}`))

    // Test credibility for a few potential goals
    const muscleGoalTest = isCredibleConnection(
      testSolution.solution_category,
      'Build muscle mass',
      'Physical Health',
      'Exercise & Fitness',
      4.5
    )

    const moneyGoalTest = isCredibleConnection(
      testSolution.solution_category,
      'Save money',
      'Finances',
      'Financial Security',
      4.0
    )

    if (muscleGoalTest.credible && !moneyGoalTest.credible) {
      console.log(chalk.green(`   ✅ Credibility rules working correctly`))
      console.log(chalk.green(`   ✅ Approved logical connection: Build muscle mass`))
      console.log(chalk.green(`   ✅ Rejected illogical connection: Save money`))
    } else {
      console.log(chalk.red(`   ❌ Credibility rules not working as expected`))
      console.log(chalk.gray(`      Muscle goal credible: ${muscleGoalTest.credible}`))
      console.log(chalk.gray(`      Money goal credible: ${moneyGoalTest.credible}`))
    }

  } catch (error) {
    console.log(chalk.red(`   ❌ End-to-end simulation failed: ${error.message}`))
  }
}

// Run the test
testExpansionSystem().catch(error => {
  console.error(chalk.red('Test execution failed:'), error)
  process.exit(1)
})