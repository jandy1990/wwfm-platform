// app/super-category/[id]/page.tsx

// Make the page dynamic to prevent caching issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/database/server'
import Breadcrumbs from '@/components/molecules/Breadcrumbs'
import { createBreadcrumbs } from '@/lib/utils/breadcrumbs'
import EmptyState from '@/components/molecules/EmptyState'
import { GoalPageTracker } from '@/components/tracking/GoalPageTracker'
import { SUPER_CATEGORIES, SUPER_CATEGORY_COLORS } from '@/lib/navigation/super-categories'

// Types
type Goal = {
  id: string
  title: string
  description: string | null
  emoji: string | null
  view_count: number
  solution_count: number
  is_approved?: boolean
}

type CategoryRow = {
  id: string
  name: string
  slug: string
  goals: GoalRow[] | null
}

type GoalRow = {
  id: string
  title: string
  description: string | null
  emoji: string | null
  view_count: number | null
  is_approved: boolean
  goal_implementation_links: { id: string }[] | null
}

async function getSuperCategoryWithGoals(superCategoryId: string) {
  const superCategory = SUPER_CATEGORIES.find(sc => sc.id === superCategoryId)
  if (!superCategory) {
    return null
  }

  const supabase = await createServerSupabaseClient()

  // Get all goals from categories that belong to this super-category
  const { data: categories, error } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      slug,
      goals!inner (
        id,
        title,
        description,
        emoji,
        view_count,
        is_approved,
        goal_implementation_links!left(id)
      )
    `)
    .in('name', superCategory.categories)
    .eq('is_active', true)
    .eq('goals.is_approved', true)

  if (error) {
    console.log('Super-category goals fetch error:', error)
    return { superCategory, goals: [] }
  }

  // Flatten all goals from all categories
  const categoryRows: CategoryRow[] = Array.isArray(categories) ? (categories as CategoryRow[]) : []

  const allGoals: Goal[] = []
  categoryRows.forEach(category => {
    category.goals?.forEach((goal) => {
      allGoals.push({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        emoji: goal.emoji,
        view_count: goal.view_count ?? 0,
        solution_count: goal.goal_implementation_links?.length ?? 0,
        is_approved: goal.is_approved
      })
    })
  })

  // Sort goals by solution count (most solutions first)
  allGoals.sort((a, b) => b.solution_count - a.solution_count)

  return {
    superCategory,
    goals: allGoals
  }
}

type SuperCategoryPageProps = {
  params: Promise<{ id: string }>
}

export default async function SuperCategoryPage({ params }: SuperCategoryPageProps) {
  const { id } = await params
  const result = await getSuperCategoryWithGoals(id)

  if (!result) {
    notFound()
  }

  const { superCategory, goals } = result

  // Get colors for this super-category
  const colors = SUPER_CATEGORY_COLORS[superCategory.color as keyof typeof SUPER_CATEGORY_COLORS]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GoalPageTracker arenaName={superCategory.name} arenaId={superCategory.id} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/', hideOnMobile: true },
            { label: 'Browse', href: '/browse' }
          ]}
        />

        {/* Super-Category Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-4 flex-col sm:flex-row text-center sm:text-left">
            <span className="text-4xl sm:text-5xl mb-2 sm:mb-0 sm:mr-4">{superCategory.icon}</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {superCategory.name}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                {superCategory.description} • {goals.length} goals
              </p>
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {goals.map((goal) => (
            <Link
              key={goal.id}
              href={`/goal/${goal.id}`}
              className={`${colors.bg} ${colors.border} border rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-4 sm:p-6 min-h-[120px] flex flex-col focus:ring-2 focus:ring-purple-500 focus:outline-none ${colors.hover}`}
            >
              <div className="flex items-center gap-3 mb-3">
                {goal.emoji && (
                  <span className="text-3xl flex-shrink-0">{goal.emoji}</span>
                )}
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {goal.title}
                  </h3>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-auto">
                <span>{goal.solution_count} solution{goal.solution_count !== 1 ? 's' : ''} • {goal.view_count || 0} views</span>
                <span className="text-purple-600 dark:text-purple-400">View solutions →</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {goals.length === 0 && (
          <EmptyState
            icon="🚧"
            heading="Coming soon to this area!"
            subtext="We're working on adding goals for this life area. Check back soon for updates."
            actionButton={{
              text: "Browse Other Areas",
              href: "/browse",
              variant: "secondary"
            }}
          />
        )}
      </div>
    </div>
  )
}
