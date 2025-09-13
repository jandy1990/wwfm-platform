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
import type { 
  DistributionData, 
  DistributionValue,
  AggregatedFields, 
  RatingWithFields,
  AggregatedFieldsMetadata 
} from '@/types/aggregated-fields'

// Re-export types for convenience
export type { DistributionData, AggregatedFields, RatingWithFields }

export class SolutionAggregator {
  /**
   * Compute aggregated fields from all ratings for a goal-implementation combo
   */
  async computeAggregates(
    goalId: string, 
    implementationId: string
  ): Promise<AggregatedFields> {
    const supabase = await createServerSupabaseClient()
    
    // Fetch all ratings with solution_fields for this combo
    const { data: ratings, error } = await supabase
      .from('ratings')
      .select('solution_fields, user_id')
      .eq('goal_id', goalId)
      .eq('implementation_id', implementationId)
    
    if (error || !ratings || ratings.length === 0) {
      return {}
    }
    
    // Determine data source and confidence
    const hasAI = ratings.some(r => r.user_id === 'ai_foundation')
    const userRatings = ratings.filter(r => r.user_id !== 'ai_foundation').length
    
    const aggregated: AggregatedFields = {
      _metadata: {
        computed_at: new Date().toISOString(),
        last_aggregated: new Date().toISOString(),
        total_ratings: ratings.length,
        data_source: hasAI && userRatings > 0 ? 'mixed' : hasAI ? 'ai' : 'user',
        confidence: userRatings >= 10 ? 'high' : userRatings >= 3 ? 'medium' : 'low'
      }
    }
    
    // Aggregate array fields (side_effects, challenges)
    aggregated.side_effects = this.aggregateArrayField(ratings, 'side_effects')
    aggregated.challenges = this.aggregateArrayField(ratings, 'challenges')
    
    // Aggregate cost fields
    aggregated.cost = this.aggregateValueField(ratings, 'cost')
    aggregated.startup_cost = this.aggregateValueField(ratings, 'startup_cost')
    aggregated.ongoing_cost = this.aggregateValueField(ratings, 'ongoing_cost')
    
    // Aggregate brand
    aggregated.brand = this.aggregateValueField(ratings, 'brand')
    
    // Aggregate time to results
    aggregated.time_to_results = this.aggregateValueField(ratings, 'time_to_results')
    
    // Aggregate frequency fields
    aggregated.frequency = this.aggregateValueField(ratings, 'frequency')
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
    ratings: any[], 
    fieldName: string
  ): DistributionData | undefined {
    const valueCounts: Record<string, number> = {}
    let ratingsWithField = 0
    
    // Collect all values from all ratings
    for (const rating of ratings) {
      const fields = rating.solution_fields as Record<string, any>
      if (fields && fields[fieldName] && Array.isArray(fields[fieldName])) {
        ratingsWithField++
        for (const value of fields[fieldName]) {
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
        percentage: Math.round((count / ratingsWithField) * 100)
      }))
      .sort((a, b) => b.count - a.count) // Sort by frequency
    
    // Find mode (most common value)
    const mode = values[0].value
    
    return {
      mode,
      values,
      totalReports: ratingsWithField
    }
  }
  
  /**
   * Aggregate single-value fields into DistributionData format
   */
  private aggregateValueField(
    ratings: any[], 
    fieldName: string
  ): DistributionData | undefined {
    const valueCounts: Record<string, number> = {}
    let ratingsWithField = 0
    
    for (const rating of ratings) {
      const fields = rating.solution_fields as Record<string, any>
      if (fields && fields[fieldName] && fields[fieldName] !== '') {
        ratingsWithField++
        const value = String(fields[fieldName])
        valueCounts[value] = (valueCounts[value] || 0) + 1
      }
    }
    
    if (Object.keys(valueCounts).length === 0) return undefined
    
    // Convert to DistributionValue array
    const values: DistributionValue[] = Object.entries(valueCounts)
      .map(([value, count]) => ({
        value,
        count,
        percentage: Math.round((count / ratingsWithField) * 100)
      }))
      .sort((a, b) => b.count - a.count) // Sort by frequency
    
    // Find mode (most common value)
    const mode = values[0].value
    
    return {
      mode,
      values,
      totalReports: ratingsWithField
    }
  }
  
  /**
   * Aggregate boolean fields into DistributionData format
   */
  private aggregateBooleanField(
    ratings: any[], 
    fieldName: string
  ): DistributionData | undefined {
    const valueCounts: Record<string, number> = { 'true': 0, 'false': 0 }
    let ratingsWithField = 0
    
    for (const rating of ratings) {
      const fields = rating.solution_fields as Record<string, any>
      if (fields && fieldName in fields && fields[fieldName] !== null && fields[fieldName] !== undefined) {
        ratingsWithField++
        const value = String(fields[fieldName])
        valueCounts[value] = (valueCounts[value] || 0) + 1
      }
    }
    
    if (ratingsWithField === 0) return undefined
    
    // Convert to DistributionValue array
    const values: DistributionValue[] = Object.entries(valueCounts)
      .filter(([_, count]) => count > 0)
      .map(([value, count]) => ({
        value,
        count,
        percentage: Math.round((count / ratingsWithField) * 100)
      }))
      .sort((a, b) => b.count - a.count)
    
    // Find mode (most common value)
    const mode = values[0]?.value || 'false'
    
    return {
      mode,
      values,
      totalReports: ratingsWithField
    }
  }
  
  /**
   * Update aggregated fields after a new rating
   */
  async updateAggregatesAfterRating(
    goalId: string,
    implementationId: string
  ): Promise<void> {
    const supabase = await createServerSupabaseClient()
    
    console.log(`[Aggregator] Starting aggregation for goal=${goalId}, implementation=${implementationId}`)
    
    // Compute new aggregates
    const aggregated = await this.computeAggregates(goalId, implementationId)
    console.log(`[Aggregator] Computed aggregates:`, Object.keys(aggregated))
    
    // First check if the link exists
    const { data: existingLink, error: checkError } = await supabase
      .from('goal_implementation_links')
      .select('id')
      .eq('goal_id', goalId)
      .eq('implementation_id', implementationId)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[Aggregator] Error checking for existing link:', checkError)
      throw checkError
    }
    
    if (existingLink) {
      // Update existing link
      console.log(`[Aggregator] Updating existing link ${existingLink.id}`)
      const { error: updateError } = await supabase
        .from('goal_implementation_links')
        .update({ 
          aggregated_fields: aggregated,
          updated_at: new Date().toISOString()
        })
        .eq('goal_id', goalId)
        .eq('implementation_id', implementationId)
      
      if (updateError) {
        console.error('[Aggregator] Error updating aggregated fields:', updateError)
        throw updateError
      }
      console.log('[Aggregator] Successfully updated aggregated fields')
    } else {
      // Create new link with aggregated fields
      console.log('[Aggregator] Creating new link with aggregated fields')
      const { error: insertError } = await supabase
        .from('goal_implementation_links')
        .insert({
          goal_id: goalId,
          implementation_id: implementationId,
          aggregated_fields: aggregated,
          avg_effectiveness: 0, // Will be updated by triggers
          rating_count: 1
        })
      
      if (insertError) {
        console.error('[Aggregator] Error creating link with aggregated fields:', insertError)
        throw insertError
      }
      console.log('[Aggregator] Successfully created new link with aggregated fields')
    }
  }
}

// Export singleton instance
export const solutionAggregator = new SolutionAggregator()