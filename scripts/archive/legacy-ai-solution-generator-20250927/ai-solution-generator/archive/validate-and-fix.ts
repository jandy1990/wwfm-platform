#!/usr/bin/env node

/**
 * Validation and Fix Script for AI-Generated Solutions
 * 
 * This script:
 * 1. Validates all AI-generated solutions in the database
 * 2. Fixes common issues (variant names, frequency mappings, etc.)
 * 3. Generates a comprehensive report
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import chalk from 'chalk'
import { mapFrequencyToDropdown, mapTimeCommitmentToDropdown } from './utils/value-mapper'
import { getDropdownOptionsForField } from './config/dropdown-options'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

interface ValidationIssue {
  type: 'variant_naming' | 'frequency_mapping' | 'time_mapping' | 'missing_field' | 'invalid_value'
  goalTitle: string
  solutionTitle: string
  field?: string
  currentValue?: any
  suggestedValue?: any
  severity: 'critical' | 'warning' | 'info'
}

const issues: ValidationIssue[] = []
let fixedCount = 0

async function main() {
  console.log(chalk.cyan('🔍 AI Solution Validation & Fix Tool'))
  console.log(chalk.gray('━'.repeat(50)))
  
  try {
    // Step 1: Fix variant naming issues
    await fixVariantNames()
    
    // Step 2: Get all AI-generated solutions
    const solutions = await getAllAISolutions()
    
    // Step 3: Validate and fix field mappings
    await validateAndFixFieldMappings(solutions)
    
    // Step 4: Generate report
    generateReport()
    
  } catch (error) {
    console.error(chalk.red('Error:'), error)
    process.exit(1)
  }
}

/**
 * Fix variant names with "nullnull" prefix
 */
async function fixVariantNames() {
  console.log(chalk.blue('\n📦 Fixing Variant Names...'))
  
  // Find all variants with "nullnull" in the name
  const { data: badVariants, error } = await supabase
    .from('solution_variants')
    .select('id, variant_name, form, solution_id, solutions(title, solution_category)')
    .like('variant_name', '%null%')
  
  if (error) {
    console.error(chalk.red('Error fetching variants:'), error)
    return
  }
  
  if (!badVariants || badVariants.length === 0) {
    console.log(chalk.green('✅ No variant naming issues found'))
    return
  }
  
  console.log(chalk.yellow(`Found ${badVariants.length} variants with naming issues`))
  
  for (const variant of badVariants) {
    const oldName = variant.variant_name
    // Remove "nullnull " prefix to get the clean form name
    const newName = variant.form || oldName.replace(/^nullnull\s*/, '')
    
    // Update the variant name
    const { error: updateError } = await supabase
      .from('solution_variants')
      .update({ variant_name: newName })
      .eq('id', variant.id)
    
    if (updateError) {
      console.error(chalk.red(`  ❌ Failed to fix variant ${variant.id}:`, updateError.message))
      issues.push({
        type: 'variant_naming',
        goalTitle: 'N/A',
        solutionTitle: variant.solutions?.title || 'Unknown',
        field: 'variant_name',
        currentValue: oldName,
        suggestedValue: newName,
        severity: 'critical'
      })
    } else {
      console.log(chalk.green(`  ✅ Fixed: "${oldName}" → "${newName}"`))
      fixedCount++
    }
  }
}

/**
 * Get all AI-generated solutions with their field data
 */
async function getAllAISolutions() {
  console.log(chalk.blue('\n📊 Fetching AI Solutions...'))
  
  const { data, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      goal_id,
      goals(title),
      implementation_id,
      solution_fields,
      solution_variants(
        variant_name,
        solution_id,
        solutions(
          title,
          solution_category,
          source_type
        )
      )
    `)
    .eq('rating_count', 1) // AI-generated solutions have rating_count = 1
  
  if (error) {
    throw new Error(`Failed to fetch solutions: ${error.message}`)
  }
  
  console.log(chalk.green(`✅ Fetched ${data?.length || 0} AI-generated solution links`))
  return data || []
}

/**
 * Validate and fix field mappings
 */
async function validateAndFixFieldMappings(solutions: any[]) {
  console.log(chalk.blue('\n🔧 Validating Field Mappings...'))
  
  const frequencyIssues: any[] = []
  const timeCommitmentIssues: any[] = []
  
  for (const link of solutions) {
    if (!link.solution_fields || !link.solution_variants?.solutions) continue
    
    const goalTitle = link.goals?.title || 'Unknown Goal'
    const solutionTitle = link.solution_variants.solutions.title
    const category = link.solution_variants.solutions.solution_category
    const fields = link.solution_fields
    
    // Check frequency fields
    if (fields.frequency) {
      const currentValue = fields.frequency
      const options = getDropdownOptionsForField(category, 'frequency')
      
      if (options && options.length > 0) {
        // Check if it's incorrectly mapped (e.g., "3-5 times per week" → "three times daily")
        if (currentValue.toLowerCase().includes('daily') && 
            !['daily', 'once daily', 'twice daily', 'three times daily'].includes(currentValue.toLowerCase())) {
          // This might be a mismap
          const suggestedValue = mapFrequencyToDropdown(currentValue, options)
          
          if (suggestedValue !== currentValue) {
            frequencyIssues.push({
              linkId: link.id,
              goalTitle,
              solutionTitle,
              currentValue,
              suggestedValue,
              fields
            })
          }
        }
      }
    }
    
    // Check time_commitment fields
    if (fields.time_commitment) {
      const currentValue = fields.time_commitment
      const options = getDropdownOptionsForField(category, 'time_commitment')
      
      if (options && options.length > 0) {
        // Check if it looks wrong (e.g., "2 hours" mapped to "Under 5 minutes")
        if (currentValue === 'Under 5 minutes') {
          // Re-evaluate if this makes sense
          const suggestedValue = mapTimeCommitmentToDropdown(fields.time_commitment, options)
          
          if (suggestedValue !== currentValue) {
            timeCommitmentIssues.push({
              linkId: link.id,
              goalTitle,
              solutionTitle,
              currentValue,
              suggestedValue,
              fields
            })
          }
        }
      }
    }
    
    // Check for missing required fields
    const requiredFields = getRequiredFieldsForCategory(category)
    for (const field of requiredFields) {
      if (!fields[field]) {
        issues.push({
          type: 'missing_field',
          goalTitle,
          solutionTitle,
          field,
          currentValue: undefined,
          severity: 'warning'
        })
      }
    }
  }
  
  // Fix frequency issues
  if (frequencyIssues.length > 0) {
    console.log(chalk.yellow(`\n⚠️  Found ${frequencyIssues.length} frequency mapping issues`))
    
    for (const issue of frequencyIssues) {
      console.log(chalk.gray(`  Fixing "${issue.solutionTitle}": ${issue.currentValue} → ${issue.suggestedValue}`))
      
      // Update the field
      const updatedFields = { ...issue.fields, frequency: issue.suggestedValue }
      
      const { error } = await supabase
        .from('goal_implementation_links')
        .update({ solution_fields: updatedFields })
        .eq('id', issue.linkId)
      
      if (!error) {
        fixedCount++
      }
    }
  }
  
  // Fix time commitment issues
  if (timeCommitmentIssues.length > 0) {
    console.log(chalk.yellow(`\n⚠️  Found ${timeCommitmentIssues.length} time commitment mapping issues`))
    
    for (const issue of timeCommitmentIssues) {
      console.log(chalk.gray(`  Fixing "${issue.solutionTitle}": ${issue.currentValue} → ${issue.suggestedValue}`))
      
      // Update the field
      const updatedFields = { ...issue.fields, time_commitment: issue.suggestedValue }
      
      const { error } = await supabase
        .from('goal_implementation_links')
        .update({ solution_fields: updatedFields })
        .eq('id', issue.linkId)
      
      if (!error) {
        fixedCount++
      }
    }
  }
}

/**
 * Get required fields for a category
 */
function getRequiredFieldsForCategory(category: string): string[] {
  const fieldMap: Record<string, string[]> = {
    'habits_routines': ['startup_cost', 'ongoing_cost', 'time_commitment', 'time_to_results'],
    'apps_software': ['cost', 'subscription_type', 'usage_frequency', 'time_to_results'],
    'therapists_counselors': ['cost', 'format', 'session_frequency', 'time_to_results'],
    'supplements_vitamins': ['cost', 'frequency', 'length_of_use', 'time_to_results'],
    'medications': ['cost', 'frequency', 'length_of_use', 'time_to_results'],
    'beauty_skincare': ['cost', 'skincare_frequency', 'length_of_use', 'time_to_results'],
    'natural_remedies': ['cost', 'frequency', 'length_of_use', 'time_to_results'],
    'products_devices': ['cost', 'ease_of_use', 'product_type', 'time_to_results'],
    'financial_products': ['cost_type', 'financial_benefit', 'access_time', 'time_to_results'],
    'exercise_movement': ['startup_cost', 'ongoing_cost', 'frequency', 'time_to_results'],
    'diet_nutrition': ['cost_impact', 'weekly_prep_time', 'time_to_results'],
    'sleep': ['cost_impact', 'previous_sleep_hours', 'time_to_results'],
    'meditation_mindfulness': ['startup_cost', 'ongoing_cost', 'frequency', 'time_to_results'],
    'books_courses': ['cost', 'format', 'time_to_complete', 'time_to_results'],
    'groups_communities': ['cost', 'format', 'meeting_frequency', 'time_to_results'],
    'hobbies_activities': ['startup_cost', 'ongoing_cost', 'time_commitment', 'time_to_results'],
    'professional_services': ['cost', 'frequency', 'specialty', 'time_to_results']
  }
  
  return fieldMap[category] || []
}

/**
 * Generate comprehensive report
 */
function generateReport() {
  console.log(chalk.cyan('\n' + '═'.repeat(50)))
  console.log(chalk.cyan('📊 VALIDATION REPORT'))
  console.log(chalk.cyan('═'.repeat(50)))
  
  console.log(chalk.white(`\n✅ Fixed Issues: ${fixedCount}`))
  
  if (issues.length > 0) {
    console.log(chalk.yellow(`\n⚠️  Remaining Issues: ${issues.length}`))
    
    // Group issues by type
    const byType = issues.reduce((acc, issue) => {
      if (!acc[issue.type]) acc[issue.type] = []
      acc[issue.type].push(issue)
      return acc
    }, {} as Record<string, ValidationIssue[]>)
    
    for (const [type, typeIssues] of Object.entries(byType)) {
      console.log(chalk.blue(`\n${type}: ${typeIssues.length} issues`))
      
      // Show first 5 examples
      typeIssues.slice(0, 5).forEach(issue => {
        console.log(chalk.gray(`  - ${issue.solutionTitle}: ${issue.field} = ${issue.currentValue}`))
      })
      
      if (typeIssues.length > 5) {
        console.log(chalk.gray(`  ... and ${typeIssues.length - 5} more`))
      }
    }
  } else {
    console.log(chalk.green('\n✨ No remaining issues found!'))
  }
  
  console.log(chalk.cyan('\n' + '═'.repeat(50)))
  console.log(chalk.green('✅ Validation complete!'))
}

// Run the script
main().catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})