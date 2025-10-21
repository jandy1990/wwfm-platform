'use client'

import { useState, useEffect } from 'react'
import { Milestone } from '@/lib/hooks/useCelebrations'
import { Milestone as PointsMilestone } from '@/app/actions/award-points'
import { MILESTONES } from '@/lib/milestones'
import confetti from 'canvas-confetti'

interface CelebrationModalProps {
  milestone: Milestone | null
  onDismiss: () => void
}

export function CelebrationModal({ milestone, onDismiss }: CelebrationModalProps) {
  const [pointsMilestone, setPointsMilestone] = useState<PointsMilestone | null>(null)

  // Listen for milestoneAchieved events from point awards
  useEffect(() => {
    const handleMilestoneAchieved = (event: CustomEvent) => {
      const achieved = event.detail as PointsMilestone
      setPointsMilestone(achieved)

      // Fire confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      })

      // Extra confetti for major milestones (pathfinder and above)
      const majorMilestoneThresholds = MILESTONES.filter(m => m.threshold >= 1000).map(m => m.threshold)
      if (majorMilestoneThresholds.includes(achieved.threshold)) {
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          })
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          })
        }, 250)
      }

      // Auto-dismiss after 8 seconds (gives users time to read)
      setTimeout(() => setPointsMilestone(null), 8000)
    }

    window.addEventListener('milestoneAchieved', handleMilestoneAchieved as EventListener)
    return () => {
      window.removeEventListener('milestoneAchieved', handleMilestoneAchieved as EventListener)
    }
  }, [])

  const activeMilestone = pointsMilestone || milestone
  if (!activeMilestone) return null

  const isPointsMilestone = 'emoji' in activeMilestone

  const handleDismiss = () => {
    setPointsMilestone(null)
    onDismiss()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={handleDismiss}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md mx-4 text-center animate-bounce-once"
        onClick={(e) => e.stopPropagation()}
      >
        {isPointsMilestone ? (
          // Points milestone display
          <>
            <div className="text-7xl mb-4 animate-pulse">
              {(activeMilestone as PointsMilestone).emoji}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {(activeMilestone as PointsMilestone).name} Achieved!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
              {(activeMilestone as PointsMilestone).description}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              {(activeMilestone as PointsMilestone).threshold.toLocaleString()} contribution points
            </p>
          </>
        ) : (
          // Activity milestone display
          <>
            <div className="text-7xl mb-4 animate-pulse">
              {(activeMilestone as Milestone).title.split(' ')[0]}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {(activeMilestone as Milestone).title.substring(2)}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
              {(activeMilestone as Milestone).message}
            </p>
          </>
        )}
        <button
          onClick={handleDismiss}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all transform hover:scale-105"
        >
          Awesome! 🎉
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes bounce-once {
          0% {
            transform: translateY(0) scale(0.95);
            opacity: 0;
          }
          50% {
            transform: translateY(-10px) scale(1);
            opacity: 1;
          }
          75% {
            transform: translateY(5px) scale(1.02);
            opacity: 1;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-bounce-once {
          animation: bounce-once 0.5s cubic-bezier(0.36, 0, 0.66, -0.56);
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  )
}
