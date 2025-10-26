#!/usr/bin/env tsx

/**
 * Expansion Progress Monitor
 *
 * Real-time monitoring of quality-first expansion system progress.
 * Shows category status, priority queues, and completion metrics.
 */

import { ProgressTracker } from './services/progress-tracker'
import chalk from 'chalk'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function monitorProgress() {
  const tracker = new ProgressTracker()

  console.log(chalk.bold.cyan('\n🔄 WWFM Quality-First Expansion Monitor'))
  console.log(chalk.cyan('━'.repeat(80)))

  try {
    // Initialize and get overall progress
    await tracker.initializeProgress()
    const overall = await tracker.getOverallProgress()

    // Overall summary
    console.log(chalk.bold.white('\n📊 Overall Platform Status'))
    console.log(chalk.cyan('────────────────────────────'))
    console.log(`Total Solutions: ${overall.totalSolutions.toLocaleString()}`)
    console.log(`Coverage: ${overall.overallCoverage.toFixed(1)}% (${(overall.totalSolutions - overall.zeroConnections).toLocaleString()} connected)`)
    console.log(`Zero Connections: ${chalk.red(overall.zeroConnections.toLocaleString())} (Priority 1)`)
    console.log(`Single Connections: ${chalk.yellow(overall.singleConnections.toLocaleString())} (Priority 2)`)
    console.log(`Completed (>2 connections): ${chalk.green(overall.completedSolutions.toLocaleString())}`)

    // Category breakdown
    console.log(chalk.bold.white('\n📋 Categories by Priority (Zero Connections)'))
    console.log(chalk.cyan('─'.repeat(80)))
    console.log(chalk.gray('Category                    │ Zero │ Single │ Double │ Complete │ Coverage │ Pending'))
    console.log(chalk.gray('─'.repeat(80)))

    for (const category of overall.categoriesByPriority) {
      if (category.zero_connections === 0 && category.pending_count === 0) continue

      const categoryName = category.category.padEnd(26)
      const zero = String(category.zero_connections).padStart(4)
      const single = String(category.single_connections).padStart(6)
      const double = String(category.double_connections).padStart(6)
      const complete = String(category.completed_solutions).padStart(8)
      const coverage = `${category.coverage_percentage.toFixed(1)}%`.padStart(7)
      const pending = String(category.pending_count).padStart(7)

      let line = `${categoryName} │ `

      // Color code by priority
      if (category.zero_connections > 0) {
        line += chalk.red(zero)
      } else {
        line += chalk.gray(zero)
      }

      line += ` │ `

      if (category.single_connections > 0) {
        line += chalk.yellow(single)
      } else {
        line += chalk.gray(single)
      }

      line += ` │ ${chalk.gray(double)} │ ${chalk.green(complete)} │ `

      if (category.coverage_percentage < 80) {
        line += chalk.red(coverage)
      } else if (category.coverage_percentage < 95) {
        line += chalk.yellow(coverage)
      } else {
        line += chalk.green(coverage)
      }

      line += ` │ ${pending > 0 ? chalk.cyan(pending) : chalk.gray(pending)}`

      console.log(line)
    }

    // Recommendations
    console.log(chalk.bold.white('\n🎯 Recommended Next Actions'))
    console.log(chalk.cyan('────────────────────────────'))

    const highPriorityCategories = overall.categoriesByPriority
      .filter(cat => cat.zero_connections > 0)
      .slice(0, 5)

    if (highPriorityCategories.length > 0) {
      console.log(chalk.white('Priority 1 - Zero Connection Solutions:'))
      for (const cat of highPriorityCategories) {
        console.log(`  ${chalk.cyan('npm run expand:quality')} --category ${cat.category} --mode zero --batch-size ${Math.min(cat.zero_connections, 20)}`)
      }
    }

    const singleConnectionCategories = overall.categoriesByPriority
      .filter(cat => cat.zero_connections === 0 && cat.single_connections > 0)
      .slice(0, 3)

    if (singleConnectionCategories.length > 0) {
      console.log(chalk.white('\nPriority 2 - Single Connection Solutions:'))
      for (const cat of singleConnectionCategories) {
        console.log(`  ${chalk.cyan('npm run expand:quality')} --category ${cat.category} --mode single --batch-size ${Math.min(cat.single_connections, 30)}`)
      }
    }

    // Quality alerts
    console.log(chalk.bold.white('\n⚠️  Quality Alerts'))
    console.log(chalk.cyan('─────────────────'))

    const lowCoverageCategories = overall.categoriesByPriority
      .filter(cat => cat.coverage_percentage < 80)

    if (lowCoverageCategories.length > 0) {
      console.log(chalk.yellow('Low Coverage Categories (<80%):'))
      for (const cat of lowCoverageCategories) {
        console.log(`  ${cat.category}: ${cat.coverage_percentage.toFixed(1)}%`)
      }
    } else {
      console.log(chalk.green('✅ All categories have >80% coverage'))
    }

    // Completion estimate
    const totalPending = overall.zeroConnections + overall.singleConnections
    const avgConnectionsPerSolution = 2.5 // Conservative estimate
    const solutionsPerHour = 100 // With rate limits
    const estimatedHours = totalPending / solutionsPerHour

    console.log(chalk.bold.white('\n⏱️  Completion Estimate'))
    console.log(chalk.cyan('─────────────────────'))
    console.log(`Pending Solutions: ${totalPending.toLocaleString()}`)
    console.log(`Est. Processing Time: ${estimatedHours.toFixed(1)} hours`)
    console.log(`Est. New Connections: ${Math.round(totalPending * avgConnectionsPerSolution).toLocaleString()}`)

    console.log(chalk.gray('\n──────────────────────────────────────────────'))
    console.log(chalk.gray('Run again with: npm run monitor:expansion'))
    console.log(chalk.gray('Start expansion with: npm run expand:quality --help'))

  } catch (error) {
    console.error(chalk.red('❌ Error monitoring progress:'), error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  monitorProgress()
}

export { monitorProgress }