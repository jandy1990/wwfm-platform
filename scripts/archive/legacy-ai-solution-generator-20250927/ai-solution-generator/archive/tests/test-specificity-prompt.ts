#!/usr/bin/env tsx

/**
 * Test script to verify the specificity requirements in prompts are clear
 * This simulates what an AI would see and helps us verify the prompt is unambiguous
 */

import { getSolutionGenerationPrompt } from './prompts/master-prompts'

// Test with a sample goal
const testGoal = {
  title: 'Reduce anxiety',
  description: 'Find effective ways to manage and reduce daily anxiety',
  arena: 'Mental Health',
  category: 'Wellness'
}

// Generate the full prompt
const prompt = getSolutionGenerationPrompt(
  testGoal.title,
  testGoal.description,
  testGoal.arena,
  testGoal.category,
  5 // Generate 5 solutions
)

// Analyze the prompt for clarity
console.log('🔍 ANALYZING PROMPT FOR SPECIFICITY CLARITY\n')
console.log('=' .repeat(60))

// Count how many times we emphasize specificity
const specificityMentions = [
  /SPECIFIC/gi,
  /GOOGLE/gi,
  /BRAND/gi,
  /GENERIC/gi,
  /MUST BE/gi,
  /NOT just/gi,
  /exact name/gi,
  /real world/gi
]

console.log('\n📊 SPECIFICITY EMPHASIS METRICS:')
specificityMentions.forEach(pattern => {
  const matches = prompt.match(pattern) || []
  const term = pattern.source.replace(/\\/g, '')
  console.log(`  ${term}: ${matches.length} mentions`)
})

// Check for clear examples
const goodExamples = prompt.match(/✅.*$/gm) || []
const badExamples = prompt.match(/❌.*$/gm) || []

console.log('\n📚 EXAMPLES PROVIDED:')
console.log(`  Good examples (✅): ${goodExamples.length}`)
console.log(`  Bad examples (❌): ${badExamples.length}`)

// Extract key rules
console.log('\n📋 KEY RULES FOUND:')
const rules = prompt.match(/RULE:.*$/gm) || []
rules.forEach(rule => {
  console.log(`  • ${rule}`)
})

// Check for test criteria
console.log('\n✅ VALIDATION TESTS:')
const tests = prompt.match(/\d\.\s+.*test:/gi) || []
tests.forEach(test => {
  console.log(`  • ${test}`)
})

// Display the opening lines (most important part)
console.log('\n🎯 OPENING STATEMENT (First thing AI sees):')
console.log('=' .repeat(60))
const firstLines = prompt.split('\n').slice(0, 5).join('\n')
console.log(firstLines)

// Display the final reminder
console.log('\n🔚 FINAL REMINDER (Last thing AI sees):')
console.log('=' .repeat(60))
const finalSection = prompt.match(/FINAL REMINDER[\s\S]*?Return ONLY/)?.[0] || 'Not found'
console.log(finalSection)

// Summary
console.log('\n' + '=' .repeat(60))
console.log('📈 CLARITY ASSESSMENT:')

const clarityScore = {
  hasStrongOpening: prompt.startsWith('YOU MUST PROVIDE SPECIFIC'),
  repeatsRequirement: (prompt.match(/SPECIFIC/gi)?.length || 0) > 10,
  providesExamples: goodExamples.length > 5 && badExamples.length > 5,
  hasValidationTests: tests.length >= 3,
  hasFinalReminder: prompt.includes('FINAL REMINDER')
}

const score = Object.values(clarityScore).filter(Boolean).length
console.log(`\nClarity Score: ${score}/5`)

Object.entries(clarityScore).forEach(([key, value]) => {
  const status = value ? '✅' : '❌'
  console.log(`${status} ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
})

if (score === 5) {
  console.log('\n✅ PROMPT IS CRYSTAL CLEAR ABOUT SPECIFICITY!')
} else {
  console.log('\n⚠️  PROMPT COULD BE CLEARER')
}

// Show a sample of what solutions should look like
console.log('\n' + '=' .repeat(60))
console.log('📝 EXPECTED OUTPUT FORMAT:')
console.log(JSON.stringify([
  {
    title: "Headspace anxiety pack",
    description: "Guided meditation program specifically for anxiety by Headspace",
    category: "meditation_mindfulness",
    effectiveness: 4.3
  },
  {
    title: "BetterHelp online CBT therapy",
    description: "Online therapy platform specializing in cognitive behavioral therapy",
    category: "therapists_counselors",
    effectiveness: 4.5
  },
  {
    title: "Nature Made Vitamin D3 2000 IU",
    description: "Vitamin D supplement by Nature Made, 2000 IU softgels",
    category: "supplements_vitamins",
    effectiveness: 4.1
  }
], null, 2))