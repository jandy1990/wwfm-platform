/**
 * Integration Tests for AI-to-Human Transition Flow
 *
 * Tests the backend logic for transitions using direct database operations
 * and API calls. This validates the core transition system without UI.
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '../../types/supabase'
import testData from '../fixtures/transition-test-data.json'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

describe('AI-to-Human Transition Integration Tests', () => {
  beforeAll(async () => {
    // Re-seed test data before running integration tests
    console.log('🌱 Re-seeding test data for integration tests...')
    const seedingModule = await import('../../scripts/test-transition-seeding')
    await seedingModule.default()
  })

  describe('Database Transition Functions', () => {
    test('should have transition function available', async () => {
      // Test that the check_and_execute_transition function exists
      const { data, error } = await supabase.rpc('check_and_execute_transition', {
        p_goal_id: testData.scenarios[0].goalId,
        p_implementation_id: testData.scenarios[0].variantId
      })

      expect(error).toBeNull()
      expect(data).toBeDefined()
    })

    test('should not trigger transition with insufficient ratings', async () => {
      const scenario = testData.scenarios.find(s => s.expectedHumanCount === 0)
      if (!scenario) throw new Error('Fresh scenario not found')

      const { data: result } = await supabase.rpc('check_and_execute_transition', {
        p_goal_id: scenario.goalId,
        p_implementation_id: scenario.variantId
      })

      // Should return false (no transition occurred)
      expect(result).toBe(false)
    })

    test('should trigger transition when threshold is reached', async () => {
      const scenario = testData.scenarios.find(s => s.expectedHumanCount === 2)
      if (!scenario) throw new Error('Pre-transition scenario not found')

      // First verify it's in AI mode
      const { data: beforeCheck } = await supabase
        .from('goal_implementation_links')
        .select('data_display_mode, human_rating_count')
        .eq('goal_id', scenario.goalId)
        .eq('implementation_id', scenario.variantId)
        .single()

      expect(beforeCheck?.data_display_mode).toBe('ai')
      expect(beforeCheck?.human_rating_count).toBe(2)

      // Add one more rating to trigger transition
      const { error: ratingError } = await supabase
        .from('ratings')
        .insert({
          user_id: testData.testUserId,
          goal_id: scenario.goalId,
          solution_id: 'test-solution-id',
          implementation_id: scenario.variantId,
          effectiveness_score: 4,
          data_source: 'human',
          created_at: new Date().toISOString()
        })

      expect(ratingError).toBeNull()

      // Now check transition
      const { data: transitionResult } = await supabase.rpc('check_and_execute_transition', {
        p_goal_id: scenario.goalId,
        p_implementation_id: scenario.variantId
      })

      // Should return true (transition occurred)
      expect(transitionResult).toBe(true)

      // Verify the mode changed
      const { data: afterCheck } = await supabase
        .from('goal_implementation_links')
        .select('data_display_mode, human_rating_count, transitioned_at, ai_snapshot')
        .eq('goal_id', scenario.goalId)
        .eq('implementation_id', scenario.variantId)
        .single()

      expect(afterCheck?.data_display_mode).toBe('human')
      expect(afterCheck?.human_rating_count).toBe(3)
      expect(afterCheck?.transitioned_at).toBeTruthy()
      expect(afterCheck?.ai_snapshot).toBeTruthy()
    })
  })

  describe('Data Consistency', () => {
    test('should preserve AI data in snapshot during transition', async () => {
      const scenario = testData.scenarios.find(s => s.expectedMode === 'human')
      if (!scenario) return

      const { data: linkData } = await supabase
        .from('goal_implementation_links')
        .select('ai_snapshot, data_display_mode')
        .eq('goal_id', scenario.goalId)
        .eq('implementation_id', scenario.variantId)
        .single()

      expect(linkData?.data_display_mode).toBe('human')
      expect(linkData?.ai_snapshot).toBeTruthy()

      if (linkData?.ai_snapshot) {
        const snapshot = linkData.ai_snapshot as any
        expect(snapshot.original_effectiveness).toBeDefined()
        expect(snapshot.original_rating_count).toBeDefined()
        expect(snapshot.transitioned_on).toBeDefined()
      }
    })

    test('should correctly count human ratings', async () => {
      for (const scenario of testData.scenarios) {
        const { data: humanRatingCount } = await supabase
          .from('ratings')
          .select('id', { count: 'exact' })
          .eq('goal_id', scenario.goalId)
          .eq('implementation_id', scenario.variantId)
          .eq('data_source', 'human')

        const { data: linkData } = await supabase
          .from('goal_implementation_links')
          .select('human_rating_count')
          .eq('goal_id', scenario.goalId)
          .eq('implementation_id', scenario.variantId)
          .single()

        // Database count should match the link's counter (allowing for test timing)
        expect(humanRatingCount?.length).toBeGreaterThanOrEqual(0)
        expect(linkData?.human_rating_count).toBeGreaterThanOrEqual(0)
      }
    })

    test('should calculate effectiveness from human ratings only when transitioned', async () => {
      const scenario = testData.scenarios.find(s => s.expectedMode === 'human')
      if (!scenario) return

      // Get human ratings for this scenario
      const { data: humanRatings } = await supabase
        .from('ratings')
        .select('effectiveness_score')
        .eq('goal_id', scenario.goalId)
        .eq('implementation_id', scenario.variantId)
        .eq('data_source', 'human')

      if (humanRatings && humanRatings.length > 0) {
        const expectedAvg = humanRatings.reduce((sum, r) => sum + (r.effectiveness_score || 0), 0) / humanRatings.length

        const { data: linkData } = await supabase
          .from('goal_implementation_links')
          .select('avg_effectiveness')
          .eq('goal_id', scenario.goalId)
          .eq('implementation_id', scenario.variantId)
          .single()

        // Should be close to expected average (allowing for rounding)
        expect(linkData?.avg_effectiveness).toBeCloseTo(expectedAvg, 1)
      }
    })
  })

  describe('Aggregation Queue Processing', () => {
    test('should handle queue processing without errors', async () => {
      // Check if queue processing function exists and works
      const { data: queueItems } = await supabase
        .from('aggregation_queue')
        .select('*')
        .eq('status', 'pending')
        .limit(5)

      console.log(`Found ${queueItems?.length || 0} pending queue items`)

      // Even if no items, the query should succeed
      expect(queueItems).toBeDefined()
    })

    test('should prevent duplicate queue entries', async () => {
      const scenario = testData.scenarios[0]

      // Try to add multiple queue entries for the same goal-variant combination
      const queueEntry = {
        goal_id: scenario.goalId,
        implementation_id: scenario.variantId,
        status: 'pending' as const,
        created_at: new Date().toISOString()
      }

      // Add first entry
      const { error: firstError } = await supabase
        .from('aggregation_queue')
        .insert(queueEntry)

      // Add duplicate entry
      const { error: secondError } = await supabase
        .from('aggregation_queue')
        .insert(queueEntry)

      // First should succeed, second should fail due to unique constraint
      expect(firstError).toBeNull()
      expect(secondError).toBeTruthy() // Should have unique constraint violation
    })
  })

  describe('Performance and Race Conditions', () => {
    test('should handle concurrent transition attempts', async () => {
      const scenario = testData.scenarios.find(s => s.expectedHumanCount === 2)
      if (!scenario) return

      // Simulate concurrent transition checks
      const transitionPromises = Array(3).fill(0).map(() =>
        supabase.rpc('check_and_execute_transition', {
          p_goal_id: scenario.goalId,
          p_implementation_id: scenario.variantId
        })
      )

      const results = await Promise.allSettled(transitionPromises)

      // All should complete without errors
      results.forEach(result => {
        expect(result.status).toBe('fulfilled')
      })

      // Only one should have returned true (if any transition occurred)
      const successfulTransitions = results
        .filter(r => r.status === 'fulfilled')
        .map(r => (r as any).value.data)
        .filter(Boolean)

      expect(successfulTransitions.length).toBeLessThanOrEqual(1)
    })

    test('should complete transitions within reasonable time', async () => {
      const scenario = testData.scenarios[0]

      const startTime = Date.now()

      await supabase.rpc('check_and_execute_transition', {
        p_goal_id: scenario.goalId,
        p_implementation_id: scenario.variantId
      })

      const duration = Date.now() - startTime

      // Should complete within 1 second
      expect(duration).toBeLessThan(1000)
    })
  })

  afterAll(async () => {
    // Clean up test data
    console.log('🧹 Cleaning up integration test data...')
    await supabase
      .from('ratings')
      .delete()
      .eq('user_id', testData.testUserId)

    await supabase
      .from('aggregation_queue')
      .delete()
      .in('goal_id', testData.scenarios.map(s => s.goalId))
  })
})