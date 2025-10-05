'use client'

import { useEffect, useState } from 'react'
import { getCategoryMastery } from '@/app/actions/dashboard-data'
import { supabase } from '@/lib/database/client'

interface CategoryData {
  explored: Array<{ category: string; count: number; timeSpent: number }>
  unexplored: string[]
  arenaTime: Record<string, number>
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

export function CategoryMastery() {
  const [data, setData] = useState<CategoryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const masteryData = await getCategoryMastery(user.id)
        setData(masteryData as CategoryData)
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

  const { explored, unexplored, arenaTime } = data || { explored: [], unexplored: [], arenaTime: {} }

  // Helper function to format time
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        🎓 Your Category Mastery
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Areas you've explored and opportunities to discover
      </p>

      {/* Explored Categories */}
      {explored && explored.length > 0 ? (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            Your Expertise Areas
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
              ({explored.length} categories)
            </span>
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {explored.slice(0, 8).map((cat, idx) => (
              <div
                key={cat.category}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg flex-shrink-0">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '📊'}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {CATEGORY_LABELS[cat.category] || cat.category}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {cat.count} rated
                    </span>
                    {idx === 0 && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full font-medium">
                        Top
                      </span>
                    )}
                  </div>
                  {cat.timeSpent > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      ⏱️ {formatTime(cat.timeSpent)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
          <div className="text-4xl mb-2">🌟</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Start rating solutions to build your expertise!
          </p>
        </div>
      )}

      {/* Unexplored Categories */}
      {unexplored && unexplored.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            🌱 Unexplored Categories
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
              ({unexplored.length} to discover)
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {unexplored.slice(0, 9).map((cat) => (
              <span
                key={cat}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {CATEGORY_LABELS[cat] || cat}
              </span>
            ))}
            {unexplored.length > 9 && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-xs text-purple-700 dark:text-purple-300 rounded-full font-medium">
                +{unexplored.length - 9} more to explore
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            💡 Try exploring new categories to discover solutions that might work for you!
          </p>
        </div>
      )}
    </div>
  )
}
