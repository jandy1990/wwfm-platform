'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import RatingDisplay from '@/components/molecules/RatingDisplay'
import SourceBadge from '@/components/atoms/SourceBadge'
import EmptyState from '@/components/molecules/EmptyState'
import { getSolutionUrl } from '@/lib/utils/slugify'
import type { SolutionDetailWithGoals, SimilarSolution } from '@/lib/solutions/solution-details'

// Categories that have multiple variants (IMPORTANT!)
const VARIANT_CATEGORIES = ['medications', 'supplements_vitamins', 'natural_remedies', 'beauty_skincare']

// Enhanced variant type for client component
interface VariantWithGoals {
  id: string
  variant_name: string
  amount?: number | null
  unit?: string | null
  form?: string | null
  goalConnections: Array<{
    goal_id: string
    implementation_id: string
    avg_effectiveness: number
    rating_count: number
    typical_application?: string | null
    contraindications?: string | null
    notes?: string | null
    goals: {
      id: string
      title: string
      description?: string | null
      arena_id: string
      arenas: {
        id: string
        name: string
        slug: string
        icon: string
      }
    }
  }>
  totalRatings: number
  avgEffectiveness: number
}

// Goal connection for all variants view
interface GoalConnectionWithVariant {
  goal_id: string
  implementation_id: string
  avg_effectiveness: number
  rating_count: number
  typical_application?: string | null
  contraindications?: string | null
  notes?: string | null
  variant_name: string
  goals: {
    id: string
    title: string
    description?: string | null
    arena_id: string
    arenas: {
      id: string
      name: string
      slug: string
      icon: string
    }
  }
}

interface SolutionPageClientProps {
  solution: SolutionDetailWithGoals
  variantsWithGoals: VariantWithGoals[]
  allGoalConnections: GoalConnectionWithVariant[]
  similarSolutions: SimilarSolution[]
}

// Category configuration for icons and labels
const CATEGORY_CONFIG: Record<string, { icon: string; label: string }> = {
  // Dosage Forms
  medications: { icon: '💊', label: 'Medications' },
  supplements_vitamins: { icon: '🟡', label: 'Supplements & Vitamins' },
  natural_remedies: { icon: '🌿', label: 'Natural Remedies' },
  beauty_skincare: { icon: '✨', label: 'Beauty & Skincare' },

  // Apps & Software
  apps_software: { icon: '📱', label: 'Apps & Software' },

  // Activities & Practices
  meditation_mindfulness: { icon: '🧘', label: 'Meditation & Mindfulness' },
  exercise_fitness: { icon: '💪', label: 'Exercise & Fitness' },
  creative_arts: { icon: '🎨', label: 'Creative Arts' },
  outdoor_activities: { icon: '🌲', label: 'Outdoor Activities' },

  // Professional Services
  therapists_counselors: { icon: '💆', label: 'Therapists & Counselors' },
  doctors_specialists: { icon: '👩‍⚕️', label: 'Doctors & Specialists' },
  coaches_mentors: { icon: '🏆', label: 'Coaches & Mentors' },
  alternative_practitioners: { icon: '🔮', label: 'Alternative Practitioners' },

  // Community & Social
  support_groups: { icon: '👥', label: 'Support Groups' },
  family_friends: { icon: '👨‍👩‍👧‍👦', label: 'Family & Friends' },
  online_communities: { icon: '💬', label: 'Online Communities' },

  // Educational Resources
  books_literature: { icon: '📚', label: 'Books & Literature' },
  podcasts_audio: { icon: '🎧', label: 'Podcasts & Audio' },
  courses_training: { icon: '🎓', label: 'Courses & Training' },

  // Medical & Procedures
  medical_procedures: { icon: '🏥', label: 'Medical Procedures' },
  medical_devices: { icon: '🔬', label: 'Medical Devices' },

  // Tools & Products
  tools_products: { icon: '🛠️', label: 'Tools & Products' },

  // Crisis Resources
  crisis_resources: { icon: '🆘', label: 'Crisis Resources' },

  // Professional Services (catch-all)
  professional_services: { icon: '👔', label: 'Professional Services' }
}

const DEFAULT_CATEGORY_CONFIG = { icon: '🔧', label: 'Other' }

export default function SolutionPageClient({
  solution,
  variantsWithGoals,
  allGoalConnections,
  similarSolutions
}: SolutionPageClientProps) {
  const hasMultipleVariants = VARIANT_CATEGORIES.includes(solution.solution_category) &&
                              variantsWithGoals.length > 1

  const [selectedVariant, setSelectedVariant] = useState<string>('all')
  const [displayCount, setDisplayCount] = useState(20)
  const [showAllGoals, setShowAllGoals] = useState(false)
  const [variantLoading, setVariantLoading] = useState(false)

  const GOALS_PER_PAGE = 20

  // Get category configuration
  const categoryConfig = CATEGORY_CONFIG[solution.solution_category || ''] || DEFAULT_CATEGORY_CONFIG

  // Handle variant selection with loading state
  const handleVariantChange = (variantId: string) => {
    if (variantId === selectedVariant) return

    setVariantLoading(true)
    setSelectedVariant(variantId)

    // Small delay to show loading state
    setTimeout(() => {
      setVariantLoading(false)
    }, 200)
  }

  // Format variant display text for pills
  const getVariantDisplayText = (variant: VariantWithGoals) => {
    if (variant.amount && variant.unit) {
      return `${variant.amount}${variant.unit}`
    }
    return variant.variant_name
  }

  // Determine what data to display based on variant selection
  const displayData = useMemo(() => {
    if (!hasMultipleVariants || selectedVariant === 'all') {
      // Aggregate all variants
      const uniqueGoals = new Map()

      // Group by goal and find best variant for each
      allGoalConnections.forEach(gc => {
        const goalId = gc.goal_id
        if (!uniqueGoals.has(goalId) || gc.avg_effectiveness > uniqueGoals.get(goalId).avg_effectiveness) {
          // Find which variant this belongs to
          const variant = variantsWithGoals.find(v =>
            v.goalConnections.some(vgc => vgc.goal_id === goalId && vgc.implementation_id === gc.implementation_id)
          )

          uniqueGoals.set(goalId, {
            ...gc,
            best_variant: variant?.variant_name || 'Standard',
            best_variant_id: variant?.id
          })
        }
      })

      const aggregatedGoals = Array.from(uniqueGoals.values())
        .sort((a, b) => b.avg_effectiveness - a.avg_effectiveness)

      const totalRatings = variantsWithGoals.reduce((sum, v) => sum + v.totalRatings, 0)
      const avgEffectiveness = aggregatedGoals.length > 0
        ? aggregatedGoals.reduce((sum, gc) => sum + gc.avg_effectiveness, 0) / aggregatedGoals.length
        : 0

      return {
        type: 'aggregated' as const,
        goalConnections: aggregatedGoals,
        totalRatings,
        avgEffectiveness: Number(avgEffectiveness.toFixed(1)),
        goalCount: aggregatedGoals.length
      }
    } else {
      // Single variant selected
      const variant = variantsWithGoals.find(v => v.id === selectedVariant)
      if (!variant) return null

      return {
        type: 'single' as const,
        variant: variant,
        goalConnections: variant.goalConnections,
        totalRatings: variant.totalRatings,
        avgEffectiveness: Number(variant.avgEffectiveness.toFixed(1)),
        goalCount: variant.goalConnections.length
      }
    }
  }, [selectedVariant, variantsWithGoals, allGoalConnections, hasMultipleVariants])

  // Group goals by arena for better organization (if 10+ goals)
  const goalsByArena = useMemo(() => {
    const goalConnections = displayData?.goalConnections || []
    if (goalConnections.length < 10) return null

    const grouped = goalConnections.reduce((acc, gc) => {
      const arenaName = gc.goals.arenas.name
      if (!acc[arenaName]) {
        acc[arenaName] = {
          icon: gc.goals.arenas.icon,
          goals: []
        }
      }
      acc[arenaName].goals.push(gc)
      return acc
    }, {} as Record<string, { icon: string; goals: any[] }>)

    return grouped
  }, [displayData])

  // Calculate arena effectiveness for "Strong In These Areas" section
  const arenaEffectiveness = useMemo(() => {
    const goalConnections = displayData?.goalConnections || []
    if (goalConnections.length < 3) return null

    const arenaStats = goalConnections.reduce((acc, gc) => {
      const arenaName = gc.goals.arenas.name
      if (!acc[arenaName]) {
        acc[arenaName] = {
          icon: gc.goals.arenas.icon,
          goals: [],
          totalEffectiveness: 0,
          totalRatings: 0
        }
      }
      acc[arenaName].goals.push(gc)
      acc[arenaName].totalEffectiveness += gc.avg_effectiveness * gc.rating_count
      acc[arenaName].totalRatings += gc.rating_count
      return acc
    }, {} as Record<string, {
      icon: string;
      goals: any[];
      totalEffectiveness: number;
      totalRatings: number
    }>)

    // Calculate weighted averages and sort by effectiveness
    const arenaResults = Object.entries(arenaStats)
      .map(([name, stats]) => ({
        name,
        icon: stats.icon,
        goalCount: stats.goals.length,
        avgEffectiveness: stats.totalRatings > 0 ? stats.totalEffectiveness / stats.totalRatings : 0,
        totalRatings: stats.totalRatings
      }))
      .sort((a, b) => b.avgEffectiveness - a.avgEffectiveness)

    return arenaResults
  }, [displayData])

  // Determine which components to show based on current data
  const currentGoalCount = displayData?.goalCount || 0
  const currentTotalRatings = displayData?.totalRatings || 0
  const currentGoalConnections = displayData?.goalConnections || []

  const showEffectivenessChart = currentGoalCount >= 3
  const showMostEffectiveFor = currentGoalCount >= 5
  const showInsights = currentTotalRatings >= 10
  const showSingleGoalNotice = currentGoalCount === 1
  const shouldGroupByArena = currentGoalConnections.length >= 10

  // Goals to display (with pagination)
  const displayedGoals = showAllGoals ? currentGoalConnections : currentGoalConnections.slice(0, displayCount)

  return (
    <>
      {/* Header Section - Purple gradient like goal pages */}
      <div className="bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 mb-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
                <span className="text-2xl sm:text-3xl lg:text-4xl">{categoryConfig.icon}</span>
                <span>{solution.title}</span>
              </h1>

              {solution.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-base sm:text-lg">
                  {solution.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  {categoryConfig.icon} {categoryConfig.label}
                </div>

                {displayData && displayData.avgEffectiveness > 0 && (
                  <div className="flex items-center gap-2">
                    <RatingDisplay
                      rating={displayData.avgEffectiveness}
                      reviewCount={displayData.totalRatings}
                      size="md"
                    />
                  </div>
                )}

                {/* Add variant info to header if multiple variants */}
                {hasMultipleVariants && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Available in {variantsWithGoals.length} variants
                  </div>
                )}

                <SourceBadge sourceType={solution.source_type} size="md" />
              </div>
            </div>

            {/* Stats Section */}
            <div className="flex gap-6 mt-4 sm:mt-0">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {currentGoalCount}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Goal{currentGoalCount !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {currentTotalRatings}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Review{currentTotalRatings !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Variant Selector - Only show if multiple variants exist */}
      {hasMultipleVariants && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6 mx-4 sm:mx-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Variant:
            </span>
            {selectedVariant !== 'all' && (
              <span className="text-xs text-gray-500">
                Showing: {variantsWithGoals.find(v => v.id === selectedVariant)?.variant_name}
              </span>
            )}
          </div>

          {/* Mobile: Horizontal scroll, Desktop: Flex wrap */}
          <div className="sm:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
              <button
                onClick={() => handleVariantChange('all')}
                disabled={variantLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  selectedVariant === 'all'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } ${variantLoading ? 'opacity-50' : ''}`}
              >
                {variantLoading && selectedVariant === 'all' && (
                  <div className="inline-block w-3 h-3 mr-2 border border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                All Variants
                <span className="ml-1 opacity-75 text-xs">
                  ({displayData?.goalCount} goals)
                </span>
              </button>

              {variantsWithGoals.map(variant => (
                <button
                  key={variant.id}
                  onClick={() => handleVariantChange(variant.id)}
                  disabled={variantLoading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                    selectedVariant === variant.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } ${variantLoading ? 'opacity-50' : ''}`}
                >
                  {variantLoading && selectedVariant === variant.id && (
                    <div className="inline-block w-3 h-3 mr-2 border border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span className="font-medium">{getVariantDisplayText(variant)}</span>
                  {variant.form && (
                    <span className="ml-1 text-xs opacity-75 lowercase">({variant.form})</span>
                  )}
                  <span className="ml-1 opacity-75 text-xs">
                    {variant.goalConnections.length} goals
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: Flex wrap */}
          <div className="hidden sm:flex gap-2 flex-wrap">
            <button
              onClick={() => handleVariantChange('all')}
              disabled={variantLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedVariant === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              } ${variantLoading ? 'opacity-50' : ''}`}
            >
              {variantLoading && selectedVariant === 'all' && (
                <div className="inline-block w-3 h-3 mr-2 border border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              All Variants
              <span className="ml-1 opacity-75 text-xs">
                ({displayData?.goalCount} goals)
              </span>
            </button>

            {variantsWithGoals.map(variant => (
              <button
                key={variant.id}
                onClick={() => handleVariantChange(variant.id)}
                disabled={variantLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedVariant === variant.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } ${variantLoading ? 'opacity-50' : ''}`}
              >
                {variantLoading && selectedVariant === variant.id && (
                  <div className="inline-block w-3 h-3 mr-2 border border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span className="font-medium">{getVariantDisplayText(variant)}</span>
                {variant.form && (
                  <span className="ml-1 text-xs opacity-75 lowercase">({variant.form})</span>
                )}
                <span className="ml-1 opacity-75 text-xs">
                  {variant.goalConnections.length} goals
                </span>
              </button>
            ))}
          </div>

          {/* Show variant-specific details when selected */}
          {selectedVariant !== 'all' && displayData?.type === 'single' && (
            <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Avg Rating:</span>
                  <span className="ml-2 font-semibold">{displayData.avgEffectiveness}★</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Total Reviews:</span>
                  <span className="ml-2 font-semibold">{displayData.totalRatings}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Goals Tested:</span>
                  <span className="ml-2 font-semibold">{displayData.goalCount}</span>
                </div>
                {(displayData.variant.amount || displayData.variant.unit) && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {solution.solution_category === 'beauty_skincare' ? 'Concentration:' : 'Dosage:'}
                    </span>
                    <span className="ml-2 font-semibold">
                      {displayData.variant.amount}{displayData.variant.unit}
                    </span>
                  </div>
                )}
                {displayData.variant.form && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Form:</span>
                    <span className="ml-2 font-semibold capitalize">{displayData.variant.form}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="mt-6">
        {/* Single Goal Notice */}
        {showSingleGoalNotice && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-lg">ℹ️</span>
              <span className="text-sm text-amber-800 dark:text-amber-200">
                This solution has only been tested for one specific goal so far
              </span>
            </div>
          </div>
        )}

        {/* Effectiveness Content */}
        <div>
            {/* Arena Performance Insights - Show if multiple arenas */}
            {arenaEffectiveness && arenaEffectiveness.length > 1 && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-lg px-6 py-4 mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-xl">🎯</span>
                  <div className="flex items-center gap-6 flex-wrap">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Strongest in:</span>
                    {arenaEffectiveness.slice(0, 3).map((arena, index) => (
                      <div key={arena.name} className="flex items-center gap-1.5">
                        <span className="text-base">{arena.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {arena.name}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ({arena.avgEffectiveness.toFixed(1)}★)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Most Effective For - Show only if 5+ goals */}
            {showMostEffectiveFor && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Most Effective For</h2>

                {/* Chart visualization for top goals */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 space-y-4">
                  {currentGoalConnections.slice(0, 4).map(gc => (
                    <div key={gc.goal_id} className="flex items-center gap-4">
                      <div className="flex-1">
                        <Link
                          href={`/goal/${gc.goal_id}`}
                          className="font-medium hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                        >
                          {gc.goals.title}
                        </Link>
                        <div className="text-sm text-gray-500 mt-1">
                          {gc.goals.arenas.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                            style={{ width: `${(gc.avg_effectiveness / 5) * 100}%` }}
                          />
                        </div>
                        <RatingDisplay
                          rating={gc.avg_effectiveness}
                          reviewCount={gc.rating_count}
                          showReviewCount={false}
                          size="sm"
                        />
                        <span className="text-sm text-gray-500">
                          ({gc.rating_count})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Goals List */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {showMostEffectiveFor ? 'All Goals This Works For' : 'Works For These Goals'}
              </h2>

              {currentGoalCount === 0 ? (
                <EmptyState
                  icon="🎯"
                  heading="No goals tested yet"
                  subtext="Be the first to test this solution for a goal"
                  actionButton={{
                    text: "Browse Goals",
                    href: "/browse"
                  }}
                />
              ) : shouldGroupByArena && goalsByArena ? (
                // Grouped by arena view
                <div className="space-y-6">
                  {Object.entries(goalsByArena).map(([arenaName, arenaData]) => (
                    <div key={arenaName}>
                      <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                        <span className="text-xl">{arenaData.icon}</span>
                        {arenaName}
                        <span className="text-sm text-gray-500">({arenaData.goals.length})</span>
                      </h3>
                      <div className="grid gap-3">
                        {arenaData.goals.slice(0, showAllGoals ? undefined : 5).map(gc => (
                          <GoalCard
                            key={gc.goal_id}
                            goalConnection={gc}
                            showBestVariant={displayData?.type === 'aggregated' && hasMultipleVariants}
                            hideArenaContext={true}
                          />
                        ))}
                        {!showAllGoals && arenaData.goals.length > 5 && (
                          <button
                            onClick={() => setShowAllGoals(true)}
                            className="text-left p-4 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                          >
                            + {arenaData.goals.length - 5} more {arenaName.toLowerCase()} goals
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Simple list view
                <div className="space-y-3">
                  {displayedGoals.map(gc => (
                    <GoalCard
                      key={gc.goal_id}
                      goalConnection={gc}
                      showBestVariant={displayData?.type === 'aggregated' && hasMultipleVariants}
                    />
                  ))}

                  {/* Load More Button */}
                  {currentGoalConnections.length > displayCount && !showAllGoals && (
                    <button
                      onClick={() => setDisplayCount(prev => prev + GOALS_PER_PAGE)}
                      className="w-full py-3 text-center text-purple-600 dark:text-purple-400 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                    >
                      Show More ({currentGoalConnections.length - displayCount} remaining)
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Similar Solutions */}
            {similarSolutions.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-semibold mb-4">Similar Solutions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {similarSolutions.map(similar => (
                    <Link
                      key={similar.id}
                      href={getSolutionUrl(similar.title, similar.id)}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                    >
                      <div className="font-medium mb-1">{similar.title}</div>
                      {similar.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {similar.description}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6 text-center mt-8">
              <h3 className="text-base sm:text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                Used {solution.title}?
              </h3>
              <p className="text-sm sm:text-base text-blue-700 dark:text-blue-200 mb-4">
                Share what it worked (or didn't work) for you
              </p>
              <Link
                href="/browse"
                className="inline-block w-full sm:w-auto px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 font-medium transition-colors"
              >
                Find Your Goal & Rate
              </Link>
            </div>
          </div>

        {/* Debug: End of effectiveness content */}

      </main>
    </>
  )
}

// Cleaned up tab removal - no more activeTab references

// Goal card component
function GoalCard({ goalConnection, showBestVariant = false, hideArenaContext = false }: {
  goalConnection: any
  showBestVariant?: boolean
  hideArenaContext?: boolean
}) {
  return (
    <Link
      href={`/goal/${goalConnection.goal_id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-medium">{goalConnection.goals.title}</div>
          {/* Only show arena name if not in grouped arena context */}
          {!hideArenaContext && (
            <div className="text-sm text-gray-500 mt-1">
              {goalConnection.goals.arenas.name}
            </div>
          )}
          {/* Show which variant is best for this goal in aggregated view */}
          {showBestVariant && goalConnection.best_variant && (
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Best: {goalConnection.best_variant}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <RatingDisplay
            rating={goalConnection.avg_effectiveness}
            reviewCount={goalConnection.rating_count}
            size="sm"
          />
        </div>
      </div>
    </Link>
  )
}