'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useGoalSearch, type Arena } from '@/lib/hooks/useGoalSearch'
import { getSearchableGoals } from '@/lib/services/search-data'

interface HeaderSearchProps {
  className?: string
}

// Highlight matching text in results
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

export default function HeaderSearch({ className = '' }: HeaderSearchProps) {
  const pathname = usePathname()
  const [arenas, setArenas] = useState<Arena[]>([])
  const [totalGoals, setTotalGoals] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isFocused, setIsFocused] = useState(false)

  // Hide search on pages that already have their own search
  const shouldHideSearch = pathname === '/' || pathname === '/browse'

  const {
    searchQuery,
    setSearchQuery,
    isSearching,
    showDropdown,
    setShowDropdown,
    suggestions,
    clearSearch,
    searchContainerRef
  } = useGoalSearch({ arenas, maxResults: 5 }) // Limit to 5 for header

  // Fetch search data on mount
  useEffect(() => {
    let mounted = true

    async function loadSearchData() {
      const { arenas: fetchedArenas, totalGoals: count } = await getSearchableGoals()
      if (mounted) {
        setArenas(fetchedArenas)
        setTotalGoals(count)
        setIsLoading(false)
      }
    }

    loadSearchData()

    return () => {
      mounted = false
    }
  }, [])

  // Keyboard navigation for dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  // Return null AFTER all hooks have been called (to follow Rules of Hooks)
  if (shouldHideSearch) {
    return null
  }

  return (
    <div className={`relative ${className}`} ref={searchContainerRef}>
      <label htmlFor="header-search" className="sr-only">
        Search goals
      </label>

      {/* Search Input */}
      <div className="relative">
        <input
          id="header-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true)
            if (suggestions.length > 0) {
              setShowDropdown(true)
            }
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? 'Loading...' : `Search ${totalGoals} goals...`}
          disabled={isLoading}
          className={`
            w-full h-10 pl-10 pr-10
            text-sm text-gray-900 dark:text-gray-100
            bg-white dark:bg-gray-800
            border-2 border-gray-300 dark:border-gray-600
            rounded-lg
            focus:ring-2 focus:ring-purple-500 focus:outline-none focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${isFocused ? 'w-96' : 'w-72'}
          `}
        />

        {/* Search Icon */}
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Loading Spinner */}
        {isSearching && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24">
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
            onClick={(e) => {
              e.preventDefault()
              clearSearch()
            }}
            onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
            aria-label="Clear search"
            className="absolute right-2 top-1/2 transform -translate-y-1/2
                       text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                       p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600
                       transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Suggestions */}
      {showDropdown && suggestions.length > 0 && (
        <div
          className="absolute z-50 w-full mt-1
                     bg-white dark:bg-gray-800
                     rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
                     max-h-96 overflow-auto"
        >
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800">
            <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
              Top {suggestions.length} results
            </p>
          </div>

          {suggestions.map(({ goal, category, arena }, index) => (
            <Link
              key={`${goal.id}-${index}`}
              href={`/goal/${goal.id}`}
              className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700
                         transition-colors border-b border-gray-100 dark:border-gray-700
                         last:border-b-0"
              onMouseDown={(e) => e.preventDefault()} // Prevent blur before navigation
            >
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {highlightText(goal.title, searchQuery)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <span>{arena.icon}</span>
                  <span>{arena.name} › {category.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {showDropdown && searchQuery && suggestions.length === 0 && !isSearching && (
        <div className="absolute z-50 w-full mt-1
                       bg-white dark:bg-gray-800
                       rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            No goals found for &ldquo;{searchQuery}&rdquo;
          </div>
        </div>
      )}
    </div>
  )
}
