/**
 * Array Field Validator for Claude Web Generator
 *
 * HIGH PRIORITY: Validates side_effects and challenges fields have proper
 * percentage distributions (addresses critical issue found in Gemini data)
 */

import { getArrayField } from '../../../lib/config/solution-fields'

export interface ArrayFieldValidationResult {
  passed: boolean
  fieldName?: string
  issues: string[]
  severity: 'critical' | 'moderate' | 'minor'
}

export interface DistributionValue {
  value: string
  percentage: number
  count?: number
  source?: string
}

export interface DistributionData {
  mode?: string
  values: DistributionValue[]
  totalReports?: number
  dataSource?: string
}

/**
 * Validate array field (side_effects or challenges) has proper structure
 */
export function validateArrayField(
  solution: {
    title: string
    category: string
    fields: Record<string, any>
  }
): ArrayFieldValidationResult {
  const arrayFieldName = getArrayField(solution.category)

  // If category doesn't require array field, pass
  if (!arrayFieldName) {
    return {
      passed: true,
      issues: [],
      severity: 'minor'
    }
  }

  const issues: string[] = []
  const fieldData = solution.fields[arrayFieldName]

  // Check 1: Field exists
  if (!fieldData) {
    return {
      passed: false,
      fieldName: arrayFieldName,
      issues: [`Missing required array field: ${arrayFieldName}`],
      severity: 'critical'
    }
  }

  // Check 2: Has values array
  if (!fieldData.values || !Array.isArray(fieldData.values)) {
    return {
      passed: false,
      fieldName: arrayFieldName,
      issues: [`${arrayFieldName} missing or invalid 'values' array`],
      severity: 'critical'
    }
  }

  // Check 3: All values have percentages
  const missingPercentages = fieldData.values.filter((v: DistributionValue) =>
    v.percentage === undefined ||
    v.percentage === null ||
    typeof v.percentage !== 'number'
  )

  if (missingPercentages.length > 0) {
    issues.push(
      `${arrayFieldName}: ${missingPercentages.length} values missing percentages`
    )
  }

  // Check 4: Percentages sum to 100
  const total = fieldData.values.reduce(
    (sum: number, v: DistributionValue) => sum + (v.percentage || 0),
    0
  )

  if (Math.abs(total - 100) > 0.1) {
    issues.push(
      `${arrayFieldName}: Percentages sum to ${total.toFixed(1)}%, not 100%`
    )
  }

  // Check 5: Minimum diversity (4+ options)
  if (fieldData.values.length < 4) {
    issues.push(
      `${arrayFieldName}: Only ${fieldData.values.length} options (need 4+ for diversity)`
    )
  }

  // Check 6: No single value at 100%
  const singleValueAt100 = fieldData.values.find(
    (v: DistributionValue) => v.percentage >= 99
  )

  if (singleValueAt100 && fieldData.values.length === 1) {
    issues.push(
      `${arrayFieldName}: Single value at 100% (need diverse distribution)`
    )
  }

  // Check 7: No equal splits (mechanistic data)
  if (fieldData.values.length >= 3) {
    const percentages = fieldData.values.map((v: DistributionValue) => v.percentage)
    const allEqual = percentages.every((p: number) => Math.abs(p - percentages[0]) < 1)

    if (allEqual) {
      issues.push(
        `${arrayFieldName}: Equal percentage splits (${percentages[0]}% each) - needs evidence-based variety`
      )
    }
  }

  const severity = issues.length === 0 ? 'minor' :
                   issues.some(i => i.includes('missing') || i.includes('sum to')) ? 'critical' :
                   'moderate'

  return {
    passed: issues.length === 0,
    fieldName: arrayFieldName,
    issues,
    severity
  }
}

/**
 * Validate ALL key fields (not just array fields) have proper distributions
 */
export function validateAllFieldDistributions(
  solution: {
    title: string
    category: string
    fields: Record<string, any>
  }
): ArrayFieldValidationResult[] {
  const results: ArrayFieldValidationResult[] = []

  // Validate array field if exists
  const arrayFieldResult = validateArrayField(solution)
  if (arrayFieldResult.fieldName) {
    results.push(arrayFieldResult)
  }

  // Validate key fields (time_to_results, cost, frequency, etc.)
  for (const [fieldName, fieldData] of Object.entries(solution.fields)) {
    // Skip non-distribution fields
    if (!fieldData?.values || !Array.isArray(fieldData.values)) continue

    const issues: string[] = []

    // Check diversity
    if (fieldData.values.length < 3) {
      issues.push(`${fieldName}: Only ${fieldData.values.length} options (recommend 5+)`)
    }

    // Check percentages exist and sum correctly
    const hasPercentages = fieldData.values.every((v: DistributionValue) =>
      typeof v.percentage === 'number'
    )

    if (hasPercentages) {
      const total = fieldData.values.reduce(
        (sum: number, v: DistributionValue) => sum + (v.percentage || 0),
        0
      )

      if (Math.abs(total - 100) > 0.1) {
        issues.push(`${fieldName}: Percentages sum to ${total.toFixed(1)}%`)
      }
    }

    if (issues.length > 0) {
      results.push({
        passed: false,
        fieldName,
        issues,
        severity: 'moderate'
      })
    }
  }

  return results
}

/**
 * Generate validation report for batch of solutions
 */
export function generateArrayFieldReport(
  solutions: Array<{
    title: string
    category: string
    fields: Record<string, any>
  }>
): {
  totalSolutions: number
  passedValidation: number
  failedValidation: number
  criticalIssues: number
  moderateIssues: number
  issuesByType: Record<string, number>
} {
  const report = {
    totalSolutions: solutions.length,
    passedValidation: 0,
    failedValidation: 0,
    criticalIssues: 0,
    moderateIssues: 0,
    issuesByType: {} as Record<string, number>
  }

  for (const solution of solutions) {
    const result = validateArrayField(solution)

    if (result.passed) {
      report.passedValidation++
    } else {
      report.failedValidation++

      if (result.severity === 'critical') {
        report.criticalIssues++
      } else if (result.severity === 'moderate') {
        report.moderateIssues++
      }

      // Count issue types
      for (const issue of result.issues) {
        const issueType = issue.split(':')[0]
        report.issuesByType[issueType] = (report.issuesByType[issueType] || 0) + 1
      }
    }
  }

  return report
}

/**
 * Auto-fix array field issues if possible
 */
export function autoFixArrayField(
  solution: {
    title: string
    category: string
    fields: Record<string, any>
  }
): {
  fixed: boolean
  changes: string[]
  solution: typeof solution
} {
  const changes: string[] = []
  const arrayFieldName = getArrayField(solution.category)

  if (!arrayFieldName || !solution.fields[arrayFieldName]) {
    return { fixed: false, changes, solution }
  }

  const fieldData = solution.fields[arrayFieldName]

  // Can't auto-fix if missing percentages entirely
  if (!fieldData.values || fieldData.values.length === 0) {
    return { fixed: false, changes, solution }
  }

  // Auto-fix: Normalize percentages to sum to 100
  const total = fieldData.values.reduce(
    (sum: number, v: DistributionValue) => sum + (v.percentage || 0),
    0
  )

  if (Math.abs(total - 100) > 0.1 && total > 0) {
    const normalized = fieldData.values.map((v: DistributionValue) => ({
      ...v,
      percentage: Math.round((v.percentage / total) * 100)
    }))

    solution.fields[arrayFieldName] = {
      ...fieldData,
      values: normalized
    }

    changes.push(`Normalized ${arrayFieldName} percentages from ${total.toFixed(1)}% to 100%`)
  }

  return {
    fixed: changes.length > 0,
    changes,
    solution
  }
}
