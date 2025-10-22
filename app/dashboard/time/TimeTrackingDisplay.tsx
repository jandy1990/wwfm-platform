'use client'

import { useEffect, useState, useMemo } from 'react'
import { ArenaTimeService, type ArenaStats, type TimeSummary } from '@/lib/services/arena-time-service'
import { ArenaTimeTracker } from '@/lib/tracking/arena-time-tracker'
import { ArenaTimePieChart } from '@/components/charts/ArenaTimePieChart'
import { InfoTooltip } from '@/components/molecules/InfoTooltip'

type TimePeriod = 'all-time' | 'last-30-days'

export function TimeTrackingDisplay() {
  const [stats, setStats] = useState<ArenaStats[]>([])
  const [summary, setSummary] = useState<TimeSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all-time')

  const service = useMemo(() => new ArenaTimeService(), [])
  const INITIAL_DISPLAY_COUNT = 5

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true)

      // Auto-sync any pending data first
      const tracker = ArenaTimeTracker.getInstance()
      await tracker.checkAndSync()

      // Determine days parameter based on time period
      const days = timePeriod === 'last-30-days' ? 30 : undefined

      // Then fetch the latest data from database
      const [arenaStats, timeSummary] = await Promise.all([
        service.getUserArenaStats(days),
        service.getUserTimeSummary(days)
      ])

      setStats(arenaStats)
      setSummary(timeSummary)
      setLoading(false)
    }

    loadDashboardData()
  }, [service, timePeriod])

  // Calculate percentages for each arena
  const totalSeconds = stats.reduce((sum, stat) => sum + stat.total_seconds, 0)
  const getPercentage = (seconds: number) => {
    if (totalSeconds === 0) return 0
    return Math.round((seconds / totalSeconds) * 100)
  }

  // Get the max seconds for scaling progress bars
  const maxSeconds = stats.length > 0 ? Math.max(...stats.map(s => s.total_seconds)) : 0

  // Color palette for pie chart - using a nice, accessible color scheme
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280', // Gray
    '#14B8A6', // Teal
    '#F43F5E', // Rose
  ]

  // Prepare data for pie chart
  const pieChartData = stats.map((stat, index) => ({
    arena_name: stat.arena_name,
    total_seconds: stat.total_seconds,
    percentage: getPercentage(stat.total_seconds),
    color: colors[index % colors.length]
  })).filter(item => item.percentage > 0) // Only show arenas with time spent

  // Helper to determine if an arena name needs explanation
  const needsExplanation = (arenaName: string): string | null => {
    if (arenaName === 'General Browsing') {
      return 'Time spent on the main browse page viewing all arenas'
    }
    return null
  }

  if (loading) return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      <div className="space-y-3">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Time Period Toggle */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1">
          <button
            onClick={() => setTimePeriod('all-time')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              timePeriod === 'all-time'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimePeriod('last-30-days')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              timePeriod === 'last-30-days'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Time</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{service.formatTime(summary.total_seconds)}</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Most Visited</div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{summary.most_visited_arena || 'None yet'}</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Areas Explored</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{summary.unique_arenas}</div>
          </div>
        </div>
      )}
      
      {/* Arena breakdown */}
      {stats.length > 0 ? (
        <div className="space-y-4">
          {/* Pie Chart - Clickable */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Time Distribution</h3>
            <div
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setShowDetails(!showDetails)}
            >
              <ArenaTimePieChart
                data={pieChartData}
                formatTime={service.formatTime}
                size={280}
              />

              {/* Click hint */}
              <div className="mt-4 text-center">
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                  {showDetails ? '▲ Hide detailed breakdown' : '▼ Click for detailed breakdown'}
                </button>
              </div>
            </div>
          </div>

          {/* Detailed List - Expandable */}
          {showDetails && (
            <div className="animate-slideDown">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Detailed Breakdown</h3>
              <div className="space-y-3">
                {(showAll ? stats : stats.slice(0, INITIAL_DISPLAY_COUNT)).map(stat => {
                  const percentage = getPercentage(stat.total_seconds)
                  const isTopArena = summary?.most_visited_arena === stat.arena_name
                  const progressWidth = maxSeconds > 0 ? (stat.total_seconds / maxSeconds) * 100 : 0
                  const tooltipText = needsExplanation(stat.arena_name)

                  return (
                    <div key={stat.arena_name} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isTopArena ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                            {stat.arena_name}
                          </span>
                          {tooltipText && <InfoTooltip text={tooltipText} />}
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {service.formatTime(stat.total_seconds)}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            ({percentage}%)
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isTopArena
                              ? 'bg-blue-500 dark:bg-blue-400'
                              : 'bg-gray-400 dark:bg-gray-500'
                          }`}
                          style={{ width: `${progressWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Show More/Less Button */}
              {stats.length > INITIAL_DISPLAY_COUNT && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="mt-4 w-full py-2 px-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  {showAll ? '↑ Show Less' : `↓ Show ${stats.length - INITIAL_DISPLAY_COUNT} More`}
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-2 text-4xl">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No tracking data yet</h3>
          <p className="text-gray-600 dark:text-gray-400">Start browsing to see your time investments!</p>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 2000px;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}