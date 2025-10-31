/**
 * Solution Field Aggregation Service
 * 
 * Computes statistical aggregates from individual user ratings
 * Part of the "Both" architecture - stores individual data, shows aggregates
 * 
 * Output format aligned with display layer expectations (DistributionData)
 * No transformation needed - aggregator outputs display-ready format
 */

import { createServerSupabaseClient } from '@/lib/database/server'
import { logger } from '@/lib/utils/logger'
import type {
  DistributionData,
  DistributionValue,
  AggregatedFields
} from '@/types/aggregated-fields'
import type { TablesInsert, TablesUpdate } from '@/types/supabase'

type SolutionFieldRecord = Record<string, unknown>

interface HumanRatingRow {
  solution_fields: SolutionFieldRecord | null
}

// Re-export types for convenience
export type { DistributionData, AggregatedFields }

export class SolutionAggregator {
  /**
   * Compute aggregated fields from all ratings for a goal-implementation combo
   */
  async computeAggregates(
    goalId: string, 
    implementationId: string
  ): Promise<AggregatedFields> {
    const supabase = await createServerSupabaseClient()
    
    // Fetch only HUMAN ratings with solution_fields for this combo
    const { data, error } = await supabase
      .from('ratings')
      .select('solution_fields')
      .eq('goal_id', goalId)
      .eq('implementation_id', implementationId)
      .eq('data_source', 'human')  // Only human ratings for aggregation

    if (error || !data || data.length === 0) {
      return {}
    }

    const ratings: HumanRatingRow[] = data.map(row => ({
      solution_fields: (row as HumanRatingRow).solution_fields ?? null
    }))
    
    // Since we only fetch human ratings, all data is from users
    const userRatings = ratings.length

    const aggregated: AggregatedFields = {
      _metadata: {
        computed_at: new Date().toISOString(),
        last_aggregated: new Date().toISOString(),
        total_ratings: userRatings,
        data_source: 'user',  // Only human ratings in this aggregation
        confidence: userRatings >= 10 ? 'high' : userRatings >= 3 ? 'medium' : 'low'
      }
    }
    
    // Aggregate array fields (side_effects, challenges)
    aggregated.side_effects = this.aggregateArrayField(ratings, 'side_effects')
    aggregated.challenges = this.aggregateArrayField(ratings, 'challenges')
    
    // Aggregate cost fields
    aggregated.cost = this.aggregateValueField(ratings, 'cost')
    aggregated.cost_type = this.aggregateValueField(ratings, 'cost_type')
    aggregated.startup_cost = this.aggregateValueField(ratings, 'startup_cost')
    aggregated.ongoing_cost = this.aggregateValueField(ratings, 'ongoing_cost')

    // Aggregate brand
    aggregated.brand = this.aggregateValueField(ratings, 'brand')
    
    // Aggregate time to results
    aggregated.time_to_results = this.aggregateValueField(ratings, 'time_to_results')
    
    // Aggregate frequency fields
    aggregated.frequency = this.aggregateValueField(ratings, 'frequency')
    aggregated.skincare_frequency = this.aggregateValueField(ratings, 'skincare_frequency')
    aggregated.session_frequency = this.aggregateValueField(ratings, 'session_frequency')
    
    // Aggregate length fields
    aggregated.length_of_use = this.aggregateValueField(ratings, 'length_of_use')
    aggregated.practice_length = this.aggregateValueField(ratings, 'practice_length')
    aggregated.session_length = this.aggregateValueField(ratings, 'session_length')
    
    // Aggregate other common fields
    aggregated.time_commitment = this.aggregateValueField(ratings, 'time_commitment')
    aggregated.wait_time = this.aggregateValueField(ratings, 'wait_time')
    aggregated.insurance_coverage = this.aggregateValueField(ratings, 'insurance_coverage')
    aggregated.format = this.aggregateValueField(ratings, 'format')
    
    // PHASE 1 FIX: Add missing field aggregations
    
    // DosageForm fields (using new naming convention)
    aggregated.dosage_amount = this.aggregateValueField(ratings, 'dosage_amount')
    aggregated.dosage_unit = this.aggregateValueField(ratings, 'dosage_unit')
    
    // AppForm fields
    aggregated.usage_frequency = this.aggregateValueField(ratings, 'usage_frequency')
    aggregated.subscription_type = this.aggregateValueField(ratings, 'subscription_type')
    aggregated.platform = this.aggregateValueField(ratings, 'platform')
    
    // PracticeForm fields
    aggregated.duration = this.aggregateValueField(ratings, 'duration')
    aggregated.best_time = this.aggregateValueField(ratings, 'best_time')
    aggregated.location = this.aggregateValueField(ratings, 'location')
    
    // LifestyleForm fields
    aggregated.weekly_prep_time = this.aggregateValueField(ratings, 'weekly_prep_time')
    aggregated.previous_sleep_hours = this.aggregateValueField(ratings, 'previous_sleep_hours')
    aggregated.still_following = this.aggregateBooleanField(ratings, 'still_following')
    aggregated.sustainability_reason = this.aggregateValueField(ratings, 'sustainability_reason')
    aggregated.social_impact = this.aggregateValueField(ratings, 'social_impact')
    aggregated.sleep_quality_change = this.aggregateValueField(ratings, 'sleep_quality_change')
    aggregated.specific_approach = this.aggregateValueField(ratings, 'specific_approach')
    aggregated.cost_impact = this.aggregateValueField(ratings, 'cost_impact')
    
    // PurchaseForm fields
    aggregated.purchase_cost_type = this.aggregateValueField(ratings, 'purchase_cost_type')
    aggregated.cost_range = this.aggregateValueField(ratings, 'cost_range')
    aggregated.product_type = this.aggregateValueField(ratings, 'product_type')
    aggregated.ease_of_use = this.aggregateValueField(ratings, 'ease_of_use')
    // Note: 'format' already aggregated above
    aggregated.learning_difficulty = this.aggregateValueField(ratings, 'learning_difficulty')
    aggregated.completion_status = this.aggregateValueField(ratings, 'completion_status')
    
    // CommunityForm fields
    aggregated.meeting_frequency = this.aggregateValueField(ratings, 'meeting_frequency')
    aggregated.group_size = this.aggregateValueField(ratings, 'group_size')
    aggregated.payment_frequency = this.aggregateValueField(ratings, 'payment_frequency')
    aggregated.commitment_type = this.aggregateValueField(ratings, 'commitment_type')
    aggregated.accessibility_level = this.aggregateValueField(ratings, 'accessibility_level')
    aggregated.leadership_style = this.aggregateValueField(ratings, 'leadership_style')
    
    // FinancialForm fields
    aggregated.financial_benefit = this.aggregateValueField(ratings, 'financial_benefit')
    aggregated.access_time = this.aggregateValueField(ratings, 'access_time')
    aggregated.provider = this.aggregateValueField(ratings, 'provider')
    aggregated.minimum_requirements = this.aggregateArrayField(ratings, 'minimum_requirements')
    // Note: ease_of_use already added for PurchaseForm, shared field
    
    // Additional fields found during audit
    aggregated.specialty = this.aggregateValueField(ratings, 'specialty')
    aggregated.response_time = this.aggregateValueField(ratings, 'response_time')
    aggregated.completed_treatment = this.aggregateValueField(ratings, 'completed_treatment')
    aggregated.typical_length = this.aggregateValueField(ratings, 'typical_length')
    aggregated.availability = this.aggregateArrayField(ratings, 'availability')
    aggregated.notes = this.aggregateValueField(ratings, 'notes')
    
    return aggregated
  }
  
  /**
   * Aggregate array fields into DistributionData format
   */
  private aggregateArrayField(
    ratings: ReadonlyArray<HumanRatingRow>,
    fieldName: string
  ): DistributionData | undefined {
    const valueCounts: Record<string, number> = {}
    let ratingsWithField = 0

    // Collect all values from all ratings
    for (const rating of ratings) {
      const fields = this.ensureSolutionFields(rating)
      const fieldValue = fields?.[fieldName]
      if (Array.isArray(fieldValue)) {
        const normalizedValues = fieldValue
          .map((value) => (typeof value === 'string' ? value.trim() : null))
          .filter((value): value is string => Boolean(value && value.length > 0))

        if (normalizedValues.length === 0) continue
        ratingsWithField++
        for (const value of normalizedValues) {
          valueCounts[value] = (valueCounts[value] || 0) + 1
        }
      }
    }
    
    if (Object.keys(valueCounts).length === 0) return undefined

    // Convert to DistributionValue array
    const values: DistributionValue[] = Object.entries(valueCounts)
      .map(([value, count]) => ({
        value,
        count,
        percentage: Math.round((count / ratingsWithField) * 100),
        source: 'user_submission'
      }))
      .sort((a, b) => b.count - a.count) // Sort by frequency

    // Find mode (most common value)
    const mode = values[0].value

    return {
      mode,
      values,
      totalReports: ratingsWithField,
      dataSource: 'user_submission'
    }
  }

  /**
   * Aggregate single-value fields into DistributionData format
   */
  private aggregateValueField(
    ratings: ReadonlyArray<HumanRatingRow>,
    fieldName: string
  ): DistributionData | undefined {
    const valueCounts: Record<string, number> = {}
    let ratingsWithField = 0

    for (const rating of ratings) {
      const fields = this.ensureSolutionFields(rating)
      const fieldValue = fields?.[fieldName]
      const normalizedValue = this.normaliseToString(fieldValue)
      if (normalizedValue) {
        ratingsWithField++
        valueCounts[normalizedValue] = (valueCounts[normalizedValue] || 0) + 1
      }
    }

    if (Object.keys(valueCounts).length === 0) return undefined

    // Convert to DistributionValue array
    const values: DistributionValue[] = Object.entries(valueCounts)
      .map(([value, count]) => ({
        value,
        count,
        percentage: Math.round((count / ratingsWithField) * 100),
        source: 'user_submission'
      }))
      .sort((a, b) => b.count - a.count) // Sort by frequency

    // Find mode (most common value)
    const mode = values[0].value

    return {
      mode,
      values,
      totalReports: ratingsWithField,
      dataSource: 'user_submission'
    }
  }

  /**
   * Aggregate boolean fields into DistributionData format
   */
  private aggregateBooleanField(
    ratings: ReadonlyArray<HumanRatingRow>,
    fieldName: string
  ): DistributionData | undefined {
    const valueCounts: Record<string, number> = { 'true': 0, 'false': 0 }
    let ratingsWithField = 0

    for (const rating of ratings) {
      const fields = this.ensureSolutionFields(rating)
      if (fields && fieldName in fields) {
        const rawValue = fields[fieldName]
        const booleanValue = this.normaliseToBoolean(rawValue)
        if (booleanValue === null) {
          continue
        }
        ratingsWithField++
        const key = booleanValue ? 'true' : 'false'
        valueCounts[key] = (valueCounts[key] || 0) + 1
      }
    }

    if (ratingsWithField === 0) return undefined

    // Convert to DistributionValue array
    const values: DistributionValue[] = Object.entries(valueCounts)
      .filter(([_, count]) => count > 0)
      .map(([value, count]) => ({
        value,
        count,
        percentage: Math.round((count / ratingsWithField) * 100),
        source: 'user_submission'
      }))
      .sort((a, b) => b.count - a.count)

    // Find mode (most common value)
    const mode = values[0]?.value || 'false'

    return {
      mode,
      values,
      totalReports: ratingsWithField,
      dataSource: 'user_submission'
    }
  }
  
  /**
   * Update aggregated fields after a new rating
   */
  async updateAggregatesAfterRating(
    goalId: string,
    implementationId: string
  ): Promise<void> {
    const startTime = Date.now()
    const supabase = await createServerSupabaseClient()

    logger.info('solutionAggregator start', { goalId, implementationId, timestamp: startTime })

    // PROTECTION: Check display mode - don't overwrite AI data until transition
    const { data: linkCheck } = await supabase
      .from('goal_implementation_links')
      .select('data_display_mode, ai_snapshot')
      .eq('goal_id', goalId)
      .eq('implementation_id', implementationId)
      .single()

    if (linkCheck?.data_display_mode === 'ai' && linkCheck?.ai_snapshot) {
      logger.info('solutionAggregator skipped aggregation (AI data preserved)', { goalId, implementationId, elapsed: Date.now() - startTime })
      return
    }

    logger.info('solutionAggregator displayModeChecked', { elapsed: Date.now() - startTime })

    // Compute new aggregates
    const aggregated = await this.computeAggregates(goalId, implementationId)
    logger.info('solutionAggregator computeComplete', { elapsed: Date.now() - startTime, fieldCount: Object.keys(aggregated).length })
    if (Object.keys(aggregated).length === 0) {
      logger.info('solutionAggregator no human ratings, skipping aggregation update', { goalId, implementationId })
      await supabase
        .from('goal_implementation_links')
        .update({
          needs_aggregation: false,
          updated_at: new Date().toISOString()
        })
        .eq('goal_id', goalId)
        .eq('implementation_id', implementationId)
      return
    }

    logger.info('solutionAggregator computed aggregates', { goalId, implementationId, fields: Object.keys(aggregated) })

    logger.info('solutionAggregator linkCheckStart', { elapsed: Date.now() - startTime })

    // First check if the link exists
    const { data: existingLink, error: checkError } = await supabase
      .from('goal_implementation_links')
      .select('id')
      .eq('goal_id', goalId)
      .eq('implementation_id', implementationId)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      logger.error('solutionAggregator error checking existing link', { error: checkError, goalId, implementationId })
      throw checkError
    }
    
    if (existingLink) {
      // Update existing link
      logger.info('solutionAggregator updating existing link', { linkId: existingLink.id, goalId, implementationId, elapsed: Date.now() - startTime })
      const updatePayload: TablesUpdate<'goal_implementation_links'> = {
        aggregated_fields: aggregated as TablesUpdate<'goal_implementation_links'>['aggregated_fields'],
        updated_at: new Date().toISOString(),
        needs_aggregation: false
      }

      const { error: updateError } = await supabase
        .from('goal_implementation_links')
        .update(updatePayload)
        .eq('goal_id', goalId)
        .eq('implementation_id', implementationId)
      
      if (updateError) {
        logger.error('solutionAggregator error updating aggregated fields', { error: updateError, goalId, implementationId, elapsed: Date.now() - startTime })
        throw updateError
      }
      logger.info('solutionAggregator updated aggregated fields', { goalId, implementationId, totalTime: Date.now() - startTime })
    } else {
      // Create new link with aggregated fields
      logger.info('solutionAggregator creating new link with aggregated fields', { goalId, implementationId, elapsed: Date.now() - startTime })
      const insertPayload: TablesInsert<'goal_implementation_links'> = {
        goal_id: goalId,
        implementation_id: implementationId,
        aggregated_fields: aggregated as TablesInsert<'goal_implementation_links'>['aggregated_fields'],
        avg_effectiveness: 0,
        rating_count: 1,
        needs_aggregation: false
      }

      const { error: insertError } = await supabase
        .from('goal_implementation_links')
        .insert(insertPayload)
      
      if (insertError) {
        logger.error('solutionAggregator error creating link with aggregated fields', { error: insertError, goalId, implementationId, elapsed: Date.now() - startTime })
        throw insertError
      }
      logger.info('solutionAggregator created new link with aggregated fields', { goalId, implementationId, totalTime: Date.now() - startTime })
    }
  }

  private ensureSolutionFields(rating: HumanRatingRow): SolutionFieldRecord | null {
    if (!rating.solution_fields || typeof rating.solution_fields !== 'object') {
      return null
    }
    return rating.solution_fields
  }

  private normaliseToString(value: unknown): string | null {
    if (typeof value === 'string') {
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : null
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }

    return null
  }

  private normaliseToBoolean(value: unknown): boolean | null {
    if (typeof value === 'boolean') {
      return value
    }

    if (typeof value === 'string') {
      const trimmed = value.trim().toLowerCase()
      if (trimmed === 'true') return true
      if (trimmed === 'false') return false
    }

    return null
  }
}

// Export singleton instance
export const solutionAggregator = new SolutionAggregator()
