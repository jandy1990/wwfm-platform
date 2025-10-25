'use server'

/**
 * Arena Value Insights
 *
 * Fetches user's time allocation across arenas alongside AI-estimated
 * long-term value scores. Presents data neutrally for user interpretation.
 */

import { getServiceSupabaseClient } from '@/lib/database'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface ArenaValueInsight {
  arena_id: string
  arena_name: string
  time_percentage: number
  seconds_spent: number
  avg_lasting_value: number
  goal_count: number
}

interface ArenaTimeData {
  arena_id: string
  arena_name: string
  total_seconds: number
}

interface ArenaValueData {
  arena_id: string
  avg_lasting_value: number
  goal_count: number
}

export async function getArenaValueInsights(
  userId: string,
  daysToAnalyze?: number
): Promise<ArenaValueInsight[]> {
  const supabase = getServiceSupabaseClient()
  const db = supabase as unknown as SupabaseClient<any>

  // 1. Fetch user's arena time data (all-time by default, or filtered by days)
  let query = db
    .from('user_arena_time')
    .select('arena_id, arena_name, seconds_spent')
    .eq('user_id', userId)

  // Only apply date filter if daysToAnalyze is explicitly provided
  if (daysToAnalyze) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToAnalyze)
    query = query.gte('date', cutoffDate.toISOString().split('T')[0])
  }

  const { data: timeData, error: timeError } = await query

  if (timeError) {
    console.error('Error fetching arena time data:', timeError)
    return []
  }

  const normalizedTimeData =
    (timeData as Array<{ arena_id: string; arena_name: string; seconds_spent: number }> | null) ?? []

  if (normalizedTimeData.length === 0) {
    return []
  }

  // 2. Aggregate time by arena
  const arenaTimeMap = new Map<string, ArenaTimeData>()
  let totalSeconds = 0

  for (const entry of normalizedTimeData) {
    const existing = arenaTimeMap.get(entry.arena_id)
    if (existing) {
      existing.total_seconds += entry.seconds_spent
    } else {
      arenaTimeMap.set(entry.arena_id, {
        arena_id: entry.arena_id,
        arena_name: entry.arena_name,
        total_seconds: entry.seconds_spent
      })
    }
    totalSeconds += entry.seconds_spent
  }

  // 3. Fetch arena value scores (average lasting_value_score per arena)
  const { data: valueData, error: valueError } = await db.rpc(
    'get_arena_value_scores'
  )

  if (valueError) {
    console.error('Error fetching arena value scores:', valueError)
    // If RPC doesn't exist, fall back to manual query
    const { data: manualValueDataRaw, error: manualError } = await db
      .from('arenas')
      .select(`
        id,
        goals!inner (
          goal_wisdom_scores!inner (
            lasting_value_score
          )
        )
      `)

    if (manualError) {
      console.error('Error with manual arena value query:', manualError)
      return []
    }

    const manualValueData = (manualValueDataRaw as any[]) ?? []

    // Process manual data
    const arenaValueMap = new Map<string, ArenaValueData>()
    manualValueData.forEach((arena: any) => {
      const goals: any[] = Array.isArray(arena?.goals) ? arena.goals : arena?.goals ? [arena.goals] : []
      const scores: number[] = []
      goals.forEach(goal => {
        const wisdomScores: any[] = Array.isArray(goal?.goal_wisdom_scores)
          ? goal.goal_wisdom_scores
          : goal?.goal_wisdom_scores
          ? [goal.goal_wisdom_scores]
          : []
        wisdomScores.forEach(wisdom => {
          const score = Number(wisdom?.lasting_value_score)
          if (!Number.isNaN(score)) {
            scores.push(score)
          }
        })
      })

      if (scores.length === 0) return
      const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length
      arenaValueMap.set(String(arena.id), {
        arena_id: String(arena.id),
        avg_lasting_value: avg,
        goal_count: scores.length
      })
    })

    return buildInsights(arenaTimeMap, arenaValueMap, totalSeconds)
  }

  // Process RPC results
  const arenaValueMap = new Map<string, ArenaValueData>()
  for (const row of valueData || []) {
    arenaValueMap.set(row.arena_id, {
      arena_id: row.arena_id,
      avg_lasting_value: row.avg_lasting_value,
      goal_count: row.goal_count
    })
  }

  return buildInsights(arenaTimeMap, arenaValueMap, totalSeconds)
}

function buildInsights(
  arenaTimeMap: Map<string, ArenaTimeData>,
  arenaValueMap: Map<string, ArenaValueData>,
  totalSeconds: number
): ArenaValueInsight[] {
  const insights: ArenaValueInsight[] = []

  // Combine time and value data
  for (const [arenaId, timeData] of Array.from(arenaTimeMap.entries())) {
    const valueData = arenaValueMap.get(arenaId)

    if (!valueData) {
      // Arena has time data but no value scores yet
      continue
    }

    const timePercentage = (timeData.total_seconds / totalSeconds) * 100

    insights.push({
      arena_id: arenaId,
      arena_name: timeData.arena_name,
      time_percentage: Math.round(timePercentage * 10) / 10,
      seconds_spent: timeData.total_seconds,
      avg_lasting_value: Math.round(valueData.avg_lasting_value * 10) / 10,
      goal_count: valueData.goal_count
    })
  }

  // Sort by time percentage (descending)
  return insights.sort((a, b) => b.time_percentage - a.time_percentage)
}
