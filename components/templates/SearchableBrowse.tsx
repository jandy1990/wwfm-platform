'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArenaSkeleton, SkeletonGrid, SearchSkeleton, PageHeaderSkeleton } from '@/components/atoms/SkeletonLoader'

// Types
type Goal = {
  id: string
  title: string
  is_approved: boolean
}

type Category = {
  id: string
  name: string
  slug: string
  goals?: Goal[]
}

type Arena = {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  categories?: Category[]
  _count?: {
    categories: number
    goals: number
  }
}

interface SearchableBrowseProps {
  arenas: Arena[]
  totalGoals: number
  isLoading?: boolean
}

// Highlight matching text
function highlightText(text: string, query: string): React.ReactElement {
  if (!query.trim()) return <>{text}</>
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}

// Debounce hook with faster default
function useDebounce<T>(value: T, delay: number = 150): T { // Default to 150ms
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function SearchableBrowse({ arenas, totalGoals, isLoading = false }: SearchableBrowseProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false) // Add loading state
  const [showDropdown, setShowDropdown] = useState(false) // Add dropdown state
  const debouncedSearch = useDebounce(searchQuery, 150) // Changed from 300ms
  
  // Search cache to avoid repeated filtering
  const searchCache = useRef<Map<string, {
    suggestions: Array<{
      goal: Goal,
      category: Category,
      arena: Arena,
      score: number
    }>
  }>>(new Map())
  const cacheTimeout = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  
  // Handle click outside to close dropdown
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Helper to manage cache with expiry
  const setCacheWithExpiry = useCallback((key: string, data: {
    suggestions: Array<{
      goal: Goal,
      category: Category,
      arena: Arena,
      score: number
    }>
  }, expiryMs: number = 300000) => {
    const existingTimeout = cacheTimeout.current.get(key)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }
    
    searchCache.current.set(key, data)
    
    const timeout = setTimeout(() => {
      searchCache.current.delete(key)
      cacheTimeout.current.delete(key)
    }, expiryMs)
    
    cacheTimeout.current.set(key, timeout)
  }, [])

  // Search goals for dropdown suggestions only
  const filteredData = useMemo(() => {
    const trimmedSearch = debouncedSearch.trim()
    
    // Check cache first
    const cacheKey = trimmedSearch.toLowerCase()
    const cachedResult = searchCache.current.get(cacheKey)
    if (cachedResult) {
      return cachedResult
    }
    
    // Show loading state for search
    if (trimmedSearch && trimmedSearch !== searchQuery.trim()) {
      setIsSearching(true)
    }
    
    if (!trimmedSearch) {
      setIsSearching(false)
      setShowDropdown(false)
      return { suggestions: [] }
    }

    const query = trimmedSearch.toLowerCase()
    const goalSuggestions: Array<{
      goal: Goal,
      category: Category,
      arena: Arena,
      score: number
    }> = []

    // Search through all arenas and categories for matching goals
    arenas.forEach(arena => {
      arena.categories?.forEach(category => {
        category.goals?.forEach(goal => {
          const titleLower = goal.title.toLowerCase()
          let score = 0
          
          // Scoring system for smart ranking
          if (titleLower === query) {
            score = 100 // Exact match
          } else if (titleLower.startsWith(query)) {
            score = 90 // Starts with query
          } else if (titleLower.split(' ').some(word => word.startsWith(query))) {
            score = 80 // Word starts with query
          } else if (titleLower.includes(' ' + query)) {
            score = 70 // Word boundary match
          } else if (titleLower.includes(query)) {
            score = 60 // Contains query
          }
          
          // Bonus for action verbs
          const actionVerb = goal.title.split(' ')[0].toLowerCase()
          if (actionVerb === query) {
            score += 20
          }
          
          if (score > 0) {
            goalSuggestions.push({ goal, category, arena, score })
          }
        })
      })
    })

    // Sort suggestions by score
    goalSuggestions.sort((a, b) => b.score - a.score)
    
    // Take top 10 suggestions for dropdown
    const topSuggestions = goalSuggestions.slice(0, 10)
    
    setIsSearching(false)
    setShowDropdown(topSuggestions.length > 0)
    
    const result = {
      suggestions: topSuggestions
    }
    
    // Cache the result
    setCacheWithExpiry(cacheKey, result)
    
    return result
  }, [arenas, debouncedSearch, searchQuery, setCacheWithExpiry])

  const clearSearch = () => {
    setSearchQuery('')
    setShowDropdown(false)
    setIsSearching(false)
  }
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Clean up cache on unmount
  useEffect(() => {
    const cacheMap = searchCache.current
    const timeoutMap = cacheTimeout.current

    return () => {
      timeoutMap.forEach(timeout => clearTimeout(timeout))
      cacheMap.clear()
      timeoutMap.clear()
    }
  }, [])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageHeaderSkeleton />
          <SearchSkeleton />
          <SkeletonGrid count={6}>
            <ArenaSkeleton />
          </SkeletonGrid>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Browse Goals by Life Area
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Discover what has worked for others in achieving their goals
          </p>
        </header>

        {/* Search Bar */}
        <section className="mb-8" aria-label="Search goals">
          <div className="relative" ref={searchContainerRef}>
            <label htmlFor="goal-search" className="sr-only">
              Search goals
            </label>
            <input
              id="goal-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (filteredData.suggestions?.length > 0) {
                  setShowDropdown(true)
                }
              }}
              placeholder={`Search ${totalGoals} goals...`}
              aria-describedby="search-description"
              className="w-full px-4 py-4 pl-12 pr-12 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none focus:border-transparent min-h-[44px] transition-all duration-200"
            />
            <div id="search-description" className="sr-only">
              Search through {totalGoals} goals across different life areas
            </div>
            
            {/* Search Icon */}
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
            
            {/* Clear Button */}
            {searchQuery && !isSearching && (
              <button
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-purple-500 focus:outline-none rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {/* Dropdown Suggestions */}
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border 
                          border-gray-200 dark:border-gray-700 max-h-96 overflow-auto
                          transition-all duration-200 ease-out">
                {filteredData.suggestions?.length > 0 ? (
                  <>
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-blue-800">
                      <p className="text-xs text-purple-700 dark:text-blue-300 font-medium">
                        Top {filteredData.suggestions.length} matching goals
                      </p>
                    </div>
                    {filteredData.suggestions.map(({ goal, category, arena }, index) => (
                      <Link
                        key={`${goal.id}-${index}`}
                        href={`/goal/${goal.id}`}
                        className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 
                                 transition-colors border-b border-gray-100 dark:border-gray-700 
                                 last:border-b-0 focus:outline-none focus:bg-purple-50 dark:focus:bg-purple-900/20"
                        onClick={() => setShowDropdown(false)}
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {highlightText(goal.title, searchQuery)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {arena.name} → {category.name}
                        </div>
                      </Link>
                    ))}
                  </>
                ) : searchQuery.length >= 3 ? (
                  // No results message
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No goals found for &quot;{searchQuery}&quot;
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Try different keywords like &quot;anxiety&quot;, &quot;sleep&quot;, or &quot;focus&quot;
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </section>

        {/* Arena Grid - Always show all arenas */}
        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {arenas.map((arena) => (
              <Link
                key={arena.id}
                href={`/arena/${arena.slug}`}
                className="flex bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-h-[120px] flex-col focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <div className="p-4 sm:p-6 flex-1">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <span className="text-3xl sm:text-4xl mr-3">{arena.icon}</span>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      {arena.name}
                    </h2>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 flex-1">
                    {arena.description}
                  </p>
                  <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                    <span>{arena._count?.categories || 0} categories</span>
                    <span>{arena._count?.goals || 0} goals</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State - Only show when there are no arenas at all */}
          {arenas.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-gray-500">No areas available yet.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
