#!/usr/bin/env tsx

/**
 * Quick test of all 6 strategies on 3 diverse goals
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import path from 'path'
import chalk from 'chalk'
import { checkSpecificity } from './validate-specificity-standalone'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// 3 diverse test goals
const TEST_GOALS = [
  {
    id: 'social',
    title: 'Be more approachable',
    arena: 'Social',
    category: 'Social Skills'
  },
  {
    id: 'health',
    title: 'Reduce anxiety',
    arena: 'Health',
    category: 'Mental Health'
  },
  {
    id: 'productivity',
    title: 'Stop procrastinating',
    arena: 'Productivity',
    category: 'Time Management'
  }
]

// All 6 strategies
const STRATEGIES = {
  'Product Reviewer': (goal: any) => `You are a product reviewer. Recommend 5 SPECIFIC products/services for "${goal.title}". Only include things with websites/apps you could link to. Return JSON array.`,
  
  'URL Test': (goal: any) => `Generate 5 solutions for "${goal.title}". Only include if typing the name into Google would find the exact product page. Return JSON array.`,
  
  'Anti-Pattern': (goal: any) => `You earn $1 for specific solutions, lose $10 for vague ones. Vague = "meditation practice", Specific = "Headspace app". Generate 5 for "${goal.title}". Return JSON array.`,
  
  'Brand First': (goal: any) => `Generate 5 solutions for "${goal.title}". MUST start with [Brand/Author] + [Product]. Examples: "Nike Run Club", "Tim Ferriss's 4-Hour Body". Return JSON array.`,
  
  'Shopping Cart': (goal: any) => `List 5 items for "${goal.title}" you could: Add to Amazon cart, Download from App Store, or Sign up online today. Use exact product names. Return JSON array.`,
  
  'Citation Required': (goal: any) => `Generate 5 solutions for "${goal.title}". Each must be citable: "According to [Company], their [Product] helps with...". Return JSON array with company + product.`
}

async function testStrategy(
  strategyName: string,
  prompt: string,
  genAI: GoogleGenerativeAI
): Promise<{ specific: number, vague: number, rate: number, examples: string[] }> {
  const fullPrompt = prompt + `\n\nFormat: [{"title": "Product Name", "category": "category_name", "effectiveness": 4.0}]`
  
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        responseMimeType: 'application/json'
      }
    })
    
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const content = response.text()
    
    let solutions = JSON.parse(content)
    if (!Array.isArray(solutions)) {
      solutions = solutions.solutions || []
    }
    
    let specific = 0
    let vague = 0
    const examples: string[] = []
    
    for (const sol of solutions.slice(0, 5)) {
      const title = sol.title || ''
      const check = checkSpecificity(title)
      
      if (check.isSpecific && check.isGoogleable) {
        specific++
        if (examples.length < 2) examples.push(`✅ ${title}`)
      } else {
        vague++
        if (examples.length < 2) examples.push(`❌ ${title}`)
      }
    }
    
    return {
      specific,
      vague,
      rate: solutions.length > 0 ? (specific / Math.min(solutions.length, 5)) * 100 : 0,
      examples
    }
  } catch (error) {
    return { specific: 0, vague: 0, rate: 0, examples: ['Error'] }
  }
}

async function runQuickTest() {
  console.log(chalk.cyan('🚀 QUICK STRATEGY TEST - 3 Goals × 6 Strategies'))
  console.log('='.repeat(60))
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const results: any = {}
  
  // Initialize results structure
  for (const strategyName of Object.keys(STRATEGIES)) {
    results[strategyName] = { total: 0, scores: [] }
  }
  
  // Test each goal
  for (const goal of TEST_GOALS) {
    console.log(chalk.blue(`\n📋 "${goal.title}"`))
    console.log('-'.repeat(40))
    
    for (const [strategyName, getPrompt] of Object.entries(STRATEGIES)) {
      process.stdout.write(`  ${strategyName.padEnd(20)}`)
      
      const prompt = getPrompt(goal)
      const result = await testStrategy(strategyName, prompt, genAI)
      
      results[strategyName].scores.push(result.rate)
      results[strategyName].total += result.rate
      
      // Color code the result
      const color = result.rate >= 80 ? chalk.green : 
                    result.rate >= 60 ? chalk.yellow : chalk.red
      console.log(color(`${result.rate.toFixed(0)}%`.padStart(4)) + 
                 ` (${result.specific}/${result.specific + result.vague})`)
      
      // Show examples for first goal only
      if (goal.id === 'social' && result.examples.length > 0) {
        for (const ex of result.examples.slice(0, 1)) {
          console.log(`     ${ex}`)
        }
      }
      
      await new Promise(r => setTimeout(r, 1000))
    }
  }
  
  // Calculate averages and rank
  console.log('\n' + '='.repeat(60))
  console.log(chalk.cyan('📊 OVERALL RANKINGS'))
  console.log('='.repeat(60))
  
  const rankings = Object.entries(results)
    .map(([name, data]: [string, any]) => ({
      name,
      average: data.total / TEST_GOALS.length,
      scores: data.scores
    }))
    .sort((a, b) => b.average - a.average)
  
  rankings.forEach((strategy, idx) => {
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  '
    const color = strategy.average >= 80 ? chalk.green :
                  strategy.average >= 60 ? chalk.yellow : chalk.red
    
    console.log(`${medal} ${(idx + 1 + '.').padEnd(3)} ${strategy.name.padEnd(20)} ` +
               color(`${strategy.average.toFixed(1)}%`) +
               ` [${strategy.scores.map((s: number) => s.toFixed(0)).join(', ')}]`)
  })
  
  // Recommendation
  console.log('\n' + '='.repeat(60))
  console.log(chalk.cyan('💡 RECOMMENDATION'))
  console.log('='.repeat(60))
  
  const best = rankings[0]
  const second = rankings[1]
  
  if (best.average >= 90) {
    console.log(chalk.green(`\n✅ Use "${best.name}" strategy`))
    console.log(`   ${best.average.toFixed(1)}% average specificity`)
  } else if (best.average >= 80) {
    console.log(chalk.yellow(`\n⚠️ Use "${best.name}" with validation`))
    console.log(`   ${best.average.toFixed(1)}% specificity, may need cleanup`)
    if (second.average >= 80) {
      console.log(`   Alternative: "${second.name}" at ${second.average.toFixed(1)}%`)
    }
  } else {
    console.log(chalk.red(`\n❌ No strategy achieves consistent 80%+`))
    console.log(`   Best: "${best.name}" at only ${best.average.toFixed(1)}%`)
    console.log(`   Consider Claude API or hybrid approach`)
  }
  
  // Consistency check
  const consistent = rankings.filter(r => Math.min(...r.scores) >= 60)
  if (consistent.length > 0) {
    console.log(chalk.gray(`\n📌 Most consistent: ${consistent.map(r => r.name).join(', ')}`))
  }
}

// Run the test
if (require.main === module) {
  runQuickTest().catch(console.error)
}