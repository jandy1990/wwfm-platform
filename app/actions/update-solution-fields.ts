'use server'

import { createServerSupabaseClient } from '@/lib/database/server'
import { solutionAggregator } from '@/lib/services/solution-aggregator'
import { validateAndNormalizeSolutionFields } from '@/lib/solutions/solution-field-validator'

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

    const { data: variantCategory, error: variantError } = await supabase
      .from('solution_variants')
      .select('solutions!inner(solution_category)')
      .eq('id', data.implementationId)
      .single()

    if (variantError || !variantCategory?.solutions?.solution_category) {
      console.error('Unable to determine category for implementation:', variantError)
      return { success: false, error: 'Unable to validate solution fields' }
    }

    const category = variantCategory.solutions.solution_category as string

    const { isValid, errors, normalizedFields } = validateAndNormalizeSolutionFields(
      category,
      data.additionalFields,
      { allowPartial: true }
    )

    if (!isValid) {
      console.warn('updateSolutionFields validation failed:', errors)
      return { success: false, error: `Invalid field data: ${errors.join('; ')}` }
    }

    if (Object.keys(normalizedFields).length === 0) {
      return { success: true }
    }
    
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
        ...normalizedFields
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
        ...normalizedFields
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
    
    // If user provided notes, create a discussion post
    if (normalizedFields.notes && typeof normalizedFields.notes === 'string') {
      const notesContent = normalizedFields.notes.trim()
      if (notesContent.length >= 10) { // Minimum length for discussion posts
        try {
          await supabase
            .from('goal_discussions')
            .insert({
              goal_id: data.goalId,
              user_id: data.userId,
              content: notesContent
            })
          
          console.log('Created discussion post from form notes')
        } catch (discussionError) {
          console.error('Error creating discussion post:', discussionError)
          // Don't fail the main operation if discussion creation fails
        }
      }
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('Error in updateSolutionFields:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
