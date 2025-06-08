'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ArenaSkeleton, SkeletonGrid, SearchSkeleton, PageHeaderSkeleton } from '@/components/ui/SkeletonLoader'
import EmptyState from '@/components/ui/EmptyState'

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

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
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
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Filter arenas and goals based on search
  const filteredData = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return { arenas, hasResults: true }
    }

    const query = debouncedSearch.toLowerCase()
    const results: Arena[] = []

    arenas.forEach(arena => {
      const arenaNameMatch = arena.name.toLowerCase().includes(query)
      const matchingCategories: Category[] = []

      arena.categories?.forEach(category => {
        const categoryNameMatch = category.name.toLowerCase().includes(query)
        const matchingGoals = category.goals?.filter(goal => {
          const titleMatch = goal.title.toLowerCase().includes(query)
          const actionVerb = goal.title.split(' ')[0].toLowerCase()
          const actionVerbMatch = actionVerb.includes(query)
          return titleMatch || actionVerbMatch
        }) || []

        if (categoryNameMatch || matchingGoals.length > 0) {
          matchingCategories.push({
            ...category,
            goals: matchingGoals.length > 0 ? matchingGoals : category.goals
          })
        }
      })

      if (arenaNameMatch || matchingCategories.length > 0) {
        results.push({
          ...arena,
          categories: matchingCategories.length > 0 ? matchingCategories : arena.categories
        })
      }
    })

    return {
      arenas: results,
      hasResults: results.length > 0
    }
  }, [arenas, debouncedSearch])

  const clearSearch = () => {
    setSearchQuery('')
  }

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
          <div className="relative">
            <label htmlFor="goal-search" className="sr-only">
              Search goals
            </label>
            <input
              id="goal-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${totalGoals} goals...`}
              aria-describedby="search-description"
              className="w-full px-4 py-4 pl-12 pr-12 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent min-h-[44px] transition-all duration-200"
            />
            <div id="search-description" className="sr-only">
              Search through {totalGoals} goals across different life areas
            </div>
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
            {searchQuery && (
              <button
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </section>

        {/* Search Results or Arena Grid */}
        <main>
        {debouncedSearch ? (
          <>
            {filteredData.hasResults ? (
              <div className="space-y-6 sm:space-y-8">
                {filteredData.arenas.map((arena) => (
                  <div key={arena.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl sm:text-3xl mr-3">{arena.icon}</span>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                        {highlightText(arena.name, debouncedSearch)}
                      </h2>
                    </div>
                    
                    {/* Show matching goals grouped by category */}
                    {arena.categories && arena.categories.length > 0 && (
                      <div className="space-y-4">
                        {arena.categories.map(category => (
                          <div key={category.id}>
                            <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2">
                              {highlightText(category.name, debouncedSearch)}
                            </h3>
                            {category.goals && category.goals.length > 0 && (
                              <div className="grid grid-cols-1 gap-2">
                                {category.goals.map(goal => (
                                  <Link
                                    key={goal.id}
                                    href={`/goal/${goal.id}`}
                                    className="text-blue-600 hover:text-blue-700 hover:underline py-2 px-2 -mx-2 rounded-md hover:bg-blue-50 min-h-[44px] flex items-center text-sm sm:text-base transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                  >
                                    {highlightText(goal.title, debouncedSearch)}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="🔍"
                heading={`No goals found for "${debouncedSearch}"`}
                subtext="Try searching for different keywords like 'stop smoking', 'lose weight', or 'improve sleep'."
                actionButton={{
                  text: "Clear Search",
                  onClick: clearSearch,
                  variant: "secondary"
                }}
              />
            )}
          </>
        ) : (
          /* Arena Grid - Default View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {arenas.map((arena) => (
              <Link
                key={arena.id}
                href={`/arena/${arena.slug}`}
                className="flex bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-h-[120px] flex-col focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
        )}

        {/* Empty State */}
        {!debouncedSearch && arenas.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-gray-500">No areas available yet.</p>
          </div>
        )}
        </main>
      </div>
    </div>
  )
}