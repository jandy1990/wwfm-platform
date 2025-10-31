#!/usr/bin/env tsx

/**
 * Quality Test Script - 100 Solutions with Full Data Capture
 * 
 * Captures complete before/after data for manual review
 * Saves everything to markdown for easy reading
 */

import { createClient } from '@supabase/supabase-js'
import { ClaudeQualityChecker } from './services/claude-quality-checker'
import dotenv from 'dotenv'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import ora from 'ora'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Check for Claude API key
if (!process.env.ANTHROPIC_API_KEY) {
  console.error(chalk.red('❌ ANTHROPIC_API_KEY not found in .env.local'))
  process.exit(1)
}

interface FullSolution {
  id: string
  title: string
  description: string
  category: string
  effectiveness: number
  effectiveness_rationale?: string
  created_at: string
  source_type?: string
  generation_source?: string
  
  // Quality scores (will be null before check)
  conversation_completeness_score?: number | null
  evidence_alignment_score?: number | null
  accessibility_truth_score?: number | null
  expectation_accuracy_score?: number | null
  category_accuracy_score?: number | null
  quality_status?: string | null
  quality_issues?: any
  quality_fixes_applied?: any
  
  // Related data
  fields?: any
  goal_implementations?: any[]
}

async function captureFullSolutionData(solutionIds: string[]): Promise<FullSolution[]> {
  const solutions: FullSolution[] = []
  
  for (const id of solutionIds) {
    // Get solution with all fields
    const { data: solution, error } = await supabase
      .from('solutions')
      .select(`
        *,
        goal_implementation_links (
          goal_id,
          effectiveness,
          aggregated_fields,
          goals (
            title,
            description
          )
        )
      `)
      .eq('id', id)
      .single()
    
    if (error || !solution) {
      console.error(chalk.red(`Error fetching solution ${id}:`, error))
      continue
    }
    
    // Get solution fields from ratings table
    const { data: ratings } = await supabase
      .from('ratings')
      .select('solution_fields')
      .eq('solution_id', id)
      .limit(1)
    
    solutions.push({
      ...solution,
      fields: ratings?.[0]?.solution_fields || solution.aggregated_fields || {},
      goal_implementations: solution.goal_implementation_links || []
    })
  }
  
  return solutions
}

function formatSolutionForMarkdown(solution: FullSolution, index: number): string {
  let md = `### ${index}. ${solution.title}\n\n`
  
  // Basic info
  md += `**ID:** ${solution.id}\n`
  md += `**Category:** ${solution.category}\n`
  md += `**Effectiveness:** ${solution.effectiveness}/5\n`
  md += `**Source:** ${solution.generation_source || solution.source_type || 'unknown'}\n`
  md += `**Created:** ${new Date(solution.created_at).toLocaleDateString()}\n\n`
  
  // Description
  md += `**Description:**\n${solution.description}\n\n`
  
  // Effectiveness rationale
  if (solution.effectiveness_rationale) {
    md += `**Effectiveness Rationale:**\n${solution.effectiveness_rationale}\n\n`
  }
  
  // Fields
  if (solution.fields && Object.keys(solution.fields).length > 0) {
    md += `**Fields:**\n`
    for (const [key, value] of Object.entries(solution.fields)) {
      if (Array.isArray(value)) {
        md += `- ${key}: ${value.join(', ')}\n`
      } else {
        md += `- ${key}: ${value}\n`
      }
    }
    md += '\n'
  }
  
  // Quality scores (if available)
  if (solution.quality_status) {
    md += `**Quality Status:** ${solution.quality_status}\n\n`
    md += `**Quality Scores:**\n`
    md += `- Conversation Completeness: ${solution.conversation_completeness_score || 'N/A'}/100\n`
    md += `- Evidence Alignment: ${solution.evidence_alignment_score || 'N/A'}/100\n`
    md += `- Accessibility Truth: ${solution.accessibility_truth_score || 'N/A'}/100\n`
    md += `- Expectation Accuracy: ${solution.expectation_accuracy_score || 'N/A'}/100\n`
    md += `- Category Accuracy: ${solution.category_accuracy_score || 'N/A'}/100\n\n`
  }
  
  // Quality issues (if found)
  if (solution.quality_issues) {
    md += `**Issues Found:**\n`
    const issues = solution.quality_issues
    if (issues.conversational?.length) {
      md += `- Conversational: ${issues.conversational.join(', ')}\n`
    }
    if (issues.evidence?.length) {
      md += `- Evidence: ${issues.evidence.join(', ')}\n`
    }
    if (issues.accessibility?.length) {
      md += `- Accessibility: ${issues.accessibility.join(', ')}\n`
    }
    if (issues.expectations?.length) {
      md += `- Expectations: ${issues.expectations.join(', ')}\n`
    }
    if (issues.category) {
      md += `- Category: ${issues.category}\n`
    }
    md += '\n'
  }
  
  // Fixes applied (if any)
  if (solution.quality_fixes_applied) {
    md += `**Fixes Applied:**\n`
    const fixes = solution.quality_fixes_applied
    if (fixes.title) {
      md += `- New Title: "${fixes.title}"\n`
    }
    if (fixes.description) {
      md += `- New Description: "${fixes.description}"\n`
    }
    if (fixes.effectiveness) {
      md += `- New Effectiveness: ${fixes.effectiveness}\n`
    }
    if (fixes.effectivenessRationale) {
      md += `- New Rationale: "${fixes.effectivenessRationale}"\n`
    }
    if (fixes.category) {
      md += `- New Category: ${fixes.category}\n`
    }
    if (fixes.fields) {
      md += `- Field Updates:\n`
      for (const [key, value] of Object.entries(fixes.fields)) {
        md += `  - ${key}: ${value}\n`
      }
    }
    md += '\n'
  }
  
  // Goal implementations
  if (solution.goal_implementations && solution.goal_implementations.length > 0) {
    md += `**Connected to ${solution.goal_implementations.length} goal(s):**\n`
    solution.goal_implementations.slice(0, 3).forEach((impl: any) => {
      if (impl.goals) {
        md += `- ${impl.goals.title} (effectiveness: ${impl.effectiveness})\n`
      }
    })
    if (solution.goal_implementations.length > 3) {
      md += `- ... and ${solution.goal_implementations.length - 3} more\n`
    }
    md += '\n'
  }
  
  md += '---\n\n'
  return md
}

async function runQualityTest() {
  const spinner = ora('Starting quality test for 100 solutions...').start()
  
  try {
    // Initialize quality checker
    const checker = new ClaudeQualityChecker(
      process.env.ANTHROPIC_API_KEY!,
      supabase
    )
    
    // Get 100 pending solutions
    spinner.text = 'Fetching 100 pending solutions...'
    const pendingSolutions = await checker.getPendingSolutions(100)
    
    if (pendingSolutions.length === 0) {
      spinner.fail('No pending solutions found. Generate some first with: npm run generate:ai-solutions')
      return
    }
    
    const solutionIds = pendingSolutions.map(s => s.id)
    console.log(chalk.blue(`\nFound ${pendingSolutions.length} solutions to test`))
    
    // Capture BEFORE state
    spinner.text = 'Capturing complete data BEFORE quality check...'
    const beforeData = await captureFullSolutionData(solutionIds)
    
    // Save BEFORE state to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const outputDir = path.join(__dirname, 'quality-test-results')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    const beforeFile = path.join(outputDir, `quality-test-${timestamp}-BEFORE.md`)
    let beforeMd = `# Quality Test - BEFORE Claude Review\n\n`
    beforeMd += `**Date:** ${new Date().toLocaleString()}\n`
    beforeMd += `**Solutions:** ${beforeData.length}\n\n`
    beforeMd += `## Solutions\n\n`
    
    beforeData.forEach((solution, idx) => {
      beforeMd += formatSolutionForMarkdown(solution, idx + 1)
    })
    
    fs.writeFileSync(beforeFile, beforeMd)
    console.log(chalk.green(`✅ BEFORE data saved to: ${path.basename(beforeFile)}`))
    
    // Run quality check
    spinner.text = 'Running Claude quality check...'
    const report = await checker.checkBatch(pendingSolutions)
    
    // Save quality report
    const reportFile = path.join(outputDir, `quality-test-${timestamp}-REPORT.json`)
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))
    console.log(chalk.green(`✅ Quality report saved to: ${path.basename(reportFile)}`))
    
    // Display summary
    console.log(chalk.cyan('\n📊 Quality Check Results:'))
    console.log(chalk.gray('─'.repeat(40)))
    console.log(`Total Checked: ${report.summary.totalChecked}`)
    console.log(`Passed: ${chalk.green(report.summary.passed.toString())}`)
    console.log(`Fixed: ${chalk.blue(report.summary.fixed.toString())}`)
    console.log(`Failed: ${chalk.red(report.summary.failed.toString())}`)
    console.log(`\nAverage Scores:`)
    console.log(`  Conversation: ${report.summary.avgScores.conversationCompleteness.toFixed(1)}%`)
    console.log(`  Evidence: ${report.summary.avgScores.evidenceAlignment.toFixed(1)}%`)
    console.log(`  Accessibility: ${report.summary.avgScores.accessibilityTruth.toFixed(1)}%`)
    console.log(`  Expectations: ${report.summary.avgScores.expectationAccuracy.toFixed(1)}%`)
    console.log(`  Category: ${report.summary.avgScores.categoryAccuracy ? '✓' : '✗'}`)
    
    if (report.summary.commonIssues.length > 0) {
      console.log(`\nCommon Issues:`)
      report.summary.commonIssues.forEach(issue => {
        console.log(`  • ${issue}`)
      })
    }
    
    console.log(`\nEstimated cost: $${report.costEstimate.toFixed(4)}`)
    console.log(`Tokens used: ${report.tokensUsed.toLocaleString()}`)
    
    // Apply fixes
    spinner.text = 'Applying fixes to database...'
    await checker.applyFixes(report)
    
    // Wait a moment for database updates
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Capture AFTER state
    spinner.text = 'Capturing complete data AFTER quality check...'
    const afterData = await captureFullSolutionData(solutionIds)
    
    // Save AFTER state to file
    const afterFile = path.join(outputDir, `quality-test-${timestamp}-AFTER.md`)
    let afterMd = `# Quality Test - AFTER Claude Review\n\n`
    afterMd += `**Date:** ${new Date().toLocaleString()}\n`
    afterMd += `**Solutions:** ${afterData.length}\n\n`
    afterMd += `## Summary\n\n`
    afterMd += `- **Passed:** ${report.summary.passed} solutions\n`
    afterMd += `- **Fixed:** ${report.summary.fixed} solutions\n`
    afterMd += `- **Failed:** ${report.summary.failed} solutions\n`
    afterMd += `- **Cost:** $${report.costEstimate.toFixed(4)}\n\n`
    afterMd += `## Solutions\n\n`
    
    afterData.forEach((solution, idx) => {
      afterMd += formatSolutionForMarkdown(solution, idx + 1)
    })
    
    fs.writeFileSync(afterFile, afterMd)
    console.log(chalk.green(`✅ AFTER data saved to: ${path.basename(afterFile)}`))
    
    // Create comparison summary
    const summaryFile = path.join(outputDir, `quality-test-${timestamp}-SUMMARY.md`)
    let summaryMd = `# Quality Test Summary\n\n`
    summaryMd += `**Test Date:** ${new Date().toLocaleString()}\n`
    summaryMd += `**Solutions Tested:** ${pendingSolutions.length}\n`
    summaryMd += `**Claude Model:** claude-3-5-sonnet-20241022\n`
    summaryMd += `**Cost:** $${report.costEstimate.toFixed(4)}\n`
    summaryMd += `**Tokens:** ${report.tokensUsed.toLocaleString()}\n\n`
    
    summaryMd += `## Results\n\n`
    summaryMd += `| Status | Count | Percentage |\n`
    summaryMd += `|--------|-------|------------|\n`
    summaryMd += `| ✅ Passed | ${report.summary.passed} | ${((report.summary.passed / report.summary.totalChecked) * 100).toFixed(1)}% |\n`
    summaryMd += `| 🔧 Fixed | ${report.summary.fixed} | ${((report.summary.fixed / report.summary.totalChecked) * 100).toFixed(1)}% |\n`
    summaryMd += `| ❌ Failed | ${report.summary.failed} | ${((report.summary.failed / report.summary.totalChecked) * 100).toFixed(1)}% |\n\n`
    
    summaryMd += `## Average Quality Scores\n\n`
    summaryMd += `| Dimension | Score | Target |\n`
    summaryMd += `|-----------|-------|--------|\n`
    summaryMd += `| Conversational Completeness | ${report.summary.avgScores.conversationCompleteness.toFixed(1)}% | ≥85% |\n`
    summaryMd += `| Evidence Alignment | ${report.summary.avgScores.evidenceAlignment.toFixed(1)}% | ≥85% |\n`
    summaryMd += `| Accessibility Truth | ${report.summary.avgScores.accessibilityTruth.toFixed(1)}% | ≥85% |\n`
    summaryMd += `| Expectation Accuracy | ${report.summary.avgScores.expectationAccuracy.toFixed(1)}% | ≥85% |\n`
    summaryMd += `| Category Accuracy | ${report.summary.avgScores.categoryAccuracy ? '100%' : '0%'} | 100% |\n\n`
    
    if (report.summary.commonIssues.length > 0) {
      summaryMd += `## Most Common Issues\n\n`
      report.summary.commonIssues.forEach((issue, idx) => {
        summaryMd += `${idx + 1}. ${issue}\n`
      })
      summaryMd += '\n'
    }
    
    summaryMd += `## Files Generated\n\n`
    summaryMd += `1. **BEFORE:** ${path.basename(beforeFile)}\n`
    summaryMd += `2. **AFTER:** ${path.basename(afterFile)}\n`
    summaryMd += `3. **REPORT:** ${path.basename(reportFile)}\n`
    summaryMd += `4. **SUMMARY:** ${path.basename(summaryFile)}\n\n`
    
    summaryMd += `## How to Review\n\n`
    summaryMd += `1. Open the BEFORE file to see original solutions\n`
    summaryMd += `2. Open the AFTER file to see solutions with fixes applied\n`
    summaryMd += `3. Compare specific solutions by ID to see what changed\n`
    summaryMd += `4. Look for patterns in the issues and fixes\n`
    summaryMd += `5. Check if the fixes actually improve the solutions\n`
    
    fs.writeFileSync(summaryFile, summaryMd)
    console.log(chalk.green(`✅ Summary saved to: ${path.basename(summaryFile)}`))
    
    spinner.succeed('Quality test complete!')
    
    console.log(chalk.cyan('\n📁 All results saved to:'))
    console.log(chalk.gray(outputDir))
    console.log(chalk.yellow('\nReview the markdown files to see:'))
    console.log('  • Complete BEFORE state (all fields, descriptions, etc.)')
    console.log('  • Complete AFTER state with fixes applied')
    console.log('  • Detailed report with issues and changes')
    console.log('  • Summary with statistics')
    
  } catch (error: any) {
    spinner.fail(`Error: ${error.message}`)
    console.error(error)
    process.exit(1)
  }
}

// Run the test
runQualityTest().catch(console.error)