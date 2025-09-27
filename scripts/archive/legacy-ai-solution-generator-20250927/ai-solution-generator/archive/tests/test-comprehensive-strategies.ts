#!/usr/bin/env tsx

/**
 * Comprehensive test of all 6 prompting strategies across diverse goal types
 * Tests different categories to see if certain strategies work better for specific domains
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import path from 'path'
import chalk from 'chalk'
import { checkSpecificity } from './validate-specificity-standalone'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Test goals from different categories and complexity levels
const TEST_GOALS = [
  {
    id: 'social',
    title: 'Be more approachable',
    description: 'Develop a warm, welcoming presence that makes others feel comfortable',
    arena: 'Social & Relationships',
    expectedCategories: ['books_courses', 'groups_communities', 'apps_software']
  },
  {
    id: 'health',
    title: 'Reduce anxiety',
    description: 'Find effective ways to manage and reduce anxiety symptoms',
    arena: 'Health & Wellness',
    expectedCategories: ['medications', 'supplements_vitamins', 'meditation_mindfulness', 'therapists_counselors']
  },
  {
    id: 'productivity',
    title: 'Stop procrastinating',
    description: 'Break the procrastination habit and become more productive',
    arena: 'Productivity',
    expectedCategories: ['apps_software', 'books_courses', 'habits_routines']
  },
  {
    id: 'fitness',
    title: 'Get stronger',
    description: 'Build muscle strength and physical fitness',
    arena: 'Health & Fitness',
    expectedCategories: ['exercise_movement', 'supplements_vitamins', 'apps_software']
  },
  {
    id: 'sleep',
    title: 'Sleep better',
    description: 'Improve sleep quality and get more restful nights',
    arena: 'Health & Wellness',
    expectedCategories: ['sleep', 'supplements_vitamins', 'products_devices']
  }
]

interface StrategyResult {
  strategyName: string
  goalId: string
  specificCount: number
  vagueCount: number
  totalCount: number
  successRate: number
  specificExamples: string[]
  vagueExamples: string[]
  hasParenthesesIssue: boolean
  categoriesUsed: string[]
}

interface StrategyDefinition {
  name: string
  getPrompt: (goal: typeof TEST_GOALS[0]) => string
}

/**
 * Get all 6 strategy prompts
 */
function getStrategies(): StrategyDefinition[] {
  return [
    {
      name: 'Product Reviewer',
      getPrompt: (goal) => `You are a product reviewer for Wirecutter/Consumer Reports. Your job is to recommend SPECIFIC products and services you've personally tested.

For the goal "${goal.title}", recommend 10 solutions you would feature in your "Best Of" guide.

CRITICAL: Only mention products/services that:
- Have a website you could link to
- You could purchase/sign up for today
- Have user reviews on Amazon/App Store/Google

Return JSON array with format:
{
  "title": "exact product/service name",
  "description": "brief description",
  "category": "from_list_below",
  "effectiveness": 3.0-5.0
}

Categories: medications, supplements_vitamins, natural_remedies, beauty_skincare, therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources, meditation_mindfulness, exercise_movement, habits_routines, diet_nutrition, sleep, products_devices, books_courses, apps_software, groups_communities, support_groups, hobbies_activities, financial_products`
    },
    {
      name: 'URL Test',
      getPrompt: (goal) => `Generate 10 solutions for: ${goal.title}

VALIDATION RULE: Before adding any solution, imagine typing it into Google.
- Would the first result be a specific website/product page?
- Could you buy it or sign up within 2 clicks?

If you can't imagine the exact URL, don't include it.

Examples of good URLs:
- headspace.com (specific meditation app)
- stronglifts.com/5x5 (specific workout program)
- thefiveminutejournal.com (specific journal product)

Return JSON array.`
    },
    {
      name: 'Anti-Pattern Gamification',
      getPrompt: (goal) => `I'm going to pay you $1 for each SPECIFIC solution, but you owe me $10 for each VAGUE solution.

VAGUE (you owe $10):
- "meditation practice"
- "gratitude exercises"
- "breathing techniques"
- Anything with "practice", "techniques", "exercises", "training"
- Anything with "(e.g., ...)" or "(such as ...)"

SPECIFIC (you earn $1):
- "Headspace"
- "The Five Minute Journal"
- "4-7-8 Breathing by Dr. Andrew Weil"

Generate 10 solutions for: ${goal.title}

Return JSON array, then show your earnings calculation.`
    },
    {
      name: 'Brand Name First',
      getPrompt: (goal) => `Generate solutions for: ${goal.title}

MANDATORY FORMAT:
[Brand/Author/Creator Name] + [Specific Product/Method]

Examples:
- "Nike Run Club app"
- "Tim Ferriss's Fear-Setting Exercise"
- "Beachbody's P90X"
- "Dr. Weil's 4-7-8 Breathing"

Start with the proper noun (brand/person), then the specific thing.
If you can't name a brand/author/creator, don't include it.

Return JSON array of 10 solutions.`
    },
    {
      name: 'Shopping Cart',
      getPrompt: (goal) => `You're helping me fill my Amazon cart and bookmark specific websites.

For goal: ${goal.title}

List 10 items where you could:
1. Add to Amazon cart OR
2. Download from App Store OR  
3. Bookmark the signup page

Respond as if reading from your order history:
"Ordered: [exact product name as shown on receipt]"
"Downloaded: [exact app name as shown in App Store]"
"Subscribed to: [exact service name on billing statement]"

Return JSON array.`
    },
    {
      name: 'Citation Required',
      getPrompt: (goal) => `Generate solutions for: ${goal.title}

RULE: Every solution must be "citable" - meaning you could write:

"According to [Company/Author/Creator], their [Specific Product/Method] helps with ${goal.title}"

Template:
- "According to Headspace, their Anxiety Pack helps with..."
- "According to Tim Ferriss, his Fear-Setting Exercise helps with..."
- "According to Nike, their Run Club app helps with..."

List just the [Company/Author/Creator]'s [Specific Product/Method] part.

Return JSON array of 10 solutions.`
    }
  ]
}

/**
 * Test a single strategy on a single goal
 */
async function testStrategyOnGoal(
  strategy: StrategyDefinition,
  goal: typeof TEST_GOALS[0],
  genAI: GoogleGenerativeAI
): Promise<StrategyResult> {
  const prompt = strategy.getPrompt(goal) + `

Return JSON array with format:
{
  "title": "solution name",
  "description": "brief description",
  "category": "category_from_list",
  "effectiveness": 3.0-5.0
}

Categories: medications, supplements_vitamins, natural_remedies, beauty_skincare, therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources, meditation_mindfulness, exercise_movement, habits_routines, diet_nutrition, sleep, products_devices, books_courses, apps_software, groups_communities, support_groups, hobbies_activities, financial_products`

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
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
    
    let solutions = []
    try {
      solutions = JSON.parse(content)
      if (!Array.isArray(solutions)) {
        solutions = solutions.solutions || []
      }
    } catch (e) {
      console.error(chalk.red(`Parse error for ${strategy.name} on ${goal.id}`))
      return {
        strategyName: strategy.name,
        goalId: goal.id,
        specificCount: 0,
        vagueCount: 0,
        totalCount: 0,
        successRate: 0,
        specificExamples: [],
        vagueExamples: [],
        hasParenthesesIssue: false,
        categoriesUsed: []
      }
    }
    
    let specificCount = 0
    let vagueCount = 0
    const specificExamples: string[] = []
    const vagueExamples: string[] = []
    const categoriesUsed = new Set<string>()
    let hasParenthesesIssue = false
    
    for (const sol of solutions) {
      if (sol.category) {
        categoriesUsed.add(sol.category)
      }
      
      // Check for parentheses issue
      if (sol.title && (sol.title.includes('(e.g.,') || sol.title.includes('(such as'))) {
        hasParenthesesIssue = true
      }
      
      // Check specificity
      const check = checkSpecificity(sol.title || '')
      if (check.isSpecific && check.isGoogleable) {
        specificCount++
        if (specificExamples.length < 3) {
          specificExamples.push(sol.title)
        }
      } else {
        vagueCount++
        if (vagueExamples.length < 3) {
          vagueExamples.push(sol.title)
        }
      }
    }
    
    return {
      strategyName: strategy.name,
      goalId: goal.id,
      specificCount,
      vagueCount,
      totalCount: solutions.length,
      successRate: solutions.length > 0 ? (specificCount / solutions.length) * 100 : 0,
      specificExamples,
      vagueExamples,
      hasParenthesesIssue,
      categoriesUsed: Array.from(categoriesUsed)
    }
    
  } catch (error) {
    console.error(chalk.red(`Error testing ${strategy.name} on ${goal.id}:`, error))
    return {
      strategyName: strategy.name,
      goalId: goal.id,
      specificCount: 0,
      vagueCount: 0,
      totalCount: 0,
      successRate: 0,
      specificExamples: [],
      vagueExamples: [],
      hasParenthesesIssue: false,
      categoriesUsed: []
    }
  }
}

/**
 * Run comprehensive test
 */
async function runComprehensiveTest() {
  console.log(chalk.cyan('🔬 COMPREHENSIVE STRATEGY TESTING ACROSS GOAL TYPES'))
  console.log('='.repeat(70))
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const strategies = getStrategies()
  const results: StrategyResult[] = []
  
  // Test each strategy on each goal
  for (const goal of TEST_GOALS) {
    console.log(chalk.blue(`\n📋 Testing Goal: "${goal.title}" (${goal.arena})`))
    console.log(chalk.gray(`Expected categories: ${goal.expectedCategories.join(', ')}`))
    console.log('-'.repeat(70))
    
    for (const strategy of strategies) {
      process.stdout.write(chalk.gray(`   Testing ${strategy.name}... `))
      
      const result = await testStrategyOnGoal(strategy, goal, genAI)
      results.push(result)
      
      console.log(result.successRate >= 80 ? 
        chalk.green(`${result.successRate.toFixed(0)}% ✅`) : 
        result.successRate >= 60 ? 
        chalk.yellow(`${result.successRate.toFixed(0)}% ⚠️`) :
        chalk.red(`${result.successRate.toFixed(0)}% ❌`))
      
      // Rate limiting - respect Gemini's 15 requests per minute limit
      await new Promise(resolve => setTimeout(resolve, 4000))
    }
  }
  
  // Analyze results by strategy
  console.log('\n' + '='.repeat(70))
  console.log(chalk.cyan('📊 RESULTS BY STRATEGY'))
  console.log('='.repeat(70))
  
  for (const strategy of strategies) {
    const strategyResults = results.filter(r => r.strategyName === strategy.name)
    const avgSuccess = strategyResults.reduce((sum, r) => sum + r.successRate, 0) / strategyResults.length
    
    console.log(chalk.bold(`\n${strategy.name}: ${avgSuccess.toFixed(1)}% average`))
    
    // Show performance by goal type
    for (const result of strategyResults) {
      const goal = TEST_GOALS.find(g => g.id === result.goalId)!
      const indicator = result.successRate >= 80 ? '✅' : 
                       result.successRate >= 60 ? '⚠️' : '❌'
      console.log(`  ${goal.arena}: ${result.successRate.toFixed(0)}% ${indicator}`)
      
      if (result.hasParenthesesIssue) {
        console.log(chalk.red(`    ⚠️ Has "(e.g., ...)" pattern`))
      }
    }
  }
  
  // Analyze results by goal type
  console.log('\n' + '='.repeat(70))
  console.log(chalk.cyan('📊 RESULTS BY GOAL TYPE'))
  console.log('='.repeat(70))
  
  for (const goal of TEST_GOALS) {
    const goalResults = results.filter(r => r.goalId === goal.id)
    const avgSuccess = goalResults.reduce((sum, r) => sum + r.successRate, 0) / goalResults.length
    
    console.log(chalk.bold(`\n${goal.title} (${goal.arena}): ${avgSuccess.toFixed(1)}% average`))
    
    // Find best strategy for this goal
    const best = goalResults.sort((a, b) => b.successRate - a.successRate)[0]
    console.log(chalk.green(`  Best: ${best.strategyName} (${best.successRate.toFixed(0)}%)`))
    
    // Show category coverage
    const allCategories = new Set<string>()
    goalResults.forEach(r => r.categoriesUsed.forEach(c => allCategories.add(c)))
    const expectedMatch = goal.expectedCategories.filter(c => allCategories.has(c))
    console.log(`  Categories covered: ${expectedMatch.length}/${goal.expectedCategories.length} expected`)
  }
  
  // Overall rankings
  console.log('\n' + '='.repeat(70))
  console.log(chalk.cyan('🏆 OVERALL STRATEGY RANKINGS'))
  console.log('='.repeat(70))
  
  const strategyAverages = strategies.map(s => {
    const strategyResults = results.filter(r => r.strategyName === s.name)
    const avg = strategyResults.reduce((sum, r) => sum + r.successRate, 0) / strategyResults.length
    return { name: s.name, average: avg }
  }).sort((a, b) => b.average - a.average)
  
  strategyAverages.forEach((s, idx) => {
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  '
    console.log(`${medal} ${idx + 1}. ${s.name}: ${s.average.toFixed(1)}% average`)
  })
  
  // Recommendations
  console.log('\n' + '='.repeat(70))
  console.log(chalk.cyan('💡 RECOMMENDATIONS'))
  console.log('='.repeat(70))
  
  const bestOverall = strategyAverages[0]
  
  if (bestOverall.average >= 80) {
    console.log(chalk.green(`\n✅ RECOMMENDATION: Use "${bestOverall.name}" strategy`))
    console.log(`   Achieves ${bestOverall.average.toFixed(1)}% average specificity across all goal types`)
  } else if (bestOverall.average >= 60) {
    console.log(chalk.yellow(`\n⚠️ RECOMMENDATION: Use "${bestOverall.name}" with post-processing`))
    console.log(`   Achieves ${bestOverall.average.toFixed(1)}% specificity, needs cleanup for "(e.g., ...)" patterns`)
  } else {
    console.log(chalk.red(`\n❌ No single strategy achieves acceptable performance`))
    console.log(`   Consider hybrid approach or switching to Claude API`)
  }
  
  // Category-specific recommendations
  console.log(chalk.bold('\n📝 Category-Specific Insights:'))
  
  const categoryPatterns = new Map<string, string[]>()
  for (const goal of TEST_GOALS) {
    const goalResults = results.filter(r => r.goalId === goal.id)
    const best = goalResults.sort((a, b) => b.successRate - a.successRate)[0]
    if (best.successRate >= 70) {
      if (!categoryPatterns.has(best.strategyName)) {
        categoryPatterns.set(best.strategyName, [])
      }
      categoryPatterns.get(best.strategyName)!.push(goal.arena)
    }
  }
  
  for (const [strategy, arenas] of categoryPatterns) {
    console.log(`  ${strategy} works best for: ${arenas.join(', ')}`)
  }
  
  // Final summary
  console.log('\n' + '='.repeat(70))
  console.log(chalk.cyan('📋 FINAL SUMMARY'))
  console.log('='.repeat(70))
  
  const totalTests = results.length
  const above80 = results.filter(r => r.successRate >= 80).length
  const above60 = results.filter(r => r.successRate >= 60).length
  
  console.log(`\nTotal tests run: ${totalTests}`)
  console.log(`Results ≥80% specific: ${above80}/${totalTests} (${(above80/totalTests*100).toFixed(0)}%)`)
  console.log(`Results ≥60% specific: ${above60}/${totalTests} (${(above60/totalTests*100).toFixed(0)}%)`)
  
  const hasConsistent80 = strategyAverages.some(s => s.average >= 80)
  if (hasConsistent80) {
    console.log(chalk.green('\n✅ Ready for implementation with top strategy'))
  } else {
    console.log(chalk.yellow('\n⚠️ Additional optimization needed before implementation'))
  }
}

// Run the test
if (require.main === module) {
  runComprehensiveTest().catch(console.error)
}