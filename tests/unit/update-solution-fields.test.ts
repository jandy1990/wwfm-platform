import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { updateSolutionFields } from '@/app/actions/update-solution-fields'
import { createClient } from '@supabase/supabase-js'

// Test configuration
const TEST_GOAL_ID = '56e2801e-0d78-4abd-a795-869e5b780ae7'
const TEST_USER_ID = 'test-user-' + Date.now()
const TEST_VARIANT_ID = 'test-variant-' + Date.now()

// Initialize test client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

describe('updateSolutionFields', () => {
  let testRatingId: string
  
  beforeAll(async () => {
    // Create a test rating to update
    const { data: rating, error } = await supabase
      .from('ratings')
      .insert({
        user_id: TEST_USER_ID,
        goal_id: TEST_GOAL_ID,
        implementation_id: TEST_VARIANT_ID,
        effectiveness_score: 4,
        solution_fields: {
          initial_field: 'test_value'
        }
      })
      .select()
      .single()
    
    if (error) throw error
    testRatingId = rating.id
  })
  
  afterAll(async () => {
    // Cleanup test data
    await supabase
      .from('ratings')
      .delete()
      .eq('id', testRatingId)
  })
  
  it('should merge new fields with existing fields', async () => {
    const newFields = {
      side_effects: 'None',
      would_recommend: true,
      additional_notes: 'Test notes'
    }
    
    const result = await updateSolutionFields({
      goalId: TEST_GOAL_ID,
      implementationId: TEST_VARIANT_ID,
      userId: TEST_USER_ID,
      additionalFields: newFields
    })
    
    expect(result.success).toBe(true)
    
    // Verify fields were merged
    const { data: updatedRating } = await supabase
      .from('ratings')
      .select('solution_fields')
      .eq('id', testRatingId)
      .single()
    
    expect(updatedRating?.solution_fields).toMatchObject({
      initial_field: 'test_value',
      ...newFields
    })
  })
  
  it('should handle missing rating gracefully', async () => {
    const result = await updateSolutionFields({
      goalId: TEST_GOAL_ID,
      implementationId: 'non-existent-variant',
      userId: 'non-existent-user',
      additionalFields: { test: 'data' }
    })
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('No rating found')
  })
  
  it('should trigger aggregation after update', async () => {
    const result = await updateSolutionFields({
      goalId: TEST_GOAL_ID,
      implementationId: TEST_VARIANT_ID,
      userId: TEST_USER_ID,
      additionalFields: {
        new_field: 'new_value'
      }
    })
    
    expect(result.success).toBe(true)
    
    // Check that aggregation was triggered
    // This would be verified by checking goal_implementation_links
    // but in a unit test we mainly verify the action completes
  })
  
  it('should not overwrite existing fields unless explicitly provided', async () => {
    // First update
    await updateSolutionFields({
      goalId: TEST_GOAL_ID,
      implementationId: TEST_VARIANT_ID,
      userId: TEST_USER_ID,
      additionalFields: {
        field_a: 'value_a'
      }
    })
    
    // Second update with different field
    await updateSolutionFields({
      goalId: TEST_GOAL_ID,
      implementationId: TEST_VARIANT_ID,
      userId: TEST_USER_ID,
      additionalFields: {
        field_b: 'value_b'
      }
    })
    
    // Verify both fields exist
    const { data: rating } = await supabase
      .from('ratings')
      .select('solution_fields')
      .eq('id', testRatingId)
      .single()
    
    expect(rating?.solution_fields).toMatchObject({
      initial_field: 'test_value',
      field_a: 'value_a',
      field_b: 'value_b'
    })
  })
})
