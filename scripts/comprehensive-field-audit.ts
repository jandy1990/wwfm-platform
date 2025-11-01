#!/usr/bin/env tsx

/**
 * COMPREHENSIVE FIELD AUDIT - ALL DISPLAY FIELDS
 *
 * This script audits ALL fields that are displayed on solution cards
 * for each category, not just side_effects, challenges, and cost.
 *
 * Based on GoalPageClient.tsx CATEGORY_CONFIGS, it checks:
 * - ALL keyFields per category (~30 unique fields)
 * - ALL arrayFields per category (side_effects, challenges)
 * - Cost source fields (cost, startup_cost, ongoing_cost)
 * - Supplementary fields (notes)
 */

import { createClient } from '@supabase/supabase-js'
import chalk from 'chalk'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Complete mapping from GoalPageClient.tsx
const CATEGORY_DISPLAY_FIELDS: Record<string, { keyFields: string[], arrayField: string | null }> = {
  // DOSAGE FORMS (4 categories) - all show side_effects
  'medications': {
    keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },
  'supplements_vitamins': {
    keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },
  'natural_remedies': {
    keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },
  'beauty_skincare': {
    keyFields: ['time_to_results', 'skincare_frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },

  // PRACTICE FORMS (3 categories mapped) - all show challenges
  'meditation_mindfulness': {
    keyFields: ['time_to_results', 'practice_length', 'frequency'],
    arrayField: 'challenges'
  },
  'exercise_movement': {
    keyFields: ['time_to_results', 'frequency', 'cost'],
    arrayField: 'challenges'
  },
  'habits_routines': {
    keyFields: ['time_to_results', 'time_commitment', 'cost'],
    arrayField: 'challenges'
  },

  // SESSION FORMS (7 categories) - varied array fields
  'therapists_counselors': {
    keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
    arrayField: 'challenges'
  },
  'doctors_specialists': {
    keyFields: ['time_to_results', 'wait_time', 'insurance_coverage', 'cost'],
    arrayField: 'challenges'
  },
  'coaches_mentors': {
    keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
    arrayField: 'challenges'
  },
  'alternative_practitioners': {
    keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
    arrayField: 'side_effects' // NOTE: This one shows side_effects, not challenges!
  },
  'professional_services': {
    keyFields: ['time_to_results', 'session_frequency', 'specialty', 'cost'],
    arrayField: 'challenges'
  },
  'medical_procedures': {
    keyFields: ['time_to_results', 'session_frequency', 'wait_time', 'cost'],
    arrayField: 'side_effects' // Shows side_effects
  },
  'crisis_resources': {
    keyFields: ['time_to_results', 'response_time', 'cost'],
    arrayField: null // No array field shown
  },

  // LIFESTYLE FORMS (2 categories mapped) - all show challenges
  'diet_nutrition': {
    keyFields: ['time_to_results', 'weekly_prep_time', 'still_following', 'cost'],
    arrayField: 'challenges'
  },
  'sleep': {
    keyFields: ['time_to_results', 'sleep_quality_change', 'still_following', 'cost'],
    arrayField: 'challenges'
  },

  // PURCHASE FORMS (2 categories) - all show challenges
  'products_devices': {
    keyFields: ['time_to_results', 'ease_of_use', 'product_type', 'cost'],
    arrayField: 'challenges'
  },
  'books_courses': {
    keyFields: ['time_to_results', 'format', 'learning_difficulty', 'cost'],
    arrayField: 'challenges'
  },

  // APP FORM (1 category) - shows challenges
  'apps_software': {
    keyFields: ['time_to_results', 'usage_frequency', 'subscription_type', 'cost'],
    arrayField: 'challenges'
  },

  // COMMUNITY FORMS (2 categories) - all show challenges
  'groups_communities': {
    keyFields: ['time_to_results', 'meeting_frequency', 'group_size', 'cost'],
    arrayField: 'challenges'
  },
  'support_groups': {
    keyFields: ['time_to_results', 'meeting_frequency', 'format', 'cost'],
    arrayField: 'challenges'
  },

  // HOBBY FORM (1 category) - shows challenges
  'hobbies_activities': {
    keyFields: ['time_to_results', 'time_commitment', 'frequency', 'cost'],
    arrayField: 'challenges'
  },

  // FINANCIAL FORM (1 category) - shows challenges
  'financial_products': {
    keyFields: ['time_to_results', 'financial_benefit', 'access_time'],
    arrayField: 'challenges'
  },

  // DEFAULT for unmapped categories
  'other': {
    keyFields: ['time_to_results', 'format', 'frequency', 'cost'],
    arrayField: null
  }
}

interface FieldStats {
  fieldName: string
  totalMissing: number
  totalApplicable: number
  percentageMissing: number
  categoriesUsingField: string[]
}

interface CategoryAudit {
  category: string
  totalSolutions: number
  allRequiredFields: string[]
  missingFieldCounts: Record<string, number>
  missingFieldPercentages: Record<string, number>
  criticalMissing: string[]
}

async function auditCategory(category: string): Promise<CategoryAudit> {
  // Get all AI solutions for this category
  const { data: solutions, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      solution_fields,
      solution_variants!inner(
        solutions!inner(
          solution_category
        )
      )
    `)
    .eq('data_display_mode', 'ai')
    .eq('solution_variants.solutions.solution_category', category)

  if (error) {
    throw new Error(`Error querying ${category}: ${error.message}`)
  }

  const totalSolutions = solutions?.length || 0
  const categoryConfig = CATEGORY_DISPLAY_FIELDS[category] || CATEGORY_DISPLAY_FIELDS['other']

  // Get ALL fields that should be present for this category
  const allRequiredFields = [...categoryConfig.keyFields]
  if (categoryConfig.arrayField) {
    allRequiredFields.push(categoryConfig.arrayField)
  }

  // Add cost source fields and supplementary fields
  const costSourceFields = ['startup_cost', 'ongoing_cost'] // 'cost' already in keyFields for most
  const supplementaryFields = ['notes']
  const allFieldsToCheck = [...new Set([...allRequiredFields, ...costSourceFields, ...supplementaryFields])]

  const missingFieldCounts: Record<string, number> = {}
  const missingFieldPercentages: Record<string, number> = {}

  for (const field of allFieldsToCheck) {
    let missingCount = 0

    for (const solution of solutions || []) {
      const fields = solution.solution_fields || {}
      let hasField = false

      // Special handling for cost field - check if ANY cost field is present
      if (field === 'cost') {
        hasField = !!(fields.cost || fields.startup_cost || fields.ongoing_cost)
      } else {
        // Check if field is missing or empty
        hasField = !!(fields[field] &&
                      !(typeof fields[field] === 'object' && Object.keys(fields[field]).length === 0) &&
                      !(Array.isArray(fields[field]) && fields[field].length === 0))
      }

      if (!hasField) {
        missingCount++
      }
    }

    missingFieldCounts[field] = missingCount
    missingFieldPercentages[field] = totalSolutions > 0
      ? Math.round((missingCount / totalSolutions) * 100)
      : 0
  }

  // Identify critical missing fields (>10% missing from display fields)
  const criticalMissing = allFieldsToCheck.filter((field: string) =>
    missingFieldPercentages[field] > 10
  )

  return {
    category,
    totalSolutions,
    allRequiredFields: allFieldsToCheck,
    missingFieldCounts,
    missingFieldPercentages,
    criticalMissing
  }
}

async function main() {
  console.log(chalk.cyan('📊 COMPREHENSIVE FIELD AUDIT - ALL DISPLAY FIELDS'))
  console.log(chalk.cyan('━'.repeat(70)))
  console.log('')

  const categories = Object.keys(CATEGORY_DISPLAY_FIELDS).filter(c => c !== 'other').sort()
  const results: CategoryAudit[] = []

  // Track overall field statistics
  let totalSolutionsAudited = 0
  const overallFieldStats: Record<string, FieldStats> = {}

  for (const category of categories) {
    try {
      const audit = await auditCategory(category)
      results.push(audit)
      totalSolutionsAudited += audit.totalSolutions

      // Print category results
      console.log(chalk.yellow(`\n${category.toUpperCase()}`))
      console.log(chalk.white(`  Solutions: ${audit.totalSolutions}`))
      console.log(chalk.white(`  Display fields: ${audit.allRequiredFields.length} total`))

      // Show fields with >50% missing data
      const criticalFields = audit.allRequiredFields.filter(field =>
        audit.missingFieldPercentages[field] > 50
      )

      if (criticalFields.length > 0) {
        console.log(chalk.red(`  ⚠️  High missing rate (>50%):`))
        for (const field of criticalFields) {
          console.log(chalk.red(`     - ${field}: ${audit.missingFieldCounts[field]}/${audit.totalSolutions} missing (${audit.missingFieldPercentages[field]}%)`))
        }
      }

      // Track overall field statistics
      for (const field of audit.allRequiredFields) {
        if (!overallFieldStats[field]) {
          overallFieldStats[field] = {
            fieldName: field,
            totalMissing: 0,
            totalApplicable: 0,
            percentageMissing: 0,
            categoriesUsingField: []
          }
        }

        overallFieldStats[field].totalMissing += audit.missingFieldCounts[field] || 0
        overallFieldStats[field].totalApplicable += audit.totalSolutions
        overallFieldStats[field].categoriesUsingField.push(category)
      }

    } catch (error) {
      console.log(chalk.red(`  ❌ Error auditing ${category}: ${error}`))
    }
  }

  // Calculate percentages for overall stats
  for (const field in overallFieldStats) {
    const stats = overallFieldStats[field]
    stats.percentageMissing = stats.totalApplicable > 0
      ? Math.round((stats.totalMissing / stats.totalApplicable) * 100)
      : 0
  }

  // Print comprehensive summary
  console.log(chalk.cyan('\n' + '━'.repeat(70)))
  console.log(chalk.cyan('COMPREHENSIVE FIELD ANALYSIS'))
  console.log(chalk.cyan('━'.repeat(70)))

  console.log(chalk.white(`\n📊 Overall Statistics:`))
  console.log(chalk.white(`  • Total categories audited: ${categories.length}`))
  console.log(chalk.white(`  • Total solutions audited: ${totalSolutionsAudited}`))
  console.log(chalk.white(`  • Unique fields analyzed: ${Object.keys(overallFieldStats).length}`))

  // Show all fields sorted by missing percentage (worst first)
  const fieldsByMissingRate = Object.values(overallFieldStats)
    .sort((a, b) => b.percentageMissing - a.percentageMissing)

  console.log(chalk.yellow(`\n📋 ALL FIELDS MISSING DATA (Sorted by Severity):`))

  fieldsByMissingRate.forEach((stats, index) => {
    const color = stats.percentageMissing >= 90 ? chalk.red :
                  stats.percentageMissing >= 50 ? chalk.yellow :
                  stats.percentageMissing >= 10 ? chalk.blue : chalk.green

    console.log(color(`${(index + 1).toString().padStart(2)}. ${stats.fieldName.padEnd(20)} ${stats.totalMissing.toString().padStart(4)}/${stats.totalApplicable.toString().padStart(4)} missing (${stats.percentageMissing.toString().padStart(2)}%)`))

    if (stats.percentageMissing > 0 && stats.categoriesUsingField.length <= 5) {
      console.log(color(`    Categories: ${stats.categoriesUsingField.join(', ')}`))
    }
  })

  // Priority recommendations
  console.log(chalk.cyan('\n' + '━'.repeat(70)))
  console.log(chalk.cyan('PRIORITY RECOMMENDATIONS'))
  console.log(chalk.cyan('━'.repeat(70)))

  const criticalFields = fieldsByMissingRate.filter(s => s.percentageMissing >= 90)
  const highFields = fieldsByMissingRate.filter(s => s.percentageMissing >= 50 && s.percentageMissing < 90)
  const mediumFields = fieldsByMissingRate.filter(s => s.percentageMissing >= 10 && s.percentageMissing < 50)

  if (criticalFields.length > 0) {
    console.log(chalk.red(`\n🚨 CRITICAL (90%+ missing): ${criticalFields.length} fields`))
    criticalFields.slice(0, 10).forEach(s => {
      console.log(chalk.red(`  • ${s.fieldName}: ${s.percentageMissing}% missing`))
    })
  }

  if (highFields.length > 0) {
    console.log(chalk.yellow(`\n⚠️  HIGH (50-89% missing): ${highFields.length} fields`))
    highFields.slice(0, 10).forEach(s => {
      console.log(chalk.yellow(`  • ${s.fieldName}: ${s.percentageMissing}% missing`))
    })
  }

  if (mediumFields.length > 0) {
    console.log(chalk.blue(`\n📝 MEDIUM (10-49% missing): ${mediumFields.length} fields`))
    mediumFields.slice(0, 5).forEach(s => {
      console.log(chalk.blue(`  • ${s.fieldName}: ${s.percentageMissing}% missing`))
    })
  }

  // Save comprehensive report
  const report = {
    timestamp: new Date().toISOString(),
    totalCategories: categories.length,
    totalSolutions: totalSolutionsAudited,
    totalFieldsAnalyzed: Object.keys(overallFieldStats).length,
    fieldStats: fieldsByMissingRate,
    categoryResults: results,
    priorityLevels: {
      critical: criticalFields.map(f => f.fieldName),
      high: highFields.map(f => f.fieldName),
      medium: mediumFields.map(f => f.fieldName)
    }
  }

  const fs = await import('fs/promises')
  await fs.writeFile(
    'comprehensive-field-audit.json',
    JSON.stringify(report, null, 2)
  )

  console.log(chalk.green('\n✅ Comprehensive audit report saved to comprehensive-field-audit.json'))
  console.log(chalk.green(`✅ Analyzed ${Object.keys(overallFieldStats).length} unique fields across ${categories.length} categories`))
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})