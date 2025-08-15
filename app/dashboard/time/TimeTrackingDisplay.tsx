'use client'

import { useEffect, useState } from 'react'
import { ArenaTimeService, type ArenaStats, type TimeSummary } from '@/lib/services/arena-time-service'
import { ArenaTimeTracker } from '@/lib/tracking/arena-time-tracker'

export function TimeTrackingDisplay() {
  const [stats, setStats] = useState<ArenaStats[]>([])
  const [summary, setSummary] = useState<TimeSummary | null>(null)
  const [loading, setLoading] = useState(true)
  
  const service = new ArenaTimeService()

  useEffect(() => {
    async function loadDashboardData() {
      // Auto-sync any pending data first
      const tracker = ArenaTimeTracker.getInstance()
      await tracker.checkAndSync()
      
      // Then fetch the latest data from database
      const [arenaStats, timeSummary] = await Promise.all([
        service.getUserArenaStats(),
        service.getUserTimeSummary()
      ])
      
      setStats(arenaStats)
      setSummary(timeSummary)
      setLoading(false)
    }
    
    loadDashboardData()
  }, [])

  if (loading) return <div>Loading your data...</div>

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Time</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{service.formatTime(summary.total_seconds)}</div>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
            <div className="text-sm text-gray-600 dark:text-gray-400">Most Visited</div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{summary.most_visited_arena || 'None yet'}</div>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
            <div className="text-sm text-gray-600 dark:text-gray-400">Areas Explored</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{summary.unique_arenas}</div>
          </div>
        </div>
      )}
      
      {/* Arena breakdown */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Time by Arena</h2>
        {stats.length > 0 ? (
          <div className="space-y-2">
            {stats.map(stat => (
              <div key={stat.arena_name} className="flex justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                <span className="text-gray-900 dark:text-gray-100">{stat.arena_name}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{service.formatTime(stat.total_seconds)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No tracking data yet. Start browsing to see your time investments!</p>
        )}
      </div>
    </div>
  )
}