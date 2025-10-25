import type { AggregatedFieldMap, DistributionData, DistributionValue, SolutionFieldMap } from './types'

export function normalizeDistributionData(distribution: DistributionData): DistributionData {
  const copy: DistributionData = {
    ...distribution,
    dataSource: distribution.dataSource || 'ai_training_data',
    totalReports:
      typeof distribution.totalReports === 'number' && distribution.totalReports > 0
        ? distribution.totalReports
        : 100,
    values: distribution.values.map(value => ({
      ...value,
      source: value.source || 'ai_training_data'
    }))
  }

  const totalPercentage = copy.values.reduce((sum, item) => sum + item.percentage, 0)
  if (totalPercentage !== 100) {
    const difference = 100 - totalPercentage
    const largestIndex = copy.values.findIndex(
      item => item.percentage === Math.max(...copy.values.map(v => v.percentage))
    )
    if (largestIndex >= 0) {
      copy.values[largestIndex] = {
        ...copy.values[largestIndex],
        percentage: copy.values[largestIndex].percentage + difference
      }
    }
  }

  return copy
}

export function buildAggregatedMetadata(
  existing: Record<string, unknown> | undefined,
  solutionName: string,
  goalTitle: string
): Record<string, unknown> {
  return {
    confidence: existing?.confidence || 'high',
    ai_enhanced: true,
    generated_at: new Date().toISOString(),
    data_source: 'ai_training_data',
    value_mapped: true,
    mapping_version: 'field-generator-v3',
    source_solution: solutionName,
    target_goal: goalTitle,
    user_ratings: existing?.user_ratings ?? 0
  }
}

const PRACTICE_HOBBY_CATEGORIES = new Set([
  'meditation_mindfulness',
  'exercise_movement',
  'habits_routines',
  'hobbies_activities'
])

function isMeaningfulValue(distribution?: DistributionData): boolean {
  if (!distribution) return false
  const mode = distribution.mode.toLowerCase()
  if (mode.includes("don't remember") || mode.includes('unknown')) return false
  return true
}

function isFreeValue(distribution?: DistributionData): boolean {
  if (!distribution) return false
  return distribution.mode.toLowerCase().includes('free')
}

export function deriveCostFieldsForCategory(
  category: string,
  aggregatedFields: AggregatedFieldMap,
  solutionFields: SolutionFieldMap
): void {
  if (!PRACTICE_HOBBY_CATEGORIES.has(category)) return

  const startupCost = aggregatedFields.startup_cost as DistributionData | undefined
  const ongoingCost = aggregatedFields.ongoing_cost as DistributionData | undefined

  if (!startupCost && !ongoingCost) return

  const meaningfulStartup = isMeaningfulValue(startupCost)
  const meaningfulOngoing = isMeaningfulValue(ongoingCost)

  const paidStartup = meaningfulStartup && !isFreeValue(startupCost)
  const paidOngoing = meaningfulOngoing && !isFreeValue(ongoingCost)

  if (!aggregatedFields.cost) {
    let derivedCost: DistributionData | undefined
    if (paidOngoing) derivedCost = ongoingCost
    else if (paidStartup) derivedCost = startupCost
    else if (meaningfulOngoing) derivedCost = ongoingCost
    else if (meaningfulStartup) derivedCost = startupCost
    else derivedCost = ongoingCost ?? startupCost

    if (derivedCost) {
      aggregatedFields.cost = derivedCost
      solutionFields.cost = derivedCost
    }
  }

  if (!aggregatedFields.cost_type) {
    let costTypeMode: string | undefined
    if (paidOngoing && paidStartup) costTypeMode = 'dual'
    else if (paidOngoing) costTypeMode = 'recurring'
    else if (paidStartup) costTypeMode = 'one_time'
    else if (meaningfulOngoing || meaningfulStartup) {
      if (isFreeValue(ongoingCost) || isFreeValue(startupCost)) costTypeMode = 'free'
      else costTypeMode = 'unknown'
    }

    if (costTypeMode) {
      const distribution: DistributionData = {
        mode: costTypeMode,
        values: [
          {
            value: costTypeMode,
            count: 100,
            percentage: 100,
            source: 'ai_training_data'
          }
        ],
        totalReports: 100,
        dataSource: 'ai_training_data'
      }
      aggregatedFields.cost_type = distribution
      solutionFields.cost_type = distribution
    }
  }
}
