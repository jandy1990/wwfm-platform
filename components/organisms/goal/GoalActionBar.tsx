'use client'

import { useState } from 'react'
import Link from 'next/link'

interface GoalActionBarProps {
  goalId: string
  solutionCount: number
  onSortChange: (sortBy: string) => void
  currentSort: string
}

export default function GoalActionBar({ 
  goalId, 
  solutionCount, 
  onSortChange, 
  currentSort 
}: GoalActionBarProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const sortOptions = [
    { value: 'effectiveness', label: 'Most Effective' },
    { value: 'reviews', label: 'Most Reviews' },
    { value: 'newest', label: 'Newest' }
  ]

  return (
    <div className="sticky top-16 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Left side - Sort dropdown */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="sort-solutions" className="sr-only">
                Sort solutions by
              </label>
              <select
                id="sort-solutions"
                value={currentSort}
                onChange={(e) => onSortChange(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[40px]"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                {solutionCount} solution{solutionCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center space-x-2">
            {/* Copy link button - Desktop only */}
            <div className="relative hidden md:block">
              <button
                onClick={handleCopyLink}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                aria-label="Copy goal link"
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              
              {/* Tooltip */}
              {(showTooltip || copySuccess) && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg whitespace-nowrap">
                  {copySuccess ? 'Link copied!' : 'Copy link'}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
              )}
            </div>

            {/* Future buttons - Desktop only */}
            <button
              disabled
              className="hidden lg:flex items-center px-3 py-2 text-sm text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 rounded-md cursor-not-allowed opacity-50 min-h-[40px]"
              aria-label="Follow goal (coming soon)"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Follow
            </button>

            <button
              disabled
              className="hidden lg:flex items-center px-3 py-2 text-sm text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 rounded-md cursor-not-allowed opacity-50 min-h-[40px]"
              aria-label="Track progress (coming soon)"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Track
            </button>

            {/* Share What Worked button - Always visible */}
            <Link
              href={`/goal/${goalId}/add-solution`}
              className="inline-flex items-center px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white text-sm font-medium rounded-md hover:bg-purple-700 dark:hover:bg-purple-600 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-purple-500 focus:outline-none min-h-[40px]"
            >
              <svg className="w-4 h-4 mr-2 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Share What Worked</span>
              <span className="sm:hidden">Share</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}