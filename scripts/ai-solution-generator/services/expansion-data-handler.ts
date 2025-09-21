/**
 * Expansion Data Handler
 *
 * Handles the complex data structures for goal_implementation_links
 * when creating new solution-to-goal connections.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { mapAllFieldsToDropdowns } from '../utils/value-mapper'
import { CATEGORY_FIELDS } from '../config/category-fields'
import chalk from 'chalk'

export interface ExpandedGoalLink {
  goal_id: string
  goal_title: string
  implementation_id: string // This is the variant ID
  effectiveness: number
  effectiveness_rationale: string
  goal_specific_adaptation: string
  solution_fields: Record<string, any>
  aggregated_fields: Record<string, any>
}

export interface SolutionVariantInfo {
  variant_id: string
  solution_id: string
  solution_title: string
  solution_category: string
  amount?: number
  unit?: string
  form?: string
}

export class ExpansionDataHandler {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get solution variant information needed for creating links
   */
  async getSolutionVariantInfo(solutionId: string): Promise<SolutionVariantInfo | null> {
    const { data, error } = await this.supabase
      .from('solution_variants')
      .select(`
        id,
        solution_id,
        amount,
        unit,
        form,
        solutions(title, solution_category)
      `)
      .eq('solution_id', solutionId)
      .limit(1)
      .single()

    if (error) {
      console.error(`Error fetching variant for solution ${solutionId}:`, error)
      return null
    }

    if (!data || !data.solutions) {
      console.error(`No variant found for solution ${solutionId}`)
      return null
    }

    return {
      variant_id: data.id,
      solution_id: data.solution_id,
      solution_title: data.solutions.title,
      solution_category: data.solutions.solution_category,
      amount: data.amount,
      unit: data.unit,
      form: data.form
    }
  }

  /**
   * Get existing goal link data to use as template
   */
  async getExistingGoalLinkTemplate(variantId: string): Promise<ExpandedGoalLink | null> {
    const { data, error } = await this.supabase
      .from('goal_implementation_links')
      .select(`
        goal_id,
        avg_effectiveness,
        solution_fields,
        aggregated_fields,
        goals(title)
      `)
      .eq('implementation_id', variantId)
      .limit(1)
      .single()

    if (error || !data) {
      console.log(chalk.yellow(`   No existing template found for variant ${variantId}`))
      return null
    }

    return {
      goal_id: data.goal_id,
      goal_title: data.goals?.title || 'Unknown',
      implementation_id: variantId,
      effectiveness: parseFloat(data.avg_effectiveness) || 4.0,
      effectiveness_rationale: 'Template from existing connection',
      goal_specific_adaptation: 'Based on existing application',
      solution_fields: data.solution_fields || {},
      aggregated_fields: data.aggregated_fields || {}
    }
  }

  /**
   * Create aggregated fields structure from solution fields
   */
  createAggregatedFields(
    solutionFields: Record<string, any>,
    solutionCategory: string,
    metadata: {
      sourceSolution: string
      sourceGoal: string
      targetGoal: string
    }
  ): Record<string, any> {
    const aggregatedFields: Record<string, any> = {
      _metadata: {
        confidence: 'high',
        ai_enhanced: true,
        computed_at: new Date().toISOString(),
        data_source: 'ai_expansion',
        user_ratings: 0,
        value_mapped: true,
        mapping_version: 'v3_expansion_system',
        source_solution: metadata.sourceSolution,
        source_goal: metadata.sourceGoal,
        target_goal: metadata.targetGoal,
        expansion_method: 'conservative_mapping'
      }
    }

    // Generate distributions for each field
    for (const [fieldName, value] of Object.entries(solutionFields)) {
      if (Array.isArray(value)) {
        // Handle array fields (challenges, side_effects, etc.)
        aggregatedFields[fieldName] = this.createArrayFieldDistribution(value)
      } else {
        // Handle single value fields
        aggregatedFields[fieldName] = this.createSingleFieldDistribution(fieldName, value)
      }
    }

    return aggregatedFields
  }

  /**
   * Create distribution for array fields
   */
  private createArrayFieldDistribution(values: any[]): any {
    if (values.length === 0) {
      return {
        mode: 'None',
        values: [{ count: 1, value: 'None', percentage: 100 }],
        totalReports: 1
      }
    }

    // Create realistic percentage distribution
    const distributions = values.map((value, index) => {
      let percentage: number
      if (index === 0) {
        percentage = Math.max(40, 70 - (values.length - 1) * 10)
      } else {
        const remaining = 100 - 40
        percentage = remaining / (values.length - 1)
      }

      return {
        count: 1,
        value: value,
        percentage: Math.round(percentage)
      }
    })

    // Ensure percentages sum to 100
    const totalPercentage = distributions.reduce((sum, d) => sum + d.percentage, 0)
    if (totalPercentage !== 100) {
      distributions[0].percentage += (100 - totalPercentage)
    }

    return {
      mode: values[0],
      values: distributions,
      totalReports: 1
    }
  }

  /**
   * Create distribution for single value fields
   */
  private createSingleFieldDistribution(fieldName: string, value: any): any {
    const alternativeValue = this.generateAlternativeValue(fieldName, value)

    return {
      mode: value,
      values: [
        { count: 1, value: value, percentage: 75 },
        { count: 1, value: alternativeValue, percentage: 25 }
      ],
      totalReports: 1
    }
  }

  /**
   * Generate alternative values for field distributions
   */
  private generateAlternativeValue(fieldName: string, primaryValue: any): any {
    // Time-related fields
    if (fieldName.includes('time') || fieldName === 'duration') {
      const timeAlternatives: Record<string, string> = {
        'immediately': '1-2 weeks',
        '1-2 weeks': '1 month',
        '1 month': '2-3 months',
        '2-3 months': '3-6 months',
        '3-6 months': '6+ months',
        '6+ months': '3-6 months'
      }
      return timeAlternatives[primaryValue] || 'varies by individual'
    }

    // Frequency fields
    if (fieldName.includes('frequency')) {
      const frequencyAlternatives: Record<string, string> = {
        'daily': 'twice daily',
        'twice daily': 'daily',
        'once daily': 'twice daily',
        'weekly': 'daily',
        'monthly': 'weekly',
        'as needed': 'daily'
      }
      return frequencyAlternatives[primaryValue] || 'as needed'
    }

    // Cost fields
    if (fieldName.includes('cost')) {
      if (primaryValue === 'Free') return 'Under $10'
      if (primaryValue.includes('Under $10')) return 'Free'
      if (primaryValue.includes('$10-25')) return 'Under $10'
      if (primaryValue.includes('$25-50')) return '$10-25'
      return 'varies by provider'
    }

    // Default: return a generic alternative
    return 'varies'
  }

  /**
   * Validate and prepare goal link data for insertion
   */
  async prepareGoalLinkData(
    variantInfo: SolutionVariantInfo,
    goalId: string,
    effectiveness: number,
    effectivenessRationale: string,
    goalSpecificAdaptation: string,
    solutionFields: Record<string, any>,
    targetGoalTitle: string
  ): Promise<ExpandedGoalLink> {
    // Map solution fields to dropdown values
    const categoryConfig = CATEGORY_FIELDS[variantInfo.solution_category]
    if (!categoryConfig) {
      throw new Error(`No category config found for: ${variantInfo.solution_category}`)
    }

    const mappedFields = await mapAllFieldsToDropdowns(
      solutionFields,
      variantInfo.solution_category,
      categoryConfig
    )

    // Create aggregated fields
    const aggregatedFields = this.createAggregatedFields(
      mappedFields,
      variantInfo.solution_category,
      {
        sourceSolution: variantInfo.solution_title,
        sourceGoal: 'expansion_source',
        targetGoal: targetGoalTitle
      }
    )

    return {
      goal_id: goalId,
      goal_title: targetGoalTitle,
      implementation_id: variantInfo.variant_id,
      effectiveness: effectiveness,
      effectiveness_rationale: effectivenessRationale,
      goal_specific_adaptation: goalSpecificAdaptation,
      solution_fields: mappedFields,
      aggregated_fields: aggregatedFields
    }
  }

  /**
   * Insert new goal implementation link to database
   */
  async insertGoalLink(goalLink: ExpandedGoalLink): Promise<boolean> {
    try {
      // Check if link already exists
      const { data: existing } = await this.supabase
        .from('goal_implementation_links')
        .select('id')
        .eq('goal_id', goalLink.goal_id)
        .eq('implementation_id', goalLink.implementation_id)
        .single()

      if (existing) {
        console.log(chalk.yellow(`   Link already exists for goal: ${goalLink.goal_title}`))
        return false
      }

      // Insert new link
      const { error } = await this.supabase
        .from('goal_implementation_links')
        .insert({
          goal_id: goalLink.goal_id,
          implementation_id: goalLink.implementation_id,
          avg_effectiveness: goalLink.effectiveness,
          rating_count: 1,
          typical_application: goalLink.goal_specific_adaptation,
          notes: `Expanded from existing solution. ${goalLink.effectiveness_rationale}`,
          solution_fields: goalLink.solution_fields,
          aggregated_fields: goalLink.aggregated_fields,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error(chalk.red(`   Error inserting goal link: ${error.message}`))
        return false
      }

      console.log(chalk.green(`   ✅ Created link: ${goalLink.goal_title} (${goalLink.effectiveness} effectiveness)`))
      return true

    } catch (error) {
      console.error(chalk.red(`   Error in insertGoalLink: ${error}`))
      return false
    }
  }

  /**
   * Batch insert multiple goal links
   */
  async batchInsertGoalLinks(goalLinks: ExpandedGoalLink[]): Promise<{
    successful: number
    failed: number
    skipped: number
  }> {
    let successful = 0
    let failed = 0
    let skipped = 0

    console.log(chalk.cyan(`\n📥 Inserting ${goalLinks.length} goal links...`))

    for (const goalLink of goalLinks) {
      const result = await this.insertGoalLink(goalLink)

      if (result === true) {
        successful++
      } else if (result === false) {
        // Check if it was skipped (already exists) or failed
        const { data: existing } = await this.supabase
          .from('goal_implementation_links')
          .select('id')
          .eq('goal_id', goalLink.goal_id)
          .eq('implementation_id', goalLink.implementation_id)
          .single()

        if (existing) {
          skipped++
        } else {
          failed++
        }
      }

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(chalk.cyan('\n📊 Batch Insert Results:'))
    console.log(chalk.green(`   ✅ Successful: ${successful}`))
    console.log(chalk.yellow(`   ⏭️  Skipped (existing): ${skipped}`))
    console.log(chalk.red(`   ❌ Failed: ${failed}`))

    return { successful, failed, skipped }
  }

  /**
   * Validate goal link data before insertion
   */
  validateGoalLinkData(goalLink: ExpandedGoalLink): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Required fields validation
    if (!goalLink.goal_id) errors.push('Missing goal_id')
    if (!goalLink.implementation_id) errors.push('Missing implementation_id')
    if (!goalLink.effectiveness || goalLink.effectiveness < 3.0 || goalLink.effectiveness > 5.0) {
      errors.push(`Invalid effectiveness: ${goalLink.effectiveness} (must be 3.0-5.0)`)
    }

    // Solution fields validation
    if (!goalLink.solution_fields || Object.keys(goalLink.solution_fields).length === 0) {
      errors.push('Missing solution_fields')
    }

    // Aggregated fields validation
    if (!goalLink.aggregated_fields || !goalLink.aggregated_fields._metadata) {
      errors.push('Missing or invalid aggregated_fields')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}