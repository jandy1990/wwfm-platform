#!/usr/bin/env tsx

/**
 * Comprehensive test of prompting strategies with full solution output
 * Tests 4 strategies including Conversational Completeness
 * Outputs all solution data (title + all required fields)
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env.local')
dotenv.config({ path: envPath })

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Follow-up questions by category for validation
const FOLLOW_UP_QUESTIONS: Record<string, string[]> = {
  default: [
    "What exactly is it?",
    "How do I get started?",
    "What does it cost?",
    "How much time does it take?"
  ],
  apps_software: [
    "What's it called exactly?",
    "iPhone or Android?", 
    "Is it free or paid?",
    "How much time per day?"
  ],
  meditation_mindfulness: [
    "What specific technique?",
    "How do I learn it?",
    "How long do I do it for?",
    "Do I need an app or can I do it alone?"
  ],
  therapists_counselors: [
    "How do I find one?",
    "What type of therapy?",
    "How much does it cost?",
    "Is it covered by insurance?",
    "In-person or online?"
  ],
  supplements_vitamins: [
    "What brand?",
    "What dosage?",
    "Where do I buy it?",
    "Any side effects?",
    "How much does it cost?"
  ]
}

// 4 Strategies to test
const strategies = {
  'Attribution Required': {
    prompt: `Generate 5 solutions for: {{GOAL}}

Every solution must be attributed to its source:
[Creator/Organization/Tradition] + [Specific Method/Product]

Format: "Source's Method" or "Method by Source" or "Organization Program"

Examples:
✅ "Dr. Weil's 4-7-8 breathing"
✅ "Pomodoro Technique by Francesco Cirillo"
✅ "AA's 12-step program"
✅ "Navy SEAL box breathing"

Sources can be:
- Individuals (Dr. Weil, Tim Ferriss)
- Companies (Nike, Headspace)
- Organizations (AA, Red Cross)
- Traditions (Zen Buddhism, Stoicism)
- Institutions (Harvard, Navy SEALs)

Return JSON with this exact structure:
[{
  "title": "Source's Specific Method",
  "description": "Brief explanation of what it is and how it works",
  "cost": "free|$X|$X/month",
  "time_commitment": "X minutes daily|X hours weekly",
  "how_to_start": "Specific first step or where to find it",
  "category": "meditation|therapy|supplement|app|book|support_group|other"
}]`,
    color: '🥇'
  },

  'Named Method': {
    prompt: `Generate 5 solutions for: {{GOAL}}

Every solution must have a specific name:
- Brand names (Headspace, Calm, 7 Minute Workout)
- Method names (CBT, EMDR, Pomodoro Technique)
- Product names (Ambien, Melatonin, Weighted blanket)
- Program names (Couch to 5K, StrongLifts 5x5)

NOT acceptable:
❌ "meditation app" → ✅ "Headspace"
❌ "therapy" → ✅ "CBT therapy"

Return JSON with this exact structure:
[{
  "title": "Specific Named Method/Product",
  "description": "What it is and how it helps",
  "cost": "free|$X|$X/month",
  "time_commitment": "X minutes daily|X hours weekly",
  "how_to_start": "Where to get it or how to begin",
  "category": "meditation|therapy|supplement|app|book|support_group|other"
}]`,
    color: '🥈'
  },

  'Instruction Findable': {
    prompt: `Generate 5 solutions for: {{GOAL}}

Each solution must be findable with clear instructions:
- Searchable by exact name
- Has tutorials/guides available
- Clear implementation steps

Examples:
✅ "Wim Hof Breathing Method" (has YouTube tutorials)
✅ "Getting Things Done (GTD)" (has books and courses)
✅ "Couch to 5K" (has apps and programs)

Return JSON with this exact structure:
[{
  "title": "Findable Method Name",
  "description": "What it is and where to find instructions",
  "cost": "free|$X|$X/month",
  "time_commitment": "X minutes daily|X hours weekly",
  "how_to_start": "Specific resource or tutorial to begin with",
  "category": "meditation|therapy|supplement|app|book|support_group|other"
}]`,
    color: '🥉'
  },

  'Conversational Completeness': {
    prompt: `Generate 5 solutions for: {{GOAL}}

Simulate this conversation:

Friend: "I'm struggling with {{GOAL}}"
You: "I had the same problem! [YOUR SOLUTION] really helped me."
Friend: "Oh really? Tell me more - how do I try it?"
You: "[YOUR ANSWER - must give them everything they need to start today]"

Your solution must answer these natural follow-up questions:
- What exactly is it? (specific name/method)
- How do I get started? (app/website/book/location)
- What does it cost? (free/paid/subscription)
- How much time does it take? (daily commitment)

GOOD (friend can act on it):
✅ "I use Headspace's anxiety pack - it's a meditation app, $13/month, just 10 minutes daily, download from App Store"
✅ "I do the Pomodoro Technique - free timer method, 25 min work/5 min break cycles, use pomofocus.io"

BAD (friend needs more info):
❌ "I meditate" → Friend asks: "How? What app?"
❌ "I take supplements" → Friend asks: "Which ones? What brand?"

Return JSON with this exact structure:
[{
  "title": "What you'd naturally tell your friend worked",
  "description": "Complete answer to 'Tell me more - how do I try it?'",
  "cost": "free|$X|$X/month",
  "time_commitment": "X minutes daily|X hours weekly",
  "how_to_start": "Exact first step they should take today",
  "category": "meditation|therapy|supplement|app|book|support_group|other"
}]`,
    color: '💬'
  }
}

// Test goals - starting with just 3 for initial test
const testGoals = [
  { id: 'anxiety-1', title: 'Reduce anxiety', arena: 'mental_health' },
  { id: 'sleep-1', title: 'Improve sleep quality', arena: 'physical_health' },
  { id: 'procrastination-1', title: 'Stop procrastinating', arena: 'productivity' }
]

// Full set for later:
// const testGoals = [
//   { id: 'anxiety-1', title: 'Reduce anxiety', arena: 'mental_health' },
//   { id: 'stress-1', title: 'Manage daily stress', arena: 'mental_health' },
//   { id: 'sleep-1', title: 'Improve sleep quality', arena: 'physical_health' },
//   { id: 'fitness-1', title: 'Get in shape', arena: 'physical_health' },
//   { id: 'social-1', title: 'Make new friends', arena: 'relationships' },
//   { id: 'communication-1', title: 'Improve communication skills', arena: 'relationships' },
//   { id: 'procrastination-1', title: 'Stop procrastinating', arena: 'productivity' },
//   { id: 'focus-1', title: 'Improve focus and concentration', arena: 'productivity' },
//   { id: 'skills-1', title: 'Learn new professional skills', arena: 'career' },
//   { id: 'networking-1', title: 'Build professional network', arena: 'career' }
// ]

// Check if solution answers follow-up questions
function checkConversationalCompleteness(solution: any): {
  score: number,
  answeredQuestions: string[],
  missingInfo: string[]
} {
  const content = JSON.stringify(solution).toLowerCase()
  const category = solution.category || 'default'
  const questions = FOLLOW_UP_QUESTIONS[category] || FOLLOW_UP_QUESTIONS.default
  
  const answeredQuestions: string[] = []
  const missingInfo: string[] = []
  
  // Check each question
  questions.forEach(question => {
    let answered = false
    
    if (question.includes('What exactly') || question.includes('What\'s it called')) {
      // Check for specific name (has capital letters, not generic)
      answered = /[A-Z][a-z]+/.test(solution.title) && 
                 !['Meditation', 'Therapy', 'Exercise', 'Supplement'].includes(solution.title)
    }
    else if (question.includes('cost') || question.includes('free or paid')) {
      answered = /free|\$|cost|price|month|year/.test(content)
    }
    else if (question.includes('time')) {
      answered = /\d+\s*(minute|hour|min|hr)|daily|weekly/.test(content)
    }
    else if (question.includes('How do I') || question.includes('Where')) {
      answered = solution.how_to_start && solution.how_to_start.length > 10
    }
    else if (question.includes('iPhone or Android')) {
      answered = /ios|android|iphone|app store|google play|both/.test(content)
    }
    else if (question.includes('dosage')) {
      answered = /\d+\s*(mg|iu|mcg|ml)/.test(content)
    }
    else if (question.includes('brand')) {
      answered = /[A-Z][a-z]+\s*(brand|labs|naturals|pharmaceuticals)/i.test(content)
    }
    
    if (answered) {
      answeredQuestions.push(question)
    } else {
      missingInfo.push(question)
    }
  })
  
  const score = (answeredQuestions.length / questions.length) * 100
  
  return {
    score,
    answeredQuestions,
    missingInfo
  }
}

// Test a single strategy for a single goal
async function testStrategy(strategyName: string, strategy: any, goal: any): Promise<any> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2000,
      responseMimeType: 'application/json'
    }
  })

  const prompt = strategy.prompt.replace(/{{GOAL}}/g, goal.title)
  
  try {
    console.log(`    Testing ${strategyName}...`)
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse solutions
    let solutions = []
    try {
      solutions = JSON.parse(text)
      if (!Array.isArray(solutions)) {
        solutions = [solutions]
      }
    } catch (e) {
      console.log(`      ⚠️ JSON parse error`)
      return { error: 'JSON parse error', raw: text }
    }
    
    // Validate each solution
    const validatedSolutions = solutions.map(sol => {
      const completeness = checkConversationalCompleteness(sol)
      return {
        ...sol,
        validation: {
          hasSpecificName: /[A-Z]/.test(sol.title) && sol.title.length > 3,
          hasCost: !!sol.cost && sol.cost.length > 2,
          hasTimeCommitment: !!sol.time_commitment && sol.time_commitment.length > 3,
          hasHowToStart: !!sol.how_to_start && sol.how_to_start.length > 10,
          conversationalCompleteness: completeness,
          passes: completeness.score >= 75
        }
      }
    })
    
    return {
      success: true,
      solutions: validatedSolutions,
      summary: {
        totalSolutions: validatedSolutions.length,
        passingCount: validatedSolutions.filter(s => s.validation.passes).length,
        averageCompleteness: validatedSolutions.reduce((acc, s) => 
          acc + s.validation.conversationalCompleteness.score, 0) / validatedSolutions.length
      }
    }
    
  } catch (error: any) {
    console.log(`      ❌ Error: ${error.message}`)
    if (error.message?.includes('429')) {
      console.log('      ⏳ Rate limit hit, waiting 10 seconds...')
      await new Promise(resolve => setTimeout(resolve, 10000))
    }
    return { error: error.message }
  }
}

// Main test runner
async function runComprehensiveTest() {
  console.log('🧪 COMPREHENSIVE SOLUTION GENERATION TEST')
  console.log('=' .repeat(60))
  console.log(`Testing ${Object.keys(strategies).length} strategies × ${testGoals.length} goals`)
  console.log(`Total solutions to generate: ${Object.keys(strategies).length * testGoals.length * 5}`)
  console.log()

  const allResults: any = {
    metadata: {
      timestamp: new Date().toISOString(),
      strategies: Object.keys(strategies),
      goals: testGoals.map(g => g.title),
      totalTests: Object.keys(strategies).length * testGoals.length
    },
    results: {},
    summary: {}
  }

  // Test each strategy
  for (const [strategyName, strategy] of Object.entries(strategies)) {
    console.log(`\n${strategy.color} Testing Strategy: ${strategyName}`)
    console.log('-'.repeat(50))
    
    allResults.results[strategyName] = {}
    let strategyStats = {
      totalSolutions: 0,
      passingCount: 0,
      totalCompleteness: 0,
      errors: 0
    }
    
    // Test each goal
    for (const goal of testGoals) {
      console.log(`\n  📍 Goal: "${goal.title}" (${goal.arena})`)
      
      const result = await testStrategy(strategyName, strategy, goal)
      allResults.results[strategyName][goal.id] = result
      
      if (result.success) {
        strategyStats.totalSolutions += result.summary.totalSolutions
        strategyStats.passingCount += result.summary.passingCount
        strategyStats.totalCompleteness += result.summary.averageCompleteness
        
        console.log(`      ✅ Generated ${result.summary.totalSolutions} solutions`)
        console.log(`      📊 Passing: ${result.summary.passingCount}/${result.summary.totalSolutions}`)
        console.log(`      💬 Avg completeness: ${result.summary.averageCompleteness.toFixed(1)}%`)
      } else {
        strategyStats.errors++
        console.log(`      ❌ Failed: ${result.error}`)
      }
      
      // Rate limit delay
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
    
    // Calculate strategy summary
    allResults.summary[strategyName] = {
      totalSolutions: strategyStats.totalSolutions,
      passingCount: strategyStats.passingCount,
      passingRate: ((strategyStats.passingCount / strategyStats.totalSolutions) * 100).toFixed(1),
      averageCompleteness: (strategyStats.totalCompleteness / (testGoals.length - strategyStats.errors)).toFixed(1),
      errors: strategyStats.errors
    }
  }

  // Generate final summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 FINAL SUMMARY')
  console.log('='.repeat(60))
  
  for (const [strategy, stats] of Object.entries(allResults.summary)) {
    console.log(`\n${strategy}:`)
    console.log(`  Solutions: ${stats.totalSolutions}`)
    console.log(`  Passing: ${stats.passingCount} (${stats.passingRate}%)`)
    console.log(`  Avg Completeness: ${stats.averageCompleteness}%`)
    if (stats.errors > 0) {
      console.log(`  Errors: ${stats.errors}`)
    }
  }
  
  // Save comprehensive results
  const outputPath = path.join(__dirname, 'comprehensive-test-output.json')
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2))
  console.log(`\n✅ Full results saved to: comprehensive-test-output.json`)
  
  // Generate human-readable report
  generateReadableReport(allResults)
}

// Generate human-readable markdown report
function generateReadableReport(results: any) {
  let report = `# Comprehensive Solution Generation Test Results

**Date**: ${new Date().toISOString()}  
**Strategies Tested**: ${results.metadata.strategies.join(', ')}  
**Goals Tested**: ${results.metadata.goals.length}  
**Total Solutions Generated**: ${Object.values(results.summary).reduce((acc: number, s: any) => acc + s.totalSolutions, 0)}

## Summary by Strategy

| Strategy | Solutions | Passing | Pass Rate | Avg Completeness |
|----------|-----------|---------|-----------|------------------|
`

  for (const [strategy, stats] of Object.entries(results.summary)) {
    report += `| ${strategy} | ${stats.totalSolutions} | ${stats.passingCount} | ${stats.passingRate}% | ${stats.averageCompleteness}% |\n`
  }

  report += `\n## Detailed Solutions by Strategy and Goal\n\n`

  // Add detailed solutions
  for (const [strategyName, goals] of Object.entries(results.results)) {
    report += `### ${strategyName}\n\n`
    
    for (const [goalId, result] of Object.entries(goals as any)) {
      const goal = testGoals.find(g => g.id === goalId)
      report += `#### Goal: ${goal?.title} (${goal?.arena})\n\n`
      
      if (result.success && result.solutions) {
        result.solutions.forEach((sol: any, idx: number) => {
          const pass = sol.validation.passes ? '✅' : '❌'
          report += `**Solution ${idx + 1}**: ${pass} ${sol.title}\n`
          report += `- **Description**: ${sol.description}\n`
          report += `- **Cost**: ${sol.cost || 'Not specified'}\n`
          report += `- **Time**: ${sol.time_commitment || 'Not specified'}\n`
          report += `- **How to Start**: ${sol.how_to_start || 'Not specified'}\n`
          report += `- **Category**: ${sol.category || 'Not specified'}\n`
          report += `- **Completeness Score**: ${sol.validation.conversationalCompleteness.score.toFixed(0)}%\n`
          
          if (sol.validation.conversationalCompleteness.missingInfo.length > 0) {
            report += `- **Missing Info**: ${sol.validation.conversationalCompleteness.missingInfo.join(', ')}\n`
          }
          report += `\n`
        })
      } else {
        report += `Error: ${result.error}\n\n`
      }
    }
  }

  // Save readable report
  const reportPath = path.join(__dirname, 'COMPREHENSIVE_TEST_REPORT.md')
  fs.writeFileSync(reportPath, report)
  console.log(`📄 Human-readable report saved to: COMPREHENSIVE_TEST_REPORT.md`)
}

// Run the test
runComprehensiveTest().catch(console.error)