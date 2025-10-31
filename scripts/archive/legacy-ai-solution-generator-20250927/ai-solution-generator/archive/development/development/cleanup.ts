#!/usr/bin/env node
/**
 * Cleanup Script for Incorrectly Generated Solutions
 * 
 * This script fixes:
 * 1. Broken variant names showing as "undefinedundefined undefined"
 * 2. Missing required fields in solution_fields
 * 3. Incorrect field names (e.g., frequency vs skincare_frequency)
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import chalk from 'chalk'
import { CATEGORY_FIELDS, FIELD_OPTIONS, DOSAGE_VARIANTS } from '../config/category-fields'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function fixBrokenVariants() {
  console.log(chalk.cyan('🔧 Fixing broken variants...'))
  
  // Find variants with broken names
  const { data: brokenVariants, error } = await supabase
    .from('solution_variants')
    .select(`
      id,
      solution_id,
      variant_name,
      solutions!inner(
        title,
        solution_category
      )
    `)
    .like('variant_name', '%undefined%')
  
  if (error) {
    console.error(chalk.red('Error fetching broken variants:'), error)
    return
  }
  
  if (!brokenVariants || brokenVariants.length === 0) {
    console.log(chalk.green('   ✅ No broken variants found'))
    return
  }
  
  console.log(chalk.yellow(`   Found ${brokenVariants.length} broken variants to fix`))
  
  for (const variant of brokenVariants) {
    const category = variant.solutions.solution_category
    
    if (CATEGORY_FIELDS[category]?.needsVariants) {
      // This is a dosage category, create proper variant name
      const variantOptions = DOSAGE_VARIANTS[category]
      if (variantOptions) {
        // Generate a default variant (e.g., "50mg tablet")
        const amount = variantOptions.amounts[0]
        const unit = variantOptions.units[0]
        const form = variantOptions.forms[0]
        const newVariantName = `${amount}${unit} ${form}`
        
        const { error: updateError } = await supabase
          .from('solution_variants')
          .update({
            variant_name: newVariantName,
            amount,
            unit,
            form
          })
          .eq('id', variant.id)
        
        if (updateError) {
          console.error(chalk.red(`   ❌ Failed to fix variant ${variant.id}:`, updateError))
        } else {
          console.log(chalk.green(`   ✅ Fixed variant for ${variant.solutions.title}: ${newVariantName}`))
        }
      }
    } else {
      // This should be a standard variant
      const { error: updateError } = await supabase
        .from('solution_variants')
        .update({
          variant_name: 'Standard'
        })
        .eq('id', variant.id)
      
      if (updateError) {
        console.error(chalk.red(`   ❌ Failed to fix variant ${variant.id}:`, updateError))
      } else {
        console.log(chalk.green(`   ✅ Fixed variant for ${variant.solutions.title}: Standard`))
      }
    }
  }
}

async function fixMissingFields() {
  console.log(chalk.cyan('\n🔧 Fixing missing/incorrect fields...'))
  
  // Get all AI-generated goal implementation links
  const { data: links, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      solution_fields,
      solution_variants!inner(
        id,
        solutions!inner(
          title,
          solution_category
        )
      )
    `)
    .eq('rating_count', 1) // AI-generated marked with rating_count = 1
    .limit(100)
  
  if (error) {
    console.error(chalk.red('Error fetching links:'), error)
    return
  }
  
  if (!links || links.length === 0) {
    console.log(chalk.green('   ✅ No links to fix'))
    return
  }
  
  console.log(chalk.yellow(`   Checking ${links.length} solution links...`))
  
  let fixedCount = 0
  
  for (const link of links) {
    const category = link.solution_variants.solutions.solution_category
    const config = CATEGORY_FIELDS[category]
    
    if (!config) continue
    
    let needsUpdate = false
    const updatedFields = { ...link.solution_fields }
    
    // Check and fix required fields
    for (const field of config.required) {
      if (!updatedFields[field]) {
        needsUpdate = true
        
        // Add default value based on field type
        if (field === 'cost' || field === 'startup_cost' || field === 'ongoing_cost') {
          updatedFields[field] = FIELD_OPTIONS.cost?.[2] || '$25-50/month'
        } else if (field === 'cost_impact') {
          updatedFields[field] = FIELD_OPTIONS.cost_impact?.[1] || 'Cost neutral'
        } else if (field === 'time_to_results' || field === 'time_to_enjoyment') {
          updatedFields[field] = FIELD_OPTIONS.time_to_results?.[3] || '3-4 weeks'
        } else if (field === 'frequency' || field === 'session_frequency' || field === 'meeting_frequency') {
          updatedFields[field] = FIELD_OPTIONS.frequency?.[1] || 'Daily'
        } else if (field === 'skincare_frequency') {
          updatedFields[field] = FIELD_OPTIONS.skincare_frequency?.[1] || 'Once daily'
        } else if (field === 'usage_frequency') {
          updatedFields[field] = FIELD_OPTIONS.usage_frequency?.[1] || 'Daily'
        } else if (field === 'subscription_type') {
          updatedFields[field] = FIELD_OPTIONS.subscription_type?.[2] || 'Monthly subscription'
        } else if (field === 'format') {
          updatedFields[field] = FIELD_OPTIONS.format?.[0] || 'In-person'
        } else if (field === 'length_of_use') {
          updatedFields[field] = FIELD_OPTIONS.length_of_use?.[4] || '3-6 months'
        } else if (field === 'sustainability') {
          updatedFields[field] = FIELD_OPTIONS.sustainability?.[1] || 'Mostly sustainable'
        } else {
          updatedFields[field] = 'Standard'
        }
        
        console.log(chalk.yellow(`      Added missing field '${field}' for ${link.solution_variants.solutions.title}`))
      }
    }
    
    // Check and fix array field
    if (config.arrayField && !updatedFields[config.arrayField]) {
      needsUpdate = true
      
      // Add default array values based on field type
      if (config.arrayField === 'side_effects') {
        updatedFields[config.arrayField] = ['Mild initial effects', 'None for most users']
      } else if (config.arrayField === 'challenges') {
        updatedFields[config.arrayField] = ['Requires consistency', 'Initial adjustment period']
      } else if (config.arrayField === 'barriers') {
        updatedFields[config.arrayField] = ['Time commitment', 'Finding the right fit']
      } else if (config.arrayField === 'issues') {
        updatedFields[config.arrayField] = ['Learning curve', 'Occasional technical issues']
      }
      
      console.log(chalk.yellow(`      Added missing array field '${config.arrayField}' for ${link.solution_variants.solutions.title}`))
    }
    
    // Fix wrong field names (e.g., frequency vs skincare_frequency for beauty_skincare)
    if (category === 'beauty_skincare' && updatedFields['frequency'] && !updatedFields['skincare_frequency']) {
      updatedFields['skincare_frequency'] = updatedFields['frequency']
      delete updatedFields['frequency']
      needsUpdate = true
      console.log(chalk.yellow(`      Fixed field name: frequency → skincare_frequency`))
    }
    
    // Remove invalid fields that shouldn't be there
    const validFields = [...config.required, config.arrayField].filter(Boolean)
    const extraFields = Object.keys(updatedFields).filter(field => !validFields.includes(field))
    
    if (extraFields.length > 0) {
      extraFields.forEach(field => {
        delete updatedFields[field]
        needsUpdate = true
      })
      console.log(chalk.yellow(`      Removed invalid fields: ${extraFields.join(', ')}`))
    }
    
    // Update if needed
    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('goal_implementation_links')
        .update({
          solution_fields: updatedFields
        })
        .eq('id', link.id)
      
      if (updateError) {
        console.error(chalk.red(`   ❌ Failed to update link ${link.id}:`, updateError))
      } else {
        fixedCount++
      }
    }
  }
  
  console.log(chalk.green(`   ✅ Fixed ${fixedCount} solution links`))
}

async function generateMissingDistributions() {
  console.log(chalk.cyan('\n🔧 Checking for missing prevalence distributions...'))
  
  // Get solutions that should have distributions but don't
  const { data: solutions, error } = await supabase
    .from('solutions')
    .select(`
      id,
      title,
      solution_category,
      goal_implementation_links!inner(
        goal_id,
        solution_fields
      )
    `)
    .eq('source_type', 'ai_foundation')
    .limit(50)
  
  if (error) {
    console.error(chalk.red('Error fetching solutions:'), error)
    return
  }
  
  if (!solutions || solutions.length === 0) {
    console.log(chalk.green('   ✅ No solutions to check'))
    return
  }
  
  let missingCount = 0
  
  for (const solution of solutions) {
    const config = CATEGORY_FIELDS[solution.solution_category]
    if (!config) continue
    
    for (const link of solution.goal_implementation_links) {
      // Check if distributions exist for required fields
      const requiredFields = [...config.required]
      if (config.arrayField) {
        requiredFields.push(config.arrayField)
      }
      
      for (const field of requiredFields) {
        const { data: existing } = await supabase
          .from('ai_field_distributions')
          .select('id')
          .eq('solution_id', solution.id)
          .eq('goal_id', link.goal_id)
          .eq('field_name', field)
          .single()
        
        if (!existing) {
          missingCount++
          console.log(chalk.yellow(`   ⚠️  Missing distribution for ${solution.title} - ${field}`))
          
          // We could generate default distributions here, but that would require
          // calling Claude again or using generic defaults
        }
      }
    }
  }
  
  console.log(chalk.yellow(`   ⚠️  Found ${missingCount} missing distributions (regeneration needed)`))
}

async function main() {
  console.log(chalk.cyan('🧹 WWFM Solution Data Cleanup'))
  console.log(chalk.gray('━'.repeat(50)))
  
  await fixBrokenVariants()
  await fixMissingFields()
  await generateMissingDistributions()
  
  console.log(chalk.cyan('\n━'.repeat(50)))
  console.log(chalk.green('✅ Cleanup complete!'))
  console.log(chalk.white('\nNext steps:'))
  console.log(chalk.gray('1. Re-run generation for goals with missing data'))
  console.log(chalk.gray('2. Test a few solutions in the UI to verify fixes'))
  console.log(chalk.gray('3. Run full generation with fixed prompts'))
}

main().catch(error => {
  console.error(chalk.red('Cleanup failed:'), error)
  process.exit(1)
})
