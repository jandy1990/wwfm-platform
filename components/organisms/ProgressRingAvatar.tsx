'use client'

import { useState, useEffect, useRef } from 'react'
import { getUserPoints, type UserPointsData } from '@/app/actions/get-user-points'
import UserDropdown from '@/components/organisms/UserDropdown'
import { User } from '@supabase/supabase-js'

interface ProgressRingAvatarProps {
  user: User
  onSignOut: () => void
  retrospectiveCount?: number
}

export default function ProgressRingAvatar({
  user,
  onSignOut,
  retrospectiveCount = 0
}: ProgressRingAvatarProps) {
  const [pointsData, setPointsData] = useState<UserPointsData | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load user points data
  useEffect(() => {
    if (user.id) {
      getUserPoints(user.id).then(setPointsData)
    }
  }, [user.id])

  // Listen for points gained events
  useEffect(() => {
    const handlePointsGained = (event: CustomEvent) => {
      const increment = event.detail.points
      setIsAnimating(true)

      // Reload points data
      if (user.id) {
        getUserPoints(user.id).then(setPointsData)
      }

      // Reset animation after duration
      setTimeout(() => setIsAnimating(false), 600)
    }

    window.addEventListener('pointsGained', handlePointsGained as EventListener)
    return () => {
      window.removeEventListener('pointsGained', handlePointsGained as EventListener)
    }
  }, [user.id])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const points = pointsData?.points || 0
  const progress = pointsData?.nextMilestone?.progress || 0

  // SVG circle calculations for ring
  const radius = 16
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress / 100)

  return (
    <div className="relative" ref={containerRef}>
      {/* Progress Ring Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative flex items-center justify-center
          w-11 h-11
          transition-transform duration-200
          hover:scale-105
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
          rounded-full
          ${isAnimating ? 'animate-pulse' : ''}
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`${points} contribution points - View profile menu`}
      >
        {/* SVG Progress Ring */}
        <svg
          className="w-11 h-11 -rotate-90"
          viewBox="0 0 40 40"
          aria-hidden="true"
        >
          {/* Background circle (filled) */}
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="currentColor"
            className="text-gray-100 dark:text-gray-800"
          />

          {/* Background ring */}
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-gray-300 dark:text-gray-700"
          />

          {/* Progress ring */}
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke="url(#purpleGradient)"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-600 ease-out"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333EA" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>

        {/* Points text (centered) */}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold tabular-nums text-gray-900 dark:text-gray-100">
            {points > 999 ? `${Math.floor(points / 1000)}k` : points}
          </span>
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <UserDropdown
          user={user}
          onSignOut={() => {
            setIsOpen(false)
            onSignOut()
          }}
          retrospectiveCount={retrospectiveCount}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          pointsData={pointsData}
        />
      )}
    </div>
  )
}
