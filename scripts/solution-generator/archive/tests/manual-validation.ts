#!/usr/bin/env tsx

/**
 * Manual validation of top 2 strategies
 * Tests Attribution Required and Named Method with sample goals
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env.local')
dotenv.config({ path: envPath })

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Top 2 strategies to validate
const strategies = {
  'Attribution Required': `
Generate 5 solutions for: {{GOAL}}

Every solution must be attributed to its source:
[Creator/Organization/Tradition] + [Specific Method/Product]

Format: "Source's Method" or "Method by Source" or "Organization Program"

Examples:
✅ "Dr. Weil's 4-7-8 breathing"
✅ "Pomodoro Technique by Francesco Cirillo"
✅ "AA's 12-step program"
✅ "Navy SEAL box breathing"
✅ "Marie Kondo's KonMari Method"
✅ "Cornell Note-Taking System"

Sources can be:
- Individuals (Dr. Weil, Tim Ferriss)
- Companies (Nike, Headspace)
- Organizations (AA, Red Cross)
- Traditions (Zen Buddhism, Stoicism)
- Institutions (Harvard, Navy SEALs)

Return JSON array with 5 attributed solutions.`,

  'Named Method': `
Generate 5 solutions for: {{GOAL}}

Every solution must have a specific name:
- Brand names (Headspace, Calm, 7 Minute Workout)
- Method names (CBT, EMDR, Pomodoro Technique)
- Product names (Ambien, Melatonin, Weighted blanket)
- Program names (Couch to 5K, StrongLifts 5x5)

NOT acceptable:
❌ "meditation app" → ✅ "Headspace"
❌ "therapy" → ✅ "CBT therapy"
❌ "exercise program" → ✅ "Couch to 5K"

Return JSON array with 5 named solutions.`
}

// Sample goals for validation
const validationGoals = [
  { title: 'Reduce anxiety', arena: 'mental_health' },
  { title: 'Improve sleep quality', arena: 'physical_health' },
  { title: 'Build professional network', arena: 'career' }
]

async function testStrategy(strategyName: string, prompt: string, goal: any) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000,
      responseMimeType: 'application/json'
    }
  })

  const filledPrompt = prompt.replace('{{GOAL}}', goal.title)
  
  try {
    const result = await model.generateContent(filledPrompt)
    const response = await result.response
    const text = response.text()
    
    // Parse response
    let solutions = []
    try {
      solutions = JSON.parse(text)
    } catch (e) {
      console.log(`  ⚠️ JSON parse error for ${strategyName}`)
      return []
    }
    
    return solutions
  } catch (error: any) {
    console.log(`  ❌ API error for ${strategyName}: ${error.message}`)
    return []
  }
}

async function validateSpecificity(solution: any): Promise<boolean> {
  const title = solution.title || solution.name || ''
  
  // Check for proper nouns (capital letters)
  const hasProperNoun = /[A-Z]/.test(title) && title !== title.toUpperCase()
  
  // Check for numbers (often indicates specificity)
  const hasNumbers = /\d/.test(title)
  
  // Check for specific patterns
  const hasAttribution = title.includes("'s") || title.includes(" by ") || 
                        title.includes(" Method") || title.includes(" Technique")
  
  // Generic words that indicate non-specificity
  const genericWords = ['therapy', 'meditation', 'exercise', 'supplement', 'app', 'practice']
  const isGeneric = genericWords.some(word => 
    title.toLowerCase() === word || 
    title.toLowerCase() === word + 's'
  )
  
  return (hasProperNoun || hasNumbers || hasAttribution) && !isGeneric
}

async function runValidation() {
  console.log('🔍 MANUAL VALIDATION OF TOP 2 STRATEGIES')
  console.log('=' .repeat(60))
  
  const results: any = {
    'Attribution Required': { 
      total: 0, 
      specific: 0, 
      examples: [],
      nonSpecific: [] 
    },
    'Named Method': { 
      total: 0, 
      specific: 0, 
      examples: [],
      nonSpecific: []
    }
  }
  
  for (const goal of validationGoals) {
    console.log(`\n📍 Testing goal: "${goal.title}" (${goal.arena})`)
    console.log('-'.repeat(50))
    
    for (const [strategyName, prompt] of Object.entries(strategies)) {
      console.log(`\n  Strategy: ${strategyName}`)
      
      // Test the strategy
      const solutions = await testStrategy(strategyName, prompt, goal)
      
      // Validate each solution
      for (const solution of solutions) {
        const title = solution.title || solution.name || ''
        const isSpecific = await validateSpecificity(solution)
        
        results[strategyName].total++
        if (isSpecific) {
          results[strategyName].specific++
          console.log(`    ✅ ${title}`)
        } else {
          results[strategyName].nonSpecific.push(title)
          console.log(`    ❌ ${title}`)
        }
        
        // Store examples
        if (results[strategyName].examples.length < 10) {
          results[strategyName].examples.push({
            goal: goal.title,
            solution: title,
            specific: isSpecific
          })
        }
      }
      
      // Rate limit delay
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
  
  // Generate summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 VALIDATION SUMMARY')
  console.log('='.repeat(60))
  
  for (const [strategy, data] of Object.entries(results)) {
    const specificity = ((data.specific / data.total) * 100).toFixed(1)
    console.log(`\n${strategy}:`)
    console.log(`  Specificity: ${data.specific}/${data.total} (${specificity}%)`)
    
    if (data.nonSpecific.length > 0) {
      console.log(`  Non-specific examples:`)
      data.nonSpecific.slice(0, 3).forEach((ex: string) => {
        console.log(`    - "${ex}"`)
      })
    }
  }
  
  // Save detailed results
  const output = {
    timestamp: new Date().toISOString(),
    validationGoals,
    results,
    summary: {
      'Attribution Required': {
        specificityRate: ((results['Attribution Required'].specific / results['Attribution Required'].total) * 100).toFixed(1),
        totalSolutions: results['Attribution Required'].total,
        specificCount: results['Attribution Required'].specific
      },
      'Named Method': {
        specificityRate: ((results['Named Method'].specific / results['Named Method'].total) * 100).toFixed(1),
        totalSolutions: results['Named Method'].total,
        specificCount: results['Named Method'].specific
      }
    }
  }
  
  fs.writeFileSync(
    path.join(__dirname, 'manual-validation-results.json'),
    JSON.stringify(output, null, 2)
  )
  
  console.log('\n✅ Results saved to manual-validation-results.json')
}

// Run validation
runValidation().catch(console.error)