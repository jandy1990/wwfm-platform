'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useGoalSearch } from '@/lib/hooks/useGoalSearch'
import { getSearchableGoals } from '@/lib/services/search-data'
import type { Arena } from '@/lib/hooks/useGoalSearch'
import GoalRequestForm from '@/components/molecules/GoalRequestForm'
import LoginPromptModal from '@/components/ui/LoginPromptModal'

interface UnifiedSearchBarProps {
  variant: 'desktop' | 'mobile'
  isOpen?: boolean
  onClose?: () => void
}

/**
 * Unified search component for navigation
 *
 * Handles both desktop dropdown and mobile modal variants with
 * shared search logic and goal request functionality.
 *
 * @param variant - 'desktop' for header dropdown, 'mobile' for full-screen modal
 * @param isOpen - Controls mobile modal visibility (ignored for desktop)
 * @param onClose - Callback to close mobile modal (ignored for desktop)
 */
export default function UnifiedSearchBar({ variant, isOpen = true, onClose }: UnifiedSearchBarProps) {
  const [arenas, setArenas] = useState<Arena[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Goal request feature state
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  const supabase = createClientComponentClient()

  // Use shared search hook
  const {
    searchQuery,
    setSearchQuery,
    isSearching,
    showDropdown,
    setShowDropdown,
    suggestions,
    clearSearch,
    searchContainerRef
  } = useGoalSearch({
    arenas,
    maxResults: variant === 'desktop' ? 5 : 10
  })

  // Fetch searchable goals
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getSearchableGoals()
        setArenas(data)
      } catch (error) {
        console.error('Failed to load search data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

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

  // Handle request goal button click
  const handleRequestGoal = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setShowLoginModal(true)
    } else {
      setShowRequestForm(true)
      setShowDropdown(false)
    }
  }

  // Desktop variant
  if (variant === 'desktop') {
    return (
      <>
        <div className="relative" ref={searchContainerRef}>
          <div className="relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length >= 2 || suggestions.length > 0) {
                  setShowDropdown(true)
                }
              }}
              placeholder="Search goals..."
              className="w-72 px-4 py-2 pl-10 pr-10
                       bg-gray-100 dark:bg-gray-800
                       border border-gray-300 dark:border-gray-700
                       rounded-lg
                       text-sm text-gray-900 dark:text-gray-100
                       placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       transition-all duration-200"
            />

            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}

            {searchQuery && !isSearching && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2
                         text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                         transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute z-50 w-full mt-1
                           bg-white dark:bg-gray-800
                           rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
                           max-h-96 overflow-auto">
              {suggestions.length > 0 ? (
                <>
                  <div className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800">
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
                      onClick={() => setShowDropdown(false)}
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {goal.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {arena.icon} {arena.name} → {category.name}
                      </div>
                    </Link>
                  ))}
                </>
              ) : searchQuery.trim().length >= 2 && !isSearching ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    No goals found for "{searchQuery}"
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                    Try different keywords like "anxiety", "sleep", or "focus"
                  </p>
                  <button
                    onClick={handleRequestGoal}
                    className="inline-block px-4 py-2 rounded-lg font-medium transition-all
                             bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md text-sm"
                  >
                    💡 Request this goal
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Modals */}
        <GoalRequestForm
          isOpen={showRequestForm}
          onClose={() => setShowRequestForm(false)}
          searchQuery={searchQuery}
        />

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
      </>
    )
  }

  // Mobile variant
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close search"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Search Goals
        </h2>
      </div>

      {/* Search Input */}
      <div className="p-4">
        <div className="relative" ref={searchContainerRef}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search goals..."
            autoFocus
            className="w-full px-4 py-3 pl-12
                     bg-gray-100 dark:bg-gray-800
                     border border-gray-300 dark:border-gray-700
                     rounded-lg
                     text-base text-gray-900 dark:text-gray-100
                     placeholder-gray-500 dark:placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />

          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

          {isSearching && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}

          {searchQuery && !isSearching && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2
                       text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="overflow-y-auto" style={{ height: 'calc(100vh - 140px)' }}>
        {suggestions.length > 0 ? (
          <div>
            <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border-y border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                {suggestions.length} {suggestions.length === 1 ? 'result' : 'results'}
              </p>
            </div>
            {suggestions.map(({ goal, category, arena }, index) => (
              <Link
                key={`${goal.id}-${index}`}
                href={`/goal/${goal.id}`}
                className="block px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800
                         transition-colors border-b border-gray-200 dark:border-gray-700"
                onClick={() => {
                  setShowDropdown(false)
                  onClose?.()
                }}
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {goal.title}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {arena.icon} {arena.name} → {category.name}
                </div>
              </Link>
            ))}
          </div>
        ) : searchQuery.trim().length >= 2 && !isSearching ? (
          <div className="px-4 py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              No goals found for "{searchQuery}"
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              Try different keywords like "anxiety", "sleep", or "focus"
            </p>
            <button
              onClick={handleRequestGoal}
              className="inline-block px-6 py-3 rounded-lg font-medium transition-all
                       bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md"
            >
              💡 Request this goal
            </button>
          </div>
        ) : searchQuery.trim().length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Search for goals by keyword</p>
            <p className="text-sm mt-1">Try "anxiety", "sleep", or "focus"</p>
          </div>
        ) : null}
      </div>

      {/* Modals */}
      <GoalRequestForm
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        searchQuery={searchQuery}
      />

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
