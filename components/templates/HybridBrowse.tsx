'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Link from 'next/link'
import { groupCategoriesBySuperCategory, SUPER_CATEGORY_COLORS, shouldSkipCategoryLayer } from '@/lib/navigation/super-categories'
import { getCategoryIcon } from '@/lib/navigation/category-icons'
import { ArenaSkeleton, SkeletonGrid, SearchSkeleton, PageHeaderSkeleton } from '@/components/atoms/SkeletonLoader'

// Types (reused from original)
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

interface HybridBrowseProps {
  arenas: Arena[]
  totalGoals: number
  isLoading?: boolean
}

// Highlight matching text (reused from original)
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

// Debounce hook (reused from original)
function useDebounce<T>(value: T, delay: number = 150): T {
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

export default function HybridBrowse({ arenas, totalGoals, isLoading = false }: HybridBrowseProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedSuperCategory, setSelectedSuperCategory] = useState<string | null>(null)
  const debouncedSearch = useDebounce(searchQuery, 150)
  
  // Search cache (reused from original)
  type SearchCacheEntry = {
    suggestions: Array<{
      goal: Goal
      category: Category
      arena: Arena
      score: number
    }>
  }

  const searchCache = useRef<Map<string, SearchCacheEntry>>(new Map())
  const cacheTimeout = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const searchContainerRef = useRef<HTMLDivElement>(null)
  
  // Group categories by super-category
  const categoryGroups = useMemo(() => {
    return groupCategoriesBySuperCategory(arenas)
  }, [arenas])

  // Filter categories within selected super-category
  const filteredCategories = useMemo(() => {
    if (!selectedSuperCategory) return []
    
    const group = categoryGroups.find(g => g.superCategory.id === selectedSuperCategory)
    return group?.categories || []
  }, [categoryGroups, selectedSuperCategory])

  // Search functionality (adapted from original)
  const setCacheWithExpiry = useCallback((key: string, data: SearchCacheEntry, expiryMs: number = 300000) => {
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

  // Search goals for dropdown suggestions
  const filteredData = useMemo(() => {
    const trimmedSearch = debouncedSearch.trim()
    
    const cacheKey = trimmedSearch.toLowerCase()
    if (searchCache.current.has(cacheKey)) {
      return searchCache.current.get(cacheKey)
    }
    
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
          
          // Scoring system
          if (titleLower === query) {
            score = 100
          } else if (titleLower.startsWith(query)) {
            score = 90
          } else if (titleLower.split(' ').some(word => word.startsWith(query))) {
            score = 80
          } else if (titleLower.includes(' ' + query)) {
            score = 70
          } else if (titleLower.includes(query)) {
            score = 60
          }
          
          if (score > 0) {
            goalSuggestions.push({ goal, category, arena, score })
          }
        })
      })
    })

    goalSuggestions.sort((a, b) => b.score - a.score)
    const topSuggestions = goalSuggestions.slice(0, 10)
    
    setIsSearching(false)
    setShowDropdown(topSuggestions.length > 0)
    
    const result = { suggestions: topSuggestions }
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

  // Loading state
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Section - Dark Background */}
      <div className="bg-gray-900 dark:bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
              {selectedSuperCategory ?
                categoryGroups.find(g => g.superCategory.id === selectedSuperCategory)?.superCategory.name || 'Browse Goals'
                : 'Browse Goals by Life Area'
              }
            </h1>
            <p className="text-lg text-gray-300">
              {selectedSuperCategory ?
                categoryGroups.find(g => g.superCategory.id === selectedSuperCategory)?.superCategory.description || 'Discover what has worked for others'
                : 'Discover what has worked for others in achieving their goals'
              }
            </p>
            {selectedSuperCategory && (
              <button
                onClick={() => setSelectedSuperCategory(null)}
                className="mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                ← Back to all areas
              </button>
            )}
          </header>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <section className="mb-8" aria-label="Search goals">
          <div className="relative" ref={searchContainerRef}>
            <label htmlFor="goal-search" className="sr-only">Search goals</label>
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
              className="w-full px-4 py-4 pl-12 pr-12 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none focus:border-transparent min-h-[44px] transition-all duration-200 shadow-md"
            />
            
            {/* Search Icon */}
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            
            {/* Loading/Clear buttons (same as original) */}
            {isSearching && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
            
            {searchQuery && !isSearching && (
              <button
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-purple-500 focus:outline-none rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {/* Search Dropdown */}
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border-2 border-gray-200 max-h-96 overflow-auto transition-all duration-200 ease-out">
                {filteredData.suggestions?.length > 0 ? (
                  <>
                    <div className="p-2 bg-purple-50 border-b border-purple-200">
                      <p className="text-xs text-purple-700 font-semibold">
                        Top {filteredData.suggestions.length} matching goals
                      </p>
                    </div>
                    {filteredData.suggestions.map(({ goal, category, arena }, index) => (
                      <Link
                        key={`${goal.id}-${index}`}
                        href={`/goal/${goal.id}`}
                        className="block px-4 py-3 hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0"
                        onClick={() => setShowDropdown(false)}
                      >
                        <div className="font-semibold text-gray-900">
                          {highlightText(goal.title, searchQuery)}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          {arena.name} → {category.name}
                        </div>
                      </Link>
                    ))}
                  </>
                ) : searchQuery.length >= 3 ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No goals found for &quot;{searchQuery}&quot;
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </section>

        {/* Main Content */}
        <main>
          {!selectedSuperCategory ? (
            // Super-Category Overview
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {categoryGroups.map((group) => {
                  const colors = SUPER_CATEGORY_COLORS[group.superCategory.color as keyof typeof SUPER_CATEGORY_COLORS]
                  
                  return (
                    <div
                      key={group.superCategory.id}
                      className={`${colors.bg} ${colors.border} border rounded-xl p-6 transition-all duration-300 hover:shadow-lg cursor-pointer ${colors.hover}`}
                      onClick={() => {
                        // Check if we should skip category layer
                        if (shouldSkipCategoryLayer(group)) {
                          // Navigate directly to a combined goals page for this super-category
                          window.location.href = `/super-category/${group.superCategory.id}`
                        } else {
                          // Show categories as normal
                          setSelectedSuperCategory(group.superCategory.id)
                        }
                      }}
                    >
                      <div className="flex items-start mb-4">
                        <span className={`text-4xl ${colors.icon} mr-4`}>
                          {group.superCategory.icon}
                        </span>
                        <div className="flex-1">
                          <h2 className={`text-2xl font-black tracking-tight ${colors.text} mb-2`}>
                            {group.superCategory.name}
                          </h2>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                            {group.superCategory.description}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span className={`${colors.text} font-semibold`}>
                              {group.totalGoals} goals
                            </span>
                            <span className={`${colors.text} text-lg`}>
                              →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            // Category Detail View
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {(() => {
                  const group = categoryGroups.find(g => g.superCategory.id === selectedSuperCategory)
                  const colors = group ? SUPER_CATEGORY_COLORS[group.superCategory.color as keyof typeof SUPER_CATEGORY_COLORS] : SUPER_CATEGORY_COLORS.blue

                  return filteredCategories
                    .filter(cat => cat.goalCount > 0) // Hide empty categories
                    .sort((a, b) => b.goalCount - a.goalCount) // Sort by goal count
                    .map((category) => (
                      <Link
                        key={category.id}
                        href={`/category/${category.slug}`}
                        className={`${colors.bg} ${colors.border} border rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-6 min-h-[120px] flex flex-col focus:ring-2 focus:ring-purple-500 focus:outline-none ${colors.hover}`}
                      >
                        <div className="flex items-start mb-4">
                          <span className={`text-3xl ${colors.icon} mr-4`}>
                            {getCategoryIcon(category.slug)}
                          </span>
                          <div className="flex-1">
                            <h3 className={`text-lg font-bold tracking-tight ${colors.text} mb-2`}>
                              {category.name}
                            </h3>
                            <div className="flex items-center justify-between text-sm">
                              <span className={`${colors.text} font-semibold`}>
                                {category.goalCount} goals
                              </span>
                              <span className={`${colors.text} text-base`}>
                                →
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                })()}
              </div>

              {/* Empty state for super-category */}
              {filteredCategories.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No categories available in this area yet.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check back soon for more goals to explore!
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
