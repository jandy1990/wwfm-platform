#!/usr/bin/env tsx

/**
 * CATEGORY-SPECIFIC FIELD AUDIT
 *
 * This script audits each solution category independently to identify
 * which fields are actually required vs optional for that category.
 *
 * This is critical because not all fields are required for all categories.
 * For example, side_effects might only be required for medical categories.
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

// Define ALL fields that are displayed on solution cards per category
// Based on GoalPageClient.tsx keyFields and arrayField configurations
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
    keyFields: ['time_to_results', 'previous_sleep_hours', 'still_following', 'cost'],
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

// Fields that generate the 'cost' display (based on GoalPageClient.tsx logic)
const COST_SOURCE_FIELDS = ['cost', 'startup_cost', 'ongoing_cost']

interface CategoryAudit {
  category: string
  totalSolutions: number
  requiredFields: string[]
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

  // Get all fields that should be displayed for this category
  const requiredFields = [...categoryConfig.keyFields]
  if (categoryConfig.arrayField) {
    requiredFields.push(categoryConfig.arrayField)
  }

  const missingFieldCounts: Record<string, number> = {}
  const missingFieldPercentages: Record<string, number> = {}

  // Add cost source fields and any other supplementary fields to check
  const costSourceFields = ['startup_cost', 'ongoing_cost'] // 'cost' already in requiredFields for most categories
  const supplementaryFields = ['notes']

  // Get ALL fields to check (required + cost sources + supplementary)
  const allFieldsToCheck = [...new Set([...requiredFields, ...costSourceFields, ...supplementaryFields])]

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

  // Identify critical missing fields (>50% missing from display fields)
  const criticalMissing = allFieldsToCheck.filter((field: string) =>
    missingFieldPercentages[field] > 50
  )

  return {
    category,
    totalSolutions,
    requiredFields,
    missingFieldCounts,
    missingFieldPercentages,
    criticalMissing
  }
}

async function main() {
  console.log(chalk.cyan('📊 CATEGORY-SPECIFIC FIELD AUDIT'))
  console.log(chalk.cyan('━'.repeat(60)))
  console.log('')

  const categories = Object.keys(CATEGORY_DISPLAY_FIELDS).sort()
  const results: CategoryAudit[] = []

  // Track overall statistics
  let totalSolutionsAudited = 0
  const overallMissingCounts: Record<string, number> = {}
  const categoriesNeedingWork: string[] = []

  for (const category of categories) {
    try {
      const audit = await auditCategory(category)
      results.push(audit)
      totalSolutionsAudited += audit.totalSolutions

      // Print category results
      console.log(chalk.yellow(`\n${category.toUpperCase()}`))
      console.log(chalk.white(`  Solutions: ${audit.totalSolutions}`))
      console.log(chalk.white(`  Required fields: ${audit.requiredFields.join(', ')}`))

      if (audit.criticalMissing.length > 0) {
        categoriesNeedingWork.push(category)
        console.log(chalk.red(`  ⚠️  Critical missing fields:`))
        for (const field of audit.criticalMissing) {
          console.log(chalk.red(`     - ${field}: ${audit.missingFieldCounts[field]}/${audit.totalSolutions} missing (${audit.missingFieldPercentages[field]}%)`))

          // Track overall counts
          overallMissingCounts[field] = (overallMissingCounts[field] || 0) + audit.missingFieldCounts[field]
        }
      } else {
        console.log(chalk.green(`  ✅ All required fields present`))
      }

      // Check cost fields
      if (audit.missingFieldPercentages['cost'] === 100) {
        console.log(chalk.yellow(`  💰 Note: cost fields missing (affects cost display)`))
      }

    } catch (error) {
      console.log(chalk.red(`  ❌ Error auditing ${category}: ${error}`))
    }
  }

  // Print summary
  console.log(chalk.cyan('\n' + '━'.repeat(60)))
  console.log(chalk.cyan('AUDIT SUMMARY'))
  console.log(chalk.cyan('━'.repeat(60)))

  console.log(chalk.white(`\n📊 Overall Statistics:`))
  console.log(chalk.white(`  • Total categories audited: ${categories.length}`))
  console.log(chalk.white(`  • Total solutions audited: ${totalSolutionsAudited}`))
  console.log(chalk.white(`  • Categories needing work: ${categoriesNeedingWork.length}/${categories.length}`))

  // Group missing fields by commonality
  console.log(chalk.yellow(`\n🔴 Critical Missing Fields (Aggregated):`))

  // Categories that display side_effects
  const sideEffectsCategories = results.filter(r =>
    CATEGORY_DISPLAY_FIELDS[r.category]?.arrayField === 'side_effects'
  ).map(r => r.category)

  const sideEffectsNeeded = results
    .filter(r => sideEffectsCategories.includes(r.category))
    .reduce((sum, r) => sum + (r.missingFieldCounts['side_effects'] || 0), 0)

  const sideEffectsTotal = results
    .filter(r => sideEffectsCategories.includes(r.category))
    .reduce((sum, r) => sum + r.totalSolutions, 0)

  if (sideEffectsNeeded > 0) {
    console.log(chalk.red(`  • side_effects (displayed on these categories only):`))
    console.log(chalk.red(`    ${sideEffectsNeeded}/${sideEffectsTotal} missing (${Math.round((sideEffectsNeeded/sideEffectsTotal)*100)}%)`))
    console.log(chalk.red(`    Categories: ${sideEffectsCategories.join(', ')}`))
  }

  // Categories that display challenges
  const challengesCategories = results.filter(r =>
    CATEGORY_DISPLAY_FIELDS[r.category]?.arrayField === 'challenges'
  ).map(r => r.category)

  const challengesMissing = results
    .filter(r => challengesCategories.includes(r.category))
    .reduce((sum, r) => sum + (r.missingFieldCounts['challenges'] || 0), 0)

  const challengesTotal = results
    .filter(r => challengesCategories.includes(r.category))
    .reduce((sum, r) => sum + r.totalSolutions, 0)

  if (challengesMissing > 0) {
    console.log(chalk.yellow(`  • challenges (displayed on these categories):`))
    console.log(chalk.yellow(`    ${challengesMissing}/${challengesTotal} missing (${Math.round((challengesMissing/challengesTotal)*100)}%)`))
  }

  // time_to_results (universal - all categories display this)
  const timeToResultsMissing = results.reduce((sum, r) => sum + (r.missingFieldCounts['time_to_results'] || 0), 0)

  if (timeToResultsMissing > 0) {
    console.log(chalk.green(`  • time_to_results (universal - all categories):`))
    console.log(chalk.green(`    ${timeToResultsMissing}/${totalSolutionsAudited} missing (${Math.round((timeToResultsMissing/totalSolutionsAudited)*100)}%)`))
  }

  // Cost fields (displayed on most categories)
  const costCategories = results.filter(r =>
    CATEGORY_DISPLAY_FIELDS[r.category]?.keyFields.includes('cost')
  ).map(r => r.category)

  const costMissing = results
    .filter(r => costCategories.includes(r.category))
    .reduce((sum, r) => sum + (r.missingFieldCounts['cost'] || 0), 0)

  const costTotal = results
    .filter(r => costCategories.includes(r.category))
    .reduce((sum, r) => sum + r.totalSolutions, 0)

  const notesMissing = results.reduce((sum, r) => sum + (r.missingFieldCounts['notes'] || 0), 0)

  console.log(chalk.blue(`\n💰 Cost & Additional Fields:`))
  if (costMissing > 0) {
    console.log(chalk.blue(`  • cost (any cost field - startup_cost/ongoing_cost/cost):`))
    console.log(chalk.blue(`    ${costMissing}/${costTotal} missing (${Math.round((costMissing/costTotal)*100)}%)`))
    console.log(chalk.blue(`    Categories showing cost: ${costCategories.join(', ')}`))
  }
  console.log(chalk.blue(`  • notes: ${notesMissing}/${totalSolutionsAudited} missing (${Math.round((notesMissing/totalSolutionsAudited)*100)}%)`))

  // Recommendations
  console.log(chalk.cyan('\n' + '━'.repeat(60)))
  console.log(chalk.cyan('RECOMMENDATIONS'))
  console.log(chalk.cyan('━'.repeat(60)))

  console.log(chalk.white('\n🎯 Priority Order (Based on Frontend Display):'))
  console.log(chalk.white('1. HIGH: Add side_effects to categories that display them'))
  console.log(chalk.white(`   - Categories: ${sideEffectsCategories.join(', ')}`))
  console.log(chalk.white('   - ~' + sideEffectsNeeded + ' solutions need this field'))

  console.log(chalk.white('\n2. HIGH: Add cost fields (critical for cost display)'))
  console.log(chalk.white(`   - Categories: ${costCategories.join(', ')}`))
  console.log(chalk.white('   - ~' + costMissing + ' solutions missing cost data'))
  console.log(chalk.white('   - Need at least one of: cost, startup_cost, ongoing_cost'))

  console.log(chalk.white('\n3. MEDIUM: Add challenges field (user expectations)'))
  console.log(chalk.white(`   - Categories: ${challengesCategories.join(', ')}`))
  console.log(chalk.white('   - ~' + challengesMissing + ' solutions missing'))

  console.log(chalk.white('\n4. LOW: Notes field (supplementary info)'))
  console.log(chalk.white('   - notes provides additional context'))
  console.log(chalk.white('   - Currently 100% missing but less critical'))

  // Output detailed report
  const report = {
    timestamp: new Date().toISOString(),
    totalCategories: categories.length,
    totalSolutions: totalSolutionsAudited,
    categoriesNeedingWork,
    criticalFindings: {
      sideEffects: {
        affectedCategories: medicalCategories,
        totalMissing: sideEffectsNeeded,
        totalInCategory: sideEffectsTotal,
        percentage: Math.round((sideEffectsNeeded/sideEffectsTotal)*100)
      },
      challenges: {
        affectedCategories: 'all',
        totalMissing: challengesMissing,
        totalSolutions: totalSolutionsAudited,
        percentage: Math.round((challengesMissing/totalSolutionsAudited)*100)
      },
      timeToResults: {
        affectedCategories: 'all',
        totalMissing: timeToResultsMissing,
        totalSolutions: totalSolutionsAudited,
        percentage: Math.round((timeToResultsMissing/totalSolutionsAudited)*100)
      }
    },
    displayFields: {
      costRange: {
        totalMissing: costRangeMissing,
        percentage: Math.round((costRangeMissing/totalSolutionsAudited)*100)
      },
      notes: {
        totalMissing: notesMissing,
        percentage: Math.round((notesMissing/totalSolutionsAudited)*100)
      }
    },
    detailedResults: results
  }

  // Save report
  const fs = await import('fs/promises')
  await fs.writeFile(
    'category-field-audit.json',
    JSON.stringify(report, null, 2)
  )

  console.log(chalk.green('\n✅ Full audit report saved to category-field-audit.json'))
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})