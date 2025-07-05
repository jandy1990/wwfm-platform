'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { GoalSolutionWithVariants } from '@/lib/goal-solutions'
import RatingDisplay, { getBestRating, getAverageRating } from '@/components/ui/RatingDisplay'
import EmptyState from '@/components/ui/EmptyState'
import GoalActionBar from './GoalActionBar'
import SourceBadge from '@/components/ui/SourceBadge'
import { RelatedGoalsNavigation, RelatedGoalsNavigationMobile } from '@/components/goal/RelatedGoalsNavigation'
import { RelatedGoal } from '@/lib/services/related-goals'
import { trackGoalRelationshipClick } from '@/lib/services/related-goals'

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
  initialSolutions: GoalSolutionWithVariants[]
  error?: string | null
  relatedGoals?: RelatedGoal[]
}

// Category configuration with icons, colors, and key fields
const CATEGORY_CONFIG: Record<string, {
  icon: string
  color: string
  borderColor: string
  bgColor: string
  keyFields: string[]
  fieldLabels: Record<string, string>
}> = {
  medications: {
    icon: '💊',
    color: 'text-red-700',
    borderColor: 'border-red-400',
    bgColor: 'bg-red-50',
    keyFields: ['cost', 'side_effects', 'time_to_results'],
    fieldLabels: {
      cost: 'Cost',
      side_effects: 'Side Effects',
      time_to_results: 'Time to Results'
    }
  },
  supplements_vitamins: {
    icon: '💊',
    color: 'text-blue-700',
    borderColor: 'border-blue-400',
    bgColor: 'bg-blue-50',
    keyFields: ['cost', 'side_effects', 'time_to_results'],
    fieldLabels: {
      cost: 'Cost',
      side_effects: 'Side Effects',
      time_to_results: 'Time to Results'
    }
  },
  natural_remedies: {
    icon: '🌿',
    color: 'text-green-700',
    borderColor: 'border-green-400',
    bgColor: 'bg-green-50',
    keyFields: ['cost', 'side_effects', 'time_to_results'],
    fieldLabels: {
      cost: 'Cost',
      side_effects: 'Side Effects',
      time_to_results: 'Time to Results'
    }
  },
  beauty_skincare: {
    icon: '✨',
    color: 'text-pink-700',
    borderColor: 'border-pink-400',
    bgColor: 'bg-pink-50',
    keyFields: ['cost', 'side_effects', 'product_type'],
    fieldLabels: {
      cost: 'Cost',
      side_effects: 'Side Effects',
      product_type: 'Type'
    }
  },
  therapists_counselors: {
    icon: '💆',
    color: 'text-purple-700',
    borderColor: 'border-purple-400',
    bgColor: 'bg-purple-50',
    keyFields: ['cost', 'session_frequency', 'format'],
    fieldLabels: {
      cost: 'Cost',
      session_frequency: 'Frequency',
      format: 'Format'
    }
  },
  doctors_specialists: {
    icon: '👨‍⚕️',
    color: 'text-indigo-700',
    borderColor: 'border-indigo-400',
    bgColor: 'bg-indigo-50',
    keyFields: ['cost', 'wait_time', 'insurance_coverage'],
    fieldLabels: {
      cost: 'Cost',
      wait_time: 'Wait Time',
      insurance_coverage: 'Insurance'
    }
  },
  coaches_mentors: {
    icon: '🎯',
    color: 'text-yellow-700',
    borderColor: 'border-yellow-400',
    bgColor: 'bg-yellow-50',
    keyFields: ['cost', 'format', 'session_frequency'],
    fieldLabels: {
      cost: 'Cost',
      format: 'Format',
      session_frequency: 'Frequency'
    }
  },
  alternative_practitioners: {
    icon: '🌸',
    color: 'text-teal-700',
    borderColor: 'border-teal-400',
    bgColor: 'bg-teal-50',
    keyFields: ['cost', 'side_effects', 'session_frequency'],
    fieldLabels: {
      cost: 'Cost',
      side_effects: 'Side Effects',
      session_frequency: 'Frequency'
    }
  },
  exercise_movement: {
    icon: '🏃',
    color: 'text-green-700',
    borderColor: 'border-green-400',
    bgColor: 'bg-green-50',
    keyFields: ['startup_cost', 'challenges', 'time_commitment'],
    fieldLabels: {
      startup_cost: 'Startup Cost',
      ongoing_cost: 'Ongoing Cost',
      challenges: 'Challenges',
      time_commitment: 'Time Needed'
    }
  },
  meditation_mindfulness: {
    icon: '🧘',
    color: 'text-indigo-700',
    borderColor: 'border-indigo-400',
    bgColor: 'bg-indigo-50',
    keyFields: ['practice_length', 'challenges', 'guidance_type'],
    fieldLabels: {
      practice_length: 'Session Length',
      challenges: 'Challenges',
      guidance_type: 'Guidance'
    }
  },
  habits_routines: {
    icon: '📅',
    color: 'text-orange-700',
    borderColor: 'border-orange-400',
    bgColor: 'bg-orange-50',
    keyFields: ['time_commitment', 'challenges', 'frequency'],
    fieldLabels: {
      time_commitment: 'Time Needed',
      challenges: 'Challenges',
      frequency: 'Frequency'
    }
  },
  apps_software: {
    icon: '📱',
    color: 'text-blue-700',
    borderColor: 'border-blue-400',
    bgColor: 'bg-blue-50',
    keyFields: ['cost', 'usage_frequency', 'most_valuable_feature'],
    fieldLabels: {
      cost: 'Cost',
      usage_frequency: 'Usage',
      most_valuable_feature: 'Best Feature'
    }
  },
  products_devices: {
    icon: '🛍️',
    color: 'text-gray-700',
    borderColor: 'border-gray-400',
    bgColor: 'bg-gray-50',
    keyFields: ['cost', 'ease_of_use', 'best_for'],
    fieldLabels: {
      cost: 'Cost',
      ease_of_use: 'Ease of Use',
      best_for: 'Best For'
    }
  },
  books_courses: {
    icon: '📚',
    color: 'text-amber-700',
    borderColor: 'border-amber-400',
    bgColor: 'bg-amber-50',
    keyFields: ['cost', 'format', 'learning_difficulty'],
    fieldLabels: {
      cost: 'Cost',
      format: 'Format',
      learning_difficulty: 'Difficulty'
    }
  },
  support_groups: {
    icon: '👥',
    color: 'text-red-700',
    borderColor: 'border-red-400',
    bgColor: 'bg-red-50',
    keyFields: ['cost', 'format', 'meeting_frequency'],
    fieldLabels: {
      cost: 'Cost',
      format: 'Format',
      meeting_frequency: 'Frequency'
    }
  },
  diet_nutrition: {
    icon: '🥗',
    color: 'text-green-700',
    borderColor: 'border-green-400',
    bgColor: 'bg-green-50',
    keyFields: ['cost_impact', 'challenges', 'social_impact'],
    fieldLabels: {
      cost_impact: 'Cost Impact',
      challenges: 'Challenges',
      social_impact: 'Social Impact'
    }
  },
  sleep: {
    icon: '😴',
    color: 'text-indigo-700',
    borderColor: 'border-indigo-400',
    bgColor: 'bg-indigo-50',
    keyFields: ['cost', 'adjustment_period', 'challenges'],
    fieldLabels: {
      cost: 'Cost',
      adjustment_period: 'Adjustment',
      challenges: 'Challenges'
    }
  }
}

// Default config for unmapped categories
const DEFAULT_CATEGORY_CONFIG = {
  icon: '🔧',
  color: 'text-gray-700',
  borderColor: 'border-gray-400',
  bgColor: 'bg-gray-50',
  keyFields: ['cost', 'time_to_results'],
  fieldLabels: {
    cost: 'Cost',
    time_to_results: 'Time to Results'
  }
}

// Helper to format array fields nicely
const formatArrayField = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.join(' • ')
  }
  return value?.toString() || ''
}

// Helper to get display value for a field
const getFieldDisplayValue = (solution: GoalSolutionWithVariants, fieldName: string, variant?: typeof solution.variants[0]): string | null => {
  // First check solution_fields (from goal_implementation_links)
  const solutionFields = solution.solution_fields as Record<string, unknown> || {}
  
  // Also check variant category_fields if a specific variant is provided
  const variantFields = variant?.category_fields as Record<string, unknown> || {}
  
  // Merge fields, with variant fields taking precedence
  const allFields = { ...solutionFields, ...variantFields }
  
  // For cost fields, check both with and without _cost suffix
  if (fieldName === 'cost' && !allFields.cost) {
    // Check for startup_cost, ongoing_cost, etc.
    if (allFields.startup_cost || allFields.ongoing_cost) {
      const parts = []
      if (allFields.startup_cost && allFields.startup_cost !== 'Free/No startup cost') {
        parts.push(`${allFields.startup_cost} startup`)
      }
      if (allFields.ongoing_cost && allFields.ongoing_cost !== 'Free/No ongoing cost') {
        parts.push(`${allFields.ongoing_cost} ongoing`)
      }
      return parts.length > 0 ? parts.join(', ') : 'Free'
    }
  }
  
  const value = allFields[fieldName]
  if (value === null || value === undefined || value === '') return null
  
  return Array.isArray(value) ? value.join(' • ') : (value?.toString() || '')
}

export default function GoalPageClient({ goal, initialSolutions, error, relatedGoals = [] }: GoalPageClientProps) {
  console.log('Client: Related goals received:', relatedGoals?.length, relatedGoals)
  
  const [sortBy, setSortBy] = useState('effectiveness')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple')

  // Track goal navigation
  const handleRelatedGoalClick = async (fromGoalId: string, toGoalId: string, position: number) => {
    // This will just log for now, but could send to analytics
    await trackGoalRelationshipClick(null, fromGoalId, toGoalId, position)
  }

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
          const aRating = getBestRating(a.variants)
          const bRating = getBestRating(b.variants)
          return bRating - aRating // Highest first
        })
      
      case 'reviews':
        return solutionsCopy.sort((a, b) => {
          const aReviews = getAverageRating(a.variants).count
          const bReviews = getAverageRating(b.variants).count
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

  console.log('About to render RelatedGoalsNavigation with:', relatedGoals)
  
  return (
    <>
      {/* Related Goals Navigation - Desktop */}
      <div className="hidden md:block -mx-4 sm:-mx-6 lg:-mx-8 mb-6">
        <RelatedGoalsNavigation
          currentGoal={{
            id: goal.id,
            title: goal.title
          }}
          relatedGoals={relatedGoals}
          onGoalClick={handleRelatedGoalClick}
        />
      </div>

      {/* Related Goals Navigation - Mobile */}
      <div className="md:hidden -mx-4 mb-6">
        <RelatedGoalsNavigationMobile
          currentGoal={{
            id: goal.id,
            title: goal.title
          }}
          relatedGoals={relatedGoals}
          onGoalClick={handleRelatedGoalClick}
        />
      </div>

      {/* Sticky Action Bar with View Toggle */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm">
        <GoalActionBar 
          goalId={goal.id}
          solutionCount={filteredAndSortedSolutions.length}
          onSortChange={setSortBy}
          currentSort={sortBy}
        />
        
        {/* View Mode Toggle */}
        <div className="px-4 sm:px-6 lg:px-8 py-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">View:</span>
            <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode('simple')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'simple'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'detailed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Detailed
              </button>
            </div>
          </div>
        </div>
      </div>

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
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap min-h-[36px] ${
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
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap min-h-[36px] ${
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
      <main className="space-y-6 mt-6">
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
            className="space-y-4" 
            aria-label="Effective solutions"
            aria-live="polite"
          >
            {filteredAndSortedSolutions.map((solution) => {
              // Get category config
              const categoryConfig = solution.solution_category 
                ? (CATEGORY_CONFIG[solution.solution_category] || DEFAULT_CATEGORY_CONFIG)
                : DEFAULT_CATEGORY_CONFIG

              // Calculate ratings using helper functions
              const bestRating = getBestRating(solution.variants)
              const { count: totalReviews } = getAverageRating(solution.variants)
              
              // Find the best rated variant for display
              const bestVariant = solution.variants.reduce((best, variant) => {
                const currentRating = variant.effectiveness || variant.goal_links[0]?.avg_effectiveness || 0
                const bestVariantRating = best?.effectiveness || best?.goal_links[0]?.avg_effectiveness || 0
                return currentRating > bestVariantRating ? variant : best
              }, solution.variants[0])

              return (
                <article 
                  key={solution.id} 
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${categoryConfig.borderColor}`}
                >
                  <div className="p-4 sm:p-6">
                    {/* Solution Header */}
                    <header className="mb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-2xl flex-shrink-0" aria-hidden="true">
                            {categoryConfig.icon}
                          </span>
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                              {solution.title}
                            </h3>
                            {bestVariant && solution.variants.length > 1 && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Most effective: {bestVariant.variant_name}
                                {bestVariant.effectiveness && (
                                  <span className="text-amber-600 ml-1">
                                    ({bestVariant.effectiveness.toFixed(1)} ★)
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <SourceBadge sourceType={solution.source_type} />
                          {/* Star Rating */}
                          {bestRating > 0 && (
                            <RatingDisplay
                              rating={bestRating}
                              reviewCount={totalReviews}
                              size="sm"
                            />
                          )}
                        </div>
                      </div>
                    </header>

                    {/* Key Information Section */}
                    <div className="space-y-3">
                      {/* Simple View: Show only key fields */}
                      {viewMode === 'simple' && (
                        <div className="flex flex-wrap gap-4 text-sm">
                          {categoryConfig.keyFields.map(fieldName => {
                            const value = getFieldDisplayValue(solution, fieldName)
                            if (!value) return null
                            
                            return (
                              <div key={fieldName} className="flex flex-col">
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {categoryConfig.fieldLabels[fieldName] || fieldName}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {value}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Detailed View: Show all available fields */}
                      {viewMode === 'detailed' && (
                        <>
                          {solution.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {solution.description}
                            </p>
                          )}
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {(() => {
                              // Get fields from solution_fields and best variant
                              const solutionFields = solution.solution_fields as Record<string, unknown> || {}
                              const bestVariantFields = bestVariant?.category_fields as Record<string, unknown> || {}
                              const allFields = { ...solutionFields, ...bestVariantFields }
                              
                              return Object.entries(allFields).map(([key, value]) => {
                                if (!value || (Array.isArray(value) && value.length === 0)) return null
                                
                                // Format the field name
                                const label = key.split('_').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')
                                
                                return (
                                  <div key={key} className="flex flex-col">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      {label}
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                      {formatArrayField(value)}
                                    </span>
                                  </div>
                                )
                              })
                            })()}
                          </div>
                        </>
                      )}

                      {/* Expandable Variants Section - show in both views if multiple variants */}
                      {solution.variants.length > 1 && (
                        <details className="group mt-3">
                          <summary className="cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 list-none py-2 -mx-2 px-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            <span className="inline-flex items-center">
                              View all {solution.variants.length} options
                              <svg className="ml-1 w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </span>
                          </summary>
                          
                          <div className="mt-3 space-y-2">
                            {solution.variants.map((variant) => {
                              const goalLink = variant.goal_links[0]
                              const rating = variant.effectiveness || goalLink?.avg_effectiveness || 0
                              
                              return (
                                <div key={variant.id} className="flex items-center justify-between py-2 px-3 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                  <div className="flex-1">
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                      {variant.variant_name}
                                    </span>
                                    {variant.category_fields && viewMode === 'detailed' && (
                                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                        {categoryConfig.keyFields.map(fieldName => {
                                          const value = getFieldDisplayValue(solution, fieldName, variant)
                                          if (!value) return null
                                          
                                          return (
                                            <div key={fieldName}>
                                              <span className="text-gray-500 dark:text-gray-400">
                                                {categoryConfig.fieldLabels[fieldName] || fieldName}:
                                              </span>
                                              <span className="ml-1 text-gray-700 dark:text-gray-300">
                                                {value}
                                              </span>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    )}
                                  </div>
                                  {rating > 0 && (
                                    <RatingDisplay
                                      rating={rating}
                                      showReviewCount={false}
                                      size="sm"
                                    />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </details>
                      )}
                    </div>
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
            className="inline-block w-full sm:w-auto px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 font-medium"
          >
            Share What Worked
          </Link>
        </div>
      </main>
    </>
  )
}