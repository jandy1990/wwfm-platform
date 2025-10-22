'use client'

import { useEffect, useState } from 'react'

export interface PointsToastData {
  points: number
  reason: string
  multiplier?: number
  totalEarned?: number
}

interface PointsToastProps {
  data: PointsToastData | null
  onDismiss: () => void
}

export function PointsToast({ data, onDismiss }: PointsToastProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!data) return

    // Auto-dismiss after 3 seconds
    const dismissTimer = setTimeout(onDismiss, 3000)
    let frameId: number | undefined

    // Progress bar animation
    const startTime = Date.now()
    const duration = 3000

    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)

      if (remaining > 0) {
        frameId = requestAnimationFrame(updateProgress)
      }
    }

    frameId = requestAnimationFrame(updateProgress)

    return () => {
      clearTimeout(dismissTimer)
      if (frameId !== undefined) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [data, onDismiss])

  if (!data) return null

  const { points, reason, multiplier, totalEarned } = data

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-up">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-w-sm">
        {/* Content */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">✨</div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                +{points} points
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {reason}
              </div>

              {multiplier && multiplier > 1 && (
                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Early adopter: ×{multiplier.toFixed(1)} multiplier
                </div>
              )}

              {totalEarned && totalEarned > points && (
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Total earned: {totalEarned} points
                </div>
              )}
            </div>

            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-100 dark:bg-gray-700">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Sparkle particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-sparkle-float"
            style={{
              left: `${20 + i * 15}%`,
              top: '50%',
              animationDelay: `${i * 100}ms`
            }}
          >
            <span className="text-amber-400 text-xs">✨</span>
          </div>
        ))}
      </div>
    </div>
  )
}
