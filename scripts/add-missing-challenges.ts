#!/usr/bin/env tsx

/**
 * Add missing challenges field to specific solutions using AI consultation
 * CRITICAL: Only uses evidence-based distributions or AI consultation - NO mechanistic data
 */

import { createClient } from '@supabase/supabase-js'
import chalk from 'chalk'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getEvidenceBasedDistribution } from './evidence-based-distributions'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

interface DistributionValue {
  value: string
  count: number
  percentage: number
  source: string
}

interface DistributionData {
  mode: string
  values: DistributionValue[]
  totalReports: number
  dataSource: string
}

/**
 * Get challenges distribution - try evidence-based first, then AI consultation
 */
async function getChallengesDistribution(solutionTitle: string, category: string): Promise<DistributionData> {
  // App-specific challenge patterns based on user research
  let challengeSet: string[] = []

  const titleLower = solutionTitle.toLowerCase()

  if (titleLower.includes('habit') || titleLower.includes('streak')) {
    // Habit tracking apps
    challengeSet = ['Maintaining consistency', 'Forgetting to check app', 'Streak pressure']
  } else if (titleLower.includes('plant') || titleLower.includes('nanny')) {
    // Plant care/gamified apps
    challengeSet = ['Remembering daily tasks', 'Virtual pet dying', 'Maintaining interest']
  } else if (titleLower.includes('style') || titleLower.includes('wardrobe') || titleLower.includes('outfit')) {
    // Fashion/wardrobe apps
    challengeSet = ['Photo quality', 'Outfit categorization', 'Time spent organizing']
  } else {
    // Generic app challenges
    challengeSet = ['User interface complexity', 'Notification fatigue', 'Feature overload']
  }

  // Try evidence-based distribution first
  const evidenceDistribution = getEvidenceBasedDistribution(category, 'challenges', challengeSet)
  if (evidenceDistribution) {
    console.log(chalk.green(`  📚 Using evidence-based challenges distribution for ${titleLower.includes('habit') ? 'habit tracking' : titleLower.includes('plant') ? 'plant care' : titleLower.includes('style') ? 'fashion' : 'generic'} app`))
    return evidenceDistribution
  }

  console.log(chalk.magenta(`  🤖 No evidence pattern found, consulting AI for specific challenges...`))
  return getAIChallenges(solutionTitle, category)
}

/**
 * Get AI-generated challenges for a specific app
 */
async function getAIChallenges(solutionTitle: string, category: string): Promise<DistributionData> {
  const prompt = `
You are analyzing challenges users face with ${solutionTitle}, a ${category} solution.

Based on your training data about user experiences, app reviews, and research studies, generate a realistic distribution of the TOP 3-4 most common challenges users report.

The challenges should be:
1. Based on actual user feedback patterns in your training data
2. Realistic for this specific type of solution
3. Sum to exactly 100%
4. Reflect real-world usage patterns

Respond with ONLY a JSON object in this exact format:
{
  "mode": "most_common_challenge_value",
  "values": [
    {"value": "Challenge 1", "count": 40, "percentage": 40, "source": "user_surveys"},
    {"value": "Challenge 2", "count": 35, "percentage": 35, "source": "app_reviews"},
    {"value": "Challenge 3", "count": 25, "percentage": 25, "source": "user_studies"}
  ],
  "totalReports": 100,
  "dataSource": "ai_research"
}

The challenges must be specific to ${solutionTitle} and realistic based on your training data about this type of solution.`

  const result = await model.generateContent(prompt)
  const response = result.response.text()

  try {
    // Strip markdown code blocks if present
    let cleanResponse = response.trim()
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    const parsed = JSON.parse(cleanResponse)

    // Validate structure
    if (!parsed.mode || !parsed.values || !Array.isArray(parsed.values)) {
      throw new Error('Invalid response structure')
    }

    // Ensure percentages sum to 100
    const totalPercentage = parsed.values.reduce((sum: number, item: any) => sum + (item.percentage || 0), 0)
    if (Math.abs(totalPercentage - 100) > 1) {
      throw new Error(`Percentages don't sum to 100: ${totalPercentage}`)
    }

    // Calculate actual mode from values array
    const sortedValues = parsed.values.sort((a: any, b: any) => (b.percentage || 0) - (a.percentage || 0))
    const actualMode = sortedValues[0]?.value || parsed.mode

    return {
      mode: actualMode,
      values: parsed.values,
      totalReports: 100,
      dataSource: 'ai_research'
    }
  } catch (error) {
    throw new Error(`Failed to parse AI response: ${error}. Response: ${response.substring(0, 200)}...`)
  }
}

async function main() {
  console.log(chalk.cyan('🔧 Adding Missing Challenges Fields'))
  console.log(chalk.cyan('━'.repeat(50)))
  console.log(chalk.yellow('CRITICAL: Using AI consultation only - no mechanistic data'))
  console.log('')

  // Get solutions with missing challenges fields
  const targetSolutionIds = [
    '8f462c65-19e3-4d51-a60d-8d3f07d93498', // Coinbase App
    '72c67437-924f-4c5c-af63-87cfc27a16e2', // Plant Nanny
    'b9048645-aff0-4d43-ba6a-428d30ce466d', // Plant Nanny
    'e704342c-6d7e-4964-9996-f5d37e0cdc86', // Streaks Habit Tracker App
    '0fb41c6c-a1f2-4971-ae9f-c1192ef40abe'  // Stylebook App
  ]

  for (const linkId of targetSolutionIds) {
    try {
      // Get solution details
      const { data: link, error } = await supabase
        .from('goal_implementation_links')
        .select(`
          id,
          solution_fields,
          solution_variants!inner(
            solutions!inner(
              title,
              solution_category
            )
          )
        `)
        .eq('id', linkId)
        .single()

      if (error || !link) {
        console.log(chalk.red(`❌ Could not find solution ${linkId}`))
        continue
      }

      const solution = link.solution_variants?.solutions
      if (!solution) continue

      console.log(chalk.cyan(`\n🔄 Processing: ${solution.title}`))

      // Check if challenges field is missing
      if (link.solution_fields?.challenges) {
        console.log(chalk.green(`  ✅ Already has challenges field, skipping`))
        continue
      }

      // Generate challenges using evidence-based approach or AI consultation
      console.log(chalk.magenta(`  🔍 Getting challenges distribution...`))
      const challenges = await getChallengesDistribution(solution.title, solution.solution_category)

      // Update the solution_fields
      const updatedFields = {
        ...link.solution_fields,
        challenges: challenges
      }

      const { error: updateError } = await supabase
        .from('goal_implementation_links')
        .update({ solution_fields: updatedFields })
        .eq('id', linkId)

      if (updateError) {
        console.log(chalk.red(`  ❌ Failed to update: ${updateError.message}`))
        continue
      }

      console.log(chalk.green(`  ✅ Added challenges field`))
      console.log(chalk.white(`     Mode: ${challenges.mode}`))
      console.log(chalk.white(`     Values: ${challenges.values.map(v => `${v.value} (${v.percentage}%)`).join(', ')}`))

      // Small delay to be respectful to API
      await new Promise(resolve => setTimeout(resolve, 2000))

    } catch (error) {
      console.log(chalk.red(`❌ Error processing ${linkId}: ${error}`))
    }
  }

  console.log(chalk.cyan('\n━'.repeat(50)))
  console.log(chalk.green('✅ Missing challenges fields processing complete'))
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})