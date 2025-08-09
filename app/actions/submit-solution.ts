'use server'

import { createServerSupabaseClient } from '@/lib/database/server'

// Types for the submission data
interface VariantData {
  amount?: number
  unit?: string
  form?: string
}

interface FailedSolution {
  id?: string
  name: string
  rating: number
}

interface SolutionFields {
  // Common fields
  cost?: string
  frequency?: string
  time_to_results?: string
  length_of_use?: string
  side_effects?: string[]
  challenges?: string[]
  
  // Dosage-specific
  dose_amount?: string
  dose_unit?: string
  skincareFrequency?: string
  
  // App-specific
  usage_frequency?: string
  subscription_type?: string
  platform?: string
  
  // Session-specific
  session_duration?: string
  session_frequency?: string
  sessions_count?: string
  provider_type?: string
  
  // Practice-specific
  practice_duration?: string
  practice_frequency?: string
  time_commitment?: string
  
  // Purchase-specific
  purchase_price?: string
  purchase_type?: string
  
  // Community-specific
  engagement_level?: string
  community_size?: string
  
  // Lifestyle-specific
  lifestyle_change?: string
  difficulty_level?: string
  
  // Financial-specific
  financial_commitment?: string
  roi_timeframe?: string
  
  // Other optional fields
  brand?: string
  form_factor?: string
  other_info?: string
  failed_solutions_text?: Array<{ name: string; rating: number }>
}

export interface SubmitSolutionData {
  // Core fields
  goalId: string
  userId: string
  solutionName: string
  category: string
  existingSolutionId?: string
  effectiveness: number
  timeToResults: string
  
  // Category-specific fields (stored in JSONB)
  solutionFields: SolutionFields
  
  // Variant fields (for dosage categories)
  variantData?: VariantData
  
  // Failed solutions
  failedSolutions?: FailedSolution[]
}

export interface SubmitSolutionResult {
  success: boolean
  error?: string
  solutionId?: string
  variantId?: string
  ratingId?: string
  otherRatingsCount?: number
}

// Categories that use dosage variants (beauty_skincare uses Standard)
const DOSAGE_CATEGORIES = ['medications', 'supplements_vitamins', 'natural_remedies']

export async function submitSolution(formData: SubmitSolutionData): Promise<SubmitSolutionResult> {
  try {
    console.log('[Server] Received submission data:', {
      goalId: formData.goalId,
      userId: formData.userId,
      solutionName: formData.solutionName,
      category: formData.category,
      existingSolutionId: formData.existingSolutionId,
      effectiveness: formData.effectiveness
    })
    
    const supabase = await createServerSupabaseClient()
    
    // 1. Verify authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== formData.userId) {
      console.log('[Server] Auth failed - user:', user?.id, 'expected:', formData.userId)
      return { success: false, error: 'Unauthorized: Please sign in to submit a solution' }
    }
    
    // 2. Check for duplicate rating first
    let solutionId = formData.existingSolutionId
    let variantId: string | null = null
    
    // If we have an existing solution, check for its variant
    if (solutionId) {
      // Get the default variant for this solution
      const { data: existingVariant } = await supabase
        .from('solution_variants')
        .select('id')
        .eq('solution_id', solutionId)
        .eq('is_default', true)
        .single()
      
      if (existingVariant) {
        variantId = existingVariant.id
        
        // Check for duplicate rating
        const { data: existingRating } = await supabase
          .from('ratings')
          .select('id')
          .eq('user_id', formData.userId)
          .eq('goal_id', formData.goalId)
          .eq('implementation_id', variantId)
          .single()
        
        if (existingRating) {
          return { 
            success: false, 
            error: "You've already rated this solution for this goal. You can only submit one rating per solution." 
          }
        }
      }
    }
    
    // 3. Create or reuse solution
    if (!solutionId) {
      console.log('[Server] Creating new solution:', formData.solutionName, 'in category:', formData.category)
      // Create new solution
      const { data: newSolution, error: solutionError } = await supabase
        .from('solutions')
        .insert({
          title: formData.solutionName,
          solution_category: formData.category,
          source_type: 'user_generated',
          is_approved: false // Will be approved after 3 ratings
        })
        .select()
        .single()
      
      if (solutionError) {
        console.error('[Server] Error creating solution:', solutionError)
        console.error('[Server] Failed insert data:', {
          title: formData.solutionName,
          solution_category: formData.category,
          source_type: 'user_generated',
          is_approved: false
        })
        return { success: false, error: 'Failed to create solution' }
      }
      
      solutionId = newSolution.id
      console.log('[Server] Created solution with ID:', solutionId)
    } else {
      console.log('[Server] Using existing solution ID:', solutionId)
    }
    
    // 4. Create or find variant
    if (!variantId) {
      const isDosageCategory = DOSAGE_CATEGORIES.includes(formData.category)
      let variantName: string
      
      if (isDosageCategory && formData.variantData) {
        // For all dosage categories including beauty_skincare
        const { amount, unit, form } = formData.variantData
        variantName = `${amount}${unit}${form ? ` ${form}` : ''}`
      } else {
        // For non-dosage categories only
        variantName = 'Standard'
      }
      
      // Check if this variant already exists
      const { data: existingVariant } = await supabase
        .from('solution_variants')
        .select('id')
        .eq('solution_id', solutionId)
        .eq('variant_name', variantName)
        .single()
      
      if (existingVariant) {
        variantId = existingVariant.id
        
        // Check for duplicate rating with this variant
        const { data: existingRating } = await supabase
          .from('ratings')
          .select('id')
          .eq('user_id', formData.userId)
          .eq('goal_id', formData.goalId)
          .eq('implementation_id', variantId)
          .single()
        
        if (existingRating) {
          return { 
            success: false, 
            error: "You've already rated this solution variant for this goal." 
          }
        }
      } else {
        // Create new variant
        const variantData: Record<string, any> = {
          solution_id: solutionId,
          variant_name: variantName,
          is_default: true, // First variant is default
          display_order: 1
        }
        
        // Add dosage-specific fields if applicable
        if (isDosageCategory && formData.variantData) {
          variantData.amount = formData.variantData.amount
          variantData.unit = formData.variantData.unit
          variantData.form = formData.variantData.form || null
        }
        
        const { data: newVariant, error: variantError } = await supabase
          .from('solution_variants')
          .insert(variantData)
          .select()
          .single()
        
        if (variantError) {
          console.error('Error creating variant:', variantError)
          return { success: false, error: 'Failed to create solution variant' }
        }
        
        variantId = newVariant.id
      }
    }
    
    // 5. Create individual rating
    const { data: newRating, error: ratingError } = await supabase
      .from('ratings')
      .insert({
        user_id: formData.userId,
        implementation_id: variantId,
        goal_id: formData.goalId,
        solution_id: solutionId,
        effectiveness_score: formData.effectiveness,
        is_quick_rating: false,
        duration_used: formData.solutionFields.length_of_use || null,
        side_effects: formData.solutionFields.side_effects ? 
          formData.solutionFields.side_effects.join(', ') : null,
        completion_percentage: 100
      })
      .select()
      .single()
    
    if (ratingError) {
      console.error('Error creating rating:', ratingError)
      return { success: false, error: 'Failed to save your rating' }
    }
    
    // 6. Update or create goal_implementation_link with aggregates
    const { data: currentLink } = await supabase
      .from('goal_implementation_links')
      .select('id, avg_effectiveness, rating_count')
      .eq('goal_id', formData.goalId)
      .eq('implementation_id', variantId)
      .single()
    
    if (currentLink) {
      // Update existing link with new average
      const newCount = currentLink.rating_count + 1
      const newAvg = ((currentLink.avg_effectiveness * currentLink.rating_count) + formData.effectiveness) / newCount
      
      const { error: updateError } = await supabase
        .from('goal_implementation_links')
        .update({
          avg_effectiveness: newAvg,
          rating_count: newCount,
          solution_fields: formData.solutionFields // Update with latest fields
        })
        .eq('id', currentLink.id)
      
      if (updateError) {
        console.error('Error updating link:', updateError)
        return { success: false, error: 'Failed to update solution statistics' }
      }
      
      // Check if we should auto-approve the solution (at 3 ratings)
      if (newCount === 3) {
        await supabase
          .from('solutions')
          .update({ is_approved: true })
          .eq('id', solutionId)
      }
    } else {
      // Create new link
      const { error: createLinkError } = await supabase
        .from('goal_implementation_links')
        .insert({
          goal_id: formData.goalId,
          implementation_id: variantId,
          avg_effectiveness: formData.effectiveness,
          rating_count: 1,
          solution_fields: formData.solutionFields
        })
      
      if (createLinkError) {
        console.error('Error creating link:', createLinkError)
        return { success: false, error: 'Failed to link solution to goal' }
      }
    }
    
    // 7. Process failed solutions
    if (formData.failedSolutions && formData.failedSolutions.length > 0) {
      const textOnlyFailed: Array<{ name: string; rating: number }> = []
      
      for (const failed of formData.failedSolutions) {
        if (failed.id) {
          // This is an existing solution - create a rating for it
          // First, get its default variant
          const { data: failedVariant } = await supabase
            .from('solution_variants')
            .select('id')
            .eq('solution_id', failed.id)
            .eq('is_default', true)
            .single()
          
          if (failedVariant) {
            // Check if user already rated this failed solution
            const { data: existingFailedRating } = await supabase
              .from('ratings')
              .select('id')
              .eq('user_id', formData.userId)
              .eq('goal_id', formData.goalId)
              .eq('implementation_id', failedVariant.id)
              .single()
            
            if (!existingFailedRating) {
              // Create the failed solution rating
              await supabase
                .from('ratings')
                .insert({
                  user_id: formData.userId,
                  implementation_id: failedVariant.id,
                  goal_id: formData.goalId,
                  solution_id: failed.id,
                  effectiveness_score: failed.rating,
                  is_quick_rating: true
                })
              
              // Update or create the link for this failed solution
              const { data: failedLink } = await supabase
                .from('goal_implementation_links')
                .select('id, avg_effectiveness, rating_count')
                .eq('goal_id', formData.goalId)
                .eq('implementation_id', failedVariant.id)
                .single()
              
              if (failedLink) {
                const newCount = failedLink.rating_count + 1
                const newAvg = ((failedLink.avg_effectiveness * failedLink.rating_count) + failed.rating) / newCount
                
                await supabase
                  .from('goal_implementation_links')
                  .update({
                    avg_effectiveness: newAvg,
                    rating_count: newCount
                  })
                  .eq('id', failedLink.id)
              } else {
                await supabase
                  .from('goal_implementation_links')
                  .insert({
                    goal_id: formData.goalId,
                    implementation_id: failedVariant.id,
                    avg_effectiveness: failed.rating,
                    rating_count: 1
                  })
              }
            }
          }
        } else {
          // No existing solution ID - save as text only
          textOnlyFailed.push({ name: failed.name, rating: failed.rating })
        }
      }
      
      // If we have text-only failed solutions, update the solution_fields
      if (textOnlyFailed.length > 0) {
        const updatedFields = {
          ...formData.solutionFields,
          failed_solutions_text: textOnlyFailed
        }
        
        await supabase
          .from('goal_implementation_links')
          .update({ solution_fields: updatedFields })
          .eq('goal_id', formData.goalId)
          .eq('implementation_id', variantId)
      }
    }
    
    // 8. Get count of other ratings for success message
    const { count: otherRatingsCount } = await supabase
      .from('ratings')
      .select('*', { count: 'exact', head: true })
      .eq('implementation_id', variantId)
      .eq('goal_id', formData.goalId)
      .neq('user_id', formData.userId)
    
    return {
      success: true,
      solutionId: solutionId!,
      variantId: variantId!,
      ratingId: newRating.id,
      otherRatingsCount: otherRatingsCount || 0
    }
    
  } catch (error) {
    console.error('Unexpected error in submitSolution:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}