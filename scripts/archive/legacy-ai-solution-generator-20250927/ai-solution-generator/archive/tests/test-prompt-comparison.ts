#!/usr/bin/env tsx

/**
 * Quick comparison test: Original prompt vs Brand Name First strategy
 * Tests with the problematic "Be more approachable" goal
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import path from 'path'
import chalk from 'chalk'
import { checkSpecificity } from './validate-specificity-standalone'
import { getSolutionGenerationPrompt, cleanGeminiOutput } from './prompts/master-prompts-optimized'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const TEST_GOAL = {
  title: 'Be more approachable',
  description: 'Develop a warm, welcoming presence that makes others feel comfortable approaching and talking to you',
  arena: 'Social & Relationships',
  category: 'Personal Growth'
}

async function testPromptStrategy(
  strategyName: string,
  strategy: 'original' | 'brand-first' | 'shopping-cart',
  genAI: GoogleGenerativeAI
) {
  console.log(chalk.cyan(`\n🧪 Testing ${strategyName} Strategy`))
  console.log(chalk.gray('-'.repeat(50)))
  
  const prompt = getSolutionGenerationPrompt(
    TEST_GOAL.title,
    TEST_GOAL.description,
    TEST_GOAL.arena,
    TEST_GOAL.category,
    5, // Just 5 solutions for quick test
    strategy
  )
  
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json'
      }
    })
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()
    
    let solutions = JSON.parse(content)
    if (!Array.isArray(solutions)) {
      solutions = solutions.solutions || []
    }
    
    console.log(`Generated ${solutions.length} solutions:\n`)
    
    let specificCount = 0
    let vagueCount = 0
    const cleanedSolutions = []
    
    for (const sol of solutions) {
      // Clean the output
      const originalTitle = sol.title
      const cleanedTitle = cleanGeminiOutput(sol.title)
      
      // Check specificity
      const check = checkSpecificity(cleanedTitle)
      const isSpecific = check.isSpecific && check.isGoogleable
      
      if (isSpecific) {
        specificCount++
        console.log(chalk.green(`✅ ${cleanedTitle}`))
      } else {
        vagueCount++
        console.log(chalk.red(`❌ ${cleanedTitle}`))
      }
      
      if (originalTitle !== cleanedTitle) {
        console.log(chalk.gray(`   (cleaned from: ${originalTitle})`))
      }
      
      cleanedSolutions.push({ ...sol, title: cleanedTitle })
    }
    
    const successRate = (specificCount / solutions.length) * 100
    
    console.log(chalk.bold(`\nResults: ${specificCount}/${solutions.length} specific (${successRate.toFixed(1)}%)`))
    
    return { specificCount, vagueCount, successRate, cleanedSolutions }
    
  } catch (error) {
    console.error(chalk.red('Error:'), error)
    return { specificCount: 0, vagueCount: 0, successRate: 0, cleanedSolutions: [] }
  }
}

async function main() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error(chalk.red('❌ No Gemini API key found'))
    process.exit(1)
  }
  
  const genAI = new GoogleGenerativeAI(apiKey)
  
  console.log(chalk.bold.cyan('🔬 PROMPT STRATEGY COMPARISON TEST'))
  console.log(chalk.gray('='.repeat(50)))
  console.log(chalk.blue(`Goal: "${TEST_GOAL.title}"`))
  
  // Test original prompt
  const originalResults = await testPromptStrategy('Original', 'original', genAI)
  
  // Wait for rate limiting
  console.log(chalk.gray('\n⏱️  Waiting 4s for rate limiting...'))
  await new Promise(resolve => setTimeout(resolve, 4000))
  
  // Test Brand Name First prompt
  const brandFirstResults = await testPromptStrategy('Brand Name First', 'brand-first', genAI)
  
  // Summary
  console.log(chalk.bold.green('\n📊 COMPARISON SUMMARY'))
  console.log(chalk.gray('='.repeat(50)))
  
  console.log('\nOriginal Prompt:')
  console.log(`  Success Rate: ${chalk.red(originalResults.successRate.toFixed(1) + '%')}`)
  console.log(`  Specific: ${originalResults.specificCount}`)
  console.log(`  Vague: ${originalResults.vagueCount}`)
  
  console.log('\nBrand Name First Prompt:')
  console.log(`  Success Rate: ${chalk.green(brandFirstResults.successRate.toFixed(1) + '%')}`)
  console.log(`  Specific: ${brandFirstResults.specificCount}`)
  console.log(`  Vague: ${brandFirstResults.vagueCount}`)
  
  const improvement = brandFirstResults.successRate - originalResults.successRate
  
  console.log(chalk.bold(`\n🎯 Improvement: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%`))
  
  if (improvement > 20) {
    console.log(chalk.green('✅ Significant improvement! Brand Name First strategy is working.'))
  } else if (improvement > 0) {
    console.log(chalk.yellow('⚠️  Some improvement, but may need additional optimization.'))
  } else {
    console.log(chalk.red('❌ No improvement. Need to try different strategies.'))
  }
  
  // Show example improvements
  if (brandFirstResults.cleanedSolutions.length > 0) {
    console.log(chalk.cyan('\n📝 Example solutions with Brand Name First:'))
    brandFirstResults.cleanedSolutions.slice(0, 3).forEach(sol => {
      console.log(`  • ${sol.title}`)
    })
  }
}

if (require.main === module) {
  main().catch(console.error)
}