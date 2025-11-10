'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { getCategoryIcon } from '@/lib/navigation/category-icons'
import { ArenaSkeleton, SkeletonGrid, SearchSkeleton, PageHeaderSkeleton } from '@/components/atoms/SkeletonLoader'
import { useGoalSearch } from '@/lib/hooks/useGoalSearch'
import GoalRequestForm from '@/components/molecules/GoalRequestForm'
import LoginPromptModal from '@/components/ui/LoginPromptModal'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState, useEffect } from 'react'

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

interface HybridBrowseProps {
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

export default function HybridBrowse({ arenas, totalGoals, isLoading = false }: HybridBrowseProps) {
  // Use the proven search hook
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

  // Goal request feature state
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const supabase = createClientComponentClient()

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Handle request button click
  const handleRequestGoal = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setShowLoginModal(true)
    } else {
      setShowRequestForm(true)
      setShowDropdown(false)
    }
  }

  // Flatten all categories from all arenas with goal counts
  const allCategories = useMemo(() => {
    const categories: Array<{
      id: string
      name: string
      slug: string
      arenaIcon: string
      arenaName: string
      goalCount: number
    }> = []

    arenas.forEach(arena => {
      arena.categories?.forEach(category => {
        categories.push({
          id: category.id,
          name: category.name,
          slug: category.slug,
          arenaIcon: arena.icon,
          arenaName: arena.name,
          goalCount: category.goals?.length || 0
        })
      })
    })

    // Filter out empty categories and sort by goal count
    return categories
      .filter(cat => cat.goalCount > 0)
      .sort((a, b) => b.goalCount - a.goalCount)
  }, [arenas])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageHeaderSkeleton />
          <SearchSkeleton />
          <SkeletonGrid count={9}>
            <ArenaSkeleton />
          </SkeletonGrid>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-gray-900 dark:bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
              Browse Goals
            </h1>
            <p className="text-lg text-gray-300">
              Discover what has worked for others in achieving their goals
            </p>
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
                if (searchQuery.trim().length >= 2 || suggestions.length > 0) {
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

            {/* Loading/Clear buttons */}
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
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-gray-200 dark:border-gray-700 max-h-96 overflow-auto transition-all duration-200 ease-out">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800">
                  <p className="text-xs text-purple-700 dark:text-purple-300 font-semibold">
                    Top {suggestions.length} matching goals
                  </p>
                </div>
                {suggestions.map(({ goal, category, arena }, index) => (
                  <Link
                    key={`${goal.id}-${index}`}
                    href={`/goal/${goal.id}`}
                    className="block px-4 py-4 min-h-[44px] hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {highlightText(goal.title, searchQuery)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {arena.icon} {category.name}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* No Results Message */}
            {showDropdown && searchQuery.trim().length >= 2 && suggestions.length === 0 && !isSearching && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-gray-200 dark:border-gray-700 p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  No goals found for &quot;{searchQuery}&quot;
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                  Try different keywords like &quot;anxiety&quot;, &quot;sleep&quot;, or &quot;focus&quot;
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={handleRequestGoal}
                    className="inline-block w-full sm:w-auto px-4 py-2.5 rounded-lg font-medium transition-all bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md text-sm"
                  >
                    💡 Request this goal
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Categories Grid */}
        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {allCategories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-6 min-h-[120px] flex flex-col focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <div className="flex items-start mb-4">
                  <span className="text-3xl mr-4">
                    {getCategoryIcon(category.slug)}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
                      {category.name}
                    </h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 font-semibold">
                        {category.goalCount} {category.goalCount === 1 ? 'goal' : 'goals'}
                      </span>
                      <span className="text-purple-600 dark:text-purple-400 text-base">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty state */}
          {allCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No categories available yet.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Check back soon for more goals to explore!
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Goal Request Form Modal */}
      <GoalRequestForm
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        searchQuery={searchQuery}
      />

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        context="request new goals"
        title="Sign in to request goals"
        benefits={[
          'Request new goals for the platform',
          'Get notified when your request is reviewed',
          'Contribute to helping others',
          'Build your contribution history'
        ]}
      />
    </div>
  )
}
