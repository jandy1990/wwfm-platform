'use server'

import { createServerSupabaseClient } from '@/lib/database/server'
import { solutionAggregator } from '@/lib/services/solution-aggregator'
import { validateAndNormalizeSolutionFields } from '@/lib/solutions/solution-field-validator'
import { logger } from '@/lib/utils/logger'
import type { Json, Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

type JsonObject = { [key: string]: Json | undefined }

function isJsonObject(value: Json | null): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function mergeSolutionFields(
  existing: Json | null,
  updates: Record<string, unknown>
): TablesUpdate<'ratings'>['solution_fields'] {
  const base = isJsonObject(existing) ? existing : {}
  return {
    ...base,
    ...updates
  } as TablesUpdate<'ratings'>['solution_fields']
}

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
      .returns<
        {
          solutions: Pick<Tables<'solutions'>, 'solution_category'> | null
        } | null
      >()

    if (variantError || !variantCategory?.solutions?.solution_category) {
      logger.error('updateSolutionFields unable to determine category for implementation', { error: variantError })
      return { success: false, error: 'Unable to validate solution fields' }
    }

    const category = variantCategory.solutions.solution_category

    const { isValid, errors, normalizedFields } = validateAndNormalizeSolutionFields(
      category,
      data.additionalFields,
      { allowPartial: true }
    )

    if (!isValid) {
      logger.warn('updateSolutionFields validation failed', { errors })
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
        .returns<Pick<Tables<'ratings'>, 'user_id' | 'solution_fields'> | null>()

      if (fetchError || !rating) {
        logger.error('updateSolutionFields rating not found', { error: fetchError })
        return { success: false, error: 'Rating not found' }
      }

      if (rating.user_id !== data.userId) {
        return { success: false, error: 'Unauthorized' }
      }

      // Merge new fields with existing ones
      const updatedFields = mergeSolutionFields(rating.solution_fields, normalizedFields)

      // Update the rating with merged fields
      const ratingUpdate: TablesUpdate<'ratings'> = {
        solution_fields: updatedFields,
        updated_at: new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('ratings')
        .update(ratingUpdate)
        .eq('id', data.ratingId)

      if (updateError) {
        logger.error('updateSolutionFields failed to update rating', { error: updateError })
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
        .returns<Pick<Tables<'ratings'>, 'id' | 'solution_fields'> | null>()

      if (findError || !existingRating) {
        logger.error('updateSolutionFields no existing rating found', { error: findError })
        return { success: false, error: 'No rating found to update' }
      }

      // Merge new fields with existing ones
      const updatedFields = mergeSolutionFields(existingRating.solution_fields, normalizedFields)

      // Update the rating
      const ratingUpdate: TablesUpdate<'ratings'> = {
        solution_fields: updatedFields,
        updated_at: new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('ratings')
        .update(ratingUpdate)
        .eq('id', existingRating.id)

      if (updateError) {
        logger.error('updateSolutionFields failed to update rating', { error: updateError })
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
      logger.error('updateSolutionFields error updating aggregates', { error: aggError })
      // Don't fail the whole operation if aggregation fails
    }
    
    // If user provided notes, create a discussion post
    if (normalizedFields.notes && typeof normalizedFields.notes === 'string') {
      const notesContent = normalizedFields.notes.trim()
      if (notesContent.length >= 10) { // Minimum length for discussion posts
        try {
          const discussionInsert: TablesInsert<'goal_discussions'> = {
            goal_id: data.goalId,
            user_id: data.userId,
            content: notesContent
          }

          await supabase
            .from('goal_discussions')
            .insert(discussionInsert)
          
          logger.info('updateSolutionFields created discussion post from form notes', {
            goalId: data.goalId,
            userId: data.userId
          })
        } catch (discussionError) {
          logger.error('updateSolutionFields error creating discussion post', { error: discussionError })
          // Don't fail the main operation if discussion creation fails
        }
      }
    }
    
    return { success: true }
    
  } catch (error) {
    logger.error('updateSolutionFields unexpected error', error instanceof Error ? error : { error })
    return { success: false, error: 'An unexpected error occurred' }
  }
}
