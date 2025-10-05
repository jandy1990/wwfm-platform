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
  daysAnalyzed: number
}

export default function ArenaValueInsights({
  insights,
  daysAnalyzed
}: ArenaValueInsightsProps) {
  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Time Allocation & Long-term Value Data
        </h2>
        <p className="text-gray-600 text-sm">
          Track time across different life arenas to see data about time
          allocation and AI-estimated long-term value scores.
        </p>
      </div>
    )
  }

  const totalGoals = insights.reduce((sum, i) => sum + i.goal_count, 0)

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Time Allocation & Long-term Value Data
        </h2>
        <p className="text-sm text-gray-600">
          Your time spent across arenas (last {daysAnalyzed} days) alongside AI-estimated long-term impact scores
        </p>
      </div>

      <div className="p-6 space-y-4">
        {/* AI Data Source Notice - Prominent at top */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">AI-Generated Value Scores</p>
            <p className="text-blue-800">
              Long-term value scores are currently based on AI training data patterns.
              These will transition to human retrospective data after 10 user reports per goal.
              Based on {totalGoals} goals across these arenas.
            </p>
          </div>
        </div>

        {/* Simple data display - all arenas */}
        <div className="space-y-2">
          {insights.map(insight => (
            <InsightRow key={insight.arena_id} insight={insight} />
          ))}
        </div>
      </div>
    </div>
  )
}

function InsightRow({ insight }: { insight: ArenaValueInsight }) {
  const hours = Math.floor(insight.seconds_spent / 3600)
  const minutes = Math.floor((insight.seconds_spent % 3600) / 60)

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900">
          {insight.arena_name}
        </h4>
        <p className="text-xs text-gray-500">
          {hours}h {minutes}m · {insight.goal_count} goals
        </p>
      </div>

      <div className="flex items-center gap-4 text-right">
        <div>
          <div className="text-sm font-semibold text-gray-900">
            {insight.time_percentage}%
          </div>
          <div className="text-xs text-gray-500">time</div>
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-900">
            {insight.avg_lasting_value.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">value</div>
        </div>
      </div>
    </div>
  )
}
