#!/usr/bin/env tsx

/**
 * WWFM Solution Data Quality Analyzer
 * 
 * Comprehensive analysis tool to identify and report all data quality issues
 * affecting solution display on the frontend.
 * 
 * Usage: npx tsx scripts/analyze-solution-quality.ts [--goal-id <id>] [--category <category>]
 */

import { createClient } from '@supabase/supabase-js'
import chalk from 'chalk'
import { Command } from 'commander'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Category configuration matching frontend expectations
const CATEGORY_CONFIG: Record<string, {
  keyFields: string[]
  arrayField?: string
}> = {
  // DOSAGE FORMS (4 categories)
  medications: {
    keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },
  supplements_vitamins: {
    keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },
  natural_remedies: {
    keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },
  beauty_skincare: {
    keyFields: ['time_to_results', 'skincare_frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },

  // PRACTICE FORMS (3 categories)
  meditation_mindfulness: {
    keyFields: ['time_to_results', 'practice_length', 'frequency'],
    arrayField: 'challenges'
  },
  exercise_movement: {
    keyFields: ['time_to_results', 'frequency', 'cost'],
    arrayField: 'challenges'
  },
  habits_routines: {
    keyFields: ['time_to_results', 'time_commitment', 'cost'],
    arrayField: 'challenges'
  },

  // SESSION FORMS (7 categories)
  therapists_counselors: {
    keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
    arrayField: 'challenges'
  },
  doctors_specialists: {
    keyFields: ['time_to_results', 'wait_time', 'insurance_coverage', 'cost'],
    arrayField: 'challenges'
  },
  coaches_mentors: {
    keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
    arrayField: 'challenges'
  },
  alternative_practitioners: {
    keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
    arrayField: 'side_effects'
  },
  professional_services: {
    keyFields: ['time_to_results', 'session_frequency', 'specialty', 'cost'],
    arrayField: 'challenges'
  },
  medical_procedures: {
    keyFields: ['time_to_results', 'session_frequency', 'wait_time', 'cost'],
    arrayField: 'side_effects'
  },
  crisis_resources: {
    keyFields: ['time_to_results', 'response_time', 'cost'],
    arrayField: null
  },

  // LIFESTYLE FORMS (2 categories)
  diet_nutrition: {
    keyFields: ['time_to_results', 'weekly_prep_time', 'still_following', 'cost'],
    arrayField: 'challenges'
  },
  sleep: {
    keyFields: ['time_to_results', 'sleep_quality_change', 'still_following', 'cost'],
    arrayField: 'challenges'
  },

  // PURCHASE FORMS (2 categories)
  products_devices: {
    keyFields: ['time_to_results', 'ease_of_use', 'product_type', 'cost'],
    arrayField: 'challenges'
  },
  books_courses: {
    keyFields: ['time_to_results', 'format', 'learning_difficulty', 'cost'],
    arrayField: 'challenges'
  },

  // APP FORM (1 category)
  apps_software: {
    keyFields: ['time_to_results', 'usage_frequency', 'subscription_type', 'cost'],
    arrayField: 'challenges'
  },

  // COMMUNITY FORMS (2 categories)
  groups_communities: {
    keyFields: ['time_to_results', 'meeting_frequency', 'group_size', 'cost'],
    arrayField: 'challenges'
  },
  support_groups: {
    keyFields: ['time_to_results', 'meeting_frequency', 'format', 'cost'],
    arrayField: 'challenges'
  },

  // HOBBY FORM (1 category)
  hobbies_activities: {
    keyFields: ['time_to_results', 'time_commitment', 'frequency', 'cost'],
    arrayField: 'challenges'
  },

  // FINANCIAL FORM (1 category)
  financial_products: {
    keyFields: ['time_to_results', 'financial_benefit', 'access_time'],
    arrayField: 'challenges'
  }
}

interface DistributionData {
  mode: string
  values: Array<{
    value: string
    count: number
    percentage: number
  }>
  totalReports: number
}

interface QualityIssue {
  type: 'missing_field' | 'wrong_format' | 'missing_distribution' | 'no_data' | 'wrong_field_name'
  field?: string
  expected?: any
  actual?: any
  severity: 'critical' | 'high' | 'medium' | 'low'
}

interface SolutionAnalysis {
  solution_id: string
  solution_title: string
  category: string
  goal_id: string
  goal_title: string
  issues: QualityIssue[]
  has_aggregated_fields: boolean
  has_solution_fields: boolean
  display_impact: 'blank' | 'partial' | 'full'
}

// Parse command line arguments
const program = new Command()
  .option('--goal-id <id>', 'Analyze specific goal')
  .option('--category <category>', 'Analyze specific category')
  .option('--limit <number>', 'Limit number of solutions analyzed', '100')
  .option('--output <format>', 'Output format: json or console', 'console')
  .parse(process.argv)

const options = program.opts()

async function analyzeDistributionFormat(data: any, fieldName: string): Promise<QualityIssue | null> {
  // Check if it's in proper DistributionData format
  if (!data || typeof data !== 'object') {
    return {
      type: 'wrong_format',
      field: fieldName,
      expected: 'DistributionData object',
      actual: typeof data,
      severity: 'high'
    }
  }

  // Check for array (wrong format)
  if (Array.isArray(data)) {
    return {
      type: 'wrong_format',
      field: fieldName,
      expected: 'DistributionData with percentages',
      actual: 'Plain array without percentages',
      severity: 'critical'
    }
  }

  // Check for proper DistributionData structure
  if (!data.mode || !data.values || !Array.isArray(data.values)) {
    return {
      type: 'wrong_format',
      field: fieldName,
      expected: '{ mode, values: [{value, count, percentage}], totalReports }',
      actual: Object.keys(data),
      severity: 'high'
    }
  }

  // Validate values have percentages
  const hasPercentages = data.values.every((v: any) => 
    v.percentage !== undefined && typeof v.percentage === 'number'
  )

  if (!hasPercentages) {
    return {
      type: 'missing_distribution',
      field: fieldName,
      expected: 'All values should have percentages',
      actual: 'Missing percentages on some/all values',
      severity: 'high'
    }
  }

  return null
}

async function analyzeSolution(link: any): Promise<SolutionAnalysis> {
  const solution = link.solution_variants?.solutions
  const issues: QualityIssue[] = []

  if (!solution) {
    return {
      solution_id: 'unknown',
      solution_title: 'Unknown Solution',
      category: 'unknown',
      goal_id: link.goal_id,
      issues: [{
        field: 'solution',
        issue: 'Missing solution data',
        severity: 'critical',
        impact: 'Solution data not found'
      }],
      display_impact: 'blank'
    }
  }

  const categoryConfig = CATEGORY_CONFIG[solution.solution_category]
  if (!categoryConfig) {
    console.warn(`Unknown category: ${solution.solution_category}`)
  }

  const analysis: SolutionAnalysis = {
    solution_id: solution.id,
    solution_title: solution.title,
    category: solution.solution_category,
    goal_id: link.goal_id,
    goal_title: link.goals?.title || 'Unknown',
    issues: [],
    has_aggregated_fields: !!link.aggregated_fields,
    has_solution_fields: !!link.solution_fields,
    display_impact: 'full'
  }

  // Check if any data exists
  if (!link.aggregated_fields && !link.solution_fields) {
    issues.push({
      type: 'no_data',
      severity: 'critical'
    })
    analysis.display_impact = 'blank'
  }

  // Check required fields
  if (categoryConfig) {
    const fields = link.aggregated_fields || link.solution_fields || {}
    
    // Check key fields
    for (const fieldName of categoryConfig.keyFields) {
      if (!fields[fieldName]) {
        // Check for field name variations
        const variations = getFieldVariations(fieldName)
        const foundVariation = variations.find(v => fields[v])
        
        if (foundVariation) {
          issues.push({
            type: 'wrong_field_name',
            field: fieldName,
            expected: fieldName,
            actual: foundVariation,
            severity: 'medium'
          })
        } else {
          issues.push({
            type: 'missing_field',
            field: fieldName,
            severity: 'high'
          })
        }
      } else if (link.aggregated_fields) {
        // Check if field is in proper distribution format
        const formatIssue = await analyzeDistributionFormat(fields[fieldName], fieldName)
        if (formatIssue) {
          issues.push(formatIssue)
        }
      }
    }

    // Check array field (side_effects/challenges)
    if (categoryConfig.arrayField) {
      const arrayFieldValue = fields[categoryConfig.arrayField]
      
      if (!arrayFieldValue) {
        issues.push({
          type: 'missing_field',
          field: categoryConfig.arrayField,
          severity: 'medium'
        })
      } else if (link.aggregated_fields) {
        // Check distribution format for array field
        const formatIssue = await analyzeDistributionFormat(arrayFieldValue, categoryConfig.arrayField)
        if (formatIssue) {
          issues.push(formatIssue)
        }
      }
    }
  }

  // Determine display impact
  if (issues.length === 0) {
    analysis.display_impact = 'full'
  } else if (issues.some(i => i.severity === 'critical')) {
    analysis.display_impact = 'blank'
  } else if (issues.filter(i => i.severity === 'high').length > 2) {
    analysis.display_impact = 'partial'
  } else {
    analysis.display_impact = 'partial'
  }

  analysis.issues = issues
  return analysis
}

function getFieldVariations(fieldName: string): string[] {
  const variations: Record<string, string[]> = {
    'frequency': ['frequency', 'session_frequency', 'meeting_frequency', 'treatment_frequency', 'usage_frequency'],
    'session_frequency': ['session_frequency', 'frequency'],
    'skincare_frequency': ['skincare_frequency', 'frequency'],
    'cost': ['cost', 'cost_range', 'startup_cost', 'ongoing_cost'],
    'time_commitment': ['time_commitment', 'practice_length', 'session_length'],
    'practice_length': ['practice_length', 'time_commitment', 'duration'],
  }
  
  return variations[fieldName] || []
}

async function main() {
  console.log(chalk.cyan('🔍 WWFM Solution Quality Analyzer'))
  console.log(chalk.cyan('━'.repeat(60)))

  // Build query
  let query = supabase
    .from('goal_implementation_links')
    .select(`
      id,
      goal_id,
      solution_fields,
      aggregated_fields,
      goals!inner(title),
      solution_variants!inner(
        solutions!inner(
          id,
          title,
          solution_category
        )
      )
    `)
    .limit(parseInt(options.limit))

  if (options.goalId) {
    query = query.eq('goal_id', options.goalId)
  }

  if (options.category) {
    query = query.eq('solution_variants.solutions.solution_category', options.category)
  }

  const { data: links, error } = await query

  if (error) {
    console.error(chalk.red('Error fetching data:'), error)
    process.exit(1)
  }

  if (!links || links.length === 0) {
    console.log(chalk.yellow('No solutions found matching criteria'))
    process.exit(0)
  }

  console.log(chalk.green(`\n✅ Found ${links.length} solution-goal links to analyze\n`))

  // Analyze each solution
  const analyses: SolutionAnalysis[] = []
  const stats = {
    total: 0,
    blank: 0,
    partial: 0,
    full: 0,
    criticalIssues: 0,
    highIssues: 0
  }

  for (const link of links) {
    const analysis = await analyzeSolution(link)
    analyses.push(analysis)
    
    stats.total++
    stats[analysis.display_impact]++
    stats.criticalIssues += analysis.issues.filter(i => i.severity === 'critical').length
    stats.highIssues += analysis.issues.filter(i => i.severity === 'high').length
  }

  // Output results
  if (options.output === 'json') {
    const report = {
      timestamp: new Date().toISOString(),
      stats,
      analyses: analyses.filter(a => a.issues.length > 0)
    }
    
    const outputPath = path.join(process.cwd(), 'solution-quality-report.json')
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2))
    console.log(chalk.green(`\n✅ Report saved to: ${outputPath}`))
  } else {
    // Console output
    console.log(chalk.yellow('\n📊 Summary Statistics:'))
    console.log(chalk.white(`   Total analyzed: ${stats.total}`))
    console.log(chalk.red(`   Blank cards: ${stats.blank} (${Math.round(stats.blank/stats.total*100)}%)`))
    console.log(chalk.yellow(`   Partial display: ${stats.partial} (${Math.round(stats.partial/stats.total*100)}%)`))
    console.log(chalk.green(`   Full display: ${stats.full} (${Math.round(stats.full/stats.total*100)}%)`))
    console.log(chalk.red(`   Critical issues: ${stats.criticalIssues}`))
    console.log(chalk.yellow(`   High issues: ${stats.highIssues}`))

    // Show worst offenders
    const worstSolutions = analyses
      .filter(a => a.issues.length > 0)
      .sort((a, b) => {
        const aSeverity = a.issues.filter(i => i.severity === 'critical').length * 10 +
                         a.issues.filter(i => i.severity === 'high').length
        const bSeverity = b.issues.filter(i => i.severity === 'critical').length * 10 +
                         b.issues.filter(i => i.severity === 'high').length
        return bSeverity - aSeverity
      })
      .slice(0, 10)

    if (worstSolutions.length > 0) {
      console.log(chalk.red('\n🔴 Top 10 Solutions Needing Fixes:'))
      for (const solution of worstSolutions) {
        console.log(chalk.white(`\n   ${solution.solution_title} (${solution.category})`))
        console.log(chalk.gray(`   Goal: ${solution.goal_title}`))
        console.log(chalk.gray(`   Impact: ${solution.display_impact}`))
        
        const criticalIssues = solution.issues.filter(i => i.severity === 'critical')
        const highIssues = solution.issues.filter(i => i.severity === 'high')
        
        if (criticalIssues.length > 0) {
          console.log(chalk.red(`   Critical: ${criticalIssues.map(i => i.type).join(', ')}`))
        }
        if (highIssues.length > 0) {
          console.log(chalk.yellow(`   High: ${highIssues.map(i => i.field || i.type).join(', ')}`))
        }
      }
    }

    // Category breakdown
    console.log(chalk.cyan('\n📂 Issues by Category:'))
    const categoryStats = new Map<string, number>()
    for (const analysis of analyses) {
      if (analysis.issues.length > 0) {
        categoryStats.set(
          analysis.category, 
          (categoryStats.get(analysis.category) || 0) + 1
        )
      }
    }
    
    const sortedCategories = Array.from(categoryStats.entries())
      .sort((a, b) => b[1] - a[1])
    
    for (const [category, count] of sortedCategories) {
      const total = analyses.filter(a => a.category === category).length
      console.log(chalk.white(`   ${category}: ${count}/${total} have issues (${Math.round(count/total*100)}%)`))
    }
  }

  console.log(chalk.cyan('\n' + '━'.repeat(60)))
  console.log(chalk.green('✅ Analysis complete!'))
  
  if (stats.blank > 0 || stats.criticalIssues > 0) {
    console.log(chalk.yellow('\n⚠️  Run the fix script to remediate these issues:'))
    console.log(chalk.white('   npx tsx scripts/fix-solution-quality.ts --ai-enhanced'))
  }
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})