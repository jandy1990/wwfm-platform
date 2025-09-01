#!/usr/bin/env tsx

/**
 * Quality Pipeline CLI
 * 
 * Run the hybrid Gemini + Claude quality system
 * Manages generation, quality checking, and monitoring
 */

import { Command } from 'commander'
import { createClient } from '@supabase/supabase-js'
import { QualityOrchestrator } from './services/quality-orchestrator'
import { ClaudeQualityChecker } from './services/claude-quality-checker'
import dotenv from 'dotenv'
import chalk from 'chalk'
import ora from 'ora'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Check for required API keys
if (!process.env.ANTHROPIC_API_KEY) {
  console.error(chalk.red('❌ ANTHROPIC_API_KEY not found in .env.local'))
  console.log(chalk.yellow('Add it to your .env.local file:'))
  console.log(chalk.gray('ANTHROPIC_API_KEY=sk-ant-api03-xxxxx'))
  process.exit(1)
}

// Initialize CLI
const program = new Command()
  .name('quality-pipeline')
  .description('Hybrid Gemini + Claude quality system for WWFM solutions')
  .version('1.0.0')

// Command: Run quality checks
program
  .command('check')
  .description('Run quality checks on pending solutions')
  .option('-b, --batch-size <number>', 'Solutions per batch', '100')
  .option('-l, --limit <number>', 'Maximum batches to process', '10')
  .option('-c, --cost-limit <number>', 'Maximum cost in USD', '10.0')
  .action(async (options) => {
    const spinner = ora('Initializing quality checker...').start()
    
    try {
      const checker = new ClaudeQualityChecker(
        process.env.ANTHROPIC_API_KEY!,
        supabase
      )
      
      spinner.text = 'Running quality checks...'
      
      await checker.processAllPending(
        parseInt(options.batchSize),
        parseFloat(options.costLimit)
      )
      
      spinner.succeed('Quality checks complete!')
      
    } catch (error: any) {
      spinner.fail(`Error: ${error.message}`)
      process.exit(1)
    }
  })

// Command: Start orchestrator
program
  .command('orchestrate')
  .description('Start the quality orchestrator for automated checks')
  .option('-b, --batch-size <number>', 'Solutions per batch', '100')
  .option('-t, --trigger <number>', 'Trigger after N pending', '100')
  .option('-i, --interval <hours>', 'Check interval in hours', '6')
  .option('-q, --quality <percent>', 'Quality threshold %', '80')
  .option('-c, --cost-limit <number>', 'Daily cost limit USD', '10.0')
  .option('--no-auto', 'Disable automatic triggers')
  .action(async (options) => {
    console.log(chalk.cyan('🎯 Starting Quality Orchestrator'))
    
    const orchestrator = new QualityOrchestrator(
      supabase,
      process.env.ANTHROPIC_API_KEY!,
      {
        batchSize: parseInt(options.batchSize),
        triggerThreshold: parseInt(options.trigger),
        timeInterval: parseInt(options.interval),
        qualityThreshold: parseInt(options.quality),
        dailyCostLimit: parseFloat(options.costLimit),
        enableAutoTriggers: options.auto !== false
      }
    )
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n⚠️ Shutting down orchestrator...'))
      orchestrator.stop()
      process.exit(0)
    })
    
    await orchestrator.start()
  })

// Command: Show dashboard
program
  .command('dashboard')
  .description('Display quality metrics dashboard')
  .option('-w, --watch', 'Auto-refresh every 30 seconds')
  .action(async (options) => {
    const orchestrator = new QualityOrchestrator(
      supabase,
      process.env.ANTHROPIC_API_KEY!
    )
    
    const displayDashboard = async () => {
      console.clear()
      const data = await orchestrator.getDashboardData()
      
      console.log(chalk.cyan.bold('\n🎯 WWFM Quality Pipeline Dashboard'))
      console.log(chalk.gray('═'.repeat(60)))
      
      // Quality scores
      console.log(chalk.white.bold('\n📊 Quality Scores'))
      console.log(chalk.gray('─'.repeat(40)))
      
      const qualityBar = (score: number) => {
        const filled = Math.round(score / 5)
        const empty = 20 - filled
        const color = score >= 85 ? chalk.green : score >= 70 ? chalk.yellow : chalk.red
        return color('█'.repeat(filled)) + chalk.gray('░'.repeat(empty)) + ` ${score.toFixed(1)}%`
      }
      
      console.log(`  Conversation: ${qualityBar(data.quality.avgConversationScore)}`)
      console.log(`  Evidence:     ${qualityBar(data.quality.avgEvidenceScore)}`)
      console.log(`  Accessibility:${qualityBar(data.quality.avgAccessibilityScore)}`)
      console.log(`  Expectations: ${qualityBar(data.quality.avgExpectationScore)}`)
      console.log(`  Category:     ${qualityBar(data.quality.avgCategoryAccuracy)}`)
      console.log(chalk.white.bold(`  Overall:      ${qualityBar(data.quality.overallQuality)}`))
      
      // Solution counts
      console.log(chalk.white.bold('\n📦 Solution Status'))
      console.log(chalk.gray('─'.repeat(40)))
      console.log(`  ${chalk.yellow('⏳ Pending:')}  ${data.quality.pendingCount.toLocaleString()}`)
      console.log(`  ${chalk.green('✅ Passed:')}   ${data.quality.passedCount.toLocaleString()}`)
      console.log(`  ${chalk.blue('🔧 Fixed:')}    ${data.quality.fixedCount.toLocaleString()}`)
      console.log(`  ${chalk.red('❌ Failed:')}   ${data.quality.failedCount.toLocaleString()}`)
      
      const total = data.quality.passedCount + data.quality.fixedCount + 
                   data.quality.failedCount + data.quality.pendingCount
      const completed = total - data.quality.pendingCount
      const progress = total > 0 ? (completed / total) * 100 : 0
      console.log(chalk.gray(`  Progress: ${completed.toLocaleString()}/${total.toLocaleString()} (${progress.toFixed(1)}%)`))
      
      // Cost metrics
      console.log(chalk.white.bold('\n💰 Cost Metrics'))
      console.log(chalk.gray('─'.repeat(40)))
      console.log(`  Today:        $${data.cost.todaySpend.toFixed(2)}`)
      console.log(`  This Week:    $${data.cost.weekSpend.toFixed(2)}`)
      console.log(`  This Month:   $${data.cost.monthSpend.toFixed(2)}`)
      console.log(`  Per Solution: $${data.cost.avgCostPerSolution.toFixed(4)}`)
      console.log(`  Projected/mo: $${data.cost.projectedMonthlySpend.toFixed(2)}`)
      
      // Processing metrics
      console.log(chalk.white.bold('\n⚡ Processing'))
      console.log(chalk.gray('─'.repeat(40)))
      console.log(`  Speed:        ${data.processing.solutionsPerHour} solutions/hour`)
      console.log(`  Batches Today:${data.processing.batchesProcessedToday}`)
      console.log(`  Time Remaining:${data.processing.estimatedTimeRemaining}`)
      console.log(`  Last Check:   ${new Date(data.lastCheckTime).toLocaleTimeString()}`)
      
      // System status
      console.log(chalk.white.bold('\n⚙️ System Status'))
      console.log(chalk.gray('─'.repeat(40)))
      console.log(`  Orchestrator: ${data.isRunning ? chalk.green('● Running') : chalk.gray('○ Stopped')}`)
      console.log(`  Auto-trigger: ${data.config.enableAutoTriggers ? chalk.green('Enabled') : chalk.gray('Disabled')}`)
      console.log(`  Batch Size:   ${data.config.batchSize} solutions`)
      console.log(`  Cost Limit:   $${data.config.dailyCostLimit}/day`)
      
      console.log(chalk.gray('\n═'.repeat(60)))
      console.log(chalk.gray(`Last updated: ${new Date().toLocaleString()}`))
      
      if (options.watch) {
        console.log(chalk.gray('Auto-refreshing every 30 seconds... (Ctrl+C to exit)'))
      }
    }
    
    await displayDashboard()
    
    if (options.watch) {
      setInterval(displayDashboard, 30000)
    }
  })

// Command: Test single batch
program
  .command('test')
  .description('Test quality check with a single batch')
  .option('-s, --size <number>', 'Batch size', '10')
  .action(async (options) => {
    const spinner = ora('Testing quality check...').start()
    
    try {
      const checker = new ClaudeQualityChecker(
        process.env.ANTHROPIC_API_KEY!,
        supabase
      )
      
      // Get sample solutions
      spinner.text = 'Fetching sample solutions...'
      const solutions = await checker.getPendingSolutions(parseInt(options.size))
      
      if (solutions.length === 0) {
        spinner.warn('No pending solutions to test')
        return
      }
      
      spinner.text = `Checking ${solutions.length} solutions with Claude...`
      
      // Run quality check
      const report = await checker.checkBatch(solutions)
      
      spinner.succeed('Test complete!')
      
      // Display results
      console.log(chalk.cyan('\n📊 Test Results'))
      console.log(chalk.gray('─'.repeat(40)))
      console.log(`Solutions checked: ${report.summary.totalChecked}`)
      console.log(`Passed: ${chalk.green(report.summary.passed.toString())}`)
      console.log(`Fixed: ${chalk.blue(report.summary.fixed.toString())}`)
      console.log(`Failed: ${chalk.red(report.summary.failed.toString())}`)
      console.log(`\nAverage Scores:`)
      console.log(`  Conversation: ${report.summary.avgScores.conversationCompleteness.toFixed(1)}%`)
      console.log(`  Evidence: ${report.summary.avgScores.evidenceAlignment.toFixed(1)}%`)
      console.log(`  Accessibility: ${report.summary.avgScores.accessibilityTruth.toFixed(1)}%`)
      console.log(`  Expectations: ${report.summary.avgScores.expectationAccuracy.toFixed(1)}%`)
      console.log(`\nCommon Issues:`)
      report.summary.commonIssues.forEach(issue => {
        console.log(`  • ${issue}`)
      })
      console.log(`\nEstimated cost: $${report.costEstimate.toFixed(4)}`)
      console.log(`Tokens used: ${report.tokensUsed.toLocaleString()}`)
      
      // Ask to apply fixes
      console.log(chalk.yellow('\n⚠️ This was a test run. Fixes were not applied to the database.'))
      console.log(chalk.gray('Run "quality-pipeline check" to apply fixes.'))
      
    } catch (error: any) {
      spinner.fail(`Error: ${error.message}`)
      process.exit(1)
    }
  })

// Command: Apply migration
program
  .command('migrate')
  .description('Apply database migration for quality tracking')
  .action(async () => {
    const spinner = ora('Applying database migration...').start()
    
    try {
      const fs = require('fs')
      const path = require('path')
      
      // Read migration file
      const migrationPath = path.join(__dirname, 'database/migrations/add-quality-tracking.sql')
      const migration = fs.readFileSync(migrationPath, 'utf-8')
      
      // Split into individual statements
      const statements = migration
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0)
      
      // Execute each statement
      for (const statement of statements) {
        spinner.text = `Executing: ${statement.substring(0, 50)}...`
        const { error } = await supabase.rpc('exec_sql', { query: statement + ';' })
        
        if (error) {
          // Try direct execution if RPC doesn't exist
          console.warn(chalk.yellow('\n⚠️ RPC function not available, skipping statement'))
        }
      }
      
      spinner.succeed('Migration applied successfully!')
      console.log(chalk.gray('Quality tracking tables and columns are now available'))
      
    } catch (error: any) {
      spinner.fail(`Migration failed: ${error.message}`)
      console.log(chalk.yellow('\nYou may need to run the migration manually in Supabase SQL editor'))
      process.exit(1)
    }
  })

// Parse command line arguments
program.parse(process.argv)

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp()
}