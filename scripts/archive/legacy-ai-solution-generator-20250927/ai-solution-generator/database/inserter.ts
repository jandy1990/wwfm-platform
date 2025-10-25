/**
 * Database Insertion Module
 *
 * Handles inserting solutions, variants, goal links, and field distributions
 * into the Supabase database.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { CategoryFieldConfig, CATEGORY_FIELDS } from '../config/category-fields'
import {
  buildAggregatedMetadata,
  deduplicateDistributionData,
  deriveCostFieldsForCategory,
  mapFieldToDropdown,
  normalizeDistributionData
} from '../../../../../lib/ai-generation/fields'
import type { DistributionData } from '../../../../../lib/ai-generation/fields'
import chalk from 'chalk'

interface InsertOptions {
  forceWrite?: boolean
  dirtyOnly?: boolean
}

export interface Solution {
  title: string
  description: string
  category: string
  effectiveness: number
  effectiveness_rationale?: string
  variants?: Array<{
    amount?: number
    unit?: string
    form: string
  }>
  fields: Record<string, DistributionData>
}

export interface Goal {
  id: string
  title: string
  description?: string
}

export async function insertSolutionToDatabase(
  goal: Goal,
  solution: Solution,
  supabase: SupabaseClient,
  categoryConfig: CategoryFieldConfig,
  options: InsertOptions = {}
): Promise<void> {
  const { forceWrite = false, dirtyOnly = false } = options

  try {
    const { data: existingSolution } = await supabase
      .from('solutions')
      .select('id')
      .eq('title', solution.title)
      .eq('solution_category', solution.category)
      .single()

    let solutionId: string

    if (existingSolution) {
      solutionId = existingSolution.id
      console.log(chalk.gray(`      📎 Using existing solution: ${solution.title}`))
    } else {
      const { data: newSolution, error } = await supabase
        .from('solutions')
        .insert({
          title: solution.title,
          description: solution.description,
          solution_category: solution.category,
          source_type: 'ai_foundation',
          is_approved: true
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create solution: ${error.message}`)
      }

      solutionId = newSolution.id
      console.log(chalk.gray(`      ✨ Created new solution: ${solution.title}`))
    }

    const variantIds: string[] = []

    if (categoryConfig.needsVariants && solution.variants && solution.variants.length > 0) {
      for (const [index, variant] of solution.variants.entries()) {
        let variantName = variant.form
        if (variant.amount && variant.unit) {
          variantName = `${variant.amount}${variant.unit} ${variant.form}`
        }
        if (variantName.length > 50) {
          variantName = `${variantName.slice(0, 47)}...`
        }

        const { data: existingVariant } = await supabase
          .from('solution_variants')
          .select('id')
          .eq('solution_id', solutionId)
          .eq('variant_name', variantName)
          .single()

        if (existingVariant) {
          variantIds.push(existingVariant.id)
          continue
        }

        const { data: newVariant, error: variantError } = await supabase
          .from('solution_variants')
          .insert({
            solution_id: solutionId,
            amount: variant.amount,
            unit: variant.unit,
            form: variant.form,
            variant_name: variantName,
            is_default: index === 0
          })
          .select()
          .single()

        if (variantError) {
          throw new Error(`Failed to create variant: ${variantError.message}`)
        }

        variantIds.push(newVariant.id)
      }
    } else {
      const { data: existingVariant } = await supabase
        .from('solution_variants')
        .select('id')
        .eq('solution_id', solutionId)
        .eq('variant_name', 'Standard')
        .single()

      if (existingVariant) {
        variantIds.push(existingVariant.id)
      } else {
        const { data: newVariant, error: variantError } = await supabase
          .from('solution_variants')
          .insert({
            solution_id: solutionId,
            variant_name: 'Standard',
            is_default: true
          })
          .select()
          .single()

        if (variantError) {
          throw new Error(`Failed to create standard variant: ${variantError.message}`)
        }

        variantIds.push(newVariant.id)
      }
    }

    const preparedPayloads = prepareFieldPayloads({
      category: solution.category,
      goalTitle: goal.title,
      solutionTitle: solution.title,
      solutionFields: solution.fields
    })

    for (const variantId of variantIds) {
      const { data: existingLink } = await supabase
        .from('goal_implementation_links')
        .select('id, solution_fields, aggregated_fields, needs_aggregation')
        .eq('goal_id', goal.id)
        .eq('implementation_id', variantId)
        .single()

      if (existingLink) {
        if (dirtyOnly && !existingLink.needs_aggregation) {
          console.log(chalk.gray(`      ⏭️  Skipped ${solution.title} – link not flagged for cleanup`))
          continue
        }

        const nextPayloads = prepareFieldPayloads({
          category: solution.category,
          goalTitle: goal.title,
          solutionTitle: solution.title,
          solutionFields: solution.fields,
          existingAggregated: existingLink.aggregated_fields as Record<string, unknown> | undefined
        })

        const fieldsEqual = isDeepEqual(existingLink.solution_fields, nextPayloads.solutionFields)
        const aggregatedEqual = isDeepEqual(existingLink.aggregated_fields, nextPayloads.aggregatedFields)

        if (fieldsEqual && aggregatedEqual && !forceWrite) {
          console.log(chalk.gray(`      ⏭️  Skipped ${solution.title} – no changes detected`))
          continue
        }

        const { error: updateError } = await supabase
          .from('goal_implementation_links')
          .update({
            avg_effectiveness: solution.effectiveness,
            rating_count: 1,
            solution_fields: nextPayloads.solutionFields,
            aggregated_fields: nextPayloads.aggregatedFields,
            needs_aggregation: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingLink.id)

        if (updateError) {
          throw new Error(`Failed to update goal link: ${updateError.message}`)
        }
      } else {
        const payloads = prepareFieldPayloads({
          category: solution.category,
          goalTitle: goal.title,
          solutionTitle: solution.title,
          solutionFields: solution.fields
        })

        const { error: linkError } = await supabase
          .from('goal_implementation_links')
          .insert({
            goal_id: goal.id,
            implementation_id: variantId,
            avg_effectiveness: solution.effectiveness,
            rating_count: 1,
            solution_fields: payloads.solutionFields,
            aggregated_fields: payloads.aggregatedFields,
            needs_aggregation: false
          })

        if (linkError) {
          throw new Error(`Failed to create goal link: ${linkError.message}`)
        }
      }
    }

    console.log(chalk.green(`      ✅ Successfully inserted ${solution.title}`))
  } catch (error) {
    throw error
  }
}

function prepareFieldPayloads({
  category,
  solutionFields,
  goalTitle,
  solutionTitle,
  existingAggregated
}: {
  category: string
  solutionFields: Record<string, DistributionData>
  goalTitle: string
  solutionTitle: string
  existingAggregated?: Record<string, unknown>
}) {
  const preparedSolutionFields: Record<string, DistributionData> = {}
  const preparedAggregatedFields: Record<string, unknown> = {}

  for (const [fieldName, distribution] of Object.entries(solutionFields)) {
    const normalized = normalizeDistributionForStorage(category, fieldName, distribution)
    preparedSolutionFields[fieldName] = normalized
    preparedAggregatedFields[fieldName] = cloneDistribution(normalized)
  }

  deriveCostFieldsForCategory(category, preparedAggregatedFields, preparedSolutionFields)

  preparedAggregatedFields._metadata = buildAggregatedMetadata(
    existingAggregated,
    solutionTitle,
    goalTitle
  )

  return {
    solutionFields: preparedSolutionFields,
    aggregatedFields: preparedAggregatedFields
  }
}

function normalizeDistributionForStorage(
  category: string,
  fieldName: string,
  distribution: DistributionData
): DistributionData {
  const base: DistributionData = {
    mode: distribution.mode || '',
    dataSource: 'ai_training_data',
    totalReports: distribution.totalReports || 100,
    values: (distribution.values || []).map(value => ({
      value: mapFieldToDropdown(category, fieldName, value.value),
      count: value.count ?? Math.max(1, Math.round(value.percentage ?? 0)),
      percentage:
        value.percentage ??
        Math.min(100, Math.max(1, Math.round(((value.count ?? 1) / (distribution.totalReports || 100)) * 100))),
      source: value.source || 'ai_training_data'
    }))
  }

  const deduped = deduplicateDistributionData(base)
  const normalized = normalizeDistributionData({
    ...deduped,
    mode: mapFieldToDropdown(category, fieldName, deduped.mode)
  })

  normalized.values = normalized.values.map(value => ({
    ...value,
    value: mapFieldToDropdown(category, fieldName, value.value),
    source: value.source || 'ai_training_data',
    count: value.count ?? Math.max(1, Math.round((value.percentage / 100) * normalized.totalReports))
  }))

  return normalized
}

function cloneDistribution(distribution: DistributionData): DistributionData {
  return {
    ...distribution,
    values: distribution.values.map(value => ({ ...value }))
  }
}

function isDeepEqual(a: any, b: any): boolean {
  return JSON.stringify(normalizeForComparison(a)) === JSON.stringify(normalizeForComparison(b))
}

function normalizeForComparison(value: any): any {
  if (Array.isArray(value)) {
    return value.map(normalizeForComparison)
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, any>>((acc, key) => {
        acc[key] = normalizeForComparison(value[key])
        return acc
      }, {})
  }

  return value
}

export function validateSolutionFields(
  solution: Solution,
  categoryConfig: CategoryFieldConfig
): string[] {
  const errors: string[] = []

  for (const field of categoryConfig.required) {
    if (!solution.fields[field]) {
      errors.push(`Missing required field: ${field}`)
    }
  }

  if (categoryConfig.arrayField) {
    const value = solution.fields[categoryConfig.arrayField]
    if (!value) {
      errors.push(`Missing array field: ${categoryConfig.arrayField}`)
    }
  }

  return errors
}

export async function batchInsertSolutions(
  goals: Goal[],
  solutions: Solution[],
  supabase: SupabaseClient
): Promise<number> {
  let totalInserted = 0

  for (const goal of goals) {
    for (const solution of solutions) {
      try {
        const categoryConfig = CATEGORY_FIELDS[solution.category]
        if (!categoryConfig) {
          console.error(
            chalk.red(`Unknown category ${solution.category} for solution ${solution.title}; skipping`)
          )
          continue
        }

        await insertSolutionToDatabase(goal, solution, supabase, categoryConfig)
        totalInserted++
      } catch (error) {
        console.error(chalk.red(`Failed to insert ${solution.title} for ${goal.title}: ${(error as Error).message}`))
      }
    }
  }

  return totalInserted
}
