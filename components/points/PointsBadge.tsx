'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUserPoints } from '@/app/actions/get-user-points'

interface PointsBadgeProps {
  userId: string
}

export function PointsBadge({ userId }: PointsBadgeProps) {
  const router = useRouter()
  const [points, setPoints] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    loadPoints()
  }, [userId])

  useEffect(() => {
    // Listen for point gain events
    const handlePointsGained = (event: CustomEvent) => {
      const { points: newPoints } = event.detail
      animatePointsIncrease(newPoints)
    }

    window.addEventListener('pointsGained', handlePointsGained as EventListener)
    return () => {
      window.removeEventListener('pointsGained', handlePointsGained as EventListener)
    }
  }, [points])

  const loadPoints = async () => {
    const data = await getUserPoints(userId)
    setPoints(data.points)
  }

  const animatePointsIncrease = (increment: number) => {
    setIsAnimating(true)

    // Animate counter
    const start = points
    const end = points + increment
    const duration = 600
    const startTime = Date.now()

    const animateCounter = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.floor(start + (end - start) * easeProgress)

      setPoints(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animateCounter)
      } else {
        setPoints(end)
        setTimeout(() => setIsAnimating(false), 400)
      }
    }

    animateCounter()
  }

  const handleClick = () => {
    router.push('/dashboard')
  }

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center gap-1.5 px-3 py-1.5
        bg-gradient-to-r from-amber-50 to-yellow-50
        dark:from-amber-900/20 dark:to-yellow-900/20
        border border-amber-200 dark:border-amber-800
        rounded-full
        hover:from-amber-100 hover:to-yellow-100
        dark:hover:from-amber-900/30 dark:hover:to-yellow-900/30
        transition-all duration-200
        ${isAnimating ? 'animate-points-scale points-glow' : ''}
      `}
      aria-label={`${points} contribution points - View dashboard`}
    >
      <span className="text-sm">✨</span>
      <span className="text-sm font-semibold tabular-nums text-amber-900 dark:text-amber-100">
        {points.toLocaleString()}
      </span>
    </button>
  )
}
