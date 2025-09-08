/**
 * Database Insertion Module
 * 
 * Handles inserting solutions, variants, goal links, and distributions
 * into the Supabase database.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { CategoryFieldConfig } from '../config/category-fields'
import chalk from 'chalk'

export interface Solution {
  title: string
  description: string
  category: string
  effectiveness: number
  effectiveness_rationale?: string
  time_to_results?: string
  variants?: Array<{
    amount: number
    unit: string
    form: string
  }>
  fields: Record<string, any>
}

export interface Goal {
  id: string
  title: string
  description?: string
}

/**
 * Insert a complete solution with all related data into the database
 */
export async function insertSolutionToDatabase(
  goal: Goal,
  solution: Solution,
  distributions: Record<string, any>,
  supabase: SupabaseClient,
  categoryConfig: CategoryFieldConfig
): Promise<void> {
  try {
    // Step 1: Check if solution already exists
    const { data: existingSolution } = await supabase
      .from('solutions')
      .select('id')
      .eq('title', solution.title)
      .eq('solution_category', solution.category)
      .single()
    
    let solutionId: string
    
    if (existingSolution) {
      solutionId = existingSolution.id
      console.log(chalk.gray(`      📎 Using existing solution: ${solution.title}`))
    } else {
      // Create new solution
      const { data: newSolution, error: solutionError } = await supabase
        .from('solutions')
        .insert({
          title: solution.title,
          description: solution.description,
          solution_category: solution.category,
          source_type: 'ai_foundation',
          is_approved: true
        })
        .select()
        .single()
      
      if (solutionError) {
        throw new Error(`Failed to create solution: ${solutionError.message}`)
      }
      
      solutionId = newSolution.id
      console.log(chalk.gray(`      ✨ Created new solution: ${solution.title}`))
    }
    
    // Step 2: Create or get variants
    const variantIds: string[] = []
    
    if (categoryConfig.needsVariants && solution.variants && solution.variants.length > 0) {
      // Create dosage variants
      for (const [index, variant] of solution.variants.entries()) {
        // Create variant name, handling null amount/unit properly and database limit
        let variantName: string
        if (variant.amount && variant.unit) {
          variantName = `${variant.amount}${variant.unit} ${variant.form}`
        } else {
          // For beauty_skincare and natural_remedies, just use the form
          variantName = variant.form
        }
        
        // Truncate to database field limit (50 characters)
        if (variantName.length > 50) {
          variantName = variantName.substring(0, 47) + '...'
        }
        
        // Check if variant exists
        const { data: existingVariant } = await supabase
          .from('solution_variants')
          .select('id')
          .eq('solution_id', solutionId)
          .eq('variant_name', variantName)
          .single()
        
        if (existingVariant) {
          variantIds.push(existingVariant.id)
        } else {
          const { data: newVariant, error: variantError } = await supabase
            .from('solution_variants')
            .insert({
              solution_id: solutionId,
              amount: variant.amount,
              unit: variant.unit,
              form: variant.form,
              variant_name: variantName,
              is_default: index === 0
            })
            .select()
            .single()
          
          if (variantError) {
            throw new Error(`Failed to create variant: ${variantError.message}`)
          }
          
          variantIds.push(newVariant.id)
        }
      }
    } else {
      // Create or get standard variant
      const { data: existingVariant } = await supabase
        .from('solution_variants')
        .select('id')
        .eq('solution_id', solutionId)
        .eq('variant_name', 'Standard')
        .single()
      
      if (existingVariant) {
        variantIds.push(existingVariant.id)
      } else {
        const { data: newVariant, error: variantError } = await supabase
          .from('solution_variants')
          .insert({
            solution_id: solutionId,
            variant_name: 'Standard',
            is_default: true
          })
          .select()
          .single()
        
        if (variantError) {
          throw new Error(`Failed to create standard variant: ${variantError.message}`)
        }
        
        variantIds.push(newVariant.id)
      }
    }
    
    // Step 3: Create goal implementation links for each variant
    for (const variantId of variantIds) {
      // Check if link already exists
      const { data: existingLink } = await supabase
        .from('goal_implementation_links')
        .select('id')
        .eq('goal_id', goal.id)
        .eq('implementation_id', variantId)
        .single()
      
      if (existingLink) {
        // Update existing link
        const { error: updateError } = await supabase
          .from('goal_implementation_links')
          .update({
            avg_effectiveness: solution.effectiveness,
            rating_count: 1, // Marks as AI-generated
            solution_fields: solution.fields
          })
          .eq('id', existingLink.id)
        
        if (updateError) {
          throw new Error(`Failed to update goal link: ${updateError.message}`)
        }
      } else {
        // Create new link
        const { error: linkError } = await supabase
          .from('goal_implementation_links')
          .insert({
            goal_id: goal.id,
            implementation_id: variantId,
            avg_effectiveness: solution.effectiveness,
            rating_count: 1, // Marks as AI-generated
            solution_fields: solution.fields
          })
        
        if (linkError) {
          throw new Error(`Failed to create goal link: ${linkError.message}`)
        }
      }
    }
    
    // Step 4: Create or update prevalence distributions
    for (const [fieldName, distribution] of Object.entries(distributions)) {
      if (!distribution || !Array.isArray(distribution)) {
        continue
      }
      
      // Validate percentages sum to 100
      const totalPercentage = distribution.reduce((sum, item) => sum + (item.percentage || 0), 0)
      if (Math.abs(totalPercentage - 100) > 1) {
        console.log(chalk.yellow(`      ⚠️  Distribution for ${fieldName} sums to ${totalPercentage}%, adjusting...`))
        
        // Adjust the last item to make it sum to 100
        if (distribution.length > 0) {
          distribution[distribution.length - 1].percentage += (100 - totalPercentage)
        }
      }
      
      // Check if distribution exists
      const { data: existingDist } = await supabase
        .from('ai_field_distributions')
        .select('id')
        .eq('solution_id', solutionId)
        .eq('goal_id', goal.id)
        .eq('field_name', fieldName)
        .single()
      
      if (existingDist) {
        // Update existing distribution
        const { error: distError } = await supabase
          .from('ai_field_distributions')
          .update({
            distributions: distribution
          })
          .eq('id', existingDist.id)
        
        if (distError) {
          console.error(chalk.red(`      ❌ Failed to update distribution for ${fieldName}: ${distError.message}`))
        }
      } else {
        // Create new distribution
        const { error: distError } = await supabase
          .from('ai_field_distributions')
          .insert({
            solution_id: solutionId,
            goal_id: goal.id,
            field_name: fieldName,
            distributions: distribution
          })
        
        if (distError) {
          console.error(chalk.red(`      ❌ Failed to create distribution for ${fieldName}: ${distError.message}`))
        }
      }
    }
    
    console.log(chalk.green(`      ✅ Successfully inserted ${solution.title}`))
    
  } catch (error) {
    throw error
  }
}

/**
 * Validate that solution fields match category requirements
 */
export function validateSolutionFields(
  solution: Solution,
  categoryConfig: CategoryFieldConfig
): string[] {
  const errors: string[] = []
  
  // Check required fields
  for (const field of categoryConfig.required) {
    if (!solution.fields[field]) {
      errors.push(`Missing required field: ${field}`)
    }
  }
  
  // Check array field if required
  if (categoryConfig.arrayField) {
    const arrayValue = solution.fields[categoryConfig.arrayField]
    if (!arrayValue) {
      errors.push(`Missing array field: ${categoryConfig.arrayField}`)
    } else if (!Array.isArray(arrayValue)) {
      errors.push(`Field ${categoryConfig.arrayField} should be an array`)
    }
  }
  
  return errors
}

/**
 * Batch insert multiple solutions
 */
export async function batchInsertSolutions(
  goals: Goal[],
  solutions: Solution[],
  supabase: SupabaseClient
): Promise<number> {
  let totalInserted = 0
  
  for (const goal of goals) {
    for (const solution of solutions) {
      try {
        // This would need to be implemented with proper distribution generation
        await insertSolutionToDatabase(
          goal,
          solution,
          {}, // Distributions would be generated here
          supabase,
          {} as CategoryFieldConfig // Would need proper config
        )
        totalInserted++
      } catch (error) {
        console.error(chalk.red(`Failed to insert ${solution.title} for ${goal.title}: ${error.message}`))
      }
    }
  }
  
  return totalInserted
}
