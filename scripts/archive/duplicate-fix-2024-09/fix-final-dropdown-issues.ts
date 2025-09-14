#!/usr/bin/env tsx
/**
 * FINAL FIX: Remaining Dropdown Issues
 *
 * Target the specific problematic values that weren't caught by the comprehensive fix:
 * - "Twice daily (AM & PM)" → "Twice daily (AM & PM)" (already valid!)
 * - "every other day" variations → "every other day" (already valid!)
 * - "Paid" subscription issues → proper subscription types
 */

import { createClient } from '@supabase/supabase-js'
import { getDropdownOptionsForField } from './ai-solution-generator/config/dropdown-options.js'

// Supabase connection
const supabaseUrl = 'https://wqxkhxdbxdtpuvuvgirx.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_KEY not found in environment')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Targeted mapping for the remaining specific issues
 */
function fixSpecificIssues(value: string, category: string, fieldName: string): string {
  const validOptions = getDropdownOptionsForField(category, fieldName)
  if (!validOptions) return value

  // Check if already valid first
  if (validOptions.includes(value)) {
    return value
  }

  // Beauty skincare frequency - "Twice daily (AM & PM)" should be valid!
  if (category === 'beauty_skincare' && fieldName === 'skincare_frequency') {
    if (value === 'Twice daily (AM & PM)') {
      // This should already be valid, but let's double check options
      return validOptions.find(opt => opt.includes('Twice daily')) || validOptions[0]
    }
  }

  // Frequency fields - "every other day" should be valid!
  if (fieldName === 'frequency') {
    if (value === 'every other day' || value === 'once every other day') {
      return validOptions.find(opt => opt === 'every other day') ||
             validOptions.find(opt => opt.includes('every other day')) ||
             validOptions[0]
    }
  }

  // Apps software cost/subscription issues
  if (category === 'apps_software') {
    if (fieldName === 'cost') {
      if (value.includes('Paid subscription') || value === 'Paid') {
        return '$10-$19.99/month' // Default reasonable paid tier
      }
      if (value.includes('Paid for employers')) {
        return '$50-$99.99/month' // Enterprise tier
      }
    }

    if (fieldName === 'subscription_type') {
      if (value === 'Paid version') {
        return 'Monthly subscription'
      }
    }
  }

  // Side effects - clean up "Other (e.g., ...)" patterns
  if (fieldName === 'side_effects') {
    if (value.startsWith('Other (e.g.,')) {
      // Extract the main side effect from the description
      const match = value.match(/Other \(e\.g\.,\s*([^,)]+)/)
      if (match) {
        const mainEffect = match[1].trim()
        // Try to find a matching option
        const matchingOption = validOptions.find(opt =>
          opt.toLowerCase().includes(mainEffect.toLowerCase())
        )
        return matchingOption || validOptions.find(opt => opt.toLowerCase().includes('other')) || validOptions[0]
      }
    }
  }

  return value
}

/**
 * Fix the remaining problematic solutions
 */
async function fixRemainingIssues() {
  console.log('🚀 Fixing final remaining dropdown issues...\n')

  // Get solutions with the specific problematic patterns
  const { data: solutions, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      implementation_id,
      goal_id,
      aggregated_fields,
      solution_variants!implementation_id (
        id,
        solution_id,
        solutions (
          id,
          solution_category,
          source_type
        )
      )
    `)
    .eq('solution_variants.solutions.source_type', 'ai_foundation')
    .not('aggregated_fields', 'is', null)

  if (error) {
    throw new Error(`Failed to fetch solutions: ${error.message}`)
  }

  console.log(`📊 Processing ${solutions.length} AI solutions for final fixes...`)

  let fixedCount = 0
  let totalProblemsFound = 0

  for (const solution of solutions) {
    if (!solution.solution_variants?.solutions) continue

    const category = solution.solution_variants.solutions.solution_category
    const aggregatedFields = solution.aggregated_fields
    let fieldUpdated = false

    for (const [fieldName, fieldData] of Object.entries(aggregatedFields)) {
      if (fieldName === '_metadata') continue

      const values = fieldData.values || []
      let valuesUpdated = false

      for (let i = 0; i < values.length; i++) {
        const originalValue = values[i].value
        const fixedValue = fixSpecificIssues(originalValue, category, fieldName)

        if (fixedValue !== originalValue) {
          console.log(`[FIX] ${category}.${fieldName}: "${originalValue}" → "${fixedValue}"`)
          values[i].value = fixedValue
          valuesUpdated = true
          totalProblemsFound++
        }
      }

      if (valuesUpdated) {
        // Recalculate mode after fixing values
        const sortedValues = [...values].sort((a, b) => b.percentage - a.percentage)
        aggregatedFields[fieldName].mode = sortedValues[0]?.value || fieldData.mode
        fieldUpdated = true
      }
    }

    if (fieldUpdated) {
      // Update metadata
      if (aggregatedFields._metadata) {
        aggregatedFields._metadata.final_fix_at = new Date().toISOString()
        aggregatedFields._metadata.fix_version = 'final_v1'
      }

      // Update in database
      const { error: updateError } = await supabase
        .from('goal_implementation_links')
        .update({ aggregated_fields: aggregatedFields })
        .eq('implementation_id', solution.implementation_id)
        .eq('goal_id', solution.goal_id)

      if (updateError) {
        console.error(`❌ Error updating solution:`, updateError.message)
      } else {
        fixedCount++
      }
    }
  }

  console.log(`\n🎉 Final fix complete!`)
  console.log(`🔧 Fixed ${totalProblemsFound} remaining issues across ${fixedCount} solutions`)
}

// Execute if run directly
if (require.main === module) {
  fixRemainingIssues()
}

export { fixRemainingIssues }