/**
 * Strict Field Validation System
 *
 * Validates DistributionData against requirements:
 * - Exact dropdown compliance
 * - No duplicate values
 * - Proper case formatting
 * - Non-mechanistic distributions
 * - Evidence-based sources
 * - Percentage accuracy
 */

import { DROPDOWN_OPTIONS } from './dropdown-options'
import { getDropdownSource, getRequiredFields } from './category-config'

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

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  fieldName: string
  category: string
}

/**
 * Valid source types for different categories
 */
const VALID_SOURCES = new Set([
  'research',
  'studies',
  'clinical_trials',
  'medical_literature',
  'user_reviews',
  'beauty_experts',
  'consumer_reports',
  'community_feedback',
  'fitness_communities',
  'trainer_recommendations',
  'user_experiences',
  'financial_advisors',
  'user_reports',
  'case_studies',
  'expert_analysis',
  'app_reviews',
  'user_ratings',
  'tech_reviews',
  'hobbyist_communities',
  'enthusiast_forums',
  'instructor_recommendations',
  'participant_feedback',
  'habit_formation_forums',
  'behavior_change_studies',
  'routine_optimization_blogs'
])

/**
 * Detect mechanistic (artificial) distribution patterns
 */
function detectMechanisticPatterns(values: DistributionValue[]): string[] {
  const issues: string[] = []

  if (values.length === 0) {
    issues.push('No values in distribution')
    return issues
  }

  const percentages = values.map(v => v.percentage).sort((a, b) => a - b)

  // Check for equal splits
  const uniquePercentages = new Set(percentages)
  if (uniquePercentages.size === 1 && values.length > 2) {
    issues.push(`Equal split pattern detected: all values at ${percentages[0]}%`)
  }

  // Check for obvious mathematical patterns
  if (values.length === 4) {
    const sorted = [...percentages].sort((a, b) => a - b)
    if (sorted.every(p => p === 25)) {
      issues.push('Perfect 25% split - appears mechanistic')
    }
  }

  if (values.length === 5) {
    const sorted = [...percentages].sort((a, b) => a - b)
    if (sorted.every(p => p === 20)) {
      issues.push('Perfect 20% split - appears mechanistic')
    }
  }

  // Check for arithmetic sequences
  if (values.length >= 3) {
    const sorted = [...percentages].sort((a, b) => a - b)
    let isArithmetic = true
    const difference = sorted[1] - sorted[0]
    for (let i = 2; i < sorted.length; i++) {
      if (Math.abs((sorted[i] - sorted[i-1]) - difference) > 1) {
        isArithmetic = false
        break
      }
    }
    if (isArithmetic && difference > 0) {
      issues.push(`Arithmetic sequence pattern detected (${difference}% intervals)`)
    }
  }

  return issues
}

/**
 * Validate exact dropdown compliance
 */
function validateDropdownCompliance(
  values: DistributionValue[],
  fieldName: string,
  category: string
): string[] {
  const errors: string[] = []

  try {
    // Get the correct dropdown source for this field/category combination
    const dropdownSource = getDropdownSource(fieldName, category)
    const validOptions = DROPDOWN_OPTIONS[dropdownSource]

    if (!validOptions || !Array.isArray(validOptions)) {
      errors.push(`No dropdown options found for ${dropdownSource}`)
      return errors
    }

    // Check each value
    for (const item of values) {
      const exactMatch = validOptions.includes(item.value)
      if (!exactMatch) {
        // Try case-insensitive match to provide better error message
        const caseInsensitiveMatch = validOptions.find(
          opt => opt.toLowerCase() === item.value.toLowerCase()
        )

        if (caseInsensitiveMatch) {
          errors.push(
            `Case mismatch for "${item.value}" - should be "${caseInsensitiveMatch}"`
          )
        } else {
          errors.push(
            `Invalid value "${item.value}" for ${fieldName}. Valid options: ${validOptions.slice(0, 3).join(', ')}...`
          )
        }
      }
    }
  } catch (error) {
    errors.push(`Dropdown validation failed: ${error.message}`)
  }

  return errors
}

/**
 * Validate that mode is one of the values
 */
function validateMode(data: DistributionData): string[] {
  const errors: string[] = []

  if (!data.mode) {
    errors.push('Missing mode value')
    return errors
  }

  const modeExists = data.values.some(v => v.value === data.mode)
  if (!modeExists) {
    // Try case-insensitive match
    const caseInsensitiveMatch = data.values.find(
      v => v.value.toLowerCase() === data.mode.toLowerCase()
    )

    if (caseInsensitiveMatch) {
      errors.push(`Mode case mismatch: "${data.mode}" should be "${caseInsensitiveMatch.value}"`)
    } else {
      errors.push(`Mode "${data.mode}" is not in values list`)
    }
  }

  return errors
}

/**
 * Validate percentage consistency
 */
function validatePercentages(values: DistributionValue[]): string[] {
  const errors: string[] = []

  // Check individual percentages
  for (const item of values) {
    if (item.percentage < 0) {
      errors.push(`Negative percentage: ${item.percentage}%`)
    }
    if (item.percentage > 100) {
      errors.push(`Percentage over 100: ${item.percentage}%`)
    }
    if (!Number.isInteger(item.percentage)) {
      errors.push(`Non-integer percentage: ${item.percentage}%`)
    }
  }

  // Check total
  const total = values.reduce((sum, v) => sum + v.percentage, 0)
  if (Math.abs(total - 100) > 0.01) {
    errors.push(`Percentages don't sum to 100%: ${total}%`)
  }

  return errors
}

/**
 * Validate count consistency
 */
function validateCounts(data: DistributionData): string[] {
  const errors: string[] = []

  // Check individual counts
  for (const item of data.values) {
    if (item.count < 0) {
      errors.push(`Negative count: ${item.count}`)
    }
    if (!Number.isInteger(item.count)) {
      errors.push(`Non-integer count: ${item.count}`)
    }
  }

  // Check total consistency
  const calculatedTotal = data.values.reduce((sum, v) => sum + v.count, 0)
  if (data.totalReports && Math.abs(calculatedTotal - data.totalReports) > 0.01) {
    errors.push(
      `Count mismatch: totalReports=${data.totalReports}, calculated=${calculatedTotal}`
    )
  }

  return errors
}

/**
 * Validate source attribution
 */
function validateSources(values: DistributionValue[]): string[] {
  const errors: string[] = []

  for (const item of values) {
    if (!item.source) {
      errors.push('Missing source attribution')
      continue
    }

    if (!VALID_SOURCES.has(item.source)) {
      errors.push(`Invalid source: "${item.source}"`)
    }
  }

  return errors
}

/**
 * Check for duplicate values
 */
function validateNoDuplicates(values: DistributionValue[]): string[] {
  const errors: string[] = []
  const seen = new Set<string>()

  for (const item of values) {
    const normalizedValue = item.value.trim().toLowerCase()
    if (seen.has(normalizedValue)) {
      errors.push(`Duplicate value detected: "${item.value}"`)
    }
    seen.add(normalizedValue)
  }

  return errors
}

/**
 * Validate distribution quality (richness)
 */
function validateDistributionQuality(values: DistributionValue[]): string[] {
  const warnings: string[] = []

  if (values.length < 3) {
    warnings.push(`Low diversity: only ${values.length} options (recommend 5-8)`)
  }

  if (values.length === 1) {
    warnings.push('Single-option distribution - very low diversity')
  }

  // Check for overly dominant values
  const maxPercentage = Math.max(...values.map(v => v.percentage))
  if (maxPercentage > 80) {
    warnings.push(`Overly dominant option: ${maxPercentage}%`)
  }

  return warnings
}

/**
 * Validate that field is required for this category
 */
function validateFieldIsRequired(fieldName: string, category: string): string[] {
  const errors: string[] = []

  try {
    const requiredFields = getRequiredFields(category)
    if (!requiredFields.includes(fieldName)) {
      errors.push(`Field ${fieldName} is not required for category ${category}`)
    }
  } catch (error) {
    errors.push(`Category validation failed: ${error.message}`)
  }

  return errors
}

/**
 * Main validation function
 */
export function validateFieldData(
  data: DistributionData,
  fieldName: string,
  category: string
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Basic structure validation
  if (!data) {
    errors.push('Missing distribution data')
    return { isValid: false, errors, warnings, fieldName, category }
  }

  if (!data.values || !Array.isArray(data.values)) {
    errors.push('Missing or invalid values array')
    return { isValid: false, errors, warnings, fieldName, category }
  }

  if (data.values.length === 0) {
    errors.push('Empty values array')
    return { isValid: false, errors, warnings, fieldName, category }
  }

  // Field requirement validation
  errors.push(...validateFieldIsRequired(fieldName, category))

  // Dropdown compliance validation
  errors.push(...validateDropdownCompliance(data.values, fieldName, category))

  // Duplicate detection
  errors.push(...validateNoDuplicates(data.values))

  // Mode validation
  errors.push(...validateMode(data))

  // Percentage validation
  errors.push(...validatePercentages(data.values))

  // Count validation
  errors.push(...validateCounts(data))

  // Source validation
  errors.push(...validateSources(data.values))

  // Mechanistic pattern detection
  const mechanisticIssues = detectMechanisticPatterns(data.values)
  if (mechanisticIssues.length > 0) {
    errors.push(...mechanisticIssues.map(issue => `Mechanistic pattern: ${issue}`))
  }

  // Quality warnings
  warnings.push(...validateDistributionQuality(data.values))

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fieldName,
    category
  }
}

/**
 * Validate multiple fields at once
 */
export function validateMultipleFields(
  fieldsData: Record<string, DistributionData>,
  category: string
): ValidationResult[] {
  const results: ValidationResult[] = []

  for (const [fieldName, data] of Object.entries(fieldsData)) {
    const result = validateFieldData(data, fieldName, category)
    results.push(result)
  }

  return results
}

/**
 * Get validation summary statistics
 */
export function getValidationSummary(results: ValidationResult[]): {
  totalFields: number
  validFields: number
  invalidFields: number
  totalErrors: number
  totalWarnings: number
  errorRate: number
} {
  const totalFields = results.length
  const validFields = results.filter(r => r.isValid).length
  const invalidFields = totalFields - validFields
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0)
  const errorRate = totalFields > 0 ? (invalidFields / totalFields) * 100 : 0

  return {
    totalFields,
    validFields,
    invalidFields,
    totalErrors,
    totalWarnings,
    errorRate
  }
}

/**
 * Pre-generation validation - check if regeneration is needed
 */
export function needsRegeneration(
  data: DistributionData | null | undefined,
  fieldName: string,
  category: string
): boolean {
  // Missing data
  if (!data || !data.values || data.values.length === 0) {
    return true
  }

  // String field (not converted to DistributionData)
  if (typeof data === 'string') {
    return true
  }

  // Single 100% value (poor quality)
  if (data.values.length === 1 && data.values[0].percentage === 100) {
    return true
  }

  // Too few options (degraded diversity)
  if (data.values.length < 4) {
    return true
  }

  // Check for known quality issues
  const validation = validateFieldData(data, fieldName, category)
  if (!validation.isValid) {
    // Has validation errors - needs regeneration
    return true
  }

  // Check for fallback sources (indicates low quality)
  const hasFallbackSources = data.values.some(v =>
    v.source?.includes('fallback') || v.source === 'general_knowledge'
  )
  if (hasFallbackSources) {
    return true
  }

  // Appears to be good quality
  return false
}
