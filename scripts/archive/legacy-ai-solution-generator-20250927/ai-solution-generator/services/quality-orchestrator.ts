/**
 * Quality Check Orchestrator
 * 
 * Manages the hybrid Gemini generation + Claude quality check pipeline
 * Monitors progress, triggers checks, and tracks costs
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { ClaudeQualityChecker } from './claude-quality-checker'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'

// Configuration for triggers and limits
export interface OrchestratorConfig {
  batchSize: number           // Solutions per Claude check (default: 100)
  triggerThreshold: number    // Trigger check after N pending solutions
  timeInterval: number        // Regular check interval in hours
  qualityThreshold: number    // Trigger if quality drops below %
  dailyCostLimit: number      // Maximum daily spend in USD
  enableAutoTriggers: boolean // Enable automatic quality checks
}

// Metrics for monitoring
export interface QualityMetrics {
  pendingCount: number
  passedCount: number
  fixedCount: number
  failedCount: number
  avgConversationScore: number
  avgEvidenceScore: number
  avgAccessibilityScore: number
  avgExpectationScore: number
  avgCategoryAccuracy: number
  overallQuality: number
}

export interface CostMetrics {
  todaySpend: number
  weekSpend: number
  monthSpend: number
  avgCostPerSolution: number
  projectedMonthlySpend: number
}

export interface ProcessingMetrics {
  solutionsPerHour: number
  avgProcessingTime: number
  estimatedTimeRemaining: string
  batchesProcessedToday: number
}

export class QualityOrchestrator {
  private supabase: SupabaseClient
  private qualityChecker: ClaudeQualityChecker
  private config: OrchestratorConfig
  private isRunning: boolean = false
  private lastCheckTime: Date = new Date()
  private metricsCache: QualityMetrics | null = null
  private costTrackerPath: string
  
  constructor(
    supabase: SupabaseClient,
    claudeApiKey: string,
    config?: Partial<OrchestratorConfig>
  ) {
    this.supabase = supabase
    this.qualityChecker = new ClaudeQualityChecker(claudeApiKey, supabase)
    
    // Default configuration
    this.config = {
      batchSize: 100,
      triggerThreshold: 100,
      timeInterval: 6,
      qualityThreshold: 80,
      dailyCostLimit: 10.0,
      enableAutoTriggers: true,
      ...config
    }
    
    // Cost tracking file
    this.costTrackerPath = path.join(process.cwd(), '.quality-cost-tracker.json')
  }

  /**
   * Start the orchestrator
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log(chalk.yellow('⚠️ Orchestrator is already running'))
      return
    }
    
    this.isRunning = true
    console.log(chalk.cyan('🎯 Quality Orchestrator Started'))
    console.log(chalk.gray(`   Configuration: ${JSON.stringify(this.config, null, 2)}`))
    
    // Main orchestration loop
    while (this.isRunning) {
      try {
        // Check if we should trigger quality check
        if (await this.shouldTriggerCheck()) {
          await this.runQualityCheck()
        }
        
        // Update metrics
        await this.updateMetrics()
        
        // Display status
        await this.displayStatus()
        
        // Wait before next check (5 minutes)
        await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000))
        
      } catch (error: any) {
        console.error(chalk.red('❌ Orchestrator error:'), error.message)
        // Continue running despite errors
        await new Promise(resolve => setTimeout(resolve, 60000))
      }
    }
  }

  /**
   * Stop the orchestrator
   */
  stop(): void {
    this.isRunning = false
    console.log(chalk.yellow('🛑 Orchestrator stopped'))
  }

  /**
   * Determine if we should trigger a quality check
   */
  async shouldTriggerCheck(): Promise<boolean> {
    if (!this.config.enableAutoTriggers) {
      return false
    }
    
    // Check cost limit
    const todaysCost = await this.getTodaysCost()
    if (todaysCost >= this.config.dailyCostLimit) {
      console.log(chalk.yellow(`⚠️ Daily cost limit reached: $${todaysCost.toFixed(2)}/$${this.config.dailyCostLimit}`))
      return false
    }
    
    // Get metrics
    const metrics = await this.getQualityMetrics()
    
    // Trigger conditions
    const triggers = {
      pendingThreshold: metrics.pendingCount >= this.config.triggerThreshold,
      timeInterval: this.hoursSinceLastCheck() >= this.config.timeInterval,
      qualityDrop: metrics.overallQuality < this.config.qualityThreshold && metrics.overallQuality > 0
    }
    
    // Log trigger status
    if (triggers.pendingThreshold) {
      console.log(chalk.blue(`📊 Trigger: ${metrics.pendingCount} pending solutions (threshold: ${this.config.triggerThreshold})`))
    }
    if (triggers.timeInterval) {
      console.log(chalk.blue(`⏰ Trigger: ${this.hoursSinceLastCheck().toFixed(1)} hours since last check`))
    }
    if (triggers.qualityDrop) {
      console.log(chalk.orange(`⚠️ Trigger: Quality dropped to ${metrics.overallQuality.toFixed(1)}%`))
    }
    
    return triggers.pendingThreshold || triggers.timeInterval || triggers.qualityDrop
  }

  /**
   * Run a quality check batch
   */
  async runQualityCheck(): Promise<void> {
    console.log(chalk.cyan('\n🔍 Running Quality Check Batch...'))
    
    // Get pending solutions
    const solutions = await this.qualityChecker.getPendingSolutions(this.config.batchSize)
    
    if (solutions.length === 0) {
      console.log(chalk.gray('   No pending solutions to check'))
      return
    }
    
    console.log(chalk.blue(`   Checking ${solutions.length} solutions...`))
    
    // Run quality check
    const report = await this.qualityChecker.checkBatch(solutions)
    
    // Apply fixes
    await this.qualityChecker.applyFixes(report)
    
    // Track cost
    await this.trackCost(report.costEstimate)
    
    // Update last check time
    this.lastCheckTime = new Date()
    
    // Log results
    console.log(chalk.green(`✅ Quality check complete!`))
    console.log(chalk.gray(`   Passed: ${report.summary.passed}`))
    console.log(chalk.gray(`   Fixed: ${report.summary.fixed}`))
    console.log(chalk.gray(`   Failed: ${report.summary.failed}`))
    console.log(chalk.yellow(`   Cost: $${report.costEstimate.toFixed(4)}`))
    
    // Show common issues
    if (report.summary.commonIssues.length > 0) {
      console.log(chalk.cyan('\n   Common issues found:'))
      report.summary.commonIssues.forEach(issue => {
        console.log(chalk.gray(`     • ${issue}`))
      })
    }
  }

  /**
   * Get current quality metrics
   */
  async getQualityMetrics(): Promise<QualityMetrics> {
    const { data, error } = await this.supabase
      .from('quality_metrics')
      .select('*')
      .single()
    
    if (error || !data) {
      // Return default metrics if view doesn't exist yet
      return {
        pendingCount: 0,
        passedCount: 0,
        fixedCount: 0,
        failedCount: 0,
        avgConversationScore: 0,
        avgEvidenceScore: 0,
        avgAccessibilityScore: 0,
        avgExpectationScore: 0,
        avgCategoryAccuracy: 0,
        overallQuality: 0
      }
    }
    
    // Calculate overall quality score
    const overallQuality = (
      (data.avg_conversation_score || 0) * 0.3 +
      (data.avg_evidence_score || 0) * 0.25 +
      (data.avg_accessibility_score || 0) * 0.2 +
      (data.avg_expectation_score || 0) * 0.15 +
      (data.avg_category_accuracy || 0) * 0.1
    )
    
    return {
      pendingCount: data.pending_count || 0,
      passedCount: data.passed_count || 0,
      fixedCount: data.fixed_count || 0,
      failedCount: data.failed_count || 0,
      avgConversationScore: data.avg_conversation_score || 0,
      avgEvidenceScore: data.avg_evidence_score || 0,
      avgAccessibilityScore: data.avg_accessibility_score || 0,
      avgExpectationScore: data.avg_expectation_score || 0,
      avgCategoryAccuracy: data.avg_category_accuracy || 0,
      overallQuality
    }
  }

  /**
   * Get cost metrics
   */
  async getCostMetrics(): Promise<CostMetrics> {
    // Load cost tracking data
    const costData = this.loadCostData()
    
    // Calculate metrics
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const todaySpend = costData[today] || 0
    const weekSpend = Object.entries(costData)
      .filter(([date]) => date >= weekAgo)
      .reduce((sum, [, cost]) => sum + cost, 0)
    const monthSpend = Object.entries(costData)
      .filter(([date]) => date >= monthAgo)
      .reduce((sum, [, cost]) => sum + cost, 0)
    
    // Get total solutions checked
    const { data: batchData } = await this.supabase
      .from('quality_check_batches')
      .select('solutions_checked, estimated_cost')
    
    const totalSolutions = batchData?.reduce((sum, b) => sum + (b.solutions_checked || 0), 0) || 0
    const totalCost = batchData?.reduce((sum, b) => sum + (b.estimated_cost || 0), 0) || 0
    const avgCostPerSolution = totalSolutions > 0 ? totalCost / totalSolutions : 0
    
    // Project monthly spend based on recent average
    const daysWithData = Object.keys(costData).length
    const avgDailySpend = daysWithData > 0 ? monthSpend / Math.min(daysWithData, 30) : 0
    const projectedMonthlySpend = avgDailySpend * 30
    
    return {
      todaySpend,
      weekSpend,
      monthSpend,
      avgCostPerSolution,
      projectedMonthlySpend
    }
  }

  /**
   * Get processing metrics
   */
  async getProcessingMetrics(): Promise<ProcessingMetrics> {
    // Get recent batches
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recentBatches } = await this.supabase
      .from('quality_check_batches')
      .select('*')
      .gte('created_at', oneDayAgo)
      .order('created_at', { ascending: false })
    
    if (!recentBatches || recentBatches.length === 0) {
      return {
        solutionsPerHour: 0,
        avgProcessingTime: 0,
        estimatedTimeRemaining: 'Unknown',
        batchesProcessedToday: 0
      }
    }
    
    // Calculate metrics
    const batchesProcessedToday = recentBatches.length
    const totalSolutionsToday = recentBatches.reduce((sum, b) => sum + (b.solutions_checked || 0), 0)
    const hoursElapsed = Math.max(1, (Date.now() - new Date(recentBatches[recentBatches.length - 1].created_at).getTime()) / (1000 * 60 * 60))
    const solutionsPerHour = totalSolutionsToday / hoursElapsed
    
    // Average processing time per batch
    const avgProcessingTime = recentBatches.reduce((sum, b) => sum + (b.processing_time_ms || 0), 0) / recentBatches.length
    
    // Estimate time remaining
    const metrics = await this.getQualityMetrics()
    const remainingSolutions = metrics.pendingCount
    const hoursRemaining = solutionsPerHour > 0 ? remainingSolutions / solutionsPerHour : 0
    
    let estimatedTimeRemaining: string
    if (hoursRemaining === 0) {
      estimatedTimeRemaining = 'Complete'
    } else if (hoursRemaining < 1) {
      estimatedTimeRemaining = `${Math.round(hoursRemaining * 60)} minutes`
    } else if (hoursRemaining < 24) {
      estimatedTimeRemaining = `${Math.round(hoursRemaining)} hours`
    } else {
      estimatedTimeRemaining = `${Math.round(hoursRemaining / 24)} days`
    }
    
    return {
      solutionsPerHour: Math.round(solutionsPerHour),
      avgProcessingTime: Math.round(avgProcessingTime),
      estimatedTimeRemaining,
      batchesProcessedToday
    }
  }

  /**
   * Update cached metrics
   */
  private async updateMetrics(): Promise<void> {
    this.metricsCache = await this.getQualityMetrics()
  }

  /**
   * Display current status
   */
  private async displayStatus(): Promise<void> {
    const metrics = await this.getQualityMetrics()
    const costMetrics = await this.getCostMetrics()
    const processingMetrics = await this.getProcessingMetrics()
    
    console.log(chalk.cyan('\n📊 Quality Pipeline Status'))
    console.log(chalk.gray('─'.repeat(50)))
    
    // Quality metrics
    console.log(chalk.white('Quality Metrics:'))
    console.log(chalk.gray(`  Pending: ${metrics.pendingCount} | Passed: ${metrics.passedCount} | Fixed: ${metrics.fixedCount} | Failed: ${metrics.failedCount}`))
    console.log(chalk.gray(`  Overall Quality: ${metrics.overallQuality.toFixed(1)}%`))
    console.log(chalk.gray(`  Conversation: ${metrics.avgConversationScore.toFixed(1)}% | Evidence: ${metrics.avgEvidenceScore.toFixed(1)}%`))
    console.log(chalk.gray(`  Accessibility: ${metrics.avgAccessibilityScore.toFixed(1)}% | Expectations: ${metrics.avgExpectationScore.toFixed(1)}%`))
    
    // Cost metrics
    console.log(chalk.white('\nCost Metrics:'))
    console.log(chalk.gray(`  Today: $${costMetrics.todaySpend.toFixed(2)} | Week: $${costMetrics.weekSpend.toFixed(2)} | Month: $${costMetrics.monthSpend.toFixed(2)}`))
    console.log(chalk.gray(`  Avg per solution: $${costMetrics.avgCostPerSolution.toFixed(4)}`))
    console.log(chalk.gray(`  Projected monthly: $${costMetrics.projectedMonthlySpend.toFixed(2)}`))
    
    // Processing metrics
    console.log(chalk.white('\nProcessing Metrics:'))
    console.log(chalk.gray(`  Speed: ${processingMetrics.solutionsPerHour} solutions/hour`))
    console.log(chalk.gray(`  Batches today: ${processingMetrics.batchesProcessedToday}`))
    console.log(chalk.gray(`  Est. time remaining: ${processingMetrics.estimatedTimeRemaining}`))
    
    console.log(chalk.gray('─'.repeat(50)))
  }

  /**
   * Hours since last quality check
   */
  private hoursSinceLastCheck(): number {
    return (Date.now() - this.lastCheckTime.getTime()) / (1000 * 60 * 60)
  }

  /**
   * Track cost for the day
   */
  private async trackCost(cost: number): Promise<void> {
    const costData = this.loadCostData()
    const today = new Date().toISOString().split('T')[0]
    costData[today] = (costData[today] || 0) + cost
    this.saveCostData(costData)
  }

  /**
   * Get today's total cost
   */
  private async getTodaysCost(): Promise<number> {
    const costData = this.loadCostData()
    const today = new Date().toISOString().split('T')[0]
    return costData[today] || 0
  }

  /**
   * Load cost tracking data
   */
  private loadCostData(): Record<string, number> {
    try {
      if (fs.existsSync(this.costTrackerPath)) {
        return JSON.parse(fs.readFileSync(this.costTrackerPath, 'utf-8'))
      }
    } catch (error) {
      console.error(chalk.red('Error loading cost data:'), error)
    }
    return {}
  }

  /**
   * Save cost tracking data
   */
  private saveCostData(data: Record<string, number>): void {
    try {
      fs.writeFileSync(this.costTrackerPath, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error(chalk.red('Error saving cost data:'), error)
    }
  }

  /**
   * Run a single quality check batch (for testing)
   */
  async runSingleBatch(): Promise<void> {
    await this.runQualityCheck()
  }

  /**
   * Get dashboard data for monitoring
   */
  async getDashboardData() {
    return {
      quality: await this.getQualityMetrics(),
      cost: await this.getCostMetrics(),
      processing: await this.getProcessingMetrics(),
      config: this.config,
      isRunning: this.isRunning,
      lastCheckTime: this.lastCheckTime
    }
  }
}