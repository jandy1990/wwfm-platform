/**
 * Solution Generator Module
 * 
 * Consults Gemini AI for evidence-based solution recommendations
 * based on training data and research knowledge.
 * 
 * Migrated from Claude to Gemini to reduce costs (free tier vs $137/run)
 */

// import Anthropic from '@anthropic-ai/sdk' // Kept for reference
import { GeminiClient } from './gemini-client'
import { SupabaseClient } from '@supabase/supabase-js'
import { getSolutionGenerationPrompt, getDistributionPrompt, validateDropdownValues } from '../prompts/master-prompts'
import { getCleanSolutionPrompt, getCleanDistributionPrompt } from '../prompts/master-prompts-clean'
import { getImprovedSolutionPrompt, getImprovedDistributionPrompt } from '../prompts/master-prompts-improved'
import { getV2SolutionPrompt, getV2DistributionPrompt } from '../prompts/master-prompts-v2'
import { CATEGORY_FIELDS } from '../config/category-fields'
import { getDropdownOptionsForField } from '../config/dropdown-options'
import { insertSolutionToDatabase } from '../database/inserter'
import { mapAllFieldsToDropdowns } from '../utils/value-mapper'
import { parseJSONSafely } from '../utils/json-repair'
import chalk from 'chalk'

export interface Goal {
  id: string
  title: string
  description?: string
  arena_id?: string
  arenas?: { name: string }
  categories?: { name: string }
}

export interface GenerationOptions {
  dryRun?: boolean
  limit?: number
}

/**
 * Generate solutions for a single goal using Claude AI
 */
export async function generateSolutionsForGoal(
  goal: Goal,
  supabase: SupabaseClient,
  options: GenerationOptions = {}
): Promise<number> {
  const { dryRun = false, limit = 15 } = options
  
  // Initialize Gemini client inside the function
  // const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }) // Old Claude code
  const gemini = new GeminiClient(process.env.GEMINI_API_KEY!)
  
  // Show usage stats at the start
  const stats = gemini.getUsageStats()
  if (stats.requestsToday === 0) {
    console.log(chalk.cyan(`   📊 Starting fresh today (${stats.requestsRemaining} requests available)`))
  }
  
  try {
    // Step 1: Get evidence-based solutions from Gemini
    console.log(chalk.gray('   🤖 Consulting AI for evidence-based solutions...'))
    
    // Use V2 prompts with direct category-to-field mapping
    const solutionsPrompt = getV2SolutionPrompt(
      goal.title,
      goal.description || '',
      goal.arenas?.name || 'general',
      goal.categories?.name || 'general',
      limit
    )
    
    // Use Gemini instead of Claude
    const responseText = await gemini.generateContent(solutionsPrompt)
    
    // Debug: Log response length to check if it's getting truncated
    console.log(chalk.gray(`   📝 Response length: ${responseText.length} characters`))
    if (responseText.length > 4000) {
      console.log(chalk.yellow(`   ⚠️  Response might be truncated (${responseText.length} chars)`))
    }
    
    // Old Claude code for reference:
    // const solutionResponse = await anthropic.messages.create({
    //   model: 'claude-3-5-sonnet-20241022',
    //   max_tokens: 4000,
    //   temperature: 0.3,
    //   messages: [{ role: 'user', content: solutionsPrompt }]
    // })
    // const responseText = solutionResponse.content[0].type === 'text' 
    //   ? solutionResponse.content[0].text : ''
    
    // Parse JSON with repair fallback
    let solutions
    try {
      solutions = parseJSONSafely(responseText)
    } catch (error) {
      console.log(chalk.red('   ❌ Failed to parse solutions JSON'))
      throw error
    }
    
    if (!Array.isArray(solutions) || solutions.length === 0) {
      console.log(chalk.yellow('   ⚠️  No solutions generated for this goal'))
      return 0
    }
    
    console.log(chalk.gray(`   📋 AI recommended ${solutions.length} solutions`))
    
    // Show top 3 solutions for transparency
    const topSolutions = solutions.slice(0, 3)
    topSolutions.forEach((sol, idx) => {
      console.log(chalk.gray(`      ${idx + 1}. ${sol.title} (${sol.effectiveness}★) - ${sol.category}`))
    })
    
    if (dryRun) {
      console.log(chalk.yellow('   🔍 DRY RUN - Would insert:'))
      solutions.forEach(sol => {
        console.log(chalk.gray(`      - ${sol.title} (${sol.category}): ${sol.effectiveness}★`))
        console.log(chalk.gray(`        Fields: ${JSON.stringify(sol.fields)}`))
        if (sol.variants) {
          console.log(chalk.gray(`        Variants: ${JSON.stringify(sol.variants)}`))
        }
        
        // Validate dropdown values in dry run
        const validationErrors = validateDropdownValues(sol.category, sol.fields)
        if (validationErrors.length > 0) {
          console.log(chalk.red(`        ⚠️  Validation errors:`))
          validationErrors.forEach(err => console.log(chalk.red(`          - ${err}`)))
        }
      })
      return solutions.length
    }
    
    // Step 2: For each solution, get prevalence distributions and insert
    let insertedCount = 0
    
    for (const solution of solutions) {
      try {
        console.log(chalk.gray(`   💾 Processing: ${solution.title}`))
        
        // Get the required fields for this category
        const categoryConfig = CATEGORY_FIELDS[solution.category]
        if (!categoryConfig) {
          console.log(chalk.yellow(`      ⚠️  Unknown category: ${solution.category}, skipping`))
          continue
        }
        
        // Map natural values to dropdown options using intelligent mapper
        console.log(chalk.gray('      🔄 Mapping to dropdown values...'))
        const originalFields = { ...solution.fields }
        solution.fields = mapAllFieldsToDropdowns(solution.fields, solution.category)
        
        // Log any mappings that occurred
        for (const [field, originalValue] of Object.entries(originalFields)) {
          if (originalValue !== solution.fields[field]) {
            console.log(chalk.cyan(`        Mapped ${field}: "${originalValue}" → "${solution.fields[field]}"`))
          }
        }
        
        // Now validate the mapped values
        const validationErrors = validateDropdownValues(solution.category, solution.fields)
        if (validationErrors.length > 0) {
          console.log(chalk.yellow(`      ⚠️  Validation issues after mapping:`))
          validationErrors.forEach(err => console.log(chalk.yellow(`        - ${err}`)))
        }
        
        // Validate that solution has the required fields
        const missingFields = categoryConfig.required.filter(field => 
          !solution.fields || solution.fields[field] === undefined
        )
        
        if (missingFields.length > 0) {
          console.log(chalk.yellow(`      ⚠️  Missing required fields: ${missingFields.join(', ')}`))
          // Fill in missing fields with defaults from dropdown options
          if (!solution.fields) solution.fields = {}
          
          missingFields.forEach(field => {
            const allowedOptions = getDropdownOptionsForField(solution.category, field)
            if (allowedOptions && allowedOptions.length > 0) {
              // Use a sensible default from the dropdown options
              if (field === 'cost' || field.includes('cost')) {
                // Find a mid-range cost option
                const midIndex = Math.floor(allowedOptions.length / 2)
                solution.fields[field] = allowedOptions[midIndex]
              } else if (field === 'time_to_results' || field === 'time_to_enjoyment') {
                // Default to 3-4 weeks for time fields
                solution.fields[field] = allowedOptions.find(opt => opt.includes('3-4 weeks')) || allowedOptions[2]
              } else if (field.includes('frequency')) {
                // Default to a moderate frequency
                solution.fields[field] = allowedOptions.find(opt => opt.includes('Weekly')) || allowedOptions[2]
              } else {
                // Use the first non-"Select" option
                solution.fields[field] = allowedOptions.find(opt => !opt.includes('Select')) || allowedOptions[0]
              }
              console.log(chalk.gray(`        Added default for ${field}: "${solution.fields[field]}"`))
            } else {
              // No dropdown options, use generic default
              solution.fields[field] = 'Standard'
            }
          })
        }
        
        // Step 2a: Get prevalence distributions from Gemini
        const distributionPrompt = getV2DistributionPrompt(
          solution.title,
          goal.title,
          solution.fields,
          solution.category
        )
        
        // Use Gemini instead of Claude
        const distText = await gemini.generateContent(distributionPrompt)
        
        // Old Claude code for reference:
        // const distResponse = await anthropic.messages.create({
        //   model: 'claude-3-5-sonnet-20241022',
        //   max_tokens: 2000,
        //   temperature: 0.3,
        //   messages: [{ role: 'user', content: distributionPrompt }]
        // })
        // const distText = distResponse.content[0].type === 'text'
        //   ? distResponse.content[0].text : '{}'
        
        // Parse distributions with repair fallback
        let distributions = {}
        try {
          distributions = parseJSONSafely(distText)
        } catch (error) {
          console.log(chalk.yellow(`      ⚠️  Failed to parse distributions, using empty`))
          // Continue without distributions rather than failing completely
        }
        
        // Step 3: Insert into database with proper variant handling
        await insertSolutionToDatabase(
          goal,
          solution,
          distributions,
          supabase,
          categoryConfig
        )
        
        insertedCount++
        console.log(chalk.green(`      ✅ Successfully inserted ${solution.title}`))
        
      } catch (error: any) {
        console.error(chalk.red(`      ❌ Failed to insert ${solution.title}: ${error.message}`))
        // Continue with next solution
      }
      
      // Delay handled by GeminiClient rate limiting
      // await new Promise(resolve => setTimeout(resolve, 500)) // Not needed with Gemini client
    }
    
    return insertedCount
    
  } catch (error: any) {
    console.error(chalk.red(`   ❌ Error generating solutions: ${error.message}`))
    throw error
  }
}
