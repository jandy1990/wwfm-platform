'use server'

/**
 * Solution Submission Server Action
 *
 * BUSINESS LOGIC: Solution Approval Process
 * =========================================
 *
 * **Current State (MVP):**
 * - Test solutions: Auto-approved (is_approved = true)
 * - User-generated solutions: Created with is_approved = false
 * - No moderation queue implemented yet (see app/admin/page.tsx line 59)
 *
 * **What This Means:**
 * - Users CAN submit solutions
 * - Solutions are stored in database
 * - BUT: Unapproved solutions are invisible to public (filtered by RLS)
 * - Approval workflow: Coming Soon™
 *
 * **Future Approval Workflow (Planned):**
 * - Admin moderation queue will show pending solutions
 * - Admins can approve/reject with reasons
 * - Approved solutions become visible to all users
 * - Rejected solutions notify submitter
 *
 * **Why Not Auto-Approve?**
 * - Quality control: Prevent spam, inappropriate, or low-quality solutions
 * - Specificity enforcement: Must pass "Friend Test"
 * - Data integrity: Ensure solutions match categories
 *
 * ============================================
 * BUSINESS LOGIC: Solution Quality Standards
 * ============================================
 *
 * **The "Friend Test":**
 * A solution must be specific enough that if you told a friend, they'd know exactly what to do.
 *
 * **Examples:**
 * ❌ "Meditation app" → Friend asks "Which one?"
 * ✅ "Headspace" → Friend can download it
 * ❌ "Vitamin D supplement" → Friend asks "What brand? What dose?"
 * ✅ "Nature's Bounty Vitamin D3" → Friend can buy it (dose is variant: 1000 IU)
 *
 * **Attribution Pattern (from AI generator prompts):**
 * Solutions must follow:
 * - "Source's Method" (e.g., "Dr. Weil's 4-7-8 breathing")
 * - "Method by Source" (e.g., "Pomodoro Technique by Francesco Cirillo")
 * - "Organization Program" (e.g., "AA's 12-step program")
 * - "Company Product" (e.g., "Headspace's anxiety pack")
 *
 * **UNACCEPTABLE (will be rejected):**
 * ❌ "Meditation" → Must be "Transcendental Meditation by Maharishi"
 * ❌ "Exercise program" → Must be "StrongLifts 5x5 by Mehdi"
 * ❌ "Support group" → Must be "SMART Recovery meetings"
 * ❌ "Breathing technique" → Must be "Wim Hof Method"
 * ❌ "Therapy" → Must be "Beck's Cognitive Therapy"
 *
 * **Why This Matters:**
 * - Trackable: Can measure effectiveness of specific solution
 * - Actionable: Users know exactly what to try next
 * - Comparable: Can compare "Headspace" vs "Calm" effectiveness
 * - Preventable: Stops spam like "just try anything" advice
 *
 * See also:
 * - app/admin/page.tsx - Admin dashboard (approval UI pending)
 * - scripts/archive/legacy-ai-solution-generator-20250927/ai-solution-generator/prompts/master-prompts.ts
 *   (lines 91-115 encode this logic for AI generation)
 * - Database RLS policies - Filter by is_approved for public queries
 */

import { createServerSupabaseClient } from '@/lib/database/server'
import { solutionAggregator } from '@/lib/services/solution-aggregator'
import { validateAndNormalizeSolutionFields } from '@/lib/solutions/solution-field-validator'
import { logger } from '@/lib/utils/logger'
import type { Tables, TablesInsert } from '@/types/supabase'

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

  [key: string]: unknown
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
  transitioned?: boolean
  transitionMessage?: string
  projectedEffectiveness?: number  // Immediate human effectiveness for UI
}

// Categories that use dosage variants (beauty_skincare uses Standard)
const DOSAGE_CATEGORIES = ['medications', 'supplements_vitamins', 'natural_remedies']

type SolutionRow = Tables<'solutions'>
type SolutionVariantRow = Tables<'solution_variants'>
type RatingRow = Tables<'ratings'>
type GoalImplementationLinkRow = Tables<'goal_implementation_links'>

const toSolutionFieldsJson = (
  value: Record<string, unknown>
): TablesInsert<'ratings'>['solution_fields'] => value as TablesInsert<'ratings'>['solution_fields']

export async function submitSolution(formData: SubmitSolutionData): Promise<SubmitSolutionResult> {
  logger.info('submitSolution started', {
    category: formData.category,
    solutionName: formData.solutionName
  })
  
  try {
    logger.debug('submitSolution payload received', {
      goalId: formData.goalId,
      userId: formData.userId,
      existingSolutionId: formData.existingSolutionId,
      effectiveness: formData.effectiveness,
      fieldsCount: Object.keys(formData.solutionFields || {}).length
    })

    const { isValid: fieldsValid, errors: fieldErrors, normalizedFields } =
      validateAndNormalizeSolutionFields(formData.category, formData.solutionFields, { allowPartial: true })

    if (!fieldsValid) {
      logger.warn('submitSolution validation failed', { fieldErrors })
      return { success: false, error: `Invalid field data: ${fieldErrors.join('; ')}` }
    }

    const normalizedSolutionFields = normalizedFields
    
    const supabase = await createServerSupabaseClient()
    
    // 1. Verify authentication
    logger.debug('submitSolution authentication step')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== formData.userId) {
      logger.warn('submitSolution auth failed', { userIdExpected: formData.userId, userIdActual: user?.id })
      return { success: false, error: 'Unauthorized: Please sign in to submit a solution' }
    }
    logger.debug('submitSolution auth success', { userId: user.id })
    
    // 2. Check for duplicate rating first
    logger.debug('submitSolution duplicate-check step', { existingSolutionId: formData.existingSolutionId })
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
        .maybeSingle<Pick<SolutionVariantRow, 'id'>>()
      
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
          .maybeSingle<Pick<RatingRow, 'id'>>()
        
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
          is_approved: isTestSolution ? true : false, // Test solutions are pre-approved
          created_by: user.id // Required by RLS policy
        })
        .select()
        .single<SolutionRow>()
      
      if (solutionError) {
      logger.error('submitSolution error creating solution', {
        error: solutionError,
        solutionName: formData.solutionName,
        category: formData.category
      })
        
        // If it's a duplicate error, try to find the existing solution
        if (solutionError.code === '23505' || solutionError.message?.includes('duplicate')) {
          console.log('[submitSolution] Solution already exists, trying to find it')
          
          const { data: existingSolution, error: findError } = await supabase
            .from('solutions')
            .select('id')
            .eq('title', formData.solutionName)
            .eq('solution_category', formData.category)
            .maybeSingle<Pick<SolutionRow, 'id'>>()
          
          if (existingSolution && !findError) {
            console.log('[submitSolution] Found existing solution:', existingSolution.id)
            solutionId = existingSolution.id
          } else {
            logger.error('submitSolution: could not find existing solution after duplicate', { error: findError })
            return { success: false, error: 'Failed to create or find solution' }
          }
        } else {
          // Some other error
          logger.error('submitSolution: failed solution insert', {
            payload: {
              title: formData.solutionName,
              solution_category: formData.category,
              source_type: 'user_generated',
              is_approved: false
            },
            error: solutionError
          })
          return { success: false, error: 'Failed to create solution' }
        }
      } else {
        solutionId = newSolution.id
        logger.info('submitSolution created new solution', { solutionId })
      }
      logger.debug('submitSolution using solution id', { solutionId })
    } else {
      logger.debug('submitSolution using existing solution id', { solutionId })
    }
    
    // 4. Create or find variant
    logger.debug('submitSolution create-or-find variant start')
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
        logger.error('submitSolution: error checking existing variant', { error: variantCheckError })
      }
      
      if (existingVariant) {
        variantId = existingVariant.id
        logger.debug('submitSolution found existing variant', { variantName, variantId })
        
        // Check for duplicate rating with this variant
        const { data: existingRating } = await supabase
          .from('ratings')
          .select('id')
          .eq('user_id', formData.userId)
          .eq('goal_id', formData.goalId)
          .eq('implementation_id', variantId)
          .single()
        
        if (existingRating) {
          logger.info('submitSolution duplicate rating at variant stage', { userId: formData.userId, goalId: formData.goalId, variantId })
          return { 
            success: false, 
            error: "You've already rated this solution variant for this goal." 
          }
        }
        logger.debug('submitSolution no variant duplicate, continuing')
      } else {
        // Create new variant
        logger.debug('submitSolution creating new variant', { variantName })
        const variantInsert: TablesInsert<'solution_variants'> = {
          solution_id: solutionId,
          variant_name: variantName,
          is_default: true,
          display_order: 1
        }

        if (isDosageCategory && formData.variantData) {
          variantInsert.amount = formData.variantData.amount ?? null
          variantInsert.unit = formData.variantData.unit ?? null
          variantInsert.form = formData.variantData.form ?? null
        }

        const { data: newVariant, error: variantError } = await supabase
          .from('solution_variants')
          .insert(variantInsert)
          .select()
          .single<SolutionVariantRow>()
        
        if (variantError) {
          logger.error('submitSolution: error creating variant', { error: variantError })
          return { success: false, error: 'Failed to create solution variant' }
        }
        
        variantId = newVariant.id
        console.log('[submitSolution] Created new variant with id:', variantId)
      }
    }
    
    // 5. Create individual rating WITH solution_fields (new architecture)
    console.log('[submitSolution] Step 5: Creating rating with solution_fields')
    const sideEffectsValue = normalizedSolutionFields.side_effects
    const lengthOfUseValue = normalizedSolutionFields.length_of_use

    const ratingInsert: TablesInsert<'ratings'> = {
      user_id: formData.userId,
      implementation_id: variantId,
      goal_id: formData.goalId,
      solution_id: solutionId,
      effectiveness_score: formData.effectiveness,
      is_quick_rating: false,
      duration_used: typeof lengthOfUseValue === 'string' ? lengthOfUseValue : null,
      side_effects: Array.isArray(sideEffectsValue)
        ? sideEffectsValue.join(', ')
        : typeof sideEffectsValue === 'string'
          ? sideEffectsValue
          : null,
      completion_percentage: 100,
      solution_fields: toSolutionFieldsJson(normalizedSolutionFields)
    }

    const { data: newRating, error: ratingError } = await supabase
      .from('ratings')
      .insert(ratingInsert)
      .select()
      .single<RatingRow>()
    
    if (ratingError) {
      logger.error('submitSolution: error creating rating', { error: ratingError })
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
      const aggregationStartTime = Date.now()
      console.log(`[submitSolution] Aggregation attempt ${i + 1}/${maxRetries}`)
      try {
        // The aggregator will create the link if it doesn't exist, or update if it does
        console.log('[submitSolution] Calling solutionAggregator.updateAggregatesAfterRating')
        await solutionAggregator.updateAggregatesAfterRating(formData.goalId, variantId)
        const aggregationDuration = Date.now() - aggregationStartTime
        console.log(`[submitSolution] Aggregation call completed without error in ${aggregationDuration}ms`)
        
        // Verify the aggregation and link creation/update was successful
        const { data: verifyLink, error: verifyError } = await supabase
          .from('goal_implementation_links')
          .select('id, aggregated_fields, rating_count, avg_effectiveness')
          .eq('goal_id', formData.goalId)
          .eq('implementation_id', variantId)
          .maybeSingle<
            Pick<
              GoalImplementationLinkRow,
              'id' | 'aggregated_fields' | 'rating_count' | 'avg_effectiveness'
            >
          >()
        
        if (verifyError) {
          throw new Error(`Verification failed: ${verifyError.message}`)
        }
        
        if (verifyLink) {
          const totalDuration = Date.now() - aggregationStartTime
          console.log(`[submitSolution] Aggregation successful in ${totalDuration}ms, link exists with id=${verifyLink.id}`)
          aggregationSuccess = true
          
          // Update the avg_effectiveness and rating_count if needed
          // (The aggregator doesn't update these legacy fields, only aggregated_fields)
          const { data: ratingsCount } = await supabase
            .from('ratings')
            .select('effectiveness_score', { count: 'exact' })
            .eq('goal_id', formData.goalId)
            .eq('implementation_id', variantId)
            .returns<Pick<RatingRow, 'effectiveness_score'>[] | null>()
          
          const ratingRows = ratingsCount ?? []

          if (ratingRows.length > 0) {
            const totalEffectiveness = ratingRows.reduce(
              (sum, row) => sum + (row.effectiveness_score ?? 0),
              0
            )
            const avgEffectiveness = totalEffectiveness / ratingRows.length
            
            await supabase
              .from('goal_implementation_links')
              .update({
                avg_effectiveness: avgEffectiveness,
                rating_count: ratingRows.length
              })
              .eq('id', verifyLink.id)
            
            // Auto-approve the solution after 3 ratings
            if (ratingRows.length >= 3) {
              await supabase
                .from('solutions')
                .update({ is_approved: true })
                .eq('id', solutionId)
            }
          }
          
          break
        }
      } catch (error) {
        const errorDuration = Date.now() - aggregationStartTime
        logger.error('submitSolution aggregation attempt failed', {
          attempt: i + 1,
          maxRetries,
          duration: errorDuration,
          error
        })
        
        if (i < maxRetries - 1) {
          // Wait before retrying with exponential backoff
          await new Promise(r => setTimeout(r, 1000 * (i + 1)))
        } else {
          // Final attempt failed - but don't fail the submission
          logger.error('submitSolution aggregation failed after max retries', {
            goalId: formData.goalId,
            implementationId: variantId
          })
        }
      }
    }
    
    if (!aggregationSuccess) {
      logger.warn('submitSolution aggregation failed but rating saved', {
        goalId: formData.goalId,
        implementationId: variantId
      })
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
            .maybeSingle<Pick<SolutionVariantRow, 'id'>>()
          
          if (failedVariant) {
            // Check if user already rated this failed solution
            const { data: existingFailedRating } = await supabase
              .from('ratings')
              .select('id')
              .eq('user_id', formData.userId)
              .eq('goal_id', formData.goalId)
              .eq('implementation_id', failedVariant.id)
              .maybeSingle<Pick<RatingRow, 'id'>>()
            
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
                .maybeSingle<
                  Pick<
                    GoalImplementationLinkRow,
                    'id' | 'avg_effectiveness' | 'rating_count'
                  >
                >()
              
              if (failedLink) {
                const currentCount = failedLink.rating_count ?? 0
                const currentAverage = failedLink.avg_effectiveness ?? 0
                const newCount = currentCount + 1
                const newAvg = ((currentAverage * currentCount) + failed.rating) / newCount
                
                await supabase
                  .from('goal_implementation_links')
                  .update({
                    avg_effectiveness: newAvg,
                    rating_count: newCount
                  })
                  .eq('id', failedLink.id)
              } else {
                const failedLinkInsert: TablesInsert<'goal_implementation_links'> = {
                  goal_id: formData.goalId,
                  implementation_id: failedVariant.id,
                  avg_effectiveness: failed.rating,
                  rating_count: 1
                }

                await supabase
                  .from('goal_implementation_links')
                  .insert(failedLinkInsert)
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
        const mergedFields: Record<string, unknown> = {
          ...normalizedSolutionFields,
          failed_solutions_text: textOnlyFailed
        }

        await supabase
          .from('ratings')
          .update({ 
            solution_fields: toSolutionFieldsJson(mergedFields)
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
        logger.error('submitSolution failed to schedule retrospective', { error: scheduleError })
        // Don't fail the submission over this - retrospective is a nice-to-have
      } else {
        console.log('[submitSolution] Scheduled 6-month retrospective for', sixMonthsFromNow.toISOString().split('T')[0])
      }
    }

    // 8.75 Check if this rating triggers a transition to human data
    let transitioned = false
    let transitionMessage = ''
    let projectedEffectiveness: number | undefined

    try {
      console.log('[submitSolution] Checking for AI to human transition')
      const { data: transitionResult } = await supabase.rpc('check_and_execute_transition', {
        p_goal_id: formData.goalId,
        p_implementation_id: variantId
      })

      if (transitionResult) {
        transitioned = true
        transitionMessage = '🎉 You unlocked community verification for this solution!'
        console.log('[submitSolution] TRANSITION OCCURRED - AI to human data switch completed')

        // Calculate immediate human effectiveness to prevent lag window
        const { data: humanRatings } = await supabase
          .from('ratings')
          .select('effectiveness_score')
          .eq('goal_id', formData.goalId)
          .eq('implementation_id', variantId)
          .eq('data_source', 'human')
          .not('effectiveness_score', 'is', null)
          .returns<Pick<RatingRow, 'effectiveness_score'>[] | null>()

        const humanRatingRows = humanRatings ?? []

        if (humanRatingRows.length > 0) {
          const total = humanRatingRows.reduce(
            (sum, rating) => sum + (rating.effectiveness_score ?? 0),
            0
          )
          projectedEffectiveness = total / humanRatingRows.length
          console.log(
            `[submitSolution] Calculated immediate human effectiveness: ${projectedEffectiveness} from ${humanRatingRows.length} human ratings`
          )
        }
      }
    } catch (transitionError) {
      logger.warn('submitSolution transition check failed (non-fatal)', { error: transitionError })
      // Don't fail the submission over transition issues
    }

    // 9. Return success result
    const result = {
      success: true,
      solutionId: solutionId!,
      variantId: variantId!,
      ratingId: newRating?.id,
      otherRatingsCount: otherRatingsCount || 0,
      transitioned,
      transitionMessage: transitioned ? transitionMessage : undefined,
      projectedEffectiveness
    };
    
    logger.debug('submitSolution success', {
      ratingId: newRating?.id,
      solutionId,
      transitioned,
      projectedEffectiveness
    })
    return result
    
  } catch (error) {
    logger.error('submitSolution unexpected error', error instanceof Error ? error : { error })
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}
