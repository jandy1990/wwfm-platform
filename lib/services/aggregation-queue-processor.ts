/**
 * Background Aggregation Queue Processor
 *
 * Processes queued aggregation jobs to prevent blocking rating submissions
 * Called by cron job or API endpoint every few minutes
 */

import { createServerSupabaseClient } from '@/lib/database/server'
import { solutionAggregator } from './solution-aggregator'

export class AggregationQueueProcessor {
  private processing = false
  private maxConcurrent = 5
  private maxRetries = 3

  /**
   * Process pending aggregation jobs
   */
  async processPendingJobs(): Promise<{
    processed: number
    failed: number
    errors: string[]
  }> {
    if (this.processing) {
      console.log('[Queue] Already processing, skipping...')
      return { processed: 0, failed: 0, errors: [] }
    }

    this.processing = true
    let processed = 0
    let failed = 0
    const errors: string[] = []

    try {
      const supabase = await createServerSupabaseClient()

      // Get pending jobs (not currently processing)
      const { data: jobs, error } = await supabase
        .from('aggregation_queue')
        .select('goal_id, implementation_id, attempts, queued_at')
        .eq('processing', false)
        .order('queued_at', { ascending: true })
        .limit(this.maxConcurrent)

      if (error) {
        console.error('[Queue] Error fetching jobs:', error)
        return { processed: 0, failed: 1, errors: [error.message] }
      }

      if (!jobs || jobs.length === 0) {
        console.log('[Queue] No pending jobs')
        return { processed: 0, failed: 0, errors: [] }
      }

      console.log(`[Queue] Processing ${jobs.length} jobs`)

      // Process jobs concurrently
      const promises = jobs.map(job =>
        this.processJob(
          job.goal_id,
          job.implementation_id,
          job.attempts ?? 0
        )
      )
      const results = await Promise.allSettled(promises)

      // Count results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          processed++
        } else {
          failed++
          const jobInfo = `${jobs[index].goal_id}/${jobs[index].implementation_id}`
          errors.push(`Job ${jobInfo}: ${result.reason}`)
        }
      })

      console.log(`[Queue] Completed: ${processed} processed, ${failed} failed`)
      return { processed, failed, errors }

    } catch (error) {
      console.error('[Queue] Unexpected error:', error)
      return { processed: 0, failed: 1, errors: [String(error)] }
    } finally {
      this.processing = false
    }
  }

  /**
   * Process a single aggregation job
   */
  private async processJob(goalId: string, implementationId: string, currentAttempts: number): Promise<void> {
    const supabase = await createServerSupabaseClient()

    try {
      // Mark as processing
      const { error: markError } = await supabase
        .from('aggregation_queue')
        .update({ processing: true, last_error: null })
        .eq('goal_id', goalId)
        .eq('implementation_id', implementationId)

      if (markError) {
        throw new Error(`Failed to mark job as processing: ${markError.message}`)
      }

      console.log(`[Queue] Processing aggregation for ${goalId}/${implementationId}`)

      // Run the aggregation
      await solutionAggregator.updateAggregatesAfterRating(goalId, implementationId)

      // Remove from queue on success
      const { error: deleteError } = await supabase
        .from('aggregation_queue')
        .delete()
        .eq('goal_id', goalId)
        .eq('implementation_id', implementationId)

      if (deleteError) {
        console.error(`[Queue] Warning: Failed to remove completed job: ${deleteError.message}`)
      }

      console.log(`[Queue] Successfully processed ${goalId}/${implementationId}`)

    } catch (error) {
      console.error(`[Queue] Error processing ${goalId}/${implementationId}:`, error)

      // Increment attempts and update error
      const { error: updateError } = await supabase
        .from('aggregation_queue')
        .update({
          processing: false,
          attempts: currentAttempts + 1,
          last_error: String(error)
        })
        .eq('goal_id', goalId)
        .eq('implementation_id', implementationId)

      if (updateError) {
        console.error(`[Queue] Failed to update job error: ${updateError.message}`)
      }

      // Remove jobs that have exceeded max retries
      const { data: jobCheck } = await supabase
        .from('aggregation_queue')
        .select('attempts')
        .eq('goal_id', goalId)
        .eq('implementation_id', implementationId)
        .single()

      if (jobCheck && jobCheck.attempts >= this.maxRetries) {
        console.error(`[Queue] Job ${goalId}/${implementationId} exceeded max retries, removing`)
        await supabase
          .from('aggregation_queue')
          .delete()
          .eq('goal_id', goalId)
          .eq('implementation_id', implementationId)
      }

      throw error
    }
  }

  /**
   * Check queue health and return metrics
   */
  async getQueueMetrics(): Promise<{
    pending: number
    processing: number
    oldestJob?: string
    averageAge: number
  }> {
    const supabase = await createServerSupabaseClient()

    const { data: metrics } = await supabase
      .from('aggregation_queue')
      .select('processing, queued_at')

    if (!metrics) {
      return { pending: 0, processing: 0, averageAge: 0 }
    }

    const pending = metrics.filter(m => !m.processing).length
    const processing = metrics.filter(m => m.processing).length

    const ages = metrics.map(m => Date.now() - new Date(m.queued_at).getTime())
    const averageAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0

    const oldestJob = ages.length > 0 ?
      new Date(Date.now() - Math.max(...ages)).toISOString() : undefined

    return {
      pending,
      processing,
      oldestJob,
      averageAge: Math.round(averageAge / 1000) // seconds
    }
  }

  /**
   * Force process a specific job (for debugging)
   */
  async forceProcessJob(goalId: string, implementationId: string): Promise<boolean> {
    try {
      const supabase = await createServerSupabaseClient()
      const { data: jobRecord } = await supabase
        .from('aggregation_queue')
        .select('attempts')
        .eq('goal_id', goalId)
        .eq('implementation_id', implementationId)
        .single()

      await this.processJob(goalId, implementationId, jobRecord?.attempts ?? 0)
      return true
    } catch (error) {
      console.error(`[Queue] Force process failed:`, error)
      return false
    }
  }

  /**
   * Clear stuck jobs (processing = true for > 5 minutes)
   */
  async clearStuckJobs(): Promise<number> {
    const supabase = await createServerSupabaseClient()
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { data: stuckJobs } = await supabase
      .from('aggregation_queue')
      .update({ processing: false })
      .eq('processing', true)
      .lt('queued_at', fiveMinutesAgo)
      .select('goal_id')

    console.log(`[Queue] Cleared ${stuckJobs?.length || 0} stuck jobs`)
    return stuckJobs?.length || 0
  }
}

// Export singleton instance
export const aggregationQueueProcessor = new AggregationQueueProcessor()
