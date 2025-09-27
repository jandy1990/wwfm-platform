#!/usr/bin/env node
/**
 * Test Dropdown Validation for AI Solution Generator
 * 
 * Tests that the AI uses correct dropdown values
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import chalk from 'chalk'
import { getSolutionGenerationPrompt, validateDropdownValues } from './prompts/master-prompts'
import { getDropdownOptionsForField, DROPDOWN_OPTIONS } from './config/dropdown-options'
import { CATEGORY_FIELDS } from './config/category-fields'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function testDropdownValidation() {
  console.log(chalk.cyan('🧪 Testing Dropdown Validation for AI Solution Generator\n'))
  
  // Test 1: Verify dropdown options are loaded
  console.log('1️⃣  Checking dropdown options configuration...')
  
  const testCategories = ['medications', 'apps_software', 'therapists_counselors']
  for (const category of testCategories) {
    const config = CATEGORY_FIELDS[category]
    if (!config) {
      console.error(chalk.red(`   ❌ No config for ${category}`))
      continue
    }
    
    console.log(chalk.gray(`   Testing ${category}:`))
    for (const field of config.required) {
      const options = getDropdownOptionsForField(category, field)
      if (options) {
        console.log(chalk.green(`     ✅ ${field}: ${options.length} options`))
      } else {
        console.log(chalk.yellow(`     ⚠️  ${field}: No dropdown options (free text)`))
      }
    }
  }
  console.log()
  
  // Test 2: Test with a sample goal
  console.log('2️⃣  Testing AI generation with dropdown validation...')
  
  // Get a test goal
  const { data: goals, error } = await supabase
    .from('goals')
    .select('id, title, description, arenas(name), categories(name)')
    .eq('title', 'Reduce anxiety')
    .limit(1)
    
  if (error || !goals || goals.length === 0) {
    console.error(chalk.red('   ❌ Could not find test goal "Reduce anxiety"'))
    return
  }
  
  const goal = goals[0]
  console.log(chalk.gray(`   Using goal: ${goal.title}`))
  
  // Initialize Anthropic
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(chalk.red('   ❌ ANTHROPIC_API_KEY not found'))
    return
  }
  
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })
  
  // Generate prompt
  const prompt = getSolutionGenerationPrompt(
    goal.title,
    goal.description || '',
    goal.arenas?.name || 'Mental Health',
    goal.categories?.name || 'Emotional Wellness',
    3 // Just 3 solutions for testing
  )
  
  console.log(chalk.gray('   Requesting 3 solutions from AI...'))
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
    
    const responseText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : ''
    
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error(chalk.red('   ❌ Could not parse JSON from AI response'))
      return
    }
    
    const solutions = JSON.parse(jsonMatch[0])
    console.log(chalk.green(`   ✅ AI generated ${solutions.length} solutions\n`))
    
    // Test 3: Validate each solution's dropdown values
    console.log('3️⃣  Validating dropdown values in generated solutions...')
    
    let allValid = true
    for (const solution of solutions) {
      console.log(chalk.gray(`\n   Solution: ${solution.title} (${solution.category})`))
      
      // Validate dropdown values
      const errors = validateDropdownValues(solution.category, solution.fields)
      
      if (errors.length === 0) {
        console.log(chalk.green('     ✅ All dropdown values are valid!'))
        
        // Show the values
        const config = CATEGORY_FIELDS[solution.category]
        if (config) {
          for (const field of config.required) {
            const value = solution.fields[field]
            const options = getDropdownOptionsForField(solution.category, field)
            if (options && value) {
              console.log(chalk.gray(`       ${field}: "${value}"`))
            }
          }
        }
      } else {
        allValid = false
        console.log(chalk.red('     ❌ Invalid dropdown values detected:'))
        errors.forEach(err => console.log(chalk.red(`       - ${err}`)))
        
        // Show what the AI generated vs what's allowed
        errors.forEach(err => {
          const match = err.match(/Field "([^"]+)" has invalid value "([^"]+)"/)
          if (match) {
            const [, field, value] = match
            const options = getDropdownOptionsForField(solution.category, field)
            if (options) {
              console.log(chalk.yellow(`       Allowed for ${field}:`))
              console.log(chalk.gray(`         ${options.slice(0, 3).join(', ')}...`))
            }
          }
        })
      }
    }
    
    console.log(chalk.cyan('\n━'.repeat(50)))
    if (allValid) {
      console.log(chalk.green('✅ SUCCESS! All generated solutions use valid dropdown values.\n'))
    } else {
      console.log(chalk.yellow('⚠️  Some solutions had invalid dropdown values.'))
      console.log(chalk.yellow('   The AI may need better prompting or the values need correction.\n'))
    }
    
    // Test 4: Show sample prevalence distribution request
    console.log('4️⃣  Testing prevalence distribution generation...')
    if (solutions.length > 0) {
      const testSolution = solutions[0]
      console.log(chalk.gray(`   Getting distributions for: ${testSolution.title}`))
      
      const distPrompt = (await import('./prompts/master-prompts')).getDistributionPrompt(
        testSolution.title,
        goal.title,
        testSolution.fields,
        testSolution.category
      )
      
      const distResponse = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: distPrompt
        }]
      })
      
      const distText = distResponse.content[0].type === 'text'
        ? distResponse.content[0].text
        : '{}'
      
      const distJsonMatch = distText.match(/\{[\s\S]*\}/)
      if (distJsonMatch) {
        const distributions = JSON.parse(distJsonMatch[0])
        console.log(chalk.green('   ✅ Distributions generated successfully'))
        
        // Check if distributions use correct dropdown values
        for (const [field, dist] of Object.entries(distributions)) {
          if (Array.isArray(dist)) {
            const options = getDropdownOptionsForField(testSolution.category, field)
            if (options) {
              const invalidValues = dist
                .map(item => item.name)
                .filter(name => !options.includes(name) && !Array.isArray(testSolution.fields[field]))
              
              if (invalidValues.length > 0) {
                console.log(chalk.yellow(`     ⚠️  Field "${field}" has non-dropdown values: ${invalidValues.join(', ')}`))
              } else {
                console.log(chalk.green(`     ✅ Field "${field}" uses valid dropdown values`))
              }
            }
          }
        }
      }
    }
    
  } catch (error: any) {
    console.error(chalk.red(`   ❌ Error: ${error.message}`))
  }
  
  console.log(chalk.cyan('\n━'.repeat(50)))
  console.log(chalk.white('\nNext steps:'))
  console.log(chalk.gray('  1. If validation passed, run a dry-run test:'))
  console.log(chalk.white('     npm run generate:ai-solutions -- --limit=5 --dry-run\n'))
  console.log(chalk.gray('  2. If validation failed, check the prompts in:'))
  console.log(chalk.white('     scripts/ai-solution-generator/prompts/master-prompts.ts\n'))
}

testDropdownValidation().catch(error => {
  console.error(chalk.red('Test failed:'), error)
  process.exit(1)
})
