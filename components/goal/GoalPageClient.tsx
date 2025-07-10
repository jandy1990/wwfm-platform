'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import InteractiveRating from '@/components/solutions/InteractiveRating'
import { GoalSolutionWithVariants } from '@/lib/goal-solutions'
import RatingDisplay, { getBestRating, getAverageRating } from '@/components/ui/RatingDisplay'
import EmptyState from '@/components/ui/EmptyState'
import SourceBadge from '@/components/ui/SourceBadge'
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

// Categories that have variants
const VARIANT_CATEGORIES = ['medications', 'supplements_vitamins', 'natural_remedies', 'beauty_skincare']

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
    borderColor: 'border-red-200',
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
    borderColor: 'border-blue-200',
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
    borderColor: 'border-green-200',
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
    borderColor: 'border-pink-200',
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
    borderColor: 'border-purple-200',
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
    borderColor: 'border-indigo-200',
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
    borderColor: 'border-yellow-200',
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
    borderColor: 'border-teal-200',
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
    borderColor: 'border-green-200',
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
    borderColor: 'border-indigo-200',
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
    borderColor: 'border-orange-200',
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
    borderColor: 'border-blue-200',
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
    borderColor: 'border-gray-200',
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
    borderColor: 'border-amber-200',
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
    borderColor: 'border-red-200',
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
    borderColor: 'border-green-200',
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
    borderColor: 'border-indigo-200',
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
  borderColor: 'border-gray-200',
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

// Multi-select dropdown component
const CategoryDropdown = ({ 
  categories, 
  selectedCategories, 
  onCategoryToggle,
  counts 
}: {
  categories: string[]
  selectedCategories: Set<string>
  onCategoryToggle: (category: string) => void
  counts: Record<string, number>
}) => {
  const [isOpen, setIsOpen] = useState(false)
  
  const formatCategoryName = (category: string) => {
    const config = CATEGORY_CONFIG[category] || DEFAULT_CATEGORY_CONFIG
    return config.icon + ' ' + category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }
  
  const selectedCount = selectedCategories.size
  const totalCount = categories.reduce((sum, cat) => sum + (counts[cat] || 0), 0)
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="text-sm font-medium">
          {selectedCount === 0 ? 'All Categories' : `${selectedCount} Categories`}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
            <div className="p-2">
              <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCount === 0}
                  onChange={() => {
                    categories.forEach(cat => {
                      if (selectedCategories.has(cat)) {
                        onCategoryToggle(cat)
                      }
                    })
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">All Categories ({totalCount})</span>
              </label>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              {categories.map(category => (
                <label key={category} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(category)}
                    onChange={() => onCategoryToggle(category)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{formatCategoryName(category)} ({counts[category] || 0})</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function GoalPageClient({ goal, initialSolutions, error, relatedGoals = [] }: GoalPageClientProps) {
  const [sortBy, setSortBy] = useState('effectiveness')
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple')
  const [showAllRelated, setShowAllRelated] = useState(false)
  const [expandedVariants, setExpandedVariants] = useState<Set<string>>(new Set())
  const [solutions, setSolutions] = useState(initialSolutions)

  // Calculate stats
  const totalRatings = useMemo(() => {
    return solutions.reduce((sum, solution) => {
      return sum + solution.variants.reduce((varSum, variant) => {
        return varSum + (variant.goal_links[0]?.rating_count || 0)
      }, 0)
    }, 0)
  }, [solutions])

  // Track goal navigation
  const handleRelatedGoalClick = async (fromGoalId: string, toGoalId: string, position: number) => {
    await trackGoalRelationshipClick(null, fromGoalId, toGoalId, position)
  }

  // Calculate filter counts and available categories
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    
    solutions.forEach(solution => {
      if (solution.solution_category) {
        counts[solution.solution_category] = (counts[solution.solution_category] || 0) + 1
      }
    })
    
    return counts
  }, [solutions])

  const availableCategories = useMemo(() => {
    return Object.keys(categoryCounts).sort()
  }, [categoryCounts])

  // Filter and sort solutions
  const filteredAndSortedSolutions = useMemo(() => {
    // First filter by category
    let filtered = solutions
    if (selectedCategories.size > 0) {
      filtered = solutions.filter(solution => 
        solution.solution_category && selectedCategories.has(solution.solution_category)
      )
    }

    // Then sort
    const solutionsCopy = [...filtered]
    
    switch (sortBy) {
      case 'effectiveness':
        return solutionsCopy.sort((a, b) => {
          const aRating = getBestRating(a.variants)
          const bRating = getBestRating(b.variants)
          return bRating - aRating
        })
      
      case 'quickest':
        // This would need time_to_results data
        return solutionsCopy
        
      case 'cost':
        // This would need cost parsing logic
        return solutionsCopy
      
      case 'newest':
        return solutionsCopy.sort((a, b) => b.id.localeCompare(a.id))
      
      default:
        return solutionsCopy
    }
  }, [solutions, sortBy, selectedCategories])

  const toggleCategory = (category: string) => {
    const newCategories = new Set(selectedCategories)
    if (newCategories.has(category)) {
      newCategories.delete(category)
    } else {
      newCategories.add(category)
    }
    setSelectedCategories(newCategories)
  }

  const toggleVariants = (solutionId: string) => {
    const newExpanded = new Set(expandedVariants)
    if (newExpanded.has(solutionId)) {
      newExpanded.delete(solutionId)
    } else {
      newExpanded.add(solutionId)
    }
    setExpandedVariants(newExpanded)
  }

  return (
    <>
      {/* Goal Header with Gradient */}
      <div className="bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 mb-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <span className="text-2xl sm:text-3xl lg:text-4xl">{goal.arenas.icon}</span>
                <span>{goal.title}</span>
              </h1>
              {goal.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  {goal.description}
                </p>
              )}
            </div>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {solutions.length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Solutions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {totalRatings}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Ratings</div>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-6 mt-4 border-b border-gray-200 dark:border-gray-700">
            <button className="pb-3 text-sm font-medium text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400">
              What Worked
            </button>
            <button className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              Community Discussion
            </button>
          </div>
        </div>
      </div>

      {/* Related Goals Navigation */}
      {relatedGoals && relatedGoals.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start gap-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                People also worked on:
              </span>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {relatedGoals.slice(0, showAllRelated ? undefined : 5).map((relatedGoal, index) => (
                  <Link
                    key={relatedGoal.id}
                    href={`/goal/${relatedGoal.id}`}
                    onClick={() => handleRelatedGoalClick(goal.id, relatedGoal.id, index)}
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    {relatedGoal.title}
                  </Link>
                ))}
                {relatedGoals.length > 5 && (
                  <button
                    onClick={() => setShowAllRelated(!showAllRelated)}
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    {showAllRelated ? 'Show less' : `+ ${relatedGoals.length - 5} more`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Controls Bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left controls */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 hidden sm:inline">
                {filteredAndSortedSolutions.length} solutions
              </span>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 bg-white dark:bg-gray-800 flex-1 sm:flex-none sm:w-auto"
              >
                <option value="effectiveness">Most Effective</option>
                <option value="quickest">Quickest Results</option>
                <option value="cost">Lowest Cost</option>
                <option value="newest">Most Recent</option>
              </select>
              
              {availableCategories.length > 0 && (
                <CategoryDropdown
                  categories={availableCategories}
                  selectedCategories={selectedCategories}
                  onCategoryToggle={toggleCategory}
                  counts={categoryCounts}
                />
              )}
            </div>
            
            {/* View toggle */}
            <div className="flex justify-end">
              <div className="flex border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('simple')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === 'simple'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Simple
                </button>
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === 'detailed'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Detailed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solutions Section */}
      <main className="mt-6 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          What Worked for This Goal
        </h2>

        {/* Error state */}
        {error && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-300">{error}</p>
          </div>
        )}

        {/* Solutions Grid */}
        {filteredAndSortedSolutions.length > 0 ? (
          <div className="space-y-3">
            {filteredAndSortedSolutions.map((solution) => {
              const categoryConfig = solution.solution_category 
                ? (CATEGORY_CONFIG[solution.solution_category] || DEFAULT_CATEGORY_CONFIG)
                : DEFAULT_CATEGORY_CONFIG

              const bestRating = getBestRating(solution.variants)
              const { count: totalReviews } = getAverageRating(solution.variants)
              
              const bestVariant = solution.variants.reduce((best, variant) => {
                const currentRating = variant.effectiveness || variant.goal_links[0]?.avg_effectiveness || 0
                const bestVariantRating = best?.effectiveness || best?.goal_links[0]?.avg_effectiveness || 0
                return currentRating > bestVariantRating ? variant : best
              }, solution.variants[0])

              const hasVariants = VARIANT_CATEGORIES.includes(solution.solution_category || '') && solution.variants.length > 1
              const isExpanded = expandedVariants.has(solution.id)

              return (
                <article 
                  key={solution.id} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200 border border-gray-200 dark:border-gray-700 p-4 sm:p-5"
                >
                  {/* Solution Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <span className="text-xl sm:text-2xl flex-shrink-0" aria-hidden="true">
                          {categoryConfig.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 break-words">
                            {solution.title}
                          </h3>
                          {hasVariants && bestVariant && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Most effective: {bestVariant.variant_name}
                              {bestVariant.effectiveness && (
                                <span className="text-orange-600 dark:text-orange-400 ml-1">
                                  ({bestVariant.effectiveness.toFixed(1)} ★)
                                </span>
                              )}
                            </p>
                          )}
                          {VARIANT_CATEGORIES.includes(solution.solution_category || '') && solution.variants.length === 1 && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Available as: {solution.variants[0].variant_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                      <SourceBadge sourceType={solution.source_type} />
                      {bestRating > 0 && (
                        <div className="whitespace-nowrap">
                          {/* Check if this is a variant category */}
                          {solution.solution_category && VARIANT_CATEGORIES.includes(solution.solution_category) ? (
                            // For variant solutions, show non-interactive rating (rollup only)
                            <RatingDisplay 
                              rating={bestRating} 
                              reviewCount={totalReviews} 
                            />
                          ) : (
                            // For non-variant solutions, show interactive rating
                            <InteractiveRating
                              solution={{
                                id: solution.id,
                                title: solution.title,
                                solution_category: solution.solution_category
                              }}
                              variant={{
                                id: bestVariant.id,
                                variant_name: bestVariant.variant_name
                              }} // ✅ FIXED: Added variant prop here!
                              goalId={goal.id}
                              initialRating={bestRating}
                              ratingCount={totalReviews}
                              onRatingUpdate={(newRating, newCount) => {
                                // Update local state optimistically
                                setSolutions(prev => prev.map(s => 
                                  s.id === solution.id 
                                    ? { 
                                        ...s, 
                                        variants: s.variants.map(v => 
                                          v.id === bestVariant.id 
                                            ? {
                                                ...v,
                                                effectiveness: newRating,
                                                goal_links: v.goal_links.map((link, idx) => 
                                                  idx === 0 
                                                    ? {
                                                        ...link,
                                                        avg_effectiveness: newRating,
                                                        rating_count: newCount
                                                      }
                                                    : link
                                                )
                                              }
                                            : v
                                        )
                                      }
                                    : s
                                ))
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Key Fields - Desktop: Grid with more spacing */}
                  {(() => {
                    const fieldsToShow = categoryConfig.keyFields.filter(fieldName => {
                      const value = getFieldDisplayValue(solution, fieldName, bestVariant)
                      return value !== null && value !== undefined && value !== ''
                    })
                    
                    if (fieldsToShow.length === 0) return null
                    
                    return (
                      <div className="hidden sm:grid sm:grid-cols-3 gap-6 mb-3">
                        {fieldsToShow.map(fieldName => {
                          const value = getFieldDisplayValue(solution, fieldName, bestVariant)
                          
                          return (
                            <div key={fieldName} className="space-y-1">
                              <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {categoryConfig.fieldLabels[fieldName] || fieldName}
                              </span>
                              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                                {value}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                  
                  {/* Mobile: Stacked Layout */}
                  {(() => {
                    const fieldsToShow = categoryConfig.keyFields.filter(fieldName => {
                      const value = getFieldDisplayValue(solution, fieldName, bestVariant)
                      return value !== null && value !== undefined && value !== ''
                    })
                    
                    if (fieldsToShow.length === 0) return null
                    
                    return (
                      <div className="sm:hidden space-y-3">
                        {fieldsToShow.map((fieldName, index) => {
                          const value = getFieldDisplayValue(solution, fieldName, bestVariant)
                          
                          return (
                            <div key={fieldName} className={`flex items-center justify-between py-2 ${
                              index < fieldsToShow.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                            }`}>
                              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {categoryConfig.fieldLabels[fieldName] || fieldName}
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right max-w-[60%]">
                                {value}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}

                  {/* Detailed View Additional Fields */}
                  {viewMode === 'detailed' && (
                    <>
                      {solution.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">
                          {solution.description}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm">
                        {(() => {
                          const solutionFields = solution.solution_fields as Record<string, unknown> || {}
                          const bestVariantFields = bestVariant?.category_fields as Record<string, unknown> || {}
                          const allFields = { ...solutionFields, ...bestVariantFields }
                          
                          // Filter out key fields already shown
                          const additionalFields = Object.entries(allFields).filter(([key]) => 
                            !categoryConfig.keyFields.includes(key)
                          )
                          
                          return additionalFields.map(([key, value]) => {
                            if (!value || (Array.isArray(value) && value.length === 0)) return null
                            
                            const label = key.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')
                            
                            return (
                              <div key={key} className="space-y-1">
                                <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {label}
                                </span>
                                <span className="block font-medium text-gray-900 dark:text-gray-100">
                                  {formatArrayField(value)}
                                </span>
                              </div>
                            )
                          })
                        })()}
                      </div>
                    </>
                  )}
                  
                  {/* Always show description for solutions with key fields */}
                  {viewMode === 'simple' && solution.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">
                      {solution.description}
                    </p>
                  )}

                  {/* Expandable Variants */}
                  {hasVariants && (
                    <>
                      <button
                        onClick={() => toggleVariants(solution.id)}
                        className="mt-4 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 inline-flex items-center gap-1"
                      >
                        View all {solution.variants.length} options
                        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {isExpanded && (
                        <div className="mt-3 space-y-2">
                          {solution.variants.map((variant) => {
                            const goalLink = variant.goal_links[0]
                            const rating = variant.effectiveness || goalLink?.avg_effectiveness || 0
                            const ratingCount = goalLink?.rating_count || 0
                            
                            return (
                              <div key={variant.id} className="flex items-center justify-between py-2 px-3 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                <div className="flex-1">
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {variant.variant_name}
                                  </span>
                                  {viewMode === 'detailed' && variant.category_fields && (
                                    <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
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
                                  <InteractiveRating
                                    solution={{
                                      id: solution.id,
                                      title: solution.title,
                                      solution_category: solution.solution_category
                                    }}
                                    variant={{
                                      id: variant.id,
                                      variant_name: variant.variant_name
                                    }}
                                    goalId={goal.id}
                                    initialRating={rating}
                                    ratingCount={ratingCount}
                                    onRatingUpdate={(newRating, newCount) => {
                                      // Update variant rating in local state
                                      setSolutions(prev => prev.map(s => 
                                        s.id === solution.id 
                                          ? {
                                              ...s,
                                              variants: s.variants.map(v => 
                                                v.id === variant.id 
                                                  ? { 
                                                      ...v, 
                                                      effectiveness: newRating,
                                                      goal_links: v.goal_links.map((link, idx) => 
                                                        idx === 0 
                                                          ? {
                                                              ...link,
                                                              avg_effectiveness: newRating,
                                                              rating_count: newCount
                                                            }
                                                          : link
                                                      )
                                                    }
                                                  : v
                                              )
                                            }
                                          : s
                                      ))
                                    }}
                                  />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </>
                  )}
                </article>
              )
            })}
          </div>
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
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6 text-center mt-8">
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

      {/* Floating Share Button */}
      <Link
        href={`/goal/${goal.id}/add-solution`}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-full shadow-lg font-medium flex items-center gap-2 transition-all hover:scale-105"
      >
        <span>+</span>
        <span className="hidden sm:inline">Share What Worked</span>
        <span className="sm:hidden">Share</span>
      </Link>
    </>
  )
}