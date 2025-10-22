#!/usr/bin/env tsx
/**
 * Test Data Seeding Script for AI-to-Human Transition Testing
 *
 * This script creates controlled test scenarios for transition testing:
 * - Solutions with 0 human ratings (fresh AI state)
 * - Solutions with 2 human ratings (pre-transition state)
 * - Solutions with 3 human ratings (should trigger transition)
 * - Solutions already transitioned (human mode)
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

const TEST_USER_ID = 'e22feb1a-e617-4c8d-9747-0fb958068e1d' // test@wwfm-platform.com

// Generate valid test user IDs for simulation
function generateTestUserId(index: number): string {
  const base = 'e22feb1a-e617-4c8d-9747-0fb958068e1'
  const suffix = index.toString().padStart(1, '0')
  return base + suffix
}

interface TestScenario {
  name: string
  goalId: string
  variantId: string
  humanRatingCount: number
  shouldBeTransitioned: boolean
  ratings: Array<{
    effectiveness: number
    userId?: string
  }>
}

async function main() {
  console.log('🌱 Starting transition test data seeding...')

  // First, find suitable test goals and solutions
  const { data: testTargets } = await supabase
    .from('goal_implementation_links')
    .select(`
      goal_id,
      implementation_id,
      goals(title),
      solution_variants(variant_name, solutions(title))
    `)
    .limit(10)

  if (!testTargets || testTargets.length < 4) {
    throw new Error('Not enough goal-solution combinations found for testing')
  }

  const scenarios: TestScenario[] = [
    {
      name: 'Fresh AI Solution (0 ratings)',
      goalId: testTargets[0].goal_id,
      variantId: testTargets[0].implementation_id,
      humanRatingCount: 0,
      shouldBeTransitioned: false,
      ratings: []
    },
    {
      name: 'Pre-transition State (2 ratings)',
      goalId: testTargets[1].goal_id,
      variantId: testTargets[1].implementation_id,
      humanRatingCount: 2,
      shouldBeTransitioned: false,
      ratings: [
        { effectiveness: 4, userId: TEST_USER_ID },
        { effectiveness: 5, userId: TEST_USER_ID }
      ]
    },
    {
      name: 'At Threshold (3 ratings) - Should Transition',
      goalId: testTargets[2].goal_id,
      variantId: testTargets[2].implementation_id,
      humanRatingCount: 3,
      shouldBeTransitioned: true,
      ratings: [
        { effectiveness: 3, userId: TEST_USER_ID },
        { effectiveness: 4, userId: TEST_USER_ID },
        { effectiveness: 5, userId: TEST_USER_ID }
      ]
    },
    {
      name: 'Already Transitioned (5 ratings)',
      goalId: testTargets[3].goal_id,
      variantId: testTargets[3].implementation_id,
      humanRatingCount: 5,
      shouldBeTransitioned: true,
      ratings: [
        { effectiveness: 4, userId: TEST_USER_ID },
        { effectiveness: 3, userId: TEST_USER_ID },
        { effectiveness: 5, userId: TEST_USER_ID },
        { effectiveness: 4, userId: TEST_USER_ID },
        { effectiveness: 4, userId: TEST_USER_ID }
      ]
    }
  ]

  console.log('📝 Test scenarios to create:')
  scenarios.forEach((scenario, i) => {
    console.log(`  ${i + 1}. ${scenario.name}`)
    console.log(`     Goal: ${(scenario as any).goals?.title || 'Unknown'}`)
    console.log(`     Solution: ${(scenario as any).solution_variants?.solutions?.title || 'Unknown'}`)
    console.log(`     Ratings: ${scenario.ratings.length}`)
  })

  // Clean up any existing test data
  console.log('\n🧹 Cleaning up existing test ratings...')
  await supabase
    .from('ratings')
    .delete()
    .eq('user_id', TEST_USER_ID)

  // Reset goal implementation links to AI mode
  const targetVariantIds = scenarios.map(s => s.variantId)
  await supabase
    .from('goal_implementation_links')
    .update({
      human_rating_count: 0,
      data_display_mode: 'ai',
      transitioned_at: null,
      ai_snapshot: null
    })
    .in('implementation_id', targetVariantIds)

  // Create test ratings for each scenario
  for (const scenario of scenarios) {
    console.log(`\n📊 Setting up: ${scenario.name}`)

    if (scenario.ratings.length > 0) {
      // Get the solution_id for this variant
      const { data: variantData } = await supabase
        .from('solution_variants')
        .select('solution_id')
        .eq('id', scenario.variantId)
        .single()

      if (!variantData) {
        console.error(`   ❌ Could not find solution_id for variant ${scenario.variantId}`)
        continue
      }

      // Insert test ratings
      const ratingInserts = scenario.ratings.map((rating, index) => ({
        user_id: rating.userId || TEST_USER_ID,
        goal_id: scenario.goalId,
        solution_id: variantData.solution_id,
        implementation_id: scenario.variantId,
        effectiveness_score: rating.effectiveness,
        data_source: 'human' as const,
        created_at: new Date(Date.now() - (scenario.ratings.length - index) * 1000).toISOString()
      }))

      console.log(`   Adding ${ratingInserts.length} test ratings...`)
      const { error: ratingsError } = await supabase
        .from('ratings')
        .insert(ratingInserts)

      if (ratingsError) {
        console.error(`   ❌ Failed to insert ratings:`, ratingsError)
        continue
      }

      // Update goal implementation link to match scenario
      console.log(`   Updating goal link counters...`)
      const updateData: any = {
        human_rating_count: scenario.humanRatingCount
      }

      if (scenario.shouldBeTransitioned) {
        updateData.data_display_mode = 'human'
        updateData.transitioned_at = new Date().toISOString()
        updateData.ai_snapshot = {
          original_effectiveness: 4.0,
          original_rating_count: 50,
          transitioned_on: new Date().toISOString()
        }
      }

      const { error: updateError } = await supabase
        .from('goal_implementation_links')
        .update(updateData)
        .eq('goal_id', scenario.goalId)
        .eq('implementation_id', scenario.variantId)

      if (updateError) {
        console.error(`   ❌ Failed to update goal link:`, updateError)
      } else {
        console.log(`   ✅ Scenario setup complete`)
      }
    } else {
      console.log(`   ✅ Fresh AI state - no ratings needed`)
    }
  }

  // Verify the setup
  console.log('\n🔍 Verifying test data setup...')
  for (const scenario of scenarios) {
    const { data: verification } = await supabase
      .from('goal_implementation_links')
      .select('human_rating_count, data_display_mode, transitioned_at')
      .eq('goal_id', scenario.goalId)
      .eq('implementation_id', scenario.variantId)
      .single()

    if (verification) {
      const status = verification.data_display_mode === 'human' ? '🟢 HUMAN' : '🟡 AI'
      console.log(`   ${scenario.name}: ${status} (${verification.human_rating_count} ratings)`)
    }
  }

  console.log('\n✅ Test data seeding complete!')
  console.log('\n📋 Test scenarios ready:')
  console.log('   1. Fresh AI solutions with 0 human ratings')
  console.log('   2. Pre-transition solutions with 2/3 ratings')
  console.log('   3. At-threshold solutions ready to transition')
  console.log('   4. Already transitioned solutions in human mode')
  console.log('\n🧪 Ready for transition testing!')

  // Export test data for use in tests
  const testData = {
    scenarios: scenarios.map(s => ({
      name: s.name,
      goalId: s.goalId,
      variantId: s.variantId,
      expectedHumanCount: s.humanRatingCount,
      expectedMode: s.shouldBeTransitioned ? 'human' : 'ai'
    })),
    testUserId: TEST_USER_ID
  }

  await import('fs').then(fs => {
    fs.writeFileSync(
      './tests/fixtures/transition-test-data.json',
      JSON.stringify(testData, null, 2)
    )
  })

  console.log('📄 Test data exported to tests/fixtures/transition-test-data.json')
}

if (require.main === module) {
  main().catch(console.error)
}

export default main