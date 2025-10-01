#!/usr/bin/env tsx

/**
 * Field Quality Validation Script
 *
 * Validates field data quality across solutions for a goal:
 * - Dropdown compliance
 * - No duplicate values
 * - Required field completeness
 * - Data quality assessment
 * - Mechanistic pattern detection
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { Command } from 'commander'
import chalk from 'chalk'
import fs from 'fs'

import { getRequiredFields } from './field-generation-utils/category-config'
import { validateFieldData, getValidationSummary, needsRegeneration } from './field-generation-utils/field-validator'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const program = new Command()

program
  .name('validate-field-quality')
  .description('Validate field data quality for a goal')
  .requiredOption('--goal-id <uuid>', 'Goal ID to validate')
  .option('--output-report <path>', 'Save detailed report to file')
  .option('--field-filter <fields>', 'Only validate specific fields (comma-separated)')
  .option('--category-filter <categories>', 'Only validate specific categories (comma-separated)')
  .option('--verbose', 'Verbose output with detailed issues')
  .option('--show-good-quality', 'Also show good quality fields')
  .parse()

const options = program.opts()

interface ValidationReport {
  goalId: string
  goalTitle: string
  timestamp: string
  summary: {
    totalSolutions: number
    categoriesFound: string[]
    totalFieldsChecked: number
    validFields: number
    invalidFields: number
    missingFields: number
    errorRate: number
  }
  categoryBreakdown: Record<string, {
    solutionCount: number
    requiredFields: string[]
    fieldValidation: Record<string, {
      valid: number
      invalid: number
      missing: number
      issues: string[]
    }>
  }>
  detailedIssues: Array<{
    solutionName: string
    category: string
    fieldName: string
    issues: string[]
    needsRegeneration: boolean
  }>
  recommendations: string[]
}

/**
 * Get solutions for validation
 */
async function getSolutionsData(goalId: string) {
  console.log(chalk.blue(`📊 Loading solutions for goal: ${goalId}`))

  // Get goal title
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .select('title')
    .eq('id', goalId)
    .single()

  if (goalError) {
    throw new Error(`Failed to get goal: ${goalError.message}`)
  }

  // Get solution links
  const { data: links, error: linksError } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      aggregated_fields,
      solution_variants!inner (
        solutions!inner (
          title,
          solution_category
        )
      )
    `)
    .eq('goal_id', goalId)

  if (linksError) {
    throw new Error(`Failed to get solution links: ${linksError.message}`)
  }

  if (!links || links.length === 0) {
    throw new Error(`No solutions found for goal ${goalId}`)
  }

  return {
    goalTitle: goal.title,
    solutions: links.map(link => ({
      id: link.id,
      name: (link.solution_variants as any)?.solutions?.title || 'Unknown',
      category: (link.solution_variants as any)?.solutions?.solution_category || 'unknown',
      aggregated_fields: link.aggregated_fields || {}
    }))
  }
}

/**
 * Validate a single field
 */
function validateSingleField(
  fieldData: any,
  fieldName: string,
  category: string
): {
  isValid: boolean
  issues: string[]
  needsRegeneration: boolean
} {
  // Check if field should exist
  const requiredFields = getRequiredFields(category)
  const shouldExist = requiredFields.includes(fieldName)

  if (!shouldExist) {
    return {
      isValid: true,
      issues: ['Field not required for this category'],
      needsRegeneration: false
    }
  }

  // Check if field is missing
  if (!fieldData) {
    return {
      isValid: false,
      issues: ['Field is missing'],
      needsRegeneration: true
    }
  }

  // Use validator
  const validation = validateFieldData(fieldData, fieldName, category)
  const needsRegen = needsRegeneration(fieldData, fieldName, category)

  return {
    isValid: validation.isValid,
    issues: [...validation.errors, ...validation.warnings],
    needsRegeneration: needsRegen
  }
}

/**
 * Generate validation report
 */
async function generateValidationReport(goalId: string): Promise<ValidationReport> {
  const { goalTitle, solutions } = await getSolutionsData(goalId)

  console.log(chalk.green(`✅ Loaded ${solutions.length} solutions for "${goalTitle}"`))

  // Apply filters
  const filteredSolutions = solutions.filter(solution => {
    if (options.categoryFilter) {
      const allowedCategories = options.categoryFilter.split(',')
      return allowedCategories.includes(solution.category)
    }
    return true
  })

  console.log(chalk.gray(`Validating ${filteredSolutions.length} solutions after filters`))

  // Initialize report
  const report: ValidationReport = {
    goalId,
    goalTitle,
    timestamp: new Date().toISOString(),
    summary: {
      totalSolutions: filteredSolutions.length,
      categoriesFound: [...new Set(filteredSolutions.map(s => s.category))],
      totalFieldsChecked: 0,
      validFields: 0,
      invalidFields: 0,
      missingFields: 0,
      errorRate: 0
    },
    categoryBreakdown: {},
    detailedIssues: [],
    recommendations: []
  }

  // Process each category
  for (const category of report.summary.categoriesFound) {
    const categorySolutions = filteredSolutions.filter(s => s.category === category)
    const requiredFields = getRequiredFields(category)

    // Apply field filter
    const fieldsToCheck = options.fieldFilter
      ? requiredFields.filter(field => options.fieldFilter.split(',').includes(field))
      : requiredFields

    report.categoryBreakdown[category] = {
      solutionCount: categorySolutions.length,
      requiredFields: fieldsToCheck,
      fieldValidation: {}
    }

    // Initialize field validation tracking
    for (const fieldName of fieldsToCheck) {
      report.categoryBreakdown[category].fieldValidation[fieldName] = {
        valid: 0,
        invalid: 0,
        missing: 0,
        issues: []
      }
    }

    console.log(chalk.blue(`\n🔍 Validating ${category} (${categorySolutions.length} solutions)`))

    // Validate each solution in category
    for (const solution of categorySolutions) {
      for (const fieldName of fieldsToCheck) {
        const fieldData = solution.aggregated_fields[fieldName]
        const validation = validateSingleField(fieldData, fieldName, category)

        report.summary.totalFieldsChecked++

        if (!fieldData) {
          report.summary.missingFields++
          report.categoryBreakdown[category].fieldValidation[fieldName].missing++
        } else if (validation.isValid) {
          report.summary.validFields++
          report.categoryBreakdown[category].fieldValidation[fieldName].valid++

          if (options.showGoodQuality) {
            console.log(chalk.green(`  ✅ ${solution.name}: ${fieldName} - OK`))
          }
        } else {
          report.summary.invalidFields++
          report.categoryBreakdown[category].fieldValidation[fieldName].invalid++

          // Collect unique issues for this field
          for (const issue of validation.issues) {
            const existingIssues = report.categoryBreakdown[category].fieldValidation[fieldName].issues
            if (!existingIssues.includes(issue)) {
              existingIssues.push(issue)
            }
          }

          // Add to detailed issues
          report.detailedIssues.push({
            solutionName: solution.name,
            category,
            fieldName,
            issues: validation.issues,
            needsRegeneration: validation.needsRegeneration
          })

          if (options.verbose) {
            console.log(chalk.red(`  ❌ ${solution.name}: ${fieldName} - ${validation.issues.join(', ')}`))
          }
        }
      }
    }
  }

  // Calculate error rate
  const totalChecked = report.summary.totalFieldsChecked
  if (totalChecked > 0) {
    report.summary.errorRate = ((report.summary.invalidFields + report.summary.missingFields) / totalChecked) * 100
  }

  // Generate recommendations
  report.recommendations = generateRecommendations(report)

  return report
}

/**
 * Generate recommendations based on validation results
 */
function generateRecommendations(report: ValidationReport): string[] {
  const recommendations: string[] = []

  if (report.summary.errorRate > 10) {
    recommendations.push(`HIGH ERROR RATE: ${report.summary.errorRate.toFixed(1)}% of fields have issues - consider V3 regeneration`)
  }

  if (report.summary.missingFields > 0) {
    recommendations.push(`${report.summary.missingFields} missing fields detected - run field generation`)
  }

  // Category-specific recommendations
  for (const [category, breakdown] of Object.entries(report.categoryBreakdown)) {
    const categoryIssues = Object.values(breakdown.fieldValidation)
      .reduce((sum, field) => sum + field.invalid + field.missing, 0)

    const categoryTotal = breakdown.solutionCount * breakdown.requiredFields.length
    const categoryErrorRate = categoryTotal > 0 ? (categoryIssues / categoryTotal) * 100 : 0

    if (categoryErrorRate > 20) {
      recommendations.push(`${category} category has ${categoryErrorRate.toFixed(1)}% error rate - focus regeneration here`)
    }
  }

  // Field-specific recommendations
  const fieldIssueCount: Record<string, number> = {}
  for (const issue of report.detailedIssues) {
    fieldIssueCount[issue.fieldName] = (fieldIssueCount[issue.fieldName] || 0) + 1
  }

  const problematicFields = Object.entries(fieldIssueCount)
    .filter(([_, count]) => count > 3)
    .sort((a, b) => b[1] - a[1])

  for (const [fieldName, count] of problematicFields.slice(0, 3)) {
    recommendations.push(`${fieldName} field has ${count} issues across solutions - regenerate this field specifically`)
  }

  if (recommendations.length === 0) {
    recommendations.push('All fields appear to be in good condition - no immediate action needed')
  }

  return recommendations
}

/**
 * Display validation report
 */
function displayReport(report: ValidationReport): void {
  console.log(chalk.green('\n🎉 Validation Complete!'))
  console.log(chalk.blue('\n📊 Summary:'))
  console.log(chalk.gray(`   Goal: "${report.goalTitle}"`))
  console.log(chalk.gray(`   Solutions: ${report.summary.totalSolutions}`))
  console.log(chalk.gray(`   Categories: ${report.summary.categoriesFound.length} (${report.summary.categoriesFound.join(', ')})`))
  console.log(chalk.gray(`   Fields checked: ${report.summary.totalFieldsChecked}`))

  // Quality metrics
  console.log(chalk.blue('\n📈 Quality Metrics:'))
  console.log(chalk.green(`   ✅ Valid fields: ${report.summary.validFields}`))
  console.log(chalk.red(`   ❌ Invalid fields: ${report.summary.invalidFields}`))
  console.log(chalk.yellow(`   ⚠️  Missing fields: ${report.summary.missingFields}`))

  const errorRate = report.summary.errorRate
  const errorColor = errorRate > 10 ? chalk.red : errorRate > 5 ? chalk.yellow : chalk.green
  console.log(errorColor(`   📊 Error rate: ${errorRate.toFixed(1)}%`))

  // Category breakdown
  console.log(chalk.blue('\n📂 Category Breakdown:'))
  for (const [category, breakdown] of Object.entries(report.categoryBreakdown)) {
    const total = breakdown.solutionCount * breakdown.requiredFields.length
    const issues = Object.values(breakdown.fieldValidation)
      .reduce((sum, field) => sum + field.invalid + field.missing, 0)
    const categoryErrorRate = total > 0 ? (issues / total) * 100 : 0

    const statusColor = categoryErrorRate > 10 ? chalk.red : categoryErrorRate > 5 ? chalk.yellow : chalk.green
    console.log(statusColor(`   ${category}: ${issues}/${total} issues (${categoryErrorRate.toFixed(1)}%)`))

    if (options.verbose && issues > 0) {
      for (const [fieldName, fieldStats] of Object.entries(breakdown.fieldValidation)) {
        if (fieldStats.invalid > 0 || fieldStats.missing > 0) {
          console.log(chalk.gray(`     ${fieldName}: ${fieldStats.invalid} invalid, ${fieldStats.missing} missing`))
          if (fieldStats.issues.length > 0) {
            console.log(chalk.gray(`       Issues: ${fieldStats.issues.slice(0, 3).join(', ')}`))
          }
        }
      }
    }
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    console.log(chalk.blue('\n💡 Recommendations:'))
    for (const rec of report.recommendations) {
      console.log(chalk.yellow(`   • ${rec}`))
    }
  }

  // Next steps
  console.log(chalk.blue('\n🎯 Next Steps:'))
  if (errorRate > 5) {
    console.log(chalk.white('   1. Run V3 generation to fix identified issues'))
    console.log(chalk.white('   2. Focus on problematic categories/fields'))
    console.log(chalk.white('   3. Re-validate after regeneration'))
  } else {
    console.log(chalk.white('   1. Data quality looks good - ready for testing'))
    console.log(chalk.white('   2. Consider spot-checking on frontend'))
  }
}

/**
 * Main validation function
 */
async function main(): Promise<void> {
  try {
    console.log(chalk.blue('🔍 WWFM Field Quality Validator'))
    console.log(chalk.gray('==================================='))

    const report = await generateValidationReport(options.goalId)

    displayReport(report)

    // Save report if requested
    if (options.outputReport) {
      fs.writeFileSync(options.outputReport, JSON.stringify(report, null, 2))
      console.log(chalk.green(`\n💾 Report saved to: ${options.outputReport}`))
    }

  } catch (error) {
    console.error(chalk.red(`❌ Validation failed: ${error.message}`))

    if (error.stack && options.verbose) {
      console.error(chalk.gray(error.stack))
    }

    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { generateValidationReport, validateSingleField }