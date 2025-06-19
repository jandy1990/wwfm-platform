'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { SolutionWithImplementations } from '@/lib/goal-solutions'
import RatingDisplay, { getBestRating, getAverageRating } from '@/components/ui/RatingDisplay'
import EmptyState from '@/components/ui/EmptyState'
import GoalActionBar from './GoalActionBar'
import SourceBadge, { getSourceDescription } from '@/components/ui/SourceBadge'

type Goal = {
  id: string
  title: string
  description: string
  arena_id: string
  arenas: {
    id: string
    name: string
    slug: string
    icon: string
  }
  categories?: {
    id: string
    name: string
    slug: string
  } | null
}

interface GoalPageClientProps {
  goal: Goal
  initialSolutions: SolutionWithImplementations[]
  error?: string
}

export default function GoalPageClient({ goal, initialSolutions, error }: GoalPageClientProps) {
  const [sortBy, setSortBy] = useState('effectiveness')
  const [filterType, setFilterType] = useState('all')

  // Calculate filter counts and available types
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialSolutions.length }
    
    initialSolutions.forEach(solution => {
      if (solution.solution_category) {
        counts[solution.solution_category] = (counts[solution.solution_category] || 0) + 1
      }
    })
    
    return counts
  }, [initialSolutions])

  // Filter and sort solutions based on selected criteria
  const filteredAndSortedSolutions = useMemo(() => {
    // First filter by type
    let filtered = initialSolutions
    if (filterType !== 'all') {
      filtered = initialSolutions.filter(solution => solution.solution_category === filterType)
    }

    // Then sort the filtered results
    const solutionsCopy = [...filtered]
    
    switch (sortBy) {
      case 'effectiveness':
        return solutionsCopy.sort((a, b) => {
          const aRating = getBestRating(a.implementations)
          const bRating = getBestRating(b.implementations)
          return bRating - aRating // Highest first
        })
      
      case 'reviews':
        return solutionsCopy.sort((a, b) => {
          const aReviews = getAverageRating(a.implementations).count
          const bReviews = getAverageRating(b.implementations).count
          return bReviews - aReviews // Most reviews first
        })
      
      case 'newest':
        return solutionsCopy.sort((a, b) => {
          // Assuming solutions have a created_at field, fall back to id comparison
          return b.id.localeCompare(a.id) // Newer IDs first (assuming UUIDs or sequential)
        })
      
      default:
        return solutionsCopy
    }
  }, [initialSolutions, sortBy, filterType])

  // Get available filter types (excluding 'all')
  const availableTypes = useMemo(() => {
    const types = Object.keys(filterCounts).filter(type => type !== 'all' && filterCounts[type] > 0)
    return types.sort()
  }, [filterCounts])

  // Format filter type names for display
  const formatFilterName = (type: string) => {
    if (type === 'all') return 'All'
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <>
      {/* Sticky Action Bar */}
      <GoalActionBar 
        goalId={goal.id}
        solutionCount={filteredAndSortedSolutions.length}
        onSortChange={setSortBy}
        currentSort={sortBy}
      />

      {/* Filter Chips - Only show if there are multiple types */}
      {availableTypes.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div 
              className="flex items-center space-x-2 overflow-x-auto pb-1"
              role="tablist"
              aria-label="Filter solutions by type"
            >
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap mr-2">
                Filter:
              </span>
              
              {/* All filter chip */}
              <button
                onClick={() => setFilterType('all')}
                role="tab"
                aria-selected={filterType === 'all'}
                aria-controls="solutions-grid"
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap min-h-[36px] focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  filterType === 'all'
                    ? 'bg-blue-600 dark:bg-blue-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All ({filterCounts.all})
              </button>

              {/* Type filter chips */}
              {availableTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  role="tab"
                  aria-selected={filterType === type}
                  aria-controls="solutions-grid"
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap min-h-[36px] focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    filterType === type
                      ? 'bg-blue-600 dark:bg-blue-700 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {formatFilterName(type)} ({filterCounts[type]})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* What Worked Section */}
      <main className="space-y-6">
        <div className="flex items-center justify-between flex-col sm:flex-row gap-2 sm:gap-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            What Worked for This Goal
          </h2>
          <span className="text-sm sm:text-sm text-gray-500 dark:text-gray-400">
            {filteredAndSortedSolutions.length} approaches shared
          </span>
        </div>

        {/* Error state for solutions */}
        {error && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-300">{error}</p>
          </div>
        )}

        {/* Solutions Grid */}
        {filteredAndSortedSolutions.length > 0 ? (
          <section 
            id="solutions-grid"
            className="space-y-4 sm:space-y-6" 
            aria-label="Effective solutions"
            aria-live="polite"
          >
            {filteredAndSortedSolutions.map((solution) => {
              // Calculate ratings using helper functions
              const bestRating = getBestRating(solution.implementations)
              const { count: totalReviews } = getAverageRating(solution.implementations)
              
              // Find the best rated implementation for display
              const bestImplementation = solution.implementations.reduce((best, impl) => {
                const currentRating = impl.effectiveness || impl.goal_links[0]?.avg_effectiveness || 0
                const bestImplRating = best?.effectiveness || best?.goal_links[0]?.avg_effectiveness || 0
                return currentRating > bestImplRating ? impl : best
              }, solution.implementations[0])

              return (
                <article key={solution.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="p-4 sm:p-6">
                    {/* Solution Header */}
                    <header className="mb-4">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex-1">
                          {solution.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <SourceBadge sourceType={solution.source_type} />
                          <span className="sr-only">{getSourceDescription(solution.source_type)}</span>
                        </div>
                      </div>
                      {bestImplementation && (
                        <p className="text-sm sm:text-sm text-gray-600 dark:text-gray-300">
                          Best variant: {bestImplementation.name}
                        </p>
                      )}
                    </header>

                    {/* Star Rating */}
                    {bestRating > 0 && (
                      <div className="mb-4">
                        <RatingDisplay
                          rating={bestRating}
                          maxRating={10}
                          reviewCount={totalReviews}
                          size="md"
                        />
                      </div>
                    )}

                    {solution.description && (
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
                        {solution.description}
                      </p>
                    )}

                    {/* Expandable Variants Section */}
                    {solution.implementations.length > 0 && (
                      <details className="group">
                        <summary className="cursor-pointer text-sm sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 list-none py-2 -mx-2 px-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 min-h-[44px] flex items-center transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                          <span className="inline-flex items-center">
                            See all {solution.implementations.length} variant{solution.implementations.length !== 1 ? 's' : ''}
                            <svg className="ml-1 w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </summary>
                        
                        <div className="mt-3 sm:mt-4 space-y-3">
                          {solution.implementations.map((impl) => {
                            const goalLink = impl.goal_links[0]
                            const rating = impl.effectiveness || goalLink?.avg_effectiveness || 0
                            
                            return (
                              <div key={impl.id} className="border-l-4 border-gray-200 dark:border-gray-600 pl-3 sm:pl-4 py-3 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:pl-4 sm:hover:pl-5">
                                <div className="flex items-start justify-between flex-col sm:flex-row gap-2 sm:gap-0">
                                  <div className="flex-1">
                                    <h5 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                                      {impl.name}
                                    </h5>
                                    
                                    {rating > 0 && (
                                      <div className="mt-1">
                                        <RatingDisplay
                                          rating={rating}
                                          maxRating={10}
                                          showReviewCount={false}
                                          size="sm"
                                        />
                                      </div>
                                    )}
                                    
                                    {impl.category_fields && typeof impl.category_fields === 'object' && 'other_important_information' in impl.category_fields && (
                                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
                                        {String(impl.category_fields.other_important_information)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </details>
                    )}
                  </div>
                </article>
              )
            })}
          </section>
        ) : (
          <EmptyState
            icon="💡"
            heading="No solutions shared yet"
            subtext="Be the first to share what worked! Your experience could help others achieve this goal."
            actionButton={{
              text: "Share What Worked",
              href: `/goal/${goal.id}/add-solution`
            }}
          />
        )}

        {/* Add What Worked CTA */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6 text-center">
          <h3 className="text-base sm:text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
            Tried something for this goal?
          </h3>
          <p className="text-sm sm:text-base text-blue-700 dark:text-blue-200 mb-4">
            Share what worked (or didn&apos;t work) for you and help others on their journey.
          </p>
          <Link 
            href={`/goal/${goal.id}/add-solution`}
            className="inline-block w-full sm:w-auto px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 font-medium min-h-[44px] flex items-center justify-center transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            Share What Worked
          </Link>
        </div>
      </main>
    </>
  )
}