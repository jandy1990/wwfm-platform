/**
 * E2E Test for PracticeForm categories via direct API calls
 * Tests: meditation_mindfulness, exercise_movement, habits_routines
 *
 * Goal: 56e2801e-0d78-4abd-a795-869e5b780ae7 (Calm my anxiety)
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wqxkhxdbxdtpuvuvgirx.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

// Use service role to bypass RLS for testing
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const GOAL_ID = '56e2801e-0d78-4abd-a795-869e5b780ae7'
const TEST_USER_EMAIL = 'test@wwfm-platform.com'

interface TestSolution {
  title: string
  category: string
  effectiveness: number
  timeToResults: string
  cost: string
  categorySpecificFields: Record<string, any>
}

const testSolutions: TestSolution[] = [
  {
    title: 'Guided Meditation (DevTools Test)',
    category: 'meditation_mindfulness',
    effectiveness: 4,
    timeToResults: '1-2 weeks',
    cost: 'Free',
    categorySpecificFields: {
      practice_length: '10-15 minutes',
      frequency: 'Daily'
    }
  },
  {
    title: 'Running (DevTools Test)',
    category: 'exercise_movement',
    effectiveness: 5,
    timeToResults: '1-2 weeks',
    cost: 'Free',
    categorySpecificFields: {
      frequency: '3-4 times per week',
      duration: '30-45 minutes'
    }
  },
  {
    title: 'Morning Routine (DevTools Test)',
    category: 'habits_routines',
    effectiveness: 4,
    timeToResults: '1-2 weeks',
    cost: 'Free',
    categorySpecificFields: {
      time_commitment: '30-60 minutes daily',
      frequency: 'Daily'
    }
  }
]

async function testPracticeFormCategory(testData: TestSolution) {
  console.log(`\n==== Testing ${testData.category}: ${testData.title} ====`)

  try {
    // 1. Create or get solution
    let solutionId: string
    const { data: existing } = await supabase
      .from('solutions')
      .select('id')
      .eq('title', testData.title)
      .single()

    if (existing) {
      console.log(`✓ Solution already exists: ${existing.id}`)
      solutionId = existing.id
    } else {
      const { data: newSolution, error: solutionError } = await supabase
        .from('solutions')
        .insert({
          title: testData.title,
          solution_category: testData.category,
          is_approved: true
        })
        .select('id')
        .single()

      if (solutionError) throw solutionError
      solutionId = newSolution.id
      console.log(`✓ Created solution: ${solutionId}`)
    }

    // 2. Create or get solution variant
    let variantId: string
    const { data: existingVariant } = await supabase
      .from('solution_variants')
      .select('id')
      .eq('solution_id', solutionId)
      .eq('variant_name', 'Standard')
      .single()

    if (existingVariant) {
      console.log(`✓ Variant already exists: ${existingVariant.id}`)
      variantId = existingVariant.id
    } else {
      const { data: newVariant, error: variantError } = await supabase
        .from('solution_variants')
        .insert({
          solution_id: solutionId,
          is_default: true,
          variant_name: 'Standard'
        })
        .select('id')
        .single()

      if (variantError) throw variantError
      variantId = newVariant.id
      console.log(`✓ Created variant: ${variantId}`)
    }

    // 3. Create rating
    const { data: rating, error: ratingError} = await supabase
      .from('ratings')
      .insert({
        goal_id: GOAL_ID,
        implementation_id: variantId,
        effectiveness_score: testData.effectiveness,
        solution_fields: {
          ...testData.categorySpecificFields,
          cost: testData.cost,
          time_to_results: testData.timeToResults
        },
        data_source: 'test'
      })
      .select('id')
      .single()

    if (ratingError) throw ratingError
    console.log(`✓ Created rating: ${rating.id}`)

    // 4. Create or update goal_implementation_link
    const { data: existingLink } = await supabase
      .from('goal_implementation_links')
      .select('id')
      .eq('goal_id', GOAL_ID)
      .eq('implementation_id', variantId)
      .single()

    if (existingLink) {
      const { error: updateError } = await supabase
        .from('goal_implementation_links')
        .update({
          avg_effectiveness: testData.effectiveness,
          rating_count: 1,
          human_rating_count: 1,
          aggregated_fields: {
            cost: {
              mode: testData.cost,
              values: [{
                value: testData.cost,
                count: 1,
                percentage: 100,
                source: 'user_submission'
              }],
              dataSource: 'user_submission',
              totalReports: 1
            },
            time_to_results: {
              mode: testData.timeToResults,
              values: [{
                value: testData.timeToResults,
                count: 1,
                percentage: 100,
                source: 'user_submission'
              }],
              dataSource: 'user_submission',
              totalReports: 1
            },
            ...Object.fromEntries(
              Object.entries(testData.categorySpecificFields).map(([key, value]) => [
                key,
                {
                  mode: value,
                  values: [{
                    value,
                    count: 1,
                    percentage: 100,
                    source: 'user_submission'
                  }],
                  dataSource: 'user_submission',
                  totalReports: 1
                }
              ])
            )
          }
        })
        .eq('id', existingLink.id)

      if (updateError) throw updateError
      console.log(`✓ Updated goal_implementation_link: ${existingLink.id}`)
    } else {
      const { data: newLink, error: linkError } = await supabase
        .from('goal_implementation_links')
        .insert({
          goal_id: GOAL_ID,
          implementation_id: variantId,
          avg_effectiveness: testData.effectiveness,
          rating_count: 1,
          human_rating_count: 1,
          aggregated_fields: {
            cost: {
              mode: testData.cost,
              values: [{
                value: testData.cost,
                count: 1,
                percentage: 100,
                source: 'user_submission'
              }],
              dataSource: 'user_submission',
              totalReports: 1
            },
            time_to_results: {
              mode: testData.timeToResults,
              values: [{
                value: testData.timeToResults,
                count: 1,
                percentage: 100,
                source: 'user_submission'
              }],
              dataSource: 'user_submission',
              totalReports: 1
            },
            ...Object.fromEntries(
              Object.entries(testData.categorySpecificFields).map(([key, value]) => [
                key,
                {
                  mode: value,
                  values: [{
                    value,
                    count: 1,
                    percentage: 100,
                    source: 'user_submission'
                  }],
                  dataSource: 'user_submission',
                  totalReports: 1
                }
              ])
            )
          }
        })
        .select('id')
        .single()

      if (linkError) throw linkError
      console.log(`✓ Created goal_implementation_link: ${newLink.id}`)
    }

    console.log(`\n✅ SUCCESS: ${testData.category}`)
    console.log(`   Solution ID: ${solutionId}`)
    console.log(`   Variant ID: ${variantId}`)
    console.log(`   Rating ID: ${rating.id}`)

    return { success: true, solutionId, variantId, ratingId: rating.id }
  } catch (error) {
    console.error(`\n❌ FAILED: ${testData.category}`)
    console.error(error)
    return { success: false, error }
  }
}

async function main() {
  console.log('Testing PracticeForm categories (3 total)\n')
  console.log(`Goal: ${GOAL_ID}`)
  console.log(`User: ${TEST_USER_EMAIL}\n`)

  const results = []

  for (const testData of testSolutions) {
    const result = await testPracticeFormCategory(testData)
    results.push({ category: testData.category, ...result })
  }

  console.log('\n\n==== SUMMARY ====')
  results.forEach((r, i) => {
    const status = r.success ? '✅' : '❌'
    console.log(`${i + 1}. ${status} ${r.category}`)
    if (r.success) {
      console.log(`   Solution: ${r.solutionId}`)
      console.log(`   Rating: ${r.ratingId}`)
    }
  })

  const successCount = results.filter(r => r.success).length
  console.log(`\nTotal: ${successCount}/${results.length} passed`)
}

main().catch(console.error)
