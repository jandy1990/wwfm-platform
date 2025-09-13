'use server'

import { createServerSupabaseClient } from '@/lib/database/server'
import { solutionAggregator } from '@/lib/services/solution-aggregator'

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
  console.log('[submitSolution] START - Category:', formData.category, 'Solution:', formData.solutionName);
  
  try {
    console.log('[Server] Received submission data:', {
      goalId: formData.goalId,
      userId: formData.userId,
      solutionName: formData.solutionName,
      category: formData.category,
      existingSolutionId: formData.existingSolutionId,
      effectiveness: formData.effectiveness,
      solutionFields: formData.solutionFields
    })
    
    const supabase = await createServerSupabaseClient()
    
    // 1. Verify authentication
    console.log('[submitSolution] Step 1: Checking authentication')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== formData.userId) {
      console.log('[submitSolution] AUTH FAILED - user:', user?.id, 'expected:', formData.userId)
      return { success: false, error: 'Unauthorized: Please sign in to submit a solution' }
    }
    console.log('[submitSolution] Auth successful for user:', user.id)
    
    // 2. Check for duplicate rating first
    console.log('[submitSolution] Step 2: Checking for duplicate rating')
    console.log('[submitSolution] Form data contains existingSolutionId?', !!formData.existingSolutionId, formData.existingSolutionId || 'none')
    let solutionId = formData.existingSolutionId
    let variantId: string | null = null
    
    // If we have an existing solution, check for its variant
    if (solutionId) {
      console.log('[submitSolution] Checking existing solution:', solutionId)
      // Get the default variant for this solution
      const { data: existingVariant, error: variantError } = await supabase
        .from('solution_variants')
        .select('id')
        .eq('solution_id', solutionId)
        .eq('is_default', true)
        .single()
      
      if (variantError) {
        console.log('[submitSolution] Error finding variant:', variantError.message)
      }
      
      if (existingVariant) {
        variantId = existingVariant.id
        console.log('[submitSolution] Found existing variant:', variantId)
        
        // Check for duplicate rating
        const { data: existingRating, error: ratingCheckError } = await supabase
          .from('ratings')
          .select('id')
          .eq('user_id', formData.userId)
          .eq('goal_id', formData.goalId)
          .eq('implementation_id', variantId)
          .single()
        
        if (ratingCheckError && ratingCheckError.code !== 'PGRST116') {
          console.log('[submitSolution] Error checking for duplicate:', ratingCheckError.message)
        }
        
        if (existingRating) {
          console.log('[submitSolution] DUPLICATE FOUND - User already rated this solution for this goal')
          return { 
            success: false, 
            error: "You've already rated this solution for this goal. You can only submit one rating per solution." 
          }
        }
        console.log('[submitSolution] No duplicate rating found, proceeding')
      }
    } else {
      console.log('[submitSolution] No existing solution ID provided')
    }
    
    // 3. Create or reuse solution
    console.log('[submitSolution] Step 3: Create or reuse solution')
    if (!solutionId) {
      console.log('[submitSolution] Creating new solution:', formData.solutionName, 'in category:', formData.category)
      
      // Determine if this is a test solution
      const isTestSolution = formData.solutionName.includes('Test ') || 
                            formData.solutionName.includes('(Test)') ||
                            process.env.NODE_ENV === 'test'
      
      // Create new solution
      const { data: newSolution, error: solutionError } = await supabase
        .from('solutions')
        .insert({
          title: formData.solutionName,
          solution_category: formData.category,
          source_type: isTestSolution ? 'test_fixture' : 'user_generated',
          is_approved: isTestSolution ? true : false // Test solutions are pre-approved
        })
        .select()
        .single()
      
      if (solutionError) {
        console.error('[submitSolution] Error creating solution:', JSON.stringify(solutionError))
        
        // If it's a duplicate error, try to find the existing solution
        if (solutionError.code === '23505' || solutionError.message?.includes('duplicate')) {
          console.log('[submitSolution] Solution already exists, trying to find it')
          
          const { data: existingSolution, error: findError } = await supabase
            .from('solutions')
            .select('id')
            .eq('title', formData.solutionName)
            .eq('solution_category', formData.category)
            .single()
          
          if (existingSolution && !findError) {
            console.log('[submitSolution] Found existing solution:', existingSolution.id)
            solutionId = existingSolution.id
          } else {
            console.error('[submitSolution] Could not find existing solution:', findError)
            return { success: false, error: 'Failed to create or find solution' }
          }
        } else {
          // Some other error
          console.error('[submitSolution] Failed insert data:', {
            title: formData.solutionName,
            solution_category: formData.category,
            source_type: 'user_generated',
            is_approved: false
          })
          return { success: false, error: 'Failed to create solution' }
        }
      } else {
        solutionId = newSolution.id
        console.log('[submitSolution] Created new solution with id:', solutionId)
      }
      console.log('[Server] Created solution with ID:', solutionId)
    } else {
      console.log('[Server] Using existing solution ID:', solutionId)
    }
    
    // 4. Create or find variant
    console.log('[submitSolution] Step 4: Create or find variant')
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
      const { data: existingVariant, error: variantCheckError } = await supabase
        .from('solution_variants')
        .select('id')
        .eq('solution_id', solutionId)
        .eq('variant_name', variantName)
        .single()
      
      // Ignore PGRST116 error (no rows returned)
      if (variantCheckError && variantCheckError.code !== 'PGRST116') {
        console.error('[submitSolution] Error checking for existing variant:', variantCheckError)
      }
      
      if (existingVariant) {
        variantId = existingVariant.id
        console.log('[submitSolution] Found existing variant for name:', variantName, 'id:', variantId)
        
        // Check for duplicate rating with this variant
        const { data: existingRating } = await supabase
          .from('ratings')
          .select('id')
          .eq('user_id', formData.userId)
          .eq('goal_id', formData.goalId)
          .eq('implementation_id', variantId)
          .single()
        
        if (existingRating) {
          console.log('[submitSolution] DUPLICATE FOUND at variant check - User already rated this variant')
          return { 
            success: false, 
            error: "You've already rated this solution variant for this goal." 
          }
        }
        console.log('[submitSolution] No duplicate for this variant, continuing')
      } else {
        // Create new variant
        console.log('[submitSolution] Creating new variant with name:', variantName)
        const variantData: Record<string, unknown> = {
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
          console.error('[submitSolution] Error creating variant:', variantError)
          return { success: false, error: 'Failed to create solution variant' }
        }
        
        variantId = newVariant.id
        console.log('[submitSolution] Created new variant with id:', variantId)
      }
    }
    
    // 5. Create individual rating WITH solution_fields (new architecture)
    console.log('[submitSolution] Step 5: Creating rating with solution_fields')
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
        completion_percentage: 100,
        solution_fields: formData.solutionFields // Store individual user's fields here
      })
      .select()
      .single()
    
    if (ratingError) {
      console.error('[submitSolution] Error creating rating:', ratingError)
      return { success: false, error: 'Failed to save your rating' }
    }
    
    console.log('[submitSolution] Rating created successfully:', { 
      ratingId: newRating?.id,
      variantId,
      goalId: formData.goalId 
    })
    
    // 6. Aggregate ratings and create/update goal_implementation_link
    // The aggregator now handles both link creation and updates
    console.log('[submitSolution] Step 6: Starting aggregation process')
    console.log('[submitSolution] Aggregation params:', { goalId: formData.goalId, variantId })
    
    const maxRetries = 3
    let aggregationSuccess = false
    
    for (let i = 0; i < maxRetries; i++) {
      console.log(`[submitSolution] Aggregation attempt ${i + 1}/${maxRetries}`)
      try {
        // The aggregator will create the link if it doesn't exist, or update if it does
        console.log('[submitSolution] Calling solutionAggregator.updateAggregatesAfterRating')
        await solutionAggregator.updateAggregatesAfterRating(formData.goalId, variantId)
        console.log('[submitSolution] Aggregation call completed without error')
        
        // Verify the aggregation and link creation/update was successful
        const { data: verifyLink, error: verifyError } = await supabase
          .from('goal_implementation_links')
          .select('id, aggregated_fields, rating_count, avg_effectiveness')
          .eq('goal_id', formData.goalId)
          .eq('implementation_id', variantId)
          .single()
        
        if (verifyError) {
          throw new Error(`Verification failed: ${verifyError.message}`)
        }
        
        if (verifyLink) {
          console.log(`[submitSolution] Aggregation successful, link exists with id=${verifyLink.id}`)
          aggregationSuccess = true
          
          // Update the avg_effectiveness and rating_count if needed
          // (The aggregator doesn't update these legacy fields, only aggregated_fields)
          const { data: ratingsCount } = await supabase
            .from('ratings')
            .select('effectiveness', { count: 'exact' })
            .eq('goal_id', formData.goalId)
            .eq('implementation_id', variantId)
          
          if (ratingsCount && ratingsCount.length > 0) {
            const totalEffectiveness = ratingsCount.reduce((sum, r) => sum + (r.effectiveness || 0), 0)
            const avgEffectiveness = totalEffectiveness / ratingsCount.length
            
            await supabase
              .from('goal_implementation_links')
              .update({
                avg_effectiveness: avgEffectiveness,
                rating_count: ratingsCount.length
              })
              .eq('id', verifyLink.id)
            
            // Auto-approve the solution after 3 ratings
            if (ratingsCount.length >= 3) {
              await supabase
                .from('solutions')
                .update({ is_approved: true })
                .eq('id', solutionId)
            }
          }
          
          break
        }
      } catch (error) {
        console.error(`[submitSolution] Aggregation attempt ${i + 1}/${maxRetries} failed:`, error)
        
        if (i < maxRetries - 1) {
          // Wait before retrying with exponential backoff
          await new Promise(r => setTimeout(r, 1000 * (i + 1)))
        } else {
          // Final attempt failed - but don't fail the submission
          console.error('[submitSolution] Failed to aggregate after all retries')
        }
      }
    }
    
    if (!aggregationSuccess) {
      console.warn('[submitSolution] Aggregation failed but rating was saved successfully')
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
      
      // Store text-only failed solutions with the rating
      if (textOnlyFailed.length > 0 && newRating) {
        // Update the rating we just created to include failed solutions text
        await supabase
          .from('ratings')
          .update({ 
            solution_fields: {
              ...formData.solutionFields,
              failed_solutions_text: textOnlyFailed
            }
          })
          .eq('id', newRating.id)
      }
    }
    
    // 8. Get count of other ratings for success message
    const { count: otherRatingsCount } = await supabase
      .from('ratings')
      .select('*', { count: 'exact', head: true })
      .eq('implementation_id', variantId)
      .eq('goal_id', formData.goalId)
      .neq('user_id', formData.userId)
    
    // 8.5 Schedule retrospective for 6 months from now
    if (newRating?.id) {
      console.log('[submitSolution] Scheduling 6-month retrospective')
      
      // Calculate 6 months from now
      const sixMonthsFromNow = new Date()
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)
      
      const { error: scheduleError } = await supabase
        .from('retrospective_schedules')
        .insert({
          user_id: formData.userId,
          rating_id: newRating.id,
          goal_id: formData.goalId,
          solution_id: solutionId,
          schedule_type: '6_month',
          scheduled_date: sixMonthsFromNow.toISOString().split('T')[0], // YYYY-MM-DD format
          status: 'pending',
          opted_in: true,
          preferred_channel: 'in_app'
        })
      
      if (scheduleError) {
        console.error('[submitSolution] Failed to schedule retrospective:', scheduleError)
        // Don't fail the submission over this - retrospective is a nice-to-have
      } else {
        console.log('[submitSolution] Scheduled 6-month retrospective for', sixMonthsFromNow.toISOString().split('T')[0])
      }
    }
    
    // 9. Return success result
    const result = {
      success: true,
      solutionId: solutionId!,
      variantId: variantId!,
      ratingId: newRating?.id,
      otherRatingsCount: otherRatingsCount || 0
    };
    
    console.log('[submitSolution] SUCCESS - Rating created:', newRating?.id, 'for solution:', solutionId);
    return result
    
  } catch (error) {
    console.error('Unexpected error in submitSolution:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}