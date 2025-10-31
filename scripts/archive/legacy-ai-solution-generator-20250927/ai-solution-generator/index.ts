#!/usr/bin/env node

// Load environment variables FIRST, before any other imports
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

/**
 * AI-Powered Solution Generator for WWFM
 * 
 * This script automatically generates evidence-based solutions for all goals
 * by consulting Claude AI for real effectiveness ratings based on training data.
 * 
 * Usage:
 *   npm run generate:ai-solutions              # Generate for all goals
 *   npm run generate:ai-solutions -- --dry-run # Preview without inserting
 *   npm run generate:ai-solutions -- --goal-id=<uuid> # Single goal
 *   npm run generate:ai-solutions -- --limit=5 # Limit solutions per goal
 */

import { createClient } from '@supabase/supabase-js'
import { Command } from 'commander'
import { generateSolutionsForGoal } from './generators/solution-generator'
import { CATEGORY_FIELDS } from './config/category-fields'
import chalk from 'chalk'
import fs from 'fs'

// Initialize command line parser
const program = new Command()
  .name('ai-solution-generator')
  .description('Generate evidence-based solutions using AI training data')
  .option('--dry-run', 'Preview without inserting to database')
  .option('--goal-id <id>', 'Generate for specific goal')
  .option('--limit <number>', 'Limit solutions per goal', '20')
  .option('--batch-size <number>', 'Goals per batch', '10')
  .option('--start-from <number>', 'Start from goal index', '0')
  .option('--reset-usage', 'Reset daily usage tracking')
  .option('--smart-select', 'Use intelligent goal selection based on coverage')
  .option('--strategy <strategy>', 'Selection strategy: breadth_first, depth_first, arena_based, priority_based', 'breadth_first')
  .option('--force-write', 'Force updates even when normalized data matches existing records')
  .option('--dirty-only', 'Only update existing links flagged as needing aggregation')
  .parse()

const options = program.opts()

// Initialize Supabase client with service key (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Check for Gemini API key (migrated from Anthropic for cost savings)
if (!process.env.GEMINI_API_KEY) {
  console.error(chalk.red('❌ Error: GEMINI_API_KEY not found in environment variables'))
  console.log(chalk.yellow('Please add GEMINI_API_KEY to your .env.local file'))
  console.log(chalk.gray('Example: GEMINI_API_KEY=<your_gemini_api_key>'))
  process.exit(1)
}

// Optional: Check if old Anthropic key exists and warn about migration
if (process.env.ANTHROPIC_API_KEY && !process.env.GEMINI_API_KEY) {
  console.log(chalk.yellow('⚠️  Found ANTHROPIC_API_KEY but missing GEMINI_API_KEY'))
  console.log(chalk.yellow('The generator has been migrated to use Gemini (free) instead of Claude ($137/run)'))
  console.log(chalk.yellow('Add this to your .env.local: GEMINI_API_KEY=<your_gemini_api_key>'))
}

async function main() {
  console.log(chalk.cyan('🚀 WWFM AI-Powered Solution Generator'))
  console.log(chalk.gray('━'.repeat(50)))
  console.log(chalk.white('📊 Using Gemini AI for evidence-based recommendations'))
  console.log(chalk.green('💰 Cost: FREE (was $137 with Claude)'))
  console.log(chalk.yellow('⏱️  Time: 2-3 days with free tier limits\n'))
  
  // Handle usage reset flag
  if (options.resetUsage) {
    const { GeminiClient } = await import('./generators/gemini-client')
    const client = new GeminiClient(process.env.GEMINI_API_KEY!)
    client.resetUsage()
    process.exit(0)
  }
  
  if (options.dryRun) {
    console.log(chalk.yellow('⚠️  DRY RUN MODE - No database changes will be made\n'))
  }
  
  try {
    let goals
    
    // Use smart selection if enabled
    if (options.smartSelect && !options.goalId) {
      const { GenerationManager } = await import('./generation-manager')
      const manager = new GenerationManager(supabase)
      
      // Show current progress
      const progress = await manager.updateProgress()
      manager.displayProgress(progress)
      
      // Get recommended goals based on strategy
      const coverage = await manager.selectGoalsForGeneration(parseInt(options.batchSize))
      
      if (coverage.length === 0) {
        console.log(chalk.green('\n✅ All goals have sufficient coverage!'))
        return
      }
      
      // Fetch full goal details for selected goals
      const goalIds = coverage.map(c => c.goalId)
      const { data, error } = await supabase
        .from('goals')
        .select('id, title, description, arena_id, arenas(name), categories(name)')
        .in('id', goalIds)
      
      if (error) throw error
      goals = data
      
      console.log(chalk.cyan(`\n🎯 Smart selection (${options.strategy} strategy):`))
      console.log(chalk.gray(`Selected ${goals?.length} goals needing solutions\n`))
      
    } else {
      // Original query logic
      let query = supabase
        .from('goals')
        .select('id, title, description, arena_id, arenas(name), categories(name)')
        .order('title')
      
      if (options.goalId) {
        query = query.eq('id', options.goalId)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error(chalk.red('❌ Error fetching goals:'), error)
        process.exit(1)
      }
      
      goals = data
    }
    
    if (!goals || goals.length === 0) {
      console.log(chalk.yellow('No goals found to process'))
      return
    }
    
    console.log(chalk.green(`✓ Processing ${goals.length} goals\n`))
    
    // Process goals in batches
    const batchSize = parseInt(options.batchSize)
    const startFrom = parseInt(options.startFrom)
    const limit = parseInt(options.limit)
    
    let totalGenerated = 0
    let successCount = 0
    let errorCount = 0
    
    // Start from specified index
    const goalsToProcess = goals.slice(startFrom)
    
    for (let i = 0; i < goalsToProcess.length; i += batchSize) {
      const batch = goalsToProcess.slice(i, i + batchSize)
      const batchNumber = Math.floor((startFrom + i) / batchSize) + 1
      const totalBatches = Math.ceil(goalsToProcess.length / batchSize)
      
      console.log(chalk.blue(`\n📦 Processing batch ${batchNumber}/${totalBatches}`))
      console.log(chalk.gray('─'.repeat(40)))
      
      for (const goal of batch) {
        try {
          const goalIndex = startFrom + i + batch.indexOf(goal) + 1
          console.log(chalk.white(`\n[${goalIndex}/${goals.length}] 🎯 ${goal.title}`))
          
          if (goal.arenas?.name) {
            console.log(chalk.gray(`   Arena: ${goal.arenas.name}`))
          }
          if (goal.categories?.name) {
            console.log(chalk.gray(`   Category: ${goal.categories.name}`))
          }
          
          const generatedCount = await generateSolutionsForGoal(
            goal,
            supabase,
            {
              dryRun: options.dryRun,
              limit: limit,
              forceWrite: Boolean(options.forceWrite),
              dirtyOnly: Boolean(options.dirtyOnly)
            }
          )
          
          totalGenerated += generatedCount
          successCount++
          
          console.log(chalk.green(`   ✅ Generated ${generatedCount} solutions`))
          
        } catch (error) {
          errorCount++
          console.error(chalk.red(`   ❌ Error processing goal: ${error.message}`))
          
          // Log failed goals to a file for later retry
          const failedGoalsFile = '.failed-goals.json'
          let failedGoals = []
          try {
            if (fs.existsSync(failedGoalsFile)) {
              failedGoals = JSON.parse(fs.readFileSync(failedGoalsFile, 'utf-8'))
            }
          } catch (e) {
            // Start fresh if file is corrupted
          }
          
          failedGoals.push({
            goalId: goal.id,
            title: goal.title,
            error: error.message,
            timestamp: new Date().toISOString()
          })
          
          fs.writeFileSync(failedGoalsFile, JSON.stringify(failedGoals, null, 2))
          
          // Continue with next goal instead of stopping
          continue
        }
      }
      
      // Add delay between batches to avoid rate limits
      if (i + batchSize < goalsToProcess.length) {
        console.log(chalk.gray('\n⏳ Waiting 2 seconds before next batch...'))
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    // Final summary
    console.log(chalk.cyan('\n' + '═'.repeat(50)))
    console.log(chalk.cyan('📊 Generation Summary'))
    console.log(chalk.cyan('═'.repeat(50)))
    console.log(chalk.white(`✅ Successfully processed: ${successCount} goals`))
    console.log(chalk.white(`📦 Total solutions generated: ${totalGenerated}`))
    
    if (errorCount > 0) {
      console.log(chalk.yellow(`⚠️  Errors encountered: ${errorCount} goals`))
    }
    
    // Show Gemini usage stats
    const { GeminiClient } = await import('./generators/gemini-client')
    const client = new GeminiClient(process.env.GEMINI_API_KEY!)
    const finalStats = client.getUsageStats()
    
    console.log(chalk.cyan('\n📊 Gemini API Usage:'))
    console.log(chalk.white(`   Requests today: ${finalStats.requestsToday}/1000`))
    console.log(chalk.white(`   Requests remaining: ${finalStats.requestsRemaining}`))
    
    if (finalStats.requestsRemaining === 0) {
      console.log(chalk.yellow('\n⚠️  Daily limit reached! Resume tomorrow with:'))
      console.log(chalk.white(`   npm run generate:ai-solutions -- --start-from=${startFrom + successCount}`))
    } else {
      console.log(chalk.green('\n🎉 Generation complete!'))
    }
    
    if (options.dryRun) {
      console.log(chalk.yellow('\n💡 This was a dry run. To insert into database, run without --dry-run'))
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ Fatal error:'), error)
    process.exit(1)
  }
}

// Run the main function
main().catch(error => {
  console.error(chalk.red('Unhandled error:'), error)
  process.exit(1)
})
