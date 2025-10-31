/**
 * Claude Quality Check Service
 * 
 * Uses Claude to evaluate and fix Gemini-generated solutions in batches
 * Achieves 95%+ quality at 5% of the cost of pure Claude generation
 */

import Anthropic from '@anthropic-ai/sdk'
import { SupabaseClient } from '@supabase/supabase-js'
import chalk from 'chalk'

// Quality dimensions we evaluate
export interface QualityScores {
  conversationCompleteness: number  // 0-100: Can a friend act on this?
  evidenceAlignment: number         // 0-100: Is effectiveness justified?
  accessibilityTruth: number       // 0-100: Are costs/barriers disclosed?
  expectationAccuracy: number      // 0-100: Are time/effort realistic?
  categoryAccuracy: boolean         // Is it in the right category?
}

// Issues found and fixes to apply
export interface QualityIssues {
  conversational?: string[]
  evidence?: string[]
  accessibility?: string[]
  expectations?: string[]
  category?: string
}

export interface QualityFixes {
  title?: string
  description?: string
  effectiveness?: number
  effectivenessRationale?: string
  category?: string
  fields?: Record<string, any>
}

// Solution for quality checking
export interface Solution {
  id: string
  title: string
  description: string
  category: string
  effectiveness: number
  effectiveness_rationale?: string
  fields?: Record<string, any>
}

// Result of quality check
export interface QualityCheckResult {
  solutionId: string
  scores: QualityScores
  issues: QualityIssues
  fixes: QualityFixes
  status: 'passed' | 'fixed' | 'failed'
}

// Batch processing result
export interface BatchQualityReport {
  batchId: string
  results: QualityCheckResult[]
  summary: {
    totalChecked: number
    passed: number
    fixed: number
    failed: number
    avgScores: QualityScores
    commonIssues: string[]
  }
  costEstimate: number
  tokensUsed: number
}

export class ClaudeQualityChecker {
  private anthropic: Anthropic
  private supabase: SupabaseClient
  private model = 'claude-3-5-sonnet-20241022'
  
  constructor(apiKey: string, supabase: SupabaseClient) {
    this.anthropic = new Anthropic({ apiKey })
    this.supabase = supabase
  }

  /**
   * Build the quality check prompt for Claude
   */
  private buildQualityPrompt(solutions: Solution[]): string {
    return `You are evaluating AI-generated solutions for a self-help platform. Users need specific, actionable recommendations they can actually use.

Evaluate these ${solutions.length} solutions across 5 quality dimensions:

1. **Conversational Completeness (0-100)**: Would a friend have enough info to try this?
   - Must answer: What exactly? Where to get it? How much? How long?
   - 90-100: Friend can act immediately
   - 70-89: Missing minor details
   - 50-69: Missing key information
   - Below 50: Too vague to use

2. **Evidence Alignment (0-100)**: Is the effectiveness rating justified?
   - 90-100: Strong evidence cited, rating matches research
   - 70-89: Good reasoning, rating reasonable
   - 50-69: Weak justification, rating questionable
   - Below 50: No evidence or inflated rating

3. **Accessibility Truth (0-100)**: Are all costs and barriers disclosed?
   - 90-100: All costs, requirements, barriers clearly stated
   - 70-89: Most information present
   - 50-69: Hidden costs or barriers not mentioned
   - Below 50: Misleading about accessibility

4. **Expectation Accuracy (0-100)**: Are time/effort expectations realistic?
   - 90-100: Completely realistic timeframes and effort
   - 70-89: Mostly accurate
   - 50-69: Somewhat optimistic
   - Below 50: Unrealistic promises

5. **Category Accuracy (true/false)**: Is it in the right category?

For each solution, provide:
1. Scores for each dimension
2. Specific issues found
3. Concrete fixes to apply (exact text/values to change)
4. Overall status: "passed" (all scores ≥85), "fixed" (fixable issues), or "failed" (unfixable)

Solutions to evaluate:
${JSON.stringify(solutions, null, 2)}

Return ONLY a JSON array with this exact structure:
[
  {
    "solutionId": "uuid",
    "scores": {
      "conversationCompleteness": 85,
      "evidenceAlignment": 90,
      "accessibilityTruth": 95,
      "expectationAccuracy": 88,
      "categoryAccuracy": true
    },
    "issues": {
      "conversational": ["Missing where to start", "No cost mentioned"],
      "evidence": ["Effectiveness seems high for limited evidence"],
      "accessibility": [],
      "expectations": ["Time to results might be optimistic"],
      "category": null
    },
    "fixes": {
      "description": "Updated description with specific starting point...",
      "effectiveness": 4.2,
      "fields": {
        "cost": "$15/month",
        "time_to_results": "3-4 weeks"
      }
    },
    "status": "fixed"
  }
]`
  }

  /**
   * Check a batch of solutions with Claude
   */
  async checkBatch(solutions: Solution[]): Promise<BatchQualityReport> {
    const startTime = Date.now()
    const batchId = crypto.randomUUID()
    
    console.log(chalk.cyan(`🔍 Checking batch of ${solutions.length} solutions with Claude...`))
    
    try {
      // Call Claude API
      const message = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 8000,
        temperature: 0.3, // Lower temperature for consistent evaluation
        messages: [
          {
            role: 'user',
            content: this.buildQualityPrompt(solutions)
          }
        ]
      })
      
      // Parse response
      const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
      const results: QualityCheckResult[] = JSON.parse(responseText)
      
      // Calculate summary statistics
      const summary = this.calculateSummary(results)
      
      // Estimate cost (Claude 3.5 Sonnet pricing)
      const inputTokens = message.usage?.input_tokens || 0
      const outputTokens = message.usage?.output_tokens || 0
      const costEstimate = (inputTokens * 0.003 + outputTokens * 0.015) / 1000
      
      const report: BatchQualityReport = {
        batchId,
        results,
        summary,
        costEstimate,
        tokensUsed: inputTokens + outputTokens
      }
      
      const processingTime = Date.now() - startTime
      console.log(chalk.green(`✅ Batch checked in ${processingTime}ms`))
      console.log(chalk.yellow(`   Cost: $${costEstimate.toFixed(4)}, Tokens: ${report.tokensUsed}`))
      console.log(chalk.blue(`   Results: ${summary.passed} passed, ${summary.fixed} fixed, ${summary.failed} failed`))
      
      return report
      
    } catch (error: any) {
      console.error(chalk.red('❌ Claude API error:'), error.message)
      throw error
    }
  }

  /**
   * Apply fixes to solutions in the database
   */
  async applyFixes(report: BatchQualityReport): Promise<void> {
    console.log(chalk.cyan('🔧 Applying fixes to database...'))
    
    // Save batch record
    const { data: batch, error: batchError } = await this.supabase
      .from('quality_check_batches')
      .insert({
        id: report.batchId,
        solutions_checked: report.summary.totalChecked,
        avg_conversation_score: report.summary.avgScores.conversationCompleteness,
        avg_evidence_score: report.summary.avgScores.evidenceAlignment,
        avg_accessibility_score: report.summary.avgScores.accessibilityTruth,
        avg_expectation_score: report.summary.avgScores.expectationAccuracy,
        category_accuracy_rate: report.summary.avgScores.categoryAccuracy ? 100 : 0,
        passed_count: report.summary.passed,
        fixed_count: report.summary.fixed,
        failed_count: report.summary.failed,
        claude_tokens_used: report.tokensUsed,
        estimated_cost: report.costEstimate,
        common_issues: report.summary.commonIssues
      })
      .single()
    
    if (batchError) {
      console.error(chalk.red('❌ Error saving batch:'), batchError)
      return
    }
    
    // Apply fixes to each solution
    for (const result of report.results) {
      // Update solution with scores and fixes
      const updates: any = {
        conversation_completeness_score: result.scores.conversationCompleteness,
        evidence_alignment_score: result.scores.evidenceAlignment,
        accessibility_truth_score: result.scores.accessibilityTruth,
        expectation_accuracy_score: result.scores.expectationAccuracy,
        category_accuracy_score: result.scores.categoryAccuracy ? 100 : 0,
        quality_status: result.status,
        quality_check_batch_id: report.batchId,
        quality_issues: result.issues,
        quality_checked_at: new Date().toISOString()
      }
      
      // Apply fixes if needed
      if (result.fixes && result.status === 'fixed') {
        if (result.fixes.title) updates.title = result.fixes.title
        if (result.fixes.description) updates.description = result.fixes.description
        if (result.fixes.effectiveness) updates.effectiveness = result.fixes.effectiveness
        if (result.fixes.effectivenessRationale) {
          updates.effectiveness_rationale = result.fixes.effectivenessRationale
        }
        if (result.fixes.category) updates.category = result.fixes.category
        
        updates.quality_fixes_applied = result.fixes
      }
      
      const { error } = await this.supabase
        .from('solutions')
        .update(updates)
        .eq('id', result.solutionId)
      
      if (error) {
        console.error(chalk.red(`❌ Error updating solution ${result.solutionId}:`), error)
      }
      
      // Also save individual check record
      await this.supabase
        .from('solution_quality_checks')
        .insert({
          solution_id: result.solutionId,
          batch_id: report.batchId,
          conversation_completeness: result.scores.conversationCompleteness,
          evidence_alignment: result.scores.evidenceAlignment,
          accessibility_truth: result.scores.accessibilityTruth,
          expectation_accuracy: result.scores.expectationAccuracy,
          category_accuracy: result.scores.categoryAccuracy,
          issues_found: result.issues,
          fixes_applied: result.fixes,
          status: result.status
        })
    }
    
    console.log(chalk.green(`✅ Applied fixes to ${report.results.length} solutions`))
  }

  /**
   * Calculate summary statistics from results
   */
  private calculateSummary(results: QualityCheckResult[]) {
    const totalChecked = results.length
    const passed = results.filter(r => r.status === 'passed').length
    const fixed = results.filter(r => r.status === 'fixed').length
    const failed = results.filter(r => r.status === 'failed').length
    
    // Calculate average scores
    const avgScores: QualityScores = {
      conversationCompleteness: 0,
      evidenceAlignment: 0,
      accessibilityTruth: 0,
      expectationAccuracy: 0,
      categoryAccuracy: true
    }
    
    if (totalChecked > 0) {
      avgScores.conversationCompleteness = results.reduce((sum, r) => 
        sum + r.scores.conversationCompleteness, 0) / totalChecked
      avgScores.evidenceAlignment = results.reduce((sum, r) => 
        sum + r.scores.evidenceAlignment, 0) / totalChecked
      avgScores.accessibilityTruth = results.reduce((sum, r) => 
        sum + r.scores.accessibilityTruth, 0) / totalChecked
      avgScores.expectationAccuracy = results.reduce((sum, r) => 
        sum + r.scores.expectationAccuracy, 0) / totalChecked
      avgScores.categoryAccuracy = results.filter(r => 
        r.scores.categoryAccuracy).length >= totalChecked * 0.9
    }
    
    // Find common issues
    const allIssues: string[] = []
    results.forEach(r => {
      if (r.issues.conversational) allIssues.push(...r.issues.conversational)
      if (r.issues.evidence) allIssues.push(...r.issues.evidence)
      if (r.issues.accessibility) allIssues.push(...r.issues.accessibility)
      if (r.issues.expectations) allIssues.push(...r.issues.expectations)
    })
    
    // Count issue frequency
    const issueCounts = new Map<string, number>()
    allIssues.forEach(issue => {
      issueCounts.set(issue, (issueCounts.get(issue) || 0) + 1)
    })
    
    // Get top 5 most common issues
    const commonIssues = Array.from(issueCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue]) => issue)
    
    return {
      totalChecked,
      passed,
      fixed,
      failed,
      avgScores,
      commonIssues
    }
  }

  /**
   * Get pending solutions that need quality checking
   */
  async getPendingSolutions(limit: number = 100): Promise<Solution[]> {
    const { data, error } = await this.supabase
      .from('solutions')
      .select('*')
      .eq('quality_status', 'pending')
      .eq('generation_source', 'gemini')
      .limit(limit)
    
    if (error) {
      console.error(chalk.red('❌ Error fetching pending solutions:'), error)
      return []
    }
    
    return data || []
  }

  /**
   * Process all pending solutions in batches
   */
  async processAllPending(batchSize: number = 100, maxCost: number = 10.0): Promise<void> {
    let totalCost = 0
    let totalProcessed = 0
    
    console.log(chalk.cyan('🚀 Starting quality check pipeline...'))
    console.log(chalk.gray(`   Batch size: ${batchSize}, Max cost: $${maxCost}`))
    
    while (totalCost < maxCost) {
      // Get next batch
      const solutions = await this.getPendingSolutions(batchSize)
      
      if (solutions.length === 0) {
        console.log(chalk.green('✅ No more pending solutions!'))
        break
      }
      
      console.log(chalk.blue(`\n📦 Processing batch of ${solutions.length} solutions...`))
      
      // Check quality
      const report = await this.checkBatch(solutions)
      
      // Apply fixes
      await this.applyFixes(report)
      
      // Update counters
      totalCost += report.costEstimate
      totalProcessed += solutions.length
      
      console.log(chalk.yellow(`   Total processed: ${totalProcessed}, Total cost: $${totalCost.toFixed(4)}`))
      
      // Rate limiting (Claude has 40,000 tokens/minute limit)
      if (report.tokensUsed > 20000) {
        console.log(chalk.gray('   Rate limiting: waiting 30 seconds...'))
        await new Promise(resolve => setTimeout(resolve, 30000))
      } else {
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }
    
    console.log(chalk.green('\n✅ Quality check pipeline complete!'))
    console.log(chalk.blue(`   Solutions processed: ${totalProcessed}`))
    console.log(chalk.yellow(`   Total cost: $${totalCost.toFixed(4)}`))
  }
}