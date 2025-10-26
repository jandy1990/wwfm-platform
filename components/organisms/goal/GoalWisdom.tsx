'use client'

import { GoalWisdomScore } from '@/types/retrospectives'
import { useState } from 'react'
import { DataSourceBadge } from '@/components/molecules/DataSourceBadge'
import WisdomBenefitCards from './WisdomBenefitCards'

interface Props {
  goalId: string
  wisdom: GoalWisdomScore | null
  minResponses?: number
}

/**
 * Displays retrospective wisdom data from users who achieved this goal 6+ months ago
 * Shows single lasting_value_score (1-5) with expandable unexpected benefits
 * Clearly marks AI-generated data that transitions to human data at 10 retrospectives
 */
export default function GoalWisdom({ goalId, wisdom, minResponses = 1 }: Props) {
  const [isExpanded, setIsExpanded] = useState(false) // MUST default to false for compact view

  // Don't show if insufficient data
  if (!wisdom || wisdom.total_retrospectives < minResponses) {
    return null
  }

  const lastingValue = wisdom.lasting_value_score || 0
  const isAIGenerated = wisdom.total_retrospectives < 10 // Before transition threshold

  // Determine sentiment styling
  const getSentiment = (value: number) => {
    if (value >= 4) return { text: 'Very High Impact', color: 'text-green-600', bg: 'bg-green-50', darkBg: 'dark:bg-green-900/20' }
    if (value >= 3) return { text: 'Moderate Impact', color: 'text-purple-600', bg: 'bg-purple-50', darkBg: 'dark:bg-purple-900/20' }
    if (value >= 2) return { text: 'Low Impact', color: 'text-orange-600', bg: 'bg-orange-50', darkBg: 'dark:bg-orange-900/20' }
    return { text: 'Minimal Impact', color: 'text-red-600', bg: 'bg-red-50', darkBg: 'dark:bg-red-900/20' }
  }

  const sentiment = getSentiment(lastingValue)

  // COMPACT VIEW - Single line, this is the default
  if (!isExpanded) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-purple-50 dark:from-purple-900/10 dark:to-purple-900/10 rounded-lg px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xl">💭</span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">Lasting Value:</span>
              <span className="text-lg font-bold">💎 {lastingValue.toFixed(1)}/5</span>
              <span className={`px-2 py-1 text-xs rounded-md ${sentiment.bg} ${sentiment.color} ${sentiment.darkBg}`}>
                {sentiment.text}
              </span>
            </div>
            <DataSourceBadge
              mode={isAIGenerated ? 'ai' : 'human'}
              humanCount={wisdom.total_retrospectives}
              threshold={10}
            />
            <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-400">
              From {wisdom.total_retrospectives} reflections • 6+ months after achieving
            </span>
            <span className="sm:hidden text-xs text-gray-500 dark:text-gray-400">
              ({wisdom.total_retrospectives} reflections)
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 whitespace-nowrap"
          >
            View details →
          </button>
        </div>
      </div>
    )
  }

  // EXPANDED VIEW - Only when user clicks "View details"
  return (
    <div className="bg-gradient-to-r from-purple-50 to-purple-50 dark:from-purple-900/10 dark:to-purple-900/10 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💭</span>
          <h3 className="text-lg font-semibold">Long-term Perspective</h3>
          <DataSourceBadge
            mode={isAIGenerated ? 'ai' : 'human'}
            humanCount={wisdom.total_retrospectives}
            threshold={10}
          />
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
        >
          Collapse ↑
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Lasting Value</span>
          <span className={`text-xs px-2 py-1 rounded-full ${sentiment.bg} ${sentiment.color} ${sentiment.darkBg}`}>
            {sentiment.text}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">💎 {lastingValue.toFixed(1)}</span>
          <span className="text-gray-500 dark:text-gray-400">/5</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Based on {wisdom.total_retrospectives} {isAIGenerated ? 'training data patterns' : 'people'} reflecting 6+ months after achieving this goal
        </div>
      </div>

      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-4">
        {lastingValue >= 4 && (
          <p>✨ Achievers report this goal created fundamental positive change in their lives.</p>
        )}
        {lastingValue >= 3 && lastingValue < 4 && (
          <p>💫 This goal typically leads to noticeable improvements, though not life-changing.</p>
        )}
        {lastingValue < 3 && (
          <p>⚡ Consider if this goal aligns with your deeper values - impact tends to be limited.</p>
        )}
      </div>

      {wisdom.common_benefits && wisdom.common_benefits.length > 0 && (
        <div className="mt-4 pt-4 border-t border-purple-100 dark:border-purple-800">
          <h4 className="font-medium text-sm mb-3 text-gray-700 dark:text-gray-300">
            Unexpected benefits reported:
          </h4>
          <WisdomBenefitCards
            goalId={goalId}
            benefits={wisdom.common_benefits}
            initialShowCount={3}
          />
        </div>
      )}
    </div>
  )
}
