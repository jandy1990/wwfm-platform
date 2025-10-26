#!/usr/bin/env tsx

/**
 * Test script to verify Attribution Required implementation
 * Ensures all existing functionality (validation, mapping) works with new prompts
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import path from 'path'
import { getSolutionGenerationPrompt, validateDropdownValues } from './prompts/master-prompts'
import { mapAllFieldsToDropdowns } from './utils/value-mapper'
import { CATEGORY_FIELDS } from './config/category-fields'
import chalk from 'chalk'

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env.local')
dotenv.config({ path: envPath })

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

async function testAttributionImplementation() {
  console.log(chalk.cyan('🧪 Testing Attribution Required Implementation'))
  console.log(chalk.gray('='.repeat(60)))
  
  // Test goal
  const testGoal = {
    title: 'Reduce anxiety',
    description: 'Lower anxiety levels and manage stress better',
    arena: 'mental_health',
    category: 'Mental Health'
  }
  
  // Generate prompt with Attribution Required
  const prompt = getSolutionGenerationPrompt(
    testGoal.title,
    testGoal.description,
    testGoal.arena,
    testGoal.category,
    3 // Just generate 3 solutions for testing
  )
  
  console.log(chalk.yellow('\n📝 Checking prompt includes Attribution Required:'))
  const hasAttribution = prompt.includes('ATTRIBUTION REQUIRED')
  const hasExamples = prompt.includes("Dr. Weil's 4-7-8 breathing")
  const hasRejection = prompt.includes('UNACCEPTABLE (will be rejected)')
  
  console.log(hasAttribution ? chalk.green('✅ Attribution section present') : chalk.red('❌ Attribution section missing'))
  console.log(hasExamples ? chalk.green('✅ Examples present') : chalk.red('❌ Examples missing'))
  console.log(hasRejection ? chalk.green('✅ Rejection criteria present') : chalk.red('❌ Rejection criteria missing'))
  
  // Test with Gemini
  console.log(chalk.yellow('\n🤖 Testing with Gemini API:'))
  
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json'
      }
    })
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse solutions
    const solutions = JSON.parse(text)
    
    console.log(chalk.green(`✅ Generated ${solutions.length} solutions`))
    
    // Check each solution
    for (const [idx, solution] of solutions.entries()) {
      console.log(chalk.cyan(`\n📍 Solution ${idx + 1}: ${solution.title}`))
      
      // Check for attribution patterns
      const hasAttribution = 
        solution.title.includes("'s") || 
        solution.title.includes(' by ') ||
        solution.title.includes(' Method') ||
        solution.title.includes(' Technique') ||
        /[A-Z][a-z]+\s+[A-Z]/.test(solution.title) // Proper nouns
      
      console.log(hasAttribution ? 
        chalk.green('  ✅ Has attribution') : 
        chalk.red('  ❌ No attribution detected'))
      
      // Test field mapping if fields exist
      if (solution.fields && solution.category) {
        console.log(chalk.gray('  📊 Testing field mapping...'))
        
        // Map fields to dropdown values
        const mappedFields = mapAllFieldsToDropdowns(solution.fields, solution.category)
        
        // Validate dropdown values
        const errors = validateDropdownValues(solution.category, mappedFields)
        
        if (errors.length === 0) {
          console.log(chalk.green('  ✅ All fields mapped successfully'))
        } else {
          console.log(chalk.red(`  ❌ Field mapping errors: ${errors.length}`))
          errors.forEach(err => console.log(chalk.red(`     - ${err}`)))
        }
      }
    }
    
    // Calculate attribution success rate
    const attributedCount = solutions.filter((sol: any) => {
      const title = sol.title || ''
      return title.includes("'s") || 
             title.includes(' by ') ||
             title.includes(' Method') ||
             title.includes(' Technique') ||
             /[A-Z][a-z]+\s+[A-Z]/.test(title)
    }).length
    
    const successRate = ((attributedCount / solutions.length) * 100).toFixed(1)
    
    console.log(chalk.yellow('\n📊 Results Summary:'))
    console.log(`  Attribution Success Rate: ${successRate}%`)
    console.log(attributedCount === solutions.length ? 
      chalk.green('  ✅ All solutions have attribution!') :
      chalk.yellow(`  ⚠️ ${solutions.length - attributedCount} solutions lack clear attribution`))
    
  } catch (error: any) {
    console.error(chalk.red('❌ Error testing with Gemini:'), error.message)
    if (error.message?.includes('429')) {
      console.log(chalk.yellow('Rate limit hit - this is expected with free tier'))
    }
  }
  
  console.log(chalk.cyan('\n✅ Test complete!'))
}

// Run test
testAttributionImplementation().catch(console.error)