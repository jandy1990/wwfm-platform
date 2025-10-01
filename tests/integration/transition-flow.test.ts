/**
 * Integration Tests for AI-to-Human Transition Flow
 *
 * Exercises the Supabase transition function, aggregation queue, and
 * supporting data structures without going through the UI layer.
 */

import { randomUUID } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { beforeAll, afterAll, describe, test, expect } from 'vitest'
import { Database } from '../../types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_KEY)')
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

type DataMode = 'ai' | 'human'

interface ScenarioTemplate {
  key: string
  name: string
  initialHumanRatings: number
  initialMode: DataMode
}

interface Scenario extends ScenarioTemplate {
  goalId: string
  solutionId: string
  variantId: string
}

const TRANSITION_THRESHOLD = 10

const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  { key: 'freshAi', name: 'Fresh AI Solution', initialHumanRatings: 0, initialMode: 'ai' },
  { key: 'preTransition', name: 'Pre-transition (9 ratings)', initialHumanRatings: TRANSITION_THRESHOLD - 1, initialMode: 'ai' },
  { key: 'atThresholdHuman', name: 'At Threshold Human (10 ratings)', initialHumanRatings: TRANSITION_THRESHOLD, initialMode: 'human' },
  { key: 'alreadyHuman', name: 'Already Transitioned (12 ratings)', initialHumanRatings: TRANSITION_THRESHOLD + 2, initialMode: 'human' }
]

const createdResources = {
  goals: [] as string[],
  solutions: [] as string[],
  variants: [] as string[],
  pairs: [] as Array<{ goalId: string; variantId: string }>
}

let scenarios: Record<string, Scenario> = {}

beforeAll(async () => {
  console.log('🌱 Seeding transition fixtures...')
  scenarios = await seedTransitionFixtures()
})

afterAll(async () => {
  console.log('🧹 Cleaning up transition fixtures...')
  await cleanupTransitionFixtures()
})

describe('AI-to-Human Transition Integration Tests', () => {
  describe('Database Transition Functions', () => {
    test('should have transition function available', async () => {
      const scenario = getScenario('freshAi')

      const { data, error } = await supabase.rpc('check_and_execute_transition', {
        p_goal_id: scenario.goalId,
        p_implementation_id: scenario.variantId
      })

      expect(error).toBeNull()
      expect(data).toBeDefined()
    })

    test('should not trigger transition with insufficient ratings', async () => {
      const scenario = getScenario('freshAi')

      const { data: result, error } = await supabase.rpc('check_and_execute_transition', {
        p_goal_id: scenario.goalId,
        p_implementation_id: scenario.variantId
      })

      expect(error).toBeNull()
      expect(result).toBe(false)
    })

    test('should trigger transition when threshold is reached', async () => {
      const scenario = getScenario('preTransition')

      const { data: beforeCheck, error: beforeError } = await supabase
        .from('goal_implementation_links')
        .select('data_display_mode, human_rating_count')
        .eq('goal_id', scenario.goalId)
        .eq('implementation_id', scenario.variantId)
        .single()

      expect(beforeError).toBeNull()
      expect(beforeCheck?.data_display_mode).toBe('ai')
      expect(beforeCheck?.human_rating_count).toBe(TRANSITION_THRESHOLD - 1)

      // Insert an additional human rating to hit the threshold
      const { data: insertedRating, error: ratingError } = await supabase
        .from('ratings')
        .insert({
          user_id: null,
          goal_id: scenario.goalId,
          solution_id: scenario.solutionId,
          implementation_id: scenario.variantId,
          effectiveness_score: 4,
          is_quick_rating: true,
          completion_percentage: 100,
          data_source: 'human',
          solution_fields: {
            cost: '$50/month',
            time_to_results: '3-4 weeks'
          }
        })
        .select('id')
        .single()

      expect(ratingError).toBeNull()
      expect(insertedRating?.id).toBeTruthy()

      const { data: transitionResult, error: transitionError } = await supabase.rpc('check_and_execute_transition', {
        p_goal_id: scenario.goalId,
        p_implementation_id: scenario.variantId
      })

      expect(transitionError).toBeNull()
      expect(transitionResult).toBe(true)

      const { data: afterCheck, error: afterError } = await supabase
        .from('goal_implementation_links')
        .select('data_display_mode, human_rating_count, transitioned_at, ai_snapshot')
        .eq('goal_id', scenario.goalId)
        .eq('implementation_id', scenario.variantId)
        .single()

      expect(afterError).toBeNull()
      expect(afterCheck?.data_display_mode).toBe('human')
      expect(afterCheck?.human_rating_count).toBe(TRANSITION_THRESHOLD)
      expect(afterCheck?.transitioned_at).toBeTruthy()
      expect(afterCheck?.ai_snapshot).toBeTruthy()

      // Reset scenario back to pre-transition state for other tests
      if (insertedRating?.id) {
        await supabase.from('ratings').delete().eq('id', insertedRating.id)
      }
      await resetScenarioToPreTransition(scenario, TRANSITION_THRESHOLD - 1)
    })
  })

  describe('Data Consistency', () => {
    test('should preserve AI snapshot after transition', async () => {
      const scenario = getScenario('atThresholdHuman')

      const { data: linkData, error } = await supabase
        .from('goal_implementation_links')
        .select('ai_snapshot, data_display_mode')
        .eq('goal_id', scenario.goalId)
        .eq('implementation_id', scenario.variantId)
        .single()

      expect(error).toBeNull()
      expect(linkData?.data_display_mode).toBe('human')
      expect(linkData?.ai_snapshot).toBeTruthy()

      if (linkData?.ai_snapshot) {
        const snapshot = linkData.ai_snapshot as Record<string, unknown>
        expect(snapshot.cost).toBeDefined()
        expect(snapshot.time_to_results).toBeDefined()
      }
    })

    test('should correctly track human rating counts', async () => {
      for (const scenario of Object.values(scenarios)) {
        const { count: ratingCount, error: countError } = await supabase
          .from('ratings')
          .select('*', { count: 'exact', head: true })
          .eq('goal_id', scenario.goalId)
          .eq('implementation_id', scenario.variantId)
          .eq('data_source', 'human')

        expect(countError).toBeNull()

        const { data: linkData, error: linkError } = await supabase
          .from('goal_implementation_links')
          .select('human_rating_count')
          .eq('goal_id', scenario.goalId)
          .eq('implementation_id', scenario.variantId)
          .single()

        expect(linkError).toBeNull()
        expect(linkData?.human_rating_count).toBe(ratingCount ?? 0)
      }
    })

    test('should align avg effectiveness with human data post-transition', async () => {
      const scenario = getScenario('alreadyHuman')

      const { data: humanRatings, error: ratingError } = await supabase
        .from('ratings')
        .select('effectiveness_score')
        .eq('goal_id', scenario.goalId)
        .eq('implementation_id', scenario.variantId)
        .eq('data_source', 'human')

      expect(ratingError).toBeNull()

      if (humanRatings && humanRatings.length > 0) {
        const expectedAvg = humanRatings.reduce((sum, r) => sum + (r.effectiveness_score || 0), 0) / humanRatings.length

        const { data: linkData, error: linkError } = await supabase
          .from('goal_implementation_links')
          .select('avg_effectiveness')
          .eq('goal_id', scenario.goalId)
          .eq('implementation_id', scenario.variantId)
          .single()

        expect(linkError).toBeNull()
        expect(linkData?.avg_effectiveness).toBeCloseTo(expectedAvg, 1)
      }
    })
  })

  describe('Aggregation Queue Processing', () => {
    test('should fetch queue status without error', async () => {
      const { data, error } = await supabase
        .from('aggregation_queue')
        .select('goal_id, implementation_id, processing')
        .limit(5)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
    })

    test('should prevent duplicate queue entries', async () => {
      const scenario = getScenario('freshAi')

      await supabase
        .from('aggregation_queue')
        .delete()
        .eq('goal_id', scenario.goalId)
        .eq('implementation_id', scenario.variantId)

      const firstInsert = await supabase
        .from('aggregation_queue')
        .insert({ goal_id: scenario.goalId, implementation_id: scenario.variantId })

      const secondInsert = await supabase
        .from('aggregation_queue')
        .insert({ goal_id: scenario.goalId, implementation_id: scenario.variantId })

      expect(firstInsert.error).toBeNull()
      expect(secondInsert.error).toBeTruthy()

      await supabase
        .from('aggregation_queue')
        .delete()
        .eq('goal_id', scenario.goalId)
        .eq('implementation_id', scenario.variantId)
    })
  })

  describe('Performance and Race Conditions', () => {
    test('should handle concurrent transition attempts safely', async () => {
      const scenario = getScenario('preTransition')

      const transitionPromises = Array.from({ length: 3 }).map(() =>
        supabase.rpc('check_and_execute_transition', {
          p_goal_id: scenario.goalId,
          p_implementation_id: scenario.variantId
        })
      )

      const results = await Promise.allSettled(transitionPromises)
      results.forEach(result => expect(result.status).toBe('fulfilled'))

      const successfulTransitions = results
        .filter((result): result is PromiseFulfilledResult<{ data: boolean }> => result.status === 'fulfilled')
        .map(result => result.value.data)
        .filter(Boolean)

      expect(successfulTransitions.length).toBeLessThanOrEqual(1)

      // Restore original state
      await resetScenarioToPreTransition(scenario, 2)
    })

    test('should complete transition check quickly', async () => {
      const scenario = getScenario('freshAi')
      const startTime = Date.now()

      const { error } = await supabase.rpc('check_and_execute_transition', {
        p_goal_id: scenario.goalId,
        p_implementation_id: scenario.variantId
      })

      expect(error).toBeNull()
      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(1000)
    })
  })
})

async function seedTransitionFixtures(): Promise<Record<string, Scenario>> {
  const scenarioMap: Record<string, Scenario> = {}

  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id, arena_id')
    .eq('is_active', true)
    .limit(1)
    .single()

  if (categoryError || !category) {
    throw new Error(`Unable to seed transition fixtures: ${categoryError?.message ?? 'no active category found'}`)
  }

  for (const template of SCENARIO_TEMPLATES) {
    const goalId = randomUUID()
    const solutionId = randomUUID()
    const variantId = randomUUID()

    createdResources.goals.push(goalId)
    createdResources.solutions.push(solutionId)
    createdResources.variants.push(variantId)
    createdResources.pairs.push({ goalId, variantId })

    await supabase.from('goals').upsert({
      id: goalId,
      category_id: category.id,
      arena_id: category.arena_id,
      title: `Transition Test Goal - ${template.name}`,
      description: 'Autogenerated integration test goal',
      is_approved: true
    }, { onConflict: 'id' })

    await supabase.from('solutions').upsert({
      id: solutionId,
      title: `Transition Test Solution - ${template.name}`,
      description: 'Autogenerated integration test solution',
      solution_category: 'exercise_movement',
      source_type: 'ai_foundation',
      is_approved: true
    }, { onConflict: 'id' })

    await supabase.from('solution_variants').upsert({
      id: variantId,
      solution_id: solutionId,
      variant_name: `Integration Variant - ${template.name}`,
      is_default: true,
      display_order: 1
    }, { onConflict: 'id' })

    const aiSnapshot = {
      cost: '$50/month',
      time_to_results: '3-4 weeks',
      frequency: '3 times per week'
    }

    await supabase.from('goal_implementation_links').upsert({
      goal_id: goalId,
      implementation_id: variantId,
      avg_effectiveness: template.initialHumanRatings > 0 ? 4 : 0,
      rating_count: template.initialHumanRatings,
      solution_fields: aiSnapshot,
      aggregated_fields: template.initialMode === 'human' && template.initialHumanRatings > 0
        ? {
            cost: {
              mode: '$50/month',
              values: [
                {
                  value: '$50/month',
                  count: template.initialHumanRatings,
                  percentage: 100,
                  source: 'user_submission'
                }
              ],
              totalReports: template.initialHumanRatings,
              dataSource: 'user_submission'
            },
            _metadata: {
              total_ratings: template.initialHumanRatings,
              last_aggregated: new Date().toISOString(),
              data_source: 'user',
              confidence: template.initialHumanRatings >= 3 ? 'medium' : 'low'
            }
          }
        : null,
      human_rating_count: template.initialHumanRatings,
      data_display_mode: template.initialMode,
      transition_threshold: TRANSITION_THRESHOLD,
      ai_snapshot: aiSnapshot,
      transitioned_at: template.initialMode === 'human' ? new Date().toISOString() : null,
      needs_aggregation: false
    }, { onConflict: 'goal_id,implementation_id' })

    await supabase
      .from('ratings')
      .delete()
      .eq('goal_id', goalId)
      .eq('implementation_id', variantId)

    for (let i = 0; i < template.initialHumanRatings; i++) {
      await supabase.from('ratings').insert({
        user_id: null,
        solution_id: solutionId,
        implementation_id: variantId,
        goal_id: goalId,
        effectiveness_score: 4,
        is_quick_rating: true,
        completion_percentage: 100,
        data_source: 'human',
        solution_fields: {
          cost: '$50/month',
          time_to_results: '3-4 weeks'
        }
      })
    }

    const { count: humanCount } = await supabase
      .from('ratings')
      .select('*', { count: 'exact', head: true })
      .eq('goal_id', goalId)
      .eq('implementation_id', variantId)
      .eq('data_source', 'human')

    await supabase
      .from('goal_implementation_links')
      .update({
        human_rating_count: humanCount ?? 0,
        rating_count: humanCount ?? 0,
        avg_effectiveness: humanCount ? 4 : 0,
        data_display_mode: template.initialMode,
        transitioned_at: template.initialMode === 'human' ? new Date().toISOString() : null,
        needs_aggregation: false,
        transition_threshold: TRANSITION_THRESHOLD
      })
      .eq('goal_id', goalId)
      .eq('implementation_id', variantId)

    await supabase
      .from('aggregation_queue')
      .delete()
      .eq('goal_id', goalId)
      .eq('implementation_id', variantId)

    scenarioMap[template.key] = {
      ...template,
      goalId,
      solutionId,
      variantId
    }
  }

  return scenarioMap
}

async function cleanupTransitionFixtures() {
  for (const pair of createdResources.pairs) {
    await supabase
      .from('aggregation_queue')
      .delete()
      .eq('goal_id', pair.goalId)
      .eq('implementation_id', pair.variantId)
  }

  if (createdResources.goals.length) {
    await supabase
      .from('ratings')
      .delete()
      .in('goal_id', createdResources.goals)
  }

  for (const pair of createdResources.pairs) {
    await supabase
      .from('goal_implementation_links')
      .delete()
      .eq('goal_id', pair.goalId)
      .eq('implementation_id', pair.variantId)
  }

  if (createdResources.variants.length) {
    await supabase
      .from('solution_variants')
      .delete()
      .in('id', createdResources.variants)
  }

  if (createdResources.solutions.length) {
    await supabase
      .from('solutions')
      .delete()
      .in('id', createdResources.solutions)
  }

  if (createdResources.goals.length) {
    await supabase
      .from('goals')
      .delete()
      .in('id', createdResources.goals)
  }
}

async function resetScenarioToPreTransition(scenario: Scenario, targetHumanCount: number) {
  await supabase
    .from('ratings')
    .delete()
    .eq('goal_id', scenario.goalId)
    .eq('implementation_id', scenario.variantId)

  for (let i = 0; i < targetHumanCount; i++) {
    await supabase.from('ratings').insert({
      user_id: null,
      goal_id: scenario.goalId,
      solution_id: scenario.solutionId,
      implementation_id: scenario.variantId,
      effectiveness_score: 4,
      is_quick_rating: true,
      completion_percentage: 100,
      data_source: 'human',
      solution_fields: {
        cost: '$50/month',
        time_to_results: '3-4 weeks'
      }
    })
  }

  const { count: humanCount } = await supabase
    .from('ratings')
    .select('*', { count: 'exact', head: true })
    .eq('goal_id', scenario.goalId)
    .eq('implementation_id', scenario.variantId)
    .eq('data_source', 'human')

    await supabase
      .from('goal_implementation_links')
      .update({
        human_rating_count: humanCount ?? 0,
        rating_count: humanCount ?? 0,
        avg_effectiveness: humanCount ? 4 : 0,
        data_display_mode: 'ai',
        transitioned_at: null,
        needs_aggregation: false,
        transition_threshold: TRANSITION_THRESHOLD
      })
      .eq('goal_id', scenario.goalId)
      .eq('implementation_id', scenario.variantId)

  await supabase
    .from('aggregation_queue')
    .delete()
    .eq('goal_id', scenario.goalId)
    .eq('implementation_id', scenario.variantId)
}

function getScenario(key: string): Scenario {
  const scenario = scenarios[key]
  if (!scenario) {
    throw new Error(`Scenario '${key}' not initialised`)
  }
  return scenario
}
