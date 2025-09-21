/**
 * API endpoint for processing aggregation queue
 *
 * Called by cron job every 5 minutes to process background aggregation jobs
 * Can also be called manually for debugging
 */

import { NextRequest, NextResponse } from 'next/server'
import { aggregationQueueProcessor } from '@/lib/services/aggregation-queue-processor'

export async function POST(request: NextRequest) {
  try {
    // Optional: Add simple auth token for cron job security
    const authToken = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET_TOKEN

    if (expectedToken && authToken !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[Cron] Starting aggregation queue processing...')

    // Clear any stuck jobs first
    const clearedJobs = await aggregationQueueProcessor.clearStuckJobs()

    // Process pending jobs
    const result = await aggregationQueueProcessor.processPendingJobs()

    // Get queue metrics
    const metrics = await aggregationQueueProcessor.getQueueMetrics()

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      result: {
        processed: result.processed,
        failed: result.failed,
        clearedStuckJobs: clearedJobs
      },
      queueMetrics: metrics,
      errors: result.errors
    }

    console.log('[Cron] Queue processing completed:', response)

    return NextResponse.json(response)

  } catch (error) {
    console.error('[Cron] Queue processing failed:', error)

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        error: String(error)
      },
      { status: 500 }
    )
  }
}

// Also allow GET for manual testing/monitoring
export async function GET() {
  try {
    const metrics = await aggregationQueueProcessor.getQueueMetrics()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      queueMetrics: metrics
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error)
      },
      { status: 500 }
    )
  }
}