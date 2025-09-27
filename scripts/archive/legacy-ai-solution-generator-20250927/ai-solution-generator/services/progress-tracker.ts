/**
 * Progress Tracker Service
 *
 * Manages quality-first expansion progress tracking with atomic claiming,
 * completion detection, and category-specific quality thresholds.
 */

import { createClient } from '@supabase/supabase-js'
import chalk from 'chalk'

export interface SolutionProgress {
  solution_id: string
  category: string
  connection_count: number
  last_processed_at?: Date
  attempts_count: number
  successful_connections: number
  rejection_rate?: number
  avg_effectiveness?: number
  status: 'pending' | 'in_progress' | 'completed' | 'exhausted'
  last_error?: string
  claimed_at?: Date
  claimed_by?: string
}

export interface CategoryStats {
  category: string
  total_solutions: number
  zero_connections: number
  single_connections: number
  double_connections: number
  completed_solutions: number
  coverage_percentage: number
  avg_effectiveness: number
  pending_count: number
}

export interface ExpansionBatch {
  solutions: SolutionProgress[]
  category: string
  priority_mode: 'zero' | 'single' | 'double'
  batch_size: number
}

export class ProgressTracker {
  private supabase: any
  private processId: string

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )
    this.processId = `expansion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Initialize progress tracking by refreshing materialized view
   */
  async initializeProgress(): Promise<void> {
    console.log(chalk.cyan('🔄 Refreshing solution coverage statistics...'))

    const { error } = await this.supabase.rpc('refresh_solution_coverage_stats')
    if (error) {
      throw new Error(`Failed to refresh coverage stats: ${error.message}`)
    }

    console.log(chalk.green('✅ Progress tracking initialized'))
  }

  /**
   * Get next batch of solutions for expansion based on priority
   */
  async claimNextBatch(
    category: string,
    priorityMode: 'zero' | 'single' | 'double' | 'auto',
    batchSize: number = 20
  ): Promise<ExpansionBatch | null> {

    // Determine connection count filter based on priority
    let connectionFilter: string
    let actualPriority: 'zero' | 'single' | 'double'

    if (priorityMode === 'auto') {
      // Auto mode: prioritize zero > single > double
      const zeroCount = await this.getAvailableCount(category, 'zero')
      const singleCount = await this.getAvailableCount(category, 'single')

      if (zeroCount > 0) {
        connectionFilter = 'connection_count = 0'
        actualPriority = 'zero'
      } else if (singleCount > 0) {
        connectionFilter = 'connection_count = 1'
        actualPriority = 'single'
      } else {
        connectionFilter = 'connection_count = 2'
        actualPriority = 'double'
      }
    } else {
      switch (priorityMode) {
        case 'zero':
          connectionFilter = 'connection_count = 0'
          actualPriority = 'zero'
          break
        case 'single':
          connectionFilter = 'connection_count = 1'
          actualPriority = 'single'
          break
        case 'double':
          connectionFilter = 'connection_count = 2'
          actualPriority = 'double'
          break
      }
    }

    console.log(chalk.cyan(`🎯 Claiming batch: ${category} (${actualPriority} connections, size: ${batchSize})`))

    // Atomic claim operation using row-level locking
    const { data, error } = await this.supabase.rpc('claim_expansion_batch', {
      p_category: category,
      p_connection_filter: connectionFilter,
      p_batch_size: batchSize,
      p_process_id: this.processId
    })

    if (error) {
      throw new Error(`Failed to claim batch: ${error.message}`)
    }

    if (!data || data.length === 0) {
      console.log(chalk.yellow(`⚠️  No available solutions for ${category} (${actualPriority} connections)`))
      return null
    }

    console.log(chalk.green(`✅ Claimed ${data.length} solutions for processing`))

    return {
      solutions: data,
      category,
      priority_mode: actualPriority,
      batch_size: data.length
    }
  }

  /**
   * Update progress after processing a solution
   */
  async updateProgress(
    solutionId: string,
    results: {
      successful_connections: number
      rejection_rate?: number
      avg_effectiveness?: number
      error?: string
    }
  ): Promise<void> {
    // First get current values to calculate updates
    const { data: current } = await this.supabase
      .from('expansion_progress')
      .select('attempts_count, connection_count')
      .eq('solution_id', solutionId)
      .single()

    const newAttemptsCount = (current?.attempts_count || 0) + 1
    const newConnectionCount = (current?.connection_count || 0) + results.successful_connections

    const updateData: any = {
      last_processed_at: new Date().toISOString(),
      attempts_count: newAttemptsCount,
      successful_connections: results.successful_connections,
      connection_count: newConnectionCount
    }

    if (results.rejection_rate !== undefined) {
      updateData.rejection_rate = results.rejection_rate
    }

    if (results.avg_effectiveness !== undefined) {
      updateData.avg_effectiveness = results.avg_effectiveness
    }

    if (results.error) {
      updateData.last_error = results.error
      updateData.status = 'pending' // Reset to pending if error occurred
    } else {
      // Determine new status based on connection count (we already have it)
      if (newConnectionCount > 2) {
        updateData.status = 'completed'
      } else if (results.rejection_rate && results.rejection_rate > 80) {
        updateData.status = 'exhausted'
      } else {
        updateData.status = 'pending'
      }
    }

    // Clear claim
    updateData.claimed_at = null
    updateData.claimed_by = null

    const { error } = await this.supabase
      .from('expansion_progress')
      .update(updateData)
      .eq('solution_id', solutionId)

    if (error) {
      throw new Error(`Failed to update progress: ${error.message}`)
    }
  }

  /**
   * Check if category expansion should continue based on quality thresholds
   */
  async shouldContinueExpansion(
    category: string,
    qualityThreshold: number = 70
  ): Promise<{ shouldContinue: boolean; reason: string }> {

    // Check coverage threshold (95% with ≥2 connections)
    const stats = await this.getCategoryStats(category)

    if (stats.coverage_percentage >= 95) {
      return {
        shouldContinue: false,
        reason: `Coverage target reached: ${stats.coverage_percentage.toFixed(1)}% ≥ 95%`
      }
    }

    // Check recent rejection rates (last 3 batches)
    const { data: recentBatches } = await this.supabase
      .from('expansion_progress')
      .select('rejection_rate')
      .eq('category', category)
      .not('rejection_rate', 'is', null)
      .order('last_processed_at', { ascending: false })
      .limit(60) // ~3 batches of 20

    if (recentBatches && recentBatches.length >= 30) {
      const avgRejectionRate = recentBatches.reduce((sum, batch) => sum + (batch.rejection_rate || 0), 0) / recentBatches.length

      if (avgRejectionRate > qualityThreshold) {
        return {
          shouldContinue: false,
          reason: `Quality threshold exceeded: ${avgRejectionRate.toFixed(1)}% > ${qualityThreshold}%`
        }
      }
    }

    // Check if any pending solutions remain
    const pendingCount = await this.getAvailableCount(category, 'zero') +
                        await this.getAvailableCount(category, 'single') +
                        await this.getAvailableCount(category, 'double')

    if (pendingCount === 0) {
      return {
        shouldContinue: false,
        reason: 'No pending solutions remain'
      }
    }

    return {
      shouldContinue: true,
      reason: `Continue: ${pendingCount} pending, ${stats.coverage_percentage.toFixed(1)}% coverage`
    }
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(category: string): Promise<CategoryStats> {
    const { data, error } = await this.supabase
      .from('expansion_progress')
      .select('connection_count, status')
      .eq('category', category)

    if (error) {
      throw new Error(`Failed to get category stats: ${error.message}`)
    }

    const total = data.length
    const zeroConnections = data.filter(s => s.connection_count === 0).length
    const singleConnections = data.filter(s => s.connection_count === 1).length
    const doubleConnections = data.filter(s => s.connection_count === 2).length
    const completed = data.filter(s => s.connection_count > 2).length
    const pending = data.filter(s => s.status === 'pending').length

    const coveragePercentage = total > 0 ? ((total - zeroConnections) / total) * 100 : 0

    // Get average effectiveness
    const { data: effectivenessData } = await this.supabase
      .from('expansion_progress')
      .select('avg_effectiveness')
      .eq('category', category)
      .not('avg_effectiveness', 'is', null)

    const avgEffectiveness = effectivenessData && effectivenessData.length > 0
      ? effectivenessData.reduce((sum, item) => sum + (item.avg_effectiveness || 0), 0) / effectivenessData.length
      : 0

    return {
      category,
      total_solutions: total,
      zero_connections: zeroConnections,
      single_connections: singleConnections,
      double_connections: doubleConnections,
      completed_solutions: completed,
      coverage_percentage: coveragePercentage,
      avg_effectiveness: avgEffectiveness,
      pending_count: pending
    }
  }

  /**
   * Get count of available solutions for a priority level
   */
  private async getAvailableCount(category: string, priority: 'zero' | 'single' | 'double'): Promise<number> {
    let connectionFilter: number
    switch (priority) {
      case 'zero': connectionFilter = 0; break
      case 'single': connectionFilter = 1; break
      case 'double': connectionFilter = 2; break
    }

    const { count, error } = await this.supabase
      .from('expansion_progress')
      .select('*', { count: 'exact', head: true })
      .eq('category', category)
      .eq('connection_count', connectionFilter)
      .eq('status', 'pending')

    if (error) {
      throw new Error(`Failed to get available count: ${error.message}`)
    }

    return count || 0
  }

  /**
   * Mark category as exhausted if no progress possible
   */
  async markCategoryExhausted(category: string, reason: string): Promise<void> {
    const { error } = await this.supabase
      .from('expansion_progress')
      .update({
        status: 'exhausted',
        last_error: reason,
        updated_at: new Date().toISOString()
      })
      .eq('category', category)
      .eq('status', 'pending')

    if (error) {
      throw new Error(`Failed to mark category exhausted: ${error.message}`)
    }

    console.log(chalk.yellow(`⚠️  Marked ${category} as exhausted: ${reason}`))
  }

  /**
   * Get overall platform progress summary
   */
  async getOverallProgress(): Promise<{
    totalSolutions: number
    zeroConnections: number
    singleConnections: number
    completedSolutions: number
    overallCoverage: number
    categoriesByPriority: CategoryStats[]
  }> {
    const { data, error } = await this.supabase
      .from('expansion_progress')
      .select('category, connection_count, status')

    if (error) {
      throw new Error(`Failed to get overall progress: ${error.message}`)
    }

    const categories = [...new Set(data.map(s => s.category))]
    const categoryStats = await Promise.all(
      categories.map(category => this.getCategoryStats(category))
    )

    const totalSolutions = data.length
    const zeroConnections = data.filter(s => s.connection_count === 0).length
    const singleConnections = data.filter(s => s.connection_count === 1).length
    const completedSolutions = data.filter(s => s.connection_count > 2).length
    const overallCoverage = totalSolutions > 0 ? ((totalSolutions - zeroConnections) / totalSolutions) * 100 : 0

    // Sort categories by priority (most zero connections first)
    categoryStats.sort((a, b) => b.zero_connections - a.zero_connections)

    return {
      totalSolutions,
      zeroConnections,
      singleConnections,
      completedSolutions,
      overallCoverage,
      categoriesByPriority: categoryStats
    }
  }
}