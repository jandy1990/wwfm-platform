'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { getUserPoints, type UserPointsData } from '@/app/actions/get-user-points'

interface UserDropdownProps {
  user: User
  onSignOut: () => void
  retrospectiveCount?: number
}

export default function UserDropdown({ user, onSignOut, retrospectiveCount = 0 }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pointsData, setPointsData] = useState<UserPointsData | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
      if (pointsData) {
        const newPoints = pointsData.points + increment
        getUserPoints(user.id).then(setPointsData)
      }
    }

    window.addEventListener('pointsGained', handlePointsGained as EventListener)
    return () => {
      window.removeEventListener('pointsGained', handlePointsGained as EventListener)
    }
  }, [pointsData, user.id])

  const userInitial = user.email?.[0].toUpperCase() || 'U'

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2
                   text-sm font-medium text-gray-700 dark:text-gray-300
                   bg-gray-100 dark:bg-gray-700
                   hover:bg-gray-200 dark:hover:bg-gray-600
                   rounded-md transition-colors
                   focus:outline-none focus:ring-2 focus:ring-purple-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
          {userInitial}
        </div>

        {/* Email - hidden on small screens */}
        <span className="hidden sm:block max-w-[120px] truncate">
          {user.email}
        </span>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56
                     bg-white dark:bg-gray-800
                     rounded-lg shadow-lg
                     border border-gray-200 dark:border-gray-700
                     py-1 z-50"
          role="menu"
          aria-orientation="vertical"
        >
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {user.email_confirmed_at ? '✅ Verified' : '⚠️ Not verified'}
            </p>

            {/* Points Display */}
            {pointsData && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Contribution Points
                  </span>
                  <span className="text-sm font-semibold text-amber-600 dark:text-purple-500">
                    {pointsData.points.toLocaleString()}
                  </span>
                </div>

                {pointsData.nextMilestone && (
                  <>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${pointsData.nextMilestone.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {pointsData.nextMilestone.threshold - pointsData.points} to {pointsData.nextMilestone.name}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2
                       text-sm text-gray-700 dark:text-gray-300
                       hover:bg-gray-100 dark:hover:bg-gray-700
                       transition-colors"
              role="menuitem"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2
                       text-sm text-gray-700 dark:text-gray-300
                       hover:bg-gray-100 dark:hover:bg-gray-700
                       transition-colors"
              role="menuitem"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>

            <Link
              href="/dashboard/contributions"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2
                       text-sm text-gray-700 dark:text-gray-300
                       hover:bg-gray-100 dark:hover:bg-gray-700
                       transition-colors"
              role="menuitem"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Activity
            </Link>

            {retrospectiveCount > 0 && (
              <Link
                href="/mailbox"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-2
                         text-sm text-gray-700 dark:text-gray-300
                         hover:bg-gray-100 dark:hover:bg-gray-700
                         transition-colors"
                role="menuitem"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Reflections
                </div>
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {retrospectiveCount}
                </span>
              </Link>
            )}
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-200 dark:border-gray-700 py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                onSignOut()
              }}
              className="flex items-center gap-3 px-4 py-2 w-full text-left
                       text-sm text-red-600 dark:text-red-400
                       hover:bg-gray-100 dark:hover:bg-gray-700
                       transition-colors"
              role="menuitem"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
