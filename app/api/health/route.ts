import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/database/server'

/**
 * Health Check Endpoint
 *
 * **Purpose:**
 * Provides a simple endpoint for monitoring tools to verify the platform is operational.
 *
 * **What It Checks:**
 * 1. API endpoint is responding (if you get a response, Next.js is running)
 * 2. Database connectivity (can query Supabase)
 * 3. Authentication service (Supabase Auth responding)
 *
 * **Usage:**
 * - Uptime monitoring (UptimeRobot, Pingdom, etc.)
 * - Load balancer health checks
 * - CI/CD deployment verification
 * - Manual status checks: curl https://wwfm.com/api/health
 *
 * **Response Format:**
 * {
 *   "status": "healthy" | "degraded" | "unhealthy",
 *   "timestamp": "2025-11-02T10:30:00Z",
 *   "checks": {
 *     "database": "ok" | "error",
 *     "auth": "ok" | "error"
 *   },
 *   "version": "0.1.0"
 * }
 *
 * **Status Codes:**
 * - 200: healthy (all checks passed)
 * - 503: unhealthy (critical service down)
 * - 207: degraded (some checks failed but core working)
 */

export async function GET() {
  const startTime = Date.now()

  const checks: Record<string, string> = {}
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

  // Check 1: Database connectivity
  try {
    const supabase = await createServerSupabaseClient()

    // Simple query to verify database is responding
    const { data, error } = await supabase
      .from('goals')
      .select('id')
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows, which is fine for health check
      checks.database = `error: ${error.message}`
      overallStatus = 'unhealthy'
    } else {
      checks.database = 'ok'
    }
  } catch (error) {
    checks.database = `error: ${error instanceof Error ? error.message : 'unknown'}`
    overallStatus = 'unhealthy'
  }

  // Check 2: Auth service
  try {
    const supabase = await createServerSupabaseClient()

    // Verify auth service is responding (doesn't need to be logged in)
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      checks.auth = `error: ${error.message}`
      overallStatus = overallStatus === 'unhealthy' ? 'unhealthy' : 'degraded'
    } else {
      checks.auth = 'ok'
    }
  } catch (error) {
    checks.auth = `error: ${error instanceof Error ? error.message : 'unknown'}`
    overallStatus = overallStatus === 'unhealthy' ? 'unhealthy' : 'degraded'
  }

  const responseTime = Date.now() - startTime

  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks,
    responseTime: `${responseTime}ms`,
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'unknown'
  }

  // Return appropriate HTTP status code
  const statusCode =
    overallStatus === 'healthy' ? 200 :
    overallStatus === 'degraded' ? 207 :
    503

  return NextResponse.json(response, { status: statusCode })
}
