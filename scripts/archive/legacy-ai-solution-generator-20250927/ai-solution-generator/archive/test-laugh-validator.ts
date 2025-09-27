#!/usr/bin/env tsx

/**
 * Test Script for Laugh Test Validator
 *
 * Tests the validator with known good and bad connections
 * to verify it catches spurious connections while preserving legitimate ones.
 */

import { GeminiClient } from './generators/gemini-client'
import { LaughTestValidator } from './services/laugh-test-validator'
import chalk from 'chalk'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

if (!process.env.GEMINI_API_KEY) {
  console.error(chalk.red('❌ GEMINI_API_KEY not found in environment variables'))
  process.exit(1)
}

const gemini = new GeminiClient(process.env.GEMINI_API_KEY!)
const validator = new LaughTestValidator(gemini)

// Test data with known good and bad connections
const testConnections = [
  // Known GOOD connections (should pass)
  {
    solution_title: 'Consultation with Dermatologist',
    solution_category: 'doctors_specialists',
    goal_title: 'Clear up acne',
    goal_arena: 'Beauty & Wellness',
    goal_category: 'Appearance & Skin',
    effectiveness: 4.5,
    rationale: 'Dermatologists are skin specialists who directly treat acne with proven methods'
  },
  {
    solution_title: 'Meditation App (Headspace)',
    solution_category: 'apps_software',
    goal_title: 'Reduce anxiety',
    goal_arena: 'Feeling & Emotion',
    goal_category: 'Anxiety & Worry',
    effectiveness: 4.2,
    rationale: 'Meditation has extensive research backing for anxiety reduction'
  },
  {
    solution_title: 'Budget Tracking App',
    solution_category: 'apps_software',
    goal_title: 'Save money',
    goal_arena: 'Finances',
    goal_category: 'Financial Security',
    effectiveness: 4.0,
    rationale: 'Budget tracking directly helps identify spending patterns and save money'
  },

  // Known BAD connections (should fail)
  {
    solution_title: 'Visia Skin Analysis',
    solution_category: 'doctors_specialists',
    goal_title: 'Improve emotional regulation',
    goal_arena: 'Feeling & Emotion',
    goal_category: 'Emotional Growth',
    effectiveness: 4.2,
    rationale: 'Skin analysis can provide insights that may indirectly affect emotional well-being'
  },
  {
    solution_title: 'Regular Cardiologist Consultations',
    solution_category: 'doctors_specialists',
    goal_title: 'Master everyday hairstyling',
    goal_arena: 'Beauty & Wellness',
    goal_category: 'Hair & Grooming',
    effectiveness: 4.4,
    rationale: 'Overall health consultations may provide confidence that improves grooming habits'
  },
  {
    solution_title: 'Heavy Resistance Training',
    solution_category: 'exercise_movement',
    goal_title: 'Save money',
    goal_arena: 'Finances',
    goal_category: 'Financial Security',
    effectiveness: 4.1,
    rationale: 'Exercise can reduce healthcare costs and improve discipline in other areas'
  },

  // Edge cases (could go either way)
  {
    solution_title: 'Consultation with Gastroenterologist',
    solution_category: 'doctors_specialists',
    goal_title: 'Get glowing skin',
    goal_arena: 'Beauty & Wellness',
    goal_category: 'Appearance & Skin',
    effectiveness: 4.0,
    rationale: 'Gut health significantly impacts skin health through the gut-skin axis'
  },
  {
    solution_title: 'Sleep Tracking App',
    solution_category: 'apps_software',
    goal_title: 'Improve productivity',
    goal_arena: 'Work & Career',
    goal_category: 'Productivity',
    effectiveness: 3.8,
    rationale: 'Better sleep quality directly correlates with improved cognitive performance and productivity'
  }
]

async function main() {
  console.log(chalk.cyan('🧪 Testing Laugh Test Validator'))
  console.log(chalk.cyan('═'.repeat(50)))

  console.log(chalk.white(`\n📋 Testing ${testConnections.length} connections:`))
  console.log(chalk.green(`   Expected to pass: 3-4 connections`))
  console.log(chalk.red(`   Expected to fail: 3-4 connections`))
  console.log(chalk.yellow(`   Edge cases: 2 connections`))

  try {
    // Test batch validation
    const results = await validator.batchValidate(testConnections, {
      threshold: 70,
      logVerbose: true,
      enableQualityAssurance: true
    })

    console.log(chalk.cyan('\n' + '═'.repeat(50)))
    console.log(chalk.cyan('🎯 Test Results Summary'))
    console.log(chalk.cyan('═'.repeat(50)))

    // Analyze results by expected outcome
    const expectedPasses = ['Clear up acne', 'Reduce anxiety', 'Save money']
    const expectedFails = ['Improve emotional regulation', 'Master everyday hairstyling', 'Save money'] // Note: last one should fail for different solution

    console.log(chalk.green('\n✅ Connections that should pass:'))
    expectedPasses.forEach(goal => {
      const connection = testConnections.find(c => c.goal_title === goal)
      const passed = results.passed_connections.some(pc =>
        testConnections.find(tc => tc === pc)?.goal_title === goal
      )

      console.log(chalk[passed ? 'green' : 'red'](
        `   ${passed ? '✅' : '❌'} ${connection?.solution_title} → ${goal}`
      ))
    })

    console.log(chalk.red('\n❌ Connections that should fail:'))
    const actuallyBadConnections = [
      'Improve emotional regulation',
      'Master everyday hairstyling'
    ]

    actuallyBadConnections.forEach(goal => {
      const connection = testConnections.find(c => c.goal_title === goal)
      const failed = !results.passed_connections.some(pc =>
        testConnections.find(tc => tc === pc)?.goal_title === goal
      )

      console.log(chalk[failed ? 'green' : 'red'](
        `   ${failed ? '✅' : '❌'} ${connection?.solution_title} → ${goal} ${failed ? '(correctly rejected)' : '(incorrectly passed)'}`
      ))
    })

    console.log(chalk.yellow('\n🤔 Edge cases (acceptable either way):'))
    const edgeCases = ['Get glowing skin', 'Improve productivity']
    edgeCases.forEach(goal => {
      const connection = testConnections.find(c => c.goal_title === goal)
      const passed = results.passed_connections.some(pc =>
        testConnections.find(tc => tc === pc)?.goal_title === goal
      )

      console.log(chalk.yellow(
        `   ${passed ? '✅' : '❌'} ${connection?.solution_title} → ${goal}`
      ))
    })

    // Overall assessment
    console.log(chalk.cyan('\n📊 Overall Assessment:'))
    console.log(chalk.white(`   Rejection rate: ${results.rejection_rate.toFixed(1)}%`))
    console.log(chalk.white(`   Average score: ${results.average_score.toFixed(1)}/100`))

    const stats = validator.getValidationStats(results)
    if (stats.quality_threshold_met) {
      console.log(chalk.green('   ✅ Validation quality looks good!'))
    } else {
      console.log(chalk.yellow('   ⚠️  Validation quality may need adjustment'))
    }

    // Test single connection validation
    console.log(chalk.cyan('\n🔍 Testing single connection validation:'))
    const singleResult = await validator.validateSingleConnection(
      'Visia Skin Analysis',
      'Improve emotional regulation',
      'Skin analysis provides insights that may affect emotional well-being',
      'doctors_specialists',
      70
    )

    console.log(chalk[singleResult.passes ? 'red' : 'green'](
      `   ${singleResult.passes ? '❌' : '✅'} Single validation: ${singleResult.passes ? 'incorrectly passed' : 'correctly failed'}`
    ))

  } catch (error) {
    console.error(chalk.red('\n❌ Test failed:'), error)
    process.exit(1)
  }

  console.log(chalk.green('\n🎉 Laugh test validation testing complete!'))
}

main().catch(error => {
  console.error(chalk.red('Unhandled test error:'), error)
  process.exit(1)
})