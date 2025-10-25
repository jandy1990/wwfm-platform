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

import { DROPDOWN_OPTIONS } from '../../config/solution-dropdown-options'
import { getDropdownSource, getRequiredFields } from './category'

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

function detectMechanisticPatterns(values: DistributionValue[]): string[] {
  const issues: string[] = []

  if (values.length === 0) {
    issues.push('No values in distribution')
    return issues
  }

  const percentages = [...values.map(v => v.percentage)].sort((a, b) => a - b)

  if (new Set(percentages).size === 1 && values.length > 2) {
    issues.push(`Equal split pattern detected: all values at ${percentages[0]}%`)
  }

  if (values.length === 4 && percentages.every(p => p === 25)) {
    issues.push('Perfect 25% split - appears mechanistic')
  }

  if (values.length === 5 && percentages.every(p => p === 20)) {
    issues.push('Perfect 20% split - appears mechanistic')
  }

  if (values.length >= 3) {
    const difference = percentages[1] - percentages[0]
    const isArithmetic = percentages.every((value, index, arr) => {
      if (index === 0) return true
      return Math.abs(value - arr[index - 1] - difference) <= 1
    })
    if (isArithmetic && difference > 0) {
      issues.push(`Arithmetic sequence pattern detected (${difference}% intervals)`)
    }
  }

  return issues
}

function validateDropdownCompliance(values: DistributionValue[], fieldName: string, category: string): string[] {
  const errors: string[] = []

  try {
    const dropdownSource = getDropdownSource(fieldName, category)
    const validOptions = DROPDOWN_OPTIONS[dropdownSource]

    if (!validOptions || !Array.isArray(validOptions)) {
      errors.push(`No dropdown options found for ${dropdownSource}`)
      return errors
    }

    for (const item of values) {
      const exactMatch = validOptions.includes(item.value)
      if (!exactMatch) {
        const caseInsensitiveMatch = validOptions.find(opt => opt.toLowerCase() === item.value.toLowerCase())

        if (caseInsensitiveMatch) {
          errors.push(`Case mismatch for "${item.value}" - should be "${caseInsensitiveMatch}"`)
        } else {
          errors.push(
            `Invalid value "${item.value}" for ${fieldName}. Valid options: ${validOptions.slice(0, 3).join(', ')}...`
          )
        }
      }
    }
  } catch (error: any) {
    errors.push(`Dropdown validation failed: ${error.message}`)
  }

  return errors
}

function validateMode(data: DistributionData): string[] {
  const errors: string[] = []

  if (!data.mode) {
    errors.push('Missing mode value')
    return errors
  }

  const modeExists = data.values.some(v => v.value === data.mode)
  if (!modeExists) {
    const caseInsensitiveMatch = data.values.find(v => v.value.toLowerCase() === data.mode.toLowerCase())

    if (caseInsensitiveMatch) {
      errors.push(`Mode case mismatch: "${data.mode}" should be "${caseInsensitiveMatch.value}"`)
    } else {
      errors.push(`Mode "${data.mode}" is not in values list`)
    }
  }

  return errors
}

function validatePercentages(values: DistributionValue[]): string[] {
  const errors: string[] = []

  const totalPercentage = values.reduce((sum, v) => sum + v.percentage, 0)
  if (totalPercentage !== 100) {
    errors.push(`Percentages must sum to 100 (received ${totalPercentage})`)
  }

  for (const value of values) {
    if (value.percentage <= 0) {
      errors.push(`Invalid percentage for "${value.value}": ${value.percentage}`)
    }
  }

  return errors
}

function validateSources(values: DistributionValue[]): string[] {
  const errors: string[] = []

  for (const value of values) {
    if (!VALID_SOURCES.has(value.source)) {
      errors.push(`Invalid source "${value.source}" for "${value.value}"`)
    }
  }

  return errors
}

export function validateFieldData(
  data: DistributionData,
  fieldName: string,
  category: string
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Field data missing or not an object'],
      warnings: [],
      fieldName,
      category
    }
  }

  if (!Array.isArray(data.values)) {
    errors.push('Missing values array')
    return { isValid: false, errors, warnings, fieldName, category }
  }

  if (data.values.length < 4) {
    warnings.push(`Low diversity distribution (${data.values.length} values)`)
  }

  errors.push(...validateDropdownCompliance(data.values, fieldName, category))
  errors.push(...validateMode(data))
  errors.push(...validatePercentages(data.values))
  errors.push(...validateSources(data.values))
  warnings.push(...detectMechanisticPatterns(data.values))

  if (typeof data.totalReports !== 'number' || data.totalReports <= 0) {
    warnings.push('totalReports should be a positive number (default 100 recommended)')
  }

  if (data.dataSource !== 'ai_training_data') {
    warnings.push(`Unexpected dataSource "${data.dataSource}" (expected "ai_training_data")`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fieldName,
    category
  }
}

export function needsRegeneration(
  data: unknown,
  fieldName: string,
  category: string
): boolean {
  if (!data || typeof data !== 'object') return true

  const distribution = data as Partial<DistributionData>
  if (!distribution.mode || !Array.isArray(distribution.values)) return true

  const result = validateFieldData(distribution as DistributionData, fieldName, category)
  return !result.isValid
}

export function getValidationSummary(results: ValidationResult[]) {
  const summary: Record<string, any> = {}

  for (const result of results) {
    if (!summary[result.category]) {
      summary[result.category] = {
        fieldsValidated: 0,
        valid: 0,
        invalid: 0,
        warnings: 0,
        errors: []
      }
    }

    const categorySummary = summary[result.category]
    categorySummary.fieldsValidated++
    if (result.isValid) {
      categorySummary.valid++
    } else {
      categorySummary.invalid++
      categorySummary.errors.push({
        field: result.fieldName,
        errors: result.errors
      })
    }

    if (result.warnings.length > 0) {
      categorySummary.warnings += result.warnings.length
    }
  }

  return summary
}

export function ensureRequiredFieldsPresent(
  fields: Record<string, unknown>,
  category: string
): string[] {
  const missing: string[] = []
  const required = getRequiredFields(category)

  for (const field of required) {
    if (fields[field] === undefined || fields[field] === null) {
      missing.push(field)
    }
  }

  return missing
}
