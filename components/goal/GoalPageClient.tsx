'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import SwipeableRating from '@/components/organisms/solutions/SwipeableRating'
import VariantSheet from '@/components/organisms/solutions/VariantSheet'
import { GoalSolutionWithVariants } from '@/lib/solutions/goal-solutions'
import RatingDisplay, { getBestRating, getAverageRating } from '@/components/molecules/RatingDisplay'
import EmptyState from '@/components/molecules/EmptyState'
import SourceBadge from '@/components/atoms/SourceBadge'
import { RelatedGoal } from '@/lib/solutions/related-goals'
import { trackGoalRelationshipClick } from '@/lib/solutions/related-goals'
import { DistributionField as NewDistributionField, DistributionData } from '@/components/molecules/DistributionField'
import { DistributionSheet as NewDistributionSheet } from '@/components/organisms/distributions/DistributionSheet'

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
  arrayField?: string // For pills display (side_effects, challenges, etc.)
}> = {
  medications: {
    icon: '💊',
    color: 'text-red-700',
    borderColor: 'border-red-200',
    bgColor: 'bg-red-50',
    keyFields: ['cost', 'time_to_results', 'frequency', 'dosage_info'],
    fieldLabels: {
      cost: 'Cost',
      time_to_results: 'Time to Results',
      frequency: 'Frequency',
      dosage_info: 'Dosage'
    },
    arrayField: 'side_effects'
  },
  supplements_vitamins: {
    icon: '💊',
    color: 'text-blue-700',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50',
    keyFields: ['cost', 'time_to_results', 'frequency', 'dosage_info'],
    fieldLabels: {
      cost: 'Cost',
      time_to_results: 'Time to Results',
      frequency: 'Frequency',
      dosage_info: 'Dosage'
    },
    arrayField: 'side_effects'
  },
  natural_remedies: {
    icon: '🌿',
    color: 'text-green-700',
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50',
    keyFields: ['cost', 'time_to_results', 'frequency', 'dosage_info'],
    fieldLabels: {
      cost: 'Cost',
      time_to_results: 'Time to Results',
      frequency: 'Frequency',
      dosage_info: 'Dosage'
    },
    arrayField: 'side_effects'
  },
  beauty_skincare: {
    icon: '✨',
    color: 'text-pink-700',
    borderColor: 'border-pink-200',
    bgColor: 'bg-pink-50',
    keyFields: ['cost', 'time_to_results', 'frequency', 'product_type'],
    fieldLabels: {
      cost: 'Cost',
      time_to_results: 'Time to Results',
      frequency: 'Frequency',
      product_type: 'Type'
    },
    arrayField: 'side_effects'
  },
  therapists_counselors: {
    icon: '💆',
    color: 'text-purple-700',
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-50',
    keyFields: ['cost', 'time_to_results', 'session_frequency', 'format'],
    fieldLabels: {
      cost: 'Cost',
      time_to_results: 'Time to Results',
      session_frequency: 'Frequency',
      format: 'Format'
    }
  },
  doctors_specialists: {
    icon: '👨‍⚕️',
    color: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    bgColor: 'bg-indigo-50',
    keyFields: ['cost', 'time_to_results', 'wait_time', 'insurance_coverage'],
    fieldLabels: {
      cost: 'Cost',
      time_to_results: 'Time to Results',
      wait_time: 'Wait Time',
      insurance_coverage: 'Insurance'
    }
  },
  coaches_mentors: {
    icon: '🎯',
    color: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    bgColor: 'bg-yellow-50',
    keyFields: ['cost', 'time_to_results', 'format', 'session_frequency'],
    fieldLabels: {
      cost: 'Cost',
      time_to_results: 'Time to Results',
      format: 'Format',
      session_frequency: 'Frequency'
    }
  },
  alternative_practitioners: {
    icon: '🌸',
    color: 'text-teal-700',
    borderColor: 'border-teal-200',
    bgColor: 'bg-teal-50',
    keyFields: ['cost', 'time_to_results', 'session_frequency', 'format'],
    fieldLabels: {
      cost: 'Cost',
      time_to_results: 'Time to Results',
      session_frequency: 'Frequency',
      format: 'Format'
    },
    arrayField: 'side_effects' // labeled as "Risks"
  },
  professional_services: {
    icon: '✂️',
    color: 'text-gray-700',
    borderColor: 'border-gray-200',
    bgColor: 'bg-gray-50',
    keyFields: ['cost', 'time_to_results', 'session_frequency', 'format'],
    fieldLabels: {
      cost: 'Cost',
      time_to_results: 'Time to Results',
      session_frequency: 'Frequency',
      format: 'Format'
    }
  },
  medical_procedures: {
    icon: '🏥',
    color: 'text-red-700',
    borderColor: 'border-red-200',
    bgColor: 'bg-red-50',
    keyFields: ['cost', 'time_to_results', 'wait_time', 'format'],
    fieldLabels: {
      cost: 'Cost',
      time_to_results: 'Time to Results',
      wait_time: 'Wait Time',
      format: 'Format'
    },
    arrayField: 'side_effects' // labeled as "Side Effects/Risks"
  },
  crisis_resources: {
    icon: '🆘',
    color: 'text-red-700',
    borderColor: 'border-red-200',
    bgColor: 'bg-red-50',
    keyFields: ['cost', 'time_to_results', 'format', 'availability'],
    fieldLabels: {
      cost: 'Cost',
      time_to_results: 'Time to Results',
      format: 'Format',
      availability: 'Availability'
    }
  },
  exercise_movement: {
    icon: '🏃',
    color: 'text-green-700',
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50',
    keyFields: ['cost', 'time_to_results', 'frequency', 'location_setting'],
    fieldLabels: {
      cost: 'Cost',
      time_to_results: 'Time to Results',
      frequency: 'Frequency',
      location_setting: 'Location'
    },
    arrayField: 'challenges'
  },
  meditation_mindfulness: {
    icon: '🧘',
    color: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    bgColor: 'bg-indigo-50',
    keyFields: ['cost', 'time_to_results', 'practice_length', 'guidance_type'],
    fieldLabels: {
      cost: 'Cost',
      time_to_results: 'Time to Results',
      practice_length: 'Session Length',
      guidance_type: 'Guidance'
    },
    arrayField: 'challenges'
  },
  habits_routines: {
    icon: '📅',
    color: 'text-orange-700',
    borderColor: 'border-orange-200',
    bgColor: 'bg-orange-50',
    keyFields: ['startup_cost', 'ongoing_cost', 'time_to_results', 'time_commitment'],
    fieldLabels: {
      startup_cost: 'Startup Cost',
      ongoing_cost: 'Ongoing Cost',
      time_to_results: 'Time to Results',
      time_commitment: 'Time Commitment'
    },
    arrayField: 'challenges'
  },
  hobbies_activities: {
    icon: '🎨',
    color: 'text-purple-700',
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-50',
    keyFields: ['cost', 'time_to_enjoyment', 'time_commitment', 'social_setting'],
    fieldLabels: {
      cost: 'Cost',
      time_to_enjoyment: 'Time to Enjoyment',
      time_commitment: 'Time/Week',
      social_setting: 'Social Setting'
    },
    arrayField: 'barriers'
  },
  apps_software: {
    icon: '📱',
    color: 'text-blue-700',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50',
    keyFields: ['cost', 'time_to_results', 'usage_frequency', 'most_valuable_feature'],
    fieldLabels: {
      cost: 'Cost',
      time_to_results: 'Time to Results',
      usage_frequency: 'Usage',
      most_valuable_feature: 'Best Feature'
    }
  },
  products_devices: {
    icon: '🛍️',
    color: 'text-gray-700',
    borderColor: 'border-gray-200',
    bgColor: 'bg-gray-50',
    keyFields: ['cost', 'time_to_results', 'ease_of_use', 'format_type'],
    fieldLabels: {
      cost: 'Cost',
      time_to_results: 'Time to Results',
      ease_of_use: 'Ease of Use',
      format_type: 'Product Type'
    },
    arrayField: 'issues'
  },
  books_courses: {
    icon: '📚',
    color: 'text-amber-700',
    borderColor: 'border-amber-200',
    bgColor: 'bg-amber-50',
    keyFields: ['cost', 'time_to_results', 'format', 'learning_difficulty'],
    fieldLabels: {
      cost: 'Cost',
      time_to_results: 'Time to Results',
      format: 'Format',
      learning_difficulty: 'Learning Difficulty'
    },
    arrayField: 'challenges'
  },
  groups_communities: {
    icon: '🌍',
    color: 'text-green-700',
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50',
    keyFields: ['cost', 'time_to_results', 'meeting_frequency', 'format'],
    fieldLabels: {
      cost: 'Cost',
      time_to_results: 'Time to Results',
      meeting_frequency: 'Frequency',
      format: 'Format'
    },
    arrayField: 'challenges_experienced'
  },
  support_groups: {
    icon: '👥',
    color: 'text-red-700',
    borderColor: 'border-red-200',
    bgColor: 'bg-red-50',
    keyFields: ['cost', 'time_to_results', 'format', 'meeting_frequency'],
    fieldLabels: {
      cost: 'Cost',
      time_to_results: 'Time to Results',
      format: 'Format',
      meeting_frequency: 'Frequency'
    },
    arrayField: 'challenges_experienced'
  },
  diet_nutrition: {
    icon: '🥗',
    color: 'text-green-700',
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50',
    keyFields: ['cost_impact', 'time_to_results', 'preparation_adjustment_time', 'long_term_sustainability'],
    fieldLabels: {
      cost_impact: 'Cost Impact',
      time_to_results: 'Time to Results',
      preparation_adjustment_time: 'Daily Prep Time',
      long_term_sustainability: 'Sustainability'
    },
    arrayField: 'challenges_experienced'
  },
  sleep: {
    icon: '😴',
    color: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    bgColor: 'bg-indigo-50',
    keyFields: ['cost', 'time_to_results', 'adjustment_period', 'long_term_sustainability'],
    fieldLabels: {
      cost: 'Cost',
      time_to_results: 'Time to Results',
      adjustment_period: 'Adjustment',
      long_term_sustainability: 'Sustainability'
    },
    arrayField: 'challenges_experienced'
  },
  financial_products: {
    icon: '💰',
    color: 'text-green-700',
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50',
    keyFields: ['cost_type', 'financial_benefit', 'time_to_results', 'ease_of_use'],
    fieldLabels: {
      cost_type: 'Cost Type',
      financial_benefit: 'Financial Benefit',
      time_to_results: 'Time to Results',
      ease_of_use: 'Ease of Use'
    }
    // No specific array field for issues - has minimum_requirements and key_features instead
  }
}

// Default config for unmapped categories
const DEFAULT_CATEGORY_CONFIG = {
  icon: '🔧',
  color: 'text-gray-700',
  borderColor: 'border-gray-200',
  bgColor: 'bg-gray-50',
  keyFields: ['cost', 'time_to_results', 'format', 'frequency'],
  fieldLabels: {
    cost: 'Cost',
    time_to_results: 'Time to Results',
    format: 'Format',
    frequency: 'Frequency'
  }
}

// Helper to format prevalence data for simple view
const formatPrevalenceForSimpleView = (distribution: DistributionData | null, value: string): React.ReactElement => {
  if (!distribution || distribution.values.length <= 1) {
    // No distribution data, just show the single value
    return <span>{value}</span> as React.ReactElement
  }
  
  // Show vertical stack with "Most common:" label
  const topValues = distribution.values.slice(0, 2) // Show top 2
  const remainingCount = distribution.values.length - 2
  
  return (
    <div className="space-y-1">
      <div className="text-xs text-gray-500 dark:text-gray-400">Most common:</div>
      {topValues.map((item, index) => (
        <div key={index} className="text-sm">
          {item.value} <span className="text-gray-500 dark:text-gray-400">({item.percentage}%)</span>
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400">+ {remainingCount} more</div>
      )}
    </div>
  ) as React.ReactElement
}

// Helper to format array fields nicely
const formatArrayField = (value: unknown, fieldName?: string): string | React.ReactElement => {
  if (Array.isArray(value)) {
    // For challenges field with percentages, format each item on new line
    if (fieldName === 'challenges' && value.some(item => typeof item === 'string' && item.includes('('))) {
      return (
        <div className="space-y-1">
          {value.map((item, index) => (
            <div key={index} className="text-sm break-words">
              {item}
            </div>
          ))}
        </div>
      ) as React.ReactElement
    }
    // For fields with percentages, return with proper wrapping
    if (value.some(item => typeof item === 'string' && item.includes('%'))) {
      return (
        <div className="text-sm">
          <div className="flex flex-wrap gap-x-1">
            {value.map((item, index) => (
              <span key={index} className="whitespace-nowrap">
                {index > 0 && <span className="mx-1">•</span>}
                {item}
              </span>
            ))}
          </div>
        </div>
      ) as React.ReactElement
    }
    // For longer content, return line-separated
    return (
      <div className="space-y-1">
        {value.map((item, index) => (
          <div key={index} className="text-sm break-words">
            {index > 0 && '• '}{item}
          </div>
        ))}
      </div>
    ) as React.ReactElement
  }
  return value?.toString() || ''
}

// Helper to get regular field values
const getFieldDisplayValue = (solution: GoalSolutionWithVariants, fieldName: string, variant?: typeof solution.variants[0]): string | null => {
  // Check variant first (for dosage categories)
  if (variant && variant.category_fields) {
    const variantFields = variant.category_fields as Record<string, unknown>
    if (variantFields[fieldName]) {
      return variantFields[fieldName].toString()
    }
  }
  
  // Then check solution_fields
  const solutionFields = solution.solution_fields as Record<string, unknown> || {}
  if (solutionFields[fieldName]) {
    const value = solutionFields[fieldName]
    if (Array.isArray(value)) return null // Arrays handled elsewhere
    return value.toString()
  }
  
  return null
}

// Helper for composite fields
const getCompositeFieldValue = (solution: GoalSolutionWithVariants, fieldName: string, variant?: typeof solution.variants[0]): string | null => {
  const solutionFields = solution.solution_fields as Record<string, unknown> || {}
  const variantFields = variant?.category_fields as Record<string, unknown> || {}
  
  switch(fieldName) {
    case 'dosage_info':
      const amount = variantFields?.amount || solutionFields?.dosage_amount || solutionFields?.amount
      const unit = variantFields?.unit || solutionFields?.unit
      const frequency = solutionFields?.frequency
      if (amount && unit) {
        return frequency ? `${amount}${unit} ${frequency}` : `${amount}${unit}`
      }
      return null
      
    case 'cost':
      // Handle dual cost fields (startup + ongoing)
      if (solutionFields.startup_cost || solutionFields.ongoing_cost) {
        const parts = []
        if (solutionFields.startup_cost && solutionFields.startup_cost !== 'Free/No startup cost') {
          parts.push(solutionFields.startup_cost.toString())
        }
        if (solutionFields.ongoing_cost && solutionFields.ongoing_cost !== 'Free/No ongoing cost') {
          parts.push(`${solutionFields.ongoing_cost}/mo`)
        }
        return parts.length > 0 ? parts.join(' + ') : 'Free'
      }
      // Single cost field
      return solutionFields.cost ? solutionFields.cost.toString() : null
      
    case 'startup_cost':
      return solutionFields.startup_cost ? solutionFields.startup_cost.toString() : null
      
    case 'ongoing_cost':
      return solutionFields.ongoing_cost ? solutionFields.ongoing_cost.toString() : null
      
    default:
      return null
  }
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
  const [hasRatedAny, setHasRatedAny] = useState(false) // Simple flag to disable sorting
  const [showBanner, setShowBanner] = useState(false) // First-time user banner
  const [distributionSheet, setDistributionSheet] = useState<{
    isOpen: boolean;
    fieldName: string;
    distribution: DistributionData | null;
  }>({ isOpen: false, fieldName: '', distribution: null })
  const [fieldDistributions, setFieldDistributions] = useState<Map<string, DistributionData>>(new Map())
  const [individualCardViews, setIndividualCardViews] = useState<Map<string, 'simple' | 'detailed'>>(new Map())
  const [isMobile, setIsMobile] = useState(false)
  const [variantSheet, setVariantSheet] = useState<{
    isOpen: boolean;
    solution: GoalSolutionWithVariants | null;
  }>({ isOpen: false, solution: null })
  
  // Check if user has seen the contribution hint banner
  useEffect(() => {
    const hasSeenBanner = localStorage.getItem('hasSeenContributionHint')
    if (!hasSeenBanner) {
      setShowBanner(true)
    }
  }, [])
  
  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Load field distributions when solutions or viewMode changes
  useEffect(() => {
    if (viewMode === 'detailed' && solutions.length > 0) {
      const loadDistributions = async () => {
        const newDistributions = new Map<string, DistributionData>()
        
        // Get all unique fields across all solutions
        const allFields = new Set<string>()
        solutions.forEach(solution => {
          const categoryConfig = solution.solution_category 
            ? (CATEGORY_CONFIG[solution.solution_category] || DEFAULT_CATEGORY_CONFIG)
            : DEFAULT_CATEGORY_CONFIG
          categoryConfig.keyFields.forEach(field => allFields.add(field))
        })
        
        // Load distributions for each field
        for (const fieldName of allFields) {
          try {
            const distribution = await getGoalFieldDistribution(goal.id, solutions, fieldName)
            if (distribution) {
              newDistributions.set(fieldName, distribution)
            }
          } catch (error) {
            console.warn(`Failed to load distribution for field ${fieldName}:`, error)
          }
        }
        
        setFieldDistributions(newDistributions)
      }
      
      loadDistributions()
    }
  }, [goal.id, solutions, viewMode])

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

  // Mock prevalence data for demonstration
  const getMockPrevalenceData = (fieldName: string): DistributionData | null => {
    const mockData: Record<string, DistributionData> = {
      cost: {
        mode: "$10-25/month",
        values: [
          { value: "$10-25/month", count: 45, percentage: 45 },
          { value: "$25-50/month", count: 30, percentage: 30 },
          { value: "Free", count: 15, percentage: 15 },
          { value: "$50-100/month", count: 7, percentage: 7 },
          { value: "Over $100/month", count: 3, percentage: 3 }
        ],
        totalReports: 100
      },
      time_to_results: {
        mode: "3-4 weeks",
        values: [
          { value: "3-4 weeks", count: 65, percentage: 65 },
          { value: "1-2 months", count: 20, percentage: 20 },
          { value: "1-2 weeks", count: 10, percentage: 10 },
          { value: "Immediately", count: 5, percentage: 5 }
        ],
        totalReports: 100
      },
      frequency: {
        mode: "Once daily",
        values: [
          { value: "Once daily", count: 55, percentage: 55 },
          { value: "Twice daily", count: 25, percentage: 25 },
          { value: "As needed", count: 15, percentage: 15 },
          { value: "Weekly", count: 5, percentage: 5 }
        ],
        totalReports: 100
      },
      dosage_info: {
        mode: "50mg daily",
        values: [
          { value: "50mg daily", count: 40, percentage: 40 },
          { value: "100mg daily", count: 30, percentage: 30 },
          { value: "25mg daily", count: 20, percentage: 20 },
          { value: "150mg daily", count: 10, percentage: 10 }
        ],
        totalReports: 100
      },
      session_frequency: {
        mode: "Weekly",
        values: [
          { value: "Weekly", count: 45, percentage: 45 },
          { value: "Biweekly", count: 30, percentage: 30 },
          { value: "Monthly", count: 20, percentage: 20 },
          { value: "As needed", count: 5, percentage: 5 }
        ],
        totalReports: 100
      },
      format: {
        mode: "In-person",
        values: [
          { value: "In-person", count: 50, percentage: 50 },
          { value: "Virtual/Online", count: 35, percentage: 35 },
          { value: "Hybrid", count: 15, percentage: 15 }
        ],
        totalReports: 100
      },
      startup_cost: {
        mode: "$50-100",
        values: [
          { value: "$50-100", count: 35, percentage: 35 },
          { value: "Under $50", count: 30, percentage: 30 },
          { value: "Free", count: 20, percentage: 20 },
          { value: "$100-250", count: 15, percentage: 15 }
        ],
        totalReports: 100
      },
      ongoing_cost: {
        mode: "$10-25/month",
        values: [
          { value: "$10-25/month", count: 40, percentage: 40 },
          { value: "Free", count: 30, percentage: 30 },
          { value: "$25-50/month", count: 20, percentage: 20 },
          { value: "Under $10/month", count: 10, percentage: 10 }
        ],
        totalReports: 100
      },
      wait_time: {
        mode: "1-2 weeks",
        values: [
          { value: "1-2 weeks", count: 35, percentage: 35 },
          { value: "2-4 weeks", count: 30, percentage: 30 },
          { value: "Within a week", count: 20, percentage: 20 },
          { value: "1-2 months", count: 15, percentage: 15 }
        ],
        totalReports: 100
      },
      insurance_coverage: {
        mode: "Partially covered",
        values: [
          { value: "Partially covered", count: 45, percentage: 45 },
          { value: "Not covered", count: 30, percentage: 30 },
          { value: "Fully covered", count: 20, percentage: 20 },
          { value: "HSA/FSA eligible", count: 5, percentage: 5 }
        ],
        totalReports: 100
      },
      location_setting: {
        mode: "Gym",
        values: [
          { value: "Gym", count: 40, percentage: 40 },
          { value: "Home", count: 35, percentage: 35 },
          { value: "Outdoors", count: 20, percentage: 20 },
          { value: "Studio/Class", count: 5, percentage: 5 }
        ],
        totalReports: 100
      },
      practice_length: {
        mode: "10-20 minutes",
        values: [
          { value: "10-20 minutes", count: 45, percentage: 45 },
          { value: "5-10 minutes", count: 30, percentage: 30 },
          { value: "20-30 minutes", count: 20, percentage: 20 },
          { value: "30+ minutes", count: 5, percentage: 5 }
        ],
        totalReports: 100
      },
      guidance_type: {
        mode: "App guided",
        values: [
          { value: "App guided", count: 50, percentage: 50 },
          { value: "Self-guided", count: 30, percentage: 30 },
          { value: "Video/Audio", count: 15, percentage: 15 },
          { value: "In-person class", count: 5, percentage: 5 }
        ],
        totalReports: 100
      }
    }
    
    return mockData[fieldName] || null
  }

  // Helper to get distribution for a specific solution and field
  const getDistributionForSolutionField = (solution: GoalSolutionWithVariants, fieldName: string): DistributionData | null => {
    // First check if we have a cross-solution distribution for this field
    const crossSolutionDistribution = fieldDistributions.get(fieldName)
    if (crossSolutionDistribution) {
      return crossSolutionDistribution
    }
    
    // Use mock data for demonstration
    const mockData = getMockPrevalenceData(fieldName)
    if (mockData) {
      return mockData
    }
    
    // Fallback: create simple single-value distribution
    const currentValue = getFieldValueFromSolution(solution, fieldName)
    if (!currentValue) return null
    
    const ratingCount = solution.variants.reduce((sum, variant) => {
      return sum + (variant.goal_links[0]?.rating_count || 1)
    }, 0)
    
    return {
      mode: currentValue,
      values: [
        { value: currentValue, count: ratingCount, percentage: 100 }
      ],
      totalReports: ratingCount
    }
  }

  // Filter and sort solutions
  const filteredAndSortedSolutions = useMemo(() => {
    // First filter by category
    let filtered = solutions
    if (selectedCategories.size > 0) {
      filtered = solutions.filter(solution => 
        solution.solution_category && selectedCategories.has(solution.solution_category)
      )
    }

    // If anyone has rated anything, don't sort at all
    if (hasRatedAny) {
      return filtered;
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
  }, [solutions, sortBy, selectedCategories, hasRatedAny])

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

  const dismissBanner = () => {
    localStorage.setItem('hasSeenContributionHint', 'true')
    setShowBanner(false)
  }

  // Determine the view for a specific card
  const getCardView = (solutionId: string): 'simple' | 'detailed' => {
    // Global toggle overrides individual states
    if (viewMode === 'detailed') return 'detailed'
    return individualCardViews.get(solutionId) || 'simple'
  }

  // Toggle individual card view
  const toggleCardView = (solutionId: string, event: React.MouseEvent) => {
    // Don't toggle if clicking on interactive elements
    const target = event.target as HTMLElement
    if (
      target.closest('.rating-container') ||
      target.closest('.swipeable-rating') ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('select') ||
      target.closest('input') ||
      target.closest('.side-effect-chip') ||
      target.closest('.add-effect-inline') ||
      target.closest('.view-options-button')
    ) {
      return
    }

    event.stopPropagation()
    const newViews = new Map(individualCardViews)
    const currentView = getCardView(solutionId)
    newViews.set(solutionId, currentView === 'simple' ? 'detailed' : 'simple')
    setIndividualCardViews(newViews)
  }

  // When global view mode changes, reset individual card views
  useEffect(() => {
    setIndividualCardViews(new Map())
  }, [viewMode])

  return (
    <>
      {/* First-time user banner */}
      {showBanner && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
              <span className="text-lg">💡</span>
              <span className="hidden sm:inline">You can rate solutions and tap cards for detailed breakdowns!</span>
              <span className="sm:hidden">Swipe left to rate!</span>
            </div>
            <button
              onClick={dismissBanner}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-xl leading-none"
              aria-label="Dismiss banner"
            >
              ×
            </button>
          </div>
        </div>
      )}

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
            <div className="flex items-start gap-3 sm:block">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap flex-shrink-0">
                People also worked on:
              </span>
              <div className="flex gap-x-4 sm:gap-y-1 text-sm overflow-x-auto sm:overflow-x-visible sm:flex-wrap no-scrollbar flex-1">
                {relatedGoals.slice(0, showAllRelated ? undefined : 5).map((relatedGoal, index) => (
                  <Link
                    key={relatedGoal.id}
                    href={`/goal/${relatedGoal.id}`}
                    onClick={() => handleRelatedGoalClick(goal.id, relatedGoal.id, index)}
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors whitespace-nowrap"
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
                {hasRatedAny && (
                  <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-medium">
                    • Order locked
                  </span>
                )}
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
            
            {/* View toggle - Desktop */}
            <div className="hidden sm:flex justify-end">
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
            
            {/* Mobile icon controls */}
            <div className="flex sm:hidden gap-2">
              <button
                onClick={() => {/* TODO: Open filter dropdown */}}
                className="w-10 h-10 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                aria-label="Open filters"
              >
                <span className="text-lg">≡</span>
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'simple' ? 'detailed' : 'simple')}
                className={`w-10 h-10 flex items-center justify-center border rounded-md transition-colors ${
                  viewMode === 'detailed'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-label={`Switch to ${viewMode === 'simple' ? 'detailed' : 'simple'} view`}
              >
                <span className="text-lg">{viewMode === 'simple' ? '👁' : '👁‍🗨️'}</span>
              </button>
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
              const cardView = getCardView(solution.id)

              return (
                <article 
                  key={solution.id} 
                  className={`solution-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5 ${cardView === 'detailed' ? 'detailed' : ''} relative cursor-pointer`}
                  onClick={(e) => toggleCardView(solution.id, e)}
                  title="Click to toggle detailed view"
                >
                  {/* Mobile Swipe Hint */}
                  <div className="swipe-hint">
                    <span>← Swipe</span>
                  </div>
                  
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
                            <SwipeableRating
                              solution={{
                                id: solution.id,
                                title: solution.title,
                                solution_category: solution.solution_category
                              }}
                              variant={{
                                id: bestVariant.id,
                                variant_name: bestVariant.variant_name
                              }}
                              goalId={goal.id}
                              initialRating={bestRating}
                              ratingCount={totalReviews}
                              isMobile={isMobile}
                              onRatingUpdate={(newRating, newCount) => {
                                // Set the flag that disables sorting
                                setHasRatedAny(true);
                                
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

                  {/* Description - Show right after header */}
                  {solution.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 mb-4">
                      {solution.description}
                    </p>
                  )}

                  {/* Key Fields - Desktop: Grid with exactly 4 fields */}
                  {(() => {
                    const renderKeyFields = () => {
                      const fieldsToShow = categoryConfig.keyFields // Always exactly 4 required fields
                      
                      return (
                        <div className="hidden sm:grid sm:grid-cols-4 gap-4 mb-4 key-fields-grid">
                          {fieldsToShow.map(fieldName => {
                            // Try composite fields first
                            let value = getCompositeFieldValue(solution, fieldName, bestVariant)
                            
                            // Fall back to regular field
                            if (!value) {
                              value = getFieldDisplayValue(solution, fieldName, bestVariant)
                            }
                            
                            if (!value) return null
                            
                            const distribution = getDistributionForSolutionField(solution, fieldName)
                            
                            if (distribution && cardView === 'detailed') {
                              return (
                                <div key={fieldName} className="field-container min-w-0">
                                  <NewDistributionField
                                    label={categoryConfig.fieldLabels[fieldName] || fieldName}
                                    distribution={distribution}
                                    viewMode={cardView}
                                  />
                                </div>
                              )
                            }
                            
                            // Simple display
                            return (
                              <div key={fieldName} className="field-container min-w-0 space-y-1">
                                <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {categoryConfig.fieldLabels[fieldName] || fieldName}
                                </span>
                                <div className="field-value-container text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                                  {distribution ? formatPrevalenceForSimpleView(distribution, value) : value}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    }
                    
                    return renderKeyFields()
                  })()}
                  
                  {/* Mobile: 2-column grid */}
                  {(() => {
                    const renderMobileFields = () => {
                      const fieldsToShow = categoryConfig.keyFields // Always exactly 4 required fields
                      
                      return (
                        <div className="sm:hidden grid grid-cols-2 gap-3 mb-4">
                          {fieldsToShow.map(fieldName => {
                            // Try composite fields first
                            let value = getCompositeFieldValue(solution, fieldName, bestVariant)
                            
                            // Fall back to regular field
                            if (!value) {
                              value = getFieldDisplayValue(solution, fieldName, bestVariant)
                            }
                            
                            if (!value) return null
                            
                            const distribution = getDistributionForSolutionField(solution, fieldName)
                            
                            if (distribution && cardView === 'detailed') {
                              return (
                                <div key={fieldName} className="field-container">
                                  <NewDistributionField
                                    label={categoryConfig.fieldLabels[fieldName] || fieldName}
                                    distribution={distribution}
                                    viewMode={cardView}
                                    onTapBreakdown={() => {
                                      setDistributionSheet({
                                        isOpen: true,
                                        fieldName: categoryConfig.fieldLabels[fieldName] || fieldName,
                                        distribution
                                      })
                                    }}
                                  />
                                </div>
                              )
                            }
                            
                            // Simple view
                            return (
                              <div key={fieldName} className="field-container space-y-1">
                                <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {categoryConfig.fieldLabels[fieldName] || fieldName}
                                </span>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                                  {distribution ? formatPrevalenceForSimpleView(distribution, value) : value}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    }
                    
                    return renderMobileFields()
                  })()}

                  {/* Array Field Pills - Show in both simple and detailed views */}
                  {(() => {
                    // Only show if category has an arrayField defined
                    if (!categoryConfig.arrayField) return null
                    
                    const solutionFields = solution.solution_fields as Record<string, unknown> || {}
                    const bestVariantFields = bestVariant?.category_fields as Record<string, unknown> || {}
                    const allFields = { ...solutionFields, ...bestVariantFields }
                    
                    // Get the array field value
                    const fieldName = categoryConfig.arrayField
                    const fieldValue = allFields[fieldName] || solutionFields[fieldName] || bestVariantFields[fieldName] ||
                                      allFields[fieldName.toUpperCase()] || solutionFields[fieldName.toUpperCase()] || bestVariantFields[fieldName.toUpperCase()]
                    
                    if (!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)) return null
                    
                    // Helper to parse items with percentages
                    const parseItemWithPercentage = (item: string) => {
                      const match = item.match(/^(.+?)\s*\((\d+)%\)$/)
                      if (match) {
                        return { text: match[1].trim(), percentage: match[2] }
                      }
                      return { text: item, percentage: null }
                    }
                    
                    // Determine label based on field name and category
                    const getFieldLabel = () => {
                      if (fieldName === 'side_effects') {
                        if (categoryConfig.arrayField === 'side_effects' && 
                            ['alternative_practitioners', 'medical_procedures'].includes(solution.solution_category || '')) {
                          return solution.solution_category === 'alternative_practitioners' ? 'Risks' : 'Side Effects/Risks'
                        }
                        return 'Side Effects'
                      }
                      if (fieldName === 'challenges' || fieldName === 'challenges_experienced') {
                        return 'Challenges'
                      }
                      if (fieldName === 'issues') {
                        return 'Issues'
                      }
                      if (fieldName === 'barriers') {
                        return 'Challenges'
                      }
                      // Default: capitalize first letter
                      return fieldName.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')
                    }
                    
                    const itemsArray = Array.isArray(fieldValue) ? fieldValue : [fieldValue]
                    const displayLimit = cardView === 'detailed' ? 8 : (isMobile ? 2 : 3)
                    const displayItems = itemsArray.slice(0, displayLimit)
                    const remainingCount = itemsArray.length - displayLimit
                    
                    return (
                      <div className="side-effects-section">
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          {getFieldLabel()} (top {displayLimit} of {itemsArray.length}):
                        </div>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {displayItems.map((item, index) => {
                            const { text, percentage } = parseItemWithPercentage(item.toString())
                            return (
                              <span key={index} className="side-effect-chip">
                                {text}
                                {percentage && <span className="ml-1 opacity-70">({percentage}%)</span>}
                              </span>
                            )
                          })}
                          {remainingCount > 0 && (
                            <span className="show-more-pill">
                              +{remainingCount} more
                            </span>
                          )}
                          <button 
                            className="add-effect-inline"
                            onClick={(e) => {
                              e.stopPropagation()
                              // TODO: Implement add functionality
                              console.log(`Add ${fieldName} functionality to be implemented`)
                            }}
                          >
                            <span>+</span>
                            <span>Add yours</span>
                          </button>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Mobile hint for detailed view */}
                  {cardView === 'detailed' && isMobile && categoryConfig.keyFields.some(field => getFieldDisplayValue(solution, field, bestVariant)) && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3 sm:hidden">
                      Tap 📊 for breakdown
                    </div>
                  )}

                  {/* Expandable Variants */}
                  {hasVariants && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isMobile) {
                            setVariantSheet({ isOpen: true, solution });
                          } else {
                            toggleVariants(solution.id);
                          }
                        }}
                        className="view-options-button mt-3"
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
                                  {cardView === 'detailed' && variant.category_fields && (
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
                                  <SwipeableRating
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
                                    isMobile={isMobile}
                                    onRatingUpdate={(newRating, newCount) => {
                                      // Set the flag that disables sorting
                                      setHasRatedAny(true);
                                      
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

      {/* Distribution Sheet for Mobile */}
      {distributionSheet.isOpen && distributionSheet.distribution && (
        <NewDistributionSheet
          isOpen={distributionSheet.isOpen}
          onClose={() => setDistributionSheet({ isOpen: false, fieldName: '', distribution: null })}
          fieldName={distributionSheet.fieldName}
          distribution={distributionSheet.distribution}
        />
      )}
      
      {/* Variant Sheet for Mobile */}
      {variantSheet.isOpen && variantSheet.solution && (
        <VariantSheet
          solution={variantSheet.solution}
          isOpen={variantSheet.isOpen}
          onClose={() => setVariantSheet({ isOpen: false, solution: null })}
        />
      )}
    </>
  )
}
