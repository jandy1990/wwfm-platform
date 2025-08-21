'use server'

import { createServerSupabaseClient } from '@/lib/database/server'
import { solutionAggregator } from '@/lib/services/solution-aggregator'

interface UpdateSolutionFieldsData {
  ratingId?: string
  goalId: string
  implementationId: string
  userId: string
  additionalFields: Record<string, unknown>
}

/**
 * Updates solution fields for an existing rating
 * Called from success screens when users add optional information
 */
export async function updateSolutionFields(data: UpdateSolutionFieldsData) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Verify user owns this rating or create a new one if no ratingId
    if (data.ratingId) {
      // Update existing rating
      const { data: rating, error: fetchError } = await supabase
        .from('ratings')
        .select('user_id, solution_fields')
        .eq('id', data.ratingId)
        .single()
      
      if (fetchError || !rating) {
        console.error('Rating not found:', fetchError)
        return { success: false, error: 'Rating not found' }
      }
      
      if (rating.user_id !== data.userId) {
        return { success: false, error: 'Unauthorized' }
      }
      
      // Merge new fields with existing ones
      const updatedFields = {
        ...(rating.solution_fields || {}),
        ...data.additionalFields
      }
      
      // Update the rating with merged fields
      const { error: updateError } = await supabase
        .from('ratings')
        .update({ 
          solution_fields: updatedFields,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.ratingId)
      
      if (updateError) {
        console.error('Error updating rating:', updateError)
        return { success: false, error: 'Failed to update rating' }
      }
    } else {
      // Find existing rating for this user/goal/implementation combo
      const { data: existingRating, error: findError } = await supabase
        .from('ratings')
        .select('id, solution_fields')
        .eq('user_id', data.userId)
        .eq('goal_id', data.goalId)
        .eq('implementation_id', data.implementationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (findError || !existingRating) {
        console.error('No existing rating found:', findError)
        return { success: false, error: 'No rating found to update' }
      }
      
      // Merge new fields with existing ones
      const updatedFields = {
        ...(existingRating.solution_fields || {}),
        ...data.additionalFields
      }
      
      // Update the rating
      const { error: updateError } = await supabase
        .from('ratings')
        .update({ 
          solution_fields: updatedFields,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRating.id)
      
      if (updateError) {
        console.error('Error updating rating:', updateError)
        return { success: false, error: 'Failed to update rating' }
      }
    }
    
    // Re-compute aggregates after update
    try {
      await solutionAggregator.updateAggregatesAfterRating(
        data.goalId,
        data.implementationId
      )
    } catch (aggError) {
      console.error('Error updating aggregates:', aggError)
      // Don't fail the whole operation if aggregation fails
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('Error in updateSolutionFields:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}