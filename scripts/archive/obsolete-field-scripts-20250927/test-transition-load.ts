#!/usr/bin/env tsx
/**
 * Concurrent Load Testing Script for AI-to-Human Transitions
 *
 * This script simulates multiple users submitting ratings simultaneously
 * to test race conditions, advisory locks, and system performance.
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'
import testData from '../tests/fixtures/transition-test-data.json'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

interface LoadTestResult {
  testName: string
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  maxResponseTime: number
  minResponseTime: number
  transitionsTriggered: number
  concurrencyLevel: number
}

async function simulateRatingSubmission(
  goalId: string,
  variantId: string,
  userId: string,
  effectiveness: number,
  testId: string
): Promise<{ success: boolean; responseTime: number; transitioned: boolean }> {
  const startTime = Date.now()

  try {
    // Get solution_id for this variant
    const { data: variantData } = await supabase
      .from('solution_variants')
      .select('solution_id')
      .eq('id', variantId)
      .single()

    if (!variantData) {
      throw new Error(`Could not find solution_id for variant ${variantId}`)
    }

    // Insert rating
    const { error: ratingError } = await supabase
      .from('ratings')
      .insert({
        user_id: userId,
        goal_id: goalId,
        solution_id: variantData.solution_id,
        implementation_id: variantId,
        effectiveness_score: effectiveness,
        data_source: 'human',
        solution_fields: { test_id: testId }, // Mark as test data
        created_at: new Date().toISOString()
      })

    if (ratingError) {
      throw ratingError
    }

    // Check for transition
    const { data: transitionResult } = await supabase.rpc('check_and_execute_transition', {
      p_goal_id: goalId,
      p_implementation_id: variantId
    })

    const responseTime = Date.now() - startTime
    return {
      success: true,
      responseTime,
      transitioned: Boolean(transitionResult)
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`Rating submission failed: ${error}`)
    return {
      success: false,
      responseTime,
      transitioned: false
    }
  }
}

async function runConcurrentRatingsTest(concurrencyLevel: number): Promise<LoadTestResult> {
  const testName = `Concurrent Ratings (${concurrencyLevel} simultaneous)`
  const scenario = testData.scenarios.find(s => s.expectedHumanCount === 0) // Fresh scenario
  if (!scenario) {
    throw new Error('Fresh scenario not found for load testing')
  }

  console.log(`\n🧪 Running ${testName}...`)

  // Reset the scenario to fresh state
  await supabase
    .from('goal_implementation_links')
    .update({
      human_rating_count: 0,
      data_display_mode: 'ai',
      transitioned_at: null,
      ai_snapshot: null
    })
    .eq('goal_id', scenario.goalId)
    .eq('implementation_id', scenario.variantId)

  // Clean up existing test ratings
  await supabase
    .from('ratings')
    .delete()
    .eq('goal_id', scenario.goalId)
    .eq('implementation_id', scenario.variantId)
    .not('solution_fields', 'is', null)

  // Create concurrent rating submissions
  const testId = `load-test-${Date.now()}`
  const promises = Array(concurrencyLevel).fill(0).map((_, index) =>
    simulateRatingSubmission(
      scenario.goalId,
      scenario.variantId,
      testData.testUserId,
      3 + (index % 3), // Vary effectiveness between 3-5
      testId
    )
  )

  const startTime = Date.now()
  const results = await Promise.allSettled(promises)
  const totalTime = Date.now() - startTime

  // Analyze results
  const successful = results
    .filter(r => r.status === 'fulfilled')
    .map(r => (r as PromiseFulfilledResult<any>).value)
    .filter(r => r.success)

  const failed = results.filter(r => r.status === 'rejected' ||
    (r.status === 'fulfilled' && !(r as any).value.success))

  const responseTimes = successful.map(r => r.responseTime)
  const transitionsTriggered = successful.filter(r => r.transitioned).length

  const result: LoadTestResult = {
    testName,
    totalRequests: concurrencyLevel,
    successfulRequests: successful.length,
    failedRequests: failed.length,
    averageResponseTime: responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
    maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
    minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
    transitionsTriggered,
    concurrencyLevel
  }

  console.log(`   ✅ ${successful.length}/${concurrencyLevel} requests successful`)
  console.log(`   ⚡ Avg response time: ${result.averageResponseTime.toFixed(0)}ms`)
  console.log(`   🔄 Transitions triggered: ${transitionsTriggered}`)

  return result
}

async function testTransitionRaceConditions(): Promise<LoadTestResult> {
  const testName = 'Transition Race Conditions'
  const scenario = testData.scenarios.find(s => s.expectedHumanCount === 2) // Pre-transition
  if (!scenario) {
    throw new Error('Pre-transition scenario not found')
  }

  console.log(`\n🏁 Running ${testName}...`)

  // Set up scenario with exactly 2 ratings (1 away from threshold)
  await supabase
    .from('goal_implementation_links')
    .update({
      human_rating_count: 2,
      data_display_mode: 'ai',
      transitioned_at: null,
      ai_snapshot: null
    })
    .eq('goal_id', scenario.goalId)
    .eq('implementation_id', scenario.variantId)

  // Clean up and add exactly 2 test ratings
  await supabase
    .from('ratings')
    .delete()
    .eq('goal_id', scenario.goalId)
    .eq('implementation_id', scenario.variantId)

  const { data: variantData } = await supabase
    .from('solution_variants')
    .select('solution_id')
    .eq('id', scenario.variantId)
    .single()

  if (!variantData) throw new Error('Variant not found')

  await supabase
    .from('ratings')
    .insert([
      {
        user_id: testData.testUserId,
        goal_id: scenario.goalId,
        solution_id: variantData.solution_id,
        implementation_id: scenario.variantId,
        effectiveness_score: 4,
        data_source: 'human',
        created_at: new Date(Date.now() - 2000).toISOString()
      },
      {
        user_id: testData.testUserId,
        goal_id: scenario.goalId,
        solution_id: variantData.solution_id,
        implementation_id: scenario.variantId,
        effectiveness_score: 5,
        data_source: 'human',
        created_at: new Date(Date.now() - 1000).toISOString()
      }
    ])

  // Now submit 5 concurrent ratings that should all try to trigger transition
  const testId = `race-test-${Date.now()}`
  const concurrentSubmissions = 5
  const promises = Array(concurrentSubmissions).fill(0).map((_, index) =>
    simulateRatingSubmission(
      scenario.goalId,
      scenario.variantId,
      testData.testUserId,
      4,
      testId
    )
  )

  const startTime = Date.now()
  const results = await Promise.allSettled(promises)
  const totalTime = Date.now() - startTime

  const successful = results
    .filter(r => r.status === 'fulfilled')
    .map(r => (r as PromiseFulfilledResult<any>).value)
    .filter(r => r.success)

  const responseTimes = successful.map(r => r.responseTime)
  const transitionsTriggered = successful.filter(r => r.transitioned).length

  // Verify only one transition occurred
  const { data: finalState } = await supabase
    .from('goal_implementation_links')
    .select('data_display_mode, human_rating_count, transitioned_at')
    .eq('goal_id', scenario.goalId)
    .eq('implementation_id', scenario.variantId)
    .single()

  console.log(`   🎯 Final state: ${finalState?.data_display_mode} mode with ${finalState?.human_rating_count} ratings`)
  console.log(`   🔒 Transitions detected: ${transitionsTriggered} (should be ≤ 1)`)

  if (transitionsTriggered > 1) {
    console.error(`   ❌ RACE CONDITION DETECTED: ${transitionsTriggered} transitions occurred!`)
  } else {
    console.log(`   ✅ Race condition prevention working correctly`)
  }

  return {
    testName,
    totalRequests: concurrentSubmissions,
    successfulRequests: successful.length,
    failedRequests: results.length - successful.length,
    averageResponseTime: responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
    maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
    minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
    transitionsTriggered,
    concurrencyLevel: concurrentSubmissions
  }
}

async function testSystemPerformance(): Promise<LoadTestResult> {
  const testName = 'System Performance Under Load'
  const scenario = testData.scenarios[0]

  console.log(`\n🚀 Running ${testName}...`)

  // Test escalating load levels
  const loadLevels = [5, 10, 20, 50]
  const allResults: any[] = []

  for (const level of loadLevels) {
    console.log(`\n   Testing with ${level} concurrent requests...`)

    // Reset state
    await supabase
      .from('goal_implementation_links')
      .update({
        human_rating_count: 0,
        data_display_mode: 'ai'
      })
      .eq('goal_id', scenario.goalId)
      .eq('implementation_id', scenario.variantId)

    const result = await runConcurrentRatingsTest(level)
    allResults.push(result)

    // Brief pause between load levels
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Calculate aggregate metrics
  const totalRequests = allResults.reduce((sum, r) => sum + r.totalRequests, 0)
  const totalSuccessful = allResults.reduce((sum, r) => sum + r.successfulRequests, 0)
  const avgResponseTime = allResults.reduce((sum, r) => sum + r.averageResponseTime, 0) / allResults.length
  const maxResponseTime = Math.max(...allResults.map(r => r.maxResponseTime))

  console.log(`\n📊 Performance Summary:`)
  console.log(`   Total requests: ${totalRequests}`)
  console.log(`   Success rate: ${((totalSuccessful / totalRequests) * 100).toFixed(1)}%`)
  console.log(`   Avg response time: ${avgResponseTime.toFixed(0)}ms`)
  console.log(`   Max response time: ${maxResponseTime}ms`)

  return {
    testName,
    totalRequests,
    successfulRequests: totalSuccessful,
    failedRequests: totalRequests - totalSuccessful,
    averageResponseTime: avgResponseTime,
    maxResponseTime,
    minResponseTime: Math.min(...allResults.map(r => r.minResponseTime)),
    transitionsTriggered: allResults.reduce((sum, r) => sum + r.transitionsTriggered, 0),
    concurrencyLevel: Math.max(...loadLevels)
  }
}

async function main() {
  console.log('🎯 Starting AI-to-Human Transition Load Testing...')

  const results: LoadTestResult[] = []

  try {
    // Test 1: Concurrent ratings at different levels
    results.push(await runConcurrentRatingsTest(5))
    results.push(await runConcurrentRatingsTest(10))

    // Test 2: Race condition prevention
    results.push(await testTransitionRaceConditions())

    // Test 3: System performance under escalating load
    results.push(await testSystemPerformance())

    // Generate summary report
    console.log('\n📋 LOAD TESTING SUMMARY')
    console.log('=' .repeat(50))

    results.forEach(result => {
      console.log(`\n🧪 ${result.testName}:`)
      console.log(`   Requests: ${result.successfulRequests}/${result.totalRequests} successful`)
      console.log(`   Response time: ${result.averageResponseTime.toFixed(0)}ms avg, ${result.maxResponseTime}ms max`)
      console.log(`   Transitions: ${result.transitionsTriggered}`)
      console.log(`   Success rate: ${((result.successfulRequests / result.totalRequests) * 100).toFixed(1)}%`)
    })

    // Overall system health assessment
    const totalSuccessRate = results.reduce((sum, r) => sum + (r.successfulRequests / r.totalRequests), 0) / results.length * 100
    const avgResponseTime = results.reduce((sum, r) => sum + r.averageResponseTime, 0) / results.length

    console.log('\n🏥 SYSTEM HEALTH ASSESSMENT:')
    console.log(`   Overall Success Rate: ${totalSuccessRate.toFixed(1)}%`)
    console.log(`   Average Response Time: ${avgResponseTime.toFixed(0)}ms`)

    if (totalSuccessRate >= 95 && avgResponseTime <= 1000) {
      console.log('   Status: ✅ EXCELLENT - System performing optimally')
    } else if (totalSuccessRate >= 90 && avgResponseTime <= 2000) {
      console.log('   Status: ⚠️  GOOD - Minor performance considerations')
    } else {
      console.log('   Status: ❌ NEEDS ATTENTION - Performance issues detected')
    }

  } catch (error) {
    console.error('❌ Load testing failed:', error)
    throw error
  } finally {
    // Clean up all test data
    console.log('\n🧹 Cleaning up load test data...')
    await supabase
      .from('ratings')
      .delete()
      .not('solution_fields', 'is', null) // Delete only test ratings with solution_fields
  }

  console.log('\n✅ Load testing complete!')
}

if (require.main === module) {
  main().catch(console.error)
}

export default main