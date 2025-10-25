'use client'

import { GoalWisdomScore } from '@/types/retrospectives'
import { X } from 'lucide-react'
import WisdomBenefitCards from './WisdomBenefitCards'
import { useEffect } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  goalId: string
  wisdom: GoalWisdomScore | null
}

/**
 * Modal showing detailed wisdom/retrospective data
 * Replaces the full-width bar with on-demand details
 */
export default function WisdomModal({ isOpen, onClose, goalId, wisdom }: Props) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !wisdom) return null

  const lastingValue = wisdom.lasting_value_score || 0
  const isAIGenerated = wisdom.total_retrospectives < 10
  const transitionProgress = Math.min((wisdom.total_retrospectives / 10) * 100, 100)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/10 dark:to-purple-900/10 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💭</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Long-term Impact</h3>
            </div>
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center
                         text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                         transition-colors rounded-md
                         focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Score Display */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-5 mb-5 border border-gray-200 dark:border-gray-700">
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Lasting Value Score</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">💎 {lastingValue.toFixed(1)}</span>
                <span className="text-xl text-gray-500 dark:text-gray-400">/5</span>
              </div>
            </div>

            {/* AI → Human Transition Progress */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-50 dark:from-purple-900/10 dark:to-purple-900/10 rounded-lg p-4 mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Data Source: {isAIGenerated ? 'AI Training Data' : 'Human Retrospectives'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${transitionProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">AI-Generated</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Human Data</span>
              </div>
            </div>

            {/* Unexpected Benefits - Only show for human data */}
            {!isAIGenerated && wisdom.common_benefits && wisdom.common_benefits.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-3 text-gray-900 dark:text-gray-100">
                  Unexpected benefits reported:
                </h4>
                <WisdomBenefitCards
                  goalId={goalId}
                  benefits={wisdom.common_benefits}
                  initialShowCount={6}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
