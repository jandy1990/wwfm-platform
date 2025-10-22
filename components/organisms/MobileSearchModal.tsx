'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useGoalSearch, type Arena, type Goal } from '@/lib/hooks/useGoalSearch'
import { getSearchableGoals, getTrendingGoals } from '@/lib/services/search-data'

interface MobileSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

// Highlight matching text
function highlightText(text: string, query: string): React.ReactElement {
  if (!query.trim()) return <>{text}</>

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) => (
        i % 2 === 1 ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      ))}
    </>
  )
}

// Recent searches management
const RECENT_SEARCHES_KEY = 'wwfm_recent_searches'
const MAX_RECENT = 5

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const recent = localStorage.getItem(RECENT_SEARCHES_KEY)
    return recent ? JSON.parse(recent) : []
  } catch {
    return []
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === 'undefined' || !query.trim()) return
  try {
    const recent = getRecentSearches()
    const updated = [query, ...recent.filter(q => q !== query)].slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  } catch (err) {
    console.error('Error saving recent search:', err)
  }
}

export default function MobileSearchModal({ isOpen, onClose }: MobileSearchModalProps) {
  const [arenas, setArenas] = useState<Arena[]>([])
  const [totalGoals, setTotalGoals] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [trendingGoals, setTrendingGoals] = useState<Goal[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const {
    searchQuery,
    setSearchQuery,
    isSearching,
    showDropdown,
    setShowDropdown,
    suggestions,
    clearSearch,
    searchContainerRef
  } = useGoalSearch({ arenas, maxResults: 10 })

  // Load data on mount
  useEffect(() => {
    if (!isOpen) return

    let mounted = true

    async function loadData() {
      const [searchData, trending] = await Promise.all([
        getSearchableGoals(),
        getTrendingGoals(5)
      ])

      if (mounted) {
        setArenas(searchData.arenas)
        setTotalGoals(searchData.totalGoals)
        setTrendingGoals(trending)
        setRecentSearches(getRecentSearches())
        setIsLoading(false)
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [isOpen])

  // Auto-focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      const input = document.getElementById('mobile-search-input')
      setTimeout(() => input?.focus(), 100)
    }
  }, [isOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleSearchSubmit = useCallback((query: string) => {
    if (query.trim()) {
      saveRecentSearch(query.trim())
      setRecentSearches(getRecentSearches())
    }
  }, [])

  const handleClearRecent = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(RECENT_SEARCHES_KEY)
      setRecentSearches([])
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative h-full bg-white dark:bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            aria-label="Close search"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Search Input */}
          <div className="flex-1 relative" ref={searchContainerRef}>
            <input
              id="mobile-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowDropdown(true)
                }
              }}
              placeholder={isLoading ? 'Loading...' : `Search ${totalGoals} goals...`}
              disabled={isLoading}
              className="w-full h-10 pl-3 pr-10
                         text-base text-gray-900 dark:text-gray-100
                         bg-gray-100 dark:bg-gray-800
                         border-0 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:outline-none
                         disabled:opacity-50"
            />

            {/* Loading Spinner */}
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
            )}

            {/* Clear Button */}
            {searchQuery && !isSearching && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2
                           text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                           p-1.5"
                aria-label="Clear search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Search Results */}
          {searchQuery && suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  {suggestions.length} results
                </p>
              </div>
              {suggestions.map(({ goal, category, arena }, index) => (
                <Link
                  key={`${goal.id}-${index}`}
                  href={`/goal/${goal.id}`}
                  onClick={() => {
                    handleSearchSubmit(searchQuery)
                    onClose()
                  }}
                  className="block px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800
                             border-b border-gray-100 dark:border-gray-800"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {highlightText(goal.title, searchQuery)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>{arena.icon}</span>
                      <span>{arena.name} › {category.name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* No Results */}
          {searchQuery && suggestions.length === 0 && !isSearching && (
            <div className="px-4 py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No goals found for &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          )}

          {/* Empty State - Trending & Recent */}
          {!searchQuery && (
            <div className="py-4">
              {/* Trending Goals */}
              {trendingGoals.length > 0 && (
                <div className="mb-6">
                  <div className="px-4 py-2 flex items-center gap-2">
                    <span className="text-lg">🔥</span>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Trending Goals
                    </h3>
                  </div>
                  {trendingGoals.map((goal) => (
                    <Link
                      key={goal.id}
                      href={`/goal/${goal.id}`}
                      onClick={onClose}
                      className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800
                                 border-b border-gray-100 dark:border-gray-800"
                    >
                      <p className="text-base text-gray-900 dark:text-gray-100">
                        {goal.title}
                      </p>
                    </Link>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🕐</span>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Recent Searches
                      </h3>
                    </div>
                    <button
                      onClick={handleClearRecent}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(search)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800
                                 border-b border-gray-100 dark:border-gray-800
                                 flex items-center gap-3"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-base text-gray-700 dark:text-gray-300">
                        {search}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
