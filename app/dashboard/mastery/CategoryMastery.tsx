'use client'

import { useEffect, useState } from 'react'
import { getSolutionTypePreferences } from '@/app/actions/dashboard-data'
import { supabase } from '@/lib/database/client'

interface SolutionType {
  category: string
  ratedCount: number
  contributedCount: number
  totalCount: number
}

interface PreferencesData {
  solutionTypes: SolutionType[]
  totalActivity: number
}

const CATEGORY_LABELS: Record<string, string> = {
  'supplements_vitamins': 'Supplements & Vitamins',
  'medications': 'Medications',
  'natural_remedies': 'Natural Remedies',
  'beauty_skincare': 'Beauty & Skincare',
  'therapists_counselors': 'Therapists & Counselors',
  'doctors_specialists': 'Doctors & Specialists',
  'coaches_mentors': 'Coaches & Mentors',
  'alternative_practitioners': 'Alternative Practitioners',
  'professional_services': 'Professional Services',
  'medical_procedures': 'Medical Procedures',
  'crisis_resources': 'Crisis Resources',
  'exercise_movement': 'Exercise & Movement',
  'meditation_mindfulness': 'Meditation & Mindfulness',
  'habits_routines': 'Habits & Routines',
  'hobbies_activities': 'Hobbies & Activities',
  'groups_communities': 'Groups & Communities',
  'apps_software': 'Apps & Software',
  'products_devices': 'Products & Devices',
  'books_courses': 'Books & Courses',
  'diet_nutrition': 'Diet & Nutrition',
  'sleep': 'Sleep',
  'financial_products': 'Financial Products'
}

const MINIMUM_ACTIVITY_THRESHOLD = 5
const TOP_DISPLAY_COUNT = 5

export function CategoryMastery() {
  const [data, setData] = useState<PreferencesData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const preferencesData = await getSolutionTypePreferences(user.id)
        setData(preferencesData as PreferencesData)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2"></div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  const { solutionTypes, totalActivity } = data || { solutionTypes: [], totalActivity: 0 }
  const showBlurred = totalActivity < MINIMUM_ACTIVITY_THRESHOLD
  const topTypes = solutionTypes.slice(0, TOP_DISPLAY_COUNT)
  const maxCount = topTypes.length > 0 ? topTypes[0].totalCount : 0

  // If below threshold, show locked state
  if (showBlurred) {
    const remaining = MINIMUM_ACTIVITY_THRESHOLD - totalActivity
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6 relative overflow-hidden">
        {/* Blurred content preview */}
        <div className="filter blur-sm pointer-events-none select-none">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            🧩 How You Solve Problems
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Solution types you use most
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Apps & Software
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div className="ml-4 text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">12</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Therapists & Counselors
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div className="ml-4 text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">8</div>
              </div>
            </div>
          </div>
        </div>

        {/* Unlock overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <div className="text-center p-6 max-w-sm">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Unlock Your Insights
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Rate or contribute {remaining} more solution{remaining > 1 ? 's' : ''} to see which types you prefer
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              Progress: {totalActivity}/{MINIMUM_ACTIVITY_THRESHOLD}
            </div>
            <a
              href="/browse"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Browse Solutions
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Normal display when threshold is met
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        🧩 How You Solve Problems
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Solution types you use most
      </p>

      <div className="space-y-4">
        {topTypes.map((type, idx) => {
          const percentage = maxCount > 0 ? (type.totalCount / maxCount) * 100 : 0

          return (
            <div key={type.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {CATEGORY_LABELS[type.category] || type.category}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {type.totalCount}
                  </div>
                </div>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                {type.ratedCount > 0 && type.contributedCount > 0
                  ? `${type.ratedCount} rated, ${type.contributedCount} contributed`
                  : type.ratedCount > 0
                  ? `${type.ratedCount} rated`
                  : `${type.contributedCount} contributed`
                }
              </div>
            </div>
          )
        })}
      </div>

      {/* Show if there are more types beyond top 5 */}
      {solutionTypes.length > TOP_DISPLAY_COUNT && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            +{solutionTypes.length - TOP_DISPLAY_COUNT} more solution type{solutionTypes.length - TOP_DISPLAY_COUNT > 1 ? 's' : ''} explored
          </p>
        </div>
      )}
    </div>
  )
}
