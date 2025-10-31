/**
 * Database Insertion Module
 *
 * Handles inserting solutions, variants, goal links, and field distributions
 * into the Supabase database.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { CategoryFieldConfig, CATEGORY_FIELDS } from '../config/category-fields'
import { getDropdownOptionsForField } from '../config/dropdown-options'
import {
  buildAggregatedMetadata,
  deduplicateDistributionData,
  deriveCostFieldsForCategory,
  mapFieldToDropdown,
  normalizeDistributionData
} from '../../../lib/ai-generation/fields'
import type { DistributionData } from '../../../lib/ai-generation/fields'
import chalk from 'chalk'
import {
  createTitleSignature,
  computeTokenOverlapScore,
  enforceFirstPersonTitle,
  normalizeSolutionTitle
} from './canonical'

interface InsertOptions {
  forceWrite?: boolean
  dirtyOnly?: boolean
}

interface CachedSolution {
  id: string
  title: string
  normalized: string
  canonical: string
  tokens: string[]
}

const existingSolutionsCache = new Map<string, CachedSolution[]>()

async function loadSolutionsForCategory(
  supabase: SupabaseClient,
  category: string
): Promise<CachedSolution[]> {
  if (!existingSolutionsCache.has(category)) {
    const { data } = await supabase
      .from('solutions')
      .select('id, title')
      .eq('solution_category', category)

    const cached = (data ?? []).map(row => {
      const signature = createTitleSignature(row.title)
      return {
        id: row.id,
        title: row.title,
        normalized: signature.normalized,
        canonical: signature.canonical,
        tokens: signature.tokens
      }
    })

    existingSolutionsCache.set(category, cached)
  }

  return existingSolutionsCache.get(category) ?? []
}

type MatchReason = 'canonical' | 'token'

async function findMatchingSolution(
  supabase: SupabaseClient,
  category: string,
  title: string
): Promise<{ solution: CachedSolution; reason: MatchReason } | null> {
  const normalized = normalizeSolutionTitle(title)
  const signature = createTitleSignature(title)
  const cache = await loadSolutionsForCategory(supabase, category)

  const cachedMatch = cache.find(sol => sol.normalized === normalized)
  if (cachedMatch) {
    return { solution: cachedMatch, reason: 'canonical' }
  }

  const firstWord = title.split(/\s+/).filter(Boolean)[0] ?? title
  const { data: fuzzyMatches } = await supabase
    .from('solutions')
    .select('id, title')
    .eq('solution_category', category)
    .ilike('title', `%${firstWord}%`)
    .limit(100)

  for (const match of fuzzyMatches ?? []) {
    if (!cache.some(existing => existing.id === match.id)) {
      const matchSignature = createTitleSignature(match.title)
      cache.push({
        id: match.id,
        title: match.title,
        normalized: matchSignature.normalized,
        canonical: matchSignature.canonical,
        tokens: matchSignature.tokens
      })
    }
  }

  const canonicalMatch = cache.find(sol => sol.canonical && sol.canonical === signature.canonical)
  if (canonicalMatch) {
    return { solution: canonicalMatch, reason: 'canonical' }
  }

  let bestMatch: { solution: CachedSolution; score: number } | null = null

  for (const candidate of cache) {
    const score = computeTokenOverlapScore(signature.tokens, candidate.tokens)

    if (score >= 0.75) {
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { solution: candidate, score }
      }
    }
  }

  return bestMatch ? { solution: bestMatch.solution, reason: 'token' } : null
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
    solution.title = enforceFirstPersonTitle(solution.title)

    const existingSolutions = await loadSolutionsForCategory(supabase, solution.category)
    const normalizedIncomingTitle = normalizeSolutionTitle(solution.title)

    // Attempt direct match from cache
    let solutionId: string
    let canonicalTitle = solution.title

    const cachedMatch = existingSolutions.find(existing => existing.normalized === normalizedIncomingTitle)

    if (cachedMatch) {
      solutionId = cachedMatch.id
      canonicalTitle = cachedMatch.title
      console.log(chalk.gray(`      📎 Using existing solution: ${canonicalTitle}`))
    } else {
      const fuzzyMatch = await findMatchingSolution(supabase, solution.category, solution.title)

      if (fuzzyMatch) {
        solutionId = fuzzyMatch.solution.id
        canonicalTitle = fuzzyMatch.solution.title
        const reasonLabel = fuzzyMatch.reason === 'canonical' ? 'canonical' : 'similarity'
        console.log(chalk.gray(`      📎 Using existing solution (${reasonLabel} match): ${canonicalTitle}`))
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
        canonicalTitle = newSolution.title
        console.log(chalk.gray(`      ✨ Created new solution: ${canonicalTitle}`))

        const cache = await loadSolutionsForCategory(supabase, solution.category)
        const signature = createTitleSignature(canonicalTitle)
        cache.push({
          id: solutionId,
          title: canonicalTitle,
          normalized: signature.normalized,
          canonical: signature.canonical,
          tokens: signature.tokens
        })
      }
    }

    // Preserve canonical title to avoid minor variations sneaking into downstream logging
    solution.title = canonicalTitle

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

  return ensureDistributionDiversity(category, fieldName, normalized)
}

function cloneDistribution(distribution: DistributionData): DistributionData {
  return {
    ...distribution,
    values: distribution.values.map(value => ({ ...value }))
  }
}

function ensureDistributionDiversity(
  category: string,
  fieldName: string,
  distribution: DistributionData
): DistributionData {
  const values = distribution.values ?? []
  const uniqueValues = Array.from(new Set(values.map((item) => item.value)))

  const requiredMinimum = fieldName === 'still_following' ? 3 : 2

  if (uniqueValues.length >= requiredMinimum) {
    return distribution
  }

  const dropdownOptions = getDropdownOptionsForField(category, fieldName) ?? []
  if (dropdownOptions.length === 0) {
    return distribution
  }

  const totalReports = distribution.totalReports || 100
  const source = values[0]?.source || 'ai_training_data'

  const candidateValues: string[] = [...uniqueValues]
  for (const option of dropdownOptions) {
    if (!candidateValues.includes(option)) {
      candidateValues.push(option)
    }
    if (candidateValues.length >= Math.max(requiredMinimum, 4)) {
      break
    }
  }

  if (candidateValues.length === 0) {
    candidateValues.push(dropdownOptions[0])
  }

  const selection = candidateValues.slice(0, Math.max(requiredMinimum, Math.min(4, candidateValues.length)))

  const templates: Record<number, number[]> = {
    1: [100],
    2: [65, 35],
    3: [45, 30, 25],
    4: [40, 30, 20, 10],
    5: [35, 25, 20, 12, 8]
  }

  const basePercentages = templates[selection.length]
    ? [...templates[selection.length]]
    : new Array(selection.length).fill(Math.floor(100 / selection.length))

  let remaining = 100
  const adjustedPercentages = basePercentages.map((value, index) => {
    if (index === selection.length - 1) {
      return remaining
    }
    remaining -= value
    return value
  })

  let assignedReports = 0
  const enrichedValues = selection.map((value, index) => {
    const percentage = adjustedPercentages[index]
    let count: number
    if (index === selection.length - 1) {
      count = Math.max(1, totalReports - assignedReports)
    } else {
      count = Math.max(1, Math.round((percentage / 100) * totalReports))
      assignedReports += count
    }

    return {
      value,
      percentage,
      count,
      source
    }
  })

  const totalCounts = enrichedValues.reduce((sum, item) => sum + item.count, 0)
  if (totalCounts !== totalReports) {
    const delta = totalReports - totalCounts
    enrichedValues[0].count = Math.max(1, enrichedValues[0].count + delta)
  }

  return {
    ...distribution,
    mode: enrichedValues[0].value,
    values: enrichedValues,
    totalReports
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
