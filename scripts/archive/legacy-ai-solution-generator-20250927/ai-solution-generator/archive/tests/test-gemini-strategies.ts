#!/usr/bin/env tsx

/**
 * Test 6 divergent prompting strategies with Gemini to improve solution specificity
 * Goal: Find which approach best overcomes AI's tendency toward generic advice
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import path from 'path'
import chalk from 'chalk'
import { checkSpecificity } from './validate-specificity-standalone'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Test goal that has been problematic
const TEST_GOAL = {
  title: 'Be more approachable',
  description: 'Develop a warm, welcoming presence that makes others feel comfortable approaching and talking to you',
  arena: 'Social & Relationships',
  category: 'Personal Growth'
}

interface StrategyResult {
  name: string
  prompt: string
  solutions: any[]
  specificCount: number
  vagueCount: number
  successRate: number
  specificExamples: string[]
  vagueExamples: string[]
  hasParenthesesIssue: boolean
  testTime: number
}

/**
 * Strategy 1: Product Reviewer Role-Play
 */
function getProductReviewerPrompt(): string {
  return `You are a product reviewer for Wirecutter/Consumer Reports. Your job is to recommend SPECIFIC products and services you've personally tested.

For the goal "${TEST_GOAL.title}", recommend 10 solutions you would feature in your "Best Of" guide.

CRITICAL: Only mention products/services that:
- Have a website you could link to
- You could purchase/sign up for today
- Have user reviews on Amazon/App Store/Google

Return as JSON array with exactly 10 solutions:
[
  {
    "title": "exact product/service name",
    "description": "brief description",
    "category": "from_list_below",
    "effectiveness": 3.0-5.0
  }
]

Categories: medications, supplements_vitamins, natural_remedies, beauty_skincare, therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources, meditation_mindfulness, exercise_movement, habits_routines, diet_nutrition, sleep, products_devices, books_courses, apps_software, groups_communities, support_groups, hobbies_activities, financial_products`
}

/**
 * Strategy 2: URL Test Constraint
 */
function getURLTestPrompt(): string {
  return `Generate 10 solutions for: ${TEST_GOAL.title}

VALIDATION RULE: Before adding any solution, imagine typing it into Google.
- Would the first result be a specific website/product page?
- Could you buy it or sign up within 2 clicks?

If you can't imagine the exact URL, don't include it.

Examples of good URLs:
- headspace.com (specific meditation app)
- stronglifts.com/5x5 (specific workout program)
- thefiveminutejournal.com (specific journal product)

DON'T generate categories that lead to search results pages.

Return JSON array:
[
  {
    "title": "product name that has its own website",
    "description": "brief description",
    "category": "from_list_below",
    "effectiveness": 3.0-5.0
  }
]

Categories: medications, supplements_vitamins, natural_remedies, beauty_skincare, therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources, meditation_mindfulness, exercise_movement, habits_routines, diet_nutrition, sleep, products_devices, books_courses, apps_software, groups_communities, support_groups, hobbies_activities, financial_products`
}

/**
 * Strategy 3: Anti-Pattern with Gamification
 */
function getAntiPatternPrompt(): string {
  return `I'm going to pay you $1 for each SPECIFIC solution, but you owe me $10 for each VAGUE solution.

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

Generate 10 solutions for: ${TEST_GOAL.title}

Return JSON array of exactly 10 solutions:
[
  {
    "title": "specific product/service name",
    "description": "brief description",
    "category": "from_list_below",
    "effectiveness": 3.0-5.0
  }
]

Categories: medications, supplements_vitamins, natural_remedies, beauty_skincare, therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources, meditation_mindfulness, exercise_movement, habits_routines, diet_nutrition, sleep, products_devices, books_courses, apps_software, groups_communities, support_groups, hobbies_activities, financial_products

Calculate your earnings at the end.`
}

/**
 * Strategy 4: Brand Name First Structure
 */
function getBrandFirstPrompt(): string {
  return `Generate solutions for: ${TEST_GOAL.title}

MANDATORY FORMAT:
[Brand/Author/Creator Name] + [Specific Product/Method]

Examples:
- "Nike Run Club app"
- "Tim Ferriss's Fear-Setting Exercise"
- "Beachbody's P90X"
- "Dr. Weil's 4-7-8 Breathing"

Start with the proper noun (brand/person), then the specific thing.
If you can't name a brand/author/creator, don't include it.

Return JSON array of exactly 10 solutions:
[
  {
    "title": "Brand/Creator + Product Name",
    "description": "brief description",
    "category": "from_list_below",
    "effectiveness": 3.0-5.0
  }
]

Categories: medications, supplements_vitamins, natural_remedies, beauty_skincare, therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources, meditation_mindfulness, exercise_movement, habits_routines, diet_nutrition, sleep, products_devices, books_courses, apps_software, groups_communities, support_groups, hobbies_activities, financial_products`
}

/**
 * Strategy 5: Shopping Cart Metaphor
 */
function getShoppingCartPrompt(): string {
  return `You're helping me fill my Amazon cart and bookmark specific websites.

For goal: ${TEST_GOAL.title}

List 10 items where you could:
1. Add to Amazon cart OR
2. Download from App Store OR  
3. Bookmark the signup page

Respond as if reading from your order history. Use exact product names.

Format as JSON array of exactly 10 solutions:
[
  {
    "title": "exact name from receipt/app store/billing",
    "description": "what it does",
    "category": "from_list_below",
    "effectiveness": 3.0-5.0
  }
]

Categories: medications, supplements_vitamins, natural_remedies, beauty_skincare, therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources, meditation_mindfulness, exercise_movement, habits_routines, diet_nutrition, sleep, products_devices, books_courses, apps_software, groups_communities, support_groups, hobbies_activities, financial_products`
}

/**
 * Strategy 6: Citation Required Approach
 */
function getCitationPrompt(): string {
  return `Generate solutions for: ${TEST_GOAL.title}

RULE: Every solution must be "citable" - meaning you could write:
"According to [Company/Author/Creator], their [Specific Product/Method] helps with ${TEST_GOAL.title}"

Template:
- "According to Headspace, their Anxiety Pack helps with..."
- "According to Tim Ferriss, his Fear-Setting Exercise helps with..."
- "According to Nike, their Run Club app helps with..."

List just the [Company/Author/Creator]'s [Specific Product/Method] part.

Return JSON array of exactly 10 solutions:
[
  {
    "title": "Creator's Specific Product",
    "description": "brief description",
    "category": "from_list_below",
    "effectiveness": 3.0-5.0
  }
]

Categories: medications, supplements_vitamins, natural_remedies, beauty_skincare, therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources, meditation_mindfulness, exercise_movement, habits_routines, diet_nutrition, sleep, products_devices, books_courses, apps_software, groups_communities, support_groups, hobbies_activities, financial_products`
}

/**
 * Test a single strategy with Gemini
 */
async function testStrategy(
  name: string, 
  prompt: string,
  genAI: GoogleGenerativeAI
): Promise<StrategyResult> {
  const startTime = Date.now()
  console.log(`\n${chalk.cyan('🧪')} Testing Strategy: ${chalk.bold(name)}`)
  console.log(chalk.gray('-'.repeat(50)))
  
  try {
    // Configure model for JSON response
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
    
    const geminiResult = await model.generateContent(prompt)
    const response = await geminiResult.response
    const content = response.text()
    
    if (!content) {
      throw new Error('No response from Gemini')
    }
    
    // Parse JSON response
    let solutions
    try {
      solutions = JSON.parse(content)
      // Ensure it's an array
      if (!Array.isArray(solutions)) {
        if (solutions.solutions && Array.isArray(solutions.solutions)) {
          solutions = solutions.solutions
        } else {
          throw new Error('Response is not an array')
        }
      }
    } catch (e) {
      console.error(chalk.red('Failed to parse JSON:'), e)
      console.log('Raw response:', content.substring(0, 500))
      return {
        name,
        prompt: prompt.substring(0, 200) + '...',
        solutions: [],
        specificCount: 0,
        vagueCount: 0,
        successRate: 0,
        specificExamples: [],
        vagueExamples: [],
        hasParenthesesIssue: false,
        testTime: Date.now() - startTime
      }
    }
    
    // Analyze results
    const result: StrategyResult = {
      name,
      prompt: prompt.substring(0, 200) + '...',
      solutions,
      specificCount: 0,
      vagueCount: 0,
      successRate: 0,
      specificExamples: [],
      vagueExamples: [],
      hasParenthesesIssue: false,
      testTime: Date.now() - startTime
    }
    
    for (const sol of solutions) {
      const check = checkSpecificity(sol.title)
      
      // Check for parentheses issue
      if (sol.title.includes('(e.g.,') || sol.title.includes('(such as')) {
        result.hasParenthesesIssue = true
      }
      
      if (check.isSpecific && check.isGoogleable) {
        result.specificCount++
        if (result.specificExamples.length < 3) {
          result.specificExamples.push(sol.title)
        }
      } else {
        result.vagueCount++
        if (result.vagueExamples.length < 3) {
          result.vagueExamples.push(sol.title)
        }
      }
    }
    
    result.successRate = solutions.length > 0 
      ? (result.specificCount / solutions.length) * 100 
      : 0
    
    // Quick results
    console.log(`${chalk.green('✅')} Specific: ${result.specificCount}/${solutions.length}`)
    console.log(`${chalk.red('❌')} Vague: ${result.vagueCount}/${solutions.length}`)
    console.log(`${chalk.blue('📊')} Success Rate: ${result.successRate.toFixed(1)}%`)
    if (result.hasParenthesesIssue) {
      console.log(chalk.yellow(`⚠️  Has "(e.g., ...)" issue`))
    }
    
    return result
    
  } catch (error) {
    console.error(chalk.red(`Error testing ${name}:`), error)
    return {
      name,
      prompt,
      solutions: [],
      specificCount: 0,
      vagueCount: 0,
      successRate: 0,
      specificExamples: [],
      vagueExamples: [],
      hasParenthesesIssue: false,
      testTime: Date.now() - startTime
    }
  }
}

/**
 * Run all strategy tests with Gemini
 */
async function runAllTests() {
  // Check for API key
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error(chalk.red('❌ No Gemini API key found in environment'))
    console.log(chalk.yellow('Add GOOGLE_GENERATIVE_AI_API_KEY to your .env.local file'))
    process.exit(1)
  }
  
  const genAI = new GoogleGenerativeAI(apiKey)
  
  console.log(chalk.bold.cyan('🚀 TESTING 6 DIVERGENT PROMPTING STRATEGIES WITH GEMINI'))
  console.log(chalk.gray('='.repeat(70)))
  console.log(`\n${chalk.blue('📋')} Test Goal: "${chalk.bold(TEST_GOAL.title)}"`)
  console.log(`${chalk.blue('📝')} Description: ${TEST_GOAL.description}`)
  console.log('\n' + chalk.gray('='.repeat(70)))
  
  const strategies = [
    { name: 'Product Reviewer', getPrompt: getProductReviewerPrompt },
    { name: 'URL Test', getPrompt: getURLTestPrompt },
    { name: 'Anti-Pattern Gamification', getPrompt: getAntiPatternPrompt },
    { name: 'Brand Name First', getPrompt: getBrandFirstPrompt },
    { name: 'Shopping Cart', getPrompt: getShoppingCartPrompt },
    { name: 'Citation Required', getPrompt: getCitationPrompt }
  ]
  
  const results: StrategyResult[] = []
  
  // Test each strategy
  for (const [index, strategy] of strategies.entries()) {
    console.log(chalk.gray(`\n[${index + 1}/${strategies.length}] Testing: ${strategy.name}`))
    const result = await testStrategy(strategy.name, strategy.getPrompt(), genAI)
    results.push(result)
    
    // Add delay to avoid rate limiting (4 seconds as per Gemini client)
    if (index < strategies.length - 1) {
      console.log(chalk.gray('   ⏱️  Rate limiting: waiting 4s...'))
      await new Promise(resolve => setTimeout(resolve, 4000))
    }
  }
  
  // Print comprehensive results
  console.log('\n' + chalk.gray('='.repeat(70)))
  console.log(chalk.bold.green('📊 COMPREHENSIVE RESULTS COMPARISON'))
  console.log(chalk.gray('='.repeat(70)))
  
  // Sort by success rate
  results.sort((a, b) => b.successRate - a.successRate)
  
  console.log(chalk.bold('\n🏆 RANKINGS BY SUCCESS RATE:\n'))
  results.forEach((result, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  '
    console.log(`${medal} ${index + 1}. ${chalk.bold(result.name)}: ${chalk.green(result.successRate.toFixed(1) + '%')} specific`)
    console.log(`     ✅ ${result.specificCount}/${result.solutions.length} specific`)
    console.log(`     ❌ ${result.vagueCount}/${result.solutions.length} vague`)
    if (result.hasParenthesesIssue) {
      console.log(chalk.yellow(`     ⚠️  Has "(e.g., ...)" pattern issue`))
    }
    console.log()
  })
  
  // Show examples from best performer
  const best = results[0]
  console.log(chalk.gray('='.repeat(70)))
  console.log(`\n${chalk.green.bold('🥇 BEST PERFORMER:')} ${chalk.bold(best.name)} (${chalk.green(best.successRate.toFixed(1) + '%')})\n`)
  
  if (best.specificExamples.length > 0) {
    console.log(chalk.green('Good specific examples generated:'))
    best.specificExamples.forEach(ex => console.log(`  ✅ ${ex}`))
  }
  
  if (best.vagueExamples.length > 0) {
    console.log(chalk.yellow('\nVague examples that slipped through:'))
    best.vagueExamples.forEach(ex => console.log(`  ❌ ${ex}`))
  }
  
  // Show examples from worst performer
  const worst = results[results.length - 1]
  console.log('\n' + chalk.gray('-'.repeat(70)))
  console.log(`\n${chalk.red.bold('🥉 WORST PERFORMER:')} ${chalk.bold(worst.name)} (${chalk.red(worst.successRate.toFixed(1) + '%')})\n`)
  
  if (worst.vagueExamples.length > 0) {
    console.log(chalk.red('Vague examples generated:'))
    worst.vagueExamples.forEach(ex => console.log(`  ❌ ${ex}`))
  }
  
  // Analysis summary
  console.log('\n' + chalk.gray('='.repeat(70)))
  console.log(chalk.bold.blue('📈 ANALYSIS SUMMARY\n'))
  
  const avgSuccessRate = results.reduce((sum, r) => sum + r.successRate, 0) / results.length
  console.log(`Average Success Rate: ${chalk.bold(avgSuccessRate.toFixed(1) + '%')}`)
  
  const withParentheses = results.filter(r => r.hasParenthesesIssue)
  console.log(`Strategies with "(e.g.)" issue: ${chalk.yellow(withParentheses.length + '/' + results.length)}`)
  if (withParentheses.length > 0) {
    console.log(chalk.yellow('  Affected strategies: ' + withParentheses.map(r => r.name).join(', ')))
  }
  
  const above80 = results.filter(r => r.successRate >= 80)
  const above60 = results.filter(r => r.successRate >= 60)
  
  console.log(`Strategies ≥80% specific: ${chalk.green(above80.length.toString())}`)
  console.log(`Strategies ≥60% specific: ${chalk.yellow(above60.length.toString())}`)
  
  // Gemini-specific insights
  console.log('\n' + chalk.gray('='.repeat(70)))
  console.log(chalk.bold.magenta('🤖 GEMINI-SPECIFIC INSIGHTS\n'))
  
  console.log('Known issues with Gemini:')
  console.log('• Tends to add "(e.g., ...)" patterns despite instructions')
  console.log('• Less responsive to role-play prompts than Claude')
  console.log('• May need post-processing to clean up patterns')
  
  // Recommendations
  console.log('\n' + chalk.gray('='.repeat(70)))
  console.log(chalk.bold.cyan('💡 RECOMMENDATIONS\n'))
  
  if (best.successRate >= 80) {
    console.log(chalk.green(`✅ USE "${best.name}" strategy - achieves ${best.successRate.toFixed(1)}% specificity`))
    
    if (best.successRate >= 90) {
      console.log(chalk.green('   Excellent performance! Ready for production use.'))
    } else {
      console.log(chalk.yellow('   Good performance. Consider combining with post-processing.'))
    }
  } else if (best.successRate >= 60) {
    console.log(chalk.yellow(`⚠️  Best strategy "${best.name}" only achieves ${best.successRate.toFixed(1)}%`))
    console.log(chalk.yellow('   Recommend combining multiple strategies or adding post-processing.'))
  } else {
    console.log(chalk.red(`❌ All strategies < 60% effective with Gemini`))
    console.log(chalk.red('   Consider switching to Claude API or aggressive post-processing.'))
  }
  
  // Strategy-specific insights
  console.log('\n' + chalk.bold('📝 STRATEGY-SPECIFIC INSIGHTS:\n'))
  
  for (const result of results) {
    if (result.successRate >= 70) {
      console.log(chalk.green(`✅ "${result.name}": Effective approach`))
    } else if (result.successRate >= 50) {
      console.log(chalk.yellow(`⚠️  "${result.name}": Partially effective`))
    } else {
      console.log(chalk.red(`❌ "${result.name}": Not effective with Gemini`))
    }
    
    if (result.hasParenthesesIssue) {
      console.log(chalk.yellow(`   Note: Still generates "(e.g., ...)" patterns`))
    }
  }
  
  // Final recommendation
  console.log('\n' + chalk.gray('='.repeat(70)))
  console.log(chalk.bold.green('🎯 FINAL RECOMMENDATION:\n'))
  
  if (best.successRate >= 80) {
    console.log(chalk.green(`Implement the "${best.name}" prompting strategy.`))
    console.log(chalk.green('\nNext steps:'))
    console.log('1. Update master-prompts.ts with this approach')
    console.log('2. Test with multiple goal categories')
    console.log('3. Run full generation if consistent >80% success')
  } else {
    console.log(chalk.yellow('Recommended hybrid approach for Gemini:'))
    console.log(`1. Start with "${best.name}" strategy (${best.successRate.toFixed(1)}%)`)
    console.log('2. Add post-processing to remove "(e.g., ...)" patterns')
    console.log('3. Validate and regenerate failures')
    console.log('4. Consider Claude API for critical goals (better instruction following)')
    
    console.log(chalk.cyan('\nPost-processing code suggestion:'))
    console.log(chalk.gray(`
    function cleanGeminiOutput(solution: string): string {
      // Remove parenthetical examples
      return solution.replace(/\\s*\\(e\\.g\\.,.*?\\)/g, '')
                    .replace(/\\s*\\(such as.*?\\)/g, '')
                    .replace(/\\s*\\(using.*?\\)/g, '')
                    .replace(/\\s*\\(via.*?\\)/g, '')
                    .trim()
    }
    `))
  }
  
  // Cost comparison
  console.log('\n' + chalk.gray('='.repeat(70)))
  console.log(chalk.bold.yellow('💰 COST COMPARISON:\n'))
  console.log(`Gemini (current): FREE up to 1,000 requests/day`)
  console.log(`Claude: ~$137 for full 2,000 solution generation`)
  console.log(`\nIf best strategy < 70% effective, Claude's cost may be justified`)
}

// Run the tests
if (require.main === module) {
  runAllTests().catch(console.error)
}