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
  'research': 10,
  'studies': 9,
  'clinical_trials': 8,
  'medical_literature': 7,
  'consumer_reports': 6,
  'user_experiences': 5,
  'community_feedback': 4,
  'expert_opinions': 3,
  'general_knowledge': 2,
  'fallback': 1
}

/**
 * Get the quality score for a source
 */
function getSourceQuality(source: string): number {
  return SOURCE_QUALITY_RANKING[source] || 1
}

/**
 * Choose the better source between two options
 */
function selectBetterSource(source1: string, source2: string): string {
  const quality1 = getSourceQuality(source1)
  const quality2 = getSourceQuality(source2)
  return quality1 >= quality2 ? source1 : source2
}

/**
 * Normalize a value for comparison (case-insensitive, trimmed)
 */
function normalizeValueForComparison(value: string): string {
  return value.trim().toLowerCase()
}

/**
 * Check if two values should be considered duplicates
 */
function areValuesDuplicate(value1: string, value2: string): boolean {
  // Exact match
  if (value1 === value2) return true

  // Case-insensitive match
  if (normalizeValueForComparison(value1) === normalizeValueForComparison(value2)) return true

  // Handle common variations
  const normalized1 = normalizeValueForComparison(value1)
  const normalized2 = normalizeValueForComparison(value2)

  // "once daily" vs "daily" vs "1x daily" etc.
  const dailyVariations = ['once daily', 'daily', '1x daily', 'once per day', 'one time daily']
  if (dailyVariations.includes(normalized1) && dailyVariations.includes(normalized2)) {
    return true
  }

  // "twice daily" vs "2x daily" vs "two times daily" etc.
  const twiceDailyVariations = ['twice daily', '2x daily', 'two times daily', 'twice per day']
  if (twiceDailyVariations.includes(normalized1) && twiceDailyVariations.includes(normalized2)) {
    return true
  }

  // "as needed" variations
  const asNeededVariations = ['as needed', 'when needed', 'prn', 'on demand']
  if (asNeededVariations.includes(normalized1) && asNeededVariations.includes(normalized2)) {
    return true
  }

  return false
}

/**
 * Choose the canonical value when merging duplicates
 * Prefers proper case, standard terminology
 */
function selectCanonicalValue(value1: string, value2: string): string {
  // Prefer proper case over lowercase
  if (value1.toLowerCase() === value2.toLowerCase()) {
    if (value1[0] === value1[0].toUpperCase() && value2[0] === value2[0].toLowerCase()) {
      return value1
    }
    if (value2[0] === value2[0].toUpperCase() && value1[0] === value1[0].toLowerCase()) {
      return value2
    }
  }

  // Prefer standard terminology
  const standardTerms = [
    'Once daily', 'Twice daily', 'Three times daily',
    'Daily', 'Weekly', 'Monthly',
    'As needed', 'Every other day'
  ]

  if (standardTerms.includes(value1) && !standardTerms.includes(value2)) {
    return value1
  }
  if (standardTerms.includes(value2) && !standardTerms.includes(value1)) {
    return value2
  }

  // Default to first value
  return value1
}

/**
 * Merge two distribution values
 */
function mergeDistributionValues(
  value1: DistributionValue,
  value2: DistributionValue
): DistributionValue {
  return {
    value: selectCanonicalValue(value1.value, value2.value),
    count: value1.count + value2.count,
    percentage: value1.percentage + value2.percentage,
    source: selectBetterSource(value1.source, value2.source)
  }
}

/**
 * Redistribute percentages proportionally to ensure they sum to 100
 */
function redistributePercentages(values: DistributionValue[]): DistributionValue[] {
  const totalPercentage = values.reduce((sum, v) => sum + v.percentage, 0)

  if (Math.abs(totalPercentage - 100) < 0.01) {
    // Already close to 100%, no adjustment needed
    return values
  }

  if (totalPercentage === 0) {
    // Edge case: all percentages were 0, distribute equally
    const equalPercentage = Math.floor(100 / values.length)
    const remainder = 100 - (equalPercentage * values.length)

    return values.map((value, index) => ({
      ...value,
      percentage: index < remainder ? equalPercentage + 1 : equalPercentage
    }))
  }

  // Proportional scaling
  const scaleFactor = 100 / totalPercentage
  let adjustedValues = values.map(value => ({
    ...value,
    percentage: Math.round(value.percentage * scaleFactor)
  }))

  // Handle rounding errors to ensure exact 100% total
  const newTotal = adjustedValues.reduce((sum, v) => sum + v.percentage, 0)
  const difference = 100 - newTotal

  if (difference !== 0) {
    // Adjust the largest value to account for rounding
    const sortedByPercentage = [...adjustedValues].sort((a, b) => b.percentage - a.percentage)
    const largest = sortedByPercentage[0]
    const largestIndex = adjustedValues.findIndex(v => v === largest)
    adjustedValues[largestIndex].percentage += difference
  }

  return adjustedValues
}

/**
 * Main deduplication function
 */
export function deduplicateDistributionData(data: DistributionData): DistributionData {
  if (!data || !data.values || !Array.isArray(data.values)) {
    throw new Error('Invalid distribution data structure')
  }

  if (data.values.length <= 1) {
    // No duplicates possible with 0 or 1 values
    return data
  }

  // Group values by their normalized form
  const valueGroups = new Map<string, DistributionValue[]>()

  for (const value of data.values) {
    let foundGroup = false

    // Check if this value matches any existing group
    for (const [groupKey, groupValues] of valueGroups.entries()) {
      if (areValuesDuplicate(value.value, groupValues[0].value)) {
        groupValues.push(value)
        foundGroup = true
        break
      }
    }

    // If no matching group found, create a new group
    if (!foundGroup) {
      const groupKey = normalizeValueForComparison(value.value)
      valueGroups.set(groupKey, [value])
    }
  }

  // Merge groups that have multiple values
  const deduplicatedValues: DistributionValue[] = []

  for (const groupValues of valueGroups.values()) {
    if (groupValues.length === 1) {
      // No duplicates in this group
      deduplicatedValues.push(groupValues[0])
    } else {
      // Merge all values in this group
      let merged = groupValues[0]
      for (let i = 1; i < groupValues.length; i++) {
        merged = mergeDistributionValues(merged, groupValues[i])
      }
      deduplicatedValues.push(merged)
    }
  }

  // Redistribute percentages to ensure they sum to 100%
  const redistributedValues = redistributePercentages(deduplicatedValues)

  // Sort by percentage (highest first) for consistent ordering
  redistributedValues.sort((a, b) => b.percentage - a.percentage)

  // Update mode if it was one of the deduplicated values
  let newMode = data.mode
  for (const value of redistributedValues) {
    if (areValuesDuplicate(data.mode, value.value)) {
      newMode = value.value
      break
    }
  }

  // Update total counts
  const newTotalReports = redistributedValues.reduce((sum, v) => sum + v.count, 0)

  return {
    ...data,
    mode: newMode,
    values: redistributedValues,
    totalReports: newTotalReports
  }
}

/**
 * Validate that deduplication was successful
 */
export function validateDeduplication(data: DistributionData): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!data || !data.values) {
    errors.push('Invalid data structure')
    return { isValid: false, errors }
  }

  // Check for exact duplicate values
  const valueSet = new Set<string>()
  for (const item of data.values) {
    if (valueSet.has(item.value)) {
      errors.push(`Exact duplicate value found: "${item.value}"`)
    }
    valueSet.add(item.value)
  }

  // Check for case-insensitive duplicates
  const normalizedValueSet = new Set<string>()
  for (const item of data.values) {
    const normalized = normalizeValueForComparison(item.value)
    if (normalizedValueSet.has(normalized)) {
      errors.push(`Case-insensitive duplicate found: "${item.value}"`)
    }
    normalizedValueSet.add(normalized)
  }

  // Check percentage total
  const totalPercentage = data.values.reduce((sum, v) => sum + v.percentage, 0)
  if (Math.abs(totalPercentage - 100) > 0.01) {
    errors.push(`Percentages don't sum to 100%: ${totalPercentage}%`)
  }

  // Check for negative percentages
  for (const item of data.values) {
    if (item.percentage < 0) {
      errors.push(`Negative percentage found: ${item.percentage}%`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Get deduplication statistics
 */
export function getDeduplicationStats(
  originalData: DistributionData,
  deduplicatedData: DistributionData
): {
  originalCount: number
  deduplicatedCount: number
  duplicatesRemoved: number
  percentageAdjustment: number
} {
  const originalCount = originalData.values?.length || 0
  const deduplicatedCount = deduplicatedData.values?.length || 0
  const duplicatesRemoved = originalCount - deduplicatedCount

  const originalTotal = originalData.values?.reduce((sum, v) => sum + v.percentage, 0) || 0
  const deduplicatedTotal = deduplicatedData.values?.reduce((sum, v) => sum + v.percentage, 0) || 0
  const percentageAdjustment = Math.abs(deduplicatedTotal - originalTotal)

  return {
    originalCount,
    deduplicatedCount,
    duplicatesRemoved,
    percentageAdjustment
  }
}