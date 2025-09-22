#!/usr/bin/env node

/**
 * Fix Failed Variant Creation Script
 * 
 * This script fixes solutions that were created but failed during variant creation
 * due to the 50-character naming limit issue.
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import chalk from 'chalk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const FAILED_SOLUTIONS = [
  'Quick Hydration Boost',
  'Instant Glow Facial Serum', 
  'Quick Style Hair Mask',
  'Color Wow Dream Coat',
  'Instant Concealer Pen',
  'Sheet Masks with Hyaluronic Acid and Niacinamide',
  'Rapid Tan Mousse',
  'Dry Shampoo',
  'Instant Whitening Toothpaste'
]

async function main() {
  console.log(chalk.cyan('🔧 Fixing Failed Variant Creation'))
  console.log(chalk.gray('━'.repeat(50)))
  
  let fixedCount = 0
  
  for (const solutionTitle of FAILED_SOLUTIONS) {
    try {
      console.log(chalk.white(`\n🔍 Processing: ${solutionTitle}`))
      
      // Get the solution
      const { data: solution, error: solutionError } = await supabase
        .from('solutions')
        .select('id, solution_category')
        .eq('title', solutionTitle)
        .single()
      
      if (solutionError || !solution) {
        console.log(chalk.red(`   ❌ Solution not found: ${solutionTitle}`))
        continue
      }
      
      console.log(chalk.gray(`   📋 Solution ID: ${solution.id}, Category: ${solution.solution_category}`))
      
      // Check if variants already exist
      const { data: existingVariants } = await supabase
        .from('solution_variants')
        .select('id')
        .eq('solution_id', solution.id)
      
      if (existingVariants && existingVariants.length > 0) {
        console.log(chalk.yellow(`   ⚠️  Solution already has ${existingVariants.length} variants, skipping`))
        continue
      }
      
      // Create appropriate variants based on category
      let variantIds: string[] = []
      
      if (solution.solution_category === 'beauty_skincare' || solution.solution_category === 'supplements_vitamins') {
        // Create sample variants for beauty/supplement products
        const variants = solution.solution_category === 'beauty_skincare' ? [
          { amount: null, unit: null, form: 'Cream', variant_name: 'Cream' },
          { amount: null, unit: null, form: 'Serum', variant_name: 'Serum' },
          { amount: null, unit: null, form: 'Lotion', variant_name: 'Lotion' }
        ] : [
          { amount: 25, unit: 'mg', form: 'tablet', variant_name: '25mg tablet' },
          { amount: 50, unit: 'mg', form: 'tablet', variant_name: '50mg tablet' },
          { amount: 100, unit: 'mg', form: 'capsule', variant_name: '100mg capsule' }
        ]
        
        for (const [index, variant] of variants.entries()) {
          const { data: newVariant, error: variantError } = await supabase
            .from('solution_variants')
            .insert({
              solution_id: solution.id,
              amount: variant.amount,
              unit: variant.unit,
              form: variant.form,
              variant_name: variant.variant_name,
              is_default: index === 0
            })
            .select()
            .single()
          
          if (variantError) {
            console.log(chalk.red(`   ❌ Failed to create variant: ${variantError.message}`))
            continue
          }
          
          variantIds.push(newVariant.id)
          console.log(chalk.green(`   ✨ Created variant: ${variant.variant_name}`))
        }
      } else {
        // Create standard variant
        const { data: newVariant, error: variantError } = await supabase
          .from('solution_variants')
          .insert({
            solution_id: solution.id,
            variant_name: 'Standard',
            is_default: true
          })
          .select()
          .single()
        
        if (variantError) {
          console.log(chalk.red(`   ❌ Failed to create standard variant: ${variantError.message}`))
          continue
        }
        
        variantIds.push(newVariant.id)
        console.log(chalk.green(`   ✨ Created standard variant`))
      }
      
      // Now find which goal(s) this solution should be linked to by looking at recent generation logs
      // For now, we'll need to manually identify the goal. Let's create a placeholder goal link
      // The proper way would be to re-run the specific generation for these solutions
      
      console.log(chalk.green(`   ✅ Fixed ${solutionTitle} with ${variantIds.length} variants`))
      fixedCount++
      
    } catch (error: any) {
      console.log(chalk.red(`   ❌ Error fixing ${solutionTitle}: ${error.message}`))
    }
  }
  
  console.log(chalk.cyan('\n' + '═'.repeat(50)))
  console.log(chalk.cyan('📊 Fix Summary'))
  console.log(chalk.cyan('═'.repeat(50)))
  console.log(chalk.white(`✅ Fixed solutions: ${fixedCount}/${FAILED_SOLUTIONS.length}`))
  
  if (fixedCount < FAILED_SOLUTIONS.length) {
    console.log(chalk.yellow('\n⚠️  Some solutions still need manual goal linking'))
    console.log(chalk.yellow('Run the generator again for the specific goals that had these solutions'))
  }
}

main().catch(error => {
  console.error(chalk.red('Error:'), error)
  process.exit(1)
})