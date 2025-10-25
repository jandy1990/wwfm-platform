/**
 * Intelligent Deduplication System
 *
 * Handles merging duplicate values in DistributionData while:
 * - Preserving authentic distribution patterns
 * - Maintaining percentage accuracy
 * - Keeping highest-quality source attribution
 * - Ensuring totals sum to 100%
 */

interface DistributionValue {
  value: string
  count: number
  percentage: number
  source: string
}

interface DistributionData {
  mode: string
  values: DistributionValue[]
  totalReports: number
  dataSource: string
}

/**
 * Source quality ranking for merging decisions
 * Higher number = better quality
 */
const SOURCE_QUALITY_RANKING: Record<string, number> = {
  research: 10,
  studies: 9,
  clinical_trials: 8,
  medical_literature: 7,
  consumer_reports: 6,
  user_experiences: 5,
  community_feedback: 4,
  expert_opinions: 3,
  general_knowledge: 2,
  fallback: 1
}

function getSourceQuality(source: string): number {
  return SOURCE_QUALITY_RANKING[source] || 1
}

function selectBetterSource(source1: string, source2: string): string {
  const quality1 = getSourceQuality(source1)
  const quality2 = getSourceQuality(source2)
  return quality1 >= quality2 ? source1 : source2
}

function normalizeValueForComparison(value: string): string {
  return value.trim().toLowerCase()
}

function areValuesDuplicate(value1: string, value2: string): boolean {
  if (value1 === value2) return true
  if (normalizeValueForComparison(value1) === normalizeValueForComparison(value2)) return true

  const normalized1 = normalizeValueForComparison(value1)
  const normalized2 = normalizeValueForComparison(value2)

  const dailyVariations = ['once daily', 'daily', '1x daily', 'once per day', 'one time daily']
  if (dailyVariations.includes(normalized1) && dailyVariations.includes(normalized2)) {
    return true
  }

  const twiceDailyVariations = ['twice daily', '2x daily', 'two times daily', 'twice per day']
  if (twiceDailyVariations.includes(normalized1) && twiceDailyVariations.includes(normalized2)) {
    return true
  }

  const asNeededVariations = ['as needed', 'when needed', 'prn', 'on demand']
  if (asNeededVariations.includes(normalized1) && asNeededVariations.includes(normalized2)) {
    return true
  }

  return false
}

function selectCanonicalValue(value1: string, value2: string): string {
  if (value1.toLowerCase() === value2.toLowerCase()) {
    if (value1[0] === value1[0].toUpperCase() && value2[0] === value2[0].toLowerCase()) {
      return value1
    }
    if (value2[0] === value2[0].toUpperCase() && value1[0] === value1[0].toLowerCase()) {
      return value2
    }
  }

  const standardTerms = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Daily',
    'Weekly',
    'Monthly',
    'As needed',
    'Every other day'
  ]

  if (standardTerms.includes(value1) && !standardTerms.includes(value2)) {
    return value1
  }
  if (standardTerms.includes(value2) && !standardTerms.includes(value1)) {
    return value2
  }

  return value1
}

function mergeDistributionValues(value1: DistributionValue, value2: DistributionValue): DistributionValue {
  return {
    value: selectCanonicalValue(value1.value, value2.value),
    count: value1.count + value2.count,
    percentage: value1.percentage + value2.percentage,
    source: selectBetterSource(value1.source, value2.source)
  }
}

function redistributePercentages(values: DistributionValue[]): DistributionValue[] {
  const totalPercentage = values.reduce((sum, v) => sum + v.percentage, 0)

  if (Math.abs(totalPercentage - 100) < 0.01) {
    return values
  }

  if (totalPercentage === 0) {
    const equalPercentage = Math.floor(100 / values.length)
    const remainder = 100 - equalPercentage * values.length

    return values.map((value, index) => ({
      ...value,
      percentage: index < remainder ? equalPercentage + 1 : equalPercentage
    }))
  }

  const scaleFactor = 100 / totalPercentage
  const adjustedValues = values.map(value => ({
    ...value,
    percentage: Math.round(value.percentage * scaleFactor)
  }))

  const newTotal = adjustedValues.reduce((sum, v) => sum + v.percentage, 0)
  const difference = 100 - newTotal

  if (difference !== 0) {
    const sortedByPercentage = [...adjustedValues].sort((a, b) => b.percentage - a.percentage)
    const largest = sortedByPercentage[0]
    const largestIndex = adjustedValues.findIndex(v => v === largest)
    adjustedValues[largestIndex].percentage += difference
  }

  return adjustedValues
}

export function deduplicateDistributionData(data: DistributionData): DistributionData {
  if (!data || !data.values || !Array.isArray(data.values)) {
    throw new Error('Invalid distribution data structure')
  }

  if (data.values.length <= 1) {
    return data
  }

  const mergedValues: DistributionValue[] = []

  for (const value of data.values) {
    const duplicateIndex = mergedValues.findIndex(existing => areValuesDuplicate(existing.value, value.value))
    if (duplicateIndex === -1) {
      mergedValues.push({ ...value })
    } else {
      mergedValues[duplicateIndex] = mergeDistributionValues(mergedValues[duplicateIndex], value)
    }
  }

  const redistributed = redistributePercentages(mergedValues)

  return {
    ...data,
    values: redistributed
  }
}
