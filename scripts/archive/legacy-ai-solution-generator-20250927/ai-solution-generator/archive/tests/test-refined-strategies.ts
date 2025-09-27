#!/usr/bin/env tsx

/**
 * Comprehensive Testing of 5 Refined Prompting Strategies
 * Goal: Find optimal strategy that maximizes specificity while maintaining diversity
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import path from 'path'
import chalk from 'chalk'
import { checkSpecificity } from './validate-specificity-standalone'

// Load environment variables from correct path
const envPath = path.resolve(__dirname, '../../.env.local')
dotenv.config({ path: envPath })

// Test Goals (2 from each arena = 10 total)
const TEST_GOALS = {
  mental_health: [
    { id: 'anxiety-1', title: 'Reduce anxiety', category: 'mental_health' },
    { id: 'stress-1', title: 'Manage stress better', category: 'mental_health' }
  ],
  
  physical_health: [
    { id: 'sleep-1', title: 'Sleep better', category: 'physical_health' },
    { id: 'fitness-1', title: 'Get stronger', category: 'physical_health' }
  ],
  
  relationships: [
    { id: 'social-1', title: 'Make new friends', category: 'relationships' },
    { id: 'communication-1', title: 'Communicate better', category: 'relationships' }
  ],
  
  productivity: [
    { id: 'procrastination-1', title: 'Stop procrastinating', category: 'productivity' },
    { id: 'focus-1', title: 'Improve focus', category: 'productivity' }
  ],
  
  career: [
    { id: 'skills-1', title: 'Learn new skills', category: 'career' },
    { id: 'networking-1', title: 'Build my network', category: 'career' }
  ]
}

// Metrics interface
interface TestMetrics {
  // Specificity Metrics
  specificityRate: number
  googleableRate: number
  hasProperNounRate: number
  
  // Diversity Metrics
  sourceDistribution: {
    commercial: number
    community: number
    traditional: number
    academic: number
    government: number
    diy: number
  }
  
  // Quality Metrics
  duplicateRate: number
  parenthesesIssueRate: number
  categoryWordRate: number
  
  // Consistency Metrics
  consistencyAcrossGoals: number
  consistencyAcrossArenas: number
  
  // Raw data for calculations
  totalSolutions: number
  specificCount: number
  googleableCount: number
  properNounCount: number
  parenthesesIssues: number
  categoryWords: number
  duplicates: Set<string>
  byArena: { [key: string]: boolean[] }
  byGoal: { [key: string]: boolean[] }
}

// Strategy definitions
const STRATEGIES = {
  'Named Method': (goal: any) => `
Generate 5 solutions for: ${goal.title}

CRITICAL RULE: Every solution must answer "What is it specifically named?"

Each solution must be a NAMED METHOD, TECHNIQUE, PRODUCT, or PROGRAM that someone can Google and find immediately.

GOOD (has a specific name):
✅ "Pomodoro Technique" - named method
✅ "Headspace" - named app
✅ "Alcoholics Anonymous" - named program
✅ "4-7-8 breathing" - named technique
✅ "Getting Things Done (GTD)" - named system
✅ "988 Lifeline" - named service

BAD (just categories):
❌ "meditation" - what KIND of meditation?
❌ "support groups" - WHICH support group?
❌ "breathing exercises" - WHAT technique specifically?

Include solutions from ALL sources:
- Commercial products (apps, books, courses)
- Free methods (Pomodoro, GTD, bullet journaling)
- Community programs (AA, SMART Recovery)
- Traditional practices (Tai Chi, Yoga Nidra)
- Government services (988, SAMHSA)
- Academic techniques (CBT, EMDR, PMR)

Return JSON array: [{"title": "Name", "category": "category", "effectiveness": 4.0}]`,

  'Googleable Entity': (goal: any) => `
Generate 5 solutions for: ${goal.title}

VALIDATION TEST: If someone Googles the exact solution name, they must find:
1. A specific website, app, or program
2. Clear instructions or signup within 2 clicks
3. NOT a list of search results about the category

Pass the Google test:
✅ Google "Headspace" → headspace.com
✅ Google "Pomodoro Technique" → specific instructions
✅ Google "AA meetings" → aa.org meeting finder
✅ Google "4-7-8 breathing" → Dr. Weil's exact technique

Fail the Google test:
❌ Google "meditation" → list of types
❌ Google "therapy" → list of options
❌ Google "exercise" → general information

Return JSON array: [{"title": "Googleable name", "category": "category", "effectiveness": 4.0}]`,

  'Attribution Required': (goal: any) => `
Generate 5 solutions for: ${goal.title}

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

Return JSON array: [{"title": "Source's Method", "category": "category", "effectiveness": 4.0}]`,

  'Instruction Findable': (goal: any) => `
Generate 5 solutions for: ${goal.title}

TEST: Can someone find step-by-step instructions for this solution?

Each solution must be something where a person can:
1. Search for the exact name
2. Find clear instructions, signup, or purchase within 1 minute
3. Start using it today

GOOD (instructions findable):
✅ "Couch to 5K" - has specific week-by-week program
✅ "YNAB budgeting" - has tutorials and signup
✅ "Wim Hof Method" - has exact breathing protocol
✅ "Bullet Journal" - has setup guide by Ryder Carroll

BAD (no clear instructions):
❌ "mindfulness" - too many different approaches
❌ "healthy eating" - no specific protocol
❌ "stress management" - category not method

Return JSON array: [{"title": "Method with instructions", "category": "category", "effectiveness": 4.0}]`,

  'No Categories': (goal: any) => `
Generate 5 solutions for: ${goal.title}

FORBIDDEN WORDS that indicate you're being too vague:
- practice, practices
- technique, techniques (unless part of proper name like "Alexander Technique")
- exercise, exercises (unless part of proper name like "Kegel Exercises")
- therapy (unless specific type like "CBT" or platform like "BetterHelp")
- meditation (unless specific app/program like "Headspace")
- management, training, program (unless part of proper name)
- support (unless specific group like "AA")

If your solution contains these words without being part of a proper name, replace it with something specific.

Wrong → Right:
"meditation practice" → "Headspace Focus mode"
"breathing technique" → "4-7-8 breathing method"
"time management" → "Pomodoro Technique"

Return JSON array: [{"title": "Specific solution", "category": "category", "effectiveness": 4.0}]`
}

// Utility functions
function cleanGeminiOutput(solution: string): string {
  return solution
    .replace(/\s*\(e\.g\.,.*?\)/g, '')
    .replace(/\s*\(such as.*?\)/g, '')
    .replace(/\s*\(using.*?\)/g, '')
    .replace(/\s*\(via.*?\)/g, '')
    .replace(/\s*\(including.*?\)/g, '')
    .replace(/\s*\(like.*?\)/g, '')
    .trim()
}

function hasProperNoun(text: string): boolean {
  // Check for capitalized words (excluding first word)
  const words = text.split(' ')
  return words.some((word, index) => 
    index > 0 && word.length > 0 && word[0] === word[0].toUpperCase()
  ) || text.includes("'s") || text.includes("'s")
}

function hasGenericWords(text: string): boolean {
  const genericWords = [
    'practice', 'practices', 'technique', 'techniques',
    'exercise', 'exercises', 'therapy', 'meditation',
    'management', 'training', 'program', 'support'
  ]
  
  const lowerText = text.toLowerCase()
  return genericWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`)
    return regex.test(lowerText)
  })
}

function categorizeSource(solution: any): string {
  const title = solution.title.toLowerCase()
  
  if (title.includes('app') || title.includes('headspace') || title.includes('calm') || 
      title.includes('betterhelp') || title.includes('coursera')) {
    return 'commercial'
  } else if (title.includes('aa') || title.includes('anonymous') || title.includes('smart recovery') ||
             title.includes('meetup') || title.includes('toastmasters')) {
    return 'community'
  } else if (title.includes('yoga') || title.includes('tai chi') || title.includes('meditation') ||
             title.includes('buddhist') || title.includes('stoic')) {
    return 'traditional'
  } else if (title.includes('cbt') || title.includes('emdr') || title.includes('harvard') ||
             title.includes('stanford') || title.includes('research')) {
    return 'academic'
  } else if (title.includes('988') || title.includes('samhsa') || title.includes('cdc') ||
             title.includes('nih') || title.includes('government')) {
    return 'government'
  } else if (title.includes('pomodoro') || title.includes('gtd') || title.includes('bullet journal') ||
             title.includes('diy') || title.includes('technique')) {
    return 'diy'
  }
  
  return 'diy' // default
}

function calculateStdDev(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length
  return Math.sqrt(variance)
}

function initializeMetrics(): TestMetrics {
  return {
    specificityRate: 0,
    googleableRate: 0,
    hasProperNounRate: 0,
    sourceDistribution: {
      commercial: 0,
      community: 0,
      traditional: 0,
      academic: 0,
      government: 0,
      diy: 0
    },
    duplicateRate: 0,
    parenthesesIssueRate: 0,
    categoryWordRate: 0,
    consistencyAcrossGoals: 0,
    consistencyAcrossArenas: 0,
    totalSolutions: 0,
    specificCount: 0,
    googleableCount: 0,
    properNounCount: 0,
    parenthesesIssues: 0,
    categoryWords: 0,
    duplicates: new Set(),
    byArena: {},
    byGoal: {}
  }
}

async function testStrategy(
  strategyName: string,
  strategyPrompt: Function,
  genAI: GoogleGenerativeAI
): Promise<TestMetrics> {
  console.log(chalk.cyan(`\n🧪 Testing Strategy: ${strategyName}`))
  console.log(chalk.gray('-'.repeat(60)))
  
  const metrics = initializeMetrics()
  
  // Initialize tracking arrays
  for (const arena of Object.keys(TEST_GOALS)) {
    metrics.byArena[arena] = []
  }
  
  let testCount = 0
  const totalTests = Object.values(TEST_GOALS).flat().length
  
  // Test across all goals
  for (const [arena, goals] of Object.entries(TEST_GOALS)) {
    for (const goal of goals) {
      testCount++
      process.stdout.write(chalk.gray(`   [${testCount}/${totalTests}] Testing ${goal.title}... `))
      
      metrics.byGoal[goal.id] = []
      
      try {
        // Generate solutions
        const prompt = strategyPrompt(goal)
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash-lite',  // Using the correct model from gemini-client.ts
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
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
          console.log(chalk.red('Parse error'))
          continue
        }
        
        // Analyze each solution
        for (const solution of solutions) {
          metrics.totalSolutions++
          
          const cleaned = cleanGeminiOutput(solution.title || '')
          const specificity = checkSpecificity(cleaned)
          
          // Track specificity
          if (specificity.isSpecific) {
            metrics.specificCount++
            metrics.byArena[arena].push(true)
            metrics.byGoal[goal.id].push(true)
          } else {
            metrics.byArena[arena].push(false)
            metrics.byGoal[goal.id].push(false)
          }
          
          if (specificity.isGoogleable) metrics.googleableCount++
          if (hasProperNoun(cleaned)) metrics.properNounCount++
          
          // Track quality issues
          if (solution.title && solution.title.includes('(e.g.,')) {
            metrics.parenthesesIssues++
          }
          if (hasGenericWords(cleaned)) {
            metrics.categoryWords++
          }
          
          // Track duplicates
          const normalizedTitle = cleaned.toLowerCase()
          if (metrics.duplicates.has(normalizedTitle)) {
            metrics.duplicateRate++
          }
          metrics.duplicates.add(normalizedTitle)
          
          // Categorize source
          const source = categorizeSource(solution)
          metrics.sourceDistribution[source]++
        }
        
        console.log(chalk.green(`✓ (${solutions.length} solutions)`))
        
      } catch (error: any) {
        if (error.message?.includes('429')) {
          console.log(chalk.yellow('Rate limited - waiting longer'))
          // Wait extra time if rate limited
          await new Promise(resolve => setTimeout(resolve, 10000))
        } else {
          console.log(chalk.red(`Error: ${error.message?.substring(0, 50)}`))
        }
      }
      
      // Rate limiting - ensure we don't exceed 15 requests per minute
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
  
  // Calculate final metrics
  if (metrics.totalSolutions > 0) {
    metrics.specificityRate = (metrics.specificCount / metrics.totalSolutions) * 100
    metrics.googleableRate = (metrics.googleableCount / metrics.totalSolutions) * 100
    metrics.hasProperNounRate = (metrics.properNounCount / metrics.totalSolutions) * 100
    metrics.parenthesesIssueRate = (metrics.parenthesesIssues / metrics.totalSolutions) * 100
    metrics.categoryWordRate = (metrics.categoryWords / metrics.totalSolutions) * 100
    metrics.duplicateRate = (metrics.duplicateRate / metrics.totalSolutions) * 100
    
    // Calculate consistency
    const arenaRates = Object.values(metrics.byArena).map(arena => {
      const bools = arena as boolean[]
      return bools.filter(b => b).length / bools.length * 100
    })
    metrics.consistencyAcrossArenas = calculateStdDev(arenaRates)
    
    const goalRates = Object.values(metrics.byGoal).map(goal => {
      const bools = goal as boolean[]
      return bools.filter(b => b).length / bools.length * 100
    })
    metrics.consistencyAcrossGoals = calculateStdDev(goalRates)
  }
  
  return metrics
}

async function runComprehensiveTest() {
  console.log(chalk.cyan('🔬 COMPREHENSIVE REFINED STRATEGY TESTING'))
  console.log('='.repeat(70))
  console.log(chalk.white('Testing 5 strategies across 10 goals (5 arenas × 2 goals)'))
  console.log(chalk.gray('This will take approximately 4-5 minutes...'))
  console.log('='.repeat(70))
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const results: { [key: string]: TestMetrics } = {}
  
  // Test each strategy
  for (const [strategyName, strategyPrompt] of Object.entries(STRATEGIES)) {
    results[strategyName] = await testStrategy(strategyName, strategyPrompt, genAI)
  }
  
  // Generate comprehensive report
  generateComparisonReport(results)
}

function generateComparisonReport(results: { [key: string]: TestMetrics }) {
  console.log('\n' + '='.repeat(70))
  console.log(chalk.cyan('📊 COMPREHENSIVE STRATEGY COMPARISON REPORT'))
  console.log('='.repeat(70))
  
  // 1. Specificity Rankings
  console.log(chalk.bold('\n🎯 SPECIFICITY RANKINGS'))
  const bySpecificity = Object.entries(results)
    .sort((a, b) => b[1].specificityRate - a[1].specificityRate)
  
  bySpecificity.forEach(([strategy, metrics], index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  '
    const color = metrics.specificityRate >= 85 ? chalk.green :
                  metrics.specificityRate >= 70 ? chalk.yellow : chalk.red
    console.log(`${medal} ${index + 1}. ${strategy.padEnd(25)} ${color(metrics.specificityRate.toFixed(1) + '%')}`)
  })
  
  // 2. Diversity Analysis
  console.log(chalk.bold('\n🌈 SOURCE DIVERSITY (std dev, lower = better)'))
  Object.entries(results).forEach(([strategy, metrics]) => {
    const sources = Object.values(metrics.sourceDistribution)
    const total = sources.reduce((a, b) => a + b, 0)
    if (total > 0) {
      const percentages = sources.map(s => (s / total) * 100)
      const stdDev = calculateStdDev(percentages)
      const color = stdDev < 20 ? chalk.green : stdDev < 30 ? chalk.yellow : chalk.red
      console.log(`   ${strategy.padEnd(25)} σ = ${color(stdDev.toFixed(1))}`)
    }
  })
  
  // 3. Quality Issues
  console.log(chalk.bold('\n⚠️  QUALITY ISSUES'))
  console.log(chalk.gray('   Strategy               Parentheses  Generic Words  Duplicates'))
  console.log(chalk.gray('   ' + '-'.repeat(60)))
  Object.entries(results).forEach(([strategy, metrics]) => {
    const pColor = metrics.parenthesesIssueRate < 10 ? chalk.green : 
                   metrics.parenthesesIssueRate < 20 ? chalk.yellow : chalk.red
    const gColor = metrics.categoryWordRate < 15 ? chalk.green :
                   metrics.categoryWordRate < 30 ? chalk.yellow : chalk.red
    const dColor = metrics.duplicateRate < 5 ? chalk.green :
                   metrics.duplicateRate < 10 ? chalk.yellow : chalk.red
    
    console.log(`   ${strategy.padEnd(25)} ${pColor(metrics.parenthesesIssueRate.toFixed(0) + '%').padEnd(12)} ` +
                `${gColor(metrics.categoryWordRate.toFixed(0) + '%').padEnd(14)} ` +
                `${dColor(metrics.duplicateRate.toFixed(0) + '%')}`)
  })
  
  // 4. Consistency Analysis
  console.log(chalk.bold('\n📈 CONSISTENCY (std dev, lower = better)'))
  console.log(chalk.gray('   Strategy               Across Goals   Across Arenas'))
  console.log(chalk.gray('   ' + '-'.repeat(60)))
  Object.entries(results).forEach(([strategy, metrics]) => {
    const gColor = metrics.consistencyAcrossGoals < 10 ? chalk.green :
                   metrics.consistencyAcrossGoals < 20 ? chalk.yellow : chalk.red
    const aColor = metrics.consistencyAcrossArenas < 10 ? chalk.green :
                   metrics.consistencyAcrossArenas < 20 ? chalk.yellow : chalk.red
    
    console.log(`   ${strategy.padEnd(25)} ${gColor('σ=' + metrics.consistencyAcrossGoals.toFixed(1)).padEnd(14)} ` +
                `${aColor('σ=' + metrics.consistencyAcrossArenas.toFixed(1))}`)
  })
  
  // 5. Overall Scoring
  console.log(chalk.bold('\n🏆 OVERALL SCORING'))
  const scores = Object.entries(results).map(([strategy, metrics]) => {
    // Weighted scoring
    const specificity = metrics.specificityRate * 0.4
    const diversity = Math.max(0, 100 - calculateStdDev(
      Object.values(metrics.sourceDistribution).map(v => 
        (v / Math.max(1, metrics.totalSolutions)) * 100
      )
    )) * 0.2
    const quality = Math.max(0, 100 - metrics.parenthesesIssueRate - metrics.categoryWordRate) * 0.2
    const consistency = Math.max(0, 100 - metrics.consistencyAcrossGoals - metrics.consistencyAcrossArenas) * 0.2
    
    const total = specificity + diversity + quality + consistency
    
    return {
      strategy,
      specificity: metrics.specificityRate,
      diversity,
      quality: 100 - metrics.parenthesesIssueRate - metrics.categoryWordRate,
      consistency: 100 - metrics.consistencyAcrossGoals - metrics.consistencyAcrossArenas,
      total,
      metrics
    }
  }).sort((a, b) => b.total - a.total)
  
  console.log(chalk.gray('   Strategy               Total  Spec   Div    Qual   Cons'))
  console.log(chalk.gray('   ' + '-'.repeat(60)))
  scores.forEach((score, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  '
    console.log(`${medal} ${score.strategy.padEnd(25)} ${chalk.bold(score.total.toFixed(0))}   ` +
                `${score.specificity.toFixed(0)}%   ${score.diversity.toFixed(0)}%   ` +
                `${score.quality.toFixed(0)}%   ${score.consistency.toFixed(0)}%`)
  })
  
  // 6. Winner & Recommendation
  console.log('\n' + '='.repeat(70))
  console.log(chalk.cyan('🎯 FINAL RECOMMENDATION'))
  console.log('='.repeat(70))
  
  const winner = scores[0]
  if (winner.specificity >= 85) {
    console.log(chalk.green(`\n✅ WINNER: ${winner.strategy}`))
    console.log(`   • Specificity: ${winner.specificity.toFixed(1)}% (exceeds 85% target)`)
    console.log(`   • Overall Score: ${winner.total.toFixed(1)}/100`)
    console.log(`\n   Reasoning: Best balance of specificity, diversity, quality, and consistency`)
  } else if (winner.specificity >= 70) {
    console.log(chalk.yellow(`\n⚠️  CONDITIONAL WINNER: ${winner.strategy}`))
    console.log(`   • Specificity: ${winner.specificity.toFixed(1)}% (below 85% target)`)
    console.log(`   • Recommend: Add post-processing for cleanup`)
  } else {
    console.log(chalk.red(`\n❌ NO CLEAR WINNER`))
    console.log(`   Best strategy only achieves ${winner.specificity.toFixed(1)}% specificity`)
    console.log(`   Consider: Hybrid approach or different AI model`)
  }
  
  // 7. Implementation Notes
  if (winner.specificity >= 70) {
    console.log(chalk.bold('\n📝 IMPLEMENTATION'))
    console.log('```typescript')
    console.log(`// Add to master-prompts.ts`)
    console.log(`export const MASTER_PROMPT = STRATEGIES['${winner.strategy}']`)
    console.log('```')
    
    if (winner.metrics.parenthesesIssueRate > 10) {
      console.log(chalk.yellow('\nNote: Add post-processing to clean "(e.g., ...)" patterns'))
    }
    if (winner.metrics.categoryWordRate > 20) {
      console.log(chalk.yellow('Note: Consider additional validation for generic terms'))
    }
  }
  
  // Save detailed results
  const reportPath = path.join(process.cwd(), 'REFINED_STRATEGY_RESULTS.json')
  require('fs').writeFileSync(reportPath, JSON.stringify(results, null, 2))
  console.log(chalk.gray(`\nDetailed results saved to: ${reportPath}`))
}

// Run the test
if (require.main === module) {
  runComprehensiveTest().catch(console.error)
}