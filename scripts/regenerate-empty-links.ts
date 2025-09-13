#!/usr/bin/env node

/**
 * Regenerate Empty Links Script
 * 
 * Runs the AI solution generator on each of the 72 affected goals
 * to restore the 130 deleted relationships with proper goal-specific
 * field variations instead of cookie-cutter template data.
 * 
 * Uses the existing AI generator system to create natural, varied
 * solution data that matches each goal's specific context.
 */

import { createClient } from '@supabase/supabase-js'
import { generateSolutionsForGoal } from './ai-solution-generator/generators/solution-generator'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import chalk from 'chalk'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface GoalToRegenerate {
  goalId: string
  goalTitle: string
  goalDescription?: string
  goalArenaName?: string
  goalCategoryName?: string
  affectedSolutions: Array<{
    solutionTitle: string
    solutionCategory: string
    effectiveness: number
  }>
}

async function regenerateEmptyLinks() {
  console.log(chalk.cyan('🔄 WWFM Links Regeneration Script'))
  console.log(chalk.gray('=' .repeat(50)))
  
  // Load the goals that need regeneration
  const goalsFile = path.join(__dirname, 'goals-to-regenerate.json')
  
  if (!fs.existsSync(goalsFile)) {
    console.error(chalk.red('❌ Goals file not found. Run map-empty-links.ts first!'))
    process.exit(1)
  }
  
  const goalsToRegenerate: GoalToRegenerate[] = JSON.parse(fs.readFileSync(goalsFile, 'utf8'))
  
  console.log(chalk.yellow(`🎯 Loaded ${goalsToRegenerate.length} goals requiring regeneration`))
  
  // Calculate expected results
  const totalExpectedLinks = goalsToRegenerate.reduce((sum, goal) => sum + goal.affectedSolutions.length, 0)
  console.log(chalk.cyan(`📊 Expected to regenerate ~${totalExpectedLinks} solution links`))
  
  // Show top affected goals
  const topGoals = goalsToRegenerate
    .sort((a, b) => b.affectedSolutions.length - a.affectedSolutions.length)
    .slice(0, 5)
  
  console.log(chalk.cyan('\n🔝 Goals with most affected solutions:'))
  topGoals.forEach((goal, index) => {
    console.log(chalk.gray(`   ${index + 1}. "${goal.goalTitle}" - ${goal.affectedSolutions.length} solutions`))
  })
  
  // Track regeneration progress
  let processedGoals = 0
  let totalLinksGenerated = 0
  let errors = 0
  const startTime = Date.now()
  
  console.log(chalk.cyan('\n🤖 Starting AI regeneration process...'))
  console.log(chalk.gray(`   Using limit of 20 solutions per goal to ensure coverage`))
  
  // Process each goal
  for (const goalData of goalsToRegenerate) {
    try {
      processedGoals++
      const progress = Math.round((processedGoals / goalsToRegenerate.length) * 100)
      
      console.log(chalk.blue(`\n[${processedGoals}/${goalsToRegenerate.length}] (${progress}%) Processing: "${goalData.goalTitle}"`))
      console.log(chalk.gray(`   Expected solutions: ${goalData.affectedSolutions.map(s => s.solutionTitle).join(', ')}`))
      
      // Get full goal details for the generator
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .select(`
          id,
          title,
          description,
          arena_id,
          arenas(name),
          categories(name)
        `)
        .eq('id', goalData.goalId)
        .single()
      
      if (goalError || !goal) {
        console.error(chalk.red(`   ❌ Could not fetch goal details: ${goalError?.message}`))
        errors++
        continue
      }
      
      // Run the AI generator on this goal
      // Use limit of 20 to ensure we get the solutions we need
      const linksGenerated = await generateSolutionsForGoal(
        goal,
        supabase,
        { 
          dryRun: false,
          limit: 20  // Higher limit to ensure we catch the expected solutions
        }
      )
      
      totalLinksGenerated += linksGenerated
      
      console.log(chalk.green(`   ✅ Generated ${linksGenerated} solution links`))
      
      // Small delay to be respectful to API limits
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error: any) {
      console.error(chalk.red(`   ❌ Error processing goal "${goalData.goalTitle}": ${error.message}`))
      errors++
    }
  }
  
  const endTime = Date.now()
  const durationMinutes = Math.round((endTime - startTime) / 60000)
  
  // Verification phase - check how many of the original relationships were restored
  console.log(chalk.cyan('\n🔍 Verifying regeneration results...'))
  
  let restoredLinks = 0
  let missingLinks = 0
  const missingRelationships: string[] = []
  
  for (const goalData of goalsToRegenerate) {
    for (const expectedSolution of goalData.affectedSolutions) {
      // Check if this goal-solution relationship was restored
      const { data: existingLink } = await supabase
        .from('goal_implementation_links')
        .select(`
          id,
          solution_variants!inner(
            solutions!inner(title)
          )
        `)
        .eq('goal_id', goalData.goalId)
        .eq('solution_variants.solutions.title', expectedSolution.solutionTitle)
        .single()
      
      if (existingLink) {
        restoredLinks++
      } else {
        missingLinks++
        missingRelationships.push(`"${goalData.goalTitle}" → "${expectedSolution.solutionTitle}"`)
      }
    }
  }
  
  // Create regeneration log
  const regenerationLog = {
    regeneratedAt: new Date().toISOString(),
    durationMinutes,
    goalsProcessed: processedGoals,
    errors,
    totalLinksGenerated,
    originalLinksCount: totalExpectedLinks,
    restoredLinks,
    missingLinks,
    restorationRate: Math.round((restoredLinks / totalExpectedLinks) * 100),
    missingRelationships: missingRelationships.slice(0, 20), // First 20 for brevity
    purpose: 'Restore 130 deleted links with goal-specific variations'
  }
  
  const logFile = path.join(__dirname, 'regeneration-log.json')
  fs.writeFileSync(logFile, JSON.stringify(regenerationLog, null, 2))
  
  // Final summary
  console.log(chalk.green('\n📊 Regeneration Summary:'))
  console.log(chalk.green(`   🎯 Goals processed: ${processedGoals}/${goalsToRegenerate.length}`))
  console.log(chalk.green(`   🔗 Links generated: ${totalLinksGenerated}`))
  console.log(chalk.green(`   ✅ Links restored: ${restoredLinks}/${totalExpectedLinks} (${Math.round((restoredLinks / totalExpectedLinks) * 100)}%)`))
  
  if (missingLinks > 0) {
    console.log(chalk.yellow(`   ⚠️  Missing links: ${missingLinks}`))
    console.log(chalk.gray('   📋 Top missing relationships:'))
    missingRelationships.slice(0, 5).forEach(rel => {
      console.log(chalk.gray(`      - ${rel}`))
    })
  }
  
  if (errors > 0) {
    console.log(chalk.red(`   ❌ Errors: ${errors} goals failed`))
  }
  
  console.log(chalk.cyan(`   ⏱️  Duration: ${durationMinutes} minutes`))
  console.log(chalk.cyan(`\n📁 Regeneration log saved: ${logFile}`))
  
  if (restoredLinks >= totalExpectedLinks * 0.9) {
    console.log(chalk.green('\n🎉 Excellent regeneration! 90%+ of relationships restored'))
  } else if (restoredLinks >= totalExpectedLinks * 0.8) {
    console.log(chalk.yellow('\n✅ Good regeneration! 80%+ of relationships restored'))
  } else {
    console.log(chalk.red('\n⚠️  Lower restoration rate - may need targeted fixes'))
  }
  
  console.log(chalk.cyan('\n💡 Next steps:'))
  console.log(chalk.gray('   1. Review regeneration log for any missing relationships'))
  console.log(chalk.gray('   2. Check solution cards for proper goal-specific variations'))
  console.log(chalk.gray('   3. Run quality assurance verification'))
  
  return {
    success: errors === 0,
    restorationRate: (restoredLinks / totalExpectedLinks) * 100,
    totalGenerated: totalLinksGenerated
  }
}

regenerateEmptyLinks().catch(console.error)