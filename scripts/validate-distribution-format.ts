#!/usr/bin/env tsx

/**
 * WWFM Distribution Format Validator
 *
 * Validates that AI data is properly formatted as DistributionData
 * and checks display compatibility.
 */

import { createClient } from '@supabase/supabase-js'
import chalk from 'chalk'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

interface ValidationResult {
  isValid: boolean
  issues: string[]
  fieldName: string
  fieldValue: any
}

/**
 * Validate a single field is in proper DistributionData format
 */
function validateDistributionField(fieldName: string, fieldValue: any): ValidationResult {
  const issues: string[] = []

  // Check if it's an object (DistributionData format)
  if (typeof fieldValue !== 'object' || fieldValue === null) {
    return {
      isValid: false,
      issues: ['Field is not an object (should be DistributionData format)'],
      fieldName,
      fieldValue
    }
  }

  // Check for required DistributionData properties
  const requiredProps = ['mode', 'values', 'totalReports', 'dataSource']
  for (const prop of requiredProps) {
    if (!(prop in fieldValue)) {
      issues.push(`Missing required property: ${prop}`)
    }
  }

  // Validate values array
  if (fieldValue.values) {
    if (!Array.isArray(fieldValue.values)) {
      issues.push('values should be an array')
    } else {
      for (let i = 0; i < fieldValue.values.length; i++) {
        const value = fieldValue.values[i]
        if (!value.value || typeof value.percentage !== 'number') {
          issues.push(`values[${i}] missing required properties (value, percentage)`)
        }
      }
    }
  }

  // Validate percentages sum to 100 (with tolerance)
  if (fieldValue.values && Array.isArray(fieldValue.values)) {
    const totalPercentage = fieldValue.values.reduce((sum: number, v: any) => sum + (v.percentage || 0), 0)
    if (Math.abs(totalPercentage - 100) > 2) {
      issues.push(`Percentages sum to ${totalPercentage}, should be ~100`)
    }
  }

  // Validate AI marker
  if (fieldValue.dataSource !== 'ai_research') {
    issues.push(`dataSource should be 'ai_research', got '${fieldValue.dataSource}'`)
  }

  // Validate totalReports is 100 (for AI)
  if (fieldValue.totalReports !== 100) {
    issues.push(`totalReports should be 100 for AI data, got ${fieldValue.totalReports}`)
  }

  return {
    isValid: issues.length === 0,
    issues,
    fieldName,
    fieldValue
  }
}

/**
 * Validate solution_fields format for a single solution
 */
function validateSolutionFields(solutionFields: any): {
  isValid: boolean
  validFields: number
  invalidFields: ValidationResult[]
  rawFields: string[]
} {
  if (!solutionFields || typeof solutionFields !== 'object') {
    return {
      isValid: false,
      validFields: 0,
      invalidFields: [],
      rawFields: []
    }
  }

  const invalidFields: ValidationResult[] = []
  const rawFields: string[] = []
  let validFields = 0

  // Fields that should be in DistributionData format
  const distributionFields = [
    'side_effects', 'challenges', 'time_to_results', 'frequency', 'cost',
    'length_of_use', 'format', 'learning_difficulty', 'time_commitment',
    'startup_cost', 'ongoing_cost', 'time_to_complete', 'subscription_type',
    'specialty', 'wait_time', 'skincare_frequency', 'usage_frequency',
    'session_frequency', 'common_challenges', 'potential_side_effects'
  ]

  for (const [fieldName, fieldValue] of Object.entries(solutionFields)) {
    if (distributionFields.includes(fieldName)) {
      const validation = validateDistributionField(fieldName, fieldValue)
      if (validation.isValid) {
        validFields++
      } else {
        invalidFields.push(validation)
      }
    } else {
      // Check if it's a raw array/string that should have been transformed
      if (Array.isArray(fieldValue) || typeof fieldValue === 'string') {
        rawFields.push(fieldName)
      }
    }
  }

  return {
    isValid: invalidFields.length === 0 && rawFields.length === 0,
    validFields,
    invalidFields,
    rawFields
  }
}

async function main() {
  console.log(chalk.cyan('🔍 WWFM Distribution Format Validator'))
  console.log(chalk.cyan('━'.repeat(50)))

  // Query AI solutions to validate
  const { data: solutions, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      goal_id,
      solution_fields,
      solution_variants!inner(
        solutions!inner(
          id,
          title,
          solution_category
        )
      )
    `)
    .eq('data_display_mode', 'ai')
    .not('solution_fields', 'is', null)
    .neq('solution_fields', '{}')
    .limit(1000)

  if (error) {
    console.error(chalk.red('❌ Error fetching solutions:'), error)
    process.exit(1)
  }

  if (!solutions || solutions.length === 0) {
    console.log(chalk.yellow('No AI solutions found to validate'))
    process.exit(0)
  }

  console.log(chalk.green(`✅ Found ${solutions.length} AI solutions to validate\n`))

  // Validation statistics
  const stats = {
    total: 0,
    fullyValid: 0,
    partiallyValid: 0,
    invalid: 0,
    totalValidFields: 0,
    totalInvalidFields: 0,
    totalRawFields: 0
  }

  const issues: { [category: string]: number } = {}
  const worstSolutions: any[] = []

  // Validate each solution
  for (const link of solutions) {
    stats.total++
    const solution = link.solution_variants?.solutions

    if (!solution) {
      stats.invalid++
      continue
    }

    const validation = validateSolutionFields(link.solution_fields)

    if (validation.isValid) {
      stats.fullyValid++
    } else if (validation.validFields > 0) {
      stats.partiallyValid++
    } else {
      stats.invalid++
    }

    stats.totalValidFields += validation.validFields
    stats.totalInvalidFields += validation.invalidFields.length
    stats.totalRawFields += validation.rawFields.length

    // Track issues by category
    const category = solution.solution_category
    if (!issues[category]) issues[category] = 0
    if (!validation.isValid) issues[category]++

    // Collect worst offenders
    if (validation.invalidFields.length > 0 || validation.rawFields.length > 0) {
      worstSolutions.push({
        solution: solution.title,
        category: solution.solution_category,
        validFields: validation.validFields,
        invalidFields: validation.invalidFields.length,
        rawFields: validation.rawFields.length,
        details: {
          invalidFields: validation.invalidFields.map(f => f.fieldName),
          rawFields: validation.rawFields
        }
      })
    }
  }

  // Output results
  console.log(chalk.cyan('📊 VALIDATION SUMMARY'))
  console.log(chalk.cyan('━'.repeat(30)))
  console.log(chalk.green(`✅ Fully valid: ${stats.fullyValid} (${Math.round(stats.fullyValid/stats.total*100)}%)`))
  console.log(chalk.yellow(`⚠️  Partially valid: ${stats.partiallyValid} (${Math.round(stats.partiallyValid/stats.total*100)}%)`))
  console.log(chalk.red(`❌ Invalid: ${stats.invalid} (${Math.round(stats.invalid/stats.total*100)}%)`))
  console.log('')
  console.log(chalk.blue(`📈 Field-level stats:`))
  console.log(chalk.green(`   Valid fields: ${stats.totalValidFields}`))
  console.log(chalk.red(`   Invalid fields: ${stats.totalInvalidFields}`))
  console.log(chalk.yellow(`   Raw fields (need transformation): ${stats.totalRawFields}`))

  // Issues by category
  if (Object.keys(issues).length > 0) {
    console.log(chalk.cyan('\n📂 Issues by Category:'))
    const sortedCategories = Object.entries(issues).sort(([,a], [,b]) => b - a)
    for (const [category, count] of sortedCategories) {
      const percentage = Math.round(count / stats.total * 100)
      console.log(chalk.yellow(`   ${category}: ${count} solutions (${percentage}%)`))
    }
  }

  // Worst offenders
  if (worstSolutions.length > 0) {
    console.log(chalk.cyan('\n🔴 Top 10 Solutions Needing Fixes:'))
    worstSolutions
      .sort((a, b) => (b.invalidFields + b.rawFields) - (a.invalidFields + a.rawFields))
      .slice(0, 10)
      .forEach(sol => {
        console.log(chalk.red(`\n   ${sol.solution} (${sol.category})`))
        console.log(chalk.yellow(`   Valid: ${sol.validFields}, Invalid: ${sol.invalidFields}, Raw: ${sol.rawFields}`))
        if (sol.details.invalidFields.length > 0) {
          console.log(chalk.red(`   Invalid fields: ${sol.details.invalidFields.join(', ')}`))
        }
        if (sol.details.rawFields.length > 0) {
          console.log(chalk.yellow(`   Raw fields: ${sol.details.rawFields.join(', ')}`))
        }
      })
  }

  // Success criteria
  console.log(chalk.cyan('\n🎯 Success Criteria:'))
  const successRate = stats.fullyValid / stats.total * 100
  if (successRate >= 95) {
    console.log(chalk.green(`✅ SUCCESS: ${successRate.toFixed(1)}% of solutions are fully valid (≥95% target)`))
  } else {
    console.log(chalk.red(`❌ NEEDS WORK: ${successRate.toFixed(1)}% valid (need ≥95%)`))
  }

  if (stats.totalRawFields === 0) {
    console.log(chalk.green(`✅ SUCCESS: No raw fields remain (all transformed)`))
  } else {
    console.log(chalk.red(`❌ NEEDS WORK: ${stats.totalRawFields} raw fields still need transformation`))
  }

  console.log(chalk.cyan('\n' + '━'.repeat(50)))
  console.log(chalk.cyan('✅ Validation complete!'))
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('Fatal error:'), error)
    process.exit(1)
  })
}