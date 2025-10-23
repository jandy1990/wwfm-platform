'use client'

/**
 * Arena Value Insights Component
 *
 * Displays user's time allocation across arenas alongside AI-estimated
 * long-term value scores. Presents data neutrally for user interpretation.
 */

import { ArenaValueInsight } from '@/app/actions/get-arena-value-insights'
import { Info } from 'lucide-react'

interface ArenaValueInsightsProps {
  insights: ArenaValueInsight[]
  daysAnalyzed?: number
}

export default function ArenaValueInsights({
  insights,
  daysAnalyzed
}: ArenaValueInsightsProps) {
  const timePeriod = daysAnalyzed ? `last ${daysAnalyzed} days` : 'all time'
  if (insights.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100">
          Time & Long-term Value by Arena
        </h2>
      </div>
    )
  }

  const totalGoals = insights.reduce((sum, i) => sum + i.goal_count, 0)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border-2 border-gray-300 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100">
          Time & Long-term Value by Arena
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {insights.map(insight => (
          <InsightRow key={insight.arena_id} insight={insight} />
        ))}

        {/* Subtle data source note */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Long-term value ratings based on AI training data until 10+ user retrospectives per goal
          </p>
        </div>
      </div>
    </div>
  )
}

function InsightRow({ insight }: { insight: ArenaValueInsight }) {
  const hours = Math.floor(insight.seconds_spent / 3600)
  const minutes = Math.floor((insight.seconds_spent % 3600) / 60)

  // Calculate value percentage (out of 5)
  const valuePercentage = (insight.avg_lasting_value / 5) * 100

  return (
    <div>
      {/* Arena name and meta */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {insight.arena_name}
        </h4>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {insight.goal_count} {insight.goal_count === 1 ? 'goal' : 'goals'}
        </span>
      </div>

      {/* Time bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600 dark:text-gray-400">Time</span>
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
            {hours}h {minutes}m ({insight.time_percentage}%)
          </span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-purple-500 dark:bg-purple-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${insight.time_percentage}%` }}
          />
        </div>
      </div>

      {/* Long-term Value bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600 dark:text-gray-400">Long-term Value</span>
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
            {insight.avg_lasting_value.toFixed(1)}/5
          </span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${valuePercentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}
