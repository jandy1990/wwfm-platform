'use client'

import { GoalWisdomScore } from '@/types/retrospectives'
import { Info } from 'lucide-react'
import { useState } from 'react'
import WisdomModal from './WisdomModal'

interface Props {
  goalId: string
  wisdom: GoalWisdomScore | null
  minResponses?: number
}

/**
 * Compact wisdom badge for goal header
 * Shows score with info icon to trigger modal
 */
export default function WisdomBadge({ goalId, wisdom, minResponses = 1 }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Don't show if insufficient data
  if (!wisdom || wisdom.total_retrospectives < minResponses) {
    return null
  }

  const lastingValue = wisdom.lasting_value_score || 0
  const isAIGenerated = wisdom.total_retrospectives < 10

  // Determine color styling based on score - gradient from red to green
  const getColorStyling = (value: number) => {
    if (value >= 4) {
      return {
        textColor: 'text-green-700 dark:text-green-400',
        borderColor: 'border-green-300 dark:border-green-700',
        bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30'
      }
    }
    if (value >= 3) {
      return {
        textColor: 'text-blue-700 dark:text-blue-400',
        borderColor: 'border-blue-300 dark:border-blue-700',
        bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30'
      }
    }
    if (value >= 2) {
      return {
        textColor: 'text-orange-700 dark:text-orange-400',
        borderColor: 'border-orange-300 dark:border-orange-700',
        bgColor: 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30'
      }
    }
    return {
      textColor: 'text-red-700 dark:text-red-400',
      borderColor: 'border-red-300 dark:border-red-700',
      bgColor: 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30'
    }
  }

  const colorStyle = getColorStyling(lastingValue)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-full
          border ${colorStyle.borderColor} ${colorStyle.bgColor}
          hover:shadow-sm transition-all
          text-sm font-medium ${colorStyle.textColor}
        `}
        title="View long-term impact data"
      >
        <span className="text-base">💎</span>
        <span>{lastingValue.toFixed(1)} out of 5</span>
        <Info className="w-3.5 h-3.5 opacity-60" />
      </button>

      <WisdomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        goalId={goalId}
        wisdom={wisdom}
      />
    </>
  )
}
