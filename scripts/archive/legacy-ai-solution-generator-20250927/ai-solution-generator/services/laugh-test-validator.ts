/**
 * Laugh Test Validator Service
 *
 * Provides "common sense" validation for solution-goal connections
 * to catch technically valid but intuitively wrong matches.
 */

import { GeminiClient } from '../generators/gemini-client'
import { parseJSONSafely } from '../utils/json-repair'
import {
  createLaughTestPrompt,
  createSingleConnectionLaughTestPrompt,
  createQualityAssurancePrompt,
  LaughTestCandidate
} from '../prompts/laugh-test-prompts'
import chalk from 'chalk'

export interface LaughTestResult {
  connection_id: number
  solution: string
  goal: string
  overall_score: number
  breakdown: {
    direct_causality: number
    user_expectation: number
    professional_credibility: number
    common_sense: number
  }
  passes_laugh_test: boolean
  reasoning: string
  user_confidence: string
}

export interface ValidationSummary {
  original_count: number
  passed_count: number
  rejected_count: number
  rejection_rate: number
  average_score: number
  passed_connections: any[]
  rejected_connections: any[]
}

export interface LaughTestOptions {
  threshold: number
  batchSize: number
  enableQualityAssurance: boolean
  logVerbose: boolean
}

export class LaughTestValidator {
  private geminiClient: GeminiClient
  private defaultOptions: LaughTestOptions = {
    threshold: 70,
    batchSize: 10,
    enableQualityAssurance: true,
    logVerbose: false
  }

  constructor(geminiClient: GeminiClient) {
    this.geminiClient = geminiClient
  }

  /**
   * Validate a batch of solution-goal connections using the laugh test
   */
  async batchValidate(
    connections: any[],
    options: Partial<LaughTestOptions> = {}
  ): Promise<ValidationSummary> {
    const opts = { ...this.defaultOptions, ...options }

    console.log(chalk.cyan(`\n🎭 Running laugh test validation on ${connections.length} connections`))
    console.log(chalk.gray(`   Threshold: ${opts.threshold}/100, Batch size: ${opts.batchSize}`))

    if (connections.length === 0) {
      return this.createEmptySummary()
    }

    // Process connections in batches for efficiency
    const results: LaughTestResult[] = []
    for (let i = 0; i < connections.length; i += opts.batchSize) {
      const batch = connections.slice(i, i + opts.batchSize)
      const batchResults = await this.validateBatch(batch, opts)
      results.push(...batchResults)
    }

    // Generate summary
    const summary = this.generateSummary(connections, results, opts.threshold)

    // Log results
    this.logValidationResults(summary, opts.logVerbose)

    // Optional quality assurance check
    if (opts.enableQualityAssurance && connections.length >= 5) {
      await this.performQualityAssurance(results, connections.length)
    }

    return summary
  }

  /**
   * Validate a single connection with detailed analysis
   */
  async validateSingleConnection(
    solution: string,
    goal: string,
    rationale: string,
    category: string,
    threshold: number = 70
  ): Promise<{ passes: boolean; score: number; reasoning: string }> {
    console.log(chalk.cyan(`\n🔍 Detailed laugh test: "${solution}" → "${goal}"`))

    try {
      const prompt = createSingleConnectionLaughTestPrompt(solution, goal, rationale, category)
      const responseText = await this.geminiClient.generateContent(prompt)
      const result = parseJSONSafely(responseText)

      const passes = result.score >= threshold && result.passes_laugh_test
      console.log(chalk[passes ? 'green' : 'red'](`   ${passes ? '✅' : '❌'} Score: ${result.score}/100`))

      if (!passes) {
        console.log(chalk.red(`   Reason: ${result.reasoning}`))
      }

      return {
        passes,
        score: result.score,
        reasoning: result.reasoning
      }

    } catch (error) {
      console.error(chalk.red(`   ❌ Error in single validation: ${error.message}`))
      return { passes: false, score: 0, reasoning: 'Validation error' }
    }
  }

  /**
   * Validate a batch of connections
   */
  private async validateBatch(
    connections: any[],
    options: LaughTestOptions
  ): Promise<LaughTestResult[]> {
    try {
      // Convert connections to candidate format
      const candidates: LaughTestCandidate[] = connections.map(conn => ({
        solution_title: conn.solution_title || conn.title || 'Unknown Solution',
        solution_category: conn.solution_category || conn.category || 'unknown',
        goal_title: conn.goal_id || conn.goal_title || 'Unknown Goal',
        goal_arena: conn.goal_arena || 'Unknown Arena',
        goal_category: conn.goal_category || 'Unknown Category',
        effectiveness: conn.effectiveness || 4.0,
        rationale: conn.effectiveness_rationale || conn.rationale || 'No rationale provided'
      }))

      // Generate validation prompt
      const prompt = createLaughTestPrompt(candidates)

      // Get Gemini's assessment
      const responseText = await this.geminiClient.generateContent(prompt)
      const results = parseJSONSafely(responseText)

      if (!Array.isArray(results)) {
        throw new Error('Gemini response is not an array')
      }

      return results.map((result, index) => ({
        ...result,
        connection_id: index,
        passes_laugh_test: result.overall_score >= options.threshold && result.passes_laugh_test
      }))

    } catch (error) {
      console.error(chalk.red(`   ❌ Batch validation error: ${error.message}`))

      // Return default "pass" for all connections on error (fail-open)
      return connections.map((_, index) => ({
        connection_id: index,
        solution: 'Unknown',
        goal: 'Unknown',
        overall_score: options.threshold, // Exactly at threshold
        breakdown: { direct_causality: 20, user_expectation: 20, professional_credibility: 15, common_sense: 15 },
        passes_laugh_test: true,
        reasoning: 'Validation service error - defaulted to pass',
        user_confidence: 'Unknown due to validation error'
      }))
    }
  }

  /**
   * Generate validation summary
   */
  private generateSummary(
    originalConnections: any[],
    results: LaughTestResult[],
    threshold: number
  ): ValidationSummary {
    const passed = results.filter(r => r.passes_laugh_test)
    const rejected = results.filter(r => !r.passes_laugh_test)
    const averageScore = results.length > 0
      ? results.reduce((sum, r) => sum + r.overall_score, 0) / results.length
      : 0

    // Map back to original connections
    const passedConnections = passed.map(r => originalConnections[r.connection_id]).filter(Boolean)
    const rejectedConnections = rejected.map(r => ({
      original: originalConnections[r.connection_id],
      validation: r
    })).filter(r => r.original)

    return {
      original_count: originalConnections.length,
      passed_count: passed.length,
      rejected_count: rejected.length,
      rejection_rate: originalConnections.length > 0 ? (rejected.length / originalConnections.length) * 100 : 0,
      average_score: averageScore,
      passed_connections: passedConnections,
      rejected_connections: rejectedConnections
    }
  }

  /**
   * Log validation results
   */
  private logValidationResults(summary: ValidationSummary, verbose: boolean) {
    console.log(chalk.cyan(`\n📊 Laugh Test Results:`))
    console.log(chalk.white(`   Total connections: ${summary.original_count}`))
    console.log(chalk.green(`   ✅ Passed: ${summary.passed_count}`))
    console.log(chalk.red(`   ❌ Rejected: ${summary.rejected_count}`))
    console.log(chalk.yellow(`   🔄 Rejection rate: ${summary.rejection_rate.toFixed(1)}%`))
    console.log(chalk.gray(`   📈 Average score: ${summary.average_score.toFixed(1)}/100`))

    if (verbose && summary.rejected_count > 0) {
      console.log(chalk.red(`\n❌ Rejected Connections:`))
      summary.rejected_connections.slice(0, 5).forEach(rejection => {
        const original = rejection.original
        const validation = rejection.validation
        console.log(chalk.red(`   • "${validation.solution}" → "${validation.goal}"`))
        console.log(chalk.gray(`     Score: ${validation.overall_score}/100 - ${validation.reasoning}`))
      })

      if (summary.rejected_count > 5) {
        console.log(chalk.gray(`   ... and ${summary.rejected_count - 5} more`))
      }
    }

    // Warning for unusual rejection rates
    if (summary.rejection_rate > 60) {
      console.log(chalk.yellow(`\n⚠️  High rejection rate (${summary.rejection_rate.toFixed(1)}%) - consider lowering threshold`))
    } else if (summary.rejection_rate < 10 && summary.original_count > 5) {
      console.log(chalk.yellow(`\n⚠️  Low rejection rate (${summary.rejection_rate.toFixed(1)}%) - threshold might be too low`))
    }
  }

  /**
   * Perform quality assurance check on validation results
   */
  private async performQualityAssurance(results: LaughTestResult[], originalCount: number) {
    try {
      console.log(chalk.cyan(`\n🔍 Running quality assurance check...`))

      const prompt = createQualityAssurancePrompt(results, originalCount)
      const responseText = await this.geminiClient.generateContent(prompt)
      const qa = parseJSONSafely(responseText)

      console.log(chalk.cyan(`📋 Quality Assessment: ${qa.quality_assessment}`))

      if (qa.false_positives && qa.false_positives.length > 0) {
        console.log(chalk.yellow(`⚠️  Potential false positives: ${qa.false_positives.length}`))
      }

      if (qa.false_negatives && qa.false_negatives.length > 0) {
        console.log(chalk.red(`⚠️  Potential false negatives: ${qa.false_negatives.length}`))
      }

      if (qa.recommended_threshold_adjustment && qa.recommended_threshold_adjustment !== 70) {
        console.log(chalk.yellow(`💡 Suggested threshold: ${qa.recommended_threshold_adjustment}`))
      }

    } catch (error) {
      console.log(chalk.gray(`   QA check failed: ${error.message}`))
    }
  }

  /**
   * Create empty summary for edge cases
   */
  private createEmptySummary(): ValidationSummary {
    return {
      original_count: 0,
      passed_count: 0,
      rejected_count: 0,
      rejection_rate: 0,
      average_score: 0,
      passed_connections: [],
      rejected_connections: []
    }
  }

  /**
   * Get validation statistics for monitoring
   */
  getValidationStats(summary: ValidationSummary) {
    return {
      total: summary.original_count,
      passed: summary.passed_count,
      rejected: summary.rejected_count,
      rejection_rate: summary.rejection_rate,
      average_score: summary.average_score,
      quality_threshold_met: summary.rejection_rate >= 15 && summary.rejection_rate <= 50
    }
  }
}